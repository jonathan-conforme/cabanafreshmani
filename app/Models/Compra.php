<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;


class Compra extends BaseModel
{
    use HasFactory;

    protected $table = 'compras';

    protected $fillable = [
        'proveedor_id',
        'user_id',
        'total',
        'tipo_pago',
        'metodo_pago',
        'estado',
        'monto_pagado',
        'fecha_vencimiento',
        'fecha_compra',
        'factura',
    ];

    protected $casts = [
        'total' => 'decimal:2',
        'monto_pagado' => 'decimal:2',
        'fecha_vencimiento' => 'date',
        'fecha_compra' => 'datetime',
    ];

    public function proveedor()
    {
        return $this->belongsTo(Proveedor::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function detalles()
    {
        return $this->hasMany(CompraDetalle::class);
    }
}
