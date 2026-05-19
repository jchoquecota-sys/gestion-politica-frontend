'use client';

import { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Image from 'next/image';
import {
  useLandingSettings,
  useUpdateLandingSettings,
} from '../hooks/useLandingSettings';
import type { LandingSetting } from '@/features/landing/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Loader2, Upload, Globe, ExternalLink, RefreshCw } from 'lucide-react';

const schema = z.object({
  nombre_candidato: z.string().min(2, 'Ingrese el nombre del candidato').max(150),
  cargo_candidatura: z.string().max(150).optional(),
  eslogan: z.string().max(255).optional(),
  biografia: z.string().optional(),
  redes_facebook: z.string().url('URL no válida').optional().or(z.literal('')),
  redes_instagram: z.string().url('URL no válida').optional().or(z.literal('')),
  redes_tiktok: z.string().url('URL no válida').optional().or(z.literal('')),
  redes_twitter: z.string().url('URL no válida').optional().or(z.literal('')),
  redes_whatsapp: z.string().max(20).optional(),
  color_primario: z.string(),
  color_secundario: z.string(),
  meta_titulo: z.string().max(120).optional(),
  meta_descripcion: z.string().max(300).optional(),
});

type FormValues = z.infer<typeof schema>;

function mapSettingToForm(s: LandingSetting | null): FormValues {
  return {
    nombre_candidato: s?.nombre_candidato ?? '',
    cargo_candidatura: s?.cargo_candidatura ?? '',
    eslogan: s?.eslogan ?? '',
    biografia: s?.biografia ?? '',
    redes_facebook: s?.redes_sociales?.facebook ?? '',
    redes_instagram: s?.redes_sociales?.instagram ?? '',
    redes_tiktok: s?.redes_sociales?.tiktok ?? '',
    redes_twitter: s?.redes_sociales?.twitter ?? '',
    redes_whatsapp: s?.redes_sociales?.whatsapp ?? '',
    color_primario: s?.color_primario ?? '#042f98',
    color_secundario: s?.color_secundario ?? '#893030',
    meta_titulo: s?.meta_titulo ?? '',
    meta_descripcion: s?.meta_descripcion ?? '',
  };
}

function ImageUploadField({
  label,
  description,
  currentUrl,
  fileRef,
  preview,
  onChange,
}: {
  label: string;
  description: string;
  currentUrl: string | null;
  fileRef: React.RefObject<HTMLInputElement | null>;
  preview: string | null;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <div className="space-y-3">
      <Label>{label}</Label>
      <p className="text-xs text-slate-500">{description}</p>
      <div className="flex gap-4 items-start">
        <div className="relative w-32 h-40 rounded-xl overflow-hidden border-2 border-dashed border-slate-200 bg-slate-50 flex items-center justify-center flex-shrink-0">
          {(preview ?? currentUrl) ? (
            <Image
              src={preview ?? currentUrl!}
              alt={label}
              fill
              className="object-cover"
            />
          ) : (
            <Upload className="h-6 w-6 text-slate-300" />
          )}
        </div>
        <div className="space-y-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => fileRef.current?.click()}
          >
            <Upload className="h-3.5 w-3.5 mr-2" />
            {(preview ?? currentUrl) ? 'Cambiar imagen' : 'Subir imagen'}
          </Button>
          <p className="text-xs text-slate-400">JPG, PNG o WebP · Máx. 4MB</p>
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={onChange}
          />
        </div>
      </div>
    </div>
  );
}

export function LandingSettingsForm() {
  const { data: setting, isLoading } = useLandingSettings();
  const { mutate: updateSettings, isPending } = useUpdateLandingSettings();

  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [fotoPrincipalFile, setFotoPrincipalFile] = useState<File | null>(null);
  const [fotoSecundariaFile, setFotoSecundariaFile] = useState<File | null>(null);
  
  const [previewLogo, setPreviewLogo] = useState<string | null>(null);
  const [previewPrincipal, setPreviewPrincipal] = useState<string | null>(null);
  const [previewSecundaria, setPreviewSecundaria] = useState<string | null>(null);

  const refLogo = useRef<HTMLInputElement>(null);
  const refPrincipal = useRef<HTMLInputElement>(null);
  const refSecundaria = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    values: mapSettingToForm(setting ?? null),
  });

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    tipo: 'logo' | 'principal' | 'secundaria'
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    if (tipo === 'logo') {
      setLogoFile(file);
      setPreviewLogo(url);
    } else if (tipo === 'principal') {
      setFotoPrincipalFile(file);
      setPreviewPrincipal(url);
    } else {
      setFotoSecundariaFile(file);
      setPreviewSecundaria(url);
    }
  };

  const onSubmit = (values: FormValues) => {
    const formData = new FormData();

    // Campos de texto
    formData.append('nombre_candidato', values.nombre_candidato);
    formData.append('cargo_candidatura', values.cargo_candidatura ?? '');
    formData.append('eslogan', values.eslogan ?? '');
    formData.append('biografia', values.biografia ?? '');
    formData.append('color_primario', values.color_primario);
    formData.append('color_secundario', values.color_secundario);
    formData.append('meta_titulo', values.meta_titulo ?? '');
    formData.append('meta_descripcion', values.meta_descripcion ?? '');

    // Redes sociales
    if (values.redes_facebook) formData.append('redes_sociales[facebook]', values.redes_facebook);
    if (values.redes_instagram) formData.append('redes_sociales[instagram]', values.redes_instagram);
    if (values.redes_tiktok) formData.append('redes_sociales[tiktok]', values.redes_tiktok);
    if (values.redes_twitter) formData.append('redes_sociales[twitter]', values.redes_twitter);
    if (values.redes_whatsapp) formData.append('redes_sociales[whatsapp]', values.redes_whatsapp);

    // Fotos
    if (logoFile) formData.append('logo', logoFile);
    if (fotoPrincipalFile) formData.append('foto_principal', fotoPrincipalFile);
    if (fotoSecundariaFile) formData.append('foto_secundaria', fotoSecundariaFile);

    updateSettings(formData);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          {setting?.updated_at && (
            <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
              <RefreshCw className="h-3 w-3" />
              Última actualización: {new Date(setting.updated_at).toLocaleString('es-PE')}
            </p>
          )}
        </div>
        <div className="flex gap-3">
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm text-primary font-medium hover:underline"
          >
            <Globe className="h-4 w-4" /> Ver página pública
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
          <Button type="submit" disabled={isPending} className="bg-primary hover:bg-primary/90 text-white min-w-[140px]">
            {isPending ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Guardando...</>
            ) : (
              'Guardar Cambios'
            )}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="candidato" className="space-y-6">
        <TabsList className="bg-slate-100">
          <TabsTrigger value="candidato">Candidato</TabsTrigger>
          <TabsTrigger value="fotos">Fotografías</TabsTrigger>
          <TabsTrigger value="redes">Redes Sociales</TabsTrigger>
          <TabsTrigger value="seo">SEO</TabsTrigger>
        </TabsList>

        {/* Tab: Candidato */}
        <TabsContent value="candidato">
          <Card>
            <CardHeader>
              <CardTitle>Información del Candidato</CardTitle>
              <CardDescription>Esta información aparecerá en el hero principal de la página.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="nombre_candidato">Nombre completo del candidato *</Label>
                  <Input id="nombre_candidato" {...register('nombre_candidato')} placeholder="Ej: Juan Pérez Mamani" />
                  {errors.nombre_candidato && <p className="text-xs text-red-500">{errors.nombre_candidato.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cargo_candidatura">Cargo al que se postula</Label>
                  <Input id="cargo_candidatura" {...register('cargo_candidatura')} placeholder="Ej: Candidato a Alcalde" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="eslogan">Eslogan de campaña</Label>
                  <Input id="eslogan" {...register('eslogan')} placeholder="Ej: Juntos por un mejor mañana" />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="biografia">Biografía / Presentación</Label>
                  <Textarea
                    id="biografia"
                    {...register('biografia')}
                    placeholder="Escriba una presentación del candidato que inspire confianza..."
                    className="min-h-[120px]"
                  />
                </div>
              </div>

              {/* Colores */}
              <div className="border-t pt-5">
                <h4 className="font-semibold text-slate-900 mb-4 text-sm">Colores de campaña</h4>
                <div className="grid grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <Label htmlFor="color_primario">Color primario</Label>
                    <div className="flex items-center gap-3">
                      <input
                        id="color_primario"
                        type="color"
                        {...register('color_primario')}
                        className="h-10 w-16 rounded-lg border border-slate-200 cursor-pointer p-1"
                      />
                      <Input {...register('color_primario')} className="font-mono text-sm" placeholder="#042f98" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="color_secundario">Color secundario</Label>
                    <div className="flex items-center gap-3">
                      <input
                        id="color_secundario"
                        type="color"
                        {...register('color_secundario')}
                        className="h-10 w-16 rounded-lg border border-slate-200 cursor-pointer p-1"
                      />
                      <Input {...register('color_secundario')} className="font-mono text-sm" placeholder="#893030" />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Fotos */}
        <TabsContent value="fotos">
          <Card>
            <CardHeader>
              <CardTitle>Identidad Visual y Fotografías</CardTitle>
              <CardDescription>Configure el logo de campaña y las fotos principales del candidato.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              <div className="pb-8 border-b">
                <ImageUploadField
                  label="Logo de Campaña / Partido"
                  description="Se mostrará en la barra de navegación y el pie de página."
                  currentUrl={setting?.logo_url ?? null}
                  fileRef={refLogo}
                  preview={previewLogo}
                  onChange={(e) => handleFileChange(e, 'logo')}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <ImageUploadField
                  label="Foto principal (Hero)"
                  description="Foto formal del candidato. Se mostrará prominentemente en la página de inicio."
                  currentUrl={setting?.foto_principal_url ?? null}
                  fileRef={refPrincipal}
                  preview={previewPrincipal}
                  onChange={(e) => handleFileChange(e, 'principal')}
                />
                <ImageUploadField
                  label="Foto secundaria"
                  description="Foto adicional (evento, campaña). Aparece como acento visual en el hero."
                  currentUrl={setting?.foto_secundaria_url ?? null}
                  fileRef={refSecundaria}
                  preview={previewSecundaria}
                  onChange={(e) => handleFileChange(e, 'secundaria')}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Redes */}
        <TabsContent value="redes">
          <Card>
            <CardHeader>
              <CardTitle>Redes Sociales</CardTitle>
              <CardDescription>Ingrese las URLs completas. Solo se mostrarán las que tengan valor.</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {[
                { id: 'redes_facebook', label: 'Facebook', placeholder: 'https://facebook.com/...' },
                { id: 'redes_instagram', label: 'Instagram', placeholder: 'https://instagram.com/...' },
                { id: 'redes_tiktok', label: 'TikTok', placeholder: 'https://tiktok.com/@...' },
                { id: 'redes_twitter', label: 'Twitter / X', placeholder: 'https://twitter.com/...' },
                { id: 'redes_whatsapp', label: 'WhatsApp (número)', placeholder: '+51999999999' },
              ].map((field) => (
                <div key={field.id} className="space-y-2">
                  <Label htmlFor={field.id}>{field.label}</Label>
                  <Input
                    id={field.id}
                    {...register(field.id as keyof FormValues)}
                    placeholder={field.placeholder}
                  />
                  {errors[field.id as keyof FormValues] && (
                    <p className="text-xs text-red-500">{errors[field.id as keyof FormValues]?.message}</p>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: SEO */}
        <TabsContent value="seo">
          <Card>
            <CardHeader>
              <CardTitle>SEO y Metadatos</CardTitle>
              <CardDescription>Optimiza cómo aparece la página en buscadores como Google.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="meta_titulo">Título SEO <span className="text-slate-400 text-xs">(máx. 120 caracteres)</span></Label>
                <Input
                  id="meta_titulo"
                  {...register('meta_titulo')}
                  placeholder="Ej: Juan Pérez — Candidato a Alcalde | Campaña 2026"
                />
                <p className="text-xs text-slate-400">{watch('meta_titulo')?.length ?? 0}/120</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="meta_descripcion">Descripción SEO <span className="text-slate-400 text-xs">(máx. 300 caracteres)</span></Label>
                <Textarea
                  id="meta_descripcion"
                  {...register('meta_descripcion')}
                  placeholder="Descripción breve para buscadores. Explique la propuesta del candidato."
                  className="min-h-[100px]"
                />
                <p className="text-xs text-slate-400">{watch('meta_descripcion')?.length ?? 0}/300</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </form>
  );
}
