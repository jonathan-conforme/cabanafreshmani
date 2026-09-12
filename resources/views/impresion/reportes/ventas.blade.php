@extends('impresion.reportes.layout')

@section('titulo', 'Reporte de Ventas')

@section('contenido')
    @php
        $money = function ($v) {
            $n = (float) $v;
            return ($n < 0 ? '-$' : '$') . number_format(abs($n), 2);
        };
        $fecha = fn ($v) => $v ? \Carbon\Carbon::parse($v)->format('d/m/Y H:i') : '-';
    @endphp

    <table class="cards">
        <tr>
            <td>
                <div class="label text-center">N° de Ventas</div>
                <div class="value text-center">{{ $totales->cantidad ?? count($ventas ?? []) }}</div>
            </td>
            <td>
                <div class="label text-center">Total Vendido</div>
                <div class="value verde text-center">{{ $money($totales->total ?? 0) }}</div>
            </td>
            <td>
                <div class="label text-center">Promedio Venta</div>
                <div class="value text-center">{{ $money($totales->promedio ?? 0) }}</div>
            </td>
        </tr>
    </table>

    @if(!empty($porMetodoPago))
    <h2>Ventas por Método de Pago</h2>
    <table class="datos">
        <thead>
            <tr>
                <th>Método de Pago</th>
                <th style="width: 20%; text-align: right;">N° Ventas</th>
                <th style="width: 20%; text-align: right;">Total</th>
            </tr>
        </thead>
        <tbody>
            @forelse($porMetodoPago as $fila)
                <tr>
                    <td><span class="badge">{{ $fila->metodo_pago }}</span></td>
                    <td style="text-align: right;">{{ $fila->cantidad }}</td>
                    <td style="text-align: right;" class="bold">{{ $money($fila->total) }}</td>
                </tr>
            @empty
                <tr><td colspan="3" class="vacio">Sin ventas en este rango.</td></tr>
            @endforelse
        </tbody>
    </table>
    @endif

    <h2>Detalle de Ventas</h2>
    <table class="datos">
        <thead>
            <tr>
                <th style="width: 8%;">ID</th>
                <th style="width: 15%;">Fecha</th>
                <th>Cliente</th>
                <th style="width: 15%;">Vendedor</th>
                <th style="width: 15%;">Método Pago</th>
                <th style="width: 15%; text-align: right;">Total</th>
            </tr>
        </thead>
        <tbody>
            @forelse($ventas ?? [] as $venta)
                <tr>
                    <td class="bold">#{{ $venta->id }}</td>
                    <td>{{ $fecha($venta->created_at) }}</td>
                    <td>
                        {{ $venta->cliente
                            ? trim(($venta->cliente->nombre ?? '') . ' ' . ($venta->cliente->apellido ?? ''))
                            : 'Consumidor Final' }}
                    </td>
                    <td>{{ $venta->user->name ?? '-' }}</td>
                    <td><span class="badge">{{ $venta->metodo_pago }}</span></td>
                    <td style="text-align: right;" class="bold">{{ $money($venta->total) }}</td>
                </tr>
            @empty
                <tr><td colspan="6" class="vacio">No hay ventas registradas en este rango de fechas.</td></tr>
            @endforelse
        </tbody>
        @if(count($ventas ?? []))
            <tfoot>
                <tr>
                    <td colspan="5" style="text-align: right;" class="bold">Total General</td>
                    <td style="text-align: right;" class="bold">{{ $money($totales->total ?? $ventas->sum('total')) }}</td>
                </tr>
            </tfoot>
        @endif
    </table>
@endsection