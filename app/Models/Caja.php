<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;

class Caja extends BaseModel
{

   use HasFactory;

    protected $fillable = [
        'user_id',
        'monto_apertura',
        'monto_cierre',
        'monto_esperado',
        'diferencia',
        'estado',
        'observaciones',
        'fecha_apertura',
        'fecha_cierre',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
