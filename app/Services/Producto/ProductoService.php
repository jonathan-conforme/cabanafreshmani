<?php

namespace App\Services\Producto;

use App\Models\Producto;
use App\Services\Inventario\InventarioService;
use Illuminate\Support\Facades\DB;

class ProductoService
{

    public function __construct(
        protected InventarioService $inventarioService
    ) {}

    public function create(array $data): Producto
    {

        return DB::transaction(function () use ($data) {
         // 1. Guardar el stock inicial deseado en una variable
            $stockInicial = (float) ($data['stock'] ?? 0);

            // 2. Forzar stock en 0 al crear la ficha para que el Kardex haga la suma correctamente
            $data['stock'] = 0;
            $producto = Producto::create($data);

            // 3. Registrar la entrada inicial (0 + stockInicial = stockInicial real)
            if ($stockInicial > 0) {
                $this->inventarioService->registrarMovimiento(
                    productoId: $producto->id,
                    tipo: 'compra',
                    cantidad: $stockInicial,
                    costoUnitario: (float) ($producto->precio_compra ?? 0),
                    descripcion: 'Inventario inicial al crear el producto',
                    origen: $producto
                );
            }

            return $producto->fresh('unidad');
        });
    }

    public function update(Producto $producto, array $data): Producto
    {
        return DB::transaction(function () use ($producto, $data) {
            // Evalúa si la petición incluye modificación de stock (por ejemplo via API o Postman)
            if (array_key_exists('stock', $data) && $data['stock'] !== null) {
                $nuevoStock = (float) $data['stock'];
                $stockActual = (float) $producto->stock;
                $diferencia = $nuevoStock - $stockActual;

                // Si detecta un cambio real, registra el ajuste en Kardex
                if (abs($diferencia) > 0.0001) {
                    $this->inventarioService->registrarMovimiento(
                        productoId: $producto->id,
                        tipo: 'ajuste',
                        cantidad: $diferencia,
                        costoUnitario: (float) ($producto->precio_compra ?? 0),
                        descripcion: 'Ajuste de inventario desde edición de producto',
                        origen: $producto
                    );
                }

                // Elimina el campo 'stock' del array para evitar sobreescritura directa en BD
                unset($data['stock']);
            }

            $producto->update($data);

            return $producto->fresh('unidad');
        });
    }

    public function delete(Producto $producto): void
    {
        DB::transaction(function () use ($producto) {
            $producto->delete();
        });
    }

    // Cambiar estado activo / inactivo
    public function toggleEstado(Producto $producto): Producto
    {
        return DB::transaction(function () use ($producto) {
            $producto->update([
                'activo' => !$producto->activo,
            ]);

            return $producto;
        });
    }
}
