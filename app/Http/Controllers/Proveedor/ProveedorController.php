<?php

namespace App\Http\Controllers\Proveedor;

use App\Http\Requests\Proveedor\ProveedorRequest;
use App\Models\Proveedor;
use App\Services\Proveedor\ProveedorService;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Inertia\Inertia;
use Inertia\Response;

class ProveedorController extends Controller
{
    public function __construct(protected ProveedorService $proveedorService) {}
    /**
     * Display a listing of the resource.
     */
   public function index(Request $request): Response
    {
        return Inertia::render('Proveedores/Index', [
            'proveedores' => $this->proveedorService->getPaginated(15, $request->get('search')),
            'filters' => $request->only('search')
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
   public function store(ProveedorRequest $request)
    {
        $this->proveedorService->create($request->validated());
        return redirect()->route('proveedores.index')->with('success', 'Proveedor creado con éxito.');
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(ProveedorRequest $request, Proveedor $proveedor)
    {
        $this->proveedorService->update($proveedor, $request->validated());
        return redirect()->route('proveedores.index')->with('success', 'Proveedor actualizado con éxito.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Proveedor $proveedor)
    {
        $this->proveedorService->destroy($proveedor);
        return redirect()->route('proveedores.index')->with('success', 'Proveedor eliminado con éxito.');
    }
}
