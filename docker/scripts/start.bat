@echo off
REM ============================================================================
REM Start Script - Cotizador de Láminas (Windows)
REM ============================================================================

echo.
echo [92m================================================[0m
echo [92m   Cotizador de Laminas - Docker Setup[0m
echo [92m================================================[0m
echo.

REM Check if .env exists
if not exist .env (
    echo [93mNo se encontro .env, copiando desde .env.example...[0m
    copy .env.example .env
    echo [92mArchivo .env creado[0m
    echo.
)

REM Ask for mode
echo Selecciona el modo de ejecucion:
echo 1^) Produccion ^(optimizado^)
echo 2^) Desarrollo ^(con hot-reload^)
echo.
set /p MODE="Opcion [1/2]: "

if "%MODE%"=="2" (
    echo.
    echo [94mIniciando en modo DESARROLLO...[0m
    docker-compose -f docker-compose.dev.yml up -d --build
    set COMPOSE_FILE=docker-compose.dev.yml
) else (
    echo.
    echo [94mIniciando en modo PRODUCCION...[0m
    docker-compose up -d --build
    set COMPOSE_FILE=docker-compose.yml
)

echo.
echo [92mServicios iniciados correctamente[0m
echo.
echo Esperando a que los servicios esten listos...
timeout /t 10 /nobreak > nul

echo.
echo ================================================
echo [92m    APLICACION LISTA[0m
echo ================================================
echo.
echo  Aplicacion Web:    http://localhost:3000
echo  phpMyAdmin:        http://localhost:8080
echo  Health Check:      http://localhost:3000/api/health
echo.
echo ================================================
echo.
echo Comandos utiles:
echo   Ver logs:        docker-compose -f %COMPOSE_FILE% logs -f
echo   Detener:         docker-compose -f %COMPOSE_FILE% down
echo   Reiniciar:       docker-compose -f %COMPOSE_FILE% restart
echo.
pause
