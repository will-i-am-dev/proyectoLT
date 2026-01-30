/**
 * SolicitudMongoGateway Integration Tests - Infrastructure Layer
 * 
 * Tests the gateway implementation that interacts with MongoDB.
 * Uses mocked Mongoose model to isolate gateway logic.
 */

import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { SolicitudMongoGateway } from '../../infrastructure/persistence/gateways/solicitud-mongo.gateway';
import { SolicitudMapper } from '../../infrastructure/persistence/mappers/solicitud.mapper';
import { SolicitudEntity, SolicitudProps } from '../../domain/entities/solicitud.entity';
import { SolicitudTarjetaCredito } from '../../infrastructure/schemas/solicitud-tarjeta.schema';
import { EstadoSolicitud } from '../../domain/enums/estado-solicitud.enum';
import { TipoDocumento, Genero, SituacionLaboral, TipoTarjeta, Franquicia, Canal } from '../../domain/enums/common.enum';

describe('SolicitudMongoGateway', () => {
    let gateway: SolicitudMongoGateway;
    let mockModel: any;
    let mockMapper: jest.Mocked<SolicitudMapper>;

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

    const createMockDocument = () => ({
        _id: { toString: () => 'mongo-id' },
        numeroSolicitud: 'SOL-2026-0001',
        estado: EstadoSolicitud.DRAFT,
        save: jest.fn().mockResolvedValue({}),
        toObject: jest.fn().mockReturnThis(),
    });

    beforeEach(async () => {
        // Create a mock constructor function that returns a document with save()
        const MockModelClass: any = function (data: any) {
            return {
                ...data,
                _id: { toString: () => 'mongo-id' },
                save: jest.fn().mockResolvedValue({
                    ...data,
                    _id: { toString: () => 'mongo-id' },
                }),
            };
        };

        // Add static methods to the mock
        MockModelClass.findById = jest.fn();
        MockModelClass.findOne = jest.fn();
        MockModelClass.find = jest.fn();
        MockModelClass.findByIdAndUpdate = jest.fn();
        MockModelClass.findByIdAndDelete = jest.fn();
        MockModelClass.countDocuments = jest.fn();

        mockModel = MockModelClass;

        // Mock Mapper
        mockMapper = {
            toDomain: jest.fn(),
            toPersistence: jest.fn(),
        } as any;

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                SolicitudMongoGateway,
                { provide: getModelToken(SolicitudTarjetaCredito.name), useValue: mockModel },
                { provide: SolicitudMapper, useValue: mockMapper },
            ],
        }).compile();

        gateway = module.get<SolicitudMongoGateway>(SolicitudMongoGateway);
    });

    it('should be defined', () => {
        expect(gateway).toBeDefined();
    });

    describe('save', () => {
        it('should save entity and return mapped result', async () => {
            const entity = new SolicitudEntity(createEntityProps({ id: undefined }));
            const savedEntity = new SolicitudEntity(createEntityProps({ id: 'mongo-id' }));

            mockMapper.toPersistence.mockReturnValue({ numeroSolicitud: 'SOL-2026-0001' });
            mockMapper.toDomain.mockReturnValue(savedEntity);

            const result = await gateway.save(entity);

            expect(mockMapper.toPersistence).toHaveBeenCalledWith(entity);
            expect(mockMapper.toDomain).toHaveBeenCalled();
            expect(result.id).toBe('mongo-id');
        });
    });

    describe('findById', () => {
        it('should return entity when found', async () => {
            const mockDoc = createMockDocument();
            const entity = new SolicitudEntity(createEntityProps());

            mockModel.findById.mockReturnValue({
                exec: jest.fn().mockResolvedValue(mockDoc),
            });
            mockMapper.toDomain.mockReturnValue(entity);

            const result = await gateway.findById('test-id');

            expect(mockModel.findById).toHaveBeenCalledWith('test-id');
            expect(result).toEqual(entity);
        });

        it('should return null when not found', async () => {
            mockModel.findById.mockReturnValue({
                exec: jest.fn().mockResolvedValue(null),
            });

            const result = await gateway.findById('non-existent');

            expect(result).toBeNull();
        });
    });

    describe('findByNumeroSolicitud', () => {
        it('should find by numero solicitud', async () => {
            const mockDoc = createMockDocument();
            const entity = new SolicitudEntity(createEntityProps());

            mockModel.findOne.mockReturnValue({
                exec: jest.fn().mockResolvedValue(mockDoc),
            });
            mockMapper.toDomain.mockReturnValue(entity);

            const result = await gateway.findByNumeroSolicitud('SOL-2026-0001');

            expect(mockModel.findOne).toHaveBeenCalledWith({ numeroSolicitud: 'SOL-2026-0001' });
            expect(result).toEqual(entity);
        });
    });

    describe('update', () => {
        it('should update entity correctly', async () => {
            const entity = new SolicitudEntity(createEntityProps());
            const mockDoc = createMockDocument();
            const updatedEntity = new SolicitudEntity(createEntityProps());

            mockMapper.toPersistence.mockReturnValue({});
            mockModel.findByIdAndUpdate.mockReturnValue({
                exec: jest.fn().mockResolvedValue(mockDoc),
            });
            mockMapper.toDomain.mockReturnValue(updatedEntity);

            const result = await gateway.update(entity);

            expect(mockModel.findByIdAndUpdate).toHaveBeenCalledWith(
                'test-id',
                expect.anything(),
                { new: true },
            );
            expect(result).toEqual(updatedEntity);
        });
    });

    describe('delete', () => {
        it('should delete entity by id', async () => {
            mockModel.findByIdAndDelete.mockReturnValue({
                exec: jest.fn().mockResolvedValue({}),
            });

            const result = await gateway.delete('test-id');

            expect(mockModel.findByIdAndDelete).toHaveBeenCalledWith('test-id');
            expect(result).toBe(true);
        });

        it('should return false when entity not found', async () => {
            mockModel.findByIdAndDelete.mockReturnValue({
                exec: jest.fn().mockResolvedValue(null),
            });

            const result = await gateway.delete('non-existent');

            expect(result).toBe(false);
        });
    });

    describe('generateNumeroSolicitud', () => {
        it('should generate unique numero solicitud', async () => {
            // Mock findOne().sort().exec() chain
            mockModel.findOne.mockReturnValue({
                sort: jest.fn().mockReturnValue({
                    exec: jest.fn().mockResolvedValue(null),
                }),
            });

            const result = await gateway.generateNumeroSolicitud();

            expect(result).toMatch(/^SOL-\d{8}-\d{5}$/);
        });

        it('should include current date in format', async () => {
            mockModel.findOne.mockReturnValue({
                sort: jest.fn().mockReturnValue({
                    exec: jest.fn().mockResolvedValue(null),
                }),
            });
            const today = new Date();
            const year = today.getFullYear();
            const month = String(today.getMonth() + 1).padStart(2, '0');
            const day = String(today.getDate()).padStart(2, '0');
            const expectedPrefix = `${year}${month}${day}`;

            const result = await gateway.generateNumeroSolicitud();

            expect(result).toContain(expectedPrefix);
        });

        it('should increment sequence based on last solicitud', async () => {
            const today = new Date();
            const year = today.getFullYear();
            const month = String(today.getMonth() + 1).padStart(2, '0');
            const day = String(today.getDate()).padStart(2, '0');
            const prefix = `${year}${month}${day}`;

            mockModel.findOne.mockReturnValue({
                sort: jest.fn().mockReturnValue({
                    exec: jest.fn().mockResolvedValue({
                        numeroSolicitud: `SOL-${prefix}-00005`,
                    }),
                }),
            });

            const result = await gateway.generateNumeroSolicitud();

            expect(result).toBe(`SOL-${prefix}-00006`);
        });
    });
});
