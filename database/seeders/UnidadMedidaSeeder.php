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
                'nombre' => 'Caja',
                'simbolo' => 'caja',
            ],
           [
                'nombre' => 'Paquete',
                'simbolo' => 'paq',
            ],
            [
                'nombre' => 'Saco',
                'simbolo' => 'saco',
            ],
            [
                'nombre' => 'Quintal',
                'simbolo' => 'qq',
            ],

        ];

        DB::table('unidades_medida')->insert($unidades);
    }
}
