<?php

namespace App\Services\Sri;

class SriService
{
    /**
     * Genera la Clave de Acceso de 49 dígitos para el SRI (Ecuador)
     */
    public static function generarClaveAcceso(
        string $fechaEmision,     // Formato ddmmyyyy
        string $tipoComprobante, // '01' para Factura
        string $ruc,             // RUC del emisor (13 dígitos)
        string $ambiente,        // '1' Pruebas, '2' Producción
        string $establecimiento, // 3 dígitos (Ej: 001)
        string $puntoEmision,    // 3 dígitos (Ej: 001)
        string $secuencial,      // 9 dígitos (Ej: 000000001)
        string $codigoNumerico = '12345678', // 8 dígitos aleatorios o fijos
        string $tipoEmision = '1' // '1' Emisión Normal
    ): string {
        $clave48 = $fechaEmision
            . $tipoComprobante
            . $ruc
            . $ambiente
            . $establecimiento
            . $puntoEmision
            . $secuencial
            . $codigoNumerico
            . $tipoEmision;

        $digitoVerificador = self::calcularModulo11($clave48);

        return $clave48 . $digitoVerificador;
    }

    /**
     * Algoritmo Módulo 11 para la clave del SRI
     */
    private static function calcularModulo11(string $cadena): int
    {
        $factor = 2;
        $suma = 0;

        for ($i = strlen($cadena) - 1; $i >= 0; $i--) {
            $suma += (int) $cadena[$i] * $factor;
            $factor = ($factor === 7) ? 2 : $factor + 1;
        }

        $resto = $suma % 11;
        $dv = 11 - $resto;

        if ($dv === 11) {
            return 0;
        }
        if ($dv === 10) {
            return 1;
        }

        return $dv;
    }
}
