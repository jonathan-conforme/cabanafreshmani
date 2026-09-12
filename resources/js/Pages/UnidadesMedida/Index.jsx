import React, { useState } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { confirmDelete } from '@/Components/SweetAlert';
import Tooltip from '@/Components/Tooltip';
import { Scale, Plus, Search, Pencil, Trash, X, Layers } from 'lucide-react';

export default function Index({ unidades, filters }) {
    // =========================================================
    // NO MODIFICAR ESTA LÓGICA (SE CONSERVA INTACTA)
    // =========================================================

    const [showModal, setShowModal] = useState(false);
    const [editingUnidad, setEditingUnidad] = useState(null);
    const [search, setSearch] = useState(filters?.search || '');

    const {
        data,
        setData,
        post,
        put,
        processing,
        errors,
        reset,
    } = useForm({
        nombre: '',
        simbolo: '',
    });

    const openCreateModal = () => {
        setEditingUnidad(null);
        reset();
        setData({
            nombre: '',
            simbolo: '',
        });
        setShowModal(true);
    };

    const openEditModal = (unidad) => {
        setEditingUnidad(unidad);

        setData({
            nombre: unidad.nombre || '',
            simbolo: unidad.simbolo || '',
        });

        setShowModal(true);
    };

    const closeModal = () => {
        reset();
        setEditingUnidad(null);

        setData({
            nombre: '',
            simbolo: '',
        });

        setShowModal(false);
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (editingUnidad) {
            put(route('unidad-medidas.update', editingUnidad.id), {
                onSuccess: () => closeModal(),
            });

            return;
        }

        post(route('unidad-medidas.store'), {
            onSuccess: () => closeModal(),
        });
    };

    const handleDelete = async (unidad) => {
        if (
            await confirmDelete(
                'Esta acción no se puede deshacer.',
                `¿Eliminar la unidad "${unidad.nombre}"?`
            )
        ) {
            router.delete(
                route('unidad-medidas.destroy', unidad.id)
            );
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();

        router.get(
            route('unidad-medidas.index'),
            { search },
            {
                preserveState: true,
                replace: true,
            }
        );
    };

    // =========================================================
    // VISTA Y UX
    // =========================================================

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-bold tracking-tight text-stone-800">
                    Unidades de Medida
                </h2>
            }
        >
            <Head title="Unidades de Medida" />

            <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-10 lg:px-8">
                {/* =================================================
                    CARD PRINCIPAL
                ================================================= */}
                <div className="overflow-hidden rounded-[28px] bg-white shadow-sm ring-1 ring-amber-100">

                    {/* =================================================
                        HEADER Y BUSCADOR
                    ================================================= */}
                    <div className="border-b border-amber-100 bg-gradient-to-br from-amber-50 to-white px-5 py-5 sm:px-7 sm:py-6">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                            {/* TÍTULO E ÍCONO */}
                            <div className="flex items-center gap-3">
                                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-teal-50 text-teal-700 shadow-xs ring-1 ring-teal-100">
                                    <Scale size={24} strokeWidth={2} />
                                </div>
                                <div>
                                    <h1 className="text-lg font-bold text-teal-700">
                                        Unidades de Medida
                                    </h1>
                                    <p className="text-xs text-stone-500">
                                        Administra las magnitudes y unidades utilizadas en tus productos.
                                    </p>
                                </div>
                            </div>

                            {/* BOTÓN PRINCIPAL */}
                            <button
                                type="button"
                                onClick={openCreateModal}
                                className="cursor-pointer inline-flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-br from-orange-500 to-orange-800 px-6 py-2.5 text-xs font-extrabold uppercase tracking-wide text-white transition hover:shadow-lg sm:w-auto"
                            >
                                <Plus size={16} strokeWidth={3} />
                                Nueva unidad
                            </button>
                        </div>

                        {/* BUSCADOR */}
                        <form onSubmit={handleSearch} className="mt-5">
                            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                                <div className="relative flex-1">
                                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-stone-400">
                                        <Search size={18} />
                                    </div>
                                    <input
                                        type="text"
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        placeholder="Buscar por nombre o símbolo..."
                                        className="w-full rounded-xl border border-stone-200 bg-white pl-10 pr-4 py-2 text-sm text-stone-800 outline-none placeholder:text-stone-400 focus:border-teal-600 focus:ring-1 focus:ring-teal-600"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    className="cursor-pointer rounded-xl bg-stone-800 px-5 py-2 text-xs font-bold uppercase tracking-wider text-white transition hover:bg-stone-900"
                                >
                                    Buscar
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* =================================================
                        TABLA
                    ================================================= */}
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[600px] text-left text-sm">
                            <thead>
                                <tr className="bg-amber-50/60 text-xs font-extrabold uppercase tracking-wide text-stone-500">
                                    <th className="px-5 py-3.5 sm:px-7">#</th>
                                    <th className="px-5 py-3.5 sm:px-7">Unidad</th>
                                    <th className="px-5 py-3.5 sm:px-7">Símbolo</th>
                                    <th className="px-5 py-3.5 text-center sm:px-7">Acciones</th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-amber-100">
                                {/* ESTADO VACÍO */}
                                {unidades?.data?.length === 0 && (
                                    <tr>
                                        <td colSpan={4} className="px-5 py-12 text-center">
                                            <div className="mx-auto flex max-w-sm flex-col items-center justify-center">
                                                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-amber-100 text-amber-700">
                                                    <Layers size={28} />
                                                </div>
                                                <h3 className="mt-3 text-base font-bold text-stone-800">
                                                    No hay unidades de medida
                                                </h3>
                                                <p className="mt-1 text-xs text-stone-500">
                                                    Crea tu primera unidad para comenzar a utilizarla en tus productos.
                                                </p>
                                                <button
                                                    type="button"
                                                    onClick={openCreateModal}
                                                    className="mt-4 inline-flex items-center gap-2 rounded-full bg-orange-600 px-5 py-2 text-xs font-bold uppercase tracking-wider text-white hover:bg-orange-700"
                                                >
                                                    <Plus size={16} />
                                                    Nueva unidad
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                )}

                                {/* FILAS DE REGISTROS */}
                                {unidades?.data?.map((unidad) => (
                                    <tr key={unidad.id} className="transition hover:bg-amber-50/40">
                                        {/* ID */}
                                        <td className="px-5 py-4 text-xs font-bold text-stone-400 sm:px-7">
                                            #{unidad.id}
                                        </td>

                                        {/* NOMBRE */}
                                        <td className="px-5 py-4 font-semibold text-stone-800 sm:px-7">
                                            <div className="flex items-center gap-3">
                                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-100 text-xs font-black uppercase text-amber-800">
                                                    {unidad.nombre?.charAt(0)?.toUpperCase()}
                                                </div>
                                                <span>{unidad.nombre}</span>
                                            </div>
                                        </td>

                                        {/* SÍMBOLO */}
                                        <td className="px-5 py-4 sm:px-7">
                                            <span className="inline-flex items-center rounded-md bg-teal-50 px-2.5 py-1 text-xs font-bold tracking-wide text-teal-700 border border-teal-200/50">
                                                {unidad.simbolo}
                                            </span>
                                        </td>

                                        {/* ACCIONES */}
                                        <td className="px-5 py-4 sm:px-7">
                                            <div className="flex items-center justify-center gap-2">
                                                <Tooltip text="Editar unidad">
                                                    <button
                                                        type="button"
                                                        onClick={() => openEditModal(unidad)}
                                                        className="cursor-pointer rounded-lg p-2 text-teal-600 transition hover:bg-teal-50"
                                                    >
                                                        <Pencil size={18} color="#2563eb" />
                                                    </button>
                                                </Tooltip>

                                                <Tooltip text="Eliminar unidad">
                                                    <button
                                                        type="button"
                                                        onClick={() => handleDelete(unidad)}
                                                        className="cursor-pointer rounded-lg p-2 text-red-600 transition hover:bg-red-50"
                                                    >
                                                        <Trash size={18} color="#dc2626" />
                                                    </button>
                                                </Tooltip>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* =================================================
                        PAGINACIÓN
                    ================================================= */}
                    {unidades?.links?.length > 0 && (
                        <div className="flex flex-col items-center justify-between gap-3 border-t border-amber-100 px-5 py-4 sm:flex-row sm:px-7">
                            <p className="text-xs text-stone-500">
                                Mostrando registros de la página actual
                            </p>
                            <div className="flex flex-wrap gap-1">
                                {unidades.links.map((link, index) => (
                                    <button
                                        key={index}
                                        type="button"
                                        disabled={!link.url}
                                        onClick={() => {
                                            if (link.url) {
                                                router.get(
                                                    link.url,
                                                    {},
                                                    {
                                                        preserveState: true,
                                                        preserveScroll: true,
                                                    }
                                                );
                                            }
                                        }}
                                        dangerouslySetInnerHTML={{
                                            __html: link.label,
                                        }}
                                        className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                                            link.active
                                                ? 'bg-teal-700 text-white shadow-xs'
                                                : link.url
                                                  ? 'bg-stone-100 text-stone-700 hover:bg-amber-100'
                                                  : 'cursor-not-allowed bg-stone-50 text-stone-300'
                                        }`}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* =========================================================
                MODAL CREAR / EDITAR
            ========================================================= */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
                    {/* OVERLAY */}
                    <div
                        className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
                        onClick={closeModal}
                    />

                    {/* VENTANA MODAL */}
                    <div className="relative z-10 w-full max-w-md rounded-2xl bg-white p-6 shadow-xl border border-stone-100">
                        {/* HEADER */}
                        <div className="mb-5 flex items-center justify-between border-b border-stone-100 pb-4">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-50 text-teal-700">
                                    <Scale size={20} />
                                </div>
                                <div>
                                    <h2 className="text-base font-bold text-stone-800">
                                        {editingUnidad ? 'Editar Unidad' : 'Nueva Unidad'}
                                    </h2>
                                    <p className="text-xs text-stone-500">
                                        {editingUnidad
                                            ? 'Actualiza los datos de la unidad.'
                                            : 'Ingresa los campos correspondientes.'}
                                    </p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={closeModal}
                                className="cursor-pointer rounded-lg p-1 text-stone-400 hover:bg-stone-100 hover:text-stone-700"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* FORMULARIO */}
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* NOMBRE */}
                            <div>
                                <label htmlFor="nombre" className="mb-1.5 block text-xs font-bold text-stone-700 uppercase tracking-wide">
                                    Nombre de la unidad
                                </label>
                                <input
                                    id="nombre"
                                    type="text"
                                    value={data.nombre}
                                    onChange={(e) => setData('nombre', e.target.value)}
                                    placeholder="Ej. Kilogramo, Litro, Unidad"
                                    className="w-full rounded-xl border border-stone-300 px-3.5 py-2 text-sm text-stone-800 outline-none focus:border-teal-600 focus:ring-1 focus:ring-teal-600"
                                />
                                {errors.nombre && (
                                    <p className="mt-1 text-xs text-red-600">{errors.nombre}</p>
                                )}
                            </div>

                            {/* SÍMBOLO */}
                            <div>
                                <label htmlFor="simbolo" className="mb-1.5 block text-xs font-bold text-stone-700 uppercase tracking-wide">
                                    Símbolo o Abreviatura
                                </label>
                                <input
                                    id="simbolo"
                                    type="text"
                                    value={data.simbolo}
                                    onChange={(e) => setData('simbolo', e.target.value)}
                                    placeholder="Ej. kg, L, und"
                                    className="w-full rounded-xl border border-stone-300 px-3.5 py-2 text-sm text-stone-800 outline-none focus:border-teal-600 focus:ring-1 focus:ring-teal-600"
                                />
                                {errors.simbolo && (
                                    <p className="mt-1 text-xs text-red-600">{errors.simbolo}</p>
                                )}
                            </div>

                            {/* ACCIONES */}
                            <div className="flex items-center justify-end gap-3 border-t border-stone-100 pt-4">
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    disabled={processing}
                                    className="cursor-pointer rounded-xl border border-stone-300 px-4 py-2 text-xs font-semibold text-stone-700 hover:bg-stone-50 disabled:opacity-50"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="cursor-pointer rounded-xl bg-orange-600 px-5 py-2 text-xs font-bold uppercase tracking-wider text-white hover:bg-orange-700 disabled:opacity-50 shadow-xs"
                                >
                                    {processing
                                        ? 'Guardando...'
                                        : editingUnidad
                                          ? 'Actualizar'
                                          : 'Guardar'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
