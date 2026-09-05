<?php

use App\Http\Controllers\Caja\CajaController;
use App\Http\Controllers\UnidadMedida\UnidadMedidaController;
use App\Http\Controllers\Cliente\ClienteController;
use App\Http\Controllers\Compra\CompraController;
use App\Http\Controllers\Notificacion\NotificacionController;
use App\Http\Controllers\Cliente\PagoClienteController;
use App\Http\Controllers\Dashboard\DashboardController;
use App\Http\Controllers\ExportController;
use App\Http\Controllers\Inventario\KardexController;
use App\Http\Controllers\Pos\PosController;
use App\Http\Controllers\Producto\ProductoController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\Proveedor\ProveedorController;
use App\Http\Controllers\Reporte\ReporteController;
use App\Http\Controllers\User\UserController;
use App\Http\Controllers\Venta\VentaController;
use App\Http\Middleware\CheckCajaAbierta;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Configuracion\EmpresaController;

Route::redirect('/', '/login');

Route::get('/dashboard', [DashboardController::class, 'index'])
    ->middleware(['auth', 'verified'])
    ->name('dashboard');

// Rutas de Perfil (Autenticado genérico)
Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

// ---------------------------------------------------------
// RUTAS MÓDULO POR MÓDULO (Escalable por Permisos)
// ---------------------------------------------------------
Route::middleware('auth')->group(function () {

    // Control de Caja
    Route::middleware('can:gestionar_caja')->group(function () {
        Route::get('/caja/apertura', [CajaController::class, 'apertura'])->name('cajas.apertura');
        Route::post('/caja/apertura', [CajaController::class, 'storeApertura'])->name('cajas.storeApertura');
        Route::post('/caja/cierre', [CajaController::class, 'storeCierre'])->name('cajas.storeCierre');
    });

    // POS y Ventas
    Route::middleware(['can:usar_pos', CheckCajaAbierta::class])->group(function () {
        Route::get('/pos', [PosController::class, 'index'])->name('pos.index');
        Route::post('/ventas', [VentaController::class, 'store'])->name('ventas.store');
        Route::post('/clientes/express', [ClienteController::class, 'storeExpress'])->name('clientes.storeExpress');
        Route::get('/ventas/{venta}/imprimir', [VentaController::class, 'imprimir'])->name('ventas.imprimir');
        });
        Route::middleware(['can:usar_pos'])->group(function () {
    Route::post('/ventas/{venta}/pagos', [PagoClienteController::class, 'store'])->name('ventas.pagos.store');
});

    // Configuración de la Empresa
    Route::middleware('can:gestionar_empresa')->group(function () { // <-- 2. AÑADIDO AQUÍ
        Route::get('/configuracion/empresa', [EmpresaController::class, 'edit'])->name('empresa.edit');
        Route::put('/configuracion/empresa/{empresa}', [EmpresaController::class, 'update'])->name('empresa.update');
    });
    

    // Gestión de Usuarios
    Route::middleware('can:ver_usuarios')->group(function () {
        Route::resource('users', UserController::class);
    });

    // Clientes
    Route::middleware('can:ver_clientes')->group(function () {
        Route::resource('clientes', ClienteController::class)->parameters(['clientes' => 'cliente']);
    });

    // Proveedores
    Route::middleware('can:ver_proveedores')->group(function () {
        Route::resource('proveedores', ProveedorController::class)->parameters(['proveedores' => 'proveedor']);
    });

    // Productos y Unidades de Medida
    Route::middleware('can:ver_productos')->group(function () {
        Route::resource('productos', ProductoController::class)->parameters(['productos' => 'producto']);
        Route::resource('unidad-medidas', UnidadMedidaController::class)->parameters(['unidad-medidas' => 'unidad_medida']);
        Route::patch('/productos/{producto}/toggle-estado', [ProductoController::class, 'toggleEstado'])->name('productos.toggleEstado');
    });

    // Compras
    Route::middleware('can:ver_compras')->group(function () {
        Route::resource('compras', CompraController::class)->parameters(['compras' => 'compra']);
        Route::post('/compras/{compra}/pagos', [CompraController::class, 'registrarPago'])->name('compras.pagos.store');
    });

    // Kardex
    Route::middleware('can:ver_kardex')->group(function () {
        Route::get('kardex', [KardexController::class, 'index'])->name('kardex.index');
    });

    // Reportes
    Route::middleware('can:ver_reportes')->group(function () {
        Route::get('/reportes', [ReporteController::class, 'index'])->name('reportes.index');
    });

    // Notificaciones (solo administración: los vendedores no las ven)
    Route::middleware('can:ver_notificaciones')->group(function () {
        Route::get('/notificaciones', [NotificacionController::class, 'index'])->name('notificaciones.index');
        Route::patch('/notificaciones/leer-todas', [NotificacionController::class, 'marcarTodasLeidas'])->name('notificaciones.leerTodas');
        Route::delete('/notificaciones/leidas', [NotificacionController::class, 'destroyLeidas'])->name('notificaciones.destroyLeidas');
        Route::patch('/notificaciones/{notificacion}/leer', [NotificacionController::class, 'marcarLeida'])->name('notificaciones.leer');
        Route::delete('/notificaciones/{notificacion}', [NotificacionController::class, 'destroy'])->name('notificaciones.destroy');
    });
});

// ---------------------------------------------------------
// EXPORTACION DE BASE DE DATOS (solo administrador)
// ---------------------------------------------------------
Route::get('/admin/export', [ExportController::class, 'index'])
    ->middleware(['auth', 'role:administrador'])
    ->name('export.index');

Route::get('/export/descargar', [ExportController::class, 'descargar'])
    ->middleware(['auth', 'role:administrador'])
    ->name('export.descargar');

require __DIR__.'/auth.php';
