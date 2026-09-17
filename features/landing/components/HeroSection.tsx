'use client';

import Image from 'next/image';
import { Globe, MessageCircle } from 'lucide-react';
import { SocialIcon } from './SocialIcon';
import type { CandidateInfo } from '../types';
import { CAMPAIGN_DEFAULTS, shadeColor } from '../utils/colors';

interface HeroSectionProps {
  candidate: CandidateInfo | null;
  isLoading: boolean;
}

export function HeroSection({ candidate, isLoading }: HeroSectionProps) {
  if (isLoading) {
    return (
      <section className="relative min-h-screen flex items-center bg-slate-900">
        <div className="container mx-auto px-6 py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-6 animate-pulse">
              <div className="h-4 bg-slate-700 rounded w-32" />
              <div className="h-16 bg-slate-700 rounded" />
              <div className="h-24 bg-slate-700 rounded" />
            </div>
            <div className="h-[500px] bg-slate-800 rounded-2xl animate-pulse" />
          </div>
        </div>
      </section>
    );
  }

  const redes = candidate?.redes_sociales ?? {};
  const primary = candidate?.color_primario ?? CAMPAIGN_DEFAULTS.primary;
  const secondary = candidate?.color_secundario ?? CAMPAIGN_DEFAULTS.secondary;
  const primaryMid = shadeColor(primary, 0.28);
  const primaryDark = shadeColor(primary, 0.52);

  return (
    <section
      className="relative min-h-screen flex items-center overflow-hidden"
      style={{ background: `linear-gradient(135deg, ${primary} 0%, ${primaryMid} 55%, ${primaryDark} 100%)` }}
    >
      {/* Background Secondary Image Overlay */}
      {candidate?.foto_secundaria_url && (
        <div className="absolute inset-0 z-0">
          <Image 
            src={candidate.foto_secundaria_url} 
            alt="Background texture" 
            fill 
            className="object-cover opacity-10 mix-blend-overlay"
          />
        </div>
      )}

      {/* Decorative elements */}
      <div className="absolute inset-0 opacity-10 z-0" style={{
      backgroundImage: `radial-gradient(circle at 20% 50%, ${secondary} 0%, transparent 50%),
                        radial-gradient(circle at 80% 20%, ${primary} 0%, transparent 40%)`
      }} />
      <div className="absolute top-0 right-0 w-96 h-96 opacity-5 translate-x-1/3 -translate-y-1/3 z-0">
        <div className="w-full h-full rounded-full border-[60px] border-white" />
      </div>

      <div className="container mx-auto px-6 py-24 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Content */}
          <div className="text-white space-y-8 order-2 lg:order-1">
            {/* Candidate Tag (No logo here as requested) */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              {candidate?.cargo_candidatura && (
                <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 text-sm font-bold tracking-wider text-white/90 uppercase">
                  <span
                    className="w-2 h-2 rounded-full animate-pulse"
                    style={{ backgroundColor: secondary }}
                  />
                  {candidate.cargo_candidatura}
                </div>
              )}
            </div>

            <div className="space-y-4">
              <h1 className="text-5xl md:text-7xl font-black leading-tight tracking-tight">
                {candidate?.nombre_candidato ?? 'Nuestro Candidato'}
              </h1>
              {candidate?.eslogan && (
                <div 
                  className="inline-block px-4 py-2 rounded-lg shadow-xl"
                  style={{ backgroundColor: secondary }}
                >
                  <p className="text-lg md:text-xl font-bold text-white italic">
                    "{candidate.eslogan}"
                  </p>
                </div>
              )}
            </div>

            {candidate?.biografia && (
              <p className="text-lg text-white/75 leading-relaxed max-w-lg">
                {candidate.biografia}
              </p>
            )}

            {/* Redes sociales */}
            {Object.keys(redes).length > 0 && (
              <div className="flex items-center gap-3 pt-2">
                <span className="text-white/50 text-sm font-medium">Síguenos:</span>
                {redes.facebook && (
                  <a href={redes.facebook} target="_blank" rel="noopener noreferrer"
                    className="w-10 h-10 rounded-full bg-white/10 hover:bg-blue-600 flex items-center justify-center transition-colors duration-200 border border-white/20">
                    <SocialIcon network="facebook" className="h-4 w-4 text-white" />
                  </a>
                )}
                {redes.instagram && (
                  <a href={redes.instagram} target="_blank" rel="noopener noreferrer"
                    className="w-10 h-10 rounded-full bg-white/10 hover:bg-pink-600 flex items-center justify-center transition-colors duration-200 border border-white/20">
                    <SocialIcon network="instagram" className="h-4 w-4 text-white" />
                  </a>
                )}
                {redes.tiktok && (
                  <a href={redes.tiktok} target="_blank" rel="noopener noreferrer"
                    className="w-10 h-10 rounded-full bg-white/10 hover:bg-slate-600 flex items-center justify-center transition-colors duration-200 border border-white/20">
                    <SocialIcon network="tiktok" className="h-4 w-4 text-white" />
                  </a>
                )}
                {redes.twitter && (
                  <a href={redes.twitter} target="_blank" rel="noopener noreferrer"
                    className="w-10 h-10 rounded-full bg-white/10 hover:bg-sky-500 flex items-center justify-center transition-colors duration-200 border border-white/20">
                    <SocialIcon network="twitter" className="h-4 w-4 text-white" />
                  </a>
                )}
                {redes.whatsapp && (
                  <a href={`https://wa.me/${redes.whatsapp}`} target="_blank" rel="noopener noreferrer"
                    className="w-10 h-10 rounded-full bg-white/10 hover:bg-green-600 flex items-center justify-center transition-colors duration-200 border border-white/20">
                    <SocialIcon network="whatsapp" className="h-4 w-4 text-white" />
                  </a>
                )}
              </div>
            )}


            {/* CTA */}
            <div className="flex flex-wrap gap-4 pt-2">
              <a href="#noticias"
                className="px-8 py-3 rounded-xl font-semibold text-white transition-all duration-200 hover:opacity-90 hover:-translate-y-0.5 shadow-lg"
                style={{ backgroundColor: secondary }}>
                Ver Actividades
              </a>
              <a href="#estadisticas"
                className="px-8 py-3 rounded-xl font-semibold text-white bg-white/10 hover:bg-white/20 transition-all duration-200 border border-white/30 hover:-translate-y-0.5">
                Nuestros Avances
              </a>
            </div>
          </div>

          {/* Photo */}
          <div className="relative order-1 lg:order-2 flex justify-center">
            <div className="relative w-[340px] h-[440px] md:w-[400px] md:h-[520px]">
              {/* Decorative ring */}
              <div
                className="absolute inset-0 rounded-[2rem] opacity-30 -rotate-3"
                style={{ background: `linear-gradient(135deg, ${secondary}, transparent)` }}
              />
              {candidate?.foto_principal_url ? (
                <Image
                  src={candidate.foto_principal_url}
                  alt={candidate.nombre_candidato}
                  fill
                  className="object-cover object-top rounded-[2rem] shadow-2xl"
                  priority
                />
              ) : (
                <div className="w-full h-full rounded-[2rem] bg-white/10 flex items-center justify-center border border-white/20">
                  <span className="text-white/40 text-lg font-medium">Foto del candidato</span>
                </div>
              )}
              {/* Floating badge removed, now used as background overlay */}
            </div>
          </div>
        </div>
      </div>

      {/* Wave divider */}
      <div className="absolute bottom-0 left-0 right-0 text-background dark:text-[#070d1a]">
        <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
          <path d="M0,40 C360,80 1080,0 1440,40 L1440,80 L0,80 Z" fill="currentColor"/>
        </svg>
      </div>
    </section>
  );
}
