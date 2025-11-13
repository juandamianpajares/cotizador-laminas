#!/bin/bash

# Script de inicialización de base de datos
# Ejecutar: bash scripts/init-db.sh

echo "🚀 Inicializando base de datos..."

# Colores
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Verificar si existe .env
if [ ! -f .env ]; then
    echo -e "${RED}❌ Archivo .env no encontrado${NC}"
    echo "Copiando .env.example a .env..."
    cp .env.example .env
    echo -e "${BLUE}ℹ️  Por favor edita .env con tus credenciales de MySQL${NC}"
    exit 1
fi

# Generar cliente Prisma
echo -e "${BLUE}📦 Generando cliente Prisma...${NC}"
npm run db:generate

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Error generando cliente Prisma${NC}"
    exit 1
fi

# Aplicar schema
echo -e "${BLUE}🗄️  Aplicando schema a la base de datos...${NC}"
npm run db:push

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Error aplicando schema${NC}"
    echo -e "${BLUE}ℹ️  Verifica que MySQL esté corriendo y las credenciales en .env sean correctas${NC}"
    exit 1
fi

# Seed (opcional)
read -p "¿Deseas cargar productos de ejemplo? (s/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Ss]$ ]]; then
    echo -e "${BLUE}🌱 Cargando productos de ejemplo...${NC}"
    npx tsx lib/seed.ts

    if [ $? -ne 0 ]; then
        echo -e "${RED}❌ Error cargando productos${NC}"
        exit 1
    fi
fi

echo -e "${GREEN}✅ ¡Base de datos inicializada correctamente!${NC}"
echo -e "${BLUE}ℹ️  Puedes explorar los datos con: npm run db:studio${NC}"
echo -e "${BLUE}ℹ️  Para iniciar el servidor: npm run dev${NC}"
