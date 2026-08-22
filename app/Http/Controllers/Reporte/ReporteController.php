<?php

namespace App\Http\Controllers\Reporte;

use App\Http\Controllers\Controller;
use App\Services\Reporte\ReporteService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ReporteController extends Controller
{
    protected const TIPOS_VALIDOS = ['ventas', 'compras', 'inventario', 'productos', 'caja'];

    public function __construct(
        protected ReporteService $reporteService
    ) {}

    public function index(Request $request): Response
    {
        $tipo = in_array($request->get('tipo'), self::TIPOS_VALIDOS, true)
            ? $request->get('tipo')
            : 'ventas';

        $filtros = $request->only(['desde', 'hasta', 'limite']);

        $data = match ($tipo) {
            'compras' => $this->reporteService->resumenCompras($filtros),
            'inventario' => $this->reporteService->resumenInventario($filtros),
            'productos' => $this->reporteService->productosMasVendidos($filtros),
            'caja' => $this->reporteService->historialCierresCaja($filtros),
            default => $this->reporteService->resumenVentas($filtros),
        };

        return Inertia::render('Reportes/Index', array_merge($data, [
            'tipo' => $tipo,
            'filtros' => [
                'desde' => $filtros['desde'] ?? now()->startOfMonth()->toDateString(),
                'hasta' => $filtros['hasta'] ?? now()->toDateString(),
                'limite' => $filtros['limite'] ?? 15,
            ],
        ]));
    }
}
