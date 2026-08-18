<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;

class Cliente extends BaseModel
{
    use HasFactory;

    protected $fillable = [
        'nombre',
        'apellido',
        'identificacion',
        'telefono',
        'email',
        'limite_credito',
        'direccion',

    ];
}
