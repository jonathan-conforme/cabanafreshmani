<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;

class Proveedor extends BaseModel
{
     use HasFactory;

    protected $fillable = [
        'nombre',
        'contacto',
        'telefono',
        'email',
    ];
}
