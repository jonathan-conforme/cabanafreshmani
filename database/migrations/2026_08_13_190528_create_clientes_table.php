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
        Schema::create('clientes', function (Blueprint $table) {
            $table->id();
            $table->string('nombre', 100)->index();
            $table->string('apellido', 100)->index();
            $table->string('identificacion', 13)->unique();
            $table->string('telefono', 13)->nullable();
            $table->string('email', 100)->nullable();
            $table->decimal('limite_credito', 10, 2)->nullable();
            $table->string('direccion', 255)->nullable();

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('clientes');
    }
};
