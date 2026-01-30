/**
 * Solicitud Mongo Gateway - Infrastructure Layer
 * 
 * Implements ISolicitudGateway interface using MongoDB/Mongoose.
 * This is an Adapter that bridges the Application Layer with MongoDB.
 */

import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
    SolicitudTarjetaCredito,
    SolicitudTarjetaCreditoDocument,
} from '../../schemas/solicitud-tarjeta.schema';
import {
    ISolicitudGateway,
    SolicitudFilters,
    PaginationOptions,
    PaginatedResult,
} from '../../../application/gateways/solicitud.gateway';
import { SolicitudEntity } from '../../../domain/entities/solicitud.entity';
import { SolicitudMapper } from '../mappers/solicitud.mapper';
import { EstadoSolicitud } from '../../../domain/enums/estado-solicitud.enum';

@Injectable()
export class SolicitudMongoGateway implements ISolicitudGateway {
    constructor(
        @InjectModel(SolicitudTarjetaCredito.name)
        private readonly solicitudModel: Model<SolicitudTarjetaCreditoDocument>,
        private readonly mapper: SolicitudMapper,
    ) { }

    async save(entity: SolicitudEntity): Promise<SolicitudEntity> {
        const data = this.mapper.toPersistence(entity);
        const document = new this.solicitudModel(data);
        const saved = await document.save();
        return this.mapper.toDomain(saved);
    }

    async findById(id: string): Promise<SolicitudEntity | null> {
        const document = await this.solicitudModel.findById(id).exec();
        if (!document) return null;
        return this.mapper.toDomain(document);
    }

    async findByNumeroSolicitud(numeroSolicitud: string): Promise<SolicitudEntity | null> {
        const document = await this.solicitudModel.findOne({ numeroSolicitud }).exec();
        if (!document) return null;
        return this.mapper.toDomain(document);
    }

    async findAll(
        filters: SolicitudFilters,
        pagination: PaginationOptions,
    ): Promise<PaginatedResult<SolicitudEntity>> {
        const { page = 1, limit = 10 } = pagination;
        const skip = (page - 1) * limit;

        const query: any = {};

        // Apply filters
        if (filters.estado) {
            query.estado = filters.estado;
        }

        if (filters.tipoTarjeta) {
            query['productoSolicitado.tipoTarjeta'] = filters.tipoTarjeta;
        }

        if (filters.fechaDesde || filters.fechaHasta) {
            query['metadatos.creadoEn'] = {};
            if (filters.fechaDesde) {
                query['metadatos.creadoEn'].$gte = new Date(filters.fechaDesde);
            }
            if (filters.fechaHasta) {
                query['metadatos.creadoEn'].$lte = new Date(filters.fechaHasta);
            }
        }

        if (filters.email) {
            query['datosPersonales.email'] = filters.email;
        }

        if (filters.numeroDocumento) {
            query['datosPersonales.numeroDocumento'] = filters.numeroDocumento;
        }

        const [documents, total] = await Promise.all([
            this.solicitudModel
                .find(query)
                .sort({ 'metadatos.creadoEn': -1 })
                .skip(skip)
                .limit(limit)
                .exec(),
            this.solicitudModel.countDocuments(query).exec(),
        ]);

        return {
            data: documents.map((doc) => this.mapper.toDomain(doc)),
            total,
            page,
            limit,
        };
    }

    async update(entity: SolicitudEntity): Promise<SolicitudEntity> {
        const data = this.mapper.toPersistence(entity);
        const updated = await this.solicitudModel
            .findByIdAndUpdate(entity.id, { $set: data }, { new: true })
            .exec();

        if (!updated) {
            throw new Error(`Solicitud with id ${entity.id} not found`);
        }

        return this.mapper.toDomain(updated);
    }

    async delete(id: string): Promise<boolean> {
        const result = await this.solicitudModel.findByIdAndDelete(id).exec();
        return !!result;
    }

    async generateNumeroSolicitud(): Promise<string> {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        const datePrefix = `${year}${month}${day}`;

        const prefix = `SOL-${datePrefix}`;
        const lastSolicitud = await this.solicitudModel
            .findOne({ numeroSolicitud: new RegExp(`^${prefix}`) })
            .sort({ numeroSolicitud: -1 })
            .exec();

        let sequence = 1;
        if (lastSolicitud) {
            const lastSequence = parseInt(lastSolicitud.numeroSolicitud.split('-')[2], 10);
            sequence = lastSequence + 1;
        }

        const sequenceStr = String(sequence).padStart(5, '0');
        return `${prefix}-${sequenceStr}`;
    }
}
