@echo off
REM Script de inicialización de base de datos para Windows
REM Ejecutar: scripts\init-db.bat

echo Inicializando base de datos...

REM Verificar si existe .env
if not exist .env (
    echo ERROR: Archivo .env no encontrado
    echo Copiando .env.example a .env...
    copy .env.example .env
    echo Por favor edita .env con tus credenciales de MySQL
    pause
    exit /b 1
)

REM Generar cliente Prisma
echo Generando cliente Prisma...
call npm run db:generate
if %errorlevel% neq 0 (
    echo ERROR: No se pudo generar el cliente Prisma
    pause
    exit /b 1
)

REM Aplicar schema
echo Aplicando schema a la base de datos...
call npm run db:push
if %errorlevel% neq 0 (
    echo ERROR: No se pudo aplicar el schema
    echo Verifica que MySQL este corriendo y las credenciales en .env sean correctas
    pause
    exit /b 1
)

REM Seed
set /p seed="Deseas cargar productos de ejemplo? (s/n): "
if /i "%seed%"=="s" (
    echo Cargando productos de ejemplo...
    call npx tsx lib/seed.ts
    if %errorlevel% neq 0 (
        echo ERROR: No se pudieron cargar los productos
        pause
        exit /b 1
    )
)

echo.
echo Base de datos inicializada correctamente!
echo Puedes explorar los datos con: npm run db:studio
echo Para iniciar el servidor: npm run dev
pause
