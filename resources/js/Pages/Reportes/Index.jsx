import React, { useEffect, useState } from 'react';
import { Head, router } from '@inertiajs/react';
import ModalPagoCliente from './ModalPagoCliente';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import {
    TrendingUp,
    ShoppingBag,
    Boxes,
    Trophy,
    AlertTriangle,
    Wallet,
    Receipt,
    Landmark,
    HandCoins,
    Users,
    FileDown,
} from 'lucide-react';

const TABS = [
    { key: 'ventas', label: 'Ventas', icon: TrendingUp },
    { key: 'compras', label: 'Compras', icon: ShoppingBag },
    { key: 'inventario', label: 'Inventario', icon: Boxes },
    { key: 'productos', label: 'Más Vendidos', icon: Trophy },
    { key: 'caja', label: 'Cierre de Caja', icon: Landmark },
    { key: 'cuentas_cobrar', label: 'Cuentas por Cobrar', icon: HandCoins },
];

// Reportes que se pueden descargar en PDF.
const TIPOS_CON_PDF = ['compras', 'inventario', 'caja', 'cuentas_cobrar'];

// Cuentas por cobrar abre sin rango aplicado: un saldo sigue vigente aunque la
// venta sea antigua. El filtro de fechas sigue disponible si se quiere acotar.
const ABREN_SIN_RANGO = ['cuentas_cobrar'];

const handleSubmit = (e) => {
        e.preventDefault();

        post(route('ventas.pagos.store', venta.id), {
            preserveScroll: true,
            onSuccess: (page) => {
                const serverErrors = page.props.errors;
                const flashError = page.props.flash?.error; // Captura si Laravel manda el aviso por flash

                if (flashError || (serverErrors && Object.keys(serverErrors).length > 0)) {
                    const mensajeError = flashError || serverErrors.monto || serverErrors.error || 'No tienes una caja abierta para registrar pagos.';

                    warningAlert(mensajeError, 'Caja Cerrada');
                } else {
                    successAlert('Pago registrado correctamente.', '¡Éxito!');
                    reset();
                    onClose();
                }
            },
            onError: (err) => {
                const mensajeError = err.monto || err.error || 'No tienes una caja abierta para registrar pagos.';

                warningAlert(mensajeError, 'Atención');
            },
        });
    };
const money = (value) => `$${Number(value || 0).toFixed(2)}`;

function StatCard({ label, value, Icon, color = '#0E7C86' }) {
    return (
        <div className="rounded-2xl border border-[#F0E6C8] bg-white px-5 py-4 shadow-sm">
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-[11px] font-bold uppercase tracking-wider text-[#8A7A4E]">{label}</p>
                    <p className="mt-2 text-2xl font-extrabold text-[#2F2A20]">{value}</p>
                </div>
                <span
                    className="flex h-10 w-10 items-center justify-center rounded-full"
                    style={{ backgroundColor: `${color}1A`, color }}
                >
                    <Icon size={20} strokeWidth={2.25} />
                </span>
            </div>
        </div>
    );
}

function BarList({ items, labelKey, valueKey, countKey, formatValue = money }) {
    const max = items.reduce((acc, item) => Math.max(acc, Number(item[valueKey] || 0)), 0);

    if (items.length === 0) {
        return <p className="px-1 py-6 text-center text-sm text-[#A3915F]">Sin datos en este rango.</p>;
    }

    return (
        <div className="space-y-3">
            {items.map((item, index) => {
                const value = Number(item[valueKey] || 0);
                const pct = max > 0 ? (value / max) * 100 : 0;
                return (
                    <div key={index}>
                        <div className="mb-1 flex items-center justify-between text-xs">
                            <span className="font-semibold text-[#2F2A20]">{item[labelKey]}</span>
                            <span className="text-[#7A6A45]">
                                {formatValue(value)}
                                {countKey ? ` · ${item[countKey]}` : ''}
                            </span>
                        </div>
                        <div className="h-2 w-full overflow-hidden rounded-full bg-[#F5F0E0]">
                            <div
                                className="h-full rounded-full bg-gradient-to-r from-[#0E7C86] to-[#14A0AC]"
                                style={{ width: `${pct}%` }}
                            />
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

function Pagination({ links }) {
    if (!links || links.length <= 3) return null;

    return (
        <div className="flex flex-wrap items-center justify-center gap-1.5 border-t border-[#F1EAD5] px-6 py-5">
            {links.map((link, index) => (
                <button
                    key={index}
                    type="button"
                    disabled={!link.url}
                    onClick={() => {
                        if (link.url) {
                            router.get(link.url, {}, { preserveState: true, preserveScroll: true });
                        }
                    }}
                    dangerouslySetInnerHTML={{ __html: link.label }}
                    className={`min-w-[38px] rounded-lg px-3 py-2 text-sm font-semibold transition ${link.active
                        ? 'bg-[#0E7C86] text-white shadow-sm'
                        : link.url
                            ? 'text-[#7A6A45] hover:bg-[#FDF8E7] hover:text-[#0E7C86]'
                            : 'cursor-not-allowed text-[#D6CBA8]'
                        }`}
                />
            ))}
        </div>
    );
}

const thClass = 'px-6 py-4 text-left text-[11px] font-bold uppercase tracking-wider text-[#8A7A4E]';
const cardClass = 'overflow-hidden rounded-2xl border border-[#F0E6C8] bg-white shadow-[0_10px_30px_-12px_rgba(120,100,50,0.25)]';

export default function Index({
    tipo = 'ventas',
    filtros = { desde: '', hasta: '', limite: 15 },
    totales = null,
    porDia = [],
    porMetodoPago = [],
    porVendedor = [],
    ventas = { data: [], links: [] },
    porProveedor = [],
    porEstado = [],
    compras = { data: [], links: [] },
    valorInventario = { costo: 0, venta: 0 },
    totalProductos = 0,
    productosStockBajo = [],
    porTipo = [],
    productos = [],
    porUsuario = [],
    cierresCaja = { data: [], links: [] },
    porCliente = [],
    ventasCredito = { data: [], links: [] },
}) {
    const [desde, setDesde] = useState(filtros.desde || '');
    const [hasta, setHasta] = useState(filtros.hasta || '');
    const [limite, setLimite] = useState(filtros.limite || 15);
    const [ventaSeleccionada, setVentaSeleccionada] = useState(null);

    // Los inputs siempre reflejan el rango que el servidor aplico: al cambiar de
    // pestaña el rango puede quedar vacio y las cajas de fecha deben mostrarlo.
    useEffect(() => {
        setDesde(filtros.desde || '');
        setHasta(filtros.hasta || '');
    }, [tipo, filtros.desde, filtros.hasta]);

    const abreSinRango = ABREN_SIN_RANGO.includes(tipo);

    const irA = (nuevoTipo, extra = {}) => {
        // El rango no se arrastra a un reporte que abre sin el.
        const rango = ABREN_SIN_RANGO.includes(nuevoTipo) ? {} : { desde, hasta };

        router.get(
            route('reportes.index'),
            { tipo: nuevoTipo, ...rango, ...(nuevoTipo === 'productos' ? { limite } : {}), ...extra },
            { preserveState: true, preserveScroll: true }
        );
    };

    const aplicarFiltros = (e) => {
        e.preventDefault();
        // Aqui el rango va explicito: es lo que el usuario acaba de escribir.
        irA(tipo, { desde, hasta });
    };

    const descargarPdf = () => {
        window.location.href = route('reportes.pdf', { tipo, desde, hasta });
    };

    return (
        <AuthenticatedLayout header={<h2 className="text-xl font-bold text-[#0E7C86]">Reportes</h2>}>
            <Head title="Reportes" />

            <div className="min-h-full bg-[#FDF8E7] py-8">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="mb-6">
                        <h1 className="text-xl font-extrabold tracking-tight text-[#0E7C86] sm:text-2xl">
                            Panel de Reportes
                        </h1>
                        <p className="mt-1 text-sm text-[#A3915F]">
                            Consulta el desempeño del negocio por ventas, compras, inventario y productos.
                        </p>
                    </div>

                    {/* TABS */}
                    <div className="mb-6 flex flex-wrap gap-2">
                        {TABS.map((t) => {
                            const Icon = t.icon;
                            const active = tipo === t.key;
                            return (
                                <button
                                    key={t.key}
                                    type="button"
                                    onClick={() => irA(t.key)}
                                    className={`inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-xs font-extrabold uppercase tracking-wider transition ${active
                                        ? 'bg-gradient-to-r from-[#F08A24] to-[#E2650F] text-white shadow-lg shadow-[#E2650F]/25'
                                        : 'border border-[#E5DCC0] bg-white text-[#7A6A45] hover:bg-[#FDF8E7]'
                                        }`}
                                >
                                    <Icon size={15} />
                                    {t.label}
                                </button>
                            );
                        })}
                    </div>

                    {/* FILTROS */}
                    <form
                        onSubmit={aplicarFiltros}
                        className="mb-6 flex flex-wrap items-end gap-4 rounded-2xl border border-[#F0E6C8] bg-white px-6 py-5 shadow-sm"
                    >
                        <div>
                            <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-[#8A7A4E]">
                                Desde
                            </label>
                            <input
                                type="date"
                                value={desde}
                                onChange={(e) => setDesde(e.target.value)}
                                className="rounded-lg border border-[#E5DCC0] bg-[#FFFDF6] px-4 py-2.5 text-sm text-[#3F3A2E] outline-none focus:border-[#0E7C86] focus:ring-2 focus:ring-[#0E7C86]/20"
                            />
                        </div>
                        <div>
                            <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-[#8A7A4E]">
                                Hasta
                            </label>
                            <input
                                type="date"
                                value={hasta}
                                onChange={(e) => setHasta(e.target.value)}
                                className="rounded-lg border border-[#E5DCC0] bg-[#FFFDF6] px-4 py-2.5 text-sm text-[#3F3A2E] outline-none focus:border-[#0E7C86] focus:ring-2 focus:ring-[#0E7C86]/20"
                            />
                        </div>
                        {tipo === 'productos' && (
                            <div>
                                <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-[#8A7A4E]">
                                    Top
                                </label>
                                <select
                                    value={limite}
                                    onChange={(e) => setLimite(e.target.value)}
                                    className="rounded-lg border border-[#E5DCC0] bg-[#FFFDF6] px-4 py-2.5 text-sm text-[#3F3A2E] outline-none focus:border-[#0E7C86] focus:ring-2 focus:ring-[#0E7C86]/20"
                                >
                                    {[10, 15, 25, 50].map((n) => (
                                        <option key={n} value={n}>
                                            Top {n}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}
                        <button
                            type="submit"
                            className="rounded-full bg-[#0E7C86] px-6 py-2.5 text-xs font-extrabold uppercase tracking-wider text-white shadow transition hover:bg-[#0A626A]"
                        >
                            Aplicar
                        </button>

                        {abreSinRango && (desde || hasta) && (
                            <button
                                type="button"
                                onClick={() => {
                                    setDesde('');
                                    setHasta('');
                                    irA(tipo, { desde: '', hasta: '' });
                                }}
                                className="rounded-full border border-[#E5DCC0] px-6 py-2.5 text-xs font-extrabold uppercase tracking-wider text-[#7A6A45] transition hover:bg-[#FDF8E7]"
                            >
                                Ver todo
                            </button>
                        )}

                        {TIPOS_CON_PDF.includes(tipo) && (
                            <button
                                type="button"
                                onClick={descargarPdf}
                                title="Descargar este reporte en PDF"
                                className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#F08A24] to-[#E2650F] px-6 py-2.5 text-xs font-extrabold uppercase tracking-wider text-white shadow-lg shadow-[#E2650F]/25 transition hover:from-[#E2650F] hover:to-[#C9550A]"
                            >
                                <FileDown size={15} />
                                Descargar PDF
                            </button>
                        )}
                    </form>

                    {/* ===================== VENTAS ===================== */}
                    {tipo === 'ventas' && (
                        <>
                            <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
                                <StatCard label="Total Vendido" value={money(totales?.total)} Icon={Wallet} color="#0E7C86" />
                                <StatCard label="N° de Ventas" value={totales?.cantidad ?? 0} Icon={Receipt} color="#F08A24" />
                                <StatCard label="Ticket Promedio" value={money(totales?.promedio)} Icon={TrendingUp} color="#6D5DD3" />
                            </div>

                            <div className="mb-6 grid grid-cols-1 gap-5 lg:grid-cols-2">
                                <div className="rounded-2xl border border-[#F0E6C8] bg-white p-6 shadow-sm">
                                    <h2 className="mb-4 font-bold text-[#0E7C86]">Por Método de Pago</h2>
                                    <BarList items={porMetodoPago} labelKey="metodo_pago" valueKey="total" countKey="cantidad" />
                                </div>
                                <div className="rounded-2xl border border-[#F0E6C8] bg-white p-6 shadow-sm">
                                    <h2 className="mb-4 font-bold text-[#0E7C86]">Por Vendedor</h2>
                                    <BarList items={porVendedor} labelKey="name" valueKey="total" countKey="cantidad" />
                                </div>
                            </div>

                            <div className="mb-6 rounded-2xl border border-[#F0E6C8] bg-white p-6 shadow-sm">
                                <h2 className="mb-4 font-bold text-[#0E7C86]">Ventas por Día</h2>
                                <BarList items={porDia} labelKey="fecha" valueKey="total" countKey="cantidad" />
                            </div>

                            <div className={cardClass}>
                                <div className="overflow-x-auto">
                                    <table className="min-w-full">
                                        <thead>
                                            <tr className="border-b border-[#F1EAD5] bg-white">
                                                <th className={thClass + ' sm:pl-8'}>ID</th>
                                                <th className={thClass}>Cliente</th>
                                                <th className={thClass}>Vendedor</th>
                                                <th className={thClass}>Método</th>
                                                <th className={thClass}>Fecha</th>
                                                <th className="px-6 py-4 text-right text-[11px] font-bold uppercase tracking-wider text-[#8A7A4E] sm:pr-8">
                                                    Total
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {ventas?.data?.length === 0 && (
                                                <tr>
                                                    <td colSpan={6} className="px-8 py-12 text-center text-sm text-[#A3915F]">
                                                        No hay ventas en este rango de fechas.
                                                    </td>
                                                </tr>
                                            )}
                                            {ventas?.data?.map((venta) => (
                                                <tr key={venta.id} className="border-b border-[#F1EAD5] transition-colors last:border-0 hover:bg-[#FFFBEF]">
                                                    <td className="whitespace-nowrap px-6 py-5 text-sm font-bold text-[#2F2A20] sm:pl-8">#{venta.id}</td>
                                                    <td className="px-6 py-5 text-sm text-[#7A6A45]">{venta.cliente?.nombre || 'Consumidor final'}</td>
                                                    <td className="px-6 py-5 text-sm text-[#7A6A45]">{venta.user?.name || '-'}</td>
                                                    <td className="whitespace-nowrap px-6 py-5">
                                                        <span className="inline-flex rounded-md bg-[#F5F0E0] px-3 py-1.5 text-[11px] font-extrabold uppercase tracking-wider text-[#7A6A45]">
                                                            {venta.metodo_pago}
                                                        </span>
                                                    </td>
                                                    <td className="whitespace-nowrap px-6 py-5 text-sm text-[#A3915F]">
                                                        {new Date(venta.created_at).toLocaleDateString('es-EC')}
                                                    </td>
                                                    <td className="whitespace-nowrap px-6 py-5 text-right text-sm font-extrabold text-[#2F2A20] sm:pr-8">
                                                        {money(venta.total)}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                <Pagination links={ventas?.links} />
                            </div>
                        </>
                    )}

                    {/* ===================== COMPRAS ===================== */}
                    {tipo === 'compras' && (
                        <>
                            <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
                                <StatCard label="Total Comprado" value={money(totales?.total)} Icon={Wallet} color="#0E7C86" />
                                <StatCard label="Pagado" value={money(totales?.pagado)} Icon={Receipt} color="#1AA65E" />
                                <StatCard label="Saldo Pendiente" value={money(totales?.pendiente)} Icon={AlertTriangle} color="#D64545" />
                            </div>

                            <div className="mb-6 grid grid-cols-1 gap-5 lg:grid-cols-2">
                                <div className="rounded-2xl border border-[#F0E6C8] bg-white p-6 shadow-sm">
                                    <h2 className="mb-4 font-bold text-[#0E7C86]">Por Proveedor</h2>
                                    <BarList items={porProveedor} labelKey="nombre" valueKey="total" countKey="cantidad" />
                                </div>
                                <div className="rounded-2xl border border-[#F0E6C8] bg-white p-6 shadow-sm">
                                    <h2 className="mb-4 font-bold text-[#0E7C86]">Por Estado</h2>
                                    <BarList items={porEstado} labelKey="estado" valueKey="total" countKey="cantidad" />
                                </div>
                            </div>

                            <div className={cardClass}>
                                <div className="overflow-x-auto">
                                    <table className="min-w-full">
                                        <thead>
                                            <tr className="border-b border-[#F1EAD5] bg-white">
                                                <th className={thClass + ' sm:pl-8'}>ID</th>
                                                <th className={thClass}>Proveedor</th>
                                                <th className={thClass}>Estado</th>
                                                <th className={thClass}>Fecha</th>
                                                <th className="px-6 py-4 text-right text-[11px] font-bold uppercase tracking-wider text-[#8A7A4E] sm:pr-8">
                                                    Total
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {compras?.data?.length === 0 && (
                                                <tr>
                                                    <td colSpan={5} className="px-8 py-12 text-center text-sm text-[#A3915F]">
                                                        No hay compras en este rango de fechas.
                                                    </td>
                                                </tr>
                                            )}
                                            {compras?.data?.map((compra) => (
                                                <tr key={compra.id} className="border-b border-[#F1EAD5] transition-colors last:border-0 hover:bg-[#FFFBEF]">
                                                    <td className="whitespace-nowrap px-6 py-5 text-sm font-bold text-[#2F2A20] sm:pl-8">#{compra.id}</td>
                                                    <td className="px-6 py-5 text-sm text-[#7A6A45]">{compra.proveedor?.nombre || 'Sin proveedor'}</td>
                                                    <td className="whitespace-nowrap px-6 py-5">
                                                        <span className="inline-flex rounded-md bg-[#F5F0E0] px-3 py-1.5 text-[11px] font-extrabold uppercase tracking-wider text-[#7A6A45]">
                                                            {compra.estado}
                                                        </span>
                                                    </td>
                                                    <td className="whitespace-nowrap px-6 py-5 text-sm text-[#A3915F]">
                                                        {compra.fecha_compra ? new Date(compra.fecha_compra).toLocaleDateString('es-EC') : '-'}
                                                    </td>
                                                    <td className="whitespace-nowrap px-6 py-5 text-right text-sm font-extrabold text-[#2F2A20] sm:pr-8">
                                                        {money(compra.total)}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                <Pagination links={compras?.links} />
                            </div>
                        </>
                    )}

                    {/* ===================== INVENTARIO ===================== */}
                    {tipo === 'inventario' && (
                        <>
                            <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
                                <StatCard label="Valor de Inventario (Costo)" value={money(valorInventario?.costo)} Icon={Wallet} color="#0E7C86" />
                                <StatCard label="Valor de Inventario (Venta)" value={money(valorInventario?.venta)} Icon={TrendingUp} color="#1AA65E" />
                                <StatCard label="Productos con Stock Bajo" value={productosStockBajo?.length ?? 0} Icon={AlertTriangle} color="#D64545" />
                            </div>

                            <div className="mb-6 rounded-2xl border border-[#F0E6C8] bg-white p-6 shadow-sm">
                                <h2 className="mb-4 font-bold text-[#0E7C86]">Movimientos por Tipo (rango seleccionado)</h2>
                                <BarList
                                    items={porTipo}
                                    labelKey="tipo"
                                    valueKey="unidades"
                                    countKey="cantidad"
                                    formatValue={(v) => `${Number(v).toFixed(2)} u.`}
                                />
                            </div>

                            <div className={cardClass}>
                                <div className="flex items-center justify-between border-b border-[#F1EAD5] bg-gradient-to-br from-[#FDF8E7] to-white px-6 py-5">
                                    <h2 className="font-bold text-[#0E7C86]">Productos con Stock Bajo</h2>
                                    <span className="text-xs font-semibold text-[#A3915F]">
                                        {totalProductos} productos en catálogo
                                    </span>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="min-w-full">
                                        <thead>
                                            <tr className="border-b border-[#F1EAD5] bg-white">
                                                <th className={thClass + ' sm:pl-8'}>Producto</th>
                                                <th className={thClass}>Unidad</th>
                                                <th className={thClass}>Stock Actual</th>
                                                <th className="px-6 py-4 text-right text-[11px] font-bold uppercase tracking-wider text-[#8A7A4E] sm:pr-8">
                                                    Stock Mínimo
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {productosStockBajo?.length === 0 && (
                                                <tr>
                                                    <td colSpan={4} className="px-8 py-12 text-center text-sm text-[#A3915F]">
                                                        Ningún producto está por debajo de su stock mínimo.
                                                    </td>
                                                </tr>
                                            )}
                                            {productosStockBajo?.map((producto) => (
                                                <tr key={producto.id} className="border-b border-[#F1EAD5] transition-colors last:border-0 hover:bg-[#FFFBEF]">
                                                    <td className="px-6 py-5 text-sm font-bold text-[#2F2A20] sm:pl-8">{producto.nombre}</td>
                                                    <td className="px-6 py-5 text-sm text-[#7A6A45]">{producto.unidad?.nombre || '-'}</td>
                                                    <td className="px-6 py-5">
                                                        <span className="inline-flex rounded-md bg-[#FBE2E2] px-3 py-1.5 text-[11px] font-extrabold uppercase tracking-wider text-[#D64545]">
                                                            {producto.stock}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-5 text-right text-sm text-[#7A6A45] sm:pr-8">
                                                        {producto.stock_minimo}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </>
                    )}

                    {/* ===================== PRODUCTOS MÁS VENDIDOS ===================== */}
                    {tipo === 'productos' && (
                        <div className={cardClass}>
                            <div className="border-b border-[#F1EAD5] bg-gradient-to-br from-[#FDF8E7] to-white px-6 py-5">
                                <h2 className="font-bold text-[#0E7C86]">Productos Más Vendidos</h2>
                                <p className="mt-1 text-sm text-[#A3915F]">Ranking por cantidad de unidades vendidas en el rango seleccionado.</p>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="min-w-full">
                                    <thead>
                                        <tr className="border-b border-[#F1EAD5] bg-white">
                                            <th className={thClass + ' sm:pl-8'}>#</th>
                                            <th className={thClass}>Producto</th>
                                            <th className={thClass}>Cantidad Vendida</th>
                                            <th className="px-6 py-4 text-right text-[11px] font-bold uppercase tracking-wider text-[#8A7A4E] sm:pr-8">
                                                Ingresos
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {productos?.length === 0 && (
                                            <tr>
                                                <td colSpan={4} className="px-8 py-12 text-center text-sm text-[#A3915F]">
                                                    No hay ventas registradas en este rango de fechas.
                                                </td>
                                            </tr>
                                        )}
                                        {productos?.map((producto, index) => (
                                            <tr key={producto.id} className="border-b border-[#F1EAD5] transition-colors last:border-0 hover:bg-[#FFFBEF]">
                                                <td className="whitespace-nowrap px-6 py-5 text-sm font-bold text-[#2F2A20] sm:pl-8">
                                                    {index + 1}
                                                </td>
                                                <td className="px-6 py-5 text-sm font-semibold text-[#2F2A20]">{producto.nombre}</td>
                                                <td className="px-6 py-5 text-sm text-[#7A6A45]">{Number(producto.cantidad_vendida).toFixed(2)}</td>
                                                <td className="whitespace-nowrap px-6 py-5 text-right text-sm font-extrabold text-[#0E7C86] sm:pr-8">
                                                    {money(producto.ingresos)}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* ===================== CIERRE DE CAJA ===================== */}
                    {tipo === 'caja' && (
                        <>
                            <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-4">
                                <StatCard label="N° de Cierres" value={totales?.cantidad ?? 0} Icon={Receipt} color="#F08A24" />
                                <StatCard label="Total Apertura" value={money(totales?.total_apertura)} Icon={Wallet} color="#0E7C86" />
                                <StatCard label="Total Cierre (Arqueo)" value={money(totales?.total_cierre)} Icon={Landmark} color="#6D5DD3" />
                                <StatCard
                                    label="Diferencia Acumulada"
                                    value={money(totales?.total_diferencia)}
                                    Icon={AlertTriangle}
                                    color={Number(totales?.total_diferencia) < 0 ? '#D64545' : '#1AA65E'}
                                />
                            </div>

                            <div className="mb-6 rounded-2xl border border-[#F0E6C8] bg-white p-6 shadow-sm">
                                <h2 className="mb-4 font-bold text-[#0E7C86]">Cierres por Usuario</h2>
                                <BarList
                                    items={porUsuario}
                                    labelKey="name"
                                    valueKey="cantidad"
                                    formatValue={(v) => `${v} cierre(s)`}
                                />
                            </div>

                            <div className={cardClass}>
                                <div className="border-b border-[#F1EAD5] bg-gradient-to-br from-[#FDF8E7] to-white px-6 py-5">
                                    <h2 className="font-bold text-[#0E7C86]">Historial de Cierres de Caja</h2>
                                    <p className="mt-1 text-sm text-[#A3915F]">Arqueos registrados en el rango de fechas seleccionado.</p>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="min-w-full">
                                        <thead>
                                            <tr className="border-b border-[#F1EAD5] bg-white">
                                                <th className={thClass + ' sm:pl-8'}>ID</th>
                                                <th className={thClass}>Usuario</th>
                                                <th className={thClass}>Apertura</th>
                                                <th className={thClass}>Cierre</th>
                                                <th className={thClass}>Monto Apertura</th>
                                                <th className={thClass}>Monto Esperado</th>
                                                <th className={thClass}>Monto Cierre</th>
                                                <th className="px-6 py-4 text-right text-[11px] font-bold uppercase tracking-wider text-[#8A7A4E] sm:pr-8">
                                                    Diferencia
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {cierresCaja?.data?.length === 0 && (
                                                <tr>
                                                    <td colSpan={8} className="px-8 py-12 text-center text-sm text-[#A3915F]">
                                                        No hay cierres de caja en este rango de fechas.
                                                    </td>
                                                </tr>
                                            )}
                                            {cierresCaja?.data?.map((cierre) => {
                                                const diferencia = Number(cierre.diferencia || 0);
                                                return (
                                                    <tr key={cierre.id} className="border-b border-[#F1EAD5] transition-colors last:border-0 hover:bg-[#FFFBEF]">
                                                        <td className="whitespace-nowrap px-6 py-5 text-sm font-bold text-[#2F2A20] sm:pl-8">#{cierre.id}</td>
                                                        <td className="px-6 py-5 text-sm text-[#7A6A45]">{cierre.user?.name || '-'}</td>
                                                        <td className="whitespace-nowrap px-6 py-5 text-sm text-[#A3915F]">
                                                            {cierre.fecha_apertura ? new Date(cierre.fecha_apertura).toLocaleString('es-EC') : '-'}
                                                        </td>
                                                        <td className="whitespace-nowrap px-6 py-5 text-sm text-[#A3915F]">
                                                            {cierre.fecha_cierre ? new Date(cierre.fecha_cierre).toLocaleString('es-EC') : '-'}
                                                        </td>
                                                        <td className="whitespace-nowrap px-6 py-5 text-sm text-[#2F2A20]">{money(cierre.monto_apertura)}</td>
                                                        <td className="whitespace-nowrap px-6 py-5 text-sm text-[#2F2A20]">{money(cierre.monto_esperado)}</td>
                                                        <td className="whitespace-nowrap px-6 py-5 text-sm text-[#2F2A20]">{money(cierre.monto_cierre)}</td>
                                                        <td className="whitespace-nowrap px-6 py-5 text-right text-sm font-extrabold sm:pr-8" style={{ color: diferencia < 0 ? '#D64545' : diferencia > 0 ? '#1AA65E' : '#2F2A20' }}>
                                                            {diferencia > 0 ? '+' : ''}
                                                            {money(diferencia)}
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                                <Pagination links={cierresCaja?.links} />
                            </div>
                        </>
                    )}

                    {/* ===================== CUENTAS POR COBRAR ===================== */}
                    {tipo === 'cuentas_cobrar' && (
                        <>
                            <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-4">
                                <StatCard label="Total por Cobrar" value={money(totales?.total)} Icon={HandCoins} color="#E2650F" />
                                <StatCard label="Ventas a Credito" value={totales?.cantidad ?? 0} Icon={Receipt} color="#0E7C86" />
                                <StatCard label="Clientes con Deuda" value={totales?.clientes ?? 0} Icon={Users} color="#6D5DD3" />
                                <StatCard label="Deuda Promedio" value={money(totales?.promedio)} Icon={TrendingUp} color="#1AA65E" />
                            </div>

                            <div className="mb-6 rounded-2xl border border-[#F0E6C8] bg-white p-6 shadow-sm">
                                <h2 className="mb-4 font-bold text-[#0E7C86]">Deuda por Cliente</h2>
                                <BarList items={porCliente} labelKey="nombre" valueKey="total" countKey="cantidad" />
                            </div>

                            <div className={cardClass}>
                                <div className="border-b border-[#F1EAD5] bg-gradient-to-br from-[#FDF8E7] to-white px-6 py-5">
                                    <h2 className="font-bold text-[#0E7C86]">Detalle de Cuentas por Cobrar</h2>
                                    <p className="mt-1 text-sm text-[#A3915F]">
                                        Estado de deudas, abonos realizados y saldos pendientes.
                                        {desde || hasta
                                            ? ' Filtrado por la fecha de registro de la venta.'
                                            : ' Se listan todos los clientes con deuda, sin importar la fecha de la venta.'}
                                    </p>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="min-w-full">
                                        <thead>
                                            <tr className="border-b border-[#F1EAD5] bg-white">
                                                <th className={thClass + ' sm:pl-8'}>Venta</th>
                                                <th className={thClass}>Fecha</th>
                                                <th className={thClass}>Cliente</th>
                                                <th className={thClass}>Estado</th>
                                                <th className="px-6 py-4 text-right text-[11px] font-bold uppercase tracking-wider text-[#8A7A4E]">
                                                    Total Venta
                                                </th>
                                                <th className="px-6 py-4 text-right text-[11px] font-bold uppercase tracking-wider text-[#1AA65E]">
                                                    Total Abonado
                                                </th>
                                                <th className="px-6 py-4 text-right text-[11px] font-bold uppercase tracking-wider text-[#E2650F]">
                                                    Saldo Pendiente
                                                </th>
                                                <th className="px-6 py-4 text-right text-[11px] font-bold uppercase tracking-wider text-[#8A7A4E] sm:pr-8">
                                                    Acciones
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {ventasCredito?.data?.length === 0 && (
                                                <tr>
                                                    <td colSpan={8} className="px-8 py-12 text-center text-sm text-[#A3915F]">
                                                        No hay ventas a crédito registradas.
                                                    </td>
                                                </tr>
                                            )}
                                            {ventasCredito?.data?.map((venta) => {
                                                // Suma precisa de la tabla de pagos o del pago inicial
                                                const totalAbonado = venta.pagos && venta.pagos.length > 0
                                                    ? venta.pagos.reduce((acc, p) => acc + Number(p.monto || 0), 0)
                                                    : Number(venta.pago_con || 0);

                                                const totalVenta = Number(venta.total || 0);
                                                const saldoCalculado = Math.max(0, totalVenta - totalAbonado);

                                                // Evaluación estricta de saldo
                                                const saldoPendiente = (venta.saldo_pendiente !== null && venta.saldo_pendiente !== undefined && Number(venta.saldo_pendiente) > 0)
                                                    ? Number(venta.saldo_pendiente)
                                                    : saldoCalculado;

                                                const esCancelado = venta.estado === 'completada' || saldoPendiente <= 0;

                                                return (
                                                    <tr key={venta.id} className="border-b border-[#F1EAD5] transition-colors last:border-0 hover:bg-[#FFFBEF]">
                                                        <td className="whitespace-nowrap px-6 py-5 text-sm font-bold text-[#2F2A20] sm:pl-8">
                                                            #{venta.id}
                                                        </td>
                                                        <td className="whitespace-nowrap px-6 py-5 text-sm text-[#A3915F]">
                                                            {venta.created_at ? new Date(venta.created_at).toLocaleString('es-EC') : '-'}
                                                        </td>
                                                        <td className="px-6 py-5 text-sm text-[#2F2A20]">
                                                            {venta.cliente
                                                                ? `${venta.cliente.nombre || ''} ${venta.cliente.apellido || ''}`.trim()
                                                                : 'Consumidor Final'}
                                                        </td>
                                                        <td className="whitespace-nowrap px-6 py-5">
                                                            <span className={`inline-flex rounded-md px-3 py-1 text-[11px] font-extrabold uppercase tracking-wider ${esCancelado
                                                                    ? 'bg-[#E1F8EB] text-[#1AA65E]'
                                                                    : 'bg-[#FEF3D6] text-[#E2650F]'
                                                                }`}>
                                                                {esCancelado ? 'Cancelado' : 'Pendiente'}
                                                            </span>
                                                        </td>
                                                        <td className="whitespace-nowrap px-6 py-5 text-right text-sm font-bold text-[#2F2A20]">
                                                            {money(totalVenta)}
                                                        </td>
                                                        <td className="whitespace-nowrap px-6 py-5 text-right text-sm font-extrabold text-[#1AA65E]">
                                                            {money(totalAbonado)}
                                                        </td>
                                                        <td className="whitespace-nowrap px-6 py-5 text-right text-sm font-extrabold text-[#E2650F]">
                                                            {money(saldoPendiente)}
                                                        </td>
                                                  
<td className="whitespace-nowrap px-6 py-5 text-right sm:pr-8">
    <div className="flex items-center justify-end gap-2">
        {/* Botón Imprimir Factura/Ticket */}
        <button
            type="button"
            onClick={() => window.open(route('ventas.imprimir', venta.id), '_blank')}
            title="Ver / Imprimir Factura"
            className="rounded-lg border border-[#0E7C86] px-2.5 py-1.5 text-xs font-bold text-[#0E7C86] transition hover:bg-[#0E7C86] hover:text-white"
        >
            🖨️
        </button>

        {!esCancelado ? (
            <button
                type="button"
                onClick={() => setVentaSeleccionada({ ...venta, saldoCalculado: saldoPendiente })}
                className="rounded-lg bg-[#0E7C86] px-3 py-1.5 text-xs font-bold text-white shadow-sm transition hover:bg-[#0A626A]"
            >
                Abonar
            </button>
        ) : (
            <span className="text-xs font-semibold text-[#1AA65E]">Saldado</span>
        )}
    </div>
</td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                                <Pagination links={ventasCredito?.links} />
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* MODAL DE PAGO */}
            <ModalPagoCliente
                isOpen={!!ventaSeleccionada}
                onClose={() => setVentaSeleccionada(null)}
                venta={ventaSeleccionada}
            />
        </AuthenticatedLayout>
    );
}
