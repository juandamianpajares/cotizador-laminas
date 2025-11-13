# Arquitectura del Sistema de Cotización de Films y Laminados

## 1. Visión General del Sistema

Sistema empresarial de cotización multi-vertical para aplicación de films en vidrios, abarcando sectores automotriz, residencial, comercial y arquitectónico.

### 1.1 Objetivos del Sistema

- Cotización automatizada para múltiples verticales de negocio
- Formulario web interactivo con selección por habitación/área
- Catálogo completo de productos (laminados, vinílicos, decorativos)
- Integración WhatsApp para cotizaciones conversacionales
- Panel de administración para gestión de catálogo y precios
- Cálculo preciso considerando desperdicios y complejidad de aplicación

### 1.2 Verticales de Negocio

#### Automotriz
- Vidrios de vehículos (parabrisas, laterales, trasero, techo)
- Laminado de seguridad y control solar
- Decodificación VIN para identificación automática

#### Residencial
- Ventanas de hogares y departamentos
- Puertas de vidrio (corredizas, abatibles)
- Mamparas de baño
- Divisiones interiores de vidrio
- Films decorativos y de privacidad

#### Comercial
- Fachadas de edificios corporativos
- Divisiones de oficinas
- Salas de reuniones
- Recepción y áreas comunes
- Control solar y eficiencia energética

#### Arquitectónico/Decorativo
- Franjas horizontales/verticales
- Diseños personalizados
- Vinilos con logos corporativos
- Efectos especiales (degradados, patterns)

## 2. Arquitectura del Sistema

### 2.1 Stack Tecnológico

```
┌─────────────────────────────────────────────────────────────┐
│                    CAPA DE PRESENTACIÓN                      │
├─────────────────────────────────────────────────────────────┤
│ - React 18 (Frontend SPA)                                    │
│ - TypeScript para type safety                                │
│ - Tailwind CSS para estilos                                  │
│ - React Query para gestión de estado servidor               │
│ - React Hook Form para formularios complejos                │
│ - Zod para validación de esquemas                           │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                    CAPA DE INTEGRACIÓN                       │
├─────────────────────────────────────────────────────────────┤
│ - WhatsApp Business API (Meta)                               │
│ - VIN Decoder APIs (NHTSA, Fipe)                            │
│ - Servicios de geolocalización                              │
│ - Email SMTP (notificaciones)                               │
│ - SMS Gateway (confirmaciones)                              │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                    CAPA DE APLICACIÓN                        │
├─────────────────────────────────────────────────────────────┤
│ - FastAPI (REST API)                                         │
│ - Python 3.11+                                               │
│ - Pydantic v2 (validación y serialización)                  │
│ - JWT Authentication                                         │
│ - Rate Limiting & Circuit Breakers                          │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                    CAPA DE DOMINIO                           │
├─────────────────────────────────────────────────────────────┤
│ - Motor de Cálculo de Cotizaciones                          │
│ - Gestión de Catálogo de Productos                          │
│ - Reglas de Negocio por Vertical                            │
│ - Calculadora de Desperdicios                               │
│ - Sistema de Precios Dinámicos                              │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                    CAPA DE PERSISTENCIA                      │
├─────────────────────────────────────────────────────────────┤
│ - PostgreSQL 15+ (base de datos principal)                  │
│ - Redis 7+ (cache y sesiones)                               │
│ - MinIO/S3 (almacenamiento de imágenes)                     │
│ - SQLAlchemy 2.0 (ORM)                                       │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                    CAPA DE INFRAESTRUCTURA                   │
├─────────────────────────────────────────────────────────────┤
│ - Docker & Docker Compose                                    │
│ - Kubernetes (producción)                                    │
│ - Google Cloud Platform                                      │
│   - Cloud Run (backend API)                                  │
│   - Cloud SQL (PostgreSQL)                                   │
│   - Memorystore (Redis)                                      │
│   - Cloud Storage (archivos estáticos)                      │
│ - Prometheus + Grafana (monitoreo)                          │
│ - Sentry (error tracking)                                    │
└─────────────────────────────────────────────────────────────┘
```

### 2.2 Diagrama de Arquitectura de Componentes

```mermaid
graph TB
    subgraph "Cliente"
        WEB[Web Browser]
        WA[WhatsApp]
    end

    subgraph "Load Balancer"
        LB[Cloud Load Balancer]
    end

    subgraph "Frontend - React SPA"
        APP[React Application]
        FORM[Formulario Cotización]
        DASH[Dashboard Admin]
    end

    subgraph "API Gateway"
        GATEWAY[API Gateway + Auth]
    end

    subgraph "Backend Services"
        API[FastAPI Main Service]
        CALC[Motor de Cálculo]
        CAT[Servicio de Catálogo]
        WHATSAPP[WhatsApp Service]
        VIN[VIN Decoder Service]
        NOTIF[Servicio Notificaciones]
    end

    subgraph "Cache Layer"
        REDIS[(Redis Cache)]
    end

    subgraph "Database Layer"
        POSTGRES[(PostgreSQL)]
        REPLICA[(Read Replica)]
    end

    subgraph "Storage"
        S3[(Cloud Storage)]
    end

    subgraph "External APIs"
        WA_API[WhatsApp Business API]
        VIN_API[VIN APIs]
        EMAIL[Email SMTP]
        SMS[SMS Gateway]
    end

    subgraph "Monitoring"
        PROM[Prometheus]
        GRAF[Grafana]
        SENTRY[Sentry]
    end

    WEB --> LB
    WA --> WA_API
    LB --> APP
    APP --> FORM
    APP --> DASH
    APP --> GATEWAY
    GATEWAY --> API
    API --> CALC
    API --> CAT
    API --> WHATSAPP
    API --> VIN
    API --> NOTIF
    API --> REDIS
    API --> POSTGRES
    POSTGRES --> REPLICA
    API --> S3
    WHATSAPP --> WA_API
    VIN --> VIN_API
    NOTIF --> EMAIL
    NOTIF --> SMS
    API --> PROM
    PROM --> GRAF
    API --> SENTRY
```

### 2.3 Flujo de Cotización por Vertical

#### Flujo Residencial/Comercial

```mermaid
sequenceDiagram
    participant U as Usuario
    participant F as Frontend
    participant API as Backend API
    participant CALC as Motor Cálculo
    participant DB as PostgreSQL
    participant WA as WhatsApp

    U->>F: Selecciona tipo (Hogar/Edificio)
    F->>U: Muestra formulario por habitaciones
    U->>F: Agrega habitación (ej: Sala)
    F->>U: Muestra tipos de aberturas
    U->>F: Selecciona aberturas (ventanas, puertas)
    F->>U: Ingresa dimensiones por abertura
    U->>F: Selecciona tipo de film
    F->>API: POST /api/v1/quotations/residential
    API->>CALC: Calcular áreas y desperdicios
    CALC->>CALC: Aplicar reglas de negocio
    CALC->>DB: Consultar precios catálogo
    DB->>CALC: Retorna precios
    CALC->>API: Retorna cotización calculada
    API->>DB: Guardar cotización
    API->>F: Retorna cotización JSON
    F->>U: Muestra resumen y total
    U->>F: Confirma cotización
    F->>API: POST /api/v1/quotations/{id}/confirm
    API->>WA: Envía cotización por WhatsApp
    WA->>U: Recibe PDF cotización
```

## 3. Modelo de Datos

### 3.1 Diagrama ER (Entidad-Relación)

```mermaid
erDiagram
    CUSTOMER ||--o{ QUOTATION : creates
    QUOTATION ||--o{ QUOTATION_ITEM : contains
    QUOTATION_ITEM }o--|| PRODUCT : references
    QUOTATION ||--o{ PROPERTY : for
    PROPERTY ||--o{ ROOM : contains
    ROOM ||--o{ OPENING : has
    OPENING ||--o{ QUOTATION_ITEM : generates
    PRODUCT ||--o{ PRODUCT_PRICE : has
    PRODUCT }o--|| PRODUCT_CATEGORY : belongs_to
    VEHICLE ||--o{ QUOTATION : for
    WHATSAPP_CONVERSATION ||--o{ WHATSAPP_MESSAGE : contains
    WHATSAPP_CONVERSATION }o--|| CUSTOMER : with
    
    CUSTOMER {
        uuid id PK
        string name
        string email
        string phone
        string whatsapp
        enum customer_type
        jsonb metadata
        timestamp created_at
    }
    
    QUOTATION {
        uuid id PK
        uuid customer_id FK
        enum vertical
        enum status
        decimal subtotal
        decimal tax
        decimal total
        jsonb calculation_details
        timestamp created_at
        timestamp expires_at
    }
    
    QUOTATION_ITEM {
        uuid id PK
        uuid quotation_id FK
        uuid product_id FK
        uuid opening_id FK
        decimal quantity
        string unit
        decimal unit_price
        decimal subtotal
        jsonb dimensions
        jsonb specifications
    }
    
    PRODUCT {
        uuid id PK
        uuid category_id FK
        string sku
        string name
        text description
        enum product_type
        jsonb specifications
        boolean active
        timestamp created_at
    }
    
    PRODUCT_CATEGORY {
        uuid id PK
        string name
        string slug
        enum vertical
        int sort_order
    }
    
    PRODUCT_PRICE {
        uuid id PK
        uuid product_id FK
        decimal price_per_sqm
        decimal price_per_linear_meter
        string currency
        date valid_from
        date valid_until
    }
    
    PROPERTY {
        uuid id PK
        uuid quotation_id FK
        enum property_type
        string address
        jsonb location
        decimal total_area
        int floors
        jsonb metadata
    }
    
    ROOM {
        uuid id PK
        uuid property_id FK
        string name
        enum room_type
        decimal area
        int floor
        jsonb metadata
    }
    
    OPENING {
        uuid id PK
        uuid room_id FK
        enum opening_type
        decimal width
        decimal height
        decimal area
        int quantity
        jsonb specifications
    }
    
    VEHICLE {
        uuid id PK
        string vin
        string make
        string model
        int year
        enum vehicle_type
        jsonb glass_specifications
    }
    
    WHATSAPP_CONVERSATION {
        uuid id PK
        uuid customer_id FK
        string phone_number
        enum status
        jsonb context
        timestamp started_at
        timestamp last_message_at
    }
    
    WHATSAPP_MESSAGE {
        uuid id PK
        uuid conversation_id FK
        enum direction
        text content
        jsonb metadata
        timestamp sent_at
    }
```

### 3.2 Entidades Principales

#### Customer (Cliente)
```python
- id: UUID
- name: str
- email: EmailStr
- phone: str
- whatsapp: str
- customer_type: Enum["individual", "business"]
- metadata: dict (información adicional)
```

#### Quotation (Cotización)
```python
- id: UUID
- customer_id: UUID
- vertical: Enum["automotive", "residential", "commercial", "architectural"]
- status: Enum["draft", "pending", "confirmed", "rejected", "expired"]
- subtotal: Decimal
- tax: Decimal
- total: Decimal
- calculation_details: dict
- notes: str
```

#### Product (Producto - Films)
```python
- id: UUID
- category_id: UUID
- sku: str
- name: str
- description: str
- product_type: Enum["laminate", "vinyl", "solar_control", "privacy", "decorative", "security"]
- specifications: dict
  - material: str
  - color: str
  - opacity: int (0-100)
  - uv_protection: int (0-100)
  - heat_rejection: int (0-100)
  - visible_light_transmission: int (0-100)
  - thickness: float (microns)
  - warranty_years: int
```

#### Property (Propiedad)
```python
- id: UUID
- quotation_id: UUID
- property_type: Enum["house", "apartment", "office", "building", "commercial"]
- address: str
- location: dict (lat, lng)
- total_area: Decimal
- floors: int
```

#### Room (Habitación/Área)
```python
- id: UUID
- property_id: UUID
- name: str
- room_type: Enum["living_room", "bedroom", "kitchen", "bathroom", "office", "meeting_room", "lobby"]
- area: Decimal
- floor: int
```

#### Opening (Abertura)
```python
- id: UUID
- room_id: UUID
- opening_type: Enum["window", "door", "sliding_door", "shower_enclosure", "partition", "skylight"]
- width: Decimal (metros)
- height: Decimal (metros)
- area: Decimal (m²)
- quantity: int
- specifications: dict
  - glass_type: str
  - frame_material: str
  - opening_direction: str
```

## 4. Catálogo de Productos

### 4.1 Categorías de Films

#### Laminados de Seguridad
```yaml
category: security_laminate
products:
  - Clear Security 4mil
  - Clear Security 8mil
  - Clear Security 12mil
features:
  - Protección anti-impacto
  - Retención de fragmentos
  - Protección UV 99%
applications:
  - Residencial
  - Comercial
  - Automotriz
```

#### Control Solar
```yaml
category: solar_control
products:
  - Solar Bronze 20%
  - Solar Grey 35%
  - Solar Charcoal 5%
  - Ceramic 70%
  - Ceramic 50%
features:
  - Rechazo de calor
  - Reducción UV
  - Ahorro energético
applications:
  - Residencial
  - Comercial
  - Vehículos
```

#### Vinílicos Decorativos
```yaml
category: decorative_vinyl
products:
  - Esmerilado Total
  - Esmerilado Degradado
  - Blanco Opaco
  - Gris Opaco
  - Colores (Azul, Verde, Rojo, Amarillo)
  - Franjas Horizontales/Verticales
  - Diseños Personalizados
features:
  - Privacidad
  - Decoración
  - Corporativo (logos)
applications:
  - Oficinas
  - Baños
  - Divisiones
  - Fachadas
```

#### Privacidad
```yaml
category: privacy
products:
  - One Way Mirror (espejado)
  - Blackout Opaco
  - Privacy Gradual
features:
  - Privacidad visual
  - Control de luz
applications:
  - Salas de reunión
  - Baños
  - Áreas privadas
```

### 4.2 Precios Base (Ejemplo)

```yaml
pricing_structure:
  security_laminate:
    clear_4mil:
      price_per_sqm: 45.00
      installation_per_sqm: 15.00
    clear_8mil:
      price_per_sqm: 65.00
      installation_per_sqm: 18.00
  
  solar_control:
    ceramic_70:
      price_per_sqm: 85.00
      installation_per_sqm: 20.00
    charcoal_5:
      price_per_sqm: 95.00
      installation_per_sqm: 22.00
  
  decorative_vinyl:
    frosted_full:
      price_per_sqm: 55.00
      installation_per_sqm: 12.00
    colored:
      price_per_sqm: 48.00
      installation_per_sqm: 12.00
    stripes:
      price_per_linear_meter: 25.00
      installation_per_linear_meter: 8.00
```

## 5. Motor de Cálculo

### 5.1 Reglas de Negocio

#### Cálculo de Desperdicios
```python
def calculate_waste_percentage(opening_type: str, film_type: str) -> float:
    """Calcula porcentaje de desperdicio según tipo de abertura y film"""
    
    waste_matrix = {
        "window": {
            "laminate": 0.15,      # 15% desperdicio
            "vinyl": 0.12,
            "solar_control": 0.15
        },
        "door": {
            "laminate": 0.18,
            "vinyl": 0.15,
            "solar_control": 0.18
        },
        "shower_enclosure": {
            "laminate": 0.20,      # Mayor complejidad
            "vinyl": 0.18,
            "solar_control": 0.20
        },
        "curved_glass": {
            "laminate": 0.30,      # Máximo desperdicio
            "vinyl": 0.25,
            "solar_control": 0.30
        }
    }
    
    return waste_matrix.get(opening_type, {}).get(film_type, 0.15)
```

#### Factor de Complejidad de Instalación
```python
def get_installation_complexity_factor(specifications: dict) -> float:
    """Retorna multiplicador de precio por complejidad"""
    
    complexity = 1.0
    
    # Altura de instalación
    if specifications.get("floor", 1) > 3:
        complexity *= 1.2  # 20% adicional por altura
    
    # Acceso difícil
    if specifications.get("difficult_access", False):
        complexity *= 1.3
    
    # Vidrio curvo
    if specifications.get("curved_glass", False):
        complexity *= 1.5
    
    # Aplicación en temperaturas extremas
    if specifications.get("extreme_weather", False):
        complexity *= 1.15
    
    return complexity
```

#### Descuentos por Volumen
```python
def calculate_volume_discount(total_sqm: float) -> float:
    """Descuento progresivo por m² totales"""
    
    if total_sqm >= 500:
        return 0.20  # 20% descuento
    elif total_sqm >= 200:
        return 0.15  # 15% descuento
    elif total_sqm >= 100:
        return 0.10  # 10% descuento
    elif total_sqm >= 50:
        return 0.05  # 5% descuento
    else:
        return 0.0   # Sin descuento
```

### 5.2 Algoritmo de Cotización

```python
class QuotationCalculator:
    """Motor de cálculo de cotizaciones"""
    
    def calculate_quotation(
        self,
        openings: List[Opening],
        products: List[Product],
        specifications: dict
    ) -> QuotationResult:
        """Calcula cotización completa"""
        
        items = []
        total_area = 0
        
        for opening in openings:
            # Calcular área base
            base_area = opening.width * opening.height * opening.quantity
            
            # Aplicar desperdicio
            waste_pct = calculate_waste_percentage(
                opening.opening_type,
                products[0].product_type
            )
            final_area = base_area * (1 + waste_pct)
            
            # Precio del material
            material_cost = final_area * product.price_per_sqm
            
            # Complejidad de instalación
            complexity = get_installation_complexity_factor(opening.specifications)
            installation_cost = final_area * product.installation_per_sqm * complexity
            
            # Total por item
            item_total = material_cost + installation_cost
            
            items.append(QuotationItem(
                opening=opening,
                product=product,
                quantity=final_area,
                unit="m²",
                unit_price=product.price_per_sqm,
                installation_cost=installation_cost,
                subtotal=item_total
            ))
            
            total_area += final_area
        
        # Subtotal antes de descuentos
        subtotal = sum(item.subtotal for item in items)
        
        # Aplicar descuento por volumen
        volume_discount = calculate_volume_discount(total_area)
        discount_amount = subtotal * volume_discount
        
        # Total después de descuento
        subtotal_after_discount = subtotal - discount_amount
        
        # Impuestos
        tax = subtotal_after_discount * TAX_RATE
        
        # Total final
        total = subtotal_after_discount + tax
        
        return QuotationResult(
            items=items,
            total_area=total_area,
            subtotal=subtotal,
            volume_discount=discount_amount,
            tax=tax,
            total=total,
            calculation_details={
                "waste_percentage": waste_pct,
                "complexity_factor": complexity,
                "volume_discount_percentage": volume_discount
            }
        )
```

## 6. API Endpoints

### 6.1 Cotizaciones

```
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

### 6.2 Catálogo de Productos

```
GET    /api/v1/products
GET    /api/v1/products/{id}
POST   /api/v1/products (admin)
PUT    /api/v1/products/{id} (admin)
DELETE /api/v1/products/{id} (admin)
GET    /api/v1/products/categories
GET    /api/v1/products/by-vertical/{vertical}
```

### 6.3 Propiedades y Habitaciones

```
POST   /api/v1/properties
GET    /api/v1/properties/{id}
POST   /api/v1/properties/{id}/rooms
PUT    /api/v1/rooms/{id}
DELETE /api/v1/rooms/{id}
POST   /api/v1/rooms/{id}/openings
PUT    /api/v1/openings/{id}
DELETE /api/v1/openings/{id}
```

## 7. Seguridad

### 7.1 Autenticación y Autorización

```python
# JWT Token Structure
{
    "sub": "user_id",
    "email": "user@example.com",
    "role": "admin|user|guest",
    "permissions": ["quotations:read", "quotations:create", "catalog:admin"],
    "exp": 1234567890
}
```

### 7.2 Medidas de Seguridad

- **HTTPS obligatorio** en toda comunicación
- **Rate Limiting**: 100 requests/minuto por IP
- **Input Validation**: Validación estricta con Pydantic
- **SQL Injection Prevention**: SQLAlchemy ORM
- **XSS Prevention**: Sanitización de inputs
- **CORS**: Configuración estricta de orígenes permitidos
- **Secrets Management**: Variables de entorno encriptadas
- **API Key Rotation**: Rotación automática cada 90 días
- **Audit Logging**: Log de todas las operaciones sensibles
- **Encryption at Rest**: PostgreSQL con TDE
- **Encryption in Transit**: TLS 1.3

### 7.3 Hardening Checklist

```yaml
security_hardening:
  api_level:
    - ✅ JWT con RS256 (no HS256)
    - ✅ Rate limiting por endpoint
    - ✅ Request size limits (10MB max)
    - ✅ Query timeout (30s max)
    - ✅ CORS estricto
    - ✅ Security headers (HSTS, CSP, X-Frame-Options)
    
  application_level:
    - ✅ Input validation con Pydantic
    - ✅ Output encoding
    - ✅ SQL parameterization
    - ✅ File upload restrictions
    - ✅ Password hashing (Argon2)
    
  infrastructure_level:
    - ✅ Docker security scanning
    - ✅ Dependency vulnerability scanning
    - ✅ Secret rotation automation
    - ✅ Network segmentation
    - ✅ Firewall rules
    - ✅ DDoS protection
    
  monitoring_level:
    - ✅ Intrusion detection
    - ✅ Anomaly detection
    - ✅ Failed login tracking
    - ✅ Audit trail completo
```

## 8. Performance y Escalabilidad

### 8.1 Estrategias de Cache

```python
# Cache de productos (actualización cada hora)
@cache(ttl=3600, namespace="products")
def get_product_catalog():
    return db.query(Product).all()

# Cache de precios (actualización cada 30 min)
@cache(ttl=1800, namespace="prices")
def get_product_prices():
    return db.query(ProductPrice).filter_by(active=True).all()

# Cache de cotizaciones temporales (5 minutos)
@cache(ttl=300, namespace="temp_quotations")
def get_temp_quotation(session_id: str):
    return redis.get(f"quotation:{session_id}")
```

### 8.2 Optimización de Consultas

```sql
-- Índices estratégicos
CREATE INDEX idx_quotations_customer ON quotations(customer_id);
CREATE INDEX idx_quotations_status ON quotations(status);
CREATE INDEX idx_quotations_created_at ON quotations(created_at DESC);
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_active ON products(active) WHERE active = true;
CREATE INDEX idx_openings_room ON openings(room_id);

-- Índices compuestos
CREATE INDEX idx_quotations_customer_status ON quotations(customer_id, status);
CREATE INDEX idx_products_category_active ON products(category_id, active);
```

## 9. Deployment

### 9.1 Docker Compose (Desarrollo)

```yaml
version: '3.8'

services:
  api:
    build: ./backend
    environment:
      - DATABASE_URL=postgresql://user:pass@postgres:5432/films_db
      - REDIS_URL=redis://redis:6379/0
    depends_on:
      - postgres
      - redis
    ports:
      - "8000:8000"
  
  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    depends_on:
      - api
  
  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: films_db
      POSTGRES_USER: user
      POSTGRES_PASSWORD: pass
    volumes:
      - postgres_data:/var/lib/postgresql/data
  
  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data
  
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
    depends_on:
      - api
      - frontend

volumes:
  postgres_data:
  redis_data:
```

### 9.2 Kubernetes (Producción)

```yaml
# deployment-api.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: films-api
spec:
  replicas: 3
  selector:
    matchLabels:
      app: films-api
  template:
    metadata:
      labels:
        app: films-api
    spec:
      containers:
      - name: api
        image: gcr.io/project/films-api:latest
        resources:
          requests:
            memory: "512Mi"
            cpu: "500m"
          limits:
            memory: "1Gi"
            cpu: "1000m"
        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: films-secrets
              key: database-url
---
apiVersion: v1
kind: Service
metadata:
  name: films-api-service
spec:
  type: LoadBalancer
  ports:
  - port: 80
    targetPort: 8000
  selector:
    app: films-api
```

## 10. Monitoreo y Observabilidad

### 10.1 Métricas Clave

```python
# Prometheus metrics
quotation_requests_total = Counter('quotation_requests_total', 'Total quotation requests')
quotation_calculation_duration = Histogram('quotation_calculation_duration_seconds', 
                                          'Time spent calculating quotations')
active_users = Gauge('active_users', 'Number of active users')
database_connections = Gauge('database_connections', 'Number of database connections')
```

### 10.2 Health Checks

```python
@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "database": check_database_connection(),
        "redis": check_redis_connection(),
        "version": "1.0.0"
    }

@app.get("/ready")
async def readiness_check():
    if not all([
        check_database_connection(),
        check_redis_connection(),
        check_external_apis()
    ]):
        raise HTTPException(status_code=503, detail="Service not ready")
    return {"status": "ready"}
```

## 11. Testing Strategy

### 11.1 Cobertura de Tests

```
- Unit Tests: 80% cobertura mínima
- Integration Tests: Flujos críticos
- E2E Tests: Principales user journeys
- Load Tests: 1000 requests/segundo
- Security Tests: OWASP Top 10
```

### 11.2 Estructura de Tests

```
tests/
├── unit/
│   ├── test_calculator.py
│   ├── test_models.py
│   └── test_services.py
├── integration/
│   ├── test_api_quotations.py
│   ├── test_whatsapp_flow.py
│   └── test_database.py
├── e2e/
│   ├── test_residential_flow.py
│   └── test_commercial_flow.py
└── load/
    └── locustfile.py
```

## 12. Roadmap

### Fase 1: MVP (4 semanas)
- ✅ Arquitectura base
- ✅ Modelo de datos
- ✅ API Core endpoints
- ✅ Formulario web básico
- ✅ Motor de cálculo

### Fase 2: Integraciones (3 semanas)
- WhatsApp Business API
- Sistema de notificaciones
- Generación de PDFs
- Panel de administración

### Fase 3: Optimizaciones (2 semanas)
- Cache avanzado
- Optimización de queries
- Load testing y tuning
- Monitoreo completo

### Fase 4: Features Avanzadas (3 semanas)
- Cotizaciones colaborativas
- Integración con CRM
- Analytics y reportes
- Mobile app (React Native)