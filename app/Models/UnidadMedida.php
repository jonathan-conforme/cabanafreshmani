<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;


class UnidadMedida extends BaseModel
{
    use HasFactory;

    protected $table = 'unidades_medida';

    protected $fillable = [
        'nombre',
        'simbolo',
    ];
}
