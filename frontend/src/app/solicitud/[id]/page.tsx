'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { solicitudService } from '@/services/solicitud.service';
import { SolicitudResponse, EstadoSolicitud } from '@/types/solicitud';
import { Button } from '@/components/ui';
import Link from 'next/link';

export default function SolicitudDashboard() {
    const params = useParams();
    const router = useRouter();
    const id = params.id as string;
    const [solicitud, setSolicitud] = useState<SolicitudResponse | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchSolicitud = async () => {
            try {
                const data = await solicitudService.getById(id);
                setSolicitud(data);
            } catch (err) {
                console.error('Error fetching solicitud:', err);
                setError('No se pudo cargar la información de la solicitud.');
            } finally {
                setIsLoading(false);
            }
        };

        if (id) {
            fetchSolicitud();
        }
    }, [id]);

    const handleContinuar = () => {
        // Redirigir al wizard pero NO necesitamos pasar params, 
        // el wizard debería ser capaz de retomar por ID si lo guardamos en local o cookie.
        // Pero actualmente el wizard es por sesión/estado volátil.
        // El usuario pide "hacer el crud".
        // Si es DRAFT, quizás redirigir a una ruta de edición `/solicitud/editar/[id]` o 
        // hacer que `/solicitud` acepte `?id=XYZ` para cargar.

        // Vamos a asumir que modificaremos el wizard en `/solicitud` para aceptar `id` en query o algo.
        // O mejor, redirigir a una ruta especial o cargar el wizard aquí?
        // El wizard está en `/solicitud/page.tsx`.
        // Si voy a `/solicitud?retomar=ID`, el wizard debería cargar.

        router.push(`/solicitud?retomar=${id}`);
    };

    const handleAbandonar = async () => {
        if (!confirm('¿Estás seguro de abandonar esta solicitud? No podrás recuperarla.')) return;

        try {
            await solicitudService.abandon(id);
            // Recargar estado
            const data = await solicitudService.getById(id);
            setSolicitud(data);
        } catch (err) {
            alert('Error al abandonar solicitud');
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (error || !solicitud) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
                <div className="text-red-600 mb-4 text-center">
                    <svg className="w-16 h-16 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <h2 className="text-xl font-bold">Error</h2>
                    <p>{error || 'Solicitud no encontrada'}</p>
                </div>
                <Link href="/">
                    <Button variant="outline">Volver al inicio</Button>
                </Link>
            </div>
        );
    }

    const { estado, numeroSolicitud, datosPersonales, productoSolicitado } = solicitud;

    const StatusBadge = ({ status }: { status: string }) => {
        const styles: Record<string, string> = {
            draft: 'bg-gray-100 text-gray-800',
            submitted: 'bg-blue-100 text-blue-800',
            in_review: 'bg-yellow-100 text-yellow-800',
            approved: 'bg-green-100 text-green-800',
            rejected: 'bg-red-100 text-red-800',
            abandoned: 'bg-gray-200 text-gray-500 line-through',
        };
        const labels: Record<string, string> = {
            draft: 'Borrador',
            submitted: 'Enviada',
            in_review: 'En Revisión',
            approved: 'Aprobada',
            rejected: 'Rechazada',
            abandoned: 'Abandonada',
        };

        return (
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${styles[status] || 'bg-gray-100'}`}>
                {labels[status] || status}
            </span>
        );
    };

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="bg-white rounded-2xl shadow-sm p-6 mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <Link href="/" className="text-gray-500 hover:text-gray-700 text-sm mb-2 inline-block">← Volver al inicio</Link>
                        <h1 className="text-2xl font-bold text-gray-900">Solicitud #{numeroSolicitud}</h1>
                        <p className="text-sm text-gray-500">
                            Creada el {new Date(solicitud.metadatos.creadoEn).toLocaleDateString()}
                        </p>
                    </div>
                    <StatusBadge status={estado} />
                </div>

                {/* Content */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Main Info */}
                    <div className="md:col-span-2 space-y-6">
                        {/* Datos Personales Card */}
                        <div className="bg-white rounded-xl shadow-sm p-6">
                            <h2 className="text-lg font-semibold mb-4 border-b pb-2">Datos Personales</h2>
                            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <dt className="text-sm font-medium text-gray-500">Nombre Completo</dt>
                                    <dd className="text-base text-gray-900">{datosPersonales.nombres} {datosPersonales.apellidos}</dd>
                                </div>
                                <div>
                                    <dt className="text-sm font-medium text-gray-500">Documento</dt>
                                    <dd className="text-base text-gray-900">{datosPersonales.tipoDocumento} - {datosPersonales.numeroDocumento}</dd>
                                </div>
                                <div>
                                    <dt className="text-sm font-medium text-gray-500">Email</dt>
                                    <dd className="text-base text-gray-900">{datosPersonales.email}</dd>
                                </div>
                                <div>
                                    <dt className="text-sm font-medium text-gray-500">Celular</dt>
                                    <dd className="text-base text-gray-900">{datosPersonales.celular}</dd>
                                </div>
                            </dl>
                        </div>

                        {/* Producto Card (si existe) */}
                        {productoSolicitado?.tipoTarjeta && (
                            <div className="bg-white rounded-xl shadow-sm p-6">
                                <h2 className="text-lg font-semibold mb-4 border-b pb-2">Producto Solicitado</h2>
                                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500">Tarjeta</dt>
                                        <dd className="text-base text-gray-900 font-medium">{productoSolicitado.tipoTarjeta}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500">Franquicia</dt>
                                        <dd className="text-base text-gray-900">{productoSolicitado.franquicia}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500">Cupo Solicitado</dt>
                                        <dd className="text-base text-gray-900">${productoSolicitado.cupoSolicitado?.toLocaleString() || '0'}</dd>
                                    </div>
                                </dl>
                            </div>
                        )}
                    </div>

                    {/* Actions Sidebar */}
                    <div className="space-y-6">
                        <div className="bg-white rounded-xl shadow-sm p-6">
                            <h2 className="text-lg font-semibold mb-4">Acciones</h2>
                            <div className="space-y-3">
                                {estado === EstadoSolicitud.DRAFT && (
                                    <Button fullWidth onClick={handleContinuar}>
                                        Continuar Editando
                                    </Button>
                                )}

                                {estado !== EstadoSolicitud.APPROVED &&
                                    estado !== EstadoSolicitud.REJECTED &&
                                    estado !== EstadoSolicitud.ABANDONED && (
                                        <Button
                                            fullWidth
                                            variant="outline"
                                            onClick={handleAbandonar}
                                            className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 hover:border-red-300"
                                        >
                                            Abandonar Solicitud
                                        </Button>
                                    )}

                                {estado !== EstadoSolicitud.DRAFT &&
                                    estado !== EstadoSolicitud.SUBMITTED &&
                                    estado !== EstadoSolicitud.IN_REVIEW && (
                                        <div className="text-sm text-gray-500 text-center py-4 bg-gray-50 rounded-lg">
                                            Esta solicitud ha finalizado.
                                        </div>
                                    )}
                            </div>
                        </div>

                        {/* Support Card */}
                        <div className="bg-blue-50 rounded-xl p-6">
                            <h3 className="font-semibold text-blue-900 mb-2">¿Necesitas ayuda?</h3>
                            <p className="text-sm text-blue-700 mb-4">
                                Si tienes dudas sobre tu solicitud, contáctanos.
                            </p>
                            <a href="#" className="text-sm font-medium text-blue-600 hover:text-blue-800">
                                Contactar soporte →
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
