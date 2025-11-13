/**
 * Vehicle Images Configuration
 *
 * Imágenes de ejemplo para cada tipo de vehículo.
 * En producción, estas serán reemplazadas por imágenes de una API externa.
 */

export interface VehicleImage {
  tipo: 'sedan' | 'suv' | 'coupe' | 'pickup';
  imageUrl: string;
  marca?: string;
  modelo?: string;
}

// Imágenes de ejemplo usando placeholders
// En producción: reemplazar con API real de vehículos
export const VEHICLE_PLACEHOLDER_IMAGES: Record<string, string> = {
  sedan: 'https://via.placeholder.com/800x600/4A90E2/FFFFFF?text=Sed%C3%A1n',
  suv: 'https://via.placeholder.com/800x600/E74C3C/FFFFFF?text=SUV',
  coupe: 'https://via.placeholder.com/800x600/9B59B6/FFFFFF?text=Coup%C3%A9',
  pickup: 'https://via.placeholder.com/800x600/27AE60/FFFFFF?text=Pickup',
};

// Función para obtener imagen de vehículo
export function getVehicleImage(tipo: string, marca?: string, modelo?: string, año?: string): string {
  // TODO: En Sprint 8, integrar con API real de vehículos
  // const apiUrl = `${process.env.NEXT_PUBLIC_VEHICLE_API_URL}/image?marca=${marca}&modelo=${modelo}&año=${año}`;

  // Por ahora, retornar placeholder según tipo
  return VEHICLE_PLACEHOLDER_IMAGES[tipo] || VEHICLE_PLACEHOLDER_IMAGES.sedan;
}

// Imágenes locales de ejemplo (futuro)
export const LOCAL_VEHICLE_IMAGES: Record<string, string> = {
  'toyota-corolla-2020': '/images/vehicles/sedan-example.jpg',
  'ford-ranger-2022': '/images/vehicles/pickup-example.jpg',
  'honda-crv-2021': '/images/vehicles/suv-example.jpg',
  'mazda-mx5-2019': '/images/vehicles/coupe-example.jpg',
};

// Función helper para generar clave de imagen local
export function getLocalImageKey(marca: string, modelo: string, año: string): string {
  return `${marca.toLowerCase()}-${modelo.toLowerCase().replace(/\s+/g, '')}-${año}`;
}

// Función para obtener imagen (primero intenta local, luego placeholder)
export function getVehicleImageUrl(
  tipo: string,
  marca?: string,
  modelo?: string,
  año?: string
): string {
  // Intentar primero con imagen local específica
  if (marca && modelo && año) {
    const localKey = getLocalImageKey(marca, modelo, año);
    if (LOCAL_VEHICLE_IMAGES[localKey]) {
      return LOCAL_VEHICLE_IMAGES[localKey];
    }
  }

  // Si no hay imagen local, usar placeholder
  return getVehicleImage(tipo, marca, modelo, año);
}
