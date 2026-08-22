import { Transition } from '@headlessui/react';
import { Link, usePage } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';
import { toast } from '@/Components/SweetAlert';
import { route } from "ziggy-js";

export default function AuthenticatedLayout({ header, children }) {
    const user = usePage().props.auth.user;
    const { total_stock_bajo } = usePage().props;
    const { flash } = usePage().props;

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
            bg: 'bg-teal-50 text-teal-700 border-teal-200',
        },
        vendedor: {
            label: 'Vendedor',
            bg: 'bg-orange-50 text-orange-700 border-orange-200',
        },
        vendedor_fritada: {
            label: 'Vendedor Fritada',
            bg: 'bg-amber-100 text-amber-800 border-amber-200',
        },
    };

    const currentRole = roles[0];
    const badgeConfig = roleBadges[currentRole] || {
        label: currentRole?.replace('_', ' ') || 'Usuario',
        bg: 'bg-stone-100 text-stone-600 border-stone-200',
    };

    const [showingNavigationDropdown, setShowingNavigationDropdown] = useState(false);
    const [showingUserMenu, setShowingUserMenu] = useState(false);
    const userMenuRef = useRef(null);

    // ---------------------------------------------------------
    // 1. ESCUCHADOR DEL MENÚ DE USUARIO (CLICK OUTSIDE Y ESC)
    // ---------------------------------------------------------
    useEffect(() => {
        if (!showingUserMenu) return;

        const handleClickOutside = (event) => {
            if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
                setShowingUserMenu(false);
            }
        };

        const handleEscape = (event) => {
            if (event.key === 'Escape') {
                setShowingUserMenu(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('keydown', handleEscape);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('keydown', handleEscape);
        };
    }, [showingUserMenu]);

    // ---------------------------------------------------------
    // 2. ESCUCHADOR GLOBAL DE NOTIFICACIONES TOAST (SEPARADO)
    // ---------------------------------------------------------
    useEffect(() => {
        if (flash?.success) {
            toast(flash.success, 'success');
        }
        if (flash?.error) {
            toast(flash.error, 'error');
        }
        if (flash?.info) {
            toast(flash.info, 'info');
        }
        if (flash?.warning) {
            toast(flash.warning, 'warning');
        }
    }, [flash]);

    const navItems = [
        {
            key: 'dashboard',
            href: route('dashboard'),
            active: route().current('dashboard'),
            label: 'Dashboard',
            show: true,
            icon: (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} className="h-5 w-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955a1 1 0 011.591 0L21.75 12M4.5 9.75v9.375c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V20.25h4.125c.621 0 1.125-.504 1.125-1.125V9.75" />
                </svg>
            ),
        },
        {
            key: 'caja',
            href: route('cajas.apertura'),
            active: route().current('cajas.*'),
            label: 'Control de Caja',
            show: can('gestionar_caja') || hasRole('administrador'),
            icon: (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} className="h-5 w-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0zM12 6v6l4 2" />
                </svg>
            ),
        },
        {
            key: 'pos',
            href: route('pos.index'),
            active: route().current('pos.*') || route().current('ventas.*'),
            label: 'POS Ventas',
            show: can('usar_pos') || hasRole('administrador'),
            icon: (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} className="h-5 w-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.836l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 1.994-4.708 2.6-7.19a1.125 1.125 0 00-1.11-1.36H5.106M7.5 14.25L5.106 5.106M7.5 14.25L6 20.25m9-6l1.5 6M9 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm9 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
                </svg>
            ),
        },
        {
            key: 'usuarios',
            href: route('users.index'),
            active: route().current('users.*'),
            label: 'Usuarios',
            show: can('ver_usuarios') || hasRole('administrador'),
            icon: (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} className="h-5 w-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                </svg>
            ),
        },
        {
            key: 'clientes',
            href: route('clientes.create'),
            active: route().current('clientes.*'),
            label: 'Clientes',
            show: can('ver_clientes') || hasRole('administrador'),
            icon: (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} className="h-5 w-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 9h3.75M15 12h3.75M15 15h3.75M4.5 19.5h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5zm6-10.125a1.875 1.875 0 11-3.75 0 1.875 1.875 0 013.75 0zm1.294 6.336a6.721 6.721 0 01-3.17.789 6.721 6.721 0 01-3.168-.789 3.376 3.376 0 016.338 0z" />
                </svg>
            ),
        },
        {
            key: 'proveedores',
            href: route('proveedores.index'),
            active: route().current('proveedores.*'),
            label: 'Proveedores',
            show: can('ver_proveedores') || hasRole('administrador'),
            icon: (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} className="h-5 w-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-8.673v8.673m0 0h-12" />
                </svg>
            ),
        },
        {
            key: 'productos',
            href: route('productos.index'),
            active: route().current('productos.*'),
            label: 'Productos',
            show: can('ver_productos') || hasRole('administrador'),
            icon: (
                <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={1.6}
                    className="h-5 w-5"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M20 7.5L12 3 4 7.5m16 0L12 12 4 7.5M20 7.5V16.5L12 21 4 16.5V7.5M12 12V21"
                    />
                </svg>
            ),
        },
        {
            key: 'Compras',
            href: route('compras.index'),
            active: route().current('compras.*'),
            label: 'Compras',
            show: can('ver_compras') || hasRole('administrador'),
            icon: (
                <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={1.6}
                    className="h-5 w-5"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M20 7.5L12 3 4 7.5m16 0L12 12 4 7.5M20 7.5V16.5L12 21 4 16.5V7.5M12 12V21"
                    />
                </svg>
            ),
        },
        {
            key: 'kardex',
            href: route('kardex.index'),
            active: route().current('kardex.*'),
            label: 'Kardex / Movimientos',
            show: can('ver_kardex') || hasRole('administrador'),
            icon: (
                <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={1.6}
                    className="h-5 w-5"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                </svg>
            ),
        },
    ];

    return (
        <div className="min-h-screen bg-amber-50 lg:flex">
            {/* Barra superior móvil */}
            <div className="sticky top-0 z-30 flex items-center justify-between bg-gradient-to-br from-[#44281a] to-[#1c1210] px-4 py-3 lg:hidden">
                <Link href="/" className="flex items-center">
                    <img
                        src="/images/cabana-fresh-mani-logo.png"
                        alt="Cabaña Fresh Maní"
                        className="h-8 w-auto"
                    />
                </Link>
                <button
                    onClick={() => setShowingNavigationDropdown((prev) => !prev)}
                    className="rounded-md p-2 text-amber-100 transition hover:bg-white/10"
                    aria-label="Abrir menú"
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

            {/* Overlay móvil */}
            {showingNavigationDropdown && (
                <div
                    className="fixed inset-0 z-40 bg-stone-950/50 lg:hidden"
                    onClick={() => setShowingNavigationDropdown(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`fixed inset-y-0 left-0 z-50 flex w-64 max-w-[85vw] shrink-0 flex-col bg-gradient-to-br from-[#44281a] to-[#1c1210] transition-transform duration-200 ease-in-out lg:static lg:max-w-none lg:translate-x-0 ${showingNavigationDropdown ? 'translate-x-0' : '-translate-x-full'
                    }`}
            >
                <div
                    className="flex items-center justify-center border-b border-white/10 px-4 py-6"
                    style={{ background: 'radial-gradient(circle at 50% 30%, rgba(245,185,48,0.22), transparent 65%)' }}
                >
                    <Link href="/">
                        <img
                            src="/images/cabana-fresh-mani-logo.png"
                            alt="Cabaña Fresh Maní"
                            className="h-auto w-40"
                        />
                    </Link>
                </div>

                <nav className="flex-1 space-y-1.5 overflow-y-auto px-3 py-5">
                    {navItems
                        .filter((item) => item.show)
                        .map((item) => (
                            <Link
                                key={item.key}
                                href={item.href}
                                aria-current={item.active ? 'page' : undefined}
                                className={`group flex items-center gap-3 rounded-full px-3.5 py-2.5 text-sm font-semibold transition ${item.active
                                    ? 'bg-gradient-to-br from-orange-500 to-[#c85a0a] text-white shadow-lg shadow-orange-900/40'
                                    : 'text-[#e7d3ac] hover:bg-white/5 hover:text-white'
                                    }`}
                            >
                                <span
                                    className={`flex h-8 w-8 items-center justify-center rounded-full transition ${item.active
                                        ? 'bg-white/20 text-white'
                                        : 'bg-white/10 text-amber-400 group-hover:text-amber-300'
                                        }`}
                                >
                                    {item.icon}
                                </span>
                                {item.label}
                                {item.active && (
                                    <span className="ml-auto h-1.5 w-1.5 rounded-full bg-white" />
                                )}
                            </Link>
                        ))}
                </nav>

                {/* Usuario */}
                <div ref={userMenuRef} className="relative border-t border-white/10 p-3">
                    <button
                        type="button"
                        onClick={() => setShowingUserMenu((prev) => !prev)}
                        aria-haspopup="true"
                        aria-expanded={showingUserMenu}
                        className="flex w-full items-center gap-3 rounded-xl px-2 py-2 text-left transition hover:bg-white/5"
                    >
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-teal-500 to-teal-700 text-sm font-bold text-white">
                            {user.name?.charAt(0).toUpperCase()}
                        </span>
                        <span className="min-w-0 flex-1">
                            <span className="block truncate text-sm font-semibold text-white">
                                {user.name}
                            </span>
                            {currentRole && (
                                <span
                                    className={`mt-0.5 inline-flex items-center rounded-md border px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${badgeConfig.bg}`}
                                >
                                    {badgeConfig.label}
                                </span>
                            )}
                        </span>
                        <svg
                            className={`h-4 w-4 shrink-0 text-stone-400 transition-transform duration-200 ${showingUserMenu ? 'rotate-180' : ''
                                }`}
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

                    <Transition
                        show={showingUserMenu}
                        enter="transition ease-out duration-150"
                        enterFrom="opacity-0 translate-y-1"
                        enterTo="opacity-100 translate-y-0"
                        leave="transition ease-in duration-100"
                        leaveFrom="opacity-100 translate-y-0"
                        leaveTo="opacity-0 translate-y-1"
                    >
                        <div className="absolute bottom-full left-0 right-0 z-50 mx-2 mb-2 overflow-hidden rounded-xl border border-stone-200 bg-white p-1.5 shadow-lg">
                            <Link
                                href={route('profile.edit')}
                                onClick={() => setShowingUserMenu(false)}
                                className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm text-stone-700 transition hover:bg-amber-50 hover:text-[#1c1210]"
                            >
                                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-teal-50 text-teal-700">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} className="h-4 w-4">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                                    </svg>
                                </span>
                                Perfil
                            </Link>

                            <div className="my-1 border-t border-stone-100" />

                            <Link
                                href={route('logout')}
                                method="post"
                                as="button"
                                onClick={() => setShowingUserMenu(false)}
                                className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-start text-sm text-red-600 transition hover:bg-red-50 hover:text-red-700"
                            >
                                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-red-50 text-red-600">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} className="h-4 w-4">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 9V5.25A2.25 2.25 0 0110.5 3h6a2.25 2.25 0 012.25 2.25v13.5A2.25 2.25 0 0116.5 21h-6a2.25 2.25 0 01-2.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3H21" />
                                    </svg>
                                </span>
                                Cerrar Sesión
                            </Link>
                        </div>
                    </Transition>
                </div>
            </aside>

            {/* Contenido principal */}
            <div className="flex min-h-screen flex-1 flex-col">
                {header && (
                    <header className="border-b border-amber-100 bg-white/70 backdrop-blur">
                        <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 sm:py-6 lg:px-8">
                            {header}
                        </div>
                    </header>
                )}

                <main className="flex-1">{children}</main>
            </div>
        </div>
    );
}
