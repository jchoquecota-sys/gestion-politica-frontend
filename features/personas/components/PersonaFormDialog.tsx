import { useEffect, useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Persona } from '../types';
import { useCreatePersona, useUpdatePersona, useConsultarDni } from '../hooks/usePersonas';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Camera, User, X, Search } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from 'sonner';
const personaSchema = z.object({
  nombres: z.string().min(2, 'Los nombres son requeridos').max(100),
  apellidos: z.string().min(2, 'Los apellidos son requeridos').max(100),
  dni: z.string().length(8, 'El DNI debe tener 8 dígitos').regex(/^\d+$/, 'DNI inválido'),
  celular: z.string().optional().or(z.literal('')),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  direccion: z.string().optional().or(z.literal('')),
  fecha_nacimiento: z.string().optional().or(z.literal('')),
  foto: z.any().optional(),
});

type PersonaFormValues = z.infer<typeof personaSchema>;

interface PersonaFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  persona?: Persona | null;
}

export function PersonaFormDialog({ isOpen, onClose, persona }: PersonaFormDialogProps) {
  const isEditing = !!persona;
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { mutate: createPersona, isPending: isCreating } = useCreatePersona();
  const { mutate: updatePersona, isPending: isUpdating } = useUpdatePersona();
  const { mutate: consultarDni, isPending: isConsultandoDni } = useConsultarDni();
  
  const isPending = isCreating || isUpdating || isConsultandoDni;

  const { register, handleSubmit, formState: { errors }, reset, setValue, watch, getValues } = useForm<PersonaFormValues>({
    resolver: zodResolver(personaSchema),
    defaultValues: {
      nombres: '',
      apellidos: '',
      dni: '',
      celular: '',
      email: '',
      direccion: '',
      fecha_nacimiento: '',
    },
  });

  const watchFoto = watch('foto');

  useEffect(() => {
    if (isOpen) {
      if (persona) {
        reset({
          nombres: persona.nombres,
          apellidos: persona.apellidos,
          dni: persona.dni,
          celular: persona.celular || '',
          email: persona.email || '',
          direccion: persona.direccion || '',
          fecha_nacimiento: persona.fecha_nacimiento || '',
        });
        setPhotoPreview(persona.foto_url || null);
      } else {
        reset({
          nombres: '',
          apellidos: '',
          dni: '',
          celular: '',
          email: '',
          direccion: '',
          fecha_nacimiento: '',
        });
        setPhotoPreview(null);
      }
    }
  }, [isOpen, persona, reset]);

  useEffect(() => {
    if (watchFoto && watchFoto instanceof FileList && watchFoto.length > 0) {
      const file = watchFoto[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  }, [watchFoto]);

  const handlePhotoClick = () => {
    fileInputRef.current?.click();
  };

  const handleClearPhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPhotoPreview(null);
    setValue('foto', null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleConsultarDni = () => {
    const dni = (getValues('dni') || '').replace(/\D/g, '');
    if (dni.length !== 8) {
      toast.error('Ingrese un DNI de 8 dígitos');
      return;
    }

    consultarDni(dni, {
      onSuccess: (res) => {
        setValue('nombres', res.data.nombres, { shouldValidate: true });
        setValue('apellidos', res.data.apellidos, { shouldValidate: true });
        if (res.data.direccion) {
          setValue('direccion', res.data.direccion, { shouldValidate: true });
        }
        toast.success('Datos cargados desde el DNI');
      },
      onError: (error: unknown) => {
        const err = error as { message?: string; response?: { data?: { message?: string } } };
        toast.error(err.response?.data?.message || err.message || 'No se pudo consultar el DNI');
      },
    });
  };

  const onSubmit = (data: PersonaFormValues) => {
    const formattedData = {
      ...data,
      foto: data.foto instanceof FileList ? data.foto[0] : data.foto,
    };

    if (isEditing && persona) {
      updatePersona({ id: persona.id, data: formattedData }, {
        onSuccess: () => onClose()
      });
    } else {
      createPersona(formattedData, {
        onSuccess: () => onClose()
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Editar Persona' : 'Registrar Persona'}</DialogTitle>
          <DialogDescription>
            Completa la información básica de la persona. La vinculación a bases o sectores se gestiona desde sus respectivos módulos.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
          <div className="flex flex-col items-center justify-center space-y-4 mb-4">
            <div 
              className="relative group cursor-pointer"
              onClick={handlePhotoClick}
            >
              <Avatar className="h-24 w-24 border-2 border-slate-200 transition-all group-hover:border-indigo-400">
                <AvatarImage src={photoPreview || ''} />
                <AvatarFallback className="bg-slate-100 text-slate-400">
                  <User className="h-12 w-12" />
                </AvatarFallback>
              </Avatar>
              <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera className="h-8 w-8 text-white" />
              </div>
              {photoPreview && (
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute -top-1 -right-1 h-6 w-6 rounded-full"
                  onClick={handleClearPhoto}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
            <p className="text-xs text-slate-500 font-medium">Haga clic para subir foto (JPG, PNG)</p>
            <Input 
              type="file" 
              accept="image/*" 
              className="hidden" 
              {...register('foto')} 
              ref={(e) => {
                register('foto').ref(e);
                (fileInputRef as any).current = e;
              }}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="dni">DNI <span className="text-red-500">*</span></Label>
              <div className="flex gap-2">
                <Input id="dni" maxLength={8} {...register('dni')} disabled={isPending} placeholder="8 dígitos" />
                <Button
                  type="button"
                  variant="outline"
                  disabled={isPending}
                  onClick={handleConsultarDni}
                  title="Buscar datos por DNI"
                  className="shrink-0"
                >
                  {isConsultandoDni ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Search className="h-4 w-4" />
                  )}
                </Button>
              </div>
              {errors.dni && <p className="text-sm text-red-500">{errors.dni.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="fecha_nacimiento">Fecha de Nacimiento</Label>
              <Input id="fecha_nacimiento" type="date" {...register('fecha_nacimiento')} disabled={isPending} />
              {errors.fecha_nacimiento && <p className="text-sm text-red-500">{errors.fecha_nacimiento.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="nombres">Nombres <span className="text-red-500">*</span></Label>
              <Input id="nombres" {...register('nombres')} disabled={isPending} placeholder="Nombres" />
              {errors.nombres && <p className="text-sm text-red-500">{errors.nombres.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="apellidos">Apellidos <span className="text-red-500">*</span></Label>
              <Input id="apellidos" {...register('apellidos')} disabled={isPending} placeholder="Apellidos" />
              {errors.apellidos && <p className="text-sm text-red-500">{errors.apellidos.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="celular">Celular</Label>
              <Input id="celular" {...register('celular')} disabled={isPending} placeholder="999888777" />
              {errors.celular && <p className="text-sm text-red-500">{errors.celular.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" {...register('email')} disabled={isPending} placeholder="correo@ejemplo.com" />
              {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="direccion">Dirección</Label>
            <Input id="direccion" {...register('direccion')} disabled={isPending} placeholder="Av. Principal 123" />
            {errors.direccion && <p className="text-sm text-red-500">{errors.direccion.message}</p>}
          </div>

          <DialogFooter className="pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose} disabled={isPending}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isPending} className="bg-primary hover:bg-primary/90 text-white">
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEditing ? 'Guardar Cambios' : 'Registrar Persona'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
