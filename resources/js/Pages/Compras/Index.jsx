import React, { useMemo, useState } from 'react';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { confirmDelete, warningAlert } from '@/Components/SweetAlert';
import Tooltip from '@/Components/Tooltip';
import { Eye, Trash } from 'lucide-react';

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
            warningAlert('Selecciona un producto.');
            return;
        }

        if (!cantidad || Number(cantidad) <= 0) {
            warningAlert('Ingresa una cantidad válida.');
            return;
        }

        if (!costoUnitario || Number(costoUnitario) < 0) {
            warningAlert('Ingresa un costo unitario válido.');
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
            warningAlert('Debes agregar al menos un producto.');
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

    const handleDelete = async (compra) => {
        if (
            await confirmDelete(
                'Esta acción no se puede deshacer.',
                `¿Eliminar la compra #${compra.id}?`
            )
        ) {
            router.delete(
                route('compras.destroy', compra.id)
            );
        }
    };

    /*
    |--------------------------------------------------------------------------
    | ESTILOS REUTILIZABLES
    |--------------------------------------------------------------------------
    */

    const inputClass =
        'w-full rounded-lg border border-[#E5DCC0] bg-[#FFFDF6] px-4 py-2.5 text-sm text-[#3F3A2E] ' +
        'placeholder-[#B6A87E] outline-none transition focus:border-[#0E7C86] focus:ring-2 focus:ring-[#0E7C86]/20';

    const labelClass =
        'mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-[#8A7A4E]';

    const thClass =
        'px-6 py-4 text-left text-[11px] font-bold uppercase tracking-wider text-[#8A7A4E]';

    const errorClass =
        'mt-1.5 text-xs font-semibold text-[#D64545]';

    const estadoBadge = (estado) => {
        if (estado === 'pagada') {
            return 'bg-[#DFF3EF] text-[#0E7C86]';
        }

        if (estado === 'pendiente') {
            return 'bg-[#FDEEDC] text-[#C25E10]';
        }

        return 'bg-[#FBE2E2] text-[#D64545]';
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-bold text-[#0E7C86]">
                    Compras
                </h2>
            }
        >
            <Head title="Compras" />

            <div className="min-h-screen bg-[#FDF8E7] py-8">

                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

                    {/* FLASH */}

                    {flash?.success && (
                        <div className="mb-6 rounded-xl border border-[#0E7C86]/20 bg-[#DFF3EF] px-5 py-3.5 text-sm font-semibold text-[#0E7C86] shadow-sm">
                            {flash.success}
                        </div>
                    )}

                    {/* CONTENEDOR */}

                    <div className="overflow-hidden rounded-2xl border border-[#F0E6C8] bg-white shadow-[0_10px_30px_-12px_rgba(120,100,50,0.25)]">

                        {/* CABECERA */}

                        <div className="flex flex-col gap-4 px-6 pt-6 pb-5 sm:flex-row sm:items-start sm:justify-between sm:px-8 sm:pt-7">

                            <div>
                                <h1 className="text-xl font-extrabold tracking-tight text-[#0E7C86] sm:text-2xl">
                                    Compras Registradas
                                </h1>

                                <p className="mt-1 text-sm text-[#A3915F]">
                                    Registra las compras realizadas a tus proveedores.
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={openCreateModal}
                                className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-[#F08A24] to-[#E2650F] px-7 py-3 text-xs font-extrabold uppercase tracking-wider text-white shadow-lg shadow-[#E2650F]/25 transition hover:brightness-110 active:scale-[0.98]"
                            >
                                Nueva Compra
                            </button>

                        </div>

                        {/* TABLA */}

                        <div className="overflow-x-auto border-t border-[#F1EAD5]">

                            <table className="min-w-full">

                                <thead>
                                    <tr className="border-b border-[#F1EAD5] bg-white">

                                        <th className={thClass + ' sm:pl-8'}>
                                            ID
                                        </th>

                                        <th className={thClass}>
                                            Proveedor
                                        </th>

                                        <th className={thClass}>
                                            Tipo de pago
                                        </th>

                                        <th className={thClass}>
                                            Estado
                                        </th>

                                        <th className={thClass}>
                                            Total
                                        </th>

                                        <th className={thClass}>
                                            Fecha
                                        </th>

                                        <th className="px-6 py-4 text-right text-[11px] font-bold uppercase tracking-wider text-[#8A7A4E] sm:pr-8">
                                            Acciones
                                        </th>

                                    </tr>
                                </thead>

                                <tbody>

                                    {compras?.data?.length === 0 && (
                                        <tr>
                                            <td
                                                colSpan={7}
                                                className="px-8 py-12 text-center text-sm text-[#A3915F]"
                                            >
                                                Todavía no hay compras registradas.
                                            </td>
                                        </tr>
                                    )}

                                    {compras?.data?.map((compra) => (
                                        <tr
                                            key={compra.id}
                                            className="border-b border-[#F1EAD5] transition-colors last:border-0 hover:bg-[#FFFBEF]"
                                        >

                                            <td className="whitespace-nowrap px-6 py-5 text-sm font-bold text-[#2F2A20] sm:pl-8">
                                                #{compra.id}
                                            </td>

                                            <td className="px-6 py-5 text-sm text-[#7A6A45]">
                                                {compra.proveedor?.nombre ||
                                                    'Sin proveedor'}
                                            </td>

                                            <td className="whitespace-nowrap px-6 py-5">
                                                <span className="inline-flex rounded-md bg-[#F5F0E0] px-3 py-1.5 text-[11px] font-extrabold uppercase tracking-wider text-[#7A6A45]">
                                                    {compra.tipo_pago}
                                                </span>
                                            </td>

                                            <td className="whitespace-nowrap px-6 py-5">
                                                <span
                                                    className={`inline-flex rounded-md px-3 py-1.5 text-[11px] font-extrabold uppercase tracking-wider ${estadoBadge(
                                                        compra.estado
                                                    )}`}
                                                >
                                                    {compra.estado}
                                                </span>
                                            </td>

                                            <td className="whitespace-nowrap px-6 py-5 text-sm font-semibold text-[#2F2A20]">
                                                ${Number(
                                                    compra.total || 0
                                                ).toFixed(2)}
                                            </td>

                                            <td className="whitespace-nowrap px-6 py-5 text-sm text-[#A3915F]">
                                                {compra.fecha_compra
                                                    ? new Date(
                                                        compra.fecha_compra
                                                    ).toLocaleDateString(
                                                        'es-EC'
                                                    )
                                                    : '-'}
                                            </td>

                                            <td className="whitespace-nowrap px-6 py-5 text-right sm:pr-8">

                                                <div className="flex items-center justify-end gap-5">

                                                    <Tooltip text="Ver detalle de compra">
                                                        <button
                                                            type="button"
                                                            className="cursor-pointer text-sm font-semibold text-[#0E7C86] transition hover:underline"
                                                        >
                                                            <Eye size={20} color="#0E7C86" />
                                                        </button>
                                                    </Tooltip>

                                                    <Tooltip text="Eliminar compra">
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                handleDelete(compra)
                                                            }
                                                            className="cursor-pointer text-sm font-semibold text-[#D64545] transition hover:underline"
                                                        >
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

                        {/* PAGINACIÓN */}

                        {compras?.links?.length > 3 && (
                            <div className="flex flex-wrap items-center justify-center gap-1.5 border-t border-[#F1EAD5] px-6 py-5 sm:px-8">

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
                MODAL NUEVA COMPRA
            ========================================================= */}

            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto p-4">

                    <div
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
                        onClick={closeModal}
                    />

                    <div className="relative z-10 max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-2xl border border-[#F0E6C8] bg-white shadow-2xl">

                        {/* CABECERA */}

                        <div className="flex items-start justify-between gap-4 border-b border-[#F1EAD5] bg-[#FDF8E7] px-7 py-5">

                            <div>
                                <h2 className="text-lg font-extrabold text-[#0E7C86]">
                                    Nueva Compra
                                </h2>

                                <p className="mt-0.5 text-xs text-[#A3915F]">
                                    Registra los productos comprados al proveedor.
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

                        <form
                            onSubmit={handleSubmit}
                            className="space-y-6 px-7 py-6"
                        >

                            {/* DATOS DE COMPRA */}

                            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">

                                {/* PROVEEDOR */}

                                <div>
                                    <label className={labelClass}>
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
                                        className={inputClass}
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
                                        <p className={errorClass}>
                                            {errors.proveedor_id}
                                        </p>
                                    )}
                                </div>

                                {/* TIPO PAGO */}

                                <div>
                                    <label className={labelClass}>
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
                                        className={inputClass}
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
                                    <label className={labelClass}>
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
                                        className={inputClass}
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
                                        <label className={labelClass}>
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
                                            className={inputClass}
                                        />
                                    </div>
                                )}

                            </div>

                            {/* PRODUCTOS */}

                            <div className="rounded-xl border border-[#F0E6C8] bg-[#FDF8E7] p-5">

                                <h3 className="mb-4 text-sm font-extrabold uppercase tracking-wider text-[#0E7C86]">
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
                                        className={inputClass}
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
                                        className={inputClass}
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
                                        className={inputClass}
                                    />

                                    <button
                                        type="button"
                                        onClick={agregarProducto}
                                        className="rounded-full border border-[#0E7C86] px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-[#0E7C86] transition hover:bg-[#0E7C86] hover:text-white"
                                    >
                                        + Agregar
                                    </button>

                                </div>

                                {/* DETALLES */}

                                <div className="mt-5 overflow-x-auto rounded-lg border border-[#F0E6C8] bg-white">

                                    <table className="w-full text-sm">

                                        <thead>
                                            <tr className="border-b border-[#F1EAD5]">
                                                <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-[#8A7A4E]">
                                                    Producto
                                                </th>

                                                <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-[#8A7A4E]">
                                                    Cantidad
                                                </th>

                                                <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-[#8A7A4E]">
                                                    Costo
                                                </th>

                                                <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-[#8A7A4E]">
                                                    Subtotal
                                                </th>

                                                <th className="px-4 py-3 text-right text-[11px] font-bold uppercase tracking-wider text-[#8A7A4E]">
                                                    Acción
                                                </th>

                                            </tr>
                                        </thead>

                                        <tbody>

                                            {data.detalles.length === 0 && (
                                                <tr>
                                                    <td
                                                        colSpan={5}
                                                        className="px-4 py-6 text-center text-sm text-[#A3915F]"
                                                    >
                                                        Aún no has agregado productos.
                                                    </td>
                                                </tr>
                                            )}

                                            {data.detalles.map(
                                                (detalle, index) => (
                                                    <tr
                                                        key={index}
                                                        className="border-b border-[#F1EAD5] last:border-0"
                                                    >

                                                        <td className="px-4 py-3 font-semibold text-[#2F2A20]">
                                                            {detalle.nombre}
                                                        </td>

                                                        <td className="px-4 py-3 text-[#7A6A45]">
                                                            {detalle.cantidad}
                                                        </td>

                                                        <td className="px-4 py-3 text-[#7A6A45]">
                                                            $
                                                            {Number(
                                                                detalle.costo_unitario
                                                            ).toFixed(2)}
                                                        </td>

                                                        <td className="px-4 py-3 font-semibold text-[#0E7C86]">
                                                            $
                                                            {Number(
                                                                detalle.subtotal
                                                            ).toFixed(2)}
                                                        </td>

                                                        <td className="px-4 py-3 text-right">

                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    eliminarDetalle(
                                                                        index
                                                                    )
                                                                }
                                                                className="text-sm font-semibold text-[#D64545] hover:underline"
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

                                <label className={labelClass}>
                                    Factura
                                    <span className="ml-1 normal-case text-[#B6A87E]">
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
                                    className="w-full rounded-lg border border-[#E5DCC0] bg-[#FFFDF6] px-4 py-2.5 text-sm text-[#3F3A2E] outline-none file:mr-4 file:rounded-full file:border-0 file:bg-[#DFF3EF] file:px-4 file:py-1.5 file:text-xs file:font-bold file:uppercase file:tracking-wider file:text-[#0E7C86]"
                                />

                                <p className="mt-1.5 text-xs text-[#B6A87E]">
                                    PDF o imagen. Tamaño máximo recomendado: 2 MB.
                                </p>

                                {errors.factura && (
                                    <p className={errorClass}>
                                        {errors.factura}
                                    </p>
                                )}

                            </div>

                            {/* MONTO PAGADO */}

                            <div>
                                <label className={labelClass}>
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
                                    className={inputClass}
                                />

                                {errors.monto_pagado && (
                                    <p className={errorClass}>
                                        {errors.monto_pagado}
                                    </p>
                                )}
                            </div>

                            {/* TOTAL */}

                            <div className="rounded-xl border border-[#F0E6C8] bg-[#FDF8E7] px-5 py-4">

                                <div className="text-right">

                                    <p className="text-[11px] font-bold uppercase tracking-wider text-[#8A7A4E]">
                                        Total de compra
                                    </p>

                                    <p className="text-2xl font-extrabold text-[#0E7C86]">
                                        $
                                        {total.toFixed(2)}
                                    </p>

                                </div>

                            </div>

                            {/* BOTONES */}

                            <div className="flex flex-col-reverse gap-3 border-t border-[#F1EAD5] pt-5 sm:flex-row sm:justify-end">

                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="rounded-full border border-[#E5DCC0] px-7 py-3 text-xs font-bold uppercase tracking-wider text-[#7A6A45] transition hover:bg-[#FDF8E7]"
                                >
                                    Cancelar
                                </button>

                                <button
                                    type="submit"
                                    disabled={
                                        processing ||
                                        data.detalles.length === 0
                                    }
                                    className="rounded-full bg-gradient-to-r from-[#F08A24] to-[#E2650F] px-7 py-3 text-xs font-extrabold uppercase tracking-wider text-white shadow-lg shadow-[#E2650F]/25 transition hover:brightness-110 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
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