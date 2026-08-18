<?php

namespace App\Services\Producto;

use App\Models\Producto;
use Illuminate\Support\Facades\DB;

class ProductoService
{
    public function create(array $data): Producto
    {
        return DB::transaction(function () use ($data) {
            return Producto::create($data);
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
}
