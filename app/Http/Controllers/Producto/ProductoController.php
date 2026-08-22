<?php

namespace App\Http\Controllers\Producto;

use App\Http\Controllers\Controller;
use App\Http\Requests\Producto\ProductoRequest;
use App\Models\Producto;
use App\Models\UnidadMedida;
use App\Services\Producto\ProductoService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ProductoController extends Controller
{
    public function __construct(
        protected ProductoService $productoService
    ) {}

    public function index(Request $request): Response
    {
        $productos = Producto::with('unidad')
            ->when($request->search, function ($query, $search) {
                $query->where('nombre', 'like', "%{$search}%")
                    ->orWhere('codigo_barras', 'like', "%{$search}%");
            })
            ->when($request->boolean('solo_stock_bajo'), function ($query) {
                $query->stockBajo();
            })
            ->latest()
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('Productos/Index', [
            'productos' => $productos,
            'unidades' => UnidadMedida::orderBy('nombre')->get(),
            'total_stock_bajo' => Producto::stockBajo()->count(), // Conteo para alerta visual global
            'filters' => $request->only(['search', 'solo_stock_bajo']),
        ]);
    }

    public function kardex(Producto $producto): Response
    {
        $movimientos = $producto->movimientos()
            ->with(['user:id,name', 'origen'])
            ->paginate(15);

        return Inertia::render('Productos/Kardex', [
            'producto' => $producto->load('unidad'),
            'movimientos' => $movimientos,
        ]);
    }

    public function store(ProductoRequest $request): RedirectResponse
    {
        $this->productoService->create(
            $request->validated()
        );

        return redirect()
            ->route('productos.index')
            ->with(
                'success',
                'Producto creado exitosamente.'
            );
    }

    public function update(
        ProductoRequest $request,
        Producto $producto
    ): RedirectResponse {
        $this->productoService->update(
            $producto,
            $request->validated()
        );

        return redirect()
            ->route('productos.index')
            ->with(
                'success',
                'Producto actualizado exitosamente.'
            );
    }

    // Método para el switch/toggle
    public function toggleEstado(Producto $producto): RedirectResponse
    {
        $productoActualizado = $this->productoService->toggleEstado($producto);

        $mensaje = $productoActualizado->activo
            ? 'Producto activado exitosamente.'
            : 'Producto inactivado exitosamente.';

        return redirect()
            ->back()
            ->with('success', $mensaje);
    }

    // Borrado directo con mensaje explicativo si falla por restricción de BD
    public function destroy(Producto $producto): RedirectResponse
    {
        try {
            $this->productoService->delete($producto);

            return redirect()
                ->route('productos.index')
                ->with('success', 'Producto eliminado exitosamente.');
        } catch (\Exception $e) {
            return redirect()
                ->back()
                ->with('error', 'No se puede eliminar el producto porque tiene historial registrado. Desactívalo mediante el switch.');
        }
    }
}
