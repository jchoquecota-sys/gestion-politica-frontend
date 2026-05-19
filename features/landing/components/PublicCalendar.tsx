'use client';

import { CalendarDays, Clock, Tag, CheckCircle } from 'lucide-react';
import type { PublicEvento } from '../types';

interface PublicCalendarProps {
  eventos: PublicEvento[];
  isLoading: boolean;
}

function formatEventDate(dateStr: string) {
  const date = new Date(dateStr);
  return {
    dia: date.toLocaleDateString('es-PE', { day: '2-digit' }),
    mes: date.toLocaleDateString('es-PE', { month: 'short' }).toUpperCase(),
    hora: date.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' }),
    fullDate: date.toLocaleDateString('es-PE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }),
  };
}

function isUpcoming(dateStr: string): boolean {
  return new Date(dateStr) > new Date();
}

export function PublicCalendar({ eventos, isLoading }: PublicCalendarProps) {
  return (
    <section id="calendario" className="relative py-24 bg-background dark:bg-[#070d1a] overflow-hidden">
      {/* Decorative glow */}
      <div className="absolute top-1/2 left-0 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl pointer-events-none -translate-x-1/2 -translate-y-1/2" />

      {/* Top border accent in secondary */}
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-[#893030] to-transparent" />

      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center mb-14">
          <p className="text-sm font-bold uppercase tracking-widest mb-3 text-primary dark:text-[#c06060]">Agenda</p>
          <h2 className="text-4xl font-black text-foreground dark:text-white">Próximos Eventos</h2>
          <p className="text-muted-foreground dark:text-slate-400 mt-3 max-w-xl mx-auto">
            Calendario de actividades públicas de la campaña. ¡Tu participación suma!
          </p>
        </div>

        {isLoading ? (
          <div className="max-w-3xl mx-auto space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex gap-4 bg-card dark:bg-slate-900 rounded-2xl p-5 animate-pulse border border-border dark:border-slate-800">
                <div className="w-16 h-16 rounded-xl bg-muted dark:bg-slate-800 flex-shrink-0" />
                <div className="flex-1 space-y-2 pt-1">
                  <div className="h-5 bg-muted dark:bg-slate-800 rounded w-3/4" />
                  <div className="h-4 bg-muted dark:bg-slate-800 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : eventos.length === 0 ? (
          <div className="text-center py-20 text-slate-500">
            <CalendarDays className="h-12 w-12 mx-auto mb-4 opacity-30" />
            <p className="text-lg">No hay eventos próximos publicados.</p>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto space-y-3">
            {eventos.map((evento, idx) => {
              const { dia, mes, hora, fullDate } = formatEventDate(evento.fecha_actividad);
              const upcoming = isUpcoming(evento.fecha_actividad);

              return (
                <div
                  key={`evento-${evento.id}-${idx}`}
                  className={`group relative flex gap-5 bg-card dark:bg-slate-900 rounded-2xl p-5 border transition-all duration-300 hover:border-[#893030]/30 hover:shadow-xl hover:shadow-[#893030]/5 hover:-translate-y-0.5 ${
                    upcoming ? 'border-border dark:border-slate-800' : 'border-border dark:border-slate-800 opacity-60'
                  }`}
                >
                  {/* Left accent border on upcoming events */}
                  {upcoming && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl bg-[#893030]/70" />
                  )}
                  {/* Date badge */}
                  <div className={`flex-shrink-0 w-16 h-16 rounded-xl flex flex-col items-center justify-center ${
                    upcoming
                      ? 'bg-primary text-primary-foreground dark:text-white shadow-lg shadow-primary/20'
                      : 'bg-muted dark:bg-slate-800 text-muted-foreground dark:text-slate-500'
                  }`}>
                    <span className="text-xl font-black leading-none">{dia}</span>
                    <span className="text-[10px] font-bold tracking-wider mt-0.5">{mes}</span>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <h3 className="font-bold text-foreground dark:text-white text-base leading-snug group-hover:text-primary transition-colors">
                        {evento.titulo}
                      </h3>
                      {!upcoming && (
                        <span className="flex-shrink-0 inline-flex items-center gap-1 text-xs text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 rounded-full px-2 py-0.5 font-medium">
                          <CheckCircle className="h-3 w-3" /> Realizado
                        </span>
                      )}
                    </div>

                    {evento.descripcion && (
                      <p className="text-sm text-muted-foreground dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">{evento.descripcion}</p>
                    )}

                    <div className="flex flex-wrap items-center gap-4 mt-3">
                      <span className="flex items-center gap-1.5 text-xs text-muted-foreground dark:text-slate-500 font-medium">
                        <CalendarDays className="h-3.5 w-3.5" /> {fullDate}
                      </span>
                      <span className="flex items-center gap-1.5 text-xs text-muted-foreground dark:text-slate-500 font-medium">
                        <Clock className="h-3.5 w-3.5" /> {hora}
                      </span>
                      {evento.tipo && (
                        <span className="flex items-center gap-1.5 text-xs text-primary font-semibold bg-primary/10 border border-primary/20 rounded-full px-2.5 py-0.5">
                          <Tag className="h-3 w-3" /> {evento.tipo}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
