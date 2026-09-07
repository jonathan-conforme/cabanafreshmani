@extends('impresion.reportes.layout')

@section('titulo', 'Reporte de Inventario')

@section('contenido')
    @php
        // Muestra el signo antes del simbolo: -$4.50 en lugar de $-4.50
        $money = function ($v) {
            $n = (float) $v;

            return ($n < 0 ? '-$' : '$') . number_format(abs($n), 2);
        };
        $utilidad = (float) ($valorInventario->venta ?? 0) - (float) ($valorInventario->costo ?? 0);
    @endphp

    <table class="cards">
        <tr>
            <td>
                <div class="label">Valor Inventario (Costo)</div>
                <div class="value">{{ $money($valorInventario->costo ?? 0) }}</div>
            </td>
            <td>
                <div class="label">Valor Inventario (Venta)</div>
                <div class="value verde">{{ $money($valorInventario->venta ?? 0) }}</div>
            </td>
            <td>
                <div class="label">Utilidad Potencial</div>
                <div class="value">{{ $money($utilidad) }}</div>
            </td>
            <td>
                <div class="label">Productos en Catálogo</div>
                <div class="value">{{ $totalProductos }}</div>
            </td>
        </tr>
    </table>

    <h2>Movimientos por Tipo (rango seleccionado)</h2>
    <table class="datos">
        <thead>
            <tr>
                <th>Tipo de Movimiento</th>
                <th class="right" style="width: 20%;">N° Movimientos</th>
                <th class="right" style="width: 20%;">Unidades</th>
            </tr>
        </thead>
        <tbody>
            @forelse($porTipo as $fila)
                <tr>
                    <td><span class="badge">{{ $fila->tipo }}</span></td>
                    <td class="right">{{ $fila->cantidad }}</td>
                    <td class="right bold">{{ number_format((float) $fila->unidades, 2) }}</td>
                </tr>
            @empty
                <tr><td colspan="3" class="vacio">Sin movimientos de inventario en este rango.</td></tr>
            @endforelse
        </tbody>
    </table>

    <h2>Productos con Stock Bajo ({{ count($productosStockBajo) }})</h2>
    <table class="datos">
        <thead>
            <tr>
                <th>Producto</th>
                <th style="width: 15%;">Unidad</th>
                <th class="right" style="width: 13%;">Stock Actual</th>
                <th class="right" style="width: 13%;">Stock Mínimo</th>
                <th class="right" style="width: 13%;">Faltante</th>
            </tr>
        </thead>
        <tbody>
            @forelse($productosStockBajo as $producto)
                <tr>
                    <td class="bold">{{ $producto->nombre }}</td>
                    <td>{{ $producto->unidad->nombre ?? '-' }}</td>
                    <td class="right rojo bold">{{ number_format((float) $producto->stock, 2) }}</td>
                    <td class="right">{{ number_format((float) $producto->stock_minimo, 2) }}</td>
                    <td class="right naranja">
                        {{ number_format(max(0, (float) $producto->stock_minimo - (float) $producto->stock), 2) }}
                    </td>
                </tr>
            @empty
                <tr><td colspan="5" class="vacio">Ningún producto está por debajo de su stock mínimo.</td></tr>
            @endforelse
        </tbody>
    </table>
@endsection
