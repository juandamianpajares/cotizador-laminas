#!/bin/bash

# Script de inicialización de base de datos para WSL
# Cotizador de Láminas y Films

set -e

echo "🚀 Iniciando configuración de base de datos en WSL..."
echo ""

# Colores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# 1. Verificar si MySQL está instalado
echo "📋 Verificando MySQL..."
if ! command -v mysql &> /dev/null; then
    echo -e "${RED}❌ MySQL no está instalado en WSL${NC}"
    echo ""
    echo "Instalando MySQL..."
    sudo apt update
    sudo apt install mariadb-server -y
    echo -e "${GREEN}✅ MySQL instalado${NC}"
fi

# 2. Iniciar servicio MySQL
echo ""
echo "🔧 Iniciando servicio MySQL..."
sudo service mysql start

if sudo service mysql status | grep -q "running"; then
    echo -e "${GREEN}✅ MySQL está corriendo${NC}"
else
    echo -e "${RED}❌ Error: MySQL no pudo iniciarse${NC}"
    exit 1
fi

# 3. Crear base de datos
echo ""
echo "🗄️  Creando base de datos..."

sudo mysql -e "CREATE DATABASE IF NOT EXISTS cotizador_laminas CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;" 2>/dev/null

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Base de datos 'cotizador_laminas' creada${NC}"
else
    echo -e "${YELLOW}⚠️  La base de datos ya existe o hubo un error${NC}"
fi

# 4. Mostrar información de conexión
echo ""
echo "📊 Información de conexión:"
echo "   Host: localhost"
echo "   Puerto: 3306"
echo "   Database: cotizador_laminas"
echo "   User: root"
echo ""

# 5. Generar cliente Prisma
echo "🔨 Generando cliente Prisma..."
npm run db:generate

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Cliente Prisma generado${NC}"
else
    echo -e "${RED}❌ Error generando cliente Prisma${NC}"
    exit 1
fi

# 6. Aplicar schema a la base de datos
echo ""
echo "📤 Aplicando schema a la base de datos..."
npm run db:push

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Schema aplicado exitosamente${NC}"
else
    echo -e "${RED}❌ Error aplicando schema${NC}"
    exit 1
fi

# 7. Cargar datos de ejemplo (opcional)
echo ""
read -p "¿Deseas cargar productos de ejemplo? (s/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[SsYy]$ ]]; then
    echo "📦 Cargando productos de ejemplo..."
    npx tsx lib/seed.ts

    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Productos de ejemplo cargados${NC}"
    else
        echo -e "${YELLOW}⚠️  Error cargando productos de ejemplo${NC}"
    fi
fi

echo ""
echo -e "${GREEN}🎉 ¡Configuración completada!${NC}"
echo ""
echo "Siguiente paso:"
echo "  npm run dev"
echo ""
echo "Explorar base de datos:"
echo "  npm run db:studio"
echo ""
