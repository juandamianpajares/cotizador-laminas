"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Phone, Image as ImageIcon, AlertCircle } from 'lucide-react';

export default function NuevaCotizacionPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const requestId = searchParams?.get('requestId');

  const [request, setRequest] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Cargar solicitud
  useEffect(() => {
    if (requestId) {
      loadRequest(requestId);
    } else {
      setError('No se especificó ID de solicitud');
      setIsLoading(false);
    }
  }, [requestId]);

  const loadRequest = async (id: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/solicitudes/${id}`);
      const data = await response.json();

      if (response.ok) {
        setRequest(data);

        // Actualizar estado a "EN_PROGRESO"
        await fetch(`/api/solicitudes/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'IN_PROGRESS' }),
        });
      } else {
        setError(data.error || 'Error al cargar la solicitud');
      }
    } catch (error) {
      console.error('Error:', error);
      setError('Error al cargar la solicitud');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartQuotation = () => {
    // Redirigir al formulario de vehículos con datos pre-cargados
    // Usar localStorage para pasar datos temporalmente
    if (request) {
      const preloadData = {
        fromRequest: true,
        requestId: request.id,
        phone: request.phone,
        serviceType: request.serviceType,
        vehiclePhotos: request.vehiclePhotos,
        notes: request.notes,
      };

      localStorage.setItem('quotation_preload', JSON.stringify(preloadData));
      router.push('/cotizar/vehiculos');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Cargando solicitud...</p>
        </div>
      </div>
    );
  }

  if (error || !request) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => router.push('/encargado/solicitudes')}
            className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Volver a Solicitudes
          </button>
        </div>
      </div>
    );
  }

  const SERVICE_LABELS: Record<string, string> = {
    PARABRISAS: 'Solo Parabrisas',
    VISERA: 'Visera Superior',
    PARABRISAS_IR: 'Parabrisas con IR',
    LATERALES_LUNETA: 'Laterales + Luneta',
    COMPLETO: 'Todos los Vidrios',
    PERSONALIZADO: 'Personalizado',
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <button
            onClick={() => router.push('/encargado/solicitudes')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            Volver a Solicitudes
          </button>

          <h1 className="text-3xl font-bold text-gray-900">
            Revisar Solicitud del Cliente
          </h1>
          <p className="text-gray-600 mt-1">
            Revisa los datos del cliente antes de crear la cotización
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Info del Cliente */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Información del Cliente
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Teléfono WhatsApp
              </label>
              <div className="flex items-center gap-2">
                <Phone className="w-5 h-5 text-green-600" />
                <span className="text-lg font-semibold text-gray-900">{request.phone}</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fecha de Solicitud
              </label>
              <span className="text-gray-900">
                {new Date(request.createdAt).toLocaleDateString('es-ES', {
                  day: '2-digit',
                  month: 'long',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>

            {request.serviceType && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Servicio Solicitado
                </label>
                <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                  {SERVICE_LABELS[request.serviceType] || request.serviceType}
                </span>
              </div>
            )}

            {request.notes && (
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notas del Cliente
                </label>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <p className="text-gray-900">{request.notes}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Fotos del Vehículo */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <ImageIcon className="w-6 h-6" />
            Fotos del Vehículo
          </h2>

          {request.vehiclePhotos && request.vehiclePhotos.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {request.vehiclePhotos.map((photo: string, index: number) => (
                <div
                  key={index}
                  className="relative group cursor-pointer"
                  onClick={() => window.open(photo, '_blank')}
                >
                  <img
                    src={photo}
                    alt={`Foto ${index + 1}`}
                    className="w-full h-64 object-cover rounded-lg border-2 border-gray-200 hover:border-red-500 transition-colors"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 rounded-lg transition-all flex items-center justify-center">
                    <span className="text-white opacity-0 group-hover:opacity-100 font-medium">
                      Click para ampliar
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <ImageIcon className="w-12 h-12 mx-auto mb-2 text-gray-300" />
              <p>No hay fotos disponibles</p>
            </div>
          )}
        </div>

        {/* Instrucciones */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
          <h3 className="font-bold text-blue-900 mb-2">📋 Próximos Pasos</h3>
          <ol className="list-decimal list-inside space-y-2 text-blue-900">
            <li>Revisa las fotos del vehículo para identificar tipo y modelo</li>
            <li>Ingresa los datos del cliente en el formulario de cotización</li>
            <li>Selecciona el tipo de vehículo y configura los vidrios</li>
            <li>Calcula la cotización y envíala por WhatsApp</li>
          </ol>
        </div>

        {/* Botón para iniciar cotización */}
        <div className="flex gap-4">
          <button
            onClick={() => router.push('/encargado/solicitudes')}
            className="flex-1 px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium"
          >
            Cancelar
          </button>
          <button
            onClick={handleStartQuotation}
            className="flex-1 px-6 py-4 bg-red-600 text-white rounded-lg hover:bg-red-700 font-bold text-lg"
          >
            Iniciar Cotización →
          </button>
        </div>
      </div>
    </div>
  );
}
