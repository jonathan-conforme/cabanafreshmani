import { useState } from 'react';
import { useForm, router, usePage, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { confirmDelete } from '@/Components/SweetAlert';
import Tooltip from '@/Components/Tooltip';
import { Pencil, Trash } from 'lucide-react';

export default function Index({ proveedores, filters }) {
    const { errors } = usePage().props;

    const [search, setSearch] = useState(filters.search || '');
    const [showModal, setShowModal] = useState(false);
    const [editingProveedor, setEditingProveedor] = useState(null);

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
        contacto: '',
        telefono: '',
        email: '',
    });

    // =========================
    // ABRIR MODAL - CREAR
    // =========================

    const openCreateModal = () => {
        setEditingProveedor(null);
        reset();
        setShowModal(true);
    };

    // =========================
    // ABRIR MODAL - EDITAR
    // =========================

    const handleEdit = (proveedor) => {
        setEditingProveedor(proveedor);

        setData({
            nombre: proveedor.nombre || '',
            contacto: proveedor.contacto || '',
            telefono: proveedor.telefono || '',
            email: proveedor.email || '',
        });

        setShowModal(true);
    };

    // =========================
    // CERRAR MODAL
    // =========================

    const closeModal = () => {
        if (processing) return;

        setShowModal(false);
        setEditingProveedor(null);
        reset();
    };

    // =========================
    // CREAR / ACTUALIZAR
    // =========================

    const handleSubmit = (e) => {
        e.preventDefault();

        if (editingProveedor) {
            put(
                route('proveedores.update', editingProveedor.id),
                {
                    onSuccess: () => {
                        closeModal();
                    },
                }
            );
        } else {
            post(
                route('proveedores.store'),
                {
                    onSuccess: () => {
                        closeModal();
                    },
                }
            );
        }
    };

    // =========================
    // ELIMINAR
    // =========================

    const handleDelete = async (id) => {
        if (await confirmDelete('Esta acción no se puede deshacer.', '¿Eliminar proveedor?')) {
            destroy(route('proveedores.destroy', id));
        }
    };

    // =========================
    // BUSCAR
    // =========================

    const handleSearch = (e) => {
        e.preventDefault();

        router.get(
            route('proveedores.index'),
            { search },
            {
                preserveState: true,
            }
        );
    };

    // =========================
    // ESTILOS REUTILIZABLES
    // =========================

    const inputClass =
        'w-full rounded-lg border border-[#E5DCC0] bg-[#FFFDF6] px-4 py-2.5 text-sm text-[#3F3A2E] ' +
        'placeholder-[#B6A87E] outline-none transition focus:border-[#0E7C86] focus:ring-2 focus:ring-[#0E7C86]/20';

    const labelClass =
        'mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-[#8A7A4E]';

    const thClass =
        'px-6 py-4 text-left text-[11px] font-bold uppercase tracking-wider text-[#8A7A4E]';

    const errorClass =
        'mt-1.5 text-xs font-semibold text-[#D64545]';

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-bold text-[#0E7C86]">
                    Gestión de Proveedores
                </h2>
            }
        >

            <div className="min-h-screen bg-[#FDF8E7] py-8">

                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">


                    {/* ========================= */}
                    {/* CONTENEDOR PRINCIPAL */}
                    {/* ========================= */}

                    <div className="overflow-hidden rounded-2xl border border-[#F0E6C8] bg-white shadow-[0_10px_30px_-12px_rgba(120,100,50,0.25)]">

                        {/* HEADER */}

                        <div className="px-6 pt-6 sm:px-8 sm:pt-7">

                            <div className="flex flex-col gap-4 pb-5 sm:flex-row sm:items-start sm:justify-between">

                                <div>
                                    <h1 className="text-xl font-extrabold tracking-tight text-[#0E7C86] sm:text-2xl">
                                        Proveedores Registrados
                                    </h1>

                                    <p className="mt-1 text-sm text-[#A3915F]">
                                        Administra los proveedores del sistema.
                                    </p>
                                </div>

                                <button
                                    type="button"
                                    onClick={openCreateModal}
                                    className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-[#F08A24] to-[#E2650F] px-7 py-3 text-xs font-extrabold uppercase tracking-wider text-white shadow-lg shadow-[#E2650F]/25 transition hover:brightness-110 active:scale-[0.98]"
                                >
                                    Nuevo Proveedor
                                </button>

                            </div>

                            {/* BUSCADOR */}

                            <form
                                onSubmit={handleSearch}
                                className="flex flex-col gap-3 pb-5 sm:flex-row sm:items-center"
                            >
                                <input
                                    type="text"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Buscar proveedor..."
                                    className={inputClass + ' sm:max-w-sm'}
                                />

                                <button
                                    type="submit"
                                    className="rounded-full border border-[#0E7C86] px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-[#0E7C86] transition hover:bg-[#0E7C86] hover:text-white"
                                >
                                    Buscar
                                </button>
                            </form>

                        </div>

                        {/* ========================= */}
                        {/* TABLA */}
                        {/* ========================= */}

                        <div className="overflow-x-auto border-t border-[#F1EAD5]">

                            <table className="min-w-full">
                                <thead>
                                    <tr className="border-b border-[#F1EAD5] bg-white">
                                        <th className={thClass + ' sm:pl-8'}>
                                            Nombre
                                        </th>

                                        <th className={thClass}>
                                            Contacto
                                        </th>

                                        <th className={thClass}>
                                            Teléfono
                                        </th>

                                        <th className={thClass}>
                                            Email
                                        </th>

                                        <th className="px-6 py-4 text-right text-[11px] font-bold uppercase tracking-wider text-[#8A7A4E] sm:pr-8">
                                            Acciones
                                        </th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {proveedores.data.length > 0 ? (
                                        proveedores.data.map((proveedor) => (
                                            <tr
                                                key={proveedor.id}
                                                className="border-b border-[#F1EAD5] transition-colors last:border-0 hover:bg-[#FFFBEF]"
                                            >
                                                <td className="px-6 py-5 sm:pl-8">
                                                    <span className="block text-sm font-bold text-[#2F2A20]">
                                                        {proveedor.nombre}
                                                    </span>

                                                    <span className="mt-0.5 block text-xs text-[#B6A87E]">
                                                        ID #{proveedor.id}
                                                    </span>
                                                </td>

                                                <td className="whitespace-nowrap px-6 py-5 text-sm text-[#7A6A45]">
                                                    {proveedor.contacto || '-'}
                                                </td>

                                                <td className="whitespace-nowrap px-6 py-5 text-sm text-[#7A6A45]">
                                                    {proveedor.telefono || '-'}
                                                </td>

                                                <td className="px-6 py-5 text-sm text-[#7A6A45]">
                                                    {proveedor.email || '-'}
                                                </td>

                                                <td className="whitespace-nowrap px-6 py-5 text-right sm:pr-8">
                                                    <div className="flex items-center justify-end gap-5">
                                                        <Tooltip text="Editar proveedor">
                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    handleEdit(proveedor)
                                                                }
                                                                className="cursor-pointer text-sm font-semibold text-[#0E7C86] transition hover:underline"
                                                            >
                                                                <Pencil size={20} color="#2563eb" />
                                                            </button>
                                                        </Tooltip>

                                                        <Tooltip text="Eliminar proveedor">
                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    handleDelete(proveedor.id)
                                                                }
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
                                                colSpan="5"
                                                className="px-8 py-12 text-center text-sm text-[#A3915F]"
                                            >
                                                No se encontraron proveedores.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>

                        </div>

                        {/* ========================= */}
                        {/* PAGINACIÓN */}
                        {/* ========================= */}

                        {proveedores.links.length > 3 && (
                            <nav className="flex flex-wrap items-center justify-center gap-1.5 border-t border-[#F1EAD5] px-6 py-5 sm:px-8">
                                {proveedores.links.map((link, index) => (
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
                                ))}
                            </nav>
                        )}

                    </div>

                </div>

            </div>

            {/* ========================= */}
            {/* MODAL */}
            {/* ========================= */}

            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 p-4 backdrop-blur-sm">

                    <div className="w-full max-w-2xl overflow-hidden rounded-2xl border border-[#F0E6C8] bg-white shadow-2xl">

                        {/* MODAL HEADER */}

                        <header className="flex items-start justify-between gap-4 border-b border-[#F1EAD5] bg-[#FDF8E7] px-7 py-5">
                            <div>
                                <h2 className="text-lg font-extrabold text-[#0E7C86]">
                                    {editingProveedor
                                        ? 'Editar Proveedor'
                                        : 'Nuevo Proveedor'}
                                </h2>

                                <p className="mt-0.5 text-xs text-[#A3915F]">
                                    Completa la información del proveedor.
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={closeModal}
                                className="flex h-9 w-9 items-center justify-center rounded-full text-2xl leading-none text-[#A3915F] transition hover:bg-white hover:text-[#D64545]"
                            >
                                ×
                            </button>
                        </header>

                        {/* FORMULARIO */}

                        <form
                            onSubmit={handleSubmit}
                            className="px-7 py-6"
                        >

                            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">

                                {/* NOMBRE */}

                                <div className="sm:col-span-2">
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
                                        <span className={errorClass}>
                                            {errors.nombre}
                                        </span>
                                    )}
                                </div>

                                {/* CONTACTO */}

                                <div>
                                    <label className={labelClass}>
                                        Contacto
                                    </label>

                                    <input
                                        type="text"
                                        value={data.contacto}
                                        onChange={(e) =>
                                            setData(
                                                'contacto',
                                                e.target.value
                                            )
                                        }
                                        className={inputClass}
                                    />

                                    {errors.contacto && (
                                        <span className={errorClass}>
                                            {errors.contacto}
                                        </span>
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
                                        <span className={errorClass}>
                                            {errors.telefono}
                                        </span>
                                    )}
                                </div>

                                {/* EMAIL */}

                                <div className="sm:col-span-2">
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
                                        <span className={errorClass}>
                                            {errors.email}
                                        </span>
                                    )}
                                </div>

                            </div>

                            {/* BOTONES */}

                            <div className="mt-8 flex flex-col-reverse gap-3 border-t border-[#F1EAD5] pt-5 sm:flex-row sm:justify-end">
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    disabled={processing}
                                    className="rounded-full border border-[#E5DCC0] px-7 py-3 text-xs font-bold uppercase tracking-wider text-[#7A6A45] transition hover:bg-[#FDF8E7] disabled:cursor-not-allowed disabled:opacity-60"
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
                                        : editingProveedor
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
