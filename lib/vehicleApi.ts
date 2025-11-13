/**
 * API Client para integración con la aplicación de vehículos
 * Conecta con localhost para obtener datos de vehículos e imágenes
 */

// Configuración de la API de vehículos
const VEHICLE_API_BASE_URL = process.env.NEXT_PUBLIC_VEHICLE_API_URL || 'http://localhost:5000';

export interface VehicleData {
  id: string;
  marca: string;
  modelo: string;
  año?: string;
  imageUrl?: string;
  vidrios?: VehicleWindow[];
}

export interface VehicleWindow {
  id: string;
  nombre: string;
  tipo: 'parabrisas' | 'lateral' | 'trasero' | 'techo';
  area?: number;
  curvo: boolean;
}

/**
 * Obtiene la lista de marcas disponibles
 */
export async function getVehicleBrands(): Promise<string[]> {
  try {
    const response = await fetch(`${VEHICLE_API_BASE_URL}/api/marcas`);
    if (!response.ok) throw new Error('Error al obtener marcas');
    return await response.json();
  } catch (error) {
    console.error('Error fetching brands:', error);
    // Retornar marcas por defecto si falla
    return ['Toyota', 'Ford', 'Chevrolet', 'Volkswagen', 'Fiat', 'Renault', 'Peugeot', 'Honda', 'Nissan'];
  }
}

/**
 * Obtiene los modelos de una marca específica
 */
export async function getVehicleModels(marca: string): Promise<string[]> {
  try {
    const response = await fetch(`${VEHICLE_API_BASE_URL}/api/modelos?marca=${encodeURIComponent(marca)}`);
    if (!response.ok) throw new Error('Error al obtener modelos');
    return await response.json();
  } catch (error) {
    console.error('Error fetching models:', error);
    return [];
  }
}

/**
 * Obtiene información detallada de un vehículo
 */
export async function getVehicleData(marca: string, modelo: string, año?: string): Promise<VehicleData | null> {
  try {
    const params = new URLSearchParams({
      marca,
      modelo,
      ...(año && { año }),
    });

    const response = await fetch(`${VEHICLE_API_BASE_URL}/api/vehiculo?${params}`);
    if (!response.ok) throw new Error('Error al obtener datos del vehículo');
    return await response.json();
  } catch (error) {
    console.error('Error fetching vehicle data:', error);
    return null;
  }
}

/**
 * Genera una imagen del vehículo con el tono de lámina aplicado
 * @param vehicleId ID del vehículo
 * @param tintLevel Nivel de oscurecimiento (5, 20, 35, 50, 70)
 * @param windows Array de IDs de ventanas a aplicar el tono
 */
export async function generateTintedImage(
  vehicleId: string,
  tintLevel: number,
  windows: string[]
): Promise<string | null> {
  try {
    const response = await fetch(`${VEHICLE_API_BASE_URL}/api/generar-imagen`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        vehicleId,
        tintLevel,
        windows,
      }),
    });

    if (!response.ok) throw new Error('Error al generar imagen');

    const data = await response.json();
    return data.imageUrl;
  } catch (error) {
    console.error('Error generating tinted image:', error);
    return null;
  }
}

/**
 * Mapea el tipo de producto a nivel de VLT (Visible Light Transmission)
 */
export function productToVLT(productCategory: string): number {
  const vltMap: Record<string, number> = {
    'SOLAR_CONTROL': 35, // 35% VLT típico para control solar
    'PRIVACY': 5,        // 5% VLT para privacidad
    'LAMINATE_SECURITY': 70, // 70% VLT transparente
    'VINYL_DECORATIVE': 50,  // 50% VLT decorativo
  };

  return vltMap[productCategory] || 50;
}
