<?php

namespace App\Http\Controllers\UnidadMedida;

use App\Http\Controllers\Controller;
use App\Http\Requests\UnidadMedida\UnidadMedidaRequest;
use App\Models\UnidadMedida;
use App\Services\UnidadMedida\UnidadMedidaService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class UnidadMedidaController extends Controller
{
    public function __construct(
        protected UnidadMedidaService $unidadMedidaService
    ) {}

    public function index(Request $request): Response
    {
        $unidades = $this->unidadMedidaService->getPaginated(
            15,
            $request->input('search')
        );

        return Inertia::render('UnidadesMedida/Index', [
            'unidades' => $unidades,
            'filters' => [
                'search' => $request->input('search', ''),
            ],
        ]);
    }

    public function store(
        UnidadMedidaRequest $request
    ): RedirectResponse {
        $this->unidadMedidaService->create(
            $request->validated()
        );

        return redirect()
            ->route('unidad-medidas.index')
            ->with(
                'success',
                'Unidad de medida creada correctamente.'
            );
    }

    public function update(
        UnidadMedidaRequest $request,
        UnidadMedida $unidadMedida
    ): RedirectResponse {
        $this->unidadMedidaService->update(
            $unidadMedida,
            $request->validated()
        );

        return redirect()
            ->route('unidad-medidas.index')
            ->with(
                'success',
                'Unidad de medida actualizada correctamente.'
            );
    }

    public function destroy(
        UnidadMedida $unidadMedida
    ): RedirectResponse {
        $this->unidadMedidaService->delete($unidadMedida);

        return redirect()
            ->route('unidad-medidas.index')
            ->with(
                'success',
                'Unidad de medida eliminada correctamente.'
            );
    }
}
