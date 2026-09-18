'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useActividadBasica, useMarcarAsistenciaQR, useMarcarAsistenciaDNI } from '@/features/actividades/hooks';
import { useAuthStore } from '@/store/useAuthStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MapPin, CheckCircle2, XCircle, Loader2, LogIn, UserCheck, LogOut } from 'lucide-react';

type GeoPayload = {
  latitud_usuario: number;
  longitud_usuario: number;
  browser_fingerprint: string;
};

export default function AsistenciaPublicPage() {
  const params = useParams();
  const actividadId = Number(params.actividadId);
  const router = useRouter();

  const { user, token } = useAuthStore();
  const isAuthenticated = !!token;
  const { data: actividad, isLoading: isLoadingAct } = useActividadBasica(actividadId);
  const { mutate: marcarQR } = useMarcarAsistenciaQR(actividadId);
  const { mutate: marcarDNI } = useMarcarAsistenciaDNI(actividadId);

  const [status, setStatus] = useState<'idle' | 'locating' | 'confirm_exit' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [successType, setSuccessType] = useState<'ingreso' | 'salida'>('ingreso');
  const [dni, setDni] = useState('');
  const [pendingPayload, setPendingPayload] = useState<GeoPayload | null>(null);

  const getFingerprint = () => {
    let fp = localStorage.getItem('device_fingerprint');
    if (!fp) {
      fp =
        typeof crypto !== 'undefined' && crypto.randomUUID
          ? crypto.randomUUID()
          : Math.random().toString(36).substring(2, 15);
      localStorage.setItem('device_fingerprint', fp);
    }
    return fp;
  };

  const submitAsistencia = (payload: GeoPayload, confirmarSalida = false) => {
    const onSuccess = (response: { message?: string; tipo?: 'ingreso' | 'salida' }) => {
      setSuccessMessage(response.message || 'Asistencia registrada correctamente.');
      setSuccessType(response.tipo || 'ingreso');
      setPendingPayload(null);
      setStatus('success');
    };

    const onError = (error: {
      response?: {
        status?: number;
        data?: { message?: string; requires_confirmation?: boolean };
      };
    }) => {
      if (error.response?.status === 409 && error.response?.data?.requires_confirmation) {
        setPendingPayload(payload);
        setStatus('confirm_exit');
        return;
      }
      setStatus('error');
      setErrorMessage(error.response?.data?.message || 'Error al registrar la asistencia.');
    };

    if (isAuthenticated) {
      marcarQR({ ...payload, confirmar_salida: confirmarSalida }, { onSuccess, onError });
    } else {
      marcarDNI(
        { ...payload, dni: dni.trim(), confirmar_salida: confirmarSalida },
        { onSuccess, onError }
      );
    }
  };

  const handleCheckIn = () => {
    if (!isAuthenticated && !dni.trim()) {
      setStatus('error');
      setErrorMessage('Debes ingresar tu DNI para marcar asistencia.');
      return;
    }

    if (actividad && actividad.asistencia_abierta === false) {
      setStatus('error');
      setErrorMessage(actividad.asistencia_mensaje || 'La asistencia no está abierta en este momento.');
      return;
    }

    if (!navigator.geolocation) {
      setStatus('error');
      setErrorMessage('Tu navegador no soporta geolocalización.');
      return;
    }

    setStatus('locating');

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const payload: GeoPayload = {
          latitud_usuario: position.coords.latitude,
          longitud_usuario: position.coords.longitude,
          browser_fingerprint: getFingerprint(),
        };
        submitAsistencia(payload, false);
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

        if (window.isSecureContext === false) {
          setErrorMessage(
            'Tu navegador bloqueó el GPS porque la página no es HTTPS. Abre la app con: https://79-143-191-165.sslip.io'
          );
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const handleConfirmExit = () => {
    if (!pendingPayload) {
      setStatus('idle');
      return;
    }
    setStatus('locating');
    submitAsistencia(pendingPayload, true);
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

  const asistenciaCerrada = actividad.asistencia_abierta === false;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden border border-slate-100 dark:border-slate-800">
        <div className="bg-primary px-6 py-8 text-center text-primary-foreground relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('/pattern.svg')] opacity-10 mix-blend-overlay" />
          <h1 className="text-2xl font-bold relative z-10 leading-tight">{actividad.titulo}</h1>
          <p className="opacity-90 mt-2 relative z-10 text-sm">Registro Automático de Asistencia</p>
        </div>

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

              {asistenciaCerrada && (
                <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200">
                  {actividad.asistencia_mensaje || 'La asistencia no está abierta en este momento.'}
                </div>
              )}

              {!isAuthenticated ? (
                <div className="space-y-4 mt-4">
                  <div className="space-y-2 text-left">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Número de DNI</label>
                    <Input
                      type="text"
                      placeholder="Ingrese su DNI"
                      value={dni}
                      onChange={(e) => setDni(e.target.value)}
                      className="h-12 text-center text-lg"
                      maxLength={15}
                      disabled={asistenciaCerrada}
                    />
                  </div>
                  <Button
                    onClick={handleCheckIn}
                    disabled={asistenciaCerrada}
                    className="w-full h-auto py-4 text-base sm:text-lg font-bold rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-600/20 leading-tight disabled:opacity-50"
                  >
                    Marcar Asistencia con DNI
                  </Button>

                  <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                    <p className="text-xs text-slate-500 mb-3">¿Ya tienes cuenta en el sistema?</p>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => router.push(`/login?redirect=/asistencia/${actividadId}`)}
                    >
                      <LogIn className="h-4 w-4 mr-2" /> Iniciar Sesión
                    </Button>
                  </div>
                </div>
              ) : (
                <Button
                  onClick={handleCheckIn}
                  disabled={asistenciaCerrada}
                  className="w-full h-auto py-4 text-base sm:text-lg font-bold rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-600/20 whitespace-normal leading-tight disabled:opacity-50"
                >
                  Marcar Asistencia Ahora
                </Button>
              )}
            </div>
          )}

          {status === 'confirm_exit' && (
            <div className="space-y-6 py-4">
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-full inline-block">
                <LogOut className="h-16 w-16 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">¿Marcar salida?</h2>
                <p className="text-slate-500 mt-2 text-sm px-2">
                  Ya registraste tu ingreso. Confirma solo si estás saliendo del evento.
                </p>
              </div>
              <div className="flex flex-col gap-3">
                <Button
                  onClick={handleConfirmExit}
                  className="w-full h-12 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold"
                >
                  Sí, marcar salida
                </Button>
                <Button
                  variant="outline"
                  className="w-full h-12"
                  onClick={() => {
                    setPendingPayload(null);
                    setStatus('idle');
                  }}
                >
                  Cancelar
                </Button>
              </div>
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
              <div
                className={`p-4 rounded-full inline-block ${
                  successType === 'ingreso'
                    ? 'bg-emerald-50 dark:bg-emerald-900/20'
                    : 'bg-blue-50 dark:bg-blue-900/20'
                }`}
              >
                <CheckCircle2
                  className={`h-16 w-16 ${
                    successType === 'ingreso'
                      ? 'text-emerald-600 dark:text-emerald-500'
                      : 'text-blue-600 dark:text-blue-500'
                  }`}
                />
              </div>
              <div>
                <h2
                  className={`text-2xl font-black ${
                    successType === 'ingreso'
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : 'text-blue-600 dark:text-blue-400'
                  }`}
                >
                  {successType === 'ingreso' ? '¡Ingreso Confirmado!' : '¡Salida Confirmada!'}
                </h2>
                <p className="text-slate-500 mt-2">
                  {successMessage || 'Gracias por participar. Tu asistencia ha sido registrada exitosamente.'}
                </p>
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
              <Button onClick={() => setStatus('idle')} variant="outline" className="w-full h-12">
                Intentar Nuevamente
              </Button>
            </div>
          )}
        </div>

        <div className="bg-slate-50 dark:bg-slate-950 p-4 text-center border-t border-slate-100 dark:border-slate-800">
          <p className="text-xs text-slate-400 dark:text-slate-500 flex items-center justify-center gap-1">
            <UserCheck className="h-3 w-3" />
            {isAuthenticated ? `Hola, ${user?.name}` : 'Registro Público Seguro'}
          </p>
        </div>
      </div>
    </div>
  );
}
