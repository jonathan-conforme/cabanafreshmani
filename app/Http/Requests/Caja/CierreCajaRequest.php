<?php
namespace App\Http\Requests\Caja;

use Illuminate\Foundation\Http\FormRequest;

class CierreCajaRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'monto_cierre' => ['required', 'numeric', 'min:0'],
            'observaciones' => ['nullable', 'string', 'max:500'],
        ];
    }
}
