import { Test, TestingModule } from '@nestjs/testing';
import { CoreBankingService } from '../services/core-banking.service';
import { MulesoftClientService } from '../services/mulesoft-client.service';
import { ISolicitudGateway, SOLICITUD_GATEWAY } from '../../solicitudes/application/gateways/solicitud.gateway';
import { SolicitudEntity } from '../../solicitudes/domain/entities/solicitud.entity';
import { EstadoSolicitud, NivelRiesgo } from '../../solicitudes/domain/enums/estado-solicitud.enum';
import { TipoDocumento, Genero, SituacionLaboral, TipoTarjeta, Franquicia, Canal } from '../../solicitudes/domain/enums/common.enum';
import { InternalServerErrorException } from '@nestjs/common';

describe('CoreBankingService', () => {
    let service: CoreBankingService;
    let mulesoftClient: jest.Mocked<MulesoftClientService>;
    let solicitudGateway: jest.Mocked<ISolicitudGateway>;

    // Mock entity factory
    const createMockEntity = (overrides: Partial<any> = {}): SolicitudEntity => {
        const defaultProps = {
            id: 'solicitud-123',
            numeroSolicitud: 'SOL-001',
            estado: EstadoSolicitud.DRAFT,
            datosPersonales: {
                nombres: 'Test',
                apellidos: 'User',
                tipoDocumento: TipoDocumento.CC,
                numeroDocumento: '1234567890',
                fechaNacimiento: new Date('1990-01-01'),
                genero: Genero.M,
                email: 'test@test.com',
                celular: '+573001234567',
                direccionResidencia: {
                    calle: 'Calle 123',
                    ciudad: 'Bogotá',
                    departamento: 'Cundinamarca',
                },
            },
            datosLaborales: {
                situacionLaboral: SituacionLaboral.EMPLEADO,
                ingresoMensual: 5000000,
                nombreEmpresa: 'Test Company',
                antiguedadMeses: 24,
            },
            productoSolicitado: {
                tipoTarjeta: TipoTarjeta.ORO,
                cupoSolicitado: 10000000,
                franquicia: Franquicia.VISA,
                segurosAdicionales: false,
            },
            auditoria: {
                aceptaTerminos: true,
                aceptaTratamientoDatos: true,
                autorizaConsultaCentrales: true,
            },
            validaciones: {
                identidadValidada: false,
                centralesRiesgoConsultadas: false,
            },
            integracionCore: {
                enviado: false,
                intentosEnvio: 0,
            },
            historialEstados: [
                { estado: EstadoSolicitud.DRAFT, fecha: new Date(), observaciones: 'Created' },
            ],
            metadatos: {
                creadoEn: new Date(),
                actualizadoEn: new Date(),
                canal: Canal.WEB,
            },
            ...overrides,
        };
        return new SolicitudEntity(defaultProps);
    };

    beforeEach(async () => {
        const mockMulesoftClient = {
            validarCliente: jest.fn(),
            consultarCentrales: jest.fn(),
            crearSolicitud: jest.fn(),
            consultarEstado: jest.fn(),

        };

        const mockSolicitudGateway = {
            save: jest.fn(),
            findById: jest.fn(),
            findByNumeroSolicitud: jest.fn(),
            findAll: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
            generateNumeroSolicitud: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                CoreBankingService,
                { provide: MulesoftClientService, useValue: mockMulesoftClient },
                { provide: SOLICITUD_GATEWAY, useValue: mockSolicitudGateway },
            ],
        }).compile();

        service = module.get<CoreBankingService>(CoreBankingService);
        mulesoftClient = module.get(MulesoftClientService);
        solicitudGateway = module.get(SOLICITUD_GATEWAY);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('validarCliente', () => {
        it('should validate client successfully (exists)', async () => {
            const mockEntity = createMockEntity();
            solicitudGateway.findById.mockResolvedValue(mockEntity);
            solicitudGateway.update.mockResolvedValue(mockEntity);
            mulesoftClient.validarCliente.mockResolvedValue({
                existe: true,
                esClienteActual: true,
                idClienteCore: 'CORE-123',
            });

            const result = await service.validarCliente('solicitud-123');

            expect(result.existe).toBe(true);
            expect(solicitudGateway.update).toHaveBeenCalled();
        });

        it('should validate client successfully (does not exist)', async () => {
            const mockEntity = createMockEntity();
            solicitudGateway.findById.mockResolvedValue(mockEntity);
            solicitudGateway.update.mockResolvedValue(mockEntity);
            mulesoftClient.validarCliente.mockResolvedValue({
                existe: false,
                esClienteActual: false,
            });

            const result = await service.validarCliente('solicitud-123');

            expect(result.existe).toBe(false);
            expect(solicitudGateway.update).toHaveBeenCalled();
        });

        it('should handle errors gracefully', async () => {
            const mockEntity = createMockEntity();
            solicitudGateway.findById.mockResolvedValue(mockEntity);
            solicitudGateway.update.mockResolvedValue(mockEntity);
            mulesoftClient.validarCliente.mockRejectedValue(new Error('Mulesoft error'));

            await expect(service.validarCliente('solicitud-123')).rejects.toThrow(
                InternalServerErrorException,
            );
            expect(solicitudGateway.update).toHaveBeenCalled();
        });
    });

    describe('consultarCentralesRiesgo', () => {
        it('should approve high score application', async () => {
            const mockEntity = createMockEntity();
            solicitudGateway.findById.mockResolvedValue(mockEntity);
            solicitudGateway.update.mockResolvedValue(mockEntity);
            mulesoftClient.consultarCentrales.mockResolvedValue({
                scoreCredito: 800,
                deudaActual: 1000000,
                nivelRiesgo: NivelRiesgo.BAJO,
                cupoDisponible: 10000000,
                numeroObligacionesActivas: 1,
                morasUltimos12Meses: 0,
                consultaExitosa: true,
            } as any);

            const result = await service.consultarCentralesRiesgo('solicitud-123');

            expect(result.decision.accion).toBe('APROBAR');
            expect(solicitudGateway.update).toHaveBeenCalled();
        });

        it('should reject low score application', async () => {
            const mockEntity = createMockEntity();
            solicitudGateway.findById.mockResolvedValue(mockEntity);
            solicitudGateway.update.mockResolvedValue(mockEntity);
            mulesoftClient.consultarCentrales.mockResolvedValue({
                scoreCredito: 400,
                deudaActual: 0,
                nivelRiesgo: NivelRiesgo.ALTO,
                cupoDisponible: 0,
                numeroObligacionesActivas: 0,
                morasUltimos12Meses: 0,
                consultaExitosa: true,
            } as any);

            const result = await service.consultarCentralesRiesgo('solicitud-123');

            expect(result.decision.accion).toBe('RECHAZAR');
            expect(solicitudGateway.update).toHaveBeenCalled();
        });

        it('should require manual review for borderline cases', async () => {
            const mockEntity = createMockEntity();
            solicitudGateway.findById.mockResolvedValue(mockEntity);
            solicitudGateway.update.mockResolvedValue(mockEntity);
            mulesoftClient.consultarCentrales.mockResolvedValue({
                scoreCredito: 650,
                deudaActual: 2000000,
                nivelRiesgo: NivelRiesgo.MEDIO,
                cupoDisponible: 5000000,
                numeroObligacionesActivas: 2,
                morasUltimos12Meses: 0,
                consultaExitosa: true,
            } as any);

            const result = await service.consultarCentralesRiesgo('solicitud-123');

            expect(result.decision.accion).toBe('REVISION_MANUAL');
            expect(solicitudGateway.update).toHaveBeenCalled();
        });

        it('should handle errors in credit check', async () => {
            const mockEntity = createMockEntity();
            solicitudGateway.findById.mockResolvedValue(mockEntity);
            solicitudGateway.update.mockResolvedValue(mockEntity);
            mulesoftClient.consultarCentrales.mockRejectedValue(new Error('API Error'));

            await expect(service.consultarCentralesRiesgo('solicitud-123')).rejects.toThrow(
                InternalServerErrorException,
            );
        });
    });

    describe('sincronizarConCore', () => {
        it('should sync successfully', async () => {
            const mockEntity = createMockEntity({ estado: EstadoSolicitud.SUBMITTED });
            solicitudGateway.findById.mockResolvedValue(mockEntity);
            solicitudGateway.update.mockResolvedValue(mockEntity);
            mulesoftClient.crearSolicitud.mockResolvedValue({
                exito: true,
                idSolicitudCore: 'CORE-NEW-123',
                estadoCore: 'RECEIVED',
                mensaje: 'Success',
            });

            const result = await service.sincronizarConCore('solicitud-123');

            expect(result.idSolicitudCore).toBe('CORE-NEW-123');
            expect(solicitudGateway.update).toHaveBeenCalled();
        });

        it('should fail if solicitud is DRAFT', async () => {
            const mockEntity = createMockEntity();
            solicitudGateway.findById.mockResolvedValue(mockEntity);

            await expect(service.sincronizarConCore('solicitud-123')).rejects.toThrow(
                'No se puede sincronizar una solicitud en estado draft',
            );
        });

        it('should handle sync errors', async () => {
            const mockEntity = createMockEntity({ estado: EstadoSolicitud.SUBMITTED });
            solicitudGateway.findById.mockResolvedValue(mockEntity);
            solicitudGateway.update.mockResolvedValue(mockEntity);
            mulesoftClient.crearSolicitud.mockRejectedValue(new Error('Sync failed'));

            await expect(service.sincronizarConCore('solicitud-123')).rejects.toThrow(
                InternalServerErrorException,
            );
        });
    });

    describe('consultarEstadoCore', () => {
        it('should update status to APPROVED', async () => {
            const mockEntity = createMockEntity({
                estado: EstadoSolicitud.SUBMITTED,
                integracionCore: { enviado: true, intentosEnvio: 1, idSolicitudCore: 'CORE-123' },
            });
            solicitudGateway.findById.mockResolvedValue(mockEntity);
            solicitudGateway.update.mockResolvedValue(mockEntity);
            mulesoftClient.consultarEstado.mockResolvedValue({
                idSolicitudCore: 'CORE-123',
                estadoCore: 'APROBADA',
                cupoAprobado: 5000000,
                fechaActualizacion: new Date().toISOString(),
            } as any);

            const result = await service.consultarEstadoCore('solicitud-123');

            expect(result.estadoCore).toBe('APROBADA');
            expect(solicitudGateway.update).toHaveBeenCalled();
        });

        it('should update status to REJECTED', async () => {
            const mockEntity = createMockEntity({
                estado: EstadoSolicitud.SUBMITTED,
                integracionCore: { enviado: true, intentosEnvio: 1, idSolicitudCore: 'CORE-123' },
            });
            solicitudGateway.findById.mockResolvedValue(mockEntity);
            solicitudGateway.update.mockResolvedValue(mockEntity);
            mulesoftClient.consultarEstado.mockResolvedValue({
                idSolicitudCore: 'CORE-123',
                estadoCore: 'RECHAZADA',
                observaciones: 'Riesgo alto',
                fechaActualizacion: new Date().toISOString(),
            } as any);

            const result = await service.consultarEstadoCore('solicitud-123');

            expect(result.estadoCore).toBe('RECHAZADA');
            expect(solicitudGateway.update).toHaveBeenCalled();
        });
    });
});
