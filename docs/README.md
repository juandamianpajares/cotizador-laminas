# Sistema de Cotización de Láminas para Vidrios

## Plataforma Multi-Vertical: Automotriz, Residencial, Comercial y Arquitectónico

[![Next.js](https://img.shields.io/badge/Next.js-15.1.5-black)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-blue)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5+-blue)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748)](https://www.prisma.io/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---

## 📋 Tabla de Contenidos

- [Visión del Proyecto](#visión-del-proyecto)
- [Estado Actual (Sprints 1-7)](#estado-actual-sprints-1-7)
- [Roadmap 2025 (Sprints 8-13)](#roadmap-2025-sprints-8-13)
- [Arquitectura](#arquitectura)
- [Tecnologías](#tecnologías)
- [Instalación](#instalación)
- [Uso](#uso)
- [Testing](#testing)
- [Contribuir](#contribuir)

---

## 🎯 Visión del Proyecto

Sistema empresarial integral para cotización y gestión de láminas para vidrios, diseñado para revolucionar la experiencia del cliente y optimizar las operaciones del negocio.

### Objetivo Principal

Crear una plataforma omnicanal que permita:
- **Clientes**: Solicitar cotizaciones fácilmente desde WhatsApp o web con mínimos datos
- **Encargados**: Completar cotizaciones profesionales con sistema de plantillas y pricing paramétrico
- **Empresa**: Gestionar todo el ciclo de vida del pedido desde cotización hasta entrega

### Verticales de Negocio

#### 🚗 Automotriz (En Producción)
- Láminas de seguridad polarizadas
- Sistema de plantillas por tipo de vehículo (Sedán, SUV, Coupé, Pickup)
- Restricciones legales automáticas (parabrisas sin oscurecimiento)
- Segmentación de clientes (Nuevo, Leal, Mayorista, Corporativo)
- Pricing diferenciado por tipo de vehículo

#### 🏠 Residencial (Próximo Sprint)
- Ventanas de hogares y departamentos
- Puertas de vidrio (corredizas, abatibles)
- Mamparas de baño
- Control solar y privacidad

#### 🏢 Arquitectónico/Comercial (Futuro)
- Fachadas de edificios corporativos
- Divisiones de oficinas
- Vinilos decorativos y logos corporativos
- Franjas y diseños personalizados

### Categorías de Productos

| Categoría | Estado | Aplicaciones |
|-----------|--------|--------------|
| **Laminado de Seguridad Polarizado** | ✅ En Producción | Protección anti-impacto + privacidad |
| **Control Solar** | 📋 Planificado | Rechazo de calor, ahorro energético |
| **Privacidad** | 📋 Planificado | Control visual |
| **Vinílico Decorativo** | 📋 Planificado | Decoración, corporativo |

---

## 🚀 Estado Actual (Sprints 1-7)

### ✅ Funcionalidades Completadas

#### Sprint 1-3: Base del Sistema
- ✅ Configuración Next.js 15.1.5 con App Router
- ✅ Prisma ORM con MySQL
- ✅ Sistema de autenticación básico
- ✅ Base de datos con productos, clientes, cotizaciones

#### Sprint 4-5: Formulario de Vehículos
- ✅ Formulario multi-paso (4 steps)
- ✅ Selector de tipo de cliente con descuentos automáticos:
  - Nuevo: 0%
  - Leal: 10%
  - Mayorista: 15%
  - Corporativo: 20%
- ✅ Información del vehículo:
  - Tipo (Sedán, SUV, Coupé, Pickup) con radio buttons
  - Marca y modelo
  - Año (selector 2025-1981)
  - Detección de film viejo (costo adicional)
- ✅ Imagen placeholder del vehículo

#### Sprint 6: Sistema de Plantillas de Vidrios
- ✅ Plantillas predefinidas por tipo de vehículo
- ✅ Vidrios obligatorios y opcionales
- ✅ Restricciones legales automáticas (parabrisas sin oscurecimiento)
- ✅ Áreas aproximadas por tipo de vidrio
- ✅ Clasificación curvo/plano

#### Sprint 7: Pricing Simplificado
- ✅ Solo Láminas de Seguridad Polarizadas
- ✅ Pricing fijo por tipo de vehículo:
  - Sedán: $150/m²
  - SUV: $180/m²
  - Coupé: $140/m²
  - Pickup: $160/m²
- ✅ Vista de encargado (manager view)
- ✅ Resumen de cotización con descuentos aplicados

### 📁 Estructura del Proyecto Actual

```
cotizador-laminas/
├── app/
│   ├── cotizar/
│   │   ├── vehiculos/page.tsx    # Formulario principal
│   │   ├── residencial/page.tsx  # Próximo sprint
│   │   └── arquitectura/page.tsx # Futuro
│   └── api/                      # API routes
├── lib/
│   ├── vehicleWindows.ts         # Sistema de plantillas
│   ├── vehicleApi.ts             # API de vehículos (futuro)
│   └── prisma.ts                 # Prisma client
├── prisma/
│   └── schema.prisma             # Modelo de datos
└── public/                       # Assets estáticos
```

### 🎨 Características Implementadas

#### Formulario Multi-Paso
1. **Step 1**: Información del cliente y tipo de cliente
2. **Step 2**: Datos del vehículo con plantilla automática
3. **Step 3**: Selección de vidrios y ajuste de dimensiones
4. **Step 4**: Resumen y confirmación de cotización

#### Sistema de Plantillas
- Carga automática de vidrios según tipo de vehículo
- Badges visuales: Obligatorio, Curvo/Plano, Restricciones legales
- Panel de vidrios opcionales disponibles
- Cálculo de área en tiempo real

#### Segmentación de Clientes
- Tipo de cliente con descuentos automáticos
- Detección de film viejo para costo adicional
- Pricing diferenciado por tipo de vehículo

---

## 🗺️ Roadmap 2025 (Sprints 8-13)

### Sprint 8: Integración API de Vehículos 🚗
**Fecha estimada**: Q1 2025 | **Duración**: 2 semanas

#### Objetivos
- Integrar con API externa para datos reales de vehículos
- Cargar imágenes reales de vehículos por marca/modelo/año
- Generar preview con tonos aplicados

#### Funcionalidades
1. **Conexión API Vehículos**
   - Endpoint: `GET /api/vehiculo?marca={marca}&modelo={modelo}&año={año}`
   - Obtener imagen del vehículo
   - Obtener especificaciones exactas de vidrios

2. **Generación de Previews**
   - Endpoint: `POST /api/generar-imagen`
   - Aplicar tonos de lámina a la imagen
   - Mostrar antes/después

3. **Carga Dinámica de Marcas/Modelos**
   - Autocomplete para marca
   - Filtrado de modelos por marca
   - Validación de año compatible

#### Criterios de Aceptación
- ✅ Cargar al menos 50 modelos populares
- ✅ Imágenes de alta calidad (mínimo 1200x800px)
- ✅ Preview con VLT correcto por producto
- ✅ Fallback a plantillas si API falla

---

### Sprint 9: Sistema de Pricing Paramétrico 💰
**Fecha estimada**: Q1 2025 | **Duración**: 3 semanas

#### Objetivos
- Implementar motor de cálculo paramétrico complejo
- Soportar múltiples variables de pricing
- Mantener margen de error aceptable (5-15%)

#### Variables del Pricing

| Variable | Impacto | Rango |
|----------|---------|-------|
| **Tipo de Vehículo** | Alto | Sedán: $150, SUV: $180, Coupé: $140, Pickup: $160 |
| **Marca Premium** | Medio | +20% para marcas de lujo |
| **Año del Vehículo** | Bajo | +10% si >2020, -5% si <2010 |
| **Tipo de Vidrio** | Alto | Curvo: +30%, Plano: base |
| **Área Total** | Alto | Descuento por volumen: >10m²: -10% |
| **Film Viejo** | Medio | Remoción: +$50 por vidrio |
| **Tipo de Cliente** | Alto | Nuevo: 0%, Leal: -10%, Mayorista: -15%, Corp: -20% |
| **Complejidad Instalación** | Medio | Acceso difícil: +15% |

#### Fórmula de Cálculo

```typescript
precioFinal = (
  precioBase * areaTotal * factorVehículo * factorMarca *
  factorAño * factorVidrio * (1 - descuentoVolumen) *
  (1 - descuentoCliente) + costoRemoción
) * factorComplejidad
```

#### Margen de Error Aceptable
- **Cotizaciones Simples** (1-3 vidrios, sedán estándar): ±5%
- **Cotizaciones Medias** (4-6 vidrios, SUV): ±10%
- **Cotizaciones Complejas** (7+ vidrios, múltiples tipos): ±15%

#### Testing Requerido
- 50 casos de prueba documentados
- Validación con cotizaciones históricas reales
- A/B testing con encargados

---

### Sprint 10: Portal Simplificado para Clientes 📱
**Fecha estimada**: Q2 2025 | **Duración**: 2 semanas

#### Objetivos
- Crear formulario minimalista para clientes finales
- Enfocado en captura rápida por WhatsApp
- UX mobile-first

#### Formulario del Cliente

##### Campos Obligatorios (Mínimo)
1. **Número de Teléfono** (WhatsApp)
   - Validación de formato internacional
   - Confirmación por código SMS/WhatsApp

2. **Dirección**
   - Autocomplete con Google Places API
   - Para coordinar visita técnica

3. **Foto del Vehículo** (al menos 1)
   - Desde cámara o galería
   - Máximo 5MB por imagen
   - Compresión automática

##### Campos Opcionales
- Tipo de servicio deseado:
  - ☑️ Parabrisas con protección
  - ☑️ Visera (franja superior parabrisas)
  - ☑️ Parabrisas con IR70/IR50 (rechazo de calor)
  - ☑️ Laterales y luneta (paquete completo)

- Fotos adicionales (hasta 3):
  - Lateral del vehículo
  - Vista trasera
  - Interior/dashboard

#### Flujo de Usuario

```
1. Cliente ingresa a link compartido por WhatsApp
   ↓
2. Completa formulario simple (2 minutos)
   ↓
3. Sube foto del vehículo
   ↓
4. Recibe confirmación: "Cotización en proceso"
   ↓
5. Encargado recibe notificación
   ↓
6. Encargado completa datos faltantes
   ↓
7. Envía cotización final por WhatsApp
   ↓
8. Cliente aprueba/rechaza/consulta
```

#### UI/UX Requerimientos
- Tiempo de carga < 2 segundos
- Diseño mobile-first (90% tráfico esperado)
- Solo 1 página, sin pasos
- Auto-save en LocalStorage
- PWA para instalación en home screen

---

### Sprint 11: Formulario Arquitectónico 🏠
**Fecha estimada**: Q2 2025 | **Duración**: 3 semanas

#### Objetivos
- Formulario para proyectos residenciales/comerciales
- Sistema de captura por habitación y abertura
- Upload múltiple de imágenes organizadas

#### Estructura del Formulario

##### 1. Información del Proyecto
- Tipo: Casa, Departamento, Oficina, Edificio Corporativo
- Dirección completa
- Cantidad de pisos
- Cantidad estimada de aberturas

##### 2. Por Habitación
Cada habitación requiere:

**Datos Obligatorios**
- Nombre de la habitación (ej: "Sala Principal")
- Tipo (Sala, Dormitorio, Cocina, Baño, Oficina)
- Piso
- **Foto de la habitación** (obligatoria)

**Aberturas de la Habitación**
Por cada abertura:
- Tipo: Ventana, Puerta corrediza, Puerta abatible, Mampara, Fachada
- Ancho y alto (en metros)
- Cantidad de paños
- Tipo de vidrio: Templado, Laminado, Común
- **Foto de la abertura** (obligatoria)
- Producto deseado: Control Solar, Privacidad, Decorativo

##### 3. Requerimientos Especiales
- Acceso: Fácil, Requiere andamio, Altura >3m
- Urgencia: Normal, Urgente (<7 días)
- Instalación: Diurna, Nocturna, Fin de semana

#### Sistema de Fotos

```
Proyecto: Casa Pérez
├── Sala Principal/
│   ├── habitacion.jpg (general de la sala)
│   ├── ventana-frontal-1.jpg
│   ├── ventana-frontal-2.jpg
│   └── puerta-corrediza.jpg
├── Dormitorio 1/
│   ├── habitacion.jpg
│   └── ventana-lateral.jpg
└── Baño Principal/
    ├── habitacion.jpg
    └── mampara.jpg
```

#### Upload de Imágenes
- Cloudinary o AWS S3 para almacenamiento
- Compresión automática (max 2MB por imagen)
- Thumbnails para preview
- Organización por carpetas automática
- Metadata: timestamp, geolocalización (opcional)

#### Cálculo de Pricing
Similar a vehículos pero con variables diferentes:

| Variable | Impacto |
|----------|---------|
| Tipo de abertura | Alto (ventana vs fachada) |
| Piso | Medio (+5% por piso >1) |
| Acceso | Alto (+30% si requiere andamio) |
| Urgencia | Medio (+20% si urgente) |
| Volumen | Alto (descuento por m²) |

#### Margen de Error
- Proyectos pequeños (<20m²): ±8%
- Proyectos medianos (20-50m²): ±12%
- Proyectos grandes (>50m²): ±18% (requiere visita técnica)

---

### Sprint 12: WhatsApp Business Integration 💬
**Fecha estimada**: Q2-Q3 2025 | **Duración**: 3 semanas

#### Objetivos
- Integrar WhatsApp Business API
- Chatbot inteligente para cotizaciones incompletas
- Sistema de notificaciones y seguimiento

#### Funcionalidades del Chatbot

##### 1. Recepción de Cotizaciones Incompletas
Cuando cliente envía solicitud sin todos los datos:

```
Cliente: "Hola, quiero cotizar láminas para mi auto"
Bot: "¡Hola! 👋 Te ayudo con la cotización.

Para darte un precio preciso, necesito:
1️⃣ Marca y modelo de tu vehículo
2️⃣ Año
3️⃣ ¿Qué vidrios quieres laminar? (todos, solo laterales, etc.)
4️⃣ Una foto de tu vehículo

¿Empezamos? 😊"
```

##### 2. Flujo Conversacional

```
Cliente envía: "Tengo un Toyota Corolla 2020"
  ↓
Bot: "Perfecto! Toyota Corolla 2020 ✅
     ¿Qué vidrios quieres laminar?
     1. Todos los vidrios
     2. Solo laterales y luneta
     3. Solo parabrisas
     4. Personalizado"
  ↓
Cliente: "2"
  ↓
Bot: "Excelente elección. Laterales y luneta ✅
     Por favor envíame una foto de tu vehículo 📸"
  ↓
Cliente: [envía foto]
  ↓
Bot: "¡Gracias! 🎉 Tu cotización está siendo procesada.
     Te contactaremos en menos de 30 minutos.
     Número de cotización: #12345"
  ↓
Encargado completa cotización
  ↓
Bot: "¡Tu cotización está lista! 📋

     Toyota Corolla 2020
     - Laterales y luneta
     - Lámina de Seguridad Polarizada

     Total: $1,850 (incluye instalación)
     Descuento cliente leal: -$185

     TOTAL FINAL: $1,665

     ¿Deseas agendar la instalación? 📅"
```

##### 3. Estados de Pedido

Notificaciones automáticas:

| Estado | Mensaje |
|--------|---------|
| **Cotización recibida** | "✅ Recibimos tu solicitud #12345. La procesaremos en breve." |
| **Cotización lista** | "📋 Tu cotización está lista. Total: $X. ¿Aceptas?" |
| **Aprobada** | "🎉 ¡Genial! Tu pedido fue aprobado. ¿Cuándo te viene bien la instalación?" |
| **Agendada** | "📅 Instalación agendada para [fecha] a las [hora]." |
| **En camino** | "🚗 Nuestro equipo está en camino. Llegada estimada: [hora]." |
| **En proceso** | "🔧 Instalación en proceso. Tiempo estimado: 2 horas." |
| **Completada** | "✅ ¡Instalación completada! Gracias por confiar en nosotros. ¿Cómo fue tu experiencia?" |

##### 4. Manejo de Consultas

```
Cliente: "¿Cuánto dura la instalación?"
Bot busca en knowledge base y responde:
"La instalación suele tomar entre 2-4 horas dependiendo de la cantidad de vidrios. Para tu caso (laterales y luneta), estimamos 2.5 horas ⏱️"
```

#### Tecnología

- **API**: WhatsApp Business API (oficial)
- **Provider**: Twilio / MessageBird / 360dialog
- **NLP**: GPT-4 para respuestas inteligentes
- **Knowledge Base**: Preguntas frecuentes predefinidas
- **Webhook**: Para notificaciones en tiempo real

#### Integración con Sistema

```typescript
// Esquema de datos
interface WhatsAppConversation {
  id: string;
  phone: string;
  status: 'active' | 'pending_manager' | 'quoted' | 'closed';
  quotationId?: string;
  messages: WhatsAppMessage[];
  metadata: {
    vehicleInfo?: Partial<Vehicle>;
    customerInfo?: Partial<Customer>;
    photos?: string[];
  };
}

interface WhatsAppMessage {
  id: string;
  conversationId: string;
  direction: 'inbound' | 'outbound';
  type: 'text' | 'image' | 'document';
  content: string;
  timestamp: Date;
  read: boolean;
}
```

---

### Sprint 13: Sitio Web Empresarial 🌐
**Fecha estimada**: Q3 2025 | **Duración**: 2 semanas

#### Objetivos
- Landing page profesional
- Información de servicios
- Portal de clientes integrado
- SEO optimizado

#### Páginas

1. **Home**
   - Hero con CTA: "Cotiza tu vehículo ahora"
   - Servicios principales (Automotriz, Residencial, Comercial)
   - Testimonios de clientes
   - Portfolio de trabajos

2. **Servicios**
   - Láminas automotrices
   - Láminas residenciales
   - Proyectos arquitectónicos
   - Control solar empresarial

3. **Cotizar** (integración con formularios)
   - Link directo a formularios por vertical
   - Botón WhatsApp flotante

4. **Nosotros**
   - Historia de la empresa
   - Equipo
   - Certificaciones
   - Instalaciones

5. **Contacto**
   - Formulario de contacto
   - Mapa con ubicación
   - WhatsApp, Email, Teléfono
   - Horarios de atención

#### Features Especiales

- **Portal de Cliente**
  - Login con teléfono
  - Ver historial de cotizaciones
  - Tracking de pedidos
  - Descargar PDFs de cotizaciones

- **Blog de Contenido**
  - "¿Qué lámina elegir para mi auto?"
  - "Beneficios del control solar"
  - Casos de estudio

- **SEO**
  - Keywords: "laminas para autos", "insulfilm", "polarizado autos"
  - Meta tags optimizados
  - Schema markup
  - Sitemap XML

---

## 🏗️ Arquitectura

### Stack Tecnológico Actual

```
┌─────────────────────────────────────────────────────┐
│                    FRONTEND                         │
│  Next.js 15.1.5 + React 19 + TypeScript            │
│  - App Router                                       │
│  - Server Components                                │
│  - Tailwind CSS                                     │
└─────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────┐
│                  API ROUTES                         │
│  Next.js API Routes                                 │
│  - RESTful endpoints                                │
│  - Validación con Zod                               │
└─────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────┐
│                     ORM                             │
│  Prisma ORM                                         │
│  - Type-safe database access                        │
│  - Migrations                                       │
└─────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────┐
│                   DATABASE                          │
│  MySQL                                              │
│  - Productos, Clientes, Cotizaciones                │
└─────────────────────────────────────────────────────┘
```

### Modelo de Datos Actual

```prisma
model Customer {
  id            String   @id @default(cuid())
  name          String
  email         String?
  phone         String?
  customerType  String   // nuevo, leal, mayorista, corporativo
  quotations    Quotation[]
}

model Vehicle {
  id              String   @id @default(cuid())
  marca           String
  modelo          String
  año             String
  tipo            String   // sedan, suv, coupe, pickup
  tieneFilmViejo  Boolean
  imageUrl        String?
  quotation       Quotation @relation(fields: [quotationId])
  quotationId     String   @unique
}

model Quotation {
  id            String   @id @default(cuid())
  customer      Customer @relation(fields: [customerId])
  customerId    String
  vehicle       Vehicle?
  items         QuotationItem[]
  subtotal      Float
  discount      Float
  total         Float
  status        String   // draft, sent, approved, rejected
  createdAt     DateTime @default(now())
}

model QuotationItem {
  id          String @id @default(cuid())
  quotation   Quotation @relation(fields: [quotationId])
  quotationId String
  windowType  String
  width       Float
  height      Float
  area        Float
  product     Product @relation(fields: [productId])
  productId   String
  price       Float
}

model Product {
  id           String @id @default(cuid())
  name         String
  category     String   // LAMINATE_SECURITY, SOLAR_CONTROL, etc.
  pricePerSqm  Float
  description  String?
}
```

---

## 🛠️ Tecnologías

### Core Stack
- **Framework**: Next.js 15.1.5
- **Frontend**: React 19
- **Language**: TypeScript 5+
- **Styling**: Tailwind CSS 3+
- **ORM**: Prisma
- **Database**: MySQL 8+

### Librerías y Herramientas
- **Forms**: React Hook Form (futuro)
- **Validation**: Zod (futuro)
- **Date**: date-fns
- **Icons**: Lucide React
- **UI Components**: Headless UI (futuro)

### Integraciones Planificadas
- **WhatsApp**: Twilio / MessageBird
- **Images**: Cloudinary / AWS S3
- **Maps**: Google Maps API
- **Analytics**: Google Analytics 4
- **Payments**: Stripe / MercadoPago (futuro)

### Infrastructure (Futuro)
- **Containerization**: Docker
- **Cloud**: Vercel / AWS
- **Monitoring**: Vercel Analytics
- **Error Tracking**: Sentry
- **CI/CD**: GitHub Actions

---

## 🚀 Instalación

### Prerrequisitos

- Node.js 18+
- npm o pnpm
- MySQL 8+ (local o remoto)
- Git

### Pasos de Instalación

1. **Clonar el repositorio**
```bash
git clone https://github.com/juandamianpajares/cotizador-laminas.git
cd cotizador-laminas
```

2. **Instalar dependencias**
```bash
npm install
# o
pnpm install
```

3. **Configurar variables de entorno**
```bash
cp .env.example .env.local
```

Editar `.env.local`:
```env
# Database
DATABASE_URL="mysql://user:password@localhost:3306/cotizador_laminas"

# Next Auth (futuro)
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"

# API Externa de Vehículos (Sprint 8)
NEXT_PUBLIC_VEHICLE_API_URL="http://localhost:5000"

# WhatsApp (Sprint 12)
TWILIO_ACCOUNT_SID="your-twilio-sid"
TWILIO_AUTH_TOKEN="your-twilio-token"
TWILIO_WHATSAPP_NUMBER="whatsapp:+14155238886"

# Cloudinary (Sprint 11)
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"
```

4. **Configurar base de datos**

En Windows (WSL o CMD):
```bash
# Iniciar MySQL
net start MySQL80

# Crear base de datos
mysql -u root -p
CREATE DATABASE cotizador_laminas;
exit;
```

5. **Ejecutar migraciones de Prisma**
```bash
npx prisma generate
npx prisma db push
```

6. **Cargar datos iniciales (seed)**
```bash
npm run seed
```

7. **Iniciar servidor de desarrollo**
```bash
npm run dev
```

8. **Acceder a la aplicación**
- Aplicación: http://localhost:3000
- Formulario Vehículos: http://localhost:3000/cotizar/vehiculos
- Prisma Studio: `npx prisma studio` → http://localhost:5555

### Comandos Útiles

```bash
# Desarrollo
npm run dev              # Inicia servidor de desarrollo
npm run build            # Build para producción
npm run start            # Inicia servidor de producción
npm run lint             # Ejecuta ESLint

# Prisma
npx prisma studio        # Interfaz visual de base de datos
npx prisma generate      # Genera Prisma Client
npx prisma db push       # Sincroniza schema con DB
npx prisma migrate dev   # Crea nueva migración
npx prisma db seed       # Ejecuta seed

# Testing (futuro)
npm test                 # Ejecuta tests
npm run test:coverage    # Tests con cobertura
```

---

## 📖 Uso

### Crear Cotización para Vehículo (Actual)

#### Paso 1: Información del Cliente

Navegar a `/cotizar/vehiculos` y completar:

```typescript
{
  name: "Juan Pérez",
  email: "juan@ejemplo.com",
  phone: "+54 11 1234-5678",
  customerType: "leal"  // nuevo, leal, mayorista, corporativo
}
```

**Descuentos automáticos aplicados:**
- Nuevo: 0%
- Leal: 10%
- Mayorista: 15%
- Corporativo: 20%

#### Paso 2: Datos del Vehículo

```typescript
{
  tipo: "sedan",      // sedan, suv, coupe, pickup (radio buttons)
  marca: "Toyota",
  modelo: "Corolla",
  año: "2020",        // Selector 2025-1981
  tieneFilmViejo: false  // Sí/No (costo adicional si es true)
}
```

**El sistema automáticamente:**
1. Carga plantilla de vidrios según el tipo de vehículo
2. Carga vidrios obligatorios (laterales, luneta)
3. Muestra vidrios opcionales disponibles (parabrisas, techo panorámico, triángulos)
4. Aplica restricciones legales (parabrisas sin oscurecimiento)

#### Paso 3: Selección y Ajuste de Vidrios

El sistema pre-carga vidrios obligatorios:

**Ejemplo para Sedán:**
- ✅ Lateral Izquierdo Delantero (0.6 m²) - Obligatorio
- ✅ Lateral Derecho Delantero (0.6 m²) - Obligatorio
- ✅ Lateral Izquierdo Trasero (0.5 m²) - Obligatorio
- ✅ Lateral Derecho Trasero (0.5 m²) - Obligatorio
- ✅ Luneta Trasera (1.2 m²) - Obligatorio
- ➕ Parabrisas (1.5 m²) - Opcional
  - ⚠️ No permite oscurecimiento (legal)

**Para cada vidrio:**
- Ajustar ancho/alto si es necesario
- Producto: Lámina de Seguridad Polarizada (predeterminado)
- Precio: Según tipo de vehículo
  - Sedán: $150/m²
  - SUV: $180/m²
  - Coupé: $140/m²
  - Pickup: $160/m²

#### Paso 4: Resumen y Confirmación

```json
{
  "cliente": "Juan Pérez (Cliente Leal)",
  "vehiculo": "Toyota Corolla 2020 - Sedán",
  "vidrios": [
    {
      "nombre": "Lateral Izquierdo Delantero",
      "area": "0.60 m²",
      "precio": "$90.00"
    },
    {
      "nombre": "Lateral Derecho Delantero",
      "area": "0.60 m²",
      "precio": "$90.00"
    },
    {
      "nombre": "Luneta Trasera",
      "area": "1.20 m²",
      "precio": "$180.00"
    }
  ],
  "subtotal": "$360.00",
  "descuento": "-$36.00 (10% Cliente Leal)",
  "total": "$324.00"
}
```

### Casos de Uso Comunes

#### 1. Cotización Completa (Todos los Vidrios)
```
Tipo: SUV
Vidrios: Parabrisas + 4 Laterales + Luneta + Techo
Área Total: ~6.9 m²
Precio Base: $180/m² × 6.9 = $1,242
Descuento Leal (-10%): -$124.20
Total: $1,117.80
```

#### 2. Solo Laterales y Luneta (Común)
```
Tipo: Sedán
Vidrios: 4 Laterales + Luneta
Área Total: ~3.4 m²
Precio Base: $150/m² × 3.4 = $510
Descuento Mayorista (-15%): -$76.50
Total: $433.50
```

#### 3. Solo Parabrisas (Protección)
```
Tipo: Pickup
Vidrios: Solo Parabrisas
Área Total: 1.6 m²
Precio Base: $160/m² × 1.6 = $256
Lámina: Transparente de seguridad (sin oscurecimiento)
Total: $256.00
```

---

## 📚 Documentación Adicional

### Archivos de Documentación

- [CHANGELOG.md](CHANGELOG.md) - Historial completo de cambios por sprint
- [VEHICULOS-TEMPLATES.md](VEHICULOS-TEMPLATES.md) - Sistema de plantillas de vidrios
- [INTEGRACION-VEHICULOS.md](INTEGRACION-VEHICULOS.md) - Guía de integración con API de vehículos (Sprint 8)

### API Routes (Actual)

Las API routes están en desarrollo. Próximamente:

```typescript
// Cotizaciones
POST   /api/quotations/vehiculos
GET    /api/quotations/[id]
PUT    /api/quotations/[id]
DELETE /api/quotations/[id]

// Productos
GET    /api/products
GET    /api/products/[id]

// Clientes
POST   /api/customers
GET    /api/customers/[id]
```

---

## 🧪 Testing

### Estrategia de Testing

Debido a la complejidad del sistema de pricing paramétrico y las múltiples variables involucradas, se requiere una estrategia de testing exhaustiva con **márgenes de error aceptables**.

### Escenarios de Prueba por Complejidad

#### 1. Cotizaciones Simples ✅ (Margen: ±5%)

**Características:**
- 1-3 vidrios planos
- Vehículo sedán estándar
- Sin film viejo
- Cliente nuevo

**Casos de Prueba:**

| # | Descripción | Vidrios | Área Total | Precio Esperado | Margen Error |
|---|-------------|---------|------------|-----------------|--------------|
| 1 | Solo laterales delanteros | 2 laterales | 1.2 m² | $180 ± $9 | ±5% |
| 2 | Laterales + luneta | 5 vidrios | 3.4 m² | $510 ± $25.50 | ±5% |
| 3 | Solo parabrisas (seguridad) | 1 vidrio | 1.5 m² | $225 ± $11.25 | ±5% |

**Comando de Test:**
```bash
npm test -- tests/quotations/simple.test.ts
```

#### 2. Cotizaciones Medias 🔶 (Margen: ±10%)

**Características:**
- 4-6 vidrios mixtos (planos + curvos)
- Vehículo SUV o Pickup
- Puede tener film viejo
- Cliente leal o mayorista

**Casos de Prueba:**

| # | Descripción | Condiciones | Área Total | Precio Esperado | Margen Error |
|---|-------------|-------------|------------|-----------------|--------------|
| 4 | SUV completo | 6 vidrios + techo | 6.9 m² | $1,242 ± $124 | ±10% |
| 5 | Pickup con film viejo | 4 vidrios + remoción | 3.8 m² | $808 ± $80 | ±10% |
| 6 | Coupé con triángulos | 6 vidrios | 3.6 m² | $504 ± $50 | ±10% |

**Variables Adicionales:**
- Factor curvo (+30%)
- Remoción film viejo (+$50/vidrio)
- Descuentos por tipo de cliente (10-20%)

**Comando de Test:**
```bash
npm test -- tests/quotations/medium.test.ts
```

#### 3. Cotizaciones Complejas 🔴 (Margen: ±15%)

**Características:**
- 7+ vidrios
- Múltiples tipos (curvos, planos, triángulos)
- Vehículo premium
- Cliente corporativo con descuento especial
- Film viejo + condiciones especiales

**Casos de Prueba:**

| # | Descripción | Condiciones | Área Total | Precio Esperado | Margen Error |
|---|-------------|-------------|------------|-----------------|--------------|
| 7 | SUV Premium completo | Todos los vidrios + marca premium | 8.5 m² | $1,836 ± $275 | ±15% |
| 8 | Coupé deportivo | Vidrios curvos + triángulos | 4.2 m² | $705 ± $105 | ±15% |
| 9 | Pickup trabajo pesado | Film viejo + acceso difícil | 5.0 m² | $1,150 ± $172 | ±15% |

**Variables Máximas:**
- Marca premium (+20%)
- Año reciente (+10%)
- Todos los vidrios curvos (+30%)
- Descuento corporativo (-20%)
- Film viejo (+$50 por 6+ vidrios = +$300)
- Complejidad instalación (+15%)

**Comando de Test:**
```bash
npm test -- tests/quotations/complex.test.ts
```

### Tests de Integración

#### Flujo Completo de Cotización

```typescript
// tests/integration/quotation-flow.test.ts
describe('Flujo completo de cotización', () => {
  it('debe crear cotización desde Step 1 hasta Step 4', async () => {
    // Step 1: Cliente
    await fillCustomerInfo({
      name: 'Juan Test',
      customerType: 'leal'
    });

    // Step 2: Vehículo
    await selectVehicleType('sedan');
    await fillVehicleInfo({
      marca: 'Toyota',
      modelo: 'Corolla',
      año: '2020'
    });

    // Step 3: Validar vidrios pre-cargados
    expect(getLoadedWindows()).toHaveLength(5); // 4 laterales + luneta

    // Step 4: Validar cálculo
    const total = getQuotationTotal();
    expect(total).toBeCloseTo(459, 45); // ±10% de $510 con -10% descuento
  });
});
```

### Tests de Validación

#### Restricciones Legales

```typescript
// tests/validation/legal-restrictions.test.ts
describe('Restricciones legales', () => {
  it('parabrisas no debe permitir láminas de privacidad', () => {
    const parabrisas = getWindow('parabrisas');
    expect(parabrisas.permite_oscurecimiento).toBe(false);

    const availableProducts = getAvailableProducts(parabrisas);
    expect(availableProducts).not.toContain('PRIVACY');
  });

  it('laterales deben permitir láminas de privacidad', () => {
    const lateral = getWindow('lateral_izq_del');
    expect(lateral.permite_oscurecimiento).toBe(true);
  });
});
```

### Tests Paramétricos (Sprint 9)

Cuando se implemente el pricing paramétrico completo:

```typescript
// tests/parametric/pricing.test.ts
describe('Motor de pricing paramétrico', () => {
  it('debe aplicar todas las variables correctamente', () => {
    const quote = calculateQuote({
      tipoVehiculo: 'suv',
      marca: 'Mercedes-Benz', // Premium +20%
      año: '2024', // Reciente +10%
      tipoCliente: 'mayorista', // Descuento -15%
      vidrios: [
        { tipo: 'curvo', area: 1.8 }, // +30%
        { tipo: 'plano', area: 0.7 }
      ],
      tieneFilmViejo: true, // +$50 por vidrio
      complejidad: 'alta' // +15%
    });

    // Cálculo esperado detallado en documentación
    expect(quote.total).toBeWithinRange(890, 1050); // ±15%
  });
});
```

### Métricas de Calidad Requeridas

| Métrica | Objetivo | Estado Actual |
|---------|----------|---------------|
| **Cobertura de código** | 70% | 🔴 0% (pendiente) |
| **Tests unitarios** | 50+ casos | 🔴 0 casos |
| **Tests de integración** | 20+ flujos | 🔴 0 flujos |
| **Tests E2E** | 5+ journeys | 🔴 0 journeys |
| **Precisión de pricing** | ±5-15% | ✅ Definido |

### Comandos de Testing (Futuros)

```bash
# Todos los tests
npm test

# Tests por categoría
npm test -- tests/quotations/simple
npm test -- tests/quotations/medium
npm test -- tests/quotations/complex

# Tests con cobertura
npm run test:coverage

# Tests en watch mode
npm test -- --watch

# Tests de integración
npm run test:integration

# Tests E2E (Playwright)
npm run test:e2e
```

### Validación Manual

Para cada sprint, el equipo debe realizar pruebas manuales:

**Checklist de Validación:**
- [ ] Crear 10 cotizaciones de prueba (simples, medias, complejas)
- [ ] Verificar cálculos contra cotizaciones históricas reales
- [ ] Validar con encargados que los precios son razonables
- [ ] Probar en múltiples navegadores (Chrome, Firefox, Safari)
- [ ] Probar en mobile (iOS y Android)
- [ ] Verificar que las restricciones legales se aplican correctamente
- [ ] Confirmar que los descuentos se calculan bien

---

## 🤝 Contribuir

### Flujo de Trabajo

1. **Fork el proyecto**
```bash
git clone https://github.com/juandamianpajares/cotizador-laminas.git
cd cotizador-laminas
```

2. **Crear branch de feature**
```bash
git checkout -b feature/nombre-feature
# o
git checkout -b fix/nombre-bug
```

3. **Hacer cambios y commit**
```bash
git add .
git commit -m "feat: descripción del feature"
# o
git commit -m "fix: descripción del bug"
```

4. **Push y crear Pull Request**
```bash
git push origin feature/nombre-feature
```

### Estándares de Código

#### TypeScript
- ESLint configurado
- Prettier para formateo
- Naming conventions:
  - Componentes: PascalCase
  - Funciones: camelCase
  - Constantes: UPPER_SNAKE_CASE
  - Tipos/Interfaces: PascalCase

#### Commits
Usar convención de Conventional Commits:
- `feat:` Nueva funcionalidad
- `fix:` Corrección de bug
- `docs:` Cambios en documentación
- `style:` Formateo, sin cambios de código
- `refactor:` Refactorización de código
- `test:` Agregar o modificar tests
- `chore:` Mantenimiento

#### Code Review
- PRs requieren aprobación antes de merge
- Tests deben pasar
- Cobertura no debe disminuir
- Documentación actualizada

---

## 📝 Licencia

MIT License - ver [LICENSE](LICENSE) para más detalles

Copyright (c) 2025 Cotizador de Láminas

---

## 👥 Autores y Contribuidores

- **Juan Damian Pajares** - *Desarrollo inicial y arquitectura* - [@juandamianpajares](https://github.com/juandamianpajares)

### Agradecimientos Especiales
- Claude AI (Anthropic) por asistencia en desarrollo
- Next.js team por el excelente framework
- Vercel por la plataforma de deployment
- Prisma team por el ORM moderno

---

## 📞 Soporte y Contacto

### Reportar Issues
- **GitHub Issues**: [Crear nuevo issue](https://github.com/juandamianpajares/cotizador-laminas/issues)
- Incluir:
  - Descripción detallada del problema
  - Pasos para reproducir
  - Screenshots si aplica
  - Información del navegador/sistema

### Consultas
- **Email**: contacto@cotizadorlaminas.com (configurar)
- **WhatsApp Business**: Por configurar (Sprint 12)

### Documentación
- **README**: Este archivo
- **CHANGELOG**: [Ver changelog completo](CHANGELOG.md)
- **TEMPLATES**: [Sistema de plantillas](VEHICULOS-TEMPLATES.md)
- **API INTEGRATION**: [Guía de integración](INTEGRACION-VEHICULOS.md)

---

## 🎯 Estado del Proyecto

### Versión Actual: 1.0.0 (Sprint 7)

**Última Actualización**: Enero 2025

**Estado**: 🟢 En Desarrollo Activo

### Progreso General

| Sprint | Estado | Fecha Completado | Duración |
|--------|--------|------------------|----------|
| Sprint 1-3 | ✅ Completado | Enero 2025 | 2 semanas |
| Sprint 4-5 | ✅ Completado | Enero 2025 | 1.5 semanas |
| Sprint 6 | ✅ Completado | Enero 2025 | 1 semana |
| Sprint 7 | ✅ Completado | Enero 2025 | 3 días |
| Sprint 8 | 📋 Planificado | Q1 2025 | 2 semanas |
| Sprint 9 | 📋 Planificado | Q1 2025 | 3 semanas |
| Sprint 10 | 📋 Planificado | Q2 2025 | 2 semanas |
| Sprint 11 | 📋 Planificado | Q2 2025 | 3 semanas |
| Sprint 12 | 📋 Planificado | Q2-Q3 2025 | 3 semanas |
| Sprint 13 | 📋 Planificado | Q3 2025 | 2 semanas |

### Próximo Sprint

**Sprint 8: Integración API de Vehículos**
- 📅 Inicio estimado: Febrero 2025
- ⏱️ Duración: 2 semanas
- 🎯 Objetivo: Cargar imágenes y datos reales de vehículos

### Métricas del Proyecto

| Métrica | Valor |
|---------|-------|
| **Líneas de código** | ~2,500 |
| **Componentes React** | 3 principales |
| **Plantillas de vehículos** | 4 tipos |
| **Tipos de cliente** | 4 segmentos |
| **Cobertura de tests** | 0% (pendiente Sprint 9) |
| **Performance** | No medido aún |
| **Bugs conocidos** | 0 |

---

## 🌟 Features Destacados

### Ya Implementados
- ✅ Sistema de plantillas inteligente por tipo de vehículo
- ✅ Restricciones legales automáticas (parabrisas)
- ✅ Segmentación de clientes con descuentos automáticos
- ✅ Pricing diferenciado por tipo de vehículo
- ✅ Detección de film viejo (costo adicional)
- ✅ Formulario multi-paso con validación
- ✅ Cálculo de área en tiempo real

### Próximamente
- 🔜 Imágenes reales de vehículos con preview de tonos (Sprint 8)
- 🔜 Motor de pricing paramétrico completo (Sprint 9)
- 🔜 Portal simplificado para clientes (Sprint 10)
- 🔜 Formulario arquitectónico con upload de imágenes (Sprint 11)
- 🔜 Chatbot de WhatsApp inteligente (Sprint 12)
- 🔜 Sitio web empresarial con SEO (Sprint 13)

---

## 📊 Estadísticas de Desarrollo

### Historial de Commits
- Primer commit: Enero 2025
- Commits totales: Ver GitHub
- Contributors: 1

### Issues y PRs
- Issues abiertos: 0
- Issues cerrados: Ver GitHub
- Pull requests: Ver GitHub

---

## 🚀 Deploy y Production

### Ambientes

| Ambiente | URL | Estado |
|----------|-----|--------|
| **Desarrollo** | http://localhost:3000 | 🟢 Activo |
| **Staging** | TBD | 🔴 No configurado |
| **Production** | TBD | 🔴 No configurado |

### Deployment

**Recomendado: Vercel**
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Deploy to production
vercel --prod
```

**Alternativa: Docker**
```bash
# Build image
docker build -t cotizador-laminas .

# Run container
docker run -p 3000:3000 cotizador-laminas
```

---

## 🔗 Links Útiles

- **Repositorio**: [https://github.com/juandamianpajares/cotizador-laminas](https://github.com/juandamianpajares/cotizador-laminas)
- **Issues**: [GitHub Issues](https://github.com/juandamianpajares/cotizador-laminas/issues)
- **Next.js Docs**: [https://nextjs.org/docs](https://nextjs.org/docs)
- **Prisma Docs**: [https://www.prisma.io/docs](https://www.prisma.io/docs)
- **Tailwind CSS**: [https://tailwindcss.com/docs](https://tailwindcss.com/docs)

---

## 📈 Hoja de Ruta 2025

### Q1 2025 (Enero - Marzo)
- ✅ Sprint 1-7: Base y formulario de vehículos
- ⏳ Sprint 8: API de vehículos e imágenes
- ⏳ Sprint 9: Pricing paramétrico completo

### Q2 2025 (Abril - Junio)
- ⏳ Sprint 10: Portal simplificado para clientes
- ⏳ Sprint 11: Formulario arquitectónico
- ⏳ Sprint 12: WhatsApp Business API

### Q3 2025 (Julio - Septiembre)
- ⏳ Sprint 13: Sitio web empresarial
- ⏳ Testing completo y QA
- ⏳ Launch MVP a clientes beta

### Q4 2025 (Octubre - Diciembre)
- ⏳ Optimizaciones basadas en feedback
- ⏳ Features adicionales
- ⏳ Escalamiento

---

**Desarrollado con ❤️ para revolucionar el negocio de láminas para vidrios**

**¡Gracias por tu interés en el proyecto! 🎉**
