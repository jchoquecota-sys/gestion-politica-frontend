'use client';

import { Users, Building2, CalendarCheck } from 'lucide-react';
import Image from 'next/image';
import type { PublicStat } from '../types';
import { CAMPAIGN_DEFAULTS, hexToRgba, shadeColor } from '../utils/colors';

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
  },
  {
    key: 'total_bases' as const,
    label: 'Bases Territoriales',
    sublabel: 'Puntos de apoyo',
    icon: Building2,
  },
  {
    key: 'total_actividades' as const,
    label: 'Actividades',
    sublabel: 'Eventos programados',
    icon: CalendarCheck,
  },
];

export function PublicStatsGrid({ stats, isLoading, colorPrimario }: PublicStatsGridProps) {
  const primary = colorPrimario ?? CAMPAIGN_DEFAULTS.primary;

  return (
    <section id="estadisticas" className="relative py-28 overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/images/bg-estadisticas.jpg"
          alt="Fondo de Estadísticas"
          fill
          className="object-cover"
          quality={90}
        />
      </div>

      {/* Dark overlay for all modes */}
      <div
        className="absolute inset-0 z-0"
        style={{
          background: `linear-gradient(135deg, ${hexToRgba(primary, 0.65)} 0%, ${hexToRgba(shadeColor(primary, 0.28), 0.75)} 50%, ${hexToRgba(shadeColor(primary, 0.52), 0.85)} 100%)`,
        }}
      />

      {/* Decorative orbs */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-white/5 rounded-full blur-3xl pointer-events-none translate-x-1/3 -translate-y-1/2" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[var(--campaign-primary)]/15 rounded-full blur-3xl pointer-events-none -translate-x-1/3 translate-y-1/2" />

      {/* Decorative rings */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] border border-white/5 rounded-full" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border border-white/5 rounded-full" />
      </div>

      {/* Secondary accent line at top */}
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-[var(--campaign-primary)] to-transparent" />

      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center mb-14">
          {/* Eyebrow in secondary color */}
          <p className="text-sm font-bold uppercase tracking-widest mb-3 text-[#c06060]">Nuestra Fuerza</p>
          <h2 className="text-4xl font-black text-white">La campaña en números</h2>
          <p className="text-white/50 mt-3 max-w-xl mx-auto text-sm">
            Una estructura territorial sólida, organizada y comprometida con el cambio.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-5xl mx-auto">
          {statItems.map((item) => {
            const Icon = item.icon;
            const value = stats?.[item.key] ?? 0;

            return (
              <div
                key={item.key}
                className="group relative bg-white/8 backdrop-blur-sm rounded-2xl border border-white/10 hover:bg-white/12 hover:border-white/20 transition-all duration-300 hover:-translate-y-1 overflow-hidden shadow-sm"
              >
                {/* Secondary accent: left border strip */}
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-[var(--campaign-primary)]/80 via-[var(--campaign-primary)]/40 to-transparent rounded-l-2xl" />

                {/* Inner glow top-right */}
                <div className="absolute top-0 right-0 w-28 h-28 bg-white/4 rounded-full blur-2xl group-hover:bg-white/7 transition-all duration-500" />

                {isLoading ? (
                  <div className="p-6 space-y-3 animate-pulse">
                    <div className="h-10 bg-white/10 rounded w-3/4" />
                    <div className="h-5 bg-white/5 rounded w-full" />
                    <div className="h-4 bg-white/5 rounded w-2/3" />
                  </div>
                ) : (
                  <div className="p-6">
                    {/* Number + Icon row — no gap */}
                    <div className="flex items-end gap-3 leading-none">
                      <p className="text-6xl font-black text-white tabular-nums leading-none">
                        {value.toLocaleString('es-PE')}
                      </p>
                      {/* Icon badge next to number */}
                      <div
                        className="mb-1 w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: 'rgba(137, 48, 48, 0.35)', border: '1px solid rgba(137, 48, 48, 0.5)' }}
                      >
                        <Icon className="h-5 w-5 text-white" />
                      </div>
                    </div>

                    {/* Divider in secondary color */}
                    <div className="mt-4 mb-3 h-px w-12 bg-gradient-to-r from-[var(--campaign-primary)]/70 to-transparent" />

                    <p className="text-lg font-bold text-white/90 leading-tight">{item.label}</p>
                    <p className="text-[11px] text-white/35 mt-1 uppercase tracking-widest font-semibold">{item.sublabel}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
