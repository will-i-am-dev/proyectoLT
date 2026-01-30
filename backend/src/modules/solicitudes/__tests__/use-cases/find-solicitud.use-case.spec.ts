/**
 * FindSolicitudUseCase Unit Tests - Application Layer
 * 
 * Tests the retrieval of a solicitud by ID.
 */

import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { FindSolicitudUseCase } from '../../application/use-cases/find-solicitud.use-case';
import { ISolicitudGateway, SOLICITUD_GATEWAY } from '../../application/gateways/solicitud.gateway';
import { SolicitudEntity, SolicitudProps } from '../../domain/entities/solicitud.entity';
import { EstadoSolicitud } from '../../domain/enums/estado-solicitud.enum';
import { TipoDocumento, Genero, SituacionLaboral, TipoTarjeta, Franquicia, Canal } from '../../domain/enums/common.enum';

describe('FindSolicitudUseCase', () => {
    let useCase: FindSolicitudUseCase;
    let mockGateway: jest.Mocked<ISolicitudGateway>;

    const createEntityProps = (): SolicitudProps => ({
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
                FindSolicitudUseCase,
                { provide: SOLICITUD_GATEWAY, useValue: mockGateway },
            ],
        }).compile();

        useCase = module.get<FindSolicitudUseCase>(FindSolicitudUseCase);
    });

    it('should be defined', () => {
        expect(useCase).toBeDefined();
    });

    describe('execute', () => {
        it('should return entity when found', async () => {
            const entity = new SolicitudEntity(createEntityProps());
            mockGateway.findById.mockResolvedValue(entity);

            const result = await useCase.execute('test-id');

            expect(result).toBeInstanceOf(SolicitudEntity);
            expect(result.id).toBe('test-id');
            expect(result.numeroSolicitud).toBe('SOL-2026-0001');
        });

        it('should throw NotFoundException when not found', async () => {
            mockGateway.findById.mockResolvedValue(null);

            await expect(useCase.execute('non-existent')).rejects.toThrow(NotFoundException);
        });

        it('should call gateway with correct ID', async () => {
            const entity = new SolicitudEntity(createEntityProps());
            mockGateway.findById.mockResolvedValue(entity);

            await useCase.execute('test-id');

            expect(mockGateway.findById).toHaveBeenCalledWith('test-id');
        });

        it('should error message include the ID', async () => {
            mockGateway.findById.mockResolvedValue(null);

            await expect(useCase.execute('specific-id')).rejects.toThrow(/specific-id/);
        });
    });
});
