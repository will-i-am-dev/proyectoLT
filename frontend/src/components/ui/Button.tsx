import { ButtonHTMLAttributes, forwardRef } from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: ButtonVariant;
    size?: ButtonSize;
    isLoading?: boolean;
    fullWidth?: boolean;
}

const variantStyles: Record<ButtonVariant, string> = {
    primary: `
    bg-gradient-to-r from-blue-600 to-indigo-600 text-white
    hover:from-blue-700 hover:to-indigo-700
    focus:ring-blue-500 shadow-lg shadow-blue-500/25
    active:scale-[0.98]
  `,
    secondary: `
    bg-gradient-to-r from-amber-500 to-orange-500 text-white
    hover:from-amber-600 hover:to-orange-600
    focus:ring-amber-500 shadow-lg shadow-amber-500/25
    active:scale-[0.98]
  `,
    outline: `
    border-2 border-blue-600 text-blue-600 bg-transparent
    hover:bg-blue-50 focus:ring-blue-500
    active:scale-[0.98]
  `,
    ghost: `
    text-gray-600 bg-transparent
    hover:bg-gray-100 focus:ring-gray-400
    active:scale-[0.98]
  `,
};

const sizeStyles: Record<ButtonSize, string> = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
};

/**
 * Botón accesible con múltiples variantes y estados
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    ({
        variant = 'primary',
        size = 'md',
        isLoading = false,
        fullWidth = false,
        className = '',
        disabled,
        children,
        ...props
    }, ref) => {
        const isDisabled = disabled || isLoading;

        return (
            <button
                ref={ref}
                disabled={isDisabled}
                aria-busy={isLoading}
                className={`
          inline-flex items-center justify-center gap-2
          font-semibold rounded-xl transition-all duration-200
          focus:outline-none focus:ring-2 focus:ring-offset-2
          ${variantStyles[variant]}
          ${sizeStyles[size]}
          ${fullWidth ? 'w-full' : ''}
          ${isDisabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}
          ${className}
        `}
                {...props}
            >
                {isLoading && (
                    <svg
                        className="animate-spin h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                    >
                        <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                        />
                        <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                    </svg>
                )}
                {children}
            </button>
        );
    }
);

Button.displayName = 'Button';
