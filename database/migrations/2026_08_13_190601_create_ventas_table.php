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
            $table->decimal('saldo_pendiente', 10, 2)->default(0);
            $table->enum('metodo_pago', ['efectivo', 'tarjeta', 'transferencia', 'credito'])->default('efectivo');
            $table->enum('estado', ['completada', 'pendiente', 'cancelada'])->default('completada');

            // --- CAMPOS SRI FACTURACIÓN ELECTRÓNICA ---
            $table->string('establecimiento', 3)->default('001');
            $table->string('punto_emision', 3)->default('001');
            $table->string('secuencial', 9)->nullable();
            $table->string('numero_factura', 17)->nullable()->index(); // Ejemplo: 001-001-000000001
            $table->string('clave_acceso', 49)->nullable()->unique();
            $table->enum('sri_estado', ['pendiente', 'recibido', 'autorizado', 'rechazado', 'devuelto'])
                  ->default('pendiente');
            $table->timestamp('fecha_autorizacion')->nullable();
            $table->text('sri_mensaje')->nullable();
            $table->string('xml_path')->nullable();
            $table->string('pdf_path')->nullable();

            $table->timestamps();

            // Índices para velocidad en búsquedas y reportes
            $table->index('created_at');
            $table->index(['caja_id', 'estado']);
            $table->index('sri_estado');
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
