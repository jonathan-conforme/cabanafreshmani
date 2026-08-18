<?php

namespace App\Services\UnidadMedida;

use App\Models\UnidadMedida;
use Illuminate\Pagination\LengthAwarePaginator;

class UnidadMedidaService
{
    public function getPaginated(
        int $perPage = 15,
        ?string $search = null
    ): LengthAwarePaginator {
        return UnidadMedida::query()
            ->select([
                'id',
                'nombre',
                'simbolo',
                'created_at',
            ])
            ->when($search, function ($query, $search) {
                $query->where(function ($query) use ($search) {
                    $query->where('nombre', 'like', "%{$search}%")
                        ->orWhere('simbolo', 'like', "%{$search}%");
                });
            })
            ->latest()
            ->paginate($perPage)
            ->withQueryString();
    }

    public function create(array $data): UnidadMedida
    {
        return UnidadMedida::create($data);
    }

    public function update(
        UnidadMedida $unidadMedida,
        array $data
    ): bool {
        return $unidadMedida->update($data);
    }

    public function delete(UnidadMedida $unidadMedida): bool
    {
        return $unidadMedida->delete();
    }
}
