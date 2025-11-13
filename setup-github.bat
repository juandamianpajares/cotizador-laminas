@echo off
REM Script para configurar GitHub y hacer push inicial
REM Ejecutar: setup-github.bat

echo.
echo ========================================
echo   Setup GitHub - Cotizador Laminas
echo ========================================
echo.

REM Verificar si gh está instalado
where gh >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: GitHub CLI no esta instalado o no se encuentra en PATH
    echo.
    echo Por favor:
    echo 1. Cierra esta terminal
    echo 2. Abre una nueva terminal
    echo 3. Ejecuta este script de nuevo
    echo.
    echo Si persiste el error, reinstala GitHub CLI:
    echo   winget install --id GitHub.cli
    echo.
    pause
    exit /b 1
)

echo GitHub CLI detectado!
echo.

REM Verificar autenticación
echo Verificando autenticacion con GitHub...
gh auth status >nul 2>&1
if %errorlevel% neq 0 (
    echo.
    echo No estas autenticado en GitHub.
    echo.
    echo Ejecutando 'gh auth login'...
    echo Sigue las instrucciones en pantalla.
    echo.
    pause

    gh auth login

    if %errorlevel% neq 0 (
        echo.
        echo ERROR: Fallo la autenticacion.
        echo.
        pause
        exit /b 1
    )
)

echo.
echo Autenticacion exitosa!
echo.

REM Mostrar info del usuario
gh auth status
echo.

REM Preguntar tipo de repositorio
set /p repo_type="Repositorio PRIVADO o PUBLICO? (privado/publico) [privado]: "
if "%repo_type%"=="" set repo_type=privado

echo.
echo Creando repositorio '%repo_type%' en GitHub...
echo.

if /i "%repo_type%"=="publico" (
    gh repo create cotizador-laminas --public --source=. --remote=origin --push
) else (
    gh repo create cotizador-laminas --private --source=. --remote=origin --push
)

if %errorlevel% neq 0 (
    echo.
    echo ERROR: No se pudo crear el repositorio.
    echo.
    echo El repositorio puede ya existir. Intenta hacer push manualmente:
    echo   git push -u origin main
    echo.
    pause
    exit /b 1
)

echo.
echo ========================================
echo   EXITO! Repositorio creado y publicado
echo ========================================
echo.
echo Ver en GitHub:
gh repo view --web

echo.
echo Comandos utiles:
echo   gh repo view --web    Ver repositorio en navegador
echo   git status            Ver estado de Git
echo   git push              Subir cambios a GitHub
echo.

pause
