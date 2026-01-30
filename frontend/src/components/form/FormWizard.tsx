'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Toast } from '@/components/ui';
import { DatosPersonalesStep } from './steps/DatosPersonalesStep';
import { DatosLaboralesStep } from './steps/DatosLaboralesStep';
import { ProductoStep } from './steps/ProductoStep';
import { ConfirmacionStep } from './steps/ConfirmacionStep';
import { solicitudService } from '@/services/solicitud.service';
import type {
    DatosPersonales,
    DatosLaborales,
    ProductoSolicitado,
    Auditoria,
} from '@/types/solicitud';

interface FormData {
    datosPersonales: Partial<DatosPersonales>;
    datosLaborales: Partial<DatosLaborales>;
    productoSolicitado: Partial<ProductoSolicitado>;
    auditoria: Partial<Auditoria>;
}

const STEPS = [
    { number: 1, title: 'Datos Personales' },
    { number: 2, title: 'Datos Laborales' },
    { number: 3, title: 'Producto' },
    { number: 4, title: 'Confirmación' },
];

const initialFormData: FormData = {
    datosPersonales: {},
    datosLaborales: {},
    productoSolicitado: {
        segurosAdicionales: false,
    },
    auditoria: {
        aceptaTerminos: false,
        aceptaTratamientoDatos: false,
        autorizaConsultaCentrales: false,
    },
};

/**
 * Wizard de solicitud de tarjeta de crédito
 * Client Component con estado local y auto-guardado
 */
export function FormWizard() {
    const router = useRouter();
    const [currentStep, setCurrentStep] = useState(1);
    const [formData, setFormData] = useState<FormData>(initialFormData);
    const [solicitudId, setSolicitudId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [lastSaved, setLastSaved] = useState<Date | null>(null);

    // Ref para el debounce del auto-guardado
    const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Preparar los datos de los steps para el ProgressBar
    const stepsWithStatus = STEPS.map((step) => ({
        ...step,
        isCompleted: step.number < currentStep,
        isActive: step.number === currentStep,
    }));

    // Auto-guardado con debounce
    const autoSave = useCallback(async (data: FormData) => {
        if (!solicitudId) return;

        setIsSaving(true);
        try {
            await solicitudService.update(solicitudId, {
                datosPersonales: data.datosPersonales as DatosPersonales,
                datosLaborales: data.datosLaborales as DatosLaborales,
                productoSolicitado: data.productoSolicitado as ProductoSolicitado,
                auditoria: data.auditoria as Auditoria,
            });
            setLastSaved(new Date());
            setError(null);
        } catch (err) {
            console.error('Error en auto-guardado:', err);
        } finally {
            setIsSaving(false);
        }
    }, [solicitudId]);

    // Efecto para auto-guardado con debounce de 3 segundos
    useEffect(() => {
        if (!solicitudId) return;

        if (saveTimeoutRef.current) {
            clearTimeout(saveTimeoutRef.current);
        }

        saveTimeoutRef.current = setTimeout(() => {
            autoSave(formData);
        }, 3000);

        return () => {
            if (saveTimeoutRef.current) {
                clearTimeout(saveTimeoutRef.current);
            }
        };
    }, [formData, solicitudId, autoSave]);

    // Cargar datos iniciales desde URL (prellenado o retomar)
    const searchParams = useSearchParams();

    useEffect(() => {
        const cargarDatosIniciales = async () => {
            const retomarId = searchParams.get('retomar');
            const tipoDocParam = searchParams.get('tipoDocumento');
            const numDocParam = searchParams.get('numeroDocumento');

            if (retomarId) {
                setIsLoading(true);
                try {
                    const solicitud = await solicitudService.getById(retomarId);
                    setSolicitudId(solicitud.id);
                    setFormData({
                        datosPersonales: solicitud.datosPersonales,
                        datosLaborales: solicitud.datosLaborales || {},
                        productoSolicitado: solicitud.productoSolicitado || {},
                        auditoria: solicitud.auditoria || {},
                    });
                    // Calcular paso actual basado en datos completados? 
                    // Por simplicidad, dejamos en 1 o podríamos avanzar si ya hay datos.
                } catch (err) {
                    console.error('Error al retomar solicitud:', err);
                    setError('No se pudo cargar la solicitud anterior.');
                } finally {
                    setIsLoading(false);
                }
            } else if (tipoDocParam && numDocParam) {
                // Prellenar paso 1
                setFormData(prev => ({
                    ...prev,
                    datosPersonales: {
                        ...prev.datosPersonales,
                        tipoDocumento: tipoDocParam as any,
                        numeroDocumento: numDocParam,
                    }
                }));
            }
        };

        cargarDatosIniciales();
    }, [searchParams]);

    // Actualizar datos del formulario
    const updateFormData = useCallback(
        <K extends keyof FormData>(section: K, data: Partial<FormData[K]>) => {
            setFormData((prev) => ({
                ...prev,
                [section]: {
                    ...prev[section],
                    ...data,
                },
            }));
        },
        []
    );

    // Crear solicitud inicial (paso 1 completado)
    const createSolicitud = async () => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await solicitudService.create({
                datosPersonales: formData.datosPersonales as DatosPersonales,
                datosLaborales: formData.datosLaborales as DatosLaborales,
                productoSolicitado: formData.productoSolicitado as ProductoSolicitado,
                auditoria: formData.auditoria as Auditoria,
            });

            setSolicitudId(response.id);
            return true;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error al crear solicitud');
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    // Enviar solicitud para revisión
    const submitSolicitud = async () => {
        console.log('=== Submit Solicitud Iniciado ===');
        console.log('ID Solicitud:', solicitudId);

        if (!solicitudId) {
            console.error('ERROR: No hay solicitudId para enviar');
            setError('Error interno: No hay ID de solicitud');
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            console.log('Paso 1: Actualizando auditoría...');
            // Primero actualizar con los datos finales
            await solicitudService.update(solicitudId, {
                auditoria: formData.auditoria as Auditoria,
            });

            console.log('Paso 2: Enviando submit al backend...');
            // Luego enviar para revisión
            await solicitudService.submit(solicitudId);

            console.log('Paso 3: Redirigiendo a confirmación...');
            // Redirigir a página de confirmación
            router.push(`/confirmacion?id=${solicitudId}`);
        } catch (err) {
            console.error('ERROR EN SUBMIT:', err);
            const msg = err instanceof Error ? err.message : 'Error al enviar solicitud';
            setError(msg);
        } finally {
            setIsLoading(false);
        }
    };

    // Navegar al siguiente paso
    const handleNext = async () => {
        // Si es el primer paso y no hay solicitud, crearla
        if (currentStep === 1 && !solicitudId) {
            const success = await createSolicitud();
            if (!success) return;
        }

        // Validación de ingresos en el paso 2
        if (currentStep === 2) {
            const INGRESO_MINIMO_REQUERIDO = 1500000;
            const ingresoMensual = formData.datosLaborales.ingresoMensual || 0;
            const otrosIngresos = formData.datosLaborales.otrosIngresos || 0;
            const ingresoTotal = ingresoMensual + otrosIngresos;

            if (ingresoTotal < INGRESO_MINIMO_REQUERIDO) {
                setError(`El ingreso total mensual debe ser al menos $${INGRESO_MINIMO_REQUERIDO.toLocaleString('es-CO')} COP. Tu ingreso total actual es $${ingresoTotal.toLocaleString('es-CO')} COP.`);
                return;
            }
        }

        // Si es el último paso, enviar
        if (currentStep === 4) {
            await submitSolicitud();
            return;
        }

        setCurrentStep((prev) => Math.min(prev + 1, 4));
    };

    // Navegar al paso anterior
    const handlePrevious = () => {
        setCurrentStep((prev) => Math.max(prev - 1, 1));
    };

    // Constante del ingreso mínimo requerido
    const INGRESO_MINIMO_REQUERIDO = 1500000;

    // Calcular si el ingreso es insuficiente (para deshabilitar el botón en el paso 2)
    const ingresoTotal = (formData.datosLaborales.ingresoMensual || 0) + (formData.datosLaborales.otrosIngresos || 0);
    const isIngresoInsuficiente = currentStep === 2 && ingresoTotal < INGRESO_MINIMO_REQUERIDO;

    // Renderizar el paso actual
    const renderStep = () => {
        switch (currentStep) {
            case 1:
                return (
                    <DatosPersonalesStep
                        data={formData.datosPersonales}
                        onChange={(data) => updateFormData('datosPersonales', data)}
                    />
                );
            case 2:
                return (
                    <DatosLaboralesStep
                        data={formData.datosLaborales}
                        onChange={(data) => updateFormData('datosLaborales', data)}
                    />
                );
            case 3:
                return (
                    <ProductoStep
                        data={formData.productoSolicitado}
                        ingresoMensual={formData.datosLaborales.ingresoMensual || 0}
                        onChange={(data) => updateFormData('productoSolicitado', data)}
                    />
                );
            case 4:
                return (
                    <ConfirmacionStep
                        data={formData}
                        auditoria={formData.auditoria}
                        onChange={(data) => updateFormData('auditoria', data)}
                    />
                );
            default:
                return null;
        }
    };

    return (
        <div className="max-w-3xl mx-auto">
            {/* Progress Bar */}
            <div className="mb-8">
                <ProgressBar steps={stepsWithStatus} currentStep={currentStep} />
            </div>

            {/* Auto-save indicator */}
            <div className="flex justify-end mb-4 h-5">
                {isSaving && (
                    <span className="text-xs text-gray-500 flex items-center gap-1">
                        <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Guardando...
                    </span>
                )}
                {lastSaved && !isSaving && (
                    <span className="text-xs text-green-600 flex items-center gap-1">
                        <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        Guardado automáticamente
                    </span>
                )}
            </div>

            {/* Error message - Floating Banner */}
            {error && (
                <Toast
                    message={error}
                    type="error"
                    onClose={() => setError(null)}
                />
            )}

            {/* Form Container */}
            <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8">
                {/* Step Content */}
                <div className="mb-8">{renderStep()}</div>

                {/* Navigation Buttons */}
                <div className="flex justify-between gap-4 pt-6 border-t border-gray-100">
                    <button
                        type="button"
                        onClick={handlePrevious}
                        disabled={currentStep === 1 || isLoading}
                        className={`
              px-6 py-3 rounded-xl font-medium transition-all
              ${currentStep === 1
                                ? 'invisible'
                                : 'text-gray-600 hover:bg-gray-100 focus:ring-2 focus:ring-gray-200'
                            }
            `}
                    >
                        ← Anterior
                    </button>

                    <button
                        type="button"
                        onClick={handleNext}
                        disabled={isLoading || isIngresoInsuficiente}
                        className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/25 hover:from-blue-700 hover:to-indigo-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed transition-all flex items-center gap-2"
                    >
                        {isLoading && (
                            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                        )}
                        {currentStep === 4 ? 'Enviar Solicitud' : 'Siguiente →'}
                    </button>
                </div>
            </div>
        </div>
    );
}
