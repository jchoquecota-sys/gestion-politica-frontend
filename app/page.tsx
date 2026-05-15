'use client';

import dynamic from 'next/dynamic';
import { usePublicLanding } from '@/features/landing/hooks/usePublicLanding';
import type { 
  MapaBase, 
  PublicNoticia, 
  PublicEvento, 
  SectorDistribucion, 
  CrecimientoMensual 
} from '@/features/landing/types';
import { HeroSection } from '@/features/landing/components/HeroSection';
import { PublicNavbar } from '@/features/landing/components/PublicNavbar';
import { PublicStatsGrid } from '@/features/landing/components/PublicStatsGrid';
import { PublicNewsFeed } from '@/features/landing/components/PublicNewsFeed';
import { PublicCalendar } from '@/features/landing/components/PublicCalendar';
import { PublicCharts } from '@/features/landing/components/PublicCharts';
import { PublicFooter } from '@/features/landing/components/PublicFooter';

// Leaflet requiere importación dinámica (no SSR)
const PublicBasesMap = dynamic(
  () => import('@/features/landing/components/PublicBasesMap'),
  { ssr: false, loading: () => <div className="h-full w-full bg-slate-100 animate-pulse rounded-2xl" /> }
);

export default function LandingPage() {
  const { data, isLoading } = usePublicLanding();

  const candidate = data?.candidate ?? null;
  const stats = data?.stats;
  
  // Aseguramos que sean arrays (Laravel a veces envía objetos si las llaves no son correlativas)
  const mapa = (Array.isArray(data?.mapa_bases) ? data.mapa_bases : Object.values(data?.mapa_bases ?? {})) as MapaBase[];
  const noticias = (Array.isArray(data?.noticias) ? data.noticias : Object.values(data?.noticias ?? {})) as PublicNoticia[];
  const calendario = (Array.isArray(data?.calendario) ? data.calendario : Object.values(data?.calendario ?? {})) as PublicEvento[];
  const distribucion = (Array.isArray(data?.distribucion_sectores) ? data.distribucion_sectores : Object.values(data?.distribucion_sectores ?? {})) as SectorDistribucion[];
  const crecimiento = (Array.isArray(data?.crecimiento_mensual) ? data.crecimiento_mensual : Object.values(data?.crecimiento_mensual ?? {})) as CrecimientoMensual[];

  return (
    <div className="min-h-screen overflow-x-hidden">
      {/* Navbar fija */}
      <PublicNavbar candidate={candidate} />

      {/* Hero con foto del candidato */}
      <HeroSection candidate={candidate} isLoading={isLoading} />

      {/* KPIs */}
      <PublicStatsGrid stats={stats} isLoading={isLoading} />

      {/* Noticias y actividades */}
      <PublicNewsFeed noticias={noticias} isLoading={isLoading} />

      {/* Gráficos de distribución */}
      <PublicCharts
        distribucionSectores={distribucion}
        crecimientoMensual={crecimiento}
        isLoading={isLoading}
      />

      {/* Mapa de bases */}
      <section id="mapa" className="py-20 bg-slate-50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-14">
            <p className="text-sm font-bold uppercase tracking-widest text-blue-600 mb-2">Presencia Territorial</p>
            <h2 className="text-4xl font-black text-slate-900">Nuestras Bases</h2>
            <p className="text-slate-500 mt-3 max-w-xl mx-auto">
              Estamos presentes en cada rincón del distrito con puntos de apoyo organizados.
            </p>
          </div>
          <div className="h-[500px] rounded-2xl overflow-hidden shadow-lg border border-slate-200">
            <PublicBasesMap bases={mapa} isLoading={isLoading} />
          </div>
          {mapa.length > 0 && (
            <p className="text-center text-slate-400 text-sm mt-4">
              {mapa.length} base{mapa.length !== 1 ? 's' : ''} activa{mapa.length !== 1 ? 's' : ''} en el distrito
            </p>
          )}
        </div>
      </section>

      {/* Calendario de eventos */}
      <PublicCalendar eventos={calendario} isLoading={isLoading} />

      {/* Footer */}
      <PublicFooter candidate={candidate} />
    </div>
  );
}
