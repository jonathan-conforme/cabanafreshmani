import React, { useState } from 'react';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { confirmDelete } from '@/Components/SweetAlert';

export default function Index({ unidades, filters }) {
    // =========================================================
    // NO MODIFICAR ESTA LÓGICA
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
    // UX
    // =========================================================

    return (
        <AuthenticatedLayout
            header={
                <h2 >
                    Unidades de Medida
                </h2>
            }
        >
            <Head title="Unidades de Medida" />

            <div >



                {/* =================================================
                    CARD PRINCIPAL
                ================================================= */}

                <div >

                    {/* =================================================
                        HEADER
                    ================================================= */}

                    <div >

                        <div >

                            {/* TÍTULO */}

                            <div>
                                <div >

                                    {/* Icono */}

                                    <div >
                                        <svg
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth={1.7}
                                            className="h-6 w-6"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                d="M6 3v18M18 3v18M6 6h12M6 12h8M6 18h12"
                                            />
                                        </svg>
                                    </div>

                                    <div>
                                        <h1 >
                                            Unidades de Medida
                                        </h1>

                                        <p >
                                            Administra las unidades utilizadas
                                            en tus productos.
                                        </p>
                                    </div>

                                </div>
                            </div>

                            {/* BOTÓN PRINCIPAL */}

                            <button
                                type="button"
                                onClick={openCreateModal}

                            >
                                <span className="text-lg">
                                    +
                                </span>

                                Nueva unidad
                            </button>

                        </div>

                        {/* =================================================
                            BUSCADOR
                        ================================================= */}

                        <form
                            onSubmit={handleSearch}

                        >
                            <div >

                                <div >

                                    {/* Icono búsqueda */}

                                    <div>
                                        <svg
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth={2}
                                            className="h-5 w-5"
                                        >
                                            <circle
                                                cx="11"
                                                cy="11"
                                                r="7"
                                            />

                                            <path
                                                strokeLinecap="round"
                                                d="m20 20-4-4"
                                            />
                                        </svg>
                                    </div>

                                    <input
                                        type="text"
                                        value={search}
                                        onChange={(e) =>
                                            setSearch(e.target.value)
                                        }
                                        placeholder="Buscar por nombre o símbolo..."

                                    />

                                </div>

                                <button
                                    type="submit"
                                       >
                                    Buscar
                                </button>

                            </div>
                        </form>

                    </div>

                    {/* =================================================
                        TABLA
                    ================================================= */}

                    <div>

                        <table >

                            <thead>
                                <tr >

                                    <th >
                                        #
                                    </th>

                                    <th >
                                        Unidad
                                    </th>
                                    <th >
                                        Símbolo
                                    </th>

                                    <th>
                                        Acciones
                                    </th>

                                </tr>
                            </thead>

                            <tbody >

                                {/* =================================================
                                    ESTADO VACÍO
                                ================================================= */}

                                {unidades?.data?.length === 0 && (
                                    <tr>
                                        <td
                                            colSpan={4}

                                        >
                                            <div >

                                                <div >
                                                    <span >
                                                        —
                                                    </span>
                                                </div>

                                                <h3 >
                                                    No hay unidades de medida
                                                </h3>

                                                <p >
                                                    Crea tu primera unidad para
                                                    comenzar a utilizarla en
                                                    tus productos.
                                                </p>

                                                <button
                                                    type="button"
                                                    onClick={openCreateModal}

                                                >
                                                    Nueva unidad
                                                </button>

                                            </div>
                                        </td>
                                    </tr>
                                )}

                                {/* =================================================
                                    FILAS
                                ================================================= */}

                                {unidades?.data?.map((unidad) => (
                                    <tr
                                        key={unidad.id}

                                    >

                                        {/* ID */}

                                        <td >
                                            #{unidad.id}
                                        </td>

                                        {/* NOMBRE */}

                                        <td >

                                            <div >

                                                <div >
                                                    {unidad.nombre
                                                        ?.charAt(0)
                                                        ?.toUpperCase()}
                                                </div>

                                                <span>
                                                    {unidad.nombre}
                                                </span>

                                            </div>

                                        </td>

                                        {/* SÍMBOLO */}

                                        <td >

                                            <span >
                                                {unidad.simbolo}
                                            </span>

                                        </td>

                                        {/* ACCIONES */}

                                        <td >

                                            <div >

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        openEditModal(unidad)
                                                    }
                                                    className="cursor-pointer"
                                                >
                                                    Editar
                                                </button>

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        handleDelete(unidad)
                                                    }
                                                    className="cursor-pointer"
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

                    {/* =================================================
                        PAGINACIÓN
                    ================================================= */}

                    {unidades?.links?.length > 0 && (
                        <div >

                            <p >
                                Mostrando las unidades disponibles
                            </p>

                            <div >

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
                                        className={`
                                            rounded-xl
                                            px-3
                                            py-2
                                            text-sm
                                            font-medium
                                            transition
                                            ${
                                                link.active
                                                    ? 'bg-teal-700 text-white'
                                                    : link.url
                                                        ? 'bg-stone-100 text-stone-700 hover:bg-amber-100'
                                                        : 'cursor-not-allowed bg-stone-50 text-stone-300'
                                            }
                                        `}
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
                <div>

                    {/* OVERLAY */}

                    <div

                        onClick={closeModal}
                    />

                    {/* MODAL */}

                    <div>

                        {/* HEADER */}

                        <div >

                            <div >

                                <div >

                                    <div >
                                        <svg
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth={1.7}
                                            className="h-6 w-6"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                d="M6 3v18M18 3v18M6 6h12M6 12h8M6 18h12"
                                            />
                                        </svg>
                                    </div>

                                    <div>
                                        <h2 >
                                            {editingUnidad
                                                ? 'Editar unidad'
                                                : 'Nueva unidad'}
                                        </h2>

                                        <p >
                                            {editingUnidad
                                                ? 'Actualiza la información de la unidad.'
                                                : 'Registra una nueva unidad de medida.'}
                                        </p>
                                    </div>

                                </div>

                                <button
                                    type="button"
                                    onClick={closeModal}

                                >
                                    ×
                                </button>

                            </div>

                        </div>

                        {/* FORMULARIO */}

                        <form
                            onSubmit={handleSubmit}

                        >

                            {/* NOMBRE */}

                            <div>

                                <label
                                    htmlFor="nombre"

                                >
                                    Nombre
                                </label>

                                <input
                                    id="nombre"
                                    type="text"
                                    value={data.nombre}
                                    onChange={(e) =>
                                        setData(
                                            'nombre',
                                            e.target.value
                                        )
                                    }
                                    placeholder="Ej. Kilogramo"
                                          />

                                {errors.nombre && (
                                    <p >
                                        {errors.nombre}
                                    </p>
                                )}

                            </div>

                            {/* SIMBOLO */}

                            <div>

                                <label
                                    htmlFor="simbolo"
                                               >
                                    Símbolo
                                </label>

                                <input
                                    id="simbolo"
                                    type="text"
                                    value={data.simbolo}
                                    onChange={(e) =>
                                        setData(
                                            'simbolo',
                                            e.target.value
                                        )
                                    }
                                    placeholder="Ej. kg"
                                            />

                                {errors.simbolo && (
                                    <p>
                                        {errors.simbolo}
                                    </p>
                                )}

                            </div>

                            {/* ACCIONES */}

                            <div >

                                <button
                                    type="button"
                                    onClick={closeModal}
                                             >
                                    Cancelar
                                </button>

                                <button
                                    type="submit"
                                    disabled={processing}
                                            >
                                    {processing
                                        ? 'Guardando...'
                                        : editingUnidad
                                            ? 'Actualizar unidad'
                                            : 'Guardar unidad'}
                                </button>

                            </div>

                        </form>

                    </div>

                </div>
            )}
        </AuthenticatedLayout>
    );
}
