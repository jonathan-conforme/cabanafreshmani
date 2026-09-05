<?php

namespace App\Http\Controllers\Configuracion;

use App\Http\Controllers\Controller;
use App\Http\Requests\Empresa\UpdateEmpresaRequest;
use App\Models\Empresa;
use App\Services\Empresa\EmpresaService;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class EmpresaController extends Controller
{
    public function __construct(
        protected EmpresaService $empresaService
    ) {}

    /**
     * Muestra la vista con el formulario de configuración de la empresa.
     */
    public function edit(): Response
    {
        $empresa = $this->empresaService->obtenerEmpresa();

        return Inertia::render('Empresa/Edit', [
            'empresa' => $empresa,
        ]);
    }

    /**
     * Actualiza los datos comerciales y fiscales de la empresa.
     */
    public function update(UpdateEmpresaRequest $request, Empresa $empresa): RedirectResponse
    {
        $this->empresaService->actualizarEmpresa($empresa, $request->validated());

        return redirect()->back()->with('success', 'Datos de la empresa actualizados correctamente.');
    }
}
