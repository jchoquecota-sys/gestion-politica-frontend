'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DashboardStats } from '../types';

interface ChartsGridProps {
  stats?: DashboardStats;
  isLoading: boolean;
}

const COLORS = ['#042f98', '#893030', '#334155', '#0f766e', '#b45309', '#4c1d95'];

export function ChartsGrid({ stats, isLoading }: ChartsGridProps) {
  if (isLoading) {
    return (
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="h-80 animate-pulse bg-slate-50 border-none"></Card>
        <Card className="h-80 animate-pulse bg-slate-50 border-none"></Card>
      </div>
    );
  }

  return (
    <div className="grid gap-6 grid-cols-1">
      {/* Crecimiento de Simpatizantes */}
      <Card className="border-none shadow-sm bg-white dark:bg-slate-950 overflow-hidden">
        <CardHeader>
          <CardTitle className="text-lg font-bold text-slate-800 dark:text-slate-100">Crecimiento de Simpatizantes</CardTitle>
          <CardDescription>Registro mensual de nuevos integrantes (últimos 6 meses)</CardDescription>
        </CardHeader>
        <CardContent className="h-[300px] pb-8">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={stats?.crecimiento_mensual}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis
                dataKey="mes"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: '#94a3b8' }}
                dy={10}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: '#94a3b8' }}
              />
              <Tooltip
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
              />
              <Line
                type="monotone"
                dataKey="total"
                stroke="#042f98"
                strokeWidth={4}
                dot={{ r: 6, fill: '#042f98', strokeWidth: 2, stroke: '#fff' }}
                activeDot={{ r: 8, strokeWidth: 0 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Distribución por Sector */}
      <Card className="border-none shadow-sm bg-white dark:bg-slate-950 overflow-hidden">
        <CardHeader>
          <CardTitle className="text-lg font-bold text-slate-800 dark:text-slate-100">Distribución por Sector</CardTitle>
          <CardDescription>Presencia territorial por sectores estratégicos</CardDescription>
        </CardHeader>
        <CardContent className="h-[300px] pb-8">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={stats?.distribucion_sectores}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {stats?.distribucion_sectores.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
              />
              <Legend verticalAlign="bottom" height={36} />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Actividades por Estado */}
      <Card className="border-none shadow-sm bg-white dark:bg-slate-950 overflow-hidden">
        <CardHeader>
          <CardTitle className="text-lg font-bold text-slate-800 dark:text-slate-100">Estado de Actividades</CardTitle>
          <CardDescription>Resumen de ejecución y planificación de eventos</CardDescription>
        </CardHeader>
        <CardContent className="h-[300px] pb-8">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={stats?.actividades_estados}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis
                dataKey="estado"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: '#94a3b8' }}
                dy={10}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: '#94a3b8' }}
              />
              <Tooltip
                cursor={{ fill: '#f8fafc' }}
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
              />
              <Bar
                dataKey="total"
                fill="#4f46e5"
                radius={[6, 6, 0, 0]}
                barSize={60}
              >
                {stats?.actividades_estados.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={
                      entry.estado === 'borrador' ? '#94a3b8' :
                        entry.estado === 'creada' ? '#042f98' :
                          entry.estado === 'en_proceso' ? '#075985' :
                            entry.estado === 'ejecutada' ? '#166534' :
                              '#893030'
                    }
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
      {/* Crecimiento de Actividades */}
      <Card className="border-none shadow-sm bg-white dark:bg-slate-950 overflow-hidden">
        <CardHeader>
          <CardTitle className="text-lg font-bold text-slate-800 dark:text-slate-100">Ritmo de Actividades</CardTitle>
          <CardDescription>Evolución mensual de eventos territoriales</CardDescription>
        </CardHeader>
        <CardContent className="h-[300px] pb-8">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={stats?.actividades_crecimiento}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis
                dataKey="month"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: '#94a3b8' }}
                dy={10}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: '#94a3b8' }}
              />
              <Tooltip
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
              />
              <Line
                type="monotone"
                dataKey="total"
                stroke="#166534"
                strokeWidth={4}
                dot={{ r: 6, fill: '#166534', strokeWidth: 2, stroke: '#fff' }}
                activeDot={{ r: 8, strokeWidth: 0 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
      {/* Personas por Base */}
      <Card className="border-none shadow-sm bg-white dark:bg-slate-950 overflow-hidden">
        <CardHeader>
          <CardTitle className="text-lg font-bold text-slate-800 dark:text-slate-100">Simpatizantes por Base</CardTitle>
          <CardDescription>Densidad poblacional por cada centro operativo</CardDescription>
        </CardHeader>
        <CardContent className="h-[300px] pb-8">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={stats?.personas_por_base} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" />
              <XAxis type="number" hide />
              <YAxis
                dataKey="base"
                type="category"
                axisLine={false}
                tickLine={false}
                width={100}
                tick={{ fontSize: 10, fill: '#94a3b8' }}
              />
              <Tooltip
                cursor={{ fill: '#f8fafc' }}
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
              />
              <Bar
                dataKey="total"
                fill="#042f98"
                radius={[0, 6, 6, 0]}
                barSize={20}
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
