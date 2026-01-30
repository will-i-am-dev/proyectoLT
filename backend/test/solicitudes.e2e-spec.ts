import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { MongooseModule } from '@nestjs/mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { AppModule } from '../src/app.module';
import {
    TipoDocumento,
    Genero,
    SituacionLaboral,
    TipoContrato,
    TipoTarjeta,
    Franquicia,
} from '../src/modules/solicitudes/domain/enums/common.enum';

describe('Solicitudes E2E Tests', () => {
    let app: INestApplication;
    let mongoServer: MongoMemoryServer;
    let solicitudId: string;

    beforeAll(async () => {
        // Crear MongoDB en memoria para tests
        mongoServer = await MongoMemoryServer.create();
        const mongoUri = mongoServer.getUri();

        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        })
            .overrideProvider('MONGODB_URI')
            .useValue(mongoUri)
            .compile();

        app = moduleFixture.createNestApplication();

        // Aplicar mismos pipes que en producción
        app.useGlobalPipes(
            new ValidationPipe({
                whitelist: true,
                forbidNonWhitelisted: true,
                transform: true,
            }),
        );

        await app.init();
    });

    afterAll(async () => {
        await app.close();
        await mongoServer.stop();
    });

    describe('POST /api/v1/solicitudes - Crear solicitud', () => {
        it('debe crear una solicitud en estado draft', async () => {
            const createDto = {
                datosPersonales: {
                    nombres: 'Juan Carlos',
                    apellidos: 'Pérez González',
                    tipoDocumento: TipoDocumento.CC,
                    numeroDocumento: '1234567890',
                    fechaNacimiento: '1990-01-15',
                    genero: Genero.M,
                    email: 'juan.perez@test.com',
                    celular: '+573001234567',
                    direccionResidencia: {
                        calle: 'Calle 123 #45-67',
                        ciudad: 'Bogotá',
                        departamento: 'Cundinamarca',
                        codigoPostal: '110111',
                    },
                },
                datosLaborales: {
                    situacionLaboral: SituacionLaboral.EMPLEADO,
                    tipoContrato: TipoContrato.INDEFINIDO,
                    nombreEmpresa: 'Empresa Test S.A.S.',
                    cargoActual: 'Ingeniero de Software',
                    antiguedadMeses: 24,
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
            };

            const response = await request(app.getHttpServer())
                .post('/api/v1/solicitudes')
                .send(createDto)
                .expect(201);

            expect(response.body.data).toHaveProperty('numeroSolicitud');
            expect(response.body.data.estado).toBe('draft');
            expect(response.body.data.numeroSolicitud).toMatch(/^SOL-\d{8}-\d{5}$/);

            solicitudId = response.body.data._id;
        });

        it('debe rechazar solicitud con edad menor a 18 años', async () => {
            const createDto = {
                datosPersonales: {
                    nombres: 'Menor',
                    apellidos: 'De Edad',
                    tipoDocumento: TipoDocumento.CC,
                    numeroDocumento: '9876543210',
                    fechaNacimiento: '2010-01-01', // Menor de edad
                    genero: Genero.M,
                    email: 'menor@test.com',
                    celular: '+573009999999',
                    direccionResidencia: {
                        calle: 'Calle 1',
                        ciudad: 'Bogotá',
                        departamento: 'Cundinamarca',
                        codigoPostal: '110111',
                    },
                },
                datosLaborales: {
                    situacionLaboral: SituacionLaboral.EMPLEADO,
                    tipoContrato: TipoContrato.INDEFINIDO,
                    nombreEmpresa: 'Empresa',
                    antiguedadMeses: 12,
                    ingresoMensual: 2000000,
                },
                productoSolicitado: {
                    tipoTarjeta: TipoTarjeta.CLASICA,
                    cupoSolicitado: 2000000,
                    franquicia: Franquicia.VISA,
                },
                auditoria: {
                    aceptaTerminos: true,
                    aceptaTratamientoDatos: true,
                    autorizaConsultaCentrales: true,
                },
            };

            await request(app.getHttpServer())
                .post('/api/v1/solicitudes')
                .send(createDto)
                .expect(400);
        });

        it('debe rechazar solicitud con ingreso menor al mínimo', async () => {
            const createDto = {
                datosPersonales: {
                    nombres: 'Juan',
                    apellidos: 'Pérez',
                    tipoDocumento: TipoDocumento.CC,
                    numeroDocumento: '1111111111',
                    fechaNacimiento: '1990-01-01',
                    genero: Genero.M,
                    email: 'juan@test.com',
                    celular: '+573001111111',
                    direccionResidencia: {
                        calle: 'Calle 1',
                        ciudad: 'Bogotá',
                        departamento: 'Cundinamarca',
                        codigoPostal: '110111',
                    },
                },
                datosLaborales: {
                    situacionLaboral: SituacionLaboral.EMPLEADO,
                    tipoContrato: TipoContrato.INDEFINIDO,
                    nombreEmpresa: 'Empresa',
                    antiguedadMeses: 12,
                    ingresoMensual: 1000000, // Menor al mínimo
                },
                productoSolicitado: {
                    tipoTarjeta: TipoTarjeta.CLASICA,
                    cupoSolicitado: 2000000,
                    franquicia: Franquicia.VISA,
                },
                auditoria: {
                    aceptaTerminos: true,
                    aceptaTratamientoDatos: true,
                    autorizaConsultaCentrales: true,
                },
            };

            await request(app.getHttpServer())
                .post('/api/v1/solicitudes')
                .send(createDto)
                .expect(400);
        });
    });

    describe('GET /api/v1/solicitudes/:id - Obtener solicitud', () => {
        it('debe obtener una solicitud por ID', async () => {
            const response = await request(app.getHttpServer())
                .get(`/api/v1/solicitudes/${solicitudId}`)
                .expect(200);

            expect(response.body.data).toHaveProperty('numeroSolicitud');
            expect(response.body.data._id).toBe(solicitudId);
        });

        it('debe retornar 404 para ID inexistente', async () => {
            await request(app.getHttpServer())
                .get('/api/v1/solicitudes/507f1f77bcf86cd799439011')
                .expect(404);
        });
    });

    describe('PATCH /api/v1/solicitudes/:id - Actualizar solicitud', () => {
        it('debe actualizar una solicitud en draft', async () => {
            const updateDto = {
                datosPersonales: {
                    celular: '+573009876543',
                },
            };

            const response = await request(app.getHttpServer())
                .patch(`/api/v1/solicitudes/${solicitudId}`)
                .send(updateDto)
                .expect(200);

            expect(response.body.data.datosPersonales.celular).toBe('+573009876543');
        });
    });

    describe('POST /api/v1/solicitudesid/submit - Enviar solicitud', () => {
        it('debe enviar una solicitud para revisión', async () => {
            const response = await request(app.getHttpServer())
                .post(`/api/v1/solicitudes/${solicitudId}/submit`)
                .expect(200);

            expect(response.body.data.estado).toBe('submitted');
            expect(response.body.data.historialEstados).toHaveLength(2);
        });

        it('no debe permitir enviar una solicitud ya enviada', async () => {
            await request(app.getHttpServer())
                .post(`/api/v1/solicitudes/${solicitudId}/submit`)
                .expect(400);
        });
    });

    describe('GET /api/v1/solicitudes - Listar solicitudes', () => {
        it('debe listar solicitudes con paginación', async () => {
            const response = await request(app.getHttpServer())
                .get('/api/v1/solicitudes?page=1&limit=10')
                .expect(200);

            expect(response.body.data).toBeInstanceOf(Array);
            expect(response.body.meta).toHaveProperty('total');
            expect(response.body.meta).toHaveProperty('page');
            expect(response.body.meta).toHaveProperty('limit');
            expect(response.body.meta).toHaveProperty('pages');
        });

        it('debe filtrar por estado', async () => {
            const response = await request(app.getHttpServer())
                .get('/api/v1/solicitudes?estado=submitted')
                .expect(200);

            expect(response.body.data).toBeInstanceOf(Array);
            if (response.body.data.length > 0) {
                expect(response.body.data[0].estado).toBe('submitted');
            }
        });
    });

    describe('GET /api/v1/health - Health check', () => {
        it('debe retornar estado de salud', async () => {
            const response = await request(app.getHttpServer())
                .get('/api/v1/health')
                .expect(200);

            expect(response.body.data.status).toBe('ok');
            expect(response.body.data).toHaveProperty('timestamp');
            expect(response.body.data).toHaveProperty('uptime');
        });
    });

    describe('Flujo completo de solicitud', () => {
        it('debe completar el flujo: crear -> actualizar -> enviar', async () => {
            // 1. Crear solicitud
            const createResponse = await request(app.getHttpServer())
                .post('/api/v1/solicitudes')
                .send({
                    datosPersonales: {
                        nombres: 'María',
                        apellidos: 'García',
                        tipoDocumento: TipoDocumento.CC,
                        numeroDocumento: '2222222222',
                        fechaNacimiento: '1985-05-20',
                        genero: Genero.F,
                        email: 'maria@test.com',
                        celular: '+573002222222',
                        direccionResidencia: {
                            calle: 'Carrera 50 #20-10',
                            ciudad: 'Medellín',
                            departamento: 'Antioquia',
                            codigoPostal: '050001',
                        },
                    },
                    datosLaborales: {
                        situacionLaboral: SituacionLaboral.EMPLEADO,
                        tipoContrato: TipoContrato.INDEFINIDO,
                        nombreEmpresa: 'Compañía XYZ',
                        cargoActual: 'Gerente',
                        antiguedadMeses: 36,
                        ingresoMensual: 8000000,
                    },
                    productoSolicitado: {
                        tipoTarjeta: TipoTarjeta.PLATINUM,
                        cupoSolicitado: 20000000,
                        franquicia: Franquicia.MASTERCARD,
                        segurosAdicionales: true,
                    },
                    auditoria: {
                        aceptaTerminos: true,
                        aceptaTratamientoDatos: true,
                        autorizaConsultaCentrales: true,
                    },
                })
                .expect(201);

            const newSolicitudId = createResponse.body.data._id;
            expect(createResponse.body.data.estado).toBe('draft');

            // 2. Actualizar solicitud
            await request(app.getHttpServer())
                .patch(`/api/v1/solicitudes/${newSolicitudId}`)
                .send({
                    productoSolicitado: {
                        segurosAdicionales: false,
                    },
                })
                .expect(200);

            // 3. Enviar solicitud
            const submitResponse = await request(app.getHttpServer())
                .post(`/api/v1/solicitudes/${newSolicitudId}/submit`)
                .expect(200);

            expect(submitResponse.body.data.estado).toBe('submitted');
        });
    });
});
