'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useActividadBasica, useMarcarAsistenciaQR } from '@/features/actividades/hooks';
import { useAuthStore } from '@/store/useAuthStore';
import { Button } from '@/components/ui/button';
import { MapPin, CheckCircle2, XCircle, Loader2, LogIn, UserCheck } from 'lucide-react';

export default function AsistenciaPublicPage() {
  const params = useParams();
  const actividadId = Number(params.actividadId);
  const router = useRouter();
  
  const { user, token } = useAuthStore();
  const isAuthenticated = !!token;
  const { data: actividad, isLoading: isLoadingAct } = useActividadBasica(actividadId);
  const { mutate: marcarQR, isPending } = useMarcarAsistenciaQR(actividadId);

  const [status, setStatus] = useState<'idle' | 'locating' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  // Generar o recuperar Fingerprint
  const getFingerprint = () => {
    let fp = localStorage.getItem('device_fingerprint');
    if (!fp) {
      fp = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 15);
      localStorage.setItem('device_fingerprint', fp);
    }
    return fp;
  };

  const handleCheckIn = () => {
    if (!navigator.geolocation) {
      setStatus('error');
      setErrorMessage('Tu navegador no soporta geolocalización.');
      return;
    }

    setStatus('locating');

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const payload = {
          latitud_usuario: position.coords.latitude,
          longitud_usuario: position.coords.longitude,
          browser_fingerprint: getFingerprint(),
        };

        marcarQR(payload, {
          onSuccess: () => {
            setStatus('success');
          },
          onError: (error: any) => {
            setStatus('error');
            setErrorMessage(error.response?.data?.message || 'Error al registrar la asistencia.');
          }
        });
      },
      (error) => {
        setStatus('error');
        if (error.code === error.PERMISSION_DENIED) {
          setErrorMessage('Debes dar permisos de ubicación para registrar tu asistencia.');
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          setErrorMessage('La información de ubicación no está disponible. Revisa tu GPS.');
        } else if (error.code === error.TIMEOUT) {
          setErrorMessage('Se agotó el tiempo para obtener la ubicación.');
        } else {
          setErrorMessage('Error desconocido al obtener la ubicación.');
        }
        
        // Excepción por contexto inseguro en desarrollo (http://IP)
        if (window.isSecureContext === false) {
           setErrorMessage('Tu navegador bloqueó el GPS porque no es una conexión HTTPS. (Normal en pruebas locales por IP)');
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  if (isLoadingAct) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!actividad) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 p-4 text-center">
        <XCircle className="h-16 w-16 text-red-500 mb-4" />
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Actividad no encontrada</h1>
        <p className="text-slate-500 mt-2">El código QR es inválido o la actividad ya no existe.</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 p-4 text-center">
        <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-xl max-w-sm w-full border border-slate-100 dark:border-slate-800">
          <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
            <LogIn className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Inicia Sesión</h1>
          <p className="text-slate-500 dark:text-slate-400 mb-6 text-sm">
            Para registrar tu asistencia a <strong>{actividad.titulo}</strong>, necesitas iniciar sesión primero.
          </p>
          <Button 
            className="w-full h-12 text-lg font-medium" 
            onClick={() => router.push(`/login?redirect=/asistencia/${actividadId}`)}
          >
            Ir al Login
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden border border-slate-100 dark:border-slate-800">
        
        {/* Header */}
        <div className="bg-primary px-6 py-8 text-center text-primary-foreground relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('/pattern.svg')] opacity-10 mix-blend-overlay" />
          <h1 className="text-2xl font-bold relative z-10 leading-tight">{actividad.titulo}</h1>
          <p className="opacity-90 mt-2 relative z-10 text-sm">Registro Automático de Asistencia</p>
        </div>

        {/* Content */}
        <div className="p-8 text-center">
          {status === 'idle' && (
            <div className="space-y-6">
              <div className="bg-blue-50 dark:bg-blue-950/30 p-4 rounded-xl inline-block">
                <MapPin className="h-12 w-12 text-blue-600 dark:text-blue-400 mx-auto" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Confirma tu Asistencia</h2>
                <p className="text-slate-500 mt-2 text-sm px-4">
                  El sistema verificará tu ubicación GPS para confirmar que te encuentras en el local.
                </p>
              </div>
              <Button 
                onClick={handleCheckIn} 
                className="w-full h-auto py-4 text-base sm:text-lg font-bold rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-600/20 whitespace-normal leading-tight"
              >
                Marcar Asistencia Ahora
              </Button>
            </div>
          )}

          {status === 'locating' && (
            <div className="space-y-6 py-4">
              <div className="relative w-24 h-24 mx-auto">
                <div className="absolute inset-0 border-4 border-emerald-100 dark:border-emerald-900/50 rounded-full animate-ping" />
                <div className="absolute inset-0 flex items-center justify-center bg-emerald-50 dark:bg-emerald-900/20 rounded-full border border-emerald-200 dark:border-emerald-800">
                  <MapPin className="h-10 w-10 text-emerald-600 dark:text-emerald-500 animate-pulse" />
                </div>
              </div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Verificando Ubicación...</h2>
              <p className="text-slate-500 text-sm">Calculando distancia a la base territorial</p>
            </div>
          )}

          {status === 'success' && (
            <div className="space-y-6 py-4">
              <div className="bg-emerald-50 dark:bg-emerald-900/20 p-4 rounded-full inline-block">
                <CheckCircle2 className="h-16 w-16 text-emerald-600 dark:text-emerald-500" />
              </div>
              <div>
                <h2 className="text-2xl font-black text-emerald-600 dark:text-emerald-400">¡Asistencia Confirmada!</h2>
                <p className="text-slate-500 mt-2">Gracias por participar. Tu asistencia ha sido registrada exitosamente en el sistema.</p>
              </div>
            </div>
          )}

          {status === 'error' && (
            <div className="space-y-6 py-4">
              <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-full inline-block">
                <XCircle className="h-16 w-16 text-red-600 dark:text-red-500" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-red-600 dark:text-red-400">Error al Registrar</h2>
                <p className="text-slate-600 dark:text-slate-400 mt-2">{errorMessage}</p>
              </div>
              <Button 
                onClick={() => setStatus('idle')} 
                variant="outline"
                className="w-full h-12"
              >
                Intentar Nuevamente
              </Button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-50 dark:bg-slate-950 p-4 text-center border-t border-slate-100 dark:border-slate-800">
          <p className="text-xs text-slate-400 dark:text-slate-500 flex items-center justify-center gap-1">
            <UserCheck className="h-3 w-3" />
            Hola, {user?.name}
          </p>
        </div>
      </div>
    </div>
  );
}
