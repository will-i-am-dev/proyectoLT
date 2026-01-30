'use client';

import { Input, Select } from '@/components/ui';
import type { DatosPersonales, TipoDocumento, Genero } from '@/types/solicitud';

interface DatosPersonalesStepProps {
    data: Partial<DatosPersonales>;
    onChange: (data: Partial<DatosPersonales>) => void;
}

const tipoDocumentoOptions = [
    { value: 'CC', label: 'Cédula de Ciudadanía' },
    { value: 'CE', label: 'Cédula de Extranjería' },
    { value: 'PAS', label: 'Pasaporte' },
];

const generoOptions = [
    { value: 'M', label: 'Masculino' },
    { value: 'F', label: 'Femenino' },
    { value: 'OTRO', label: 'Otro' },
    { value: 'PREFIERO_NO_DECIR', label: 'Prefiero no decir' },
];

const departamentos = [
    'Amazonas', 'Antioquia', 'Arauca', 'Atlántico', 'Bolívar', 'Boyacá',
    'Caldas', 'Caquetá', 'Casanare', 'Cauca', 'Cesar', 'Chocó', 'Córdoba',
    'Cundinamarca', 'Guainía', 'Guaviare', 'Huila', 'La Guajira', 'Magdalena',
    'Meta', 'Nariño', 'Norte de Santander', 'Putumayo', 'Quindío', 'Risaralda',
    'San Andrés', 'Santander', 'Sucre', 'Tolima', 'Valle del Cauca', 'Vaupés', 'Vichada',
];

/**
 * Paso 1: Datos Personales
 * Formulario accesible con validación en tiempo real
 */
export function DatosPersonalesStep({ data, onChange }: DatosPersonalesStepProps) {
    const handleChange = (field: keyof DatosPersonales, value: string) => {
        onChange({ [field]: value });
    };

    const handleDireccionChange = (field: string, value: string) => {
        const currentDireccion = data.direccionResidencia || {
            calle: '',
            ciudad: '',
            departamento: '',
            codigoPostal: '',
        };

        onChange({
            direccionResidencia: {
                ...currentDireccion,
                [field]: value,
            },
        });
    };

    return (
        <div>
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Datos Personales</h2>
                <p className="text-gray-600 mt-1">
                    Ingresa tu información personal para la solicitud
                </p>
            </div>

            <fieldset>
                <legend className="sr-only">Información personal</legend>

                <div className="grid gap-6">
                    {/* Nombres y Apellidos */}
                    <div className="grid sm:grid-cols-2 gap-4">
                        <Input
                            label="Nombres"
                            name="nombres"
                            value={data.nombres || ''}
                            onChange={(e) => handleChange('nombres', e.target.value)}
                            placeholder="Juan Carlos"
                            required
                            autoComplete="given-name"
                        />
                        <Input
                            label="Apellidos"
                            name="apellidos"
                            value={data.apellidos || ''}
                            onChange={(e) => handleChange('apellidos', e.target.value)}
                            placeholder="Pérez González"
                            required
                            autoComplete="family-name"
                        />
                    </div>

                    {/* Documento */}
                    <div className="grid sm:grid-cols-2 gap-4">
                        <Select
                            label="Tipo de Documento"
                            name="tipoDocumento"
                            value={data.tipoDocumento || ''}
                            onChange={(e) => handleChange('tipoDocumento', e.target.value as TipoDocumento)}
                            options={tipoDocumentoOptions}
                            placeholder="Selecciona..."
                            required
                        />
                        <Input
                            label="Número de Documento"
                            name="numeroDocumento"
                            value={data.numeroDocumento || ''}
                            onChange={(e) => handleChange('numeroDocumento', e.target.value)}
                            placeholder="1234567890"
                            required
                            inputMode="numeric"
                        />
                    </div>

                    {/* Fecha de Nacimiento y Género */}
                    <div className="grid sm:grid-cols-2 gap-4">
                        <Input
                            label="Fecha de Nacimiento"
                            name="fechaNacimiento"
                            type="date"
                            value={data.fechaNacimiento || ''}
                            onChange={(e) => handleChange('fechaNacimiento', e.target.value)}
                            required
                            max={new Date(new Date().setFullYear(new Date().getFullYear() - 18)).toISOString().split('T')[0]}
                            helperText="Debes ser mayor de 18 años"
                        />
                        <Select
                            label="Género"
                            name="genero"
                            value={data.genero || ''}
                            onChange={(e) => handleChange('genero', e.target.value as Genero)}
                            options={generoOptions}
                            placeholder="Selecciona..."
                            required
                        />
                    </div>

                    {/* Contacto */}
                    <div className="grid sm:grid-cols-2 gap-4">
                        <Input
                            label="Correo Electrónico"
                            name="email"
                            type="email"
                            value={data.email || ''}
                            onChange={(e) => handleChange('email', e.target.value)}
                            placeholder="correo@ejemplo.com"
                            required
                            autoComplete="email"
                        />
                        <div className="relative">
                            <label htmlFor="celular" className="text-sm font-medium text-gray-700 mb-1.5 block">
                                Celular <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                {/* Prefijo visual */}
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <span className="text-gray-500 font-medium">+57</span>
                                </div>
                                <input
                                    id="celular"
                                    name="celular"
                                    type="tel"
                                    value={data.celular?.replace('+57', '') || ''}
                                    onChange={(e) => {
                                        const value = e.target.value.replace(/\D/g, '').slice(0, 10);
                                        handleChange('celular', value ? `+57${value}` : '');
                                    }}
                                    placeholder="3001234567"
                                    required
                                    autoComplete="tel-national"
                                    className={`
                                        w-full pl-12 pr-4 py-3 rounded-xl border transition-all duration-200
                                        focus:outline-none focus:ring-2 focus:ring-offset-1 border-gray-200 focus:ring-blue-500 focus:border-blue-500 hover:border-gray-300
                                    `}
                                    inputMode="numeric"
                                />
                            </div>
                            <p className="text-xs text-gray-500 mt-1.5">
                                Ingresa los 10 dígitos sin espacios
                            </p>
                        </div>
                    </div>

                    {/* Dirección */}
                    <div className="border-t pt-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                            Dirección de Residencia
                        </h3>

                        <div className="grid gap-4">
                            <Input
                                label="Dirección"
                                name="calle"
                                value={data.direccionResidencia?.calle || ''}
                                onChange={(e) => handleDireccionChange('calle', e.target.value)}
                                placeholder="Calle 123 #45-67"
                                required
                                autoComplete="street-address"
                            />

                            <div className="grid sm:grid-cols-2 gap-4">
                                <Input
                                    label="Ciudad"
                                    name="ciudad"
                                    value={data.direccionResidencia?.ciudad || ''}
                                    onChange={(e) => handleDireccionChange('ciudad', e.target.value)}
                                    placeholder="Bogotá"
                                    required
                                    autoComplete="address-level2"
                                />
                                <Select
                                    label="Departamento"
                                    name="departamento"
                                    value={data.direccionResidencia?.departamento || ''}
                                    onChange={(e) => handleDireccionChange('departamento', e.target.value)}
                                    options={departamentos.map((d) => ({ value: d, label: d }))}
                                    placeholder="Selecciona..."
                                    required
                                />
                            </div>

                            <div className="sm:w-1/2">
                                <Input
                                    label="Código Postal"
                                    name="codigoPostal"
                                    value={data.direccionResidencia?.codigoPostal || ''}
                                    onChange={(e) => handleDireccionChange('codigoPostal', e.target.value)}
                                    placeholder="110111"
                                    required
                                    inputMode="numeric"
                                    maxLength={6}
                                    autoComplete="postal-code"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </fieldset>
        </div>
    );
}
