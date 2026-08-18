<?php

use App\Http\Controllers\UnidadMedida\UnidadMedidaController;
use App\Http\Controllers\Proveedor\ProveedorController;
use App\Http\Controllers\Producto\ProductoController;
use App\Http\Controllers\Cliente\ClienteController;
use App\Http\Controllers\Compra\CompraController;
use App\Http\Controllers\User\UserController;
use App\Http\Controllers\ProfileController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;


Route::redirect('/', '/login');

Route::get('/dashboard', function () {
    return Inertia::render('Dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});
Route::middleware(['auth', 'role:administrador'])->group(function () {
    Route::resource('users', UserController::class);
    Route::resource('clientes', ClienteController::class)
    ->parameters([
        'clientes' => 'cliente',
    ]);
    Route::resource('proveedores', ProveedorController::class)
    ->parameters([
        'proveedores' => 'proveedor',
    ]);
    Route::resource('unidad-medidas', UnidadMedidaController::class)
    ->parameters([
        'unidad-medidas' => 'unidad_medida',
    ]);
    Route::resource('productos', ProductoController::class)
    ->parameters([
        'productos' => 'producto',
    ]);
    Route::resource('compras', CompraController::class)
    ->parameters([
        'compras' => 'compra',
    ]);
});

require __DIR__.'/auth.php';
