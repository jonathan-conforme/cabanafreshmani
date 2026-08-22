<?php
namespace App\Http\Requests\Venta;

use Illuminate\Foundation\Http\FormRequest;

class StoreVentaRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'cliente_id' => ['required', 'exists:clientes,id'],
            'metodo_pago' => ['required', 'in:efectivo,transferencia,credito'],
            'descuento' => ['nullable', 'numeric', 'min:0'],
            'pago_con' => ['nullable', 'numeric', 'min:0'],
            'vuelto' => ['nullable', 'numeric', 'min:0'],
            'items' => ['required', 'array', 'min:1'],
            'items.*.producto_id' => ['required', 'exists:productos,id'],
            'items.*.tipo_venta' => ['required', 'in:unidad,peso,monto_exacto'],
            'items.*.cantidad' => ['required', 'numeric', 'gt:0'],
            'items.*.precio_unitario' => ['required', 'numeric', 'min:0'],
            'items.*.subtotal' => ['required', 'numeric', 'min:0'],
        ];
    }
}
