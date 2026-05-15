'use client';

import { Globe, MessageCircle } from 'lucide-react';
import { SocialIcon } from './SocialIcon';
import type { CandidateInfo } from '../types';

interface PublicFooterProps {
  candidate: CandidateInfo | null;
}

export function PublicFooter({ candidate }: PublicFooterProps) {
  const year = new Date().getFullYear();
  const redes = candidate?.redes_sociales ?? {};

  return (
    <footer
      className="text-white py-16"
      style={{ background: `linear-gradient(135deg, ${candidate?.color_primario ?? '#1e3a5f'} 0%, #0f1e33 100%)` }}
    >
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-12">
          {/* Brand */}
          <div className="space-y-4">
            <h3 className="text-2xl font-black">{candidate?.nombre_candidato ?? 'Candidato'}</h3>
            {candidate?.cargo_candidatura && (
              <p className="text-white/60 font-medium">{candidate.cargo_candidatura}</p>
            )}
            {candidate?.eslogan && (
              <p className="text-white/80 italic text-sm">"{candidate.eslogan}"</p>
            )}
          </div>

          {/* Links */}
          <div className="space-y-4">
            <h4 className="font-bold text-white/90 uppercase tracking-wider text-xs">Navegar</h4>
            <ul className="space-y-2">
              {[
                { href: '#estadisticas', label: 'Avances' },
                { href: '#noticias', label: 'Noticias' },
                { href: '#calendario', label: 'Agenda' },
                { href: '#mapa', label: 'Bases' },
              ].map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="text-white/60 hover:text-white transition-colors text-sm font-medium"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Social */}
          <div className="space-y-4">
            <h4 className="font-bold text-white/90 uppercase tracking-wider text-xs">Redes Sociales</h4>
            <div className="flex gap-3 flex-wrap">
              {redes.facebook && (
                <a href={redes.facebook} target="_blank" rel="noopener noreferrer"
                  className="w-10 h-10 rounded-xl bg-white/10 hover:bg-blue-600 flex items-center justify-center transition-colors border border-white/10">
                  <SocialIcon network="facebook" className="h-4 w-4" />
                </a>
              )}
              {redes.instagram && (
                <a href={redes.instagram} target="_blank" rel="noopener noreferrer"
                  className="w-10 h-10 rounded-xl bg-white/10 hover:bg-pink-600 flex items-center justify-center transition-colors border border-white/10">
                  <SocialIcon network="instagram" className="h-4 w-4" />
                </a>
              )}
              {redes.tiktok && (
                <a href={redes.tiktok} target="_blank" rel="noopener noreferrer"
                  className="w-10 h-10 rounded-xl bg-white/10 hover:bg-slate-600 flex items-center justify-center transition-colors border border-white/10">
                  <SocialIcon network="tiktok" className="h-4 w-4" />
                </a>
              )}
              {redes.twitter && (
                <a href={redes.twitter} target="_blank" rel="noopener noreferrer"
                  className="w-10 h-10 rounded-xl bg-white/10 hover:bg-sky-500 flex items-center justify-center transition-colors border border-white/10">
                  <SocialIcon network="twitter" className="h-4 w-4" />
                </a>
              )}
              {redes.whatsapp && (
                <a href={`https://wa.me/${redes.whatsapp}`} target="_blank" rel="noopener noreferrer"
                  className="w-10 h-10 rounded-xl bg-white/10 hover:bg-green-600 flex items-center justify-center transition-colors border border-white/10">
                  <SocialIcon network="whatsapp" className="h-4 w-4" />
                </a>
              )}
            </div>
            {!Object.values(redes).some(Boolean) && (
              <p className="text-white/40 text-sm">Redes no configuradas</p>
            )}
          </div>
        </div>


        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-white/40 text-sm">
            © {year} {candidate?.nombre_candidato ?? 'Campaña Política'}. Todos los derechos reservados.
          </p>
          <a href="/login" className="text-white/30 hover:text-white/60 text-xs transition-colors">
            Acceso al Sistema Interno
          </a>
        </div>
      </div>
    </footer>
  );
}
