@extends('impresion.reportes.layout')

@section('titulo', 'Reporte de Cierres de Caja')

@section('contenido')
    @php
        $money = function ($v) {
            $n = (float) $v;
            return ($n < 0 ? '-$' : '$') . number_format(abs($n), 2);
        };
        $fecha = fn($v) => $v ? \Carbon\Carbon::parse($v)->format('d/m/Y H:i') : '-';
        $totalDiferencia = (float) ($totales->total_diferencia ?? 0);
    @endphp

    <table class="cards">
        <tr>
            <td>
                <div class="label">N° DE CIERRES</div>
                <div class="value">{{ $totales->cantidad ?? 0 }}</div>
            </td>
            <td>
                <div class="label">TOTAL APERTURA</div>
                <div class="value">{{ $money($totales->total_apertura ?? 0) }}</div>
            </td>
            <td>
                <div class="label">VENTAS EFECTIVO</div>
                <div class="value">{{ $money($totales->total_ventas_efectivo ?? 0) }}</div>
            </td>
            <td>
                <div class="label">TOTAL EGRESOS / RETIROS</div>
                <div class="value rojo">{{ $money($totales->total_egresos ?? 0) }}</div>
            </td>
            <td>
                <div class="label">TOTAL CIERRE (ARQUEO)</div>
                <div class="value">{{ $money($totales->total_cierre ?? 0) }}</div>
            </td>
            <td>
                <div class="label">TOTAL TRANSFERENCIAS</div>
                <div class="value">{{ $money($totales->total_transferencias ?? 0) }}</div>
            </td>
            <td>
                <div class="label">DIFERENCIA ACUMULADA</div>
                <div class="value {{ $totalDiferencia < 0 ? 'rojo' : 'verde' }}">
                    {{ $money($totalDiferencia) }}
                </div>
            </td>
        </tr>
    </table>

    <h2>Cierres por Usuario</h2>
    <table class="datos">
        <thead>
            <tr>
                <th>Usuario</th>
                <th class="right" style="width: 20%;">N° de Cierres</th>
                <th class="right" style="width: 20%;">Diferencia</th>
            </tr>
        </thead>
        <tbody>
            @forelse($porUsuario as $fila)
                <tr>
                    <td>{{ $fila->name }}</td>
                    <td class="left">{{ $fila->cantidad }}</td>
                    <td class="left bold {{ (float) $fila->diferencia < 0 ? 'rojo' : 'verde' }}">
                        {{ $money($fila->diferencia) }}
                    </td>
                </tr>
            @empty
                <tr>
                    <td colspan="3" class="vacio">Sin cierres de caja en este rango.</td>
                </tr>
            @endforelse
        </tbody>
    </table>

    <h2>Historial de Cierres de Caja</h2>
<table class="datos">
    <thead>
        <tr>
            <th style="width: 5%;">ID</th>
            <th style="width: 13%;">Usuario</th>
            <th style="width: 11%;">Apertura</th>
            <th style="width: 11%;">Cierre</th>
            <th style="width: 9%; text-align: right;">M. Apertura</th>
            <th style="width: 9%; text-align: right;">Transfer.</th>
            <th style="width: 9%; text-align: right;">V. Efectivo</th>
            <th style="width: 9%; text-align: right;">M. Egresos</th>
            <th style="width: 8%; text-align: right;">M. Esperado</th>
            <th style="width: 8%; text-align: right;">M. Cierre</th>
            <th style="width: 8%; text-align: right;">Diferencia</th>
        </tr>
    </thead>
    <tbody>
        @forelse($cierresCaja as $cierre)
            @php $diferencia = (float) ($cierre->diferencia ?? 0); @endphp
            <tr>
                <td class="bold">#{{ $cierre->id }}</td>
                <td>{{ $cierre->user->name ?? '-' }}</td>
                <td>{{ $fecha($cierre->fecha_apertura) }}</td>
                <td>{{ $fecha($cierre->fecha_cierre) }}</td>
                <td style="text-align: right;">{{ $money($cierre->monto_apertura) }}</td>
                <td class="bold text-blue" style="text-align: right;">{{ $money($cierre->total_transferencias ?? 0) }}</td>
                <td class="bold" style="text-align: right;">{{ $money($cierre->total_ventas_efectivo ?? 0) }}</td>
                <td class="rojo" style="text-align: right;">{{ $money($cierre->total_egresos ?? 0) }}</td>
                <td style="text-align: right;">{{ $money($cierre->monto_esperado) }}</td>
                <td style="text-align: right;">{{ $money($cierre->monto_cierre) }}</td>
                <td class="bold {{ $diferencia < 0 ? 'rojo' : ($diferencia > 0 ? 'verde' : '') }}" style="text-align: right;">
                    {{ $diferencia > 0 ? '+' : '' }}{{ $money($diferencia) }}
                </td>
            </tr>
        @empty
            <tr>
                <td colspan="11" class="vacio">No hay cierres de caja en este rango de fechas.</td>
            </tr>
        @endforelse
    </tbody>
    @if (count($cierresCaja))
        <tfoot>
            <tr>
                <td colspan="4" class="bold" style="text-align: right;">Totales</td>
                <td class="bold" style="text-align: right;">{{ $money($cierresCaja->sum('monto_apertura')) }}</td>
                <td class="bold text-blue" style="text-align: right;">{{ $money($cierresCaja->sum('total_transferencias')) }}</td>
                <td class="bold" style="text-align: right;">{{ $money($cierresCaja->sum('total_ventas_efectivo')) }}</td>
                <td class="bold rojo" style="text-align: right;">{{ $money($cierresCaja->sum('total_egresos')) }}</td>
                <td class="bold" style="text-align: right;">{{ $money($cierresCaja->sum('monto_esperado')) }}</td>
                <td class="bold text-blue" style="text-align: right;">{{ $money($cierresCaja->sum('monto_cierre')) }}</td>
                <td class="bold" style="text-align: right;">{{ $money($cierresCaja->sum('diferencia')) }}</td>
            </tr>
        </tfoot>
    @endif
</table>

    <h2>Detalle de Egresos Registrados</h2>
    <table class="datos">
        <thead>
            <tr>
                <th style="width: 8%;">Caja ID</th>
                <th style="width: 18%;">Usuario</th>
                <th style="width: 16%;">Fecha / Hora</th>
                <th>Concepto / Motivo</th>
                <th class="right" style="width: 15%;">Monto</th>
            </tr>
        </thead>
        <tbody>
            @php $hayEgresos = false; @endphp
            @foreach($cierresCaja as $cierre)
                @foreach($cierre->egresos as $egreso)
                    @php $hayEgresos = true; @endphp
                    <tr>
                        <td class="bold">#{{ $cierre->id }}</td>
                        <td>{{ $egreso->user->name ?? $cierre->user->name ?? '-' }}</td>
                        <td>{{ $fecha($egreso->created_at) }}</td>
                        <td>{{ $egreso->concepto }}</td>
                        <td class="right rojo bold">{{ $money($egreso->monto) }}</td>
                    </tr>
                @endforeach
            @endforeach

            @if(!$hayEgresos)
                <tr>
                    <td colspan="5" class="vacio">No se registraron egresos en las cajas de este rango de fechas.</td>
                </tr>
            @endif
        </tbody>
        @if($hayEgresos)
            <tfoot>
                <tr>
                    <td colspan="4" class="right bold">Total Egresos Desglosados</td>
                    <td class="right bold rojo">{{ $money($totales->total_egresos ?? 0) }}</td>
                </tr>
            </tfoot>
        @endif
    </table>
@endsection