import React, { useState } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Users, ShieldCheck, ShoppingBag, Utensils, Pencil, Trash, Key, Lock } from 'lucide-react';
import Tooltip from '@/Components/Tooltip';
import { confirmDelete, passwordResetAlert, successAlert } from '@/Components/SweetAlert';

export default function Index({
    users = [],
    roles = [],
    permissions = [], // Recibe el catálogo completo de permisos desde el controlador
}) {
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
        permissions: [], // Permisos seleccionados para el usuario
    });

    /*
    |--------------------------------------------------------------------------
    | MANEJO DE PERMISOS EN EL FORMULARIO
    |--------------------------------------------------------------------------
    */
    const handlePermissionToggle = (permissionName) => {
        if (data.permissions.includes(permissionName)) {
            setData(
                'permissions',
                data.permissions.filter((p) => p !== permissionName)
            );
        } else {
            setData('permissions', [...data.permissions, permissionName]);
        }
    };

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
            permissions: [],
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

        // Extrae los nombres de permisos directos del usuario
        const userPermissions = (user.permissions || []).map(p => typeof p === 'string' ? p : p.name);

        setData({
            name: user.name || '',
            email: user.email || '',
            password: '',
            password_confirmation: '',
            role: user.roles?.[0]?.name || roles[0] || '',
            permissions: userPermissions,
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
        setShowModal(false);
    };

    /*
    |--------------------------------------------------------------------------
    | GUARDAR / ACTUALIZAR
    |--------------------------------------------------------------------------
    */
 const handleSubmit = (e) => {
    e.preventDefault();

    if (editingUser) {
        put(route('users.update', editingUser.id), {
            onSuccess: () => closeModal(),
            onError: (err) => console.error('Errores al actualizar:', err),
        });
        return;
    }

    post(route('users.store'), {
        onSuccess: () => closeModal(),
        onError: (err) => console.error('Errores al crear:', err),
    });
};

    /*
    |--------------------------------------------------------------------------
    | ELIMINAR / RESTABLECER CONTRASEÑA
    |--------------------------------------------------------------------------
    */
    const handleDelete = async (user) => {
        if (!(await confirmDelete('Esta acción no se puede deshacer.', `¿Eliminar al empleado "${user.name}"?`))) {
            return;
        }
        router.delete(route('users.destroy', user.id), { preserveScroll: true });
    };

    const handleResetPassword = async (user) => {
        const result = await passwordResetAlert(user.name);
        if (!result) return;

        router.put(
            route('users.reset-password', user.id),
            {
                password: result.password,
                password_confirmation: result.password_confirmation,
            },
            {
                preserveScroll: true,
                onSuccess: () => successAlert('Contraseña restablecida correctamente.'),
            }
        );
    };

    const contarPorRol = (nombreRol) =>
        users.filter((user) => (user.roles ?? []).some((role) => role.name === nombreRol)).length;

    const resumenCards = [
        { label: 'Total Empleados', value: users.length, color: '#6D5DD3', Icon: Users },
        { label: 'Administradores', value: contarPorRol('administrador'), color: '#1E9EE0', Icon: ShieldCheck },
        { label: 'Vendedores', value: contarPorRol('vendedor'), color: '#B23CC9', Icon: ShoppingBag },
        { label: 'Vendedor Fritada', value: contarPorRol('vendedor_fritada'), color: '#1AA65E', Icon: Utensils },
    ];

    const formatLabel = (str) => str.replace('_', ' ').toUpperCase();

    return (
        <AuthenticatedLayout header={<h2 className="text-xl font-bold tracking-tight text-stone-800">Empleados</h2>}>
            <Head title="Empleados" />

            <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-10 lg:px-8">
                {/* TARJETAS DE RESUMEN */}
                <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {resumenCards.map((card) => (
                        <div key={card.label} className="rounded-2xl border-t-4 bg-white px-5 py-4 shadow-sm" style={{ borderTopColor: card.color }}>
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-xs font-bold uppercase tracking-wide text-stone-400">{card.label}</p>
                                    <p className="mt-2 text-2xl font-extrabold text-stone-800">{card.value}</p>
                                </div>
                                <span className="flex h-10 w-10 items-center justify-center rounded-full" style={{ backgroundColor: `${card.color}1A`, color: card.color }}>
                                    <card.Icon size={20} strokeWidth={2.25} />
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
{/* CAJA DE ERRORES GENERALES */}
{Object.keys(errors).length > 0 && (
    <div className="sm:col-span-2 rounded-lg bg-red-50 p-3 text-xs text-red-600">
        <p className="font-bold mb-1">Por favor corrige los siguientes errores:</p>
        <ul className="list-disc list-inside">
            {Object.values(errors).map((err, i) => (
                <li key={i}>{err}</li>
            ))}
        </ul>
    </div>
)}
                {/* TABLA PRINCIPAL */}
                <div className="overflow-hidden rounded-[28px] bg-white shadow-sm ring-1 ring-amber-100">
                    <div className="flex flex-col gap-4 border-b border-amber-100 bg-gradient-to-br from-amber-50 to-white px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-7 sm:py-6">
                        <div>
                            <h1 className="text-lg font-bold text-teal-700">Empleados Registrados</h1>
                            <p className="mt-1 text-sm text-stone-500">Administra los usuarios y sus permisos específicos.</p>
                        </div>
                        <button
                            type="button"
                            onClick={openCreateModal}
                            className="inline-flex w-full items-center justify-center rounded-full bg-gradient-to-br from-orange-500 to-orange-800 px-6 py-2.5 text-sm font-extrabold uppercase tracking-wide text-white transition hover:shadow-lg sm:w-auto"
                        >
                            Nuevo Empleado
                        </button>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[950px] text-center text-sm">
                            <thead>
                                <tr className="bg-amber-50/60 text-xs font-extrabold uppercase tracking-wide text-stone-500">
                                    <th className="px-5 py-3 sm:px-7">Nombre</th>
                                    <th className="px-5 py-3 sm:px-7">Correo</th>
                                    <th className="px-5 py-3 sm:px-7">Rol Base</th>
                                    <th className="px-5 py-3 sm:px-7">Permisos Directos</th>
                                    <th className="px-5 py-3 sm:px-7">Fecha de alta</th>
                                    <th className="px-5 py-3 text-center sm:px-7">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-amber-100">
                                {users.length === 0 && (
                                    <tr>
                                        <td colSpan={6} className="px-5 py-8 text-center text-sm text-stone-400">
                                            Todavía no hay empleados registrados.
                                        </td>
                                    </tr>
                                )}

                                {users.map((user) => (
                                    <tr key={user.id} className="transition hover:bg-amber-50/40">
                                        <td className="px-5 py-4 font-semibold text-stone-800 sm:px-7">{user.name}</td>
                                        <td className="px-5 py-4 text-stone-600 sm:px-7">{user.email}</td>

                                        {/* ROL */}
                                        <td className="px-5 py-4 sm:px-7">
                                            {(user.roles ?? []).map((role) => (
                                                <span key={role.id || role} className="inline-block rounded-full bg-teal-50 px-2.5 py-1 text-xs font-bold uppercase tracking-wide text-teal-700">
                                                    {role.name || role}
                                                </span>
                                            ))}
                                        </td>

                                        {/* PERMISOS DIRECTOS */}
<td className="px-4 py-3 text-sm">
    {user.permissions && user.permissions.length > 0 ? (
        <div className="flex flex-wrap gap-1">
            {user.permissions.map((permiso) => (
                <span
                    key={permiso.id}
                    className="inline-flex items-center rounded-md bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800"
                >
                    {permiso.name.replace('_', ' ')}
                </span>
            ))}
        </div>
    ) : (
        <span className="text-xs italic text-stone-400">Ninguno</span>
    )}
</td>

                                        <td className="px-5 py-4 text-stone-500 sm:px-7">
                                            {user.created_at ? new Date(user.created_at).toLocaleDateString('es-EC', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '-'}
                                        </td>

                                        <td className="px-5 py-4 sm:px-7">
                                            <div className="flex items-center justify-end gap-2">
                                                <Tooltip text="Editar empleado">
                                                    <button type="button" onClick={() => openEditModal(user)} className="cursor-pointer rounded-lg px-3 py-1.5 text-teal-600 hover:bg-teal-50">
                                                        <Pencil size={20} color="#2563eb" />
                                                    </button>
                                                </Tooltip>
                                                <Tooltip text="Restablecer contraseña">
                                                    <button type="button" onClick={() => handleResetPassword(user)} className="cursor-pointer rounded-lg px-3 py-1.5 text-amber-600 hover:bg-amber-50">
                                                        <Key size={20} color="#d97706" />
                                                    </button>
                                                </Tooltip>
                                                <Tooltip text="Eliminar empleado">
                                                    <button type="button" onClick={() => handleDelete(user)} className="cursor-pointer rounded-lg px-3 py-1.5 text-red-600 hover:bg-red-50">
                                                        <Trash size={20} color="#dc2626" />
                                                    </button>
                                                </Tooltip>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* MODAL CREAR / EDITAR */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
                    <div className="absolute inset-0 bg-black/50" onClick={closeModal} />

                    <div className="relative z-10 w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
                        <div className="mb-6 flex items-center justify-between">
                            <div>
                                <h2 className="text-xl font-bold text-stone-800">{editingUser ? 'Editar Empleado' : 'Crear Nuevo Empleado'}</h2>
                                <p className="mt-1 text-sm text-stone-500">Completa la información y asigna los permisos correspondientes.</p>
                            </div>
                            <button type="button" onClick={closeModal} className="text-2xl text-stone-400 hover:text-stone-800">×</button>
                        </div>

                        <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                            {/* NOMBRE */}
                            <div>
                                <label className="mb-1.5 block text-sm font-semibold text-stone-700">Nombre completo</label>
                                <input
                                    type="text"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    required
                                    className="w-full rounded-lg border border-stone-300 px-3 py-2 outline-none focus:border-teal-600 focus:ring-1 focus:ring-teal-600"
                                />
                                {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
                            </div>

                            {/* EMAIL */}
                            <div>
                                <label className="mb-1.5 block text-sm font-semibold text-stone-700">Correo electrónico</label>
                                <input
                                    type="email"
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    required
                                    className="w-full rounded-lg border border-stone-300 px-3 py-2 outline-none focus:border-teal-600 focus:ring-1 focus:ring-teal-600"
                                />
                                {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
                            </div>

                            {/* CONTRASEÑAS AL CREAR */}
                            {!editingUser && (
                                <>
                                    <div>
                                        <label className="mb-1.5 block text-sm font-semibold text-stone-700">Contraseña</label>
                                        <input
                                            type="password"
                                            value={data.password}
                                            onChange={(e) => setData('password', e.target.value)}
                                            required
                                            className="w-full rounded-lg border border-stone-300 px-3 py-2 outline-none focus:border-teal-600 focus:ring-1 focus:ring-teal-600"
                                        />
                                        {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
                                    </div>

                                    <div>
                                        <label className="mb-1.5 block text-sm font-semibold text-stone-700">Confirmar contraseña</label>
                                        <input
                                            type="password"
                                            value={data.password_confirmation}
                                            onChange={(e) => setData('password_confirmation', e.target.value)}
                                            required
                                            className="w-full rounded-lg border border-stone-300 px-3 py-2 outline-none focus:border-teal-600 focus:ring-1 focus:ring-teal-600"
                                        />
                                    </div>
                                </>
                            )}

                            {/* ROL PRINCIPAL */}
                            <div className="sm:col-span-2">
                                <label className="mb-1.5 block text-sm font-semibold text-stone-700">Rol Principal</label>
                                <select
                                    value={data.role}
                                    onChange={(e) => setData('role', e.target.value)}
                                    required
                                    className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 outline-none focus:border-teal-600 focus:ring-1 focus:ring-teal-600"
                                >
                                    <option value="" disabled>Selecciona un rol</option>
                                    {roles.map((role) => (
                                        <option key={role} value={role}>{role}</option>
                                    ))}
                                </select>
                                {errors.role && <p className="mt-1 text-sm text-red-600">{errors.role}</p>}
                            </div>

                            {/* SECCIÓN DE PERMISOS DIRECTOS OCIANALES */}
                            <div className="sm:col-span-2 rounded-xl border border-stone-200 bg-stone-50/50 p-4">
                                <div className="mb-3 flex items-center gap-2">
                                    <Lock size={16} className="text-teal-600" />
                                    <label className="text-sm font-bold text-stone-800">
                                        Permisos Adicionales Directos
                                    </label>
                                </div>
                                <p className="mb-3 text-xs text-stone-500">
                                    Opcional. Otorga accesos específicos a este usuario sin importar los que ya incluye su rol principal.
                                </p>

                                <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                                    {permissions.map((perm) => {
                                        const permName = typeof perm === 'string' ? perm : perm.name;
                                        const isChecked = data.permissions.includes(permName);

                                        return (
                                            <label
                                                key={permName}
                                                className={`flex cursor-pointer items-center gap-3 rounded-lg border p-2.5 transition ${
                                                    isChecked
                                                        ? 'border-teal-500 bg-teal-50/50 text-teal-900 font-medium'
                                                        : 'border-stone-200 bg-white text-stone-600 hover:bg-stone-100/60'
                                                }`}
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={isChecked}
                                                    onChange={() => handlePermissionToggle(permName)}
                                                    className="h-4 w-4 rounded border-stone-300 text-teal-600 focus:ring-teal-500"
                                                />
                                                <span className="text-xs uppercase tracking-wide">
                                                    {formatLabel(permName)}
                                                </span>
                                            </label>
                                        );
                                    })}
                                </div>
                            </div>

                            {editingUser && (
                                <div className="sm:col-span-2 rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-700">
                                    La contraseña no se modifica aquí. Usa <strong>"Restablecer contraseña"</strong> en la tabla.
                                </div>
                            )}

                            {/* BOTONES */}
                            <div className="flex justify-end gap-3 border-t border-stone-100 pt-5 sm:col-span-2">
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    disabled={processing}
                                    className="rounded-lg border border-stone-300 px-5 py-2 text-sm font-semibold text-stone-700 hover:bg-stone-50 disabled:opacity-50"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="rounded-lg bg-orange-600 px-5 py-2 text-sm font-semibold text-white hover:bg-orange-700 disabled:opacity-50"
                                >
                                    {processing ? 'Guardando...' : editingUser ? 'Actualizar Usuario' : 'Guardar Usuario'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

            )}
        </AuthenticatedLayout>
    );
}
