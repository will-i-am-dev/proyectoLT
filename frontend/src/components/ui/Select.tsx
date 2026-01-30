'use client';

import { forwardRef, SelectHTMLAttributes, useId } from 'react';

interface SelectOption {
    value: string;
    label: string;
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
    label: string;
    options: SelectOption[];
    error?: string;
    helperText?: string;
    placeholder?: string;
}

/**
 * Select accesible con label, error y helper text
 */
export const Select = forwardRef<HTMLSelectElement, SelectProps>(
    ({ label, options, error, helperText, placeholder, className = '', id: providedId, ...props }, ref) => {
        const generatedId = useId();
        const id = providedId || generatedId;
        const errorId = `${id}-error`;
        const helperId = `${id}-helper`;

        const describedBy = [
            error ? errorId : null,
            helperText ? helperId : null,
        ].filter(Boolean).join(' ') || undefined;

        return (
            <div className="flex flex-col gap-1.5">
                <label
                    htmlFor={id}
                    className="text-sm font-medium text-gray-700"
                >
                    {label}
                    {props.required && (
                        <span className="text-red-500 ml-1" aria-hidden="true">*</span>
                    )}
                </label>

                <div className="relative">
                    <select
                        ref={ref}
                        id={id}
                        aria-invalid={error ? 'true' : 'false'}
                        aria-describedby={describedBy}
                        className={`
              w-full px-4 py-3 rounded-xl border transition-all duration-200 appearance-none
              focus:outline-none focus:ring-2 focus:ring-offset-1 cursor-pointer
              ${error
                                ? 'border-red-400 focus:ring-red-400 bg-red-50'
                                : 'border-gray-200 focus:ring-blue-500 focus:border-blue-500 hover:border-gray-300'
                            }
              ${props.disabled ? 'bg-gray-100 cursor-not-allowed opacity-60' : 'bg-white'}
              ${className}
            `}
                        {...props}
                    >
                        {placeholder && (
                            <option value="" disabled>
                                {placeholder}
                            </option>
                        )}
                        {options.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>

                    {/* Chevron icon */}
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                        <svg
                            className="w-5 h-5 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            aria-hidden="true"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 9l-7 7-7-7"
                            />
                        </svg>
                    </div>
                </div>

                {helperText && !error && (
                    <p id={helperId} className="text-xs text-gray-500">
                        {helperText}
                    </p>
                )}

                {error && (
                    <p
                        id={errorId}
                        role="alert"
                        className="text-xs text-red-600 flex items-center gap-1"
                    >
                        <svg
                            className="w-3.5 h-3.5"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                            aria-hidden="true"
                        >
                            <path
                                fillRule="evenodd"
                                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                                clipRule="evenodd"
                            />
                        </svg>
                        {error}
                    </p>
                )}
            </div>
        );
    }
);

Select.displayName = 'Select';
