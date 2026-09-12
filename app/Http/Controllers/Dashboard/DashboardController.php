<?php

namespace App\Http\Controllers\Dashboard;

use App\Services\Dashboard\DashboardService;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Response;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function __construct(
        protected DashboardService $dashboardService
    ) {}

    public function index(Request $request): Response
    {
       $periodo = $request->input('periodo', 'dias');

        return Inertia::render('Dashboard', $this->dashboardService->paraVista($periodo));    }
}
