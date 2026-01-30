/**
 * CreateSolicitudUseCase Unit Tests - Application Layer
 * 
 * Tests the orchestration logic for creating a new solicitud.
 * Uses mocked Gateway to isolate the use case logic.
 */

import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { CreateSolicitudUseCase, CreateSolicitudInput } from '../../application/use-cases/create-solicitud.use-case';
import { ISolicitudGateway, SOLICITUD_GATEWAY } from '../../application/gateways/solicitud.gateway';
import { SolicitudEntity } from '../../domain/entities/solicitud.entity';
import { EstadoSolicitud } from '../../domain/enums/estado-solicitud.enum';
import { TipoDocumento, Genero, SituacionLaboral, TipoTarjeta, Franquicia, Canal } from '../../domain/enums/common.enum';

describe('CreateSolicitudUseCase', () => {
    let useCase: CreateSolicitudUseCase;
    let mockGateway: jest.Mocked<ISolicitudGateway>;

    const createValidInput = (): CreateSolicitudInput => ({
        dto: {
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
                    codigoPostal: '110111',
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
        },
        metadata: {
            ipOrigen: '127.0.0.1',
            userAgent: 'Test Agent',
            canal: Canal.WEB,
        },
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

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                CreateSolicitudUseCase,
                { provide: SOLICITUD_GATEWAY, useValue: mockGateway },
            ],
        }).compile();

        useCase = module.get<CreateSolicitudUseCase>(CreateSolicitudUseCase);
    });

    it('should be defined', () => {
        expect(useCase).toBeDefined();
    });

    describe('execute', () => {
        it('should create solicitud successfully with valid input', async () => {
            const input = createValidInput();
            mockGateway.generateNumeroSolicitud.mockResolvedValue('SOL-2026-0001');
            mockGateway.save.mockImplementation(async (entity: SolicitudEntity) => {
                return new SolicitudEntity({
                    ...entity.toProps(),
                    id: 'generated-id',
                });
            });

            const result = await useCase.execute(input);

            expect(result.id).toBe('generated-id');
            expect(result.numeroSolicitud).toBe('SOL-2026-0001');
            expect(result.estado).toBe(EstadoSolicitud.DRAFT);
            expect(mockGateway.generateNumeroSolicitud).toHaveBeenCalled();
            expect(mockGateway.save).toHaveBeenCalled();
        });

        it('should throw BadRequestException for minor applicant', async () => {
            const input = createValidInput();
            input.dto.datosPersonales.fechaNacimiento = new Date(); // Today = minor

            await expect(useCase.execute(input)).rejects.toThrow(BadRequestException);
            expect(mockGateway.save).not.toHaveBeenCalled();
        });

        it('should throw BadRequestException for insufficient income', async () => {
            const input = createValidInput();
            input.dto.datosLaborales.ingresoMensual = 1000000; // Below 1.5M minimum

            await expect(useCase.execute(input)).rejects.toThrow(BadRequestException);
            expect(mockGateway.save).not.toHaveBeenCalled();
        });

        it('should throw BadRequestException for card type above income level', async () => {
            const input = createValidInput();
            input.dto.productoSolicitado.tipoTarjeta = TipoTarjeta.BLACK;
            input.dto.datosLaborales.ingresoMensual = 5000000; // Below 15M for BLACK

            await expect(useCase.execute(input)).rejects.toThrow(BadRequestException);
        });

        it('should throw BadRequestException for cupo exceeding income ratio', async () => {
            const input = createValidInput();
            input.dto.datosLaborales.ingresoMensual = 3000000;
            input.dto.productoSolicitado.cupoSolicitado = 12000000; // 4x income, max is 3x

            await expect(useCase.execute(input)).rejects.toThrow(BadRequestException);
        });

        it('should create solicitud in DRAFT state', async () => {
            const input = createValidInput();
            mockGateway.generateNumeroSolicitud.mockResolvedValue('SOL-2026-0002');
            mockGateway.save.mockImplementation(async (entity: SolicitudEntity) => entity);

            await useCase.execute(input);

            const savedEntity = mockGateway.save.mock.calls[0][0] as SolicitudEntity;
            expect(savedEntity.estado).toBe(EstadoSolicitud.DRAFT);
            expect(savedEntity.historialEstados).toHaveLength(1);
            expect(savedEntity.historialEstados[0].estado).toBe(EstadoSolicitud.DRAFT);
        });

        it('should initialize validaciones and integracionCore correctly', async () => {
            const input = createValidInput();
            mockGateway.generateNumeroSolicitud.mockResolvedValue('SOL-2026-0003');
            mockGateway.save.mockImplementation(async (entity: SolicitudEntity) => entity);

            await useCase.execute(input);

            const savedEntity = mockGateway.save.mock.calls[0][0] as SolicitudEntity;
            expect(savedEntity.validaciones.identidadValidada).toBe(false);
            expect(savedEntity.validaciones.centralesRiesgoConsultadas).toBe(false);
            expect(savedEntity.integracionCore.enviado).toBe(false);
            expect(savedEntity.integracionCore.intentosEnvio).toBe(0);
        });

        it('should set metadata correctly', async () => {
            const input = createValidInput();
            mockGateway.generateNumeroSolicitud.mockResolvedValue('SOL-2026-0004');
            mockGateway.save.mockImplementation(async (entity: SolicitudEntity) => entity);

            await useCase.execute(input);

            const savedEntity = mockGateway.save.mock.calls[0][0] as SolicitudEntity;
            expect(savedEntity.metadatos.ipOrigen).toBe('127.0.0.1');
            expect(savedEntity.metadatos.userAgent).toBe('Test Agent');
            expect(savedEntity.metadatos.canal).toBe(Canal.WEB);
        });
    });
});
