<!DOCTYPE html>
<html lang="es">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{ $venta->numero_factura ? 'Factura_'.$venta->numero_factura : 'Ticket_'.$venta->id }}</title>
    <style>
        /* Reset completo e impresión */
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            font-family: 'Courier New', monospace;
        }

        body {
            width: 58mm;
            margin: 0 !important;
            padding: 2mm 1mm 1mm 1mm !important;
            font-size: 11px;
            line-height: 1.2;
            color: #000;
            background: #fff;
            font-weight: bold;
        }

        .ticket {
            width: 100%;
            max-width: 56mm;
            margin: 0 auto;
            padding-top: 2px;
        }

        .text-center { text-align: center; }
        .text-right { text-align: right; }
        .text-left { text-align: left; }
        .bold { font-weight: bold; }

        .divider {
            border-top: 1px dashed #000;
            margin: 3px 0;
            width: 100%;
        }

        table {
            width: 100%;
            border-collapse: collapse;
            table-layout: fixed;
        }

        th, td {
            padding: 2px 1px;
            vertical-align: top;
            line-height: 1.1;
            word-wrap: break-word;
            overflow-wrap: break-word;
        }

        .col-producto { width: 40%; text-align: left; padding-right: 2px; }
        .col-cantidad { width: 20%; text-align: left; }
        .col-punit { width: 20%; text-align: right; }
        .col-total { width: 20%; text-align: right; }

        .clave-acceso {
            font-size: 8px;
            word-break: break-all;
            line-height: 1.0;
            margin-top: 2px;
        }

        .logo {
            max-width: 140px;
            max-height: 60px;
            width: auto;
            height: auto;
            display: block;
            margin: 4px auto 3px auto;
        }

        @media print {
            body {
                width: 58mm;
                margin: 0 !important;
                padding: 2mm 0 0 0 !important;
                font-size: 11px;
                transform: none !important;
            }

            .ticket {
                width: 56mm;
                padding-top: 2px !important;
                page-break-after: always;
            }

            @page {
                margin: 0px !important;
            }

            .no-print {
                display: none;
            }
        }
    </style>
</head>

<body>
    <div class="ticket">

        <div class="text-center">
            <!-- LOGO Y ENCABEZADO EMPRESA -->
          @php
    $logoPath = public_path('images/cabana-fresh-mani-logo.png');
    $logoBase64 = file_exists($logoPath) ? 'data:image/png;base64,' . base64_encode(file_get_contents($logoPath)) : null;
@endphp

@if($logoBase64)
    <img src="{{ $logoBase64 }}" alt="Logo" class="logo">
@endif

            <div class="bold" style="font-size: 12px;">{{ $empresa->nombre_comercial ?? $empresa->razon_social ?? 'CABANA FRESHMANI' }}</div>
            @if(!empty($empresa->razon_social) && $empresa->razon_social !== $empresa->nombre_comercial)
                <div>{{ $empresa->razon_social }}</div>
            @endif
            @if(!empty($empresa->ruc)) <div>RUC: {{ $empresa->ruc }}</div> @endif
            @if(!empty($empresa->direccion_matriz)) <div>{{ $empresa->direccion_matriz }}</div> @endif
            @if(!empty($empresa->telefono)) <div>Tel: {{ $empresa->telefono }}</div> @endif
            @if(!empty($empresa->contribuyente_especial)) <div>Res. N°: {{ $empresa->contribuyente_especial }}</div> @endif
            @if(isset($empresa->obligado_contabilidad)) <div>Obligado a llevar contabilidad: {{ $empresa->obligado_contabilidad ? 'SI' : 'NO' }}</div> @endif
        </div>

        <!-- BANNER AVISO MODO LOCAL / PRUEBAS -->
        @if(($empresa->ambiente_sri ?? '0') === '0')
            <div class="divider"></div>
            <div class="text-center bold" style="font-size: 10px; border: 1px solid #000; padding: 3px 1px; margin: 3px 0;">
                *** DOCUMENTO SIN VALOR TRIBUTARIO ***<br>
                COMPROBANTE INTERNO DE PRUEBAS
            </div>
        @endif

        <div class="divider"></div>

        <!-- DATOS DEL COMPROBANTE -->
        <div class="text-center">
            @if(!empty($venta->numero_factura) && ($empresa->ambiente_sri ?? '0') !== '0')
                <div class="bold" style="font-size: 12px;">FACTURA N°: {{ $venta->numero_factura }}</div>
            @else
                <div class="bold" style="font-size: 12px;">TICKET INTERNO N°: {{ str_pad($venta->id, 8, '0', STR_PAD_LEFT) }}</div>
            @endif
            <div>Fecha: {{ $venta->created_at->format('d/m/Y H:i') }}</div>
        </div>

        <div class="divider"></div>

        <!-- DATOS DEL CLIENTE Y CAJERO -->
        <div class="text-left">
            <div><strong>Cliente:</strong> {{ isset($venta->cliente) ? trim($venta->cliente->nombre . ' ' . ($venta->cliente->apellido ?? '')) : 'Consumidor Final' }}</div>
            @if(!empty($venta->cliente->identificacion)) <div><strong>RUC/CI:</strong> {{ $venta->cliente->identificacion }}</div> @endif
            @if(!empty($venta->cliente->email)) <div><strong>Correo:</strong> {{ $venta->cliente->email }}</div> @endif
            @if(!empty($venta->cliente->direccion)) <div><strong>Dir:</strong> {{ $venta->cliente->direccion }}</div> @endif
            <div><strong>Cajero:</strong> {{ $venta->user->name ?? 'Administrador' }}</div>
        </div>

        <div class="divider"></div>

        <!-- TABLA DE PRODUCTOS -->
        <table>
            <thead>
                <tr>
                    <th class="col-producto">Producto</th>
                    <th class="col-cantidad"></th>
                    <th class="col-punit">P.U</th>
                    <th class="col-total">Total</th>
                </tr>
            </thead>
            <tbody>
                @foreach($venta->detalles as $detalle)
                <tr>
                    <td colspan="4" class="bold" style="padding-top: 3px;">
                        {{ $detalle->producto->nombre }}
                    </td>
                </tr>
                <tr>
                    <td colspan="2">
                        {{ number_format($detalle->cantidad, 2) }} ({{ $detalle->producto->unidad->nombre ?? 'unid' }})
                    </td>
                    <td class="text-right">${{ number_format($detalle->precio_unitario, 2) }}</td>
                    <td class="text-right">${{ number_format($detalle->subtotal, 2) }}</td>
                </tr>
                @endforeach
            </tbody>
        </table>

        <div class="divider"></div>

        <!-- TOTALES -->
        <table>
            <tr class="bold">
                <td class="text-left">TOTAL VENTA:</td>
                <td class="text-right">${{ number_format($venta->total, 2) }}</td>
            </tr>
            @if($venta->metodo_pago === 'credito')
                @php
                    $totalAbonado = $venta->pagos->sum('monto');
                    $saldoPendiente = max(0, $venta->total - $totalAbonado);
                @endphp
                <tr>
                    <td class="text-left">Total Abonado:</td>
                    <td class="text-right">${{ number_format($totalAbonado, 2) }}</td>
                </tr>
                <tr class="bold">
                    <td class="text-left">SALDO PENDIENTE:</td>
                    <td class="text-right">${{ number_format($saldoPendiente, 2) }}</td>
                </tr>
            @else
                <tr>
                    <td class="text-left">Pago con:</td>
                    <td class="text-right">${{ number_format($venta->pago_con ?? $venta->total, 2) }}</td>
                </tr>
                <tr>
                    <td class="text-left">Vuelto:</td>
                    <td class="text-right">${{ number_format($venta->vuelto ?? 0, 2) }}</td>
                </tr>
            @endif
        </table>

        <!-- HISTORIAL DE ABONOS (SI ES VENTA A CRÉDITO) -->
        @if($venta->pagos && $venta->pagos->count() > 0)
            <div class="divider"></div>
            <div class="text-center bold">HISTORIAL DE ABONOS</div>
            <div class="divider"></div>

            <table>
                <thead>
                    <tr>
                        <th class="text-left">Abono</th>
                        <th class="text-right">Monto</th>
                    </tr>
                </thead>
                <tbody>
                    @foreach($venta->pagos as $pago)
                    <tr>
                        <td class="text-left">
                            {{ $loop->iteration }}° ({{ $pago->created_at->format('d/m/Y') }})
                        </td>
                        <td class="text-right">${{ number_format($pago->monto, 2) }}</td>
                    </tr>
                    @endforeach
                </tbody>
            </table>
        @endif

        <!-- CLAVE DE ACCESO SRI O MODO LOCAL -->
        @if(!empty($venta->clave_acceso) && ($empresa->ambiente_sri ?? '0') !== '0')
            <div class="divider"></div>
            <div class="text-center">
                <div class="bold">CLAVE DE ACCESO / SRI:</div>
                <div class="clave-acceso">{{ $venta->clave_acceso }}</div>
                <div>Estado: {{ strtoupper($venta->sri_estado ?? 'PENDIENTE') }}</div>
                <div class="bold">[ MODO LOCAL / PRUEBA ]</div>
                <div>Comprobante no enviado al SRI.</div>
            </div>
        @elseif(($empresa->ambiente_sri ?? '0') === '0')
            <div class="divider"></div>
            <div class="text-center" style="font-size: 9px; margin-top: 2px;">
                <div class="bold">[ MODO LOCAL / PRUEBA ]</div>
                <div>Comprobante no enviado al SRI.</div>
            </div>
        @endif

        <div class="divider"></div>

        <!-- PIE DE PÁGINA -->
        <div class="text-center" style="margin-top: 5px;">
            <div>{{ $empresa->leyenda_ticket ?? '¡Gracias por su compra!' }}</div>
            <div>Conserve este comprobante</div>
        </div>
    </div>

   <script>
    // Evita la duplicación de órdenes de impresión
    // Si la página se abre sola en una pestaña nueva, imprime al cargar.
    // Si se carga dentro del iframe invisible del POS, React controla la impresión.
    if (window.self === window.top) {
        window.addEventListener('load', function() {
            window.print();
        });
    }
</script>
</body>

</html>

