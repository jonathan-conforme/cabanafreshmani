import { useForm, Head } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { DollarSign } from 'lucide-react';

export default function Apertura() {
    const { data, setData, post, processing, errors } = useForm({
        monto_apertura: '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('cajas.storeApertura'));
    };

    return (
        <AuthenticatedLayout header={<h2 className="text-xl font-bold text-[#0E7C86]">Apertura de Caja</h2>}>
            <Head title="Apertura de Caja" />
            <div className="flex min-h-[75vh] items-center justify-center p-4">
                <div className="w-full max-w-md rounded-2xl border border-[#F0E6C8] bg-white p-8 shadow-xl">
                    <div className="text-center">
                        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#DFF3EF] text-[#0E7C86]">
                            <DollarSign size={32} />
                        </div>
                        <h1 className="mt-4 text-2xl font-extrabold text-[#0E7C86]">Iniciar Turno de Caja</h1>
                        <p className="mt-1 text-sm text-[#A3915F]">Ingresa el monto base en efectivo para aperturar la caja.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="mt-6 space-y-5">
                        <div>
                            <label className="mb-1.5 block text-xs font-bold uppercase text-[#8A7A4E]">Monto Inicial / Fondo ($)</label>
                            <input
                                type="number"
                                step="0.01"
                                min="0"
                                value={data.monto_apertura}
                                onChange={(e) => setData('monto_apertura', e.target.value)}
                                placeholder="0.00"
                                className="w-full rounded-xl border border-[#E5DCC0] bg-[#FFFDF6] px-4 py-3 text-lg font-bold text-[#3F3A2E] outline-none focus:border-[#0E7C86] focus:ring-2 focus:ring-[#0E7C86]/20"
                                required
                            />
                            {errors.monto_apertura && <p className="mt-1 text-xs text-red-500">{errors.monto_apertura}</p>}
                        </div>

                        <button
                            type="submit"
                            disabled={processing}
                            className="w-full rounded-full bg-gradient-to-r from-[#F08A24] to-[#E2650F] py-3.5 text-xs font-extrabold uppercase tracking-wider text-white shadow-lg transition hover:brightness-110 active:scale-[0.98]"
                        >
                            {processing ? 'Abriendo...' : 'Abrir Caja y Pasar al POS'}
                        </button>
                    </form>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
