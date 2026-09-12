import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import {
    Wallet,
    TrendingUp,
    BarChart3,
    AlertTriangle,
    MoreHorizontal,
    Filter,
} from 'lucide-react';

/** Cada cuántos segundos se vuelven a pedir los datos del dashboard. */
const REFRESH_SECONDS = 30;

const ICONS = {
    wallet: Wallet,
    trending: TrendingUp,
    chart: BarChart3,
    alert: AlertTriangle,
};

const TITULOS_GRAFICO = {
    dias: 'Ventas de los Últimos 14 Días',
    semanas: 'Ventas de las Últimas 8 Semanas',
    meses: 'Ventas de los Últimos 12 Meses',
};

/*
|--------------------------------------------------------------------------
| TARJETA DE RESUMEN
|--------------------------------------------------------------------------
*/
function StatCard({ label, value, delta, up, hint, color, icon }) {
    const Icon = ICONS[icon] ?? Wallet;

    return (
        <div className="rounded-2xl border-t-4 bg-white px-5 py-4 shadow-sm" style={{ borderTopColor: color }}>
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-xs font-bold uppercase tracking-wide text-stone-400">{label}</p>
                    <p className="mt-2 text-2xl font-extrabold text-stone-800">{value}</p>
                </div>
                <span
                    className="flex h-10 w-10 items-center justify-center rounded-full"
                    style={{ backgroundColor: `${color}1A`, color }}
                >
                    <Icon size={20} strokeWidth={2.25} />
                </span>
            </div>
            <div className="mt-3 flex items-center gap-1.5 text-xs font-semibold">
                {delta ? (
                    <>
                        <span className={up ? 'text-emerald-600' : 'text-rose-500'}>{delta}</span>
                        <span className="font-medium text-stone-400">vs. periodo anterior</span>
                    </>
                ) : (
                    <span className="font-medium text-stone-400">{hint}</span>
                )}
            </div>
        </div>
    );
}

/*
|--------------------------------------------------------------------------
| GRÁFICO DE DONA (SVG puro)
|--------------------------------------------------------------------------
*/
function DonutChart({ segments, total }) {
    const sum = segments.reduce((acc, s) => acc + s.value, 0);
    let cumulative = 0;

    return (
        <div className="relative flex items-center justify-center">
            <svg viewBox="0 0 200 200" className="h-44 w-44 -rotate-90">
                <circle cx="100" cy="100" r="72" fill="none" stroke="#f5f5f4" strokeWidth="26" />
                {segments.map((s) => {
                    const pct = sum ? (s.value / sum) * 100 : 0;
                    const offset = cumulative;
                    cumulative += pct;
                    return (
                        <circle
                            key={s.label}
                            cx="100"
                            cy="100"
                            r="72"
                            fill="none"
                            stroke={s.color}
                            strokeWidth="26"
                            strokeLinecap="butt"
                            pathLength="100"
                            strokeDasharray={`${pct} ${100 - pct}`}
                            strokeDashoffset={-offset}
                        />
                    );
                })}
            </svg>
            <div className="absolute flex flex-col items-center">
                <span className="text-2xl font-extrabold text-stone-800">{total}</span>
                <span className="text-sm text-stone-400">Ventas</span>
            </div>
        </div>
    );
}

/*
|--------------------------------------------------------------------------
| GRÁFICO DE LÍNEA (SVG puro, escala automática + tooltip)
|--------------------------------------------------------------------------
*/
function niceCeil(n) {
    if (n <= 10) return 10;
    const pow = Math.pow(10, Math.floor(Math.log10(n)));
    return Math.ceil(n / pow) * pow;
}

function LineChart({ data }) {
    const [hover, setHover] = useState(null);

    const W = 720;
    const H = 300;
    const padL = 48;
    const padR = 20;
    const padT = 24;
    const padB = 40;
    const plotW = W - padL - padR;
    const plotH = H - padT - padB;

    const values = data.map((d) => d.value);
    const max = niceCeil(Math.max(0, ...values));
    const min = 0;
    const yTicks = Array.from({ length: 5 }, (_, i) => (max / 4) * i);

    const x = (i) => (data.length <= 1 ? padL + plotW / 2 : padL + (plotW / (data.length - 1)) * i);
    const y = (v) => padT + plotH - ((v - min) / (max - min || 1)) * plotH;

    const fmtTick = (v) => (max >= 1000 ? `${Math.round(v / 100) / 10}k` : `${Math.round(v)}`);

    const linePath = data.map((d, i) => `${i === 0 ? 'M' : 'L'} ${x(i)} ${y(d.value)}`).join(' ');
    const areaPath = `${linePath} L ${x(data.length - 1)} ${padT + plotH} L ${x(0)} ${padT + plotH} Z`;

    return (
        <div className="w-full">
            <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
                <defs>
                    <linearGradient id="salesFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#0d9488" stopOpacity="0.16" />
                        <stop offset="100%" stopColor="#0d9488" stopOpacity="0" />
                    </linearGradient>
                </defs>

                {/* Líneas guía horizontales + etiquetas del eje Y */}
                {yTicks.map((t) => (
                    <g key={t}>
                        <line x1={padL} y1={y(t)} x2={W - padR} y2={y(t)} stroke="#f5f5f4" strokeWidth="1" />
                        <text x={padL - 10} y={y(t) + 4} textAnchor="end" className="fill-stone-300" fontSize="11">
                            {fmtTick(t)}
                        </text>
                    </g>
                ))}

                {/* Área + línea */}
                <path d={areaPath} fill="url(#salesFill)" />
                <path d={linePath} fill="none" stroke="#0d9488" strokeWidth="2.5" strokeLinejoin="round" />

                {/* Guía vertical al hacer hover */}
                {hover !== null && (
                    <line
                        x1={x(hover)}
                        y1={padT}
                        x2={x(hover)}
                        y2={padT + plotH}
                        stroke="#d6d3d1"
                        strokeWidth="1"
                        strokeDasharray="4 4"
                    />
                )}

                {/* Puntos + zonas de hover + etiquetas del eje X */}
                {data.map((d, i) => (
                    <g key={d.label}>
                        <circle
                            cx={x(i)}
                            cy={y(d.value)}
                            r={hover === i ? 5 : 3.5}
                            fill="#ffffff"
                            stroke="#0d9488"
                            strokeWidth="2.5"
                        />
                        {(data.length <= 8 || i % 2 === 0) && (
                            <text x={x(i)} y={H - 14} textAnchor="middle" className="fill-stone-400" fontSize="11">
                                {d.label}
                            </text>
                        )}
                        <rect
                            x={x(i) - plotW / (data.length * 2)}
                            y={padT}
                            width={plotW / data.length}
                            height={plotH}
                            fill="transparent"
                            onMouseEnter={() => setHover(i)}
                            onMouseLeave={() => setHover(null)}
                        />
                    </g>
                ))}

                {/* Tooltip */}
                {hover !== null && (
                    <g transform={`translate(${x(hover)}, ${y(data[hover].value) - 20})`}>
                        <rect x="-52" y="-26" width="104" height="30" rx="8" fill="#1c1917" />
                        <text x="0" y="-6" textAnchor="middle" fill="#ffffff" fontSize="13" fontWeight="600">
                            ${data[hover].value.toLocaleString('es-EC')}
                        </text>
                    </g>
                )}
            </svg>
        </div>
    );
}

/*
|--------------------------------------------------------------------------
| BADGE DE ESTADO
|--------------------------------------------------------------------------
*/
function StatusBadge({ status }) {
    const map = {
        Completada: 'bg-teal-50 text-teal-700',
        Pendiente: 'bg-amber-100 text-amber-800',
        Cancelada: 'bg-rose-50 text-rose-600',
    };
    return (
        <span
            className={`inline-block rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide ${
                map[status] || 'bg-stone-100 text-stone-500'
            }`}
        >
            {status}
        </span>
    );
}

/*
|--------------------------------------------------------------------------
| DASHBOARD
|--------------------------------------------------------------------------
*/
export default function Dashboard({
    stats = [],
    invoices = { total: 0, segments: [] },
    sales = [],
    recent = [],
    periodo = 'dias',
}) {
    const [periodoFiltro, setPeriodoFiltro] = useState(periodo);

    // Sincroniza el estado local con la prop cuando llega una actualización
    useEffect(() => {
        setPeriodoFiltro(periodo);
    }, [periodo]);

    // Cambia el filtro solicitando solo la prop del gráfico mediante Inertia Partial Reload
    const handlePeriodoChange = (e) => {
        const nuevoPeriodo = e.target.value;
        setPeriodoFiltro(nuevoPeriodo);

        router.get(
            route('dashboard'),
            { periodo: nuevoPeriodo },
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
                only: ['sales', 'periodo'],
            }
        );
    };

    /* ---- Auto-actualización en segundo plano (polling) ---- */
    const refreshingRef = useRef(false);

    const refreshNow = useCallback(() => {
        if (refreshingRef.current) return;
        refreshingRef.current = true;

        router.reload({
            only: ['stats', 'invoices', 'sales', 'recent'],
            preserveScroll: true,
            preserveState: true,
            onFinish: () => {
                refreshingRef.current = false;
            },
        });
    }, []);

    useEffect(() => {
        const id = setInterval(() => {
            if (document.visibilityState === 'visible') {
                refreshNow();
            }
        }, REFRESH_SECONDS * 1000);

        return () => clearInterval(id);
    }, [refreshNow]);

    useEffect(() => {
        const onVisible = () => {
            if (document.visibilityState === 'visible') {
                refreshNow();
            }
        };
        document.addEventListener('visibilitychange', onVisible);
        return () => document.removeEventListener('visibilitychange', onVisible);
    }, [refreshNow]);

    return (
        <AuthenticatedLayout>
            <Head title="Dashboard" />

            <div className="min-h-full bg-stone-50 px-4 py-6 sm:px-6 lg:px-8">
                {/* TARJETAS DE RESUMEN */}
                <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    {stats.map((s) => (
                        <StatCard key={s.label} {...s} />
                    ))}
                </div>

                {/* DONA + LÍNEA */}
                <div className="mb-6 grid grid-cols-1 gap-5 lg:grid-cols-5">
                    {/* Ventas por método de pago */}
                    <div className="rounded-[28px] bg-white p-6 shadow-sm ring-1 ring-amber-100 lg:col-span-2">
                        <div className="mb-4 flex items-center justify-between">
                            <h2 className="font-bold text-teal-700">Ventas por Método de Pago</h2>
                            <MoreHorizontal size={20} className="text-stone-300" />
                        </div>

                        {invoices.segments.length === 0 ? (
                            <p className="py-14 text-center text-sm text-stone-400">Sin ventas registradas este mes.</p>
                        ) : (
                            <div className="flex flex-col items-center gap-6 sm:flex-row sm:justify-between">
                                <DonutChart segments={invoices.segments} total={invoices.total} />
                                <div className="space-y-4">
                                    {invoices.segments.map((s) => (
                                        <div key={s.label}>
                                            <div className="flex items-center gap-2 text-sm text-stone-400">
                                                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: s.color }} />
                                                {s.label}
                                            </div>
                                            <p className="ml-4 text-lg font-extrabold text-stone-800">
                                                ${s.value.toLocaleString('es-EC')}
                                                <span className="ml-1 text-xs font-medium text-stone-400">
                                                    · {s.count}
                                                </span>
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Análisis de ventas dinámico */}
                    <div className="rounded-[28px] bg-white p-6 shadow-sm ring-1 ring-amber-100 lg:col-span-3">
                        <div className="mb-4 flex items-center justify-between gap-2">
                            <h2 className="font-bold text-teal-700">
                                {TITULOS_GRAFICO[periodoFiltro] || TITULOS_GRAFICO.dias}
                            </h2>
                            <div className="flex items-center gap-2">
                                <select
                                    value={periodoFiltro}
                                    onChange={handlePeriodoChange}
                                    className="rounded-lg border border-amber-200 bg-[#FFFDF6] px-3 py-1 text-xs font-semibold text-stone-600 outline-none focus:border-teal-600 focus:ring-1 focus:ring-teal-600"
                                >
                                    <option value="dias">Días (14D)</option>
                                    <option value="semanas">Semanas (8S)</option>
                                    <option value="meses">Meses (12M)</option>
                                </select>
                                <MoreHorizontal size={20} className="text-stone-300" />
                            </div>
                        </div>

                        {sales.length === 0 ? (
                            <p className="py-14 text-center text-sm text-stone-400">Sin datos de ventas.</p>
                        ) : (
                            <LineChart data={sales} />
                        )}
                    </div>
                </div>

                {/* VENTAS RECIENTES */}
                <div className="overflow-hidden rounded-[28px] bg-white shadow-sm ring-1 ring-amber-100">
                    <div className="flex items-center justify-between border-b border-amber-100 bg-gradient-to-br from-amber-50 to-white px-6 py-5">
                        <h2 className="font-bold text-teal-700">Ventas Recientes</h2>
                        <div className="flex items-center gap-3">
                            <Link
                                href={route('reportes.index')}
                                className="inline-flex items-center gap-2 rounded-full border border-stone-200 bg-white px-4 py-1.5 text-sm font-semibold text-stone-500 hover:bg-stone-50"
                            >
                                <Filter size={15} />
                                Ver reportes
                            </Link>
                            <MoreHorizontal size={20} className="text-stone-300" />
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[820px] text-left text-sm">
                            <thead>
                                <tr className="bg-amber-50/60 text-xs font-extrabold uppercase tracking-wide text-stone-500">
                                    <th className="px-6 py-3">No</th>
                                    <th className="px-6 py-3">Venta</th>
                                    <th className="px-6 py-3">Cliente</th>
                                    <th className="px-6 py-3">Vendedor</th>
                                    <th className="px-6 py-3">Artículos</th>
                                    <th className="px-6 py-3">Fecha</th>
                                    <th className="px-6 py-3">Estado</th>
                                    <th className="px-6 py-3 text-right">Total</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-amber-100">
                                {recent.length === 0 && (
                                    <tr>
                                        <td colSpan={8} className="px-6 py-12 text-center text-sm text-stone-400">
                                            Aún no hay ventas registradas.
                                        </td>
                                    </tr>
                                )}
                                {recent.map((row, i) => (
                                    <tr key={row.id} className="transition hover:bg-amber-50/40">
                                        <td className="px-6 py-4 text-stone-400">{i + 1}</td>
                                        <td className="px-6 py-4 font-semibold text-stone-500">#{row.id}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-teal-100 text-xs font-bold text-teal-700">
                                                    {row.cliente.charAt(0)}
                                                </span>
                                                <span className="font-semibold text-stone-800">{row.cliente}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-stone-500">{row.vendedor}</td>
                                        <td className="px-6 py-4 text-stone-500">{row.items}</td>
                                        <td className="px-6 py-4 text-stone-500">{row.fecha}</td>
                                        <td className="px-6 py-4">
                                            <StatusBadge status={row.estado} />
                                        </td>
                                        <td className="px-6 py-4 text-right font-extrabold text-stone-800">{row.total}</td>
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
