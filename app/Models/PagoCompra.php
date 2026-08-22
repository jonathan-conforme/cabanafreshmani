<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;


class PagoCompra extends BaseModel
{
    use HasFactory;

    protected $table = 'compra_pagos';

    protected $fillable = [
        'compra_id',
        'user_id',
        'monto',
        'metodo_pago',
        'fecha_pago',
        'observacion',
    ];

    public function compra()
    {
        return $this->belongsTo(Compra::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
