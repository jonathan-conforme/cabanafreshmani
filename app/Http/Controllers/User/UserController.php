<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Http\Requests\User\StoreUserRequest;
use App\Models\User;
use App\Services\User\UserService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class UserController extends Controller
{
    public function __construct(
        protected UserService $userService
    ) {}

    public function index(): Response
    {
        return Inertia::render('Users/Index', [
            'users' => User::with(['roles', 'Permissions'])->latest()->get(),
            'roles' => Role::pluck('name'),
            'permissions' => Permission::pluck('name'), // Envía la lista completa de permisos
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Users/Create', [
            'roles' => Role::pluck('name'),
            'permissions' => Permission::pluck('name'),
        ]);
    }

    public function store(StoreUserRequest $request): RedirectResponse
    {
        $this->userService->createUser($request->validated());

        return redirect()
            ->route('users.index')
            ->with('success', 'Empleado creado exitosamente.');
    }

    public function edit(User $user): Response
    {
        return Inertia::render('Users/Edit', [
            'user' => $user->load(['roles', 'permissions']),
            'roles' => Role::pluck('name'),
            'permissions' => Permission::Pluck('name'),

        ]);
    }

    public function update(StoreUserRequest $request, User $user): RedirectResponse
    {
        $data = $request->validated();

        if (empty($data['password'])) {
            unset($data['password']);
        } else {
            $data['password'] = Hash::make($data['password']);
        }

        unset($data['password_confirmation']);

        $user->update([
            'name' => $data['name'],
            'email' => $data['email'],
            ...(! empty($data['password'])
                ? ['password' => $data['password']]
                : []),
        ]);

        $user->syncRoles($data['role']);

        // Sincronizar permisos directos (limpia o asigna los seleccionados)
        $user->syncPermissions($data['permissions'] ?? []);

        return redirect()
            ->route('users.index')
            ->with('success', 'Empleado actualizado exitosamente.');
    }
}
