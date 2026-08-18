import { useState } from 'react';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

export default function Index({ clientes, filters }) {

    const { flash, errors } = usePage().props;

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

    const handleDelete = (id) => {

        if (confirm('¿Eliminar este cliente?')) {

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

    return (
        <AuthenticatedLayout
            header={
                <h2>
                    Gestión de Clientes
                </h2>
            }
        >

            <Head title="Clientes" />

            <div>

                {/* =========================
                    MENSAJE SUCCESS
                ========================= */}

                {flash?.success && (
                    <div>
                        {flash.success}
                    </div>
                )}

                {/* =========================
                    CABECERA
                ========================= */}

                <div>

                    <h1>
                        Clientes
                    </h1>

                    <button
                        type="button"
                        onClick={handleCreate}
                    >
                        Nuevo Cliente
                    </button>

                </div>

                {/* =========================
                    BUSCADOR
                ========================= */}

                <form onSubmit={handleSearch}>

                    <input
                        type="text"
                        value={search}
                        onChange={(e) =>
                            setSearch(e.target.value)
                        }
                        placeholder="Buscar cliente..."
                    />

                    <button type="submit">
                        Buscar
                    </button>

                </form>

                {/* =========================
                    TABLA
                ========================= */}

                <table>

                    <thead>

                        <tr>
                            <th>ID</th>
                            <th>Nombre</th>
                            <th>Apellido</th>
                            <th>Identificación</th>
                            <th>Teléfono</th>
                            <th>Email</th>
                            <th>Límite crédito</th>
                            <th>Acciones</th>
                        </tr>

                    </thead>

                    <tbody>

                        {clientes.data.length > 0 ? (

                            clientes.data.map((cliente) => (

                                <tr key={cliente.id}>

                                    <td>
                                        {cliente.id}
                                    </td>

                                    <td>
                                        {cliente.nombre}
                                    </td>

                                    <td>
                                        {cliente.apellido}
                                    </td>

                                    <td>
                                        {cliente.identificacion}
                                    </td>

                                    <td>
                                        {cliente.telefono}
                                    </td>

                                    <td>
                                        {cliente.email}
                                    </td>

                                    <td>
                                        {cliente.limite_credito}
                                    </td>

                                    <td>

                                        <button
                                            type="button"
                                            onClick={() =>
                                                handleEdit(cliente)
                                            }
                                        >
                                            Editar
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() =>
                                                handleDelete(cliente.id)
                                            }
                                        >
                                            Eliminar
                                        </button>

                                    </td>

                                </tr>

                            ))

                        ) : (

                            <tr>

                                <td colSpan="8">
                                    No se encontraron clientes.
                                </td>

                            </tr>

                        )}

                    </tbody>

                </table>

                {/* =========================
                    PAGINACIÓN
                ========================= */}

                <div>

                    {clientes.links.map(
                        (link, index) => (

                            <Link
                                key={index}
                                href={link.url || '#'}
                                dangerouslySetInnerHTML={{
                                    __html: link.label,
                                }}
                            />

                        )
                    )}

                </div>

            </div>

            {/* =========================
                MODAL
            ========================= */}

            {showModal && (

                <div>

                    <div>

                        <h2>
                            {editingCliente
                                ? 'Editar Cliente'
                                : 'Nuevo Cliente'}
                        </h2>

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
                                    <p>
                                        {errors.nombre}
                                    </p>
                                )}

                            </div>

                            {/* APELLIDO */}

                            <div>

                                <label>
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
                                />

                                {errors.apellido && (
                                    <p>
                                        {errors.apellido}
                                    </p>
                                )}

                            </div>

                            {/* IDENTIFICACIÓN */}

                            <div>

                                <label>
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
                                />

                                {errors.identificacion && (
                                    <p>
                                        {errors.identificacion}
                                    </p>
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
                                    <p>
                                        {errors.telefono}
                                    </p>
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
                                    <p>
                                        {errors.email}
                                    </p>
                                )}

                            </div>

                            {/* LÍMITE DE CRÉDITO */}

                            <div>

                                <label>
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
                                />

                                {errors.limite_credito && (
                                    <p>
                                        {errors.limite_credito}
                                    </p>
                                )}

                            </div>

                            {/* BOTONES */}

                            <div>

                                <button
                                    type="button"
                                    onClick={handleCloseModal}
                                >
                                    Cancelar
                                </button>

                                <button
                                    type="submit"
                                    disabled={processing}
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
    );
}
