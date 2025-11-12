/**
 * QuotationForm - Formulario interactivo de cotización de films
 * Permite seleccionar vertical, agregar habitaciones, y configurar aberturas
 */
import React, { useState, useEffect } from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Building2,
  Home,
  Car,
  Plus,
  Trash2,
  Eye,
  Save,
  Send,
  DollarSign,
  Ruler,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

type VerticalType = 'automotive' | 'residential' | 'commercial' | 'architectural';
type PropertyType = 'house' | 'apartment' | 'office' | 'building' | 'retail';
type RoomType = 'living_room' | 'bedroom' | 'kitchen' | 'bathroom' | 'office' | 'meeting_room' | 'lobby' | 'other';
type OpeningType = 'window' | 'door' | 'sliding_door' | 'shower_enclosure' | 'partition' | 'skylight' | 'strip_horizontal' | 'strip_vertical';
type ProductType = 'laminate_security' | 'solar_control' | 'vinyl_decorative' | 'privacy';

interface Opening {
  id: string;
  type: OpeningType;
  name: string;
  width: number;
  height: number;
  quantity: number;
  productType: ProductType;
  productId: string;
  specifications: {
    glassType?: string;
    curved?: boolean;
    difficultAccess?: boolean;
    floor?: number;
  };
}

interface Room {
  id: string;
  name: string;
  type: RoomType;
  floor: number;
  openings: Opening[];
}

interface Property {
  type: PropertyType;
  address?: string;
  city?: string;
  floors?: number;
}

interface Customer {
  name: string;
  email: string;
  phone: string;
  whatsapp?: string;
}

// ============================================================================
// FORM SCHEMA
// ============================================================================

const customerSchema = z.object({
  name: z.string().min(3, 'Nombre debe tener al menos 3 caracteres'),
  email: z.string().email('Email inválido'),
  phone: z.string().regex(/^\+?[0-9]{10,15}$/, 'Teléfono inválido'),
  whatsapp: z.string().optional(),
});

const openingSchema = z.object({
  type: z.string(),
  name: z.string().min(1, 'Nombre requerido'),
  width: z.number().positive('Debe ser mayor a 0'),
  height: z.number().positive('Debe ser mayor a 0'),
  quantity: z.number().int().positive('Debe ser mayor a 0'),
  productType: z.string(),
  productId: z.string(),
  specifications: z.object({
    glassType: z.string().optional(),
    curved: z.boolean().optional(),
    difficultAccess: z.boolean().optional(),
    floor: z.number().optional(),
  }).optional(),
});

// ============================================================================
// CONSTANTS
// ============================================================================

const VERTICALS = [
  {
    id: 'residential' as VerticalType,
    name: 'Residencial',
    description: 'Hogares y departamentos',
    icon: Home,
    color: 'blue',
  },
  {
    id: 'commercial' as VerticalType,
    name: 'Comercial',
    description: 'Oficinas y edificios',
    icon: Building2,
    color: 'green',
  },
  {
    id: 'automotive' as VerticalType,
    name: 'Automotriz',
    description: 'Vehículos',
    icon: Car,
    color: 'red',
  },
];

const PROPERTY_TYPES: Record<string, { label: string; value: PropertyType }[]> = {
  residential: [
    { label: 'Casa', value: 'house' },
    { label: 'Departamento', value: 'apartment' },
  ],
  commercial: [
    { label: 'Oficina', value: 'office' },
    { label: 'Edificio', value: 'building' },
    { label: 'Local Comercial', value: 'retail' },
  ],
};

const ROOM_TYPES = [
  { label: 'Sala/Living', value: 'living_room' as RoomType },
  { label: 'Dormitorio', value: 'bedroom' as RoomType },
  { label: 'Cocina', value: 'kitchen' as RoomType },
  { label: 'Baño', value: 'bathroom' as RoomType },
  { label: 'Oficina', value: 'office' as RoomType },
  { label: 'Sala de Reuniones', value: 'meeting_room' as RoomType },
  { label: 'Lobby/Recepción', value: 'lobby' as RoomType },
  { label: 'Otro', value: 'other' as RoomType },
];

const OPENING_TYPES = [
  { label: 'Ventana', value: 'window' as OpeningType },
  { label: 'Puerta', value: 'door' as OpeningType },
  { label: 'Puerta Corrediza', value: 'sliding_door' as OpeningType },
  { label: 'Mampara de Baño', value: 'shower_enclosure' as OpeningType },
  { label: 'División/Partición', value: 'partition' as OpeningType },
  { label: 'Tragaluz', value: 'skylight' as OpeningType },
  { label: 'Franja Horizontal', value: 'strip_horizontal' as OpeningType },
  { label: 'Franja Vertical', value: 'strip_vertical' as OpeningType },
];

const PRODUCT_TYPES = [
  {
    label: 'Laminado de Seguridad',
    value: 'laminate_security' as ProductType,
    description: 'Protección anti-impacto y UV',
  },
  {
    label: 'Control Solar',
    value: 'solar_control' as ProductType,
    description: 'Rechazo de calor y ahorro energético',
  },
  {
    label: 'Vinílico Decorativo',
    value: 'vinyl_decorative' as ProductType,
    description: 'Esmerilado, colores, diseños',
  },
  {
    label: 'Privacidad',
    value: 'privacy' as ProductType,
    description: 'Opaco, espejado, one-way',
  },
];

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function QuotationForm() {
  // State
  const [step, setStep] = useState(1);
  const [vertical, setVertical] = useState<VerticalType | null>(null);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [property, setProperty] = useState<Property | null>(null);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [currentRoom, setCurrentRoom] = useState<Room | null>(null);
  const [quotationPreview, setQuotationPreview] = useState<any>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Form handling
  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();

  // ============================================================================
  // STEP 1: SELECT VERTICAL
  // ============================================================================

  const renderVerticalSelection = () => (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-3">
          ¿Qué tipo de cotización necesitas?
        </h2>
        <p className="text-gray-600">
          Selecciona la vertical para comenzar tu cotización
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {VERTICALS.map((v) => {
          const Icon = v.icon;
          return (
            <button
              key={v.id}
              onClick={() => {
                setVertical(v.id);
                setStep(2);
              }}
              className={`
                p-8 rounded-xl border-2 transition-all duration-200
                hover:shadow-lg hover:scale-105
                ${vertical === v.id 
                  ? 'border-blue-500 bg-blue-50 shadow-md' 
                  : 'border-gray-200 hover:border-blue-300'
                }
              `}
            >
              <Icon className={`w-16 h-16 mx-auto mb-4 text-${v.color}-500`} />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {v.name}
              </h3>
              <p className="text-sm text-gray-600">{v.description}</p>
            </button>
          );
        })}
      </div>
    </div>
  );

  // ============================================================================
  // STEP 2: CUSTOMER INFO
  // ============================================================================

  const renderCustomerForm = () => (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-xl shadow-md p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Información del Cliente
        </h2>

        <form
          onSubmit={handleSubmit((data) => {
            setCustomer(data as Customer);
            setStep(3);
          })}
          className="space-y-6"
        >
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nombre Completo *
            </label>
            <input
              type="text"
              {...register('name')}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Juan Pérez"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name.message as string}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email *
            </label>
            <input
              type="email"
              {...register('email')}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="juan@ejemplo.com"
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">{errors.email.message as string}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Teléfono *
            </label>
            <input
              type="tel"
              {...register('phone')}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="+54 11 1234-5678"
            />
            {errors.phone && (
              <p className="mt-1 text-sm text-red-600">{errors.phone.message as string}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              WhatsApp (opcional)
            </label>
            <input
              type="tel"
              {...register('whatsapp')}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="+54 11 1234-5678"
            />
          </div>

          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="flex-1 px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Atrás
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
            >
              Continuar
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  // ============================================================================
  // STEP 3: PROPERTY INFO (for residential/commercial)
  // ============================================================================

  const renderPropertyForm = () => (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-xl shadow-md p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Información de la Propiedad
        </h2>

        <form
          onSubmit={handleSubmit((data) => {
            setProperty(data as Property);
            setStep(4);
          })}
          className="space-y-6"
        >
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipo de Propiedad *
            </label>
            <select
              {...register('type')}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Seleccionar...</option>
              {vertical && PROPERTY_TYPES[vertical]?.map((pt) => (
                <option key={pt.value} value={pt.value}>
                  {pt.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Dirección
            </label>
            <input
              type="text"
              {...register('address')}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Av. Corrientes 1234"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ciudad
            </label>
            <input
              type="text"
              {...register('city')}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Buenos Aires"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Número de Pisos
            </label>
            <input
              type="number"
              {...register('floors')}
              min="1"
              max="50"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="1"
            />
          </div>

          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => setStep(2)}
              className="flex-1 px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Atrás
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
            >
              Continuar
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  // ============================================================================
  // STEP 4: ROOMS & OPENINGS
  // ============================================================================

  const addRoom = () => {
    const newRoom: Room = {
      id: `room-${Date.now()}`,
      name: '',
      type: 'living_room',
      floor: 1,
      openings: [],
    };
    setRooms([...rooms, newRoom]);
    setCurrentRoom(newRoom);
  };

  const addOpening = (roomId: string) => {
    const newOpening: Opening = {
      id: `opening-${Date.now()}`,
      type: 'window',
      name: '',
      width: 1.0,
      height: 1.5,
      quantity: 1,
      productType: 'solar_control',
      productId: '',
      specifications: {},
    };

    setRooms(rooms.map((room) => {
      if (room.id === roomId) {
        return { ...room, openings: [...room.openings, newOpening] };
      }
      return room;
    }));
  };

  const removeRoom = (roomId: string) => {
    setRooms(rooms.filter((r) => r.id !== roomId));
    if (currentRoom?.id === roomId) {
      setCurrentRoom(null);
    }
  };

  const removeOpening = (roomId: string, openingId: string) => {
    setRooms(rooms.map((room) => {
      if (room.id === roomId) {
        return {
          ...room,
          openings: room.openings.filter((o) => o.id !== openingId),
        };
      }
      return room;
    }));
  };

  const calculateQuotation = async () => {
    setIsCalculating(true);
    
    try {
      // Aquí iría la llamada al API
      const response = await fetch('/api/v1/quotations/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vertical,
          customer,
          property,
          rooms,
        }),
      });

      const data = await response.json();
      setQuotationPreview(data);
      setStep(5);
    } catch (error) {
      console.error('Error calculating quotation:', error);
    } finally {
      setIsCalculating(false);
    }
  };

  const renderRoomsAndOpenings = () => (
    <div className="max-w-6xl mx-auto">
      <div className="bg-white rounded-xl shadow-md p-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            Habitaciones y Aberturas
          </h2>
          <button
            onClick={addRoom}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus className="w-5 h-5" />
            Agregar Habitación
          </button>
        </div>

        {rooms.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <Home className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600 mb-4">
              No hay habitaciones agregadas
            </p>
            <button
              onClick={addRoom}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Agregar Primera Habitación
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {rooms.map((room, roomIndex) => (
              <div
                key={room.id}
                className="border-2 border-gray-200 rounded-lg p-6"
              >
                {/* Room Header */}
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nombre
                      </label>
                      <input
                        type="text"
                        value={room.name}
                        onChange={(e) => {
                          const updated = [...rooms];
                          updated[roomIndex].name = e.target.value;
                          setRooms(updated);
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        placeholder="Ej: Sala Principal"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Tipo
                      </label>
                      <select
                        value={room.type}
                        onChange={(e) => {
                          const updated = [...rooms];
                          updated[roomIndex].type = e.target.value as RoomType;
                          setRooms(updated);
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      >
                        {ROOM_TYPES.map((rt) => (
                          <option key={rt.value} value={rt.value}>
                            {rt.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Piso
                      </label>
                      <input
                        type="number"
                        value={room.floor}
                        onChange={(e) => {
                          const updated = [...rooms];
                          updated[roomIndex].floor = parseInt(e.target.value);
                          setRooms(updated);
                        }}
                        min="1"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      />
                    </div>

                    <div className="flex items-end">
                      <button
                        onClick={() => removeRoom(room.id)}
                        className="w-full px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 flex items-center justify-center gap-2"
                      >
                        <Trash2 className="w-4 h-4" />
                        Eliminar
                      </button>
                    </div>
                  </div>
                </div>

                {/* Openings */}
                <div className="mt-4">
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="font-medium text-gray-900">
                      Aberturas ({room.openings.length})
                    </h4>
                    <button
                      onClick={() => addOpening(room.id)}
                      className="text-sm px-3 py-1 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 flex items-center gap-1"
                    >
                      <Plus className="w-4 h-4" />
                      Agregar Abertura
                    </button>
                  </div>

                  {room.openings.length === 0 ? (
                    <div className="bg-gray-50 rounded-lg p-4 text-center text-gray-500 text-sm">
                      No hay aberturas. Haz clic en "Agregar Abertura" para empezar.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {room.openings.map((opening, openingIndex) => (
                        <div
                          key={opening.id}
                          className="bg-gray-50 rounded-lg p-4 grid grid-cols-1 md:grid-cols-6 gap-3"
                        >
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                              Tipo
                            </label>
                            <select
                              value={opening.type}
                              onChange={(e) => {
                                const updated = [...rooms];
                                updated[roomIndex].openings[openingIndex].type = e.target.value as OpeningType;
                                setRooms(updated);
                              }}
                              className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                            >
                              {OPENING_TYPES.map((ot) => (
                                <option key={ot.value} value={ot.value}>
                                  {ot.label}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                              Ancho (m)
                            </label>
                            <input
                              type="number"
                              value={opening.width}
                              onChange={(e) => {
                                const updated = [...rooms];
                                updated[roomIndex].openings[openingIndex].width = parseFloat(e.target.value);
                                setRooms(updated);
                              }}
                              step="0.01"
                              min="0.1"
                              className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                              Alto (m)
                            </label>
                            <input
                              type="number"
                              value={opening.height}
                              onChange={(e) => {
                                const updated = [...rooms];
                                updated[roomIndex].openings[openingIndex].height = parseFloat(e.target.value);
                                setRooms(updated);
                              }}
                              step="0.01"
                              min="0.1"
                              className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                              Cantidad
                            </label>
                            <input
                              type="number"
                              value={opening.quantity}
                              onChange={(e) => {
                                const updated = [...rooms];
                                updated[roomIndex].openings[openingIndex].quantity = parseInt(e.target.value);
                                setRooms(updated);
                              }}
                              min="1"
                              className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                              Film
                            </label>
                            <select
                              value={opening.productType}
                              onChange={(e) => {
                                const updated = [...rooms];
                                updated[roomIndex].openings[openingIndex].productType = e.target.value as ProductType;
                                setRooms(updated);
                              }}
                              className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                            >
                              {PRODUCT_TYPES.map((pt) => (
                                <option key={pt.value} value={pt.value}>
                                  {pt.label}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div className="flex items-end">
                            <button
                              onClick={() => removeOpening(room.id, opening.id)}
                              className="w-full px-2 py-1 bg-red-100 text-red-600 rounded hover:bg-red-200 flex items-center justify-center gap-1 text-sm"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>

                          {/* Area preview */}
                          <div className="col-span-6 text-xs text-gray-600 flex items-center gap-4">
                            <span className="flex items-center gap-1">
                              <Ruler className="w-3 h-3" />
                              Área: {(opening.width * opening.height * opening.quantity).toFixed(2)} m²
                            </span>
                            <span className="text-gray-400">|</span>
                            <span>
                              {PRODUCT_TYPES.find(pt => pt.value === opening.productType)?.description}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {rooms.length > 0 && (
          <div className="mt-8 flex gap-4">
            <button
              onClick={() => setStep(3)}
              className="flex-1 px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Atrás
            </button>
            <button
              onClick={calculateQuotation}
              disabled={isCalculating}
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isCalculating ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Calculando...
                </>
              ) : (
                <>
                  <DollarSign className="w-5 h-5" />
                  Calcular Cotización
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );

  // ============================================================================
  // STEP 5: QUOTATION PREVIEW
  // ============================================================================

  const renderQuotationPreview = () => (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-xl shadow-md p-8">
        <div className="text-center mb-8">
          <CheckCircle className="w-16 h-16 mx-auto text-green-500 mb-4" />
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            ¡Cotización Lista!
          </h2>
          <p className="text-gray-600">
            Revisa los detalles y confirma tu cotización
          </p>
        </div>

        {/* Summary */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="text-sm text-gray-600 mb-1">Área Total</p>
              <p className="text-2xl font-bold text-gray-900">
                {quotationPreview?.totalArea || '0.00'} m²
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Items</p>
              <p className="text-2xl font-bold text-gray-900">
                {quotationPreview?.itemsCount || '0'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Total</p>
              <p className="text-3xl font-bold text-blue-600">
                ${quotationPreview?.total || '0.00'}
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-4">
          <button
            onClick={() => setStep(4)}
            className="flex-1 px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 flex items-center justify-center gap-2"
          >
            <Eye className="w-5 h-5" />
            Editar
          </button>
          <button
            onClick={() => {
              /* Save draft */
            }}
            className="flex-1 px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 flex items-center justify-center gap-2"
          >
            <Save className="w-5 h-5" />
            Guardar
          </button>
          <button
            onClick={() => {
              /* Send quotation */
            }}
            className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center justify-center gap-2"
          >
            <Send className="w-5 h-5" />
            Enviar por WhatsApp
          </button>
        </div>
      </div>
    </div>
  );

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4">
      {/* Progress Bar */}
      <div className="max-w-6xl mx-auto mb-8">
        <div className="flex items-center justify-between">
          {[1, 2, 3, 4, 5].map((s) => (
            <div key={s} className="flex-1 flex items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                  s <= step
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-300 text-gray-600'
                }`}
              >
                {s}
              </div>
              {s < 5 && (
                <div
                  className={`flex-1 h-1 mx-2 ${
                    s < step ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                />
              )}
            </div>
          ))}
        </div>
        <div className="flex justify-between mt-2 text-xs text-gray-600">
          <span>Vertical</span>
          <span>Cliente</span>
          <span>Propiedad</span>
          <span>Aberturas</span>
          <span>Cotización</span>
        </div>
      </div>

      {/* Content */}
      <div>
        {step === 1 && renderVerticalSelection()}
        {step === 2 && renderCustomerForm()}
        {step === 3 && renderPropertyForm()}
        {step === 4 && renderRoomsAndOpenings()}
        {step === 5 && renderQuotationPreview()}
      </div>
    </div>
  );
}
