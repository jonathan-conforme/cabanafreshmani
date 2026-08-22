import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, Link } from '@inertiajs/react';

export default function Index({ auth, movimientos, productos, filters }) {
    const [search, setSearch] = useState(filters?.search || '');
    const [productoId, setProductoId] = useState(filters?.producto_id || '');
    const [tipo, setTipo] = useState(filters?.tipo || '');

    // Auxiliar para determinar si el movimiento suma al stock
    const esMovimientoEntrada = (tipo) => {
        if (!tipo) return false;
        const t = tipo.toString().toUpperCase();
        return ['ENTRADA', 'AJUSTE_POSITIVO', 'COMPRA'].includes(t);
    };

    // Auxiliar para formatear números de forma segura (evita NaN)
    const formatNumber = (value, decimals = 3) => {
        const num = Number(value);
        return isNaN(num) ? (0).toFixed(decimals) : num.toFixed(decimals);
    };

    // Auxiliar para el Badge del Tipo
    const getTipoBadge = (tipo) => {
        const tipoUpper = tipo ? tipo.toString().toUpperCase() : 'DESCONOCIDO';
        const styles = {
            ENTRADA: 'bg-green-100 text-green-800 border-green-200',
            COMPRA: 'bg-green-100 text-green-800 border-green-200',
            AJUSTE_POSITIVO: 'bg-emerald-100 text-emerald-800 border-emerald-200',
            SALIDA: 'bg-red-100 text-red-800 border-red-200',
            VENTA: 'bg-red-100 text-red-800 border-red-200',
            AJUSTE_NEGATIVO: 'bg-amber-100 text-amber-800 border-amber-200',
        };

        return (
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border uppercase ${styles[tipoUpper] || 'bg-gray-100 text-gray-800'}`}>
                {tipo}
            </span>
        );
    };

    const handleFilter = (e) => {
        e.preventDefault();
        router.get(
            route('kardex.index'),
            { search, producto_id: productoId, tipo },
            { preserveState: true, replace: true }
        );
    };

    const handleReset = () => {
        setSearch('');
        setProductoId('');
        setTipo('');
        router.get(route('kardex.index'));
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Kardex de Inventario</h2>}
        >
            <Head title="Kardex - Movimientos" />

            <div className="py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
                {/* Panel de Filtros */}
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                    <form onSubmit={handleFilter} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Buscar Producto</label>
                            <input
                                type="text"
                                placeholder="Nombre o Cód. Barras..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full text-sm rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Producto Específico</label>
                            <select
                                value={productoId}
                                onChange={(e) => setProductoId(e.target.value)}
                                className="w-full text-sm rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            >
                                <option value="">Todos los productos</option>
                                {productos?.map((p) => (
                                    <option key={p.id} value={p.id}>
                                        {p.nombre}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Tipo Movimiento</label>
                            <select
                                value={tipo}
                                onChange={(e) => setTipo(e.target.value)}
                                className="w-full text-sm rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            >
                                <option value="">Todos los tipos</option>
                                <option value="COMPRA">COMPRA</option>
                                <option value="VENTA">VENTA</option>
                                <option value="ENTRADA">ENTRADA</option>
                                <option value="SALIDA">SALIDA</option>
                                <option value="AJUSTE_POSITIVO">AJUSTE POSITIVO</option>
                                <option value="AJUSTE_NEGATIVO">AJUSTE NEGATIVO</option>
                            </select>
                        </div>

                        <div className="flex gap-2">
                            <button
                                type="submit"
                                className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium py-2 px-4 rounded-lg transition-colors"
                            >
                                Filtrar
                            </button>
                            <button
                                type="button"
                                onClick={handleReset}
                                className="bg-gray-100 hover:bg-gray-200 text-gray-600 text-sm font-medium py-2 px-3 rounded-lg transition-colors"
                            >
                                Limpiar
                            </button>
                        </div>
                    </form>
                </div>

                {/* Tabla Kardex */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left text-gray-500">
                            <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b">
                                <tr>
                                    <th className="px-6 py-3">Fecha</th>
                                    <th className="px-6 py-3">Producto</th>
                                    <th className="px-6 py-3">Tipo</th>
                                    <th className="px-6 py-3 text-right">Cantidad</th>
                                    <th className="px-6 py-3 text-right">St. Anterior</th>
                                    <th className="px-6 py-3 text-right">St. Nuevo</th>
                                    <th className="px-6 py-3 text-right">Costo U.</th>
                                    <th className="px-6 py-3">Motivo / Usuario</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {movimientos?.data?.length > 0 ? (
                                    movimientos.data.map((m) => (
                                        <tr key={m.id} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-600">
                                                {new Date(m.created_at).toLocaleString()}
                                            </td>
                                            <td className="px-6 py-4">
                                                <p className="font-semibold text-gray-900">{m.producto?.nombre}</p>
                                                <p className="text-xs text-gray-400">{m.producto?.unidad?.nombre || 'Libras'}</p>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">{getTipoBadge(m.tipo)}</td>
                                            <td className={`px-6 py-4 text-right font-semibold whitespace-nowrap ${esMovimientoEntrada(m.tipo) ? 'text-green-600' : 'text-red-600'}`}>
                                                {esMovimientoEntrada(m.tipo) ? '+' : '-'}{formatNumber(m.cantidad, 3)}
                                            </td>
                                            <td className="px-6 py-4 text-right text-gray-600 whitespace-nowrap">
                                                {formatNumber(m.stock_anterior, 3)}
                                            </td>
                                            <td className="px-6 py-4 text-right font-bold text-gray-900 whitespace-nowrap">
                                                {formatNumber(m.stock_nuevo, 3)}
                                            </td>
                                            <td className="px-6 py-4 text-right text-gray-600 whitespace-nowrap">
                                                ${formatNumber(m.costo_unitario, 2)}
                                            </td>
                                            <td className="px-6 py-4 text-xs text-gray-600">
                                                <p className="font-medium text-gray-800">{m.motivo || 'Sin motivo especificado'}</p>
                                                <p className="text-gray-400">Por: {m.user?.name || 'Sistema'}</p>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="8" className="px-6 py-8 text-center text-gray-400">
                                            No se encontraron movimientos con los filtros aplicados.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Paginación */}
                    {movimientos?.links && movimientos.links.length > 3 && (
                        <div className="p-4 border-t border-gray-100 flex justify-end gap-1">
                            {movimientos.links.map((link, key) => (
                                <Link
                                    key={key}
                                    href={link.url || '#'}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                    className={`px-3 py-1 text-xs rounded-md ${
                                        link.active
                                            ? 'bg-indigo-600 text-white font-bold'
                                            : link.url
                                            ? 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                                            : 'text-gray-300 cursor-not-allowed'
                                    }`}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
