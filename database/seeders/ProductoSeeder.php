<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Producto;
use App\Models\UnidadMedida;

class ProductoSeeder extends Seeder
{
    public function run(): void
    {
        // Buscamos la unidad de medida en libras o 'und' por defecto
        $lb = UnidadMedida::where('simbolo', 'lb')->first()
            ?? UnidadMedida::where('simbolo', 'und')->first();

        $productos = [
            [
                'unidad_id' => $lb?->id,
                'codigo_barras' => '786100000001',
                'nombre' => 'Maíz',
                'es_granel' => true,
                'precio_compra' => 0.24, // $23/97lb approx 0.24
                'precio_venta' => 0.35,
                'stock' => 97,
                'stock_minimo' => 10,
            ],
            [
                'unidad_id' => $lb?->id,
                'codigo_barras' => '786100000002',
                'nombre' => 'Arroz',
                'es_granel' => true,
                'precio_compra' => 0.28, // $28/100lb = 0.28 por libra
                'precio_venta' => 1.00,
                'stock' => 100,
                'stock_minimo' => 10,
            ],
            [
                'unidad_id' => $lb?->id,
                'codigo_barras' => '786100000003',
                'nombre' => 'Tamarindo',
                'es_granel' => true,
                'precio_compra' => 0.85, // $85/100lb = 0.85 por libra
                'precio_venta' => 1.00,
                'stock' => 100,
                'stock_minimo' => 10,
            ],
            [
                'unidad_id' => $lb?->id,
                'codigo_barras' => '786100000004',
                'nombre' => 'Maní Tostado',
                'es_granel' => true,
                'precio_compra' => 0.80, // $80/100lb = 0.80 por libra
                'precio_venta' => 1.00,
                'stock' => 100,
                'stock_minimo' => 10,
            ],
        ];

        foreach ($productos as $producto) {
            if ($producto['unidad_id']) {
                Producto::create($producto);
            }
        }
    }
}
