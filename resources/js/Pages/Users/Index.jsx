import React from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

export default function Index({ users = [] }) {
    const { flash } = usePage().props;

    const handleDelete = (user) => {
        if (confirm(`¿Eliminar al empleado "${user.name}"?`)) {
            router.delete(route('users.destroy', user.id));
        }
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-bold tracking-tight text-stone-800">
                    Empleados
                </h2>
            }
        >
            <Head title="Empleados" />

            <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-10 lg:px-8">
                {flash?.success && (
                    <div className="mb-6 flex items-center gap-3 rounded-2xl border border-teal-200 bg-teal-50 px-4 py-3 text-sm font-semibold text-teal-800">
                        <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75l2.25 2.25L15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {flash.success}
                    </div>
                )}

                <div className="overflow-hidden rounded-[28px] bg-white shadow-sm ring-1 ring-amber-100">
                    <div className="flex flex-col gap-3 border-b border-amber-100 bg-gradient-to-br from-amber-50 to-white px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-7 sm:py-6">
                        <div>
                            <h1 className="text-lg font-bold text-teal-700">Empleados Registrados</h1>
                            <p className="mt-1 text-sm text-stone-500">
                                Listado de los usuarios del sistema.
                            </p>
                        </div>

                        <Link
                            href={route('users.create')}
                            className="inline-flex w-full items-center justify-center rounded-full bg-gradient-to-br from-orange-500 to-orange-800 px-6 py-2.5 text-sm font-extrabold uppercase tracking-wide text-white shadow-lg shadow-orange-900/25 transition hover:-translate-y-0.5 hover:shadow-xl sm:w-auto"
                        >
                            Nuevo Empleado
                        </Link>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[640px] text-left text-sm">
                            <thead>
                                <tr className="bg-amber-50/60 text-xs font-extrabold uppercase tracking-wide text-stone-500">
                                    <th className="px-5 py-3 sm:px-7">Nombre</th>
                                    <th className="px-5 py-3 sm:px-7">Correo electrónico</th>
                                    <th className="px-5 py-3 sm:px-7">Rol</th>
                                    <th className="px-5 py-3 sm:px-7">Fecha de alta</th>
                                    <th className="px-5 py-3 text-right sm:px-7">Acciones</th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-amber-100">
                                {users.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="px-5 py-6 text-center text-sm text-stone-400 sm:px-7">
                                            Todavía no hay empleados registrados.
                                        </td>
                                    </tr>
                                )}

                                {users.map((user) => (
                                    <tr key={user.id} className="transition hover:bg-amber-50/40">
                                        <td className="px-5 py-3.5 font-semibold text-stone-800 sm:px-7">
                                            {user.name}
                                        </td>
                                        <td className="px-5 py-3.5 text-stone-600 sm:px-7">
                                            {user.email}
                                        </td>
                                        <td className="px-5 py-3.5 sm:px-7">
                                            {(user.roles ?? []).map((role) => (
                                                <span
                                                    key={role.id}
                                                    className="mr-1 inline-block rounded-full bg-teal-50 px-2.5 py-1 text-xs font-bold uppercase tracking-wide text-teal-700 ring-1 ring-teal-200"
                                                >
                                                    {role.name}
                                                </span>
                                            ))}
                                        </td>
                                        <td className="px-5 py-3.5 text-stone-500 sm:px-7">
                                            {new Date(user.created_at).toLocaleDateString('es-AR', {
                                                day: '2-digit',
                                                month: '2-digit',
                                                year: 'numeric',
                                            })}
                                        </td>
                                        <td className="px-5 py-3.5 sm:px-7">
                                            <div className="flex items-center justify-end gap-1.5">
                                                <Link
                                                    href={route('users.edit', user.id)}
                                                    title="Editar empleado"
                                                    aria-label="Editar empleado"
                                                    className="inline-flex h-8 w-8 items-center justify-center rounded-full text-teal-600 transition hover:bg-teal-50 hover:text-teal-800"
                                                >
                                                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 19.5H4.5" />
                                                    </svg>
                                                </Link>

                                                <button
                                                    type="button"
                                                    onClick={() => handleDelete(user)}
                                                    title="Eliminar empleado"
                                                    aria-label="Eliminar empleado"
                                                    className="inline-flex h-8 w-8 items-center justify-center rounded-full text-red-500 transition hover:bg-red-50 hover:text-red-700"
                                                >
                                                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                                                    </svg>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
