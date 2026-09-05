<?php

namespace App\Http\Requests\Producto;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ProductoRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $productoId = $this->route('producto')?->id;

        return [
            'unidad_id' => [
                'required',
                'integer',
                'exists:unidades_medida,id',
            ],

            'codigo_barras' => [
                'nullable',
                'string',
                'max:100',
                Rule::unique('productos', 'codigo_barras')
                    ->ignore($productoId),
            ],

            'nombre' => [
                'required',
                'string',
                'max:255',
            ],

            'es_granel' => [
                'required',
                'boolean',
            ],

            'precio_compra' => [
                'required',
                'numeric',
                'min:0',
            ],

            'precio_venta' => [
                'required',
                'numeric',
                'min:0',
            ],

            'stock' => [
                'required',
                'numeric',
                'min:0',
            ],

            'stock_minimo' => [
                'required',
                'numeric',
                'min:0',
            ],
            'permite_unidad_mayor' => [
                'sometimes',
                'boolean'
            ],

            'nombre_unidad_mayor' => [
                'nullable',
                'string',
                'max:50'
            ],

            'factor_conversion' => [
                'nullable',
                'numeric',
                'min:0'
            ],

            'precio_unidad_mayor' => [
                'nullable',
                'numeric',
                'min:0'
            ],

            'precio_compra_unidad_mayor' => [
                'nullable',
                'numeric',
                'min:0'
            ],

            'activo' => [
                'sometimes',
                'boolean'],
        ];
    }
}
