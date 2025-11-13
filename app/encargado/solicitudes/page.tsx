"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Clock,
  CheckCircle,
  XCircle,
  Phone,
  Image as ImageIcon,
  ArrowRight,
  Filter,
  Search,
} from 'lucide-react';

interface QuotationRequest {
  id: string;
  phone: string;
  vehiclePhotos: string[];
  serviceType: string | null;
  notes: string | null;
  status: string;
  createdAt: string;
  quotation?: any;
}

const STATUS_CONFIG = {
  PENDING: {
    label: 'Pendiente',
    color: 'bg-yellow-100 text-yellow-800',
    icon: Clock,
  },
  IN_PROGRESS: {
    label: 'En Proceso',
    color: 'bg-blue-100 text-blue-800',
    icon: Clock,
  },
  COMPLETED: {
    label: 'Completada',
    color: 'bg-green-100 text-green-800',
    icon: CheckCircle,
  },
  SENT: {
    label: 'Enviada',
    color: 'bg-purple-100 text-purple-800',
    icon: CheckCircle,
  },
  CANCELLED: {
    label: 'Cancelada',
    color: 'bg-gray-100 text-gray-800',
    icon: XCircle,
  },
};

const SERVICE_LABELS: Record<string, string> = {
  PARABRISAS: 'Solo Parabrisas',
  VISERA: 'Visera Superior',
  PARABRISAS_IR: 'Parabrisas con IR',
  LATERALES_LUNETA: 'Laterales + Luneta',
  COMPLETO: 'Todos los Vidrios',
  PERSONALIZADO: 'Personalizado',
};

export default function SolicitudesPage() {
  const router = useRouter();
  const [requests, setRequests] = useState<QuotationRequest[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<QuotationRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Load requests
  useEffect(() => {
    loadRequests();
  }, []);

  // Filter requests
  useEffect(() => {
    let filtered = requests;

    // Filter by status
    if (filterStatus !== 'all') {
      filtered = filtered.filter((req) => req.status === filterStatus);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter((req) =>
        req.phone.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredRequests(filtered);
  }, [requests, filterStatus, searchTerm]);

  const loadRequests = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/solicitudes');
      const data = await response.json();
      setRequests(data);
      setFilteredRequests(data);
    } catch (error) {
      console.error('Error loading requests:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartQuotation = (requestId: string) => {
    router.push(`/encargado/cotizaciones/nueva?requestId=${requestId}`);
  };

  const handleViewPhotos = (photos: string[]) => {
    // TODO: Open modal with photos
    console.log('View photos:', photos);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      const diffInMinutes = Math.floor(diffInHours * 60);
      return `Hace ${diffInMinutes} min`;
    } else if (diffInHours < 24) {
      return `Hace ${Math.floor(diffInHours)} horas`;
    } else {
      return date.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
      });
    }
  };

  const getStatusCounts = () => {
    return {
      all: requests.length,
      PENDING: requests.filter((r) => r.status === 'PENDING').length,
      IN_PROGRESS: requests.filter((r) => r.status === 'IN_PROGRESS').length,
      COMPLETED: requests.filter((r) => r.status === 'COMPLETED').length,
    };
  };

  const statusCounts = getStatusCounts();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Cargando solicitudes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Solicitudes de Cotización
              </h1>
              <p className="text-gray-600 mt-1">
                Gestiona las solicitudes recibidas de clientes
              </p>
            </div>
            <button
              onClick={loadRequests}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Actualizar
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600">Total</p>
              <p className="text-2xl font-bold text-gray-900">{statusCounts.all}</p>
            </div>
            <div className="bg-yellow-50 rounded-lg p-4">
              <p className="text-sm text-yellow-700">Pendientes</p>
              <p className="text-2xl font-bold text-yellow-900">{statusCounts.PENDING}</p>
            </div>
            <div className="bg-blue-50 rounded-lg p-4">
              <p className="text-sm text-blue-700">En Proceso</p>
              <p className="text-2xl font-bold text-blue-900">{statusCounts.IN_PROGRESS}</p>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <p className="text-sm text-green-700">Completadas</p>
              <p className="text-2xl font-bold text-green-900">{statusCounts.COMPLETED}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Status filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Filter className="w-4 h-4 inline mr-1" />
                Filtrar por Estado
              </label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
              >
                <option value="all">Todas</option>
                <option value="PENDING">Pendientes</option>
                <option value="IN_PROGRESS">En Proceso</option>
                <option value="COMPLETED">Completadas</option>
                <option value="SENT">Enviadas</option>
              </select>
            </div>

            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Search className="w-4 h-4 inline mr-1" />
                Buscar por Teléfono
              </label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
              />
            </div>
          </div>
        </div>

        {/* Requests List */}
        {filteredRequests.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <p className="text-gray-500 text-lg">No hay solicitudes</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredRequests.map((request) => {
              const StatusIcon = STATUS_CONFIG[request.status as keyof typeof STATUS_CONFIG]?.icon || Clock;
              const statusConfig = STATUS_CONFIG[request.status as keyof typeof STATUS_CONFIG];

              return (
                <div
                  key={request.id}
                  className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-6"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      {/* Header */}
                      <div className="flex items-center gap-3 mb-3">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${statusConfig.color}`}
                        >
                          <StatusIcon className="w-3 h-3 inline mr-1" />
                          {statusConfig.label}
                        </span>
                        <span className="text-sm text-gray-500">
                          {formatDate(request.createdAt)}
                        </span>
                      </div>

                      {/* Info */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Teléfono</p>
                          <p className="font-semibold text-gray-900 flex items-center gap-2">
                            <Phone className="w-4 h-4 text-green-600" />
                            {request.phone}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs text-gray-500 mb-1">Servicio Solicitado</p>
                          <p className="font-medium text-gray-900">
                            {request.serviceType
                              ? SERVICE_LABELS[request.serviceType]
                              : 'No especificado'}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs text-gray-500 mb-1">Fotos</p>
                          <button
                            onClick={() => handleViewPhotos(request.vehiclePhotos)}
                            className="font-medium text-red-600 hover:text-red-700 flex items-center gap-1"
                          >
                            <ImageIcon className="w-4 h-4" />
                            Ver {request.vehiclePhotos.length} foto(s)
                          </button>
                        </div>
                      </div>

                      {/* Notes */}
                      {request.notes && (
                        <div className="bg-gray-50 rounded p-3 mb-4">
                          <p className="text-xs text-gray-500 mb-1">Notas del Cliente</p>
                          <p className="text-sm text-gray-700">{request.notes}</p>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="ml-4">
                      {request.status === 'PENDING' || request.status === 'IN_PROGRESS' ? (
                        <button
                          onClick={() => handleStartQuotation(request.id)}
                          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2 whitespace-nowrap"
                        >
                          {request.status === 'PENDING' ? 'Iniciar Cotización' : 'Continuar'}
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      ) : (
                        <span className="text-sm text-gray-500">
                          {request.status === 'COMPLETED' && '✓ Completada'}
                          {request.status === 'SENT' && '✓ Enviada'}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
