'use client';

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LabelList, PieChart, Pie, Cell, Legend
} from 'recharts';
import type { SectorDistribucion, CrecimientoMensual } from '../types';

interface PublicChartsProps {
  distribucionSectores: SectorDistribucion[];
  crecimientoMensual: CrecimientoMensual[];
  isLoading: boolean;
}

// Lighter, more visible colors on dark background
const COLORS = ['#6b8fff', '#e06060', '#34d399', '#fbbf24', '#a78bfa', '#60a5fa'];

const darkTooltipStyle = {
  borderRadius: '10px',
  border: '1px solid rgba(255,255,255,0.1)',
  backgroundColor: '#0a0f1e',
  color: '#f1f5f9',
  fontSize: '13px',
  boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
  padding: '10px 14px',
};

const MONTHS_ES: Record<string, string> = {
  Jan: 'Ene', Feb: 'Feb', Mar: 'Mar', Apr: 'Abr',
  May: 'May', Jun: 'Jun', Jul: 'Jul', Aug: 'Ago',
  Sep: 'Sep', Oct: 'Oct', Nov: 'Nov', Dec: 'Dic',
  '01': 'Ene', '02': 'Feb', '03': 'Mar', '04': 'Abr',
  '05': 'May', '06': 'Jun', '07': 'Jul', '08': 'Ago',
  '09': 'Sep', '10': 'Oct', '11': 'Nov', '12': 'Dic',
};

function formatMonth(mes: string): string {
  // Try common formats: "2024-01", "Jan", "enero", numeric
  if (!mes) return mes;
  const parts = mes.split('-');
  if (parts.length === 2) {
    const monthNum = parts[1];
    return MONTHS_ES[monthNum] ?? mes;
  }
  // Try direct key lookup
  const upper = mes.substring(0, 3);
  return MONTHS_ES[upper] ?? mes;
}

// Custom label above bar
const BarValueLabel = (props: any) => {
  const { x, y, width, value } = props;
  if (!value) return null;
  return (
    <text
      x={x + width / 2}
      y={y - 6}
      fill="#94a3b8"
      textAnchor="middle"
      fontSize={11}
      fontWeight={600}
    >
      {Number(value).toLocaleString('es-PE')}
    </text>
  );
};

// Custom label inside pie slices
const PieValueLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, value }: any) => {
  if (percent < 0.06) return null;
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={11} fontWeight={700}>
      {Number(value).toLocaleString('es-PE')}
    </text>
  );
};

export function PublicCharts({ distribucionSectores, crecimientoMensual, isLoading }: PublicChartsProps) {
  if (isLoading) {
    return (
      <section className="py-24 bg-background dark:bg-[#070d1a]">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="h-80 bg-muted dark:bg-slate-900 rounded-2xl animate-pulse border border-border dark:border-slate-800" />
            <div className="h-80 bg-muted dark:bg-slate-900 rounded-2xl animate-pulse border border-border dark:border-slate-800" />
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="graficos" className="relative py-24 bg-background dark:bg-[#070d1a] overflow-hidden">
      {/* Decorative glow */}
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] bg-[#893030]/5 rounded-full blur-3xl pointer-events-none" />

      {/* Secondary accent line at top */}
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-[#893030] to-transparent" />

      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center mb-14">
          {/* Eyebrow in secondary color */}
          <p className="text-sm font-bold uppercase tracking-widest mb-3 text-primary dark:text-[#c06060]">Análisis Territorial</p>
          <h2 className="text-4xl font-black text-foreground dark:text-white">Distribución de apoyo</h2>
          <p className="text-muted-foreground dark:text-slate-400 mt-3 max-w-xl mx-auto">
            Así está organizada nuestra red de simpatizantes en el distrito.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Crecimiento mensual */}
          <div className="bg-card dark:bg-slate-900 rounded-2xl p-6 border border-border dark:border-slate-800">
            {/* Title with secondary accent */}
            <div className="flex items-center gap-2 mb-6">
              <span className="w-1 h-5 rounded-full bg-primary dark:bg-[#893030]" />
              <h3 className="font-bold text-foreground dark:text-white text-lg">Crecimiento de Simpatizantes</h3>
            </div>
            {crecimientoMensual.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart
                  data={crecimientoMensual.map(d => ({ ...d, mes: formatMonth(d.mes) }))}
                  margin={{ top: 22, right: 10, left: -20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis
                    dataKey="mes"
                    tick={{ fontSize: 12, fill: '#94a3b8', fontWeight: 500 }}
                    axisLine={false}
                    tickLine={false}
                    dy={8}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: '#64748b' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={darkTooltipStyle}
                    labelStyle={{ fontWeight: 700, color: '#f1f5f9', fontSize: 13 }}
                    itemStyle={{ fontSize: 13 }}
                    cursor={{ fill: 'rgba(255,255,255,0.04)' }}
                  />
                  <Bar dataKey="total" name="Simpatizantes" fill="#6b8fff" radius={[6, 6, 0, 0]}>
                    <LabelList content={<BarValueLabel />} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-64 flex items-center justify-center text-slate-600 text-sm">Sin datos disponibles</div>
            )}
          </div>

          {/* Distribución por sector */}
          <div className="bg-card dark:bg-slate-900 rounded-2xl p-6 border border-border dark:border-slate-800">
            {/* Title with secondary accent */}
            <div className="flex items-center gap-2 mb-4">
              <span className="w-1 h-5 rounded-full bg-primary dark:bg-[#893030]" />
              <h3 className="font-bold text-foreground dark:text-white text-lg">Distribución por Sector</h3>
            </div>
            {distribucionSectores.length > 0 ? (
              <ResponsiveContainer width="100%" height={290}>
                <PieChart>
                  <Pie
                    data={distribucionSectores}
                    cx="50%"
                    cy="48%"
                    innerRadius={55}
                    outerRadius={95}
                    paddingAngle={2}
                    dataKey="value"
                    nameKey="name"
                    labelLine={false}
                    label={<PieValueLabel />}
                  >
                    {distribucionSectores.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="transparent" />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={darkTooltipStyle}
                    formatter={(value: any) => [Number(value).toLocaleString('es-PE'), 'Simpatizantes']}
                    itemStyle={{ fontSize: 13 }}
                  />
                  <Legend
                    iconType="circle"
                    iconSize={7}
                    wrapperStyle={{ paddingTop: '8px' }}
                    formatter={(v) => <span style={{ color: '#cbd5e1', fontSize: '12px', fontWeight: 500 }}>{v}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-64 flex items-center justify-center text-slate-600 text-sm">Sin datos disponibles</div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
