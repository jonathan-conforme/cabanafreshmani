import { useState, useMemo, useRef, useEffect } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { toast } from '@/Components/SweetAlert';
import { Search, Plus, Trash2, UserPlus, Lock, Scale, DollarSign, Package, Banknote, CreditCard, ArrowRightLeft } from 'lucide-react';
import axios from 'axios';

const formatMoney = (val) => (Number(val) || 0).toFixed(2);

// Helper para impresión en iframe invisible (Modo Kiosco)
const imprimirTicket = (ventaId) => {
    if (!ventaId) return;

    let iframe = document.getElementById('iframe-impresion');
    if (!iframe) {
        iframe = document.createElement('iframe');
        iframe.id = 'iframe-impresion';
        iframe.style.position = 'fixed';
        iframe.style.right = '0';
        iframe.style.bottom = '0';
        iframe.style.width = '0px';
        iframe.style.height = '0px';
        iframe.style.border = '0px';
        document.body.appendChild(iframe);
    }

    iframe.src = route('ventas.imprimir', ventaId);
};

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

    const handleOpenProduct = (product) => {
        setSelectedProduct(product);
        setTipoVenta(product.permite_unidad_mayor ? 'unidad_mayor' : 'cantidad');
        setInputValor('1');
        setShowProductModal(true);
    };

    const handleAddToCart = (e) => {
        e.preventDefault();
        const valor = parseFloat(inputValor);
        if (!valor || valor <= 0) return toast('Ingresa un valor válido', 'warning');

        const precioLb = Number(selectedProduct.precio_venta ?? selectedProduct.precio ?? 0);
        const tieneEmpaqueMayor = Boolean(selectedProduct.permite_unidad_mayor);
        const factorEmpaque = Number(selectedProduct.factor_conversion ?? 100);

        const precioEmpaque = tieneEmpaqueMayor && selectedProduct.precio_unidad_mayor
            ? Number(selectedProduct.precio_unidad_mayor)
            : precioLb * factorEmpaque;

        let cantidadEnLibras = 0;
        let subtotalAAgregar = 0;
        let precioUnitarioMostrado = 0;

        if (tipoVenta === 'quintal' || tipoVenta === 'saco_50' || tipoVenta === 'unidad_mayor') {
            cantidadEnLibras = valor * factorEmpaque;
            precioUnitarioMostrado = precioEmpaque;
            subtotalAAgregar = valor * precioEmpaque;
        } else if (tipoVenta === 'monto_exacto') {
            subtotalAAgregar = valor;
            precioUnitarioMostrado = precioLb;
            cantidadEnLibras = precioLb > 0 ? valor / precioLb : 0;
        } else {
            cantidadEnLibras = valor;
            precioUnitarioMostrado = precioLb;
            subtotalAAgregar = valor * precioLb;
        }

        setCart((prevCart) => {
            const existingIndex = prevCart.findIndex(
                (item) => item.producto_id === selectedProduct.id && item.tipo_venta === tipoVenta
            );

            if (existingIndex !== -1) {
                const updatedCart = [...prevCart];
    const existingItem = updatedCart[existingIndex];

    const nuevaCantidadUsuario = existingItem.cantidad_usuario + valor;
    const nuevaCantidadLibras = existingItem.cantidad + cantidadEnLibras; // <-- CORREGIDO
    const nuevoSubtotal = existingItem.subtotal + subtotalAAgregar;

    updatedCart[existingIndex] = {
        ...existingItem,
        cantidad_usuario: nuevaCantidadUsuario,
        cantidad: nuevaCantidadLibras, // <-- Asignar la cantidad en libras
        subtotal: nuevoSubtotal,
    };

                return updatedCart;
            } else {
                const newItem = {
                    producto_id: selectedProduct.id,
                    nombre: selectedProduct.nombre,
                    tipo_venta: tipoVenta,
                    cantidad_usuario: valor,
                    cantidad: cantidadEnLibras,
                    precio_unitario: precioUnitarioMostrado,
                    subtotal: subtotalAAgregar,
                };
                return [...prevCart, newItem];
            }
        });

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
                onSuccess: (page) => {
                    setCart([]);
                    setDescuento(0);
                    setMontoEntregado('');
                    setSearch('');
                    setClienteSearch('');

                    toast('¡Venta realizada con éxito!', 'success');

                    const ventaId = page.props.flash?.venta_id;
                    if (ventaId) {
                        imprimirTicket(ventaId);
                    }

                    setTimeout(() => {
                        searchInputRef.current?.focus();
                    }, 50);
                },
                onError: (errors) => {
            // Muestra el mensaje de stock insuficiente capturado desde Laravel
            const mensajeError = errors.stock || 'No se pudo procesar la venta.';
            toast(mensajeError, 'error');
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
            header={<h2 className="text-xl font-bold text-[#0E7C86]">Módulo POS / Ventas</h2>}
            actions={
                <button
                    onClick={() => setShowCierreModal(true)}
                    className="flex items-center gap-2 whitespace-nowrap rounded-full border border-red-200 bg-red-50 px-4 py-2 text-xs font-bold text-red-600 transition hover:bg-red-100"
                >
                    <Lock size={16} /> Cerrar Caja Activa
                </button>
            }
        >
            <Head title="POS Venta" />

            <div className="grid grid-cols-1 gap-6 p-4 lg:h-full lg:min-h-0 lg:grid-cols-12 lg:grid-rows-[minmax(0,1fr)] lg:overflow-hidden lg:p-6">
                {/* LADO IZQUIERDO: CATÁLOGO DE PRODUCTOS (7 COLS) */}
                <div className="flex flex-col lg:col-span-7 lg:h-full lg:min-h-0">
                    <div className="mb-4 flex shrink-0 items-center gap-3 rounded-2xl bg-white p-3 border border-[#F0E6C8] shadow-sm">
                        <Search className="text-[#A3915F]" size={20} />
                        <input
                            ref={searchInputRef}
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            onKeyDown={handleProductKeyDown}
                            placeholder="Buscar o escanear código de barras..."
                            className="w-full bg-transparent text-sm outline-none placeholder:text-[#A3915F]"
                        />
                    </div>

                    <div className="scrollbar-fina grid max-h-[60vh] grid-cols-2 content-start gap-3 overflow-y-auto pb-1 pr-2 sm:grid-cols-3 lg:max-h-none lg:min-h-0 lg:flex-1">
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

               {/* LADO DERECHO: PANEL DE COBRO INTEGRADO */}
<div className="flex flex-col justify-between rounded-2xl border border-[#F0E6C8] bg-white p-4 shadow-lg lg:col-span-5 lg:h-full lg:min-h-0 lg:overflow-hidden">

    {/* 1. CABECERA: SELECCIÓN DE CLIENTE COMPACTA */}
    <div className="shrink-0 pb-3 border-b border-[#F1EAD5] space-y-2">
        <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-[#8A7A4E]">Cliente Seleccionado</label>
            <button
                type="button"
                onClick={() => setShowClientModal(true)}
                className="flex items-center gap-1 text-xs font-bold text-[#0E7C86] hover:underline"
            >
                <UserPlus size={14} /> + Nuevo
            </button>
        </div>

        {/* Unificación de Búsqueda y Selector en una sola fila */}
        <div className="flex gap-2">
            <input
                type="text"
                value={clienteSearch}
                onChange={(e) => setClienteSearch(e.target.value)}
                onKeyDown={handleClienteSearchKeyDown}
                placeholder="Cédula / Nombre..."
                className="w-1/2 rounded-xl border border-[#E5DCC0] bg-[#FFFDF6] px-3 py-1.5 text-xs outline-none focus:border-[#0E7C86]"
            />
            <select
                value={clienteId}
                onChange={(e) => setClienteId(e.target.value)}
                className="w-1/2 rounded-xl border border-[#E5DCC0] bg-[#FFFDF6] px-2 py-1.5 text-xs text-[#3F3A2E] outline-none"
            >
                {filteredClientes.map((c) => (
                    <option key={c.id} value={c.id}>
                        {c.nombre} {c.apellido}
                    </option>
                ))}
            </select>
        </div>
    </div>

    {/* 2. CENTRO: LISTA DEL CARRITO (OCUPA TODO EL ESPACIO RESTANTE) */}
    <div className="flex-1 min-h-0 my-3 overflow-y-auto scrollbar-fina space-y-2 pr-1">
        {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-[#A3915F] text-xs">
                <Package size={32} className="mb-2 opacity-50" />
                <p>Carrito vacío</p>
            </div>
        ) : (
            cart.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between rounded-xl bg-[#FFFBEF] p-2.5 text-xs border border-[#F1EAD5]">
                    <div className="truncate pr-2">
                        <p className="font-bold text-[#2F2A20] truncate">{item.nombre}</p>
                        <p className="text-[11px] text-[#8A7A4E]">
                            {item.cantidad_usuario}x @ ${formatMoney(item.precio_unitario)}
                        </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                        <span className="font-extrabold text-[#0E7C86]">${formatMoney(item.subtotal)}</span>
                        <button onClick={() => handleRemoveFromCart(idx)} className="text-red-400 hover:text-red-600">
                            <Trash2 size={15} />
                        </button>
                    </div>
                </div>
            ))
        )}
    </div>

    {/* 3. PIE: TOTAL Y MÉTODOS DE PAGO (SIEMPRE VISIBLE) */}
    <div className="shrink-0 border-t border-[#F1EAD5] pt-3 space-y-3 bg-white">

        {/* Selector de Método de Pago */}
        <div className="grid grid-cols-3 gap-1.5">
            {[
                { id: 'efectivo', label: 'Efectivo', icon: Banknote },
                { id: 'transferencia', label: 'Transf.', icon: ArrowRightLeft },
                { id: 'credito', label: 'Crédito', icon: CreditCard }
            ].map((m) => (
                <button
                    key={m.id}
                    type="button"
                    onClick={() => setMetodoPago(m.id)}
                    className={`flex items-center justify-center gap-1 rounded-xl border py-1.5 text-xs font-bold transition-all ${
                        metodoPago === m.id
                            ? 'border-[#0E7C86] bg-[#DFF3EF] text-[#0E7C86]'
                            : 'border-[#E5DCC0] bg-white text-[#7A6A45]'
                    }`}
                >
                    <m.icon size={14} /> {m.label}
                </button>
            ))}
        </div>

        {/* Input de Efectivo y Vuelto si aplica */}
        {metodoPago === 'efectivo' && (
            <div className="grid grid-cols-2 gap-2 bg-[#EBF7F7] p-2 rounded-xl border border-[#BCE3E5]">
                <div>
                    <label className="block text-[10px] font-bold text-[#0E7C86] uppercase">Paga Con ($):</label>
                    <input
                        type="number"
                        step="0.01"
                        value={montoEntregado}
                        onChange={(e) => setMontoEntregado(e.target.value)}
                        placeholder="0.00"
                        className="w-full rounded-lg border border-[#BCE3E5] bg-white px-2 py-1 text-xs font-bold text-[#2F2A20] outline-none"
                    />
                </div>
                <div className="flex flex-col justify-center text-right">
                    <span className="text-[10px] font-bold text-[#0E7C86] uppercase">Vuelto:</span>
                    <span className="text-sm font-black text-[#0E7C86]">${formatMoney(vueltoCalculado)}</span>
                </div>
            </div>
        )}

        {/* Bloque Total A Pagar */}
        <div className="flex justify-between items-center bg-[#2F2A20] text-white p-3 rounded-xl shadow-inner">
            <span className="text-xs font-bold uppercase tracking-wider text-[#DFF3EF]">Total a Cobrar</span>
            <span className="text-xl font-black text-white">${formatMoney(totalGeneral)}</span>
        </div>

        {/* Botón de Acción Principal */}
        <button
            type="button"
            onClick={handleProcesarVenta}
            disabled={cart.length === 0 || (metodoPago === 'efectivo' && Number(montoEntregado) < totalGeneral)}
            className="w-full rounded-xl bg-[#0E7C86] py-3 cursor-pointer text-xs font-extrabold uppercase tracking-wider text-white shadow-md hover:bg-[#0B646C] disabled:opacity-40 transition-all"
        >
            Completar Venta
        </button>
    </div>
</div>
            </div>

            {/* MODAL DE AGREGAR PRODUCTO */}
            {showProductModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
                    <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl">
                        <h3 className="text-lg font-extrabold text-[#0E7C86]">{selectedProduct?.nombre}</h3>
                        <p className="text-xs text-[#8A7A4E]">
                            Precio unitario/lb: ${formatMoney(selectedProduct?.precio ?? selectedProduct?.precio_venta)}
                        </p>

                        <div className="my-4 grid grid-cols-2 gap-2">
                            <button
                                type="button"
                                onClick={() => setTipoVenta('cantidad')}
                                className={`rounded-xl border p-2 text-xs font-bold ${
                                    tipoVenta === 'cantidad'
                                        ? 'border-[#0E7C86] bg-[#DFF3EF] text-[#0E7C86]'
                                        : 'border-[#E5DCC0]'
                                }`}
                            >
                                Unidad / Libra (Lb)
                            </button>

                            <button
                                type="button"
                                onClick={() => setTipoVenta('monto_exacto')}
                                className={`rounded-xl border p-2 text-xs font-bold ${
                                    tipoVenta === 'monto_exacto'
                                        ? 'border-[#0E7C86] bg-[#DFF3EF] text-[#0E7C86]'
                                        : 'border-[#E5DCC0]'
                                }`}
                            >
                                Monto ($)
                            </button>

                            {Boolean(selectedProduct?.permite_unidad_mayor) && (
                                <button
                                    type="button"
                                    onClick={() => setTipoVenta('unidad_mayor')}
                                    className={`col-span-2 rounded-xl border p-2.5 text-xs font-bold ${
                                        tipoVenta === 'unidad_mayor' || tipoVenta === 'quintal'
                                            ? 'border-[#0E7C86] bg-[#DFF3EF] text-[#0E7C86]'
                                            : 'border-[#E5DCC0]'
                                    }`}
                                >
                                    {selectedProduct?.nombre_unidad_mayor || 'Unidad Mayor'} ({Number(selectedProduct?.factor_conversion || 100)} Lb)
                                </button>
                            )}
                        </div>

                        <div className="space-y-1">
                            <label className="text-[11px] font-bold text-[#8A7A4E]">
                                {tipoVenta === 'monto_exacto' ? 'Ingrese el dinero a vender ($):' : 'Ingrese la cantidad (Unidades / Lbs / Kg):'}
                            </label>
                            <input
                                type="number"
                                step="0.01"
                                min="0.01"
                                value={inputValor}
                                onChange={(e) => setInputValor(e.target.value)}
                                placeholder={tipoVenta === 'monto_exacto' ? 'Ej: 5.00' : 'Ej: 1 o 2.5'}
                                className="w-full rounded-xl border border-[#E5DCC0] bg-[#FFFDF6] px-4 py-2.5 text-sm font-bold text-[#2F2A20] outline-none focus:border-[#0E7C86]"
                                autoFocus
                            />
                        </div>

                        <div className="mt-5 flex gap-2">
                            <button
                                type="button"
                                onClick={() => setShowProductModal(false)}
                                className="w-1/2 rounded-full border border-[#E5DCC0] py-2 text-xs font-bold text-[#7A6A45] hover:bg-gray-50"
                            >
                                Cancelar
                            </button>
                            <button
                                type="button"
                                onClick={handleAddToCart}
                                className="w-1/2 rounded-full bg-[#0E7C86] py-2 text-xs font-bold text-white shadow-md hover:bg-[#0B646C]"
                            >
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
                                className={`rounded-xl p-3 text-center text-xs font-extrabold ${parseFloat(diferenciaArqueo) < 0
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
