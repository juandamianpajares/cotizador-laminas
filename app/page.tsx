"use client";

import { useRouter } from 'next/navigation';
import { Building2, Home, Car } from 'lucide-react';

export default function HomePage() {
  const router = useRouter();

  const verticals = [
    {
      id: 'residential',
      name: 'Residencial',
      description: 'Hogares y departamentos',
      icon: Home,
      color: 'blue',
      route: '/cotizar/obras?tipo=residential',
    },
    {
      id: 'commercial',
      name: 'Comercial',
      description: 'Oficinas y edificios',
      icon: Building2,
      color: 'green',
      route: '/cotizar/obras?tipo=commercial',
    },
    {
      id: 'automotive',
      name: 'Automotriz',
      description: 'Vehículos',
      icon: Car,
      color: 'red',
      route: '/cotizar/vehiculos',
    },
  ];

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Cotizador de Láminas y Films
          </h1>
          <p className="text-xl text-gray-600">
            Selecciona el tipo de cotización que necesitas
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {verticals.map((vertical) => {
            const Icon = vertical.icon;
            return (
              <button
                key={vertical.id}
                onClick={() => router.push(vertical.route)}
                className="p-8 rounded-xl border-2 border-gray-200 transition-all duration-200 hover:shadow-lg hover:scale-105 hover:border-blue-300 bg-white"
              >
                <Icon className={`w-16 h-16 mx-auto mb-4 text-${vertical.color}-500`} />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {vertical.name}
                </h3>
                <p className="text-sm text-gray-600">{vertical.description}</p>
              </button>
            );
          })}
        </div>
      </div>
    </main>
  );
}
