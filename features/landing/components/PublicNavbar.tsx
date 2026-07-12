'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import { ModeToggle } from '@/components/mode-toggle';
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
          ? 'bg-background/95 backdrop-blur-md shadow-lg border-b border-border dark:bg-[#070d1a]/95 dark:shadow-black/30 dark:border-white/5'
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
              className="w-9 h-9 rounded-lg flex items-center justify-center text-primary-foreground font-black text-lg"
              style={{ backgroundColor: candidate?.color_primario ?? '#042f98' }}
            >
              {(candidate?.nombre_candidato ?? 'C')[0]}
            </div>
          )}
          <span className={`font-black text-lg tracking-tight ${isScrolled ? 'text-foreground dark:text-white' : 'text-white'}`}>
            {candidate?.nombre_candidato ?? 'Campaña'}
          </span>
        </a>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className={`text-sm font-semibold transition-colors duration-200 ${
                isScrolled
                  ? 'text-muted-foreground hover:text-foreground dark:text-white/60 dark:hover:text-white'
                  : 'text-white/80 hover:text-white'
              }`}
            >
              {link.label}
            </a>
          ))}
          <div className="flex items-center gap-4">
            <div className={!isScrolled ? '[&_button]:text-white [&_button]:hover:bg-white/10 [&_button]:hover:text-white' : ''}>
              <ModeToggle />
            </div>
            <Link
              href="/login"
              className={`text-sm font-semibold px-5 py-2 rounded-lg border transition-all duration-200 ${
                isScrolled
                  ? 'bg-secondary text-secondary-foreground border-border hover:bg-secondary/80 dark:bg-white/8 dark:text-white/80 dark:border-white/10 dark:hover:bg-white/15 dark:hover:text-white dark:hover:border-white/20'
                  : 'bg-white/10 text-white border-white/20 hover:bg-white/20 hover:border-white/30'
              }`}
            >
              Acceso Interno
            </Link>
          </div>
        </nav>

        {/* Mobile menu button */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className={`md:hidden p-2 rounded-lg transition-colors ${
            isScrolled
              ? 'text-muted-foreground hover:text-foreground hover:bg-accent dark:text-white/70 dark:hover:text-white dark:hover:bg-white/10'
              : 'text-white/80 hover:text-white hover:bg-white/10'
          }`}
          aria-label="Abrir menú"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-background border-t border-border dark:bg-[#070d1a] dark:border-white/5">
          <div className="container mx-auto px-6 py-4 flex flex-col gap-1">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="text-muted-foreground font-semibold py-3 px-3 rounded-lg border-b border-border last:border-0 hover:text-foreground hover:bg-accent transition-colors dark:text-white/70 dark:border-white/5 dark:hover:text-white dark:hover:bg-white/5"
              >
                {link.label}
              </a>
            ))}
            <div className="mt-2 flex flex-col gap-3">
              <div className="flex justify-center">
                <ModeToggle />
              </div>
              <Link
                href="/login"
                className="text-center font-semibold px-5 py-3 rounded-xl bg-primary text-primary-foreground border border-transparent hover:bg-primary/90 transition-colors dark:bg-white/8 dark:text-white dark:border-white/10 dark:hover:bg-white/15"
              >
                Acceso Interno
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
