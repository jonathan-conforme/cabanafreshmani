import Checkbox from '@/Components/Checkbox';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Login({ status, canResetPassword }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const submit = (e) => {
        e.preventDefault();

        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <GuestLayout>
            <Head title="Iniciar sesión">
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link
                    rel="preconnect"
                    href="https://fonts.gstatic.com"
                    crossOrigin="anonymous"
                />
                <link
                    href="https://fonts.googleapis.com/css2?family=Baloo+2:wght@600;700;800&family=Nunito:wght@400;600;700;800&display=swap"
                    rel="stylesheet"
                />
            </Head>

            

            <div className="w-full overflow-hidden rounded-[28px] bg-amber-50 shadow-xl shadow-stone-900/20">
                {/* Hero de marca */}
                <div className="relative overflow-hidden bg-gradient-to-br from-stone-800 to-stone-950 px-6 pb-0 pt-10">
                    <span className="absolute left-[14%] top-4 h-1.5 w-1.5 rounded-full bg-amber-400 opacity-50" />
                    <span className="absolute right-[18%] top-8 h-1 w-1 rounded-full bg-amber-400 opacity-40" />
                    <span className="absolute left-[24%] top-14 h-1 w-1 rounded-full bg-amber-400 opacity-40" />

                    <img
                        src="/images/cabana-fresh-mani-logo.png"
                        alt="Cabaña Fresh Maní — Productos 100% Manabas"
                        className="cfm-logo relative z-10 mx-auto w-[200px] max-w-[70%] drop-shadow-[0_16px_18px_rgba(0,0,0,0.5)]"
                    />

                    <svg
                        className="relative z-[1] mt-3 block h-auto w-full"
                        viewBox="0 0 410 60"
                        preserveAspectRatio="none"
                        aria-hidden="true"
                    >
                        <path
                            fill="#FFFBEB"
                            d="M0,60 L0,40 C55,15 120,2 190,9 C260,16 320,32 410,22 L410,60 Z"
                        />
                    </svg> 
                </div>

                <div className="px-7 pb-8 pt-5">
                    <h1
                        className="text-center text-2xl font-bold text-teal-700"
                        style={{ fontFamily: "'Baloo 2', cursive" }}
                    >
                        Iniciar sesión
                    </h1>
                    <p className="mb-6 mt-1 text-center text-xs font-extrabold uppercase tracking-wider text-orange-700">
                        Productos 100% Manabas
                    </p>

                    {status && (
                        <div className="mb-6 rounded-md border-l-4 border-emerald-500 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800">
                            {status}
                        </div>
                    )}

                    <form onSubmit={submit} className="space-y-4">
                        <div>
                            <InputLabel
                                htmlFor="email"
                                value="Correo electrónico"
                                className="text-xs font-extrabold uppercase tracking-wide text-stone-500"
                            />

                            <TextInput
                                id="email"
                                type="email"
                                name="email"
                                value={data.email}
                                className="mt-2 block w-full rounded-2xl border-amber-200 bg-white text-stone-900 shadow-sm transition focus:border-teal-600 focus:ring-1 focus:ring-teal-600"
                                autoComplete="username"
                                isFocused={true}
                                onChange={(e) => setData('email', e.target.value)}
                            />

                            <InputError message={errors.email} className="mt-2" />
                        </div>

                        <div>
                            <InputLabel
                                htmlFor="password"
                                value="Contraseña"
                                className="text-xs font-extrabold uppercase tracking-wide text-stone-500"
                            />

                            <TextInput
                                id="password"
                                type="password"
                                name="password"
                                value={data.password}
                                className="mt-2 block w-full rounded-2xl border-amber-200 bg-white text-stone-900 shadow-sm transition focus:border-teal-600 focus:ring-1 focus:ring-teal-600"
                                autoComplete="current-password"
                                onChange={(e) =>
                                    setData('password', e.target.value)
                                }
                            />

                            <InputError
                                message={errors.password}
                                className="mt-2"
                            />
                        </div>

                        <div className="flex items-center justify-between">
                            <label className="flex cursor-pointer items-center">
                                <Checkbox
                                    name="remember"
                                    checked={data.remember}
                                    onChange={(e) =>
                                        setData('remember', e.target.checked)
                                    }
                                    className="rounded-md border-amber-300 text-orange-600 focus:ring-teal-600"
                                />
                                <span className="ms-2 text-sm font-semibold text-stone-500">
                                    Recordarme
                                </span>
                            </label>

                            {canResetPassword && (
                                <Link
                                    href={route('password.request')}
                                    className="rounded text-sm font-bold text-teal-700 underline-offset-4 transition hover:underline focus:outline-none focus:ring-2 focus:ring-teal-600 focus:ring-offset-2"
                                >
                                    ¿Olvidó su contraseña?
                                </Link>
                            )}
                        </div>

                        <div className="pt-2">
                            <PrimaryButton
                                className="w-full justify-center rounded-full bg-gradient-to-br from-orange-500 to-orange-800 py-3 text-sm font-extrabold uppercase tracking-wide shadow-lg shadow-orange-900/30 transition hover:-translate-y-0.5 hover:shadow-xl focus:ring-teal-600 active:translate-y-0 disabled:opacity-70"
                                disabled={processing}
                            >
                                Ingresar
                            </PrimaryButton>
                        </div>
                    </form>
                </div>

                <p className="border-t border-amber-100 px-7 py-5 text-center text-xs text-stone-400">
                    Acceso restringido a personal autorizado. Toda actividad
                    es registrada.
                </p>
            </div>
        </GuestLayout>
    );
}