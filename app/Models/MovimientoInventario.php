<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;


class MovimientoInventario extends BaseModel
{
    use HasFactory;

    protected $table = 'movimientos_inventario';

    protected $fillable = [
        'producto_id',
        'tipo',
        'cantidad',
        'descripcion',
    ];

    protected $casts = [
        'cantidad' => 'decimal:3',
    ];

    public function producto()
    {
        return $this->belongsTo(Producto::class);
    }
}
