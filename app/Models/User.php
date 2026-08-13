<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Spatie\Permission\Traits\HasRoles;
use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\Relations\HasMany;


class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable, HasRoles;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }
/* -------------------------------------------------------------------------- */
    /* RELACIONES CON EL MODELADO DE NEGOCIO                                      */
    /* -------------------------------------------------------------------------- */

    /**
     * Cajas abiertas/cerradas por este empleado.
     */
    public function cajas(): HasMany
    {
        return $this->hasMany(Caja::class);
    }

    /**
     * Ventas realizadas por este vendedor (fritada o general).
     */
    public function ventas(): HasMany
    {
        return $this->hasMany(Venta::class);
    }

    /* -------------------------------------------------------------------------- */
    /* SCOPES Y MÉTODOS DE APOYO (Para mantener limpia la lógica de negocio)     */
    /* -------------------------------------------------------------------------- */

    /**
     * Filtrar usuarios que son vendedores (fritada o general).
     * Uso: User::vendedores()->get();
     */
    public function scopeVendedores($query)
    {
        return $query->role(['vendedor', 'vendedor_fritada']);
    }

    /**
     * Helper rápido para obtener el nombre legible del rol principal del usuario.
     */
    public function getRolNombreAttribute(): string
    {
        $role = $this->roles->first()?->name;

        return match ($role) {
            'administrador'    => 'Administrador',
            'vendedor'         => 'Vendedor General',
            'vendedor_fritada' => 'Vendedor Fritada',
            default            => 'Sin Rol',
        };
    }
}

