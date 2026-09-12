@php
    $logoPath = public_path('images/cabana-fresh-mani-logo.png');
    $logoBase64 = file_exists($logoPath) ? 'data:image/png;base64,' . base64_encode(file_get_contents($logoPath)) : null;
    $ambienteSri = $empresa->ambiente_sri ?? '0';
@endphp
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{ $venta->numero_factura ? 'Factura_'.$venta->numero_factura : 'Comprobante_'.$venta->id }}</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            color: #2F2A20;
            margin: 0;
            padding: 20px;
            background-color: #fff;
        }
        .container {
            max-width: 800px;
            margin: 0 auto;
            border: 1px solid #E5DCC0;
            padding: 30px;
            border-radius: 8px;
        }
        .header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            border-bottom: 2px solid #0E7C86;
            padding-bottom: 15px;
            margin-bottom: 15px;
        }
        .logo {
            max-width: 160px;
            max-height: 70px;
            width: auto;
            height: auto;
            margin-bottom: 8px;
        }
        .company-info {
            font-size: 12px;
            line-height: 1.4;
            color: #555;
        }
        .doc-title {
            text-align: letf;
        }
        .doc-title h1 {
            color: #0E7C86;
            margin: 0;
            font-size: 20px;
        }
        .banner-prueba {
            background-color: #FFF3CD;
            color: #856404;
            border: 1px solid #FFEEBA;
            text-align: center;
            padding: 8px;
            font-weight: bold;
            font-size: 12px;
            border-radius: 4px;
            margin-bottom: 15px;
        }
        .info-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 15px;
            margin-bottom: 20px;
        }
        .info-box {
            background-color: #FDF8E7;
            padding: 12px 15px;
            border-radius: 6px;
            font-size: 12px;
            line-height: 1.5;
        }
        .info-box strong {
            color: #0E7C86;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
        }
        th {
            background-color: #0E7C86;
            color: white;
            text-align: left;
            padding: 8px 10px;
            font-size: 11px;
            text-transform: uppercase;
        }
        td {
            padding: 8px 10px;
            border-bottom: 1px solid #E5DCC0;
            font-size: 12px;
        }
        .totals-section {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 20px;
        }
        .sri-box {
            max-width: 450px;
            font-size: 11px;
          text-align: letf;
          font-size: 12px;
            line-height: 1.4;
            color: #555;
            margin: 0;
            
            padding: 5px;
           
            
        }
        .totals {
            width: 280px;
            font-size: 13px;
            margin-left: auto;
        }
        .totals div {
            display: flex;
            justify-content: space-between;
            padding: 4px 0;
        }
        .totals .grand-total {
            font-weight: bold;
            font-size: 15px;
            color: #0E7C86;
            border-top: 2px solid #0E7C86;
            padding-top: 6px;
            margin-top: 4px;
        }
        .footer {
            text-align: center;
            border-top: 1px solid #E5DCC0;
            padding-top: 12px;
            font-size: 12px;
            color: #7A6A45;
        }
        @media print {
            body { padding: 0; }
            .container { border: none; padding: 0; }
            .no-print { display: none; }
        }
    </style>
</head>
<body>
    <div class="no-print" style="max-width: 800px; margin: 0 auto 15px auto; text-align: right;">
        <button onclick="window.print()" style="background: #0E7C86; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer; font-weight: bold;">
            🖨️ Imprimir / Guardar como PDF
        </button>
    </div>

    <div class="container">
        <!-- ENCABEZADO Y LOGO -->
        <div class="header">
            <div>
                @if($logoBase64)
                    <img src="{{ $logoBase64 }}" alt="Logo" class="logo">
                @endif
                <div style="font-weight: bold; font-size: 14px; color: #2F2A20;">
                    {{ $empresa->nombre_comercial ?? $empresa->razon_social ?? 'CABANA FRESHMANI' }}
                </div>
                <div class="company-info">
                    @if(!empty($empresa->razon_social) && $empresa->razon_social !== $empresa->nombre_comercial)
                        <div><strong>Razón Social:</strong> {{ $empresa->razon_social }}</div>
                    @endif
                    @if(!empty($empresa->ruc)) <div><strong>RUC:</strong> {{ $empresa->ruc }}</div> @endif
                    @if(!empty($empresa->direccion_matriz)) <div><strong>Matriz:</strong> {{ $empresa->direccion_matriz }}</div> @endif
                    @if(!empty($empresa->telefono)) <div><strong>Teléfono:</strong> {{ $empresa->telefono }}</div> @endif
                    @if(!empty($empresa->contribuyente_especial)) <div><strong>Res. N°:</strong> {{ $empresa->contribuyente_especial }}</div> @endif
                    @if(isset($empresa->obligado_contabilidad)) <div><strong>Obligado a Llevar Contabilidad:</strong> {{ $empresa->obligado_contabilidad ? 'SI' : 'NO' }}</div> @endif
                </div>
            </div>

            <div class="doc-title">
                @if(!empty($venta->numero_factura) && $ambienteSri !== '0')
                    <h1>FACTURA</h1>
                    <small style="color: #7A6A45; font-weight: bold; font-size: 13px;">N° {{ $venta->numero_factura }}</small>
                @else
                    <h1>COMPROBANTE INTERNO</h1>
                    <small style="color: #7A6A45; font-weight: bold; font-size: 13px;">N° #{{ str_pad($venta->id, 8, '0', STR_PAD_LEFT) }}</small>
                @endif
                <div style="margin-top: 8px; font-size: 12px; color: #555;">
                    Fecha: {{ $venta->created_at->format('d/m/Y H:i') }}
                </div>
                 <!-- BLOQUE CLAVE DE ACCESO / SRI -->
            <div>
                @if(!empty($venta->clave_acceso) && $ambienteSri !== '0')
                    <div class="sri-box">
                        <strong>CLAVE DE ACCESO / SRI:</strong><br>
                        <span style="margin-top: 8px; font-size: 12px; color: #7A6A45;">{{ $venta->clave_acceso }}</span><br>
                        <strong>Estado SRI:</strong> <strong>LOCAL / PRUEBA </strong><br>
                    </div>
                @elseif($ambienteSri === '0')
                    <div class="sri-box">
                        <strong>LOCAL / PRUEBA</strong><br>
                        Comprobante no enviado al SRI.
                    </div>
                @endif
            </div>
            </div>
        </div>

        <!-- BANNER AVISO MODO PRUEBAS -->
        @if($ambienteSri === '0')
            <div class="banner-prueba">
                *** DOCUMENTO SIN VALOR TRIBUTARIO - COMPROBANTE INTERNO DE PRUEBAS ***
            </div>
        @endif

        <!-- DATOS DEL CLIENTE Y COMPRA -->
        <div class="info-grid">
            <div class="info-box">
                <strong>DATOS DEL CLIENTE</strong><br>
                <strong>Nombre:</strong> {{ isset($venta->cliente) ? trim($venta->cliente->nombre . ' ' . ($venta->cliente->apellido ?? '')) : 'Consumidor Final' }}<br>
                @if(!empty($venta->cliente->identificacion)) <strong>RUC/CI:</strong> {{ $venta->cliente->identificacion }}<br> @endif
                @if(!empty($venta->cliente->email)) <strong>Correo:</strong> {{ $venta->cliente->email }}<br> @endif
                @if(!empty($venta->cliente->direccion)) <strong>Dirección:</strong> {{ $venta->cliente->direccion }}<br> @endif
                @if(!empty($venta->cliente->telefono)) <strong>Teléfono:</strong> {{ $venta->cliente->telefono }} @endif
            </div>
            <div class="info-box">
                <strong>DETALLES DE LA VENTA</strong><br>
                <strong>Método de Pago:</strong> <span style="text-transform: uppercase;">{{ $venta->metodo_pago }}</span><br>
                <strong>Estado:</strong> <span style="text-transform: uppercase;">{{ $venta->estado }}</span><br>
                <strong>Cajero / Vendedor:</strong> {{ $venta->user->name ?? 'Administrador' }}
            </div>
        </div>

        <!-- TABLA DE PRODUCTOS -->
        <table>
            <thead>
                <tr>
                    <th style="width: 5%;">#</th>
                    <th style="width: 50%;">Producto</th>
                    <th style="text-align: center; style="width: 15%;">Cantidad</th>
                    <th style="text-align: right; style="width: 15%;">P. Unitario</th>
                    <th style="text-align: right; style="width: 15%;">Total</th>
                </tr>
            </thead>
            <tbody>
                @foreach($venta->detalles as $detalle)
                <tr>
                    <td>{{ $loop->iteration }}</td>
                    <td><strong>{{ $detalle->producto->nombre ?? 'Producto' }}</strong></td>
                    <td style="text-align: center;">
                        {{ number_format($detalle->cantidad, 2) }} {{ $detalle->producto->unidad->nombre ?? 'unid' }}
                    </td>
                    <td style="text-align: right;">${{ number_format($detalle->precio_unitario, 2) }}</td>
                    <td style="text-align: right;">${{ number_format($detalle->subtotal, 2) }}</td>
                </tr>
                @endforeach
            </tbody>
        </table>

        <!-- TOTALES Y SRI -->
        <div class="totals-section">
           

            <!-- VALORES DE PAGO -->
            <div class="totals">
                <div class="grand-total">
                    <span>TOTAL VENTA:</span>
                    <span>${{ number_format($venta->total, 2) }}</span>
                </div>

                @if($venta->metodo_pago === 'credito')
                    @php
                        $totalAbonado = $venta->pagos ? $venta->pagos->sum('monto') : 0;
                        $saldoPendiente = max(0, $venta->total - $totalAbonado);
                    @endphp
                    <div>
                        <span>Total Abonado:</span>
                        <span>${{ number_format($totalAbonado, 2) }}</span>
                    </div>
                    <div style="font-weight: bold; color: #D9534F;">
                        <span>SALDO PENDIENTE:</span>
                        <span>${{ number_format($saldoPendiente, 2) }}</span>
                    </div>
                @else
                    <div>
                        <span>Pago con:</span>
                        <span>${{ number_format($venta->pago_con ?? $venta->total, 2) }}</span>
                    </div>
                    <div>
                        <span>Vuelto:</span>
                        <span>${{ number_format($venta->vuelto ?? 0, 2) }}</span>
                    </div>
                @endif
            </div>
        </div>

        <!-- HISTORIAL DE ABONOS (SI APLICA CRÉDITO) -->
        @if($venta->pagos && $venta->pagos->count() > 0)
            <div style="margin-top: 10px; margin-bottom: 20px;">
                <strong style="color: #0E7C86; font-size: 13px;">HISTORIAL DE ABONOS</strong>
                <table style="margin-top: 8px;">
                    <thead>
                        <tr>
                            <th>Abono N°</th>
                            <th>Fecha</th>
                            <th style="text-align: right;">Monto Abonado</th>
                        </tr>
                    </thead>
                    <tbody>
                        @foreach($venta->pagos as $pago)
                        <tr>
                            <td>{{ $loop->iteration }}° Pago</td>
                            <td>{{ $pago->created_at->format('d/m/Y H:i') }}</td>
                            <td style="text-align: right; font-weight: bold;">${{ number_format($pago->monto, 2) }}</td>
                        </tr>
                        @endforeach
                    </tbody>
                </table>
            </div>
        @endif

        <!-- PIE DE PÁGINA Y LEYENDA -->
        <div class="footer">
            <div>{{ $empresa->leyenda_ticket ?? '¡Gracias por su compra!' }}</div>
            <small>Conserve este comprobante para cualquier reclamo o devolución.</small>
        </div>
    </div>
</body>
</html>