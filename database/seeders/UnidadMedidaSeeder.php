<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class UnidadMedidaSeeder extends Seeder
{
    public function run(): void
    {
        $unidades = [
            [
                'nombre' => 'Kilogramo',
                'simbolo' => 'kg',
            ],
            [
                'nombre' => 'Gramo',
                'simbolo' => 'g',
            ],
            [
                'nombre' => 'Libra',
                'simbolo' => 'lb',
            ],
            [
                'nombre' => 'Litro',
                'simbolo' => 'L',
            ],
            [
                'nombre' => 'Mililitro',
                'simbolo' => 'ml',
            ],
            [
                'nombre' => 'Unidad',
                'simbolo' => 'und',
            ],
            [
                'nombre' => 'Docena',
                'simbolo' => 'doc',
            ],
            [
                'nombre' => 'Media docena',
                'simbolo' => '1/2 doc',
            ],
            [
                'nombre' => 'Caja',
                'simbolo' => 'caja',
            ],
            [
                'nombre' => 'Paquete',
                'simbolo' => 'paq',
            ],
            [
                'nombre' => 'Funda',
                'simbolo' => 'fda',
            ],
            [
                'nombre' => 'Saco',
                'simbolo' => 'saco',
            ],
            [
                'nombre' => 'Quintal',
                'simbolo' => 'qq',
            ],
            [
                'nombre' => 'Tonelada',
                'simbolo' => 't',
            ],
            [
                'nombre' => 'Metro',
                'simbolo' => 'm',
            ],
            [
                'nombre' => 'Centímetro',
                'simbolo' => 'cm',
            ],
        ];

        DB::table('unidades_medida')->insert($unidades);
    }
}
