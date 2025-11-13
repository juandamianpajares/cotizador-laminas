@echo off
REM Script para iniciar MySQL con Docker
REM Ejecutar: start-mysql.bat

echo ========================================
echo   Iniciando MySQL con Docker
echo ========================================
echo.

REM Verificar si Docker está instalado
where docker >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Docker no esta instalado.
    echo.
    echo Por favor instala Docker Desktop desde:
    echo https://www.docker.com/products/docker-desktop
    echo.
    pause
    exit /b 1
)

echo Docker detectado!
echo.

REM Verificar si Docker está corriendo
docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Docker no esta corriendo.
    echo.
    echo Por favor inicia Docker Desktop y vuelve a ejecutar este script.
    echo.
    pause
    exit /b 1
)

echo Docker esta corriendo.
echo.

REM Iniciar MySQL
echo Iniciando contenedor MySQL...
docker-compose up -d

if %errorlevel% neq 0 (
    echo.
    echo ERROR: No se pudo iniciar MySQL.
    echo.
    pause
    exit /b 1
)

echo.
echo ========================================
echo   MySQL iniciado exitosamente!
echo ========================================
echo.
echo Esperando que MySQL este listo...
timeout /t 5 /nobreak >nul

echo.
echo Informacion de conexion:
echo   Host: localhost
echo   Puerto: 3306
echo   Database: cotizador_laminas
echo   Usuario: juan
echo   Password: Cambiala1234
echo.

echo Verificando conexion...
docker exec cotizador-mysql mysqladmin ping -h localhost -u juan -pCambiala1234 >nul 2>&1

if %errorlevel% equ 0 (
    echo.
    echo ========================================
    echo   MySQL esta listo para usar!
    echo ========================================
    echo.
    echo Siguiente paso:
    echo   npm run db:push
    echo   npm run db:seed
    echo.
) else (
    echo.
    echo MySQL esta iniciando... Espera unos segundos mas y ejecuta:
    echo   npm run db:push
    echo.
)

echo Para detener MySQL:
echo   docker-compose down
echo.
echo Para ver logs:
echo   docker logs cotizador-mysql -f
echo.

pause
