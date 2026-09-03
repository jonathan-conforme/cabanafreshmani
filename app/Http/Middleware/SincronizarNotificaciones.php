<?php

namespace App\Http\Middleware;

use App\Models\Notificacion;
use App\Services\Notificacion\NotificacionService;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

/**
 * Regenera las notificaciones automáticas como máximo una vez por minuto,
 * aprovechando cualquier navegación GET de un usuario autenticado.
 */
class SincronizarNotificaciones
{
    /** Segundos mínimos entre sincronizaciones. */
    private const INTERVALO = 60;

    public function __construct(
        private readonly NotificacionService $notificaciones
    ) {}

    public function handle(Request $request, Closure $next)
    {
        // Se sincroniza ANTES de resolver la respuesta: las props compartidas
        // de Inertia se calculan dentro de $next(), así que hacerlo después
        // dejaría la campana siempre una navegación desactualizada.
        // Solo se paga este costo en la navegación de quien verá las notificaciones;
        // el POS de un vendedor no debe cargar con estas consultas.
        if ($request->user()?->can(Notificacion::PERMISO)
            && $request->isMethod('GET')
            && ! $request->wantsJson()) {
            Cache::remember('notificaciones:ultima-sync', self::INTERVALO, function () {
                rescue(fn () => $this->notificaciones->sincronizar(), report: true);

                return now()->toDateTimeString();
            });
        }

        return $next($request);
    }
}
