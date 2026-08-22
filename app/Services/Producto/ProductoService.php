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
