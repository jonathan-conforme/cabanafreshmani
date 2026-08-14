import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';

export default function Create({ auth, flash }) {
    // 1. Estado del formulario vinculado exactamente a tu ClienteRequest
    const { data, setData, post, processing, errors } = useForm({
        nombre: '',
        apellido: '',
        identificacion: '',
        telefono: '',
        email: '',
        limite_credito: '',
    });

    // 2. Envío de datos al Backend
    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('clientes.store'));
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Nuevo Cliente</h2>}
        >
            <Head title="Crear Cliente" />

                {flash?.success && (
                    <div style={{ color: 'green', marginBottom: '10px' }}>
                        {flash.success}
                    </div>
                )}

            <div className="py-12">
                <div className="max-w-4xl mx-auto sm:px-6 lg:px-8">
                    {/* CONTENEDOR BASE - El diseñador/UX puede ajustar padding, border-radius, sombreados, etc. */}
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">

                        <form onSubmit={handleSubmit} className="space-y-6">

                            {/* CAMPO: NOMBRE (Requerido) */}
                            <div>
                                <label htmlFor="nombre" className="block text-sm font-medium text-gray-700">
                                    Nombre Completo <span className="text-red-500">*</span>
                                </label>
                                <input
                                    id="nombre"
                                    type="text"
                                    value={data.nombre}
                                    onChange={(e) => setData('nombre', e.target.value)}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                    placeholder="Ej: Juan Pérez"
                                    required
                                />
                                {errors.nombre && (
                                    <p className="mt-1 text-sm text-red-600">{errors.nombre}</p>
                                )}
                            </div>
                              {/* CAMPO: apellido (Requerido) */}
                            <div>
                                <label htmlFor="apellido" className="block text-sm font-medium text-gray-700">
                                    Apellido <span className="text-red-500">*</span>
                                </label>
                                <input
                                    id="apellido"
                                    type="text"
                                    value={data.apellido}
                                    onChange={(e) => setData('apellido', e.target.value)}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                    placeholder="Ej: Pérez García"
                                    required
                                />
                                {errors.apellido && (
                                    <p className="mt-1 text-sm text-red-600">{errors.apellido}</p>
                                )}
                            </div>

                            {/* CAMPO: IDENTIFICACIÓN */}
                            <div>
                                <label htmlFor="identificacion" className="block text-sm font-medium text-gray-700">
                                    Identificación / Cédula / RUC <span className="text-red-500">*</span>
                                </label>
                                <input
                                    id="identificacion"
                                    type="number"
                                    value={data.identificacion}
                                    onChange={(e) => setData('identificacion', e.target.value)}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                    placeholder="Ej: 0999999999"
                                    required
                                />
                                {errors.identificacion && (
                                    <p className="mt-1 text-sm text-red-600">{errors.identificacion}</p>
                                )}
                            </div>

                            {/* CAMPO: TELÉFONO */}
                            <div>
                                <label htmlFor="telefono" className="block text-sm font-medium text-gray-700">
                                    Teléfono
                                </label>
                                <input
                                    id="telefono"
                                    type="text"
                                    value={data.telefono}
                                    onChange={(e) => setData('telefono', e.target.value)}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                    placeholder="Ej: 0987654321"
                                />
                                {errors.telefono && (
                                    <p className="mt-1 text-sm text-red-600">{errors.telefono}</p>
                                )}
                            </div>

                            {/* CAMPO: EMAIL */}
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                    Correo Electrónico
                                </label>
                                <input
                                    id="email"
                                    type="email"
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                    placeholder="correo@ejemplo.com"
                                />
                                {errors.email && (
                                    <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                                )}
                            </div>

                            {/* CAMPO: LÍMITE DE CRÉDITO */}
                            <div>
                                <label htmlFor="limite_credito" className="block text-sm font-medium text-gray-700">
                                    Límite de Crédito ($)
                                </label>
                                <input
                                    id="limite_credito"
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={data.limite_credito}
                                    onChange={(e) => setData('limite_credito', e.target.value)}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                    placeholder="0.00"
                                />
                                {errors.limite_credito && (
                                    <p className="mt-1 text-sm text-red-600">{errors.limite_credito}</p>
                                )}
                            </div>

                            {/* BOTONES DE ACCIÓN */}
                            <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none disabled:opacity-50 transition"
                                >
                                    {processing ? 'Guardando...' : 'Guardar Cliente'}
                                </button>
                            </div>

                        </form>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
