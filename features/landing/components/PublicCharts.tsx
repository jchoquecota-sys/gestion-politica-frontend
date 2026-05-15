'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import type { SectorDistribucion, CrecimientoMensual } from '../types';

interface PublicChartsProps {
  distribucionSectores: SectorDistribucion[];
  crecimientoMensual: CrecimientoMensual[];
  isLoading: boolean;
}

const COLORS = ['#1d4ed8', '#2563eb', '#3b82f6', '#60a5fa', '#93c5fd', '#bfdbfe', '#0369a1', '#0284c7'];

export function PublicCharts({ distribucionSectores, crecimientoMensual, isLoading }: PublicChartsProps) {
  if (isLoading) {
    return (
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="h-80 bg-slate-100 rounded-2xl animate-pulse" />
            <div className="h-80 bg-slate-100 rounded-2xl animate-pulse" />
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="graficos" className="py-20 bg-white">
      <div className="container mx-auto px-6">
        <div className="text-center mb-14">
          <p className="text-sm font-bold uppercase tracking-widest text-blue-600 mb-2">Análisis Territorial</p>
          <h2 className="text-4xl font-black text-slate-900">Distribución de apoyo</h2>
          <p className="text-slate-500 mt-3 max-w-xl mx-auto">
            Así está organizada nuestra red de simpatizantes en el distrito.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Crecimiento mensual */}
          <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
            <h3 className="font-bold text-slate-900 text-lg mb-6">Crecimiento de Simpatizantes</h3>
            {crecimientoMensual.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={crecimientoMensual} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="mes" tick={{ fontSize: 12, fill: '#64748b' }} />
                  <YAxis tick={{ fontSize: 12, fill: '#64748b' }} />
                  <Tooltip
                    contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}
                    labelStyle={{ fontWeight: 700, color: '#1e293b' }}
                  />
                  <Bar dataKey="total" name="Simpatizantes" fill="#1d4ed8" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-64 flex items-center justify-center text-slate-400 text-sm">Sin datos disponibles</div>
            )}
          </div>

          {/* Distribución por sector */}
          <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
            <h3 className="font-bold text-slate-900 text-lg mb-6">Distribución por Sector</h3>
            {distribucionSectores.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={distribucionSectores}
                    cx="50%"
                    cy="50%"
                    innerRadius={65}
                    outerRadius={110}
                    paddingAngle={3}
                    dataKey="value"
                    nameKey="name"
                  >
                    {distribucionSectores.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}
                    formatter={(value: number) => [value.toLocaleString('es-PE'), 'Simpatizantes']}
                  />
                  <Legend iconType="circle" iconSize={8} formatter={(v) => <span className="text-xs text-slate-600 font-medium">{v}</span>} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-64 flex items-center justify-center text-slate-400 text-sm">Sin datos disponibles</div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
