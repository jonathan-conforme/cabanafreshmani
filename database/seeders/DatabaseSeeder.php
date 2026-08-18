<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Database\Seeders\ClienteSeeder;
class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call(RolePermissionSeeder::class);
       

        $administrador = User::factory()->create([
            'name' => 'Administrador',
            'email' => 'admin@cabanafreshmani.test',
            'password' => Hash::make('password'),
        ]);

        $administrador->assignRole('administrador');

        $vendedor = User::factory()->create([
            'name' => 'Vendedor',
            'email' => 'vendedor@cabanafreshmani.test',
            'password' => Hash::make('password'),
        ]);

        $vendedor->assignRole('vendedor');

        $vendedorFritada = User::factory()->create([
            'name' => 'Vendedor Fritada',
            'email' => 'fritada@cabanafreshmani.test',
            'password' => Hash::make('password'),
        ]);

        $vendedorFritada->assignRole('vendedor_fritada');

        $this->call(ProveedorSeeder::class);
        $this->call(ClienteSeeder::class);
    }
}
