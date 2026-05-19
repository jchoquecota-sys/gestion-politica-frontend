'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import type { CandidateInfo } from '../types';

interface PublicNavbarProps {
  candidate: CandidateInfo | null;
}

const navLinks = [
  { href: '#estadisticas', label: 'Avances' },
  { href: '#noticias', label: 'Noticias' },
  { href: '#calendario', label: 'Agenda' },
  { href: '#mapa', label: 'Bases' },
];

export function PublicNavbar({ candidate }: PublicNavbarProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handler = () => setIsScrolled(window.scrollY > 60);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled
          ? 'bg-[#070d1a] shadow-xl shadow-black/30 border-b border-white/5'
          : 'bg-transparent'
      }`}
    >
      <div className="container mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo / Name */}
        <a href="#" className="flex items-center gap-3">
          {candidate?.logo_url ? (
            <div className="relative h-10 w-10">
              <Image src={candidate.logo_url} alt="Logo" fill className="object-contain" />
            </div>
          ) : (
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center text-white font-black text-lg"
              style={{ backgroundColor: candidate?.color_primario ?? '#042f98' }}
            >
              {(candidate?.nombre_candidato ?? 'C')[0]}
            </div>
          )}
          <span className="font-black text-lg text-white tracking-tight">
            {candidate?.nombre_candidato ?? 'Campaña'}
          </span>
        </a>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm font-semibold text-white/60 hover:text-white transition-colors duration-200"
            >
              {link.label}
            </a>
          ))}
          <Link
            href="/login"
            className="text-sm font-semibold px-5 py-2 rounded-lg bg-white/8 text-white/80 border border-white/10 hover:bg-white/15 hover:text-white hover:border-white/20 transition-all duration-200"
          >
            Acceso Interno
          </Link>
        </nav>

        {/* Mobile menu button */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden p-2 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors"
          aria-label="Abrir menú"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-[#070d1a] border-t border-white/5">
          <div className="container mx-auto px-6 py-4 flex flex-col gap-1">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="text-white/70 font-semibold py-3 px-3 rounded-lg border-b border-white/5 last:border-0 hover:text-white hover:bg-white/5 transition-colors"
              >
                {link.label}
              </a>
            ))}
            <Link
              href="/login"
              className="mt-2 text-center font-semibold px-5 py-3 rounded-xl bg-white/8 text-white border border-white/10 hover:bg-white/15 transition-colors"
            >
              Acceso Interno
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
