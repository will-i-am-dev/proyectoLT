import { ReactNode } from 'react';

interface CardProps {
    children: ReactNode;
    className?: string;
    variant?: 'default' | 'elevated' | 'outlined' | 'glass';
    padding?: 'none' | 'sm' | 'md' | 'lg';
}

const variantStyles = {
    default: 'bg-white border border-gray-100',
    elevated: 'bg-white shadow-xl shadow-gray-200/50',
    outlined: 'bg-transparent border-2 border-gray-200',
    glass: 'bg-white/80 backdrop-blur-sm border border-white/20 shadow-xl',
};

const paddingStyles = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
};

/**
 * Card container con múltiples variantes
 */
export function Card({
    children,
    className = '',
    variant = 'default',
    padding = 'md',
}: CardProps) {
    return (
        <div
            className={`
        rounded-2xl transition-all duration-200
        ${variantStyles[variant]}
        ${paddingStyles[padding]}
        ${className}
      `}
        >
            {children}
        </div>
    );
}

/**
 * Card header
 */
export function CardHeader({
    children,
    className = '',
}: {
    children: ReactNode;
    className?: string;
}) {
    return (
        <div className={`border-b border-gray-100 pb-4 mb-4 ${className}`}>
            {children}
        </div>
    );
}

/**
 * Card title
 */
export function CardTitle({
    children,
    className = '',
}: {
    children: ReactNode;
    className?: string;
}) {
    return (
        <h3 className={`text-xl font-bold text-gray-900 ${className}`}>
            {children}
        </h3>
    );
}

/**
 * Card content
 */
export function CardContent({
    children,
    className = '',
}: {
    children: ReactNode;
    className?: string;
}) {
    return <div className={className}>{children}</div>;
}

/**
 * Card footer
 */
export function CardFooter({
    children,
    className = '',
}: {
    children: ReactNode;
    className?: string;
}) {
    return (
        <div className={`border-t border-gray-100 pt-4 mt-4 ${className}`}>
            {children}
        </div>
    );
}
