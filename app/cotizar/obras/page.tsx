"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Building2, Home, Plus, Trash2, Ruler, DollarSign, ArrowLeft, CheckCircle } from 'lucide-react';

interface Product {
  id: string;
  sku: string;
  name: string;
  category: string;
  pricePerSqm: number;
  installationPerSqm: number;
}

interface Opening {
  id: string;
  type: 'window' | 'door' | 'sliding_door' | 'shower_enclosure' | 'partition' | 'skylight';
  width: number;
  height: number;
  quantity: number;
  productType: 'laminate_security' | 'solar_control' | 'vinyl_decorative' | 'privacy';
  productId: string;
}

interface Room {
  id: string;
  name: string;
  type: string;
  floor: number;
  openings: Opening[];
}

interface Property {
  type: string;
  address?: string;
  city?: string;
  floors?: number;
}

interface Customer {
  name: string;
  email: string;
  phone?: string;
}

export default function ObrasPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const vertical = searchParams?.get('tipo') || 'residential';

  const [step, setStep] = useState(1);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [property, setProperty] = useState<Property | null>(null);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [quotationPreview, setQuotationPreview] = useState<any>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  const isResidential = vertical === 'residential';
  const Icon = isResidential ? Home : Building2;
  const colorClass = isResidential ? 'blue' : 'green';
  const title = isResidential ? 'Residencial' : 'Comercial';

  // Load products
  useEffect(() => {
    const loadProducts = async () => {
      try {
        const response = await fetch('/api/products');
        const data = await response.json();
        setProducts(data);
      } catch (error) {
        console.error('Error loading products:', error);
      }
    };
    loadProducts();
  }, []);

  const addRoom = () => {
    const newRoom: Room = {
      id: `room-${Date.now()}`,
      name: '',
      type: 'living_room',
      floor: 1,
      openings: [],
    };
    setRooms([...rooms, newRoom]);
  };

  const removeRoom = (id: string) => {
    setRooms(rooms.filter(r => r.id !== id));
  };

  const updateRoom = (id: string, field: string, value: any) => {
    setRooms(rooms.map(r => r.id === id ? { ...r, [field]: value } : r));
  };

  const addOpening = (roomId: string) => {
    const newOpening: Opening = {
      id: `opening-${Date.now()}`,
      type: 'window',
      width: 1.0,
      height: 1.5,
      quantity: 1,
      productType: 'solar_control',
      productId: '',
    };
    setRooms(rooms.map(r =>
      r.id === roomId ? { ...r, openings: [...r.openings, newOpening] } : r
    ));
  };

  const removeOpening = (roomId: string, openingId: string) => {
    setRooms(rooms.map(r =>
      r.id === roomId ? { ...r, openings: r.openings.filter(o => o.id !== openingId) } : r
    ));
  };

  const updateOpening = (roomId: string, openingId: string, field: string, value: any) => {
    setRooms(rooms.map(r => {
      if (r.id === roomId) {
        return {
          ...r,
          openings: r.openings.map(o => {
            if (o.id === openingId) {
              const updated = { ...o, [field]: value };
              // Reset productId when productType changes
              if (field === 'productType') {
                updated.productId = '';
              }
              return updated;
            }
            return o;
          })
        };
      }
      return r;
    }));
  };

  const handleCustomerSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    setCustomer({
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      phone: formData.get('phone') as string || undefined,
    });
    setStep(2);
  };

  const handlePropertySubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    setProperty({
      type: formData.get('type') as string,
      address: formData.get('address') as string,
      city: formData.get('city') as string,
      floors: parseInt(formData.get('floors') as string) || 1,
    });
    setStep(3);
  };

  const calculateQuotation = async () => {
    const hasInvalidOpenings = rooms.some(room =>
      room.openings.some(opening => !opening.productId)
    );

    if (hasInvalidOpenings) {
      alert('Por favor selecciona un producto para todas las aberturas.');
      return;
    }

    setIsCalculating(true);
    try {
      const response = await fetch('/api/quotations/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vertical,
          customer,
          property,
          rooms,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Error ${response.status}`);
      }

      const data = await response.json();
      if (data.success) {
        setQuotationPreview(data.quotation);
        setStep(4);
      }
    } catch (error) {
      console.error('Error:', error);
      alert(`Error al calcular: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    } finally {
      setIsCalculating(false);
    }
  };

  const OPENING_TYPES = [
    { label: 'Ventana', value: 'window' },
    { label: 'Puerta', value: 'door' },
    { label: 'Puerta Corrediza', value: 'sliding_door' },
    { label: 'Mampara de Baño', value: 'shower_enclosure' },
    { label: 'División/Partición', value: 'partition' },
    { label: 'Tragaluz', value: 'skylight' },
  ];

  const PRODUCT_TYPES = [
    { label: 'Laminado de Seguridad', value: 'laminate_security' },
    { label: 'Control Solar', value: 'solar_control' },
    { label: 'Vinílico Decorativo', value: 'vinyl_decorative' },
    { label: 'Privacidad', value: 'privacy' },
  ];

  const ROOM_TYPES = [
    { label: 'Sala/Living', value: 'living_room' },
    { label: 'Dormitorio', value: 'bedroom' },
    { label: 'Cocina', value: 'kitchen' },
    { label: 'Baño', value: 'bathroom' },
    { label: 'Oficina', value: 'office' },
    { label: 'Sala de Reuniones', value: 'meeting_room' },
    { label: 'Lobby/Recepción', value: 'lobby' },
    { label: 'Otro', value: 'other' },
  ];

  const PROPERTY_TYPES = isResidential
    ? [
        { label: 'Casa', value: 'house' },
        { label: 'Departamento', value: 'apartment' },
      ]
    : [
        { label: 'Oficina', value: 'office' },
        { label: 'Edificio', value: 'building' },
        { label: 'Local Comercial', value: 'retail' },
      ];

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4">
      {/* Header */}
      <div className="max-w-6xl mx-auto mb-8">
        <button
          onClick={() => router.push('/')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-5 h-5" />
          Volver al inicio
        </button>
        <div className="flex items-center gap-3 mb-4">
          <Icon className={`w-8 h-8 text-${colorClass}-500`} />
          <h1 className="text-3xl font-bold text-gray-900">
            Cotización {title}
          </h1>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="max-w-6xl mx-auto mb-8">
        <div className="flex items-center justify-between">
          {[1, 2, 3, 4].map((s) => (
            <div key={s} className="flex-1 flex items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                s <= step ? `bg-${colorClass}-600 text-white` : 'bg-gray-300 text-gray-600'
              }`}>
                {s}
              </div>
              {s < 4 && (
                <div className={`flex-1 h-1 mx-2 ${s < step ? `bg-${colorClass}-600` : 'bg-gray-300'}`} />
              )}
            </div>
          ))}
        </div>
        <div className="flex justify-between mt-2 text-xs text-gray-600">
          <span>Cliente</span>
          <span>Propiedad</span>
          <span>Aberturas</span>
          <span>Cotización</span>
        </div>
      </div>

      {/* Step 1: Customer */}
      {step === 1 && (
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-xl shadow-md p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Información del Cliente
            </h2>
            <form onSubmit={handleCustomerSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre Completo *
                </label>
                <input type="text" name="name" required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Juan Pérez"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email *
                </label>
                <input type="email" name="email" required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="juan@ejemplo.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Teléfono (opcional)
                </label>
                <input type="text" name="phone"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="1234567890"
                />
              </div>

              <button type="submit"
                className={`w-full px-6 py-3 bg-${colorClass}-600 text-white rounded-lg hover:bg-${colorClass}-700 font-medium`}
              >
                Continuar
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Step 2: Property */}
      {step === 2 && (
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-xl shadow-md p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Información de la Propiedad
            </h2>
            <form onSubmit={handlePropertySubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de Propiedad *
                </label>
                <select name="type" required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Seleccionar...</option>
                  {PROPERTY_TYPES.map((pt) => (
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
                <input type="text" name="address"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Av. Corrientes 1234"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ciudad
                </label>
                <input type="text" name="city"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Buenos Aires"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Número de Pisos
                </label>
                <input type="number" name="floors" min="1" max="50" defaultValue="1"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex gap-4">
                <button type="button" onClick={() => setStep(1)}
                  className="flex-1 px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Atrás
                </button>
                <button type="submit"
                  className={`flex-1 px-6 py-3 bg-${colorClass}-600 text-white rounded-lg hover:bg-${colorClass}-700 font-medium`}
                >
                  Continuar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Step 3: Rooms & Openings */}
      {step === 3 && (
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-xl shadow-md p-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                Habitaciones y Aberturas
              </h2>
              <button onClick={addRoom}
                className={`flex items-center gap-2 px-4 py-2 bg-${colorClass}-600 text-white rounded-lg hover:bg-${colorClass}-700`}
              >
                <Plus className="w-5 h-5" />
                Agregar Habitación
              </button>
            </div>

            {rooms.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <Icon className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600 mb-4">No hay habitaciones agregadas</p>
                <button onClick={addRoom}
                  className={`px-6 py-2 bg-${colorClass}-600 text-white rounded-lg hover:bg-${colorClass}-700`}
                >
                  Agregar Primera Habitación
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {rooms.map((room, roomIndex) => (
                  <div key={room.id} className="border-2 border-gray-200 rounded-lg p-6">
                    {/* Room Header */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                        <input type="text" value={room.name}
                          onChange={(e) => updateRoom(room.id, 'name', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                          placeholder="Ej: Sala Principal"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
                        <select value={room.type}
                          onChange={(e) => updateRoom(room.id, 'type', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        >
                          {ROOM_TYPES.map((rt) => (
                            <option key={rt.value} value={rt.value}>{rt.label}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Piso</label>
                        <input type="number" value={room.floor}
                          onChange={(e) => updateRoom(room.id, 'floor', parseInt(e.target.value))}
                          min="1"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        />
                      </div>
                      <div className="flex items-end">
                        <button onClick={() => removeRoom(room.id)}
                          className="w-full px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 flex items-center justify-center gap-2"
                        >
                          <Trash2 className="w-4 h-4" />
                          Eliminar
                        </button>
                      </div>
                    </div>

                    {/* Openings */}
                    <div>
                      <div className="flex justify-between items-center mb-3">
                        <h4 className="font-medium text-gray-900">Aberturas ({room.openings.length})</h4>
                        <button onClick={() => addOpening(room.id)}
                          className="text-sm px-3 py-1 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 flex items-center gap-1"
                        >
                          <Plus className="w-4 h-4" />
                          Agregar Abertura
                        </button>
                      </div>

                      {room.openings.length === 0 ? (
                        <div className="bg-gray-50 rounded-lg p-4 text-center text-gray-500 text-sm">
                          No hay aberturas.
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {room.openings.map((opening, openingIndex) => (
                            <div key={opening.id} className="bg-gray-50 rounded-lg p-4 grid grid-cols-1 md:grid-cols-7 gap-3">
                              <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Tipo</label>
                                <select value={opening.type}
                                  onChange={(e) => updateOpening(room.id, opening.id, 'type', e.target.value)}
                                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                                >
                                  {OPENING_TYPES.map((ot) => (
                                    <option key={ot.value} value={ot.value}>{ot.label}</option>
                                  ))}
                                </select>
                              </div>

                              <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Ancho (m)</label>
                                <input type="number" value={opening.width}
                                  onChange={(e) => updateOpening(room.id, opening.id, 'width', parseFloat(e.target.value))}
                                  step="0.01" min="0.1"
                                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                                />
                              </div>

                              <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Alto (m)</label>
                                <input type="number" value={opening.height}
                                  onChange={(e) => updateOpening(room.id, opening.id, 'height', parseFloat(e.target.value))}
                                  step="0.01" min="0.1"
                                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                                />
                              </div>

                              <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Cantidad</label>
                                <input type="number" value={opening.quantity}
                                  onChange={(e) => updateOpening(room.id, opening.id, 'quantity', parseInt(e.target.value))}
                                  min="1"
                                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                                />
                              </div>

                              <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Categoría</label>
                                <select value={opening.productType}
                                  onChange={(e) => updateOpening(room.id, opening.id, 'productType', e.target.value)}
                                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                                >
                                  {PRODUCT_TYPES.map((pt) => (
                                    <option key={pt.value} value={pt.value}>{pt.label}</option>
                                  ))}
                                </select>
                              </div>

                              <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Producto</label>
                                <select value={opening.productId}
                                  onChange={(e) => updateOpening(room.id, opening.id, 'productId', e.target.value)}
                                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                                >
                                  <option value="">Seleccionar...</option>
                                  {products
                                    .filter(p => opening.productType && p.category === opening.productType.toUpperCase())
                                    .map((product) => (
                                      <option key={product.id} value={product.id}>
                                        {product.name} - ${product.pricePerSqm}/m²
                                      </option>
                                    ))}
                                </select>
                              </div>

                              <div className="flex items-end">
                                <button onClick={() => removeOpening(room.id, opening.id)}
                                  className="w-full px-2 py-1 bg-red-100 text-red-600 rounded hover:bg-red-200 flex items-center justify-center gap-1 text-sm"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>

                              <div className="col-span-7 text-xs text-gray-600 flex items-center gap-2">
                                <Ruler className="w-3 h-3" />
                                Área: {(opening.width * opening.height * opening.quantity).toFixed(2)} m²
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
                <button onClick={() => setStep(2)}
                  className="flex-1 px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Atrás
                </button>
                <button onClick={calculateQuotation} disabled={isCalculating}
                  className={`flex-1 px-6 py-3 bg-${colorClass}-600 text-white rounded-lg hover:bg-${colorClass}-700 font-medium flex items-center justify-center gap-2 disabled:opacity-50`}
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
      )}

      {/* Step 4: Preview */}
      {step === 4 && quotationPreview && (
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-xl shadow-md p-8">
            <div className="text-center mb-8">
              <CheckCircle className="w-16 h-16 mx-auto text-green-500 mb-4" />
              <h2 className="text-3xl font-bold text-gray-900 mb-2">¡Cotización Lista!</h2>
            </div>

            <div className={`bg-gradient-to-r from-${colorClass}-50 to-indigo-50 rounded-lg p-6 mb-6`}>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Área Total</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {quotationPreview.summary?.total_area?.toFixed(2) || '0.00'} m²
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Items</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {quotationPreview.items?.length || 0}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total</p>
                  <p className={`text-3xl font-bold text-${colorClass}-600`}>
                    ${quotationPreview.summary?.grand_total?.toFixed(2) || '0.00'}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <button onClick={() => setStep(3)}
                className="flex-1 px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Editar
              </button>
              <button onClick={() => router.push('/')}
                className={`flex-1 px-6 py-3 bg-${colorClass}-600 text-white rounded-lg hover:bg-${colorClass}-700`}
              >
                Nueva Cotización
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
