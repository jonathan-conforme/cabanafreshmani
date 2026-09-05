<!DOCTYPE html>
<html lang="es">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Ticket - {{ $empresa->nombre ?? 'Mi Empresa' }}</title>
    <style>
        /* Reset completo para impresión */
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
            font-family: 'Courier New', monospace;
            print-color-adjust: exact;
        }

        body {
            width: 58mm;
            margin: 0 !important;
            padding: 1mm !important;
            font-size: 12px;
            line-height: 1.2;
            color: #000;
            background: #fff;
            font-weight: bold;
        }

        .ticket {
            width: 100%;
            max-width: 56mm;
            margin-top: 0 !important;
            padding-top: 0 !important;

        }

        .text-center {
            text-align: center;
        }

        .text-right {
            text-align: right;
        }

        .text-left {
            text-align: left;
        }

        .bold {
            font-weight: bold;
        }

        .divider {
            border-top: 1px dashed #000;
            margin: 2px 0;
            width: 100%;
        }

        table {
            width: 100%;
            border-collapse: collapse;
            table-layout: fixed;
        }

        th,
        td {
            padding: 2px 1px;
            vertical-align: top;
            line-height: 1.1;
        }

        .col-producto {
            width: 40%;
            text-align: left;
            /* más consistente */
            padding-right: 5px;
            /* un poco de espacio a la derecha */
        }

        .col-cantidad {
            width: 20%;
            /* más ancho que antes */
            text-align: left;
            padding-right: 9px;
        }

        .col-punit {
            width: 20%;
            /* más ancho que antes */
            text-align: right;
            padding-right: 5px;
        }

        .col-total {
            width: 20%;
            /* se ajusta el resto */
            text-align: right;
        }


        .header {
            margin-bottom: 5px;
            text-align: center;
        }

        .footer {
            margin-top: 2px;
            text-align: center;
        }

        /* Mantiene el tamaño original del logo */
        .header img {
            width: 225px;
            object-fit: contain;
            border-radius: 50%;
            display: block;
            margin: 0 auto;
        }

        /* Evita espacio arriba y abajo del logo */
        .header div[style*="width:120px"] {
            margin: 0;
            height: auto;
        }

        @media print {
            body {
                width: 58mm;
                margin: 0 !important;
                padding: 0 !important;
                font-size: 12px;
                transform: translateY(-5mm);
            }

            .ticket {
                width: 56mm;
                padding: 0 !important;
                page-break-after: always;
            }

           @page {
    margin-top: 0px !important;
    margin-bottom: 0px !important;
    margin-left: 0px !important;
    margin-right: 0px !important;
}

            .no-print {
                display: none;
            }
        }
    </style>
</head>

<body>
@if($empresa && $empresa->logo)
    <div style="text-align:center; margin-bottom:5px;">

            <img src="{{ public_path('storage/' . $empresa->logo) }}"

            width="150"
            style="display:block; margin:0 auto;"
        >
    </div>
@endif




            <div class="divider"></div>
            <div class="text-left">Dirección: {{ $empresa->matriz ?? 'Dirección no especificada' }}</div>
            <div class="text-left">RUC: {{ $empresa->ruc ?? '0000000000001' }}</div>
            <div class="text-left">Telf: {{ $empresa->telefono ?? 'N/A' }}</div>


            <div class="divider"></div>

            <!-- Información de la venta -->
            <div class="text-left">
                <div class="bold">Factura: {{ $sale->sale_number }}</div>
                <div class="bold"><strong>Cliente:</strong> {{ $sale->customer->name ?? 'Consumidor Final' }}</div>
                <div class="bold"><strong>RUC/CI:</strong> {{ $sale->customer->cedula ?? '9999999999' }}</div>
                <div class="bold"><strong>Fecha:</strong> {{ $sale->created_at->format('d-m-Y') }}</div>
                <div class="bold"><strong>Hora:</strong> {{ $sale->created_at->format('H:i') }}</div>
                <div class="bold"><strong>Vendedor:</strong> {{ $sale->createdBy->name ?? 'Sistema' }}</div>
            </div>
        </div>

        <div class="divider"></div>

        <!-- Tabla de productos -->
        <table>
            <thead>
                <tr>
                    <th class="text-left col-producto">Producto</th>
                    <th class="text-left col-cantidad">Cant</th>
                    <th class="text-left col-punit">P.Unit</th>
                    <th class="text-left col-total">Total</th>
                </tr>
            </thead>
            <tbody>
                @foreach($sale->items as $item)
                <tr>
                    <td class="text-center col-producto">{{ $item->product->name ?? 'Producto' }}</td>
                    <td class="text-center ">{{ $item->quantity }}</td>
                    <td class="text-center col-punit">${{ number_format($item->price_per_unit, 2) }}</td>
                    <td class="text-center col-total">${{ number_format($item->subtotal, 2) }}</td>
                </tr>
                @endforeach
            </tbody>
        </table>

        <div class="divider"></div>

        <!-- Totales -->
        <table>
            <tr>
                <td class="text-left">Subtotal:</td>
                <td class="text-right">${{ number_format($sale->subtotal, 2) }}</td>
            </tr>
            <tr>
                <td class="text-left">IVA (15%):</td>
                <td class="text-right">$ 0.00</td>
            </tr>
            @if($sale->discount > 0)
            <tr>
                <td class="text-left">Descuento:</td>
                <td class="text-right">-${{ number_format($sale->discount, 2) }}</td>
            </tr>
            @endif
            <tr class="bold">
                <td class="text-left">TOTAL:</td>
                <td class="text-right">${{ number_format($sale->subtotal, 2) }}</td>
            </tr>
            <tr>
                <td class="text-left">Método Pago:</td>
                <td class="text-right">
                    @if($sale->payment_type === 'cash') EFECTIVO
                    @elseif($sale->payment_type === 'credit') CRÉDITO
                    @elseif($sale->payment_type === 'transfer') TRANSFERENCIA
                    @else TARJETA @endif
                </td>
            </tr>
        </table>
@if($sale->payment_type === 'credit')
    <div class="divider"></div>
    <div class="text-center bold">DETALLE DE ABONOS</div>

    <!-- AVISO DE INTERÉS POR MORA -->
    @if($remaining > 0)
        <div class="text-center bold">
            Este crédito genera intereses por mora si no se paga dentro de la fecha acordada.
    </div>
    @endif

    <table>
        <thead>
            <tr>
                <th class="text-left">Fecha</th>
                <th class="text-right">Monto</th>
            </tr>
        </thead>
        <tbody>
            @foreach($sale->payments as $payment)
            <tr>
                <td>{{ $payment->created_at->format('d-m-Y') }}</td>
                <td class="text-right">${{ number_format($payment->amount, 2) }}</td>
            </tr>
            @endforeach
        </tbody>
    </table>

    <table>
        <tr>
            <td class="text-left">Total Abonado:</td>
            <td class="text-right">${{ number_format($totalPaid, 2) }}</td>
        </tr>
    </table>

    <div class="text-left bold">Saldo Pendiente: ${{ number_format($remaining, 2) }}</div>
@endif

        <br>
        <div class="divider"></div>

        <!-- Pie -->
        <div class="footer">
            <div>*Gracias por su compra*</div>

            <!-- Código de barras con número de venta -->
            <img src="https://barcodeapi.org/api/code128/{{ $sale->sale_number }}"
                alt="Barcode" style="width:200px; height:50px;">
        </div>
    </div>



</body>

</html>
