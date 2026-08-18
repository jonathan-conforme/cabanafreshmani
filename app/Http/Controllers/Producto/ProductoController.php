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
            ->when(
                $request->search,
                function ($query, $search) {
                    $query
                        ->where('nombre', 'like', "%{$search}%")
                        ->orWhere(
                            'codigo_barras',
                            'like',
                            "%{$search}%"
                        );
                }
            )
            ->latest()
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('Productos/Index', [
            'productos' => $productos,
            'unidades' => UnidadMedida::orderBy('nombre')->get(),
            'filters' => [
                'search' => $request->search,
            ],
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

    public function destroy(Producto $producto): RedirectResponse
    {
        $this->productoService->delete($producto);

        return redirect()
            ->route('productos.index')
            ->with(
                'success',
                'Producto eliminado exitosamente.'
            );
    }
}
