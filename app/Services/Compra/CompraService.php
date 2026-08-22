<?php

namespace App\Services\Compra;

use App\Services\Inventario\InventarioService;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Http\UploadedFile;
use App\Models\PagoCompra;
use App\Models\Compra;

class CompraService
{
    public function __construct(
        protected InventarioService $inventarioService
    ) {}

    public function createPurchase(
        array $data,
        ?UploadedFile $factura = null
    ): Compra {
        return DB::transaction(function () use ($data, $factura) {

            $total = collect($data['detalles'])
                ->sum(function ($detalle) {
                    return $detalle['cantidad'] * $detalle['costo_unitario'];
                });

            $montoPagado = $data['monto_pagado'] ?? 0;

            if ($data['tipo_pago'] === 'contado') {
                $montoPagado = $total;
                $estado = 'pagada';
            } else {
                $estado = $montoPagado >= $total ? 'pagada' : 'pendiente';
            }

            $rutaFactura = null;

            if ($factura) {
                $rutaFactura = $factura->store(
                    'compras/facturas',
                    'public'
                );
            }

            $compra = Compra::create([
                'proveedor_id' => $data['proveedor_id'],
                'user_id' => auth()->id(),
                'total' => $total,
                'tipo_pago' => $data['tipo_pago'],
                'metodo_pago' => $data['metodo_pago'],
                'estado' => $estado,
                'monto_pagado' => $montoPagado,
                'fecha_vencimiento' => $data['fecha_vencimiento'] ?? null,
                'fecha_compra' => $data['fecha_compra'] ?? now(),
                'factura' => $rutaFactura,
            ]);

            foreach ($data['detalles'] as $detalle) {

                $subtotal = $detalle['cantidad'] * $detalle['costo_unitario'];

                $compra->detalles()->create([
                    'producto_id' => $detalle['producto_id'],
                    'cantidad' => $detalle['cantidad'],
                    'costo_unitario' => $detalle['costo_unitario'],
                    'subtotal' => $subtotal,
                ]);

                // Se delega al InventarioService para calcular stock previo, nuevo y costo unitario
                $this->inventarioService->registrarMovimiento(
                    productoId: $detalle['producto_id'],
                    tipo: 'COMPRA',
                    cantidad: (float) $detalle['cantidad'],
                    costoUnitario: (float) $detalle['costo_unitario'],
                    descripcion: 'Entrada por compra #' . $compra->id,
                    origen: $compra
                );
            }

            return $compra;
        });

    }
    public function registrarPago(Compra $compra, array $data): PagoCompra
{
    return DB::transaction(function () use ($compra, $data) {
        $saldoPendiente = $compra->total - $compra->monto_pagado;

        if ($data['monto'] > $saldoPendiente) {
            throw new Exception("El monto ingresado ($" . $data['monto'] . ") supera el saldo pendiente ($" . $saldoPendiente . ").");
        }

        // 1. Guardar el abono
        $pago = $compra->pagos()->create([
            'user_id'     => auth()->id(),
            'monto'       => $data['monto'],
            'metodo_pago' => $data['metodo_pago'],
            'fecha_pago'  => $data['fecha_pago'] ?? now(),
            'observacion' => $data['observacion'] ?? null,
        ]);

        // 2. Actualizar monto pagado y cambiar estado si liquidó la deuda
        $nuevoMontoPagado = $compra->monto_pagado + $data['monto'];
        $nuevoEstado = $nuevoMontoPagado >= $compra->total ? 'pagada' : 'pendiente';

        $compra->update([
            'monto_pagado' => $nuevoMontoPagado,
            'estado'       => $nuevoEstado,
        ]);

        return $pago;
    });
}
// app/Services/Compra/CompraService.php

public function deletePurchase(Compra $compra): void
{
    DB::transaction(function () use ($compra) {
        // 1. Revertir inventario registrando un movimiento de tipo 'ajuste'
        foreach ($compra->detalles as $detalle) {
            $this->inventarioService->registrarMovimiento(
                productoId: $detalle->producto_id,
                tipo: 'ajuste', // Valor permitido por la migración ('venta', 'compra', 'ajuste', 'merma')
                cantidad: (float) -$detalle->cantidad, // Negativo para descontar el stock revertido
                costoUnitario: (float) $detalle->costo_unitario,
                descripcion: 'Reversión por eliminación de compra #' . $compra->id,
                origen: $compra
            );
        }

        // 2. Eliminar la factura si existía en almacenamiento
        if ($compra->factura && Storage::disk('public')->exists($compra->factura)) {
            Storage::disk('public')->delete($compra->factura);
        }

        // 3. Eliminar pagos y detalles asociados
        $compra->pagos()->delete();
        $compra->detalles()->delete();

        // 4. Eliminar el registro de la compra
        $compra->delete();
    });
}

}
