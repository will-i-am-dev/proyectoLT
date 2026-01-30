'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button, Input, Select, Toast } from '@/components/ui';
import { solicitudService } from '@/services/solicitud.service';
import { TipoDocumento } from '@/types/solicitud';

const schema = z.object({
    tipoDocumento: z.nativeEnum(TipoDocumento, {
        message: 'Seleccione un tipo de documento',
    }),
    numeroDocumento: z.string()
        .min(5, 'El número debe tener al menos 5 dígitos')
        .max(12, 'El número no puede exceder 12 dígitos')
        .regex(/^[0-9]+$/, 'Solo se permiten números'),
});

type FormData = z.infer<typeof schema>;

export function ConsultarSolicitudForm() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const {
        register,
        handleSubmit,
        setFocus,
        formState: { errors },
    } = useForm<FormData>({
        resolver: zodResolver(schema),
    });

    // Auto-focus cuando se navega desde los botones de "Solicitar"
    useEffect(() => {
        // Verificar si el hash es #solicitud-form
        if (typeof window !== 'undefined' && window.location.hash === '#solicitud-form') {
            // Pequeño delay para asegurar que el scroll termine o el componente esté listo
            setTimeout(() => {
                setFocus('numeroDocumento');
            }, 500);
        }
    }, [setFocus]);

    const onSubmit = async (data: FormData) => {
        setIsLoading(true);
        setError(null);

        try {
            // Consultar si existe solicitud
            const solicitudes = await solicitudService.checkStatus(data.tipoDocumento, data.numeroDocumento);
            const solicitudExistente = solicitudes[0];

            if (solicitudExistente && solicitudExistente.estado !== 'abandoned' && solicitudExistente.estado !== 'rejected') {
                // Si existe y está activa (borrador o enviada), ir al dashboard
                if (solicitudExistente.estado === 'approved') {
                    router.push(`/solicitud/${solicitudExistente.id}`);
                } else {
                    router.push(`/solicitud/${solicitudExistente.id}`);
                }
            } else {
                // Si no existe, ir al wizard precargando datos
                router.push(`/solicitud?tipoDocumento=${data.tipoDocumento}&numeroDocumento=${data.numeroDocumento}`);
            }
        } catch (err) {
            console.error('Error al consultar estado:', err);
            setError('Error de conexión. Intente nuevamente.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-white/80 backdrop-blur-md p-6 rounded-2xl shadow-xl border border-white/50">
            <h3 className="text-xl font-bold text-gray-900 mb-2">Comienza tu solicitud</h3>
            <p className="text-sm text-gray-600 mb-6">Ingresa tus datos para validar si ya tienes una solicitud en proceso.</p>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <Select
                    label="Tipo de Documento"
                    {...register('tipoDocumento')}
                    error={errors.tipoDocumento?.message}
                    options={[
                        { value: 'CC', label: 'Cédula de Ciudadanía' },
                        { value: 'CE', label: 'Cédula de Extranjería' },
                        { value: 'PAS', label: 'Pasaporte' },
                    ]}
                />

                <Input
                    label="Número de Documento"
                    {...register('numeroDocumento')}
                    error={errors.numeroDocumento?.message}
                    placeholder="Ej. 12345678"
                    type="tel"
                />

                {error && (
                    <Toast
                        message={error}
                        type="error"
                        onClose={() => setError(null)}
                    />
                )}

                <Button
                    type="submit"
                    fullWidth
                    size="lg"
                    disabled={isLoading}
                    className="mt-2"
                >
                    {isLoading ? (
                        <span className="flex items-center gap-2">
                            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                            Validando...
                        </span>
                    ) : (
                        'Continuar'
                    )}
                </Button>
            </form>
        </div>
    );
}
