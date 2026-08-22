<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;
use Spatie\Permission\Models\Permission;


class RolePermissionSeeder extends Seeder
{
    public function run(): void
    {
       // Resetear la caché de Spatie
        app()[PermissionRegistrar::class]->forgetCachedPermissions();

        // 1. Crear los permisos de los módulos
        $permisos = [
            'ver_usuarios',
            'ver_clientes',
            'ver_proveedores',
            'ver_productos',
            'ver_compras',
            'ver_kardex',
            'usar_pos',
            'gestionar_caja',
        ];

        foreach ($permisos as $permiso) {
            Permission::firstOrCreate(['name' => $permiso]);
        }

        // 2. Crear los roles
        $admin = Role::firstOrCreate(['name' => 'administrador']);
        $vendedor = Role::firstOrCreate(['name' => 'vendedor']);
        $vendedorFritada = Role::firstOrCreate(['name' => 'vendedor_fritada']);

        // 3. Asignar permisos predeterminados a los roles
        $admin->syncPermissions(Permission::all()); // El admin obtiene todos

        $vendedor->syncPermissions(['usar_pos', 'gestionar_caja']);
        $vendedorFritada->syncPermissions(['usar_pos', 'gestionar_caja']);
    }
}
