'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Landmark, Calendar, TrendingUp, Target, Activity } from 'lucide-react';
import { DashboardStats } from '../types';

interface StatsGridProps {
  stats?: DashboardStats;
  isLoading: boolean;
}

export function StatsGrid({ stats, isLoading }: StatsGridProps) {
  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse bg-slate-50 border-none h-32"></Card>
        ))}
      </div>
    );
  }

  const kpis = [
    {
      title: 'Total Simpatizantes',
      value: stats?.stats.total_personas || 0,
      icon: Users,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
      description: 'Personas registradas en el sistema'
    },
    {
      title: 'Bases Territoriales',
      value: stats?.stats.total_bases || 0,
      icon: Landmark,
      color: 'text-indigo-600',
      bg: 'bg-indigo-50',
      description: 'Puntos de control estratégico'
    },
    {
      title: 'Actividades Realizadas',
      value: stats?.stats.total_actividades || 0,
      icon: Activity,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
      description: 'Eventos y asambleas ejecutadas'
    }
  ];

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {kpis.map((kpi, index) => (
        <Card key={index} className="overflow-hidden border-none shadow-sm hover:shadow-md transition-shadow bg-white dark:bg-slate-950">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-bold uppercase tracking-wider text-slate-500">{kpi.title}</CardTitle>
            <div className={`${kpi.bg} p-2 rounded-xl`}>
              <kpi.icon className={`h-5 w-5 ${kpi.color}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">
              {kpi.value.toLocaleString()}
            </div>
            <p className="text-xs text-slate-400 mt-2 font-medium">
              {kpi.description}
            </p>
          </CardContent>
          <div className={`h-1.5 w-full ${kpi.bg} opacity-50`}></div>
        </Card>
      ))}
    </div>
  );
}
