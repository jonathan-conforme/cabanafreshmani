<?php

namespace App\Services\Reporte;

use App\Models\Caja;
use App\Models\Compra;
use App\Models\MovimientoInventario;
use App\Models\Producto;
use App\Models\Venta;
use App\Models\VentaDetalle;
use Illuminate\Support\Facades\DB;

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

    /**
     * Cuentas por cobrar: ventas a credito registradas en el rango.
     * Se agrupan por cliente para ver a quien se le debe reclamar el dinero.
     */
    /**
     * Cuentas por cobrar: ventas a crédito o pendientes de cobro.
     */
    public function cuentasPorCobrar(array $filtros): array
    {
        // Consulta base ajustada a tu base de datos real
        $baseQuery = Venta::where(function($query) {
            $query->where('metodo_pago', 'credito')
                  ->orWhere('estado', 'pendiente');
        });

        // Aplicamos el filtro de fechas opcionalmente si se especificó
        if (!empty($filtros['desde'])) {
            $baseQuery->whereDate('ventas.created_at', '>=', $filtros['desde']);
        }
        if (!empty($filtros['hasta'])) {
            $baseQuery->whereDate('ventas.created_at', '<=', $filtros['hasta']);
        }

        $totales = (clone $baseQuery)
            ->selectRaw('COUNT(*) as cantidad, COALESCE(SUM(total - pago_con), SUM(total)) as total, COALESCE(AVG(total), 0) as promedio')
            ->first();

        // Clientes distintos con deuda acumulada
        $totales->clientes = (clone $baseQuery)
            ->distinct()
            ->count(DB::raw('COALESCE(cliente_id, 0)'));

        $porCliente = (clone $baseQuery)
            ->leftJoin('clientes', 'clientes.id', '=', 'ventas.cliente_id')
            ->selectRaw("
                clientes.id,
                COALESCE(NULLIF(TRIM(CONCAT(COALESCE(clientes.nombre, ''), ' ', COALESCE(clientes.apellido, ''))), ''), 'Consumidor Final') as nombre,
                clientes.identificacion,
                clientes.telefono,
                clientes.limite_credito,
                COUNT(ventas.id) as cantidad,
                SUM(COALESCE(ventas.total - ventas.pago_con, ventas.total)) as total
            ")
            ->groupBy('clientes.id', 'clientes.nombre', 'clientes.apellido', 'clientes.identificacion', 'clientes.telefono', 'clientes.limite_credito')
            ->orderByDesc('total')
            ->get();

       $ventasCredito = (clone $baseQuery)
            ->with(['user:id,name', 'cliente:id,nombre,apellido,identificacion,telefono', 'pagos'])
            ->latest()
            ->paginate(10, ['*'], 'page')
            ->withQueryString();

        return compact('totales', 'porCliente', 'ventasCredito');
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
