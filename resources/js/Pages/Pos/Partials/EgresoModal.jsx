import { useForm } from '@inertiajs/react';
import { toast } from '@/Components/SweetAlert';

export default function EgresoModal({ show, onClose, cajaId }) {
    const { data, setData, post, processing, reset } = useForm({
        caja_id: cajaId,
        monto: '',
        concepto: '',
    });

    if (!show) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('cajas.storeEgreso'), {
            onSuccess: () => {
                toast('Salida de dinero registrada', 'success');
                reset();
                onClose();
            },
            onError: () => toast('Error al registrar el egreso', 'error'),
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
            <form onSubmit={handleSubmit} className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl space-y-4">
                <h3 className="text-lg font-extrabold text-amber-700">Registrar Salida / Gasto de Caja</h3>
                
                <div>
                    <label className="block text-xs font-bold text-[#8A7A4E] mb-1">Monto ($):</label>
                    <input
                        type="number"
                        step="0.01"
                        value={data.monto}
                        onChange={(e) => setData('monto', e.target.value)}
                        placeholder="0.00"
                        className="w-full rounded-xl border border-[#E5DCC0] p-2.5 text-sm font-bold outline-none"
                        required
                        autoFocus
                    />
                </div>

                <div>
                    <label className="block text-xs font-bold text-[#8A7A4E] mb-1">Motivo / Concepto:</label>
                    <input
                        type="text"
                        value={data.concepto}
                        onChange={(e) => setData('concepto', e.target.value)}
                        placeholder="Ej: Pago de almuerzo / Fundas"
                        className="w-full rounded-xl border border-[#E5DCC0] p-2.5 text-xs outline-none"
                        required
                    />
                </div>

                <div className="flex gap-2 pt-2">
                    <button
                        type="button"
                        onClick={onClose}
                        className="cursor-pointer w-1/2 rounded-full border py-2 text-xs font-bold text-[#7A6A45]"
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        disabled={processing}
                        className="cursor-pointer w-1/2 rounded-full bg-amber-600 py-2 text-xs font-bold text-white shadow-md hover:bg-amber-700"
                    >
                        {processing ? 'Guardando...' : 'Registrar Salida'}
                    </button>
                </div>
            </form>
        </div>
    );
}