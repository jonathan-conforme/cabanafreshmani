import { useEffect, useRef, useState } from 'react';
import { Link, router, usePage } from '@inertiajs/react';
import { route } from 'ziggy-js';
import {
    Bell,
    PackageMinus,
    PackageX,
    ReceiptText,
    TrendingUp,
    CheckCheck,
    Inbox,
} from 'lucide-react';

const ICONOS = { PackageMinus, PackageX, ReceiptText, TrendingUp };

const NIVELES = {
    info: { dot: 'bg-sky-500', wrap: 'bg-sky-50 text-sky-600' },
    warning: { dot: 'bg-amber-500', wrap: 'bg-amber-50 text-amber-600' },
    danger: { dot: 'bg-rose-500', wrap: 'bg-rose-50 text-rose-600' },
};

function tiempoRelativo(fecha) {
    const diff = Math.round((Date.now() - new Date(fecha).getTime()) / 1000);
    if (diff < 60) return 'hace un momento';
    if (diff < 3600) return `hace ${Math.floor(diff / 60)} min`;
    if (diff < 86400) return `hace ${Math.floor(diff / 3600)} h`;
    if (diff < 604800) return `hace ${Math.floor(diff / 86400)} d`;
    return new Date(fecha).toLocaleDateString('es-EC');
}

export default function NotificationBell({ variant = 'default' }) {
    const { notificaciones } = usePage().props;
    const noLeidas = notificaciones?.no_leidas ?? 0;
    const recientes = notificaciones?.recientes ?? [];

    const [abierto, setAbierto] = useState(false);
    const contenedorRef = useRef(null);

    // El backend solo comparte esta prop con quien tiene el permiso:
    // si llega vacía, el usuario (ej. un vendedor) no ve la campana.
    const habilitada = Boolean(notificaciones);

    useEffect(() => {
        if (!abierto) return;

        const fuera = (e) => {
            if (contenedorRef.current && !contenedorRef.current.contains(e.target)) {
                setAbierto(false);
            }
        };
        const escape = (e) => e.key === 'Escape' && setAbierto(false);

        document.addEventListener('mousedown', fuera);
        document.addEventListener('keydown', escape);
        return () => {
            document.removeEventListener('mousedown', fuera);
            document.removeEventListener('keydown', escape);
        };
    }, [abierto]);

    const marcarLeida = (id) => {
        router.patch(route('notificaciones.leer', id), {}, { preserveScroll: true, preserveState: true });
    };

    const marcarTodas = () => {
        router.patch(route('notificaciones.leerTodas'), {}, { preserveScroll: true, preserveState: true });
    };

    const abrirNotificacion = (n) => {
        setAbierto(false);

        if (n.leida) {
            if (n.enlace) router.visit(n.enlace);
            return;
        }

        // Inertia cancela la petición en vuelo al iniciar otra, así que la
        // navegación debe esperar a que el PATCH de "leída" termine.
        router.patch(route('notificaciones.leer', n.id), {}, {
            preserveScroll: true,
            preserveState: true,
            onSuccess: () => {
                if (n.enlace) router.visit(n.enlace);
            },
        });
    };

    const colorBoton =
        variant === 'light'
            ? 'text-amber-100 hover:bg-white/10'
            : 'text-stone-400 hover:bg-stone-100 hover:text-teal-700';

    if (!habilitada) return null;

    return (
        <div ref={contenedorRef} className="relative">
            <button
                type="button"
                onClick={() => setAbierto((v) => !v)}
                className={`relative rounded-full p-2 transition ${colorBoton}`}
                aria-label="Notificaciones"
            >
                <Bell size={20} />
                {noLeidas > 0 && (
                    <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white ring-2 ring-white">
                        {noLeidas > 99 ? '99+' : noLeidas}
                    </span>
                )}
            </button>

            {abierto && (
                <div className="absolute right-0 z-50 mt-2 w-[22rem] max-w-[calc(100vw-2rem)] overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-xl">
                    <div className="flex items-center justify-between border-b border-stone-100 bg-stone-50 px-4 py-3">
                        <div>
                            <p className="text-sm font-bold text-stone-800">Notificaciones</p>
                            <p className="text-xs text-stone-400">
                                {noLeidas > 0 ? `${noLeidas} sin leer` : 'Todo al día'}
                            </p>
                        </div>
                        {noLeidas > 0 && (
                            <button
                                type="button"
                                onClick={marcarTodas}
                                className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold text-teal-700 transition hover:bg-teal-50"
                            >
                                <CheckCheck size={14} />
                                Marcar todas
                            </button>
                        )}
                    </div>

                    <div className="max-h-[22rem] divide-y divide-stone-100 overflow-y-auto">
                        {recientes.length === 0 && (
                            <div className="flex flex-col items-center gap-2 px-4 py-10 text-center">
                                <Inbox size={28} className="text-stone-300" />
                                <p className="text-sm text-stone-400">No tienes notificaciones.</p>
                            </div>
                        )}

                        {recientes.map((n) => {
                            const Icono = ICONOS[n.icono] ?? Bell;
                            const estilo = NIVELES[n.nivel] ?? NIVELES.info;

                            return (
                                <button
                                    key={n.id}
                                    type="button"
                                    onClick={() => abrirNotificacion(n)}
                                    className={`flex w-full items-start gap-3 px-4 py-3 text-left transition hover:bg-stone-50 ${
                                        n.leida ? '' : 'bg-teal-50/40'
                                    }`}
                                >
                                    <span className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${estilo.wrap}`}>
                                        <Icono size={16} />
                                    </span>
                                    <span className="min-w-0 flex-1">
                                        <span className="flex items-center gap-2">
                                            <span className="truncate text-sm font-semibold text-stone-800">{n.titulo}</span>
                                            {!n.leida && <span className={`h-2 w-2 shrink-0 rounded-full ${estilo.dot}`} />}
                                        </span>
                                        <span className="mt-0.5 block text-xs leading-snug text-stone-500">{n.mensaje}</span>
                                        <span className="mt-1 block text-[11px] text-stone-400">{tiempoRelativo(n.created_at)}</span>
                                    </span>
                                </button>
                            );
                        })}
                    </div>

                    <Link
                        href={route('notificaciones.index')}
                        onClick={() => setAbierto(false)}
                        className="block border-t border-stone-100 bg-stone-50 px-4 py-3 text-center text-sm font-semibold text-teal-700 transition hover:bg-teal-50"
                    >
                        Ver todas las notificaciones
                    </Link>
                </div>
            )}
        </div>
    );
}
