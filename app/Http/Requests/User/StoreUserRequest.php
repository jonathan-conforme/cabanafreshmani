<?php

namespace App\Http\Requests\User;

use App\Models\User;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;


class StoreUserRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->hasRole('administrador');
    }

    public function rules(): array
    {
       // Detectar si estamos editando un usuario existente o creando uno nuevo
        $user = $this->route('user');
        $isUpdate = $user !== null;

        return [
            'name' => [
                'required',
                'string',
                'max:255',
            ],

            'email' => [
                'required',
                'string',
                'lowercase',
                'email',
                'max:255',
                Rule::unique('users', 'email')->ignore($user?->id ?? $user),
            ],

            // En edición la contraseña pasa a ser opcional (nullable)
            'password' => [
                $isUpdate ? 'nullable' : 'required',
                'confirmed',
                Password::defaults(),
            ],

            'role' => [
                'required',
                'string',
                'exists:roles,name',
            ],

            // Corregido: array de permisos en minúscula
            'permissions' => [
                'nullable',
                'array',
            ],

            'permissions.*' => [
                'string',
                'exists:permissions,name',
            ],
        ];
    }
}
