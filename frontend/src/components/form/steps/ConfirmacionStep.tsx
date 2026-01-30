'use client';

import type {
    DatosPersonales,
    DatosLaborales,
    ProductoSolicitado,
    Auditoria,
} from '@/types/solicitud';

interface ConfirmacionStepProps {
    data: {
        datosPersonales: Partial<DatosPersonales>;
        datosLaborales: Partial<DatosLaborales>;
        productoSolicitado: Partial<ProductoSolicitado>;
    };
    auditoria: Partial<Auditoria>;
    onChange: (data: Partial<Auditoria>) => void;
}

const tipoTarjetaLabels: Record<string, string> = {
    CLASICA: 'Clásica',
    ORO: 'Oro',
    PLATINUM: 'Platinum',
    BLACK: 'Black',
};

/**
 * Paso 4: Confirmación y Términos
 * Resumen de la solicitud y aceptación de términos
 */
export function ConfirmacionStep({ data, auditoria, onChange }: ConfirmacionStepProps) {
    const { datosPersonales, datosLaborales, productoSolicitado } = data;

    const allTermsAccepted =
        auditoria.aceptaTerminos &&
        auditoria.aceptaTratamientoDatos &&
        auditoria.autorizaConsultaCentrales;

    return (
        <div>
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Confirmación</h2>
                <p className="text-gray-600 mt-1">
                    Revisa tu información y acepta los términos para enviar la solicitud
                </p>
            </div>

            <div className="space-y-6">
                {/* Resumen de Datos Personales */}
                <section className="bg-gray-50 rounded-xl p-4">
                    <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 text-sm flex items-center justify-center">1</span>
                        Datos Personales
                    </h3>
                    <dl className="grid sm:grid-cols-2 gap-y-2 gap-x-4 text-sm">
                        <div>
                            <dt className="text-gray-500">Nombre completo</dt>
                            <dd className="font-medium text-gray-900">
                                {datosPersonales.nombres} {datosPersonales.apellidos}
                            </dd>
                        </div>
                        <div>
                            <dt className="text-gray-500">Documento</dt>
                            <dd className="font-medium text-gray-900">
                                {datosPersonales.tipoDocumento} {datosPersonales.numeroDocumento}
                            </dd>
                        </div>
                        <div>
                            <dt className="text-gray-500">Email</dt>
                            <dd className="font-medium text-gray-900">{datosPersonales.email}</dd>
                        </div>
                        <div>
                            <dt className="text-gray-500">Celular</dt>
                            <dd className="font-medium text-gray-900">{datosPersonales.celular}</dd>
                        </div>
                    </dl>
                </section>

                {/* Resumen de Datos Laborales */}
                <section className="bg-gray-50 rounded-xl p-4">
                    <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 text-sm flex items-center justify-center">2</span>
                        Datos Laborales
                    </h3>
                    <dl className="grid sm:grid-cols-2 gap-y-2 gap-x-4 text-sm">
                        <div>
                            <dt className="text-gray-500">Situación</dt>
                            <dd className="font-medium text-gray-900">{datosLaborales.situacionLaboral}</dd>
                        </div>
                        {datosLaborales.nombreEmpresa && (
                            <div>
                                <dt className="text-gray-500">Empresa</dt>
                                <dd className="font-medium text-gray-900">{datosLaborales.nombreEmpresa}</dd>
                            </div>
                        )}
                        <div>
                            <dt className="text-gray-500">Ingreso mensual</dt>
                            <dd className="font-medium text-gray-900">
                                ${datosLaborales.ingresoMensual?.toLocaleString('es-CO')} COP
                            </dd>
                        </div>
                    </dl>
                </section>

                {/* Resumen del Producto */}
                <section className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4">
                    <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 text-sm flex items-center justify-center">3</span>
                        Tu Tarjeta de Crédito
                    </h3>
                    <dl className="grid sm:grid-cols-2 gap-y-2 gap-x-4 text-sm">
                        <div>
                            <dt className="text-gray-500">Tipo de tarjeta</dt>
                            <dd className="font-medium text-gray-900">
                                {productoSolicitado.tipoTarjeta && tipoTarjetaLabels[productoSolicitado.tipoTarjeta]}
                            </dd>
                        </div>
                        <div>
                            <dt className="text-gray-500">Franquicia</dt>
                            <dd className="font-medium text-gray-900">{productoSolicitado.franquicia}</dd>
                        </div>
                        <div>
                            <dt className="text-gray-500">Cupo solicitado</dt>
                            <dd className="font-medium text-blue-700 text-lg">
                                ${productoSolicitado.cupoSolicitado?.toLocaleString('es-CO')} COP
                            </dd>
                        </div>
                        <div>
                            <dt className="text-gray-500">Seguros adicionales</dt>
                            <dd className="font-medium text-gray-900">
                                {productoSolicitado.segurosAdicionales ? 'Sí' : 'No'}
                            </dd>
                        </div>
                    </dl>
                </section>

                {/* Términos y Condiciones */}
                <section className="border-t pt-6">
                    <h3 className="font-semibold text-gray-900 mb-4">
                        Términos y Autorizaciones
                    </h3>

                    <div className="space-y-4">
                        <div className="flex items-start gap-3">
                            <input
                                type="checkbox"
                                id="aceptaTerminos"
                                checked={auditoria.aceptaTerminos || false}
                                onChange={(e) => onChange({ aceptaTerminos: e.target.checked })}
                                className="mt-1 w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                aria-describedby="terminos-desc"
                                required
                            />
                            <label htmlFor="aceptaTerminos" className="cursor-pointer">
                                <span className="font-medium text-gray-900">
                                    Acepto los términos y condiciones
                                    <span className="text-red-500 ml-1">*</span>
                                </span>
                                <p id="terminos-desc" className="text-sm text-gray-600 mt-1">
                                    He leído y acepto los{' '}
                                    <a href="#" className="text-blue-600 underline hover:text-blue-700">
                                        términos y condiciones
                                    </a>{' '}
                                    del producto.
                                </p>
                            </label>
                        </div>

                        <div className="flex items-start gap-3">
                            <input
                                type="checkbox"
                                id="aceptaTratamientoDatos"
                                checked={auditoria.aceptaTratamientoDatos || false}
                                onChange={(e) => onChange({ aceptaTratamientoDatos: e.target.checked })}
                                className="mt-1 w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                aria-describedby="datos-desc"
                                required
                            />
                            <label htmlFor="aceptaTratamientoDatos" className="cursor-pointer">
                                <span className="font-medium text-gray-900">
                                    Autorizo el tratamiento de mis datos personales
                                    <span className="text-red-500 ml-1">*</span>
                                </span>
                                <p id="datos-desc" className="text-sm text-gray-600 mt-1">
                                    Autorizo a Banco Digital para el tratamiento de mis datos según la{' '}
                                    <a href="#" className="text-blue-600 underline hover:text-blue-700">
                                        política de privacidad
                                    </a>
                                    .
                                </p>
                            </label>
                        </div>

                        <div className="flex items-start gap-3">
                            <input
                                type="checkbox"
                                id="autorizaConsultaCentrales"
                                checked={auditoria.autorizaConsultaCentrales || false}
                                onChange={(e) => onChange({ autorizaConsultaCentrales: e.target.checked })}
                                className="mt-1 w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                aria-describedby="centrales-desc"
                                required
                            />
                            <label htmlFor="autorizaConsultaCentrales" className="cursor-pointer">
                                <span className="font-medium text-gray-900">
                                    Autorizo consulta en centrales de riesgo
                                    <span className="text-red-500 ml-1">*</span>
                                </span>
                                <p id="centrales-desc" className="text-sm text-gray-600 mt-1">
                                    Autorizo a Banco Digital para consultar mi historial crediticio
                                    en centrales de información como Datacrédito y TransUnion.
                                </p>
                            </label>
                        </div>
                    </div>

                    {/* Warning si no se han aceptado todos */}
                    {!allTermsAccepted && (
                        <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-700 text-sm flex items-center gap-2">
                            <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                            Debes aceptar todos los términos para continuar
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
}
