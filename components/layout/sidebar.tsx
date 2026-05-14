'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Landmark, LayoutDashboard, ShieldCheck, Users, FileText, MapPin } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname();
  const hasPermission = useAuthStore((state) => state.hasPermission);

  const routes = [
    {
      label: 'Dashboard',
      icon: LayoutDashboard,
      href: '/dashboard',
      active: pathname === '/dashboard',
      show: true,
    },
    {
      label: 'Sectores',
      icon: Landmark,
      href: '/sectores',
      active: pathname.includes('/sectores'),
      show: hasPermission('sectores:list'),
    },
    {
      label: 'Bases',
      icon: MapPin,
      href: '/bases',
      active: pathname.includes('/bases'),
      show: hasPermission('bases:list'),
    },
    {
      label: 'Personas',
      icon: Users,
      href: '/personas',
      active: pathname.includes('/personas'),
      show: hasPermission('personas:list'),
    },
    {
      label: 'Actividades',
      icon: FileText,
      href: '/actividades',
      active: pathname.includes('/actividades'),
      show: hasPermission('actividades:list'),
    },
    {
      label: 'Cargos',
      icon: ShieldCheck,
      href: '/cargos',
      active: pathname.includes('/cargos'),
      show: hasPermission('cargos:list'),
    },
    {
      label: 'Gestión de Roles',
      icon: ShieldCheck,
      href: '/roles',
      active: pathname.includes('/roles'),
      show: hasPermission('roles:list'),
    },
    {
      label: 'Usuarios',
      icon: Users,
      href: '/users',
      active: pathname.includes('/users'),
      show: hasPermission('users:list'), 
    },
    {
      label: 'Reportes',
      icon: FileText,
      href: '/reports',
      active: pathname.includes('/reports'),
      show: false, // TODO: Implementar módulo de reportes
    },
  ];

  return (
    <div className={cn("min-h-screen border-r bg-slate-950 text-slate-400", className)}>
      <div className="flex flex-col h-full">
        <div className="h-16 flex items-center px-6 border-b border-slate-800">
          <Landmark className="h-5 w-5 mr-2.5 text-indigo-400" />
          <span className="font-bold tracking-tight text-sm uppercase text-slate-100" style={{ fontFamily: 'var(--font-heading)' }}>
            Gestión Política
          </span>
        </div>
        
        <div className="flex-1 py-6 px-4">
          <nav className="space-y-1">
            {routes.map((route) => 
              route.show ? (
                <Link
                  key={route.href}
                  href={route.href}
                  className={cn(
                    "text-[13px] flex items-center py-2.5 px-3 w-full font-medium rounded-md transition-colors",
                    route.active 
                      ? "text-white bg-slate-900" 
                      : "text-slate-400 hover:text-slate-100 hover:bg-slate-900/50"
                  )}
                >
                  <route.icon className={cn("h-4 w-4 mr-3", route.active ? "text-indigo-400" : "text-slate-500")} />
                  {route.label}
                </Link>
              ) : null
            )}
          </nav>
        </div>
      </div>
    </div>
  );
}
