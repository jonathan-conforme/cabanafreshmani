import { useState, useMemo, useRef, useEffect } from 'react'; // <-- Importamos useRef y useEffect
import { Head, useForm, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { toast } from '@/Components/SweetAlert';
import { Search, Plus, Trash2, UserPlus, Lock, Scale, DollarSign, Package, Banknote, CreditCard, ArrowRightLeft } from 'lucide-react';
import axios from 'axios';

const formatMoney = (val) => (Number(val) || 0).toFixed(2);

export default function PosIndex({ productos, clientes, caja, ventasEfectivoSum = 0 }) {
    // Referencia para el input del buscador de productos
    const searchInputRef = useRef(null);

    // 1. Estados
    const [listaClientes, setListaClientes] = useState(clientes || []);
    const [search, setSearch] = useState('');
    const [clienteSearch, setClienteSearch] = useState('');
    const [cart, setCart] = useState([]);
    const [clienteId, setClienteId] = useState(listaClientes[0]?.id || '');
    const [metodoPago, setMetodoPago] = useState('efectivo');
    const [descuento, setDescuento] = useState(0);
    const [montoEntregado, setMontoEntregado] = useState('');

    // Modales
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [tipoVenta, setTipoVenta] = useState('unidad');
    const [inputValor, setInputValor] = useState('1');
    const [showProductModal, setShowProductModal] = useState(false);
    const [showClientModal, setShowClientModal] = useState(false);
    const [showCierreModal, setShowCierreModal] = useState(false);

    // Formulario Cliente Exprés
    const [clientForm, setClientForm] = useState({ nombre: '', apellido: '', identificacion: '', telefono: '' });
    const [creatingClient, setCreatingClient] = useState(false);

    // Formulario Cierre de Caja
    const { data: cierreData, setData: setCierreData, post: postCierre, processing: processingCierre } = useForm({
        monto_cierre: '',
        observaciones: '',
    });

    // EFECTO: Enfocar automáticamente el buscador al cargar o al cerrar cualquier modal
    useEffect(() => {
        if (!showProductModal && !showClientModal && !showCierreModal) {
            setTimeout(() => {
                searchInputRef.current?.focus();
            }, 50);
        }
    }, [showProductModal, showClientModal, showCierreModal]);

    // 2. Cálculos
    const subtotalGeneral = useMemo(() => {
        return cart.reduce((acc, item) => acc + (Number(item.subtotal) || 0), 0);
    }, [cart]);

    const totalGeneral = useMemo(() => {
        return Math.max(0, subtotalGeneral - parseFloat(descuento || 0));
    }, [subtotalGeneral, descuento]);

    const vueltoCalculado = useMemo(() => {
        if (metodoPago !== 'efectivo') return 0;
        return Math.max(0, (Number(montoEntregado) || 0) - totalGeneral);
    }, [montoEntregado, totalGeneral, metodoPago]);

    // FILTRO DE PRODUCTOS
    const filteredProducts = useMemo(() => {
        const term = search.toLowerCase().trim();
        return productos.filter((p) =>
            p.nombre.toLowerCase().includes(term) ||
            (p.codigo_barras && p.codigo_barras.toLowerCase().includes(term))
        );
    }, [productos, search]);

    // FILTRO DE CLIENTES
    const filteredClientes = useMemo(() => {
        const term = clienteSearch.toLowerCase().trim();
        if (!term) return listaClientes;
        return listaClientes.filter((c) =>
            `${c.nombre} ${c.apellido}`.toLowerCase().includes(term) ||
            (c.identificacion && c.identificacion.toLowerCase().includes(term))
        );
    }, [listaClientes, clienteSearch]);

    // MANEJADOR LECTOR DE CÓDIGO DE BARRAS
    const handleProductKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            const term = search.trim();
            if (!term) return;

            const productoEncontrado = productos.find(
                (p) => p.codigo_barras && p.codigo_barras.trim() === term
            );

            if (productoEncontrado) {
                handleOpenProduct(productoEncontrado);
                setSearch('');
            } else if (filteredProducts.length === 1) {
                handleOpenProduct(filteredProducts[0]);
                setSearch('');
            } else {
                toast('Producto no encontrado', 'warning');
            }
        }
    };

    const handleClienteSearchKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            const term = clienteSearch.trim();
            if (!term) return;

            const clienteEncontrado = listaClientes.find(
                (c) => c.identificacion && c.identificacion.trim() === term
            );

            if (clienteEncontrado) {
                setClienteId(clienteEncontrado.id);
                toast(`Cliente seleccionado: ${clienteEncontrado.nombre}`, 'success');
            } else {
                toast('Cliente no encontrado con esa cédula', 'warning');
            }
        }
    };

    const handleOpenProduct = (prod) => {
        setSelectedProduct(prod);
        setTipoVenta('unidad');
        setInputValor('1');
        setShowProductModal(true);
    };

    const handleAddToCart = (e) => {
        e.preventDefault();
        const valor = parseFloat(inputValor);
        if (!valor || valor <= 0) return toast('Ingresa un valor válido', 'warning');

        const precioProducto = Number(selectedProduct.precio ?? selectedProduct.precio_venta ?? 0);

        let cantidadCalculada = valor;
        let subtotalCalculado = valor * precioProducto;

        if (tipoVenta === 'monto_exacto') {
            subtotalCalculado = valor;
            cantidadCalculada = precioProducto > 0 ? valor / precioProducto : 0;
        }

        const newItem = {
            producto_id: selectedProduct.id,
            nombre: selectedProduct.nombre,
            tipo_venta: tipoVenta,
            cantidad: cantidadCalculada,
            precio_unitario: precioProducto,
            subtotal: subtotalCalculado,
        };

        setCart((prev) => [...prev, newItem]);
        setShowProductModal(false);
        toast('Producto agregado al carrito', 'success');
    };

    const handleRemoveFromCart = (index) => {
        setCart((prev) => prev.filter((_, i) => i !== index));
    };

    const handleSaveClientExpress = async (e) => {
        e.preventDefault();
        setCreatingClient(true);
        try {
            const res = await axios.post(route('clientes.storeExpress'), clientForm);
            setListaClientes((prev) => [res.data.cliente, ...prev]);
            setClienteId(res.data.cliente.id);
            setShowClientModal(false);
            setClientForm({ nombre: '', apellido: '', identificacion: '', telefono: '' });
            toast('Cliente registrado con éxito', 'success');
        } catch {
            toast('Error al registrar cliente express', 'error');
        } finally {
            setCreatingClient(false);
        }
    };

    const handleProcesarVenta = () => {
    if (cart.length === 0) return toast('El carrito está vacío', 'warning');
    if (!clienteId) return toast('Selecciona un cliente', 'warning');

    const montoEfectivo = parseFloat(montoEntregado);
    const pagoFinal = metodoPago === 'efectivo'
        ? (!isNaN(montoEfectivo) ? montoEfectivo : totalGeneral)
        : totalGeneral;

    router.post(
        route('ventas.store'),
        {
            cliente_id: clienteId,
            metodo_pago: metodoPago,
            descuento: parseFloat(descuento || 0),
            pago_con: pagoFinal,
            vuelto: vueltoCalculado,
            items: cart,
        },
        {
            onSuccess: () => {
                // 1. Limpiar carrito y campos
                setCart([]);
                setDescuento(0);
                setMontoEntregado('');
                setSearch('');
                setClienteSearch('');

                toast('¡Venta realizada con éxito!', 'success');

                // 2. Regresar el foco al lector de código de barras
                setTimeout(() => {
                    searchInputRef.current?.focus();
                }, 50);
            },
        }
    );
};

    const montoEsperado = useMemo(() => {
        return (parseFloat(caja?.monto_apertura || 0) + parseFloat(ventasEfectivoSum)).toFixed(2);
    }, [caja, ventasEfectivoSum]);

    const diferenciaArqueo = useMemo(() => {
        if (!cierreData.monto_cierre) return 0;
        return (parseFloat(cierreData.monto_cierre) - parseFloat(montoEsperado)).toFixed(2);
    }, [cierreData.monto_cierre, montoEsperado]);

    const handleCierreSubmit = (e) => {
        e.preventDefault();
        postCierre(route('cajas.storeCierre'));
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold text-[#0E7C86]">Módulo POS / Ventas</h2>
                    <button
                        onClick={() => setShowCierreModal(true)}
                        className="flex items-center gap-2 rounded-full border border-red-200 bg-red-50 px-4 py-2 text-xs font-bold text-red-600 hover:bg-red-100"
                    >
                        <Lock size={16} /> Cerrar Caja Activa
                    </button>
                </div>
            }
        >
            <Head title="POS Venta" />

            <div className="grid grid-cols-1 gap-6 p-4 lg:grid-cols-12 lg:p-6">
                {/* LADO IZQUIERDO: CATÁLOGO DE PRODUCTOS (7 COLS) */}
                <div className="lg:col-span-7">
                    <div className="mb-4 flex items-center gap-3 rounded-2xl bg-white p-3 border border-[#F0E6C8] shadow-sm">
                        <Search className="text-[#A3915F]" size={20} />
                        <input
                            ref={searchInputRef} // <-- ASIGNACIÓN DE REFERENCIA
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            onKeyDown={handleProductKeyDown}
                            placeholder="Buscar o escanear código de barras..."
                            className="w-full bg-transparent text-sm outline-none placeholder:text-[#A3915F]"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                        {filteredProducts.map((prod) => (
                            <button
                                key={prod.id}
                                onClick={() => handleOpenProduct(prod)}
                                className="flex flex-col justify-between rounded-2xl border border-[#F0E6C8] bg-white p-4 text-left transition hover:border-[#0E7C86] hover:shadow-md"
                            >
                                <div>
                                    <span className="text-xs font-bold uppercase text-[#8A7A4E]">Stock: {prod.stock}</span>
                                    <h3 className="mt-1 text-sm font-extrabold text-[#2F2A20]">{prod.nombre}</h3>
                                    {prod.codigo_barras && (
                                        <p className="font-mono text-[10px] text-[#A3915F]">{prod.codigo_barras}</p>
                                    )}
                                </div>
                                <div className="mt-3 flex items-center justify-between">
                                    <span className="text-base font-black text-[#0E7C86]">
                                        ${formatMoney(prod.precio ?? prod.precio_venta)}
                                    </span>
                                    <span className="rounded-full bg-[#DFF3EF] p-1.5 text-[#0E7C86]">
                                        <Plus size={16} />
                                    </span>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* LADO DERECHO: PANEL DE DETALLE DE VENTA Y CARRITO */}
                <div className="flex flex-col justify-between rounded-2xl border border-[#F0E6C8] bg-white p-5 shadow-lg lg:col-span-5">
                    <div>
                        <div className="mb-4 space-y-2 border-b border-[#F1EAD5] pb-4">
                            <label className="block text-xs font-bold text-[#8A7A4E]">Cliente:</label>

                            <div className="flex items-center gap-2">
                                <div className="relative flex-1">
                                    <input
                                        type="text"
                                        value={clienteSearch}
                                        onChange={(e) => setClienteSearch(e.target.value)}
                                        onKeyDown={handleClienteSearchKeyDown}
                                        placeholder="Buscar por Cédula o Nombre..."
                                        className="w-full rounded-xl border border-[#E5DCC0] bg-[#FFFDF6] pl-3 pr-8 py-1.5 text-xs text-[#3F3A2E] outline-none"
                                    />
                                    {clienteSearch && (
                                        <button
                                            onClick={() => setClienteSearch('')}
                                            className="absolute right-2 top-2 text-[10px] font-bold text-[#A3915F]"
                                        >
                                            ✕
                                        </button>
                                    )}
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setShowClientModal(true)}
                                    className="rounded-xl bg-[#0E7C86] p-2 text-white transition hover:brightness-110"
                                    title="Registrar nuevo cliente"
                                >
                                    <UserPlus size={16} />
                                </button>
                            </div>

                            <select
                                value={clienteId}
                                onChange={(e) => setClienteId(e.target.value)}
                                className="w-full rounded-xl border border-[#E5DCC0] bg-[#FFFDF6] px-3 py-2 text-sm text-[#3F3A2E] outline-none"
                            >
                                {filteredClientes.map((c) => (
                                    <option key={c.id} value={c.id}>
                                        {c.nombre} {c.apellido} ({c.identificacion || 'Sin ID'})
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Listado de Items en Carrito */}
                        <div className="max-h-[300px] overflow-y-auto space-y-2 pr-1">
                            {cart.length === 0 ? (
                                <p className="py-12 text-center text-xs text-[#A3915F]">No hay productos en la venta actual.</p>
                            ) : (
                                cart.map((item, idx) => (
                                    <div key={idx} className="flex items-center justify-between rounded-xl bg-[#FFFBEF] p-3 text-xs border border-[#F1EAD5]">
                                        <div>
                                            <p className="font-bold text-[#2F2A20]">{item.nombre}</p>
                                            <p className="text-[#8A7A4E]">
                                                {item.tipo_venta === 'monto_exacto'
                                                    ? `Monto exacto ($${formatMoney(item.subtotal)})`
                                                    : `${formatMoney(item.cantidad)} x $${formatMoney(item.precio_unitario)}`}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className="font-extrabold text-[#0E7C86]">${formatMoney(item.subtotal)}</span>
                                            <button onClick={() => handleRemoveFromCart(idx)} className="text-red-500 hover:text-red-700">
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Resumen de Cobro, Método de Pago y Vuelto */}
                    <div className="space-y-3 border-t border-[#F1EAD5] pt-4 mt-4">
                        <div>
                            <label className="block mb-1 text-xs font-bold text-[#8A7A4E]">Método de Pago:</label>
                            <div className="grid grid-cols-3 gap-2">
                                <button
                                    type="button"
                                    onClick={() => setMetodoPago('efectivo')}
                                    className={`flex items-center justify-center gap-1.5 rounded-xl border py-2 text-xs font-bold ${
                                        metodoPago === 'efectivo'
                                            ? 'border-[#0E7C86] bg-[#DFF3EF] text-[#0E7C86]'
                                            : 'border-[#E5DCC0] bg-white text-[#7A6A45]'
                                    }`}
                                >
                                    <Banknote size={16} /> Efectivo
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setMetodoPago('transferencia')}
                                    className={`flex items-center justify-center gap-1.5 rounded-xl border py-2 text-xs font-bold ${
                                        metodoPago === 'transferencia'
                                            ? 'border-[#0E7C86] bg-[#DFF3EF] text-[#0E7C86]'
                                            : 'border-[#E5DCC0] bg-white text-[#7A6A45]'
                                    }`}
                                >
                                    <ArrowRightLeft size={16} /> Transf.
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setMetodoPago('credito')}
                                    className={`flex items-center justify-center gap-1.5 rounded-xl border py-2 text-xs font-bold ${
                                        metodoPago === 'credito'
                                            ? 'border-[#0E7C86] bg-[#DFF3EF] text-[#0E7C86]'
                                            : 'border-[#E5DCC0] bg-white text-[#7A6A45]'
                                    }`}
                                >
                                    <CreditCard size={16} /> Crédito
                                </button>
                            </div>
                        </div>

                        <div className="flex justify-between text-base font-black text-[#0E7C86]">
                            <span>TOTAL A PAGAR:</span>
                            <span>${formatMoney(totalGeneral)}</span>
                        </div>

                        {metodoPago === 'efectivo' && (
                            <div className="space-y-2">
                                <label className="block text-xs font-bold text-[#8A7A4E]">Dinero Entregado por el Cliente:</label>
                                <div className="relative">
                                    <span className="absolute left-3 top-2.5 text-gray-500 font-bold">$</span>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={montoEntregado}
                                        onChange={(e) => setMontoEntregado(e.target.value)}
                                        placeholder="0.00"
                                        className="w-full rounded-xl border border-[#E0D8C3] pl-7 pr-3 py-2 text-sm font-bold text-[#2F2A20] focus:border-[#0E7C86] focus:ring-[#0E7C86]"
                                    />
                                </div>

                                <div className="flex justify-between items-center bg-[#EBF7F7] p-3 rounded-xl border border-[#BCE3E5]">
                                    <span className="text-xs font-extrabold text-[#0E7C86]">VUELTO / CAMBIO:</span>
                                    <span className="text-lg font-black text-[#0E7C86]">${formatMoney(vueltoCalculado)}</span>
                                </div>
                            </div>
                        )}

                        <button
                            type="button"
                            onClick={handleProcesarVenta}
                            disabled={cart.length === 0 || (metodoPago === 'efectivo' && Number(montoEntregado) < totalGeneral)}
                            className="w-full rounded-xl bg-[#0E7C86] py-3 text-sm font-extrabold text-white shadow-md hover:bg-[#0B646C] disabled:opacity-50"
                        >
                            Completar Venta
                        </button>
                    </div>
                </div>
            </div>

            {/* MODALES */}
            {showProductModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
                    <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl">
                        <h3 className="text-lg font-extrabold text-[#0E7C86]">{selectedProduct?.nombre}</h3>
                        <p className="text-xs text-[#8A7A4E]">Precio unitario: ${formatMoney(selectedProduct?.precio ?? selectedProduct?.precio_venta)}</p>

                        <div className="my-4 grid grid-cols-3 gap-2">
                            <button
                                type="button"
                                onClick={() => setTipoVenta('unidad')}
                                className={`flex flex-col items-center gap-1 rounded-xl border p-2 text-[10px] font-bold uppercase ${
                                    tipoVenta === 'unidad' ? 'border-[#0E7C86] bg-[#DFF3EF] text-[#0E7C86]' : 'border-[#E5DCC0]'
                                }`}
                            >
                                <Package size={18} /> Unidad
                            </button>
                            <button
                                type="button"
                                onClick={() => setTipoVenta('peso')}
                                className={`flex flex-col items-center gap-1 rounded-xl border p-2 text-[10px] font-bold uppercase ${
                                    tipoVenta === 'peso' ? 'border-[#0E7C86] bg-[#DFF3EF] text-[#0E7C86]' : 'border-[#E5DCC0]'
                                }`}
                            >
                                <Scale size={18} /> Por Peso
                            </button>
                            <button
                                type="button"
                                onClick={() => setTipoVenta('monto_exacto')}
                                className={`flex flex-col items-center gap-1 rounded-xl border p-2 text-[10px] font-bold uppercase ${
                                    tipoVenta === 'monto_exacto' ? 'border-[#0E7C86] bg-[#DFF3EF] text-[#0E7C86]' : 'border-[#E5DCC0]'
                                }`}
                            >
                                <DollarSign size={18} /> Monto $
                            </button>
                        </div>

                        <input
                            type="number"
                            step="0.01"
                            value={inputValor}
                            onChange={(e) => setInputValor(e.target.value)}
                            placeholder={tipoVenta === 'monto_exacto' ? 'Ingrese el dinero ($)' : 'Ingrese la cantidad/peso'}
                            className="w-full rounded-xl border border-[#E5DCC0] bg-[#FFFDF6] px-4 py-2.5 text-sm font-bold outline-none"
                            autoFocus
                        />

                        <div className="mt-5 flex gap-2">
                            <button onClick={() => setShowProductModal(false)} className="w-1/2 rounded-full border py-2 text-xs font-bold text-[#7A6A45]">
                                Cancelar
                            </button>
                            <button onClick={handleAddToCart} className="w-1/2 rounded-full bg-[#0E7C86] py-2 text-xs font-bold text-white">
                                Agregar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showClientModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
                    <form onSubmit={handleSaveClientExpress} className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl space-y-3">
                        <h3 className="text-lg font-extrabold text-[#0E7C86]">Registro Rápido de Cliente</h3>
                        <input
                            type="text"
                            placeholder="Nombre"
                            value={clientForm.nombre}
                            onChange={(e) => setClientForm({ ...clientForm, nombre: e.target.value })}
                            className="w-full rounded-xl border border-[#E5DCC0] p-2.5 text-sm outline-none"
                            required
                        />
                        <input
                            type="text"
                            placeholder="Apellido"
                            value={clientForm.apellido}
                            onChange={(e) => setClientForm({ ...clientForm, apellido: e.target.value })}
                            className="w-full rounded-xl border border-[#E5DCC0] p-2.5 text-sm outline-none"
                        />
                        <input
                            type="text"
                            placeholder="Identificación / Cédula"
                            value={clientForm.identificacion}
                            onChange={(e) => setClientForm({ ...clientForm, identificacion: e.target.value })}
                            className="w-full rounded-xl border border-[#E5DCC0] p-2.5 text-sm outline-none"
                            required
                        />
                        <div className="flex gap-2 pt-2">
                            <button
                                type="button"
                                onClick={() => setShowClientModal(false)}
                                className="w-1/2 rounded-full border py-2 text-xs font-bold text-[#7A6A45]"
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                disabled={creatingClient}
                                className="w-1/2 rounded-full bg-[#0E7C86] py-2 text-xs font-bold text-white"
                            >
                                {creatingClient ? 'Guardando...' : 'Guardar Cliente'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {showCierreModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
                    <form onSubmit={handleCierreSubmit} className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl space-y-4">
                        <h3 className="text-lg font-extrabold text-red-600">Arqueo y Cierre de Caja</h3>

                        <div className="rounded-xl bg-[#FFFBEF] p-3 text-xs space-y-1.5 border border-[#F1EAD5]">
                            <div className="flex justify-between text-[#8A7A4E]">
                                <span>Apertura inicial:</span>
                                <span>${parseFloat(caja?.monto_apertura || 0).toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-[#8A7A4E]">
                                <span>Ventas en Efectivo:</span>
                                <span>${parseFloat(ventasEfectivoSum).toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between font-black text-[#2F2A20] border-t border-[#E5DCC0] pt-1">
                                <span>Monto Esperado en Caja:</span>
                                <span>${montoEsperado}</span>
                            </div>
                        </div>

                        <div>
                            <label className="mb-1 block text-xs font-bold text-[#8A7A4E]">Dinero Físico Real (Arqueo):</label>
                            <input
                                type="number"
                                step="0.01"
                                value={cierreData.monto_cierre}
                                onChange={(e) => setCierreData('monto_cierre', e.target.value)}
                                placeholder="0.00"
                                className="w-full rounded-xl border border-[#E5DCC0] p-2.5 text-sm font-bold outline-none"
                                required
                            />
                        </div>

                        {cierreData.monto_cierre && (
                            <div
                                className={`rounded-xl p-3 text-center text-xs font-extrabold ${
                                    parseFloat(diferenciaArqueo) < 0
                                        ? 'bg-red-50 text-red-600 border border-red-200'
                                        : 'bg-green-50 text-green-700 border border-green-200'
                                }`}
                            >
                                {parseFloat(diferenciaArqueo) < 0
                                    ? `FALTANTE DE: $${Math.abs(diferenciaArqueo).toFixed(2)}`
                                    : parseFloat(diferenciaArqueo) > 0
                                    ? `SOBRANTE DE: $${diferenciaArqueo}`
                                    : 'CUADRE EXACTO DE CAJA'}
                            </div>
                        )}

                        <textarea
                            placeholder="Observaciones / Desglose de Billetes"
                            value={cierreData.observaciones}
                            onChange={(e) => setCierreData('observaciones', e.target.value)}
                            className="w-full rounded-xl border border-[#E5DCC0] p-2.5 text-xs outline-none"
                            rows={3}
                        />

                        <div className="flex gap-2 pt-2">
                            <button
                                type="button"
                                onClick={() => setShowCierreModal(false)}
                                className="w-1/2 rounded-full border py-2 text-xs font-bold text-[#7A6A45]"
                            >
                                Volver al POS
                            </button>
                            <button
                                type="submit"
                                disabled={processingCierre}
                                className="w-1/2 rounded-full bg-red-600 py-2 text-xs font-bold text-white shadow-md hover:bg-red-700"
                            >
                                {processingCierre ? 'Cerrando...' : 'Confirmar Cierre'}
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
