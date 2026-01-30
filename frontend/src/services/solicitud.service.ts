/**
 * Servicio para gestión de solicitudes de tarjeta de crédito
 */

import { api } from './api';
import type {
    CreateSolicitudDto,
    UpdateSolicitudDto,
    SolicitudResponse,
} from '@/types/solicitud';

export const solicitudService = {
    /**
     * Crear nueva solicitud (estado draft)
     */
    create: async (data: CreateSolicitudDto): Promise<SolicitudResponse> => {
        const response = await api.post<any>('/solicitudes', data);
        return response.data;
    },

    /**
     * Obtener solicitud por ID
     */
    getById: async (id: string): Promise<SolicitudResponse> => {
        const response = await api.get<any>(`/solicitudes/${id}`);
        return response.data;
    },

    /**
     * Actualizar solicitud (solo draft)
     */
    update: async (id: string, data: UpdateSolicitudDto): Promise<SolicitudResponse> => {
        const response = await api.patch<any>(`/solicitudes/${id}`, data);
        return response.data;
    },

    /**
     * Enviar solicitud para revisión
     */
    submit: async (id: string): Promise<SolicitudResponse> => {
        const response = await api.post<any>(`/solicitudes/${id}/submit`, {});
        return response.data;
    },

    /**
     * Abandonar solicitud
     */
    abandon: async (id: string): Promise<SolicitudResponse> => {
        const response = await api.post<any>(`/solicitudes/${id}/abandon`, {});
        return response.data;
    },

    /**
     * Consultar estado de solicitud por documento
     */
    checkStatus: async (tipoDocumento: string, numeroDocumento: string): Promise<SolicitudResponse[]> => {
        const response = await api.get<any>(`/solicitudes?tipoDocumento=${tipoDocumento}&numeroDocumento=${numeroDocumento}&limit=1`);
        // La respuesta paginada viene en data.data
        return response.data?.data || [];
    },
};
