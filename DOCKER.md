# 🐳 Docker - Cotizador de Láminas

Configuración completa de Docker para desarrollo y producción del sistema de cotización de láminas.

---

## 📋 Tabla de Contenidos

1. [Requisitos Previos](#requisitos-previos)
2. [Arquitectura de Contenedores](#arquitectura-de-contenedores)
3. [Inicio Rápido](#inicio-rápido)
4. [Configuración Detallada](#configuración-detallada)
5. [Comandos Útiles](#comandos-útiles)
6. [Troubleshooting](#troubleshooting)
7. [Producción](#producción)

---

## 🔧 Requisitos Previos

- **Docker**: 20.10 o superior
- **Docker Compose**: 2.0 o superior
- **Git**: Para clonar el repositorio

### Verificar Instalación

```bash
docker --version
docker-compose --version
```

---

## 🏗️ Arquitectura de Contenedores

El sistema utiliza 3 servicios principales:

```
┌─────────────────────────────────────────────────────────┐
│                    Docker Network                        │
│                  (cotizador-network)                     │
│                                                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │   Next.js    │  │    MySQL     │  │  phpMyAdmin  │  │
│  │     App      │  │   Database   │  │  (Optional)  │  │
│  │              │  │              │  │              │  │
│  │  Port: 3000  │  │  Port: 3306  │  │  Port: 8080  │  │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘  │
│         │                 │                 │           │
│         └─────────────────┴─────────────────┘           │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

### Servicios

1. **`app`** - Aplicación Next.js 15
   - Puerto: `3000`
   - Healthcheck: `/api/health`
   - Ejecuta migraciones automáticamente al iniciar

2. **`db`** - MySQL 8.0
   - Puerto: `3306`
   - Volumen persistente: `mysql_data`
   - Configuración customizada en `docker/mysql/conf.d/`

3. **`phpmyadmin`** - Gestor de base de datos (opcional)
   - Puerto: `8080`
   - Acceso web: `http://localhost:8080`

---

## 🚀 Inicio Rápido

### 1. Clonar el Repositorio

```bash
git clone https://github.com/tu-usuario/cotizador-laminas.git
cd cotizador-laminas
```

### 2. Configurar Variables de Entorno

```bash
# Copiar archivo de ejemplo
cp .env.example .env

# Editar valores (opcional - ya tiene valores por defecto)
nano .env
```

### 3. Iniciar Todos los Servicios

```bash
# Construir e iniciar en background
docker-compose up -d --build

# Ver logs en tiempo real
docker-compose logs -f app
```

### 4. Acceder a la Aplicación

- **Aplicación Web**: http://localhost:3000
- **phpMyAdmin**: http://localhost:8080
- **Health Check**: http://localhost:3000/api/health

### 5. Detener los Servicios

```bash
# Detener sin eliminar volúmenes
docker-compose down

# Detener y eliminar TODO (incluyendo datos)
docker-compose down -v
```

---

## ⚙️ Configuración Detallada

### Variables de Entorno

Edita el archivo `.env`:

```bash
# ============================================================================
# BASE DE DATOS
# ============================================================================
MYSQL_ROOT_PASSWORD=Cambiala1234      # Contraseña del root de MySQL
MYSQL_DATABASE=cotizador_laminas      # Nombre de la base de datos
MYSQL_USER=juan                       # Usuario de la aplicación
MYSQL_PASSWORD=Cambiala1234           # Contraseña del usuario
MYSQL_PORT=3306                       # Puerto MySQL (cambiar si ya está en uso)

# ============================================================================
# APLICACIÓN
# ============================================================================
APP_PORT=3000                         # Puerto de la aplicación Next.js
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=production

# ============================================================================
# PHPMYADMIN
# ============================================================================
PHPMYADMIN_PORT=8080                  # Puerto phpMyAdmin
```

### Volúmenes Persistentes

Los datos se guardan en volúmenes Docker:

- **`mysql_data`**: Datos de la base de datos MySQL
- **`app_logs`**: Logs y caché de Next.js

```bash
# Ver volúmenes
docker volume ls

# Inspeccionar volumen
docker volume inspect cotizador-laminas_mysql_data

# Backup de base de datos
docker-compose exec db mysqldump -u root -p cotizador_laminas > backup.sql

# Restaurar backup
docker-compose exec -T db mysql -u root -p cotizador_laminas < backup.sql
```

---

## 🛠️ Comandos Útiles

### Gestión de Contenedores

```bash
# Ver estado de servicios
docker-compose ps

# Ver logs
docker-compose logs app          # Logs de la aplicación
docker-compose logs db           # Logs de MySQL
docker-compose logs -f --tail=50 app  # Últimas 50 líneas + seguimiento

# Reiniciar servicios
docker-compose restart app       # Solo la app
docker-compose restart           # Todos los servicios

# Reconstruir sin caché
docker-compose build --no-cache app
docker-compose up -d app
```

### Acceso a Contenedores

```bash
# Shell en contenedor de aplicación
docker-compose exec app sh

# Shell en contenedor de MySQL
docker-compose exec db bash

# MySQL CLI
docker-compose exec db mysql -u root -p cotizador_laminas
```

### Prisma y Base de Datos

```bash
# Ejecutar migraciones manualmente
docker-compose exec app npx prisma migrate deploy

# Generar Prisma Client
docker-compose exec app npx prisma generate

# Abrir Prisma Studio
docker-compose exec app npx prisma studio

# Reset completo de BD (CUIDADO - borra datos)
docker-compose exec app npx prisma migrate reset
```

### Limpiar y Mantenimiento

```bash
# Detener y eliminar contenedores
docker-compose down

# Eliminar volúmenes (CUIDADO - borra datos)
docker-compose down -v

# Limpiar imágenes sin usar
docker image prune -a

# Limpiar todo (imágenes, contenedores, volúmenes)
docker system prune -a --volumes
```

---

## 🐛 Troubleshooting

### Problema: Puerto 3306 ya en uso

```bash
# Opción 1: Cambiar puerto en .env
MYSQL_PORT=3307

# Opción 2: Detener MySQL local
sudo systemctl stop mysql  # Linux
brew services stop mysql   # macOS
net stop MySQL80           # Windows
```

### Problema: Puerto 3000 ya en uso

```bash
# Cambiar puerto de la app en .env
APP_PORT=3001
```

### Problema: npm ci failed durante el build

```bash
# Limpiar todo y rebuild desde cero
docker-compose down
docker system prune -a --volumes
docker-compose build --no-cache
docker-compose up -d

# Si persiste, eliminar node_modules local
rm -rf node_modules
docker-compose build --no-cache
```

### Problema: La app no se conecta a la BD

```bash
# Verificar que los servicios estén corriendo
docker-compose ps

# Ver logs de la base de datos
docker-compose logs db

# Verificar healthcheck
docker-compose exec db mysqladmin ping -h localhost -u root -pCambiala1234

# Reiniciar servicios
docker-compose restart
```

### Problema: Errores de permisos en Windows

```bash
# Ejecutar PowerShell/CMD como Administrador
# O configurar Docker Desktop con permisos adecuados
```

### Problema: Build muy lento

```bash
# Limpiar caché de Docker
docker builder prune

# Build con progreso detallado
docker-compose build --progress=plain
```

### Verificar Health Check

```bash
# Desde dentro del contenedor
docker-compose exec app curl http://localhost:3000/api/health

# Desde el host
curl http://localhost:3000/api/health
```

---

## 🚀 Producción

### Archivo docker-compose.prod.yml

Crea un archivo separado para producción:

```yaml
version: '3.9'

services:
  app:
    build:
      context: .
      dockerfile: Dockerfile
      args:
        NODE_ENV: production
    environment:
      NODE_ENV: production
      DATABASE_URL: ${DATABASE_URL}
      JWT_SECRET: ${JWT_SECRET}
    restart: always
    # No exponer puerto directamente, usar reverse proxy
    expose:
      - "3000"

  db:
    restart: always
    # No exponer puerto públicamente
    expose:
      - "3306"
    volumes:
      - mysql_data_prod:/var/lib/mysql

  # Agregar reverse proxy (Nginx/Traefik)
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - app
```

### Iniciar en Producción

```bash
# Usando archivo específico
docker-compose -f docker-compose.prod.yml up -d

# Con variables de entorno seguras
export JWT_SECRET=$(openssl rand -base64 32)
docker-compose -f docker-compose.prod.yml up -d
```

### Seguridad en Producción

1. **Cambiar contraseñas por defecto**
   ```bash
   # Generar contraseña segura
   openssl rand -base64 32
   ```

2. **Usar secrets de Docker**
   ```yaml
   secrets:
     db_password:
       file: ./secrets/db_password.txt
   ```

3. **No exponer puertos innecesarios**
   - Usar `expose` en vez de `ports`
   - Configurar firewall

4. **Backups automáticos**
   ```bash
   # Cron job para backups diarios
   0 2 * * * docker-compose exec -T db mysqldump -u root -p$MYSQL_ROOT_PASSWORD cotizador_laminas | gzip > /backups/db_$(date +\%Y\%m\%d).sql.gz
   ```

---

## 📊 Monitoreo

### Ver Recursos Usados

```bash
# Stats en tiempo real
docker stats

# Específico de la aplicación
docker stats cotizador-app
```

### Logs Centralizados

```bash
# Todos los logs juntos
docker-compose logs -f

# Solo errores
docker-compose logs app | grep ERROR
```

---

## 🔄 Actualizaciones

### Actualizar Aplicación

```bash
# Pull del código nuevo
git pull origin main

# Rebuild y restart
docker-compose build app
docker-compose up -d app

# Aplicar migraciones (automático al iniciar)
# O manualmente:
docker-compose exec app npx prisma migrate deploy
```

### Actualizar Imágenes Base

```bash
# Pull de imágenes actualizadas
docker-compose pull

# Rebuild completo
docker-compose up -d --build
```

---

## 📚 Recursos Adicionales

- [Documentación oficial de Docker](https://docs.docker.com/)
- [Docker Compose Reference](https://docs.docker.com/compose/compose-file/)
- [Next.js Docker Deployment](https://nextjs.org/docs/deployment#docker-image)
- [Prisma in Docker](https://www.prisma.io/docs/guides/deployment/deployment-guides/deploying-to-vercel)

---

## 🤝 Desarrollo Local con Hot Reload

Para desarrollo, puedes habilitar hot reload modificando `docker-compose.yml`:

```yaml
app:
  # ... resto de config
  volumes:
    - .:/app
    - /app/node_modules
    - /app/.next
  command: npm run dev
  environment:
    NODE_ENV: development
```

**Nota**: Esto hace el contenedor más lento pero permite ver cambios en tiempo real.

---

## ✅ Checklist de Deployment

- [ ] Variables de entorno configuradas
- [ ] Contraseñas cambiadas de valores por defecto
- [ ] Backups configurados
- [ ] SSL/HTTPS configurado (producción)
- [ ] Firewall configurado
- [ ] Logs monitoreados
- [ ] Health checks funcionando
- [ ] Reverse proxy configurado (producción)
- [ ] Volúmenes persistentes configurados
- [ ] Migraciones aplicadas

---

**Última actualización**: Enero 2025
**Versión Docker Compose**: 3.9
**Imágenes**: Node 20 Alpine, MySQL 8.0
