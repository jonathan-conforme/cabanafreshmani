import { useState } from 'react';
import { Head } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Database, Download, ShieldAlert, Table2, CheckCircle2, XCircle } from 'lucide-react';

export default function Export({ resumen = [] }) {
    const [descargando, setDescargando] = useState(false);

    const tablasExistentes = resumen.filter((item) => item.existe);
    const tablasFaltantes = resumen.filter((item) => !item.existe);
    const totalRegistros = tablasExistentes.reduce((acc, item) => acc + Number(item.registros || 0), 0);

    const descargar = () => {
        setDescargando(true);
        window.location.href = '/export/descargar';

        // La descarga es una navegación del navegador: no hay callback, así que
        // liberamos el botón después de un momento prudente.
        setTimeout(() => setDescargando(false), 6000);
    };

    return (
        <AuthenticatedLayout header={<h2 className="text-xl font-bold text-[#0E7C86]">Exportar Base de Datos</h2>}>
            <Head title="Exportar Base de Datos" />

            <div className="min-h-screen bg-[#FDF8E7] py-8">
                <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
                    {/* Encabezado */}
                    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
                        <div>
                            <h1 className="flex items-center gap-2 text-2xl font-extrabold text-[#2F2A20]">
                                <Database size={24} className="text-[#0E7C86]" />
                                Backup de la base de datos
                            </h1>
                            <p className="mt-1 text-sm text-[#7A6A45]">
                                Descarga un archivo JSON con todos los datos del sistema para restaurarlos en tu entorno local.
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={descargar}
                            disabled={descargando}
                            className="inline-flex items-center gap-2 rounded-xl bg-[#0E7C86] px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-[#0B646C] disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            <Download size={18} strokeWidth={2.25} />
                            {descargando ? 'Generando backup...' : 'Descargar Backup JSON'}
                        </button>
                    </div>

                    {/* Totales */}
                    <div className="mb-6 grid gap-4 sm:grid-cols-2">
                        <div className="rounded-2xl border border-[#F0E6C8] bg-white px-5 py-4 shadow-sm">
                            <p className="text-[11px] font-bold uppercase tracking-wider text-[#8A7A4E]">Tablas incluidas</p>
                            <p className="mt-2 text-2xl font-extrabold text-[#2F2A20]">{tablasExistentes.length}</p>
                        </div>
                        <div className="rounded-2xl border border-[#F0E6C8] bg-white px-5 py-4 shadow-sm">
                            <p className="text-[11px] font-bold uppercase tracking-wider text-[#8A7A4E]">Registros totales</p>
                            <p className="mt-2 text-2xl font-extrabold text-[#2F2A20]">
                                {totalRegistros.toLocaleString('es-EC')}
                            </p>
                        </div>
                    </div>

                    {/* Aviso */}
                    <div className="mb-6 flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4">
                        <ShieldAlert size={20} className="mt-0.5 shrink-0 text-amber-600" />
                        <p className="text-sm text-[#7A5E20]">
                            El archivo contiene información sensible (usuarios, contraseñas encriptadas, ventas y compras).
                            Guárdalo en un lugar seguro y no lo compartas ni lo subas al repositorio.
                        </p>
                    </div>

                    {/* Detalle por tabla */}
                    <div className="overflow-hidden rounded-2xl border border-[#F0E6C8] bg-white shadow-sm">
                        <div className="flex items-center gap-2 border-b border-[#F1EAD5] px-6 py-4">
                            <Table2 size={18} className="text-[#0E7C86]" />
                            <h2 className="text-sm font-bold uppercase tracking-wider text-[#8A7A4E]">
                                Detalle por tabla
                            </h2>
                        </div>

                        {resumen.length === 0 ? (
                            <p className="px-6 py-8 text-center text-sm text-[#A3915F]">No hay tablas para exportar.</p>
                        ) : (
                            <ul className="divide-y divide-[#F1EAD5]">
                                {resumen.map((item) => (
                                    <li
                                        key={item.tabla}
                                        className="flex items-center justify-between gap-4 px-6 py-3 text-sm"
                                    >
                                        <span className="flex items-center gap-2 font-semibold text-[#2F2A20]">
                                            {item.existe ? (
                                                <CheckCircle2 size={16} className="text-teal-600" />
                                            ) : (
                                                <XCircle size={16} className="text-rose-400" />
                                            )}
                                            {item.tabla}
                                        </span>
                                        <span className={item.existe ? 'text-[#7A6A45]' : 'text-rose-400'}>
                                            {item.existe
                                                ? `${Number(item.registros).toLocaleString('es-EC')} registros`
                                                : 'no existe · se omite'}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    {tablasFaltantes.length > 0 && (
                        <p className="mt-4 text-xs text-[#A3915F]">
                            Las tablas marcadas como inexistentes se omiten automáticamente y quedan registradas en el
                            bloque <code className="font-mono">meta.tablas_omitidas</code> del JSON.
                        </p>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
