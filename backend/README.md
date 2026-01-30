# Backend - Plataforma de Tarjeta de Crédito Digital

API REST para gestión de solicitudes de tarjetas de crédito con Clean Architecture.

## 🚀 Quick Start

```bash
# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
# Actualizar MONGODB_URI con tu cadena de conexión de MongoDB Atlas

# Iniciar servidor de desarrollo
npm run start:dev

# Servidor: http://localhost:3001
# Swagger: http://localhost:3001/api/docs
```

## 📁 Estructura del Proyecto (Clean Architecture)

```
backend/src/
├── main.ts                         # Bootstrap
├── app.module.ts                   # Módulo raíz
│
├── common/                         # Código compartido
│   ├── filters/                    # Exception filters
│   └── interceptors/               # Response interceptors
│
├── shared/                         # Utilidades
│   ├── database/                   # MongoDB connection
│   └── logger/                     # Winston logger
│
└── modules/
    ├── health/                     # Health checks
    │
    ├── solicitudes/                # ⭐ Módulo principal (Clean Architecture)
    │   ├── domain/                 # 🔵 CAPA DOMINIO
    │   │   ├── entities/           #    └── SolicitudEntity (lógica de negocio)
    │   │   ├── enums/              #    └── Estados, TipoTarjeta, etc.
    │   │   └── services/           #    └── Reglas de validación puras
    │   │
    │   ├── application/            # 🟢 CAPA APLICACIÓN  
    │   │   ├── use-cases/          #    └── CreateSolicitud, SubmitSolicitud...
    │   │   └── gateways/           #    └── ISolicitudGateway (interfaz/puerto)
    │   │
    │   ├── infrastructure/         # 🟠 CAPA INFRAESTRUCTURA
    │   │   ├── persistence/
    │   │   │   ├── gateways/       #    └── SolicitudMongoGateway (adaptador)
    │   │   │   └── mappers/        #    └── Entity ↔ Document
    │   │   └── schemas/            #    └── Mongoose schemas
    │   │
    │   ├── presentation/           # 🔴 CAPA PRESENTACIÓN
    │   │   └── solicitudes.controller.ts
    │   │
    │   ├── dto/                    # Data Transfer Objects
    │   │
    │   └── __tests__/              # Tests unitarios
    │       ├── domain/             #    └── Entity, ValidationService
    │       ├── use-cases/          #    └── CreateSolicitud, SubmitSolicitud...
    │       └── infrastructure/     #    └── Mapper, Gateway
    │
    └── integracion-core/           # ⭐ Integración Core Bancario
        ├── controllers/
        │   ├── integracion-core.controller.ts
        │   └── mulesoft-mock.controller.ts   # Mock para testing
        ├── services/
        │   ├── core-banking.service.ts       # Orquestación
        │   └── mulesoft-client.service.ts    # Circuit Breaker + Retry
        ├── dto/
        └── __tests__/
```

## 🏗️ Clean Architecture

```
┌──────────────────────────────────────────────────────────┐
│                    PRESENTATION                          │
│              (Controllers, DTOs)                         │
├──────────────────────────────────────────────────────────┤
│                    APPLICATION                           │
│           (Use Cases, Gateway Interfaces)                │
├──────────────────────────────────────────────────────────┤
│                      DOMAIN                              │
│   (Entities, Domain Services, Business Rules)            │
├──────────────────────────────────────────────────────────┤
│                   INFRASTRUCTURE                         │
│        (MongoDB Gateway, Mappers, Schemas)               │
└──────────────────────────────────────────────────────────┘

Regla de Dependencia: Las capas externas dependen de las internas.
```

## 🔌 API Endpoints

### Solicitudes

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/api/v1/solicitudes` | Crear solicitud (draft) |
| GET | `/api/v1/solicitudes/:id` | Obtener por ID |
| GET | `/api/v1/solicitudes` | Listar (paginado + filtros) |
| PATCH | `/api/v1/solicitudes/:id` | Actualizar (solo draft) |
| POST | `/api/v1/solicitudes/:id/submit` | Enviar para revisión |
| POST | `/api/v1/solicitudes/:id/abandon` | Abandonar solicitud |
| DELETE | `/api/v1/solicitudes/:id` | Eliminar (solo draft) |

### Integración Core

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/api/v1/integracion-core/solicitudes/:id/validar-cliente` | Validar cliente |
| POST | `/api/v1/integracion-core/solicitudes/:id/consultar-centrales` | Consultar centrales |
| POST | `/api/v1/integracion-core/solicitudes/:id/sincronizar` | Sincronizar con Core |
| GET | `/api/v1/integracion-core/solicitudes/:id/estado-core` | Estado en Core |

## 🧪 Testing

```bash
# Tests unitarios (99 tests)
npm run test

# Tests con cobertura
npm run test:cov

# Watch mode
npm run test:watch
```

### Estructura de Tests

| Capa | Tests |
|------|-------|
| **Domain** | Entity behavior, ValidationService rules |
| **Use Cases** | CreateSolicitud, SubmitSolicitud, FindSolicitud |
| **Infrastructure** | Mapper, MongoGateway |
| **Core Banking** | Client validation, Credit check, Core sync |

## 🔐 Reglas de Negocio

### Validaciones

- ✅ Edad mínima: 18 años
- ✅ Ingreso mensual mínimo: $1,500,000 COP
- ✅ Cupo máximo: 3x ingreso mensual

### Límites por Tipo de Tarjeta

| Tarjeta | Cupo Máximo | Ingreso Mínimo |
|---------|-------------|----------------|
| CLASICA | $5,000,000 | $1,500,000 |
| ORO | $15,000,000 | $3,000,000 |
| PLATINUM | $40,000,000 | $8,000,000 |
| BLACK | Ilimitado | $15,000,000 |

## 🛠️ Stack Tecnológico

- **Framework**: NestJS 10+
- **Runtime**: Node.js 20 LTS
- **Language**: TypeScript 5+
- **Database**: MongoDB Atlas (Mongoose 8+)
- **Validation**: class-validator, class-transformer
- **Logger**: Winston
- **Resilience**: Opossum (Circuit Breaker) + axios-retry
- **Testing**: Jest (99 tests)
- **Documentation**: Swagger (OpenAPI)

## 📝 Configuración

### Variables de Entorno

```bash
# Servidor
PORT=3001
API_PREFIX=api/v1

# MongoDB Atlas
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/tarjeta_credito

# Mulesoft
MULESOFT_API_URL=http://localhost:3001/mulesoft/v1
MULESOFT_TIMEOUT=30000

# Logging
LOG_LEVEL=info
LOG_FILE_ENABLED=true
```

## 🚦 Health Checks

```bash
GET http://localhost:3001/api/v1/health
GET http://localhost:3001/api/v1/integracion-core/health
```

## 📚 Documentación

- **Swagger UI**: http://localhost:3001/api/docs

## 📄 Licencia

MIT
