<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * Las columnas ya vienen incluidas en las migraciones de creación de
     * `productos` y `ventas`, por lo que cada adición es condicional para que
     * `migrate:fresh` no falle con "Duplicate column name".
     */
    public function up(): void
    {
        Schema::table('productos', function (Blueprint $table) {
            // --- NUEVOS CAMPOS MAYORISTAS ---
            if (! Schema::hasColumn('productos', 'permite_unidad_mayor')) {
                $table->boolean('permite_unidad_mayor')->default(false)->after('stock');
            }
            if (! Schema::hasColumn('productos', 'nombre_unidad_mayor')) {
                $table->string('nombre_unidad_mayor', 50)->nullable()->after('permite_unidad_mayor'); // Ej: Saco
            }
            if (! Schema::hasColumn('productos', 'factor_conversion')) {
                $table->decimal('factor_conversion', 10, 3)->default(1.000)->after('nombre_unidad_mayor'); // Ej: 100
            }
            if (! Schema::hasColumn('productos', 'precio_unidad_mayor')) {
                $table->decimal('precio_unidad_mayor', 10, 2)->nullable()->after('factor_conversion'); // Ej: 32.00
            }
            if (! Schema::hasColumn('productos', 'precio_compra_unidad_mayor')) {
                $table->decimal('precio_compra_unidad_mayor', 10, 2)->nullable()->after('precio_unidad_mayor'); // Ej: 29.50
            }
        });

        Schema::table('ventas', function (Blueprint $table) {
            if (! Schema::hasColumn('ventas', 'saldo_pendiente')) {
                $table->decimal('saldo_pendiente', 10, 2)->default(0)->after('vuelto');
            }

            // --- CAMPOS SRI FACTURACIÓN ELECTRÓNICA ---
            if (! Schema::hasColumn('ventas', 'establecimiento')) {
                $table->string('establecimiento', 3)->default('001')->after('estado');
            }
            if (! Schema::hasColumn('ventas', 'punto_emision')) {
                $table->string('punto_emision', 3)->default('001')->after('establecimiento');
            }
            if (! Schema::hasColumn('ventas', 'secuencial')) {
                $table->string('secuencial', 9)->nullable()->after('punto_emision');
            }
            if (! Schema::hasColumn('ventas', 'numero_factura')) {
                $table->string('numero_factura', 17)->nullable()->after('secuencial')->index(); // Ejemplo: 001-001-000000001
            }
            if (! Schema::hasColumn('ventas', 'clave_acceso')) {
                $table->string('clave_acceso', 49)->nullable()->after('numero_factura')->unique();
            }
            if (! Schema::hasColumn('ventas', 'sri_estado')) {
                $table->enum('sri_estado', ['pendiente', 'recibido', 'autorizado', 'rechazado', 'devuelto'])
                      ->default('pendiente')->after('clave_acceso');
            }
            if (! Schema::hasColumn('ventas', 'fecha_autorizacion')) {
                $table->timestamp('fecha_autorizacion')->nullable()->after('sri_estado');
            }
            if (! Schema::hasColumn('ventas', 'sri_mensaje')) {
                $table->text('sri_mensaje')->nullable()->after('fecha_autorizacion');
            }
            if (! Schema::hasColumn('ventas', 'xml_path')) {
                $table->string('xml_path')->nullable()->after('sri_mensaje');
            }
            if (! Schema::hasColumn('ventas', 'pdf_path')) {
                $table->string('pdf_path')->nullable()->after('xml_path');
            }

            if (! Schema::hasIndex('ventas', ['sri_estado'])) {
                $table->index('sri_estado');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('ventas', function (Blueprint $table) {
            if (Schema::hasIndex('ventas', ['sri_estado'])) {
                $table->dropIndex(['sri_estado']);
            }
            if (Schema::hasIndex('ventas', ['clave_acceso'])) {
                $table->dropUnique(['clave_acceso']);
            }
            if (Schema::hasIndex('ventas', ['numero_factura'])) {
                $table->dropIndex(['numero_factura']);
            }

            $columnas = array_values(array_filter([
                'saldo_pendiente',
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
            ], fn (string $columna) => Schema::hasColumn('ventas', $columna)));

            if ($columnas !== []) {
                $table->dropColumn($columnas);
            }
        });

        Schema::table('productos', function (Blueprint $table) {
            $columnas = array_values(array_filter([
                'permite_unidad_mayor',
                'nombre_unidad_mayor',
                'factor_conversion',
                'precio_unidad_mayor',
                'precio_compra_unidad_mayor',
            ], fn (string $columna) => Schema::hasColumn('productos', $columna)));

            if ($columnas !== []) {
                $table->dropColumn($columnas);
            }
        });
    }
};
