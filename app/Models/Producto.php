<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

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
        'activo',
    ];

    protected $casts = [
        'es_granel' => 'boolean',
        'precio_compra' => 'decimal:2',
        'precio_venta' => 'decimal:2',
        'stock' => 'decimal:3',
        'stock_minimo' => 'decimal:3',
        'activo' => 'boolean',
    ];

    protected $appends = ['es_stock_bajo'];

    public function getEsStockBajoAttribute(): bool
    {
        return $this->stock <= $this->stock_minimo;
    }

    public function scopeStockBajo(Builder $query): Builder
    {
        return $query->whereColumn('stock', '<=', 'stock_minimo');
    }

    public function unidad(): BelongsTo
    {
        return $this->belongsTo(UnidadMedida::class, 'unidad_id');
    }

    public function movimientos(): HasMany
    {
        return $this->hasMany(MovimientoInventario::class)->latest();
    }

    public function scopeActivos($query)
    {
        return $query->where('activo', true);
    }
}
