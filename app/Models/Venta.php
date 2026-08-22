<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;



class Venta extends BaseModel
{
    use HasFactory;

    protected $fillable = [
        'caja_id',
        'user_id',
        'cliente_id',
        'metodo_pago',
        'subtotal',
        'descuento',
        'total',
    ];

    public function caja()
    {
        return $this->belongsTo(Caja::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function cliente()
    {
        return $this->belongsTo(Cliente::class);
    }

    public function detalles()
    {
        return $this->hasMany(VentaDetalle::class, 'venta_id');
    }
}
