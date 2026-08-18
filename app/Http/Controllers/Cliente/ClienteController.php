<?php

namespace App\Http\Controllers\Cliente;

use App\Http\Controllers\Controller;
use App\Http\Requests\Cliente\ClienteRequest;
use App\Models\Cliente;
use App\Services\Cliente\ClienteService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ClienteController extends Controller
{
    public function __construct(
        protected ClienteService $clienteService
    ) {}

    public function index(Request $request): Response
    {
        return Inertia::render('Clientes/Index', [
            'clientes' => $this->clienteService->getPaginated(
                15,
                $request->get('search')
            ),
            'filters' => $request->only('search'),
        ]);
    }

    public function create()
    {
        // Ya no necesitamos esta vista si utilizamos modal.
        return redirect()->route('clientes.index');
    }

    public function store(ClienteRequest $request)
    {
        $this->clienteService->create($request->validated());

        return redirect()
            ->route('clientes.index')
            ->with('success', 'Cliente creado con éxito.');
    }

    public function show(string $id)
    {
        //
    }

    public function edit(string $id)
    {
        // Ya no necesitamos esta vista si utilizamos modal.
        return redirect()->route('clientes.index');
    }

    public function update(
        ClienteRequest $request,
        Cliente $cliente
    ) {
        $this->clienteService->update(
            $cliente,
            $request->validated()
        );

        return redirect()
            ->route('clientes.index')
            ->with('success', 'Cliente actualizado con éxito.');
    }

    public function destroy(Cliente $cliente)
    {
        $this->clienteService->delete($cliente);

        return redirect()
            ->route('clientes.index')
            ->with('success', 'Cliente eliminado con éxito.');
    }
}
