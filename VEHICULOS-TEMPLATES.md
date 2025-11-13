# Sistema de Plantillas de Vidrios para Vehículos

## Descripción

El sistema de plantillas de vidrios permite pre-cargar automáticamente los vidrios típicos de un vehículo según su tipo (sedán, SUV, coupé, pickup), simplificando el proceso de cotización y asegurando que no se omitan vidrios importantes.

## Características Principales

### 1. Tipos de Vehículos Predefinidos

- **Sedán 4 puertas**: 6 vidrios (parabrisas, 4 laterales, luneta)
- **SUV / Camioneta**: 7 vidrios (incluye techo panorámico opcional)
- **Coupé 2 puertas**: 6 vidrios (incluye triángulos laterales)
- **Pickup**: 4 vidrios (parabrisas, 2 laterales delanteros, luneta)

### 2. Información de cada Vidrio

Cada vidrio en la plantilla incluye:

- **Nombre**: Descripción del vidrio (ej: "Parabrisas", "Lateral Izquierdo Delantero")
- **Tipo**: parabrisas, lateral_delantero, lateral_trasero, luneta, techo, triangulo
- **Curvo**: Si el vidrio es curvo o plano (afecta el precio de instalación)
- **Área Aproximada**: Área típica en m² para referencia
- **Obligatorio**: Si el vidrio debe incluirse siempre (no se puede quitar)
- **Permite Oscurecimiento**: Restricción legal - parabrisas NO permite oscurecimiento

### 3. Restricciones Legales Automáticas

El sistema implementa restricciones legales de forma automática:

- **Parabrisas**: NO permite láminas de privacidad (oscurecimiento)
  - Solo se pueden seleccionar productos de Control Solar, Seguridad o Decorativos
  - Los productos de Privacidad están filtrados automáticamente
- **Otros vidrios**: Permiten todos los tipos de láminas

### 4. Vidrios Obligatorios vs Opcionales

- **Obligatorios**: Se pre-cargan automáticamente y NO se pueden quitar
  - Ejemplo: Laterales, luneta
  - Badge verde "Obligatorio" en la interfaz
- **Opcionales**: Se pueden agregar desde el panel "Vidrios Opcionales Disponibles"
  - Ejemplo: Techo panorámico en SUV, triángulos en coupé
  - Aparecen como botones para agregar
  - Se pueden quitar después de agregarlos

## Flujo de Uso

### Paso 1: Seleccionar Tipo de Vehículo

En el formulario de vehículo (Step 2), el usuario selecciona:

1. **Tipo de Vehículo** (Sedán, SUV, Coupé, Pickup) - **REQUERIDO**
2. Marca (Toyota, Ford, etc.)
3. Modelo (Corolla, Focus, etc.)
4. Año (opcional)

### Paso 2: Vidrios Pre-cargados

Al avanzar al Step 3, el sistema automáticamente:

1. Carga todos los vidrios **obligatorios** del tipo de vehículo
2. Calcula dimensiones aproximadas (√área para ancho y alto)
3. Marca cada vidrio con su tipo (curvo/plano)
4. Aplica restricciones de oscurecimiento

### Paso 3: Agregar Opcionales

El usuario puede:

1. Ver los **vidrios opcionales disponibles** en un panel azul
2. Hacer clic en botones para agregar vidrios opcionales
3. Cada vidrio opcional agregado se quita de la lista de disponibles
4. Los vidrios opcionales se pueden quitar con el botón "Quitar"

### Paso 4: Seleccionar Productos

Para cada vidrio:

1. Ajustar dimensiones (ancho/alto) si es necesario
2. Seleccionar el producto de lámina
   - Productos filtrados según restricciones (parabrisas sin privacidad)
3. Ver área calculada vs área típica

## Interfaz de Usuario

### Badges y Etiquetas

Cada vidrio muestra:

- **Badge Verde "Obligatorio"**: No se puede quitar
- **Badge Gris "Curvo" o "Plano"**: Tipo de vidrio
- **Badge Amarillo "⚠️ No permite oscurecimiento"**: Restricción legal (parabrisas)
- **Área calculada**: Muestra área actual vs área típica

### Panel de Opcionales

```
┌─────────────────────────────────────────────┐
│ Vidrios Opcionales Disponibles:            │
│ [+ Techo Panorámico] [+ Triángulo Izq.]   │
└─────────────────────────────────────────────┘
```

### Vidrio Individual

```
┌─────────────────────────────────────────────┐
│ Parabrisas                      [Quitar]    │ ← Solo si es opcional
│ [Obligatorio] [Curvo] [⚠️ No permite...]   │ ← Badges
│                                             │
│ Ancho: [1.22] m  Alto: [1.22] m           │
│ Producto: [Control Solar 35% - $50/m²]     │
│                                             │
│ 📏 Área: 1.49 m² (Aprox. 1.5 m² típico)   │
└─────────────────────────────────────────────┘
```

## Archivos del Sistema

### `/lib/vehicleWindows.ts`

Contiene:

- Interfaces `VehicleWindowTemplate` y `VehicleTypeTemplate`
- Array `VEHICLE_TEMPLATES` con todas las plantillas
- Funciones helper:
  - `getVehicleTemplate(tipo)`: Obtiene plantilla completa
  - `getAllWindows(tipo)`: Obtiene todos los vidrios
  - `getObligatoryWindows(tipo)`: Solo obligatorios
  - `calculateTotalArea(windowIds, tipo)`: Calcula área total
  - `allowsTinting(windowId, tipo)`: Verifica si permite oscurecimiento

### `/app/cotizar/vehiculos/page.tsx`

Funciones principales:

- `loadWindowsFromTemplate(tipoVehiculo)`: Carga vidrios obligatorios al seleccionar tipo
- `addOptionalWindow(windowTemplate)`: Agrega un vidrio opcional
- Filtrado de productos según restricciones de cada vidrio

## Ejemplo de Plantilla

```typescript
{
  tipo: 'sedan',
  descripcion: 'Sedán 4 puertas',
  vidrios: [
    {
      id: 'parabrisas',
      nombre: 'Parabrisas',
      tipo: 'parabrisas',
      curvo: true,
      area_aproximada: 1.5,
      obligatorio: false, // Se puede omitir si solo quiere laterales
      permite_oscurecimiento: false, // ⚠️ Legal restriction
    },
    {
      id: 'lateral_izq_del',
      nombre: 'Lateral Izquierdo Delantero',
      tipo: 'lateral_delantero',
      curvo: false,
      area_aproximada: 0.6,
      obligatorio: true, // Siempre incluido
      permite_oscurecimiento: true, // ✓ Puede llevar privacidad
    },
    // ... más vidrios
  ],
}
```

## Beneficios

1. **Rapidez**: Los vidrios se pre-cargan automáticamente
2. **Precisión**: Áreas aproximadas basadas en promedios reales
3. **Legal Compliance**: Restricciones automáticas de oscurecimiento
4. **Flexibilidad**: Permite ajustar dimensiones y agregar/quitar opcionales
5. **Profesional**: Presenta información clara con badges y advertencias
6. **Escalable**: Fácil agregar más tipos de vehículos o vidrios

## Próximos Pasos (Integración con API)

Cuando se integre con la API de vehículos existente:

1. La API proporcionará datos específicos del vehículo por VID
2. Se pueden sobrescribir las áreas aproximadas con medidas exactas
3. Se puede cargar la imagen del vehículo
4. Se pueden generar vistas previas con tonos aplicados

Por ahora, el sistema funciona standalone con plantillas predefinidas robustas.
