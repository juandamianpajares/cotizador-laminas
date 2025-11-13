/**
 * Plantillas de vidrios por tipo de vehículo
 * Cada tipo de vehículo tiene vidrios predefinidos con sus características
 */

export interface VehicleWindowTemplate {
  id: string;
  nombre: string;
  descripcion?: string;
  tipo: 'parabrisas' | 'lateral_delantero' | 'lateral_trasero' | 'luneta' | 'techo' | 'triangulo';
  curvo: boolean;
  area_aproximada: number; // m²
  obligatorio: boolean; // Si es obligatorio incluirlo
  permite_oscurecimiento: boolean; // Si permite lámina de privacidad
}

export interface VehicleTypeTemplate {
  tipo: string;
  descripcion: string;
  vidrios: VehicleWindowTemplate[];
}

/**
 * Plantillas de vidrios por tipo de vehículo
 */
export const VEHICLE_TEMPLATES: VehicleTypeTemplate[] = [
  {
    tipo: 'sedan',
    descripcion: 'Sedán 4 puertas',
    vidrios: [
      {
        id: 'parabrisas',
        nombre: 'Parabrisas',
        descripcion: 'Vidrio delantero',
        tipo: 'parabrisas',
        curvo: true,
        area_aproximada: 1.5,
        obligatorio: false,
        permite_oscurecimiento: false, // No se puede oscurecer por ley
      },
      {
        id: 'lateral_izq_del',
        nombre: 'Lateral Izquierdo Delantero',
        tipo: 'lateral_delantero',
        curvo: false,
        area_aproximada: 0.6,
        obligatorio: true,
        permite_oscurecimiento: true,
      },
      {
        id: 'lateral_der_del',
        nombre: 'Lateral Derecho Delantero',
        tipo: 'lateral_delantero',
        curvo: false,
        area_aproximada: 0.6,
        obligatorio: true,
        permite_oscurecimiento: true,
      },
      {
        id: 'lateral_izq_tras',
        nombre: 'Lateral Izquierdo Trasero',
        tipo: 'lateral_trasero',
        curvo: false,
        area_aproximada: 0.5,
        obligatorio: true,
        permite_oscurecimiento: true,
      },
      {
        id: 'lateral_der_tras',
        nombre: 'Lateral Derecho Trasero',
        tipo: 'lateral_trasero',
        curvo: false,
        area_aproximada: 0.5,
        obligatorio: true,
        permite_oscurecimiento: true,
      },
      {
        id: 'luneta',
        nombre: 'Luneta Trasera',
        descripcion: 'Vidrio trasero',
        tipo: 'luneta',
        curvo: true,
        area_aproximada: 1.2,
        obligatorio: true,
        permite_oscurecimiento: true,
      },
    ],
  },
  {
    tipo: 'suv',
    descripcion: 'SUV / Camioneta',
    vidrios: [
      {
        id: 'parabrisas',
        nombre: 'Parabrisas',
        tipo: 'parabrisas',
        curvo: true,
        area_aproximada: 1.8,
        obligatorio: false,
        permite_oscurecimiento: false,
      },
      {
        id: 'lateral_izq_del',
        nombre: 'Lateral Izquierdo Delantero',
        tipo: 'lateral_delantero',
        curvo: false,
        area_aproximada: 0.7,
        obligatorio: true,
        permite_oscurecimiento: true,
      },
      {
        id: 'lateral_der_del',
        nombre: 'Lateral Derecho Delantero',
        tipo: 'lateral_delantero',
        curvo: false,
        area_aproximada: 0.7,
        obligatorio: true,
        permite_oscurecimiento: true,
      },
      {
        id: 'lateral_izq_tras',
        nombre: 'Lateral Izquierdo Trasero',
        tipo: 'lateral_trasero',
        curvo: false,
        area_aproximada: 0.6,
        obligatorio: true,
        permite_oscurecimiento: true,
      },
      {
        id: 'lateral_der_tras',
        nombre: 'Lateral Derecho Trasero',
        tipo: 'lateral_trasero',
        curvo: false,
        area_aproximada: 0.6,
        obligatorio: true,
        permite_oscurecimiento: true,
      },
      {
        id: 'luneta',
        nombre: 'Luneta Trasera',
        tipo: 'luneta',
        curvo: true,
        area_aproximada: 1.5,
        obligatorio: true,
        permite_oscurecimiento: true,
      },
      {
        id: 'techo',
        nombre: 'Techo Panorámico',
        tipo: 'techo',
        curvo: true,
        area_aproximada: 1.2,
        obligatorio: false,
        permite_oscurecimiento: true,
      },
    ],
  },
  {
    tipo: 'coupe',
    descripcion: 'Coupé 2 puertas',
    vidrios: [
      {
        id: 'parabrisas',
        nombre: 'Parabrisas',
        tipo: 'parabrisas',
        curvo: true,
        area_aproximada: 1.4,
        obligatorio: false,
        permite_oscurecimiento: false,
      },
      {
        id: 'lateral_izq_del',
        nombre: 'Lateral Izquierdo',
        tipo: 'lateral_delantero',
        curvo: false,
        area_aproximada: 0.8,
        obligatorio: true,
        permite_oscurecimiento: true,
      },
      {
        id: 'lateral_der_del',
        nombre: 'Lateral Derecho',
        tipo: 'lateral_delantero',
        curvo: false,
        area_aproximada: 0.8,
        obligatorio: true,
        permite_oscurecimiento: true,
      },
      {
        id: 'triangulo_izq',
        nombre: 'Triángulo Izquierdo',
        tipo: 'triangulo',
        curvo: false,
        area_aproximada: 0.15,
        obligatorio: false,
        permite_oscurecimiento: true,
      },
      {
        id: 'triangulo_der',
        nombre: 'Triángulo Derecho',
        tipo: 'triangulo',
        curvo: false,
        area_aproximada: 0.15,
        obligatorio: false,
        permite_oscurecimiento: true,
      },
      {
        id: 'luneta',
        nombre: 'Luneta Trasera',
        tipo: 'luneta',
        curvo: true,
        area_aproximada: 1.0,
        obligatorio: true,
        permite_oscurecimiento: true,
      },
    ],
  },
  {
    tipo: 'pickup',
    descripcion: 'Pickup / Camioneta',
    vidrios: [
      {
        id: 'parabrisas',
        nombre: 'Parabrisas',
        tipo: 'parabrisas',
        curvo: true,
        area_aproximada: 1.6,
        obligatorio: false,
        permite_oscurecimiento: false,
      },
      {
        id: 'lateral_izq_del',
        nombre: 'Lateral Izquierdo Delantero',
        tipo: 'lateral_delantero',
        curvo: false,
        area_aproximada: 0.7,
        obligatorio: true,
        permite_oscurecimiento: true,
      },
      {
        id: 'lateral_der_del',
        nombre: 'Lateral Derecho Delantero',
        tipo: 'lateral_delantero',
        curvo: false,
        area_aproximada: 0.7,
        obligatorio: true,
        permite_oscurecimiento: true,
      },
      {
        id: 'luneta',
        nombre: 'Luneta Trasera',
        tipo: 'luneta',
        curvo: true,
        area_aproximada: 1.3,
        obligatorio: true,
        permite_oscurecimiento: true,
      },
    ],
  },
];

/**
 * Obtiene la plantilla de vidrios para un tipo de vehículo
 */
export function getVehicleTemplate(tipo: string): VehicleTypeTemplate | undefined {
  return VEHICLE_TEMPLATES.find(t => t.tipo === tipo);
}

/**
 * Obtiene solo los vidrios obligatorios de una plantilla
 */
export function getObligatoryWindows(tipo: string): VehicleWindowTemplate[] {
  const template = getVehicleTemplate(tipo);
  return template?.vidrios.filter(v => v.obligatorio) || [];
}

/**
 * Obtiene todos los vidrios (obligatorios + opcionales)
 */
export function getAllWindows(tipo: string): VehicleWindowTemplate[] {
  const template = getVehicleTemplate(tipo);
  return template?.vidrios || [];
}

/**
 * Calcula el área total de vidrios seleccionados
 */
export function calculateTotalArea(windowIds: string[], tipo: string): number {
  const template = getVehicleTemplate(tipo);
  if (!template) return 0;

  return template.vidrios
    .filter(v => windowIds.includes(v.id))
    .reduce((sum, v) => sum + v.area_aproximada, 0);
}

/**
 * Verifica si un vidrio permite oscurecimiento
 */
export function allowsTinting(windowId: string, tipo: string): boolean {
  const template = getVehicleTemplate(tipo);
  if (!template) return false;

  const window = template.vidrios.find(v => v.id === windowId);
  return window?.permite_oscurecimiento || false;
}
