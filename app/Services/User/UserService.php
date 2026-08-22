<?php

namespace App\Services\User;

use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class UserService
{
    /**
     * Crear usuario y asignar rol.
     */
    public function createUser(array $data): User
    {
        return DB::transaction(function () use ($data) {
            $user = User::create([
                'name' => $data['name'],
                'email' => $data['email'],
                'password' => Hash::make($data['password']),
            ]);

            $user->assignRole($data['role']);

            if (!empty($data['permissions'])) {
                $user->syncPermissions($data['permissions']);
            }

            return $user;
        });
    }

    /**
     * Actualizar usuario y sincronizar rol.
     */
    public function updateUser(User $user, array $data): User
    {
        return DB::transaction(function () use ($user, $data) {
            $user->update([
                'name' => $data['name'],
                'email' => $data['email'],
            ]);

            $user->syncRoles($data['role']);
            // Sincroniza permisos directos 
            $user->syncPermissions($data['permissions'] ?? []);

            return $user->fresh();
        });
    }

    /**
     * Eliminar usuario.
     */
    public function deleteUser(User $user): bool
    {
        return (bool) $user->delete();
    }

    /**
     * Restablecer contraseña.
     */
    public function resetPassword(User $user, string $password): bool
    {
        return $user->update([
            'password' => Hash::make($password),
        ]);
    }
}
