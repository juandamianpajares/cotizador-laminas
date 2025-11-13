#!/bin/bash

# ============================================================================
# Start Script - Cotizador de Láminas
# ============================================================================
# Script para iniciar la aplicación con Docker

set -e

echo "🚀 Iniciando Cotizador de Láminas..."
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if .env exists
if [ ! -f .env ]; then
    echo -e "${YELLOW}⚠️  No se encontró .env, copiando desde .env.example...${NC}"
    cp .env.example .env
    echo -e "${GREEN}✓ Archivo .env creado${NC}"
    echo ""
fi

# Ask for mode
echo "Selecciona el modo de ejecución:"
echo "1) Producción (optimizado)"
echo "2) Desarrollo (con hot-reload)"
read -p "Opción [1/2]: " MODE

case $MODE in
    2)
        echo ""
        echo -e "${BLUE}🔧 Iniciando en modo DESARROLLO...${NC}"
        docker-compose -f docker-compose.dev.yml up -d --build
        COMPOSE_FILE="docker-compose.dev.yml"
        ;;
    *)
        echo ""
        echo -e "${BLUE}🚀 Iniciando en modo PRODUCCIÓN...${NC}"
        docker-compose up -d --build
        COMPOSE_FILE="docker-compose.yml"
        ;;
esac

echo ""
echo -e "${GREEN}✓ Servicios iniciados correctamente${NC}"
echo ""
echo "Esperando a que los servicios estén listos..."

# Wait for health checks
sleep 10

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${GREEN}✅ APLICACIÓN LISTA${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📱 Aplicación Web:    http://localhost:3000"
echo "🗄️  phpMyAdmin:        http://localhost:8080"
echo "❤️  Health Check:      http://localhost:3000/api/health"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Comandos útiles:"
echo "  Ver logs:        docker-compose -f $COMPOSE_FILE logs -f"
echo "  Detener:         docker-compose -f $COMPOSE_FILE down"
echo "  Reiniciar:       docker-compose -f $COMPOSE_FILE restart"
echo ""
