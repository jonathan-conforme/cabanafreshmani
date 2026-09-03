<?php

namespace App\Services\Dashboard;

use App\Models\Producto;
use App\Models\Venta;
use Illuminate\Support\Carbon;

class DashboardService
{
    /** Color de cada método de pago para el gráfico de dona. */
    protected const COLORES_METODO = [
        'efectivo' => '#0d9488',
        'tarjeta' => '#1E9EE0',
        'transferencia' => '#6D5DD3',
        'credito' => '#ea580c',
    ];

    /**
     * Arma todas las props que consume la vista Dashboard.
     */
    public function paraVista(): array
    {
        return [
            'stats' => $this->tarjetasResumen(),
            'invoices' => $this->ventasPorMetodoPago(),
            'sales' => $this->ventasUltimosDias(14),
            'recent' => $this->ventasRecientes(8),
        ];
    }

    /**
     * Totales de ventas completadas dentro de un rango de fechas (inclusive).
     */
    private function totalesVentas(string $desde, string $hasta): object
    {
        return Venta::whereDate('created_at', '>=', $desde)
            ->whereDate('created_at', '<=', $hasta)
            ->where('estado', 'completada')
            ->selectRaw('COUNT(*) as cantidad, COALESCE(SUM(total), 0) as total, COALESCE(AVG(total), 0) as promedio')
            ->first();
    }

    /**
     * Variación porcentual entre el periodo actual y el anterior.
     */
    private function variacion(float $actual, float $anterior): array
    {
        if ($anterior <= 0) {
            return ['delta' => $actual > 0 ? '+100%' : null, 'up' => true];
        }

        $pct = (($actual - $anterior) / $anterior) * 100;

        return [
            'delta' => sprintf('%+.1f%%', $pct),
            'up' => $pct >= 0,
        ];
    }

    private function tarjetasResumen(): array
    {
        $hoy = Carbon::today();
        $ayer = Carbon::today()->subDay();
        $inicioMes = Carbon::today()->startOfMonth();
        $inicioMesPasado = Carbon::today()->subMonthNoOverflow()->startOfMonth();
        $finMesPasado = Carbon::today()->subMonthNoOverflow()->endOfMonth();

        $ventasHoy = $this->totalesVentas($hoy->toDateString(), $hoy->toDateString());
        $ventasAyer = $this->totalesVentas($ayer->toDateString(), $ayer->toDateString());
        $ventasMes = $this->totalesVentas($inicioMes->toDateString(), $hoy->toDateString());
        $ventasMesPasado = $this->totalesVentas($inicioMesPasado->toDateString(), $finMesPasado->toDateString());

        $stockBajo = Producto::activos()->stockBajo()->count();

        return [
            array_merge([
                'label' => 'Ventas de Hoy',
                'value' => '$'.number_format((float) $ventasHoy->total, 2),
                'hint' => $ventasHoy->cantidad.' venta(s) hoy',
                'color' => '#0E7C86',
                'icon' => 'wallet',
            ], $this->variacion((float) $ventasHoy->total, (float) $ventasAyer->total)),

            array_merge([
                'label' => 'Ventas del Mes',
                'value' => '$'.number_format((float) $ventasMes->total, 2),
                'hint' => $ventasMes->cantidad.' venta(s) este mes',
                'color' => '#1E9EE0',
                'icon' => 'trending',
            ], $this->variacion((float) $ventasMes->total, (float) $ventasMesPasado->total)),

            [
                'label' => 'Ticket Promedio',
                'value' => '$'.number_format((float) $ventasMes->promedio, 2),
                'hint' => 'Promedio del mes actual',
                'color' => '#B23CC9',
                'icon' => 'chart',
                'delta' => null,
                'up' => true,
            ],

            [
                'label' => 'Productos Stock Bajo',
                'value' => (string) $stockBajo,
                'hint' => $stockBajo > 0 ? 'Requieren reposición' : 'Inventario en orden',
                'color' => $stockBajo > 0 ? '#D64545' : '#1AA65E',
                'icon' => 'alert',
                'delta' => null,
                'up' => $stockBajo === 0,
            ],
        ];
    }

    /**
     * Ventas del mes agrupadas por método de pago (para la dona).
     */
    private function ventasPorMetodoPago(): array
    {
        $inicioMes = Carbon::today()->startOfMonth()->toDateString();
        $hoy = Carbon::today()->toDateString();

        $filas = Venta::whereDate('created_at', '>=', $inicioMes)
            ->whereDate('created_at', '<=', $hoy)
            ->where('estado', 'completada')
            ->selectRaw('metodo_pago, COUNT(*) as cantidad, COALESCE(SUM(total), 0) as total')
            ->groupBy('metodo_pago')
            ->orderByDesc('total')
            ->get();

        $segments = $filas->map(fn ($fila) => [
            'label' => ucfirst($fila->metodo_pago),
            'value' => round((float) $fila->total, 2),
            'count' => (int) $fila->cantidad,
            'color' => self::COLORES_METODO[$fila->metodo_pago] ?? '#e7e5e4',
        ])->all();

        return [
            'total' => (int) $filas->sum('cantidad'),
            'segments' => $segments,
        ];
    }

    /**
     * Serie diaria de ventas de los últimos N días (rellena los días sin ventas con 0).
     */
    private function ventasUltimosDias(int $dias): array
    {
        $desde = Carbon::today()->subDays($dias - 1);

        $porFecha = Venta::whereDate('created_at', '>=', $desde->toDateString())
            ->where('estado', 'completada')
            ->selectRaw('DATE(created_at) as fecha, COALESCE(SUM(total), 0) as total')
            ->groupBy('fecha')
            ->pluck('total', 'fecha');

        $serie = [];

        for ($i = 0; $i < $dias; $i++) {
            $dia = $desde->copy()->addDays($i);

            $serie[] = [
                'label' => $dia->format('d/m'),
                'value' => round((float) ($porFecha[$dia->toDateString()] ?? 0), 2),
            ];
        }

        return $serie;
    }

    /**
     * Últimas ventas registradas para la tabla del dashboard.
     */
    private function ventasRecientes(int $limite): array
    {
        return Venta::with(['cliente:id,nombre', 'user:id,name'])
            ->withCount('detalles')
            ->latest()
            ->limit($limite)
            ->get()
            ->map(fn ($venta) => [
                'id' => $venta->id,
                'cliente' => $venta->cliente?->nombre ?? 'Consumidor final',
                'vendedor' => $venta->user?->name ?? '-',
                'items' => $venta->detalles_count,
                'fecha' => $venta->created_at?->format('d/m/Y H:i'),
                'metodo' => ucfirst($venta->metodo_pago),
                'estado' => ucfirst($venta->estado),
                'total' => '$'.number_format((float) $venta->total, 2),
            ])
            ->all();
    }
}
