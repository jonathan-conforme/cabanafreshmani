<?php
namespace App\Http\Controllers\Venta;

use App\Http\Controllers\Controller;
use App\Http\Requests\Venta\StoreVentaRequest;
use Illuminate\Validation\ValidationException;
use App\Services\Caja\CajaService;
use App\Services\Venta\VentaService;
use App\Models\Venta;

class VentaController extends Controller
{
    public function __construct(
        protected VentaService $ventaService,
        protected CajaService $cajaService
    ) {}

   public function store(StoreVentaRequest $request)
    {
        $caja = $this->cajaService->getCajaAbierta(auth()->id());

        try {
            $venta = $this->ventaService->procesarVenta(
                $request->validated(),
                auth()->id(),
                $caja
            );

            return redirect()->back()
                ->with('success', 'Venta realizada con éxito.')
                ->with('venta_id', $venta->id);

        } catch (\Exception $e) {
            // Captura la excepción de stock y la envía a Inertia como un error de validación
            throw ValidationException::withMessages([
                'stock' => $e->getMessage(),
            ]);
        }
    }

    public function imprimir(Venta $venta)
    {
        $venta->load(['detalles.producto', 'cliente', 'user', 'pagos']);
        return view('impresion.ticket', compact('venta'));
    }
}
