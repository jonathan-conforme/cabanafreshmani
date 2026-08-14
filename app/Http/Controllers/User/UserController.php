<?php
namespace App\Http\Controllers\User;

use App\Http\Requests\User\StoreUserRequest;
use App\Services\User\UserService;
use Inertia\Inertia;
use App\Http\Controllers\Controller;
use Inertia\Response;
use Illuminate\Http\RedirectResponse;
use Spatie\Permission\Models\Role;
use App\Models\User;


class UserController extends Controller
{
    public function __construct(
        protected UserService $userService
    ) {}

    public function index(): Response
    {
        return Inertia::render('Users/Index', [
            'users' => User::with('roles')->latest()->get(),
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
        // La validación ya pasó implícitamente en el Request
        $this->userService->createUser($request->validated());

        return redirect()->route('users.create')->with('success', 'Empleado creado exitosamente.');
    }
    public function edit(User $user): Response
{
    return Inertia::render('Users/Edit', [
        'user'  => $user->load('roles'),
        'roles' => Role::pluck('name'),
    ]);
}

    public function update(StoreUserRequest $request, User $user): RedirectResponse
    {
        $user->update($request->validated());
        $user->syncRoles($request->input('role'));

        return redirect()->route('users.index')->with('success', 'Empleado actualizado exitosamente.');
    }

    public function destroy(User $user): RedirectResponse
    {
        $user->delete();

        return redirect()->route('users.index')->with('success', 'Empleado eliminado exitosamente.');
    }
}
