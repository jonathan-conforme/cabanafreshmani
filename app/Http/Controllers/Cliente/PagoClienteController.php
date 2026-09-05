<?php
namespace App\Http\Controllers\Cliente;

use App\Http\Controllers\Controller;
use App\Models\Venta;
use App\Services\Pago\PagoVentaService;
use Illuminate\Http\Request;
use Exception;

class PagoClienteController extends Controller
{
    protected $pagoVentaService;

    public function __construct(PagoVentaService $pagoVentaService)
    {
        $this->pagoVentaService = $pagoVentaService;
    }

    public function store(Request $request, Venta $venta)
    {
        // Validar los datos del formulario
        $datos = $request->validate([
            'monto' => 'required|numeric|min:0.01',
            'metodo_pago' => 'required|in:efectivo,tarjeta,transferencia',
            'observaciones' => 'nullable|string|max:255',
        ]);

      try {
            $this->pagoVentaService->registrarPago($venta, $datos, auth()->id());

            return redirect()->back()->with('success', 'Pago registrado exitosamente.');
        } catch (Exception $e) {
            // Devuelve el mensaje como error del campo para que no fuerce redirecciones ni recargas de ruta
            return back()->withErrors([
                'caja' => $e->getMessage(),
                'monto' => $e->getMessage(),
            ]);
        }
    }
}
