# Integración con API de Vehículos

## Descripción

Este documento explica cómo integrar el cotizador de láminas con la aplicación de vehículos existente que corre en localhost.

## Configuración

### 1. Variables de Entorno

Agregar al archivo `.env.local`:

```bash
# URL de la API de vehículos (ajustar según tu configuración)
NEXT_PUBLIC_VEHICLE_API_URL=http://localhost:5000
```

### 2. Endpoints Esperados de la API de Vehículos

La aplicación de vehículos debe exponer los siguientes endpoints:

#### GET `/api/marcas`
Retorna lista de marcas disponibles.

**Respuesta:**
```json
["Toyota", "Ford", "Chevrolet", "Volkswagen", ...]
```

#### GET `/api/modelos?marca={marca}`
Retorna modelos para una marca específica.

**Respuesta:**
```json
["Corolla", "Camry", "RAV4", ...]
```

#### GET `/api/vehiculo?marca={marca}&modelo={modelo}&año={año}`
Retorna datos completos del vehículo incluyendo imagen y vidrios.

**Respuesta:**
```json
{
  "id": "toyota-corolla-2020",
  "marca": "Toyota",
  "modelo": "Corolla",
  "año": "2020",
  "imageUrl": "http://localhost:5000/images/toyota-corolla-2020.jpg",
  "vidrios": [
    {
      "id": "parabrisas",
      "nombre": "Parabrisas",
      "tipo": "parabrisas",
      "area": 1.5,
      "curvo": true
    },
    {
      "id": "lateral-izq-delantero",
      "nombre": "Lateral Izquierdo Delantero",
      "tipo": "lateral",
      "area": 0.6,
      "curvo": false
    },
    ...
  ]
}
```

#### POST `/api/generar-imagen`
Genera una imagen del vehículo con el tono de lámina aplicado.

**Request:**
```json
{
  "vehicleId": "toyota-corolla-2020",
  "tintLevel": 35,
  "windows": ["lateral-izq-delantero", "lateral-der-delantero"]
}
```

**Respuesta:**
```json
{
  "imageUrl": "http://localhost:5000/images/generated/toyota-corolla-2020-tinted-35.jpg"
}
```

## Implementación en el Cotizador

### Cargar Marcas y Modelos

El componente `/app/cotizar/vehiculos/page.tsx` ya está preparado para usar la API:

```typescript
import { getVehicleBrands, getVehicleModels } from '@/lib/vehicleApi';

// Cargar marcas al montar el componente
useEffect(() => {
  const loadBrands = async () => {
    const brands = await getVehicleBrands();
    setVehicleBrands(brands);
  };
  loadBrands();
}, []);
```

### Obtener Datos del Vehículo

Cuando el usuario selecciona marca y modelo:

```typescript
import { getVehicleData } from '@/lib/vehicleApi';

const handleVehicleSubmit = async (e) => {
  e.preventDefault();
  const formData = new FormData(e.currentTarget);

  const marca = formData.get('marca');
  const modelo = formData.get('modelo');
  const año = formData.get('año');

  // Obtener datos del vehículo desde la API
  const vehicleData = await getVehicleData(marca, modelo, año);

  if (vehicleData) {
    setVehicle(vehicleData);
    // Pre-cargar vidrios del vehículo
    if (vehicleData.vidrios) {
      const openings = vehicleData.vidrios.map(v => ({
        id: v.id,
        type: v.curvo ? 'automotive_curved' : 'automotive_flat',
        name: v.nombre,
        width: Math.sqrt(v.area || 1),
        height: Math.sqrt(v.area || 1),
        quantity: 1,
        productId: '',
      }));
      setOpenings(openings);
    }
  }

  setStep(3);
};
```

### Generar Vista Previa con Tono

Cuando el usuario selecciona un producto:

```typescript
import { generateTintedImage, productToVLT } from '@/lib/vehicleApi';

const updateOpening = async (id, field, value) => {
  // ... actualizar opening

  // Si cambió el producto, generar nueva imagen
  if (field === 'productId' && vehicle?.id) {
    const product = products.find(p => p.id === value);
    if (product) {
      const vlt = productToVLT(product.category);
      const windowIds = openings.map(o => o.id);
      const imageUrl = await generateTintedImage(vehicle.id, vlt, windowIds);
      if (imageUrl) {
        setVehicle({ ...vehicle, imageUrl });
      }
    }
  }
};
```

## Niveles de VLT por Categoría

- **Control Solar**: 35% VLT (tono medio)
- **Privacidad**: 5% VLT (muy oscuro)
- **Laminado Seguridad**: 70% VLT (transparente)
- **Vinílico Decorativo**: 50% VLT (tono claro)

## Testing sin API

El código ya incluye fallbacks para funcionar sin la API:

- Marcas predefinidas si la API no responde
- El usuario puede ingresar marca/modelo manualmente
- Las imágenes son opcionales

## Próximos Pasos

1. Configurar CORS en la API de vehículos para permitir requests desde Next.js
2. Implementar la carga de marcas/modelos desde la API
3. Mostrar la imagen del vehículo en el paso 2
4. Generar vista previa con tonos aplicados
5. Permitir al usuario alternar entre ver imagen original/con tono

## Ejemplo de Configuración CORS (Express)

Si la API de vehículos usa Express:

```javascript
const cors = require('cors');

app.use(cors({
  origin: 'http://localhost:3000', // URL del cotizador
  methods: ['GET', 'POST'],
  credentials: true
}));
```
