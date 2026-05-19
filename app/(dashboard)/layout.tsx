'use client';

import { Navbar } from '@/components/layout/navbar';
import { Sidebar } from '@/components/layout/sidebar';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { profile, isLoadingProfile } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Si no está cargando y no hay perfil, redirigir a login
    if (!isLoadingProfile && !profile) {
      router.push('/login');
    }
  }, [profile, isLoadingProfile, router]);

  if (isLoadingProfile) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!profile) {
    return null; // Prevents flashing content before redirect
  }

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Sidebar Desktop */}
      <div className="hidden lg:block lg:w-72 lg:shrink-0">
        <Sidebar className="fixed w-72" />
      </div>
      
      <div className="flex-1 w-full flex flex-col min-w-0">
        <Navbar />
        <main className="flex-1 p-6 lg:p-8">
          <div className="mx-auto max-w-6xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
