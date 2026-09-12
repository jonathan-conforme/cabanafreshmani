<?php

namespace App\Http\Middleware;

use App\Models\Notificacion;
use Illuminate\Http\Request;
use App\Models\Empresa;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        return [
            ...parent::share($request),
            'auth' => [
                'user' => $request->user() ? [
                    'id' => $request->user()->id,
                    'name' => $request->user()->name,
                    'email' => $request->user()->email,
                    'roles' => $request->user()->getRoleNames(), // ["administrador"]
                    'permissions' => $request->user()->getAllPermissions()->pluck('name'), // ["crear_ventas", ...]
                ] : null,
            ],
            'flash' => [
                'success' => fn () => $request->session()->get('success'),
                'error' => fn () => $request->session()->get('error'),
                'warning' => fn () => $request->session()->get('warning'),
                'info' => fn () => $request->session()->get('info'),
                'venta_id' => fn () => $request->session()->get('venta_id'),
            ],

            // Solo quien administra recibe notificaciones; para el resto ni se consulta la BD.
            'notificaciones' => fn () => $request->user()?->can(Notificacion::PERMISO) ? [
                'no_leidas' => Notificacion::noLeidas()->count(),
                'recientes' => Notificacion::latest()->limit(8)->get(),
            ] : null,

            // 2. Datos públicos de la empresa compartidos de forma segura para tickets
            'empresa' => fn () => Empresa::select([
                'nombre_comercial',
                'razon_social',
                'ruc',
                'direccion_matriz',
                'telefono',
                'email',
                'leyenda_ticket',
                'ambiente_sri',
                'obligado_contabilidad',
            ])->first(),

        ];
    }
}
