<?php
namespace App\Http\Controllers\Caja;

use App\Models\Caja;
use App\Models\Venta;
use App\Http\Controllers\Controller;
use App\Services\Caja\CajaService;
use App\Http\Requests\Caja\AperturaCajaRequest;
use App\Http\Requests\Caja\CierreCajaRequest;
use App\Http\Requests\Egreso\StoreEgresoRequest;
use Inertia\Inertia;

class CajaController extends Controller
{

    public function __construct(protected CajaService $cajaService) {}

    // Vista de Apertura / Estado
   public function apertura()
    {
        $caja = $this->cajaService->getCajaAbierta(auth()->id());
        if ($caja) {
            return redirect()->route('pos.index');
        }

        return Inertia::render('Cajas/Apertura');
    }

    // Registrar Apertura
    public function storeApertura(AperturaCajaRequest $request)
    {
        $this->cajaService->abrirCaja(auth()->id(), $request->validated());

        return redirect()->route('pos.index')
            ->with('success', 'Caja abierta con éxito.');
    }
    public function storeEgreso(StoreEgresoRequest $request)
    {
        $caja = $this->cajaService->getCajaAbierta(auth()->id());

        if (!$caja) {
            return redirect()->back()
                ->with('error', 'No tienes una caja abierta para registrar egresos.');
        }

        $this->cajaService->registrarEgreso($caja, auth()->id(), $request->validated());

        return redirect()->back()
            ->with('success', 'Egreso registrado con éxito.');
    }


    // Registrar Cierre y Arqueo
    public function storeCierre(CierreCajaRequest $request)
    {
        $caja = $this->cajaService->getCajaAbierta(auth()->id());

        if (!$caja) {
            return redirect()->route('cajas.apertura')
                ->with('error', 'No tienes una caja abierta para cerrar.');
        }

        $this->cajaService->cerrarCaja($caja, $request->validated());

        return redirect()->route('cajas.apertura')
            ->with('success', 'Caja cerrada y arqueo registrado.');
    }
}
