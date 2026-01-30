/**
 * Tests para el servicio de solicitudes
 */

import { solicitudService } from '../solicitud.service';
import { api } from '../api';
import { TipoDocumento, Genero } from '@/types/solicitud';

// Mock del módulo api
jest.mock('../api', () => ({
    api: {
        get: jest.fn(),
        post: jest.fn(),
        patch: jest.fn(),
        delete: jest.fn(),
    },
}));

const mockApi = api as jest.Mocked<typeof api>;

describe('SolicitudService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    const mockSolicitud = {
        id: 'sol123',
        numeroSolicitud: 'SOL-20260129-00001',
        estado: 'draft',
        datosPersonales: {
            nombres: 'Juan',
            apellidos: 'Pérez',
            tipoDocumento: TipoDocumento.CC,
            numeroDocumento: '12345678',
            fechaNacimiento: '1990-01-15',
            genero: Genero.M,
            email: 'juan@email.com',
            celular: '3001234567',
            direccionResidencia: {
                calle: 'Calle 123',
                ciudad: 'Bogotá',
                departamento: 'Cundinamarca',
                codigoPostal: '110111',
            },
        },
        datosLaborales: {},
        productoSolicitado: {},
        auditoria: {},
        metadatos: {
            creadoEn: '2026-01-29T10:00:00Z',
            actualizadoEn: '2026-01-29T10:00:00Z',
        },
    };

    // ============ Create ============

    describe('create', () => {
        it('crea una nueva solicitud', async () => {
            const createData = {
                datosPersonales: mockSolicitud.datosPersonales,
                datosLaborales: {},
                productoSolicitado: {},
                auditoria: {},
            };

            mockApi.post.mockResolvedValueOnce({ data: mockSolicitud });

            const result = await solicitudService.create(createData);

            expect(mockApi.post).toHaveBeenCalledWith('/solicitudes', createData);
            expect(result).toEqual(mockSolicitud);
        });

        it('propaga errores del API', async () => {
            mockApi.post.mockRejectedValueOnce(new Error('Error de servidor'));

            await expect(solicitudService.create({} as any)).rejects.toThrow('Error de servidor');
        });
    });

    // ============ GetById ============

    describe('getById', () => {
        it('obtiene una solicitud por ID', async () => {
            mockApi.get.mockResolvedValueOnce({ data: mockSolicitud });

            const result = await solicitudService.getById('sol123');

            expect(mockApi.get).toHaveBeenCalledWith('/solicitudes/sol123');
            expect(result).toEqual(mockSolicitud);
        });

        it('propaga errores cuando no existe', async () => {
            mockApi.get.mockRejectedValueOnce(new Error('Solicitud no encontrada'));

            await expect(solicitudService.getById('invalid')).rejects.toThrow('Solicitud no encontrada');
        });
    });

    // ============ Update ============

    describe('update', () => {
        it('actualiza una solicitud existente', async () => {
            const updateData = {
                datosLaborales: {
                    ingresoMensual: 5000000,
                },
            };

            mockApi.patch.mockResolvedValueOnce({
                data: { ...mockSolicitud, datosLaborales: updateData.datosLaborales },
            });

            const result = await solicitudService.update('sol123', updateData);

            expect(mockApi.patch).toHaveBeenCalledWith('/solicitudes/sol123', updateData);
            expect(result.datosLaborales).toEqual(updateData.datosLaborales);
        });

        it('propaga errores de validación', async () => {
            mockApi.patch.mockRejectedValueOnce(new Error('Solo se puede actualizar en estado draft'));

            await expect(solicitudService.update('sol123', {})).rejects.toThrow('Solo se puede actualizar en estado draft');
        });
    });

    // ============ Submit ============

    describe('submit', () => {
        it('envía solicitud para revisión', async () => {
            const submittedSolicitud = { ...mockSolicitud, estado: 'submitted' };
            mockApi.post.mockResolvedValueOnce({ data: submittedSolicitud });

            const result = await solicitudService.submit('sol123');

            expect(mockApi.post).toHaveBeenCalledWith('/solicitudes/sol123/submit', {});
            expect(result.estado).toBe('submitted');
        });

        it('propaga errores cuando no está completa', async () => {
            mockApi.post.mockRejectedValueOnce(new Error('Datos incompletos'));

            await expect(solicitudService.submit('sol123')).rejects.toThrow('Datos incompletos');
        });
    });

    // ============ Abandon ============

    describe('abandon', () => {
        it('abandona una solicitud', async () => {
            const abandonedSolicitud = { ...mockSolicitud, estado: 'abandoned' };
            mockApi.post.mockResolvedValueOnce({ data: abandonedSolicitud });

            const result = await solicitudService.abandon('sol123');

            expect(mockApi.post).toHaveBeenCalledWith('/solicitudes/sol123/abandon', {});
            expect(result.estado).toBe('abandoned');
        });

        it('propaga errores del servidor', async () => {
            mockApi.post.mockRejectedValueOnce(new Error('Error del servidor'));

            await expect(solicitudService.abandon('sol123')).rejects.toThrow('Error del servidor');
        });
    });

    // ============ CheckStatus ============

    describe('checkStatus', () => {
        it('consulta estado por tipo y número de documento', async () => {
            mockApi.get.mockResolvedValueOnce({
                data: { data: [mockSolicitud] },
            });

            const result = await solicitudService.checkStatus('CC', '12345678');

            expect(mockApi.get).toHaveBeenCalledWith('/solicitudes?tipoDocumento=CC&numeroDocumento=12345678&limit=1');
            expect(result).toEqual([mockSolicitud]);
        });

        it('retorna array vacío cuando no hay resultados', async () => {
            mockApi.get.mockResolvedValueOnce({ data: null });

            const result = await solicitudService.checkStatus('CC', '99999999');

            expect(result).toEqual([]);
        });

        it('maneja respuesta sin data.data', async () => {
            mockApi.get.mockResolvedValueOnce({ data: {} });

            const result = await solicitudService.checkStatus('CC', '12345678');

            expect(result).toEqual([]);
        });
    });

    // ============ Edge Cases ============

    describe('Casos límite', () => {
        it('maneja IDs vacíos correctamente', async () => {
            mockApi.get.mockResolvedValueOnce({ data: null });

            const result = await solicitudService.getById('');

            expect(mockApi.get).toHaveBeenCalledWith('/solicitudes/');
            expect(result).toBeNull();
        });

        it('maneja caracteres especiales en documento', async () => {
            mockApi.get.mockResolvedValueOnce({ data: { data: [] } });

            await solicitudService.checkStatus('CE', 'ABC-123');

            expect(mockApi.get).toHaveBeenCalledWith('/solicitudes?tipoDocumento=CE&numeroDocumento=ABC-123&limit=1');
        });
    });
});
