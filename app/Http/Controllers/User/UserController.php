<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Http\Requests\User\StoreUserRequest;
use App\Http\Requests\User\UpdateUserRequest;
use App\Services\User\UserService;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Permission\Models\Role;
use Illuminate\Support\Facades\Hash;

class UserController extends Controller
{
    public function __construct(
        protected UserService $userService
    ) {}

    public function index(): Response
    {
        return Inertia::render('Users/Index', [
            'users' => User::with('roles')->latest()->get(),
            'roles' => Role::pluck('name'),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Users/Create', [
            'roles' => Role::pluck('name'),
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
            'user' => $user->load('roles'),
            'roles' => Role::pluck('name'),
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
        ...(!empty($data['password'])
            ? ['password' => $data['password']]
            : []),
    ]);

    $user->syncRoles($data['role']);

    return redirect()
        ->route('users.index')
        ->with('success', 'Empleado actualizado exitosamente.');
}

    public function destroy(User $user): RedirectResponse
    {
        $this->userService->deleteUser($user);

        return redirect()
            ->route('users.index')
            ->with('success', 'Empleado eliminado exitosamente.');
    }
}
