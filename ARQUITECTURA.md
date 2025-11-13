# 🏗️ Arquitectura del Sistema - Cotizador de Láminas

Este documento describe la arquitectura completa del sistema de cotización de láminas para vehículos.

---

## 📊 Diagrama de Arquitectura General

```mermaid
graph TB
    subgraph "Cliente Web/Móvil"
        Client[👤 Cliente]
        Manager[👨‍💼 Encargado]
    end

    subgraph "Docker Network - cotizador-network"
        subgraph "Contenedor App - Next.js 15"
            App[Next.js App<br/>Port 3000]
            API[API Routes]
            Pages[Pages/Components]
            Prisma[Prisma ORM]
        end

        subgraph "Contenedor DB - MySQL 8.0"
            MySQL[(MySQL Database<br/>Port 3306)]
        end

        subgraph "Contenedor phpMyAdmin"
            PMA[phpMyAdmin<br/>Port 8080]
        end
    end

    subgraph "Servicios Externos"
        WhatsApp[WhatsApp Web API]
        Cloudinary[Cloudinary<br/>Image Storage<br/>Sprint 10/11]
        VehicleAPI[Vehicle Images API<br/>Sprint 8]
    end

    Client -->|HTTP/HTTPS| App
    Manager -->|HTTP/HTTPS| App
    Manager -->|Gestión DB| PMA

    App --> API
    API --> Prisma
    Prisma --> MySQL
    PMA --> MySQL

    App -->|Envío Cotización| WhatsApp
    App -.->|Upload Fotos<br/>Futuro| Cloudinary
    App -.->|Fetch Images<br/>Futuro| VehicleAPI

    style App fill:#61dafb,stroke:#333,stroke-width:2px
    style MySQL fill:#4479a1,stroke:#333,stroke-width:2px
    style PMA fill:#f89c0e,stroke:#333,stroke-width:2px
    style WhatsApp fill:#25d366,stroke:#333,stroke-width:2px
    style Cloudinary fill:#3448c5,stroke:#333,stroke-width:2px
    style VehicleAPI fill:#ff6b6b,stroke:#333,stroke-width:2px
```

---

## 🔄 Diagrama de Flujo de Datos

```mermaid
flowchart LR
    subgraph "Cliente"
        C1[📱 Formulario<br/>Simplificado]
        C2[📸 Fotos del<br/>Vehículo]
    end

    subgraph "API Layer"
        API1[/api/solicitudes]
        API2[/api/whatsapp/send]
        API3[/api/health]
    end

    subgraph "Base de Datos"
        DB1[(QuotationRequest)]
        DB2[(Quotation)]
        DB3[(Customer)]
        DB4[(Product)]
    end

    subgraph "Encargado"
        M1[📋 Panel de<br/>Solicitudes]
        M2[✏️ Completar<br/>Cotización]
        M3[📤 Enviar<br/>WhatsApp]
    end

    C1 --> API1
    C2 --> API1
    API1 --> DB1

    DB1 --> M1
    M1 --> M2
    M2 --> DB2
    M2 --> DB3
    DB4 --> M2

    M3 --> API2
    API2 -->|Mensaje<br/>Formateado| WhatsApp[💬 WhatsApp]

    style C1 fill:#e3f2fd,stroke:#1976d2
    style C2 fill:#e3f2fd,stroke:#1976d2
    style M1 fill:#fff3e0,stroke:#f57c00
    style M2 fill:#fff3e0,stroke:#f57c00
    style M3 fill:#fff3e0,stroke:#f57c00
    style WhatsApp fill:#c8e6c9,stroke:#388e3c
```

---

## 🧩 Diagrama de Componentes

```mermaid
graph TB
    subgraph "Frontend - Next.js App Router"
        subgraph "Cliente Pages"
            P1[/cotizar/cliente]
        end

        subgraph "Encargado Pages"
            P2[/encargado/solicitudes]
            P3[/encargado/cotizaciones/nueva]
        end

        subgraph "Shared Pages"
            P4[/cotizar/vehiculos]
        end

        subgraph "Components"
            C1[VehicleForm]
            C2[OpeningConfigurator]
            C3[QuotationSummary]
            C4[PhotoUpload]
        end
    end

    subgraph "Backend - API Routes"
        subgraph "Solicitudes API"
            A1[GET /api/solicitudes]
            A2[POST /api/solicitudes]
            A3[GET /api/solicitudes/:id]
            A4[PATCH /api/solicitudes/:id]
        end

        subgraph "WhatsApp API"
            A5[POST /api/whatsapp/send]
        end

        subgraph "System API"
            A6[GET /api/health]
        end
    end

    subgraph "Data Layer - Prisma"
        subgraph "Models"
            M1[QuotationRequest]
            M2[Quotation]
            M3[QuotationItem]
            M4[Customer]
            M5[Product]
            M6[PricingConfig]
        end

        subgraph "Database"
            DB[(MySQL 8.0)]
        end
    end

    subgraph "Utilities"
        U1[lib/vehicleImages.ts]
        U2[lib/prisma.ts]
        U3[lib/whatsapp.ts]
    end

    P1 --> C4
    P1 --> A2
    P2 --> A1
    P3 --> A3
    P4 --> C1
    P4 --> C2
    P4 --> C3
    P4 --> A5

    C1 --> U1
    C4 --> U1

    A1 --> M1
    A2 --> M1
    A3 --> M1
    A4 --> M1
    A5 --> M2
    A5 --> U3

    M1 --> DB
    M2 --> DB
    M3 --> DB
    M4 --> DB
    M5 --> DB
    M6 --> DB

    U2 --> DB

    style P1 fill:#e1bee7,stroke:#8e24aa
    style P2 fill:#ffccbc,stroke:#d84315
    style P3 fill:#ffccbc,stroke:#d84315
    style P4 fill:#c5e1a5,stroke:#558b2f
    style DB fill:#b3e5fc,stroke:#0277bd
```

---

## 🐳 Diagrama de Infraestructura Docker

```mermaid
graph TB
    subgraph "Docker Host"
        subgraph "Docker Network: cotizador-network"
            subgraph "Container: cotizador-app"
                App[Next.js 15<br/>Node 20 Alpine]
                Port3000[":3000"]
            end

            subgraph "Container: cotizador-db"
                MySQL[MySQL 8.0]
                Port3306[":3306"]
                Vol1[Volume: mysql_data]
            end

            subgraph "Container: cotizador-phpmyadmin"
                PMA[phpMyAdmin]
                Port8080[":8080"]
            end

            App -->|TCP 3306| MySQL
            PMA -->|TCP 3306| MySQL
            MySQL --> Vol1
        end

        subgraph "Volumes"
            V1[mysql_data<br/>Persistent DB]
            V2[app_logs<br/>App Cache]
        end

        subgraph "Host Ports"
            HP1[localhost:3000]
            HP2[localhost:3306]
            HP3[localhost:8080]
        end
    end

    subgraph "External"
        User[👤 Usuario]
        Admin[👨‍💼 Admin]
    end

    User -->|HTTP| HP1
    Admin -->|HTTP| HP1
    Admin -->|HTTP| HP3

    HP1 --> Port3000
    HP2 --> Port3306
    HP3 --> Port8080

    Vol1 -.-> V1
    App -.-> V2

    style App fill:#61dafb,stroke:#333,stroke-width:3px
    style MySQL fill:#4479a1,stroke:#333,stroke-width:3px
    style PMA fill:#f89c0e,stroke:#333,stroke-width:3px
    style V1 fill:#90ee90,stroke:#333
    style V2 fill:#90ee90,stroke:#333
```

---

## 🔐 Diagrama de Seguridad

```mermaid
graph LR
    subgraph "External"
        Internet[🌐 Internet]
    end

    subgraph "Firewall/Reverse Proxy"
        Nginx[Nginx/Traefik<br/>SSL/TLS]
    end

    subgraph "Docker Network - INTERNAL"
        App[Next.js App<br/>No directo]
        DB[(MySQL<br/>No expuesta)]
    end

    subgraph "Security Layers"
        SSL[SSL/TLS<br/>Encryption]
        Auth[JWT Auth<br/>Future]
        CORS[CORS Policy]
        Rate[Rate Limiting]
        Env[Environment<br/>Variables]
    end

    Internet -->|HTTPS 443| Nginx
    Nginx --> SSL
    SSL --> Auth
    Auth --> CORS
    CORS --> Rate
    Rate --> App
    App -->|Internal| DB

    App --> Env
    DB --> Env

    style SSL fill:#4caf50,stroke:#333
    style Auth fill:#ff9800,stroke:#333
    style CORS fill:#2196f3,stroke:#333
    style Rate fill:#f44336,stroke:#333
    style Env fill:#9c27b0,stroke:#333
    style Nginx fill:#00acc1,stroke:#333,stroke-width:3px
```

---

## 📱 Diagrama de Casos de Uso

```mermaid
graph TB
    subgraph "Sistema de Cotización"
        subgraph "Casos de Uso - Cliente"
            UC1[Enviar Solicitud<br/>con Fotos]
            UC2[Seleccionar Tipo<br/>de Servicio]
            UC3[Recibir Cotización<br/>por WhatsApp]
        end

        subgraph "Casos de Uso - Encargado"
            UC4[Ver Solicitudes<br/>Pendientes]
            UC5[Revisar Fotos<br/>del Vehículo]
            UC6[Completar Datos<br/>del Vehículo]
            UC7[Configurar<br/>Vidrios]
            UC8[Calcular<br/>Cotización]
            UC9[Enviar por<br/>WhatsApp]
        end

        subgraph "Casos de Uso - Sistema"
            UC10[Gestionar<br/>Productos]
            UC11[Gestionar<br/>Clientes]
            UC12[Gestionar<br/>Precios]
        end
    end

    Actor1[👤 Cliente]
    Actor2[👨‍💼 Encargado]
    Actor3[⚙️ Sistema]

    Actor1 --> UC1
    Actor1 --> UC2
    Actor1 --> UC3

    Actor2 --> UC4
    Actor2 --> UC5
    Actor2 --> UC6
    Actor2 --> UC7
    Actor2 --> UC8
    Actor2 --> UC9

    Actor3 --> UC10
    Actor3 --> UC11
    Actor3 --> UC12

    UC1 --> UC4
    UC4 --> UC5
    UC5 --> UC6
    UC6 --> UC7
    UC7 --> UC8
    UC8 --> UC9
    UC9 --> UC3

    style UC1 fill:#e1f5fe,stroke:#01579b
    style UC2 fill:#e1f5fe,stroke:#01579b
    style UC3 fill:#e1f5fe,stroke:#01579b
    style UC4 fill:#fff3e0,stroke:#e65100
    style UC5 fill:#fff3e0,stroke:#e65100
    style UC6 fill:#fff3e0,stroke:#e65100
    style UC7 fill:#fff3e0,stroke:#e65100
    style UC8 fill:#fff3e0,stroke:#e65100
    style UC9 fill:#fff3e0,stroke:#e65100
    style UC10 fill:#f3e5f5,stroke:#4a148c
    style UC11 fill:#f3e5f5,stroke:#4a148c
    style UC12 fill:#f3e5f5,stroke:#4a148c
```

---

## 🗄️ Diagrama del Modelo de Datos

```mermaid
erDiagram
    Customer ||--o{ Quotation : "has many"
    Quotation ||--o{ QuotationItem : "contains"
    Product ||--o{ QuotationItem : "used in"
    Room ||--o{ Opening : "has"
    Opening ||--o{ QuotationItem : "generates"
    Property ||--o{ Quotation : "for"
    QuotationRequest ||--o| Quotation : "becomes"
    PricingConfig ||--o{ Product : "configures"

    Customer {
        string id PK
        string name
        string email
        string phone
        string segment
        datetime createdAt
    }

    Quotation {
        string id PK
        string customerId FK
        string propertyId FK
        json vehicleInfo
        string customerType
        decimal discountPercentage
        decimal total
        boolean sentViaWhatsApp
        datetime whatsappSentAt
        datetime createdAt
    }

    QuotationItem {
        string id PK
        string quotationId FK
        string productId FK
        string openingId FK
        decimal quantity
        decimal unitPrice
        decimal subtotal
    }

    Product {
        string id PK
        string name
        string brand
        decimal thickness
        string vlt
        decimal pricePerSqm
        boolean isActive
    }

    QuotationRequest {
        string id PK
        string phone
        json vehiclePhotos
        string serviceType
        string status
        string quotationId FK
        datetime createdAt
    }

    PricingConfig {
        string id PK
        string vehicleType
        decimal pricePerSqm
        string productId FK
        boolean isActive
    }

    Property {
        string id PK
        string type
        decimal area
    }

    Room {
        string id PK
        string name
        string propertyId FK
    }

    Opening {
        string id PK
        string name
        decimal width
        decimal height
        string roomId FK
    }
```

---

## 🔄 Diagrama de Estados (Solicitud)

```mermaid
stateDiagram-v2
    [*] --> PENDING: Cliente envía solicitud

    PENDING --> IN_PROGRESS: Encargado toma solicitud
    PENDING --> CANCELLED: Cliente cancela

    IN_PROGRESS --> COMPLETED: Cotización completada
    IN_PROGRESS --> CANCELLED: Encargado cancela

    COMPLETED --> SENT: Envío por WhatsApp

    SENT --> [*]: Flujo terminado
    CANCELLED --> [*]: Flujo terminado

    note right of PENDING
        - Esperando asignación
        - Fotos disponibles
        - Teléfono registrado
    end note

    note right of IN_PROGRESS
        - Encargado trabajando
        - Datos siendo completados
        - Cotización en proceso
    end note

    note right of COMPLETED
        - Cotización calculada
        - Lista para envío
        - Precio final disponible
    end note

    note right of SENT
        - Mensaje enviado
        - Cliente notificado
        - Timestamp guardado
    end note
```

---

## 🚀 Diagrama de Deployment

```mermaid
graph TB
    subgraph "Desarrollo Local"
        Dev[💻 Developer<br/>Workstation]
        DevDocker[🐳 Docker Desktop<br/>docker-compose.dev.yml]
    end

    subgraph "CI/CD Pipeline"
        GitHub[GitHub<br/>Repository]
        Actions[GitHub Actions<br/>CI/CD]
    end

    subgraph "Servidor Debian"
        subgraph "Docker Engine"
            ProdApp[cotizador-app<br/>Production]
            ProdDB[cotizador-db<br/>MySQL]
            ProdPMA[phpmyadmin]
            Nginx[Nginx Reverse Proxy<br/>SSL/TLS]
        end

        Volumes[(Persistent<br/>Volumes)]
    end

    subgraph "Monitoreo"
        Logs[Docker Logs]
        Health[Health Checks]
        Metrics[Container Stats]
    end

    Dev -->|git push| GitHub
    GitHub -->|trigger| Actions
    Actions -->|deploy| ProdApp

    DevDocker -.->|test| Dev

    ProdApp --> ProdDB
    ProdPMA --> ProdDB
    ProdDB --> Volumes

    Nginx -->|proxy| ProdApp

    ProdApp --> Logs
    ProdApp --> Health
    ProdApp --> Metrics

    Internet[🌐 Internet] -->|HTTPS| Nginx

    style Dev fill:#e3f2fd,stroke:#1976d2
    style ProdApp fill:#c8e6c9,stroke:#388e3c,stroke-width:3px
    style ProdDB fill:#fff9c4,stroke:#f57f17,stroke-width:3px
    style Nginx fill:#b2dfdb,stroke:#00695c,stroke-width:3px
    style GitHub fill:#ffccbc,stroke:#d84315
    style Actions fill:#f8bbd0,stroke:#c2185b
```

---

## 📊 Resumen de Componentes

### Frontend
- **Framework**: Next.js 15 (App Router)
- **UI**: React 19 + TailwindCSS
- **Iconos**: Lucide React
- **Formularios**: React Hooks

### Backend
- **Runtime**: Node.js 20
- **API**: Next.js API Routes
- **ORM**: Prisma
- **Base de Datos**: MySQL 8.0

### Infraestructura
- **Containerización**: Docker + Docker Compose
- **Web Server**: Next.js Standalone (Producción)
- **DB Admin**: phpMyAdmin
- **Reverse Proxy**: Nginx (Producción)

### Integraciones
- **WhatsApp**: Web API (actual) → Business API (futuro)
- **Imágenes**: Placeholders (actual) → Cloudinary (futuro)
- **Vehículos**: Local (actual) → API externa (Sprint 8)

---

**Última actualización**: Enero 2025
**Versión**: Sprint 7.5
