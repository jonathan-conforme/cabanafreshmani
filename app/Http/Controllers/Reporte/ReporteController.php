<?php

namespace App\Http\Controllers\Reporte;

use App\Http\Controllers\Controller;
use App\Services\Reporte\ReporteService;
use Barryvdh\DomPDF\Facade\Pdf;
use Barryvdh\DomPDF\PDF as PdfWrapper;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response as HttpResponse;
use Inertia\Inertia;
use Inertia\Response;
use App\Models\Venta;

class ReporteController extends Controller
{
    protected const TIPOS_VALIDOS = ['ventas', 'compras', 'inventario', 'productos', 'caja', 'cuentas_cobrar'];

    /** Reportes que se pueden descargar en PDF, con su orientacion de pagina. */
    protected const TIPOS_PDF = [
        'ventas' => 'portrait',
        'compras' => 'portrait',
        'inventario' => 'portrait',
        'caja' => 'landscape',
        'cuentas_cobrar' => 'landscape',
    ];

    /** Reporte que abre sin rango de fechas aplicado. */
    protected const SIN_RANGO_POR_DEFECTO = 'cuentas_cobrar';

    protected const TITULOS_PDF = [
        'ventas' => 'ventas',
        'compras' => 'compras',
        'inventario' => 'inventario',
        'caja' => 'cierres-de-caja',
        'cuentas_cobrar' => 'cuentas-por-cobrar',
    ];

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
            'cuentas_cobrar' => $this->reporteService->cuentasPorCobrar($filtros),
            default => $this->reporteService->resumenVentas($filtros),
        };

        // Cuentas por cobrar abre sin rango: un saldo sigue vigente aunque la
        // venta sea antigua. El usuario puede acotarlo si lo necesita.
        $sinRango = self::SIN_RANGO_POR_DEFECTO === $tipo;

        return Inertia::render('Reportes/Index', array_merge($data, [
            'tipo' => $tipo,
            'filtros' => [
                'desde' => $filtros['desde'] ?? ($sinRango ? '' : now()->startOfMonth()->toDateString()),
                'hasta' => $filtros['hasta'] ?? ($sinRango ? '' : now()->toDateString()),
                'limite' => $filtros['limite'] ?? 15,
            ],
        ]));
    }

    /**
     * Descarga el reporte actual (con los mismos filtros de pantalla) en PDF.
     */
    public function pdf(Request $request): HttpResponse
    {
        $tipo = $request->get('tipo');

        abort_unless(array_key_exists($tipo, self::TIPOS_PDF), 404);

        // Solo los reportes de periodo rellenan el rango cuando viene vacio.
        $porDefecto = self::SIN_RANGO_POR_DEFECTO === $tipo;

        $desde = $request->get('desde') ?: ($porDefecto ? null : now()->startOfMonth()->toDateString());
        $hasta = $request->get('hasta') ?: ($porDefecto ? null : now()->toDateString());

        $data = $this->reporteService->datosPdf($tipo, array_filter(compact('desde', 'hasta')));

        $pdf = Pdf::loadView("impresion.reportes.{$tipo}", array_merge($data, [
            'desde' => $desde,
            'hasta' => $hasta,
            'periodo' => $this->etiquetaPeriodo($desde, $hasta),
            'generadoPor' => $request->user()?->name,
        ]))->setPaper('a4', self::TIPOS_PDF[$tipo]);

        $this->numerarPaginas($pdf);

        $rango = $desde && $hasta ? "{$desde}_a_{$hasta}" : 'al-'.now()->toDateString();

        return $pdf->download('reporte-'.self::TITULOS_PDF[$tipo]."-{$rango}.pdf");
    }

    /**
     * Estampa "Pagina X de Y" en el pie de cada hoja. Se hace sobre el canvas
     * porque dompdf no resuelve counter(pages) dentro de un position:fixed.
     */
    protected function numerarPaginas(PdfWrapper $pdf): void
    {
        $pdf->render();

        $dompdf = $pdf->getDomPDF();
        $canvas = $dompdf->getCanvas();

        $fuente = $dompdf->getFontMetrics()->getFont('DejaVu Sans', 'normal');
        $texto = 'Página {PAGE_NUM} de {PAGE_COUNT}';
        // Se mide un texto representativo: los marcadores se sustituyen al imprimir.
        $ancho = $dompdf->getFontMetrics()->getTextWidth('Página 99 de 99', $fuente, 7.5);

        $canvas->page_text(
            $canvas->get_width() - 26 - $ancho,
            $canvas->get_height() - 15,
            $texto,
            $fuente,
            7.5,
            [0.64, 0.57, 0.37]
        );
    }

    /**
     * Texto del encabezado cuando el rango no es un periodo completo.
     * Devuelve null si hay ambas fechas: ahi el layout imprime "Periodo: X al Y".
     */
    protected function etiquetaPeriodo(?string $desde, ?string $hasta): ?string
    {
        $fecha = fn (string $v) => \Carbon\Carbon::parse($v)->format('d/m/Y');

        return match (true) {
            $desde && $hasta => null,
            (bool) $desde => 'Desde el '.$fecha($desde),
            (bool) $hasta => 'Hasta el '.$fecha($hasta),
            default => 'Todos los saldos pendientes a la fecha',
        };
    }

    public function descargarPdf(Request $request)
{
    $tipo = $request->input('tipo', 'ventas');
    
    // Si no vienen fechas en el filtro, asume la fecha actual (del día)
    $desde = $request->input('desde') ?: now()->toDateString();
    $hasta = $request->input('hasta') ?: now()->toDateString();

    if ($tipo === 'ventas') {
        $ventas = Venta::with(['cliente', 'user'])
            ->whereBetween('created_at', ["{$desde} 00:00:00", "{$hasta} 23:59:59"])
            ->get();

        // Genera el PDF con la lista completa de ventas filtradas
        $pdf = \Barryvdh\DomPDF\Facade\Pdf::loadView('reportes.pdf_ventas_consolidado', compact('ventas', 'desde', 'hasta'));
        
        return $pdf->download("reporte_ventas_{$desde}_a_{$hasta}.pdf");
    }

    // ... otros tipos de reportes
}
}
