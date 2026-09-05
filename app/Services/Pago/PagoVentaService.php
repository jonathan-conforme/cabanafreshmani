<?php
namespace App\Services\Pago;

use App\Models\Caja;
use App\Models\PagoVenta;
use App\Models\Venta;
use Illuminate\Support\Facades\DB;
use Exception;

class PagoVentaService
{
  public function registrarPago(Venta $venta, array $datos, int $userId): PagoVenta
    {
        return DB::transaction(function () use ($venta, $datos, $userId) {
            // 1. Bloquear y recargar la venta actualizada desde la BD
            $ventaFresca = Venta::where('id', $venta->id)->lockForUpdate()->first();

            if ($ventaFresca->estado === 'completada') {
                throw new Exception('Esta cuenta ya se encuentra completamente pagada.');
            }

            // 2. Obtener caja abierta del usuario
            $caja = Caja::where('user_id', $userId)
                ->where('estado', 'abierta')
                ->first();

            if (!$caja) {
                throw new Exception('No tienes una caja abierta para recibir pagos.');
            }

            // 3. Calcular el saldo pendiente real en tiempo de ejecución
            $saldoActual = ((float) $ventaFresca->saldo_pendiente > 0)
                ? (float) $ventaFresca->saldo_pendiente
                : ((float) $ventaFresca->total - (float) $ventaFresca->pago_con);

            if ($saldoActual <= 0) {
                throw new Exception('Esta cuenta no posee saldo pendiente por cobrar.');
            }

            $montoAbono = (float) $datos['monto'];

            if ($montoAbono > $saldoActual) {
                throw new Exception("El monto excede el saldo pendiente ($" . number_format($saldoActual, 2) . ")");
            }

            // 4. Registrar el pago
            $pago = PagoVenta::create([
                'venta_id' => $ventaFresca->id,
                'user_id' => $userId,
                'caja_id' => $caja->id,
                'monto' => $montoAbono,
                'metodo_pago' => $datos['metodo_pago'],
                'observaciones' => $datos['observaciones'] ?? null,
            ]);

            // 5. Calcular nuevo saldo y estado
            $nuevoSaldo = max(0, $saldoActual - $montoAbono);

            $ventaFresca->update([
                'saldo_pendiente' => $nuevoSaldo,
                'estado'          => $nuevoSaldo <= 0 ? 'completada' : 'pendiente',
            ]);

            return $pago;
        });
    }
    }

