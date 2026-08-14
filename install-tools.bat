@echo off
REM Script de instalación automática de herramientas para Laravel
REM PHP 8.2.12, Composer 2.9.5, Node.js 24.18.0, npm 11.6.2, Laravel 12

echo.
echo ====================================
echo Instalacion de herramientas Laravel
echo ====================================
echo.

REM Verificar si Chocolatey está instalado
choco -v >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Chocolatey no está instalado.
    echo Instala Chocolatey desde: https://chocolatey.org/install
    echo Luego ejecuta este script como Administrador.
    pause
    exit /b 1
)

echo [1/5] Instalando PHP 8.2.12...
choco install php --version=8.2.12 -y
if errorlevel 1 (
    echo [ERROR] No se pudo instalar PHP
    pause
    exit /b 1
)

echo [2/5] Instalando Composer 2.9.5...
choco install composer --version=2.9.5 -y
if errorlevel 1 (
    echo [ERROR] No se pudo instalar Composer
    pause
    exit /b 1
)

echo [3/5] Instalando Node.js 24.18.0...
choco install nodejs --version=24.18.0 -y
if errorlevel 1 (
    echo [ERROR] No se pudo instalar Node.js
    pause
    exit /b 1
)

echo [4/5] Actualizando npm a 11.6.2...
call npm install -g npm@11.6.2
if errorlevel 1 (
    echo [WARNING] No se pudo actualizar npm a la versión específica
)

echo [5/5] Instalando Laravel...
composer global require laravel/installer
if errorlevel 1 (
    echo [WARNING] Hubo un problema instalando Laravel
)

echo.
echo ====================================
echo Verificando instalaciones...
echo ====================================
echo.

php -v
echo.
composer --version
echo.
node -v
echo.
npm -v
echo.

echo.
echo ====================================
echo Instalacion completada!
echo ====================================
echo.
pause
