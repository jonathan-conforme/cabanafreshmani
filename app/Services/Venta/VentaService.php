<?php

namespace App\Services\Venta;

use App\Models\Caja;
use App\Models\Producto;
use App\Models\Venta;
use App\Services\Inventario\InventarioService;
use App\Services\Sri\SriService;
use Illuminate\Support\Facades\DB;

class VentaService
{
    public function __construct(
        protected InventarioService $inventarioService
    ) {}

    public function procesarVenta(array $data, int $userId, Caja $caja): Venta
    {
        return DB::transaction(function () use ($data, $userId, $caja) {
            $productoIds = collect($data['items'])->pluck('producto_id');

            $tieneInactivos = Producto::whereIn('id', $productoIds)
                ->where('activo', false)
                ->exists();

            if ($tieneInactivos) {
                throw new \InvalidArgumentException('Uno o más productos seleccionados están inactivos.');
            }

            $totalCalculado = collect($data['items'])->sum('subtotal');
            $descuento = $data['descuento'] ?? 0;
            $totalFinal = max(0, $totalCalculado - $descuento);
            $esCredito = ($data['metodo_pago'] ?? 'efectivo') === 'credito';

            // --- LÓGICA DE SECUENCIALES Y SRI ---
            $establecimiento = '001';
            $puntoEmision = '001';

            $ultimoSecuencial = Venta::where('establecimiento', $establecimiento)
                ->where('punto_emision', $puntoEmision)
                ->max('secuencial');

            $siguienteNumero = $ultimoSecuencial ? ((int) $ultimoSecuencial + 1) : 1;
            $secuencial = str_pad($siguienteNumero, 9, '0', STR_PAD_LEFT);
            $numeroFactura = "{$establecimiento}-{$puntoEmision}-{$secuencial}";

            // Generación de Clave de Acceso
            $rucEmisor = config('services.sri.ruc', '1790000000001'); // Ajusta con tu RUC real
            $ambiente = config('services.sri.ambiente', '1');       // 1: Pruebas, 2: Producción

            $claveAcceso = SriService::generarClaveAcceso(
                fechaEmision: now()->format('dmY'),
                tipoComprobante: '01',
                ruc: $rucEmisor,
                ambiente: $ambiente,
                establecimiento: $establecimiento,
                puntoEmision: $puntoEmision,
                secuencial: $secuencial,
                codigoNumerico: str_pad(rand(1, 99999998), 8, '0', STR_PAD_LEFT)
            );

            $venta = Venta::create([
                'user_id' => $userId,
                'cliente_id' => $data['cliente_id'],
                'caja_id' => $caja->id,
                'total' => $totalFinal,
                'metodo_pago' => $data['metodo_pago'],
                'estado' => $esCredito ? 'pendiente' : 'completada',
                'vuelto' => $esCredito ? 0 : ($data['vuelto'] ?? 0),
                'pago_con' => $esCredito ? 0 : ($data['pago_con'] ?? $totalFinal),
                'saldo_pendiente' => $esCredito ? $totalFinal : 0,

                // Datos SRI
                'establecimiento' => $establecimiento,
                'punto_emision' => $puntoEmision,
                'secuencial' => $secuencial,
                'numero_factura' => $numeroFactura,
                'clave_acceso' => $claveAcceso,
                'sri_estado' => 'pendiente',
            ]);

            foreach ($data['items'] as $item) {
                $producto = Producto::findOrFail($item['producto_id']);
                $valorIngresado = (float) ($item['cantidad_usuario'] ?? $item['cantidad']);
                $tipoVenta = strtolower(trim($item['tipo_venta'] ?? 'cantidad'));

                switch ($tipoVenta) {
                    case 'quintal':
                    case 'unidad_mayor':
                    case 'saco_50':
                        if (!$producto->permite_unidad_mayor) {
                            throw new \InvalidArgumentException("El producto '{$producto->nombre}' no está configurado para venta mayorista.");
                        }

                        $factorBd = (float) ($producto->factor_conversion ?? 1);
                        $factor = ($tipoVenta === 'saco_50') ? 50 : ($factorBd > 0 ? $factorBd : 1);
                        $cantidadLibras = $valorIngresado * $factor;
                        break;

                    case 'monto_exacto':
                        $precioLb = (float) ($producto->precio_venta ?? $producto->precio);
                        $cantidadLibras = $precioLb > 0 ? ($valorIngresado / $precioLb) : 0;
                        break;

                    default:
                        $cantidadLibras = $valorIngresado;
                        break;
                }

                $venta->detalles()->create([
                    'producto_id' => $producto->id,
                    'cantidad' => $cantidadLibras,
                    'precio_unitario' => $item['precio_unitario'],
                    'subtotal' => $item['subtotal'],
                ]);

                $this->inventarioService->registrarMovimiento(
                    productoId: $producto->id,
                    tipo: 'venta',
                    cantidad: $cantidadLibras,
                    costoUnitario: (float) $item['precio_unitario'],
                    descripcion: 'Venta POS #'.$venta->id,
                    origen: $venta
                );
            }

            return $venta;
        });
    }
}
