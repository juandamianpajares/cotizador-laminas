# Sistema Completo de Cotización de Films y Laminados 🎯

## Sistema Multi-Vertical para Automotriz, Residencial, Comercial y Arquitectónico

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Python](https://img.shields.io/badge/python-3.11+-blue.svg)](https://www.python.org/downloads/)
[![React](https://img.shields.io/badge/react-18+-blue.svg)](https://reactjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.104+-green.svg)](https://fastapi.tiangolo.com/)

---

## 📋 Tabla de Contenidos

- [Visión General](#visión-general)
- [Características Principales](#características-principales)
- [Arquitectura](#arquitectura)
- [Tecnologías](#tecnologías)
- [Instalación](#instalación)
- [Uso](#uso)
- [API Documentation](#api-documentation)
- [Seguridad](#seguridad)
- [Deployment](#deployment)
- [Testing](#testing)
- [Contribuir](#contribuir)
- [Licencia](#licencia)

---

## 🎯 Visión General

Sistema empresarial completo de cotización de films y laminados para vidrios, diseñado para cubrir múltiples verticales de negocio:

### Verticales Cubiertas

#### 🚗 Automotriz
- Laminado de seguridad para vehículos
- Control solar (rejection de calor)
- Vidrios planos y curvos
- Decodificación VIN automática

#### 🏠 Residencial
- Ventanas de hogares y departamentos
- Puertas de vidrio (corredizas, abatibles)
- Mamparas de baño
- Films decorativos y de privacidad

#### 🏢 Comercial
- Fachadas de edificios corporativos
- Divisiones de oficinas
- Salas de reuniones
- Control solar y eficiencia energética

#### 🎨 Arquitectónico/Decorativo
- Franjas horizontales/verticales
- Vinilos con logos corporativos
- Diseños personalizados
- Efectos especiales (degradados, patterns)

### Tipos de Films Incluidos

| Categoría | Productos | Aplicaciones |
|-----------|-----------|--------------|
| **Laminado de Seguridad** | Clear 4mil, 8mil, 12mil | Protección anti-impacto, retención de fragmentos |
| **Control Solar** | Ceramic 70%, 50%, Charcoal 5%, Bronze 20% | Rechazo de calor, ahorro energético |
| **Vinílico Decorativo** | Esmerilado, Colores, Franjas, Custom | Privacidad, decoración, corporativo |
| **Privacidad** | One-Way Mirror, Blackout, Gradual | Control visual y de luz |

---

## ✨ Características Principales

### 🎨 Formulario Web Interactivo
- **Selección por habitación**: Interfaz paso a paso para agregar habitaciones y sus aberturas
- **Multi-vertical**: Soporte para automotriz, residencial, comercial
- **Configuración detallada**: Dimensiones, tipos de film, especificaciones técnicas
- **Preview en tiempo real**: Cálculo de áreas y costos instantáneo

### 🧮 Motor de Cálculo Avanzado
- **Cálculo de desperdicios**: Matriz inteligente según tipo de abertura y film
- **Factor de complejidad**: Ajuste por altura, acceso, condiciones especiales
- **Descuentos por volumen**: Escala automática según m² totales
- **Precios dinámicos**: Ajustes estacionales y por lealtad

### 📱 Integración WhatsApp
- **Cotizaciones conversacionales**: Bot inteligente para WhatsApp Business
- **Envío automático de PDFs**: Generación y envío de documentos
- **Seguimiento de conversaciones**: Historial completo de interacciones

### 🔐 Seguridad Enterprise
- JWT Authentication con RS256
- Rate limiting avanzado
- Input validation con Pydantic v2
- SQL injection prevention
- Encryption at rest y in transit
- Audit logging completo
- OWASP Top 10 compliance

### 📊 Panel de Administración
- Gestión de catálogo de productos
- Control de precios dinámicos
- Reportes y analytics
- Gestión de clientes y cotizaciones

---

## 🏗️ Arquitectura

### Diagrama de Componentes

```
┌─────────────────────────────────────────────────────┐
│                    FRONTEND                         │
│  React 18 + TypeScript + Tailwind CSS              │
│  - Formulario multi-paso                           │
│  - Gestión de estado con React Query                │
│  - Validación con Zod                               │
└─────────────────────────────────────────────────────┘
                         ↓ HTTPS
┌─────────────────────────────────────────────────────┐
│                 API GATEWAY                         │
│  - Rate Limiting                                    │
│  - JWT Authentication                               │
│  - Request Validation                               │
└─────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────┐
│                BACKEND SERVICES                     │
│  FastAPI + Python 3.11+                            │
│  ├── Motor de Cálculo                              │
│  ├── Servicio de Catálogo                          │
│  ├── WhatsApp Service                              │
│  ├── VIN Decoder                                    │
│  └── Servicio de Notificaciones                    │
└─────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────┐
│              DATA LAYER                             │
│  ├── PostgreSQL 15 (Primary + Replica)            │
│  ├── Redis 7 (Cache + Sessions)                    │
│  └── Cloud Storage (S3/MinIO)                      │
└─────────────────────────────────────────────────────┘
```

### Modelo de Datos Simplificado

```
Customer
  ├── Quotations
  │   ├── QuotationItems
  │   │   └── Product
  │   ├── Property (Residential/Commercial)
  │   │   └── Rooms
  │   │       └── Openings
  │   └── Vehicle (Automotive)
  │
  └── WhatsAppConversations
      └── WhatsAppMessages
```

---

## 🛠️ Tecnologías

### Backend
- **Framework**: FastAPI 0.104+
- **Language**: Python 3.11+
- **ORM**: SQLAlchemy 2.0
- **Validation**: Pydantic v2
- **Database**: PostgreSQL 15+
- **Cache**: Redis 7+
- **Task Queue**: Celery
- **Testing**: pytest

### Frontend
- **Framework**: React 18
- **Language**: TypeScript 5+
- **State Management**: React Query (TanStack Query)
- **Forms**: React Hook Form + Zod
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Build Tool**: Vite

### Infrastructure
- **Containerization**: Docker + Docker Compose
- **Orchestration**: Kubernetes
- **Cloud**: Google Cloud Platform
  - Cloud Run (Backend)
  - Cloud SQL (PostgreSQL)
  - Memorystore (Redis)
  - Cloud Storage (Files)
- **Monitoring**: Prometheus + Grafana
- **Error Tracking**: Sentry
- **CI/CD**: GitHub Actions

---

## 🚀 Instalación

### Prerrequisitos

```bash
- Docker 20+
- Docker Compose 2+
- Node.js 18+
- Python 3.11+
- PostgreSQL 15+ (para desarrollo local)
- Redis 7+ (para desarrollo local)
```

### Instalación Rápida con Docker

1. **Clonar el repositorio**
```bash
git clone https://github.com/tu-org/films-quotation-system.git
cd films-quotation-system
```

2. **Configurar variables de entorno**
```bash
cp .env.example .env
# Editar .env con tus configuraciones
```

3. **Iniciar servicios**
```bash
docker-compose up -d
```

4. **Ejecutar migraciones**
```bash
docker-compose exec api alembic upgrade head
```

5. **Cargar datos iniciales**
```bash
docker-compose exec api python scripts/load_initial_data.py
```

6. **Acceder a la aplicación**
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs

### Instalación para Desarrollo

#### Backend

```bash
cd backend

# Crear entorno virtual
python -m venv venv
source venv/bin/activate  # En Windows: venv\Scripts\activate

# Instalar dependencias
pip install -r requirements.txt
pip install -r requirements-dev.txt

# Configurar base de datos
createdb films_quotation_db

# Ejecutar migraciones
alembic upgrade head

# Iniciar servidor de desarrollo
uvicorn app.main:app --reload --port 8000
```

#### Frontend

```bash
cd frontend

# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev
```

---

## 📖 Uso

### Crear Cotización Residencial

#### Paso 1: Seleccionar Vertical
```typescript
// Usuario selecciona "Residencial"
vertical = "residential"
```

#### Paso 2: Información del Cliente
```typescript
customer = {
  name: "Juan Pérez",
  email: "juan@ejemplo.com",
  phone: "+54 11 1234-5678",
  whatsapp: "+54 11 1234-5678"
}
```

#### Paso 3: Información de la Propiedad
```typescript
property = {
  type: "house",  // Casa
  address: "Av. Corrientes 1234",
  city: "Buenos Aires",
  floors: 2
}
```

#### Paso 4: Agregar Habitaciones y Aberturas
```typescript
rooms = [
  {
    name: "Sala Principal",
    type: "living_room",
    floor: 1,
    openings: [
      {
        type: "window",
        width: 2.0,  // metros
        height: 1.5,
        quantity: 2,
        productType: "solar_control",
        specifications: {
          glassType: "tempered",
          floor: 1
        }
      },
      {
        type: "sliding_door",
        width: 2.5,
        height: 2.2,
        quantity: 1,
        productType: "vinyl_decorative",
        specifications: {
          glassType: "tempered"
        }
      }
    ]
  },
  {
    name: "Dormitorio Principal",
    type: "bedroom",
    floor: 2,
    openings: [
      {
        type: "window",
        width: 1.5,
        height: 1.2,
        quantity: 2,
        productType: "privacy",
        specifications: {
          floor: 2
        }
      }
    ]
  }
]
```

#### Paso 5: Revisar Cotización
```json
{
  "quotation_id": "abc123",
  "customer": { "name": "Juan Pérez", ... },
  "items_count": 3,
  "total_area": "15.80 m²",
  "pricing": {
    "material": "$1,420.00",
    "installation": "$380.00",
    "subtotal": "$1,800.00",
    "discount": {
      "percentage": 0,
      "amount": "$0.00"
    },
    "tax": "$378.00",
    "total": "$2,178.00"
  }
}
```

### API Usage Example

```python
import requests

# Calcular cotización
response = requests.post(
    "http://localhost:8000/api/v1/quotations/residential",
    json={
        "customer": {
            "name": "Juan Pérez",
            "email": "juan@ejemplo.com",
            "phone": "+54 11 1234-5678"
        },
        "property": {
            "type": "house",
            "address": "Av. Corrientes 1234"
        },
        "rooms": [
            {
                "name": "Sala Principal",
                "type": "living_room",
                "floor": 1,
                "openings": [
                    {
                        "type": "window",
                        "width": 2.0,
                        "height": 1.5,
                        "quantity": 2,
                        "product_id": "prod-abc123"
                    }
                ]
            }
        ]
    },
    headers={"Authorization": "Bearer YOUR_JWT_TOKEN"}
)

quotation = response.json()
print(f"Total: ${quotation['total']}")
```

---

## 📚 API Documentation

### Endpoints Principales

#### Cotizaciones

```http
POST   /api/v1/quotations/residential
POST   /api/v1/quotations/commercial
POST   /api/v1/quotations/automotive
GET    /api/v1/quotations/{id}
PUT    /api/v1/quotations/{id}
DELETE /api/v1/quotations/{id}
POST   /api/v1/quotations/{id}/confirm
POST   /api/v1/quotations/{id}/send-whatsapp
GET    /api/v1/quotations/{id}/pdf
```

#### Productos

```http
GET    /api/v1/products
GET    /api/v1/products/{id}
POST   /api/v1/products (admin)
PUT    /api/v1/products/{id} (admin)
DELETE /api/v1/products/{id} (admin)
GET    /api/v1/products/categories
GET    /api/v1/products/by-vertical/{vertical}
```

#### Propiedades

```http
POST   /api/v1/properties
GET    /api/v1/properties/{id}
POST   /api/v1/properties/{id}/rooms
POST   /api/v1/rooms/{id}/openings
```

### Documentación Interactiva

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

---

## 🔐 Seguridad

### Autenticación

```python
# JWT Token Structure
{
  "sub": "user_id",
  "email": "user@example.com",
  "role": "admin|user",
  "permissions": ["quotations:read", "quotations:create"],
  "exp": 1234567890
}
```

### Headers de Seguridad

```nginx
Strict-Transport-Security: max-age=31536000; includeSubDomains
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Content-Security-Policy: default-src 'self'
```

### Rate Limiting

```python
# Por IP
- 100 requests/minuto (general)
- 10 requests/minuto (cotizaciones)

# Por usuario autenticado
- 1000 requests/minuto
```

### Checklist de Seguridad

- ✅ HTTPS obligatorio
- ✅ JWT con RS256
- ✅ Rate limiting por endpoint
- ✅ Input validation (Pydantic)
- ✅ SQL injection prevention
- ✅ XSS prevention
- ✅ CORS configurado
- ✅ Secrets en variables de entorno
- ✅ Encryption at rest (PostgreSQL TDE)
- ✅ Encryption in transit (TLS 1.3)
- ✅ Audit logging
- ✅ Dependency scanning
- ✅ Docker security scanning

---

## 🚀 Deployment

### Docker Compose (Producción Simplificada)

```yaml
version: '3.8'

services:
  api:
    image: gcr.io/your-project/films-api:latest
    environment:
      - DATABASE_URL=postgresql://user:pass@postgres:5432/films_db
      - REDIS_URL=redis://redis:6379/0
    deploy:
      replicas: 3
      resources:
        limits:
          cpus: '1'
          memory: 1G
  
  frontend:
    image: gcr.io/your-project/films-frontend:latest
    ports:
      - "80:80"
      - "443:443"
```

### Kubernetes (Producción Enterprise)

```bash
# Deploy a Kubernetes
kubectl apply -f k8s/

# Escalar servicios
kubectl scale deployment films-api --replicas=5

# Ver logs
kubectl logs -f deployment/films-api
```

### Google Cloud Platform

```bash
# Deploy backend a Cloud Run
gcloud run deploy films-api \
  --image gcr.io/your-project/films-api:latest \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated

# Deploy frontend a Cloud Storage + CDN
gsutil -m rsync -r frontend/dist gs://films-frontend
gcloud compute url-maps invalidate-cdn-cache films-cdn --path "/*"
```

---

## 🧪 Testing

### Ejecutar Tests

```bash
# Backend
cd backend
pytest tests/ -v --cov=app --cov-report=html

# Frontend
cd frontend
npm test
npm run test:coverage
```

### Cobertura Requerida

- Unit Tests: 80% mínimo
- Integration Tests: Flujos críticos
- E2E Tests: User journeys principales
- Load Tests: 1000 req/s

### Load Testing

```bash
# Usando Locust
cd backend/tests/load
locust -f locustfile.py --host=http://localhost:8000
```

---

## 📊 Monitoreo

### Métricas Clave

```python
# Prometheus Metrics
- quotation_requests_total
- quotation_calculation_duration_seconds
- active_users
- database_connections
- api_response_time_seconds
```

### Dashboards

- **Grafana**: http://localhost:3001
  - Dashboard de Performance
  - Dashboard de Negocio
  - Dashboard de Errores

### Health Checks

```bash
# Health endpoint
curl http://localhost:8000/health

# Readiness endpoint
curl http://localhost:8000/ready
```

---

## 🤝 Contribuir

1. Fork el proyecto
2. Crear branch de feature (`git checkout -b feature/AmazingFeature`)
3. Commit cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push al branch (`git push origin feature/AmazingFeature`)
5. Abrir Pull Request

### Estándares de Código

- **Python**: PEP 8, type hints obligatorios
- **TypeScript**: ESLint + Prettier
- **Tests**: Cobertura mínima 80%
- **Documentación**: Docstrings en todas las funciones públicas

---

## 📝 Licencia

MIT License - ver [LICENSE](LICENSE) para más detalles

---

## 👥 Autores

- **Tu Nombre** - *Initial work*

---

## 🙏 Agradecimientos

- FastAPI por el excelente framework
- React team por React 18
- Anthropic por Claude AI

---

## 📞 Soporte

- **Email**: soporte@tuempresa.com
- **WhatsApp**: +54 11 1234-5678
- **Documentación**: https://docs.tuempresa.com
- **Issues**: https://github.com/tu-org/films-quotation-system/issues

---

## 🗺️ Roadmap

### Q1 2025
- ✅ MVP Core (Residencial + Comercial)
- ✅ Formulario web interactivo
- ✅ Motor de cálculo avanzado
- ⏳ Integración WhatsApp

### Q2 2025
- ⏳ Panel de administración completo
- ⏳ Vertical automotriz
- ⏳ Sistema de reportes
- ⏳ Mobile app (React Native)

### Q3 2025
- ⏳ Integración con CRMs
- ⏳ Analytics avanzado
- ⏳ Cotizaciones colaborativas
- ⏳ API pública para partners

---

**¡Gracias por usar nuestro sistema! 🚀**
