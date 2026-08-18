<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Producto extends BaseModel
{
    protected $table = 'productos';

    protected $fillable = [
        'unidad_id',
        'codigo_barras',
        'nombre',
        'es_granel',
        'precio_compra',
        'precio_venta',
        'stock',
        'stock_minimo',
    ];

    protected $casts = [
        'es_granel' => 'boolean',
        'precio_compra' => 'decimal:2',
        'precio_venta' => 'decimal:2',
        'stock' => 'decimal:3',
        'stock_minimo' => 'decimal:3',
    ];

    public function unidad(): BelongsTo
    {
        return $this->belongsTo(UnidadMedida::class, 'unidad_id');
    }
}
