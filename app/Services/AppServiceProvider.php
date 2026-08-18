<?php
namespace App\Providers;

use Illuminate\Support\Facades\Route;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function boot(): void
    {
        // Mapea el plural con su singular correcto en español
        Route::resourceVerbs([
            'create' => 'crear',
            'edit' => 'editar',
        ]);

        Route::singularResourceParameters([
            'proveedores' => 'proveedor',
            'clientes' => 'cliente',
        ]);
    }
}
