<?php
namespace App\Http\Requests\Caja;

use Illuminate\Foundation\Http\FormRequest;

class AperturaCajaRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'monto_apertura' => ['required', 'numeric', 'min:0'],
        ];
    }
}
