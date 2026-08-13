import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, usePage } from '@inertiajs/react';
import { route } from "ziggy-js";

export default function Dashboard() {
    const { auth } = usePage().props;
    const roles = auth.user?.roles || [];

    const isAdmin = roles.includes('administrador');
    const isVendedor = roles.includes('vendedor') || roles.includes('vendedor_fritada');

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Dashboard
                </h2>
            }
        >
            <Head title="Dashboard" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8 space-y-6">
                    
                    {/* Mensaje de Bienvenida */}
                    <div className="bg-white p-6 shadow-sm sm:rounded-lg">
                        <h3 className="text-lg font-medium text-gray-900">
                            ¡Hola, {auth.user.name}! 
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">
                            Listo para la jornada de hoy en Cabaña Fresh.
                        </p>
                    </div>

                    {/* VISTA PARA VENDEDORES (Fritada y General) */}
                    {isVendedor && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-amber-500">
                                <span className="text-xs font-bold text-gray-400 uppercase">Ventas de Hoy</span>
                                <p className="text-2xl font-bold text-gray-800 mt-1">$0.00</p>
                            </div>

                            <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-blue-500">
                                <span className="text-xs font-bold text-gray-400 uppercase">Órdenes Realizadas</span>
                                <p className="text-2xl font-bold text-gray-800 mt-1">0</p>
                            </div>

                            <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-emerald-500">
                                <span className="text-xs font-bold text-gray-400 uppercase">Acción Rápida</span>
                                <div className="mt-2">
                                    <button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2 px-4 rounded-md text-sm transition">
                                        + Nueva Venta
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* VISTA EXCLUSIVA DE ADMINISTRADOR */}
                    {isAdmin && (
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                            <div className="bg-white p-6 rounded-lg shadow-sm border-t-4 border-indigo-500">
                                <span className="text-xs font-bold text-gray-400 uppercase">Total Ingresos</span>
                                <p className="text-2xl font-bold text-gray-800 mt-1">$0.00</p>
                            </div>


                            <div className="bg-white p-6 rounded-lg shadow-sm border-t-4 border-sky-500">
                                <span className="text-xs font-bold text-gray-400 uppercase">Ventas Generales</span>
                                <p className="text-2xl font-bold text-gray-800 mt-1">$0.00</p>
                            </div>

                            <div className="bg-white p-6 rounded-lg shadow-sm border-t-4 border-purple-500">
                                <span className="text-xs font-bold text-gray-400 uppercase">Usuarios Activos</span>
                                <p className="text-2xl font-bold text-gray-800 mt-1">3</p>
                            </div>
                            <div className="bg-white p-6 rounded-lg shadow-sm border-t-4 border-emerald-500">
                                <span className="text-xs font-bold text-gray-400 uppercase">Ventas Fritada</span>
                                <p className="text-2xl font-bold text-gray-800 mt-1">$0.00</p>
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </AuthenticatedLayout>
    );
}