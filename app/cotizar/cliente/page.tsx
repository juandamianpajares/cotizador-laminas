"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Camera, Phone, Send, CheckCircle, Upload, X } from 'lucide-react';

const SERVICE_OPTIONS = [
  { value: 'PARABRISAS', label: 'Solo Parabrisas (Protección)', icon: '🛡️' },
  { value: 'VISERA', label: 'Visera Superior', icon: '☀️' },
  { value: 'PARABRISAS_IR', label: 'Parabrisas con IR (Rechazo de Calor)', icon: '🔥' },
  { value: 'LATERALES_LUNETA', label: 'Laterales + Luneta', icon: '🚗' },
  { value: 'COMPLETO', label: 'Todos los Vidrios', icon: '✨' },
  { value: 'PERSONALIZADO', label: 'Personalizado (Especificar)', icon: '⚙️' },
];

export default function ClienteFormPage() {
  const router = useRouter();
  const [step, setStep] = useState<'form' | 'success'>('form');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form data
  const [phone, setPhone] = useState('');
  const [serviceType, setServiceType] = useState<string>('');
  const [notes, setNotes] = useState('');
  const [photos, setPhotos] = useState<File[]>([]);
  const [photosPreviews, setPhotosPreviews] = useState<string[]>([]);

  // Handle photo selection
  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);

      // Limit to 3 photos
      if (photos.length + filesArray.length > 3) {
        alert('Máximo 3 fotos permitidas');
        return;
      }

      setPhotos([...photos, ...filesArray]);

      // Create previews
      filesArray.forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPhotosPreviews(prev => [...prev, reader.result as string]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  // Remove photo
  const removePhoto = (index: number) => {
    setPhotos(photos.filter((_, i) => i !== index));
    setPhotosPreviews(photosPreviews.filter((_, i) => i !== index));
  };

  // Submit form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (photos.length === 0) {
      alert('Debes subir al menos una foto de tu vehículo');
      return;
    }

    setIsSubmitting(true);

    try {
      // TODO: Upload photos to cloud storage (Cloudinary/S3)
      // For now, we'll use base64 previews
      const vehiclePhotos = photosPreviews;

      const response = await fetch('/api/solicitudes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone,
          vehiclePhotos,
          serviceType: serviceType || null,
          notes: notes || null,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setStep('success');
      } else {
        alert(data.error || 'Error al enviar la solicitud');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error al enviar la solicitud. Intenta nuevamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (step === 'success') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 text-center">
          <div className="mb-6">
            <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              ¡Solicitud Recibida!
            </h1>
            <p className="text-gray-600 text-lg">
              Te contactaremos pronto por WhatsApp
            </p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-blue-900">
              📱 <strong>Número registrado:</strong> {phone}
            </p>
            <p className="text-xs text-blue-700 mt-2">
              Recibirás tu cotización en menos de 30 minutos
            </p>
          </div>

          <button
            onClick={() => router.push('/')}
            className="w-full bg-gray-800 text-white py-3 rounded-lg hover:bg-gray-900 transition-colors font-medium"
          >
            Volver al Inicio
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Cotiza tu Vehículo
            </h1>
            <p className="text-gray-600">
              Completa este formulario simple y te enviaremos la cotización por WhatsApp
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl p-8">
          {/* Phone Number */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Número de WhatsApp <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+54 11 1234-5678"
                required
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-lg"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Te contactaremos por este número
            </p>
          </div>

          {/* Photos */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Fotos del Vehículo <span className="text-red-500">*</span>
            </label>

            {/* Photo previews */}
            {photosPreviews.length > 0 && (
              <div className="grid grid-cols-3 gap-3 mb-3">
                {photosPreviews.map((preview, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={preview}
                      alt={`Foto ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg border-2 border-gray-200"
                    />
                    <button
                      type="button"
                      onClick={() => removePhoto(index)}
                      className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Upload button */}
            {photos.length < 3 && (
              <label className="block w-full border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-red-400 hover:bg-red-50 transition-colors">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handlePhotoChange}
                  className="hidden"
                  capture="environment"
                />
                <Camera className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-700">
                  Toca para tomar foto o seleccionar
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {photos.length > 0
                    ? `${photos.length} de 3 fotos subidas`
                    : 'Hasta 3 fotos (Recomendado: lateral, frontal, trasero)'
                  }
                </p>
              </label>
            )}
          </div>

          {/* Service Type */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-900 mb-3">
              ¿Qué servicio necesitas? <span className="text-gray-400">(Opcional)</span>
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {SERVICE_OPTIONS.map((option) => (
                <label
                  key={option.value}
                  className={`relative flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    serviceType === option.value
                      ? 'border-red-500 bg-red-50'
                      : 'border-gray-200 hover:border-red-300 hover:bg-red-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="serviceType"
                    value={option.value}
                    checked={serviceType === option.value}
                    onChange={(e) => setServiceType(e.target.value)}
                    className="w-4 h-4 text-red-600 focus:ring-red-500"
                  />
                  <span className="ml-3 flex-1">
                    <span className="text-2xl mr-2">{option.icon}</span>
                    <span className="text-sm font-medium text-gray-900">
                      {option.label}
                    </span>
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Notes */}
          {serviceType === 'PERSONALIZADO' && (
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Especifica qué necesitas
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Ej: Solo vidrios laterales traseros y luneta con tono oscuro..."
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
              />
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting || photos.length === 0}
            className="w-full bg-red-600 text-white py-4 rounded-lg font-bold text-lg hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Enviando...
              </>
            ) : (
              <>
                <Send className="w-5 h-5" />
                Solicitar Cotización
              </>
            )}
          </button>

          <p className="text-xs text-gray-500 text-center mt-4">
            Al enviar esta solicitud, aceptas que te contactemos por WhatsApp
          </p>
        </form>

        {/* Info Box */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
          <p className="text-sm text-blue-900">
            <strong>¿Por qué es tan simple?</strong> Solo necesitamos ver tu vehículo y tu
            WhatsApp para preparar una cotización personalizada. Nuestro equipo completará
            los detalles y te enviará la cotización en menos de 30 minutos.
          </p>
        </div>
      </div>
    </div>
  );
}
