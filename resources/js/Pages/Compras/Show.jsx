import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { ArrowLeft } from 'lucide-react';

export default function Show({ compra }) {
    const thClass = 'px-6 py-4 text-left text-[11px] font-bold uppercase tracking-wider text-[#8A7A4E]';

    return (
        <AuthenticatedLayout header={<h2 className="text-xl font-bold text-[#0E7C86]">Detalle de Compra #{compra.id}</h2>}>
            <Head title={`Compra #${compra.id}`} />

            <div className="min-h-screen bg-[#FDF8E7] py-8">
                <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 space-y-6">

                    <Link
                        href={route('compras.index')}
                        className="inline-flex items-center gap-2 text-sm font-bold text-[#0E7C86] hover:underline"
                    >
                        <ArrowLeft size={16} /> Volver a Compras
                    </Link>

                    {/* CABECERA Y RESUMEN */}
                    <div className="rounded-2xl border border-[#F0E6C8] bg-white p-6 shadow-sm space-y-4">
                        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#F1EAD5] pb-4">
                            <div>
                                <h1 className="text-xl font-extrabold text-[#0E7C86]">Compra #{compra.id}</h1>
                                <p className="text-xs text-[#A3915F]">
                                    Proveedor: <span className="font-bold text-[#2F2A20]">{compra.proveedor?.nombre || 'N/A'}</span>
                                </p>
                            </div>
                            <div className="text-right">
                                <span className="inline-flex rounded-md bg-[#FDEEDC] px-3 py-1 text-xs font-extrabold uppercase text-[#C25E10]">
                                    {compra.estado}
                                </span>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
                            <div>
                                <p className="text-[11px] font-bold uppercase text-[#8A7A4E]">Tipo de Pago</p>
                                <p className="font-semibold text-[#2F2A20] uppercase">{compra.tipo_pago}</p>
                            </div>
                            <div>
                                <p className="text-[11px] font-bold uppercase text-[#8A7A4E]">Total</p>
                                <p className="font-extrabold text-[#0E7C86]">${Number(compra.total || 0).toFixed(2)}</p>
                            </div>
                            <div>
                                <p className="text-[11px] font-bold uppercase text-[#8A7A4E]">Monto Pagado</p>
                                <p className="font-semibold text-[#2F2A20]">${Number(compra.monto_pagado || 0).toFixed(2)}</p>
                            </div>
                            <div>
                                <p className="text-[11px] font-bold uppercase text-[#8A7A4E]">Saldo Pendiente</p>
                                <p className="font-semibold text-[#C25E10]">
                                    ${(Number(compra.total || 0) - Number(compra.monto_pagado || 0)).toFixed(2)}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* DETALLE DE PRODUCTOS */}
                    <div className="overflow-hidden rounded-2xl border border-[#F0E6C8] bg-white shadow-sm">
                        <div className="border-b border-[#F1EAD5] bg-[#FDF8E7] px-6 py-4">
                            <h3 className="text-sm font-extrabold text-[#0E7C86] uppercase">Productos Comprados</h3>
                        </div>
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-[#F1EAD5]">
                                    <th className={thClass}>Producto</th>
                                    <th className={thClass}>Cantidad</th>
                                    <th className={thClass}>Costo Unitario</th>
                                    <th className={thClass}>Subtotal</th>
                                </tr>
                            </thead>
                            <tbody>
                                {compra.detalles?.map((det) => (
                                    <tr key={det.id} className="border-b border-[#F1EAD5] last:border-0">
                                        <td className="px-6 py-4 font-semibold text-[#2F2A20]">{det.producto?.nombre || 'Producto'}</td>
                                        <td className="px-6 py-4 text-[#7A6A45]">{det.cantidad}</td>
                                        <td className="px-6 py-4 text-[#7A6A45]">${Number(det.costo_unitario).toFixed(2)}</td>
                                        <td className="px-6 py-4 font-semibold text-[#0E7C86]">${Number(det.subtotal).toFixed(2)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                </div>
            </div>
        </AuthenticatedLayout>
    );
}
