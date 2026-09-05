<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Database\Seeders\ClienteSeeder;
use Database\Seeders\ProveedorSeeder;
use Database\Seeders\UnidadMedidaSeeder;
use Database\Seeders\ProductoSeeder;
class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call(RolePermissionSeeder::class);

        $clave = $this->clavePorDefecto();

        $administrador = User::factory()->create([
            'name' => 'Administrador',
            'email' => 'admin@cabanafreshmani.test',
            'password' => Hash::make($clave),
        ]);

        $administrador->assignRole('administrador');

        $vendedor = User::factory()->create([
            'name' => 'Vendedor',
            'email' => 'vendedor@cabanafreshmani.test',
            'password' => Hash::make($clave),
        ]);

        $vendedor->assignRole('vendedor');

        $vendedorFritada = User::factory()->create([
            'name' => 'Vendedor Fritada',
            'email' => 'fritada@cabanafreshmani.test',
            'password' => Hash::make($clave),
        ]);

        $vendedorFritada->assignRole('vendedor_fritada');

        $this->call(ProveedorSeeder::class);
        $this->call(ClienteSeeder::class);
        $this->call([UnidadMedidaSeeder::class,ProductoSeeder::class,
]);
    }

    /**
     * Contrasena de las tres cuentas de arranque.
     *
     * En local y en los tests sigue siendo 'password' para no estorbar el
     * desarrollo. Fuera de ahi NO puede quedar fija: sembrar en el servidor
     * dejaba un administrador con la contrasena 'password' publicada en el
     * repositorio. Se toma de SEED_PASSWORD y, si no esta, se genera una
     * aleatoria que se imprime una unica vez en la consola del deploy.
     */
    protected function clavePorDefecto(): string
    {
        if ($fijada = env('SEED_PASSWORD')) {
            return $fijada;
        }

        if (app()->environment('local', 'testing')) {
            return 'password';
        }

        $clave = Str::password(20);

        $this->command?->warn('Contrasena generada para las cuentas iniciales (anotala, no se vuelve a mostrar):');
        $this->command?->line('  '.$clave);

        return $clave;
    }
}
