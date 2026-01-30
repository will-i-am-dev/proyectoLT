# MuleSoft Core Mock API - Colección de Endpoints

Este documento contiene los cURLs para crear un Mock Server en Postman que simule la integración con el Core Bancario (MuleSoft).


---

## 1. Validar Cliente (HU-CORE-001)

**Endpoint:** `POST /clientes/validar`

### Request cURL

```bash
curl --location 'https://{{MOCK_SERVER_URL}}/clientes/validar' \
--header 'Content-Type: application/json' \
--header 'X-API-Key: mock-api-key-12345' \
--data '{
    "tipoDocumento": "CC",
    "numeroDocumento": "1234567890",
    "email": "juan.perez@email.com"
}'
```

### Response (200 OK) - Cliente Existente

```json
{
    "existe": true,
    "esClienteActual": true,
    "idClienteCore": "CLI-CORE-12345",
    "nombreCompleto": "Juan Pérez García",
    "estadoCliente": "ACTIVO"
}
```

### Response (200 OK) - Cliente Nuevo

```json
{
    "existe": false,
    "esClienteActual": false,
    "idClienteCore": null,
    "nombreCompleto": null,
    "estadoCliente": null
}
```

---

## 2. Consultar Centrales de Riesgo (HU-CORE-002)

**Endpoint:** `POST /centrales-riesgo/consultar`

### Request cURL

```bash
curl --location 'https://{{MOCK_SERVER_URL}}/centrales-riesgo/consultar' \
--header 'Content-Type: application/json' \
--header 'X-API-Key: mock-api-key-12345' \
--data '{
    "tipoDocumento": "CC",
    "numeroDocumento": "1234567890",
    "nombres": "Juan",
    "apellidos": "Pérez García"
}'
```

### Response (200 OK) - Score Bueno (Riesgo Bajo)

```json
{
    "scoreCredito": 780,
    "nivelRiesgo": "BAJO",
    "deudaActual": 5000000,
    "cupoDisponible": 15000000,
    "porcentajeEndeudamiento": 25,
    "numeroObligacionesActivas": 2,
    "morasUltimos12Meses": 0,
    "consultaExitosa": true
}
```

### Response (200 OK) - Score Medio

```json
{
    "scoreCredito": 620,
    "nivelRiesgo": "MEDIO",
    "deudaActual": 12000000,
    "cupoDisponible": 8000000,
    "porcentajeEndeudamiento": 55,
    "numeroObligacionesActivas": 4,
    "morasUltimos12Meses": 1,
    "consultaExitosa": true
}
```

### Response (200 OK) - Score Malo (Riesgo Alto)

```json
{
    "scoreCredito": 450,
    "nivelRiesgo": "ALTO",
    "deudaActual": 25000000,
    "cupoDisponible": 0,
    "porcentajeEndeudamiento": 85,
    "numeroObligacionesActivas": 7,
    "morasUltimos12Meses": 4,
    "consultaExitosa": true
}
```

---

## 3. Crear Solicitud en Core (HU-CORE-003)

**Endpoint:** `POST /solicitudes/crear`

### Request cURL

```bash
curl --location 'https://{{MOCK_SERVER_URL}}/solicitudes/crear' \
--header 'Content-Type: application/json' \
--header 'X-API-Key: mock-api-key-12345' \
--data '{
    "numeroSolicitud": "SOL-20260127-00001",
    "idClienteCore": "CLI-CORE-12345",
    "datosPersonales": {
        "nombres": "Juan",
        "apellidos": "Pérez García",
        "tipoDocumento": "CC",
        "numeroDocumento": "1234567890",
        "fechaNacimiento": "1990-05-15",
        "email": "juan.perez@email.com",
        "celular": "+573101234567"
    },
    "datosLaborales": {
        "situacionLaboral": "EMPLEADO",
        "nombreEmpresa": "Tech Solutions SAS",
        "cargoActual": "Ingeniero de Software",
        "ingresoMensual": 8000000,
        "antiguedadMeses": 36
    },
    "productoSolicitado": {
        "tipoTarjeta": "ORO",
        "cupoSolicitado": 15000000,
        "franquicia": "VISA"
    },
    "validaciones": {
        "scoreCredito": 780,
        "nivelRiesgo": "BAJO",
        "deudaActual": 5000000
    }
}'
```

### Response (201 Created) - Éxito

```json
{
    "exito": true,
    "idSolicitudCore": "SOL-CORE-2026-78901",
    "estadoCore": "PENDIENTE_VALIDACION",
    "mensaje": "Solicitud creada exitosamente en Core Bancario",
    "fechaCreacion": "2026-01-27T13:30:00Z"
}
```

### Response (400 Bad Request) - Rechazo Automático

```json
{
    "exito": false,
    "idSolicitudCore": null,
    "estadoCore": "RECHAZADA_AUTOMATICA",
    "mensaje": "Cliente no cumple requisitos mínimos para crédito",
    "fechaCreacion": "2026-01-27T13:30:00Z"
}
```

---

## 4. Consultar Estado de Solicitud (HU-CORE-004)

**Endpoint:** `GET /solicitudes/{idSolicitudCore}/estado`

### Request cURL

```bash
curl --location 'https://{{MOCK_SERVER_URL}}/solicitudes/SOL-CORE-2026-78901/estado' \
--header 'Content-Type: application/json' \
--header 'X-API-Key: mock-api-key-12345'
```

### Response (200 OK) - Pendiente Validación

```json
{
    "idSolicitudCore": "SOL-CORE-2026-78901",
    "estadoCore": "PENDIENTE_VALIDACION",
    "observaciones": "Solicitud en cola para revisión",
    "fechaActualizacion": "2026-01-27T13:30:00Z",
    "cupoAprobado": null,
    "analistaAsignado": null
}
```

### Response (200 OK) - En Revisión

```json
{
    "idSolicitudCore": "SOL-CORE-2026-78901",
    "estadoCore": "EN_REVISION",
    "observaciones": "Solicitud asignada a analista para revisión manual",
    "fechaActualizacion": "2026-01-27T14:00:00Z",
    "cupoAprobado": null,
    "analistaAsignado": "analyst@banco.com"
}
```

### Response (200 OK) - Aprobada

```json
{
    "idSolicitudCore": "SOL-CORE-2026-78901",
    "estadoCore": "APROBADA",
    "observaciones": "Solicitud aprobada por comité de crédito. Cupo asignado según perfil de riesgo.",
    "fechaActualizacion": "2026-01-27T16:30:00Z",
    "cupoAprobado": 12000000,
    "analistaAsignado": "analyst@banco.com"
}
```

### Response (200 OK) - Rechazada

```json
{
    "idSolicitudCore": "SOL-CORE-2026-78901",
    "estadoCore": "RECHAZADA",
    "observaciones": "Solicitud rechazada por alto nivel de endeudamiento actual",
    "fechaActualizacion": "2026-01-27T16:30:00Z",
    "cupoAprobado": null,
    "analistaAsignado": "analyst@banco.com"
}
```

---

## Configuración del Backend (.env)

Después de crear el Mock Server en Postman, actualiza el archivo `.env` del backend:

```env
# MuleSoft / Core Bancario Mock
MULESOFT_API_URL=https://tu-mock-server-id.mock.pstmn.io
MULESOFT_API_KEY=mock-api-key-12345
MULESOFT_TIMEOUT=30000
MULESOFT_RETRY_MAX_ATTEMPTS=3

```

---

## Colección Postman (JSON para importar)

Para importar directamente en Postman, usa el siguiente JSON:

```json
{
    "info": {
        "name": "MuleSoft Core Mock API",
        "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
    },
    "item": [
        {
            "name": "1. Validar Cliente",
            "request": {
                "method": "POST",
                "header": [
                    { "key": "Content-Type", "value": "application/json" },
                    { "key": "X-API-Key", "value": "mock-api-key-12345" }
                ],
                "url": { "raw": "{{baseUrl}}/clientes/validar" },
                "body": {
                    "mode": "raw",
                    "raw": "{\"tipoDocumento\":\"CC\",\"numeroDocumento\":\"1234567890\",\"email\":\"juan.perez@email.com\"}"
                }
            },
            "response": [
                {
                    "name": "Cliente Existente",
                    "status": "OK",
                    "code": 200,
                    "body": "{\"existe\":true,\"esClienteActual\":true,\"idClienteCore\":\"CLI-CORE-12345\",\"nombreCompleto\":\"Juan Pérez García\",\"estadoCliente\":\"ACTIVO\"}"
                }
            ]
        },
        {
            "name": "2. Consultar Centrales Riesgo",
            "request": {
                "method": "POST",
                "header": [
                    { "key": "Content-Type", "value": "application/json" },
                    { "key": "X-API-Key", "value": "mock-api-key-12345" }
                ],
                "url": { "raw": "{{baseUrl}}/centrales-riesgo/consultar" },
                "body": {
                    "mode": "raw",
                    "raw": "{\"tipoDocumento\":\"CC\",\"numeroDocumento\":\"1234567890\",\"nombres\":\"Juan\",\"apellidos\":\"Pérez García\"}"
                }
            },
            "response": [
                {
                    "name": "Score Bueno",
                    "status": "OK",
                    "code": 200,
                    "body": "{\"scoreCredito\":780,\"nivelRiesgo\":\"BAJO\",\"deudaActual\":5000000,\"cupoDisponible\":15000000,\"porcentajeEndeudamiento\":25,\"numeroObligacionesActivas\":2,\"morasUltimos12Meses\":0,\"consultaExitosa\":true}"
                }
            ]
        },
        {
            "name": "3. Crear Solicitud Core",
            "request": {
                "method": "POST",
                "header": [
                    { "key": "Content-Type", "value": "application/json" },
                    { "key": "X-API-Key", "value": "mock-api-key-12345" }
                ],
                "url": { "raw": "{{baseUrl}}/solicitudes/crear" },
                "body": {
                    "mode": "raw",
                    "raw": "{\"numeroSolicitud\":\"SOL-20260127-00001\",\"idClienteCore\":\"CLI-CORE-12345\",\"datosPersonales\":{\"nombres\":\"Juan\",\"apellidos\":\"Pérez\"},\"datosLaborales\":{\"ingresoMensual\":8000000},\"productoSolicitado\":{\"tipoTarjeta\":\"ORO\",\"cupoSolicitado\":15000000},\"validaciones\":{\"scoreCredito\":780}}"
                }
            },
            "response": [
                {
                    "name": "Creación Exitosa",
                    "status": "Created",
                    "code": 201,
                    "body": "{\"exito\":true,\"idSolicitudCore\":\"SOL-CORE-2026-78901\",\"estadoCore\":\"PENDIENTE_VALIDACION\",\"mensaje\":\"Solicitud creada exitosamente en Core Bancario\",\"fechaCreacion\":\"2026-01-27T13:30:00Z\"}"
                }
            ]
        },
        {
            "name": "4. Consultar Estado Solicitud",
            "request": {
                "method": "GET",
                "header": [
                    { "key": "Content-Type", "value": "application/json" },
                    { "key": "X-API-Key", "value": "mock-api-key-12345" }
                ],
                "url": { "raw": "{{baseUrl}}/solicitudes/SOL-CORE-2026-78901/estado" }
            },
            "response": [
                {
                    "name": "Aprobada",
                    "status": "OK",
                    "code": 200,
                    "body": "{\"idSolicitudCore\":\"SOL-CORE-2026-78901\",\"estadoCore\":\"APROBADA\",\"observaciones\":\"Solicitud aprobada\",\"fechaActualizacion\":\"2026-01-27T16:30:00Z\",\"cupoAprobado\":12000000,\"analistaAsignado\":\"analyst@banco.com\"}"
                }
            ]
        }
    ],
    "variable": [
        { "key": "baseUrl", "value": "https://tu-mock-id.mock.pstmn.io" }
    ]
}
```

---

## Pasos para Crear el Mock en Postman

1. **Importar la colección** usando el JSON anterior
2. Ir a **Collections** → clic derecho en "MuleSoft Core Mock API" → **Mock Collection**
3. Asignar un nombre (ej: `MuleSoft Core Mock`)
4. Seleccionar las respuestas de ejemplo para cada endpoint
5. Copiar la URL generada y usarla en el `.env` del backend
