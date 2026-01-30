/**
 * Configuración del cliente HTTP
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

interface RequestOptions extends RequestInit {
    timeout?: number;
}

interface ApiError {
    message: string;
    statusCode: number;
    error?: string;
}

/**
 * Cliente HTTP para comunicación con el backend
 */
export async function apiClient<T>(
    endpoint: string,
    options: RequestOptions = {}
): Promise<T> {
    const { timeout = 10000, ...fetchOptions } = options;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    const url = `${API_BASE_URL}${endpoint}`;

    try {
        const response = await fetch(url, {
            ...fetchOptions,
            signal: controller.signal,
            headers: {
                'Content-Type': 'application/json',
                ...fetchOptions.headers,
            },
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
            const errorData: ApiError | any = await response.json().catch(() => ({
                message: 'Error de servidor',
                statusCode: response.status,
            }));

            let errorMessage = errorData.message || `Error ${response.status}`;
            if (Array.isArray(errorMessage)) {
                errorMessage = errorMessage.join('\n');
            }

            throw new Error(errorMessage);
        }

        return response.json();
    } catch (error) {
        clearTimeout(timeoutId);

        if (error instanceof Error) {
            if (error.name === 'AbortError') {
                throw new Error('La solicitud ha excedido el tiempo de espera');
            }
            throw error;
        }

        throw new Error('Error de conexión');
    }
}

/**
 * Métodos HTTP helper
 */
export const api = {
    get: <T>(endpoint: string) =>
        apiClient<T>(endpoint, { method: 'GET' }),

    post: <T>(endpoint: string, data: unknown) =>
        apiClient<T>(endpoint, {
            method: 'POST',
            body: JSON.stringify(data),
        }),

    patch: <T>(endpoint: string, data: unknown) =>
        apiClient<T>(endpoint, {
            method: 'PATCH',
            body: JSON.stringify(data),
        }),

    delete: <T>(endpoint: string) =>
        apiClient<T>(endpoint, { method: 'DELETE' }),
};
