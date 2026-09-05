<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Empresa extends Model
{
    use HasFactory;

    protected $table = 'empresas';

    protected $fillable = [
        'razon_social',
        'nombre_comercial',
        'ruc',
        'telefono',
        'email',
        'direccion_matriz',
        'direccion_establecimiento',
        'obligado_contabilidad',
        'contribuyente_especial',
        'ambiente_sri',
        'logo_path',
        'leyenda_ticket',
    ];

    protected $casts = [
        'obligado_contabilidad' => 'boolean',
    ];
}
