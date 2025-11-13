# 🚗 Cotizador de Láminas para Vehículos

Sistema completo de cotización de láminas de seguridad y polarizadas para vehículos, con gestión de solicitudes de clientes y envío automatizado por WhatsApp.

---

## 📋 Características

### Flujo del Cliente
- ✅ Formulario simplificado (solo teléfono + fotos)
- ✅ Upload de 1-3 fotos del vehículo
- ✅ Selección opcional de tipo de servicio
- ✅ Confirmación inmediata de solicitud

### Flujo del Encargado
- ✅ Panel de solicitudes con filtros y búsqueda
- ✅ Revisión de fotos del cliente
- ✅ Configuración completa de vehículo y vidrios
- ✅ Cálculo automático de precios por tipo de vehículo
- ✅ Envío de cotización formateada por WhatsApp

### Características Técnicas
- ✅ Next.js 15 con App Router
- ✅ React 19 + TypeScript
- ✅ Prisma ORM + MySQL 8.0
- ✅ Docker Compose para desarrollo y producción
- ✅ Segmentación de clientes (nuevo, leal, mayorista, corporativo)
- ✅ Precios dinámicos por tipo de vehículo
- ✅ Sistema de plantillas de vidrios

---

## 🐳 Inicio Rápido con Docker (RECOMENDADO)

### Prerequisitos
- [Docker](https://docs.docker.com/get-docker/) 20.10+
- [Docker Compose](https://docs.docker.com/compose/install/) 2.0+

### Opción 1: Script Automático

**Linux/macOS:**
```bash
chmod +x docker/scripts/start.sh
./docker/scripts/start.sh
```

**Windows:**
```cmd
docker\scripts\start.bat
```

### Opción 2: Manual

```bash
# 1. Clonar repositorio
git clone https://github.com/tu-usuario/cotizador-laminas.git
cd cotizador-laminas

# 2. Configurar variables de entorno
cp .env.example .env

# 3. Iniciar todos los servicios
docker-compose up -d --build

# 4. Ver logs
docker-compose logs -f app
```

### Acceder a la Aplicación

- **App Web**: http://localhost:3000
- **phpMyAdmin**: http://localhost:8080
- **Health Check**: http://localhost:3000/api/health

---

## 💻 Desarrollo Local (sin Docker)

### Prerequisitos
- Node.js 20+
- MySQL 8.0
- npm o yarn

### Instalación

```bash
# 1. Instalar dependencias
npm install

# 2. Configurar .env
cp .env.example .env
# Editar DATABASE_URL para apuntar a tu MySQL local

# 3. Ejecutar migraciones
npx prisma migrate dev

# 4. Generar Prisma Client
npx prisma generate

# 5. Iniciar servidor de desarrollo
npm run dev
```

---

## 📁 Estructura del Proyecto

```
cotizador-laminas/
├── app/
│   ├── cotizar/
│   │   ├── cliente/            # Formulario cliente simplificado
│   │   └── vehiculos/          # Formulario encargado completo
│   ├── encargado/
│   │   ├── solicitudes/        # Panel de solicitudes
│   │   └── cotizaciones/
│   │       └── nueva/          # Revisión de solicitud
│   └── api/
│       ├── solicitudes/        # API de solicitudes
│       ├── whatsapp/           # API WhatsApp
│       └── health/             # Health check
├── prisma/
│   ├── schema.prisma           # Modelo de datos
│   └── migrations/             # Migraciones
├── docker/
│   ├── mysql/                  # Configuración MySQL
│   └── scripts/                # Scripts de ayuda
├── lib/
│   ├── prisma.ts               # Cliente Prisma
│   └── vehicleImages.ts        # Imágenes de vehículos
├── Dockerfile                  # Producción
├── Dockerfile.dev              # Desarrollo
├── docker-compose.yml          # Producción
├── docker-compose.dev.yml      # Desarrollo con hot-reload
└── DOCKER.md                   # Documentación Docker
```

---

## 🗄️ Base de Datos

### Modelos Principales

- **Customer**: Clientes
- **Quotation**: Cotizaciones completas
- **QuotationItem**: Items de cotización
- **QuotationRequest**: Solicitudes de clientes (incompletas)
- **Product**: Catálogo de láminas
- **PricingConfig**: Configuración de precios por tipo de vehículo

### Migraciones

```bash
# Con Docker
docker-compose exec app npx prisma migrate deploy

# Sin Docker
npx prisma migrate dev
npx prisma migrate deploy  # Producción
```

### Prisma Studio

```bash
# Con Docker
docker-compose exec app npx prisma studio

# Sin Docker
npx prisma studio
```

---

## 🔧 Comandos Útiles

### Docker

```bash
# Ver logs
docker-compose logs -f app
docker-compose logs -f db

# Reiniciar servicios
docker-compose restart app

# Detener servicios
docker-compose down

# Detener y eliminar volúmenes (CUIDADO)
docker-compose down -v

# Rebuild completo
docker-compose build --no-cache
docker-compose up -d
```

### Base de Datos

```bash
# Backup
docker-compose exec db mysqldump -u root -p cotizador_laminas > backup.sql

# Restore
docker-compose exec -T db mysql -u root -p cotizador_laminas < backup.sql

# MySQL CLI
docker-compose exec db mysql -u juan -p cotizador_laminas
```

---

## 📚 Documentación

- [DOCKER.md](DOCKER.md) - Guía completa de Docker
- [TROUBLESHOOTING.md](TROUBLESHOOTING.md) - Solución de problemas comunes
- [ARQUITECTURA.md](ARQUITECTURA.md) - Diagramas de arquitectura
- [DEPLOYMENT-DEBIAN.md](DEPLOYMENT-DEBIAN.md) - Deployment en servidor
- [FLUJOS-IMPLEMENTADOS.md](FLUJOS-IMPLEMENTADOS.md) - Flujos de usuario

---

## 🚀 Deployment en Debian

### 1. Instalar Docker en Debian

```bash
# Actualizar sistema
sudo apt update && sudo apt upgrade -y

# Instalar dependencias
sudo apt install -y apt-transport-https ca-certificates curl gnupg lsb-release

# Agregar repo de Docker
curl -fsSL https://download.docker.com/linux/debian/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

echo "deb [arch=amd64 signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/debian $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Instalar Docker
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

# Verificar instalación
docker --version
docker compose version
```

### 2. Clonar y Configurar

```bash
# Clonar repositorio
git clone https://github.com/tu-usuario/cotizador-laminas.git
cd cotizador-laminas

# Configurar .env para producción
cp .env.example .env
nano .env  # Cambiar contraseñas y configuración

# Generar JWT secret seguro
openssl rand -base64 32
```

### 3. Iniciar Servicios

```bash
# Iniciar en producción
docker compose up -d --build

# Ver logs
docker compose logs -f

# Verificar estado
docker compose ps
```

### 4. Configurar Nginx (Opcional)

```bash
# Instalar Nginx
sudo apt install -y nginx

# Configurar reverse proxy
sudo nano /etc/nginx/sites-available/cotizador
```

Agregar configuración:

```nginx
server {
    listen 80;
    server_name tu-dominio.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# Activar sitio
sudo ln -s /etc/nginx/sites-available/cotizador /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 5. SSL con Let's Encrypt (Opcional)

```bash
# Instalar Certbot
sudo apt install -y certbot python3-certbot-nginx

# Obtener certificado
sudo certbot --nginx -d tu-dominio.com

# Auto-renovación
sudo systemctl enable certbot.timer
```

---

## 🔐 Seguridad

- ✅ Variables de entorno para credenciales
- ✅ MySQL no expuesta directamente (solo dentro de Docker network)
- ✅ Health checks configurados
- ✅ Volúmenes persistentes para datos
- ⚠️ Cambiar contraseñas por defecto en producción
- ⚠️ Configurar HTTPS en producción
- ⚠️ Configurar firewall (ufw/iptables)

---

## 🤝 Contribuir

1. Fork el proyecto
2. Crear rama de feature (`git checkout -b feature/AmazingFeature`)
3. Commit cambios (`git commit -m 'Add AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir Pull Request

---

## 📝 Roadmap

- [x] Sprint 1-7: Sistema base de cotización
- [x] Sprint 7.5: Flujos cliente/encargado + WhatsApp
- [x] Containerización con Docker
- [ ] Sprint 8: API de imágenes de vehículos
- [ ] Sprint 10/11: Integración con Cloudinary
- [ ] Sprint 12: Notificaciones en tiempo real
- [ ] WhatsApp Business API integration
- [ ] Autenticación y roles de usuario
- [ ] Panel de administración
- [ ] Reportes y estadísticas

---

## 📄 Licencia

Este proyecto es privado. Todos los derechos reservados.

---

## 👨‍💻 Autor

**Juan Damián Pajares**

---

## 📞 Soporte

Para problemas o preguntas:
- Crear un issue en GitHub
- Contactar al equipo de desarrollo

---

**Última actualización**: Enero 2025
**Versión**: Sprint 7.5 + Docker
