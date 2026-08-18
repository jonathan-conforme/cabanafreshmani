
import React, { useMemo, useState } from 'react';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

export default function Index({
    compras = { data: [], links: [] },
    proveedores = [],
    productos = [],
}) {
    const { flash } = usePage().props;

    const [showModal, setShowModal] = useState(false);

   const {
    data,
    setData,
    post,
    put,
    processing,
    errors,
    reset,
} = useForm({
    proveedor_id: '',
    tipo_pago: 'contado',
    metodo_pago: 'efectivo',
    monto_pagado: 0,
    fecha_vencimiento: '',
    detalles: [],
});
    /*
    |--------------------------------------------------------------------------
    | PRODUCTO TEMPORAL
    |--------------------------------------------------------------------------
    */

    const [productoSeleccionado, setProductoSeleccionado] = useState('');
    const [cantidad, setCantidad] = useState('');
    const [costoUnitario, setCostoUnitario] = useState('');

    /*
    |--------------------------------------------------------------------------
    | ABRIR / CERRAR MODAL
    |--------------------------------------------------------------------------
    */

    const openCreateModal = () => {
        reset();

        setData({
            proveedor_id: '',
            tipo_pago: 'contado',
            metodo_pago: 'efectivo',
            fecha_vencimiento: '',
            factura: null,
            detalles: [],
        });

        setProductoSeleccionado('');
        setCantidad('');
        setCostoUnitario('');

        setShowModal(true);
    };

    const closeModal = () => {
        reset();

        setProductoSeleccionado('');
        setCantidad('');
        setCostoUnitario('');

        setShowModal(false);
    };

    /*
    |--------------------------------------------------------------------------
    | PRODUCTO SELECCIONADO
    |--------------------------------------------------------------------------
    */

    const productoActual = useMemo(() => {
        return productos.find(
            (producto) =>
                String(producto.id) === String(productoSeleccionado)
        );
    }, [productos, productoSeleccionado]);

    /*
    |--------------------------------------------------------------------------
    | AGREGAR PRODUCTO
    |--------------------------------------------------------------------------
    */

    const agregarProducto = () => {
        if (!productoSeleccionado) {
            alert('Selecciona un producto.');
            return;
        }

        if (!cantidad || Number(cantidad) <= 0) {
            alert('Ingresa una cantidad válida.');
            return;
        }

        if (!costoUnitario || Number(costoUnitario) < 0) {
            alert('Ingresa un costo unitario válido.');
            return;
        }

        const nuevoDetalle = {
            producto_id: Number(productoSeleccionado),
            nombre: productoActual?.nombre || '',
            cantidad: Number(cantidad),
            costo_unitario: Number(costoUnitario),
            subtotal:
                Number(cantidad) * Number(costoUnitario),
        };

        setData('detalles', [
            ...data.detalles,
            nuevoDetalle,
        ]);

        setProductoSeleccionado('');
        setCantidad('');
        setCostoUnitario('');
    };

    /*
    |--------------------------------------------------------------------------
    | ELIMINAR DETALLE
    |--------------------------------------------------------------------------
    */

    const eliminarDetalle = (index) => {
        const nuevosDetalles = data.detalles.filter(
            (_, i) => i !== index
        );

        setData('detalles', nuevosDetalles);
    };

    /*
    |--------------------------------------------------------------------------
    | TOTAL
    |--------------------------------------------------------------------------
    */

    const total = useMemo(() => {
        return data.detalles.reduce(
            (sum, detalle) =>
                sum + Number(detalle.subtotal || 0),
            0
        );
    }, [data.detalles]);

    /*
    |--------------------------------------------------------------------------
    | GUARDAR COMPRA
    |--------------------------------------------------------------------------
    */

    const handleSubmit = (e) => {
        e.preventDefault();

        if (data.detalles.length === 0) {
            alert('Debes agregar al menos un producto.');
            return;
        }

        post(route('compras.store'), {
            forceFormData: true,

            onSuccess: () => {
                closeModal();
            },
        });
    };

    /*
    |--------------------------------------------------------------------------
    | ELIMINAR COMPRA
    |--------------------------------------------------------------------------
    */

    const handleDelete = (compra) => {
        if (
            confirm(
                `¿Eliminar la compra #${compra.id}?`
            )
        ) {
            router.delete(
                route('compras.destroy', compra.id)
            );
        }
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-bold tracking-tight text-stone-800">
                    Compras
                </h2>
            }
        >
            <Head title="Compras" />

            <div >

                {/* FLASH */}

                {flash?.success && (
                    <div >
                        {flash.success}
                    </div>
                )}

                {/* CONTENEDOR */}

                <div >

                    {/* CABECERA */}

                    <div>

                        <div>
                            <h1 className="text-lg font-bold text-teal-700">
                                Compras Registradas
                            </h1>

                            <p className="mt-1 text-sm text-stone-500">
                                Registra las compras realizadas a tus proveedores.
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={openCreateModal}
                              >
                            Nueva Compra
                        </button>

                    </div>

                    {/* TABLA */}

                    <div >

                        <table >

                            <thead>
                                <tr >

                                    <th>
                                        ID
                                    </th>

                                    <th>
                                        Proveedor
                                    </th>

                                    <th>
                                        Tipo de pago
                                    </th>

                                    <th>
                                        Estado
                                    </th>

                                    <th>
                                        Total
                                    </th>

                                    <th>
                                        Fecha
                                    </th>

                                    <th >
                                        Acciones
                                    </th>

                                </tr>
                            </thead>

                            <tbody>

                                {compras?.data?.length === 0 && (
                                    <tr>
                                        <td
                                            colSpan={7}
                                           
                                        >
                                            Todavía no hay compras registradas.
                                        </td>
                                    </tr>
                                )}

                                {compras?.data?.map((compra) => (
                                    <tr
                                        key={compra.id}
                                        
                                    >

                                        <td>
                                            #{compra.id}
                                        </td>

                                        <td>
                                            {compra.proveedor?.nombre ||
                                                'Sin proveedor'}
                                        </td>

                                        <td className="px-5 py-3.5 sm:px-7">

                                            <span >
                                                {compra.tipo_pago}
                                            </span>

                                        </td>

                                        <td className="px-5 py-3.5 sm:px-7">

                                            <span
                                                className={`rounded-full px-2.5 py-1 text-xs font-bold uppercase ${compra.estado === 'pagada'
                                                        ? 'bg-green-50 text-green-700'
                                                        : compra.estado === 'pendiente'
                                                            ? 'bg-amber-50 text-amber-700'
                                                            : 'bg-red-50 text-red-700'
                                                    }`}
                                            >
                                                {compra.estado}
                                            </span>

                                        </td>

                                        <td >
                                            ${Number(
                                                compra.total || 0
                                            ).toFixed(2)}
                                        </td>

                                        <td className="px-5 py-3.5 text-stone-500 sm:px-7">
                                            {compra.fecha_compra
                                                ? new Date(
                                                    compra.fecha_compra
                                                ).toLocaleDateString(
                                                    'es-EC'
                                                )
                                                : '-'}
                                        </td>

                                        <td className="px-5 py-3.5 sm:px-7">

                                            <div className="flex justify-end gap-2">

                                                <button
                                                    type="button"
                                                   
                                                >
                                                    Ver
                                                </button>

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        handleDelete(compra)
                                                    }
                                                    
                                                >
                                                    Eliminar
                                                </button>

                                            </div>

                                        </td>

                                    </tr>
                                ))}

                            </tbody>
                            {compras?.links?.length > 0 && (
                                <div>

                                    {compras.links.map((link, index) => (
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
                                            className={`rounded-lg px-3 py-1.5 text-sm ${link.active
                                                    ? 'bg-teal-700 text-white'
                                                    : link.url
                                                        ? 'bg-stone-100 text-stone-700 hover:bg-amber-100'
                                                        : 'cursor-not-allowed bg-stone-50 text-stone-300'
                                                }`}
                                        />
                                    ))}

                                </div>
                            )}
                        </table>

                    </div>

                </div>

            </div>

            {/* =========================================================
                MODAL NUEVA COMPRA
            ========================================================= */}

            {showModal && (
                <div>

                    <div
                    
                        onClick={closeModal}
                    />

                    <div>

                        {/* CABECERA */}

                        <div>

                            <div>
                                <h2>
                                    Nueva Compra
                                </h2>

                                <p>
                                    Registra los productos comprados al proveedor.
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={closeModal}
                                className="text-2xl text-stone-500 hover:text-stone-800"
                            >
                                ×
                            </button>

                        </div>

                        <form
                            onSubmit={handleSubmit}
                            className="space-y-6"
                        >

                            {/* DATOS DE COMPRA */}

                            <div >

                                {/* PROVEEDOR */}

                                <div>
                                    <label >
                                        Proveedor
                                    </label>

                                    <select
                                        value={data.proveedor_id}
                                        onChange={(e) =>
                                            setData(
                                                'proveedor_id',
                                                e.target.value
                                            )
                                        }
                                        
                                    >

                                        <option value="">
                                            Selecciona un proveedor
                                        </option>

                                        {proveedores.map((proveedor) => (
                                            <option
                                                key={proveedor.id}
                                                value={proveedor.id}
                                            >
                                                {proveedor.nombre}
                                            </option>
                                        ))}

                                    </select>

                                    {errors.proveedor_id && (
                                        <p>
                                            {errors.proveedor_id}
                                        </p>
                                    )}
                                </div>

                                {/* TIPO PAGO */}

                                <div>
                                    <label>
                                        Tipo de pago
                                    </label>

                                    <select
                                        value={data.tipo_pago}
                                        onChange={(e) =>
                                            setData(
                                                'tipo_pago',
                                                e.target.value
                                            )
                                        }
                                         >
                                        <option value="contado">
                                            Contado
                                        </option>

                                        <option value="credito">
                                            Crédito
                                        </option>
                                    </select>
                                </div>

                                {/* METODO */}

                                <div>
                                    <label >
                                        Método de pago
                                    </label>

                                    <select
                                        value={data.metodo_pago}
                                        onChange={(e) =>
                                            setData(
                                                'metodo_pago',
                                                e.target.value
                                            )
                                        }
                                        className="w-full rounded-lg border border-stone-300 px-3 py-2"
                                    >
                                        <option value="efectivo">
                                            Efectivo
                                        </option>

                                        <option value="transferencia">
                                            Transferencia
                                        </option>

                                        <option value="tarjeta">
                                            Tarjeta
                                        </option>
                                    </select>
                                </div>

                                {/* VENCIMIENTO */}

                                {data.tipo_pago === 'credito' && (
                                    <div>
                                        <label>
                                            Fecha de vencimiento
                                        </label>

                                        <input
                                            type="date"
                                            value={
                                                data.fecha_vencimiento
                                            }
                                            onChange={(e) =>
                                                setData(
                                                    'fecha_vencimiento',
                                                    e.target.value
                                                )
                                            }
                                                />
                                    </div>
                                )}

                            </div>

                            {/* PRODUCTOS */}

                            <div>

                                <h3 className="mb-4 font-bold text-teal-700">
                                    Productos
                                </h3>

                                <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">

                                    <select
                                        value={productoSeleccionado}
                                        onChange={(e) =>
                                            setProductoSeleccionado(
                                                e.target.value
                                            )
                                        }
                                      >
                                        <option value="">
                                            Selecciona producto
                                        </option>

                                        {productos.map((producto) => (
                                            <option
                                                key={producto.id}
                                                value={producto.id}
                                            >
                                                {producto.nombre}
                                            </option>
                                        ))}
                                    </select>

                                    <input
                                        type="number"
                                        min="0.001"
                                        step="0.001"
                                        value={cantidad}
                                        onChange={(e) =>
                                            setCantidad(e.target.value)
                                        }
                                        placeholder="Cantidad"
                                          />

                                    <input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={costoUnitario}
                                        onChange={(e) =>
                                            setCostoUnitario(
                                                e.target.value
                                            )
                                        }
                                        placeholder="Costo unitario"
                                      />

                                    <button
                                        type="button"
                                        onClick={agregarProducto}
                                           >
                                        + Agregar
                                    </button>

                                </div>

                                {/* DETALLES */}

                                <div className="mt-5 overflow-x-auto">

                                    <table className="w-full text-sm">

                                        <thead>
                                            <tr>
                                                <th className="px-3 py-2">
                                                    Producto
                                                </th>

                                                <th className="px-3 py-2">
                                                    Cantidad
                                                </th>

                                                <th className="px-3 py-2">
                                                    Costo
                                                </th>

                                                <th className="px-3 py-2">
                                                    Subtotal
                                                </th>

                                                <th className="px-3 py-2 text-right">
                                                    Acción
                                                </th>

                                            </tr>
                                        </thead>

                                        <tbody>

                                            {data.detalles.map(
                                                (detalle, index) => (
                                                    <tr
                                                        key={index}
                                                        className="border-b border-amber-50"
                                                    >

                                                        <td className="px-3 py-2 font-medium">
                                                            {detalle.nombre}
                                                        </td>

                                                        <td className="px-3 py-2">
                                                            {detalle.cantidad}
                                                        </td>

                                                        <td className="px-3 py-2">
                                                            $
                                                            {Number(
                                                                detalle.costo_unitario
                                                            ).toFixed(2)}
                                                        </td>

                                                        <td className="px-3 py-2 font-semibold">
                                                            $
                                                            {Number(
                                                                detalle.subtotal
                                                            ).toFixed(2)}
                                                        </td>

                                                        <td className="px-3 py-2 text-right">

                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    eliminarDetalle(
                                                                        index
                                                                    )
                                                                }
                                                                className="text-red-600 hover:underline"
                                                            >
                                                                Quitar
                                                            </button>

                                                        </td>

                                                    </tr>
                                                )
                                            )}

                                        </tbody>

                                    </table>

                                </div>

                            </div>

                            {/* FACTURA */}

                            <div>

                                <label>
                                    Factura
                                    <span >
                                        (opcional)
                                    </span>
                                </label>

                                <input
                                    type="file"
                                    accept=".pdf,.jpg,.jpeg,.png"
                                    onChange={(e) =>
                                        setData(
                                            'factura',
                                            e.target.files[0] || null
                                        )
                                    }
                                   
                                />

                                <p className="mt-1 text-xs text-stone-400">
                                    PDF o imagen. Tamaño máximo recomendado: 2 MB.
                                </p>

                                {errors.factura && (
                                    <p className="mt-1 text-sm text-red-600">
                                        {errors.factura}
                                    </p>
                                )}

                            </div>
                            <div>
    <label >
        Monto pagado
    </label>

    <input
        type="number"
        step="0.01"
        min="0"
        value={data.monto_pagado}
        onChange={(e) =>
            setData('monto_pagado', e.target.value)
        }
        
        placeholder="0.00"
    />

    {errors.monto_pagado && (
        <p className="mt-1 text-sm text-red-600">
            {errors.monto_pagado}
        </p>
    )}
</div>

                            {/* TOTAL */}

                            <div >

                                <div className="text-right">

                                    <p >
                                        Total de compra
                                    </p>

                                    <p >
                                        $
                                        {total.toFixed(2)}
                                    </p>

                                </div>

                            </div>

                            {/* BOTONES */}

                            <div >

                                <button
                                    type="button"
                                    onClick={closeModal}
                                      >
                                    Cancelar
                                </button>

                                <button
                                    type="submit"
                                    disabled={
                                        processing ||
                                        data.detalles.length === 0
                                    }
                                         >
                                    {processing
                                        ? 'Guardando...'
                                        : 'Registrar Compra'}
                                </button>

                            </div>

                        </form>

                    </div>

                </div>
            )}
        </AuthenticatedLayout>
    );
}
