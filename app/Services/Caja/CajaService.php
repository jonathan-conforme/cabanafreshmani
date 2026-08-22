<?php
namespace App\Services\Caja;

use App\Models\Caja;
use App\Models\Venta;
use Illuminate\Support\Facades\DB;

class CajaService
{
    public function getCajaAbierta(int $userId): ?Caja
    {
        return Caja::where('user_id', $userId)
            ->where('estado', 'abierta')
            ->first();
    }

    public function abrirCaja(int $userId, array $data): Caja
    {
        return Caja::create([
            'user_id' => $userId,
            'monto_apertura' => $data['monto_apertura'],
            'estado' => 'abierta',
            'fecha_apertura' => now(),
        ]);
    }

    public function cerrarCaja(Caja $caja, array $data): Caja
    {
        return DB::transaction(function () use ($caja, $data) {
            // Suma de ventas en efectivo en la caja actual
            $ventasEfectivo = Venta::where('caja_id', $caja->id)
                ->where('metodo_pago', 'efectivo')
                ->sum('total');

            $montoEsperado = $caja->monto_apertura + $ventasEfectivo;
            $diferencia = $data['monto_cierre'] - $montoEsperado;

            $caja->update([
                'monto_cierre' => $data['monto_cierre'],
                'monto_esperado' => $montoEsperado,
                'diferencia' => $diferencia,
                'estado' => 'cerrada',
                'observaciones' => $data['observaciones'] ?? null,
                'fecha_cierre' => now(),
            ]);

            return $caja;
        });
    }
}
