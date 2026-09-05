<?php

namespace App\Services;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Schema;
use RuntimeException;

class ExportService
{
    /**
     * Tablas que se exportan, ordenadas por dependencia (padres primero)
     * para que el archivo se pueda reimportar sin romper las llaves foraneas.
     */
    public const TABLAS = [
        'users',
        'roles',
        'permissions',
        'model_has_roles',
        'model_has_permissions',
        'role_has_permissions',
        'unidades_medida',
        'clientes',
        'proveedores',
        'productos',
        'cajas',
        'ventas',
        'venta_detalles',
        'compras',
        'compra_detalles',
        'compra_pagos',
        'movimientos_inventario',
        'notificaciones',
    ];

    /**
     * Columnas que nunca salen del servidor. El backup viaja como JSON plano a
     * la carpeta de descargas de quien lo pide, asi que no puede llevar
     * credenciales: el hash bcrypt permite ataque offline de diccionario y el
     * remember_token es una sesion viva reutilizable tal cual.
     *
     * Al restaurar, los usuarios quedan sin contrasena y hay que reasignarla.
     */
    protected const COLUMNAS_EXCLUIDAS = [
        'users' => ['password', 'remember_token'],
    ];

    protected const DIRECTORIO = 'backups';

    protected const FLAGS_JSON = JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_INVALID_UTF8_SUBSTITUTE;

    /**
     * Trae el contenido completo de cada tabla solicitada.
     * Las tablas inexistentes se omiten en lugar de reventar la exportacion.
     *
     * @param  array<int, string>|null  $tablas
     * @return array<string, array<int, array<string, mixed>>>
     */
    public function exportarTablas(?array $tablas = null): array
    {
        $datos = [];

        foreach ($this->tablasDisponibles($tablas) as $tabla) {
            $datos[$tabla] = $this->filas($tabla);
        }

        return $datos;
    }

    /**
     * Escribe el backup en disco tabla por tabla (solo una tabla vive en memoria
     * a la vez) y devuelve la ruta absoluta del archivo generado.
     */
    public function generarArchivo(?array $tablas = null): string
    {
        if (function_exists('set_time_limit')) {
            @set_time_limit(600);
        }

        $directorio = storage_path('app/'.self::DIRECTORIO);
        File::ensureDirectoryExists($directorio);

        $ruta = $directorio.DIRECTORY_SEPARATOR.$this->nombreArchivo();
        $disponibles = $this->tablasDisponibles($tablas);
        $handle = fopen($ruta, 'w');

        if ($handle === false) {
            throw new RuntimeException("No se pudo crear el archivo de backup en {$ruta}.");
        }

        try {
            fwrite($handle, '{"meta":'.json_encode($this->metadatos($tablas), self::FLAGS_JSON));
            fwrite($handle, ',"tablas":{');

            $primera = true;
            foreach ($disponibles as $tabla) {
                fwrite($handle, ($primera ? '' : ',')
                    .json_encode($tabla, self::FLAGS_JSON)
                    .':'
                    .json_encode($this->filas($tabla), self::FLAGS_JSON));

                $primera = false;
            }

            fwrite($handle, '}}');
        } finally {
            fclose($handle);
        }

        return $ruta;
    }

    /**
     * Conteo de registros por tabla, para mostrarlo en la vista antes de descargar.
     *
     * @return array<int, array<string, mixed>>
     */
    public function resumenTablas(?array $tablas = null): array
    {
        return collect($tablas ?? self::TABLAS)
            ->map(function (string $tabla): array {
                $existe = Schema::hasTable($tabla);

                return [
                    'tabla' => $tabla,
                    'existe' => $existe,
                    'registros' => $existe ? DB::table($tabla)->count() : 0,
                ];
            })
            ->values()
            ->all();
    }

    public function nombreArchivo(): string
    {
        return 'backup-'.now()->format('Y-m-d_His').'.json';
    }

    /**
     * @return array<string, mixed>
     */
    public function metadatos(?array $tablas = null): array
    {
        $solicitadas = $tablas ?? self::TABLAS;

        return [
            'aplicacion' => config('app.name'),
            'entorno' => app()->environment(),
            'conexion' => config('database.default'),
            'base_datos' => DB::getDatabaseName(),
            'generado_en' => now()->toIso8601String(),
            'version_formato' => 1,
            'tablas_exportadas' => $this->tablasDisponibles($solicitadas),
            'tablas_omitidas' => array_values(array_diff($solicitadas, $this->tablasDisponibles($solicitadas))),
            'columnas_excluidas' => self::COLUMNAS_EXCLUIDAS,
        ];
    }

    /**
     * @return array<int, string>
     */
    protected function tablasDisponibles(?array $tablas = null): array
    {
        return array_values(array_filter(
            $tablas ?? self::TABLAS,
            fn (string $tabla): bool => Schema::hasTable($tabla)
        ));
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    protected function filas(string $tabla): array
    {
        $ocultas = self::COLUMNAS_EXCLUIDAS[$tabla] ?? [];

        return DB::table($tabla)
            ->get()
            ->map(fn ($fila): array => array_diff_key((array) $fila, array_flip($ocultas)))
            ->all();
    }
}
