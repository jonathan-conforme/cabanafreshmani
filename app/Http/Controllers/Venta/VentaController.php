<?php
namespace App\Http\Controllers\Venta;

use App\Http\Controllers\Controller;
use App\Http\Requests\Venta\StoreVentaRequest;
use Illuminate\Validation\ValidationException;
use App\Services\Caja\CajaService;
use App\Services\Venta\VentaService;
use App\Models\Venta;
use App\Models\Empresa;
use Barryvdh\DomPDF\Facade\Pdf;

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
    // Cargar relaciones exactas del ticket incluyendo la unidad de medida del producto
    $venta->load(['detalles.producto.unidad', 'cliente', 'user', 'pagos']);
$empresa = Empresa::first();

    // Si la petición viene desde React (vía Fetch / Axios), responde JSON
    if (request()->wantsJson() || request()->header('Accept') === 'application/json') {
        return response()->json([
            'venta' => $venta,
            'empresa' => $empresa,
        ]);
    }

    // Si se accede de forma normal por URL, renderiza el Blade tradicional
    return view('impresion.ticket', compact('venta', 'empresa'));
}
  public function pdf(Venta $venta)
    {
        $venta->load([
            'detalles.producto.unidad',
            'cliente',
            'user',
            'pagos'
        ]);

        $empresa = Empresa::first();

        return view('impresion.reportes.venta', [
        'venta' => $venta,
        'empresa' => $empresa,
    ]);

        return $pdf->stream('venta-' . $venta->id . '.pdf');
    }
}
