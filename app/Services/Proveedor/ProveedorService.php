<?php

namespace App\Services\Proveedor;

use App\Models\Proveedor;
use Illuminate\Pagination\LengthAwarePaginator;

class ProveedorService
{
    public function getPaginated(int $perPage = 15, ?string $search = null): LengthAwarePaginator
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

    public function destroy(Proveedor $proveedor): bool
    {
        return (bool) $proveedor->delete();
    }
}
