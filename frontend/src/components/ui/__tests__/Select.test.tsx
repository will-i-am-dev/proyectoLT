import { render, screen, fireEvent } from '@testing-library/react';
import { Select } from '../Select';

const mockOptions = [
    { value: 'option1', label: 'Option 1' },
    { value: 'option2', label: 'Option 2' },
    { value: 'option3', label: 'Option 3' },
];

describe('Select Component', () => {
    // ============ Rendering Tests ============

    describe('Renderizado básico', () => {
        it('renderiza el select con label', () => {
            render(<Select label="Tipo" options={mockOptions} />);
            expect(screen.getByLabelText('Tipo')).toBeInTheDocument();
        });

        it('renderiza con displayName correcto', () => {
            expect(Select.displayName).toBe('Select');
        });

        it('renderiza todas las opciones', () => {
            render(<Select label="Opciones" options={mockOptions} />);
            mockOptions.forEach(option => {
                expect(screen.getByText(option.label)).toBeInTheDocument();
            });
        });

        it('asocia el label con el select por id', () => {
            render(<Select label="Selector" options={mockOptions} id="my-select" />);
            const select = screen.getByLabelText('Selector');
            expect(select).toHaveAttribute('id', 'my-select');
        });
    });

    // ============ Placeholder ============

    describe('Placeholder', () => {
        it('muestra placeholder cuando se proporciona', () => {
            render(<Select label="Tipo" options={mockOptions} placeholder="Seleccione..." />);
            expect(screen.getByText('Seleccione...')).toBeInTheDocument();
        });

        it('el placeholder está deshabilitado', () => {
            render(<Select label="Tipo" options={mockOptions} placeholder="Seleccione..." />);
            const placeholder = screen.getByText('Seleccione...');
            expect(placeholder).toBeDisabled();
        });
    });

    // ============ Required Indicator ============

    describe('Indicador requerido', () => {
        it('muestra asterisco cuando required es true', () => {
            render(<Select label="Campo requerido" options={mockOptions} required />);
            const asterisk = screen.getByText('*');
            expect(asterisk).toBeInTheDocument();
        });

        it('no muestra asterisco cuando required es false', () => {
            render(<Select label="Campo opcional" options={mockOptions} />);
            expect(screen.queryByText('*')).not.toBeInTheDocument();
        });
    });

    // ============ Error State ============

    describe('Estado de error', () => {
        it('muestra mensaje de error', () => {
            render(<Select label="Tipo" options={mockOptions} error="Selección requerida" />);
            expect(screen.getByRole('alert')).toHaveTextContent('Selección requerida');
        });

        it('establece aria-invalid cuando hay error', () => {
            render(<Select label="Tipo" options={mockOptions} error="Error" />);
            expect(screen.getByLabelText('Tipo')).toHaveAttribute('aria-invalid', 'true');
        });

        it('aplica estilos de error al select', () => {
            render(<Select label="Tipo" options={mockOptions} error="Error" />);
            const select = screen.getByLabelText('Tipo');
            expect(select.className).toContain('border-red-400');
        });
    });

    // ============ Helper Text ============

    describe('Texto de ayuda', () => {
        it('muestra helperText cuando no hay error', () => {
            render(<Select label="Tipo" options={mockOptions} helperText="Seleccione una opción" />);
            expect(screen.getByText('Seleccione una opción')).toBeInTheDocument();
        });

        it('oculta helperText cuando hay error', () => {
            render(<Select label="Tipo" options={mockOptions} helperText="Ayuda" error="Error" />);
            expect(screen.queryByText('Ayuda')).not.toBeInTheDocument();
            expect(screen.getByText('Error')).toBeInTheDocument();
        });
    });

    // ============ Disabled State ============

    describe('Estado deshabilitado', () => {
        it('deshabilita el select cuando disabled es true', () => {
            render(<Select label="Disabled" options={mockOptions} disabled />);
            expect(screen.getByLabelText('Disabled')).toBeDisabled();
        });

        it('aplica estilos de disabled', () => {
            render(<Select label="Disabled" options={mockOptions} disabled />);
            const select = screen.getByLabelText('Disabled');
            expect(select.className).toContain('cursor-not-allowed');
        });
    });

    // ============ User Interaction ============

    describe('Interacción de usuario', () => {
        it('permite seleccionar una opción', () => {
            render(<Select label="Opciones" options={mockOptions} />);
            const select = screen.getByLabelText('Opciones');
            fireEvent.change(select, { target: { value: 'option2' } });
            expect(select).toHaveValue('option2');
        });

        it('ejecuta onChange cuando se selecciona', () => {
            const handleChange = jest.fn();
            render(<Select label="Opciones" options={mockOptions} onChange={handleChange} />);
            const select = screen.getByLabelText('Opciones');
            fireEvent.change(select, { target: { value: 'option1' } });
            expect(handleChange).toHaveBeenCalled();
        });
    });

    // ============ Props Forwarding ============

    describe('Paso de props', () => {
        it('acepta className personalizado', () => {
            render(<Select label="Custom" options={mockOptions} className="my-custom-class" />);
            const select = screen.getByLabelText('Custom');
            expect(select.className).toContain('my-custom-class');
        });

        it('acepta data attributes', () => {
            render(<Select label="Test" options={mockOptions} data-testid="test-select" />);
            expect(screen.getByTestId('test-select')).toBeInTheDocument();
        });
    });

    // ============ Accessibility ============

    describe('Accesibilidad', () => {
        it('no tiene aria-invalid cuando no hay error', () => {
            render(<Select label="Valid" options={mockOptions} />);
            expect(screen.getByLabelText('Valid')).toHaveAttribute('aria-invalid', 'false');
        });

        it('el mensaje de error tiene role alert', () => {
            render(<Select label="Error Field" options={mockOptions} error="Error message" />);
            expect(screen.getByRole('alert')).toBeInTheDocument();
        });

        it('tiene chevron icon para indicar dropdown', () => {
            render(<Select label="Dropdown" options={mockOptions} />);
            const svg = document.querySelector('svg[aria-hidden="true"]');
            expect(svg).toBeInTheDocument();
        });
    });
});
