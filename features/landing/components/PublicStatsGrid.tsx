'use client';

import { Users, MapPin, Building2, CalendarCheck } from 'lucide-react';
import type { PublicStat } from '../types';

interface PublicStatsGridProps {
  stats: PublicStat | undefined;
  isLoading: boolean;
  colorPrimario?: string;
}

const statItems = [
  {
    key: 'total_simpatizantes' as const,
    label: 'Simpatizantes',
    sublabel: 'Red de apoyo activa',
    icon: Users,
    gradient: 'from-blue-600 to-blue-700',
  },
  {
    key: 'total_sectores' as const,
    label: 'Sectores',
    sublabel: 'Zonas organizadas',
    icon: MapPin,
    gradient: 'from-emerald-600 to-emerald-700',
  },
  {
    key: 'total_bases' as const,
    label: 'Bases',
    sublabel: 'Puntos de apoyo',
    icon: Building2,
    gradient: 'from-violet-600 to-violet-700',
  },
  {
    key: 'total_actividades' as const,
    label: 'Actividades',
    sublabel: 'Eventos programados',
    icon: CalendarCheck,
    gradient: 'from-amber-500 to-orange-600',
  },
];

export function PublicStatsGrid({ stats, isLoading }: PublicStatsGridProps) {
  return (
    <section id="estadisticas" className="py-20 bg-slate-50">
      <div className="container mx-auto px-6">
        <div className="text-center mb-14">
          <p className="text-sm font-bold uppercase tracking-widest text-blue-600 mb-2">Nuestra Fuerza</p>
          <h2 className="text-4xl font-black text-slate-900">La campaña en números</h2>
          <p className="text-slate-500 mt-3 max-w-xl mx-auto">
            Una estructura territorial sólida, organizada y comprometida con el cambio.
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {statItems.map((item) => {
            const Icon = item.icon;
            const value = stats?.[item.key] ?? 0;

            return (
              <div
                key={item.key}
                className="group relative bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden"
              >
                {/* Background glow */}
                <div className={`absolute inset-0 bg-gradient-to-br ${item.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />

                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${item.gradient} flex items-center justify-center mb-4 shadow-md`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>

                {isLoading ? (
                  <div className="space-y-2 animate-pulse">
                    <div className="h-10 bg-slate-200 rounded w-3/4" />
                    <div className="h-4 bg-slate-100 rounded w-full" />
                  </div>
                ) : (
                  <>
                    <p className="text-4xl font-black text-slate-900 tabular-nums">
                      {value.toLocaleString('es-PE')}
                    </p>
                    <p className="text-base font-semibold text-slate-700 mt-1">{item.label}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{item.sublabel}</p>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
