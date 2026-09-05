// resources/js/Utils/printer.js

export async function imprimirTicketDirecto(venta) {
    if (!('serial' in navigator)) {
        alert('Tu navegador no soporta Web Serial API. Usa Google Chrome o Microsoft Edge.');
        return;
    }

    try {
        // 1. Conectar con la tiquetera por USB
        const port = await navigator.serial.requestPort();
        await port.open({ baudRate: 9600 }); // Baudrate estándar de POS-58

        const writer = port.writable.getWriter();
        const encoder = new TextEncoder();

        // 2. Definición de comandos ESC/POS básicos
        const ESC = '\x1B';
        const GS = '\x1D';

        let ticket = '';
        ticket += `${ESC}@`;          // Inicializar impresora
        ticket += `${ESC}a\x01`;      // Centrar texto
        ticket += `CABANA FRESHMANI\n`;
        ticket += `Ticket #${venta.id || ''}\n`;
        ticket += `--------------------------------\n`;

        ticket += `${ESC}a\x00`;      // Alineado a la izquierda
        if (venta.items && venta.items.length) {
            venta.items.forEach((item) => {
                ticket += `${item.nombre}\n`;
                ticket += `  ${item.cantidad_usuario || item.cantidad} x $${Number(item.precio_unitario).toFixed(2)} = $${Number(item.subtotal).toFixed(2)}\n`;
            });
        }

        ticket += `--------------------------------\n`;
        ticket += `${ESC}a\x02`;      // Alineado a la derecha
        ticket += `TOTAL: $${Number(venta.total).toFixed(2)}\n`;
        if (venta.pago_con) ticket += `PAGO CON: $${Number(venta.pago_con).toFixed(2)}\n`;
        if (venta.vuelto) ticket += `VUELTO: $${Number(venta.vuelto).toFixed(2)}\n`;

        ticket += `\n\n\n`;            // Salto para avance de papel
        ticket += `${GS}V\x41\x03`;   // Comando de corte parcial (si la máquina lo soporta)
        ticket += `${ESC}p\x00\x19\xFF`; // Comando para abrir cajón monedero automáticamente

        // 3. Enviar los bytes binarios directamente a la impresora
        await writer.write(encoder.encode(ticket));

        // 4. Liberar puerto
        writer.releaseLock();
        await port.close();
    } catch (error) {
        console.error('Error durante la impresión Serial:', error);
    }
}
