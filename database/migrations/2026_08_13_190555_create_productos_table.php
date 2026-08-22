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
        Schema::create('productos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('unidad_id')->constrained('unidades_medida')->onDelete('restrict');
            $table->string('codigo_barras', 100)->nullable()->index(); // Lectura ultrarrápida de escáner
            $table->string('nombre')->index(); // Búsqueda rápida por nombre
            $table->boolean('es_granel')->default(true);
            $table->decimal('precio_compra', 10, 2)->default(0.00);
            $table->decimal('precio_venta', 10, 2);
            $table->decimal('stock_minimo', 10, 3)->default(0.000);
            $table->decimal('stock', 10, 3)->default(0.000);
            $table->boolean('activo')->default(true);
            $table->timestamps();

            // Índice compuesto para alertas veloces de reabastecimiento (stock bajo)
            $table->index(['stock', 'stock_minimo']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('productos');
    }
};
