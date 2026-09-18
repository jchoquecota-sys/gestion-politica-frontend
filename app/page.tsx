'use client';

import Image from 'next/image';
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
import { CAMPAIGN_DEFAULTS, hexToRgba, shadeColor } from '@/features/landing/utils/colors';

// Leaflet requiere importación dinámica (no SSR)
const PublicBasesMap = dynamic(
  () => import('@/features/landing/components/PublicBasesMap'),
  { ssr: false, loading: () => <div className="h-full w-full bg-slate-100 animate-pulse rounded-2xl" /> }
);

export default function LandingPage() {
  const { data, isLoading } = usePublicLanding();

  const candidate = data?.candidate ?? null;
  const stats = data?.stats;
  const primary = candidate?.color_primario ?? CAMPAIGN_DEFAULTS.primary;
  const secondary = candidate?.color_secundario ?? CAMPAIGN_DEFAULTS.secondary;

  // Aseguramos que sean arrays (Laravel a veces envía objetos si las llaves no son correlativas)
  const mapa = (Array.isArray(data?.mapa_bases) ? data.mapa_bases : Object.values(data?.mapa_bases ?? {})) as MapaBase[];
  const noticias = (Array.isArray(data?.noticias) ? data.noticias : Object.values(data?.noticias ?? {})) as PublicNoticia[];
  const calendario = (Array.isArray(data?.calendario) ? data.calendario : Object.values(data?.calendario ?? {})) as PublicEvento[];
  const distribucion = (Array.isArray(data?.distribucion_sectores) ? data.distribucion_sectores : Object.values(data?.distribucion_sectores ?? {})) as SectorDistribucion[];
  const crecimiento = (Array.isArray(data?.crecimiento_mensual) ? data.crecimiento_mensual : Object.values(data?.crecimiento_mensual ?? {})) as CrecimientoMensual[];

  return (
    <div
      className="min-h-screen overflow-x-hidden"
      style={{
        ['--campaign-primary' as string]: primary,
        ['--campaign-secondary' as string]: secondary,
      }}
    >
      {/* Navbar fija */}
      <PublicNavbar candidate={candidate} />

      {/* Hero con foto del candidato */}
      <HeroSection candidate={candidate} isLoading={isLoading} />

      {/* Noticias y actividades */}
      <PublicNewsFeed noticias={noticias} isLoading={isLoading} />

      {/* KPIs */}
      <PublicStatsGrid stats={stats} isLoading={isLoading} colorPrimario={primary} />

      {/* Calendario de eventos */}
      <PublicCalendar eventos={calendario} isLoading={isLoading} />


      {/* Mapa de bases */}
      <section id="mapa" className="relative py-28 overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/bg-mapa.jpg"
            alt="Fondo de Mapa"
            fill
            className="object-cover"
            quality={90}
          />
        </div>

        {/* Dark overlay for all modes */}
        <div
          className="absolute inset-0 z-0"
          style={{
            background: `linear-gradient(135deg, ${hexToRgba(primary, 0.78)} 0%, ${hexToRgba(shadeColor(primary, 0.28), 0.85)} 50%, ${hexToRgba(shadeColor(primary, 0.52), 0.92)} 100%)`,
          }}
        />

        {/* Decorative orbs */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-white/5 rounded-full blur-3xl pointer-events-none translate-x-1/3 -translate-y-1/2" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-white/3 rounded-full blur-3xl pointer-events-none -translate-x-1/3 translate-y-1/2" />
        {/* Secondary accent detail — thin top line */}
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-[var(--campaign-primary)] to-transparent" />

        {/* Decorative concentric rings */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] border border-white/4 rounded-full" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[650px] border border-white/4 rounded-full" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] border border-white/4 rounded-full" />
        </div>

        <div className="container mx-auto px-6 relative z-10">
          <div className="text-center mb-12">
            <p className="text-sm font-bold uppercase tracking-widest mb-3 text-[#c06060]">Presencia Territorial</p>
            <h2 className="text-4xl font-black text-white">Nuestras Bases</h2>
            <p className="text-white/50 mt-3 max-w-xl mx-auto">
              Estamos presentes en cada rincón de Alto de la Alianza con puntos de apoyo organizados.
            </p>
          </div>

          {/* Map container with decorative frame */}
          <div className="relative max-w-5xl mx-auto">
            {/* Corner accents in secondary color */}
            <div className="absolute -top-2 -left-2 w-8 h-8 border-t-2 border-l-2 border-[var(--campaign-primary)] rounded-tl-lg z-20" />
            <div className="absolute -top-2 -right-2 w-8 h-8 border-t-2 border-r-2 border-[var(--campaign-primary)] rounded-tr-lg z-20" />
            <div className="absolute -bottom-2 -left-2 w-8 h-8 border-b-2 border-l-2 border-[var(--campaign-primary)] rounded-bl-lg z-20" />
            <div className="absolute -bottom-2 -right-2 w-8 h-8 border-b-2 border-r-2 border-[var(--campaign-primary)] rounded-br-lg z-20" />

            <div className="h-[480px] rounded-2xl overflow-hidden shadow-2xl border border-white/10 ring-1 ring-[var(--campaign-primary)]/30">
              <PublicBasesMap bases={mapa} isLoading={isLoading} />
            </div>
          </div>

          {/* Bases count badge */}
          {mapa.length > 0 && (
            <div className="flex justify-center mt-8">
              <div className="inline-flex items-center gap-2.5 bg-white/8 backdrop-blur-sm border border-white/12 rounded-full px-5 py-2.5 shadow-sm">
                <span className="w-2 h-2 rounded-full bg-[var(--campaign-primary)] animate-pulse" />
                <span className="text-white/70 text-sm font-medium">
                  <span className="text-white font-bold">{mapa.length}</span>{' '}
                  base{mapa.length !== 1 ? 's' : ''} activa{mapa.length !== 1 ? 's' : ''} en Alto de la Alianza
                </span>
              </div>
            </div>
          )}
        </div>
      </section>


      {/* Gráficos de distribución */}
      <PublicCharts
        distribucionSectores={distribucion}
        crecimientoMensual={crecimiento}
        isLoading={isLoading}
      />


      {/* Footer */}
      <PublicFooter candidate={candidate} />
    </div>
  );
}
