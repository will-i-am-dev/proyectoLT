'use client';

import { Select, Input } from '@/components/ui';
import type { ProductoSolicitado, TipoTarjeta, Franquicia } from '@/types/solicitud';

interface ProductoStepProps {
    data: Partial<ProductoSolicitado>;
    ingresoMensual: number;
    onChange: (data: Partial<ProductoSolicitado>) => void;
}

const tarjetas = [
    {
        tipo: 'CLASICA' as TipoTarjeta,
        nombre: 'Clásica',
        cupoMaximo: 5000000,
        ingresoMinimo: 1500000,
        gradient: 'from-blue-500 to-blue-700',
    },
    {
        tipo: 'ORO' as TipoTarjeta,
        nombre: 'Oro',
        cupoMaximo: 15000000,
        ingresoMinimo: 3000000,
        gradient: 'from-amber-400 to-amber-600',
    },
    {
        tipo: 'PLATINUM' as TipoTarjeta,
        nombre: 'Platinum',
        cupoMaximo: 40000000,
        ingresoMinimo: 8000000,
        gradient: 'from-gray-400 to-gray-600',
    },
    {
        tipo: 'BLACK' as TipoTarjeta,
        nombre: 'Black',
        cupoMaximo: 100000000,
        ingresoMinimo: 15000000,
        gradient: 'from-gray-800 to-gray-950',
    },
];

const franquiciaOptions = [
    { value: 'VISA', label: 'Visa' },
    { value: 'MASTERCARD', label: 'Mastercard' },
];

/**
 * Paso 3: Producto Solicitado
 * Selección de tipo de tarjeta, cupo y franquicia
 */
export function ProductoStep({ data, ingresoMensual, onChange }: ProductoStepProps) {
    // Filtrar tarjetas disponibles según ingreso
    const tarjetasDisponibles = tarjetas.filter((t) => ingresoMensual >= t.ingresoMinimo);

    // Cupo máximo basado en la tarjeta seleccionada y el ingreso (3x)
    const tarjetaSeleccionada = tarjetas.find((t) => t.tipo === data.tipoTarjeta);
    const cupoMaximoPermitido = Math.min(
        tarjetaSeleccionada?.cupoMaximo || 5000000,
        ingresoMensual * 3
    );

    const handleTipoTarjetaChange = (tipo: TipoTarjeta) => {
        onChange({
            tipoTarjeta: tipo,
            // Resetear cupo si excede el nuevo máximo
            cupoSolicitado: Math.min(data.cupoSolicitado || 0, cupoMaximoPermitido),
        });
    };

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
                <h2 className="text-2xl font-bold text-gray-900">Tu Tarjeta de Crédito</h2>
                <p className="text-gray-600 mt-1">
                    Elige el tipo de tarjeta y el cupo que deseas solicitar
                </p>
            </div>

            <fieldset>
                <legend className="sr-only">Selección de producto</legend>

                <div className="grid gap-6">
                    {/* Selección de Tipo de Tarjeta */}
                    <div>
                        <label className="text-sm font-medium text-gray-700 mb-3 block">
                            Tipo de Tarjeta <span className="text-red-500">*</span>
                        </label>

                        <div className="grid sm:grid-cols-2 gap-4" role="radiogroup" aria-label="Tipo de tarjeta">
                            {tarjetas.map((tarjeta) => {
                                const isDisabled = ingresoMensual < tarjeta.ingresoMinimo;
                                const isSelected = data.tipoTarjeta === tarjeta.tipo;

                                return (
                                    <button
                                        key={tarjeta.tipo}
                                        type="button"
                                        role="radio"
                                        aria-checked={isSelected}
                                        aria-disabled={isDisabled}
                                        onClick={() => !isDisabled && handleTipoTarjetaChange(tarjeta.tipo)}
                                        disabled={isDisabled}
                                        className={`
                      relative p-4 rounded-xl border-2 transition-all text-left
                      ${isSelected
                                                ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                                                : isDisabled
                                                    ? 'border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed'
                                                    : 'border-gray-200 hover:border-gray-300 cursor-pointer'
                                            }
                    `}
                                    >
                                        {/* Mini card preview */}
                                        <div className={`w-full h-16 bg-gradient-to-br ${tarjeta.gradient} rounded-lg mb-3 flex items-end p-2`}>
                                            <span className="text-white text-xs font-medium">{tarjeta.nombre}</span>
                                        </div>

                                        <div className="flex justify-between items-start">
                                            <div>
                                                <span className="font-semibold text-gray-900">{tarjeta.nombre}</span>
                                                <p className="text-xs text-gray-500 mt-0.5">
                                                    Hasta ${tarjeta.cupoMaximo.toLocaleString('es-CO')}
                                                </p>
                                            </div>

                                            {isSelected && (
                                                <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                                                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                    </svg>
                                                </div>
                                            )}
                                        </div>

                                        {isDisabled && (
                                            <p className="text-xs text-amber-600 mt-2">
                                                Requiere ingreso mín. ${tarjeta.ingresoMinimo.toLocaleString('es-CO')}
                                            </p>
                                        )}
                                    </button>
                                );
                            })}
                        </div>

                        {tarjetasDisponibles.length === 0 && (
                            <p className="mt-4 text-sm text-amber-600 bg-amber-50 p-3 rounded-lg">
                                Con tu ingreso actual solo puedes acceder a la tarjeta Clásica.
                                Verifica que hayas ingresado correctamente tu información laboral.
                            </p>
                        )}
                    </div>

                    {/* Cupo Solicitado */}
                    <div className="grid sm:grid-cols-2 gap-4">
                        <div>
                            <Input
                                label="Cupo Solicitado"
                                name="cupoSolicitado"
                                value={formatCurrency(data.cupoSolicitado)}
                                onChange={(e) => onChange({ cupoSolicitado: parseCurrency(e.target.value) })}
                                placeholder="5,000,000"
                                required
                                inputMode="numeric"
                                helperText={`Mín. $500,000 • Máx. $${cupoMaximoPermitido.toLocaleString('es-CO')}`}
                            />
                            {data.cupoSolicitado && data.cupoSolicitado < 500000 && (
                                <p className="text-xs text-red-600 mt-1">
                                    El cupo mínimo es $500,000 COP
                                </p>
                            )}
                            {data.cupoSolicitado && data.cupoSolicitado > cupoMaximoPermitido && (
                                <p className="text-xs text-red-600 mt-1">
                                    El cupo máximo permitido es ${cupoMaximoPermitido.toLocaleString('es-CO')} COP
                                </p>
                            )}
                        </div>

                        <Select
                            label="Franquicia"
                            name="franquicia"
                            value={data.franquicia || ''}
                            onChange={(e) => onChange({ franquicia: e.target.value as Franquicia })}
                            options={franquiciaOptions}
                            placeholder="Selecciona..."
                            required
                        />
                    </div>

                    {/* Seguros Adicionales */}
                    <div className="border-t pt-6">
                        <div className="flex items-start gap-3">
                            <input
                                type="checkbox"
                                id="segurosAdicionales"
                                checked={data.segurosAdicionales || false}
                                onChange={(e) => onChange({ segurosAdicionales: e.target.checked })}
                                className="mt-1 w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <label htmlFor="segurosAdicionales" className="cursor-pointer">
                                <span className="font-medium text-gray-900">Agregar seguros adicionales</span>
                                <p className="text-sm text-gray-600 mt-1">
                                    Protección contra fraude, robo y pérdida de la tarjeta.
                                    Cobertura de deuda en caso de fallecimiento o incapacidad.
                                </p>
                                <span className="inline-block mt-2 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                                    Recomendado
                                </span>
                            </label>
                        </div>
                    </div>

                    {/* Resumen */}
                    {data.tipoTarjeta && data.cupoSolicitado && data.franquicia && (
                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4">
                            <h3 className="font-semibold text-gray-900 mb-2">Resumen de tu tarjeta</h3>
                            <dl className="grid grid-cols-2 gap-2 text-sm">
                                <dt className="text-gray-500">Tipo:</dt>
                                <dd className="font-medium text-gray-900">{tarjetaSeleccionada?.nombre}</dd>
                                <dt className="text-gray-500">Franquicia:</dt>
                                <dd className="font-medium text-gray-900">{data.franquicia}</dd>
                                <dt className="text-gray-500">Cupo solicitado:</dt>
                                <dd className="font-medium text-gray-900">${data.cupoSolicitado.toLocaleString('es-CO')}</dd>
                                <dt className="text-gray-500">Seguros:</dt>
                                <dd className="font-medium text-gray-900">{data.segurosAdicionales ? 'Sí' : 'No'}</dd>
                            </dl>
                        </div>
                    )}
                </div>
            </fieldset>
        </div>
    );
}
