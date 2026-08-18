import React, { useState } from 'react';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

export default function Index({
    productos,
    unidades = [],
    filters = {},
}) {
    const { flash } = usePage().props;

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
    });

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

    const handleDelete = (producto) => {
        if (
            confirm(
                `¿Estás seguro de eliminar el producto "${producto.nombre}"?`
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

    return (
        <AuthenticatedLayout
            header={
                <h2>
                    Productos
                </h2>
            }
        >
            <Head title="Productos" />

            <div >

                {/* FLASH */}
                {flash?.success && (
                    <div >
                        {flash.success}
                    </div>
                )}

                {/* CONTENEDOR PRINCIPAL */}
                <div >

                    {/* CABECERA */}
                    <div c>

                        <div >

                            <div>
                                <h1 >
                                    Productos Registrados
                                </h1>

                                <p >
                                    Administra productos, precios, stock y códigos de barras.
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={openCreateModal}
                                
                            >
                                Nuevo Producto
                            </button>

                        </div>

                        {/* BUSCADOR */}
                        <form
                            onSubmit={handleSearch}
                            
                        >

                            <input
                                type="text"
                                value={search}
                                onChange={(e) =>
                                    setSearch(e.target.value)
                                }
                                placeholder="Buscar por nombre o código de barras..."
                               />

                            <button
                                type="submit"
                              >
                                Buscar
                            </button>

                        </form>

                    </div>

                    {/* TABLA */}
                    <div >

                        <table >

                            <thead>
                                <tr >

                                    <th>
                                        Código
                                    </th>

                                    <th>
                                        Producto
                                    </th>

                                    <th>
                                        Unidad
                                    </th>

                                    <th>
                                        Tipo
                                    </th>

                                    <th>
                                        P. Compra
                                    </th>

                                    <th>
                                        P. Venta
                                    </th>

                                    <th>
                                        Stock
                                    </th>

                                    <th>
                                        Acciones
                                    </th>

                                </tr>
                            </thead>

                            <tbod>

                                {productos?.data?.length === 0 && (
                                    <tr>
                                        <td
                                            colSpan={8}
                                            
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
                                            
                                        >

                                            {/* CÓDIGO */}
                                            <td>

                                                {producto.codigo_barras ? (
                                                    <span >
                                                        {producto.codigo_barras}
                                                    </span>
                                                ) : (
                                                    <span >
                                                        Sin código
                                                    </span>
                                                )}

                                            </td>

                                            {/* PRODUCTO */}
                                            <td >
                                                {producto.nombre}
                                            </td>

                                            {/* UNIDAD */}
                                            <td >
                                                {producto.unidad?.nombre || '-'}
                                            </td>

                                            {/* TIPO */}
                                            <td className="px-5 py-3.5 sm:px-7">

                                                <span
                                                    className={`inline-block rounded-full px-2.5 py-1 text-xs font-bold uppercase tracking-wide ${
                                                        producto.es_granel
                                                            ? 'bg-amber-50 text-amber-700'
                                                            : 'bg-teal-50 text-teal-700'
                                                    }`}
                                                >
                                                    {producto.es_granel
                                                        ? 'Granel'
                                                        : 'Unidad'}
                                                </span>

                                            </td>

                                            {/* PRECIO COMPRA */}
                                            <td >
                                                ${Number(
                                                    producto.precio_compra
                                                ).toFixed(2)}
                                            </td>

                                            {/* PRECIO VENTA */}
                                            <td>
                                                ${Number(
                                                    producto.precio_venta
                                                ).toFixed(2)}
                                            </td>

                                            {/* STOCK */}
                                            <td>

                                                <span
                                                    className={`font-bold ${
                                                        stockBajo
                                                            ? 'text-red-600'
                                                            : 'text-teal-700'
                                                    }`}
                                                >
                                                    {producto.stock}
                                                </span>

                                                <span >
                                                    {producto.unidad?.simbolo}
                                                </span>

                                            </td>

                                            {/* ACCIONES */}
                                            <td>

                                                <div>

                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            openEditModal(
                                                                producto
                                                            )
                                                        }
                                                        
                                                    >
                                                        Editar
                                                    </button>

                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            handleDelete(
                                                                producto
                                                            )
                                                        }
                                                        
                                                    >
                                                        Eliminar
                                                    </button>

                                                </div>

                                            </td>

                                        </tr>
                                    );
                                })}

                            </tbod>

                        </table>

                    </div>

                    {/* PAGINACIÓN */}
                    {productos?.links?.length > 0 && (
                        <div >

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
                                    className={`rounded-lg px-3 py-1.5 text-sm ${
                                        link.active
                                            ? 'bg-teal-700 text-white'
                                            : link.url
                                                ? 'bg-stone-100 text-stone-700 hover:bg-amber-100'
                                                : 'cursor-not-allowed bg-stone-50 text-stone-300'
                                    }`}
                                />
                            ))}

                        </div>
                    )}

                </div>

            </div>

            {/* =========================================================
                MODAL CREAR / EDITAR
            ========================================================= */}

            {showModal && (
                <div>

                    {/* FONDO */}
                    <div
                             onClick={closeModal}
                    />

                    {/* MODAL */}
                    <div >

                        {/* CABECERA */}
                        <div>

                            <div>

                                <h2 >
                                    {editingProducto
                                        ? 'Editar Producto'
                                        : 'Nuevo Producto'}
                                </h2>

                                <p >
                                    {editingProducto
                                        ? 'Modifica la información del producto.'
                                        : 'Registra un nuevo producto en el sistema.'}
                                </p>

                            </div>

                            <button
                                type="button"
                                onClick={closeModal}
                                
                            >
                                ×
                            </button>

                        </div>

                        {/* FORMULARIO */}
                        <form
                            onSubmit={handleSubmit}
                          >

                            {/* CÓDIGO DE BARRAS */}
                            <div className="sm:col-span-2">

                                <label
                                    htmlFor="codigo_barras"
                                    className="mb-1 block text-sm font-medium text-stone-700"
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
                                        className="w-full rounded-lg border border-stone-300 px-3 py-2 font-mono outline-none focus:border-teal-600 focus:ring-1 focus:ring-teal-600"
                                    />

                                    <span className="flex items-center rounded-lg bg-stone-100 px-3 text-xs font-semibold text-stone-500">
                                        SCAN
                                    </span>

                                </div>

                                <p className="mt-1 text-xs text-stone-400">
                                    Puedes utilizar un lector USB de código de barras.
                                </p>

                                {errors.codigo_barras && (
                                    <p className="mt-1 text-sm text-red-600">
                                        {errors.codigo_barras}
                                    </p>
                                )}

                            </div>

                            {/* NOMBRE */}
                            <div className="sm:col-span-2">

                                <label
                                    htmlFor="nombre"
                                    className="mb-1 block text-sm font-medium text-stone-700"
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
                                    className="w-full rounded-lg border border-stone-300 px-3 py-2 outline-none focus:border-teal-600 focus:ring-1 focus:ring-teal-600"
                                />

                                {errors.nombre && (
                                    <p className="mt-1 text-sm text-red-600">
                                        {errors.nombre}
                                    </p>
                                )}

                            </div>

                            {/* UNIDAD */}
                            <div>

                                <label
                                    htmlFor="unidad_id"
                                    className="mb-1 block text-sm font-medium text-stone-700"
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
                                    <p className="mt-1 text-sm text-red-600">
                                        {errors.unidad_id}
                                    </p>
                                )}

                            </div>

                            {/* TIPO */}
                            <div>

                                <label
                                    htmlFor="es_granel"
                                    className="mb-1 block text-sm font-medium text-stone-700"
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
                                    className="w-full rounded-lg border border-stone-300 px-3 py-2 outline-none focus:border-teal-600 focus:ring-1 focus:ring-teal-600"
                                >
                                    <option value="1">
                                        Granel
                                    </option>

                                    <option value="0">
                                        Por unidad
                                    </option>
                                </select>

                                {errors.es_granel && (
                                    <p className="mt-1 text-sm text-red-600">
                                        {errors.es_granel}
                                    </p>
                                )}

                            </div>

                            {/* PRECIO COMPRA */}
                            <div>

                                <label
                                    htmlFor="precio_compra"
                                    className="mb-1 block text-sm font-medium text-stone-700"
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
                                    className="w-full rounded-lg border border-stone-300 px-3 py-2 outline-none focus:border-teal-600 focus:ring-1 focus:ring-teal-600"
                                />

                                {errors.precio_compra && (
                                    <p className="mt-1 text-sm text-red-600">
                                        {errors.precio_compra}
                                    </p>
                                )}

                            </div>

                            {/* PRECIO VENTA */}
                            <div>

                                <label
                                    htmlFor="precio_venta"
                                    className="mb-1 block text-sm font-medium text-stone-700"
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
                                    className="w-full rounded-lg border border-stone-300 px-3 py-2 outline-none focus:border-teal-600 focus:ring-1 focus:ring-teal-600"
                                />

                                {errors.precio_venta && (
                                    <p className="mt-1 text-sm text-red-600">
                                        {errors.precio_venta}
                                    </p>
                                )}

                            </div>

                            {/* STOCK */}
                            <div>

                                <label
                                    htmlFor="stock"
                                    className="mb-1 block text-sm font-medium text-stone-700"
                                >
                                    Stock inicial
                                </label>

                                <input
                                    disabled={editingProducto}
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
                                     />

                                {errors.stock && (
                                    <p className="mt-1 text-sm text-red-600">
                                        {errors.stock}
                                    </p>
                                )}

                            </div>

                            {/* STOCK MÍNIMO */}
                            <div>

                                <label
                                    htmlFor="stock_minimo"
                                    className="mb-1 block text-sm font-medium text-stone-700"
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
                                    className="w-full rounded-lg border border-stone-300 px-3 py-2 outline-none focus:border-teal-600 focus:ring-1 focus:ring-teal-600"
                                />

                                {errors.stock_minimo && (
                                    <p className="mt-1 text-sm text-red-600">
                                        {errors.stock_minimo}
                                    </p>
                                )}

                            </div>

                            {/* BOTONES */}
                            <div className="flex justify-end gap-3 pt-2 sm:col-span-2">

                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="rounded-lg border border-stone-300 px-5 py-2 text-stone-700 hover:bg-stone-50"
                                >
                                    Cancelar
                                </button>

                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="rounded-lg bg-orange-600 px-5 py-2 font-semibold text-white hover:bg-orange-700 disabled:opacity-50"
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
