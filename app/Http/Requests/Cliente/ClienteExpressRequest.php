<?php namespace App\Http\Requests\Cliente;

use Illuminate\Foundation\Http\FormRequest;

class ClienteExpressRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'nombre' => ['required', 'string', 'max:255'],
            'apellido' => ['nullable', 'string', 'max:255'],
            'identificacion' => ['required', 'string', 'max:20', 'unique:clientes,identificacion'],
            'telefono' => ['nullable', 'string', 'max:20'],
        ];
    }
}
