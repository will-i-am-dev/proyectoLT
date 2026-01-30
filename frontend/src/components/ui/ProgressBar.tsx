interface Step {
    number: number;
    title: string;
    isCompleted: boolean;
    isActive: boolean;
}

interface ProgressBarProps {
    steps: Step[];
    currentStep: number;
}

/**
 * Barra de progreso del formulario multipaso
 * Accesible con aria-labels y semántica correcta
 */
export function ProgressBar({ steps, currentStep }: ProgressBarProps) {
    return (
        <nav aria-label="Progreso de la solicitud" className="w-full">
            <ol className="flex items-center justify-between">
                {steps.map((step, index) => {
                    const isLast = index === steps.length - 1;

                    return (
                        <li
                            key={step.number}
                            className={`flex items-center ${!isLast ? 'flex-1' : ''}`}
                        >
                            {/* Step Circle */}
                            <div className="flex flex-col items-center">
                                <div
                                    role="status"
                                    aria-current={step.isActive ? 'step' : undefined}
                                    aria-label={`Paso ${step.number}: ${step.title}${step.isCompleted ? ' - Completado' : step.isActive ? ' - Actual' : ''
                                        }`}
                                    className={`
                    w-10 h-10 rounded-full flex items-center justify-center
                    font-bold text-sm transition-all duration-300
                    ${step.isCompleted
                                            ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg shadow-green-500/30'
                                            : step.isActive
                                                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/30 ring-4 ring-blue-100'
                                                : 'bg-gray-100 text-gray-400'
                                        }
                  `}
                                >
                                    {step.isCompleted ? (
                                        <svg
                                            className="w-5 h-5"
                                            fill="currentColor"
                                            viewBox="0 0 20 20"
                                            aria-hidden="true"
                                        >
                                            <path
                                                fillRule="evenodd"
                                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                                clipRule="evenodd"
                                            />
                                        </svg>
                                    ) : (
                                        step.number
                                    )}
                                </div>

                                {/* Step Title (hidden on mobile) */}
                                <span
                                    className={`
                    hidden md:block mt-2 text-xs font-medium text-center max-w-20
                    ${step.isActive ? 'text-blue-600' : step.isCompleted ? 'text-green-600' : 'text-gray-400'}
                  `}
                                >
                                    {step.title}
                                </span>
                            </div>

                            {/* Connector Line */}
                            {!isLast && (
                                <div className="flex-1 mx-3 h-1 rounded-full bg-gray-100 overflow-hidden">
                                    <div
                                        className={`
                      h-full transition-all duration-500 ease-out
                      ${step.isCompleted
                                                ? 'w-full bg-gradient-to-r from-green-500 to-emerald-500'
                                                : 'w-0'
                                            }
                    `}
                                        role="presentation"
                                    />
                                </div>
                            )}
                        </li>
                    );
                })}
            </ol>

            {/* Mobile step indicator */}
            <div className="md:hidden mt-4 text-center">
                <span className="text-sm text-gray-600">
                    Paso {currentStep} de {steps.length}:
                </span>
                <span className="ml-1 text-sm font-semibold text-blue-600">
                    {steps.find(s => s.isActive)?.title}
                </span>
            </div>
        </nav>
    );
}
