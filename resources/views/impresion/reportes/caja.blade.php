@extends('impresion.reportes.layout')

@section('titulo', 'Reporte de Cierres de Caja')

@section('contenido')
    @php
        // Muestra el signo antes del simbolo: -$4.50 en lugar de $-4.50
        $money = function ($v) {
            $n = (float) $v;

            return ($n < 0 ? '-$' : '$') . number_format(abs($n), 2);
        };
        $fecha = fn ($v) => $v ? \Carbon\Carbon::parse($v)->format('d/m/Y H:i') : '-';
        $totalDiferencia = (float) ($totales->total_diferencia ?? 0);
    @endphp

    <table class="cards">
        <tr>
            <td>
                <div class="label">N° de Cierres</div>
                <div class="value">{{ $totales->cantidad ?? 0 }}</div>
            </td>
            <td>
                <div class="label">Total Apertura</div>
                <div class="value">{{ $money($totales->total_apertura ?? 0) }}</div>
            </td>
            <td>
                <div class="label">Total Cierre (Arqueo)</div>
                <div class="value">{{ $money($totales->total_cierre ?? 0) }}</div>
            </td>
            <td>
                <div class="label">Diferencia Acumulada</div>
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
                    <td class="right">{{ $fila->cantidad }}</td>
                    <td class="right bold {{ (float) $fila->diferencia < 0 ? 'rojo' : 'verde' }}">
                        {{ $money($fila->diferencia) }}
                    </td>
                </tr>
            @empty
                <tr><td colspan="3" class="vacio">Sin cierres de caja en este rango.</td></tr>
            @endforelse
        </tbody>
    </table>

    <h2>Historial de Cierres de Caja</h2>
    <table class="datos">
        <thead>
            <tr>
                <th style="width: 6%;">ID</th>
                <th>Usuario</th>
                <th style="width: 13%;">Apertura</th>
                <th style="width: 13%;">Cierre</th>
                <th class="right" style="width: 11%;">M. Apertura</th>
                <th class="right" style="width: 11%;">M. Esperado</th>
                <th class="right" style="width: 11%;">M. Cierre</th>
                <th class="right" style="width: 11%;">Diferencia</th>
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
                    <td class="right">{{ $money($cierre->monto_apertura) }}</td>
                    <td class="right">{{ $money($cierre->monto_esperado) }}</td>
                    <td class="right">{{ $money($cierre->monto_cierre) }}</td>
                    <td class="right bold {{ $diferencia < 0 ? 'rojo' : ($diferencia > 0 ? 'verde' : '') }}">
                        {{ $diferencia > 0 ? '+' : '' }}{{ $money($diferencia) }}
                    </td>
                </tr>
            @empty
                <tr><td colspan="8" class="vacio">No hay cierres de caja en este rango de fechas.</td></tr>
            @endforelse
        </tbody>
        @if(count($cierresCaja))
            <tfoot>
                <tr>
                    <td colspan="4" class="right">Totales</td>
                    <td class="right">{{ $money($cierresCaja->sum('monto_apertura')) }}</td>
                    <td class="right">{{ $money($cierresCaja->sum('monto_esperado')) }}</td>
                    <td class="right">{{ $money($cierresCaja->sum('monto_cierre')) }}</td>
                    <td class="right">{{ $money($cierresCaja->sum('diferencia')) }}</td>
                </tr>
            </tfoot>
        @endif
    </table>
@endsection
