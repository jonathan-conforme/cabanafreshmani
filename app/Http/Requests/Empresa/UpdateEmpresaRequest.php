<?php

namespace App\Http\Requests\Empresa;

use Illuminate\Foundation\Http\FormRequest;

class UpdateEmpresaRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'razon_social' => ['required', 'string', 'max:300'],
            'nombre_comercial' => ['nullable', 'string', 'max:300'],
            'ruc' => ['required', 'string', 'size:13'],
            'telefono' => ['nullable', 'string', 'max:20'],
            'email' => ['nullable', 'email', 'max:255'],
            'direccion_matriz' => ['required', 'string'],
            'direccion_establecimiento' => ['nullable', 'string'],
            'obligado_contabilidad' => ['required', 'boolean'],
            'contribuyente_especial' => ['nullable', 'string', 'max:50'],
            'ambiente_sri' => ['required', 'in:1,2'],
            'leyenda_ticket' => ['nullable', 'string', 'max:255'],
        ];
    }
}
