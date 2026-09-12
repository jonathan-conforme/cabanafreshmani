<?php

namespace App\Services\Reporte;

use App\Models\Caja;
use App\Models\Compra;
use App\Models\EgresoCaja;
use App\Models\MovimientoInventario;
use App\Models\Producto;
use App\Models\Venta;
use App\Models\VentaDetalle;
use Illuminate\Support\Facades\DB;

class ReporteService
{
    protected function rangoFechas(array $filtros): array
    {
        return [
            $filtros['desde'] ?? now()->startOfMonth()->toDateString(),
            $filtros['hasta'] ?? now()->toDateString(),
        ];
    }

    public function resumenVentas(array $filtros): array
    {
        $limite = (int) ($filtros['limite'] ?? 15);
        $query = Venta::where('ventas.estado', 'completada');

        // Filtra fechas solo si el usuario no presiona "Ver Todo"
        if (! empty($filtros['desde'])) {
            $query->whereDate('ventas.created_at', '>=', $filtros['desde']);
        }
        if (! empty($filtros['hasta'])) {
            $query->whereDate('ventas.created_at', '<=', $filtros['hasta']);
        }

        $totales = (clone $query)
            ->selectRaw('COUNT(*) as cantidad, COALESCE(SUM(total), 0) as total, COALESCE(AVG(total), 0) as promedio')
            ->first();

        $porDia = (clone $query)
            ->selectRaw('DATE(ventas.created_at) as fecha, COUNT(*) as cantidad, SUM(total) as total')
            ->groupBy('fecha')
            ->orderBy('fecha')
            ->get();

        $porMetodoPago = (clone $query)
            ->selectRaw('metodo_pago, COUNT(*) as cantidad, SUM(total) as total')
            ->groupBy('metodo_pago')
            ->orderByDesc('total')
            ->get();

        $porVendedor = (clone $query)
            ->join('users', 'users.id', '=', 'ventas.user_id')
            ->selectRaw('users.id, users.name, COUNT(ventas.id) as cantidad, SUM(ventas.total) as total')
            ->groupBy('users.id', 'users.name')
            ->orderByDesc('total')
            ->get();

        $ventas = (clone $query)
            ->with(['user:id,name', 'cliente:id,nombre'])
            ->latest()
            ->paginate($limite, ['*'], 'page')
            ->withQueryString();

        return compact('totales', 'porDia', 'porMetodoPago', 'porVendedor', 'ventas');
    }

    public function resumenCompras(array $filtros, bool $paraPdf = false): array
    {
        $baseQuery = $this->queryCompras($filtros);

        $totales = (clone $baseQuery)
            ->selectRaw('COUNT(*) as cantidad, COALESCE(SUM(total), 0) as total, COALESCE(SUM(monto_pagado), 0) as pagado, COALESCE(SUM(total - monto_pagado), 0) as pendiente')
            ->first();

        $porProveedor = (clone $baseQuery)
            ->join('proveedores', 'proveedores.id', '=', 'compras.proveedor_id')
            ->selectRaw('proveedores.id, proveedores.nombre, COUNT(compras.id) as cantidad, SUM(compras.total) as total')
            ->groupBy('proveedores.id', 'proveedores.nombre')
            ->orderByDesc('total')
            ->get();

        $porEstado = (clone $baseQuery)
            ->selectRaw('estado, COUNT(*) as cantidad, SUM(total) as total')
            ->groupBy('estado')
            ->get();

        $comprasQuery = (clone $baseQuery)->latest('fecha_compra');

        $compras = $paraPdf
            ? $comprasQuery->with(['proveedor:id,nombre', 'user:id,name'])->get()
            : $comprasQuery->with(['proveedor:id,nombre'])->paginate(15, ['*'], 'page')->withQueryString();

        return compact('totales', 'porProveedor', 'porEstado', 'compras');
    }

    public function resumenInventario(array $filtros): array
    {
        [$desde, $hasta] = $this->rangoFechas($filtros);

        $valorInventario = Producto::selectRaw('COALESCE(SUM(stock * precio_compra), 0) as costo, COALESCE(SUM(stock * precio_venta), 0) as venta')
            ->first();

        $totalProductos = Producto::count();

        $productosStockBajo = Producto::stockBajo()
            ->activos()
            ->with('unidad')
            ->orderBy('stock')
            ->get();

        $porTipo = MovimientoInventario::whereDate('created_at', '>=', $desde)
            ->whereDate('created_at', '<=', $hasta)
            ->selectRaw('tipo, COUNT(*) as cantidad, SUM(ABS(cantidad)) as unidades')
            ->groupBy('tipo')
            ->get();

        return compact('valorInventario', 'totalProductos', 'productosStockBajo', 'porTipo');
    }

    public function productosMasVendidos(array $filtros): array
    {
        [$desde, $hasta] = $this->rangoFechas($filtros);
        $limite = (int) ($filtros['limite'] ?? 15);
        $limite = $limite > 0 ? min($limite, 100) : 15;

        $productos = VentaDetalle::join('ventas', 'ventas.id', '=', 'venta_detalles.venta_id')
            ->join('productos', 'productos.id', '=', 'venta_detalles.producto_id')
            ->whereDate('ventas.created_at', '>=', $desde)
            ->whereDate('ventas.created_at', '<=', $hasta)
            ->where('ventas.estado', 'completada')
            ->selectRaw('productos.id, productos.nombre, SUM(venta_detalles.cantidad) as cantidad_vendida, SUM(venta_detalles.subtotal) as ingresos')
            ->groupBy('productos.id', 'productos.nombre')
            ->orderByDesc('cantidad_vendida')
            ->limit($limite)
            ->get();

        return compact('productos');
    }

    /**
     * Cuentas por cobrar: ventas a crédito o pendientes de cobro. Sin rango de
     * fechas devuelve a todos los clientes con saldo.
     */
    public function cuentasPorCobrar(array $filtros, bool $paraPdf = false): array
    {
        $baseQuery = $this->queryCuentasPorCobrar($filtros);

        $totales = (clone $baseQuery)
            ->selectRaw('COUNT(*) as cantidad, COALESCE(SUM(total - pago_con), SUM(total)) as total, COALESCE(AVG(total), 0) as promedio')
            ->first();

        // Clientes distintos con deuda acumulada
        $totales->clientes = (clone $baseQuery)
            ->distinct()
            ->count(DB::raw('COALESCE(cliente_id, 0)'));

        $porCliente = (clone $baseQuery)
            ->leftJoin('clientes', 'clientes.id', '=', 'ventas.cliente_id')
            ->selectRaw("
                clientes.id,
                COALESCE(NULLIF(TRIM(CONCAT(COALESCE(clientes.nombre, ''), ' ', COALESCE(clientes.apellido, ''))), ''), 'Consumidor Final') as nombre,
                clientes.identificacion,
                clientes.telefono,
                clientes.limite_credito,
                COUNT(ventas.id) as cantidad,
                SUM(COALESCE(ventas.total - ventas.pago_con, ventas.total)) as total
            ")
            ->groupBy('clientes.id', 'clientes.nombre', 'clientes.apellido', 'clientes.identificacion', 'clientes.telefono', 'clientes.limite_credito')
            ->orderByDesc('total')
            ->get();

        $ventasCreditoQuery = (clone $baseQuery)
            ->with(['user:id,name', 'cliente:id,nombre,apellido,identificacion,telefono', 'pagos'])
            ->latest();

        $ventasCredito = $paraPdf
            ? $ventasCreditoQuery->get()
            : $ventasCreditoQuery->paginate(15, ['*'], 'page')->withQueryString();

        return compact('totales', 'porCliente', 'ventasCredito');
    }

    public function historialCierresCaja(array $filtros, bool $paraPdf = false): array
    {
        $baseQuery = $this->queryCierresCaja($filtros);

        $totales = (clone $baseQuery)
            ->selectRaw('
            COUNT(*) as cantidad,
            COALESCE(SUM(monto_apertura), 0) as total_apertura,
            COALESCE(SUM(monto_cierre), 0) as total_cierre,
            COALESCE(SUM(diferencia), 0) as total_diferencia
        ')
            ->first();

        // Sumatoria de egresos registrados en las cajas filtradas
        $totales->total_egresos = (float) EgresoCaja::whereIn(
            'caja_id',
            (clone $baseQuery)->select('cajas.id')
        )->sum('monto');

        $porUsuario = (clone $baseQuery)
            ->join('users', 'users.id', '=', 'cajas.user_id')
            ->selectRaw('users.id, users.name, COUNT(cajas.id) as cantidad, SUM(cajas.diferencia) as diferencia')
            ->groupBy('users.id', 'users.name')
            ->orderByDesc('cantidad')
            ->get();

        $cierresQuery = (clone $baseQuery)
            ->with(['user:id,name', 'egresos.user:id,name'])
            ->withSum('egresos as total_egresos', 'monto')
            ->latest('fecha_cierre');

        $cierresCaja = $paraPdf
            ? $cierresQuery->get()
            : $cierresQuery->paginate(15, ['*'], 'page')->withQueryString();

        $coleccion = $paraPdf ? $cierresCaja : $cierresCaja->getCollection();

        $coleccion->transform(function ($cierre) {
            $cierre->total_transferencias = (float) \DB::table('ventas')
                ->where('metodo_pago', 'transferencia')
                ->where('estado', 'completada')
                ->where('created_at', '>=', $cierre->fecha_apertura)
                ->where('created_at', '<=', $cierre->fecha_cierre ?? now())
                ->sum('total');

            $cierre->total_ventas_efectivo = (float) \DB::table('ventas')
                ->where('metodo_pago', 'efectivo')
                ->where('estado', 'completada')
                ->where('created_at', '>=', $cierre->fecha_apertura)
                ->where('created_at', '<=', $cierre->fecha_cierre ?? now())
                ->sum('total');

            return $cierre;
        });
        $totales->total_ventas_efectivo = (float) $coleccion->sum('total_ventas_efectivo');

        $totales->total_transferencias = (float) $coleccion->sum('total_transferencias');
        // =========================================================================

        return compact('totales', 'porUsuario', 'cierresCaja');
    }

    // ---------------------------------------------------------
    // Consultas base reutilizadas por los reportes y sus PDF
    // ---------------------------------------------------------

    protected function queryCompras(array $filtros)
    {
        [$desde, $hasta] = $this->rangoFechas($filtros);

        return Compra::whereDate('fecha_compra', '>=', $desde)
            ->whereDate('fecha_compra', '<=', $hasta);
    }

    protected function queryCierresCaja(array $filtros)
    {
        [$desde, $hasta] = $this->rangoFechas($filtros);

        return Caja::where('estado', 'cerrada')
            ->whereDate('fecha_cierre', '>=', $desde)
            ->whereDate('fecha_cierre', '<=', $hasta);
    }

    /**
     * El rango de fechas es opcional: si no se envia, se listan todas las
     * deudas vigentes (una deuda sigue viva aunque la venta sea antigua).
     */
    protected function queryCuentasPorCobrar(array $filtros)
    {
        $query = Venta::where(function ($q) {
            $q->where('metodo_pago', 'credito')
                ->orWhere('estado', 'pendiente');
        });

        if (! empty($filtros['desde'])) {
            $query->whereDate('ventas.created_at', '>=', $filtros['desde']);
        }

        if (! empty($filtros['hasta'])) {
            $query->whereDate('ventas.created_at', '<=', $filtros['hasta']);
        }

        return $query;
    }

    /**
     * Mismos datos del reporte en pantalla, pero con el detalle completo
     * (sin paginar) para poder exportarlo a PDF.
     */
    public function datosPdf(string $tipo, array $filtros): array
    {
        return match ($tipo) {
            'ventas' => $this->resumenVentas($filtros, true),
            'compras' => $this->resumenCompras($filtros, true),
            'inventario' => $this->resumenInventario($filtros),
            'caja' => $this->historialCierresCaja($filtros, true),
            'cuentas_cobrar' => $this->cuentasPorCobrar($filtros, true),
            default => throw new \InvalidArgumentException("Tipo de reporte no exportable: {$tipo}"),
        };
    }
}
