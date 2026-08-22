import { useState } from 'react';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { confirmDelete } from '@/Components/SweetAlert';
import Tooltip from '@/Components/Tooltip';
import { Pencil, Trash } from 'lucide-react';

export default function Index({ clientes, filters }) {

    const { errors } = usePage().props;

    const [search, setSearch] = useState(filters?.search || '');
    const [showModal, setShowModal] = useState(false);
    const [editingCliente, setEditingCliente] = useState(null);

    const {
        data,
        setData,
        post,
        put,
        delete: destroy,
        reset,
        processing,
    } = useForm({
        nombre: '',
        apellido: '',
        identificacion: '',
        telefono: '',
        email: '',
        limite_credito: '',
    });

    // =========================
    // ABRIR MODAL CREAR
    // =========================

    const handleCreate = () => {
        setEditingCliente(null);

        reset();

        setShowModal(true);
    };

    // =========================
    // ABRIR MODAL EDITAR
    // =========================

    const handleEdit = (cliente) => {

        setEditingCliente(cliente);

        setData({
            nombre: cliente.nombre || '',
            apellido: cliente.apellido || '',
            identificacion: cliente.identificacion || '',
            telefono: cliente.telefono || '',
            email: cliente.email || '',
            limite_credito: cliente.limite_credito || '',
        });

        setShowModal(true);
    };

    // =========================
    // CERRAR MODAL
    // =========================

    const handleCloseModal = () => {

        setShowModal(false);

        setEditingCliente(null);

        reset();
    };

    // =========================
    // GUARDAR / ACTUALIZAR
    // =========================

    const handleSubmit = (e) => {

        e.preventDefault();

        if (editingCliente) {

            put(
                route(
                    'clientes.update',
                    editingCliente.id
                ),
                {
                    onSuccess: () => {
                        handleCloseModal();
                    },
                }
            );

        } else {

            post(
                route('clientes.store'),
                {
                    onSuccess: () => {
                        handleCloseModal();
                    },
                }
            );
        }
    };

    // =========================
    // ELIMINAR
    // =========================

    const handleDelete = async (id) => {

        if (await confirmDelete('Esta acción no se puede deshacer.', '¿Eliminar este cliente?')) {

            destroy(
                route('clientes.destroy', id)
            );
        }
    };

    // =========================
    // BUSCAR
    // =========================

    const handleSearch = (e) => {

        e.preventDefault();

        router.get(
            route('clientes.index'),
            {
                search,
            },
            {
                preserveState: true,
                preserveScroll: true,
            }
        );
    };

    // =========================
    // HELPERS DE FORMATO
    // =========================

    const formatMoney = (valor) => {

        const numero = Number(valor || 0);

        return numero.toLocaleString('es-EC', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2,
        });
    };

    const inputClass =
        'w-full rounded-lg border border-[#E5DCC0] bg-[#FFFDF6] px-4 py-2.5 text-sm text-[#3F3A2E] ' +
        'placeholder-[#B6A87E] outline-none transition focus:border-[#0E7C86] focus:ring-2 focus:ring-[#0E7C86]/20';

    const labelClass =
        'mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-[#8A7A4E]';

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-bold text-[#0E7C86]">
                    Gestión de Clientes
                </h2>
            }
        >

            <Head title="Clientes" />

            <div className="min-h-screen bg-[#FDF8E7] py-8">

                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

                    {/* =========================
                        MENSAJE SUCCESS
                    ========================= */}


                    {/* =========================
                        TARJETA PRINCIPAL
                    ========================= */}

                    <div className="overflow-hidden rounded-2xl border border-[#F0E6C8] bg-white shadow-[0_10px_30px_-12px_rgba(120,100,50,0.25)]">

                        {/* =========================
                            CABECERA
                        ========================= */}

                        <div className="flex flex-col gap-4 px-6 pt-6 pb-5 sm:flex-row sm:items-start sm:justify-between sm:px-8 sm:pt-7">

                            <div>

                                <h1 className="text-xl font-extrabold tracking-tight text-[#0E7C86] sm:text-2xl">
                                    Clientes Registrados
                                </h1>

                                <p className="mt-1 text-sm text-[#A3915F]">
                                    Administra los clientes del sistema.
                                </p>

                            </div>

                            <button
                                type="button"
                                onClick={handleCreate}
                                className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-[#F08A24] to-[#E2650F] px-7 py-3 text-xs font-extrabold uppercase tracking-wider text-white shadow-lg shadow-[#E2650F]/25 transition hover:brightness-110 active:scale-[0.98]"
                            >
                                Nuevo Cliente
                            </button>

                        </div>

                        {/* =========================
                            BUSCADOR
                        ========================= */}

                        <form
                            onSubmit={handleSearch}
                            className="flex flex-col gap-3 px-6 pb-5 sm:flex-row sm:items-center sm:px-8"
                        >

                            <input
                                type="text"
                                value={search}
                                onChange={(e) =>
                                    setSearch(e.target.value)
                                }
                                placeholder="Buscar cliente..."
                                className={inputClass + ' sm:max-w-sm'}
                            />

                            <button
                                type="submit"
                                className="rounded-full border border-[#0E7C86] px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-[#0E7C86] transition hover:bg-[#0E7C86] hover:text-white"
                            >
                                Buscar
                            </button>

                        </form>

                        {/* =========================
                            TABLA
                        ========================= */}

                        <div className="overflow-x-auto border-t border-[#F1EAD5]">

                            <table className="min-w-full">

                                <thead>

                                    <tr className="border-b border-[#F1EAD5] bg-white">

                                        <th className="px-6 py-4 text-left text-[11px] font-bold uppercase tracking-wider text-[#8A7A4E] sm:px-8">
                                            Nombre
                                        </th>

                                        <th className="px-6 py-4 text-left text-[11px] font-bold uppercase tracking-wider text-[#8A7A4E]">
                                            Identificación
                                        </th>

                                        <th className="px-6 py-4 text-left text-[11px] font-bold uppercase tracking-wider text-[#8A7A4E]">
                                            Teléfono
                                        </th>

                                        <th className="px-6 py-4 text-left text-[11px] font-bold uppercase tracking-wider text-[#8A7A4E]">
                                            Correo
                                        </th>
                                        <th className="px-6 py-4 text-left text-[11px] font-bold uppercase tracking-wider text-[#8A7A4E]">
                                            Límite de crédito
                                        </th>

                                        <th className="px-6 py-4 text-right text-[11px] font-bold uppercase tracking-wider text-[#8A7A4E] sm:px-8">
                                            Acciones
                                        </th>

                                    </tr>

                                </thead>

                                <tbody>

                                    {clientes.data.length > 0 ? (

                                        clientes.data.map((cliente) => (

                                            <tr
                                                key={cliente.id}
                                                className="border-b border-[#F1EAD5] transition-colors last:border-0 hover:bg-[#FFFBEF]"
                                            >

                                                <td className="px-6 py-5 sm:px-8">

                                                    <span className="block text-sm font-bold text-[#2F2A20]">
                                                        {cliente.nombre} {cliente.apellido}
                                                    </span>

                                                    <span className="mt-0.5 block text-xs text-[#B6A87E]">
                                                        ID #{cliente.id}
                                                    </span>

                                                </td>

                                                <td className="whitespace-nowrap px-6 py-5 text-sm text-[#7A6A45]">
                                                    {cliente.identificacion}
                                                </td>

                                                <td className="whitespace-nowrap px-6 py-5 text-sm text-[#7A6A45]">
                                                    {cliente.telefono}
                                                </td>

                                                <td className="px-6 py-5 text-sm text-[#7A6A45]">
                                                    {cliente.email}
                                                </td>

                                                <td className="whitespace-nowrap px-6 py-5">

                                                    <span className="inline-flex rounded-md bg-[#DFF3EF] px-3 py-1.5 text-[11px] font-extrabold uppercase tracking-wider text-[#0E7C86]">
                                                        {formatMoney(cliente.limite_credito)}
                                                    </span>

                                                </td>

                                                <td className="whitespace-nowrap px-6 py-5 text-right sm:px-8">

                                                    <div className="flex items-center justify-end gap-5">
                                                        <Tooltip text="Editar cliente">
                                                            <button
                                                                type="button"
                                                                onClick={() => handleEdit(cliente)}
                                                                className="cursor-pointer text-sm font-semibold text-[#0E7C86] transition hover:underline"
                                                            >
                                                                <Pencil size={20} color="#2563eb" />
                                                            </button>
                                                        </Tooltip>

                                                        <Tooltip text="Eliminar cliente">
                                                            <button
                                                                type="button"
                                                                onClick={() => handleDelete(cliente.id)}
                                                                className="cursor-pointer text-sm font-semibold text-[#D64545] transition hover:underline"
                                                            >
                                                                <Trash size={20} color="#dc2626" />
                                                            </button>
                                                        </Tooltip>
                                                    </div>

                                                </td>

                                            </tr>

                                        ))

                                    ) : (

                                        <tr>

                                            <td
                                                colSpan="6"
                                                className="px-8 py-12 text-center text-sm text-[#A3915F]"
                                            >
                                                No se encontraron clientes.
                                            </td>

                                        </tr>

                                    )}

                                </tbody>

                            </table>

                        </div>

                        {/* =========================
                            PAGINACIÓN
                        ========================= */}

                        {clientes.links.length > 3 && (

                            <div className="flex flex-wrap items-center justify-center gap-1.5 border-t border-[#F1EAD5] px-6 py-5 sm:px-8">

                                {clientes.links.map(
                                    (link, index) => (

                                        <Link
                                            key={index}
                                            href={link.url || '#'}
                                            preserveScroll
                                            className={
                                                'min-w-[38px] rounded-lg px-3 py-2 text-center text-sm font-semibold transition ' +
                                                (link.active
                                                    ? 'bg-[#0E7C86] text-white shadow-sm'
                                                    : link.url
                                                        ? 'text-[#7A6A45] hover:bg-[#FDF8E7] hover:text-[#0E7C86]'
                                                        : 'cursor-not-allowed text-[#D6CBA8]')
                                            }
                                            dangerouslySetInnerHTML={{
                                                __html: link.label,
                                            }}
                                        />

                                    )
                                )}

                            </div>

                        )}

                    </div>

                </div>

            </div>

            {/* =========================
                MODAL
            ========================= */}

            {showModal && (

                <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 p-4 backdrop-blur-sm">

                    <div className="w-full max-w-2xl overflow-hidden rounded-2xl border border-[#F0E6C8] bg-white shadow-2xl">

                        <div className="border-b border-[#F1EAD5] bg-[#FDF8E7] px-7 py-5">

                            <h2 className="text-lg font-extrabold text-[#0E7C86]">
                                {editingCliente
                                    ? 'Editar Cliente'
                                    : 'Nuevo Cliente'}
                            </h2>

                            <p className="mt-0.5 text-xs text-[#A3915F]">
                                Completa la información del cliente.
                            </p>

                        </div>

                        <form
                            onSubmit={handleSubmit}
                            className="px-7 py-6"
                        >

                            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">

                                {/* NOMBRE */}

                                <div>

                                    <label className={labelClass}>
                                        Nombre
                                    </label>

                                    <input
                                        type="text"
                                        value={data.nombre}
                                        onChange={(e) =>
                                            setData(
                                                'nombre',
                                                e.target.value
                                            )
                                        }
                                        className={inputClass}
                                    />

                                    {errors.nombre && (
                                        <p className="mt-1.5 text-xs font-semibold text-[#D64545]">
                                            {errors.nombre}
                                        </p>
                                    )}

                                </div>

                                {/* APELLIDO */}

                                <div>

                                    <label className={labelClass}>
                                        Apellido
                                    </label>

                                    <input
                                        type="text"
                                        value={data.apellido}
                                        onChange={(e) =>
                                            setData(
                                                'apellido',
                                                e.target.value
                                            )
                                        }
                                        className={inputClass}
                                    />

                                    {errors.apellido && (
                                        <p className="mt-1.5 text-xs font-semibold text-[#D64545]">
                                            {errors.apellido}
                                        </p>
                                    )}

                                </div>

                                {/* IDENTIFICACIÓN */}

                                <div>

                                    <label className={labelClass}>
                                        Identificación
                                    </label>

                                    <input
                                        type="text"
                                        value={data.identificacion}
                                        onChange={(e) =>
                                            setData(
                                                'identificacion',
                                                e.target.value
                                            )
                                        }
                                        className={inputClass}
                                    />

                                    {errors.identificacion && (
                                        <p className="mt-1.5 text-xs font-semibold text-[#D64545]">
                                            {errors.identificacion}
                                        </p>
                                    )}

                                </div>

                                {/* TELÉFONO */}

                                <div>

                                    <label className={labelClass}>
                                        Teléfono
                                    </label>

                                    <input
                                        type="text"
                                        value={data.telefono}
                                        onChange={(e) =>
                                            setData(
                                                'telefono',
                                                e.target.value
                                            )
                                        }
                                        className={inputClass}
                                    />

                                    {errors.telefono && (
                                        <p className="mt-1.5 text-xs font-semibold text-[#D64545]">
                                            {errors.telefono}
                                        </p>
                                    )}

                                </div>

                                {/* EMAIL */}

                                <div>

                                    <label className={labelClass}>
                                        Email
                                    </label>

                                    <input
                                        type="email"
                                        value={data.email}
                                        onChange={(e) =>
                                            setData(
                                                'email',
                                                e.target.value
                                            )
                                        }
                                        className={inputClass}
                                    />

                                    {errors.email && (
                                        <p className="mt-1.5 text-xs font-semibold text-[#D64545]">
                                            {errors.email}
                                        </p>
                                    )}

                                </div>

                                {/* LÍMITE DE CRÉDITO */}

                                <div>

                                    <label className={labelClass}>
                                        Límite de crédito
                                    </label>

                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={data.limite_credito}
                                        onChange={(e) =>
                                            setData(
                                                'limite_credito',
                                                e.target.value
                                            )
                                        }
                                        className={inputClass}
                                    />

                                    {errors.limite_credito && (
                                        <p className="mt-1.5 text-xs font-semibold text-[#D64545]">
                                            {errors.limite_credito}
                                        </p>
                                    )}

                                </div>

                            </div>

                            {/* BOTONES */}

                            <div className="mt-8 flex flex-col-reverse gap-3 border-t border-[#F1EAD5] pt-5 sm:flex-row sm:justify-end">

                                <button
                                    type="button"
                                    onClick={handleCloseModal}
                                    className="rounded-full border border-[#E5DCC0] px-7 py-3 text-xs font-bold uppercase tracking-wider text-[#7A6A45] transition hover:bg-[#FDF8E7]"
                                >
                                    Cancelar
                                </button>

                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="rounded-full bg-gradient-to-r from-[#F08A24] to-[#E2650F] px-7 py-3 text-xs font-extrabold uppercase tracking-wider text-white shadow-lg shadow-[#E2650F]/25 transition hover:brightness-110 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    {processing
                                        ? 'Guardando...'
                                        : editingCliente
                                            ? 'Actualizar'
                                            : 'Guardar'}
                                </button>

                            </div>

                        </form>

                    </div>

                </div>

            )}

        </AuthenticatedLayout>
    );}
