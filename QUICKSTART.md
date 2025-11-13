# 🚀 Inicio Rápido - 5 Minutos

Guía rápida para tener el sistema corriendo en menos de 5 minutos.

## 🐧 ¿Estás usando WSL?

**Si vas a ejecutar el proyecto en WSL (Windows Subsystem for Linux), sigue esta guía:**

### Setup rápido en WSL:

```bash
# 1. Navegar al proyecto (desde WSL)
cd /mnt/c/Users/Juan/source/repos/juandamianpajares/cotizador-laminas

# 2. Ejecutar script automático de WSL
bash scripts/init-db-wsl.sh

# 3. Iniciar servidor
npm run dev
```

El script automático instalará MySQL en WSL si no está instalado, creará la base de datos, y configurará todo.

**Si prefieres configuración manual en WSL, continúa con los pasos siguientes adaptados para WSL.**

---

## Requisitos

- Node.js 18+ ✅
- MySQL 8+ corriendo ✅
- npm ✅
- **Para WSL:** WSL2 configurado

## Pasos

### 1️⃣ Instalar Dependencias (1 min)

```bash
npm install
```

### 2️⃣ Configurar Base de Datos (1 min)

**Crear la base de datos en MySQL:**

```sql
CREATE DATABASE cotizador_laminas;
```

**Configurar credenciales:**

```bash
# Copiar archivo de ejemplo
cp .env.example .env

# Editar .env (usar tu editor favorito)
# DATABASE_URL="mysql://root:tu_password@localhost:3306/cotizador_laminas"
```

### 3️⃣ Inicializar Base de Datos (2 min)

**Opción A: Script automático (recomendado)**

WSL:
```bash
bash scripts/init-db-wsl.sh
```

Linux/Mac:
```bash
bash scripts/init-db.sh
```

Windows (CMD/PowerShell):
```bash
scripts\init-db.bat
```

**Opción B: Manual**

```bash
npm run db:generate
npm run db:push
npx tsx lib/seed.ts  # Opcional: cargar productos de ejemplo
```

### 4️⃣ Iniciar Servidor (30 seg)

```bash
npm run dev
```

### 5️⃣ ¡Listo! 🎉

Abre tu navegador en: **http://localhost:3000**

## Verificación

### ✅ Verificar que todo funciona

1. **Ver productos en la base de datos:**

```bash
npm run db:studio
```

Abre http://localhost:5555 y verifica que hay productos.

2. **Probar API de productos:**

```bash
curl http://localhost:3000/api/products
```

Debería devolver lista de productos.

3. **Usar el formulario:**

Abre http://localhost:3000 y crea una cotización usando la interfaz web.

## Problemas Comunes

### ❌ "Can't reach database server"

**Solución:** Verifica que MySQL esté corriendo

```bash
# WSL
sudo service mysql status
sudo service mysql start

# Linux/Mac (systemd)
sudo systemctl status mysql

# Windows (CMD/PowerShell)
services.msc  # Buscar "MySQL"
```

### ❌ "Access denied for user"

**Solución:** Verifica las credenciales en `.env`

```env
# Formato correcto:
DATABASE_URL="mysql://USUARIO:PASSWORD@localhost:3306/cotizador_laminas"
```

### ❌ "Error generating Prisma Client"

**Solución:** Instalar dependencias de nuevo

```bash
rm -rf node_modules package-lock.json
npm install
npm run db:generate
```

### ❌ "Port 3000 already in use"

**Solución:** Usar otro puerto

```bash
PORT=3001 npm run dev
```

## Próximos Pasos

Una vez que tengas el sistema corriendo:

1. **Explorar la base de datos** con Prisma Studio: `npm run db:studio`

2. **Crear productos** personalizados vía API o formulario

3. **Generar cotizaciones** usando la interfaz web

4. **Revisar la documentación completa** en [README-NEXTJS.md](README-NEXTJS.md)

5. **Ver detalles de instalación** en [SETUP.md](SETUP.md)

## Comandos Útiles

```bash
# Desarrollo
npm run dev          # Servidor de desarrollo
npm run build        # Build de producción
npm run start        # Servidor de producción

# Base de datos
npm run db:studio    # Explorar datos (GUI)
npm run db:push      # Aplicar cambios de schema
npm run db:generate  # Regenerar cliente Prisma

# Seed
npx tsx lib/seed.ts  # Cargar productos de ejemplo
```

## Estructura del Proyecto

```
cotizador-laminas/
├── app/              # Páginas y API routes (Next.js)
├── components/       # Componentes React
├── lib/              # Lógica de negocio y utilidades
├── prisma/           # Schema de base de datos
└── scripts/          # Scripts de utilidad
```

## Demo Rápido

### Crear un Producto (API)

```bash
curl -X POST http://localhost:3000/api/products \
  -H "Content-Type: application/json" \
  -d '{
    "sku": "TEST-001",
    "name": "Film de Prueba",
    "category": "SOLAR_CONTROL",
    "pricePerSqm": 25.00,
    "installationPerSqm": 15.00
  }'
```

### Listar Productos

```bash
curl http://localhost:3000/api/products
```

### Calcular Cotización (API)

Ver ejemplos completos en [README-NEXTJS.md](README-NEXTJS.md#-api-endpoints)

## Soporte

- 📚 [Documentación completa](README-NEXTJS.md)
- 🛠️ [Guía de instalación detallada](SETUP.md)
- 🐛 [Reportar problemas](https://github.com/tu-usuario/cotizador-laminas/issues)

---

**¿Todo funcionando? ¡Excelente! Ahora puedes empezar a crear cotizaciones profesionales.** 🎉
