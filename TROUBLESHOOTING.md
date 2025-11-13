# 🔧 Troubleshooting - Solución de Problemas Comunes

Guía rápida para resolver los problemas más comunes al usar Docker.

---

## 🐛 Problemas de Build

### Error: `npm ci failed` - exit code 1

**Causa**: Problemas con el package-lock.json o dependencias faltantes.

**Solución 1 - Limpiar y rebuild**:
```bash
# Detener contenedores
docker-compose down

# Limpiar todo (imágenes, caché, etc.)
docker system prune -a --volumes

# Rebuild sin caché
docker-compose build --no-cache

# Iniciar
docker-compose up -d
```

**Solución 2 - Verificar package.json**:
```bash
# Verificar que package.json y package-lock.json existen
ls -la package*.json

# Si falta package-lock.json, generarlo
npm install
```

**Solución 3 - En Windows, eliminar node_modules local**:
```bash
# PowerShell
Remove-Item -Recurse -Force node_modules

# CMD
rmdir /s /q node_modules

# Bash (Git Bash)
rm -rf node_modules

# Rebuild
docker-compose build --no-cache
```

---

## 🐳 Problemas de Docker

### Error: Docker daemon not running

**Windows**:
```bash
# Iniciar Docker Desktop
# Buscar "Docker Desktop" en el menú inicio y ejecutarlo
# Esperar a que el ícono de Docker en la bandeja del sistema esté verde
```

**Linux/Debian**:
```bash
# Verificar estado
sudo systemctl status docker

# Iniciar Docker
sudo systemctl start docker

# Habilitar al inicio
sudo systemctl enable docker
```

**Verificar**:
```bash
docker --version
docker ps
```

---

## 📦 Problemas de Puertos

### Puerto 3306 ya en uso (MySQL)

**Verificar qué está usando el puerto**:
```bash
# Windows
netstat -ano | findstr :3306

# Linux/macOS
sudo lsof -i :3306
```

**Solución 1 - Detener MySQL local**:
```bash
# Linux
sudo systemctl stop mysql

# Windows
net stop MySQL80

# macOS
brew services stop mysql
```

**Solución 2 - Cambiar puerto en .env**:
```bash
# Editar .env
MYSQL_PORT=3307

# Reiniciar
docker-compose down
docker-compose up -d
```

### Puerto 3000 ya en uso (App)

```bash
# Cambiar puerto en .env
APP_PORT=3001

# Reiniciar
docker-compose restart app
```

### Puerto 8080 ya en uso (phpMyAdmin)

```bash
# Cambiar puerto en .env
PHPMYADMIN_PORT=8081

# Reiniciar
docker-compose restart phpmyadmin
```

---

## 🗄️ Problemas de Base de Datos

### La app no se conecta a MySQL

**Verificar servicios**:
```bash
# Ver estado
docker-compose ps

# Ver logs de MySQL
docker-compose logs db

# Ver logs de la app
docker-compose logs app
```

**Verificar health check de MySQL**:
```bash
docker-compose exec db mysqladmin ping -h localhost -u root -pCambiala1234
```

**Solución - Reiniciar servicios en orden**:
```bash
# Detener todo
docker-compose down

# Iniciar solo MySQL primero
docker-compose up -d db

# Esperar 30 segundos
sleep 30

# Verificar que MySQL está listo
docker-compose logs db

# Iniciar app
docker-compose up -d app
```

### Error: Access denied for user

**Causa**: Contraseña incorrecta o usuario no existe.

**Solución**:
```bash
# Verificar .env
cat .env | grep MYSQL

# Debe coincidir con:
# DATABASE_URL="mysql://juan:Cambiala1234@db:3306/cotizador_laminas"
# MYSQL_USER=juan
# MYSQL_PASSWORD=Cambiala1234

# Si cambiaste contraseñas, eliminar volumen y recrear
docker-compose down -v
docker-compose up -d
```

### Prisma migrate failed

```bash
# Opción 1: Forzar deploy de migraciones
docker-compose exec app npx prisma migrate deploy

# Opción 2: Resetear BD (CUIDADO - borra datos)
docker-compose exec app npx prisma migrate reset

# Opción 3: Generar Prisma Client manualmente
docker-compose exec app npx prisma generate
```

---

## 🌐 Problemas de Red

### Cannot reach database server

**Verificar network**:
```bash
# Ver networks
docker network ls

# Inspeccionar network
docker network inspect cotizador-laminas_cotizador-network
```

**Recrear network**:
```bash
docker-compose down
docker network prune
docker-compose up -d
```

### Health check failing

**Ver logs del health check**:
```bash
# Ver logs de la app
docker-compose logs app | grep health

# Probar manualmente
docker-compose exec app curl http://localhost:3000/api/health
```

**Si responde "unhealthy"**:
```bash
# Verificar que la BD está conectada
docker-compose exec app npx prisma db pull

# Reiniciar app
docker-compose restart app
```

---

## 💾 Problemas de Volúmenes

### No se guardan los datos

**Verificar volúmenes**:
```bash
# Listar volúmenes
docker volume ls

# Debe mostrar:
# cotizador-laminas_mysql_data
# cotizador-laminas_app_logs

# Inspeccionar volumen
docker volume inspect cotizador-laminas_mysql_data
```

**Backup antes de eliminar**:
```bash
# Backup de BD
docker-compose exec db mysqldump -u root -pCambiala1234 cotizador_laminas | gzip > backup.sql.gz

# Eliminar volúmenes
docker-compose down -v

# Recrear
docker-compose up -d

# Restaurar (si necesario)
gunzip < backup.sql.gz | docker-compose exec -T db mysql -u root -pCambiala1234 cotizador_laminas
```

---

## 🔒 Problemas de Permisos

### Permission denied en Windows

**Ejecutar como Administrador**:
- Click derecho en PowerShell/CMD
- "Ejecutar como administrador"
- Volver a intentar

**Configurar Docker Desktop**:
- Abrir Docker Desktop
- Settings → General
- ✓ "Use WSL 2 based engine"
- Restart Docker Desktop

### Permission denied en Linux

```bash
# Agregar usuario al grupo docker
sudo usermod -aG docker $USER

# Aplicar cambios (relogin o):
newgrp docker

# Verificar
docker ps
```

---

## 🚀 Problemas de Performance

### Build muy lento

```bash
# Limpiar caché
docker builder prune -a

# Build con caché
docker-compose build

# Si persiste, verificar recursos de Docker Desktop:
# Settings → Resources → aumentar CPU/RAM
```

### Contenedores usan mucha RAM

```bash
# Ver uso de recursos
docker stats

# Limitar recursos en docker-compose.yml:
services:
  app:
    deploy:
      resources:
        limits:
          cpus: '1'
          memory: 1G
```

---

## 📝 Logs y Debugging

### Ver logs detallados

```bash
# Todos los servicios
docker-compose logs -f

# Solo app
docker-compose logs -f app

# Solo errores
docker-compose logs app | grep ERROR

# Últimas 100 líneas
docker-compose logs --tail=100 app

# Desde cierta hora
docker-compose logs --since 2025-01-13T10:00:00 app
```

### Ejecutar comandos dentro del contenedor

```bash
# Shell interactivo en app
docker-compose exec app sh

# Shell en MySQL
docker-compose exec db bash

# MySQL CLI
docker-compose exec db mysql -u root -p cotizador_laminas

# Ver archivos
docker-compose exec app ls -la

# Ver variables de entorno
docker-compose exec app env
```

---

## 🔄 Problemas de Actualización

### Git pull no refleja cambios

```bash
# Pull de código
git pull origin main

# Rebuild FORZADO sin caché
docker-compose build --no-cache app

# Recrear contenedor
docker-compose up -d --force-recreate app
```

### Migraciones no se aplican

```bash
# Aplicar manualmente
docker-compose exec app npx prisma migrate deploy

# Ver migraciones pendientes
docker-compose exec app npx prisma migrate status

# Crear nueva migración (desarrollo)
docker-compose exec app npx prisma migrate dev
```

---

## 🆘 Solución Nuclear (Último Recurso)

Si nada funciona, empezar desde cero:

```bash
# 1. Backup de datos
docker-compose exec db mysqldump -u root -pCambiala1234 cotizador_laminas > backup.sql

# 2. Detener TODO
docker-compose down -v

# 3. Limpiar TODO Docker
docker system prune -a --volumes -f

# 4. Verificar que no queda nada
docker ps -a
docker images
docker volume ls

# 5. Rebuild desde cero
docker-compose build --no-cache

# 6. Iniciar
docker-compose up -d

# 7. Ver logs para verificar
docker-compose logs -f

# 8. Restaurar backup (si necesario)
cat backup.sql | docker-compose exec -T db mysql -u root -pCambiala1234 cotizador_laminas
```

---

## ✅ Checklist de Verificación

Cuando algo no funciona, verificar:

- [ ] Docker está corriendo: `docker ps`
- [ ] Variables de entorno correctas: `cat .env`
- [ ] Puertos disponibles: `netstat -ano | findstr :3000`
- [ ] Servicios running: `docker-compose ps`
- [ ] Logs sin errores: `docker-compose logs`
- [ ] Health check OK: `curl http://localhost:3000/api/health`
- [ ] MySQL responde: `docker-compose exec db mysqladmin ping`
- [ ] Volúmenes creados: `docker volume ls`
- [ ] Network creada: `docker network ls`

---

## 📞 Obtener Ayuda

Si ninguna solución funciona:

1. **Recopilar información**:
```bash
# Guardar logs
docker-compose logs > docker-logs.txt

# Información del sistema
docker info > docker-info.txt
docker-compose ps > docker-ps.txt

# Variables de entorno (sin contraseñas)
cat .env | grep -v PASSWORD > env-safe.txt
```

2. **Crear issue en GitHub** con:
   - Descripción del problema
   - Pasos para reproducir
   - Logs (docker-logs.txt)
   - Sistema operativo
   - Versión de Docker

3. **Comandos útiles para debugging**:
```bash
# Info completa del sistema Docker
docker info

# Versiones
docker --version
docker-compose --version

# Espacio en disco
df -h

# Uso de Docker
docker system df
```

---

**Última actualización**: Enero 2025
**Versión**: Sprint 7.5 + Docker
