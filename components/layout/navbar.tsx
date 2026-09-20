'use client';

import { useAuthStore } from '@/store/useAuthStore';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Menu, LogOut, User, ChevronRight } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Sidebar } from './sidebar';
import { ModeToggle } from '@/components/mode-toggle';

const routeLabels: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/roles': 'Gestión de Roles',
  '/users': 'Gestión de Usuarios',
  '/reports': 'Reportes',
};

export function Navbar() {
  const user = useAuthStore((state) => state.user);
  const { logout } = useAuth();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  // Encontrar el label actual basado en el pathname
  const currentPath = Object.keys(routeLabels).find(key => pathname.startsWith(key)) || '';
  const currentLabel = routeLabels[currentPath] || 'Sistema';

  return (
    <header className="sticky top-0 z-40 flex h-14 sm:h-16 w-full min-w-0 items-center justify-between border-b bg-background/95 px-3 sm:px-6 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex min-w-0 items-center gap-2 sm:gap-4">
        <div className="xl:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="shrink-0">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[min(18rem,85vw)] p-0 border-none">
              <SheetHeader className="sr-only">
                <SheetTitle>Menú de Navegación</SheetTitle>
              </SheetHeader>
              <Sidebar />
            </SheetContent>
          </Sheet>
        </div>
        
        {/* Breadcrumb / Route Indicator */}
        <div className="hidden md:flex items-center gap-2 text-sm font-medium">
          <span className="text-muted-foreground">Inicio</span>
          <ChevronRight className="h-4 w-4 text-muted-foreground/50" />
          <span className="text-foreground">{currentLabel}</span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <ModeToggle />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-9 w-9 rounded-full">
              <Avatar className="h-9 w-9 border">
                <AvatarFallback className="bg-primary/5 text-primary text-xs font-bold">
                  {user?.name?.charAt(0).toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{user?.name}</p>
                <p className="text-xs leading-none text-muted-foreground">
                  {user?.email}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="cursor-pointer">
              <User className="mr-2 h-4 w-4" />
              <span>Perfil</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => logout()} className="text-destructive focus:bg-destructive/10 focus:text-destructive cursor-pointer">
              <LogOut className="mr-2 h-4 w-4" />
              <span>Cerrar sesión</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
