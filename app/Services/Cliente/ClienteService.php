<?php

namespace App\Services\Cliente;

use App\Models\Cliente;
use Illuminate\Pagination\LengthAwarePaginator;

class ClienteService
{
    public function getPaginated(int $perPage = 10, ?string $search = null): LengthAwarePaginator
    {
        return Cliente::select(['id', 'nombre', 'identificacion', 'telefono', 'email', 'limite_credito'])
            ->when($search, function ($query, $search) {
                $query->where('nombre', 'like', "%{$search}%")
                    ->orWhere('identificacion', 'like', "%{$search}%");
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
