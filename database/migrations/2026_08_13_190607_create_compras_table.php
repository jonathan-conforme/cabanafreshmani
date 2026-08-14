<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('compras', function (Blueprint $table) {
           $table->id();
            $table->foreignId('proveedor_id')->constrained('proveedores')->onDelete('restrict');
            $table->foreignId('user_id')->constrained('users')->onDelete('restrict');
            $table->decimal('total', 10, 2);
           // --- NUEVOS CAMPOS PARA CRÉDITO Y CUENTAS POR PAGAR ---
            $table->enum('tipo_pago', ['contado', 'credito'])->default('contado');
            $table->enum('metodo_pago', ['efectivo', 'transferencia', 'tarjeta'])->default('efectivo');
            $table->enum('estado', ['pagada', 'pendiente', 'cancelada'])->default('pagada');
            $table->decimal('monto_pagado', 10, 2)->default(0.00); // Permite registrar abonos/pagos parciales
            $table->date('fecha_vencimiento')->nullable(); // Fecha límite dada por el proveedor

            $table->timestamp('fecha_compra')->useCurrent();
            $table->timestamps();

            // Índices para velocidad en reportes y alertas
            $table->index('created_at');
            // Índice compuesto para consultar instantáneamente "Cuentas por Pagar Vencidas o por Vencer"
            $table->index(['estado', 'fecha_vencimiento']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('compras');
    }
};
