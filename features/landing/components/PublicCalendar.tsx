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
    <section id="calendario" className="py-20 bg-slate-50">
      <div className="container mx-auto px-6">
        <div className="text-center mb-14">
          <p className="text-sm font-bold uppercase tracking-widest text-blue-600 mb-2">Agenda</p>
          <h2 className="text-4xl font-black text-slate-900">Próximos Eventos</h2>
          <p className="text-slate-500 mt-3 max-w-xl mx-auto">
            Calendario de actividades públicas de la campaña. ¡Tu participación suma!
          </p>
        </div>

        {isLoading ? (
          <div className="max-w-3xl mx-auto space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex gap-4 bg-white rounded-2xl p-5 animate-pulse border border-slate-100">
                <div className="w-16 h-16 rounded-xl bg-slate-200 flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-5 bg-slate-200 rounded w-3/4" />
                  <div className="h-4 bg-slate-100 rounded w-1/2" />
                  <div className="h-3 bg-slate-100 rounded w-1/3" />
                </div>
              </div>
            ))}
          </div>
        ) : eventos.length === 0 ? (
          <div className="text-center py-20 text-slate-400">
            <CalendarDays className="h-12 w-12 mx-auto mb-4 opacity-40" />
            <p className="text-lg">No hay eventos próximos publicados.</p>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto space-y-4">
            {eventos.map((evento, idx) => {
              const { dia, mes, hora, fullDate } = formatEventDate(evento.fecha_actividad);
              const upcoming = isUpcoming(evento.fecha_actividad);

              return (
                <div
                  key={`evento-${evento.id}-${idx}`}
                  className={`group flex gap-5 bg-white rounded-2xl p-5 border transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 ${
                    upcoming ? 'border-slate-100' : 'border-slate-100 opacity-70'
                  }`}
                >
                  {/* Date badge */}
                  <div className={`flex-shrink-0 w-16 h-16 rounded-xl flex flex-col items-center justify-center shadow-sm ${
                    upcoming ? 'bg-blue-700 text-white' : 'bg-slate-200 text-slate-500'
                  }`}>
                    <span className="text-xl font-black leading-none">{dia}</span>
                    <span className="text-[10px] font-bold tracking-wider mt-0.5">{mes}</span>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <h3 className="font-bold text-slate-900 text-base leading-snug group-hover:text-blue-700 transition-colors">
                        {evento.titulo}
                      </h3>
                      {!upcoming && (
                        <span className="flex-shrink-0 inline-flex items-center gap-1 text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full px-2 py-0.5 font-medium">
                          <CheckCircle className="h-3 w-3" /> Realizado
                        </span>
                      )}
                    </div>

                    {evento.descripcion && (
                      <p className="text-sm text-slate-500 mt-1 line-clamp-2 leading-relaxed">{evento.descripcion}</p>
                    )}

                    <div className="flex flex-wrap items-center gap-4 mt-3">
                      <span className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
                        <CalendarDays className="h-3.5 w-3.5" /> {fullDate}
                      </span>
                      <span className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
                        <Clock className="h-3.5 w-3.5" /> {hora}
                      </span>
                      {evento.tipo && (
                        <span className="flex items-center gap-1.5 text-xs text-blue-600 font-semibold bg-blue-50 rounded-full px-2.5 py-0.5">
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
