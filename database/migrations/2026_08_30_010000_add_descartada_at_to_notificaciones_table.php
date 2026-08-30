<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Permite "descartar" una notificación sin borrar la fila: si se elimina,
     * la sincronización automática la vuelve a crear mientras la condición
     * (stock bajo, compra vencida...) siga activa.
     */
    public function up(): void
    {
        Schema::table('notificaciones', function (Blueprint $table) {
            $table->timestamp('descartada_at')->nullable()->after('leida_at')->index();
        });
    }

    public function down(): void
    {
        Schema::table('notificaciones', function (Blueprint $table) {
            $table->dropIndex(['descartada_at']);
            $table->dropColumn('descartada_at');
        });
    }
};
