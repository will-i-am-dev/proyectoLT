import { render, screen } from '@testing-library/react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../Card';

describe('Card Component', () => {
    // ============ Card Base ============

    describe('Card', () => {
        it('renderiza children correctamente', () => {
            render(<Card>Card Content</Card>);
            expect(screen.getByText('Card Content')).toBeInTheDocument();
        });

        describe('Variantes', () => {
            it('aplica variante default por defecto', () => {
                const { container } = render(<Card>Default</Card>);
                expect(container.firstChild).toHaveClass('bg-white');
                expect(container.firstChild).toHaveClass('border-gray-100');
            });

            it('aplica variante elevated', () => {
                const { container } = render(<Card variant="elevated">Elevated</Card>);
                expect(container.firstChild).toHaveClass('shadow-xl');
            });

            it('aplica variante outlined', () => {
                const { container } = render(<Card variant="outlined">Outlined</Card>);
                expect(container.firstChild).toHaveClass('border-2');
            });

            it('aplica variante glass', () => {
                const { container } = render(<Card variant="glass">Glass</Card>);
                expect(container.firstChild).toHaveClass('backdrop-blur-sm');
            });
        });

        describe('Padding', () => {
            it('aplica padding md por defecto', () => {
                const { container } = render(<Card>Default Padding</Card>);
                expect(container.firstChild).toHaveClass('p-6');
            });

            it('aplica padding none', () => {
                const { container } = render(<Card padding="none">No Padding</Card>);
                expect(container.firstChild).not.toHaveClass('p-4');
                expect(container.firstChild).not.toHaveClass('p-6');
                expect(container.firstChild).not.toHaveClass('p-8');
            });

            it('aplica padding sm', () => {
                const { container } = render(<Card padding="sm">Small</Card>);
                expect(container.firstChild).toHaveClass('p-4');
            });

            it('aplica padding lg', () => {
                const { container } = render(<Card padding="lg">Large</Card>);
                expect(container.firstChild).toHaveClass('p-8');
            });
        });

        it('acepta className personalizado', () => {
            const { container } = render(<Card className="custom-class">Custom</Card>);
            expect(container.firstChild).toHaveClass('custom-class');
        });

        it('aplica estilos base de transición y bordes redondeados', () => {
            const { container } = render(<Card>Base Styles</Card>);
            expect(container.firstChild).toHaveClass('rounded-2xl');
            expect(container.firstChild).toHaveClass('transition-all');
        });
    });

    // ============ CardHeader ============

    describe('CardHeader', () => {
        it('renderiza children correctamente', () => {
            render(<CardHeader>Header Content</CardHeader>);
            expect(screen.getByText('Header Content')).toBeInTheDocument();
        });

        it('aplica estilos de borde inferior', () => {
            const { container } = render(<CardHeader>Header</CardHeader>);
            expect(container.firstChild).toHaveClass('border-b');
            expect(container.firstChild).toHaveClass('border-gray-100');
        });

        it('acepta className personalizado', () => {
            const { container } = render(<CardHeader className="custom-header">Header</CardHeader>);
            expect(container.firstChild).toHaveClass('custom-header');
        });
    });

    // ============ CardTitle ============

    describe('CardTitle', () => {
        it('renderiza children como h3', () => {
            render(<CardTitle>Title</CardTitle>);
            const title = screen.getByRole('heading', { level: 3 });
            expect(title).toHaveTextContent('Title');
        });

        it('aplica estilos de título', () => {
            render(<CardTitle>Title</CardTitle>);
            const title = screen.getByRole('heading', { level: 3 });
            expect(title).toHaveClass('text-xl');
            expect(title).toHaveClass('font-bold');
        });

        it('acepta className personalizado', () => {
            render(<CardTitle className="custom-title">Title</CardTitle>);
            const title = screen.getByRole('heading', { level: 3 });
            expect(title).toHaveClass('custom-title');
        });
    });

    // ============ CardContent ============

    describe('CardContent', () => {
        it('renderiza children correctamente', () => {
            render(<CardContent>Content</CardContent>);
            expect(screen.getByText('Content')).toBeInTheDocument();
        });

        it('acepta className personalizado', () => {
            const { container } = render(<CardContent className="custom-content">Content</CardContent>);
            expect(container.firstChild).toHaveClass('custom-content');
        });
    });

    // ============ CardFooter ============

    describe('CardFooter', () => {
        it('renderiza children correctamente', () => {
            render(<CardFooter>Footer Content</CardFooter>);
            expect(screen.getByText('Footer Content')).toBeInTheDocument();
        });

        it('aplica estilos de borde superior', () => {
            const { container } = render(<CardFooter>Footer</CardFooter>);
            expect(container.firstChild).toHaveClass('border-t');
            expect(container.firstChild).toHaveClass('border-gray-100');
        });

        it('acepta className personalizado', () => {
            const { container } = render(<CardFooter className="custom-footer">Footer</CardFooter>);
            expect(container.firstChild).toHaveClass('custom-footer');
        });
    });

    // ============ Composition ============

    describe('Composición', () => {
        it('permite componer Card con todos sus subcomponentes', () => {
            render(
                <Card>
                    <CardHeader>
                        <CardTitle>Card Title</CardTitle>
                    </CardHeader>
                    <CardContent>Card Body</CardContent>
                    <CardFooter>Card Footer</CardFooter>
                </Card>
            );

            expect(screen.getByRole('heading', { name: 'Card Title' })).toBeInTheDocument();
            expect(screen.getByText('Card Body')).toBeInTheDocument();
            expect(screen.getByText('Card Footer')).toBeInTheDocument();
        });
    });
});
