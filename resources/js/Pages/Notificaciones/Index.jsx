import { Head, Link, router } from '@inertiajs/react';
import { route } from 'ziggy-js';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import {
    Bell,
    PackageMinus,
    PackageX,
    ReceiptText,
    TrendingUp,
    CheckCheck,
    Check,
    Trash2,
    Inbox,
} from 'lucide-react';

const ICONOS = { PackageMinus, PackageX, ReceiptText, TrendingUp };

const NIVELES = {
    info: { dot: 'bg-sky-500', wrap: 'bg-sky-50 text-sky-600', borde: 'border-l-sky-400' },
    warning: { dot: 'bg-amber-500', wrap: 'bg-amber-50 text-amber-600', borde: 'border-l-amber-400' },
    danger: { dot: 'bg-rose-500', wrap: 'bg-rose-50 text-rose-600', borde: 'border-l-rose-400' },
};

const TIPOS = [
    { key: 'stock_bajo', label: 'Stock bajo' },
    { key: 'sin_stock', label: 'Sin stock' },
    { key: 'compra_vencida', label: 'Compra vencida' },
    { key: 'compra_por_vencer', label: 'Compra por vencer' },
    { key: 'resumen_ventas', label: 'Ventas' },
];

function tiempoRelativo(fecha) {
    const diff = Math.round((Date.now() - new Date(fecha).getTime()) / 1000);
    if (diff < 60) return 'hace un momento';
    if (diff < 3600) return `hace ${Math.floor(diff / 60)} min`;
    if (diff < 86400) return `hace ${Math.floor(diff / 3600)} h`;
    if (diff < 604800) return `hace ${Math.floor(diff / 86400)} d`;
    return new Date(fecha).toLocaleString('es-EC');
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
                    onClick={() => link.url && router.get(link.url, {}, { preserveState: true, preserveScroll: true })}
                    dangerouslySetInnerHTML={{ __html: link.label }}
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
    );
}

export default function Index({ notificaciones, resumen, filtros }) {
    const aplicarFiltro = (cambios) => {
        router.get(
            route('notificaciones.index'),
            { ...filtros, ...cambios },
            { preserveScroll: true, preserveState: true },
        );
    };

    const marcarLeida = (id) =>
        router.patch(route('notificaciones.leer', id), {}, { preserveScroll: true, preserveState: true });

    const marcarTodas = () =>
        router.patch(route('notificaciones.leerTodas'), {}, { preserveScroll: true, preserveState: true });

    const eliminar = (id) =>
        router.delete(route('notificaciones.destroy', id), { preserveScroll: true, preserveState: true });

    const eliminarLeidas = () =>
        router.delete(route('notificaciones.destroyLeidas'), { preserveScroll: true, preserveState: true });

    const chip = (activo) =>
        `inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-bold uppercase tracking-wider transition ${
            activo
                ? 'bg-gradient-to-r from-[#F08A24] to-[#E2650F] text-white shadow-lg shadow-[#E2650F]/25'
                : 'border border-[#E5DCC0] bg-white text-[#7A6A45] hover:bg-[#FDF8E7]'
        }`;

    return (
        <AuthenticatedLayout header={<h2 className="text-xl font-bold text-[#0E7C86]">Notificaciones</h2>}>
            <Head title="Notificaciones" />

            <div className="min-h-full bg-[#FDF8E7] py-8">
                <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
                    {/* Encabezado */}
                    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
                        <div>
                            <h1 className="text-xl font-extrabold tracking-tight text-[#0E7C86] sm:text-2xl">
                                Centro de Notificaciones
                            </h1>
                            <p className="mt-1 text-sm text-[#A3915F]">
                                {resumen.total} en total · {resumen.no_leidas} sin leer · se generan solas con los datos
                                de ventas, compras e inventario.
                            </p>
                        </div>
                        <div className="flex gap-2">
                            <button
                                type="button"
                                onClick={marcarTodas}
                                disabled={resumen.no_leidas === 0}
                                className="inline-flex items-center gap-2 rounded-full bg-[#0E7C86] px-4 py-2 text-xs font-extrabold uppercase tracking-wider text-white shadow transition hover:bg-[#0A626A] disabled:cursor-not-allowed disabled:opacity-40"
                            >
                                <CheckCheck size={14} />
                                Marcar todas
                            </button>
                            <button
                                type="button"
                                onClick={eliminarLeidas}
                                className="inline-flex items-center gap-2 rounded-full border border-[#E5DCC0] bg-white px-4 py-2 text-xs font-extrabold uppercase tracking-wider text-[#7A6A45] transition hover:bg-[#FDF8E7]"
                            >
                                <Trash2 size={14} />
                                Limpiar leídas
                            </button>
                        </div>
                    </div>

                    {/* Filtros */}
                    <div className="mb-6 space-y-3">
                        <div className="flex flex-wrap gap-2">
                            <button type="button" onClick={() => aplicarFiltro({ estado: null })} className={chip(!filtros.estado)}>
                                Todas
                            </button>
                            <button
                                type="button"
                                onClick={() => aplicarFiltro({ estado: 'no_leidas' })}
                                className={chip(filtros.estado === 'no_leidas')}
                            >
                                Sin leer
                            </button>
                            <button
                                type="button"
                                onClick={() => aplicarFiltro({ estado: 'leidas' })}
                                className={chip(filtros.estado === 'leidas')}
                            >
                                Leídas
                            </button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            <button type="button" onClick={() => aplicarFiltro({ tipo: null })} className={chip(!filtros.tipo)}>
                                Todos los tipos
                            </button>
                            {TIPOS.map((t) => (
                                <button
                                    key={t.key}
                                    type="button"
                                    onClick={() => aplicarFiltro({ tipo: t.key })}
                                    className={chip(filtros.tipo === t.key)}
                                >
                                    {t.label}
                                    {resumen.por_tipo?.[t.key] ? ` · ${resumen.por_tipo[t.key]}` : ''}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Lista */}
                    <div className="overflow-hidden rounded-2xl border border-[#F0E6C8] bg-white shadow-[0_10px_30px_-12px_rgba(120,100,50,0.25)]">
                        {notificaciones.data.length === 0 && (
                            <div className="flex flex-col items-center gap-3 px-6 py-16 text-center">
                                <Inbox size={32} className="text-[#D6CBA8]" />
                                <p className="text-sm text-[#A3915F]">No hay notificaciones con estos filtros.</p>
                            </div>
                        )}

                        <ul className="divide-y divide-[#F1EAD5]">
                            {notificaciones.data.map((n) => {
                                const Icono = ICONOS[n.icono] ?? Bell;
                                const estilo = NIVELES[n.nivel] ?? NIVELES.info;

                                return (
                                    <li
                                        key={n.id}
                                        className={`flex items-start gap-4 border-l-4 px-5 py-4 transition ${estilo.borde} ${
                                            n.leida ? 'bg-white' : 'bg-[#FFFBEF]'
                                        }`}
                                    >
                                        <span className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${estilo.wrap}`}>
                                            <Icono size={18} />
                                        </span>

                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-center gap-2">
                                                <p className="text-sm font-bold text-[#2F2A20]">{n.titulo}</p>
                                                {!n.leida && <span className={`h-2 w-2 rounded-full ${estilo.dot}`} />}
                                            </div>
                                            <p className="mt-0.5 text-sm text-[#7A6A45]">{n.mensaje}</p>
                                            <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-[#A3915F]">
                                                <span>{tiempoRelativo(n.created_at)}</span>
                                                {n.enlace && (
                                                    <Link href={n.enlace} className="font-semibold text-[#0E7C86] hover:underline">
                                                        Ver detalle
                                                    </Link>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex shrink-0 gap-1">
                                            {!n.leida && (
                                                <button
                                                    type="button"
                                                    onClick={() => marcarLeida(n.id)}
                                                    title="Marcar como leída"
                                                    className="rounded-lg p-2 text-[#7A6A45] transition hover:bg-teal-50 hover:text-teal-700"
                                                >
                                                    <Check size={16} />
                                                </button>
                                            )}
                                            <button
                                                type="button"
                                                onClick={() => eliminar(n.id)}
                                                title="Eliminar"
                                                className="rounded-lg p-2 text-[#7A6A45] transition hover:bg-rose-50 hover:text-rose-600"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </li>
                                );
                            })}
                        </ul>

                        <Pagination links={notificaciones.links} />
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
