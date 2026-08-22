import React, { useState } from 'react';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { confirmDelete } from '@/Components/SweetAlert';
import Tooltip from '@/Components/Tooltip';
import { Pencil, Trash } from 'lucide-react';

export default function Index({
    productos,
    unidades = [],
    filters = {},
}) {


    const [showModal, setShowModal] = useState(false);
    const [editingProducto, setEditingProducto] = useState(null);
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
        unidad_id: '',
        codigo_barras: '',
        nombre: '',
        es_granel: true,
        precio_compra: '',
        precio_venta: '',
        stock: '0',
        stock_minimo: '0',
        activo: true,
    });

   /*
    |--------------------------------------------------------------------------
    | CAMBIAR ESTADO (TOGGLE)
    |--------------------------------------------------------------------------
    */
    const handleToggleEstado = (producto) => {
        router.patch(
            route('productos.toggleEstado', producto.id),
            {},
            {
                preserveScroll: true,
            }
        );
    };

    /*
    |--------------------------------------------------------------------------
    | CREAR
    |--------------------------------------------------------------------------
    */

    const openCreateModal = () => {
        setEditingProducto(null);

        reset();

        setData({
            unidad_id: unidades[0]?.id || '',
            codigo_barras: '',
            nombre: '',
            es_granel: true,
            precio_compra: '',
            precio_venta: '',
            stock: '0',
            stock_minimo: '0',
        });

        setShowModal(true);
    };

    /*
    |--------------------------------------------------------------------------
    | EDITAR
    |--------------------------------------------------------------------------
    */

    const openEditModal = (producto) => {
        setEditingProducto(producto);

        setData({
            unidad_id: producto.unidad_id || '',
            codigo_barras: producto.codigo_barras || '',
            nombre: producto.nombre || '',
            es_granel: Boolean(producto.es_granel),
            precio_compra: producto.precio_compra || '',
            precio_venta: producto.precio_venta || '',
            stock: producto.stock || '0',
            stock_minimo: producto.stock_minimo || '0',
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

        setEditingProducto(null);

        setData({
            unidad_id: unidades[0]?.id || '',
            codigo_barras: '',
            nombre: '',
            es_granel: true,
            precio_compra: '',
            precio_venta: '',
            stock: '0',
            stock_minimo: '0',
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

        if (editingProducto) {
            put(
                route(
                    'productos.update',
                    editingProducto.id
                ),
                {
                    onSuccess: () => {
                        closeModal();
                    },
                }
            );

            return;
        }

        post(route('productos.store'), {
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

    const handleDelete = async (producto) => {
        if (
            await confirmDelete(
                'Esta acción no se puede deshacer.',
                `¿Eliminar el producto "${producto.nombre}"?`
            )
        ) {
            router.delete(
                route(
                    'productos.destroy',
                    producto.id
                )
            );
        }
    };

    /*
    |--------------------------------------------------------------------------
    | BUSCAR
    |--------------------------------------------------------------------------
    */

    const handleSearch = (e) => {
        e.preventDefault();

        router.get(
            route('productos.index'),
            {
                search,
            },
            {
                preserveState: true,
                replace: true,
            }
        );
    };

    /*
    |--------------------------------------------------------------------------
    | ESCÁNER DE CÓDIGO DE BARRAS
    |--------------------------------------------------------------------------
    |
    | La mayoría de lectores USB funcionan como un teclado:
    | escriben el código directamente en el input.
    |
    */

    const handleBarcodeKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();

            const codigo = data.codigo_barras.trim();

            if (!codigo) {
                return;
            }

            const productoEncontrado = productos?.data?.find(
                (producto) =>
                    producto.codigo_barras === codigo
            );

            if (productoEncontrado) {
                openEditModal(productoEncontrado);
            }
        }
    };

    /*
    |--------------------------------------------------------------------------
    | ESTILOS REUTILIZABLES
    |--------------------------------------------------------------------------
    */

    const inputClass =
        'w-full rounded-lg border border-[#E5DCC0] bg-[#FFFDF6] px-4 py-2.5 text-sm text-[#3F3A2E] ' +
        'placeholder-[#B6A87E] outline-none transition focus:border-[#0E7C86] focus:ring-2 focus:ring-[#0E7C86]/20 ' +
        'disabled:cursor-not-allowed disabled:bg-[#F5F0E0] disabled:text-[#A3915F]';

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
                    Productos
                </h2>
            }
        >
            <Head title="Productos" />

            <div className="min-h-screen bg-[#FDF8E7] py-8">

                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">



                    {/* CONTENEDOR PRINCIPAL */}
                    <div className="overflow-hidden rounded-2xl border border-[#F0E6C8] bg-white shadow-[0_10px_30px_-12px_rgba(120,100,50,0.25)]">

                        {/* CABECERA */}
                        <div className="px-6 pt-6 sm:px-8 sm:pt-7">

                            <div className="flex flex-col gap-4 pb-5 sm:flex-row sm:items-start sm:justify-between">

                                <div>
                                    <h1 className="text-xl font-extrabold tracking-tight text-[#0E7C86] sm:text-2xl">
                                        Productos Registrados
                                    </h1>

                                    <p className="mt-1 text-sm text-[#A3915F]">
                                        Administra productos, precios, stock y códigos de barras.
                                    </p>
                                </div>

                                <button
                                    type="button"
                                    onClick={openCreateModal}
                                    className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-[#F08A24] to-[#E2650F] px-7 py-3 text-xs font-extrabold uppercase tracking-wider text-white shadow-lg shadow-[#E2650F]/25 transition hover:brightness-110 active:scale-[0.98]"
                                >
                                    Nuevo Producto
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
                                    onChange={(e) =>
                                        setSearch(e.target.value)
                                    }
                                    placeholder="Buscar por nombre o código de barras..."
                                    className={inputClass + ' sm:max-w-md'}
                                />

                                <button
                                    type="submit"
                                    className="rounded-full border border-[#0E7C86] px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-[#0E7C86] transition hover:bg-[#0E7C86] hover:text-white"
                                >
                                    Buscar
                                </button>

                            </form>

                        </div>

                        {/* TABLA */}
                        <div className="overflow-x-auto border-t border-[#F1EAD5]">

                            <table className="min-w-full">

                                <thead>
                                    <tr className="border-b border-[#F1EAD5] bg-white">

                                        <th className={thClass + ' sm:pl-8'}>
                                            Código
                                        </th>

                                        <th className={thClass}>
                                            Producto
                                        </th>

                                        <th className={thClass}>
                                            Unidad
                                        </th>

                                        <th className={thClass}>
                                            Tipo
                                        </th>

                                        <th className={thClass}>
                                            P. Compra
                                        </th>

                                        <th className={thClass}>
                                            P. Venta
                                        </th>

                                        <th className={thClass}>
                                            Stock
                                        </th>
                                        
                                        <th className={thClass}>Estado</th>

                                        <th className="px-6 py-4 text-right text-[11px] font-bold uppercase tracking-wider text-[#8A7A4E] sm:pr-8">
                                            Acciones
                                        </th>

                                    </tr>
                                </thead>

                                <tbody>

                                    {productos?.data?.length === 0 && (
                                        <tr>
                                            <td
                                                colSpan={8}
                                                className="px-8 py-12 text-center text-sm text-[#A3915F]"
                                            >
                                                No se encontraron productos.
                                            </td>
                                        </tr>
                                    )}

                                    {productos?.data?.map((producto) => {

                                        const stockBajo =
                                            Number(producto.stock) <=
                                            Number(producto.stock_minimo);

                                        return (
                                            <tr
                                                key={producto.id}
                                                className="border-b border-[#F1EAD5] transition-colors last:border-0 hover:bg-[#FFFBEF]"
                                            >

                                                {/* CÓDIGO */}
                                                <td className="whitespace-nowrap px-6 py-5 sm:pl-8">

                                                    {producto.codigo_barras ? (
                                                        <span className="rounded-md bg-[#FDF8E7] px-2.5 py-1 font-mono text-xs font-semibold text-[#7A6A45]">
                                                            {producto.codigo_barras}
                                                        </span>
                                                    ) : (
                                                        <span className="text-xs italic text-[#C4B68C]">
                                                            Sin código
                                                        </span>
                                                    )}

                                                </td>

                                                {/* PRODUCTO */}
                                                <td className="px-6 py-5 text-sm font-bold text-[#2F2A20]">
                                                    {producto.nombre}
                                                </td>

                                                {/* UNIDAD */}
                                                <td className="whitespace-nowrap px-6 py-5 text-sm text-[#7A6A45]">
                                                    {producto.unidad?.nombre || '-'}
                                                </td>

                                                {/* TIPO */}
                                                <td className="whitespace-nowrap px-6 py-5">

                                                    <span
                                                        className={`inline-flex rounded-md px-3 py-1.5 text-[11px] font-extrabold uppercase tracking-wider ${
                                                            producto.es_granel
                                                                ? 'bg-[#FDEEDC] text-[#C25E10]'
                                                                : 'bg-[#DFF3EF] text-[#0E7C86]'
                                                        }`}
                                                    >
                                                        {producto.es_granel
                                                            ? 'Granel'
                                                            : 'Unidad'}
                                                    </span>

                                                </td>

                                                {/* PRECIO COMPRA */}
                                                <td className="whitespace-nowrap px-6 py-5 text-sm text-[#7A6A45]">
                                                    ${Number(
                                                        producto.precio_compra
                                                    ).toFixed(2)}
                                                </td>

                                                {/* PRECIO VENTA */}
                                                <td className="whitespace-nowrap px-6 py-5 text-sm font-semibold text-[#2F2A20]">
                                                    ${Number(
                                                        producto.precio_venta
                                                    ).toFixed(2)}
                                                </td>

                                                {/* STOCK */}
                                                <td className="whitespace-nowrap px-6 py-5">

                                                    <span
                                                        className={`text-sm font-extrabold ${
                                                            stockBajo
                                                                ? 'text-[#D64545]'
                                                                : 'text-[#0E7C86]'
                                                        }`}
                                                    >
                                                        {producto.stock}
                                                    </span>

                                                    <span className="ml-1 text-xs text-[#B6A87E]">
                                                        {producto.unidad?.simbolo}
                                                    </span>

                                                    {stockBajo && (
                                                        <span className="mt-0.5 block text-[10px] font-bold uppercase tracking-wider text-[#D64545]">
                                                            Stock bajo
                                                        </span>
                                                    )}

                                                </td>
                                                {/* ESTADO (SWITCH / TOGGLE) */}
                                                <td className="whitespace-nowrap px-6 py-5">
                                                    <Tooltip text={producto.activo ? 'Desactivar producto' : 'Activar producto'}>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleToggleEstado(producto)}
                                                            className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                                                                producto.activo ? 'bg-[#0E7C86]' : 'bg-gray-300'
                                                            }`}
                                                        >
                                                            <span
                                                                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                                                                    producto.activo ? 'translate-x-5' : 'translate-x-0'
                                                                }`}
                                                            />
                                                        </button>
                                                    </Tooltip>
                                                </td>

                                                {/* ACCIONES */}
                                                <td className="whitespace-nowrap px-6 py-5 text-right sm:pr-8">

                                                    <div className="flex items-center justify-end gap-5">

                                                        <Tooltip text="Editar producto">
                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    openEditModal(
                                                                        producto
                                                                    )
                                                                }
                                                                className="cursor-pointer text-sm font-semibold text-[#0E7C86] transition hover:underline"
                                                            >
                                                                <Pencil size={20} color="#2563eb" />
                                                            </button>
                                                        </Tooltip>

                                                        <Tooltip text="Eliminar producto">
                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    handleDelete(
                                                                        producto
                                                                    )
                                                                }
                                                                className="cursor-pointer text-sm font-semibold text-[#D64545] transition hover:underline"
                                                            >
                                                                <Trash size={20} color="#dc2626" />
                                                            </button>
                                                        </Tooltip>

                                                    </div>

                                                </td>

                                            </tr>
                                        );
                                    })}

                                </tbody>

                            </table>

                        </div>

                        {/* PAGINACIÓN */}
                        {productos?.links?.length > 3 && (
                            <div className="flex flex-wrap items-center justify-center gap-1.5 border-t border-[#F1EAD5] px-6 py-5 sm:px-8">

                                {productos.links.map((link, index) => (
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
                                        className={`min-w-[38px] rounded-lg px-3 py-2 text-sm font-semibold transition ${
                                            link.active
                                                ? 'bg-[#0E7C86] text-white shadow-sm'
                                                : link.url
                                                    ? 'text-[#7A6A45] hover:bg-[#FDF8E7] hover:text-[#0E7C86]'
                                                    : 'cursor-not-allowed text-[#D6CBA8]'
                                        }`}
                                    />
                                ))}

                            </div>
                        )}

                    </div>

                </div>

            </div>

            {/* =========================================================
                MODAL CREAR / EDITAR
            ========================================================= */}

            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto p-4">

                    {/* FONDO */}
                    <div
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
                        onClick={closeModal}
                    />

                    {/* MODAL */}
                    <div className="relative z-10 max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl border border-[#F0E6C8] bg-white shadow-2xl">

                        {/* CABECERA */}
                        <div className="flex items-start justify-between gap-4 border-b border-[#F1EAD5] bg-[#FDF8E7] px-7 py-5">

                            <div>

                                <h2 className="text-lg font-extrabold text-[#0E7C86]">
                                    {editingProducto
                                        ? 'Editar Producto'
                                        : 'Nuevo Producto'}
                                </h2>

                                <p className="mt-0.5 text-xs text-[#A3915F]">
                                    {editingProducto
                                        ? 'Modifica la información del producto.'
                                        : 'Registra un nuevo producto en el sistema.'}
                                </p>

                            </div>

                            <button
                                type="button"
                                onClick={closeModal}
                                className="flex h-9 w-9 items-center justify-center rounded-full text-2xl leading-none text-[#A3915F] transition hover:bg-white hover:text-[#D64545]"
                            >
                                ×
                            </button>

                        </div>

                        {/* FORMULARIO */}
                        <form
                            onSubmit={handleSubmit}
                            className="grid grid-cols-1 gap-5 px-7 py-6 sm:grid-cols-2"
                        >

                            {/* CÓDIGO DE BARRAS */}
                            <div className="sm:col-span-2">

                                <label
                                    htmlFor="codigo_barras"
                                    className={labelClass}
                                >
                                    Código de barras
                                </label>

                                <div className="flex gap-2">

                                    <input
                                        id="codigo_barras"
                                        type="text"
                                        autoFocus
                                        value={data.codigo_barras}
                                        onChange={(e) =>
                                            setData(
                                                'codigo_barras',
                                                e.target.value
                                            )
                                        }
                                        onKeyDown={
                                            handleBarcodeKeyDown
                                        }
                                        placeholder="Escanea o escribe el código de barras..."
                                        className={inputClass + ' font-mono'}
                                    />

                                    <span className="flex items-center rounded-lg bg-[#DFF3EF] px-4 text-[11px] font-extrabold uppercase tracking-wider text-[#0E7C86]">
                                        Scan
                                    </span>

                                </div>

                                <p className="mt-1.5 text-xs text-[#B6A87E]">
                                    Puedes utilizar un lector USB de código de barras.
                                </p>

                                {errors.codigo_barras && (
                                    <p className={errorClass}>
                                        {errors.codigo_barras}
                                    </p>
                                )}

                            </div>

                            {/* NOMBRE */}
                            <div className="sm:col-span-2">

                                <label
                                    htmlFor="nombre"
                                    className={labelClass}
                                >
                                    Nombre del producto
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
                                    placeholder="Ej: Arroz"
                                    className={inputClass}
                                />

                                {errors.nombre && (
                                    <p className={errorClass}>
                                        {errors.nombre}
                                    </p>
                                )}

                            </div>

                            {/* UNIDAD */}
                            <div>

                                <label
                                    htmlFor="unidad_id"
                                    className={labelClass}
                                >
                                    Unidad de medida
                                </label>

                                <select
                                    id="unidad_id"
                                    value={data.unidad_id}
                                    onChange={(e) =>
                                        setData(
                                            'unidad_id',
                                            e.target.value
                                        )
                                    }
                                    className={inputClass}
                                >

                                    <option value="">
                                        Selecciona una unidad
                                    </option>

                                    {unidades.map((unidad) => (
                                        <option
                                            key={unidad.id}
                                            value={unidad.id}
                                        >
                                            {unidad.nombre} ({unidad.simbolo})
                                        </option>
                                    ))}

                                </select>

                                {errors.unidad_id && (
                                    <p className={errorClass}>
                                        {errors.unidad_id}
                                    </p>
                                )}

                            </div>

                            {/* TIPO */}
                            <div>

                                <label
                                    htmlFor="es_granel"
                                    className={labelClass}
                                >
                                    Tipo de venta
                                </label>

                                <select
                                    id="es_granel"
                                    value={
                                        data.es_granel
                                            ? '1'
                                            : '0'
                                    }
                                    onChange={(e) =>
                                        setData(
                                            'es_granel',
                                            e.target.value === '1'
                                        )
                                    }
                                    className={inputClass}
                                >
                                    <option value="1">
                                        Granel
                                    </option>

                                    <option value="0">
                                        Por unidad
                                    </option>
                                </select>

                                {errors.es_granel && (
                                    <p className={errorClass}>
                                        {errors.es_granel}
                                    </p>
                                )}

                            </div>

                            {/* PRECIO COMPRA */}
                            <div>

                                <label
                                    htmlFor="precio_compra"
                                    className={labelClass}
                                >
                                    Precio de compra
                                </label>

                                <input
                                    id="precio_compra"
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={data.precio_compra}
                                    onChange={(e) =>
                                        setData(
                                            'precio_compra',
                                            e.target.value
                                        )
                                    }
                                    placeholder="0.00"
                                    className={inputClass}
                                />

                                {errors.precio_compra && (
                                    <p className={errorClass}>
                                        {errors.precio_compra}
                                    </p>
                                )}

                            </div>

                            {/* PRECIO VENTA */}
                            <div>

                                <label
                                    htmlFor="precio_venta"
                                    className={labelClass}
                                >
                                    Precio de venta
                                </label>

                                <input
                                    id="precio_venta"
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={data.precio_venta}
                                    onChange={(e) =>
                                        setData(
                                            'precio_venta',
                                            e.target.value
                                        )
                                    }
                                    placeholder="0.00"
                                    className={inputClass}
                                />

                                {errors.precio_venta && (
                                    <p className={errorClass}>
                                        {errors.precio_venta}
                                    </p>
                                )}

                            </div>

                            {/* STOCK */}
                            <div>

                                <label
                                    htmlFor="stock"
                                    className={labelClass}
                                >
                                    Stock inicial
                                </label>

                                <input
                                    disabled={Boolean(editingProducto)}
                                    id="stock"
                                    type="number"
                                    step="0.001"
                                    min="0"
                                    value={data.stock}
                                    onChange={(e) =>
                                        setData(
                                            'stock',
                                            e.target.value
                                        )
                                    }
                                    className={inputClass}
                                />

                                {editingProducto && (
                                    <p className="mt-1.5 text-xs text-[#B6A87E]">
                                        El stock se ajusta desde movimientos de inventario.
                                    </p>
                                )}

                                {errors.stock && (
                                    <p className={errorClass}>
                                        {errors.stock}
                                    </p>
                                )}

                            </div>

                            {/* STOCK MÍNIMO */}
                            <div>

                                <label
                                    htmlFor="stock_minimo"
                                    className={labelClass}
                                >
                                    Stock mínimo
                                </label>

                                <input
                                    id="stock_minimo"
                                    type="number"
                                    step="0.001"
                                    min="0"
                                    value={data.stock_minimo}
                                    onChange={(e) =>
                                        setData(
                                            'stock_minimo',
                                            e.target.value
                                        )
                                    }
                                    className={inputClass}
                                />

                                {errors.stock_minimo && (
                                    <p className={errorClass}>
                                        {errors.stock_minimo}
                                    </p>
                                )}

                            </div>

                            {/* BOTONES */}
                            <div className="mt-3 flex flex-col-reverse gap-3 border-t border-[#F1EAD5] pt-5 sm:col-span-2 sm:flex-row sm:justify-end">

                                <button
                                    type="button"
                                    onClick={closeModal}
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
                                        : editingProducto
                                            ? 'Actualizar Producto'
                                            : 'Guardar Producto'}
                                </button>

                            </div>

                        </form>

                    </div>

                </div>
            )}

        </AuthenticatedLayout>
    );
}
