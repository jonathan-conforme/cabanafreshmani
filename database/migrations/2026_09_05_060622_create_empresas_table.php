<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('empresas', function (Blueprint $table) {
            $table->id();
            // Identificación y Datos Comerciales
            $table->string('razon_social');
            $table->string('nombre_comercial')->nullable();
            $table->string('ruc', 13);
            $table->string('telefono', 20)->nullable();
            $table->string('email')->nullable();
            $table->text('direccion_matriz');
            $table->text('direccion_establecimiento')->nullable();

            // Parámetros SRI
            $table->boolean('obligado_contabilidad')->default(false);
            $table->string('contribuyente_especial')->nullable(); // N° de resolución
            $table->enum('ambiente_sri', ['1', '2'])->default('1'); // 1: Pruebas, 2: Producción
            $table->string('logo_path')->nullable();

            // Personalización de Comprobantes Imprimibles
            $table->string('leyenda_ticket')->default('¡Gracias por su compra!');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('empresas');
    }
};
