import ApplicationLogo from '@/Components/ApplicationLogo';
import Dropdown from '@/Components/Dropdown';
import NavLink from '@/Components/NavLink';
import ResponsiveNavLink from '@/Components/ResponsiveNavLink';
import { Link, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { route } from "ziggy-js";

export default function AuthenticatedLayout({ header, children }) {
    const user = usePage().props.auth.user;
    
    // 1. Manejo seguro de roles y permisos
    const roles = user?.roles || [];
    const permissions = user?.permissions || [];

    // 2. Funciones helper declaradas (resuelven el ReferenceError)
    const hasRole = (role) => roles.includes(role);
    const hasAnyRole = (rolesArray) => rolesArray.some((r) => roles.includes(r));
    const can = (permission) => permissions.includes(permission);

    // 3. Configuración visual del Badge de Rol
    const roleBadges = {
        administrador: {
            label: 'Administrador',
            bg: 'bg-purple-100 text-purple-700 border-purple-200',
        },
        vendedor: {
            label: 'Vendedor',
            bg: 'bg-blue-100 text-blue-700 border-blue-200',
        },
        vendedor_fritada: {
            label: 'Vendedor Fritada',
            bg: 'bg-amber-100 text-amber-800 border-amber-200',
        },
    };

    const currentRole = roles[0];
    const badgeConfig = roleBadges[currentRole] || {
        label: currentRole?.replace('_', ' ') || 'Usuario',
        bg: 'bg-gray-100 text-gray-700 border-gray-200',
    };

    const [showingNavigationDropdown, setShowingNavigationDropdown] = useState(false);

    return (
        <div className="min-h-screen bg-gray-100">
            <nav className="border-b border-gray-100 bg-white">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex h-16 justify-between">
                        <div className="flex">
                            {/* Logo */}
                            <div className="flex shrink-0 items-center">
                                <Link href="/">
                                    <ApplicationLogo className="block h-9 w-auto fill-current text-gray-800" />
                                </Link>
                            </div>

                            {/* Navegación Desktop */}
                            <div className="hidden space-x-8 sm:-my-px sm:ms-10 sm:flex">
                                <NavLink
                                    href={route('dashboard')}
                                    active={route().current('dashboard')}
                                >
                                    Dashboard
                                </NavLink>

                                {hasAnyRole(['vendedor', 'vendedor_fritada', 'administrador']) && (
                                    <NavLink
                                        href="#"
                                        active={route().current('ventas.*')}
                                    >
                                        Ventas
                                    </NavLink>
                                )}

                                {hasRole('administrador') && (
                                    <NavLink
                                        href={route('users.create')}
                                        active={route().current('users.*')}
                                    >
                                        Usuarios
                                    </NavLink>
                                    
                                )}
                            </div>
                        </div>

                        {/* Dropdown de usuario */}
                        <div className="hidden sm:ms-6 sm:flex sm:items-center">
                            <div className="relative ms-3">
                                <Dropdown>
                                    <Dropdown.Trigger>
                                        <span className="inline-flex rounded-md">
                                            <button
                                                type="button"
                                                className="inline-flex items-center gap-2 rounded-md border border-transparent bg-white px-3 py-2 text-sm font-medium leading-4 text-gray-600 transition duration-150 ease-in-out hover:text-gray-800 focus:outline-none"
                                            >
                                                <span>{user.name}</span>

                                                {currentRole && (
                                                    <span className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-semibold uppercase tracking-wider ${badgeConfig.bg}`}>
                                                        {badgeConfig.label}
                                                    </span>
                                                )}

                                                <svg
                                                    className="-me-0.5 ms-1 h-4 w-4"
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    viewBox="0 0 20 20"
                                                    fill="currentColor"
                                                >
                                                    <path
                                                        fillRule="evenodd"
                                                        d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                                        clipRule="evenodd"
                                                    />
                                                </svg>
                                            </button>
                                        </span>
                                    </Dropdown.Trigger>

                                    <Dropdown.Content>
                                        <Dropdown.Link href={route('profile.edit')}>
                                            Perfil
                                        </Dropdown.Link>
                                        <Dropdown.Link
                                            href={route('logout')}
                                            method="post"
                                            as="button"
                                        >
                                            Cerrar Sesión
                                        </Dropdown.Link>
                                    </Dropdown.Content>
                                </Dropdown>
                            </div>
                        </div>

                        {/* Menú Mobile */}
                        <div className="-me-2 flex items-center sm:hidden">
                            <button
                                onClick={() => setShowingNavigationDropdown((prev) => !prev)}
                                className="inline-flex items-center justify-center rounded-md p-2 text-gray-400 transition duration-150 ease-in-out hover:bg-gray-100 hover:text-gray-500 focus:bg-gray-100 focus:text-gray-500 focus:outline-none"
                            >
                                <svg className="h-6 w-6" stroke="currentColor" fill="none" viewBox="0 0 24 24">
                                    <path
                                        className={!showingNavigationDropdown ? 'inline-flex' : 'hidden'}
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M4 6h16M4 12h16M4 18h16"
                                    />
                                    <path
                                        className={showingNavigationDropdown ? 'inline-flex' : 'hidden'}
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M6 18L18 6M6 6l12 12"
                                    />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Navegación Responsive */}
                <div className={(showingNavigationDropdown ? 'block' : 'hidden') + ' sm:hidden'}>
                    <div className="space-y-1 pb-3 pt-2">
                        <ResponsiveNavLink
                            href={route('dashboard')}
                            active={route().current('dashboard')}
                        >
                            Dashboard
                        </ResponsiveNavLink>

                        {hasAnyRole(['vendedor', 'vendedor_fritada', 'administrador']) && (
                            <ResponsiveNavLink href="#" active={route().current('ventas.*')}>
                                Ventas
                            </ResponsiveNavLink>
                        )}

                        {hasRole('administrador') && (
                            <ResponsiveNavLink href="#" active={route().current('users.*')}>
                                Usuarios
                            </ResponsiveNavLink>
                        )}
                    </div>

                    <div className="border-t border-gray-200 pb-1 pt-4">
                        <div className="px-4">
                            <div className="text-base font-medium text-gray-800">
                                {user.name}
                            </div>
                            <div className="text-sm font-medium text-gray-500">
                                {user.email}
                            </div>
                            {currentRole && (
                                <span className={`mt-2 inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-semibold uppercase tracking-wider ${badgeConfig.bg}`}>
                                    {badgeConfig.label}
                                </span>
                            )}
                        </div>

                        <div className="mt-3 space-y-1">
                            <ResponsiveNavLink href={route('profile.edit')}>
                                Perfil
                            </ResponsiveNavLink>
                            <ResponsiveNavLink
                                method="post"
                                href={route('logout')}
                                as="button"
                            >
                                Cerrar Sesión
                            </ResponsiveNavLink>
                        </div>
                    </div>
                </div>
            </nav>

            {header && (
                <header className="bg-white shadow">
                    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                        {header}
                    </div>
                </header>
            )}

            <main>{children}</main>
        </div>
    );
}