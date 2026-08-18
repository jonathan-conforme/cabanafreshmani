<?php

namespace App\Services\Compra;

use App\Models\Compra;
use App\Models\MovimientoInventario;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class CompraService
{
    public function createPurchase(
        array $data,
        ?UploadedFile $factura = null
    ): Compra {
        return DB::transaction(function () use ($data, $factura) {

            $total = collect($data['detalles'])
                ->sum(function ($detalle) {
                    return $detalle['cantidad']
                        * $detalle['costo_unitario'];
                });

            $montoPagado = $data['monto_pagado'] ?? 0;

            if ($data['tipo_pago'] === 'contado') {
                $montoPagado = $total;
                $estado = 'pagada';
            } else {
                $estado = $montoPagado >= $total
                    ? 'pagada'
                    : 'pendiente';
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
                'fecha_vencimiento' =>
                    $data['fecha_vencimiento'] ?? null,
                'fecha_compra' =>
                    $data['fecha_compra'] ?? now(),
                'factura' => $rutaFactura,
            ]);

            foreach ($data['detalles'] as $detalle) {

                $subtotal =
                    $detalle['cantidad']
                    * $detalle['costo_unitario'];

                $compra->detalles()->create([
                    'producto_id' => $detalle['producto_id'],
                    'cantidad' => $detalle['cantidad'],
                    'costo_unitario' =>
                        $detalle['costo_unitario'],
                    'subtotal' => $subtotal,
                ]);

                $producto = \App\Models\Producto::lockForUpdate()
                    ->findOrFail($detalle['producto_id']);

                $producto->increment(
                    'stock',
                    $detalle['cantidad']
                );

                MovimientoInventario::create([
                    'producto_id' => $producto->id,
                    'tipo' => 'compra',
                    'cantidad' => $detalle['cantidad'],
                    'descripcion' =>
                        'Entrada por compra #' . $compra->id,
                ]);
            }

            return $compra;
        });
    }
}
