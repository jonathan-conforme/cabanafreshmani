<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;

class Notificacion extends BaseModel
{
    protected $table = 'notificaciones';

    /** Tipos que representan una condición del negocio que puede "resolverse" sola. */
    public const TIPOS_CONDICION = [
        'stock_bajo',
        'sin_stock',
        'compra_vencida',
        'compra_por_vencer',
    ];

    /** Permiso que da acceso al módulo completo de notificaciones. */
    public const PERMISO = 'ver_notificaciones';

    protected $fillable = [
        'tipo',
        'nivel',
        'titulo',
        'mensaje',
        'icono',
        'enlace',
        'referencia_tipo',
        'referencia_id',
        'clave',
        'leida_at',
        'descartada_at',
    ];

    protected $casts = [
        'leida_at' => 'datetime',
        'descartada_at' => 'datetime',
    ];

    protected $appends = ['leida'];

    /** Las descartadas quedan en la tabla (para no recrearlas) pero no se muestran. */
    public const SCOPE_VISIBLES = 'visibles';

    protected static function booted(): void
    {
        static::addGlobalScope(self::SCOPE_VISIBLES, function (Builder $query): void {
            $query->whereNull('descartada_at');
        });
    }

    public function getLeidaAttribute(): bool
    {
        return $this->leida_at !== null;
    }

    public function scopeNoLeidas(Builder $query): Builder
    {
        return $query->whereNull('leida_at');
    }

    public function scopeLeidas(Builder $query): Builder
    {
        return $query->whereNotNull('leida_at');
    }

    public function scopeDelTipo(Builder $query, ?string $tipo): Builder
    {
        return $tipo ? $query->where('tipo', $tipo) : $query;
    }

    public function marcarComoLeida(): void
    {
        if ($this->leida_at === null) {
            $this->forceFill(['leida_at' => now()])->save();
        }
    }

    /**
     * Oculta la notificación conservando la fila: la sincronización la
     * encuentra por su clave y no la vuelve a crear.
     */
    public function descartar(): void
    {
        $this->forceFill([
            'descartada_at' => now(),
            'leida_at' => $this->leida_at ?? now(),
        ])->save();
    }
}
