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
    <section id="noticias" className="py-20 bg-white">
      <div className="container mx-auto px-6">
        <div className="text-center mb-14">
          <p className="text-sm font-bold uppercase tracking-widest text-blue-600 mb-2">Campaña en Acción</p>
          <h2 className="text-4xl font-black text-slate-900">Noticias y Actividades</h2>
          <p className="text-slate-500 mt-3 max-w-xl mx-auto">
            Conoce lo que estamos haciendo en cada rincón del distrito.
          </p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="rounded-2xl overflow-hidden border border-slate-100 animate-pulse">
                <div className="h-52 bg-slate-200" />
                <div className="p-6 space-y-3">
                  <div className="h-4 bg-slate-200 rounded w-1/3" />
                  <div className="h-6 bg-slate-200 rounded" />
                  <div className="h-4 bg-slate-100 rounded" />
                  <div className="h-4 bg-slate-100 rounded w-2/3" />
                </div>
              </div>
            ))}
          </div>
        ) : noticias.length === 0 ? (
          <div className="text-center py-20 text-slate-400">
            <Calendar className="h-12 w-12 mx-auto mb-4 opacity-40" />
            <p className="text-lg">Próximamente se publicarán noticias de la campaña.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {noticias.map((noticia, idx) => (
              <article
                key={`noticia-${noticia.id}-${idx}`}
                className={`group flex flex-col rounded-2xl overflow-hidden bg-white border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 ${idx === 0 ? 'md:col-span-2 lg:col-span-1' : ''}`}
              >
                {/* Cover image */}
                <div className="relative h-52 overflow-hidden bg-slate-100 flex-shrink-0">
                  {noticia.foto_portada_url ? (
                    <Image
                      src={noticia.foto_portada_url}
                      alt={noticia.titulo}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-blue-800 to-blue-900 flex items-center justify-center">
                      <Calendar className="h-10 w-10 text-white/30" />
                    </div>
                  )}
                  {noticia.tipo && (
                    <span className="absolute top-4 left-4 inline-flex items-center gap-1.5 bg-white/95 text-slate-700 text-xs font-semibold px-3 py-1 rounded-full shadow-sm">
                      <Tag className="h-3 w-3" /> {noticia.tipo}
                    </span>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 p-6 flex flex-col gap-3">
                  <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
                    <Calendar className="h-3.5 w-3.5" />
                    {formatDate(noticia.fecha_actividad)}
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 leading-snug group-hover:text-blue-700 transition-colors">
                    {noticia.titulo}
                  </h3>
                  {noticia.descripcion && (
                    <p className="text-sm text-slate-500 leading-relaxed line-clamp-3 flex-1">
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
