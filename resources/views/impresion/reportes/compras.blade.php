@extends('impresion.reportes.layout')

@section('titulo', 'Reporte de Compras')

@section('contenido')
    @php
        // Muestra el signo antes del simbolo: -$4.50 en lugar de $-4.50
        $money = function ($v) {
            $n = (float) $v;

            return ($n < 0 ? '-$' : '$') . number_format(abs($n), 2);
        };
    @endphp

    <table class="cards">
        <tr>
            <td>
                <div class="label">N° de Compras</div>
                <div class="value">{{ $totales->cantidad ?? 0 }}</div>
            </td>
            <td>
                <div class="label">Total Comprado</div>
                <div class="value">{{ $money($totales->total ?? 0) }}</div>
            </td>
            <td>
                <div class="label">Pagado</div>
                <div class="value verde">{{ $money($totales->pagado ?? 0) }}</div>
            </td>
            <td>
                <div class="label">Saldo Pendiente</div>
                <div class="value rojo">{{ $money($totales->pendiente ?? 0) }}</div>
            </td>
        </tr>
    </table>

    <h2>Compras por Proveedor</h2>
    <table class="datos">
        <thead>
            <tr>
                <th>Proveedor</th>
                <th class="right" style="width: 15%;">N° Compras</th>
                <th class="right" style="width: 20%;">Total</th>
            </tr>
        </thead>
        <tbody>
            @forelse($porProveedor as $fila)
                <tr>
                    <td>{{ $fila->nombre }}</td>
                    <td class="right">{{ $fila->cantidad }}</td>
                    <td class="right bold">{{ $money($fila->total) }}</td>
                </tr>
            @empty
                <tr><td colspan="3" class="vacio">Sin compras en este rango.</td></tr>
            @endforelse
        </tbody>
    </table>

    <h2>Compras por Estado</h2>
    <table class="datos">
        <thead>
            <tr>
                <th>Estado</th>
                <th class="right" style="width: 15%;">N° Compras</th>
                <th class="right" style="width: 20%;">Total</th>
            </tr>
        </thead>
        <tbody>
            @forelse($porEstado as $fila)
                <tr>
                    <td><span class="badge">{{ $fila->estado }}</span></td>
                    <td class="right">{{ $fila->cantidad }}</td>
                    <td class="right bold">{{ $money($fila->total) }}</td>
                </tr>
            @empty
                <tr><td colspan="3" class="vacio">Sin compras en este rango.</td></tr>
            @endforelse
        </tbody>
    </table>

    <h2>Detalle de Compras</h2>
    <table class="datos">
        <thead>
            <tr>
                <th style="width: 7%;">ID</th>
                <th style="width: 12%;">Fecha</th>
                <th>Proveedor</th>
                <th style="width: 12%;">Registró</th>
                <th style="width: 11%;">Estado</th>
                <th class="right" style="width: 12%;">Total</th>
                <th class="right" style="width: 12%;">Pagado</th>
                <th class="right" style="width: 12%;">Saldo</th>
            </tr>
        </thead>
        <tbody>
            @forelse($compras as $compra)
                <tr>
                    <td class="bold">#{{ $compra->id }}</td>
                    <td>{{ $compra->fecha_compra?->format('d/m/Y') ?? '-' }}</td>
                    <td>{{ $compra->proveedor->nombre ?? 'Sin proveedor' }}</td>
                    <td>{{ $compra->user->name ?? '-' }}</td>
                    <td><span class="badge">{{ $compra->estado }}</span></td>
                    <td class="right">{{ $money($compra->total) }}</td>
                    <td class="right verde">{{ $money($compra->monto_pagado) }}</td>
                    <td class="right naranja bold">{{ $money($compra->total - $compra->monto_pagado) }}</td>
                </tr>
            @empty
                <tr><td colspan="8" class="vacio">No hay compras en este rango de fechas.</td></tr>
            @endforelse
        </tbody>
        @if(count($compras))
            <tfoot>
                <tr>
                    <td colspan="5" class="right">Totales</td>
                    <td class="right">{{ $money($compras->sum('total')) }}</td>
                    <td class="right">{{ $money($compras->sum('monto_pagado')) }}</td>
                    <td class="right">{{ $money($compras->sum('total') - $compras->sum('monto_pagado')) }}</td>
                </tr>
            </tfoot>
        @endif
    </table>
@endsection
