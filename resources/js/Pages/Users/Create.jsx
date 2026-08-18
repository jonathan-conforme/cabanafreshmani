import React from 'react';
import { useForm, Head, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

export default function Create({ roles = [] }) {
    const { flash } = usePage().props;

    const { data, setData, post, processing, errors } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        role: roles[0] || '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();

        post(route('users.store'));
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-bold tracking-tight text-stone-800">
                    Crear Usuario
                </h2>
            }
        >
            <Head title="Crear Usuario" />

            <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6 sm:py-10 lg:px-8">
                {flash?.success && (
                    <div className="mb-6 flex items-center gap-3 rounded-2xl border border-teal-200 bg-teal-50 px-4 py-3 text-sm font-semibold text-teal-800">
                        <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75l2.25 2.25L15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {flash.success}
                    </div>
                )}

                <div className="overflow-hidden rounded-[28px] bg-white shadow-sm ring-1 ring-amber-100">
                    <div className="border-b border-amber-100 bg-gradient-to-br from-amber-50 to-white px-5 py-5 sm:px-7 sm:py-6">
                        <h1 className="text-lg font-bold text-teal-700">Crear Nuevo Empleado</h1>
                        <p className="mt-1 text-sm text-stone-500">
                            Completá los datos para dar de alta un nuevo usuario del sistema.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-5 px-5 py-6 sm:grid-cols-2 sm:px-7 sm:py-7">
                        <div>
                            <label htmlFor="name" className="mb-1.5 block text-xs font-extrabold uppercase tracking-wide text-stone-500">
                                Nombre completo
                            </label>

                            <input
                                id="name"
                                type="text"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                required
                                className="w-full rounded-2xl border border-amber-200 bg-white px-3.5 py-2.5 text-sm text-stone-900 outline-none transition focus:border-teal-600 focus:ring-1 focus:ring-teal-600"
                            />

                            {errors.name && (
                                <div className="mt-1.5 text-xs font-semibold text-red-600">
                                    {errors.name}
                                </div>
                            )}
                        </div>

                        <div>
                            <label htmlFor="email" className="mb-1.5 block text-xs font-extrabold uppercase tracking-wide text-stone-500">
                                Correo electrónico
                            </label>

                            <input
                                id="email"
                                type="email"
                                value={data.email}
                                onChange={(e) =>
                                    setData('email', e.target.value)
                                }
                                required
                                className="w-full rounded-2xl border border-amber-200 bg-white px-3.5 py-2.5 text-sm text-stone-900 outline-none transition focus:border-teal-600 focus:ring-1 focus:ring-teal-600"
                            />

                            {errors.email && (
                                <div className="mt-1.5 text-xs font-semibold text-red-600">
                                    {errors.email}
                                </div>
                            )}
                        </div>

                        <div>
                            <label htmlFor="password" className="mb-1.5 block text-xs font-extrabold uppercase tracking-wide text-stone-500">
                                Contraseña
                            </label>

                            <input
                                id="password"
                                type="password"
                                value={data.password}
                                onChange={(e) =>
                                    setData('password', e.target.value)
                                }
                                required
                                className="w-full rounded-2xl border border-amber-200 bg-white px-3.5 py-2.5 text-sm text-stone-900 outline-none transition focus:border-teal-600 focus:ring-1 focus:ring-teal-600"
                            />

                            {errors.password && (
                                <div className="mt-1.5 text-xs font-semibold text-red-600">
                                    {errors.password}
                                </div>
                            )}
                        </div>

                        <div>
                            <label htmlFor="password_confirmation" className="mb-1.5 block text-xs font-extrabold uppercase tracking-wide text-stone-500">
                                Confirmar contraseña
                            </label>

                            <input
                                id="password_confirmation"
                                type="password"
                                value={data.password_confirmation}
                                onChange={(e) =>
                                    setData(
                                        'password_confirmation',
                                        e.target.value
                                    )
                                }
                                required
                                className="w-full rounded-2xl border border-amber-200 bg-white px-3.5 py-2.5 text-sm text-stone-900 outline-none transition focus:border-teal-600 focus:ring-1 focus:ring-teal-600"
                            />
                        </div>

                        <div className="sm:col-span-2">
                            <label htmlFor="role" className="mb-1.5 block text-xs font-extrabold uppercase tracking-wide text-stone-500">
                                Rol asignado
                            </label>

                            <select
                                id="role"
                                value={data.role}
                                onChange={(e) =>
                                    setData('role', e.target.value)
                                }
                                required
                                className="w-full rounded-2xl border border-amber-200 bg-white px-3.5 py-2.5 text-sm text-stone-900 outline-none transition focus:border-teal-600 focus:ring-1 focus:ring-teal-600"
                            >
                                <option value="" disabled>
                                    Selecciona un rol
                                </option>

                                {roles.map((role) => (
                                    <option key={role} value={role}>
                                        {role}
                                    </option>
                                ))}
                            </select>

                            {errors.role && (
                                <div className="mt-1.5 text-xs font-semibold text-red-600">
                                    {errors.role}
                                </div>
                            )}
                        </div>

                        <div className="flex justify-end pt-2 sm:col-span-2">
                            <button
                                type="submit"
                                disabled={processing}
                                className="w-full rounded-full bg-gradient-to-br from-orange-500 to-orange-800 px-8 py-3 text-sm font-extrabold uppercase tracking-wide text-white shadow-lg shadow-orange-900/25 transition hover:-translate-y-0.5 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 sm:w-auto"
                            >
                                {processing ? 'Guardando...' : 'Guardar Usuario'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}