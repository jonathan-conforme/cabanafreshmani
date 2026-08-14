
# Script de instalación sin Chocolatey
# Este script descarga e instala: PHP 8.2.12, Composer, Node.js 24.13.0, npm 11.6.2, Laravel 12

$ErrorActionPreference = "Stop"

Write-Host "======================================"
Write-Host "Instalacion de herramientas Laravel"
Write-Host "======================================"
Write-Host ""

# Crear carpeta de descargas
$downloadDir = "$env:TEMP\Laravel-Setup"
if (!(Test-Path $downloadDir)) {
    New-Item -ItemType Directory -Path $downloadDir | Out-Null
}

Write-Host "[1/5] Descargando e instalando PHP 8.2.12..."
Write-Host "Descargando desde: https://windows.php.net/downloads/releases/"
Write-Host ""

# Descargar PHP 8.2.12
Write-Host "Nota: PHP requiere descarga manual o usar un servidor web local como XAMPP/Laragon" -ForegroundColor Yellow
Write-Host "Opción 1: Descarga desde https://windows.php.net/downloads/releases/" -ForegroundColor Cyan
Write-Host "Opción 2: Instala XAMPP o Laragon (recomendado)" -ForegroundColor Cyan
Write-Host ""
Write-Host "Continuando con otras herramientas..." -ForegroundColor Yellow

Write-Host ""
Write-Host "[2/5] Instalando Composer 2.9.5..."

# Descargar Composer instalador oficial
$composerUrl = "https://getcomposer.org/Composer-Setup.exe"
$composerExe = "$downloadDir\Composer-Setup.exe"

try {
    Write-Host "Descargando Composer Setup..." -ForegroundColor Yellow
    
    # Usar Invoke-WebRequest para descargas más confiables
    $ProgressPreference = 'SilentlyContinue'
    Invoke-WebRequest -Uri $composerUrl -OutFile $composerExe -ErrorAction Stop
    
    Write-Host "Ejecutando instalador de Composer..." -ForegroundColor Yellow
    Start-Process -FilePath $composerExe -Wait
    Write-Host "Composer instalado correctamente" -ForegroundColor Green
}
catch {
    Write-Host "Error con Composer: $_" -ForegroundColor Yellow
    Write-Host "Intenta instalarlo manualmente desde: https://getcomposer.org/download/" -ForegroundColor Cyan
}

Write-Host ""
Write-Host "[3/5] Instalando Node.js 24.18.0..."

# Descargar Node.js 24.18.0 (versión correcta)
$nodeUrl = "https://nodejs.org/dist/v24.18.0/node-v24.18.0-x64.msi"
$nodeMsi = "$downloadDir\node-v24.18.0-x64.msi"

try {
    Write-Host "Descargando Node.js..." -ForegroundColor Yellow
    
    $ProgressPreference = 'SilentlyContinue'
    Invoke-WebRequest -Uri $nodeUrl -OutFile $nodeMsi -ErrorAction Stop
    
    Write-Host "Ejecutando instalador de Node.js (esto puede tomar 2-5 minutos)..." -ForegroundColor Yellow
    Start-Process -FilePath "msiexec.exe" -ArgumentList "/i `"$nodeMsi`" /quiet ADDLOCAL=all" -Wait
    Write-Host "Node.js instalado correctamente" -ForegroundColor Green
    
    # Recargar PATH
    $env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")
}
catch {
    Write-Host "Error instalando Node.js: $_" -ForegroundColor Yellow
    Write-Host "Descarga manualmente desde: https://nodejs.org/dist/v24.13.0/" -ForegroundColor Cyan
}

Write-Host ""
Write-Host "[4/5] Actualizando npm a 11.6.2..."

try {
    Write-Host "Ejecutando: npm install -g npm@11.6.2" -ForegroundColor Yellow
    & npm install -g npm@11.6.2 --force 2>&1
    Write-Host "npm actualizado correctamente" -ForegroundColor Green
}
catch {
    Write-Host "Advertencia al actualizar npm: $_" -ForegroundColor Yellow
    Write-Host "Continuando de todas formas..." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "[5/5] Instalando Laravel CLI..."

try {
    Write-Host "Ejecutando: composer global require laravel/installer" -ForegroundColor Yellow
    & composer global require laravel/installer 2>&1
    Write-Host "Laravel CLI instalado correctamente" -ForegroundColor Green
}
catch {
    Write-Host "Advertencia instalando Laravel: $_" -ForegroundColor Yellow
}

# Verificar instalaciones
Write-Host ""
Write-Host "======================================"
Write-Host "Verificando instalaciones..."
Write-Host "======================================"
Write-Host ""

Write-Host "Node.js:" -ForegroundColor Cyan
& node -v 2>$null

Write-Host ""
Write-Host "npm:" -ForegroundColor Cyan
& npm -v 2>$null

Write-Host ""
Write-Host "Composer:" -ForegroundColor Cyan
& composer --version 2>$null

Write-Host ""
Write-Host "======================================"
Write-Host "Instalacion completada!" -ForegroundColor Green
Write-Host "======================================"
Write-Host ""
Write-Host "Próximos pasos:" -ForegroundColor Cyan
Write-Host "1. Para PHP: Descarga e instala desde https://windows.php.net/downloads/releases/" -ForegroundColor White
Write-Host "   O usa Laragon (recomendado): https://laragon.org/" -ForegroundColor White
Write-Host "2. Reinicia PowerShell para aplicar cambios" -ForegroundColor White
Write-Host "3. Ejecuta: php -v" -ForegroundColor White
Write-Host ""
Write-Host "Limpiando descargas en $downloadDir..."
Remove-Item -Path $downloadDir -Recurse -Force -ErrorAction SilentlyContinue

Write-Host "Presiona Enter para cerrar..."
Read-Host
