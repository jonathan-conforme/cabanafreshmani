<?php

namespace App\Http\Controllers\Proveedor;

use App\Http\Requests\ProveedorRequest;
use App\Models\Proveedor;
use App\Services\ProveedorService;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;

class ProveedorController extends Controller
{
    public function __construct(protected ProveedorService $proveedorService) {}
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $proveedores = $this->proveedorService->getPaginated(10, $request->get('search'));
        return view('proveedores.index', compact('proveedores'));
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
        $this->proveedorService->delete($proveedor);
        return redirect()->route('proveedores.index')->with('success', 'Proveedor eliminado con éxito.');
    }
}
