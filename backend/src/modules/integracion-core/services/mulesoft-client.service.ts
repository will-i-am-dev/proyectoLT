import { Injectable, Logger } from '@nestjs/common';
import axios, { AxiosInstance, AxiosError } from 'axios';
import axiosRetry from 'axios-retry';

import { ConfigService } from '@nestjs/config';
import {
    ValidarClienteDto,
    ValidarClienteResponseDto,
    ConsultarCentralesDto,
    ConsultarCentralesResponseDto,
    CrearSolicitudCoreDto,
    CrearSolicitudCoreResponseDto,
    EstadoSolicitudCoreResponseDto,
} from '../dto/mulesoft.dto';

/**
 * Mulesoft Client Service
 * 
 * Cliente HTTP con Circuit Breaker y Retry para comunicación
 * con los endpoints de Mulesoft/Core Bancario
 */
@Injectable()
export class MulesoftClientService {
    private readonly logger = new Logger(MulesoftClientService.name);
    private readonly axiosInstance: AxiosInstance;


    constructor(private readonly configService: ConfigService) {
        // Configurar Axios con timeout y headers
        this.axiosInstance = axios.create({
            baseURL: this.configService.get<string>('MULESOFT_API_URL'),
            timeout: this.configService.get<number>('MULESOFT_TIMEOUT', 30000),
            headers: {
                'Content-Type': 'application/json',
                'X-API-Key': this.configService.get<string>('MULESOFT_API_KEY'),
            },
        });

        // Configurar Retry con backoff exponencial
        axiosRetry(this.axiosInstance, {
            retries: this.configService.get<number>('MULESOFT_RETRY_MAX_ATTEMPTS', 3),
            retryDelay: axiosRetry.exponentialDelay,
            retryCondition: (error: AxiosError) => {
                // Retry en errores de red o 5xx
                return (
                    axiosRetry.isNetworkOrIdempotentRequestError(error) ||
                    (error.response?.status >= 500 && error.response?.status < 600)
                );
            },
            onRetry: (retryCount, error, requestConfig) => {
                this.logger.warn(
                    `Retry attempt ${retryCount} for ${requestConfig.url}. Error: ${error.message}`,
                );
            },
        });


    }

    /**
     * Validar cliente
     */
    async validarCliente(
        dto: ValidarClienteDto,
    ): Promise<ValidarClienteResponseDto> {
        this.logger.log(`Validando cliente: ${dto.numeroDocumento}`);

        try {
            const response = await this.axiosInstance.post('/clientes/validar', dto);

            this.logger.log(`Cliente validado exitosamente: ${dto.numeroDocumento}`);
            return response.data;
        } catch (error) {
            this.logger.error(
                `Error validando cliente: ${error.message}`,
                error.stack,
            );
            throw error;
        }
    }

    /**
     * Consultar centrales de riesgo
     */
    async consultarCentrales(
        dto: ConsultarCentralesDto,
    ): Promise<ConsultarCentralesResponseDto> {
        this.logger.log(
            `Consultando centrales de riesgo: ${dto.numeroDocumento}`,
        );

        try {
            const response = await this.axiosInstance.post('/centrales-riesgo/consultar', dto);

            this.logger.log(
                `Centrales consultadas - Score: ${response.data.scoreCredito}`,
            );
            return response.data;
        } catch (error) {
            this.logger.error(
                `Error consultando centrales: ${error.message}`,
                error.stack,
            );
            throw error;
        }
    }

    /**
     * Crear solicitud en Core
     */
    async crearSolicitud(
        dto: CrearSolicitudCoreDto,
    ): Promise<CrearSolicitudCoreResponseDto> {
        this.logger.log(`Creando solicitud en Core: ${dto.numeroSolicitud}`);

        try {
            const response = await this.axiosInstance.post('/solicitudes/crear', dto);

            this.logger.log(
                `Solicitud creada en Core: ${response.data.idSolicitudCore}`,
            );
            return response.data;
        } catch (error) {
            this.logger.error(
                `Error creando solicitud en Core: ${error.message}`,
                error.stack,
            );
            throw error;
        }
    }

    /**
     * Consultar estado de solicitud
     */
    async consultarEstado(
        idSolicitudCore: string,
    ): Promise<EstadoSolicitudCoreResponseDto> {
        this.logger.log(`Consultando estado de solicitud: ${idSolicitudCore}`);

        try {
            const response = await this.axiosInstance.get(`/solicitudes/${idSolicitudCore}/estado`);

            this.logger.log(
                `Estado obtenido: ${response.data.estadoCore} para ${idSolicitudCore}`,
            );
            return response.data;
        } catch (error) {
            this.logger.error(
                `Error consultando estado: ${error.message}`,
                error.stack,
            );
            throw error;
        }
    }


}
