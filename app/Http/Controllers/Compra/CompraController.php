<?php

namespace App\Http\Controllers\Compra;

use App\Http\Controllers\Controller;
use App\Http\Requests\Compra\StoreCompraRequest;
use App\Models\Compra;
use App\Models\Producto;
use App\Models\Proveedor;
use App\Services\Compra\CompraService;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class CompraController extends Controller
{
    public function __construct(
        protected CompraService $compraService
    ) {}

    public function index(): Response
    {
        return Inertia::render('Compras/Index', [
            'compras' => Compra::with([
                'proveedor',
                'user',
                'detalles.producto',
            ])
                ->latest()
                ->paginate(15),
                'proveedores' => Proveedor::orderBy('nombre')->get(),

            'productos' => Producto::with('unidad')
                ->orderBy('nombre')
                ->get(),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Compras/Create', [
            'proveedores' => Proveedor::orderBy('nombre')->get(),
            'productos' => Producto::with('unidad')
                ->orderBy('nombre')
                ->get(),
        ]);
    }

    public function store(
        StoreCompraRequest $request
    ): RedirectResponse {

        $this->compraService->createPurchase(
            $request->validated(),
            $request->file('factura')
        );

        return redirect()
            ->route('compras.index')
            ->with(
                'success',
                'Compra registrada correctamente.'
            );
    }

    public function show(Compra $compra): Response
    {
        $compra->load([
            'proveedor',
            'user',
            'detalles.producto.unidad',
        ]);

        return Inertia::render(
            'Compras/Show',
            [
                'compra' => $compra,
            ]
        );
    }
}
