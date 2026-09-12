<?php

use App\Http\Controllers\Caja\CajaController;
use App\Http\Controllers\Cliente\ClienteController;
use App\Http\Controllers\Cliente\PagoClienteController;
use App\Http\Controllers\Compra\CompraController;
use App\Http\Controllers\Configuracion\EmpresaController;
use App\Http\Controllers\Dashboard\DashboardController;
use App\Http\Controllers\ExportController;
use App\Http\Controllers\Inventario\KardexController;
use App\Http\Controllers\Notificacion\NotificacionController;
use App\Http\Controllers\Pos\PosController;
use App\Http\Controllers\Producto\ProductoController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\Proveedor\ProveedorController;
use App\Http\Controllers\Reporte\ReporteController;
use App\Http\Controllers\UnidadMedida\UnidadMedidaController;
use App\Http\Controllers\User\UserController;
use App\Http\Controllers\Venta\VentaController;
use App\Http\Middleware\CheckCajaAbierta;
use Illuminate\Support\Facades\Route;

Route::redirect('/', '/login');

Route::get('/dashboard', [DashboardController::class, 'index'])
    ->middleware(['auth', 'verified'])
    ->name('dashboard');

// Rutas de Perfil
Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

// ---------------------------------------------------------
// RUTAS MÓDULO POR MÓDULO
// ---------------------------------------------------------
Route::middleware('auth')->group(function () {

    // Control de Caja
    Route::middleware('can:gestionar_caja')->group(function () {
        Route::get('/caja/apertura', [CajaController::class, 'apertura'])->name('cajas.apertura');
        Route::post('/caja/apertura', [CajaController::class, 'storeApertura'])->name('cajas.storeApertura');
        Route::post('/caja/cierre', [CajaController::class, 'storeCierre'])->name('cajas.storeCierre');
        Route::post('/cajas/egreso', [CajaController::class, 'storeEgreso'])->name('cajas.storeEgreso');
    });

    // POS y Ventas
    Route::middleware(['can:usar_pos', CheckCajaAbierta::class])->group(function () {
        Route::get('/pos', [PosController::class, 'index'])->name('pos.index');
        Route::post('/ventas', [VentaController::class, 'store'])->name('ventas.store');
        Route::post('/clientes/express', [ClienteController::class, 'storeExpress'])->name('clientes.storeExpress');
        Route::get('/ventas/{venta}/imprimir', [VentaController::class, 'imprimir'])->name('ventas.imprimir');
    });

    Route::middleware('can:usar_pos')->group(function () {
        Route::post('/ventas/{venta}/pagos', [PagoClienteController::class, 'store'])->name('ventas.pagos.store');
    });

    // Configuración de la Empresa
    Route::middleware('can:gestionar_empresa')->group(function () {
        Route::get('/configuracion/empresa', [EmpresaController::class, 'edit'])->name('empresa.edit');
        Route::put('/configuracion/empresa/{empresa}', [EmpresaController::class, 'update'])->name('empresa.update');
    });

    // Gestión de Usuarios
    Route::middleware(['can:ver_usuarios', 'role:administrador'])->group(function () {
        Route::get('/users', [UserController::class, 'index'])->name('users.index');

        Route::middleware('can:gestionar_usuarios')->group(function () {
            Route::post('/users', [UserController::class, 'store'])->name('users.store');
            Route::put('/users/{user}', [UserController::class, 'update'])->name('users.update');
            Route::delete('/users/{user}', [UserController::class, 'destroy'])->name('users.destroy');
        });
    });

    // Clientes
    Route::middleware('can:ver_clientes')->group(function () {
        Route::get('/clientes', [ClienteController::class, 'index'])->name('clientes.index');

        Route::middleware('can:gestionar_clientes')->group(function () {
            Route::post('/clientes', [ClienteController::class, 'store'])->name('clientes.store');
            Route::put('/clientes/{cliente}', [ClienteController::class, 'update'])->name('clientes.update');
            Route::delete('/clientes/{cliente}', [ClienteController::class, 'destroy'])->name('clientes.destroy');
        });
    });

    // Proveedores
    Route::middleware('can:ver_proveedores')->group(function () {
        Route::get('/proveedores', [ProveedorController::class, 'index'])->name('proveedores.index');

        Route::middleware('can:gestionar_proveedores')->group(function () {
            Route::post('/proveedores', [ProveedorController::class, 'store'])->name('proveedores.store');
            Route::put('/proveedores/{proveedor}', [ProveedorController::class, 'update'])->name('proveedores.update');
            Route::delete('/proveedores/{proveedor}', [ProveedorController::class, 'destroy'])->name('proveedores.destroy');
        });
    });

    // Productos y Unidades de Medida
    Route::middleware('can:ver_productos')->group(function () {
        Route::get('/productos', [ProductoController::class, 'index'])->name('productos.index');
        Route::get('/unidad-medidas', [UnidadMedidaController::class, 'index'])->name('unidad-medidas.index');

        Route::middleware('can:gestionar_productos')->group(function () {
            Route::post('/productos', [ProductoController::class, 'store'])->name('productos.store');
            Route::put('/productos/{producto}', [ProductoController::class, 'update'])->name('productos.update');
            Route::patch('/productos/{producto}/toggle-estado', [ProductoController::class, 'toggleEstado'])->name('productos.toggleEstado');
            Route::delete('/productos/{producto}', [ProductoController::class, 'destroy'])->name('productos.destroy');

            Route::post('/unidad-medidas', [UnidadMedidaController::class, 'store'])->name('unidad-medidas.store');
            Route::put('/unidad-medidas/{unidad_medida}', [UnidadMedidaController::class, 'update'])->name('unidad-medidas.update');
            Route::delete('/unidad-medidas/{unidad_medida}', [UnidadMedidaController::class, 'destroy'])->name('unidad-medidas.destroy');
        });
    });

    // Compras
    Route::middleware('can:ver_compras')->group(function () {
        Route::get('/compras', [CompraController::class, 'index'])->name('compras.index');
        Route::get('/compras/{compra}', [CompraController::class, 'show'])->name('compras.show');

        Route::middleware('can:gestionar_compras')->group(function () {
            Route::post('/compras', [CompraController::class, 'store'])->name('compras.store');
            Route::post('/compras/{compra}/pagos', [CompraController::class, 'registrarPago'])->name('compras.pagos.store');
            Route::delete('/compras/{compra}', [CompraController::class, 'destroy'])->name('compras.destroy');
        });
    });

    // Kardex
    Route::middleware('can:ver_kardex')->group(function () {
        Route::get('kardex', [KardexController::class, 'index'])->name('kardex.index');
    });

    // Reportes
    Route::middleware('can:ver_reportes')->group(function () {
        Route::get('/reportes', [ReporteController::class, 'index'])->name('reportes.index');
        Route::get('/reportes/pdf', [ReporteController::class, 'pdf'])->name('reportes.pdf');
        Route::get('/ventas/{venta}/pdf', [VentaController::class, 'pdf'])->name('ventas.pdf');
    });

    // Notificaciones
    Route::middleware('can:ver_notificaciones')->group(function () {
        Route::get('/notificaciones', [NotificacionController::class, 'index'])->name('notificaciones.index');

        Route::middleware('can:gestionar_notificaciones')->group(function () {
            Route::patch('/notificaciones/leer-todas', [NotificacionController::class, 'marcarTodasLeidas'])->name('notificaciones.leerTodas');
            Route::delete('/notificaciones/leidas', [NotificacionController::class, 'destroyLeidas'])->name('notificaciones.destroyLeidas');
            Route::patch('/notificaciones/{notificacion}/leer', [NotificacionController::class, 'marcarLeida'])->name('notificaciones.leer');
            Route::delete('/notificaciones/{notificacion}', [NotificacionController::class, 'destroy'])->name('notificaciones.destroy');
        });
    });
});

// ---------------------------------------------------------
// EXPORTACIÓN DE BASE DE DATOS
// ---------------------------------------------------------
Route::get('/admin/export', [ExportController::class, 'index'])
    ->middleware(['auth', 'role:administrador'])
    ->name('export.index');

Route::get('/export/descargar', [ExportController::class, 'descargar'])
    ->middleware(['auth', 'role:administrador', 'throttle:3,1'])
    ->name('export.descargar');

require __DIR__.'/auth.php';