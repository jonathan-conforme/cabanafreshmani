<?php

namespace App\Services;

use App\Models\Proveedor;
use Illuminate\Pagination\LengthAwarePaginator;

class ProveedorService
{
    public function getPaginated(int $perPage = 10, ?string $search = null): LengthAwarePaginator
    {
        return Proveedor::select(['id', 'nombre', 'contacto', 'telefono', 'email'])
            ->when($search, function ($query, $search) {
                $query->where('nombre', 'like', "%{$search}%");
            })
            ->latest()
            ->paginate($perPage);
    }

    public function create(array $data): Proveedor
    {
        return Proveedor::create($data);
    }

    public function update(Proveedor $proveedor, array $data): bool
    {
        return $proveedor->update($data);
    }

    public function delete(Proveedor $proveedor): bool
    {
        return $proveedor->delete();
    }
}
