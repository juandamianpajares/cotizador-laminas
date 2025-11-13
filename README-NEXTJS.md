# Sistema de Cotización de Láminas y Films - Next.js + MySQL

Sistema profesional de cotización de films y laminados desarrollado con **Next.js 15**, **TypeScript**, **Prisma ORM** y **MySQL**.

## 🎯 Características

- ✅ **Next.js 15** con App Router
- ✅ **TypeScript** para type-safety
- ✅ **Prisma ORM** para gestión de base de datos MySQL
- ✅ **Tailwind CSS** para estilos
- ✅ **Motor de cálculo avanzado** migrado desde Python
- ✅ **API Routes** RESTful
- ✅ **Formulario interactivo** multi-paso
- ✅ **Cálculo de desperdicios** por tipo de abertura y film
- ✅ **Descuentos por volumen** automáticos
- ✅ **Factor de complejidad** para instalaciones difíciles

## 🚀 Inicio Rápido

### 1. Instalar dependencias

```bash
npm install
```

### 2. Configurar base de datos

```bash
# Crear base de datos MySQL
mysql -u root -p
CREATE DATABASE cotizador_laminas;
exit;

# Copiar archivo de configuración
cp .env.example .env

# Editar .env con tus credenciales de MySQL
# DATABASE_URL="mysql://root:password@localhost:3306/cotizador_laminas"
```

### 3. Aplicar schema de base de datos

```bash
npm run db:generate
npm run db:push
```

### 4. Iniciar servidor de desarrollo

```bash
npm run dev
```

Abre http://localhost:3000 en tu navegador.

## 📁 Estructura del Proyecto

```
cotizador-laminas/
├── app/
│   ├── api/
│   │   ├── products/
│   │   │   └── route.ts          # API de productos
│   │   └── quotations/
│   │       ├── route.ts           # API de cotizaciones
│   │       └── calculate/
│   │           └── route.ts       # Cálculo de cotización
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx                   # Página principal
├── components/
│   └── QuotationForm.tsx          # Formulario de cotización
├── lib/
│   ├── calculator.ts              # Motor de cálculo
│   └── prisma.ts                  # Cliente Prisma
├── prisma/
│   └── schema.prisma              # Schema de base de datos
├── .env.example                   # Variables de entorno ejemplo
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── next.config.ts
```

## 🗄️ Base de Datos

### Schema Principal

El sistema usa las siguientes tablas:

- **customers**: Información de clientes
- **products**: Catálogo de films y laminados
- **quotations**: Cotizaciones generadas
- **quotation_items**: Detalles de cada item
- **properties**: Propiedades (residencial/comercial)
- **rooms**: Habitaciones
- **openings**: Aberturas (ventanas, puertas, etc.)

### Explorar la Base de Datos

```bash
npm run db:studio
```

Esto abre Prisma Studio en http://localhost:5555

## 🔌 API Endpoints

### Productos

```http
GET  /api/products              # Listar productos
POST /api/products              # Crear producto
```

### Cotizaciones

```http
GET  /api/quotations            # Listar cotizaciones
POST /api/quotations            # Crear cotización completa
POST /api/quotations/calculate  # Calcular sin guardar
```

### Ejemplo: Crear Producto

```bash
curl -X POST http://localhost:3000/api/products \
  -H "Content-Type: application/json" \
  -d '{
    "sku": "SOL-CER-70",
    "name": "Film Control Solar Cerámico 70%",
    "description": "Rechazo de calor con 70% de visibilidad",
    "category": "SOLAR_CONTROL",
    "pricePerSqm": 35.00,
    "installationPerSqm": 18.00
  }'
```

### Ejemplo: Calcular Cotización

```bash
curl -X POST http://localhost:3000/api/quotations/calculate \
  -H "Content-Type: application/json" \
  -d '{
    "vertical": "residential",
    "customer": {
      "name": "Juan Pérez",
      "email": "juan@ejemplo.com",
      "phone": "+54 11 1234-5678"
    },
    "property": {
      "type": "house",
      "address": "Av. Corrientes 1234",
      "city": "Buenos Aires"
    },
    "rooms": [
      {
        "name": "Sala Principal",
        "type": "living_room",
        "floor": 1,
        "openings": [
          {
            "id": "opening-1",
            "type": "window",
            "width": 2.0,
            "height": 1.5,
            "quantity": 2,
            "productId": "uuid-del-producto",
            "specifications": {}
          }
        ]
      }
    ]
  }'
```

## 🧮 Motor de Cálculo

El sistema incluye un motor de cálculo avanzado que:

### Matriz de Desperdicios

Calcula el desperdicio según el tipo de abertura y film:

- **Ventanas**: 12-15% desperdicio
- **Puertas**: 15-18% desperdicio
- **Mamparas**: 18-22% desperdicio
- **Tragaluces**: 22-25% desperdicio
- **Automotriz curvo**: hasta 30% desperdicio

### Factor de Complejidad

Ajusta el costo de instalación según:

- **Altura** (pisos altos)
- **Acceso difícil**
- **Vidrio curvo**
- **Condiciones climáticas extremas**
- **Instalación nocturna**
- **Requiere andamios**

### Descuentos por Volumen

Aplica descuentos automáticos:

- 50+ m²: 5% descuento
- 100+ m²: 10% descuento
- 200+ m²: 15% descuento
- 500+ m²: 20% descuento

## 🎨 Formulario Interactivo

El formulario incluye:

1. **Selección de vertical** (Residencial, Comercial, Automotriz)
2. **Información del cliente**
3. **Información de la propiedad**
4. **Habitaciones y aberturas** (múltiples)
5. **Preview de cotización** con totales

## 📝 Scripts NPM

```bash
# Desarrollo
npm run dev          # Servidor de desarrollo
npm run build        # Build de producción
npm run start        # Servidor de producción
npm run lint         # Linter

# Base de datos
npm run db:generate  # Generar cliente Prisma
npm run db:push      # Aplicar schema (desarrollo)
npm run db:migrate   # Crear migración (producción)
npm run db:studio    # Abrir Prisma Studio
```

## 🔒 Seguridad

### Validación de Inputs

- Validación con **Zod** en el formulario
- Validación en API routes
- Sanitización de datos antes de guardar

### Base de Datos

- Uso de **Prisma ORM** previene SQL injection
- Relaciones con constraints de foreign keys
- Cascade deletes configurados

## 🚢 Deployment

### Vercel (Recomendado)

```bash
# Instalar Vercel CLI
npm i -g vercel

# Deploy
vercel
```

Configura la variable de entorno `DATABASE_URL` en el dashboard de Vercel.

### Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

### Variables de Entorno en Producción

```env
DATABASE_URL="mysql://user:password@production-host:3306/cotizador_laminas"
NEXT_PUBLIC_APP_URL="https://tu-dominio.com"
```

## 📚 Tecnologías Utilizadas

- **[Next.js 15](https://nextjs.org/)** - Framework React
- **[TypeScript](https://www.typescriptlang.org/)** - Tipado estático
- **[Prisma](https://www.prisma.io/)** - ORM para MySQL
- **[Tailwind CSS](https://tailwindcss.com/)** - Estilos
- **[React Hook Form](https://react-hook-form.com/)** - Formularios
- **[Zod](https://zod.dev/)** - Validación de schemas
- **[Lucide React](https://lucide.dev/)** - Iconos
- **[Decimal.js](https://mikemcl.github.io/decimal.js/)** - Cálculos precisos

## 🔄 Migración desde Python

El motor de cálculo original en Python (`calculator.py`) fue migrado completamente a TypeScript en `lib/calculator.ts`, manteniendo:

- ✅ Misma lógica de negocio
- ✅ Mismos porcentajes de desperdicio
- ✅ Mismo cálculo de complejidad
- ✅ Mismos descuentos por volumen
- ✅ Precisión decimal

## 🤝 Contribuir

1. Fork el proyecto
2. Crear rama de feature (`git checkout -b feature/AmazingFeature`)
3. Commit cambios (`git commit -m 'Add AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir Pull Request

## 📄 Licencia

MIT License

## 📞 Soporte

Para más información, ver [SETUP.md](SETUP.md) para instrucciones detalladas de instalación.

---

**¡Desarrollado con ❤️ usando Next.js y MySQL!**
