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
    

    // Gestión de Usuarios: solo el administrador. La vista expone los datos de
    // todos los empleados y el catalogo completo de permisos, asi que el permiso
    // ver_usuarios por si solo no alcanza. 'show' no existe en el controlador:
    // registrarla dejaba una ruta que reventaba con 500.
    Route::middleware(['can:ver_usuarios', 'role:administrador'])->group(function () {
        Route::resource('users', UserController::class)
            ->except(['show'])
            ->middlewareFor(['create', 'store'], 'can:crear_usuarios')
            ->middlewareFor(['edit', 'update'], 'can:editar_usuarios')
            ->middlewareFor('destroy', 'can:eliminar_usuarios');
    });

    // Clientes. El grupo exige acceso al modulo; cada verbo de escritura pide
    // ademas su propio permiso.
    Route::middleware('can:ver_clientes')->group(function () {
        Route::resource('clientes', ClienteController::class)
            ->parameters(['clientes' => 'cliente'])
            ->middlewareFor(['create', 'store'], 'can:crear_clientes')
            ->middlewareFor(['edit', 'update'], 'can:editar_clientes')
            ->middlewareFor('destroy', 'can:eliminar_clientes');
    });

    // Proveedores
    Route::middleware('can:ver_proveedores')->group(function () {
        Route::resource('proveedores', ProveedorController::class)
            ->parameters(['proveedores' => 'proveedor'])
            ->middlewareFor(['create', 'store'], 'can:crear_proveedores')
            ->middlewareFor(['edit', 'update'], 'can:editar_proveedores')
            ->middlewareFor('destroy', 'can:eliminar_proveedores');
    });

    // Productos y Unidades de Medida. Ambos se editan desde modales, por eso los
    // controladores no tienen create/show/edit: esas rutas del resource apuntaban
    // a metodos inexistentes y respondian 500.
    Route::middleware('can:ver_productos')->group(function () {
        Route::resource('productos', ProductoController::class)
            ->parameters(['productos' => 'producto'])
            ->except(['create', 'show', 'edit'])
            ->middlewareFor('store', 'can:crear_productos')
            ->middlewareFor('update', 'can:editar_productos')
            ->middlewareFor('destroy', 'can:eliminar_productos');

        Route::resource('unidad-medidas', UnidadMedidaController::class)
            ->parameters(['unidad-medidas' => 'unidad_medida'])
            ->except(['create', 'show', 'edit'])
            ->middlewareFor('store', 'can:crear_productos')
            ->middlewareFor('update', 'can:editar_productos')
            ->middlewareFor('destroy', 'can:eliminar_productos');

        Route::patch('/productos/{producto}/toggle-estado', [ProductoController::class, 'toggleEstado'])
            ->middleware('can:editar_productos')
            ->name('productos.toggleEstado');
    });

    // Compras. No hay edicion: el controlador no define edit/update, y esas dos
    // rutas del resource respondian 500 al llamarlas.
    Route::middleware('can:ver_compras')->group(function () {
        Route::resource('compras', CompraController::class)
            ->parameters(['compras' => 'compra'])
            ->except(['edit', 'update'])
            ->middlewareFor(['create', 'store'], 'can:crear_compras')
            ->middlewareFor('destroy', 'can:eliminar_compras');

        // Registrar un abono modifica el saldo del proveedor: es escritura.
        Route::post('/compras/{compra}/pagos', [CompraController::class, 'registrarPago'])
            ->middleware('can:crear_compras')
            ->name('compras.pagos.store');
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
        // Marcar y descartar cambian estado: van con permiso propio.
        Route::middleware('can:gestionar_notificaciones')->group(function () {
            Route::patch('/notificaciones/leer-todas', [NotificacionController::class, 'marcarTodasLeidas'])->name('notificaciones.leerTodas');
            Route::delete('/notificaciones/leidas', [NotificacionController::class, 'destroyLeidas'])->name('notificaciones.destroyLeidas');
            Route::patch('/notificaciones/{notificacion}/leer', [NotificacionController::class, 'marcarLeida'])->name('notificaciones.leer');
            Route::delete('/notificaciones/{notificacion}', [NotificacionController::class, 'destroy'])->name('notificaciones.destroy');
        });
    });
});

// ---------------------------------------------------------
// EXPORTACION DE BASE DE DATOS (solo administrador)
// ---------------------------------------------------------
Route::get('/admin/export', [ExportController::class, 'index'])
    ->middleware(['auth', 'role:administrador'])
    ->name('export.index');

// Cada request vuelca la base entera a disco: se limita para que no se pueda
// usar como palanca de denegacion de servicio.
Route::get('/export/descargar', [ExportController::class, 'descargar'])
    ->middleware(['auth', 'role:administrador', 'throttle:3,1'])
    ->name('export.descargar');

require __DIR__.'/auth.php';
