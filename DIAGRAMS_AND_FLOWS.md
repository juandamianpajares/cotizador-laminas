# Diagramas de Flujo y Casos de Uso

## Tabla de Contenidos
1. [Casos de Uso](#casos-de-uso)
2. [Diagramas de Flujo](#diagramas-de-flujo)
3. [Diagramas de Secuencia](#diagramas-de-secuencia)
4. [User Journeys](#user-journeys)

---

## 1. Casos de Uso

### Diagrama de Casos de Uso General

```mermaid
graph TB
    Cliente[Cliente]
    Admin[Administrador]
    Sistema[Sistema]
    WhatsApp[WhatsApp Bot]
    
    Cliente --> UC1[Solicitar Cotización]
    Cliente --> UC2[Ver Cotización]
    Cliente --> UC3[Confirmar Cotización]
    
    Admin --> UC4[Gestionar Catálogo]
    Admin --> UC5[Gestionar Precios]
    Admin --> UC6[Ver Reportes]
    Admin --> UC7[Gestionar Clientes]
    
    UC1 --> UC1A[Residencial]
    UC1 --> UC1B[Comercial]
    UC1 --> UC1C[Automotriz]
    
    UC1A --> UC1A1[Agregar Habitaciones]
    UC1A --> UC1A2[Configurar Aberturas]
    UC1A --> UC1A3[Seleccionar Films]
    
    WhatsApp --> UC8[Cotización Conversacional]
    WhatsApp --> UC9[Enviar Recordatorios]
```

### UC-001: Crear Cotización Residencial

**Actor Principal**: Cliente  
**Precondiciones**: 
- El sistema está operativo
- El cliente tiene acceso al formulario web

**Flujo Principal**:
1. Cliente accede al sistema
2. Sistema muestra opciones de vertical
3. Cliente selecciona "Residencial"
4. Sistema muestra formulario de información del cliente
5. Cliente ingresa sus datos (nombre, email, teléfono, WhatsApp)
6. Sistema valida los datos
7. Sistema muestra formulario de propiedad
8. Cliente ingresa datos de la propiedad (tipo, dirección, pisos)
9. Sistema permite agregar habitaciones
10. Cliente agrega habitación con nombre, tipo y piso
11. Sistema permite agregar aberturas a la habitación
12. Cliente agrega abertura con:
    - Tipo (ventana, puerta, etc.)
    - Dimensiones (ancho x alto)
    - Cantidad
    - Tipo de film
    - Especificaciones
13. Cliente repite pasos 10-12 para todas las habitaciones
14. Cliente solicita cálculo de cotización
15. Sistema calcula:
    - Áreas totales
    - Desperdicios
    - Costos de materiales
    - Costos de instalación
    - Descuentos por volumen
    - Impuestos
    - Total
16. Sistema muestra resumen de cotización
17. Cliente puede:
    - Editar (volver al paso 9)
    - Guardar como borrador
    - Confirmar y enviar

**Flujos Alternativos**:
- **A1**: Si hay errores de validación en paso 6, sistema muestra mensajes y solicita corrección
- **A2**: Si cliente desea modificar vertical, puede volver al paso 3
- **A3**: Si cálculo falla, sistema muestra error y permite reintentar

**Postcondiciones**:
- Cotización creada en sistema con estado "draft" o "confirmed"
- Cliente recibe email con cotización
- Si confirmada, cliente recibe WhatsApp con PDF

---

### UC-002: Gestionar Catálogo de Productos

**Actor Principal**: Administrador  
**Precondiciones**: 
- Usuario autenticado con rol "admin"
- Acceso al panel de administración

**Flujo Principal**:
1. Admin accede al panel de administración
2. Sistema muestra dashboard
3. Admin selecciona "Catálogo de Productos"
4. Sistema muestra lista de productos existentes
5. Admin puede:
   - **Crear nuevo producto**:
     - Ingresar SKU, nombre, descripción
     - Seleccionar categoría y tipo
     - Definir especificaciones técnicas
     - Subir imágenes
     - Definir precios por vertical
   - **Editar producto existente**:
     - Modificar cualquier campo
     - Actualizar precios
     - Cambiar estado (activo/inactivo)
   - **Eliminar producto**:
     - Sistema valida que no esté en cotizaciones activas
     - Confirmación requerida
6. Sistema guarda cambios
7. Sistema registra en audit log
8. Sistema invalida cache de productos

**Postcondiciones**:
- Catálogo actualizado
- Cache invalidado
- Audit log registrado

---

## 2. Diagramas de Flujo

### Flujo de Cotización Residencial Completo

```mermaid
flowchart TD
    Start([Inicio]) --> SelectVertical[Seleccionar Vertical]
    SelectVertical --> InputCustomer[Ingresar Datos Cliente]
    InputCustomer --> ValidateCustomer{¿Datos Válidos?}
    ValidateCustomer -->|No| InputCustomer
    ValidateCustomer -->|Sí| InputProperty[Ingresar Datos Propiedad]
    
    InputProperty --> AddRoom[Agregar Habitación]
    AddRoom --> InputRoomDetails[Nombre, Tipo, Piso]
    InputRoomDetails --> AddOpening[Agregar Abertura]
    
    AddOpening --> InputOpeningDetails[Tipo, Dimensiones, Film]
    InputOpeningDetails --> MoreOpenings{¿Más Aberturas?}
    MoreOpenings -->|Sí| AddOpening
    MoreOpenings -->|No| MoreRooms{¿Más Habitaciones?}
    
    MoreRooms -->|Sí| AddRoom
    MoreRooms -->|No| Calculate[Calcular Cotización]
    
    Calculate --> CalcAreas[Calcular Áreas]
    CalcAreas --> CalcWaste[Aplicar Desperdicios]
    CalcWaste --> CalcCosts[Calcular Costos]
    CalcCosts --> ApplyDiscounts[Aplicar Descuentos]
    ApplyDiscounts --> CalcTax[Calcular Impuestos]
    CalcTax --> ShowPreview[Mostrar Preview]
    
    ShowPreview --> UserAction{Acción del Usuario}
    UserAction -->|Editar| AddRoom
    UserAction -->|Guardar| SaveDraft[Guardar Borrador]
    UserAction -->|Confirmar| ConfirmQuote[Confirmar Cotización]
    
    SaveDraft --> End([Fin])
    ConfirmQuote --> SendEmail[Enviar Email]
    SendEmail --> SendWhatsApp[Enviar WhatsApp]
    SendWhatsApp --> End
```

### Flujo de Cálculo de Cotización

```mermaid
flowchart TD
    Start([Inicio Cálculo]) --> GetOpenings[Obtener Lista de Aberturas]
    GetOpenings --> GetProducts[Obtener Productos Seleccionados]
    GetProducts --> InitTotals[Inicializar Totales]
    
    InitTotals --> LoopStart{¿Más Items?}
    LoopStart -->|Sí| CalcBaseArea[Calcular Área Base]
    
    CalcBaseArea --> GetWastePct[Obtener % Desperdicio]
    GetWastePct --> CheckType{¿Tipo Abertura?}
    CheckType -->|Franja| CalcLinear[Calcular Metros Lineales]
    CheckType -->|Otra| CalcNormal[width x height x qty]
    
    CalcLinear --> ApplyWaste[Aplicar Desperdicio]
    CalcNormal --> ApplyWaste
    
    ApplyWaste --> GetComplexity[Calcular Factor Complejidad]
    GetComplexity --> CheckFloor{¿Piso > 3?}
    CheckFloor -->|Sí| AddHeightFactor[Factor x 1.2]
    CheckFloor -->|No| CheckAccess{¿Acceso Difícil?}
    
    AddHeightFactor --> CheckAccess
    CheckAccess -->|Sí| AddAccessFactor[Factor x 1.3]
    CheckAccess -->|No| CheckCurved{¿Vidrio Curvo?}
    
    AddAccessFactor --> CheckCurved
    CheckCurved -->|Sí| AddCurvedFactor[Factor x 1.5]
    CheckCurved -->|No| CalcMaterial[Calcular Costo Material]
    
    AddCurvedFactor --> CalcMaterial
    CalcMaterial --> MaterialCost[área x precio_m2]
    MaterialCost --> CalcInstall[Calcular Costo Instalación]
    CalcInstall --> InstallCost[área x install_m2 x complejidad]
    InstallCost --> ItemSubtotal[Subtotal Item]
    ItemSubtotal --> AddToTotal[Agregar a Totales]
    
    AddToTotal --> LoopStart
    
    LoopStart -->|No| CalcSubtotal[Subtotal General]
    CalcSubtotal --> CheckVolume{¿m² >= 50?}
    CheckVolume -->|Sí| ApplyVolumeDiscount[Aplicar Descuento Volumen]
    CheckVolume -->|No| CalcTax[Calcular Impuesto]
    
    ApplyVolumeDiscount --> CalcTax
    CalcTax --> TaxAmount[subtotal x tax_rate]
    TaxAmount --> CalcTotal[Total Final]
    CalcTotal --> BuildResult[Construir Resultado]
    BuildResult --> End([Fin Cálculo])
```

### Flujo de Integración WhatsApp

```mermaid
flowchart TD
    Start([Mensaje Recibido]) --> ParseMsg[Parsear Mensaje]
    ParseMsg --> GetConv{¿Conversación Existe?}
    
    GetConv -->|No| CreateConv[Crear Conversación]
    GetConv -->|Sí| LoadConv[Cargar Conversación]
    
    CreateConv --> GetContext[Obtener Contexto]
    LoadConv --> GetContext
    
    GetContext --> CheckStep{¿Paso Actual?}
    
    CheckStep -->|Inicio| SendWelcome[Enviar Bienvenida]
    SendWelcome --> AskVertical[Preguntar Vertical]
    AskVertical --> SaveContext1[Guardar Contexto]
    
    CheckStep -->|Vertical| ParseVertical[Parsear Respuesta]
    ParseVertical --> ValidVertical{¿Válido?}
    ValidVertical -->|No| AskVerticalAgain[Solicitar de Nuevo]
    ValidVertical -->|Sí| AskCustomer[Solicitar Datos Cliente]
    AskVerticalAgain --> SaveContext1
    AskCustomer --> SaveContext1
    
    CheckStep -->|Cliente| ParseCustomer[Parsear Datos]
    ParseCustomer --> ValidCustomer{¿Válidos?}
    ValidCustomer -->|No| AskCustomerAgain[Solicitar de Nuevo]
    ValidCustomer -->|Sí| AskProperty[Solicitar Datos Propiedad]
    AskCustomerAgain --> SaveContext1
    AskProperty --> SaveContext1
    
    CheckStep -->|Propiedad| StartRooms[Iniciar Habitaciones]
    StartRooms --> AskRoom[Preguntar Habitación]
    AskRoom --> SaveContext1
    
    CheckStep -->|Habitación| ParseRoom[Parsear Habitación]
    ParseRoom --> AskOpenings[Preguntar Aberturas]
    AskOpenings --> SaveContext1
    
    CheckStep -->|Aberturas| ParseOpenings[Parsear Aberturas]
    ParseOpenings --> MoreRooms{¿Más Habitaciones?}
    MoreRooms -->|Sí| AskRoom
    MoreRooms -->|No| Calculate[Calcular Cotización]
    
    Calculate --> SendQuote[Enviar Cotización]
    SendQuote --> SendPDF[Enviar PDF]
    SendPDF --> AskConfirm[Preguntar Confirmación]
    AskConfirm --> SaveContext1
    
    CheckStep -->|Confirmación| ParseConfirm[Parsear Respuesta]
    ParseConfirm --> CheckConfirm{¿Confirma?}
    CheckConfirm -->|Sí| ConfirmQuote[Confirmar Cotización]
    CheckConfirm -->|No| ThankYou[Agradecer]
    
    ConfirmQuote --> SendConfirmation[Enviar Confirmación]
    SendConfirmation --> CompleteConv[Completar Conversación]
    ThankYou --> CompleteConv
    
    SaveContext1 --> End([Fin])
    CompleteConv --> End
```

---

## 3. Diagramas de Secuencia

### Secuencia: Crear y Confirmar Cotización

```mermaid
sequenceDiagram
    actor U as Usuario
    participant F as Frontend
    participant API as Backend API
    participant CALC as Calculator Service
    participant DB as PostgreSQL
    participant CACHE as Redis
    participant WA as WhatsApp Service
    participant EMAIL as Email Service
    
    U->>F: Completa formulario
    F->>F: Valida datos localmente
    F->>API: POST /quotations/residential
    
    API->>API: Valida JWT
    API->>API: Valida request (Pydantic)
    API->>DB: Buscar/Crear Customer
    DB-->>API: Customer ID
    
    API->>DB: Crear Quotation (draft)
    DB-->>API: Quotation ID
    
    API->>DB: Crear Property
    API->>DB: Crear Rooms
    API->>DB: Crear Openings
    
    API->>CACHE: Obtener productos (cache)
    alt Cache Hit
        CACHE-->>API: Productos
    else Cache Miss
        API->>DB: Query productos
        DB-->>API: Productos
        API->>CACHE: Guardar en cache
    end
    
    API->>CALC: calculate_quotation(openings, products)
    
    CALC->>CALC: Loop sobre items
    CALC->>CALC: Calcular áreas
    CALC->>CALC: Aplicar desperdicios
    CALC->>CALC: Calcular complejidad
    CALC->>CALC: Calcular costos
    CALC->>CALC: Aplicar descuentos
    CALC->>CALC: Calcular impuestos
    
    CALC-->>API: QuotationResult
    
    API->>DB: Crear QuotationItems
    API->>DB: Actualizar Quotation totales
    
    API-->>F: Quotation JSON
    F-->>U: Muestra preview
    
    U->>F: Confirma cotización
    F->>API: POST /quotations/{id}/confirm
    
    API->>DB: Actualizar status -> confirmed
    API->>DB: Set confirmed_at timestamp
    
    par Notificaciones paralelas
        API->>EMAIL: send_quotation_email()
        EMAIL-->>U: Email con PDF
    and
        API->>WA: send_quotation_whatsapp()
        WA-->>U: WhatsApp con PDF
    end
    
    API-->>F: Confirmación exitosa
    F-->>U: Muestra mensaje de éxito
```

### Secuencia: Conversación WhatsApp

```mermaid
sequenceDiagram
    actor U as Usuario
    participant WA as WhatsApp Business
    participant HOOK as Webhook Handler
    participant CONV as Conversation Service
    participant STATE as State Machine
    participant DB as Database
    participant CALC as Calculator
    
    U->>WA: Envía "Hola"
    WA->>HOOK: POST /webhooks/whatsapp
    
    HOOK->>CONV: handle_incoming_message(data)
    CONV->>DB: Buscar conversación activa
    
    alt No existe conversación
        DB-->>CONV: null
        CONV->>DB: Crear nueva conversación
        DB-->>CONV: conversation_id
        CONV->>STATE: Inicializar contexto
    else Existe conversación
        DB-->>CONV: Conversation data
        CONV->>STATE: Cargar contexto
    end
    
    STATE->>STATE: Determinar paso actual
    
    alt Paso: Inicio
        STATE->>CONV: "Bienvenida + Opciones"
        CONV->>WA: Enviar mensaje
        WA-->>U: "¡Hola! ¿Automotriz, Residencial o Comercial?"
        
        U->>WA: "Residencial"
        WA->>HOOK: POST /webhooks/whatsapp
        HOOK->>CONV: handle_incoming_message()
        CONV->>STATE: process_vertical_selection("residencial")
        STATE->>DB: Actualizar contexto
        STATE->>CONV: "Solicitar datos cliente"
        CONV->>WA: Enviar mensaje
        WA-->>U: "¿Cuál es tu nombre?"
        
    else Paso: Datos Cliente
        U->>WA: "Juan Pérez"
        WA->>HOOK: POST /webhooks/whatsapp
        CONV->>STATE: process_customer_data()
        STATE->>STATE: Validar datos
        STATE->>DB: Guardar customer
        STATE->>CONV: "Solicitar dirección"
        CONV->>WA: Enviar mensaje
        WA-->>U: "¿Cuál es la dirección?"
        
    else Paso: Habitaciones
        U->>WA: "2 habitaciones"
        WA->>HOOK: POST /webhooks/whatsapp
        CONV->>STATE: process_room_count()
        STATE->>CONV: "Solicitar detalles habitación 1"
        CONV->>WA: Enviar mensaje
        WA-->>U: "Habitación 1: ¿tipo y cuántas ventanas?"
        
    else Paso: Cálculo
        CONV->>CALC: calculate_quotation()
        CALC-->>CONV: QuotationResult
        CONV->>DB: Guardar cotización
        CONV->>WA: Enviar resumen
        WA-->>U: "Total: $2,178 - ¿Confirmas?"
        
        U->>WA: "Sí"
        WA->>HOOK: POST /webhooks/whatsapp
        CONV->>DB: Confirmar cotización
        CONV->>WA: Enviar PDF
        WA-->>U: [PDF Adjunto]
    end
```

---

## 4. User Journeys

### Journey 1: Cliente Residencial - Cotización Exitosa

**Personaje**: María, dueña de casa que quiere instalar films de control solar

**Contexto**: María tiene una casa de 2 pisos con muchas ventanas y recibe mucho sol. Quiere reducir el calor y ahorrar en aire acondicionado.

**Journey Map**:

```
ETAPA 1: DESCUBRIMIENTO
━━━━━━━━━━━━━━━━━━━━━━
Acción: Busca en Google "films solares para ventanas"
Emoción: 😊 Curiosa, esperanzada
Touchpoint: Anuncio Google Ads
Pensamiento: "¿Realmente funcionan estos films?"

ETAPA 2: CONSIDERACIÓN
━━━━━━━━━━━━━━━━━━━━━━
Acción: Ingresa al sitio web, lee información
Emoción: 🤔 Interesada pero cautelosa
Touchpoint: Landing page del sitio
Pensamiento: "Necesito saber cuánto me costaría"

ETAPA 3: COTIZACIÓN
━━━━━━━━━━━━━━━━━━━━━━
Acción: Hace clic en "Cotizar Ahora"
Emoción: 😃 Emocionada
Touchpoint: Formulario web

Paso 1: Selecciona "Residencial"
  - Pensamiento: "Perfecto, es para mi casa"
  - Tiempo: 5 segundos

Paso 2: Completa sus datos
  - Nombre: María González
  - Email: maria@email.com
  - Teléfono: +54 11 1234-5678
  - Pensamiento: "Espero que no me llenen de spam"
  - Tiempo: 1 minuto

Paso 3: Datos de la propiedad
  - Tipo: Casa
  - Dirección: Av. del Libertador 1234
  - Pisos: 2
  - Pensamiento: "Fácil, solo piden lo básico"
  - Tiempo: 30 segundos

Paso 4: Agrega habitaciones
  - Sala Principal (Planta Baja):
    * 2 ventanas 2m x 1.5m → Film Control Solar
    * 1 puerta corrediza 2.5m x 2.2m → Film Control Solar
  - Dormitorio Principal (Planta Alta):
    * 2 ventanas 1.5m x 1.2m → Film Control Solar
  - Dormitorio 2 (Planta Alta):
    * 2 ventanas 1.5m x 1.2m → Film Control Solar
  - Pensamiento: "¡Qué fácil! Me muestra el área en tiempo real"
  - Emoción: 😍 Encantada
  - Tiempo: 5 minutos

Paso 5: Ve el preview
  - Área total: 19.10 m²
  - Material: $1,719.00
  - Instalación: $458.00
  - Subtotal: $2,177.00
  - Impuestos: $457.00
  - TOTAL: $2,634.00
  - Pensamiento: "Es más barato de lo que esperaba"
  - Emoción: 😊 Satisfecha
  - Tiempo: 2 minutos

ETAPA 4: DECISIÓN
━━━━━━━━━━━━━━━━━━━━━━
Acción: Hace clic en "Enviar por WhatsApp"
Emoción: 😌 Confiada
Touchpoint: WhatsApp
Resultado: Recibe PDF con cotización detallada
Pensamiento: "Perfecto, lo puedo compartir con mi esposo"

ETAPA 5: POST-COTIZACIÓN
━━━━━━━━━━━━━━━━━━━━━━
Acción: Conversa con su esposo, deciden confirmar
Emoción: 😄 Entusiasmada
Touchpoint: WhatsApp
Acción: Responde "Sí, confirmo" por WhatsApp
Resultado: Recibe confirmación y próximos pasos

ETAPA 6: SATISFACCIÓN
━━━━━━━━━━━━━━━━━━━━━━
Resultado: Films instalados en 1 semana
Emoción: 😍 Muy satisfecha
NPS: 10/10
Pensamiento: "¡La casa está mucho más fresca! Lo recomendaré"
```

**Pain Points Identificados**:
- ✅ RESUELTO: No sabía cuánto costaría → Cotización instantánea
- ✅ RESUELTO: Proceso complicado → Formulario intuitivo paso a paso
- ✅ RESUELTO: No podía compartir → Envío por WhatsApp
- ✅ RESUELTO: Dudas sobre productos → Descripciones claras en cada paso

**Moments of Delight**:
- Ver el área calculada en tiempo real
- Recibir cotización profesional por WhatsApp
- Proceso completo en menos de 10 minutos

---

### Journey 2: Gerente de Oficina - Cotización Comercial

**Personaje**: Roberto, gerente de facilities de empresa con 3 pisos de oficinas

**Contexto**: Edificio corporativo con fachada de vidrio. Altos costos de aire acondicionado. Necesita cotización para justificar presupuesto.

**Journey Map**:

```
ETAPA 1: NECESIDAD
━━━━━━━━━━━━━━━━━━━━━━
Contexto: Recibe queja del CFO por altos costos de energía
Acción: Busca soluciones para reducir calor
Emoción: 😰 Preocupado
Touchpoint: Recomendación de colega

ETAPA 2: INVESTIGACIÓN
━━━━━━━━━━━━━━━━━━━━━━
Acción: Visita sitio web, lee caso de estudio
Emoción: 🤔 Analítico
Touchpoint: Página de casos de éxito
Pensamiento: "Necesito números concretos para el CFO"

ETAPA 3: COTIZACIÓN COMERCIAL
━━━━━━━━━━━━━━━━━━━━━━
Acción: Selecciona "Comercial - Edificio"
Emoción: 💼 Profesional

Paso 1-2: Datos de contacto corporativo
  - Empresa: Tech Solutions SA
  - CUIT: 30-12345678-9

Paso 3: Datos del edificio
  - Tipo: Edificio
  - Dirección: Av. Córdoba 5678
  - Pisos: 3
  - Pensamiento: "Necesito detallar todo piso"
  
Paso 4: Áreas detalladas
  PISO 1 - Lobby y Recepción:
    - Fachada vidrio: 8m x 3m → Control Solar Ceramic 70%
    - División recepción: 4m x 2.5m → Privacy
  
  PISO 2 - Oficinas:
    - 8 ventanas 2m x 1.5m → Control Solar
    - 4 divisiones 3m x 2.2m → Esmerilado
    - 2 salas reunión fachada: 6m x 2.8m → Control Solar
  
  PISO 3 - Oficinas:
    - (Similar a piso 2)
    
  Tiempo invertido: 15 minutos
  Pensamiento: "Detallado pero necesario"

Paso 5: Cotización
  - Área total: 187.30 m²
  - Subtotal: $19,864.00
  - Descuento 15% (>100m²): -$2,979.60
  - TOTAL: $20,438.50
  - Emoción: 😃 Satisfecho
  - Pensamiento: "Descuento considerable, buen ROI"

ETAPA 4: VALIDACIÓN
━━━━━━━━━━━━━━━━━━━━━━
Acción: Descarga PDF, presenta al CFO
Touchpoint: PDF profesional con desglose
CFO: "Interesante, pero necesito ver comparativas"

ETAPA 5: NEGOCIACIÓN
━━━━━━━━━━━━━━━━━━━━━━
Acción: Contacta por WhatsApp para solicitar:
  - Análisis de ROI (ahorro energético)
  - Referencias de clientes similares
  - Opciones de pago
Touchpoint: WhatsApp Business
Resultado: Recibe información adicional en 24hs

ETAPA 6: APROBACIÓN
━━━━━━━━━━━━━━━━━━━━━━
CFO aprueba presupuesto
Roberto confirma por WhatsApp
Emoción: 😌 Aliviado
Pensamiento: "Proceso profesional, información clara"
```

**Insights**:
- Cotizaciones comerciales requieren más detalle y profesionalismo
- Necesitan justificar ROI para aprobaciones internas
- Valoran descuentos por volumen
- Prefieren comunicación por canales corporativos (email + WhatsApp)

---

### Journey 3: Cliente Automotriz - Vía WhatsApp

**Personaje**: Carlos, dueño de BMW X5 nuevo

**Contexto**: Compró vehículo hace 1 mes. Vive en zona muy soleada. Quiere proteger el interior y reducir calor.

**Journey Map**:

```
ETAPA 1: CONTACTO INICIAL
━━━━━━━━━━━━━━━━━━━━━━
Vio: Número de WhatsApp en Instagram
Acción: Envía mensaje: "Hola, info sobre laminado"
Tiempo: 10:30 AM

Bot responde:
"¡Hola! 👋 Soy el asistente de [Empresa]
¿Para qué necesitas el laminado?
1️⃣ Mi vehículo
2️⃣ Mi hogar
3️⃣ Mi oficina/negocio"

Carlos: "1"
Emoción: 😊 Cómodo (canal familiar)

ETAPA 2: DATOS DEL VEHÍCULO
━━━━━━━━━━━━━━━━━━━━━━
Bot: "¿Qué vehículo tienes?"
Carlos: "BMW X5 2024"

Bot: "¿Tienes el VIN a mano?"
Carlos: "No, ¿es necesario?"

Bot: "No te preocupes. ¿Qué vidrios quieres laminar?
- Solo laterales
- Laterales + trasero
- Todos (incluyendo parabrisas)
- Techo panorámico"

Carlos: "Laterales y trasero"

Bot: "¿Qué tipo de laminado prefieres?
🛡️ Seguridad (protección anti-robo)
☀️ Control Solar (reduce calor)
🔒 Privacidad (oscurecido)"

Carlos: "Control solar"

Bot: "¿Qué nivel de oscuridad?
- 5% (muy oscuro, máximo rechazo)
- 20% (oscuro, buen balance)
- 35% (medio, visible desde fuera)"

Carlos: "20%"

ETAPA 3: COTIZACIÓN
━━━━━━━━━━━━━━━━━━━━━━
Bot: "Un momento, estoy calculando... ⏳"

Bot: "✅ Cotización lista!

BMW X5 2024
Control Solar 20%
Cobertura: Laterales + Trasero

📊 Resumen:
- Área estimada: 3.8 m²
- Material Premium: $380.00
- Instalación especializada: $120.00
- TOTAL: $605.00

✨ Incluye:
- Garantía 5 años
- Instalación en 2 horas
- No afecta vidrios/sensores

¿Te interesa?"

Carlos: "Sí! ¿Cuándo pueden?"
Emoción: 😍 Entusiasmado
Tiempo total del chat: 5 minutos

ETAPA 4: AGENDAMIENTO
━━━━━━━━━━━━━━━━━━━━━━
Bot: "Disponibilidad esta semana:
- Martes 15/11 - 10:00 AM
- Miércoles 16/11 - 2:00 PM
- Jueves 17/11 - 10:00 AM"

Carlos: "Miércoles 2pm"

Bot: "Perfecto! Te esperamos:
📅 Miércoles 16/11 - 2:00 PM
📍 [Dirección del taller]
🚗 BMW X5 2024

Te envío la cotización por email para tus registros.
¿Confirmas tu email?"

Carlos: "carlos@email.com"

Bot: "✅ Listo! Te enviamos:
📧 Email con cotización
📄 PDF adjunto

Te recordaré 24hs antes de tu cita.
¿Alguna pregunta?"

Carlos: "No, gracias!"

ETAPA 5: RECORDATORIO
━━━━━━━━━━━━━━━━━━━━━━
[Martes 15/11 - 2:00 PM]
Bot: "Hola Carlos! 👋
Recordatorio: Mañana a las 2:00 PM
tenemos tu instalación programada.
¿Confirmas tu asistencia?"

Carlos: "Sí!"

ETAPA 6: SATISFACCIÓN
━━━━━━━━━━━━━━━━━━━━━━
[Después de la instalación]
Bot: "¿Cómo estuvo tu experiencia?
⭐⭐⭐⭐⭐ (1-5)"

Carlos: "⭐⭐⭐⭐⭐"

Bot: "¡Gracias! Nos alegra que
estés satisfecho. Recuerda que
tienes garantía de 5 años."

Carlos: "Súper recomendable!"
```

**Ventajas del Canal WhatsApp**:
- ✅ Inmediatez (respuestas en segundos)
- ✅ Familiaridad del canal
- ✅ Conversación natural
- ✅ Agendamiento integrado
- ✅ Recordatorios automáticos
- ✅ Seguimiento post-venta

---

## 5. Métricas de Éxito

### KPIs por Journey

| Métrica | Residencial | Comercial | Automotriz (WA) |
|---------|-------------|-----------|-----------------|
| **Tiempo promedio** | 10 min | 15-20 min | 5 min |
| **Tasa de completación** | >80% | >70% | >90% |
| **Tasa de conversión** | >60% | >40% | >75% |
| **NPS** | >8 | >7 | >9 |
| **Retorno** | 65% confirma | 45% confirma | 80% confirma |

### Puntos de Abandono Comunes

1. **Paso 4 (Aberturas)**: 15% abandono
   - Razón: Tedioso ingresar muchas aberturas
   - Solución: Permitir duplicar aberturas similares

2. **Paso 5 (Preview)**: 10% abandono
   - Razón: Precio superior a expectativa
   - Solución: Mostrar rango de precio estimado antes

3. **WhatsApp - Datos VIN**: 5% abandono
   - Razón: No tienen VIN a mano
   - Solución: Opción de continuar sin VIN

---

## 6. Mejoras Futuras

### Basadas en Journeys

1. **Calculadora Rápida**: Widget en homepage para estimación instantánea
2. **Fotos de Referencia**: Permitir subir fotos de ventanas para auto-medición
3. **Realidad Aumentada**: App móvil para visualizar films en ventanas
4. **Comparador de Productos**: Tabla comparativa de tipos de films
5. **Chat con Vendedor**: Opción de hablar con humano en cualquier paso
6. **Guardado de Progreso**: Volver más tarde sin perder datos
7. **Plantillas**: Guardar configuraciones frecuentes (ej: "Casa tipo X")

---

**Fin del documento**
