@extends('impresion.reportes.layout')

@section('titulo', 'Reporte de Cuentas por Cobrar')

@section('contenido')
    @php
        // Muestra el signo antes del simbolo: -$4.50 en lugar de $-4.50
        $money = function ($v) {
            $n = (float) $v;

            return ($n < 0 ? '-$' : '$') . number_format(abs($n), 2);
        };

        // Mismo cálculo que usa la tabla en pantalla: abonos registrados o, si no
        // los hay, el pago inicial guardado en la venta.
        $filas = collect($ventasCredito)->map(function ($venta) {
            $abonado = $venta->pagos->count() > 0
                ? (float) $venta->pagos->sum('monto')
                : (float) $venta->pago_con;

            $total = (float) $venta->total;

            $saldo = (float) $venta->saldo_pendiente > 0
                ? (float) $venta->saldo_pendiente
                : max(0, $total - $abonado);

            return [
                'venta' => $venta,
                'total' => $total,
                'abonado' => $abonado,
                'saldo' => $saldo,
                'cancelado' => $venta->estado === 'completada' || $saldo <= 0,
            ];
        });
    @endphp

    <table class="cards">
        <tr>
            <td>
                <div class="label">Total por Cobrar</div>
                <div class="value naranja">{{ $money($totales->total ?? 0) }}</div>
            </td>
            <td>
                <div class="label">Ventas a Crédito</div>
                <div class="value">{{ $totales->cantidad ?? 0 }}</div>
            </td>
            <td>
                <div class="label">Clientes con Deuda</div>
                <div class="value">{{ $totales->clientes ?? 0 }}</div>
            </td>
            <td>
                <div class="label">Deuda Promedio</div>
                <div class="value">{{ $money($totales->promedio ?? 0) }}</div>
            </td>
        </tr>
    </table>

    <h2>Deuda por Cliente</h2>
    <table class="datos">
        <thead>
            <tr>
                <th>Cliente</th>
                <th style="width: 14%;">Identificación</th>
                <th style="width: 12%;">Teléfono</th>
                <th class="right" style="width: 10%;">N° Ventas</th>
                <th class="right" style="width: 14%;">Deuda</th>
            </tr>
        </thead>
        <tbody>
            @forelse($porCliente as $fila)
                <tr>
                    <td>{{ $fila->nombre }}</td>
                    <td>{{ $fila->identificacion ?? '-' }}</td>
                    <td>{{ $fila->telefono ?? '-' }}</td>
                    <td class="right">{{ $fila->cantidad }}</td>
                    <td class="right bold naranja">{{ $money($fila->total) }}</td>
                </tr>
            @empty
                <tr><td colspan="5" class="vacio">Sin deudas registradas en este rango.</td></tr>
            @endforelse
        </tbody>
    </table>

    <h2>Detalle de Cuentas por Cobrar</h2>
    <table class="datos">
        <thead>
            <tr>
                <th style="width: 7%;">Venta</th>
                <th style="width: 13%;">Fecha</th>
                <th>Cliente</th>
                <th style="width: 12%;">Vendedor</th>
                <th style="width: 10%;">Estado</th>
                <th class="right" style="width: 12%;">Total Venta</th>
                <th class="right" style="width: 12%;">Abonado</th>
                <th class="right" style="width: 12%;">Saldo</th>
            </tr>
        </thead>
        <tbody>
            @forelse($filas as $fila)
                @php $venta = $fila['venta']; @endphp
                <tr>
                    <td class="bold">#{{ $venta->id }}</td>
                    <td>{{ $venta->created_at?->format('d/m/Y H:i') ?? '-' }}</td>
                    <td>
                        {{ $venta->cliente
                            ? trim(($venta->cliente->nombre ?? '') . ' ' . ($venta->cliente->apellido ?? ''))
                            : 'Consumidor Final' }}
                    </td>
                    <td>{{ $venta->user->name ?? '-' }}</td>
                    <td>
                        <span class="badge">{{ $fila['cancelado'] ? 'Cancelado' : 'Pendiente' }}</span>
                    </td>
                    <td class="right">{{ $money($fila['total']) }}</td>
                    <td class="right verde">{{ $money($fila['abonado']) }}</td>
                    <td class="right bold naranja">{{ $money($fila['saldo']) }}</td>
                </tr>
            @empty
                <tr><td colspan="8" class="vacio">No hay ventas a crédito registradas.</td></tr>
            @endforelse
        </tbody>
        @if($filas->isNotEmpty())
            <tfoot>
                <tr>
                    <td colspan="5" class="right">Totales</td>
                    <td class="right">{{ $money($filas->sum('total')) }}</td>
                    <td class="right">{{ $money($filas->sum('abonado')) }}</td>
                    <td class="right">{{ $money($filas->sum('saldo')) }}</td>
                </tr>
            </tfoot>
        @endif
    </table>
@endsection
