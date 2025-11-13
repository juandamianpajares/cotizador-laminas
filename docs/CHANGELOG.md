# Changelog - Cotizador de Láminas

Todos los cambios notables del proyecto serán documentados en este archivo.

---

## [Sprint 7.5 + Docker] - 2025-01-13

### 🐳 Containerización Completa

#### Agregado
- **Docker Support**
  - `Dockerfile` - Imagen de producción multi-stage optimizada
  - `Dockerfile.dev` - Imagen de desarrollo con hot-reload
  - `docker-compose.yml` - Orquestación de servicios para producción
  - `docker-compose.dev.yml` - Configuración de desarrollo
  - `.dockerignore` - Optimización de build context

- **Database Setup**
  - `docker/mysql/init/01-init.sql` - Script de inicialización de MySQL
  - `docker/mysql/conf.d/custom.cnf` - Configuración personalizada de MySQL

- **Scripts de Ayuda**
  - `docker/scripts/start.sh` - Script de inicio para Linux/macOS
  - `docker/scripts/start.bat` - Script de inicio para Windows

- **Documentación Completa**
  - `README.md` - Documentación general del proyecto
  - `DOCKER.md` - Guía completa de Docker
  - `ARQUITECTURA.md` - Diagramas de arquitectura en Mermaid
  - `DEPLOYMENT-DEBIAN.md` - Guía paso a paso para deployment
  - `CHANGELOG.md` - Este archivo

- **Configuración**
  - `next.config.ts` - Actualizado con output 'standalone' para Docker
  - `.env.example` - Variables de entorno expandidas para Docker
  - `.gitignore` - Actualizado para ignorar archivos de Docker

- **API Health Check**
  - `app/api/health/route.ts` - Endpoint para Docker healthcheck

#### Características Docker
- ✅ MySQL 8.0 con configuración optimizada
- ✅ phpMyAdmin para gestión de base de datos
- ✅ Health checks automáticos
- ✅ Volúmenes persistentes
- ✅ Network aislada
- ✅ Auto-aplicación de migraciones Prisma
- ✅ Hot-reload en modo desarrollo
- ✅ Multi-stage build optimizado

#### Diagramas de Arquitectura
- 📊 Diagrama de arquitectura general
- 🔄 Diagrama de flujo de datos
- 🧩 Diagrama de componentes
- 🐳 Diagrama de infraestructura Docker
- 🔐 Diagrama de seguridad
- 📱 Diagrama de casos de uso
- 🗄️ Diagrama del modelo de datos
- 🔄 Diagrama de estados
- 🚀 Diagrama de deployment

---

## [Sprint 7.5] - 2025-01-12

### ✨ Flujos Cliente/Encargado + WhatsApp

#### Agregado
- **Flujo del Cliente**
  - `app/cotizar/cliente/page.tsx` - Formulario simplificado
  - Upload de 1-3 fotos del vehículo
  - Selección opcional de tipo de servicio
  - Confirmación de solicitud

- **Flujo del Encargado**
  - `app/encargado/solicitudes/page.tsx` - Panel de solicitudes
  - `app/encargado/cotizaciones/nueva/page.tsx` - Revisión de solicitud
  - Filtros y búsqueda de solicitudes
  - Estadísticas en tiempo real

- **API Endpoints**
  - `app/api/solicitudes/route.ts` - GET/POST solicitudes
  - `app/api/solicitudes/[id]/route.ts` - GET/PATCH/DELETE específica
  - `app/api/whatsapp/send/route.ts` - Envío por WhatsApp

- **Modelos de Base de Datos**
  - `QuotationRequest` - Solicitudes de clientes
  - `PricingConfig` - Configuración de precios por tipo de vehículo
  - Actualización de `Quotation` con campos WhatsApp

- **Utilidades**
  - `lib/vehicleImages.ts` - Gestión de imágenes de vehículos
  - Sistema de placeholders
  - Preparado para imágenes locales
  - Preparado para API externa (Sprint 8)

#### Modificado
- `app/cotizar/vehiculos/page.tsx`
  - Agregado botón de envío por WhatsApp
  - Pre-carga de datos desde localStorage
  - Integración con API de WhatsApp

- `prisma/schema.prisma`
  - Nuevos modelos: `QuotationRequest`, `PricingConfig`
  - Nuevos enums: `RequestStatus`, `ServiceType`
  - Campos WhatsApp en `Quotation`

#### Documentación
- `FLUJOS-IMPLEMENTADOS.md` - Documentación completa de flujos

---

## [Sprint 1-7] - 2024-12 / 2025-01

### 🎯 Sistema Base de Cotización

#### Características Implementadas
- ✅ **Sprint 1**: Estructura inicial del proyecto
- ✅ **Sprint 2**: Modelo de datos con Prisma
- ✅ **Sprint 3**: Sistema de plantillas de vidrios
- ✅ **Sprint 4**: Catálogo de productos
- ✅ **Sprint 5**: Segmentación de clientes
- ✅ **Sprint 6**: Cálculo de precios y descuentos
- ✅ **Sprint 7**: Formulario completo de cotización

#### Modelos Implementados
- `Customer` - Clientes
- `Product` - Catálogo de láminas
- `Quotation` - Cotizaciones
- `QuotationItem` - Items de cotización
- `Property` - Propiedades (residencial/comercial)
- `Room` - Ambientes
- `Opening` - Aberturas/Vidrios

#### Funcionalidades
- Sistema de plantillas por tipo de vehículo
- Cálculo automático de desperdicios
- Precios por m² según tipo de vehículo
- Descuentos por tipo de cliente
- Gestión de catálogo de productos
- Formulario multi-step

---

## Roadmap

### Sprint 8 - Imágenes de Vehículos (Próximo)
- [ ] Integración con API externa de vehículos
- [ ] Búsqueda por marca/modelo/año
- [ ] Imágenes reales de vehículos
- [ ] Cache de imágenes

### Sprint 9 - PDF y Impresión
- [ ] Generación de PDFs de cotización
- [ ] Plantillas de impresión
- [ ] Email con PDF adjunto

### Sprint 10/11 - Cloud Storage
- [ ] Integración con Cloudinary
- [ ] Upload real de fotos de clientes
- [ ] Compresión automática de imágenes
- [ ] CDN para performance

### Sprint 12 - Notificaciones
- [ ] Notificaciones en tiempo real
- [ ] Email al encargado cuando llega solicitud
- [ ] WhatsApp Business API webhook
- [ ] Push notifications

### Futuro
- [ ] Autenticación y autorización
- [ ] Roles de usuario (admin, encargado, vendedor)
- [ ] Panel de administración
- [ ] Reportes y estadísticas
- [ ] CRM integrado
- [ ] Sistema de agendamiento
- [ ] Integración con sistemas de pago

---

## Versiones

### Formato
El proyecto sigue el formato de Sprints:
- **Sprint X.Y**: Donde X es el sprint principal e Y es el sub-sprint
- **Fecha**: YYYY-MM-DD

### Stack Tecnológico
- **Frontend**: Next.js 15.1.5, React 19, TypeScript
- **Backend**: Next.js API Routes, Prisma ORM
- **Base de Datos**: MySQL 8.0
- **Containerización**: Docker, Docker Compose
- **Estilos**: TailwindCSS
- **Iconos**: Lucide React

---

**Mantenido por**: Juan Damián Pajares
**Última actualización**: 2025-01-13
