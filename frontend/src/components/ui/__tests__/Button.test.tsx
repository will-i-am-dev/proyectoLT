import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from '../Button';

describe('Button Component', () => {
    // ============ Rendering Tests ============

    describe('Renderizado básico', () => {
        it('renderiza el botón con texto children', () => {
            render(<Button>Click me</Button>);
            expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument();
        });

        it('renderiza con displayName correcto', () => {
            expect(Button.displayName).toBe('Button');
        });
    });

    // ============ Variant Tests ============

    describe('Variantes', () => {
        it('aplica estilos de variante primary por defecto', () => {
            render(<Button>Primary</Button>);
            const button = screen.getByRole('button');
            expect(button.className).toContain('from-blue-600');
        });

        it('aplica estilos de variante secondary', () => {
            render(<Button variant="secondary">Secondary</Button>);
            const button = screen.getByRole('button');
            expect(button.className).toContain('from-amber-500');
        });

        it('aplica estilos de variante outline', () => {
            render(<Button variant="outline">Outline</Button>);
            const button = screen.getByRole('button');
            expect(button.className).toContain('border-blue-600');
        });

        it('aplica estilos de variante ghost', () => {
            render(<Button variant="ghost">Ghost</Button>);
            const button = screen.getByRole('button');
            expect(button.className).toContain('text-gray-600');
        });
    });

    // ============ Size Tests ============

    describe('Tamaños', () => {
        it('aplica tamaño md por defecto', () => {
            render(<Button>Medium</Button>);
            const button = screen.getByRole('button');
            expect(button.className).toContain('px-6');
        });

        it('aplica tamaño sm', () => {
            render(<Button size="sm">Small</Button>);
            const button = screen.getByRole('button');
            expect(button.className).toContain('px-4');
        });

        it('aplica tamaño lg', () => {
            render(<Button size="lg">Large</Button>);
            const button = screen.getByRole('button');
            expect(button.className).toContain('px-8');
        });
    });

    // ============ State Tests ============

    describe('Estados', () => {
        it('deshabilita el botón cuando disabled es true', () => {
            render(<Button disabled>Disabled</Button>);
            expect(screen.getByRole('button')).toBeDisabled();
        });

        it('deshabilita el botón cuando isLoading es true', () => {
            render(<Button isLoading>Loading</Button>);
            expect(screen.getByRole('button')).toBeDisabled();
        });

        it('muestra spinner cuando isLoading es true', () => {
            render(<Button isLoading>Loading</Button>);
            const button = screen.getByRole('button');
            const spinner = button.querySelector('svg.animate-spin');
            expect(spinner).toBeInTheDocument();
        });

        it('establece aria-busy cuando isLoading es true', () => {
            render(<Button isLoading>Loading</Button>);
            expect(screen.getByRole('button')).toHaveAttribute('aria-busy', 'true');
        });

        it('aplica clase fullWidth cuando es true', () => {
            render(<Button fullWidth>Full Width</Button>);
            const button = screen.getByRole('button');
            expect(button.className).toContain('w-full');
        });
    });

    // ============ Event Tests ============

    describe('Eventos', () => {
        it('ejecuta onClick cuando se hace click', () => {
            const handleClick = jest.fn();
            render(<Button onClick={handleClick}>Click</Button>);
            fireEvent.click(screen.getByRole('button'));
            expect(handleClick).toHaveBeenCalledTimes(1);
        });

        it('no ejecuta onClick cuando está disabled', () => {
            const handleClick = jest.fn();
            render(<Button onClick={handleClick} disabled>Disabled</Button>);
            fireEvent.click(screen.getByRole('button'));
            expect(handleClick).not.toHaveBeenCalled();
        });

        it('no ejecuta onClick cuando isLoading', () => {
            const handleClick = jest.fn();
            render(<Button onClick={handleClick} isLoading>Loading</Button>);
            fireEvent.click(screen.getByRole('button'));
            expect(handleClick).not.toHaveBeenCalled();
        });
    });

    // ============ Styling Tests ============

    describe('Estilos adicionales', () => {
        it('aplica className personalizado', () => {
            render(<Button className="custom-class">Custom</Button>);
            const button = screen.getByRole('button');
            expect(button.className).toContain('custom-class');
        });

        it('pasa props adicionales al elemento button', () => {
            render(<Button data-testid="test-button" type="submit">Submit</Button>);
            const button = screen.getByTestId('test-button');
            expect(button).toHaveAttribute('type', 'submit');
        });
    });
});
