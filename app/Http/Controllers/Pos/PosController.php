<?php

namespace App\Http\Controllers\Pos;

use App\Http\Controllers\Controller;
use App\Models\EgresoCaja;
use App\Models\Producto;
use App\Models\Venta;
use App\Services\Caja\CajaService;
use App\Services\Cliente\ClienteService;
use Inertia\Inertia;
use Inertia\Response;

class PosController extends Controller
{
    public function __construct(
        protected CajaService $cajaService,
        protected ClienteService $clienteService
    ) {}

    public function index(): Response
    {
        $caja = $this->cajaService->getCajaAbierta(auth()->id());

        $ventasEfectivoSum = Venta::where('caja_id', $caja->id)
            ->where('metodo_pago', 'efectivo')
            ->sum('total');

        // Suma de egresos de la caja activa
        $egresosEfectivoSum = $caja
            ? EgresoCaja::where('caja_id', $caja->id)->sum('monto')
            : 0;

        return Inertia::render('Pos/Index', [
            // Se añade activos() a la consulta
            'productos' => Producto::activos()->where('stock', '>', 0)->get(),
            'clientes' => $this->clienteService->getPaginated(100)->items(),
            'caja' => $caja,
            'ventasEfectivoSum' => $ventasEfectivoSum,
            'egresosEfectivoSum' => $egresosEfectivoSum,
        ]);
    }
}
