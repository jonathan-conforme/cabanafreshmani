import React, { useState } from 'react';
import { usePage } from "@inertiajs/react";
import { HandCoins, Receipt, Users, TrendingUp, Search } from 'lucide-react';
import { imprimirTicketDirecto } from '@/Utils/printerService';

const calcularMetricasVenta = (venta) => {
    const totalAbonado = venta.pagos && venta.pagos.length > 0
        ? venta.pagos.reduce((acc, p) => acc + Number(p.monto || 0), 0)
        : Number(venta.pago_con || 0);

    const totalVenta = Number(venta.total || 0);
    const saldoCalculado = Math.max(0, totalVenta - totalAbonado);

    const saldoPendiente = (venta.saldo_pendiente !== null && venta.saldo_pendiente !== undefined && Number(venta.saldo_pendiente) > 0)
        ? Number(venta.saldo_pendiente)
        : saldoCalculado;

    const esCancelado = venta.estado === 'completada' || saldoPendiente <= 0;

    return { totalAbonado, totalVenta, saldoPendiente, esCancelado };
};

export default function CuentasCobrarTab({ totales, porCliente, ventasCredito, desde, hasta, onAbonar, money, StatCard, BarList, Pagination, cardClass, thClass }) {
    const { props } = usePage();
    const empresa = props.empresa || {};

    // Estado para controlar la búsqueda por Nombre o Cédula
    const [busqueda, setBusqueda] = useState('');

    // Filtrado en tiempo real sobre los datos recibidos
    const ventasFiltradas = ventasCredito?.data?.filter((venta) => {
        if (!busqueda.trim()) return true;

        const termino = busqueda.toLowerCase().trim();
        const clienteNombre = `${venta.cliente?.nombre || ''} ${venta.cliente?.apellido || ''}`.toLowerCase();
        const clienteCedula = (
            venta.cliente?.cedula ||
            venta.cliente?.identificacion ||
            venta.cliente?.dni ||
            venta.cliente?.ruc || ''
        ).toLowerCase();
        const idVenta = String(venta.id);

        return clienteNombre.includes(termino) || clienteCedula.includes(termino) || idVenta.includes(termino);
    });

    return (
        <>
            <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-4">
                <StatCard label="Total por Cobrar" value={money(totales?.total)} Icon={HandCoins} color="#E2650F" />
                <StatCard label="Ventas a Crédito" value={totales?.cantidad ?? 0} Icon={Receipt} color="#0E7C86" />
                <StatCard label="Clientes con Deuda" value={totales?.clientes ?? 0} Icon={Users} color="#6D5DD3" />
                <StatCard label="Deuda Promedio" value={money(totales?.promedio)} Icon={TrendingUp} color="#1AA65E" />
            </div>

            <div className="mb-6 rounded-2xl border border-[#F0E6C8] bg-white p-6 shadow-sm">
                <h2 className="mb-4 font-bold text-[#0E7C86]">Deuda por Cliente</h2>
                <BarList items={porCliente} labelKey="nombre" valueKey="total" countKey="cantidad" />
            </div>

            <div className={cardClass}>
                <div className="flex flex-col gap-4 border-b border-[#F1EAD5] bg-gradient-to-br from-[#FDF8E7] to-white px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h2 className="font-bold text-[#0E7C86]">Detalle de Cuentas por Cobrar</h2>
                        <p className="mt-1 text-sm text-[#A3915F]">
                            Estado de deudas, abonos realizados y saldos pendientes.
                            {desde || hasta
                                ? ' Filtrado por la fecha de registro de la venta.'
                                : ' Se listan todos los clientes con deuda, sin importar la fecha de la venta.'}
                        </p>
                    </div>

                    {/* Input de búsqueda por Nombre / Cédula */}
                    <div className="relative w-full sm:w-72">
                        <input
                            type="text"
                            placeholder="Buscar por cliente o cédula..."
                            value={busqueda}
                            onChange={(e) => setBusqueda(e.target.value)}
                            className="w-full rounded-lg border border-[#E5DCC0] bg-[#FFFDF6] pl-9 pr-4 py-2 text-sm text-[#3F3A2E] placeholder-[#A3915F] outline-none focus:border-[#0E7C86] focus:ring-2 focus:ring-[#0E7C86]/20"
                        />
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-[#A3915F]" />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full">
                        <thead>
                            <tr className="border-b border-[#F1EAD5] bg-white">
                                <th className={thClass + ' sm:pl-8'}>Venta</th>
                                <th className={thClass}>Fecha</th>
                                <th className={thClass}>Cliente</th>
                                <th className={thClass}>Estado</th>
                                <th className="px-6 py-4 text-right text-[11px] font-bold uppercase tracking-wider text-[#8A7A4E]">Total Venta</th>
                                <th className="px-6 py-4 text-right text-[11px] font-bold uppercase tracking-wider text-[#1AA65E]">Total Abonado</th>
                                <th className="px-6 py-4 text-right text-[11px] font-bold uppercase tracking-wider text-[#E2650F]">Saldo Pendiente</th>
                                <th className="px-6 py-4 text-right text-[11px] font-bold uppercase tracking-wider text-[#8A7A4E] sm:pr-8">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {(!ventasFiltradas || ventasFiltradas.length === 0) && (
                                <tr>
                                    <td colSpan={8} className="px-8 py-12 text-center text-sm text-[#A3915F]">
                                        {busqueda ? 'No se encontraron clientes que coincidan con la búsqueda.' : 'No hay ventas a crédito registradas.'}
                                    </td>
                                </tr>
                            )}
                            {ventasFiltradas?.map((venta) => {
                                const { totalAbonado, totalVenta, saldoPendiente, esCancelado } = calcularMetricasVenta(venta);

                                return (
                                    <tr key={venta.id} className="border-b border-[#F1EAD5] transition-colors last:border-0 hover:bg-[#FFFBEF]">
                                        <td className="whitespace-nowrap px-6 py-5 text-sm font-bold text-[#2F2A20] sm:pl-8">#{venta.id}</td>
                                        <td className="whitespace-nowrap px-6 py-5 text-sm text-[#A3915F]">
                                            {venta.created_at ? new Date(venta.created_at).toLocaleString('es-EC') : '-'}
                                        </td>
                                        <td className="px-6 py-5 text-sm text-[#2F2A20]">
                                            <div>
                                                <p className="font-semibold">{venta.cliente ? `${venta.cliente.nombre || ''} ${venta.cliente.apellido || ''}`.trim() : 'Consumidor Final'}</p>
                                                {(venta.cliente?.cedula || venta.cliente?.identificacion || venta.cliente?.dni || venta.cliente?.ruc) && (
                                                    <p className="text-xs text-[#A3915F]">
                                                        {venta.cliente.cedula || venta.cliente.identificacion || venta.cliente.dni || venta.cliente.ruc}
                                                    </p>
                                                )}
                                            </div>
                                        </td>
                                        <td className="whitespace-nowrap px-6 py-5">
                                            <span className={`inline-flex rounded-md px-3 py-1 text-[11px] font-extrabold uppercase tracking-wider ${esCancelado ? 'bg-[#E1F8EB] text-[#1AA65E]' : 'bg-[#FEF3D6] text-[#E2650F]'
                                                }`}>
                                                {esCancelado ? 'Pagado' : 'Pendiente'}
                                            </span>
                                        </td>
                                        <td className="whitespace-nowrap px-6 py-5 text-right text-sm font-bold text-[#2F2A20]">{money(totalVenta)}</td>
                                        <td className="whitespace-nowrap px-6 py-5 text-right text-sm font-extrabold text-[#1AA65E]">{money(totalAbonado)}</td>
                                        <td className="whitespace-nowrap px-6 py-5 text-right text-sm font-extrabold text-[#E2650F]">{money(saldoPendiente)}</td>
                                        <td className="whitespace-nowrap px-6 py-5 text-right sm:pr-8">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => imprimirTicketDirecto(venta, empresa)}
                                                    title="Imprimir Ticket Directo"
                                                    className="rounded-lg border border-[#0E7C86] px-2.5 py-1.5 text-xs font-bold text-[#0E7C86] transition hover:bg-[#0E7C86] hover:text-white"
                                                >
                                                    🖨️
                                                </button>
                                                {!esCancelado ? (
                                                    <button
                                                        type="button"
                                                        onClick={() => onAbonar({ ...venta, saldoCalculado: saldoPendiente })}
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
               <Pagination data={ventasCredito} />
            </div>
        </>
    );
}
