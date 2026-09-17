'use client';

import Image from 'next/image';
import { Globe, MessageCircle } from 'lucide-react';
import { SocialIcon } from './SocialIcon';
import type { CandidateInfo } from '../types';
import { CAMPAIGN_DEFAULTS, shadeColor } from '../utils/colors';

interface PublicFooterProps {
  candidate: CandidateInfo | null;
}

export function PublicFooter({ candidate }: PublicFooterProps) {
  const year = new Date().getFullYear();
  const redes = candidate?.redes_sociales ?? {};
  const primary = candidate?.color_primario ?? CAMPAIGN_DEFAULTS.primary;
  const secondary = candidate?.color_secundario ?? CAMPAIGN_DEFAULTS.secondary;
  const primaryMid = shadeColor(primary, 0.28);
  const primaryDark = shadeColor(primary, 0.52);

  return (
    <footer className="relative text-white overflow-hidden">
      <div
        className="absolute inset-0"
        style={{ background: `linear-gradient(135deg, ${primary} 0%, ${primaryMid} 60%, ${primaryDark} 100%)` }}
      />
      <div
        className="absolute top-0 left-0 right-0 h-0.5"
        style={{ background: `linear-gradient(to right, transparent, ${secondary}, transparent)` }}
      />
      {/* Subtle orb */}
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-white/4 rounded-full blur-3xl pointer-events-none translate-x-1/3 translate-y-1/3" />

      <div className="container mx-auto px-6 py-16 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-12">
          {/* Brand */}
          <div className="space-y-4">
            {candidate?.logo_url && (
              <div className="relative h-16 w-16">
                <Image
                  src={candidate.logo_url}
                  alt="Logo Ahora Nación Tacna"
                  fill
                  className="object-contain"
                  sizes="64px"
                />
              </div>
            )}
            <h3 className="text-2xl font-black text-white">{candidate?.nombre_candidato ?? 'Candidato'}</h3>
            {candidate?.cargo_candidatura && (
              <p className="text-white/40 text-sm font-medium uppercase tracking-wider">{candidate.cargo_candidatura}</p>
            )}
            {candidate?.eslogan && (
              <p className="text-white/60 italic text-sm border-l-2 pl-3" style={{ borderColor: `${secondary}99` }}>"{candidate.eslogan}"</p>
            )}
          </div>

          {/* Links */}
          <div className="space-y-4">
            <h4 className="font-bold text-white/40 uppercase tracking-widest text-xs">Navegar</h4>
            <ul className="space-y-2.5">
              {[
                { href: '#estadisticas', label: 'Avances' },
                { href: '#noticias', label: 'Noticias' },
                { href: '#calendario', label: 'Agenda' },
                { href: '#mapa', label: 'Bases' },
              ].map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="text-white/50 hover:text-white transition-colors text-sm font-medium flex items-center gap-2 group"
                  >
                    <span className="w-4 h-px bg-white/20 group-hover:bg-white/60 group-hover:w-6 transition-all duration-300" />
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Social */}
          <div className="space-y-4">
            <h4 className="font-bold text-white/40 uppercase tracking-widest text-xs">Redes Sociales</h4>
            <div className="flex gap-2.5 flex-wrap">
              {redes.facebook && (
                <a href={redes.facebook} target="_blank" rel="noopener noreferrer"
                  className="w-10 h-10 rounded-xl bg-white/5 hover:bg-blue-600 flex items-center justify-center transition-colors border border-white/8 hover:border-transparent">
                  <SocialIcon network="facebook" className="h-4 w-4" />
                </a>
              )}
              {redes.instagram && (
                <a href={redes.instagram} target="_blank" rel="noopener noreferrer"
                  className="w-10 h-10 rounded-xl bg-white/5 hover:bg-pink-600 flex items-center justify-center transition-colors border border-white/8 hover:border-transparent">
                  <SocialIcon network="instagram" className="h-4 w-4" />
                </a>
              )}
              {redes.tiktok && (
                <a href={redes.tiktok} target="_blank" rel="noopener noreferrer"
                  className="w-10 h-10 rounded-xl bg-white/5 hover:bg-slate-600 flex items-center justify-center transition-colors border border-white/8 hover:border-transparent">
                  <SocialIcon network="tiktok" className="h-4 w-4" />
                </a>
              )}
              {redes.twitter && (
                <a href={redes.twitter} target="_blank" rel="noopener noreferrer"
                  className="w-10 h-10 rounded-xl bg-white/5 hover:bg-sky-500 flex items-center justify-center transition-colors border border-white/8 hover:border-transparent">
                  <SocialIcon network="twitter" className="h-4 w-4" />
                </a>
              )}
              {redes.whatsapp && (
                <a href={`https://wa.me/${redes.whatsapp}`} target="_blank" rel="noopener noreferrer"
                  className="w-10 h-10 rounded-xl bg-white/5 hover:bg-green-600 flex items-center justify-center transition-colors border border-white/8 hover:border-transparent">
                  <SocialIcon network="whatsapp" className="h-4 w-4" />
                </a>
              )}
            </div>
            {!Object.values(redes).some(Boolean) && (
              <p className="text-white/25 text-sm">Redes no configuradas</p>
            )}
          </div>
        </div>

        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-white/25 text-sm">
            © {year} {candidate?.nombre_candidato ?? 'Campaña Política'}. Todos los derechos reservados.
          </p>
          <a href="/login" className="text-white/20 hover:text-white/50 text-xs transition-colors">
            Acceso al Sistema Interno
          </a>
        </div>
      </div>
    </footer>
  );
}
