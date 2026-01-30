/**
 * SolicitudValidationService Unit Tests - Domain Layer
 * 
 * Tests pure business validation rules.
 * No external dependencies - pure functions only.
 */

import { SolicitudValidationService } from '../../domain/services/solicitud-validation.service';
import { TipoTarjeta } from '../../domain/enums/common.enum';

describe('SolicitudValidationService', () => {
    describe('validateAge', () => {
        it('should pass for adult (18+)', () => {
            const birthDate = new Date();
            birthDate.setFullYear(birthDate.getFullYear() - 25);

            const result = SolicitudValidationService.validateAge(birthDate);

            expect(result.isValid).toBe(true);
            expect(result.errors).toHaveLength(0);
        });

        it('should fail for minor (under 18)', () => {
            const birthDate = new Date();
            birthDate.setFullYear(birthDate.getFullYear() - 17);

            const result = SolicitudValidationService.validateAge(birthDate);

            expect(result.isValid).toBe(false);
            expect(result.errors).toContain('Debe ser mayor de 18 años');
        });

        it('should pass for exactly 18 years old', () => {
            const birthDate = new Date();
            birthDate.setFullYear(birthDate.getFullYear() - 18);
            birthDate.setDate(birthDate.getDate() - 1); // One day past 18th birthday

            const result = SolicitudValidationService.validateAge(birthDate);

            expect(result.isValid).toBe(true);
        });
    });

    describe('validateMinimumIncome', () => {
        it('should pass for income above minimum (1,500,000)', () => {
            const result = SolicitudValidationService.validateMinimumIncome(2000000);

            expect(result.isValid).toBe(true);
        });

        it('should fail for income below minimum', () => {
            const result = SolicitudValidationService.validateMinimumIncome(1000000);

            expect(result.isValid).toBe(false);
            expect(result.errors[0]).toContain('1500000');
        });

        it('should pass for exactly minimum income', () => {
            const result = SolicitudValidationService.validateMinimumIncome(1500000);

            expect(result.isValid).toBe(true);
        });
    });

    describe('validateCardTypeRequirements', () => {
        it('should pass CLASICA card with minimum income (1,500,000)', () => {
            const result = SolicitudValidationService.validateCardTypeRequirements(
                TipoTarjeta.CLASICA,
                1500000,
            );

            expect(result.isValid).toBe(true);
        });

        it('should pass ORO card with minimum income (3,000,000)', () => {
            const result = SolicitudValidationService.validateCardTypeRequirements(
                TipoTarjeta.ORO,
                3000000,
            );

            expect(result.isValid).toBe(true);
        });

        it('should fail ORO card with insufficient income', () => {
            const result = SolicitudValidationService.validateCardTypeRequirements(
                TipoTarjeta.ORO,
                2000000,
            );

            expect(result.isValid).toBe(false);
            expect(result.errors[0]).toContain('ORO');
            expect(result.errors[0]).toContain('3000000');
        });

        it('should pass PLATINUM card with minimum income (8,000,000)', () => {
            const result = SolicitudValidationService.validateCardTypeRequirements(
                TipoTarjeta.PLATINUM,
                8000000,
            );

            expect(result.isValid).toBe(true);
        });

        it('should fail PLATINUM card with insufficient income', () => {
            const result = SolicitudValidationService.validateCardTypeRequirements(
                TipoTarjeta.PLATINUM,
                5000000,
            );

            expect(result.isValid).toBe(false);
            expect(result.errors[0]).toContain('PLATINUM');
        });

        it('should pass BLACK card with minimum income (15,000,000)', () => {
            const result = SolicitudValidationService.validateCardTypeRequirements(
                TipoTarjeta.BLACK,
                15000000,
            );

            expect(result.isValid).toBe(true);
        });

        it('should fail BLACK card with insufficient income', () => {
            const result = SolicitudValidationService.validateCardTypeRequirements(
                TipoTarjeta.BLACK,
                10000000,
            );

            expect(result.isValid).toBe(false);
            expect(result.errors[0]).toContain('BLACK');
        });
    });

    describe('validateCupoLimits', () => {
        it('should pass valid cupo for CLASICA (max 5,000,000)', () => {
            const result = SolicitudValidationService.validateCupoLimits(
                TipoTarjeta.CLASICA,
                4000000,
                2000000,
            );

            expect(result.isValid).toBe(true);
        });

        it('should fail cupo exceeding card type maximum', () => {
            const result = SolicitudValidationService.validateCupoLimits(
                TipoTarjeta.CLASICA,
                6000000, // Exceeds 5M max
                10000000, // High income to pass ratio check
            );

            expect(result.isValid).toBe(false);
            expect(result.errors[0]).toContain('5000000');
        });

        it('should fail cupo exceeding income ratio (3x income)', () => {
            const result = SolicitudValidationService.validateCupoLimits(
                TipoTarjeta.ORO,
                10000000, // 10M cupo
                2000000,  // 2M income (ratio = 5x, max allowed is 3x)
            );

            expect(result.isValid).toBe(false);
            expect(result.errors.some(e => e.includes('3 veces'))).toBe(true);
        });

        it('should pass valid cupo for ORO (max 15,000,000)', () => {
            const result = SolicitudValidationService.validateCupoLimits(
                TipoTarjeta.ORO,
                9000000,  // 9M cupo
                5000000,  // 5M income (ratio = 1.8x)
            );

            expect(result.isValid).toBe(true);
        });

        it('should pass BLACK card with high cupo (no max limit)', () => {
            const result = SolicitudValidationService.validateCupoLimits(
                TipoTarjeta.BLACK,
                30000000, // 30M cupo
                20000000, // 20M income (ratio = 1.5x)
            );

            expect(result.isValid).toBe(true);
        });
    });

    describe('validateAll', () => {
        const adultBirthDate = new Date();
        adultBirthDate.setFullYear(adultBirthDate.getFullYear() - 30);

        it('should pass all validations for valid application', () => {
            const result = SolicitudValidationService.validateAll(
                adultBirthDate,
                5000000,           // 5M income
                TipoTarjeta.ORO,
                10000000,          // 10M cupo (2x income)
            );

            expect(result.isValid).toBe(true);
            expect(result.errors).toHaveLength(0);
        });

        it('should collect multiple validation errors', () => {
            const minorBirthDate = new Date();
            minorBirthDate.setFullYear(minorBirthDate.getFullYear() - 16);

            const result = SolicitudValidationService.validateAll(
                minorBirthDate,    // Minor
                1000000,           // Below minimum income
                TipoTarjeta.PLATINUM,
                50000000,          // Exceeds card max
            );

            expect(result.isValid).toBe(false);
            expect(result.errors.length).toBeGreaterThan(1);
        });

        it('should fail for minor with insufficient income', () => {
            const minorBirthDate = new Date();
            minorBirthDate.setFullYear(minorBirthDate.getFullYear() - 17);

            const result = SolicitudValidationService.validateAll(
                minorBirthDate,
                1000000,
                TipoTarjeta.CLASICA,
                3000000,
            );

            expect(result.isValid).toBe(false);
            expect(result.errors.some(e => e.includes('18 años'))).toBe(true);
            expect(result.errors.some(e => e.includes('1500000'))).toBe(true);
        });
    });
});
