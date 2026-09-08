<!-- Title & Cover -->
<h1 align="center">
  🎬 Riwi Cine API
</h1>

<p align="center">
  <strong>API REST empresarial para la gestión integral de salas de cine, cartelera semanal, reservas y bloqueo de asientos en tiempo real.</strong>
</p>

<!-- Badges -->
<div align="center">

![Node.js](https://img.shields.io/badge/Node.js-v20.x-green?logo=node.js)
![TypeScript](https://img.shields.io/badge/TypeScript-v5.x-blue?logo=typescript)
![Express](https://img.shields.io/badge/Express-v5.x-lightgrey?logo=express)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-v15%2B-blue?logo=postgresql)
![Redis](https://img.shields.io/badge/Redis-v7.x-red?logo=redis)
![Socket.io](https://img.shields.io/badge/Socket.io-v4.x-black?logo=socket.io)
![Docker](https://img.shields.io/badge/Docker-Ready-blue?logo=docker)
![Tests](https://img.shields.io/badge/Tests-Jest%20Passing-brightgreen?logo=jest)

</div>

---

## 📑 Tabla de Contenidos

- [Descripción del Proyecto](#-descripción-del-proyecto)
- [Tecnologías Utilizadas](#-tecnologías-utilizadas)
- [Arquitectura del Sistema](#-arquitectura-del-sistema)
- [Requisitos Previos](#-requisitos-previos)
- [Instalación y Puesta en Marcha](#-instalación-y-puesta-en-marcha)
  - [Opción A: Desarrollo Local (Recomendada)](#opción-a-desarrollo-local-recomendada)
  - [Opción B: Despliegue 100% con Docker Compose](#opción-b-despliegue-100-con-docker-compose)
- [Variables de Entorno](#-variables-de-entorno)
- [Documentación y Endpoints (Swagger)](#-documentación-y-endpoints)
- [Ejecución de Pruebas](#-ejecución-de-pruebas)
- [Autores y Créditos](#-autores-y-créditos)

---

## 📖 Descripción del Proyecto

**Riwi Cine API** es una solución backend robusta y escalable diseñada para gestionar la operación completa de una cadena de multicines:
- 📍 **Geolocalización:** Catálogo jerárquico de países, departamentos, ciudades y complejos de cine.
- 🎟️ **Cartelera y Estrenos:** Cartelera semanal, cartelera del día, filtros combinables multicriterio y cuenta regresiva de próximos estrenos con notificaciones automáticas.
- 🔐 **Autenticación y Seguridad:** JWT con rotación de Refresh Tokens, cifrado seguro con bcrypt, protección contra fuerza bruta (bloqueo temporal tras 5 intentos fallidos) y verificación por correo.
- 💳 **Membresías y Descuentos:** Generación de código QR único, niveles de fidelización y cálculo dinámico de beneficios.
- 💺 **Selección de Asientos en Tiempo Real:** Bloqueo concurrente distribuido con Redis (TTL de 10 min), sincronización en vivo vía WebSockets (Socket.io) y jobs automáticos de liberación de asientos expirados.

---

## 🛠️ Tecnologías Utilizadas

| Categoría | Tecnologías |
| :--- | :--- |
| **Lenguaje y Entorno** | TypeScript, Node.js (v20+) |
| **Framework Web** | Express.js v5 |
| **Base de Datos Relacional** | PostgreSQL + Sequelize ORM |
| **Caché y Locking Concurrente** | Redis v7 (Claves temporales con TTL y Pub/Sub) |
| **Tiempo Real (WebSockets)** | Socket.io |
| **Autenticación y Seguridad** | JWT (JSON Web Tokens), bcryptjs, Helmet, CORS, Rate Limiting |
| **Documentación** | Swagger UI / OpenAPI 3.0 |
| **Pruebas Automatizadas** | Jest, ts-jest, Supertest |
| **Contenedores** | Docker & Docker Compose |

---

## 🏛️ Arquitectura del Sistema

El proyecto implementa una arquitectura modular por capas desacopladas:

```
app/src/
├── config/        # Conexiones (PostgreSQL, Redis, CORS, variables de entorno)
├── controllers/   # Manejadores de peticiones y respuestas HTTP
├── database/      # Inicialización y configuración de la base de datos
├── docs/          # Especificación OpenAPI / Swagger JSDoc
├── dto/           # Data Transfer Objects (validación de contratos de entrada)
├── helpers/       # Funciones utilitarias (generadores de código, etc.)
├── jobs/          # Tareas programadas en segundo plano (limpieza de locks, notificaciones)
├── middlewares/   # Autenticación JWT, Rate Limiter, manejo global de errores
├── models/        # Modelos y esquemas relacionales de Sequelize
├── realtime/      # Servidor Socket.io para eventos en tiempo real
├── repositories/  # Capa de abstracción y acceso a datos
├── routes/        # Definición de rutas y endpoints de la API
├── seeders/       # Poblado automático de datos de prueba
├── services/      # Lógica de negocio y transacciones atómicas
└── tests/         # Pruebas automatizadas de concurrencia, expiración y seguridad
```

---

## 📋 Requisitos Previos

Antes de comenzar, asegúrate de tener instalado en tu máquina:
* [Node.js](https://nodejs.org/) (Versión 20 o superior recomendada).
* [Git](https://git-scm.com/).
* [Docker Desktop](https://www.docker.com/products/docker-desktop/) en ejecución.

---

## 🚀 Instalación y Puesta en Marcha

### Opción A: Desarrollo Local (Recomendada)

Esta modalidad levanta la base de datos y Redis en Docker, mientras ejecutas la API en tu entorno Node local para disfrutar de *hot-reload* instantáneo y depuración rápida.

#### 1. Clonar el repositorio
```bash
git clone https://github.com/Lneiras/proyecto-riwi-cine.git
cd proyecto-riwi-cine
```

#### 2. Configurar variables de entorno
Copia el archivo de ejemplo tanto en la raíz como dentro de la carpeta `app`:
```bash
# En Windows (PowerShell):
Copy-Item .env.example .env
Copy-Item .env.example app/.env

# En Linux / macOS:
cp .env.example .env
cp .env.example app/.env
```

#### 3. Levantar PostgreSQL y Redis con Docker
En la raíz del proyecto, ejecuta:
```bash
docker-compose up -d db redis
```
*(Puedes verificar que los contenedores estén activos con `docker ps`)*.

#### 4. Instalar dependencias
Ingresa a la carpeta `app` e instala los paquetes:
```bash
cd app
npm install
```

#### 5. Poblar la base de datos (Seeders)
Ejecuta el script de inicialización para crear las tablas y cargar los datos de prueba (países, cines, salas, asientos, películas, funciones y usuarios):
```bash
npm run seed
```

#### 6. Iniciar el servidor API
```bash
npm run dev
```
> 🟢 **Servidor API disponible en:** `http://localhost:3000`

#### 7. (Opcional) Iniciar el servidor de Tiempo Real (WebSockets)
Abre **otra terminal**, ingresa a `app` y ejecuta:
```bash
cd app
npm run dev:realtime
```
> ⚡ **Servidor Socket.io disponible en el puerto:** `3001`

---

### Opción B: Despliegue 100% con Docker Compose

Si prefieres levantar todos los servicios (API, PostgreSQL, Redis, Realtime y pgAdmin) de forma completamente contenerizada:

```bash
# 1. Configurar variables de entorno
cp .env.example .env

# 2. Levantar todos los servicios
docker-compose up -d --build

# 3. Poblar la base de datos dentro del contenedor
docker exec -it riwi-cine-backend npm run seed

# 4. Ver los logs en tiempo real
docker-compose logs -f
```

Para detener los servicios:
```bash
docker-compose down
```

---

## ⚙️ Variables de Entorno

Asegúrate de ajustar los valores en tu archivo `.env` según tu entorno:

| Variable | Requerida | Valor por Defecto | Descripción |
| :--- | :---: | :---: | :--- |
| `POSTGRES_DB` | ✅ | `postgres` | Nombre de la base de datos |
| `POSTGRES_USER` | ✅ | `nodejs` | Usuario de PostgreSQL |
| `POSTGRES_PASSWORD` | ✅ | `contrasena` | Contraseña de PostgreSQL |
| `POSTGRES_HOST` | ⚠️ | `localhost` *(dev)* / `db` *(docker)* | Host de la base de datos |
| `POSTGRES_PORT` | ⚠️ | `5432` | Puerto de PostgreSQL |
| `APP_PORT` | ⚠️ | `3000` | Puerto del servidor HTTP Express |
| `NODE_ENV` | ✅ | `development` | Entorno (`development`, `test`, `production`) |
| `JWT_SECRET` | ✅ | `dev-secret-...` | Clave secreta para firmar tokens JWT |
| `JWT_ACCESS_EXPIRES_IN` | ⚠️ | `15m` | Tiempo de vida del Access Token |
| `JWT_REFRESH_EXPIRES_IN`| ⚠️ | `7d` | Tiempo de vida del Refresh Token |
| `REDIS_URL` | ✅ | `redis://localhost:6379` | URL de conexión a Redis |
| `SOCKET_PORT` | ⚠️ | `3001` | Puerto para WebSockets (Socket.io) |
| `SEAT_LOCK_TTL_SECONDS`| ⚠️ | `120` | Tiempo de bloqueo temporal de asientos (segundos) |
| `MAX_SEATS_PER_LOCK` | ⚠️ | `6` | Máximo de sillas bloqueables por usuario |
| `PGADMIN_PORT` | ⚠️ | `5050` | Puerto de acceso a pgAdmin en desarrollo |

---

## 📚 Documentación y Endpoints

Una vez iniciada la aplicación, puedes explorar y probar todos los endpoints de forma interactiva:

* 📖 **Swagger UI (Documentación interactiva):** [`http://localhost:3000/api/docs`](http://localhost:3000/api/docs)
* 📄 **OpenAPI JSON Spec:** [`http://localhost:3000/api/docs.json`](http://localhost:3000/api/docs.json)
* 💓 **Health Check Endpoint:** [`http://localhost:3000/api/v1/health`](http://localhost:3000/api/v1/health)
* 🐘 **pgAdmin 4 (Administrador de BD):** [`http://localhost:5050`](http://localhost:5050)
  * *Email:* `admin@riwicine.com`
  * *Password:* `admin`

### Resumen de Módulos Implementados (HU-001 a HU-010)

| Módulo | Métodos & Rutas Principales | Descripción |
| :--- | :--- | :--- |
| **Infraestructura** | `GET /api/v1/health` | Verificación de estado de API y BD |
| **Geografía** | `GET /api/countries`<br>`GET /api/departments`<br>`GET /api/cities`<br>`PATCH /api/users/location` | Catálogo de ubicaciones y asignación de ciudad |
| **Cartelera** | `GET /api/v1/movies/weekly`<br>`GET /api/v1/movies/today`<br>`GET /api/v1/movies/filter` | Cartelera semanal, del día y filtros combinados |
| **Detalle de Películas** | `GET /api/movies/:id`<br>`GET /api/movies/:id/functions`<br>`GET /api/movies/:id/recommendations` | Sinopsis, tráiler, funciones por ciudad y similares |
| **Próximos Estrenos** | `GET /api/v1/movies/upcoming`<br>`GET /api/v1/movies/upcoming/:id` | Estrenos con cuenta regresiva y job de aviso |
| **Autenticación (Auth)** | `POST /auth/register`<br>`POST /auth/verify-email`<br>`POST /auth/login`<br>`POST /auth/refresh`<br>`POST /auth/logout` | Registro, activación, login seguro y rotación JWT |
| **Perfil y Membresía** | `GET /api/v1/profile`<br>`GET /api/v1/membership`<br>`GET /api/v1/membership/qr`<br>`POST /api/v1/membership/discount/calculate` | Datos de usuario, QR único y beneficios |
| **Funciones y Asientos** | `GET /api/functions/:id`<br>`GET /api/v1/functions/:id/seats`<br>`POST /api/v1/reservations/lock-seats`<br>`DELETE /api/v1/reservations/release-seats` | Matriz de sala, bloqueo de asientos y liberación |

---

## 🧪 Ejecución de Pruebas

El proyecto cuenta con una suite completa de pruebas automatizadas con Jest que valida:
1. **Concurrencia en bloqueo de asientos:** Comprueba que dos usuarios simultáneos no puedan tomar el mismo asiento (409 Conflict).
2. **Expiración de reservas preliminares:** Valida la liberación automática del asiento tras vencer el TTL.
3. **Seguridad y bloqueo de cuenta:** Verifica que tras 5 intentos fallidos consecutivos de login la cuenta quede temporalmente bloqueada (`423 Locked`).

Para ejecutar todas las pruebas:
```bash
cd app
npm test
```

---

## 👥 Autores y Créditos

Desarrollado con ❤️ por el equipo de desarrolladores de **Riwi**.
