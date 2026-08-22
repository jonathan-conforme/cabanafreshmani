<?php
namespace App\Http\Controllers\Inventario;

use App\Http\Controllers\Controller;
use App\Models\MovimientoInventario;
use App\Models\Producto;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class KardexController extends Controller
{
    public function index(Request $request): Response
    {
        $movimientos = MovimientoInventario::with(['producto.unidad', 'user'])
            ->when($request->producto_id, function ($q, $productoId) {
                $q->where('producto_id', $productoId);
            })
            ->when($request->tipo, function ($q, $tipo) {
                $q->where('tipo', $tipo);
            })
            ->when($request->search, function ($q, $search) {
                $q->whereHas('producto', function ($qp) use ($search) {
                    $qp->where('nombre', 'like', "%{$search}%")
                       ->orWhere('codigo_barras', 'like', "%{$search}%");
                });
            })
            ->latest()
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('Inventario/Index', [
            'movimientos' => $movimientos,
            'productos' => Producto::select('id', 'nombre', 'codigo_barras')->orderBy('nombre')->get(),
            'filters' => $request->only(['producto_id', 'tipo', 'search']),
        ]);
    }
}
