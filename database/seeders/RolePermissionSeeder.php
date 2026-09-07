<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;
use Spatie\Permission\Models\Permission;


class RolePermissionSeeder extends Seeder
{
    /**
     * Permisos por modulo. Antes cada modulo tenia un unico 'ver_X' que en la
     * practica habilitaba tambien crear, editar y borrar: dar "solo lectura" de
     * productos a un vendedor le dejaba vaciar el catalogo. Ahora la lectura y
     * la escritura son permisos distintos.
     *
     * Compras no lleva 'editar': el controlador no expone edicion.
     */
    public const MODULOS = [
        'usuarios' => ['ver', 'crear', 'editar', 'eliminar'],
        'clientes' => ['ver', 'crear', 'editar', 'eliminar'],
        'proveedores' => ['ver', 'crear', 'editar', 'eliminar'],
        'productos' => ['ver', 'crear', 'editar', 'eliminar'],
        'compras' => ['ver', 'crear', 'eliminar'],
        'kardex' => ['ver'],
        'reportes' => ['ver'],
        'notificaciones' => ['ver', 'gestionar'],
    ];

    /** Permisos que no siguen el patron modulo/accion. */
    public const SUELTOS = [
        'usar_pos',
        'gestionar_caja',
        'gestionar_empresa',
    ];

    /**
     * @return array<int, string>
     */
    public static function permisos(): array
    {
        $permisos = [];

        foreach (self::MODULOS as $modulo => $acciones) {
            foreach ($acciones as $accion) {
                $permisos[] = "{$accion}_{$modulo}";
            }
        }

        return array_merge($permisos, self::SUELTOS);
    }

    public function run(): void
    {
       // Resetear la caché de Spatie
        app()[PermissionRegistrar::class]->forgetCachedPermissions();

        // 1. Crear los permisos de los módulos
        foreach (self::permisos() as $permiso) {
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
