import React from 'react';
import { useForm, Head, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

export default function Create({ roles = [] }) {
    const { flash } = usePage().props;

    const { data, setData, post, processing, errors } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        role: roles[0] || '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();

        post(route('users.store'));
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Dashboard
                </h2>
            }
        >
            <Head title="Crear Usuario" />

            <div>
                {flash?.success && (
                    <div style={{ color: 'green', marginBottom: '10px' }}>
                        {flash.success}
                    </div>
                )}

                <h1>Crear Nuevo Empleado</h1>

                <form onSubmit={handleSubmit}>
                    <div>
                        <label htmlFor="name">Nombre completo:</label>

                        <input
                            id="name"
                            type="text"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            required
                        />

                        {errors.name && (
                            <div style={{ color: 'red' }}>
                                {errors.name}
                            </div>
                        )}
                    </div>

                    <div>
                        <label htmlFor="email">
                            Correo electrónico:
                        </label>

                        <input
                            id="email"
                            type="email"
                            value={data.email}
                            onChange={(e) =>
                                setData('email', e.target.value)
                            }
                            required
                        />

                        {errors.email && (
                            <div style={{ color: 'red' }}>
                                {errors.email}
                            </div>
                        )}
                    </div>

                    <div>
                        <label htmlFor="password">
                            Contraseña:
                        </label>

                        <input
                            id="password"
                            type="password"
                            value={data.password}
                            onChange={(e) =>
                                setData('password', e.target.value)
                            }
                            required
                        />

                        <label htmlFor="password_confirmation">
                            Confirmar contraseña:
                        </label>

                        <input
                            id="password_confirmation"
                            type="password"
                            value={data.password_confirmation}
                            onChange={(e) =>
                                setData(
                                    'password_confirmation',
                                    e.target.value
                                )
                            }
                            required
                        />

                        {errors.password && (
                            <div style={{ color: 'red' }}>
                                {errors.password}
                            </div>
                        )}
                    </div>

                    <div>
                        <label htmlFor="role">
                            Rol asignado:
                        </label>

                        <select
                            id="role"
                            value={data.role}
                            onChange={(e) =>
                                setData('role', e.target.value)
                            }
                            required
                        >
                            <option value="" disabled>
                                Selecciona un rol
                            </option>

                            {roles.map((role) => (
                                <option key={role} value={role}>
                                    {role}
                                </option>
                            ))}
                        </select>

                        {errors.role && (
                            <div style={{ color: 'red' }}>
                                {errors.role}
                            </div>
                        )}
                    </div>

                    <div>
                        <button type="submit" disabled={processing}>
                            {processing
                                ? 'Guardando...'
                                : 'Guardar Usuario'}
                        </button>
                    </div>
                </form>
            </div>
        </AuthenticatedLayout>
    );
}