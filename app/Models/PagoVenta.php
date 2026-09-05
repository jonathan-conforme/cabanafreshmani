<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PagoVenta extends Model
{
    use HasFactory;

    protected $table = 'pago_ventas';

    protected $fillable = [
        'venta_id', 'user_id',
        'caja_id', 'monto',
        'metodo_pago',
        'observaciones'];

    public function venta()
    {
        return $this->belongsTo(Venta::class);
    }
}
