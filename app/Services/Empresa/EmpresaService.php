<?php

namespace App\Services\Empresa;

use App\Models\Empresa;

class EmpresaService
{
    /**
     * Obtiene el registro único de la empresa o crea los datos iniciales por defecto.
     */
    public function obtenerEmpresa(): Empresa
    {
        return Empresa::firstOrCreate([], [
            'razon_social' => 'CABANA FRESHMANI',
            'nombre_comercial' => 'Cabana Fresh',
            'ruc' => '1790000000001',
            'direccion_matriz' => 'Matriz Central',
            'telefono' => '0999999999',
            'leyenda_ticket' => '¡Gracias por su preferencia!',
            'ambiente_sri' => '1',
            'obligado_contabilidad' => false,
        ]);
    }

    /**
     * Actualiza la información comercial y fiscal de la empresa.
     */
    public function actualizarEmpresa(Empresa $empresa, array $data): Empresa
    {
        $empresa->update($data);
        return $empresa;
    }
}
