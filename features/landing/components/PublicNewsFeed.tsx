'use client';

import Image from 'next/image';
import { Calendar, Tag } from 'lucide-react';
import type { PublicNoticia } from '../types';

interface PublicNewsFeedProps {
  noticias: PublicNoticia[];
  isLoading: boolean;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('es-PE', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export function PublicNewsFeed({ noticias, isLoading }: PublicNewsFeedProps) {
  return (
    <section id="noticias" className="relative py-24 bg-[#070d1a] overflow-hidden">
      {/* Decorative glow */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl pointer-events-none translate-x-1/3 -translate-y-1/3" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-brand-secondary/5 rounded-full blur-3xl pointer-events-none -translate-x-1/3 translate-y-1/3" />

      {/* Top border accent in secondary color */}
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-[#893030] to-transparent" />

      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center mb-14">
          <p className="text-sm font-bold uppercase tracking-widest mb-3" style={{ color: '#c06060' }}>Campaña en Acción</p>
          <h2 className="text-4xl font-black text-white">Noticias y Actividades</h2>
          <p className="text-slate-400 mt-3 max-w-xl mx-auto">
            Conoce lo que estamos haciendo en cada rincón del distrito.
          </p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="rounded-2xl overflow-hidden border border-slate-800 animate-pulse">
                <div className="h-52 bg-slate-800" />
                <div className="p-6 space-y-3 bg-slate-900">
                  <div className="h-4 bg-slate-800 rounded w-1/3" />
                  <div className="h-6 bg-slate-800 rounded" />
                  <div className="h-4 bg-slate-800 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : noticias.length === 0 ? (
          <div className="text-center py-20 text-slate-500">
            <Calendar className="h-12 w-12 mx-auto mb-4 opacity-30" />
            <p className="text-lg">Próximamente se publicarán noticias de la campaña.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {noticias.map((noticia, idx) => (
              <article
                key={`noticia-${noticia.id}-${idx}`}
                className="group relative flex flex-col rounded-2xl overflow-hidden bg-slate-900 border border-slate-800 hover:border-[#893030]/40 hover:shadow-2xl hover:shadow-[#893030]/5 hover:-translate-y-1 transition-all duration-300"
              >
                {/* Left accent border */}
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#893030]" />

                {/* Cover image */}
                <div className="relative h-52 overflow-hidden bg-slate-800 flex-shrink-0">
                  {noticia.foto_portada_url ? (
                    <Image
                      src={noticia.foto_portada_url}
                      alt={noticia.titulo}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500 opacity-90"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center">
                      <Calendar className="h-10 w-10 text-primary/40" />
                    </div>
                  )}
                  {noticia.tipo && (
                    <span className="absolute top-3 left-3 inline-flex items-center gap-1.5 bg-slate-900/90 text-slate-200 text-xs font-semibold px-3 py-1 rounded-full border border-slate-700">
                      <Tag className="h-3 w-3 text-primary" /> {noticia.tipo}
                    </span>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 p-5 flex flex-col gap-2">
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                    <Calendar className="h-3.5 w-3.5" />
                    {formatDate(noticia.fecha_actividad)}
                  </div>
                  <h3 className="text-base font-bold text-white leading-snug group-hover:text-primary transition-colors line-clamp-2">
                    {noticia.titulo}
                  </h3>
                  {noticia.descripcion && (
                    <p className="text-sm text-slate-400 leading-relaxed line-clamp-3 flex-1">
                      {noticia.descripcion}
                    </p>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
