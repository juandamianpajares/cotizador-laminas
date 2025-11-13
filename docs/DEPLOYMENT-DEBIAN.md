# 🚀 Guía de Deployment en Debian Server

Esta guía te ayudará a deployar el Cotizador de Láminas en un servidor Debian paso a paso.

---

## 📋 Prerequisitos

- Servidor Debian 11 o 12
- Acceso root o sudo
- Conexión a internet
- Dominio (opcional, para SSL)

---

## 🔧 Paso 1: Preparar el Servidor

### Actualizar el sistema

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y git curl wget nano ufw
```

### Configurar Firewall

```bash
# Permitir SSH
sudo ufw allow 22/tcp

# Permitir HTTP y HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Activar firewall
sudo ufw enable
sudo ufw status
```

---

## 🐳 Paso 2: Instalar Docker

### Instalar Docker Engine

```bash
# Agregar repositorio de Docker
sudo apt install -y apt-transport-https ca-certificates gnupg lsb-release

curl -fsSL https://download.docker.com/linux/debian/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/debian $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Instalar Docker
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

# Verificar instalación
docker --version
docker compose version
```

### Configurar permisos (opcional)

```bash
# Agregar usuario actual al grupo docker
sudo usermod -aG docker $USER

# Aplicar cambios (relogin o)
newgrp docker

# Verificar
docker ps
```

---

## 📦 Paso 3: Clonar el Proyecto

```bash
# Crear directorio para aplicaciones
sudo mkdir -p /opt/apps
cd /opt/apps

# Clonar repositorio
sudo git clone https://github.com/juandamianpajares/cotizador-laminas.git
cd cotizador-laminas

# Dar permisos
sudo chown -R $USER:$USER /opt/apps/cotizador-laminas
```

---

## ⚙️ Paso 4: Configurar Variables de Entorno

```bash
# Copiar archivo de ejemplo
cp .env.example .env

# Editar variables
nano .env
```

### Cambios importantes en `.env`:

```bash
# ============================================================================
# PRODUCCIÓN - CAMBIAR ESTOS VALORES
# ============================================================================

# Database (CAMBIAR CONTRASEÑAS)
MYSQL_ROOT_PASSWORD=TuContraseñaSuperSegura123!
MYSQL_PASSWORD=OtraContraseñaSegura456!

# JWT Secret (generar con: openssl rand -base64 32)
JWT_SECRET=tu-jwt-secret-generado-aqui

# App URL (tu dominio)
NEXT_PUBLIC_APP_URL=https://tudominio.com

# Email (si vas a usar notificaciones)
EMAIL_HOST=smtp.gmail.com
EMAIL_USER=tu-email@gmail.com
EMAIL_PASSWORD=tu-app-password

# Puertos (cambiar si están en uso)
MYSQL_PORT=3306
APP_PORT=3000
PHPMYADMIN_PORT=8080
```

### Generar JWT Secret:

```bash
openssl rand -base64 32
# Copiar el resultado y pegarlo en JWT_SECRET
```

---

## 🚀 Paso 5: Iniciar la Aplicación

```bash
# Construir e iniciar contenedores
docker compose up -d --build

# Ver logs para verificar que todo funciona
docker compose logs -f app

# Verificar estado de contenedores
docker compose ps
```

### Verificar que funciona:

```bash
# Health check
curl http://localhost:3000/api/health

# Si ves {"status":"healthy",...} está funcionando
```

---

## 🌐 Paso 6: Configurar Nginx (Reverse Proxy)

### Instalar Nginx

```bash
sudo apt install -y nginx
```

### Crear configuración

```bash
sudo nano /etc/nginx/sites-available/cotizador
```

### Pegar esta configuración:

```nginx
# Sin SSL (HTTP)
server {
    listen 80;
    server_name tudominio.com www.tudominio.com;

    client_max_body_size 10M;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # phpMyAdmin (opcional - eliminar en producción)
    location /phpmyadmin {
        proxy_pass http://localhost:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### Activar configuración

```bash
# Crear symlink
sudo ln -s /etc/nginx/sites-available/cotizador /etc/nginx/sites-enabled/

# Eliminar configuración por defecto
sudo rm /etc/nginx/sites-enabled/default

# Verificar sintaxis
sudo nginx -t

# Reiniciar Nginx
sudo systemctl restart nginx
sudo systemctl enable nginx
```

---

## 🔐 Paso 7: Configurar SSL con Let's Encrypt

```bash
# Instalar Certbot
sudo apt install -y certbot python3-certbot-nginx

# Obtener certificado SSL (cambiar tudominio.com)
sudo certbot --nginx -d tudominio.com -d www.tudominio.com

# Seguir los pasos en pantalla
# Elegir: Redirect HTTP to HTTPS (opción 2)

# Verificar auto-renovación
sudo certbot renew --dry-run

# Programar renovación automática (ya está configurado)
sudo systemctl status certbot.timer
```

### Resultado:

Ahora tu sitio estará disponible en:
- ✅ `https://tudominio.com` (seguro)
- ✅ `http://tudominio.com` (redirige a HTTPS)

---

## 📊 Paso 8: Verificar y Monitorear

### Verificar servicios

```bash
# Ver contenedores corriendo
docker compose ps

# Ver logs en tiempo real
docker compose logs -f

# Ver logs de un servicio específico
docker compose logs -f app
docker compose logs -f db

# Ver uso de recursos
docker stats
```

### Verificar aplicación

```bash
# Health check
curl https://tudominio.com/api/health

# Debería devolver:
# {"status":"healthy","timestamp":"...","database":"connected"}
```

---

## 🔄 Paso 9: Backups Automáticos

### Crear script de backup

```bash
sudo nano /opt/apps/cotizador-laminas/backup.sh
```

### Contenido del script:

```bash
#!/bin/bash

# Configuración
BACKUP_DIR="/opt/backups/cotizador"
DATE=$(date +%Y%m%d_%H%M%S)
MYSQL_CONTAINER="cotizador-db"
MYSQL_USER="root"
MYSQL_PASSWORD="TuContraseñaSuperSegura123!"  # Tu contraseña de .env
DB_NAME="cotizador_laminas"

# Crear directorio si no existe
mkdir -p $BACKUP_DIR

# Backup de base de datos
docker exec $MYSQL_CONTAINER mysqldump -u$MYSQL_USER -p$MYSQL_PASSWORD $DB_NAME | gzip > $BACKUP_DIR/db_$DATE.sql.gz

# Eliminar backups antiguos (más de 7 días)
find $BACKUP_DIR -name "db_*.sql.gz" -mtime +7 -delete

echo "Backup completado: $BACKUP_DIR/db_$DATE.sql.gz"
```

### Hacer ejecutable:

```bash
chmod +x /opt/apps/cotizador-laminas/backup.sh
```

### Programar backup diario con cron:

```bash
sudo crontab -e

# Agregar al final:
0 2 * * * /opt/apps/cotizador-laminas/backup.sh >> /var/log/cotizador-backup.log 2>&1
```

Esto ejecutará el backup todos los días a las 2 AM.

---

## 🛠️ Comandos Útiles

### Gestión de contenedores

```bash
# Reiniciar aplicación
docker compose restart app

# Detener todos los servicios
docker compose down

# Iniciar servicios
docker compose up -d

# Ver logs
docker compose logs -f app

# Rebuild completo
docker compose down
docker compose build --no-cache
docker compose up -d
```

### Actualizar la aplicación

```bash
cd /opt/apps/cotizador-laminas

# Pull cambios
git pull origin main

# Rebuild y restart
docker compose build app
docker compose up -d app

# Aplicar migraciones (si hay)
docker compose exec app npx prisma migrate deploy
```

### Acceso a contenedores

```bash
# Shell en app
docker compose exec app sh

# Shell en MySQL
docker compose exec db bash

# MySQL CLI
docker compose exec db mysql -u root -p cotizador_laminas
```

### Backup manual

```bash
# Backup de DB
docker compose exec db mysqldump -u root -p cotizador_laminas | gzip > backup_$(date +%Y%m%d).sql.gz

# Restaurar backup
gunzip < backup_20250113.sql.gz | docker compose exec -T db mysql -u root -p cotizador_laminas
```

---

## 🚨 Troubleshooting

### Puerto 3306 ya en uso

```bash
# Verificar qué está usando el puerto
sudo lsof -i :3306

# Si hay MySQL instalado localmente, detenerlo
sudo systemctl stop mysql
sudo systemctl disable mysql

# O cambiar puerto en .env
MYSQL_PORT=3307
```

### No se conecta a la base de datos

```bash
# Ver logs de MySQL
docker compose logs db

# Verificar que MySQL está corriendo
docker compose ps

# Reiniciar servicios
docker compose restart
```

### Error de permisos

```bash
# Dar permisos al directorio
sudo chown -R $USER:$USER /opt/apps/cotizador-laminas

# Verificar permisos de volúmenes
docker volume inspect cotizador-laminas_mysql_data
```

### La aplicación no responde

```bash
# Ver logs
docker compose logs -f app

# Verificar health check
docker compose exec app curl http://localhost:3000/api/health

# Reiniciar contenedor
docker compose restart app
```

---

## 🔒 Seguridad Adicional

### Deshabilitar phpMyAdmin en producción

```bash
# Editar docker-compose.yml
nano docker-compose.yml

# Comentar sección de phpmyadmin
# Reiniciar
docker compose down
docker compose up -d
```

### Configurar fail2ban (protección contra ataques)

```bash
sudo apt install -y fail2ban
sudo systemctl enable fail2ban
sudo systemctl start fail2ban
```

### Actualizar el sistema regularmente

```bash
# Crear script de actualización
sudo nano /opt/scripts/update-system.sh
```

```bash
#!/bin/bash
apt update
apt upgrade -y
apt autoremove -y
docker system prune -f
```

```bash
chmod +x /opt/scripts/update-system.sh

# Programar actualización semanal
sudo crontab -e
# Agregar:
0 3 * * 0 /opt/scripts/update-system.sh >> /var/log/system-update.log 2>&1
```

---

## ✅ Checklist de Deployment

- [ ] Servidor Debian actualizado
- [ ] Docker y Docker Compose instalados
- [ ] Firewall configurado (UFW)
- [ ] Proyecto clonado
- [ ] Variables de entorno configuradas
- [ ] Contraseñas cambiadas (no usar por defecto)
- [ ] JWT secret generado
- [ ] Contenedores iniciados y funcionando
- [ ] Nginx configurado como reverse proxy
- [ ] SSL configurado con Let's Encrypt
- [ ] Health check respondiendo correctamente
- [ ] Backups automáticos configurados
- [ ] Logs monitoreados
- [ ] phpMyAdmin deshabilitado en producción
- [ ] Dominio apuntando al servidor

---

## 📞 Soporte

Si tienes problemas:
1. Revisar logs: `docker compose logs -f`
2. Verificar health check: `curl http://localhost:3000/api/health`
3. Verificar puertos: `sudo lsof -i :3000`
4. Crear issue en GitHub

---

**Última actualización**: Enero 2025
**Versión**: Sprint 7.5 + Docker
