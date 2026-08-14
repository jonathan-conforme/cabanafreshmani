<?php


use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('movimientos_inventario', function (Blueprint $table) {
            $table->id();
            $table->foreignId('producto_id')->constrained('productos')->onDelete('cascade');
            $table->enum('tipo', ['venta', 'compra', 'ajuste', 'merma']);
            $table->decimal('cantidad', 10, 3); // Positivo (entrada) o Negativo (salida)
            $table->string('descripcion')->nullable();
            $table->timestamps();

            // Índices para reporte de Kardex por producto e historial de inventario por tipo
            $table->index(['producto_id', 'created_at']);
            $table->index(['tipo', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('movimientos_inventario');
    }
};
