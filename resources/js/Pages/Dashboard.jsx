import React, { useState } from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import { Transition } from '@headlessui/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import {
    Users,
    Wallet,
    TrendingUp,
    FileText,
    ArrowUp,
    ArrowDown,
    Bell,
    MoreHorizontal,
    Filter,
    ChevronDown,
} from 'lucide-react';

/*
|--------------------------------------------------------------------------
| DATOS DE EJEMPLO (reemplázalos por props que envíe tu controlador)
|--------------------------------------------------------------------------
*/
const DEFAULT_STATS = [
    { label: 'Clientes', value: '1.456', delta: '+6,5%', up: true, color: '#6D5DD3', Icon: Users },
    { label: 'Ingresos', value: '$3.345', delta: '-0,10%', up: false, color: '#1E9EE0', Icon: Wallet },
    { label: 'Ganancia', value: '60%', delta: '-0,2%', up: false, color: '#B23CC9', Icon: TrendingUp },
    { label: 'Facturas', value: '1.135', delta: '+11,5%', up: true, color: '#1AA65E', Icon: FileText },
];

const DEFAULT_INVOICES = {
    total: '1.135',
    segments: [
        { label: 'Total Pagado', value: 234, color: '#0d9488' },  // teal-600
        { label: 'Total Vencido', value: 514, color: '#ea580c' }, // orange-600
        { label: 'Total Impago', value: 345, color: '#e7e5e4' },  // stone-200
    ],
};

const DEFAULT_SALES = [
    { month: 'Ene', value: 3800 },
    { month: 'Feb', value: 4200 },
    { month: 'Mar', value: 5200 },
    { month: 'Abr', value: 5600 },
    { month: 'May', value: 9500 },
    { month: 'Jun', value: 5200 },
    { month: 'Jul', value: 6200 },
    { month: 'Ago', value: 5800 },
    { month: 'Sep', value: 6100 },
    { month: 'Oct', value: 6300 },
    { month: 'Nov', value: 6200 },
    { month: 'Dic', value: 4600 },
];

const DEFAULT_RECENT = [
    { id: '#065499', name: 'Eren Yaeger', item: '1 x Black Backpack', date: '21/07/2022 08:21', status: 'Pagado', price: '$101' },
    { id: '#065499', name: 'Levi Ackerman', item: '1 x Distro Backpack', date: '21/07/2022 08:21', status: 'Pendiente', price: '$144' },
    { id: '#065499', name: 'Rainer Brown', item: '1 x New Backpack', date: '21/07/2022 08:21', status: 'Pagado', price: '$121' },
    { id: '#065499', name: 'Historia Reiss', item: '2 x Black Backpack', date: '21/07/2022 08:21', status: 'Vencido', price: '$300' },
];

/*
|--------------------------------------------------------------------------
| TARJETA DE RESUMEN (mismo estilo que tu pantalla de Empleados)
|--------------------------------------------------------------------------
*/
function StatCard({ label, value, delta, up, color, Icon }) {
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
                <span className={up ? 'text-emerald-600' : 'text-rose-500'}>
                    {up ? <ArrowUp size={13} /> : <ArrowDown size={13} />}
                </span>
                <span className={up ? 'text-emerald-600' : 'text-rose-500'}>{delta}</span>
                <span className="font-medium text-stone-400">desde la semana pasada</span>
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
                <span className="text-sm text-stone-400">Facturas</span>
            </div>
        </div>
    );
}

/*
|--------------------------------------------------------------------------
| GRÁFICO DE LÍNEA (SVG puro + tooltip al pasar el mouse)
|--------------------------------------------------------------------------
*/
function LineChart({ data }) {
    const [hover, setHover] = useState(null);

    const W = 720;
    const H = 300;
    const padL = 40;
    const padR = 20;
    const padT = 24;
    const padB = 40;
    const plotW = W - padL - padR;
    const plotH = H - padT - padB;

    const max = 10000;
    const min = 2000;
    const yTicks = [2000, 4000, 6000, 8000, 10000];

    const x = (i) => padL + (plotW / (data.length - 1)) * i;
    const y = (v) => padT + plotH - ((v - min) / (max - min)) * plotH;

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
                            {t / 1000}k
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
                    <g key={d.month}>
                        <circle
                            cx={x(i)}
                            cy={y(d.value)}
                            r={hover === i ? 5 : 3.5}
                            fill="#ffffff"
                            stroke="#0d9488"
                            strokeWidth="2.5"
                        />
                        <text x={x(i)} y={H - 14} textAnchor="middle" className="fill-stone-400" fontSize="11">
                            {d.month}
                        </text>
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
                        <rect x="-42" y="-26" width="84" height="30" rx="8" fill="#1c1917" />
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
        Pagado: 'bg-teal-50 text-teal-700',
        Pendiente: 'bg-amber-100 text-amber-800',
        Vencido: 'bg-rose-50 text-rose-600',
    };
    return (
        <span className={`inline-block rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide ${map[status] || 'bg-stone-100 text-stone-500'}`}>
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
    stats = DEFAULT_STATS,
    invoices = DEFAULT_INVOICES,
    sales = DEFAULT_SALES,
    recent = DEFAULT_RECENT,
}) {
    // Usuario autenticado (prop compartida por Inertia/Laravel)
    const { auth } = usePage().props;
    const userName = auth?.user?.name ?? 'Usuario';

    const [showingUserMenu, setShowingUserMenu] = useState(false);

    return (
        <AuthenticatedLayout>
            <Head title="Dashboard" />

            <div className="min-h-screen bg-stone-50 px-4 py-6 sm:px-6 lg:px-8">
                {/* BARRA SUPERIOR */}
                <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <h1 className="text-2xl font-bold tracking-tight text-stone-800">
                        Bienvenido de nuevo, {userName} <span className="align-middle">👋</span>
                    </h1>

                    {/* Se oculta en móvil: en el celular esto vive en la barra café y el sidebar */}
                    <div className="hidden items-center gap-4 lg:flex">
                        <button className="text-stone-400 hover:text-teal-700" aria-label="Notificaciones">
                            <Bell size={20} />
                        </button>
                        {/* MENÚ DE USUARIO */}
                        <div className="relative">
                            <button
                                type="button"
                                onClick={() => setShowingUserMenu((v) => !v)}
                                className="flex items-center gap-2 rounded-full p-1 pr-2 transition hover:bg-stone-100"
                            >
                                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-teal-100 text-sm font-bold text-teal-700">
                                    {userName.charAt(0)}
                                </span>
                                <span className="hidden text-sm font-semibold text-stone-700 sm:block">{userName}</span>
                                <ChevronDown
                                    size={16}
                                    className={`text-stone-400 transition ${showingUserMenu ? 'rotate-180' : ''}`}
                                />
                            </button>

                            {/* Fondo invisible para cerrar al hacer clic afuera */}
                            {showingUserMenu && (
                                <div className="fixed inset-0 z-40" onClick={() => setShowingUserMenu(false)} />
                            )}

                            <Transition
                                show={showingUserMenu}
                                enter="transition ease-out duration-150"
                                enterFrom="opacity-0 translate-y-1"
                                enterTo="opacity-100 translate-y-0"
                                leave="transition ease-in duration-100"
                                leaveFrom="opacity-100 translate-y-0"
                                leaveTo="opacity-0 translate-y-1"
                            >
                                <div className="absolute right-0 top-full z-50 mt-2 w-52 overflow-hidden rounded-xl border border-stone-200 bg-white p-1.5 shadow-lg">
                                    <Link
                                        href={route('profile.edit')}
                                        onClick={() => setShowingUserMenu(false)}
                                        className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm text-stone-700 transition hover:bg-amber-50 hover:text-[#1c1210]"
                                    >
                                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-teal-50 text-teal-700">
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} className="h-4 w-4">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                                            </svg>
                                        </span>
                                        Perfil
                                    </Link>

                                    <div className="my-1 border-t border-stone-100" />

                                    <Link
                                        href={route('logout')}
                                        method="post"
                                        as="button"
                                        onClick={() => setShowingUserMenu(false)}
                                        className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-start text-sm text-red-600 transition hover:bg-red-50 hover:text-red-700"
                                    >
                                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-red-50 text-red-600">
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} className="h-4 w-4">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 9V5.25A2.25 2.25 0 0110.5 3h6a2.25 2.25 0 012.25 2.25v13.5A2.25 2.25 0 0116.5 21h-6a2.25 2.25 0 01-2.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3H21" />
                                            </svg>
                                        </span>
                                        Cerrar Sesión
                                    </Link>
                                </div>
                            </Transition>
                        </div>
                    </div>
                </div>

                {/* TARJETAS DE RESUMEN */}
                <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    {stats.map((s) => (
                        <StatCard key={s.label} {...s} />
                    ))}
                </div>

                {/* DONA + LÍNEA */}
                <div className="mb-6 grid grid-cols-1 gap-5 lg:grid-cols-5">
                    {/* Estadísticas de facturas */}
                    <div className="rounded-[28px] bg-white p-6 shadow-sm ring-1 ring-amber-100 lg:col-span-2">
                        <div className="mb-4 flex items-center justify-between">
                            <h2 className="font-bold text-teal-700">Estadísticas de Facturas</h2>
                            <MoreHorizontal size={20} className="text-stone-300" />
                        </div>

                        <div className="flex flex-col items-center gap-6 sm:flex-row sm:justify-between">
                            <DonutChart segments={invoices.segments} total={invoices.total} />
                            <div className="space-y-4">
                                {invoices.segments.map((s) => (
                                    <div key={s.label}>
                                        <div className="flex items-center gap-2 text-sm text-stone-400">
                                            <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: s.color }} />
                                            {s.label}
                                        </div>
                                        <p className="ml-4 text-lg font-extrabold text-stone-800">{s.value}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Análisis de ventas */}
                    <div className="rounded-[28px] bg-white p-6 shadow-sm ring-1 ring-amber-100 lg:col-span-3">
                        <div className="mb-4 flex items-center justify-between">
                            <h2 className="font-bold text-teal-700">Análisis de Ventas</h2>
                            <MoreHorizontal size={20} className="text-stone-300" />
                        </div>
                        <LineChart data={sales} />
                    </div>
                </div>

                {/* FACTURAS RECIENTES */}
                <div className="overflow-hidden rounded-[28px] bg-white shadow-sm ring-1 ring-amber-100">
                    <div className="flex items-center justify-between border-b border-amber-100 bg-gradient-to-br from-amber-50 to-white px-6 py-5">
                        <h2 className="font-bold text-teal-700">Facturas Recientes</h2>
                        <div className="flex items-center gap-3">
                            <button className="inline-flex items-center gap-2 rounded-full border border-stone-200 bg-white px-4 py-1.5 text-sm font-semibold text-stone-500 hover:bg-stone-50">
                                <Filter size={15} />
                                Filtrar
                            </button>
                            <MoreHorizontal size={20} className="text-stone-300" />
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[820px] text-left text-sm">
                            <thead>
                                <tr className="bg-amber-50/60 text-xs font-extrabold uppercase tracking-wide text-stone-500">
                                    <th className="px-6 py-3">No</th>
                                    <th className="px-6 py-3">Id Cliente</th>
                                    <th className="px-6 py-3">Nombre del Cliente</th>
                                    <th className="px-6 py-3">Artículo</th>
                                    <th className="px-6 py-3">Fecha de Orden</th>
                                    <th className="px-6 py-3">Estado</th>
                                    <th className="px-6 py-3 text-right">Precio</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-amber-100">
                                {recent.map((row, i) => (
                                    <tr key={i} className="transition hover:bg-amber-50/40">
                                        <td className="px-6 py-4 text-stone-400">{i + 1}</td>
                                        <td className="px-6 py-4 font-semibold text-stone-500">{row.id}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-teal-100 text-xs font-bold text-teal-700">
                                                    {row.name.charAt(0)}
                                                </span>
                                                <span className="font-semibold text-stone-800">{row.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-stone-500">{row.item}</td>
                                        <td className="px-6 py-4 text-stone-500">{row.date}</td>
                                        <td className="px-6 py-4">
                                            <StatusBadge status={row.status} />
                                        </td>
                                        <td className="px-6 py-4 text-right font-extrabold text-stone-800">{row.price}</td>
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