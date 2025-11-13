# 🚀 Guía de Deployment - Cotizador de Láminas

Opciones para deployar el sistema en producción.

## 📋 Pre-requisitos

Antes de deployar, asegúrate de tener:

- ✅ Base de datos MySQL en producción
- ✅ Variables de entorno configuradas
- ✅ Build exitoso (`npm run build`)
- ✅ Tests pasando (si los tienes)

## 🌐 Opciones de Deployment

### 1️⃣ Vercel (Recomendado) - Más Fácil

Vercel es la opción más simple para Next.js. Necesitarás una base de datos MySQL externa.

#### Paso 1: Preparar Base de Datos

Usa alguno de estos servicios para MySQL:
- **PlanetScale** (recomendado, plan gratuito)
- **Railway** (con MySQL)
- **AWS RDS**
- **DigitalOcean Managed Databases**

#### Paso 2: Deploy a Vercel

```bash
# Instalar Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel
```

#### Paso 3: Configurar Variables de Entorno

En el dashboard de Vercel:

```env
DATABASE_URL="mysql://user:password@host:3306/cotizador_laminas"
NEXT_PUBLIC_APP_URL="https://tu-app.vercel.app"
```

#### Paso 4: Ejecutar Migraciones

```bash
# Localmente, apuntando a DB de producción
npx prisma migrate deploy
```

**Costo**: Gratis para hobby projects

---

### 2️⃣ Railway - Full-Stack Fácil

Railway permite deployar tanto la app como la base de datos.

#### Paso 1: Crear Cuenta en Railway

1. Ve a https://railway.app
2. Conecta con GitHub

#### Paso 2: Nuevo Proyecto

```bash
# Instalar Railway CLI
npm i -g @railway/cli

# Login
railway login

# Inicializar
railway init

# Agregar MySQL
railway add mysql

# Deploy
railway up
```

#### Paso 3: Variables de Entorno

Railway auto-configura `DATABASE_URL` para MySQL.

```env
NEXT_PUBLIC_APP_URL="https://tu-app.railway.app"
```

**Costo**: $5/mes aproximadamente

---

### 3️⃣ Docker + VPS

Para mayor control, usa Docker en cualquier VPS (DigitalOcean, Linode, AWS EC2, etc.)

#### Dockerfile

Ya está incluido, creémoslo:

```dockerfile
# Dockerfile
FROM node:18-alpine AS base

# Dependencias
FROM base AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

# Build
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generar Prisma Client
RUN npx prisma generate

# Build Next.js
RUN npm run build

# Producción
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT=3000

CMD ["node", "server.js"]
```

#### docker-compose.yml

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=mysql://root:password@db:3306/cotizador_laminas
      - NEXT_PUBLIC_APP_URL=https://tudominio.com
    depends_on:
      - db

  db:
    image: mysql:8.0
    environment:
      - MYSQL_ROOT_PASSWORD=password
      - MYSQL_DATABASE=cotizador_laminas
    volumes:
      - mysql_data:/var/lib/mysql
    ports:
      - "3306:3306"

volumes:
  mysql_data:
```

#### Deploy

```bash
# En tu VPS
git clone <tu-repo>
cd cotizador-laminas

# Build y start
docker-compose up -d

# Ejecutar migraciones
docker-compose exec app npx prisma migrate deploy

# Ver logs
docker-compose logs -f
```

**Costo**: Desde $5/mes (VPS básico)

---

### 4️⃣ AWS (Producción Enterprise)

Para aplicaciones de nivel empresarial.

#### Arquitectura AWS:

- **Frontend**: AWS Amplify o S3 + CloudFront
- **Backend**: ECS (contenedores) o Lambda
- **Base de Datos**: RDS MySQL
- **CDN**: CloudFront

#### Paso 1: RDS MySQL

```bash
# Crear instancia RDS MySQL
aws rds create-db-instance \
  --db-instance-identifier cotizador-prod \
  --db-instance-class db.t3.micro \
  --engine mysql \
  --master-username admin \
  --master-user-password YourPassword \
  --allocated-storage 20
```

#### Paso 2: Deploy con Amplify

```bash
# Instalar Amplify CLI
npm install -g @aws-amplify/cli

# Configurar
amplify init
amplify add hosting
amplify publish
```

**Costo**: Variable, desde $20/mes

---

## 🔐 Seguridad en Producción

### Variables de Entorno

**NUNCA** commites `.env` al repositorio.

```env
# Producción
DATABASE_URL="mysql://user:pass@prod-host:3306/db?sslaccept=strict"
NEXT_PUBLIC_APP_URL="https://tudominio.com"
NODE_ENV="production"
```

### SSL/HTTPS

- ✅ Usa siempre HTTPS en producción
- ✅ Vercel/Railway incluyen SSL automático
- ✅ Para VPS, usa Let's Encrypt con Nginx/Caddy

### Base de Datos

```env
# Usar SSL para MySQL
DATABASE_URL="mysql://user:pass@host:3306/db?ssl=true"
```

### Headers de Seguridad

Next.js incluye headers seguros por defecto. Para más control:

```js
// next.config.ts
const nextConfig = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload'
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
        ],
      },
    ]
  },
}
```

---

## 📊 Monitoreo

### Logs

```bash
# Vercel
vercel logs

# Railway
railway logs

# Docker
docker-compose logs -f app
```

### Monitoreo de Performance

Recomendaciones:

- **Vercel Analytics** (incluido en Vercel)
- **Sentry** (errores y performance)
- **New Relic** (APM completo)
- **DataDog** (enterprise)

---

## 🔄 CI/CD

### GitHub Actions

Crea `.github/workflows/deploy.yml`:

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm ci

      - name: Generate Prisma Client
        run: npx prisma generate

      - name: Build
        run: npm run build

      - name: Deploy to Vercel
        run: vercel --prod --token=${{ secrets.VERCEL_TOKEN }}
```

---

## 🗄️ Migraciones de Base de Datos

### Desarrollo → Producción

```bash
# 1. Crear migración en desarrollo
npx prisma migrate dev --name add_new_feature

# 2. Commit la migración
git add prisma/migrations
git commit -m "Add migration: add_new_feature"

# 3. En producción, aplicar
npx prisma migrate deploy
```

### Rollback

```bash
# Ver migraciones aplicadas
npx prisma migrate status

# No hay rollback automático en Prisma
# Debes crear una nueva migración que revierta los cambios
```

---

## 🧪 Checklist Pre-Deploy

Antes de deployar a producción:

- [ ] ✅ Build exitoso (`npm run build`)
- [ ] ✅ Variables de entorno configuradas
- [ ] ✅ Base de datos creada y accesible
- [ ] ✅ Migraciones aplicadas
- [ ] ✅ Datos seed cargados (si aplica)
- [ ] ✅ SSL/HTTPS configurado
- [ ] ✅ Backup de base de datos configurado
- [ ] ✅ Monitoreo configurado
- [ ] ✅ Logs accesibles
- [ ] ✅ Dominio personalizado apuntando
- [ ] ✅ Email de notificaciones configurado

---

## 🆘 Troubleshooting en Producción

### "Connection timeout" a la base de datos

```bash
# Verificar que la IP del servidor esté permitida en MySQL
# AWS RDS: Security Groups
# PlanetScale: IP Allowlist
```

### "Module not found"

```bash
# Verificar que prisma generate se ejecute en el build
npm run build
```

### Build falla en Vercel

```bash
# Agregar postinstall script en package.json
"scripts": {
  "postinstall": "prisma generate"
}
```

---

## 📈 Escalabilidad

### Base de Datos

- **Read Replicas** para lectura
- **Connection Pooling** (PgBouncer/ProxySQL)
- **Caching** con Redis

### Aplicación

- **Serverless** (Vercel/Railway auto-escala)
- **Horizontal Scaling** (múltiples instancias)
- **CDN** para assets estáticos

---

## 💰 Comparación de Costos

| Opción | Costo Mensual | Escalabilidad | Complejidad |
|--------|---------------|---------------|-------------|
| Vercel + PlanetScale | $0 - $20 | Alta | Baja ⭐⭐⭐⭐⭐ |
| Railway | $5 - $20 | Media | Baja ⭐⭐⭐⭐ |
| VPS + Docker | $5 - $50 | Media | Media ⭐⭐⭐ |
| AWS | $20 - $200+ | Muy Alta | Alta ⭐⭐ |

---

## 📞 Recursos

- [Next.js Deployment Docs](https://nextjs.org/docs/deployment)
- [Prisma Production Best Practices](https://www.prisma.io/docs/guides/performance-and-optimization/connection-management)
- [Vercel Documentation](https://vercel.com/docs)
- [Railway Documentation](https://docs.railway.app/)

---

**¡Listo para producción! 🚀**
