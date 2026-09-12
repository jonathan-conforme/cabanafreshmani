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

        // 1. Proteger al Administrador Principal (ID 1) de perder su rol
        if ($user->id === 1 && $data['role'] !== 'administrador') {
            return back()->with('error', 'El administrador principal no puede perder su rol.');
        }

        // 2. Bloquear degradación si es el único administrador del sistema
        if ($user->hasRole('administrador') && $data['role'] !== 'administrador') {
            if (User::role('administrador')->count() <= 1) {
                return back()->with('error', 'No puedes quitar el rol al único administrador que queda en el sistema.');
            }
        }

        $this->userService->updateUser($user, $data);

        return redirect()
            ->route('users.index')
            ->with('success', 'Empleado actualizado exitosamente.');
    }

    public function destroy(User $user): RedirectResponse
    {
        // 1. Evitar auto-eliminación
        if ($user->is(auth()->user())) {
            return back()->with('error', 'No puedes eliminar tu propia cuenta desde aquí.');
        }

        // 2. Protege al Administrador ID 1
        if ($user->id === 1) {
            return back()->with('error', 'El administrador principal del sistema no puede ser eliminado.');
        }

        // 3. Evita eliminar al último administrador
        if ($user->hasRole('administrador') && User::role('administrador')->count() <= 1) {
            return back()->with('error', 'No puedes eliminar al único administrador. Crea otro primero.');
        }

        $this->userService->deleteUser($user);

        return redirect()
            ->route('users.index')
            ->with('success', 'Empleado eliminado exitosamente.');
    }
}
