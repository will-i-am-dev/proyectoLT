import { render, screen, fireEvent } from '@testing-library/react';
import { Input } from '../Input';

describe('Input Component', () => {
    // ============ Rendering Tests ============

    describe('Renderizado básico', () => {
        it('renderiza el input con label', () => {
            render(<Input label="Email" />);
            expect(screen.getByLabelText('Email')).toBeInTheDocument();
        });

        it('renderiza con displayName correcto', () => {
            expect(Input.displayName).toBe('Input');
        });

        it('asocia el label con el input por id', () => {
            render(<Input label="Nombre" id="nombre-input" />);
            const input = screen.getByLabelText('Nombre');
            expect(input).toHaveAttribute('id', 'nombre-input');
        });

        it('genera id automático si no se proporciona', () => {
            render(<Input label="Auto ID" />);
            const input = screen.getByLabelText('Auto ID');
            expect(input).toHaveAttribute('id');
        });
    });

    // ============ Required Indicator ============

    describe('Indicador requerido', () => {
        it('muestra asterisco cuando required es true', () => {
            render(<Input label="Campo requerido" required />);
            const asterisk = screen.getByText('*');
            expect(asterisk).toBeInTheDocument();
            expect(asterisk).toHaveAttribute('aria-hidden', 'true');
        });

        it('no muestra asterisco cuando required es false', () => {
            render(<Input label="Campo opcional" />);
            expect(screen.queryByText('*')).not.toBeInTheDocument();
        });
    });

    // ============ Error State ============

    describe('Estado de error', () => {
        it('muestra mensaje de error', () => {
            render(<Input label="Email" error="Email inválido" />);
            expect(screen.getByRole('alert')).toHaveTextContent('Email inválido');
        });

        it('establece aria-invalid cuando hay error', () => {
            render(<Input label="Email" error="Error" />);
            expect(screen.getByLabelText('Email')).toHaveAttribute('aria-invalid', 'true');
        });

        it('establece aria-describedby al mensaje de error', () => {
            render(<Input label="Email" error="Error" id="email" />);
            const input = screen.getByLabelText('Email');
            expect(input).toHaveAttribute('aria-describedby', 'email-error');
        });

        it('aplica estilos de error al input', () => {
            render(<Input label="Email" error="Error" />);
            const input = screen.getByLabelText('Email');
            expect(input.className).toContain('border-red-400');
        });
    });

    // ============ Helper Text ============

    describe('Texto de ayuda', () => {
        it('muestra helperText cuando no hay error', () => {
            render(<Input label="Password" helperText="Mínimo 8 caracteres" />);
            expect(screen.getByText('Mínimo 8 caracteres')).toBeInTheDocument();
        });

        it('oculta helperText cuando hay error', () => {
            render(<Input label="Password" helperText="Mínimo 8 caracteres" error="Muy corto" />);
            expect(screen.queryByText('Mínimo 8 caracteres')).not.toBeInTheDocument();
            expect(screen.getByText('Muy corto')).toBeInTheDocument();
        });
    });

    // ============ Disabled State ============

    describe('Estado deshabilitado', () => {
        it('deshabilita el input cuando disabled es true', () => {
            render(<Input label="Disabled" disabled />);
            expect(screen.getByLabelText('Disabled')).toBeDisabled();
        });

        it('aplica estilos de disabled', () => {
            render(<Input label="Disabled" disabled />);
            const input = screen.getByLabelText('Disabled');
            expect(input.className).toContain('cursor-not-allowed');
        });
    });

    // ============ User Interaction ============

    describe('Interacción de usuario', () => {
        it('permite escribir en el input', () => {
            render(<Input label="Name" />);
            const input = screen.getByLabelText('Name');
            fireEvent.change(input, { target: { value: 'Juan' } });
            expect(input).toHaveValue('Juan');
        });

        it('ejecuta onChange cuando se modifica', () => {
            const handleChange = jest.fn();
            render(<Input label="Name" onChange={handleChange} />);
            const input = screen.getByLabelText('Name');
            fireEvent.change(input, { target: { value: 'a' } });
            expect(handleChange).toHaveBeenCalled();
        });
    });

    // ============ Props Forwarding ============

    describe('Paso de props', () => {
        it('acepta type prop', () => {
            render(<Input label="Password" type="password" />);
            expect(screen.getByLabelText('Password')).toHaveAttribute('type', 'password');
        });

        it('acepta placeholder prop', () => {
            render(<Input label="Email" placeholder="ejemplo@mail.com" />);
            expect(screen.getByPlaceholderText('ejemplo@mail.com')).toBeInTheDocument();
        });

        it('acepta className personalizado', () => {
            render(<Input label="Custom" className="my-custom-class" />);
            const input = screen.getByLabelText('Custom');
            expect(input.className).toContain('my-custom-class');
        });
    });

    // ============ Accessibility ============

    describe('Accesibilidad', () => {
        it('no tiene aria-invalid cuando no hay error', () => {
            render(<Input label="Valid" />);
            expect(screen.getByLabelText('Valid')).toHaveAttribute('aria-invalid', 'false');
        });

        it('el mensaje de error tiene role alert', () => {
            render(<Input label="Error Field" error="Error message" />);
            expect(screen.getByRole('alert')).toBeInTheDocument();
        });
    });
});
