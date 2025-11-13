# 🎯 Sistema de Cotización de Láminas - EMPIEZA AQUÍ

**¡Bienvenido!** Este es un sistema completo de cotización de films y laminados desarrollado en **Next.js 15 + TypeScript + MySQL**.

## 📚 Documentación Disponible

Tienes varios archivos de documentación según tus necesidades:

### 🚀 Para empezar rápido
- **[QUICKSTART.md](QUICKSTART.md)** - Guía de 5 minutos para tener todo funcionando

### 🛠️ Para instalación detallada
- **[SETUP.md](SETUP.md)** - Guía completa de instalación paso a paso
- Incluye configuración para **WSL**, **Windows**, **Linux** y **Mac**

### 📖 Para entender el sistema
- **[README-NEXTJS.md](README-NEXTJS.md)** - Documentación técnica completa
- Estructura del proyecto, API endpoints, deployment, etc.

### 📋 Documentación original
- **[README.md](README.md)** - Documentación del sistema original Python/FastAPI
- **[ARCHITECTURE.md](ARCHITECTURE.md)** - Arquitectura del sistema
- **[DIAGRAMS_AND_FLOWS.md](DIAGRAMS_AND_FLOWS.md)** - Diagramas y flujos

## ⚡ Inicio Súper Rápido

```bash
# 1. Instalar dependencias
npm install

# 2. Configurar .env
cp .env.example .env
# Editar .env con tus credenciales de MySQL

# 3. Crear base de datos
# En MySQL: CREATE DATABASE cotizador_laminas;

# 4. Inicializar DB (elige según tu sistema)
bash scripts/init-db-wsl.sh     # Para WSL
bash scripts/init-db.sh         # Para Linux/Mac
scripts\init-db.bat             # Para Windows

# 5. Iniciar servidor
npm run dev
```

¡Abre http://localhost:3000 y listo! 🎉

## 🗂️ Estructura del Proyecto

```
cotizador-laminas/
├── app/                    # Next.js App Router
│   ├── api/               # API Routes
│   │   ├── products/      # CRUD de productos
│   │   └── quotations/    # CRUD de cotizaciones
│   ├── page.tsx           # Página principal
│   └── layout.tsx         # Layout global
│
├── components/            # Componentes React
│   └── QuotationForm.tsx  # Formulario de cotización
│
├── lib/                   # Lógica de negocio
│   ├── calculator.ts      # Motor de cálculo
│   ├── prisma.ts         # Cliente Prisma
│   └── seed.ts           # Datos de ejemplo
│
├── prisma/
│   └── schema.prisma      # Schema de base de datos
│
├── scripts/               # Scripts de utilidad
│   ├── init-db-wsl.sh    # Setup para WSL
│   ├── init-db.sh        # Setup para Linux/Mac
│   └── init-db.bat       # Setup para Windows
│
└── [documentación]
```

## 🎨 Características Principales

✅ **Formulario Multi-Paso** - Interfaz intuitiva para crear cotizaciones
✅ **Motor de Cálculo Avanzado** - Calcula desperdicios y factores de complejidad
✅ **API RESTful** - Endpoints para integración
✅ **Base de Datos MySQL** - Con Prisma ORM
✅ **TypeScript** - Type-safety completo
✅ **Tailwind CSS** - Estilos modernos y responsivos

## 🚀 Comandos Útiles

```bash
# Desarrollo
npm run dev          # Servidor de desarrollo (port 3000)
npm run build        # Build de producción
npm run start        # Servidor de producción
npm run lint         # Linter

# Base de datos
npm run db:generate  # Generar cliente Prisma
npm run db:push      # Aplicar schema (desarrollo)
npm run db:migrate   # Crear migración (producción)
npm run db:studio    # Abrir Prisma Studio GUI

# Datos
npx tsx lib/seed.ts  # Cargar productos de ejemplo
```

## 🗄️ Base de Datos

El sistema incluye estas tablas principales:

- **customers** - Clientes
- **products** - Catálogo de films
- **quotations** - Cotizaciones
- **quotation_items** - Items de cotizaciones
- **properties** - Propiedades (residencial/comercial)
- **rooms** - Habitaciones
- **openings** - Aberturas (ventanas, puertas, etc.)

## 🔌 API Endpoints

### Productos
```
GET  /api/products              # Listar todos
POST /api/products              # Crear nuevo
```

### Cotizaciones
```
GET  /api/quotations            # Listar todas
POST /api/quotations            # Crear y guardar
POST /api/quotations/calculate  # Solo calcular
```

## 🧮 Motor de Cálculo

El sistema calcula automáticamente:

- **Desperdicios por tipo** (ventanas 15%, puertas 18%, etc.)
- **Factor de complejidad** (altura, acceso, vidrio curvo, etc.)
- **Descuentos por volumen** (5-20% según m²)
- **Impuestos** (IVA 21%)

## 📊 Explorar Datos

Usa **Prisma Studio** para ver y editar datos con una GUI:

```bash
npm run db:studio
```

Abre http://localhost:5555

## 🐧 Soporte para WSL

Si usas Windows Subsystem for Linux:

1. El sistema detecta automáticamente WSL
2. Usa el script específico: `bash scripts/init-db-wsl.sh`
3. Instala MySQL en WSL o conéctate al de Windows

Ver detalles en [SETUP.md](SETUP.md#para-wsl-instalación-de-mysql)

## 🆘 Problemas Comunes

### "Can't reach database server"
```bash
# Verificar que MySQL esté corriendo
sudo service mysql status     # WSL/Linux
sudo systemctl status mysql   # Linux con systemd
services.msc                  # Windows
```

### "Access denied"
Verifica las credenciales en `.env`:
```env
DATABASE_URL="mysql://USER:PASSWORD@localhost:3306/cotizador_laminas"
```

### "Table doesn't exist"
```bash
npm run db:push
```

## 📞 Necesitas Ayuda?

1. **Inicio rápido**: Lee [QUICKSTART.md](QUICKSTART.md)
2. **Instalación detallada**: Lee [SETUP.md](SETUP.md)
3. **Documentación técnica**: Lee [README-NEXTJS.md](README-NEXTJS.md)
4. **Problemas**: Revisa la sección de troubleshooting en cada doc

## 🎯 Próximos Pasos

1. ✅ **Instalar y configurar** (siguiendo QUICKSTART.md)
2. ✅ **Explorar la interfaz** en http://localhost:3000
3. ✅ **Ver datos** con `npm run db:studio`
4. ✅ **Crear tu primera cotización**
5. ✅ **Personalizar productos** según tu negocio

## 🛠️ Stack Tecnológico

- **Framework**: Next.js 15 (App Router)
- **Lenguaje**: TypeScript
- **Base de Datos**: MySQL 8+
- **ORM**: Prisma
- **Estilos**: Tailwind CSS
- **Formularios**: React Hook Form + Zod
- **UI**: Lucide Icons
- **Cálculos**: Decimal.js

## 📝 Migración desde Python

Este proyecto es una **migración completa** del sistema original Python/FastAPI a Next.js:

- ✅ Motor de cálculo migrado (Python → TypeScript)
- ✅ API migrada (FastAPI → Next.js API Routes)
- ✅ Base de datos migrada (PostgreSQL/Alembic → MySQL/Prisma)
- ✅ Frontend actualizado (React → Next.js 15 App Router)

Los archivos originales de Python están presentes para referencia:
- `calculator.py` - Motor de cálculo original
- `__init__.py` - Módulo Python original

## 📄 Licencia

MIT License

---

## 🚀 ¿Listo para Empezar?

**Sigue estos pasos:**

1. Lee [QUICKSTART.md](QUICKSTART.md) para instalación rápida
2. O lee [SETUP.md](SETUP.md) para instalación detallada
3. Ejecuta `npm run dev`
4. Abre http://localhost:3000
5. ¡Crea tu primera cotización!

**¡Éxito! 🎉**
