/**
 * SolicitudMapper Unit Tests - Infrastructure Layer
 * 
 * Tests the mapping between domain entities and persistence models.
 */

import { SolicitudMapper } from '../../infrastructure/persistence/mappers/solicitud.mapper';
import { SolicitudEntity } from '../../domain/entities/solicitud.entity';
import { EstadoSolicitud } from '../../domain/enums/estado-solicitud.enum';
import { TipoDocumento, Genero, SituacionLaboral, TipoTarjeta, Franquicia, Canal } from '../../domain/enums/common.enum';

describe('SolicitudMapper', () => {
    let mapper: SolicitudMapper;

    const createMockDocument = (): any => ({
        _id: { toString: () => 'doc-id' },
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
            fechaAceptacionTerminos: new Date(),
            aceptaTratamientoDatos: true,
            autorizaConsultaCentrales: true,
        },
        validaciones: {
            identidadValidada: true,
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

    beforeEach(() => {
        mapper = new SolicitudMapper();
    });

    describe('toDomain', () => {
        it('should convert document to entity correctly', () => {
            const document = createMockDocument();

            const entity = mapper.toDomain(document);

            expect(entity).toBeInstanceOf(SolicitudEntity);
            expect(entity.id).toBe('doc-id');
            expect(entity.numeroSolicitud).toBe('SOL-2026-0001');
            expect(entity.estado).toBe(EstadoSolicitud.DRAFT);
        });

        it('should map datosPersonales correctly', () => {
            const document = createMockDocument();

            const entity = mapper.toDomain(document);

            expect(entity.datosPersonales.nombres).toBe('Juan');
            expect(entity.datosPersonales.apellidos).toBe('Pérez');
            expect(entity.datosPersonales.tipoDocumento).toBe(TipoDocumento.CC);
            expect(entity.datosPersonales.fechaNacimiento).toBeInstanceOf(Date);
        });

        it('should map datosLaborales correctly', () => {
            const document = createMockDocument();

            const entity = mapper.toDomain(document);

            expect(entity.datosLaborales.situacionLaboral).toBe(SituacionLaboral.EMPLEADO);
            expect(entity.datosLaborales.ingresoMensual).toBe(5000000);
        });

        it('should map productoSolicitado correctly', () => {
            const document = createMockDocument();

            const entity = mapper.toDomain(document);

            expect(entity.productoSolicitado.tipoTarjeta).toBe(TipoTarjeta.ORO);
            expect(entity.productoSolicitado.cupoSolicitado).toBe(10000000);
            expect(entity.productoSolicitado.segurosAdicionales).toBe(false);
        });

        it('should handle missing optional fields gracefully', () => {
            const document = createMockDocument();
            document.validaciones = {};
            document.integracionCore = {};
            document.auditoria = {};

            const entity = mapper.toDomain(document);

            expect(entity.validaciones.identidadValidada).toBe(false);
            expect(entity.integracionCore.enviado).toBe(false);
            expect(entity.auditoria.aceptaTerminos).toBe(false);
        });

        it('should map historialEstados correctly', () => {
            const document = createMockDocument();
            document.historialEstados = [
                { estado: EstadoSolicitud.DRAFT, fecha: new Date('2026-01-01'), observaciones: 'Test' },
            ];

            const entity = mapper.toDomain(document);

            expect(entity.historialEstados).toHaveLength(1);
            expect(entity.historialEstados[0].estado).toBe(EstadoSolicitud.DRAFT);
            expect(entity.historialEstados[0].fecha).toBeInstanceOf(Date);
        });
    });

    describe('toPersistence', () => {
        it('should convert entity to persistence object', () => {
            const document = createMockDocument();
            const entity = mapper.toDomain(document);

            const persistenceObject = mapper.toPersistence(entity);

            expect(persistenceObject).toHaveProperty('numeroSolicitud');
            expect(persistenceObject).toHaveProperty('estado');
            expect(persistenceObject).toHaveProperty('datosPersonales');
            expect(persistenceObject).toHaveProperty('datosLaborales');
            expect(persistenceObject).toHaveProperty('productoSolicitado');
        });

        it('should not include id in persistence object', () => {
            const document = createMockDocument();
            const entity = mapper.toDomain(document);

            const persistenceObject = mapper.toPersistence(entity);

            expect(persistenceObject).not.toHaveProperty('id');
        });

        it('should preserve all entity data', () => {
            const document = createMockDocument();
            const entity = mapper.toDomain(document);

            const persistenceObject = mapper.toPersistence(entity);

            expect(persistenceObject.numeroSolicitud).toBe('SOL-2026-0001');
            expect(persistenceObject.estado).toBe(EstadoSolicitud.DRAFT);
            expect(persistenceObject.datosPersonales.nombres).toBe('Juan');
        });
    });
});
