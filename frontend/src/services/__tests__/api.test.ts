/**
 * Tests para el cliente API
 */

import { apiClient, api } from '../api';

// Mock global de fetch
const mockFetch = jest.fn();
global.fetch = mockFetch;

describe('API Client', () => {
    beforeEach(() => {
        mockFetch.mockClear();
    });

    // ============ Success Cases ============

    describe('Casos exitosos', () => {
        it('realiza una petición GET exitosa', async () => {
            const mockData = { id: '1', name: 'Test' };
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve(mockData),
            });

            const result = await api.get('/test');

            expect(mockFetch).toHaveBeenCalledWith(
                expect.stringContaining('/test'),
                expect.objectContaining({
                    method: 'GET',
                    headers: expect.objectContaining({
                        'Content-Type': 'application/json',
                    }),
                })
            );
            expect(result).toEqual(mockData);
        });

        it('realiza una petición POST exitosa', async () => {
            const mockData = { id: '1', created: true };
            const postData = { name: 'New Item' };
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve(mockData),
            });

            const result = await api.post('/test', postData);

            expect(mockFetch).toHaveBeenCalledWith(
                expect.stringContaining('/test'),
                expect.objectContaining({
                    method: 'POST',
                    body: JSON.stringify(postData),
                })
            );
            expect(result).toEqual(mockData);
        });

        it('realiza una petición PATCH exitosa', async () => {
            const mockData = { id: '1', updated: true };
            const patchData = { name: 'Updated' };
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve(mockData),
            });

            const result = await api.patch('/test/1', patchData);

            expect(mockFetch).toHaveBeenCalledWith(
                expect.stringContaining('/test/1'),
                expect.objectContaining({
                    method: 'PATCH',
                    body: JSON.stringify(patchData),
                })
            );
            expect(result).toEqual(mockData);
        });

        it('realiza una petición DELETE exitosa', async () => {
            const mockData = { deleted: true };
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve(mockData),
            });

            const result = await api.delete('/test/1');

            expect(mockFetch).toHaveBeenCalledWith(
                expect.stringContaining('/test/1'),
                expect.objectContaining({
                    method: 'DELETE',
                })
            );
            expect(result).toEqual(mockData);
        });
    });

    // ============ Error Cases ============

    describe('Manejo de errores', () => {
        it('lanza error cuando la respuesta no es ok', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: false,
                status: 404,
                json: () => Promise.resolve({ message: 'No encontrado' }),
            });

            await expect(api.get('/not-found')).rejects.toThrow('No encontrado');
        });

        it('lanza error con status cuando no hay mensaje', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: false,
                status: 500,
                json: () => Promise.reject(new Error('Cannot parse')),
            });

            await expect(api.get('/error')).rejects.toThrow('Error de servidor');
        });

        it('lanza error de conexión cuando fetch falla', async () => {
            mockFetch.mockRejectedValueOnce(new TypeError('Network error'));

            await expect(api.get('/network-fail')).rejects.toThrow();
        });
    });

    // ============ Timeout Tests ============

    describe('Timeout', () => {
        it('incluye signal de AbortController en las peticiones', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve({}),
            });

            await api.get('/test');

            expect(mockFetch).toHaveBeenCalledWith(
                expect.any(String),
                expect.objectContaining({
                    signal: expect.any(AbortSignal),
                })
            );
        });
    });

    // ============ Headers ============

    describe('Headers', () => {
        it('incluye Content-Type application/json', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve({}),
            });

            await api.get('/test');

            expect(mockFetch).toHaveBeenCalledWith(
                expect.any(String),
                expect.objectContaining({
                    headers: expect.objectContaining({
                        'Content-Type': 'application/json',
                    }),
                })
            );
        });

        it('permite agregar headers personalizados', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve({}),
            });

            await apiClient('/test', {
                headers: {
                    'Authorization': 'Bearer token123',
                },
            });

            expect(mockFetch).toHaveBeenCalledWith(
                expect.any(String),
                expect.objectContaining({
                    headers: expect.objectContaining({
                        'Authorization': 'Bearer token123',
                    }),
                })
            );
        });
    });

    // ============ URL Construction ============

    describe('Construcción de URL', () => {
        it('construye la URL correctamente con el prefijo', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve({}),
            });

            await api.get('/solicitudes');

            expect(mockFetch).toHaveBeenCalledWith(
                expect.stringContaining('/solicitudes'),
                expect.any(Object)
            );
        });
    });
});
