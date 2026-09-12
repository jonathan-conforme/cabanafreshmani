<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;

class EgresoCaja extends BaseModel
{
    use HasFactory;

    protected $table = 'egresos_caja';

    protected $fillable = [
        'caja_id',
        'user_id',
        'monto',
        'concepto',
    ];

    public function caja()
    {
        return $this->belongsTo(Caja::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}