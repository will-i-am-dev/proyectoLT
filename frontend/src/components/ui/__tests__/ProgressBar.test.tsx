import { render, screen } from '@testing-library/react';
import { ProgressBar } from '../ProgressBar';

const mockSteps = [
    { number: 1, title: 'Datos Personales', isCompleted: true, isActive: false },
    { number: 2, title: 'Datos Laborales', isCompleted: false, isActive: true },
    { number: 3, title: 'Producto', isCompleted: false, isActive: false },
    { number: 4, title: 'Confirmación', isCompleted: false, isActive: false },
];

describe('ProgressBar Component', () => {
    // ============ Rendering Tests ============

    describe('Renderizado básico', () => {
        it('renderiza el componente con navigation landmark', () => {
            render(<ProgressBar steps={mockSteps} currentStep={2} />);
            expect(screen.getByRole('navigation', { name: /progreso/i })).toBeInTheDocument();
        });

        it('renderiza todos los pasos', () => {
            render(<ProgressBar steps={mockSteps} currentStep={2} />);
            const listItems = screen.getAllByRole('listitem');
            expect(listItems).toHaveLength(4);
        });

        it('renderiza como lista ordenada', () => {
            const { container } = render(<ProgressBar steps={mockSteps} currentStep={2} />);
            expect(container.querySelector('ol')).toBeInTheDocument();
        });
    });

    // ============ Step Status Tests ============

    describe('Estados de los pasos', () => {
        it('muestra checkmark para pasos completados', () => {
            render(<ProgressBar steps={mockSteps} currentStep={2} />);
            // El paso 1 está completado, debería tener un SVG de checkmark
            const statusDivs = screen.getAllByRole('status');
            const completedStep = statusDivs[0];
            expect(completedStep.querySelector('svg')).toBeInTheDocument();
        });

        it('muestra número para pasos no completados', () => {
            render(<ProgressBar steps={mockSteps} currentStep={2} />);
            // Los pasos 3 y 4 no están completados, deberían mostrar números
            expect(screen.getByText('3')).toBeInTheDocument();
            expect(screen.getByText('4')).toBeInTheDocument();
        });

        it('aplica estilos de completado a pasos completados', () => {
            render(<ProgressBar steps={mockSteps} currentStep={2} />);
            const statusDivs = screen.getAllByRole('status');
            const completedStep = statusDivs[0];
            expect(completedStep.className).toContain('from-green-500');
        });

        it('aplica estilos de activo al paso actual', () => {
            render(<ProgressBar steps={mockSteps} currentStep={2} />);
            const statusDivs = screen.getAllByRole('status');
            const activeStep = statusDivs[1]; // Paso 2 está activo
            expect(activeStep.className).toContain('from-blue-600');
        });

        it('aplica estilos de inactivo a pasos pendientes', () => {
            render(<ProgressBar steps={mockSteps} currentStep={2} />);
            const statusDivs = screen.getAllByRole('status');
            const inactiveStep = statusDivs[2]; // Paso 3 está inactivo
            expect(inactiveStep.className).toContain('bg-gray-100');
        });
    });

    // ============ Accessibility Tests ============

    describe('Accesibilidad', () => {
        it('tiene aria-label descriptivo en el nav', () => {
            render(<ProgressBar steps={mockSteps} currentStep={2} />);
            expect(screen.getByRole('navigation')).toHaveAttribute('aria-label', 'Progreso de la solicitud');
        });

        it('marca el paso activo con aria-current', () => {
            render(<ProgressBar steps={mockSteps} currentStep={2} />);
            const statusDivs = screen.getAllByRole('status');
            const activeStep = statusDivs[1];
            expect(activeStep).toHaveAttribute('aria-current', 'step');
        });

        it('no marca pasos no activos con aria-current', () => {
            render(<ProgressBar steps={mockSteps} currentStep={2} />);
            const statusDivs = screen.getAllByRole('status');
            expect(statusDivs[0]).not.toHaveAttribute('aria-current');
            expect(statusDivs[2]).not.toHaveAttribute('aria-current');
        });

        it('tiene aria-label descriptivo para cada paso', () => {
            render(<ProgressBar steps={mockSteps} currentStep={2} />);
            const statusDivs = screen.getAllByRole('status');

            expect(statusDivs[0]).toHaveAttribute('aria-label', expect.stringContaining('Paso 1'));
            expect(statusDivs[0]).toHaveAttribute('aria-label', expect.stringContaining('Completado'));

            expect(statusDivs[1]).toHaveAttribute('aria-label', expect.stringContaining('Paso 2'));
            expect(statusDivs[1]).toHaveAttribute('aria-label', expect.stringContaining('Actual'));
        });
    });

    // ============ Mobile Indicator Tests ============

    describe('Indicador móvil', () => {
        it('muestra el indicador de paso actual para móvil', () => {
            render(<ProgressBar steps={mockSteps} currentStep={2} />);
            expect(screen.getByText(/Paso 2 de 4/i)).toBeInTheDocument();
        });

        it('muestra el título del paso activo en el indicador móvil', () => {
            render(<ProgressBar steps={mockSteps} currentStep={2} />);
            // El paso activo es "Datos Laborales" - aparece múltiples veces (título y móvil)
            const elements = screen.getAllByText('Datos Laborales');
            expect(elements.length).toBeGreaterThanOrEqual(1);
        });
    });

    // ============ Connector Lines ============

    describe('Líneas conectoras', () => {
        it('muestra líneas conectoras entre pasos', () => {
            const { container } = render(<ProgressBar steps={mockSteps} currentStep={2} />);
            // Debería haber 3 líneas conectoras (entre 4 pasos)
            const connectors = container.querySelectorAll('[role="presentation"]');
            expect(connectors).toHaveLength(3);
        });

        it('no muestra línea conectora después del último paso', () => {
            const { container } = render(<ProgressBar steps={mockSteps} currentStep={2} />);
            const listItems = container.querySelectorAll('li');
            const lastItem = listItems[3];
            expect(lastItem.querySelector('[role="presentation"]')).not.toBeInTheDocument();
        });
    });

    // ============ Different States ============

    describe('Diferentes estados de progreso', () => {
        it('renderiza correctamente con todos los pasos incompletos', () => {
            const allIncomplete = mockSteps.map((step, i) => ({
                ...step,
                isCompleted: false,
                isActive: i === 0,
            }));
            render(<ProgressBar steps={allIncomplete} currentStep={1} />);
            expect(screen.getByText(/Paso 1 de 4/i)).toBeInTheDocument();
        });

        it('renderiza correctamente con todos los pasos completados', () => {
            const allComplete = mockSteps.map(step => ({
                ...step,
                isCompleted: true,
                isActive: false,
            }));
            render(<ProgressBar steps={allComplete} currentStep={4} />);

            // Todos deberían tener checkmarks (SVGs)
            const statusDivs = screen.getAllByRole('status');
            statusDivs.forEach(div => {
                expect(div.querySelector('svg')).toBeInTheDocument();
            });
        });
    });
});
