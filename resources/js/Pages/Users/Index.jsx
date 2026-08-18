import React, { useState } from 'react';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

export default function Index({ users = [], roles = [] }) {
    const { flash } = usePage().props;

    const [showModal, setShowModal] = useState(false);
    const [editingUser, setEditingUser] = useState(null);

    const {
        data,
        setData,
        post,
        put,
        processing,
        errors,
        reset,
    } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        role: roles[0] || '',
    });

    /*
    |--------------------------------------------------------------------------
    | CREAR USUARIO
    |--------------------------------------------------------------------------
    */

    const openCreateModal = () => {
        setEditingUser(null);

        setData({
            name: '',
            email: '',
            password: '',
            password_confirmation: '',
            role: roles[0] || '',
        });

        setShowModal(true);
    };

    /*
    |--------------------------------------------------------------------------
    | EDITAR USUARIO
    |--------------------------------------------------------------------------
    */

    const openEditModal = (user) => {
        setEditingUser(user);

        setData({
            name: user.name || '',
            email: user.email || '',
            password: '',
            password_confirmation: '',
            role: user.roles?.[0]?.name || roles[0] || '',
        });

        setShowModal(true);
    };

    /*
    |--------------------------------------------------------------------------
    | CERRAR MODAL
    |--------------------------------------------------------------------------
    */

    const closeModal = () => {
        reset();

        setEditingUser(null);

        setData({
            name: '',
            email: '',
            password: '',
            password_confirmation: '',
            role: roles[0] || '',
        });

        setShowModal(false);
    };

    /*
    |--------------------------------------------------------------------------
    | GUARDAR / ACTUALIZAR
    |--------------------------------------------------------------------------
    */

    const handleSubmit = (e) => {
        e.preventDefault();

        /*
        |--------------------------------------------------------------------------
        | EDITAR
        |--------------------------------------------------------------------------
        */

        if (editingUser) {
            put(
                route('users.update', editingUser.id),
                {
                    name: data.name,
                    email: data.email,
                    role: data.role,
                },
                {
                    onSuccess: () => {
                        closeModal();
                    },
                }
            );

            return;
        }

        /*
        |--------------------------------------------------------------------------
        | CREAR
        |--------------------------------------------------------------------------
        */

        post(route('users.store'), {
            onSuccess: () => {
                closeModal();
            },
        });
    };

    /*
    |--------------------------------------------------------------------------
    | ELIMINAR
    |--------------------------------------------------------------------------
    */

    const handleDelete = (user) => {
        if (
            !confirm(
                `¿Estás seguro de eliminar al empleado "${user.name}"?`
            )
        ) {
            return;
        }

        router.delete(route('users.destroy', user.id), {
            preserveScroll: true,
        });
    };

    /*
    |--------------------------------------------------------------------------
    | RESTABLECER CONTRASEÑA
    |--------------------------------------------------------------------------
    */

    const handleResetPassword = (user) => {
        const password = prompt(
            `Nueva contraseña para ${user.name}:`
        );

        if (!password) {
            return;
        }

        const confirmation = prompt(
            'Confirma la nueva contraseña:'
        );

        if (!confirmation) {
            return;
        }

        if (password !== confirmation) {
            alert('Las contraseñas no coinciden.');
            return;
        }

        router.put(
            route('users.reset-password', user.id),
            {
                password: password,
                password_confirmation: confirmation,
            },
            {
                preserveScroll: true,
            }
        );
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

            <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-10 lg:px-8">

                {/* =====================================================
                    FLASH
                ====================================================== */}

                {flash?.success && (
                    <div className="mb-6 rounded-2xl border border-teal-200 bg-teal-50 px-4 py-3 text-sm font-semibold text-teal-800">
                        {flash.success}
                    </div>
                )}

                {/* =====================================================
                    CONTENEDOR PRINCIPAL
                ====================================================== */}

                <div className="overflow-hidden rounded-[28px] bg-white shadow-sm ring-1 ring-amber-100">

                    {/* =================================================
                        CABECERA
                    ================================================== */}

                    <div className="flex flex-col gap-4 border-b border-amber-100 bg-gradient-to-br from-amber-50 to-white px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-7 sm:py-6">

                        <div>
                            <h1 className="text-lg font-bold text-teal-700">
                                Empleados Registrados
                            </h1>

                            <p className="mt-1 text-sm text-stone-500">
                                Administra los usuarios del sistema.
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={openCreateModal}
                            className="inline-flex w-full items-center justify-center rounded-full bg-gradient-to-br from-orange-500 to-orange-800 px-6 py-2.5 text-sm font-extrabold uppercase tracking-wide text-white transition hover:shadow-lg sm:w-auto"
                        >
                            Nuevo Empleado
                        </button>

                    </div>

                    {/* =================================================
                        TABLA
                    ================================================== */}

                    <div className="overflow-x-auto">

                        <table className="w-full min-w-[950px] text-left text-sm">

                            <thead>
                                <tr className="bg-amber-50/60 text-xs font-extrabold uppercase tracking-wide text-stone-500">

                                    <th className="px-5 py-3 sm:px-7">
                                        Nombre
                                    </th>

                                    <th className="px-5 py-3 sm:px-7">
                                        Correo
                                    </th>

                                    <th className="px-5 py-3 sm:px-7">
                                        Rol
                                    </th>

                                    <th className="px-5 py-3 sm:px-7">
                                        Fecha de alta
                                    </th>

                                    <th className="px-5 py-3 text-right sm:px-7">
                                        Acciones
                                    </th>

                                </tr>
                            </thead>

                            <tbody className="divide-y divide-amber-100">

                                {users.length === 0 && (
                                    <tr>
                                        <td
                                            colSpan={5}
                                            className="px-5 py-8 text-center text-sm text-stone-400"
                                        >
                                            Todavía no hay empleados registrados.
                                        </td>
                                    </tr>
                                )}

                                {users.map((user) => (
                                    <tr
                                        key={user.id}
                                        className="transition hover:bg-amber-50/40"
                                    >

                                        {/* NOMBRE */}

                                        <td className="px-5 py-4 font-semibold text-stone-800 sm:px-7">
                                            {user.name}
                                        </td>

                                        {/* EMAIL */}

                                        <td className="px-5 py-4 text-stone-600 sm:px-7">
                                            {user.email}
                                        </td>

                                        {/* ROL */}

                                        <td className="px-5 py-4 sm:px-7">

                                            {(user.roles ?? []).map((role) => (
                                                <span
                                                    key={role.id}
                                                    className="mr-1 inline-block rounded-full bg-teal-50 px-2.5 py-1 text-xs font-bold uppercase tracking-wide text-teal-700"
                                                >
                                                    {role.name}
                                                </span>
                                            ))}

                                        </td>

                                        {/* FECHA */}

                                        <td className="px-5 py-4 text-stone-500 sm:px-7">
                                            {user.created_at
                                                ? new Date(
                                                      user.created_at
                                                  ).toLocaleDateString(
                                                      'es-EC',
                                                      {
                                                          day: '2-digit',
                                                          month: '2-digit',
                                                          year: 'numeric',
                                                      }
                                                  )
                                                : '-'}
                                        </td>

                                        {/* ACCIONES */}

                                        <td className="px-5 py-4 sm:px-7">

                                            <div className="flex items-center justify-end gap-2">

                                                {/* EDITAR */}

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        openEditModal(user)
                                                    }
                                                    className="rounded-lg px-3 py-1.5 text-sm font-semibold text-teal-600 transition hover:bg-teal-50"
                                                >
                                                    Editar
                                                </button>

                                                {/* RESTABLECER CONTRASEÑA */}

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        handleResetPassword(user)
                                                    }
                                                    className="rounded-lg px-3 py-1.5 text-sm font-semibold text-amber-600 transition hover:bg-amber-50"
                                                >
                                                    Restablecer contraseña
                                                </button>

                                                {/* ELIMINAR */}

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        handleDelete(user)
                                                    }
                                                    className="rounded-lg px-3 py-1.5 text-sm font-semibold text-red-600 transition hover:bg-red-50"
                                                >
                                                    Eliminar
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

            {/* =========================================================
                MODAL CREAR / EDITAR
            ========================================================== */}

            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center px-4">

                    {/* FONDO */}

                    <div
                        className="absolute inset-0 bg-black/50"
                        onClick={closeModal}
                    />

                    {/* MODAL */}

                    <div className="relative z-10 w-full max-w-2xl rounded-2xl bg-white p-6 shadow-xl">

                        {/* CABECERA */}

                        <div className="mb-6 flex items-center justify-between">

                            <div>

                                <h2 className="text-xl font-bold text-stone-800">
                                    {editingUser
                                        ? 'Editar Empleado'
                                        : 'Crear Nuevo Empleado'}
                                </h2>

                                <p className="mt-1 text-sm text-stone-500">
                                    {editingUser
                                        ? 'Modifica los datos del empleado.'
                                        : 'Completa los datos del nuevo usuario.'}
                                </p>

                            </div>

                            <button
                                type="button"
                                onClick={closeModal}
                                className="text-2xl text-stone-400 hover:text-stone-800"
                            >
                                ×
                            </button>

                        </div>

                        {/* FORMULARIO */}

                        <form
                            onSubmit={handleSubmit}
                            className="grid grid-cols-1 gap-5 sm:grid-cols-2"
                        >

                            {/* NOMBRE */}

                            <div>

                                <label
                                    htmlFor="name"
                                    className="mb-1.5 block text-sm font-semibold text-stone-700"
                                >
                                    Nombre completo
                                </label>

                                <input
                                    id="name"
                                    type="text"
                                    value={data.name}
                                    onChange={(e) =>
                                        setData(
                                            'name',
                                            e.target.value
                                        )
                                    }
                                    required
                                    className="w-full rounded-lg border border-stone-300 px-3 py-2 outline-none transition focus:border-teal-600 focus:ring-1 focus:ring-teal-600"
                                />

                                {errors.name && (
                                    <p className="mt-1 text-sm text-red-600">
                                        {errors.name}
                                    </p>
                                )}

                            </div>

                            {/* EMAIL */}

                            <div>

                                <label
                                    htmlFor="email"
                                    className="mb-1.5 block text-sm font-semibold text-stone-700"
                                >
                                    Correo electrónico
                                </label>

                                <input
                                    id="email"
                                    type="email"
                                    value={data.email}
                                    onChange={(e) =>
                                        setData(
                                            'email',
                                            e.target.value
                                        )
                                    }
                                    required
                                    className="w-full rounded-lg border border-stone-300 px-3 py-2 outline-none transition focus:border-teal-600 focus:ring-1 focus:ring-teal-600"
                                />

                                {errors.email && (
                                    <p className="mt-1 text-sm text-red-600">
                                        {errors.email}
                                    </p>
                                )}

                            </div>

                            {/* =================================================
                                CONTRASEÑA
                                SOLO APARECE AL CREAR
                            ================================================== */}

                            {!editingUser && (
                                <>
                                    <div>

                                        <label
                                            htmlFor="password"
                                            className="mb-1.5 block text-sm font-semibold text-stone-700"
                                        >
                                            Contraseña
                                        </label>

                                        <input
                                            id="password"
                                            type="password"
                                            value={data.password}
                                            onChange={(e) =>
                                                setData(
                                                    'password',
                                                    e.target.value
                                                )
                                            }
                                            required
                                            className="w-full rounded-lg border border-stone-300 px-3 py-2 outline-none transition focus:border-teal-600 focus:ring-1 focus:ring-teal-600"
                                        />

                                        {errors.password && (
                                            <p className="mt-1 text-sm text-red-600">
                                                {errors.password}
                                            </p>
                                        )}

                                    </div>

                                    <div>

                                        <label
                                            htmlFor="password_confirmation"
                                            className="mb-1.5 block text-sm font-semibold text-stone-700"
                                        >
                                            Confirmar contraseña
                                        </label>

                                        <input
                                            id="password_confirmation"
                                            type="password"
                                            value={
                                                data.password_confirmation
                                            }
                                            onChange={(e) =>
                                                setData(
                                                    'password_confirmation',
                                                    e.target.value
                                                )
                                            }
                                            required
                                            className="w-full rounded-lg border border-stone-300 px-3 py-2 outline-none transition focus:border-teal-600 focus:ring-1 focus:ring-teal-600"
                                        />

                                        {errors.password_confirmation && (
                                            <p className="mt-1 text-sm text-red-600">
                                                {
                                                    errors.password_confirmation
                                                }
                                            </p>
                                        )}

                                    </div>
                                </>
                            )}

                            {/* ROL */}

                            <div className="sm:col-span-2">

                                <label
                                    htmlFor="role"
                                    className="mb-1.5 block text-sm font-semibold text-stone-700"
                                >
                                    Rol
                                </label>

                                <select
                                    id="role"
                                    value={data.role}
                                    onChange={(e) =>
                                        setData(
                                            'role',
                                            e.target.value
                                        )
                                    }
                                    required
                                    className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 outline-none transition focus:border-teal-600 focus:ring-1 focus:ring-teal-600"
                                >

                                    <option value="" disabled>
                                        Selecciona un rol
                                    </option>

                                    {roles.map((role) => (
                                        <option
                                            key={role}
                                            value={role}
                                        >
                                            {role}
                                        </option>
                                    ))}

                                </select>

                                {errors.role && (
                                    <p className="mt-1 text-sm text-red-600">
                                        {errors.role}
                                    </p>
                                )}

                            </div>

                            {/* AVISO AL EDITAR */}

                            {editingUser && (
                                <div className="sm:col-span-2 rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-700">
                                    La contraseña no se modifica aquí.
                                    Para cambiarla utiliza
                                    <strong>
                                        {' '}
                                        "Restablecer contraseña"
                                    </strong>{' '}
                                    desde la tabla.
                                </div>
                            )}

                            {/* BOTONES */}

                            <div className="flex justify-end gap-3 border-t border-stone-100 pt-5 sm:col-span-2">

                                <button
                                    type="button"
                                    onClick={closeModal}
                                    disabled={processing}
                                    className="rounded-lg border border-stone-300 px-5 py-2 text-sm font-semibold text-stone-700 transition hover:bg-stone-50 disabled:opacity-50"
                                >
                                    Cancelar
                                </button>

                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="rounded-lg bg-orange-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    {processing
                                        ? 'Guardando...'
                                        : editingUser
                                        ? 'Actualizar Usuario'
                                        : 'Guardar Usuario'}
                                </button>

                            </div>

                        </form>

                    </div>

                </div>
            )}
        </AuthenticatedLayout>
        
    );
}
