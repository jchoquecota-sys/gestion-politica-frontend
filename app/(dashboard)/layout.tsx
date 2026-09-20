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
    return null;
  }

  return (
    <div className="flex min-h-screen w-full max-w-[100vw] overflow-x-hidden bg-slate-50 dark:bg-slate-900">
      {/* Sidebar solo en pantallas anchas; en chicas/medianas usa el menú hamburguesa */}
      <aside className="hidden xl:block xl:w-64 xl:shrink-0">
        <Sidebar className="fixed inset-y-0 left-0 z-30 w-64 overflow-y-auto" />
      </aside>

      <div className="flex min-w-0 flex-1 flex-col overflow-x-hidden">
        <Navbar />
        <main className="min-w-0 flex-1 overflow-x-hidden p-4 sm:p-6 lg:p-8">
          <div className="mx-auto w-full max-w-6xl min-w-0">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
