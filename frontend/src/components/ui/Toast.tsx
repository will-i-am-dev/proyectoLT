import React from 'react';

interface ToastProps {
    message: string;
    type?: 'success' | 'error';
    onClose: () => void;
}

export function Toast({ message, type = 'error', onClose }: ToastProps) {
    const isError = type === 'error';
    const borderColor = isError ? 'border-red-500' : 'border-green-500';
    const iconColor = isError ? 'text-red-500' : 'text-green-500';
    const title = isError ? 'Ha ocurrido un error' : 'Éxito';

    return (
        <div
            role="alert"
            className="fixed top-24 right-4 z-[100] max-w-md w-full animate-in slide-in-from-top-5 fade-in duration-300 pointer-events-auto"
        >
            <div className={`bg-white border-l-4 ${borderColor} rounded-lg shadow-2xl p-4 flex items-start gap-3`}>
                <div className={`flex-shrink-0 ${iconColor}`}>
                    {isError ? (
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    ) : (
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                    )}
                </div>
                <div className="flex-1">
                    <h3 className="text-sm font-bold text-gray-900">{title}</h3>
                    <p className="text-sm text-gray-600 mt-1 whitespace-pre-line">{message}</p>
                </div>
                <button
                    onClick={onClose}
                    className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
                    aria-label="Cerrar alerta"
                >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>
        </div>
    );
}
