/**
 * SolicitudEntity Unit Tests - Domain Layer
 * 
 * Tests entity behavior, state transitions, and business invariants.
 * These are pure unit tests with no external dependencies.
 */

import { SolicitudEntity, SolicitudProps } from '../../domain/entities/solicitud.entity';
import { EstadoSolicitud, NivelRiesgo } from '../../domain/enums/estado-solicitud.enum';
import { TipoDocumento, Genero, SituacionLaboral, TipoTarjeta, Franquicia, Canal } from '../../domain/enums/common.enum';

describe('SolicitudEntity', () => {
    // Factory to create valid entity props
    const createValidProps = (overrides: Partial<SolicitudProps> = {}): SolicitudProps => ({
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
                calle: 'Calle 123 #45-67',
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
    });

    describe('Creation', () => {
        it('should create entity with valid props', () => {
            const props = createValidProps();
            const entity = new SolicitudEntity(props);

            expect(entity.id).toBe('test-id');
            expect(entity.numeroSolicitud).toBe('SOL-2026-0001');
            expect(entity.estado).toBe(EstadoSolicitud.DRAFT);
        });

        it('should expose all getters correctly', () => {
            const entity = new SolicitudEntity(createValidProps());

            expect(entity.datosPersonales.nombres).toBe('Juan');
            expect(entity.datosLaborales.ingresoMensual).toBe(5000000);
            expect(entity.productoSolicitado.tipoTarjeta).toBe(TipoTarjeta.ORO);
        });
    });

    describe('State Checks', () => {
        it('should identify DRAFT state correctly', () => {
            const entity = new SolicitudEntity(createValidProps());

            expect(entity.isDraft()).toBe(true);
        });

        it('should identify non-DRAFT state correctly', () => {
            const entity = new SolicitudEntity(
                createValidProps({ estado: EstadoSolicitud.SUBMITTED }),
            );

            expect(entity.isDraft()).toBe(false);
        });

        it('should allow updates only in DRAFT state', () => {
            const draftEntity = new SolicitudEntity(createValidProps());
            const submittedEntity = new SolicitudEntity(
                createValidProps({ estado: EstadoSolicitud.SUBMITTED }),
            );

            expect(draftEntity.canBeUpdated()).toBe(true);
            expect(submittedEntity.canBeUpdated()).toBe(false);
        });

        it('should detect accepted terms correctly', () => {
            const entityWithTerms = new SolicitudEntity(createValidProps());
            const entityWithoutTerms = new SolicitudEntity(
                createValidProps({
                    auditoria: {
                        aceptaTerminos: false,
                        aceptaTratamientoDatos: true,
                        autorizaConsultaCentrales: true,
                    },
                }),
            );

            expect(entityWithTerms.hasAcceptedTerms()).toBe(true);
            expect(entityWithoutTerms.hasAcceptedTerms()).toBe(false);
        });
    });

    describe('State Transitions', () => {
        describe('submit()', () => {
            it('should submit DRAFT with accepted terms', () => {
                const entity = new SolicitudEntity(createValidProps());

                entity.submit();

                expect(entity.estado).toBe(EstadoSolicitud.SUBMITTED);
                expect(entity.historialEstados.length).toBe(2);
            });

            it('should throw error when submitting without accepted terms', () => {
                const entity = new SolicitudEntity(
                    createValidProps({
                        auditoria: {
                            aceptaTerminos: false,
                            aceptaTratamientoDatos: false,
                            autorizaConsultaCentrales: false,
                        },
                    }),
                );

                expect(() => entity.submit()).toThrow('Solicitud cannot be submitted in current state');
            });

            it('should throw error when submitting non-DRAFT', () => {
                const entity = new SolicitudEntity(
                    createValidProps({ estado: EstadoSolicitud.APPROVED }),
                );

                expect(() => entity.submit()).toThrow('Solicitud cannot be submitted in current state');
            });
        });

        describe('abandon()', () => {
            it('should abandon DRAFT solicitud', () => {
                const entity = new SolicitudEntity(createValidProps());

                entity.abandon();

                expect(entity.estado).toBe(EstadoSolicitud.ABANDONED);
            });

            it('should not allow abandoning APPROVED solicitud', () => {
                const entity = new SolicitudEntity(
                    createValidProps({ estado: EstadoSolicitud.APPROVED }),
                );

                expect(() => entity.abandon()).toThrow('Solicitud cannot be abandoned in current state');
            });

            it('should not allow abandoning REJECTED solicitud', () => {
                const entity = new SolicitudEntity(
                    createValidProps({ estado: EstadoSolicitud.REJECTED }),
                );

                expect(() => entity.abandon()).toThrow('Solicitud cannot be abandoned in current state');
            });
        });

        describe('approve())', () => {
            it('should approve solicitud with observaciones', () => {
                const entity = new SolicitudEntity(
                    createValidProps({ estado: EstadoSolicitud.IN_REVIEW }),
                );

                entity.approve('Approved by credit committee');

                expect(entity.estado).toBe(EstadoSolicitud.APPROVED);
                expect(entity.historialEstados.pop()?.observaciones).toBe('Approved by credit committee');
            });
        });

        describe('reject()', () => {
            it('should reject solicitud with observaciones', () => {
                const entity = new SolicitudEntity(
                    createValidProps({ estado: EstadoSolicitud.IN_REVIEW }),
                );

                entity.reject('Credit score too low');

                expect(entity.estado).toBe(EstadoSolicitud.REJECTED);
                expect(entity.historialEstados.pop()?.observaciones).toBe('Credit score too low');
            });
        });

        describe('revertToDraft()', () => {
            it('should revert SUBMITTED solicitud to DRAFT with observaciones', () => {
                const entity = new SolicitudEntity(
                    createValidProps({ estado: EstadoSolicitud.SUBMITTED }),
                );

                entity.revertToDraft('Error en integración con Core');

                expect(entity.estado).toBe(EstadoSolicitud.DRAFT);
                expect(entity.historialEstados.pop()?.observaciones).toBe('Error en integración con Core');
            });

            it('should revert IN_REVIEW solicitud to DRAFT', () => {
                const entity = new SolicitudEntity(
                    createValidProps({ estado: EstadoSolicitud.IN_REVIEW }),
                );

                entity.revertToDraft();

                expect(entity.estado).toBe(EstadoSolicitud.DRAFT);
                expect(entity.historialEstados.pop()?.observaciones).toBe('Solicitud revertida a borrador');
            });

            it('should add revert to history', () => {
                const entity = new SolicitudEntity(
                    createValidProps({
                        estado: EstadoSolicitud.SUBMITTED,
                        historialEstados: [
                            { estado: EstadoSolicitud.DRAFT, fecha: new Date(), observaciones: 'Created' },
                            { estado: EstadoSolicitud.SUBMITTED, fecha: new Date(), observaciones: 'Submitted' },
                        ],
                    }),
                );

                const initialHistoryLength = entity.historialEstados.length;
                entity.revertToDraft('Integration failed');

                expect(entity.historialEstados.length).toBe(initialHistoryLength + 1);
                expect(entity.historialEstados[entity.historialEstados.length - 1].estado).toBe(EstadoSolicitud.DRAFT);
            });
        });
    });

    describe('Update Methods', () => {
        it('should update datos personales in DRAFT state', () => {
            const entity = new SolicitudEntity(createValidProps());

            entity.updateDatosPersonales({ nombres: 'Pedro' });

            expect(entity.datosPersonales.nombres).toBe('Pedro');
        });

        it('should throw error updating datos personales in non-DRAFT state', () => {
            const entity = new SolicitudEntity(
                createValidProps({ estado: EstadoSolicitud.SUBMITTED }),
            );

            expect(() => entity.updateDatosPersonales({ nombres: 'Pedro' }))
                .toThrow('Cannot update solicitud in current state');
        });

        it('should update datos laborales correctly', () => {
            const entity = new SolicitudEntity(createValidProps());

            entity.updateDatosLaborales({ ingresoMensual: 8000000 });

            expect(entity.datosLaborales.ingresoMensual).toBe(8000000);
        });

        it('should update producto solicitado correctly', () => {
            const entity = new SolicitudEntity(createValidProps());

            entity.updateProductoSolicitado({ cupoSolicitado: 15000000 });

            expect(entity.productoSolicitado.cupoSolicitado).toBe(15000000);
        });
    });

    describe('Validation Updates', () => {
        it('should mark identity as validated', () => {
            const entity = new SolicitudEntity(createValidProps());

            entity.markIdentityValidated(true, 'CORE-123');

            expect(entity.validaciones.identidadValidada).toBe(true);
            expect(entity.integracionCore.idSolicitudCore).toBe('CORE-123');
        });

        it('should update credit score', () => {
            const entity = new SolicitudEntity(createValidProps());

            entity.updateCreditScore(750, NivelRiesgo.BAJO, 5000000);

            expect(entity.validaciones.scoreCredito).toBe(750);
            expect(entity.validaciones.nivelRiesgo).toBe(NivelRiesgo.BAJO);
            expect(entity.validaciones.deudaActual).toBe(5000000);
            expect(entity.validaciones.centralesRiesgoConsultadas).toBe(true);
        });
    });

    describe('Core Integration', () => {
        it('should mark as sent to core', () => {
            const entity = new SolicitudEntity(createValidProps());

            entity.markSentToCore('CORE-SOL-123', 'RECEIVED');

            expect(entity.integracionCore.enviado).toBe(true);
            expect(entity.integracionCore.idSolicitudCore).toBe('CORE-SOL-123');
            expect(entity.integracionCore.estadoCore).toBe('RECEIVED');
            expect(entity.integracionCore.intentosEnvio).toBe(1);
        });

        it('should record core error', () => {
            const entity = new SolicitudEntity(createValidProps());

            entity.recordCoreError('ERR-001', 'Connection timeout');

            expect(entity.integracionCore.intentosEnvio).toBe(1);
            expect(entity.integracionCore.ultimoError?.codigo).toBe('ERR-001');
            expect(entity.integracionCore.ultimoError?.mensaje).toBe('Connection timeout');
        });

        it('should update core status', () => {
            const entity = new SolicitudEntity(createValidProps());

            entity.updateCoreStatus('APPROVED');

            expect(entity.integracionCore.estadoCore).toBe('APPROVED');
        });
    });

    describe('Serialization', () => {
        it('should return copy of props', () => {
            const originalProps = createValidProps();
            const entity = new SolicitudEntity(originalProps);

            const props = entity.toProps();

            expect(props).toEqual(originalProps);
            expect(props).not.toBe(originalProps); // Should be a copy
        });
    });
});
