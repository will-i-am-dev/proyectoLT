/**
 * SubmitSolicitudUseCase Unit Tests - Application Layer
 * 
 * Tests the submission workflow for a draft solicitud with Core Banking integration.
 */

import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { SubmitSolicitudUseCase } from '../../application/use-cases/submit-solicitud.use-case';
import { ISolicitudGateway, SOLICITUD_GATEWAY } from '../../application/gateways/solicitud.gateway';
import { SolicitudEntity, SolicitudProps } from '../../domain/entities/solicitud.entity';
import { EstadoSolicitud, NivelRiesgo } from '../../domain/enums/estado-solicitud.enum';
import { TipoDocumento, Genero, SituacionLaboral, TipoTarjeta, Franquicia, Canal } from '../../domain/enums/common.enum';
import { CoreBankingService } from '@modules/integracion-core/services/core-banking.service';

describe('SubmitSolicitudUseCase', () => {
    let useCase: SubmitSolicitudUseCase;
    let mockGateway: jest.Mocked<ISolicitudGateway>;
    let mockCoreBankingService: jest.Mocked<CoreBankingService>;

    const createEntityProps = (overrides: Partial<SolicitudProps> = {}): SolicitudProps => ({
        id: 'test-id',
        numeroSolicitud: 'SOL-2026-0001',
        estado: EstadoSolicitud.DRAFT,
        datosPersonales: {
            nombres: 'Juan',
            apellidos: 'Pérez',
            tipoDocumento: TipoDocumento.CC,
            numeroDocumento: '1234567890',
            fechaNacimiento: new Date('1990-01-15'),
            genero: Genero.M,
            email: 'juan@example.com',
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
            nombreEmpresa: 'Test Corp',
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
    });

    beforeEach(async () => {
        mockGateway = {
            save: jest.fn(),
            findById: jest.fn(),
            findByNumeroSolicitud: jest.fn(),
            findAll: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
            generateNumeroSolicitud: jest.fn(),
        };

        mockCoreBankingService = {
            validarCliente: jest.fn(),
            consultarCentralesRiesgo: jest.fn(),
            sincronizarConCore: jest.fn(),
            consultarEstadoCore: jest.fn(),
        } as any;

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                SubmitSolicitudUseCase,
                { provide: SOLICITUD_GATEWAY, useValue: mockGateway },
                { provide: CoreBankingService, useValue: mockCoreBankingService },
            ],
        }).compile();

        useCase = module.get<SubmitSolicitudUseCase>(SubmitSolicitudUseCase);
    });

    it('should be defined', () => {
        expect(useCase).toBeDefined();
    });

    describe('execute - Happy Path', () => {
        it('should submit DRAFT solicitud successfully with Core Banking integration', async () => {
            const entity = new SolicitudEntity(createEntityProps());
            const updatedEntity = new SolicitudEntity(createEntityProps({
                estado: EstadoSolicitud.APPROVED,
                validaciones: {
                    identidadValidada: true,
                    centralesRiesgoConsultadas: true,
                    scoreCredito: 750,
                    nivelRiesgo: NivelRiesgo.BAJO,
                },
                integracionCore: {
                    enviado: true,
                    intentosEnvio: 1,
                    idSolicitudCore: 'SOL-CORE-123',
                    estadoCore: 'PENDIENTE_VALIDACION',
                    fechaEnvio: new Date(),
                },
            }));

            mockGateway.findById.mockResolvedValueOnce(entity)
                .mockResolvedValueOnce(updatedEntity);
            mockGateway.update.mockImplementation(async (e: SolicitudEntity) => e);

            // Mock Core Banking Service responses
            mockCoreBankingService.validarCliente.mockResolvedValue({
                existe: true,
                esClienteActual: true,
                idClienteCore: 'CLI-1234567890',
            });

            mockCoreBankingService.consultarCentralesRiesgo.mockResolvedValue({
                scoreCredito: 750,
                nivelRiesgo: 'BAJO',
                deudaActual: 1000000,
                cupoDisponible: 8000000,
                porcentajeEndeudamiento: 20,
                numeroObligacionesActivas: 1,
                morasUltimos12Meses: 0,
                consultaExitosa: true,
                decision: {
                    accion: 'APROBAR',
                    razon: 'Score excelente con bajo endeudamiento',
                },
            });

            mockCoreBankingService.sincronizarConCore.mockResolvedValue({
                exito: true,
                idSolicitudCore: 'SOL-CORE-123',
                estadoCore: 'PENDIENTE_VALIDACION',
                mensaje: 'Solicitud creada exitosamente',
                fechaCreacion: new Date().toISOString(),
            });

            const result = await useCase.execute('test-id');

            expect(result.estado).toBe(EstadoSolicitud.APPROVED);
            expect(result.integracionCore).toBeDefined();
            expect(result.integracionCore?.validado).toBe(true);
            expect(result.integracionCore?.scoreCredito).toBe(750);
            expect(result.integracionCore?.idSolicitudCore).toBe('SOL-CORE-123');
            expect(mockGateway.update).toHaveBeenCalled();
            expect(mockCoreBankingService.validarCliente).toHaveBeenCalledWith('test-id');
            expect(mockCoreBankingService.consultarCentralesRiesgo).toHaveBeenCalledWith('test-id');
            expect(mockCoreBankingService.sincronizarConCore).toHaveBeenCalledWith('test-id');
        });
    });

    describe('execute - Validation Errors', () => {
        it('should throw NotFoundException for non-existent solicitud', async () => {
            mockGateway.findById.mockResolvedValue(null);

            await expect(useCase.execute('non-existent')).rejects.toThrow(NotFoundException);
            expect(mockCoreBankingService.validarCliente).not.toHaveBeenCalled();
        });

        it('should throw BadRequestException for non-DRAFT solicitud', async () => {
            const entity = new SolicitudEntity(createEntityProps({ estado: EstadoSolicitud.SUBMITTED }));
            mockGateway.findById.mockResolvedValue(entity);

            await expect(useCase.execute('test-id')).rejects.toThrow(BadRequestException);
            expect(mockGateway.update).not.toHaveBeenCalled();
            expect(mockCoreBankingService.validarCliente).not.toHaveBeenCalled();
        });

        it('should throw BadRequestException if terms not accepted', async () => {
            const entity = new SolicitudEntity(createEntityProps({
                auditoria: {
                    aceptaTerminos: false,
                    aceptaTratamientoDatos: true,
                    autorizaConsultaCentrales: true,
                },
            }));
            mockGateway.findById.mockResolvedValue(entity);

            await expect(useCase.execute('test-id')).rejects.toThrow(BadRequestException);
            expect(mockCoreBankingService.validarCliente).not.toHaveBeenCalled();
        });

        it('should throw BadRequestException if data treatment not accepted', async () => {
            const entity = new SolicitudEntity(createEntityProps({
                auditoria: {
                    aceptaTerminos: true,
                    aceptaTratamientoDatos: false,
                    autorizaConsultaCentrales: true,
                },
            }));
            mockGateway.findById.mockResolvedValue(entity);

            await expect(useCase.execute('test-id')).rejects.toThrow(BadRequestException);
            expect(mockCoreBankingService.validarCliente).not.toHaveBeenCalled();
        });
    });

    describe('execute - Core Banking Integration Errors', () => {
        it('should revert to DRAFT and throw error if validarCliente fails after retries', async () => {
            const entity = new SolicitudEntity(createEntityProps());
            mockGateway.findById.mockResolvedValue(entity);
            mockGateway.update.mockImplementation(async (e: SolicitudEntity) => e);

            // Simulate validarCliente failing all retries
            mockCoreBankingService.validarCliente.mockRejectedValue(
                new Error('Error al validar cliente en Core Bancario')
            );

            await expect(useCase.execute('test-id')).rejects.toThrow(BadRequestException);
            await expect(useCase.execute('test-id')).rejects.toThrow(/validación con el Core Bancario/);

            // Should have tried to revert to DRAFT
            expect(mockGateway.update).toHaveBeenCalled();
            expect(mockCoreBankingService.validarCliente).toHaveBeenCalled();
        }, 10000);

        it('should revert to DRAFT if consultarCentrales fails after retries', async () => {
            const entity = new SolicitudEntity(createEntityProps());
            mockGateway.findById.mockResolvedValue(entity);
            mockGateway.update.mockImplementation(async (e: SolicitudEntity) => e);

            mockCoreBankingService.validarCliente.mockResolvedValue({
                existe: true,
                esClienteActual: true,
                idClienteCore: 'CLI-123',
            });

            mockCoreBankingService.consultarCentralesRiesgo.mockRejectedValue(
                new Error('Error al consultar centrales de riesgo')
            );

            await expect(useCase.execute('test-id')).rejects.toThrow(BadRequestException);
            expect(mockCoreBankingService.consultarCentralesRiesgo).toHaveBeenCalled();
        }, 10000);

        it('should revert to DRAFT if sincronizarConCore fails after retries', async () => {
            const entity = new SolicitudEntity(createEntityProps());
            mockGateway.findById.mockResolvedValue(entity);
            mockGateway.update.mockImplementation(async (e: SolicitudEntity) => e);

            mockCoreBankingService.validarCliente.mockResolvedValue({
                existe: true,
                esClienteActual: true,
                idClienteCore: 'CLI-123',
            });

            mockCoreBankingService.consultarCentralesRiesgo.mockResolvedValue({
                scoreCredito: 600,
                nivelRiesgo: 'MEDIO',
                deudaActual: 2000000,
                decision: { accion: 'REVISION_MANUAL', razon: 'Requiere análisis' },
            } as any);

            mockCoreBankingService.sincronizarConCore.mockRejectedValue(
                new Error('Error al sincronizar con Core Bancario')
            );

            await expect(useCase.execute('test-id')).rejects.toThrow(BadRequestException);
            expect(mockCoreBankingService.sincronizarConCore).toHaveBeenCalled();
        }, 10000);
    });

    describe('execute - Retry Logic', () => {
        it('should retry validarCliente up to 3 times before failing', async () => {
            const entity = new SolicitudEntity(createEntityProps());
            mockGateway.findById.mockResolvedValue(entity);
            mockGateway.update.mockImplementation(async (e: SolicitudEntity) => e);

            mockCoreBankingService.validarCliente.mockRejectedValue(
                new Error('Network timeout')
            );

            await expect(useCase.execute('test-id')).rejects.toThrow(BadRequestException);

            // Should have called validarCliente 3 times (retries)
            expect(mockCoreBankingService.validarCliente).toHaveBeenCalledTimes(3);
        }, 10000);

        it('should succeed on second retry attempt', async () => {
            const entity = new SolicitudEntity(createEntityProps());
            const updatedEntity = new SolicitudEntity(createEntityProps({
                estado: EstadoSolicitud.IN_REVIEW,
                validaciones: {
                    identidadValidada: true,
                    centralesRiesgoConsultadas: true,
                    scoreCredito: 650,
                    nivelRiesgo: NivelRiesgo.MEDIO,
                },
            }));

            mockGateway.findById.mockResolvedValueOnce(entity)
                .mockResolvedValueOnce(updatedEntity);
            mockGateway.update.mockImplementation(async (e: SolicitudEntity) => e);

            // Fail first time, succeed second time
            mockCoreBankingService.validarCliente
                .mockRejectedValueOnce(new Error('Network error'))
                .mockResolvedValueOnce({ existe: true, esClienteActual: true, idClienteCore: 'CLI-123' });

            mockCoreBankingService.consultarCentralesRiesgo.mockResolvedValue({
                scoreCredito: 650,
                nivelRiesgo: 'MEDIO',
                deudaActual: 3000000,
                decision: { accion: 'REVISION_MANUAL', razon: 'Score medio' },
            } as any);

            mockCoreBankingService.sincronizarConCore.mockResolvedValue({
                exito: true,
                idSolicitudCore: 'SOL-CORE-456',
                estadoCore: 'EN_REVISION',
            } as any);

            const result = await useCase.execute('test-id');

            expect(result).toBeDefined();
            expect(mockCoreBankingService.validarCliente).toHaveBeenCalledTimes(2);
        }, 2000);
    });

    describe('execute - Output Structure', () => {
        it('should return correct output structure with integracionCore data', async () => {
            const entity = new SolicitudEntity(createEntityProps());
            const updatedEntity = new SolicitudEntity(createEntityProps({
                estado: EstadoSolicitud.APPROVED,
                validaciones: {
                    identidadValidada: true,
                    centralesRiesgoConsultadas: true,
                    scoreCredito: 800,
                },
                integracionCore: {
                    enviado: true,
                    intentosEnvio: 1,
                    idSolicitudCore: 'SOL-CORE-789',
                },
            }));

            mockGateway.findById.mockResolvedValueOnce(entity)
                .mockResolvedValueOnce(updatedEntity);
            mockGateway.update.mockImplementation(async (e: SolicitudEntity) => e);

            mockCoreBankingService.validarCliente.mockResolvedValue({
                existe: true,
                esClienteActual: true,
                idClienteCore: 'CLI-123',
            });

            mockCoreBankingService.consultarCentralesRiesgo.mockResolvedValue({
                scoreCredito: 800,
                nivelRiesgo: 'BAJO',
                decision: { accion: 'APROBAR', razon: 'Excelente perfil' },
            } as any);

            mockCoreBankingService.sincronizarConCore.mockResolvedValue({
                exito: true,
                idSolicitudCore: 'SOL-CORE-789',
            } as any);

            const result = await useCase.execute('test-id');

            expect(result).toHaveProperty('id');
            expect(result).toHaveProperty('numeroSolicitud');
            expect(result).toHaveProperty('estado');
            expect(result).toHaveProperty('integracionCore');
            expect(result.integracionCore).toHaveProperty('validado');
            expect(result.integracionCore).toHaveProperty('scoreCredito');
            expect(result.integracionCore).toHaveProperty('idSolicitudCore');
        });
    });
});
