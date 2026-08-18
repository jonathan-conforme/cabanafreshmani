<?php

namespace App\Http\Requests\UnidadMedida;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UnidadMedidaRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        $unidadId = $this->route('unidad_medida')?->id;

        return [
            'nombre' => [
                'required',
                'string',
                'max:50',
                Rule::unique('unidades_medida', 'nombre')->ignore($unidadId),
            ],

            'simbolo' => [
                'required',
                'string',
                'max:10',
                Rule::unique('unidades_medida', 'simbolo')->ignore($unidadId),
            ],
        ];
    }

    public function messages(): array
    {
        return [
            'nombre.required' => 'El nombre de la unidad es obligatorio.',
            'nombre.max' => 'El nombre no puede superar los 50 caracteres.',
            'nombre.unique' => 'Esta unidad de medida ya existe.',

            'simbolo.required' => 'El símbolo es obligatorio.',
            'simbolo.max' => 'El símbolo no puede superar los 10 caracteres.',
            'simbolo.unique' => 'Este símbolo ya está registrado.',
        ];
    }
}
