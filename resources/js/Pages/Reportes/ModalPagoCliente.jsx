import React, { useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { useForm, usePage } from '@inertiajs/react';
import Swal from 'sweetalert2';
import { warningAlert } from "@/Components/SweetAlert.js";
import { imprimirTicketDirecto } from '@/Utils/printerService';


export default function ModalPagoCliente({ isOpen, onClose, venta, empresa }) {
    if (!venta) return null;

    // Obtener empresa de los props o del estado global de Inertia
      const { props } = usePage();
    const datosEmpresa = empresa || props.empresa || {};

    const saldoPendiente = venta.saldoCalculado ?? 
        (venta.saldo_pendiente > 0 ? venta.saldo_pendiente : (venta.total - (venta.pago_con || 0)));

    const { data, setData, post, processing, errors, reset } = useForm({
        monto: saldoPendiente,
        metodo_pago: 'efectivo',
        observaciones: '',
    });

    useEffect(() => {
        if (venta) {
            setData('monto', saldoPendiente);
        }
    }, [venta, saldoPendiente]);

 const handleSubmit = (e) => {
    e.preventDefault();

    // 1. Capturar el monto abonado antes de enviar/resetear
    const montoAbonado = Number(data.monto);

    post(route('ventas.pagos.store', venta.id), {
        preserveScroll: true,
        preserveState: true,
        onSuccess: (page) => {
            const serverErrors = page.props.errors;

            if (serverErrors && Object.keys(serverErrors).length > 0) {
                const mensajeError = serverErrors.caja || serverErrors.monto || serverErrors.error || 'No tienes una caja abierta para registrar pagos.';
                warningAlert(mensajeError, 'Caja Cerrada');
            } else {
                // 2. Crear una copia de la venta incorporando el abono recién realizado
                const ventaActualizada = {
                    ...venta,
                    pagos: [
                        ...(venta.pagos || []),
                        {
                            monto: montoAbonado,
                            created_at: new Date().toISOString(),
                        }
                    ]
                };

                reset();
                onClose();

                Swal.fire({
                    title: '¡Pago Registrado!',
                    text: 'El abono se ingresó correctamente. ¿Deseas imprimir el comprobante?',
                    icon: 'success',
                    showCancelButton: true,
                    confirmButtonColor: '#0E7C86',
                    cancelButtonColor: '#7A6A45',
                    confirmButtonText: '🖨️ Imprimir Ticket Directo',
                    cancelButtonText: 'Cerrar',
                }).then((result) => {
                    if (result.isConfirmed) {
                        // 3. Imprimir el objeto actualizado
                        imprimirTicketDirecto(ventaActualizada, datosEmpresa);
                    }
                });
            }
        },
        onError: (err) => {
            const mensajeError = err.caja || err.monto || err.error || 'No tienes una caja abierta para registrar pagos.';
            warningAlert(mensajeError, 'Caja Cerrada');
        },
    });
};

    return (
        <Transition appear show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={onClose}>
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" />
                </Transition.Child>

                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 scale-95"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95"
                        >
                            <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl border border-[#F0E6C8] bg-white p-6 shadow-xl transition-all">
                                <Dialog.Title className="text-lg font-bold text-[#0E7C86]">
                                    Registrar Pago - Venta #{venta.id}
                                </Dialog.Title>

                                <div className="mt-2 text-sm text-[#7A6A45]">
                                    Cliente: <span className="font-semibold text-[#2F2A20]">{venta.cliente?.nombre || 'Consumidor Final'}</span>
                                </div>

                                <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                                    <div>
                                        <label className="block text-[11px] font-bold uppercase tracking-wider text-[#8A7A4E]">
                                            Monto a Abonar (Saldo: ${Number(saldoPendiente).toFixed(2)})
                                        </label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            max={saldoPendiente}
                                            value={data.monto}
                                            onChange={(e) => setData('monto', e.target.value)}
                                            className="mt-1 w-full rounded-lg border border-[#E5DCC0] bg-[#FFFDF6] px-4 py-2 text-sm text-[#3F3A2E] focus:border-[#0E7C86] focus:ring-[#0E7C86]"
                                            required
                                        />
                                        {errors.monto && <span className="text-xs text-red-500">{errors.monto}</span>}
                                    </div>

                                    <div>
                                        <label className="block text-[11px] font-bold uppercase tracking-wider text-[#8A7A4E]">
                                            Método de Pago
                                        </label>
                                        <select
                                            value={data.metodo_pago}
                                            onChange={(e) => setData('metodo_pago', e.target.value)}
                                            className="mt-1 w-full rounded-lg border border-[#E5DCC0] bg-[#FFFDF6] px-4 py-2 text-sm text-[#3F3A2E] focus:border-[#0E7C86] focus:ring-[#0E7C86]"
                                        >
                                            <option value="efectivo">Efectivo</option>
                                            <option value="tarjeta">Tarjeta</option>
                                            <option value="transferencia">Transferencia</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-[11px] font-bold uppercase tracking-wider text-[#8A7A4E]">
                                            Observaciones
                                        </label>
                                        <textarea
                                            value={data.observaciones}
                                            onChange={(e) => setData('observaciones', e.target.value)}
                                            className="mt-1 w-full rounded-lg border border-[#E5DCC0] bg-[#FFFDF6] px-4 py-2 text-sm text-[#3F3A2E] focus:border-[#0E7C86] focus:ring-[#0E7C86]"
                                            rows="2"
                                        />
                                    </div>

                                    <div className="mt-6 flex justify-end gap-3">
                                        <button
                                            type="button"
                                            onClick={onClose}
                                            className="rounded-lg border border-[#E5DCC0] px-4 py-2 text-xs font-bold text-[#7A6A45] hover:bg-[#FDF8E7]"
                                        >
                                            Cancelar
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={processing}
                                            className="rounded-lg bg-[#0E7C86] px-4 py-2 text-xs font-bold text-white hover:bg-[#0A626A] disabled:opacity-50"
                                        >
                                            Guardar Pago
                                        </button>
                                    </div>
                                </form>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
}