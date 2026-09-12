import EscPosEncoder from 'esc-pos-encoder';

// Variable global en memoria para reutilizar el canal USB
let cachedUsbDevice = null;

const obtenerDispositivoUSB = async () => {
    if (cachedUsbDevice && cachedUsbDevice.opened) {
        return cachedUsbDevice;
    }

    let device = (await navigator.usb.getDevices())[0];

    if (!device) {
        device = await navigator.usb.requestDevice({ filters: [] });
    }

    if (!device.opened) {
        await device.open();
        if (device.configuration === null) {
            await device.selectConfiguration(1);
        }
        await device.claimInterface(0);
    }

    cachedUsbDevice = device;
    return device;
};

export const imprimirTicketDirecto = async (venta, empresa = {}) => {
    try {
        if (!venta) return;

        // 1. Obtener la conexión USB (reutilizada e instantánea)
        const device = await obtenerDispositivoUSB();

        // 2. Construir la estructura del ticket en comandos ESC/POS
        const encoder = new EscPosEncoder();

        let encoderBuffer = encoder
            .initialize()
            .align('left')
            .bold(true)
            .line(empresa.nombre_comercial || empresa.razon_social || 'CABANA FRESHMANI')
            .bold(false)
            .line(`RUC: ${empresa.ruc || ''}`)
            .line(empresa.direccion_matriz || '')
            .line(`Tel: ${empresa.telefono || ''}`)
            .line('--------------------------------')
            .align('left')
            .bold(true)
            .line(venta.numero_factura ? `FACTURA N°: ${venta.numero_factura}` : `COMPROBANTE N°: #${String(venta.id).padStart(8, '0')}`)
            .bold(false)
            .line(`Fecha: ${new Date(venta.created_at || Date.now()).toLocaleString('es-EC')}`)
            .line(`Cliente: ${venta.cliente ? `${venta.cliente.nombre || ''} ${venta.cliente.apellido || ''}`.trim() : 'Consumidor Final'}`)
            .line(`Pago: ${venta.metodo_pago ? venta.metodo_pago.toUpperCase() : 'EFECTIVO'}`)
            .line('--------------------------------');

        // Detalle de productos
        if (venta.detalles && venta.detalles.length > 0) {
            venta.detalles.forEach((det) => {
                const nombre = det.producto?.nombre || 'Producto';
                const simboloUnidad = det.producto?.unidad?.simbolo 
                           || det.producto?.unidad?.nombre 
                           || det.producto?.unidad?.abreviatura 
                           || '';
                const cant = Number(det.cantidad || 0).toFixed(2);
                const precio = Number(det.precio_unitario || 0).toFixed(2);
                const subtotal = Number(det.subtotal || 0).toFixed(2);
                const textoCantidad = simboloUnidad ? `${cant} ${simboloUnidad}` : `${cant}`;
                

                encoderBuffer
                    .bold(true)
                    .line(nombre)
                    .bold(false)
                    .line(`${textoCantidad} x $${precio} = $${subtotal}`);
            });
        }

        // Totales y Créditos
        encoderBuffer
            .line('--------------------------------')
            .align('left')
            .bold(true)
            .line(`TOTAL VENTA: $${Number(venta.total || 0).toFixed(2)}`)
            .bold(false);

        if (venta.metodo_pago === 'credito') {
            const totalAbonado = venta.pagos ? venta.pagos.reduce((acc, p) => acc + Number(p.monto || 0), 0) : 0;
            const saldo = Math.max(0, Number(venta.total || 0) - totalAbonado);

            // Historial de abonos
            if (venta.pagos && venta.pagos.length > 0) {
                encoderBuffer
                    .line('--------------------------------')
                    .align('left')
                    .bold(true)
                    .line('HISTORIAL DE ABONOS')
                    .bold(false);

                venta.pagos.forEach((pago, index) => {
                    const fechaStr = pago.created_at 
                        ? new Date(pago.created_at).toLocaleDateString('es-EC', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                          })
                        : new Date().toLocaleDateString('es-EC');

                    const numAbono = `${index + 1}°`.padEnd(3, ' ');
                    const montoStr = `$${Number(pago.monto || 0).toFixed(2)}`;

                    encoderBuffer.line(`${numAbono} ${fechaStr}  ${montoStr}`);
                });
            }

            encoderBuffer
                .line('--------------------------------')
                .align('left')
                .line(`Total Abonado: $${totalAbonado.toFixed(2)}`)
                .bold(true)
                .line(`PENDIENTE: $${saldo.toFixed(2)}`)
                .bold(false);
        } else {
            encoderBuffer
                .line(`Pago con: $${Number(venta.pago_con || venta.total || 0).toFixed(2)}`)
                .line(`Vuelto: $${Number(venta.vuelto || 0).toFixed(2)}`);
        }

        // Pie de página y corte
        const resultBytes = encoderBuffer
            .line('--------------------------------')
            .align('left')
            .line(empresa.leyenda_ticket || '¡Gracias por su compra!')
            .newline()
            .newline()
            .cut()
            .encode();

        // 3. Enviar directo al endpoint de salida USB
        const endpoint = device.configuration.interfaces[0].alternate.endpoints.find(
            (e) => e.direction === 'out'
        );

        await device.transferOut(endpoint.endpointNumber, resultBytes);

    } catch (error) {
        console.error('Error al imprimir por WebUSB:', error);
        cachedUsbDevice = null; // Reiniciar estado en caso de error o desconexión
        alert('No se pudo conectar a la impresora térmica USB. Revisa la conexión o el driver Zadig.');
    }
};