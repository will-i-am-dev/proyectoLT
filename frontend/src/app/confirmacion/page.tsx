import { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@/components/ui';

export const metadata: Metadata = {
    title: 'Solicitud Enviada | Banco Digital',
    description: 'Tu solicitud de tarjeta de crédito ha sido enviada exitosamente.',
};

/**
 * Página de Confirmación - Server Component
 * Muestra el éxito del envío de la solicitud
 */
export default function ConfirmacionPage() {
    return (
        <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex flex-col">
            {/* Header */}
            <header className="bg-white border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center h-16">
                        <Link href="/" className="flex items-center gap-2">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
                                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z" />
                                </svg>
                            </div>
                            <span className="font-bold text-xl text-gray-900">Banco Digital</span>
                        </Link>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main id="main-content" className="flex-1 flex items-center justify-center py-12">
                <div className="max-w-lg mx-auto px-4 text-center">
                    {/* Success Icon */}
                    <div className="mb-8 relative">
                        <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto shadow-xl shadow-green-500/30 animate-pulse-glow">
                            <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        {/* Celebration particles */}
                        <div className="absolute inset-0 pointer-events-none">
                            <div className="absolute top-2 left-1/4 w-2 h-2 bg-yellow-400 rounded-full animate-float" style={{ animationDelay: '0s' }} />
                            <div className="absolute top-4 right-1/4 w-3 h-3 bg-blue-400 rounded-full animate-float" style={{ animationDelay: '0.5s' }} />
                            <div className="absolute bottom-4 left-1/3 w-2 h-2 bg-green-400 rounded-full animate-float" style={{ animationDelay: '1s' }} />
                        </div>
                    </div>

                    {/* Message */}
                    <h1 className="text-3xl font-bold text-gray-900 mb-4">
                        ¡Solicitud Enviada Exitosamente!
                    </h1>

                    <p className="text-lg text-gray-600 mb-6">
                        Tu solicitud de tarjeta de crédito ha sido recibida y está siendo procesada.
                        Te contactaremos pronto con el resultado.
                    </p>

                    {/* Info Card */}
                    <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 text-left">
                        <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                            </svg>
                            ¿Qué sigue?
                        </h2>

                        <ol className="space-y-4 text-sm">
                            <li className="flex gap-3">
                                <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold">
                                    1
                                </span>
                                <div>
                                    <p className="font-medium text-gray-900">Validación de información</p>
                                    <p className="text-gray-600">Verificaremos tus datos y consultaremos centrales de riesgo.</p>
                                </div>
                            </li>
                            <li className="flex gap-3">
                                <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold">
                                    2
                                </span>
                                <div>
                                    <p className="font-medium text-gray-900">Análisis de crédito</p>
                                    <p className="text-gray-600">Evaluaremos tu perfil para determinar el cupo aprobado.</p>
                                </div>
                            </li>
                            <li className="flex gap-3">
                                <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold">
                                    3
                                </span>
                                <div>
                                    <p className="font-medium text-gray-900">Notificación de resultado</p>
                                    <p className="text-gray-600">Recibirás un correo electrónico en menos de 24 horas.</p>
                                </div>
                            </li>
                        </ol>
                    </div>

                    {/* Expected timeline */}
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-8 flex items-center gap-3 text-left">
                        <svg className="w-6 h-6 text-amber-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                        </svg>
                        <p className="text-sm text-amber-800">
                            <strong>Tiempo estimado de respuesta:</strong> 24 horas hábiles
                        </p>
                    </div>

                    {/* Actions */}
                    <div className="space-y-4">
                        <Link href="/" className="block">
                            <Button fullWidth size="lg">
                                Volver al Inicio
                            </Button>
                        </Link>

                        <p className="text-sm text-gray-500">
                            ¿Tienes preguntas?{' '}
                            <a href="#" className="text-blue-600 hover:underline">
                                Contacta a soporte
                            </a>
                        </p>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="py-6 text-center text-sm text-gray-500">
                © 2026 Banco Digital. Todos los derechos reservados.
            </footer>
        </div>
    );
}
