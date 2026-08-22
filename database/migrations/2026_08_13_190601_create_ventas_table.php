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
        Schema::create('ventas', function (Blueprint $table) {
           $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('restrict');
            $table->foreignId('cliente_id')->nullable()->constrained('clientes')->onDelete('set null');
            $table->foreignId('caja_id')->constrained('cajas')->onDelete('restrict');
            $table->decimal('total', 10, 2);
            $table->decimal('pago_con', 10, 2)->nullable();
            $table->decimal('vuelto', 10, 2)->default(0);
            $table->enum('metodo_pago', ['efectivo', 'tarjeta', 'transferencia', 'credito'])->default('efectivo');
            $table->enum('estado', ['completada', 'pendiente', 'cancelada'])->default('completada');
            $table->timestamps();

            // Índices para velocidad en reportes de ventas y cierres de caja
            $table->index('created_at');
            $table->index(['caja_id', 'estado']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('ventas');
    }
};
