# Flujos Implementados - Sprint 7.5

## 📋 Descripción General

Este documento detalla los dos flujos críticos implementados antes de avanzar a los sprints futuros:

1. **Flujo del Cliente**: Formulario simplificado para solicitar cotizaciones
2. **Flujo del Encargado**: Gestión de solicitudes y envío por WhatsApp

---

## 🚀 Flujo 1: Cliente (Solicitud Simplificada)

### Ruta
`/cotizar/cliente`

### Objetivo
Permitir que los clientes soliciten cotizaciones con mínima información requerida, facilitando la captura rápida por WhatsApp.

### Campos del Formulario

#### Obligatorios
1. **Teléfono WhatsApp**
   - Formato: Internacional (+54 11 1234-5678)
   - Validación en frontend
   - Único campo de contacto requerido

2. **Fotos del Vehículo**
   - Mínimo: 1 foto
   - Máximo: 3 fotos
   - Desde cámara o galería
   - Preview antes de enviar
   - Por ahora: Base64 (futuro: Cloudinary/S3)

#### Opcionales
3. **Tipo de Servicio**
   - Parabrisas (Protección)
   - Visera Superior
   - Parabrisas con IR (IR70/IR50)
   - Laterales + Luneta
   - Completo (Todos los vidrios)
   - Personalizado (con campo de notas)

### Flujo del Usuario

```
1. Cliente ingresa a /cotizar/cliente
   ↓
2. Ingresa su número de WhatsApp
   ↓
3. Toma/sube fotos del vehículo (1-3 fotos)
   ↓
4. (Opcional) Selecciona tipo de servicio
   ↓
5. Presiona "Solicitar Cotización"
   ↓
6. Sistema guarda solicitud con estado PENDING
   ↓
7. Cliente ve mensaje de confirmación
   "Te contactaremos pronto por WhatsApp"
   ↓
8. Encargado recibe notificación (futuro)
```

### API Endpoint

**POST** `/api/solicitudes`

```typescript
Body: {
  phone: string;              // Obligatorio
  vehiclePhotos: string[];    // Array de URLs/Base64
  serviceType?: string;       // Enum: PARABRISAS, VISERA, etc.
  notes?: string;             // Solo si serviceType = PERSONALIZADO
}

Response: {
  success: true,
  requestId: string,
  message: "¡Solicitud recibida! Te contactaremos pronto por WhatsApp."
}
```

### Estados de la Solicitud

```typescript
enum RequestStatus {
  PENDING       // Esperando que encargado la tome
  IN_PROGRESS   // Encargado está trabajando en ella
  COMPLETED     // Cotización creada
  SENT          // Enviada al cliente por WhatsApp
  CANCELLED     // Cancelada
}
```

---

## 👨‍💼 Flujo 2: Encargado (Gestión y Envío)

### 2.1 Panel de Solicitudes

**Ruta**: `/encargado/solicitudes`

#### Funcionalidades

1. **Vista General**
   - Estadísticas en tiempo real:
     - Total de solicitudes
     - Pendientes
     - En proceso
     - Completadas

2. **Lista de Solicitudes**
   - Ordenadas por fecha (más recientes primero)
   - Muestra:
     - Estado (con color coding)
     - Teléfono del cliente
     - Servicio solicitado
     - Tiempo transcurrido
     - Cantidad de fotos

3. **Filtros**
   - Por estado (Todas, Pendientes, En Proceso, Completadas, Enviadas)
   - Por búsqueda de teléfono

4. **Acciones**
   - Ver fotos del vehículo
   - Iniciar cotización (PENDING → IN_PROGRESS)
   - Continuar cotización (IN_PROGRESS)

### 2.2 Revisión de Solicitud

**Ruta**: `/encargado/cotizaciones/nueva?requestId={id}`

#### Pantalla de Revisión

Muestra:
1. **Datos del Cliente**
   - Teléfono WhatsApp
   - Fecha y hora de solicitud
   - Servicio solicitado
   - Notas adicionales

2. **Fotos del Vehículo**
   - Galería visual (grid 3 columnas)
   - Click para ampliar
   - Permite identificar marca/modelo/tipo

3. **Instrucciones al Encargado**
   - Revisar fotos para identificar vehículo
   - Ingresar datos en formulario
   - Configurar vidrios y productos
   - Calcular y enviar cotización

4. **Acción Principal**
   - Botón: "Iniciar Cotización →"
   - Pre-carga teléfono del cliente
   - Redirige a `/cotizar/vehiculos`

### 2.3 Completar Cotización

**Ruta**: `/cotizar/vehiculos` (con datos pre-cargados)

#### Modificaciones al Formulario Existente

1. **Pre-carga de Datos**
   ```typescript
   // LocalStorage temporal
   {
     fromRequest: true,
     requestId: string,
     phone: string,
     serviceType?: string,
     vehiclePhotos: string[],
     notes?: string
   }
   ```

2. **Step 1: Cliente**
   - Teléfono pre-cargado (readonly)
   - Nombre y email normales
   - Tipo de cliente (nuevo/leal/mayorista/corporativo)

3. **Step 2: Vehículo**
   - Encargado ingresa marca, modelo, año
   - Selecciona tipo (sedán, SUV, coupé, pickup)
   - Imagen placeholder según tipo
   - Indica si tiene film viejo

4. **Step 3: Configuración de Vidrios**
   - Vidrios obligatorios pre-cargados según tipo
   - Encargado puede agregar vidrios opcionales
   - Ajustar dimensiones si es necesario
   - Precio automático por tipo de vehículo:
     - Sedán: $150/m²
     - SUV: $180/m²
     - Coupé: $140/m²
     - Pickup: $160/m²

5. **Step 4: Resumen y Envío**
   - Muestra cotización completa
   - **NUEVO**: Botón grande de WhatsApp
   - Calcula descuento según tipo de cliente
   - Genera total final

### 2.4 Envío por WhatsApp

**Ruta API**: `POST /api/whatsapp/send`

#### Funcionalidad

1. **Preparación del Mensaje**
   ```typescript
   {
     phone: string,
     quotation: {
       customer: { name, email, phone },
       customerType: string,
       discountPercentage: number,
       vehicleInfo: { marca, modelo, año, tipo },
       items: [{ openingName, finalArea, product, itemSubtotal }],
       subtotalBeforeDiscount: number,
       subtotalAfterDiscount: number,
       total: number
     }
   }
   ```

2. **Formato del Mensaje WhatsApp**
   ```
   *COTIZACIÓN DE LÁMINAS PARA VEHÍCULO*

   👤 *Cliente:* Juan Pérez
   🏷️ *Tipo:* Cliente Leal (10% desc.)

   🚗 *Vehículo:* Toyota Corolla 2020
   📋 *Tipo:* Sedán

   *VIDRIOS Y PRODUCTOS:*
   ━━━━━━━━━━━━━━━━━━━━

   1. *Lateral Izquierdo Delantero*
      • Producto: Lámina de Seguridad Polarizada
      • Área: 0.60 m²
      • Precio: $90.00

   2. *Lateral Derecho Delantero*
      • Producto: Lámina de Seguridad Polarizada
      • Área: 0.60 m²
      • Precio: $90.00

   ... (resto de vidrios)

   ━━━━━━━━━━━━━━━━━━━━

   *RESUMEN:*
   Subtotal: $360.00
   Descuento (10%): -$36.00
   Subtotal con descuento: $324.00

   *TOTAL: $324.00*

   ━━━━━━━━━━━━━━━━━━━━

   ✨ Incluye instalación profesional
   ⏱️ Tiempo estimado: 2-4 horas
   📅 Agenda tu cita respondiendo este mensaje
   ```

3. **Generación de URL**
   - Formato: `https://wa.me/{phone}?text={encodedMessage}`
   - Abre WhatsApp Web en nueva ventana
   - Mensaje pre-cargado listo para enviar

4. **Actualización de Estado**
   - Marca solicitud como SENT
   - Guarda timestamp de envío
   - Vincula quotation_id con request_id

---

## 🗄️ Modelos de Base de Datos

### PricingConfig
```prisma
model PricingConfig {
  id              String   @id @default(uuid())
  vehicleType     String   // sedan, suv, coupe, pickup
  pricePerSqm     Decimal  // Precio por m²
  productId       String?  // Producto por defecto
  tintLevel       String?  // VLT% recomendado
  description     String?
  isActive        Boolean  @default(true)
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  @@unique([vehicleType])
}
```

### QuotationRequest
```prisma
model QuotationRequest {
  id              String        @id @default(uuid())
  phone           String
  vehiclePhotos   Json          // Array de URLs
  serviceType     ServiceType?
  notes           String?
  status          RequestStatus @default(PENDING)
  assignedTo      String?       // ID del encargado
  quotationId     String?       @unique
  quotation       Quotation?
  source          String        @default("client_form")
  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt
  completedAt     DateTime?

  @@index([status])
  @@index([phone])
}
```

### Quotation (Actualizado)
```prisma
model Quotation {
  // ... campos existentes ...

  // NUEVO
  vehicleInfo     Json?         // { marca, modelo, año, tipo, imageUrl }
  customerType    String?       // nuevo, leal, mayorista, corporativo
  discountPercentage Decimal

  // WhatsApp Integration
  sentViaWhatsApp Boolean   @default(false)
  whatsappSentAt  DateTime?
  whatsappStatus  String?   // sent, delivered, read, failed
  whatsappMessage String?   @db.Text

  request QuotationRequest?
}
```

---

## 📁 Estructura de Archivos Creados/Modificados

### Nuevos Archivos

```
app/
├── cotizar/
│   └── cliente/page.tsx                    ✅ Formulario cliente simplificado
├── encargado/
│   ├── solicitudes/page.tsx                ✅ Panel de solicitudes
│   └── cotizaciones/
│       └── nueva/page.tsx                  ✅ Revisión de solicitud
└── api/
    ├── solicitudes/
    │   ├── route.ts                        ✅ GET/POST solicitudes
    │   └── [id]/route.ts                   ✅ GET/PATCH/DELETE solicitud
    └── whatsapp/
        └── send/route.ts                   ✅ Envío por WhatsApp

lib/
└── vehicleImages.ts                        ✅ Gestión de imágenes

prisma/
└── schema.prisma                           ✅ Nuevos modelos agregados
```

### Archivos Modificados

```
app/
└── cotizar/
    └── vehiculos/page.tsx                  ✅ Botón WhatsApp + pre-carga
```

---

## 🎨 Sistema de Imágenes

### Imágenes Placeholder (Actual)

```typescript
// lib/vehicleImages.ts
export const VEHICLE_PLACEHOLDER_IMAGES = {
  sedan: 'https://via.placeholder.com/800x600/4A90E2/FFFFFF?text=Sedán',
  suv: 'https://via.placeholder.com/800x600/E74C3C/FFFFFF?text=SUV',
  coupe: 'https://via.placeholder.com/800x600/9B59B6/FFFFFF?text=Coupé',
  pickup: 'https://via.placeholder.com/800x600/27AE60/FFFFFF?text=Pickup',
};
```

### Imágenes Locales (Preparado para futuro)

```typescript
export const LOCAL_VEHICLE_IMAGES = {
  'toyota-corolla-2020': '/images/vehicles/sedan-example.jpg',
  'ford-ranger-2022': '/images/vehicles/pickup-example.jpg',
  'honda-crv-2021': '/images/vehicles/suv-example.jpg',
  'mazda-mx5-2019': '/images/vehicles/coupe-example.jpg',
};
```

### API Externa (Sprint 8)

```typescript
// Futuro
const apiUrl = `${process.env.NEXT_PUBLIC_VEHICLE_API_URL}/image?marca=${marca}&modelo=${modelo}&año=${año}`;
```

---

## 🚦 Flujo Completo End-to-End

### Escenario Típico

```
1. CLIENTE
   - Ingresa a /cotizar/cliente desde link de WhatsApp
   - Toma 3 fotos de su Toyota Corolla 2020
   - Ingresa teléfono: +54 11 1234-5678
   - Selecciona: "Laterales + Luneta"
   - Envía solicitud
   - Ve confirmación

2. SISTEMA
   - Guarda solicitud en BD (status: PENDING)
   - (Futuro: Envía notificación al encargado)

3. ENCARGADO
   - Abre /encargado/solicitudes
   - Ve nueva solicitud pendiente (badge amarillo)
   - Click en "Iniciar Cotización"
   - Revisa fotos en /encargado/cotizaciones/nueva?requestId=xxx
   - Identifica: Toyota Corolla 2020, tipo Sedán
   - Click "Iniciar Cotización →"

4. COMPLETAR COTIZACIÓN
   - Formulario pre-carga teléfono: +54 11 1234-5678
   - Encargado ingresa:
     * Nombre: Juan Pérez
     * Tipo cliente: Leal (10% descuento)
     * Marca: Toyota
     * Modelo: Corolla
     * Año: 2020
     * Tipo: Sedán (radio button)
     * No tiene film viejo
   - Sistema carga automáticamente 5 vidrios obligatorios
   - Precio: $150/m² (sedán)
   - Calcula total: $324.00 (con 10% descuento)

5. ENVÍO WHATSAPP
   - Encargado click "Enviar Cotización por WhatsApp"
   - Sistema genera mensaje formateado
   - Abre WhatsApp Web con mensaje pre-cargado
   - Encargado envía mensaje
   - Cliente recibe cotización completa en WhatsApp
   - Puede responder para agendar o consultar

6. SEGUIMIENTO
   - Solicitud cambia a status: SENT
   - Queda registro en BD
   - Encargado puede ver historial
```

---

## ✅ Checklist de Funcionalidades

### Flujo Cliente
- [x] Formulario simplificado (teléfono + fotos)
- [x] Upload de hasta 3 fotos con preview
- [x] Selector de tipo de servicio (6 opciones)
- [x] Validaciones frontend
- [x] API para guardar solicitud
- [x] Página de confirmación
- [x] Diseño mobile-first
- [ ] Notificación al encargado (futuro)

### Flujo Encargado
- [x] Panel de solicitudes con estadísticas
- [x] Filtros por estado y búsqueda
- [x] Ver detalles de solicitud
- [x] Galería de fotos del cliente
- [x] Pre-carga de datos al formulario
- [x] Botón de WhatsApp en cotización
- [x] Generación de mensaje formateado
- [x] Actualización de estados
- [x] Vinculación solicitud-cotización

### Base de Datos
- [x] Modelo PricingConfig
- [x] Modelo QuotationRequest
- [x] Enums (RequestStatus, ServiceType)
- [x] Actualización modelo Quotation
- [x] Migraciones generadas
- [ ] Migraciones aplicadas (requiere DB corriendo)

### APIs
- [x] POST /api/solicitudes
- [x] GET /api/solicitudes
- [x] GET /api/solicitudes/[id]
- [x] PATCH /api/solicitudes/[id]
- [x] DELETE /api/solicitudes/[id]
- [x] POST /api/whatsapp/send

### Imágenes
- [x] Placeholders por tipo de vehículo
- [x] Sistema de imágenes preparado
- [x] Función getVehicleImageUrl
- [ ] Imágenes locales reales (opcional)
- [ ] Integración con API externa (Sprint 8)

---

## 🔄 Próximos Pasos

### Inmediato
1. **Iniciar MySQL** y ejecutar migraciones
   ```bash
   npx prisma db push
   ```

2. **Probar flujo completo**
   - Cliente → Solicitud
   - Encargado → Gestión
   - Cotización → WhatsApp

3. **Agregar imágenes locales reales** (opcional)
   - Colocar en `/public/images/vehicles/`
   - Actualizar `LOCAL_VEHICLE_IMAGES`

### Mejoras Futuras
1. **Notificaciones en tiempo real** (Sprint 12)
   - Email al encargado
   - Push notification
   - WhatsApp Business API webhook

2. **Upload real de imágenes** (Sprint 10/11)
   - Cloudinary integration
   - Compresión automática
   - CDN para performance

3. **API de vehículos** (Sprint 8)
   - Integración con API externa
   - Imágenes reales por marca/modelo/año
   - Datos técnicos de vidrios

---

## 📊 Métricas de Implementación

- **Archivos creados**: 8
- **Archivos modificados**: 2
- **Líneas de código**: ~2,100
- **Modelos de BD**: 2 nuevos + 1 actualizado
- **API endpoints**: 6
- **Tiempo estimado**: 4 horas

---

**Documentación creada**: Enero 2025
**Última actualización**: Sprint 7.5
