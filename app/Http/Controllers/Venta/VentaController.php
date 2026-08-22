<?php
namespace App\Http\Controllers\Venta;

use App\Http\Controllers\Controller;
use App\Http\Requests\Venta\StoreVentaRequest;
use App\Services\Caja\CajaService;
use App\Services\Venta\VentaService;

class VentaController extends Controller
{
    public function __construct(
        protected VentaService $ventaService,
        protected CajaService $cajaService
    ) {}

    public function store(StoreVentaRequest $request)
    {
        $caja = $this->cajaService->getCajaAbierta(auth()->id());

        $this->ventaService->procesarVenta(
            $request->validated(),
            auth()->id(),
            $caja
        );

        return redirect()->back()->with('success', 'Venta realizada con éxito.');
    }
}
