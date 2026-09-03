<?php

namespace App\Http\Controllers;

use App\Services\ExportService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\BinaryFileResponse;
use Throwable;

class ExportController extends Controller
{
    public function __construct(
        protected ExportService $exportService
    ) {}

    public function index(): Response
    {
        return Inertia::render('Admin/Export', [
            'resumen' => $this->exportService->resumenTablas(),
        ]);
    }

    public function descargar(): BinaryFileResponse|RedirectResponse
    {
        try {
            $ruta = $this->exportService->generarArchivo();
        } catch (Throwable $e) {
            Log::error('Fallo la exportacion de la base de datos', [
                'user_id' => auth()->id(),
                'mensaje' => $e->getMessage(),
            ]);

            return back()->with('error', 'No se pudo generar el backup: '.$e->getMessage());
        }

        Log::info('Backup de base de datos descargado', [
            'user_id' => auth()->id(),
            'archivo' => basename($ruta),
        ]);

        return response()->download($ruta, basename($ruta), [
            'Content-Type' => 'application/json',
            'Cache-Control' => 'no-store, no-cache, must-revalidate',
        ])->deleteFileAfterSend(true);
    }
}
