import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, useForm } from '@inertiajs/react';

export default function ConfirmPassword() {
    const { data, setData, post, processing, errors, reset } = useForm({
        password: '',
    });

    const submit = (e) => {
        e.preventDefault();

        post(route('password.confirm'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <GuestLayout>
            <Head title="Confirmar contraseña">
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
                <link href="https://fonts.googleapis.com/css2?family=Baloo+2:wght@600;700;800&family=Nunito:wght@400;600;700;800&display=swap" rel="stylesheet" />
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
                        <path fill="#FFFBEB" d="M0,60 L0,40 C55,15 120,2 190,9 C260,16 320,32 410,22 L410,60 Z" />
                    </svg>
                </div>

                <div className="px-7 pb-8 pt-5">
                    <h1
                        className="text-center text-2xl font-bold text-teal-700"
                        style={{ fontFamily: "'Baloo 2', cursive" }}
                    >
                        Área protegida
                    </h1>
                    <p className="mb-4 mt-1 text-center text-xs font-extrabold uppercase tracking-wider text-orange-700">
                        Productos 100% Manabas
                    </p>

                    <p className="mb-6 text-center text-xs text-stone-600">
                        Por favor, confirma tu contraseña antes de continuar a esta sección.
                    </p>

                    <form onSubmit={submit} className="space-y-4">
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
                                isFocused={true}
                                onChange={(e) => setData('password', e.target.value)}
                            />

                            <InputError message={errors.password} className="mt-2" />
                        </div>

                        <div className="pt-2">
                            <PrimaryButton
                                className="w-full justify-center rounded-full bg-gradient-to-br from-orange-500 to-orange-800 py-3 text-sm font-extrabold uppercase tracking-wide shadow-lg shadow-orange-900/30 transition hover:-translate-y-0.5 hover:shadow-xl focus:ring-teal-600 active:translate-y-0 disabled:opacity-70"
                                disabled={processing}
                            >
                                Confirmar
                            </PrimaryButton>
                        </div>
                    </form>
                </div>

                <p className="border-t border-amber-100 px-7 py-5 text-center text-xs text-stone-400">
                    Acceso restringido a personal autorizado. Toda actividad es registrada.
                </p>
            </div>
        </GuestLayout>
    );
}