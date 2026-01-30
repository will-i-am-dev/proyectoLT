import { Suspense } from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { FormWizard } from '@/components/form/FormWizard';

export const metadata: Metadata = {
    title: 'Solicitar Tarjeta de Crédito | Banco Digital',
    description: 'Completa tu solicitud de tarjeta de crédito en pocos minutos. Proceso 100% digital con aprobación rápida.',
};

/**
 * Página de Solicitud - Server Component
 * Contiene el formulario multipaso como Client Component
 */
export default function SolicitudPage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
            {/* Header */}
            <header className="bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <Link href="/" className="flex items-center gap-2">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
                                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z" />
                                </svg>
                            </div>
                            <span className="font-bold text-xl text-gray-900">Banco Digital</span>
                        </Link>

                        <Link
                            href="/"
                            className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-gray-50"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                            Volver al inicio
                        </Link>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
                <div className="lg:grid lg:grid-cols-12 lg:gap-16 items-start">

                    {/* Left Column - Information */}
                    <div className="hidden lg:block lg:col-span-5 lg:sticky lg:top-24 pt-8">
                        <div className="mb-8">
                            <span className="inline-block px-4 py-1.5 bg-blue-100 text-blue-700 rounded-full text-sm font-medium mb-6">
                                Solicitud Digital
                            </span>
                            <h1 className="text-4xl font-bold text-gray-900 leading-tight mb-4">
                                Tu nueva tarjeta de crédito <br />
                                <span className="text-blue-600">está muy cerca</span>
                            </h1>
                            <p className="text-lg text-gray-600 mb-8">
                                Completa tu solicitud en minutos y recibe respuesta inmediata. Sin filas, sin papeleos.
                            </p>
                        </div>

                        {/* Benefits List */}
                        <div className="space-y-6">
                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-900">Respuesta Inmediata</h3>
                                    <p className="text-sm text-gray-600">Conocemos el resultado de tu solicitud al instante de terminar el formulario.</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-900">100% Seguro</h3>
                                    <p className="text-sm text-gray-600">Tus datos están protegidos con los más altos estándares de seguridad bancaria.</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center flex-shrink-0">
                                    <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-900">Tarjeta Virtual Inmediata</h3>
                                    <p className="text-sm text-gray-600">Empieza a comprar online inmediatamente si tu solicitud es aprobada.</p>
                                </div>
                            </div>
                        </div>

                        {/* Customer Support Info */}
                        <div className="mt-12 pt-8 border-t border-gray-100">
                            <p className="text-sm text-gray-500 mb-2">¿Necesitas ayuda?</p>
                            <div className="flex items-center gap-2 text-gray-900 font-medium">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                </svg>
                                01 8000 123 456
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Form */}
                    <div className="lg:col-span-7">
                        {/* Mobile Title (visible only on mobile) */}
                        <div className="lg:hidden mb-8 text-center">
                            <h1 className="text-2xl font-bold text-gray-900 mb-2">
                                Solicitud de Tarjeta
                            </h1>
                            <p className="text-gray-600 text-sm">
                                Completa los pasos para solicitar tu tarjeta
                            </p>
                        </div>

                        <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 p-6 sm:p-8 border border-gray-100">
                            <Suspense fallback={
                                <div className="flex flex-col items-center justify-center py-12">
                                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                                    <p className="text-gray-500 text-sm">Cargando formulario...</p>
                                </div>
                            }>
                                <FormWizard />
                            </Suspense>
                        </div>

                        <div className="mt-6 text-center lg:hidden">
                            <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                                <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                                Tus datos están 100% protegidos
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
