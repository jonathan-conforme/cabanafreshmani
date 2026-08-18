import { useState } from 'react';
import { useForm, router, usePage, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

export default function Index({ proveedores, filters }) {
    const { flash, errors } = usePage().props;

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

    const handleDelete = (id) => {
        if (confirm('¿Eliminar proveedor?')) {
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

    return (
        <AuthenticatedLayout
            header={
                <h2>
                    Gestión de Proveedores
                </h2>
            }
        >
            <div>

                {/* ========================= */}
                {/* HEADER */}
                {/* ========================= */}

                <header>
                    <h1>Proveedores</h1>

                    <button
                        type="button"
                        onClick={openCreateModal}
                    >
                        Nuevo proveedor
                    </button>
                </header>

                {/* ========================= */}
                {/* MENSAJE */}
                {/* ========================= */}

                {flash?.success && (
                    <div>
                        {flash.success}
                    </div>
                )}

                {/* ========================= */}
                {/* BUSCADOR */}
                {/* ========================= */}

                <form onSubmit={handleSearch}>
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Buscar proveedor..."
                    />

                    <button type="submit">
                        Buscar
                    </button>
                </form>

                {/* ========================= */}
                {/* TABLA */}
                {/* ========================= */}

                <table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Nombre</th>
                            <th>Contacto</th>
                            <th>Teléfono</th>
                            <th>Email</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>

                    <tbody>
                        {proveedores.data.length > 0 ? (
                            proveedores.data.map((proveedor) => (
                                <tr key={proveedor.id}>
                                    <td>
                                        {proveedor.id}
                                    </td>

                                    <td>
                                        {proveedor.nombre}
                                    </td>

                                    <td>
                                        {proveedor.contacto || '-'}
                                    </td>

                                    <td>
                                        {proveedor.telefono || '-'}
                                    </td>

                                    <td>
                                        {proveedor.email || '-'}
                                    </td>

                                    <td>
                                        <button
                                            type="button"
                                            onClick={() =>
                                                handleEdit(proveedor)
                                            }
                                        >
                                            Editar
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() =>
                                                handleDelete(proveedor.id)
                                            }
                                        >
                                            Eliminar
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="6">
                                    No se encontraron proveedores.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>

                {/* ========================= */}
                {/* PAGINACIÓN */}
                {/* ========================= */}

                <nav>
                    {proveedores.links.map((link, index) => (
                        <Link
                            key={index}
                            href={link.url || '#'}
                            dangerouslySetInnerHTML={{
                                __html: link.label,
                            }}
                        />
                    ))}
                </nav>

                {/* ========================= */}
                {/* MODAL */}
                {/* ========================= */}

                {showModal && (
                    <div>

                        <div>

                            {/* MODAL HEADER */}

                            <header>
                                <h2>
                                    {editingProveedor
                                        ? 'Editar proveedor'
                                        : 'Nuevo proveedor'}
                                </h2>

                                <button
                                    type="button"
                                    onClick={closeModal}
                                >
                                    X
                                </button>
                            </header>

                            {/* FORMULARIO */}

                            <form onSubmit={handleSubmit}>

                                {/* NOMBRE */}

                                <div>
                                    <label>
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
                                    />

                                    {errors.nombre && (
                                        <span>
                                            {errors.nombre}
                                        </span>
                                    )}
                                </div>

                                {/* CONTACTO */}

                                <div>
                                    <label>
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
                                    />

                                    {errors.contacto && (
                                        <span>
                                            {errors.contacto}
                                        </span>
                                    )}
                                </div>

                                {/* TELÉFONO */}

                                <div>
                                    <label>
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
                                    />

                                    {errors.telefono && (
                                        <span>
                                            {errors.telefono}
                                        </span>
                                    )}
                                </div>

                                {/* EMAIL */}

                                <div>
                                    <label>
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
                                    />

                                    {errors.email && (
                                        <span>
                                            {errors.email}
                                        </span>
                                    )}
                                </div>

                                {/* BOTONES */}

                                <div>
                                    <button
                                        type="button"
                                        onClick={closeModal}
                                        disabled={processing}
                                    >
                                        Cancelar
                                    </button>

                                    <button
                                        type="submit"
                                        disabled={processing}
                                    >
                                        {editingProveedor
                                            ? 'Actualizar'
                                            : 'Guardar'}
                                    </button>
                                </div>

                            </form>

                        </div>

                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
