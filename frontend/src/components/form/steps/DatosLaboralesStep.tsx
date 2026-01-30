'use client';

import { Input, Select } from '@/components/ui';
import type { DatosLaborales, SituacionLaboral, TipoContrato } from '@/types/solicitud';

interface DatosLaboralesStepProps {
    data: Partial<DatosLaborales>;
    onChange: (data: Partial<DatosLaborales>) => void;
}

const situacionLaboralOptions = [
    { value: 'EMPLEADO', label: 'Empleado' },
    { value: 'INDEPENDIENTE', label: 'Independiente' },
    { value: 'PENSIONADO', label: 'Pensionado' },
    { value: 'OTRO', label: 'Otro' },
];

const tipoContratoOptions = [
    { value: 'INDEFINIDO', label: 'Contrato Indefinido' },
    { value: 'FIJO', label: 'Contrato a Término Fijo' },
    { value: 'PRESTACION_SERVICIOS', label: 'Prestación de Servicios' },
    { value: 'N/A', label: 'No Aplica' },
];

/**
 * Paso 2: Datos Laborales
 * Información de empleo e ingresos
 */
export function DatosLaboralesStep({ data, onChange }: DatosLaboralesStepProps) {
    const handleChange = (field: keyof DatosLaborales, value: string | number) => {
        onChange({ [field]: value });
    };

    const isEmpleado = data.situacionLaboral === 'EMPLEADO';
    const showEmpresa = data.situacionLaboral && data.situacionLaboral !== 'PENSIONADO';

    // Formatear número como moneda
    const formatCurrency = (value: number | undefined) => {
        if (!value) return '';
        return value.toLocaleString('es-CO');
    };

    // Parsear entrada de moneda
    const parseCurrency = (value: string) => {
        const number = parseInt(value.replace(/\D/g, ''), 10);
        return isNaN(number) ? 0 : number;
    };

    return (
        <div>
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Datos Laborales</h2>
                <p className="text-gray-600 mt-1">
                    Cuéntanos sobre tu situación laboral e ingresos
                </p>
            </div>

            <fieldset>
                <legend className="sr-only">Información laboral</legend>

                <div className="grid gap-6">
                    {/* Situación Laboral */}
                    <div className="grid sm:grid-cols-2 gap-4">
                        <Select
                            label="Situación Laboral"
                            name="situacionLaboral"
                            value={data.situacionLaboral || ''}
                            onChange={(e) => handleChange('situacionLaboral', e.target.value as SituacionLaboral)}
                            options={situacionLaboralOptions}
                            placeholder="Selecciona..."
                            required
                        />

                        {isEmpleado && (
                            <Select
                                label="Tipo de Contrato"
                                name="tipoContrato"
                                value={data.tipoContrato || ''}
                                onChange={(e) => handleChange('tipoContrato', e.target.value as TipoContrato)}
                                options={tipoContratoOptions}
                                placeholder="Selecciona..."
                                required
                            />
                        )}
                    </div>

                    {/* Datos de la empresa */}
                    {showEmpresa && (
                        <>
                            <div className="grid sm:grid-cols-2 gap-4">
                                <Input
                                    label="Nombre de la Empresa"
                                    name="nombreEmpresa"
                                    value={data.nombreEmpresa || ''}
                                    onChange={(e) => handleChange('nombreEmpresa', e.target.value)}
                                    placeholder="Empresa ABC S.A.S."
                                    required
                                />
                                <Input
                                    label="Cargo Actual"
                                    name="cargoActual"
                                    value={data.cargoActual || ''}
                                    onChange={(e) => handleChange('cargoActual', e.target.value)}
                                    placeholder="Ingeniero de Software"
                                />
                            </div>

                            <div className="sm:w-1/2">
                                <Input
                                    label="Antigüedad (meses)"
                                    name="antiguedadMeses"
                                    type="number"
                                    value={data.antiguedadMeses?.toString() || ''}
                                    onChange={(e) => handleChange('antiguedadMeses', parseInt(e.target.value, 10) || 0)}
                                    placeholder="24"
                                    min={0}
                                    required
                                    helperText="Meses trabajando en la empresa actual"
                                />
                            </div>
                        </>
                    )}

                    {/* Ingresos */}
                    <div className="border-t pt-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                            Información de Ingresos
                        </h3>

                        <div className="grid sm:grid-cols-2 gap-4">
                            <div>
                                <Input
                                    label="Ingreso Mensual"
                                    name="ingresoMensual"
                                    value={formatCurrency(data.ingresoMensual)}
                                    onChange={(e) => handleChange('ingresoMensual', parseCurrency(e.target.value))}
                                    placeholder="3,000,000"
                                    required
                                    inputMode="numeric"
                                    helperText="Mínimo $1,500,000 COP"
                                />
                                {data.ingresoMensual && data.ingresoMensual < 1500000 && (
                                    <p className="text-xs text-amber-600 mt-1 flex items-center gap-1">
                                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                        </svg>
                                        El ingreso mínimo requerido es $1,500,000 COP
                                    </p>
                                )}
                            </div>

                            <Input
                                label="Otros Ingresos (opcional)"
                                name="otrosIngresos"
                                value={formatCurrency(data.otrosIngresos)}
                                onChange={(e) => handleChange('otrosIngresos', parseCurrency(e.target.value))}
                                placeholder="500,000"
                                inputMode="numeric"
                                helperText="Arriendos, inversiones, etc."
                            />
                        </div>

                        {/* Resumen de ingresos */}
                        {data.ingresoMensual && (
                            <div className="mt-6 p-4 bg-blue-50 rounded-xl">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-600">Ingreso total mensual:</span>
                                    <span className="text-lg font-bold text-blue-700">
                                        ${((data.ingresoMensual || 0) + (data.otrosIngresos || 0)).toLocaleString('es-CO')} COP
                                    </span>
                                </div>
                                <p className="text-xs text-gray-500 mt-2">
                                    Cupo máximo estimado: hasta{' '}
                                    <strong>
                                        ${(((data.ingresoMensual || 0) + (data.otrosIngresos || 0)) * 3).toLocaleString('es-CO')}
                                    </strong>{' '}
                                    COP (3x ingreso)
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </fieldset>
        </div>
    );
}
