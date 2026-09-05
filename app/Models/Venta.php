<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;

class Venta extends BaseModel
{
    use HasFactory;

    protected $fillable = [
        'caja_id',
        'user_id',
        'cliente_id',
        'metodo_pago',
        'estado',
        'total',
        'pago_con',
        'vuelto',
        'saldo_pendiente',
        // Campos SRI
        'establecimiento',
        'punto_emision',
        'secuencial',
        'numero_factura',
        'clave_acceso',
        'sri_estado',
        'fecha_autorizacion',
        'sri_mensaje',
        'xml_path',
        'pdf_path',
    ];

    protected $casts = [
        'total' => 'decimal:2',
        'pago_con' => 'decimal:2',
        'vuelto' => 'decimal:2',
        'saldo_pendiente' => 'decimal:2',
    ];

    public function caja()
    {
        return $this->belongsTo(Caja::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function cliente()
    {
        return $this->belongsTo(Cliente::class);
    }

    public function detalles()
    {
        return $this->hasMany(VentaDetalle::class, 'venta_id');
    }

    public function pagos()
    {
        return $this->hasMany(PagoVenta::class, 'venta_id');
    }

    // Generador automático del formato de factura completa si existen los 3 componentes
    public function getComprobanteCompletoAttribute(): string
    {
        if ($this->secuencial) {
            return "{$this->establecimiento}-{$this->punto_emision}-".str_pad($this->secuencial, 9, '0', STR_PAD_LEFT);
        }

        return "Venta #{$this->id}";
    }
}
