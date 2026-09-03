<?php

namespace App\Services\Notificacion;

use App\Models\Compra;
use App\Models\Notificacion;
use App\Models\Producto;
use App\Models\Venta;
use Illuminate\Support\Carbon;

/**
 * Genera notificaciones automáticamente a partir de datos reales de la BD:
 * ventas, compras (cuentas por pagar), inventario y stock bajo.
 */
class NotificacionService
{
    /** Días de anticipación para avisar que una compra a crédito está por vencer. */
    public const DIAS_AVISO_VENCIMIENTO = 3;

    /** Contador de notificaciones realmente creadas en la sincronización en curso. */
    private int $creadas = 0;

    /**
     * Reconstruye el estado de las notificaciones automáticas.
     * Devuelve cuántas notificaciones NUEVAS se crearon.
     */
    public function sincronizar(): int
    {
        $this->creadas = 0;

        $clavesActivas = array_merge(
            $this->sincronizarInventario(),
            $this->sincronizarCuentasPorPagar(),
        );

        // Elimina notificaciones de "condición" cuyo problema ya se resolvió.
        Notificacion::withoutGlobalScope(Notificacion::SCOPE_VISIBLES)
            ->whereIn('tipo', Notificacion::TIPOS_CONDICION)
            ->whereNotIn('clave', $clavesActivas)
            ->delete();

        $this->sincronizarResumenVentas();

        return $this->creadas;
    }

    /* -----------------------------------------------------------------
     |  INVENTARIO / STOCK BAJO
     | ----------------------------------------------------------------- */
    private function sincronizarInventario(): array
    {
        // Mismo criterio que el dashboard y el listado de productos:
        // así los tres contadores siempre coinciden.
        $productos = Producto::activos()
            ->stockBajo()
            ->with('unidad:id,nombre')
            ->orderBy('stock')
            ->get();

        $claves = [];

        foreach ($productos as $producto) {
            $sinStock = (float) $producto->stock <= 0;
            $tipo = $sinStock ? 'sin_stock' : 'stock_bajo';
            $clave = "{$tipo}:producto:{$producto->id}";
            $unidad = $producto->unidad?->nombre ?? 'u.';
            $stock = rtrim(rtrim(number_format((float) $producto->stock, 3, '.', ''), '0'), '.');

            $this->registrar($clave, [
                'tipo' => $tipo,
                'nivel' => $sinStock ? 'danger' : 'warning',
                'titulo' => $sinStock ? 'Producto sin stock' : 'Stock bajo',
                'mensaje' => $sinStock
                    ? "«{$producto->nombre}» se quedó sin existencias. Registra una compra para reabastecer."
                    : "«{$producto->nombre}» tiene solo {$stock} {$unidad} en stock (mínimo {$producto->stock_minimo}).",
                'icono' => $sinStock ? 'PackageX' : 'PackageMinus',
                'enlace' => '/productos?solo_stock_bajo=1',
                'referencia_tipo' => 'producto',
                'referencia_id' => $producto->id,
            ]);

            $claves[] = $clave;
        }

        return $claves;
    }

    /* -----------------------------------------------------------------
     |  COMPRAS / CUENTAS POR PAGAR
     | ----------------------------------------------------------------- */
    private function sincronizarCuentasPorPagar(): array
    {
        $hoy = Carbon::today();
        $limite = $hoy->copy()->addDays(self::DIAS_AVISO_VENCIMIENTO);

        $compras = Compra::query()
            ->where('estado', 'pendiente')
            ->whereColumn('monto_pagado', '<', 'total')
            ->whereNotNull('fecha_vencimiento')
            ->where('fecha_vencimiento', '<=', $limite)
            ->with('proveedor:id,nombre')
            ->orderBy('fecha_vencimiento')
            ->get();

        $claves = [];

        foreach ($compras as $compra) {
            $vencida = Carbon::parse($compra->fecha_vencimiento)->lt($hoy);
            $tipo = $vencida ? 'compra_vencida' : 'compra_por_vencer';
            $clave = "{$tipo}:compra:{$compra->id}";
            $saldo = number_format((float) $compra->total - (float) $compra->monto_pagado, 2);
            $proveedor = $compra->proveedor?->nombre ?? 'proveedor';
            $fecha = Carbon::parse($compra->fecha_vencimiento)->format('d/m/Y');

            $this->registrar($clave, [
                'tipo' => $tipo,
                'nivel' => $vencida ? 'danger' : 'warning',
                'titulo' => $vencida ? 'Cuenta por pagar vencida' : 'Cuenta por pagar próxima a vencer',
                'mensaje' => $vencida
                    ? "La compra #{$compra->id} a {$proveedor} venció el {$fecha}. Saldo pendiente \${$saldo}."
                    : "La compra #{$compra->id} a {$proveedor} vence el {$fecha}. Saldo pendiente \${$saldo}.",
                'icono' => 'ReceiptText',
                'enlace' => "/compras/{$compra->id}",
                'referencia_tipo' => 'compra',
                'referencia_id' => $compra->id,
            ]);

            $claves[] = $clave;
        }

        return $claves;
    }

    /* -----------------------------------------------------------------
     |  VENTAS / RESUMEN DEL DÍA
     | ----------------------------------------------------------------- */
    private function sincronizarResumenVentas(): void
    {
        $hoy = Carbon::today();
        $clave = 'resumen_ventas:'.$hoy->toDateString();

        // El resumen sólo tiene sentido para el día en curso: descarta los de días previos
        // (si no, la campana muestra un "Ventas de hoy" que en realidad es de ayer).
        Notificacion::withoutGlobalScope(Notificacion::SCOPE_VISIBLES)
            ->where('tipo', 'resumen_ventas')
            ->where('clave', '!=', $clave)
            ->delete();

        $resumen = Venta::whereDate('created_at', $hoy->toDateString())
            ->where('estado', 'completada')
            ->selectRaw('COUNT(*) as cantidad, COALESCE(SUM(total), 0) as total')
            ->first();

        if (! $resumen || (int) $resumen->cantidad === 0) {
            return;
        }
        $total = number_format((float) $resumen->total, 2);

        $this->registrar($clave, [
            'tipo' => 'resumen_ventas',
            'nivel' => 'info',
            'titulo' => 'Ventas de hoy',
            'mensaje' => "Hoy se han registrado {$resumen->cantidad} venta(s) por un total de \${$total}.",
            'icono' => 'TrendingUp',
            'enlace' => '/reportes?tipo=ventas',
        ], refrescar: true);
    }

    /* -----------------------------------------------------------------
     |  HELPER
     | ----------------------------------------------------------------- */
    /**
     * Crea la notificación si no existe. Si `refrescar` es true, actualiza
     * el texto de la existente sin alterar su estado de lectura.
     */
    private function registrar(string $clave, array $datos, bool $refrescar = false): void
    {
        // Sin el scope: una notificación descartada sigue ocupando su clave única,
        // hay que encontrarla para NO recrearla ni chocar con el índice.
        $notificacion = Notificacion::withoutGlobalScope(Notificacion::SCOPE_VISIBLES)
            ->firstOrNew(['clave' => $clave]);

        if ($notificacion->exists && (! $refrescar || $notificacion->descartada_at !== null)) {
            return;
        }

        $esNueva = ! $notificacion->exists;

        $notificacion->fill($datos)->save();

        if ($esNueva) {
            $this->creadas++;
        }
    }
}
