<?php

namespace App\Services\Cliente;

use App\Models\Cliente;
use Illuminate\Pagination\LengthAwarePaginator;

class ClienteService
{
    public function getPaginated(
        int $perPage = 15,
        ?string $search = null
    ): LengthAwarePaginator {
        return Cliente::select([
                'id',
                'nombre',
                'apellido',
                'identificacion',
                'telefono',
                'email',
                'limite_credito'
            ])
            ->when($search, function ($query, $search) {
                $query->where(function ($query) use ($search) {
                    $query->where('nombre', 'like', "%{$search}%")
                        ->orWhere('apellido', 'like', "%{$search}%")
                        ->orWhere('identificacion', 'like', "%{$search}%");
                });
            })
            ->latest()
            ->paginate($perPage);
    }

    public function create(array $data): Cliente
    {
        return Cliente::create($data);
    }

    public function update(Cliente $cliente, array $data): bool
    {
        return $cliente->update($data);
    }

    public function delete(Cliente $cliente): bool
    {
        return $cliente->delete();
    }
}
