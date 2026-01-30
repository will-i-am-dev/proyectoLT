/**
 * Solicitud Validation Domain Service
 * 
 * Pure domain logic for validating business rules.
 * No external dependencies - only receives data and returns results.
 */

import { TipoTarjeta } from '../enums/common.enum';

export interface ValidationResult {
    isValid: boolean;
    errors: string[];
}

export interface CardTypeLimits {
    maxCupo: number;
    minIncome: number;
}

export class SolicitudValidationService {
    private static readonly MIN_AGE = 18;
    private static readonly MIN_INCOME = 1500000;
    private static readonly MAX_CUPO_INCOME_RATIO = 3;

    private static readonly CARD_LIMITS: Record<TipoTarjeta, CardTypeLimits> = {
        [TipoTarjeta.CLASICA]: { maxCupo: 5000000, minIncome: 1500000 },
        [TipoTarjeta.ORO]: { maxCupo: 15000000, minIncome: 3000000 },
        [TipoTarjeta.PLATINUM]: { maxCupo: 40000000, minIncome: 8000000 },
        [TipoTarjeta.BLACK]: { maxCupo: Infinity, minIncome: 15000000 },
    };

    /**
     * Validate all business rules for a solicitud
     */
    /**
     * Validate all business rules for a solicitud
     */
    static validateAll(
        fechaNacimiento: Date,
        ingresoMensual?: number,
        tipoTarjeta?: TipoTarjeta,
        cupoSolicitado?: number,
    ): ValidationResult {
        const errors: string[] = [];

        const ageResult = this.validateAge(fechaNacimiento);
        if (!ageResult.isValid) errors.push(...ageResult.errors);

        if (ingresoMensual !== undefined) {
            const incomeResult = this.validateMinimumIncome(ingresoMensual);
            if (!incomeResult.isValid) errors.push(...incomeResult.errors);
        }

        if (tipoTarjeta !== undefined && ingresoMensual !== undefined) {
            const cardResult = this.validateCardTypeRequirements(tipoTarjeta, ingresoMensual);
            if (!cardResult.isValid) errors.push(...cardResult.errors);
        }

        if (tipoTarjeta !== undefined && cupoSolicitado !== undefined && ingresoMensual !== undefined) {
            const cupoResult = this.validateCupoLimits(tipoTarjeta, cupoSolicitado, ingresoMensual);
            if (!cupoResult.isValid) errors.push(...cupoResult.errors);
        }

        return {
            isValid: errors.length === 0,
            errors,
        };
    }

    /**
     * Validate minimum age (18 years)
     */
    static validateAge(fechaNacimiento: Date): ValidationResult {
        const age = this.calculateAge(fechaNacimiento);
        if (age < this.MIN_AGE) {
            return {
                isValid: false,
                errors: [`Debe ser mayor de ${this.MIN_AGE} años`],
            };
        }
        return { isValid: true, errors: [] };
    }

    /**
     * Validate minimum income
     */
    static validateMinimumIncome(ingresoMensual: number): ValidationResult {
        if (ingresoMensual < this.MIN_INCOME) {
            return {
                isValid: false,
                errors: [`El ingreso mensual mínimo es $${this.MIN_INCOME} COP`],
            };
        }
        return { isValid: true, errors: [] };
    }

    /**
     * Validate card type income requirements
     */
    static validateCardTypeRequirements(
        tipoTarjeta: TipoTarjeta,
        ingresoMensual: number,
    ): ValidationResult {
        const limits = this.CARD_LIMITS[tipoTarjeta];
        if (ingresoMensual < limits.minIncome) {
            return {
                isValid: false,
                errors: [`Para tarjeta ${tipoTarjeta} el ingreso mínimo es $${limits.minIncome} COP`],
            };
        }
        return { isValid: true, errors: [] };
    }

    /**
     * Validate cupo limits based on card type and income
     */
    static validateCupoLimits(
        tipoTarjeta: TipoTarjeta,
        cupoSolicitado: number,
        ingresoMensual: number,
    ): ValidationResult {
        const errors: string[] = [];
        const limits = this.CARD_LIMITS[tipoTarjeta];

        // Check max cupo for card type
        if (cupoSolicitado > limits.maxCupo) {
            errors.push(`El cupo máximo para tarjeta ${tipoTarjeta} es $${limits.maxCupo} COP`);
        }

        // Check max cupo based on income ratio
        const maxCupoPorIngreso = ingresoMensual * this.MAX_CUPO_INCOME_RATIO;
        if (cupoSolicitado > maxCupoPorIngreso) {
            errors.push(
                `El cupo solicitado no puede ser mayor a ${this.MAX_CUPO_INCOME_RATIO} veces el ingreso mensual ($${maxCupoPorIngreso} COP)`,
            );
        }

        return {
            isValid: errors.length === 0,
            errors,
        };
    }

    /**
     * Calculate age from birth date
     */
    private static calculateAge(birthDate: Date): number {
        const today = new Date();
        const birth = new Date(birthDate);
        let age = today.getFullYear() - birth.getFullYear();
        const monthDiff = today.getMonth() - birth.getMonth();

        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
            age--;
        }

        return age;
    }
}
