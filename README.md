# 💳 Plataforma de Solicitud Digital de Tarjeta de Crédito
## Banco BCS - Caso de Uso Integral

---

## 📋 Descripción General

Sistema para la gestión end-to-end de solicitudes de tarjetas de crédito digitales, implementado con NestJS y Clean Architecture, APIs REST documentadas con OpenAPI/Swagger, persistencia en MongoDB y frontend en Next.js para el flujo de solicitud.
Incluye manejo de estados, reglas de negocio y testing automatizado.

## 🏗️ Arquitectura del Sistema

![alt text](<docs/diagrama de architectura (2).jpg>)

### Clean Architecture - Módulo Solicitudes

```
backend/src/modules/solicitudes/
├── domain/                         # Capa de Dominio (Núcleo)
│   ├── entities/                   # SolicitudTarjetaCredito Entity
│   ├── enums/                      # Estados, TipoTarjeta, etc.
│   └── services/                   # SolicitudValidationService
│
├── application/                    # Capa de Aplicación
│   ├── use-cases/                  # Casos de Uso
│   │   ├── create-solicitud.use-case.ts
│   │   ├── find-solicitud.use-case.ts
│   │   ├── update-solicitud.use-case.ts
│   │   ├── submit-solicitud.use-case.ts
│   │   └── abandon-solicitud.use-case.ts
│   └── gateways/                   # Interfaces (Puertos)
│       └── solicitud.gateway.interface.ts
│
├── infrastructure/                 # Capa de Infraestructura
│   ├── persistence/
│   │   ├── gateways/               # SolicitudMongoGateway (Adaptador)
│   │   └── mappers/                # Entity ↔ Document Mapper
│   └── schemas/                    # Mongoose Schemas
│
├── presentation/                   # Capa de Presentación
│   └── controllers/                # SolicitudesController
│
├── dto/                            # Data Transfer Objects
│   ├── create-solicitud.dto.ts
│   └── update-solicitud.dto.ts
│
└── __tests__/                      # Tests Unitarios (86+ tests)
```

---

## 🛠️ Stack Tecnológico

### Backend

| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| **NestJS** | 10.3.0 | Framework backend modular |
| **TypeScript** | 5.3.3 | Tipado estático |
| **MongoDB** | 7+ | Base de datos NoSQL |
| **Mongoose** | 8.0.4 | ODM para MongoDB |
| **Winston** | 3.11.0 | Logging estructurado con rotación |
| **Axios** | 1.6.5 | Cliente HTTP con retry |
| **Swagger** | 7.1.17 | Documentación OpenAPI |
| **Jest** | 29.7.0 | Testing framework |

### Frontend

| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| **Next.js** | 16.1.5 | Framework React con App Router |
| **React** | 19.2.3 | Biblioteca UI |
| **TypeScript** | 5.x | Tipado estático |
| **Tailwind CSS** | 4.x | Estilos utility-first |
| **React Hook Form** | 7.71.1 | Gestión de formularios |
| **Zod** | 4.3.6 | Validación de esquemas |

---

## 📁 Estructura del Proyecto

```
proyectoLT/
├── backend/                        # API REST NestJS
│   ├── src/
│   │   ├── main.ts                 # Bootstrap de aplicación
│   │   ├── app.module.ts           # Módulo raíz
│   │   ├── modules/
│   │   │   ├── solicitudes/        # Módulo principal (Clean Architecture)
│   │   │   ├── integracion-core/   # Integración MuleSoft
│   │   │   └── health/             # Health checks
│   │   ├── shared/                 # Servicios compartidos
│   │   │   └── logger/             # Winston Logger
│   │   └── common/                 # Filtros, Interceptores
│   ├── test/                       # Tests E2E
│   ├── .env.example                # Variables de entorno
│   └── package.json
│
├── frontend/                       # Aplicación Next.js
│   ├── src/
│   │   ├── app/                    # App Router (páginas)
│   │   │   ├── page.tsx            # Landing page
│   │   │   ├── solicitud/          # Flujo de solicitud
│   │   │   └── confirmacion/       # Página de confirmación
│   │   ├── components/
│   │   │   ├── form/               # Componentes de formulario
│   │   │   ├── ui/                 # Componentes UI reutilizables
│   │   │   └── landing/            # Componentes de landing
│   │   ├── services/               # Clientes API
│   │   └── types/                  # Definiciones TypeScript
│   └── package.json
│
├── docs/                           # Documentación técnica
│   └── mulesoft-mock-api.md        # Documentación API MuleSoft
│
├── .gitignore
├── .nvmrc                          # Node 20 LTS
└── README.md                       # Este archivo
```

---

## 🚀 Instalación y Configuración

### Requisitos Previos

- **Node.js** 20 LTS (recomendado usar nvm)
- **MongoDB** 7+ (local o Atlas)
- **npm** o **yarn**

### Variables de Entorno

#### Backend (`backend/.env`)

```bash
# Entorno
NODE_ENV=development

# Servidor
PORT=3001
API_PREFIX=api/v1

# MongoDB
MONGODB_URI=mongodb://localhost:27017/tarjeta_credito
MONGODB_DB_NAME=tarjeta_credito

# MuleSoft Integration
MULESOFT_API_URL=http://localhost:3001/mulesoft/v1
MULESOFT_API_KEY=mock-api-key-12345
MULESOFT_TIMEOUT=30000

MULESOFT_RETRY_MAX_ATTEMPTS=3
MULESOFT_RETRY_DELAY=1000

# Logging
LOG_LEVEL=info
LOG_FILE_ENABLED=true

# CORS
CORS_ORIGIN=http://localhost:3000
```

#### Frontend (`frontend/.env.local`)

```bash
NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1
```

### Pasos de Instalación

```bash
# 1. Clonar repositorio
git clone <repository-url>
cd proyectoLT

# 2. Instalar dependencias del Backend
cd backend
npm install
cp .env.example .env   # Configurar variables

# 3. Instalar dependencias del Frontend
cd ../frontend
npm install

# 4. Iniciar servicios (en terminales separadas)

# Terminal 1: Backend
cd backend
npm run start:dev
# ✅ Backend: http://localhost:3001/api/v1
# 📚 Swagger: http://localhost:3001/api/docs

# Terminal 2: Frontend
cd frontend
npm run dev
# ✅ Frontend: http://localhost:3000
```

---

## 🔌 API REST - Endpoints

### Base URL: `http://localhost:3001/api/v1`

### Módulo Solicitudes

| Método | Endpoint | Descripción | Estado |
|--------|----------|-------------|--------|
| `POST` | `/solicitudes` | Crear nueva solicitud (draft) | ✅ |
| `GET` | `/solicitudes` | Listar solicitudes (paginado) | ✅ |
| `GET` | `/solicitudes/:id` | Obtener solicitud por ID | ✅ |
| `PATCH` | `/solicitudes/:id` | Actualizar solicitud (draft) | ✅ |
| `DELETE` | `/solicitudes/:id` | Eliminar solicitud | ✅ |
| `POST` | `/solicitudes/:id/submit` | Enviar a revisión | ✅ |
| `POST` | `/solicitudes/:id/abandon` | Abandonar solicitud | ✅ |

### Integración Core Bancario

| Método | Endpoint | Descripción | Estado |
|--------|----------|-------------|--------|
| `POST` | `/integracion-core/validar-cliente` | Validar cliente en Core | ✅ |
| `POST` | `/integracion-core/consultar-centrales` | Consultar centrales de riesgo | ✅ |
| `POST` | `/integracion-core/sincronizar` | Sincronizar con Core | ✅ |
| `GET` | `/integracion-core/estado-core` | Consultar estado en Core | ✅ |

### MuleSoft Mock API

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `POST` | `/mulesoft/v1/clientes/validar` | Simula validación de cliente |
| `POST` | `/mulesoft/v1/centrales-riesgo/consultar` | Simula consulta de score |
| `POST` | `/mulesoft/v1/solicitudes/crear` | Simula creación en Core |
| `GET` | `/mulesoft/v1/solicitudes/:id/estado` | Simula consulta de estado |

---

## 📊 Modelo de Datos

### Entidad: SolicitudTarjetaCredito

```typescript
interface SolicitudTarjetaCredito {
  numeroSolicitud: string;         // "SOL-20260126-00001"
  estado: EstadoSolicitud;         // draft | submitted | in_review | approved | rejected
  
  datosPersonales: {
    nombres: string;
    apellidos: string;
    tipoDocumento: TipoDocumento;  // CC | CE | PASAPORTE
    numeroDocumento: string;
    fechaNacimiento: Date;
    genero: Genero;
    email: string;
    celular: string;
    direccionResidencia: string;
  };
  
  datosLaborales: {
    situacionLaboral: SituacionLaboral;
    tipoContrato?: TipoContrato;
    nombreEmpresa?: string;
    cargoActual?: string;
    antiguedadMeses?: number;
    ingresoMensual: number;
  };
  
  productoSolicitado: {
    tipoTarjeta: TipoTarjeta;      // CLASICA | ORO | PLATINUM | BLACK
    cupoSolicitado: number;
    franquicia: Franquicia;        // VISA | MASTERCARD | AMEX
    segurosAdicionales?: string[];
  };
  
  validaciones?: {
    scoreCredito: number;
    nivelRiesgo: NivelRiesgo;
    deudaActual: number;
  };
  
  integracionCore?: {
    enviado: boolean;
    idSolicitudCore: string;
    estadoCore: string;
    fechaSincronizacion: Date;
  };
  
  metadatos: {
    creadoEn: Date;
    actualizadoEn: Date;
    canal: string;
  };
}
```

---

## 📐 Reglas de Negocio

### Validaciones Generales

| Regla | Valor |
|-------|-------|
| Edad mínima | 18 años |
| Ingreso mínimo | $1,500,000 COP |
| Cupo mínimo | $500,000 COP |
| Cupo máximo | 3x ingreso mensual |

### Límites por Tipo de Tarjeta

| Tarjeta | Cupo Máximo | Ingreso Mínimo |
|---------|-------------|----------------|
| **CLASICA** | $5,000,000 | $1,500,000 |
| **ORO** | $15,000,000 | $3,000,000 |
| **PLATINUM** | $40,000,000 | $8,000,000 |
| **BLACK** | Sin límite | $15,000,000 |

### Motor de Decisión Automática (Score Crediticio)

```
┌──────────────────────────────────────────────────────────────┐
│                    FLUJO DE DECISIÓN                          │
├──────────────────────────────────────────────────────────────┤
│  Score < 500                 →  ❌ Rechazo automático        │
│  Score 500-600 + Deuda > 50% →  🔍 Revisión manual           │
│  Score > 600 + Deuda < 50%   →  ⏳ Pre-aprobación            │
│  Score > 750 + Deuda < 30%   →  ✅ Aprobación automática     │
└──────────────────────────────────────────────────────────────┘
```


### Comandos de Testing

```bash
# Backend
cd backend

npm run test              # Tests unitarios
npm run test:watch        # Watch mode
npm run test:cov          # Reporte de cobertura
npm run test:e2e          # Tests end-to-end

# Frontend
cd frontend

npm run lint              # Linting
npm run build             # Verificar compilación
```


---

## 📝 Scripts NPM

### Backend

| Script | Descripción |
|--------|-------------|
| `npm run start:dev` | Desarrollo con hot reload |
| `npm run build` | Compilar a JavaScript |
| `npm run start:prod` | Producción |
| `npm run test` | Ejecutar tests |
| `npm run test:cov` | Tests con cobertura |
| `npm run lint` | Linting y autofix |
| `npm run format` | Formateo con Prettier |

### Frontend

| Script | Descripción |
|--------|-------------|
| `npm run dev` | Desarrollo |
| `npm run build` | Build de producción |
| `npm run start` | Servidor de producción |
| `npm run lint` | Linting |

---

## 🔗 URLs de Desarrollo

| Servicio | URL |
|----------|-----|
| **Frontend** | http://localhost:3000 |
| **Backend API** | http://localhost:3001/api/v1 |
| **Swagger/OpenAPI** | http://localhost:3001/api/docs |

---






