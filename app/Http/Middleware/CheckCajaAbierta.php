<?php
namespace App\Http\Middleware;

use App\Services\Caja\CajaService;
use Closure;
use Illuminate\Http\Request;

class CheckCajaAbierta
{
    public function __construct(protected CajaService $cajaService) {}

    public function handle(Request $request, Closure $next)
    {
        $caja = $this->cajaService->getCajaAbierta(auth()->id());

        if (!$caja) {
            return redirect()->route('cajas.apertura')
                ->with('warning', 'Debes abrir caja antes de realizar ventas.');
        }

        return $next($request);
    }
}
