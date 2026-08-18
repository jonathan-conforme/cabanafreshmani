<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Producto;
use App\Models\UnidadMedida;

class ProductoSeeder extends Seeder
{
    public function run(): void
    {
        $kg = UnidadMedida::where('simbolo', 'kg')->first();
        $g = UnidadMedida::where('simbolo', 'g')->first();
        $l = UnidadMedida::where('simbolo', 'l')->first();
        $ml = UnidadMedida::where('simbolo', 'ml')->first();
        $unidad = UnidadMedida::where('simbolo', 'und')->first();

        $productos = [
            [
                'unidad_id' => $kg?->id,
                'codigo_barras' => '786100000001',
                'nombre' => 'Arroz',
                'es_granel' => false,
                'precio_compra' => 1.20,
                'precio_venta' => 1.50,
                'stock' => 50,
                'stock_minimo' => 10,
            ],
            [
                'unidad_id' => $kg?->id,
                'codigo_barras' => '786100000002',
                'nombre' => 'Azúcar',
                'es_granel' => false,
                'precio_compra' => 1.10,
                'precio_venta' => 1.40,
                'stock' => 40,
                'stock_minimo' => 10,
            ],
            [
                'unidad_id' => $kg?->id,
                'codigo_barras' => '786100000003',
                'nombre' => 'Harina de trigo',
                'es_granel' => false,
                'precio_compra' => 0.95,
                'precio_venta' => 1.25,
                'stock' => 35,
                'stock_minimo' => 8,
            ],
            [
                'unidad_id' => $kg?->id,
                'codigo_barras' => null,
                'nombre' => 'Papa',
                'es_granel' => true,
                'precio_compra' => 0.60,
                'precio_venta' => 0.90,
                'stock' => 80,
                'stock_minimo' => 15,
            ],
            [
                'unidad_id' => $kg?->id,
                'codigo_barras' => null,
                'nombre' => 'Tomate',
                'es_granel' => true,
                'precio_compra' => 0.80,
                'precio_venta' => 1.20,
                'stock' => 45,
                'stock_minimo' => 10,
            ],
            [
                'unidad_id' => $kg?->id,
                'codigo_barras' => null,
                'nombre' => 'Cebolla',
                'es_granel' => true,
                'precio_compra' => 0.50,
                'precio_venta' => 0.80,
                'stock' => 30,
                'stock_minimo' => 8,
            ],
            [
                'unidad_id' => $l?->id,
                'codigo_barras' => '786100000004',
                'nombre' => 'Aceite vegetal',
                'es_granel' => false,
                'precio_compra' => 2.10,
                'precio_venta' => 2.60,
                'stock' => 25,
                'stock_minimo' => 5,
            ],
            [
                'unidad_id' => $l?->id,
                'codigo_barras' => '786100000005',
                'nombre' => 'Leche',
                'es_granel' => false,
                'precio_compra' => 0.90,
                'precio_venta' => 1.15,
                'stock' => 30,
                'stock_minimo' => 8,
            ],
            [
                'unidad_id' => $g?->id,
                'codigo_barras' => '786100000006',
                'nombre' => 'Sal',
                'es_granel' => false,
                'precio_compra' => 0.40,
                'precio_venta' => 0.60,
                'stock' => 20,
                'stock_minimo' => 5,
            ],
            [
                'unidad_id' => $unidad?->id,
                'codigo_barras' => '786100000007',
                'nombre' => 'Huevos',
                'es_granel' => false,
                'precio_compra' => 0.15,
                'precio_venta' => 0.20,
                'stock' => 120,
                'stock_minimo' => 30,
            ],
        ];

        foreach ($productos as $producto) {
            if ($producto['unidad_id']) {
                Producto::create($producto);
            }
        }
    }
}
