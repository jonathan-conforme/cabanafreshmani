<!DOCTYPE html>
<html lang="es">

<head>
    <meta charset="UTF-8">
    <title>@yield('titulo', 'Reporte')</title>
    <style>
        @page { margin: 22px 26px 42px 26px; }

        * { box-sizing: border-box; }

        body {
            margin: 0;
            font-family: DejaVu Sans, sans-serif;
            font-size: 9px;
            color: #2F2A20;
        }

        .header { width: 100%; border-bottom: 2px solid #0E7C86; padding-bottom: 8px; margin-bottom: 12px; }
        .header td { vertical-align: top; }
        .header .logo { height: 46px; }

        .empresa-nombre { font-size: 14px; font-weight: bold; color: #0E7C86; }
        .empresa-dato { font-size: 8px; color: #7A6A45; }

        .doc-titulo { font-size: 13px; font-weight: bold; color: #E2650F; text-transform: uppercase; }
        .doc-meta { font-size: 8px; color: #7A6A45; }

        h2 {
            font-size: 10px;
            color: #0E7C86;
            text-transform: uppercase;
            letter-spacing: .5px;
            margin: 14px 0 6px 0;
        }

        table { width: 100%; border-collapse: collapse; }

        .cards td {
            width: 25%;
            border: 1px solid #F0E6C8;
            background: #FFFDF6;
            padding: 7px 9px;
        }
        .cards .label { font-size: 7.5px; text-transform: uppercase; letter-spacing: .5px; color: #8A7A4E; }
        .cards .value { font-size: 12px; font-weight: bold; padding-top: 3px; }

        .datos th {
            background: #0E7C86;
            color: #fff;
            font-size: 7.5px;
            text-transform: uppercase;
            letter-spacing: .4px;
            text-align: left;
            padding: 5px 6px;
        }
        .datos td { border-bottom: 1px solid #F1EAD5; padding: 5px 6px; }
        .datos tbody tr:nth-child(even) td { background: #FFFBEF; }
        .datos tfoot td {
            border-top: 2px solid #0E7C86;
            border-bottom: none;
            font-weight: bold;
            background: #FDF8E7;
            padding: 6px;
        }

        .right { text-align: right; }
        .center { text-align: center; }
        .bold { font-weight: bold; }
        .muted { color: #A3915F; }
        .verde { color: #1AA65E; }
        .naranja { color: #E2650F; }
        .rojo { color: #D64545; }

        .badge {
            background: #F5F0E0;
            color: #7A6A45;
            padding: 2px 5px;
            font-size: 7.5px;
            font-weight: bold;
            text-transform: uppercase;
        }

        .vacio { text-align: center; padding: 22px; color: #A3915F; }

        .pie {
            position: fixed;
            bottom: -14px;
            left: 0;
            right: 0;
            font-size: 7.5px;
            color: #A3915F;
            border-top: 1px solid #F0E6C8;
            padding-top: 4px;
        }
    </style>
</head>

<body>
    <table class="header">
        <tr>
            <td style="width: 60px;">
                @if(file_exists(public_path('images/cabana-fresh-mani-logo.png')))
                    <img src="{{ public_path('images/cabana-fresh-mani-logo.png') }}" alt="Logo" class="logo">
                @elseif(!empty($empresa?->logo_path) && file_exists(public_path('storage/'.$empresa->logo_path)))
                    <img src="{{ public_path('storage/'.$empresa->logo_path) }}" alt="Logo" class="logo">
                @endif
            </td>
            <td>
                <div class="empresa-nombre">
                    {{ $empresa->nombre_comercial ?? $empresa->razon_social ?? 'CABANA FRESHMANI' }}
                </div>
                @if(!empty($empresa?->ruc))
                    <div class="empresa-dato">RUC: {{ $empresa->ruc }}</div>
                @endif
                @if(!empty($empresa?->direccion_matriz))
                    <div class="empresa-dato">{{ $empresa->direccion_matriz }}</div>
                @endif
                @if(!empty($empresa?->telefono))
                    <div class="empresa-dato">Tel: {{ $empresa->telefono }}</div>
                @endif
            </td>
            <td class="right" style="width: 38%;">
                <div class="doc-titulo">@yield('titulo', 'Reporte')</div>
                <div class="doc-meta">
                    @if(!empty($periodo))
                        {{ $periodo }}
                    @else
                        Periodo: {{ \Carbon\Carbon::parse($desde)->format('d/m/Y') }}
                        al {{ \Carbon\Carbon::parse($hasta)->format('d/m/Y') }}
                    @endif
                </div>
                <div class="doc-meta">
                    Generado: {{ now()->format('d/m/Y H:i') }}
                    @if(!empty($generadoPor)) · {{ $generadoPor }} @endif
                </div>
            </td>
        </tr>
    </table>

    @yield('contenido')

    <table class="pie">
        <tr>
            <td>{{ $empresa->nombre_comercial ?? $empresa->razon_social ?? 'Cabana Freshmani' }} · Documento generado automáticamente</td>
            <td class="right"><!-- numeracion estampada por el controlador --></td>
        </tr>
    </table>
</body>

</html>
