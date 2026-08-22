<?php

namespace App\Services\Reporte;

use App\Models\Caja;
use App\Models\Compra;
use App\Models\MovimientoInventario;
use App\Models\Producto;
use App\Models\Venta;
use App\Models\VentaDetalle;

class ReporteService
{
    protected function rangoFechas(array $filtros): array
    {
        return [
            $filtros['desde'] ?? now()->startOfMonth()->toDateString(),
            $filtros['hasta'] ?? now()->toDateString(),
        ];
    }

    public function resumenVentas(array $filtros): array
    {
        [$desde, $hasta] = $this->rangoFechas($filtros);

        $baseQuery = Venta::whereDate('ventas.created_at', '>=', $desde)
            ->whereDate('ventas.created_at', '<=', $hasta)
            ->where('ventas.estado', 'completada');

        $totales = (clone $baseQuery)
            ->selectRaw('COUNT(*) as cantidad, COALESCE(SUM(total), 0) as total, COALESCE(AVG(total), 0) as promedio')
            ->first();

        $porDia = (clone $baseQuery)
            ->selectRaw('DATE(ventas.created_at) as fecha, COUNT(*) as cantidad, SUM(total) as total')
            ->groupBy('fecha')
            ->orderBy('fecha')
            ->get();

        $porMetodoPago = (clone $baseQuery)
            ->selectRaw('metodo_pago, COUNT(*) as cantidad, SUM(total) as total')
            ->groupBy('metodo_pago')
            ->orderByDesc('total')
            ->get();

        $porVendedor = (clone $baseQuery)
            ->join('users', 'users.id', '=', 'ventas.user_id')
            ->selectRaw('users.id, users.name, COUNT(ventas.id) as cantidad, SUM(ventas.total) as total')
            ->groupBy('users.id', 'users.name')
            ->orderByDesc('total')
            ->get();

        $ventas = (clone $baseQuery)
            ->with(['user:id,name', 'cliente:id,nombre'])
            ->latest()
            ->paginate(10, ['*'], 'page')
            ->withQueryString();

        return compact('totales', 'porDia', 'porMetodoPago', 'porVendedor', 'ventas');
    }

    public function resumenCompras(array $filtros): array
    {
        [$desde, $hasta] = $this->rangoFechas($filtros);

        $baseQuery = Compra::whereDate('fecha_compra', '>=', $desde)
            ->whereDate('fecha_compra', '<=', $hasta);

        $totales = (clone $baseQuery)
            ->selectRaw('COUNT(*) as cantidad, COALESCE(SUM(total), 0) as total, COALESCE(SUM(monto_pagado), 0) as pagado, COALESCE(SUM(total - monto_pagado), 0) as pendiente')
            ->first();

        $porProveedor = (clone $baseQuery)
            ->join('proveedores', 'proveedores.id', '=', 'compras.proveedor_id')
            ->selectRaw('proveedores.id, proveedores.nombre, COUNT(compras.id) as cantidad, SUM(compras.total) as total')
            ->groupBy('proveedores.id', 'proveedores.nombre')
            ->orderByDesc('total')
            ->get();

        $porEstado = (clone $baseQuery)
            ->selectRaw('estado, COUNT(*) as cantidad, SUM(total) as total')
            ->groupBy('estado')
            ->get();

        $compras = (clone $baseQuery)
            ->with(['proveedor:id,nombre'])
            ->latest('fecha_compra')
            ->paginate(10, ['*'], 'page')
            ->withQueryString();

        return compact('totales', 'porProveedor', 'porEstado', 'compras');
    }

    public function resumenInventario(array $filtros): array
    {
        [$desde, $hasta] = $this->rangoFechas($filtros);

        $valorInventario = Producto::selectRaw('COALESCE(SUM(stock * precio_compra), 0) as costo, COALESCE(SUM(stock * precio_venta), 0) as venta')
            ->first();

        $totalProductos = Producto::count();

        $productosStockBajo = Producto::stockBajo()
            ->activos()
            ->with('unidad')
            ->orderBy('stock')
            ->get();

        $porTipo = MovimientoInventario::whereDate('created_at', '>=', $desde)
            ->whereDate('created_at', '<=', $hasta)
            ->selectRaw('tipo, COUNT(*) as cantidad, SUM(ABS(cantidad)) as unidades')
            ->groupBy('tipo')
            ->get();

        return compact('valorInventario', 'totalProductos', 'productosStockBajo', 'porTipo');
    }

    public function productosMasVendidos(array $filtros): array
    {
        [$desde, $hasta] = $this->rangoFechas($filtros);
        $limite = (int) ($filtros['limite'] ?? 15);
        $limite = $limite > 0 ? min($limite, 100) : 15;

        $productos = VentaDetalle::join('ventas', 'ventas.id', '=', 'venta_detalles.venta_id')
            ->join('productos', 'productos.id', '=', 'venta_detalles.producto_id')
            ->whereDate('ventas.created_at', '>=', $desde)
            ->whereDate('ventas.created_at', '<=', $hasta)
            ->where('ventas.estado', 'completada')
            ->selectRaw('productos.id, productos.nombre, SUM(venta_detalles.cantidad) as cantidad_vendida, SUM(venta_detalles.subtotal) as ingresos')
            ->groupBy('productos.id', 'productos.nombre')
            ->orderByDesc('cantidad_vendida')
            ->limit($limite)
            ->get();

        return compact('productos');
    }

    public function historialCierresCaja(array $filtros): array
    {
        [$desde, $hasta] = $this->rangoFechas($filtros);

        $baseQuery = Caja::where('estado', 'cerrada')
            ->whereDate('fecha_cierre', '>=', $desde)
            ->whereDate('fecha_cierre', '<=', $hasta);

        $totales = (clone $baseQuery)
            ->selectRaw('COUNT(*) as cantidad, COALESCE(SUM(monto_apertura), 0) as total_apertura, COALESCE(SUM(monto_cierre), 0) as total_cierre, COALESCE(SUM(diferencia), 0) as total_diferencia')
            ->first();

        $porUsuario = (clone $baseQuery)
            ->join('users', 'users.id', '=', 'cajas.user_id')
            ->selectRaw('users.id, users.name, COUNT(cajas.id) as cantidad, SUM(cajas.diferencia) as diferencia')
            ->groupBy('users.id', 'users.name')
            ->orderByDesc('cantidad')
            ->get();

        $cierresCaja = (clone $baseQuery)
            ->with('user:id,name')
            ->latest('fecha_cierre')
            ->paginate(10, ['*'], 'page')
            ->withQueryString();

        return compact('totales', 'porUsuario', 'cierresCaja');
    }
}
