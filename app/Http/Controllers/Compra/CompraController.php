<?php

namespace App\Http\Controllers\Compra;

use App\Http\Requests\Compra\StoreCompraRequest;
use Illuminate\Support\Facades\Storage;
use App\Services\Compra\CompraService;
use Illuminate\Http\RedirectResponse;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Proveedor;
use App\Models\Producto;
use App\Models\Compra;
use Inertia\Response;
use Inertia\Inertia;

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

    public function registrarPago(Request $request, Compra $compra): RedirectResponse
    {
        $saldoPendiente = $compra->total - $compra->monto_pagado;

        $validated = $request->validate([
            'monto' => ['required', 'numeric', 'gt:0', 'max:'.$saldoPendiente],
            'metodo_pago' => ['required', 'in:efectivo,transferencia'],
            'fecha_pago' => ['nullable', 'date'],
            'observacion' => ['nullable', 'string', 'max:255'],
        ]);

        $this->compraService->registrarPago($compra, $validated);

        return back()->with('info', 'Abono registrado correctamente.');
    }

    public function destroy(Compra $compra)
{
    try {
        $this->compraService->deletePurchase($compra);

        return redirect()->route('compras.index')->with('success', 'Compra e inventario revertidos con éxito.');
    } catch (\Throwable $e) {
        return redirect()->back()->with('error', 'Error al eliminar: ' . $e->getMessage());
    }
}
}
