<?php
namespace Tests\Feature;

use App\Models\User;
use App\Services\User\UserService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class UserServiceTest extends TestCase
{
    use RefreshDatabase;

    public function test_puede_crear_un_vendedor_de_fritada_correctamente(): void
    {
        // 1. Preparar: Crear el rol de prueba
        Role::create(['name' => 'vendedor_fritada']);
        $service = app(UserService::class);

        $datosEmpleado = [
            'name'     => 'Carlos Fritada',
            'email'    => 'carlos@cabanafreshmani.test',
            'password' => '12345678',
            'role'     => 'vendedor_fritada',
        ];

        // 2. Actuar: Llamar al servicio
        $user = $service->createUser($datosEmpleado);

        // 3. Afirmar (Assert): Verificar en la BD y en los permisos
        $this->assertDatabaseHas('users', [
            'email' => 'carlos@cabanafreshmani.test',
        ]);

        $this->assertTrue($user->hasRole('vendedor_fritada'));
        
        // Verifica el nombre exacto del rol mediante la relación de Spatie
        $this->assertEquals('vendedor_fritada', $user->roles->first()->name);
    }
}