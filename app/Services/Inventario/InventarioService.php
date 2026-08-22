<?php

namespace App\Services\Inventario;

use App\Models\MovimientoInventario;
use App\Models\Producto;
use Exception;
use Illuminate\Support\Facades\DB;

class InventarioService
{
    public function registrarMovimiento(
        int $productoId,
        string $tipo,
        float $cantidad,
        float $costoUnitario = 0,
        ?string $descripcion = null,
        mixed $origen = null
    ): MovimientoInventario {
        return DB::transaction(function () use ($productoId, $tipo, $cantidad, $costoUnitario, $descripcion, $origen) {
            $producto = Producto::lockForUpdate()->findOrFail($productoId);

            $tipoOriginal = strtolower($tipo);

            // Mapeo dinámico hacia los ENUM exactos de la BD: ['venta', 'compra', 'ajuste', 'merma']
            $tipoEnum = match ($tipoOriginal) {
                'salida', 'venta' => 'venta',
                'entrada', 'compra' => 'compra',
                'merma' => 'merma',
                default => 'ajuste',
            };

            // Evaluar si suma o resta inventario
            $esEntrada = in_array($tipoOriginal, ['entrada', 'compra', 'ajuste_positivo']);

            $stockAnterior = (float) $producto->stock;

            if ($esEntrada) {
                $stockNuevo = $stockAnterior + $cantidad;
            } else {
                if ($stockAnterior < $cantidad) {
                    throw new Exception("Stock insuficiente para el producto: {$producto->nombre}");
                }
                $stockNuevo = $stockAnterior - $cantidad;
            }

            // Actualizar el stock del producto
            $producto->stock = $stockNuevo;
            if ($costoUnitario > 0 && $esEntrada) {
                $producto->precio_compra = $costoUnitario;
            }
            $producto->save();

            // Guardar en el Kardex
            return MovimientoInventario::create([
                'producto_id'   => $producto->id,
                'user_id'        => auth()->id(),
                'tipo'           => $tipoEnum,
                'cantidad'       => $cantidad,
                'stock_anterior' => $stockAnterior,
                'stock_nuevo'    => $stockNuevo,
                'costo_unitario' => $costoUnitario,
                'origen_type'    => $origen ? get_class($origen) : null,
                'origen_id'      => $origen?->id,
                'descripcion'    => $descripcion,
            ]);
        });
    }
}
