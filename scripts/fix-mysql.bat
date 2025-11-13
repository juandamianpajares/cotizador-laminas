@echo off
REM Script para configurar usuario MySQL
REM Ejecutar como administrador

echo ========================================
echo   Configurar Usuario MySQL
echo ========================================
echo.

REM Opción 1: Crear usuario 'juan'
echo Creando usuario 'juan' en MySQL...
echo.
echo Por favor ingresa el password de root de MySQL cuando se solicite.
echo Si MySQL no tiene password, solo presiona Enter.
echo.

mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS cotizador_laminas CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci; CREATE USER IF NOT EXISTS 'juan'@'localhost' IDENTIFIED BY 'Cambiala1234'; GRANT ALL PRIVILEGES ON cotizador_laminas.* TO 'juan'@'localhost'; FLUSH PRIVILEGES;"

if %errorlevel% equ 0 (
    echo.
    echo ========================================
    echo   Usuario 'juan' creado exitosamente!
    echo ========================================
    echo.
    echo Ahora ejecuta:
    echo   npm run db:push
    echo   npm run db:seed
    echo.
) else (
    echo.
    echo ERROR: No se pudo crear el usuario.
    echo.
    echo Prueba manualmente:
    echo 1. Abre MySQL: mysql -u root -p
    echo 2. Ejecuta estos comandos:
    echo.
    echo    CREATE DATABASE IF NOT EXISTS cotizador_laminas;
    echo    CREATE USER IF NOT EXISTS 'juan'@'localhost' IDENTIFIED BY 'Cambiala1234';
    echo    GRANT ALL PRIVILEGES ON cotizador_laminas.* TO 'juan'@'localhost';
    echo    FLUSH PRIVILEGES;
    echo    EXIT;
    echo.
)

pause
