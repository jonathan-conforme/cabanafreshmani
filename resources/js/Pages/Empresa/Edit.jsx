import { Head, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

export default function Edit({ empresa }) {
    const { data, setData, put, processing, errors } = useForm({
        razon_social: empresa.razon_social || '',
        nombre_comercial: empresa.nombre_comercial || '',
        ruc: empresa.ruc || '',
        telefono: empresa.telefono || '',
        email: empresa.email || '',
        direccion_matriz: empresa.direccion_matriz || '',
        direccion_establecimiento: empresa.direccion_establecimiento || '',
        obligado_contabilidad: empresa.obligado_contabilidad ?? false,
        contribuyente_especial: empresa.contribuyente_especial || '',
        ambiente_sri: empresa.ambiente_sri || '1',
        leyenda_ticket: empresa.leyenda_ticket || '¡Gracias por su compra!',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        put(route('empresa.update', empresa.id));
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-bold text-stone-800">
                    Configuración de la Empresa y Tickets
                </h2>
            }
        >
            <Head title="Configuración Empresa" />

            <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* SECCIÓN 1: DATOS IMPRIMIBLES EN TICKET */}
                    <div className="rounded-2xl border border-amber-200 bg-white p-6 shadow-sm">
                        <h3 className="mb-4 text-lg font-bold text-[#44281a]">
                            Información Comercial (Tickets Físicos)
                        </h3>
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div>
                                <label className="block text-sm font-medium text-stone-700">Nombre Comercial</label>
                                <input
                                    type="text"
                                    value={data.nombre_comercial}
                                    onChange={(e) => setData('nombre_comercial', e.target.value)}
                                    className="mt-1 w-full rounded-xl border-stone-300 shadow-sm focus:border-amber-500 focus:ring-amber-500"
                                />
                                {errors.nombre_comercial && <span className="text-xs text-red-600">{errors.nombre_comercial}</span>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-stone-700">Teléfono de Contacto</label>
                                <input
                                    type="text"
                                    value={data.telefono}
                                    onChange={(e) => setData('telefono', e.target.value)}
                                    className="mt-1 w-full rounded-xl border-stone-300 shadow-sm focus:border-amber-500 focus:ring-amber-500"
                                />
                                {errors.telefono && <span className="text-xs text-red-600">{errors.telefono}</span>}
                            </div>

                            <div className="sm:col-span-2">
                                <label className="block text-sm font-medium text-stone-700">Mensaje Pie de Ticket (Leyenda)</label>
                                <input
                                    type="text"
                                    value={data.leyenda_ticket}
                                    onChange={(e) => setData('leyenda_ticket', e.target.value)}
                                    className="mt-1 w-full rounded-xl border-stone-300 shadow-sm focus:border-amber-500 focus:ring-amber-500"
                                    placeholder="¡Gracias por su compra!"
                                />
                                {errors.leyenda_ticket && <span className="text-xs text-red-600">{errors.leyenda_ticket}</span>}
                            </div>
                        </div>
                    </div>

                    {/* SECCIÓN 2: DATOS FISCALES Y SRI */}
                    <div className="rounded-2xl border border-amber-200 bg-white p-6 shadow-sm">
                        <h3 className="mb-4 text-lg font-bold text-[#44281a]">
                            Datos Fiscales (SRI / Facturación Electrónica)
                        </h3>
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div>
                                <label className="block text-sm font-medium text-stone-700">Razón Social *</label>
                                <input
                                    type="text"
                                    required
                                    value={data.razon_social}
                                    onChange={(e) => setData('razon_social', e.target.value)}
                                    className="mt-1 w-full rounded-xl border-stone-300 shadow-sm focus:border-amber-500 focus:ring-amber-500"
                                />
                                {errors.razon_social && <span className="text-xs text-red-600">{errors.razon_social}</span>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-stone-700">RUC *</label>
                                <input
                                    type="text"
                                    required
                                    maxLength={13}
                                    value={data.ruc}
                                    onChange={(e) => setData('ruc', e.target.value)}
                                    className="mt-1 w-full rounded-xl border-stone-300 shadow-sm focus:border-amber-500 focus:ring-amber-500"
                                />
                                {errors.ruc && <span className="text-xs text-red-600">{errors.ruc}</span>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-stone-700">Correo Electrónico</label>
                                <input
                                    type="email"
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    className="mt-1 w-full rounded-xl border-stone-300 shadow-sm focus:border-amber-500 focus:ring-amber-500"
                                />
                                {errors.email && <span className="text-xs text-red-600">{errors.email}</span>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-stone-700">Ambiente SRI</label>
                                <select
                                    value={data.ambiente_sri}
                                    onChange={(e) => setData('ambiente_sri', e.target.value)}
                                    className="mt-1 w-full rounded-xl border-stone-300 shadow-sm focus:border-amber-500 focus:ring-amber-500"
                                >
                                    <option value="1">1 - Pruebas</option>
                                    <option value="2">2 - Producción</option>
                                </select>
                            </div>

                            <div className="sm:col-span-2">
                                <label className="block text-sm font-medium text-stone-700">Dirección Matriz *</label>
                                <textarea
                                    required
                                    rows={2}
                                    value={data.direccion_matriz}
                                    onChange={(e) => setData('direccion_matriz', e.target.value)}
                                    className="mt-1 w-full rounded-xl border-stone-300 shadow-sm focus:border-amber-500 focus:ring-amber-500"
                                />
                                {errors.direccion_matriz && <span className="text-xs text-red-600">{errors.direccion_matriz}</span>}
                            </div>

                            <div className="flex items-center gap-2 pt-2 sm:col-span-2">
                                <input
                                    type="checkbox"
                                    id="obligado"
                                    checked={data.obligado_contabilidad}
                                    onChange={(e) => setData('obligado_contabilidad', e.target.checked)}
                                    className="h-4 w-4 rounded border-stone-300 text-amber-600 focus:ring-amber-500"
                                />
                                <label htmlFor="obligado" className="text-sm font-medium text-stone-700">
                                    Obligado a llevar Contabilidad
                                </label>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end">
                        <button
                            type="submit"
                            disabled={processing}
                            className="rounded-full bg-gradient-to-br from-orange-500 to-[#c85a0a] px-6 py-2.5 font-semibold text-white shadow-md transition hover:opacity-90 disabled:opacity-50"
                        >
                            {processing ? 'Guardando...' : 'Guardar Cambios'}
                        </button>
                    </div>
                </form>
            </div>
        </AuthenticatedLayout>
    );
}
