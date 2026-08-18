<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model as Eloquent;
use Illuminate\Support\Str;

abstract class BaseModel extends Eloquent
{
    /**
     * Resuelve el nombre de la tabla aplicando reglas de pluralización en español.
     */
    public function getTable(): string
    {
        if (isset($this->table)) {
            return $this->table;
        }

        $singular = Str::snake(class_basename($this));

        // Regla general en español: termina en vocal + 's', en consonante + 'es'
        if (preg_match('/[aeiou]$/i', $singular)) {
            return $singular . 's';
        }

        return $singular . 'es';
    }
}
