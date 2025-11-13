"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Car, Plus, Trash2, Ruler, DollarSign, ArrowLeft, CheckCircle } from 'lucide-react';
import {
  getVehicleTemplate,
  getAllWindows,
  VehicleWindowTemplate,
  VEHICLE_TEMPLATES
} from '@/lib/vehicleWindows';

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
  type: 'automotive_flat' | 'automotive_curved';
  name: string;
  width: number;
  height: number;
  quantity: number;
  productId: string;
  windowTemplate?: VehicleWindowTemplate; // Referencia a la plantilla
}

interface Customer {
  name: string;
  email: string;
  phone?: string;
  customerType?: 'nuevo' | 'leal' | 'mayorista' | 'corporativo';
  discount?: number;
}

interface Vehicle {
  marca: string;
  modelo: string;
  año: string;
  tipo: string; // sedan, suv, coupe, pickup
  imageUrl?: string;
  tieneFilmViejo: boolean;
}

export default function VehiculosPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [openings, setOpenings] = useState<Opening[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [quotationPreview, setQuotationPreview] = useState<any>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  // Para integración futura con API de vehículos
  const [vehicleBrands, setVehicleBrands] = useState<string[]>([]);
  const [vehicleModels, setVehicleModels] = useState<string[]>([]);

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

  // Precios predefinidos por tipo de vehículo (por m²)
  const preciosPorTipoVehiculo: Record<string, number> = {
    'sedan': 150,
    'suv': 180,
    'coupe': 140,
    'pickup': 160,
  };

  // Cargar vidrios desde plantilla cuando se selecciona el tipo de vehículo
  const loadWindowsFromTemplate = (tipoVehiculo: string) => {
    const windows = getAllWindows(tipoVehiculo);
    const obligatoryWindows = windows.filter(w => w.obligatorio);

    // Buscar producto de seguridad polarizado por defecto (solo si hay productos cargados)
    let defaultProduct = null;
    if (products && products.length > 0) {
      defaultProduct = products.find(p =>
        p.category === 'LAMINATE_SECURITY' && p.name.toLowerCase().includes('polarizado')
      );
      if (!defaultProduct) {
        defaultProduct = products.find(p => p.category === 'LAMINATE_SECURITY');
      }
    }

    const openingsFromTemplate: Opening[] = obligatoryWindows.map(w => ({
      id: `window-${w.id}`,
      type: w.curvo ? 'automotive_curved' : 'automotive_flat',
      name: w.nombre,
      width: Math.sqrt(w.area_aproximada),
      height: Math.sqrt(w.area_aproximada),
      quantity: 1,
      productId: w.permite_oscurecimiento && defaultProduct ? defaultProduct.id : '',
      windowTemplate: w,
    }));

    setOpenings(openingsFromTemplate);
  };

  // Agregar vidrio opcional desde plantilla
  const addOptionalWindow = (windowTemplate: VehicleWindowTemplate) => {
    const newOpening: Opening = {
      id: `window-${windowTemplate.id}-${Date.now()}`,
      type: windowTemplate.curvo ? 'automotive_curved' : 'automotive_flat',
      name: windowTemplate.nombre,
      width: Math.sqrt(windowTemplate.area_aproximada),
      height: Math.sqrt(windowTemplate.area_aproximada),
      quantity: 1,
      productId: '',
      windowTemplate,
    };
    setOpenings([...openings, newOpening]);
  };

  const removeOpening = (id: string) => {
    setOpenings(openings.filter(o => o.id !== id));
  };

  const updateOpening = (id: string, field: string, value: any) => {
    setOpenings(openings.map(o =>
      o.id === id ? { ...o, [field]: value } : o
    ));
  };

  const handleCustomerSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const customerType = formData.get('customerType') as 'nuevo' | 'leal' | 'mayorista' | 'corporativo';

    // Descuentos por tipo de cliente
    const discountMap: Record<string, number> = {
      'nuevo': 0,
      'leal': 10,
      'mayorista': 15,
      'corporativo': 20,
    };

    setCustomer({
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      phone: formData.get('phone') as string || undefined,
      customerType: customerType,
      discount: discountMap[customerType] || 0,
    });
    setStep(2);
  };

  const handleVehicleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const tipo = formData.get('tipo') as string;
    const marca = formData.get('marca') as string;
    const modelo = formData.get('modelo') as string;
    const año = formData.get('año') as string;
    const tieneFilmViejo = formData.get('tieneFilmViejo') === 'si';

    // Simular carga de imagen del vehículo
    const imageUrl = `https://placehold.co/800x400/e0e0e0/666666?text=${encodeURIComponent(marca + ' ' + modelo + ' ' + año)}`;

    setVehicle({
      marca,
      modelo,
      año,
      tipo,
      imageUrl,
      tieneFilmViejo,
    });

    // Cargar vidrios predefinidos según el tipo de vehículo
    loadWindowsFromTemplate(tipo);

    setStep(3);
  };

  const calculateQuotation = async () => {
    const hasInvalidOpenings = openings.some(o => !o.productId);
    if (hasInvalidOpenings) {
      alert('Por favor selecciona un producto para todas las ventanas/vidrios.');
      return;
    }

    setIsCalculating(true);
    try {
      const response = await fetch('/api/quotations/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vertical: 'automotive',
          customer,
          property: null,
          rooms: [{
            id: 'vehicle-1',
            name: 'Vehículo',
            type: 'other',
            floor: 1,
            openings: openings.map(o => ({
              id: o.id,
              type: o.type,
              name: o.name,
              width: o.width,
              height: o.height,
              quantity: o.quantity,
              productId: o.productId,
              productType: products.find(p => p.id === o.productId)?.category.toLowerCase(),
              specifications: {
                curved: o.type === 'automotive_curved'
              }
            }))
          }],
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

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4">
      {/* Header */}
      <div className="max-w-4xl mx-auto mb-8">
        <button
          onClick={() => router.push('/')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-5 h-5" />
          Volver al inicio
        </button>
        <div className="flex items-center gap-3 mb-4">
          <Car className="w-8 h-8 text-red-500" />
          <h1 className="text-3xl font-bold text-gray-900">
            Cotización para Vehículos
          </h1>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="max-w-4xl mx-auto mb-8">
        <div className="flex items-center justify-between">
          {[1, 2, 3, 4].map((s) => (
            <div key={s} className="flex-1 flex items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                s <= step ? 'bg-red-600 text-white' : 'bg-gray-300 text-gray-600'
              }`}>
                {s}
              </div>
              {s < 4 && (
                <div className={`flex-1 h-1 mx-2 ${s < step ? 'bg-red-600' : 'bg-gray-300'}`} />
              )}
            </div>
          ))}
        </div>
        <div className="flex justify-between mt-2 text-xs text-gray-600">
          <span>Cliente</span>
          <span>Vehículo</span>
          <span>Vidrios</span>
          <span>Cotización</span>
        </div>
      </div>

      {/* Step 1: Customer Info */}
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
                <input
                  type="text"
                  name="name"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="Juan Pérez"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  name="email"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                  placeholder="juan@ejemplo.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Teléfono (opcional)
                </label>
                <input
                  type="text"
                  name="phone"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                  placeholder="1234567890"
                />
              </div>

              {/* Tipo de Cliente */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <label className="block text-sm font-medium text-gray-900 mb-3">
                  Tipo de Cliente *
                </label>
                <select
                  name="customerType"
                  required
                  defaultValue="nuevo"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 bg-white"
                >
                  <option value="nuevo">Nuevo (0% descuento)</option>
                  <option value="leal">Leal (10% descuento)</option>
                  <option value="mayorista">Mayorista (15% descuento)</option>
                  <option value="corporativo">Corporativo (20% descuento)</option>
                </select>
                <p className="mt-2 text-xs text-blue-800">
                  💡 El descuento se aplicará automáticamente en la cotización
                </p>
              </div>

              <button
                type="submit"
                className="w-full px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium"
              >
                Continuar
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Step 2: Vehicle Info */}
      {step === 2 && (
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-xl shadow-md p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Información del Vehículo
            </h2>
            <form onSubmit={handleVehicleSubmit} className="space-y-6">
              {/* Tipo de Vehículo - Radio Buttons */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Tipo de Vehículo *
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {VEHICLE_TEMPLATES.map((template) => (
                    <label
                      key={template.tipo}
                      className="relative flex items-center p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-red-300 hover:bg-red-50 transition-all has-[:checked]:border-red-500 has-[:checked]:bg-red-50"
                    >
                      <input
                        type="radio"
                        name="tipo"
                        value={template.tipo}
                        required
                        className="w-4 h-4 text-red-600 focus:ring-red-500"
                      />
                      <span className="ml-3 text-sm font-medium text-gray-900">
                        {template.descripcion}
                      </span>
                    </label>
                  ))}
                </div>
                <p className="mt-2 text-xs text-gray-500">
                  Esto pre-cargará los vidrios típicos del vehículo
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Marca *
                  </label>
                  <input
                    type="text"
                    name="marca"
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                    placeholder="Toyota, Ford..."
                    list="brands"
                  />
                  <datalist id="brands">
                    <option value="Toyota" />
                    <option value="Ford" />
                    <option value="Chevrolet" />
                    <option value="Volkswagen" />
                    <option value="Fiat" />
                    <option value="Renault" />
                    <option value="Peugeot" />
                    <option value="Honda" />
                    <option value="Nissan" />
                  </datalist>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Modelo *
                  </label>
                  <input
                    type="text"
                    name="modelo"
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                    placeholder="Corolla, Focus..."
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Año *
                </label>
                <select
                  name="año"
                  defaultValue="2025"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                >
                  {Array.from({ length: 2025 - 1981 + 1 }, (_, i) => 2025 - i).map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>

              {/* Pregunta sobre film viejo */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <label className="block text-sm font-medium text-gray-900 mb-3">
                  ¿El vehículo tiene lámina/film viejo que deba removerse? *
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      name="tieneFilmViejo"
                      value="si"
                      required
                      className="w-4 h-4 text-red-600 focus:ring-red-500"
                    />
                    <span className="ml-2 text-sm text-gray-900">Sí, tiene film viejo</span>
                  </label>
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      name="tieneFilmViejo"
                      value="no"
                      defaultChecked
                      className="w-4 h-4 text-red-600 focus:ring-red-500"
                    />
                    <span className="ml-2 text-sm text-gray-900">No, vidrios limpios</span>
                  </label>
                </div>
                <p className="mt-2 text-xs text-yellow-800">
                  💡 La remoción de film viejo puede tener un costo adicional
                </p>
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
                  className="flex-1 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium"
                >
                  Continuar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Step 3: Vehicle Windows */}
      {step === 3 && (
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-xl shadow-md p-8">
            {/* Imagen del Vehículo */}
            {vehicle?.imageUrl && (
              <div className="mb-6 rounded-lg overflow-hidden border-2 border-gray-200">
                <img
                  src={vehicle.imageUrl}
                  alt={`${vehicle.marca} ${vehicle.modelo}`}
                  className="w-full h-auto"
                />
                <div className="bg-gray-100 px-4 py-2 text-sm text-gray-700">
                  <strong>{vehicle.marca} {vehicle.modelo} {vehicle.año}</strong>
                  {vehicle.tieneFilmViejo && (
                    <span className="ml-3 px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs">
                      ⚠️ Requiere remoción de film viejo
                    </span>
                  )}
                </div>
              </div>
            )}

            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Vidrios del Vehículo
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  {vehicle?.tipo && getVehicleTemplate(vehicle.tipo)?.descripcion}
                </p>
              </div>
            </div>

            {/* Vidrios Opcionales Disponibles */}
            {vehicle?.tipo && (() => {
              const allWindows = getAllWindows(vehicle.tipo);
              const optionalWindows = allWindows.filter(w => !w.obligatorio);
              const addedOptionalIds = openings
                .filter(o => !o.windowTemplate?.obligatorio)
                .map(o => o.windowTemplate?.id);
              const availableOptionals = optionalWindows.filter(
                w => !addedOptionalIds.includes(w.id)
              );

              return availableOptionals.length > 0 ? (
                <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm font-medium text-blue-900 mb-2">
                    Vidrios Opcionales Disponibles:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {availableOptionals.map((w) => (
                      <button
                        key={w.id}
                        onClick={() => addOptionalWindow(w)}
                        className="px-3 py-1.5 bg-white border border-blue-300 rounded-lg text-sm text-blue-900 hover:bg-blue-100 flex items-center gap-1"
                      >
                        <Plus className="w-4 h-4" />
                        {w.nombre}
                      </button>
                    ))}
                  </div>
                </div>
              ) : null;
            })()}

            {openings.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <Car className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600 mb-4">
                  No hay vidrios cargados. Por favor, vuelve atrás y selecciona un tipo de vehículo.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {openings.map((opening) => (
                  <div key={opening.id} className="bg-gray-50 rounded-lg p-4">
                    {/* Header con nombre y badges */}
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-semibold text-gray-900">{opening.name}</h3>
                        <div className="flex gap-2 mt-1">
                          {opening.windowTemplate?.obligatorio && (
                            <span className="text-xs px-2 py-0.5 bg-green-100 text-green-700 rounded">
                              Obligatorio
                            </span>
                          )}
                          <span className="text-xs px-2 py-0.5 bg-gray-200 text-gray-700 rounded">
                            {opening.type === 'automotive_curved' ? 'Curvo' : 'Plano'}
                          </span>
                          {opening.windowTemplate && !opening.windowTemplate.permite_oscurecimiento && (
                            <span className="text-xs px-2 py-0.5 bg-yellow-100 text-yellow-800 rounded">
                              ⚠️ No permite oscurecimiento
                            </span>
                          )}
                        </div>
                      </div>
                      {!opening.windowTemplate?.obligatorio && (
                        <button
                          onClick={() => removeOpening(opening.id)}
                          className="px-3 py-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 flex items-center gap-1 text-sm"
                        >
                          <Trash2 className="w-4 h-4" />
                          Quitar
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Ancho (m)
                        </label>
                        <input
                          type="number"
                          value={opening.width}
                          onChange={(e) => updateOpening(opening.id, 'width', parseFloat(e.target.value))}
                          step="0.01"
                          min="0.1"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Alto (m)
                        </label>
                        <input
                          type="number"
                          value={opening.height}
                          onChange={(e) => updateOpening(opening.id, 'height', parseFloat(e.target.value))}
                          step="0.01"
                          min="0.1"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Producto (Lámina de Seguridad Polarizada)
                        </label>
                        <div className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50">
                          <div className="flex justify-between items-center">
                            <span className="font-medium">Lámina de Seguridad Polarizada</span>
                            <span className="text-red-600 font-bold">
                              ${vehicle?.tipo ? preciosPorTipoVehiculo[vehicle.tipo] : 150}/m²
                            </span>
                          </div>
                          {opening.windowTemplate && !opening.windowTemplate.permite_oscurecimiento && (
                            <p className="text-xs text-yellow-700 mt-1">
                              ⚠️ Para parabrisas se aplica lámina transparente de seguridad
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="md:col-span-4 text-sm text-gray-600 flex items-center gap-2 pt-2 border-t">
                        <Ruler className="w-4 h-4" />
                        Área: {(opening.width * opening.height).toFixed(2)} m²
                        {opening.windowTemplate?.area_aproximada && (
                          <span className="text-gray-500">
                            (Aprox. {opening.windowTemplate.area_aproximada} m² típico)
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {openings.length > 0 && (
              <div className="mt-8 flex gap-4">
                <button
                  onClick={() => setStep(2)}
                  className="flex-1 px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Atrás
                </button>
                <button
                  onClick={calculateQuotation}
                  disabled={isCalculating}
                  className="flex-1 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium flex items-center justify-center gap-2 disabled:opacity-50"
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

      {/* Step 4: Quotation Preview */}
      {step === 4 && quotationPreview && (
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-xl shadow-md p-8">
            <div className="text-center mb-8">
              <CheckCircle className="w-16 h-16 mx-auto text-green-500 mb-4" />
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                ¡Cotización Lista!
              </h2>
            </div>

            {/* Info del Cliente */}
            {customer && (
              <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Cliente:</span> {customer.name}
                  </div>
                  <div>
                    <span className="font-medium">Tipo:</span>{' '}
                    <span className="px-2 py-1 bg-blue-200 text-blue-900 rounded">
                      {customer.customerType?.toUpperCase()}
                    </span>
                  </div>
                  {customer.discount && customer.discount > 0 && (
                    <div className="col-span-2">
                      <span className="font-medium text-green-700">Descuento aplicado:</span>{' '}
                      <span className="text-green-700 font-bold">{customer.discount}%</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-lg p-6 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Área Total</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {quotationPreview.summary?.total_area?.toFixed(2) || '0.00'} m²
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Tipo de Vehículo</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {vehicle?.tipo && getVehicleTemplate(vehicle.tipo)?.descripcion}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total</p>
                  <p className="text-3xl font-bold text-red-600">
                    ${quotationPreview.summary?.grand_total?.toFixed(2) || '0.00'}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => setStep(3)}
                className="flex-1 px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Editar
              </button>
              <button
                onClick={() => router.push('/')}
                className="flex-1 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700"
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
