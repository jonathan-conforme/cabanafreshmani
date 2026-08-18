<?php

namespace App\Http\Requests\Compra;

use Illuminate\Foundation\Http\FormRequest;

class StoreCompraRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'proveedor_id' => [
                'required',
                'exists:proveedores,id',
            ],

            'tipo_pago' => [
                'required',
                'in:contado,credito',
            ],

            'metodo_pago' => [
                'required',
                'in:efectivo,transferencia,tarjeta',
            ],

            'monto_pagado' => [
                'nullable',
                'numeric',
                'min:0',
            ],

            'fecha_vencimiento' => [
                'nullable',
                'date',
                'required_if:tipo_pago,credito',
            ],

            'fecha_compra' => [
                'nullable',
                'date',
            ],

            'factura' => [
                'nullable',
                'file',
                'mimes:pdf,jpg,jpeg,png',
                'max:2048',
            ],

            'detalles' => [
                'required',
                'array',
                'min:1',
            ],

            'detalles.*.producto_id' => [
                'required',
                'exists:productos,id',
            ],

            'detalles.*.cantidad' => [
                'required',
                'numeric',
                'gt:0',
            ],

            'detalles.*.costo_unitario' => [
                'required',
                'numeric',
                'gte:0',
            ],
        ];
    }

    public function messages(): array
    {
        return [
            'proveedor_id.required' => 'Debes seleccionar un proveedor.',
            'proveedor_id.exists' => 'El proveedor seleccionado no existe.',

            'detalles.required' => 'Debes agregar al menos un producto.',
            'detalles.min' => 'Debes agregar al menos un producto.',

            'detalles.*.producto_id.required' => 'Debes seleccionar un producto.',
            'detalles.*.producto_id.exists' => 'El producto seleccionado no existe.',

            'detalles.*.cantidad.required' => 'La cantidad es obligatoria.',
            'detalles.*.cantidad.gt' => 'La cantidad debe ser mayor a cero.',

            'detalles.*.costo_unitario.required' => 'El costo unitario es obligatorio.',
            'detalles.*.costo_unitario.gte' => 'El costo no puede ser negativo.',

            'factura.file' => 'La factura debe ser un archivo válido.',
            'factura.mimes' => 'La factura debe ser PDF, JPG, JPEG o PNG.',
            'factura.max' => 'La factura no puede superar los 2 MB.',

            'fecha_vencimiento.required_if' =>
                'La fecha de vencimiento es obligatoria para compras a crédito.',
        ];
    }
}
