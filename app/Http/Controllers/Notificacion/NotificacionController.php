<?php

namespace App\Http\Controllers\Notificacion;

use App\Http\Controllers\Controller;
use App\Models\Notificacion;
use App\Services\Notificacion\NotificacionService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class NotificacionController extends Controller
{
    protected const TIPOS_VALIDOS = [
        'stock_bajo', 'sin_stock', 'compra_vencida', 'compra_por_vencer', 'resumen_ventas',
    ];

    public function __construct(
        protected NotificacionService $notificacionService
    ) {}

    public function index(Request $request): Response
    {
        // Fuerza una sincronización al entrar al panel para mostrar datos frescos.
        $this->notificacionService->sincronizar();

        $tipo = in_array($request->get('tipo'), self::TIPOS_VALIDOS, true)
            ? $request->get('tipo')
            : null;

        $estado = in_array($request->get('estado'), ['leidas', 'no_leidas'], true)
            ? $request->get('estado')
            : null;

        $notificaciones = Notificacion::query()
            ->delTipo($tipo)
            ->when($estado === 'leidas', fn ($q) => $q->leidas())
            ->when($estado === 'no_leidas', fn ($q) => $q->noLeidas())
            ->latest()
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('Notificaciones/Index', [
            'notificaciones' => $notificaciones,
            'resumen' => [
                'total' => Notificacion::count(),
                'no_leidas' => Notificacion::noLeidas()->count(),
                'por_tipo' => Notificacion::selectRaw('tipo, COUNT(*) as total')
                    ->groupBy('tipo')
                    ->pluck('total', 'tipo'),
            ],
            'filtros' => [
                'tipo' => $tipo,
                'estado' => $estado,
            ],
        ]);
    }

    public function marcarLeida(Notificacion $notificacion): RedirectResponse
    {
        $notificacion->marcarComoLeida();

        return back();
    }

    public function marcarTodasLeidas(): RedirectResponse
    {
        Notificacion::noLeidas()->update(['leida_at' => now()]);

        return back()->with('success', 'Todas las notificaciones se marcaron como leídas.');
    }

    public function destroy(Notificacion $notificacion): RedirectResponse
    {
        // Se descarta en vez de borrar: si la condición (stock bajo, compra vencida...)
        // sigue activa, un delete real solo duraría hasta la siguiente sincronización.
        $notificacion->descartar();

        return back()->with('success', 'Notificación eliminada.');
    }

    public function destroyLeidas(): RedirectResponse
    {
        $eliminadas = Notificacion::leidas()->update([
            'descartada_at' => now(),
        ]);

        return back()->with('success', "Se eliminaron {$eliminadas} notificación(es) leída(s).");
    }
}
