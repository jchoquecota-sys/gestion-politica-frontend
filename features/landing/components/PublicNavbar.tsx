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
    const handler = () => setIsScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  const colorPrimario = candidate?.color_primario ?? '#1e3a5f';

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-white/95 backdrop-blur-md shadow-md border-b border-slate-100'
          : 'bg-transparent'
      }`}
    >
      <div className="container mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo / Name */}
        <a href="#" className="flex items-center gap-3">
          {candidate?.logo_url ? (
            <div className={`relative h-12 w-12 transition-transform duration-300 ${isScrolled ? 'scale-110' : 'scale-100'}`}>
              <Image src={candidate.logo_url} alt="Logo" fill className="object-contain" />
            </div>
          ) : (
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center text-white font-black text-lg shadow-md"
              style={{ backgroundColor: colorPrimario }}
            >
              {(candidate?.nombre_candidato ?? 'C')[0]}
            </div>
          )}
          <span
            className={`font-black text-lg transition-colors duration-300 ${
              isScrolled ? 'text-slate-900' : 'text-white'
            }`}
          >
            {candidate?.nombre_candidato ?? 'Campaña'}
          </span>
        </a>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className={`text-sm font-semibold transition-colors duration-200 hover:opacity-100 ${
                isScrolled ? 'text-slate-600 hover:text-blue-700' : 'text-white/80 hover:text-white'
              }`}
            >
              {link.label}
            </a>
          ))}
          <Link
            href="/login"
            className={`text-sm font-semibold px-5 py-2 rounded-lg transition-all duration-200 ${
              isScrolled
                ? 'bg-blue-700 text-white hover:bg-blue-800'
                : 'bg-white/15 text-white border border-white/30 hover:bg-white/25'
            }`}
          >
            Acceso Interno
          </Link>
        </nav>

        {/* Mobile menu button */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className={`md:hidden p-2 rounded-lg transition-colors ${
            isScrolled ? 'text-slate-700 hover:bg-slate-100' : 'text-white hover:bg-white/10'
          }`}
          aria-label="Abrir menú"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-white border-t border-slate-100 shadow-xl">
          <div className="container mx-auto px-6 py-4 flex flex-col gap-2">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="text-slate-700 font-semibold py-3 border-b border-slate-50 last:border-0 hover:text-blue-700 transition-colors"
              >
                {link.label}
              </a>
            ))}
            <Link
              href="/login"
              className="mt-2 text-center font-semibold px-5 py-3 rounded-xl bg-blue-700 text-white hover:bg-blue-800 transition-colors"
            >
              Acceso Interno
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
