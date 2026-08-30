<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('notificaciones', function (Blueprint $table) {
            $table->id();
            $table->string('tipo', 40)->index();                 // stock_bajo, sin_stock, compra_vencida, compra_por_vencer, resumen_ventas
            $table->string('nivel', 20)->default('info');         // info | warning | danger
            $table->string('titulo');
            $table->text('mensaje');
            $table->string('icono', 40)->nullable();              // nombre de icono lucide-react para el front
            $table->string('enlace')->nullable();                 // ruta a la que lleva la notificación
            $table->string('referencia_tipo', 40)->nullable();    // producto, compra, venta...
            $table->unsignedBigInteger('referencia_id')->nullable();
            $table->string('clave')->nullable()->unique();        // clave estable para no duplicar (ej. stock_bajo:producto:12)
            $table->timestamp('leida_at')->nullable();
            $table->timestamps();

            $table->index(['leida_at', 'created_at']);
            $table->index(['referencia_tipo', 'referencia_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('notificaciones');
    }
};
