<?php
namespace App\Services\Venta;

use App\Models\Caja;
use App\Models\Venta;
use App\Services\Inventario\InventarioService;
use Illuminate\Support\Facades\DB;
use App\Models\Producto;

class VentaService
{
    public function __construct(
        protected InventarioService $inventarioService
    ) {}

    public function procesarVenta(array $data, int $userId, Caja $caja): Venta
{
    return DB::transaction(function () use ($data, $userId, $caja) {
        // Verificar si algún producto de la lista está inactivo
        $productoIds = collect($data['items'])->pluck('producto_id');

        $tieneInactivos = Producto::whereIn('id', $productoIds)
            ->where('activo', false)
            ->exists();

        if ($tieneInactivos) {
            throw new \InvalidArgumentException('Uno o más productos seleccionados están inactivos y no se pueden vender.');
        }

        $totalCalculado = collect($data['items'])->sum('subtotal');
        $descuento = $data['descuento'] ?? 0;
        $totalFinal = max(0, $totalCalculado - $descuento);

        $venta = Venta::create([
            'user_id' => $userId,
            'cliente_id' => $data['cliente_id'],
            'caja_id' => $caja->id,
            'total' => $totalFinal,
            'metodo_pago' => $data['metodo_pago'],
            'estado' => 'completada',
            'vuelto' => $data['vuelto'] ?? 0,
            'pago_con' => $data['pago_con'] ?? $totalFinal
        ]);

        foreach ($data['items'] as $item) {
            $venta->detalles()->create([
                'producto_id' => $item['producto_id'],
                'cantidad' => $item['cantidad'],
                'precio_unitario' => $item['precio_unitario'],
                'subtotal' => $item['subtotal'],
            ]);

            $this->inventarioService->registrarMovimiento(
                productoId: $item['producto_id'],
                tipo: 'venta',
                cantidad: (float) $item['cantidad'],
                costoUnitario: (float) $item['precio_unitario'],
                descripcion: 'Venta POS #' . $venta->id,
                origen: $venta
            );
        }

        return $venta;
    });
}
}
