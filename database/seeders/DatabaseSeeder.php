<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    public function run(): void
    {
        // 1. Instalar Roles y Permisos Base
        $this->call([
            RolePermissionSeeder::class,
            UnidadMedidaSeeder::class,
            ClienteSeeder::class,
            ProveedorSeeder::class,
            ProductoSeeder::class,
            
        ]);

        // 2. Leer credenciales directamente desde el .env
        $adminName = env('SEED_ADMIN_NAME', 'Administrador Principal');
        $adminEmail = env('SEED_ADMIN_EMAIL', 'admin@cabanafreshmani.test');
        $adminPassword = env('SEED_ADMIN_PASSWORD');

        // Si no hay clave en el .env, asigna una temporal o fallback
        if (!$adminPassword) {
            $adminPassword = app()->environment('local') ? 'password' : Str::random(16);
            $this->command?->warn("SEED_ADMIN_PASSWORD no está definida en .env.");
            $this->command?->info("Clave generada para {$adminEmail}: {$adminPassword}");
        }

        // 3. Crear Usuario Administrador
        $administrador = User::firstOrCreate(
            ['email' => $adminEmail],
            [
                'name' => $adminName,
                'password' => Hash::make($adminPassword),
            ]
        );

        // 4. Asignar Rol de Administrador
        if (!$administrador->hasRole('administrador')) {
            $administrador->assignRole('administrador');
        }
    }
}