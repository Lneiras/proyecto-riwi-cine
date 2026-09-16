# Revisión de Product Backlog — Plataforma Web Multicine

Documento elaborado por revisión de Product Owner / Business Analyst Senior sobre el backlog original (`Historia_de_usuario_NodeJS_Multicine_Riwi.pdf`).

---

# ==================================================
# SECCIÓN 1: REPORTE DE REVISIÓN Y CAMBIOS REALIZADOS
# ==================================================

## 1. Resumen de Calidad Inicial

El backlog original (29 Historias de Usuario, HU-001 a HU-029) tiene un **buen nivel de detalle funcional** — describe pantallas, campos, endpoints y reglas de negocio con bastante profundidad. Sin embargo, al evaluarlo bajo el criterio **INVEST** y buenas prácticas de Scrum, se identificaron los siguientes vacíos recurrentes:

| Dimensión INVEST | Hallazgo |
|---|---|
| **Independiente** | Varias HU dependen implícitamente de otras sin declararlo (ej. HU-016 y HU-017 requieren HU-013/014; HU-023 requiere HU-013; HU-024 requiere HU-014). Solo 2 de 29 HU declaraban dependencias explícitas. |
| **Negociable** | Las HU están redactadas casi como especificación técnica cerrada (listas de campos exhaustivas), lo cual está bien como contexto, pero carecían de foco en el "valor" y dejaban poco margen de conversación con el equipo. Se mantuvo el detalle pero se reforzó el objetivo de negocio. |
| **Valiosa** | El valor de negocio no siempre estaba explícito (ej. HU-020 "Panel Administrativo" mezcla 9 módulos distintos sin diferenciar valor individual). |
| **Estimable** | Ninguna HU original tenía Criterios de Aceptación en formato Gherkin (Dado/Cuando/Entonces), lo que dificulta estimar el esfuerzo de pruebas y casos borde. |
| **Pequeña (Small)** | **HU-020 (34 SP)** y **HU-021 (21 SP)** son demasiado grandes para un sprint — mezclan múltiples subdominios y deben dividirse. **HU-006** mezcla registro + membresía + emails (2 responsabilidades). **HU-013** mezcla validación de carrito + pago + generación de venta (3 responsabilidades). |
| **Testeable** | Ninguna HU tenía casos de error/borde explícitos como criterios de aceptación formales (solo como "reglas de negocio" sueltas, no verificables paso a paso). |

**Otros vacíos detectados:**
- No existían **prioridades MoSCoW/numéricas homogéneas** (se mezclaban "Alta", "Muy Alta", "Crítica" sin escala clara documentada).
- No había **manejo explícito de estados de error** en flujos críticos (pago rechazado, timeout de pasarela, QR duplicado, concurrencia en selección de sillas).
- Faltaban **criterios de accesibilidad y usabilidad** (ej. selección de sillas con lector de pantalla, sillas preferenciales).
- No se mencionaban **pruebas de carga/concurrencia**, críticas para HU-010 (bloqueo de sillas) y HU-019 (Cine Flash, proceso automático cada 5 min).
- Los **endpoints** estaban listados pero sin verbos/contratos de error (4xx/5xx), lo que se corrigió agregando tareas técnicas de documentación Swagger con casos de error.
- No existía una historia dedicada a la **gestión de imágenes/CDN de pósters y banners**, mencionada implícitamente en varias HU (se agregó como tarea técnica transversal en HU-001).

## 2. Matriz de Cambios y Justificación

| HU Afectada | Cambio Realizado | Justificación |
|---|---|---|
| **General (todas)** | Se añadieron Criterios de Aceptación en formato Gherkin (Dado/Cuando/Entonces) con al menos 1 escenario feliz y 1 escenario de error/borde. | Los criterios en lenguaje natural original no eran verificables por QA de forma objetiva; Gherkin permite trazabilidad directa a pruebas automatizadas. |
| **General (todas)** | Se desglosó cada HU en 4-7 Tareas Técnicas etiquetadas por capa (Backend/Frontend/DB/QA/DevOps). | Permite crear Issues de GitHub directamente vinculados a la HU (Epic), habilitando trabajo paralelo del equipo desde el día 1. |
| **General (todas)** | Se normalizó la prioridad a escala única: Crítica > Muy Alta > Alta > Media > Baja. | Elimina ambigüedad al priorizar el Sprint Backlog; se conservó la intención original de cada HU. |
| **HU-001** | Se agregó explícitamente un criterio de "Docker Compose falla si falta variable de entorno obligatoria" y tarea de gestión de secretos/CDN de imágenes. | La configuración base es la fundación del proyecto; omitir el manejo de errores de arranque genera riesgo alto en onboarding de nuevos desarrolladores. |
| **HU-002** | Se agregó escenario de error para ciudad sin cines activos (ya existía como regla de negocio RN-007, se formalizó como AC) y tarea de caché de catálogos geográficos. | Convierte una regla de negocio implícita en un criterio testeable; el caché reduce llamadas repetidas a un catálogo de baja variabilidad. |
| **HU-003** | Se separó "filtros de cartelera" como AC independiente con escenario de combinación de filtros sin resultados. | El filtrado combinado es un caso de uso de alta probabilidad de bug (ej. género + idioma sin resultados) y no estaba cubierto. |
| **HU-004** | Se agregó AC para película sin funciones disponibles en la ciudad seleccionada. | Evita pantallas rotas cuando una película existe en catálogo global pero no tiene funciones locales. |
| **HU-005** | Se agregó AC de no duplicidad de notificación (ya era RN-019) y tarea de job/cron para envío al pasar a "En Cartelera". | Formaliza una regla crítica de negocio como comportamiento verificable por QA. |
| **HU-006** | **División sugerida**: se mantiene como HU única por cohesión (registro + membresía son atómicos en este dominio), pero se separaron tareas técnicas de "creación de cuenta" vs "creación de membresía" para permitir desarrollo paralelo Backend. | El registro y la membresía sí son un solo evento de negocio (RN-025: "todo usuario tendrá automáticamente membresía"), por lo que dividir la HU rompería la atomicidad; se prefirió dividir solo a nivel de tareas técnicas. |
| **HU-007** | Se agregó AC explícito para bloqueo de cuenta tras 5 intentos fallidos y para token expirado. | RN-027/028 no tenían criterio de aceptación verificable; ahora son escenarios Gherkin explícitos. |
| **HU-008** | Se agregó AC de que la actualización de correo dispara nueva verificación (RN-034) como escenario explícito. | Antes era solo una regla de negocio aislada, sin comportamiento de UI/UX definido. |
| **HU-009** | Se agregó AC de recalculo de precio en tiempo real al cambiar formato. | RN-037/038 mencionaban el recálculo pero no como comportamiento verificable en la interfaz. |
| **HU-010** | Se agregó AC de manejo de concurrencia (dos usuarios seleccionando la misma silla) y tarea técnica de locking distribuido (Redis) + WebSockets para actualización en tiempo real. | Es la historia de mayor riesgo técnico del backlog (RN-043 "tiempo real"); sin WebSockets/locking, la implementación con polling sería insuficiente. |
| **HU-011** | Se agregó AC de expiración del carrito por inactividad (RN-046) como escenario Gherkin y tarea de job de expiración. | Antes era solo una regla de negocio sin mecanismo técnico definido (cron/TTL). |
| **HU-012** | Se agregó AC de producto agotado no se puede agregar al carrito. | RN-049 no tenía comportamiento de UI definido (mensaje de error, deshabilitar botón). |
| **HU-013** | Se agregó AC explícito de "pago rechazado libera sillas automáticamente" (RN-054) y de "webhook duplicado no genera doble venta" (idempotencia, no cubierto en el original). | El manejo de idempotencia en webhooks de pasarelas de pago es un caso crítico de producción no mencionado en el documento original. |
| **HU-014** | Se agregó AC de reintento de generación de PDF en caso de fallo del servicio de generación. | El documento original asumía generación siempre exitosa; en producción se requiere manejo de fallos del microservicio de PDF/QR. |
| **HU-015** | Se agregó AC de reintentos (RN-063) como escenario Gherkin y tarea de cola de mensajería (ej. SQS/RabbitMQ) para desacoplar envío. | Mejora la resiliencia; enviar correos de forma síncrona en el flujo de compra degradaría el tiempo de respuesta del checkout. |
| **HU-016** | Se agregó AC de intento de cambio fuera del tiempo permitido (RN-065) como escenario de error. | Antes solo listado como regla de negocio; ahora es un caso de prueba obligatorio. |
| **HU-017** | Se agregó AC de transferencia no aceptada dentro de un plazo (expiración de invitación), no contemplado en el original. | Sin plazo de expiración, una invitación de transferencia podría quedar "abierta" indefinidamente, generando inconsistencia de titularidad. |
| **HU-018** | Se agregó AC de bono expirado no puede canjearse. | RN-078 mencionaba expiración pero no el comportamiento al intentar canjear un bono vencido. |
| **HU-019** | Se agregó AC de que Cine Flash no se activa si ya existe una promoción activa no acumulable (RN-083) y tarea de job programado (cron) con lock para evitar ejecuciones concurrentes. | El proceso corre cada 5 minutos; sin lock de ejecución, dos instancias del cron podrían duplicar el procesamiento. |
| **HU-020** | **División de la HU** (34 SP, excede el tamaño manejable en un sprint): se dividió en **HU-020a Catálogos y Configuración**, **HU-020b Gestión de Películas y Funciones**, **HU-020c Gestión de Ventas y Confitería (Admin)**, **HU-020d Gestión de Usuarios, Roles y Seguridad (RBAC)** y **HU-020e Reportes y Auditoría**. | 34 puntos de historia es una señal clara de que la HU no es "Small"; dividirla permite priorizar y entregar valor incremental (ej. catálogos antes que reportes) y paralelizar el trabajo entre desarrolladores. |
| **HU-021** | Se agregó AC de fallback cuando el proveedor de IA no responde a tiempo (RN-094/095) y tarea técnica de timeout + mensaje de degradación elegante. | Sin este criterio, una caída del proveedor de IA (OpenAI/Bedrock) bloquearía la experiencia completa del chatbot sin plan B. |
| **HU-022** | Se agregó AC de usuario sin historial suficiente (nuevo) para evitar recomendaciones vacías o irrelevantes ("cold start"). | Caso de borde común en sistemas de recomendación no cubierto en el documento original. |
| **HU-023** | Se agregó AC de expiración de puntos (RN-099) como escenario Gherkin y tarea de job mensual de vencimiento. | Formaliza una regla de negocio en comportamiento de sistema verificable. |
| **HU-024** | Se agregó AC de QR inválido/inexistente y de intento de reingreso con QR ya utilizado (RN-102) como escenarios explícitos, y tarea de modo offline básico para el escáner. | El control de acceso es crítico el día del evento; debe soportar fallos de conectividad temporal en el punto de acceso. |
| **HU-025** | Se agregó AC de exportación con rango de fechas inválido y tarea de precálculo/agregación (ej. vistas materializadas) para performance del dashboard. | Un dashboard con agregaciones en tiempo real sobre tablas transaccionales sin precálculo tendría problemas de rendimiento a escala. |
| **HU-026** | Se agregó AC de cupón fuera de vigencia o que excede el cupo máximo por usuario (RN-107). | Regla de negocio sin comportamiento de error definido en el original. |
| **HU-027** | Se agregó AC de intento de responder una segunda encuesta para la misma compra (RN-109). | Formaliza el control de duplicidad como criterio testeable. |
| **HU-028** | Se agregó AC de adjuntos que exceden tamaño/formato permitido (no mencionado en el original) y de cambio de estado con notificación automática. | Los formularios con adjuntos requieren validación explícita de tipo/tamaño de archivo por seguridad. |
| **HU-029** | Se agregó AC de rate limiting excedido (RN-116) como escenario Gherkin explícito y tarea de gateway de API (ej. Kong/AWS API Gateway) con throttling configurable. | Sin este criterio, "rate limiting" quedaba solo como mención de seguridad sin comportamiento verificable ni componente técnico asignado. |

---

# ==================================================
# SECCIÓN 2: DOCUMENTO FINAL REVISADO (LISTO PARA GITHUB PROJECTS)
# ==================================================

> **Convenciones:** Prioridad normalizada = Crítica > Muy Alta > Alta > Media > Baja. Estimación en Story Points (Fibonacci: 1,2,3,5,8,13,21,34) conservando el criterio del documento original, ajustado donde se dividieron historias.

## Épica: Arquitectura e Infraestructura

---
### [HU-001] Configuración de la Plataforma Base

**Descripción (Formato Estándar):**
Como equipo de desarrollo,
Quiero disponer de una arquitectura base del proyecto utilizando NodeJS, Express, PostgreSQL y Docker,
Para desarrollar todas las funcionalidades del sistema bajo un entorno estandarizado, escalable y fácilmente desplegable.

**Prioridad:** Crítica | **Estimación:** 8 SP

**Criterios de Aceptación:**
- [ ] **Escenario 1: Levantamiento exitoso del entorno**
  - **Dado que** un desarrollador clona el repositorio y configura el archivo `.env` con las variables requeridas
  - **Cuando** ejecuta `docker-compose up`
  - **Entonces** se levantan los contenedores de API y PostgreSQL, se ejecutan las migraciones automáticamente y el endpoint `GET /api/v1/health` responde HTTP 200
- [ ] **Escenario 2 (Error — variable de entorno faltante):**
  - **Dado que** falta una variable de entorno obligatoria (ej. `DB_PASSWORD`)
  - **Cuando** se ejecuta `docker-compose up`
  - **Entonces** el contenedor de la API falla al iniciar y el log muestra un mensaje claro indicando qué variable falta
- [ ] **Escenario 3: Documentación disponible**
  - **Dado que** la API está corriendo
  - **Cuando** el desarrollador navega a `/api-docs`
  - **Entonces** Swagger UI se muestra con el endpoint de salud documentado

**Tareas Técnicas (Tasks para GitHub Issues / Draft Items):**
- [ ] Task 1: [DevOps] Crear `Dockerfile` multi-stage para la API NodeJS y `docker-compose.yml` con servicios `api`, `db` y `pgadmin` (dev).
- [ ] Task 2: [Backend] Inicializar proyecto Express con estructura de carpetas (`config, controllers, services, repositories, middlewares, routes, models, migrations, seeders, utils, helpers, tests, docs`).
- [ ] Task 3: [Backend] Configurar Sequelize ORM, conexión a PostgreSQL y sistema de migraciones/seeders.
- [ ] Task 4: [Backend] Configurar middlewares base: Helmet, CORS, manejo global de errores, logger (ej. Winston/Morgan).
- [ ] Task 5: [Backend] Implementar endpoint `GET /api/v1/health` con verificación de conexión a BD.
- [ ] Task 6: [DevOps] Configurar Swagger/OpenAPI con generación automática desde anotaciones JSDoc.
- [ ] Task 7: [QA] Configurar Jest + Supertest, ESLint y Prettier con reglas del equipo, e integrar en pipeline de CI.
- [ ] Task 8: [DevOps] Documentar en `README.md` variables de entorno requeridas por ambiente (Dev/QA/Prod).

---

## Épica: Cartelera

---
### [HU-002] Selección de País, Departamento y Ciudad

**Descripción (Formato Estándar):**
Como visitante del portal,
Quiero seleccionar el país, departamento y ciudad,
Para visualizar únicamente la cartelera disponible en mi ubicación.

**Prioridad:** Alta | **Estimación:** 13 SP

**Criterios de Aceptación:**
- [ ] **Escenario 1: Selección exitosa de ubicación**
  - **Dado que** el usuario ingresa por primera vez al portal
  - **Cuando** selecciona país, departamento y ciudad en el asistente de selección geográfica
  - **Entonces** la ciudad se guarda en Local Storage, se consultan los complejos activos y se muestra la cartelera semanal correspondiente
- [ ] **Escenario 2 (Error — ciudad sin cines activos):**
  - **Dado que** el usuario selecciona una ciudad sin funciones activas
  - **Cuando** el sistema consulta la cartelera de esa ciudad
  - **Entonces** se muestra un mensaje informativo indicando que no hay funciones disponibles, sin romper la interfaz
- [ ] **Escenario 3: Cambio de ubicación posterior**
  - **Dado que** el usuario ya tiene una ciudad guardada
  - **Cuando** cambia de ciudad desde el menú principal
  - **Entonces** la cartelera se actualiza inmediatamente sin necesidad de cerrar sesión

**Tareas Técnicas:**
- [ ] Task 1: [Backend] Modelar tablas `countries`, `departments`, `cities` con relaciones jerárquicas y seed inicial.
- [ ] Task 2: [Backend] Implementar endpoints `GET /countries`, `GET /departments/{countryId}`, `GET /cities/{departmentId}` con validación de país/departamento inactivo.
- [ ] Task 3: [Backend] Implementar `POST /users/location` para persistir la preferencia (usuarios autenticados) y estrategia de caché (ej. Redis) para catálogos geográficos de baja variabilidad.
- [ ] Task 4: [Frontend] Construir wizard de selección geográfica (modal/onboarding) con combos encadenados.
- [ ] Task 5: [Frontend] Implementar persistencia en Local Storage y selector de cambio de ciudad en el header.
- [ ] Task 6: [QA] Pruebas E2E de flujo completo país → departamento → ciudad → cartelera, incluyendo ciudad sin cines activos.

---
### [HU-003] Visualización de la Cartelera Semanal

**Descripción (Formato Estándar):**
Como visitante,
Quiero visualizar toda la cartelera semanal,
Para elegir la mejor película y horario disponible.

**Prioridad:** Muy Alta | **Estimación:** 21 SP

**Criterios de Aceptación:**
- [ ] **Escenario 1: Visualización de cartelera de 7 días**
  - **Dado que** el usuario tiene una ciudad seleccionada
  - **Cuando** ingresa a la página principal
  - **Entonces** se muestran las películas con funciones activas para los próximos 7 días, con poster, título, género, clasificación, duración, formatos y horarios
- [ ] **Escenario 2: Aplicación de filtros combinados**
  - **Dado que** el usuario está viendo la cartelera
  - **Cuando** aplica filtros de género + idioma + formato simultáneamente
  - **Entonces** solo se muestran las películas que cumplen todos los filtros seleccionados
- [ ] **Escenario 3 (Borde — filtros sin resultados):**
  - **Dado que** el usuario aplica una combinación de filtros sin coincidencias
  - **Cuando** el sistema procesa la búsqueda
  - **Entonces** se muestra un estado vacío ("No se encontraron películas con estos filtros") con opción de limpiar filtros

**Tareas Técnicas:**
- [ ] Task 1: [Backend] Modelar tablas `movies`, `functions`, `formats`, `showtimes` con relaciones a `cities`/`complexes`.
- [ ] Task 2: [Backend] Implementar `GET /movies/weekly`, `GET /movies/today`, `GET /movies/filter` con soporte de query params combinables (fecha, género, clasificación, idioma, sala, formato, complejo).
- [ ] Task 3: [Backend] Optimizar consulta con índices en columnas de filtrado frecuente y paginación.
- [ ] Task 4: [Frontend] Construir grid de tarjetas de película (poster, badges de formato, indicador de estreno, botones "Ver detalle"/"Comprar").
- [ ] Task 5: [Frontend] Construir panel de filtros combinables con estado sincronizado a la URL (query params).
- [ ] Task 6: [Frontend] Implementar estado vacío para filtros sin resultados.
- [ ] Task 7: [QA] Pruebas de filtros combinados y de actualización automática al cambiar funciones (RN-013).

---
### [HU-004] Consulta del Detalle de una Película

**Descripción (Formato Estándar):**
Como visitante,
Quiero consultar toda la información de una película,
Para decidir si deseo comprar entradas.

**Prioridad:** Alta | **Estimación:** 13 SP

**Criterios de Aceptación:**
- [ ] **Escenario 1: Visualización completa del detalle**
  - **Dado que** el usuario selecciona una película desde la cartelera
  - **Cuando** ingresa a la página de detalle
  - **Entonces** se muestran poster, banner, tráiler embebido, sinopsis, ficha técnica, funciones disponibles y recomendaciones similares
- [ ] **Escenario 2: Reproducción de tráiler sin salir del sitio**
  - **Dado que** el usuario está en el detalle de la película
  - **Cuando** hace clic en el tráiler
  - **Entonces** el video de YouTube se reproduce embebido, sin redirigir a una pestaña externa
- [ ] **Escenario 3 (Borde — sin funciones en la ciudad seleccionada):**
  - **Dado que** la película existe en catálogo pero no tiene funciones activas en la ciudad del usuario
  - **Cuando** el usuario visualiza el detalle
  - **Entonces** se muestra un mensaje indicando que no hay funciones disponibles en su ciudad, con opción de cambiar de ciudad

**Tareas Técnicas:**
- [ ] Task 1: [Backend] Implementar `GET /movies/{id}`, `GET /movies/{id}/functions`, `GET /movies/{id}/recommendations`.
- [ ] Task 2: [Backend] Implementar lógica de "solo funciones futuras" (RN-014) y flag visual de horario agotado (RN-015).
- [ ] Task 3: [Backend] Implementar algoritmo básico de recomendaciones similares (por género/clasificación) para el endpoint de recomendaciones.
- [ ] Task 4: [Frontend] Construir vista de detalle con reproductor de YouTube embebido (`react-youtube` o iframe API).
- [ ] Task 5: [Frontend] Construir selector de función directo desde el detalle que enlace al flujo de compra (HU-009).
- [ ] Task 6: [QA] Pruebas de película sin funciones locales y de horarios agotados marcados visualmente.

---
### [HU-005] Visualización de Próximos Estrenos

**Descripción (Formato Estándar):**
Como visitante,
Quiero consultar los próximos estrenos,
Para conocer las películas que estarán disponibles próximamente y planificar futuras visitas al cine.

**Prioridad:** Media | **Estimación:** 8 SP

**Criterios de Aceptación:**
- [ ] **Escenario 1: Listado de próximos estrenos**
  - **Dado que** existen películas en estado "Próximo Estreno"
  - **Cuando** el usuario ingresa a la sección "Próximamente"
  - **Entonces** se listan ordenadas por fecha de estreno, con contador regresivo y tráiler
- [ ] **Escenario 2: Registro de notificación exitoso**
  - **Dado que** un usuario autenticado visualiza una película próxima
  - **Cuando** presiona "Notificarme cuando esté disponible"
  - **Entonces** se registra la solicitud y se muestra confirmación visual
- [ ] **Escenario 3 (Borde — solicitud duplicada):**
  - **Dado que** el usuario ya registró una notificación para esa película
  - **Cuando** intenta registrar la notificación nuevamente
  - **Entonces** el sistema rechaza el duplicado y muestra un mensaje indicando que ya está suscrito

**Tareas Técnicas:**
- [ ] Task 1: [Backend] Implementar `GET /movies/upcoming`, `GET /movies/upcoming/{id}`, `POST /notifications/upcoming` con validación de unicidad (usuario + película).
- [ ] Task 2: [Backend] Implementar job/cron que, al cambiar el estado de una película a "En Cartelera", dispare el envío de notificaciones a suscriptores.
- [ ] Task 3: [Frontend] Construir sección "Próximamente" con contador regresivo y tarjetas de estreno.
- [ ] Task 4: [Frontend] Implementar botón de suscripción con manejo de estado (suscrito/no suscrito).
- [ ] Task 5: [QA] Pruebas de no duplicidad de notificación y de disparo automático al cambiar estado de película.

---

## Épica: Gestión de Usuarios / Seguridad

---
### [HU-006] Registro de Usuario y Creación de Membresía Digital

**Descripción (Formato Estándar):**
Como visitante del portal Multicine,
Quiero registrarme mediante un formulario de creación de cuenta,
Para realizar compras en línea, administrar mis reservas y acceder automáticamente a los beneficios de la membresía digital.

**Prioridad:** Muy Alta | **Estimación:** 13 SP
**Dependencias:** HU-001, HU-002

**Criterios de Aceptación:**
- [ ] **Escenario 1: Registro exitoso**
  - **Dado que** un visitante completa el formulario con datos válidos y contraseña que cumple la política de seguridad
  - **Cuando** envía el formulario
  - **Entonces** se crea el usuario, su membresía digital en estado "Activa" con código único, y se envía un correo de activación
- [ ] **Escenario 2 (Error — correo duplicado):**
  - **Dado que** el correo ingresado ya existe en el sistema
  - **Cuando** el usuario envía el formulario
  - **Entonces** el sistema rechaza el registro con un mensaje claro, sin crear cuenta ni membresía
- [ ] **Escenario 3 (Error — contraseña débil):**
  - **Dado que** la contraseña no cumple el mínimo de 10 caracteres con mayúscula, minúscula, número y carácter especial
  - **Cuando** el usuario intenta registrarse
  - **Entonces** el sistema muestra los requisitos incumplidos sin permitir el envío
- [ ] **Escenario 4: Cuenta inactiva bloquea compras**
  - **Dado que** un usuario se registró pero no ha confirmado su correo
  - **Cuando** intenta iniciar sesión o comprar
  - **Entonces** el sistema le indica que debe activar su cuenta primero

**Tareas Técnicas:**
- [ ] Task 1: [DB] Modelar tablas `users`, `memberships`, `membership_codes`, `purchase_history` (vacía), `bonus_wallets` (vacía), `notification_preferences`.
- [ ] Task 2: [Backend] Implementar `POST /auth/register` con validaciones de unicidad de correo y política de contraseña (cifrado BCrypt).
- [ ] Task 3: [Backend] Implementar creación transaccional de usuario + membresía + código único de membresía (evitar estados inconsistentes con transacción de BD).
- [ ] Task 4: [Backend] Implementar `POST /auth/verify-email` con token temporal de 24h y `POST /membership/create` (si se maneja como paso separado internamente).
- [ ] Task 5: [Backend] Integrar CAPTCHA y protección contra fuerza bruta en el endpoint de registro.
- [ ] Task 6: [Frontend] Construir formulario multi-sección (personal, contacto, seguridad, preferencias, consentimientos) con validación en tiempo real.
- [ ] Task 7: [QA] Pruebas de correo duplicado, política de contraseña y flujo completo de activación.

---
### [HU-007] Inicio de Sesión y Autenticación Segura

**Descripción (Formato Estándar):**
Como usuario registrado,
Quiero iniciar sesión de forma segura,
Para acceder a mis beneficios, compras y reservas.

**Prioridad:** Crítica | **Estimación:** 13 SP

**Criterios de Aceptación:**
- [ ] **Escenario 1: Login exitoso**
  - **Dado que** un usuario con correo verificado ingresa credenciales correctas
  - **Cuando** envía el formulario de login
  - **Entonces** el sistema emite Access Token (JWT, 15 min), Refresh Token (7 días) e invalida el Refresh Token anterior
- [ ] **Escenario 2 (Error — bloqueo por intentos fallidos):**
  - **Dado que** un usuario ha fallado 5 intentos de login consecutivos
  - **Cuando** intenta un sexto intento
  - **Entonces** la cuenta se bloquea temporalmente por 15 minutos y se informa al usuario
- [ ] **Escenario 3 (Error — correo no verificado):**
  - **Dado que** un usuario con correo no verificado intenta iniciar sesión
  - **Cuando** envía credenciales correctas
  - **Entonces** el sistema rechaza el login e indica que debe verificar su correo primero
- [ ] **Escenario 4: Renovación de sesión**
  - **Dado que** el Access Token expiró pero el Refresh Token es válido
  - **Cuando** el cliente llama a `POST /auth/refresh`
  - **Entonces** se emite un nuevo Access Token sin requerir nueva autenticación manual

**Tareas Técnicas:**
- [ ] Task 1: [Backend] Implementar `POST /auth/login` con validación de credenciales, generación de JWT firmado y Refresh Token persistido en BD.
- [ ] Task 2: [Backend] Implementar `POST /auth/refresh`, `POST /auth/logout`, `POST /auth/forgot-password`, `POST /auth/reset-password`.
- [ ] Task 3: [Backend] Implementar contador de intentos fallidos y bloqueo temporal por usuario/IP.
- [ ] Task 4: [Backend] Implementar auditoría de accesos (IP, dispositivo, timestamp).
- [ ] Task 5: [Frontend] Construir formulario de login, manejo de estado de sesión (interceptor de refresh automático) y flujo de "olvidé mi contraseña".
- [ ] Task 6: [QA] Pruebas de bloqueo por intentos fallidos, expiración de tokens y renovación de sesión.

---
### [HU-008] Consulta de Perfil y Beneficios de Membresía

**Descripción (Formato Estándar):**
Como usuario autenticado,
Quiero consultar mi perfil y los beneficios asociados a mi membresía,
Para conocer los descuentos y ventajas disponibles antes de realizar una compra.

**Prioridad:** Alta | **Estimación:** 8 SP

**Criterios de Aceptación:**
- [ ] **Escenario 1: Consulta exitosa de perfil y beneficios**
  - **Dado que** un usuario autenticado ingresa a "Mi Cuenta"
  - **Cuando** carga la página
  - **Entonces** se muestra su información personal, QR de membresía, nivel, descuentos vigentes, bonos e historial de compras
- [ ] **Escenario 2: Actualización de perfil**
  - **Dado que** el usuario modifica su nombre o preferencias
  - **Cuando** guarda los cambios
  - **Entonces** la información se actualiza correctamente y se refleja de inmediato
- [ ] **Escenario 3 (Borde — actualización de correo):**
  - **Dado que** el usuario cambia su correo electrónico
  - **Cuando** guarda el cambio
  - **Entonces** el sistema exige una nueva verificación de correo antes de considerarlo confirmado

**Tareas Técnicas:**
- [ ] Task 1: [Backend] Implementar `GET /profile`, `PUT /profile`, `GET /membership`, `GET /membership/benefits`.
- [ ] Task 2: [Backend] Implementar lógica de cálculo de descuentos según nivel de membresía (Bronce/Plata/Oro/Platino).
- [ ] Task 3: [Backend] Implementar generación de código QR único e intransferible de membresía.
- [ ] Task 4: [Backend] Implementar disparo de re-verificación al cambiar correo (RN-034).
- [ ] Task 5: [Frontend] Construir vista "Mi Cuenta" con edición de perfil, visor de QR y listado de beneficios/historial.
- [ ] Task 6: [QA] Pruebas de actualización de perfil y de disparo de re-verificación de correo.

---

## Épica: Compra de Entradas

---
### [HU-009] Selección de Función y Formato de Proyección

**Descripción (Formato Estándar):**
Como usuario,
Quiero seleccionar la función que deseo asistir,
Para continuar con la compra de entradas.

**Prioridad:** Muy Alta | **Estimación:** 13 SP

**Criterios de Aceptación:**
- [ ] **Escenario 1: Selección exitosa de función**
  - **Dado que** el usuario está en el detalle de una película
  - **Cuando** selecciona fecha, complejo, sala, hora, formato e idioma
  - **Entonces** el sistema muestra la disponibilidad de sillas y el precio actualizado para esa función
- [ ] **Escenario 2: Recalculo de precio al cambiar formato**
  - **Dado que** el usuario cambia de formato 2D a IMAX
  - **Cuando** se actualiza la selección
  - **Entonces** el precio se recalcula automáticamente sin recargar la página
- [ ] **Escenario 3 (Borde — función ya iniciada):**
  - **Dado que** una función ya inició
  - **Cuando** el sistema lista las funciones disponibles
  - **Entonces** dicha función no aparece como seleccionable (RN-035)

**Tareas Técnicas:**
- [ ] Task 1: [Backend] Implementar `GET /movies/{id}/functions`, `GET /functions/{id}`, `GET /functions/{id}/prices` con filtro de funciones futuras y activas.
- [ ] Task 2: [Backend] Implementar matriz de precios por formato/sala/horario.
- [ ] Task 3: [Frontend] Construir selector de función (fecha → complejo → sala → hora → formato → idioma/audio) con actualización reactiva de precio.
- [ ] Task 4: [QA] Pruebas de exclusión de funciones iniciadas y de recalculo de precio por formato.

---
### [HU-010] Selección Interactiva de Sillas

**Descripción (Formato Estándar):**
Como usuario,
Quiero seleccionar las sillas donde deseo ubicarme,
Para reservar los puestos antes de realizar el pago.

**Prioridad:** Crítica | **Estimación:** 21 SP

**Criterios de Aceptación:**
- [ ] **Escenario 1: Selección y bloqueo temporal exitoso**
  - **Dado que** el usuario visualiza el mapa de la sala
  - **Cuando** selecciona sillas disponibles hasta el máximo permitido
  - **Entonces** las sillas quedan bloqueadas temporalmente por 10 minutos y se muestra el valor total
- [ ] **Escenario 2 (Error — concurrencia, silla ya tomada):**
  - **Dado que** dos usuarios intentan seleccionar la misma silla simultáneamente
  - **Cuando** el segundo usuario confirma la selección
  - **Entonces** el sistema rechaza la selección de esa silla, la marca como no disponible en tiempo real y notifica al usuario
- [ ] **Escenario 3: Liberación automática por expiración**
  - **Dado que** un usuario bloqueó sillas y no completó la compra
  - **Cuando** transcurren los 10 minutos configurados
  - **Entonces** las sillas vuelven automáticamente a estado "Disponible"
- [ ] **Escenario 4 (Borde — silla preferencial):**
  - **Dado que** un usuario selecciona una silla preferencial (movilidad reducida)
  - **Cuando** confirma la selección
  - **Entonces** el sistema aplica las políticas configuradas para ese tipo de silla

**Tareas Técnicas:**
- [ ] Task 1: [DB] Modelar `seat_maps`, `seats` (con estado: disponible, reservada, vendida, inhabilitada, preferencial, VIP) por sala.
- [ ] Task 2: [Backend] Implementar `GET /functions/{id}/seats`, `POST /reservations/lock-seats`, `DELETE /reservations/release-seats`, `GET /reservations/summary`.
- [ ] Task 3: [Backend] Implementar locking distribuido (ej. Redis con TTL de 10 min) para evitar doble venta por concurrencia.
- [ ] Task 4: [Backend] Implementar WebSockets (o Server-Sent Events) para reflejar en tiempo real el estado de las sillas a todos los usuarios viendo la misma función.
- [ ] Task 5: [Backend] Implementar job de liberación automática de sillas expiradas (fallback si el TTL de Redis no dispara evento).
- [ ] Task 6: [Frontend] Construir mapa gráfico interactivo de sala (SVG/Canvas) con leyenda de estados por color/ícono.
- [ ] Task 7: [QA] Pruebas de concurrencia (dos sesiones seleccionando la misma silla) y de liberación automática por expiración.

---
### [HU-011] Administración del Carrito de Compras

**Descripción (Formato Estándar):**
Como usuario autenticado,
Quiero visualizar un carrito de compras donde pueda administrar las entradas y productos seleccionados,
Para revisar mi compra antes de realizar el pago.

**Prioridad:** Crítica | **Estimación:** 13 SP
**Dependencias:** HU-009, HU-010

**Criterios de Aceptación:**
- [ ] **Escenario 1: Creación automática del carrito**
  - **Dado que** el usuario seleccionó sillas para una función
  - **Cuando** continúa el flujo de compra
  - **Entonces** se crea automáticamente un carrito con las entradas seleccionadas y el resumen de subtotal/descuentos/total
- [ ] **Escenario 2: Aplicación de descuento de membresía**
  - **Dado que** el usuario tiene una membresía activa con descuento vigente
  - **Cuando** el carrito calcula el total
  - **Entonces** el descuento de membresía se aplica automáticamente
- [ ] **Escenario 3 (Borde — expiración por inactividad):**
  - **Dado que** el carrito no tiene actividad durante 10 minutos
  - **Cuando** se cumple el tiempo límite
  - **Entonces** el carrito expira, se liberan las sillas asociadas y se notifica al usuario si intenta continuar
- [ ] **Escenario 4 (Error — cantidad negativa o producto agotado):**
  - **Dado que** el usuario intenta modificar cantidades a un valor negativo o agregar un producto agotado
  - **Cuando** envía la solicitud
  - **Entonces** el sistema rechaza la operación con un mensaje de validación

**Tareas Técnicas:**
- [ ] Task 1: [DB] Modelar `carts`, `cart_items` (entradas y confitería) con TTL/expiración.
- [ ] Task 2: [Backend] Implementar `POST/GET/PUT/DELETE /cart`, `POST /cart/apply-membership`, `POST /cart/apply-giftcard`.
- [ ] Task 3: [Backend] Implementar job de expiración de carrito (10 min sin actividad) que libere sillas bloqueadas (integración con HU-010).
- [ ] Task 4: [Backend] Implementar reglas de un único carrito activo por usuario (RN-044) y validaciones de cantidades/stock.
- [ ] Task 5: [Frontend] Construir vista de carrito con edición de ítems, resumen de totales y navegación de regreso al selector de sillas sin perder la compra.
- [ ] Task 6: [QA] Pruebas de expiración de carrito, un solo carrito activo por usuario y validaciones de cantidades negativas.

---
### [HU-012] Compra de Productos de Confitería

**Descripción (Formato Estándar):**
Como usuario,
Quiero agregar productos de confitería a mi compra,
Para reclamarlos junto con mis entradas el día de la función.

**Prioridad:** Alta | **Estimación:** 8 SP

**Criterios de Aceptación:**
- [ ] **Escenario 1: Agregar producto exitosamente**
  - **Dado que** el usuario navega el catálogo de confitería desde el carrito
  - **Cuando** selecciona un producto disponible y define cantidad
  - **Entonces** el producto se agrega al carrito y el total se actualiza
- [ ] **Escenario 2 (Error — producto agotado):**
  - **Dado que** un producto tiene disponibilidad en cero
  - **Cuando** el usuario intenta agregarlo al carrito
  - **Entonces** el botón de agregar está deshabilitado y se muestra la etiqueta "Agotado"
- [ ] **Escenario 3: Aplicación de promoción de confitería**
  - **Dado que** un producto tiene una promoción vigente
  - **Cuando** se agrega al carrito
  - **Entonces** el precio promocional se refleja correctamente en el resumen

**Tareas Técnicas:**
- [ ] Task 1: [DB] Modelar `snacks`, `snack_categories`, `snack_promotions`, `inventory`.
- [ ] Task 2: [Backend] Implementar `GET /snacks`, `GET /snacks/categories`, `POST/PUT/DELETE /cart/snacks` con validación de disponibilidad.
- [ ] Task 3: [Backend] Implementar descuento de inventario únicamente tras pago exitoso (RN-052), no al agregar al carrito.
- [ ] Task 4: [Frontend] Construir catálogo de confitería por categorías con imágenes, precio y control de cantidad.
- [ ] Task 5: [QA] Pruebas de producto agotado y de aplicación de promociones/descuentos de membresía a confitería.

---
### [HU-013] Proceso de Pago Seguro

**Descripción (Formato Estándar):**
Como usuario,
Quiero realizar el pago de mis entradas y productos de confitería,
Para confirmar definitivamente mi compra.

**Prioridad:** Crítica | **Estimación:** 21 SP
**Dependencias:** HU-011, HU-012

**Criterios de Aceptación:**
- [ ] **Escenario 1: Pago aprobado exitosamente**
  - **Dado que** el usuario tiene un carrito válido con sillas bloqueadas
  - **Cuando** completa el pago con un medio soportado (tarjeta, PSE, Nequi, Daviplata) y la pasarela lo aprueba
  - **Entonces** las sillas cambian a "Vendidas", se crea la venta, la factura y las entradas, y se descuenta el inventario
- [ ] **Escenario 2 (Error — pago rechazado):**
  - **Dado que** la pasarela de pago rechaza la transacción
  - **Cuando** el sistema recibe la respuesta negativa
  - **Entonces** las sillas se liberan automáticamente, el carrito se mantiene activo y se informa el motivo del rechazo al usuario
- [ ] **Escenario 3 (Borde — webhook duplicado / idempotencia):**
  - **Dado que** la pasarela envía el mismo webhook de confirmación más de una vez
  - **Cuando** el sistema lo procesa
  - **Entonces** no se genera una venta ni una entrada duplicada (procesamiento idempotente por ID de transacción)
- [ ] **Escenario 4 (Error — disponibilidad perdida entre bloqueo y pago):**
  - **Dado que** una silla bloqueada expiró justo antes de confirmar el pago
  - **Cuando** el sistema valida disponibilidad previo a confirmar
  - **Entonces** el pago no se autoriza sobre esa silla y se informa al usuario para reintentar

**Tareas Técnicas:**
- [ ] Task 1: [Backend] Implementar `POST /payments`, `GET /payments/status`, `POST /payments/webhook`, `POST /orders` con validación de carrito y disponibilidad previa a la orden.
- [ ] Task 2: [Backend] Integrar pasarela(s) de pago (tokenización, nunca almacenar datos de tarjeta) y comunicación HTTPS con cifrado AES-256 de datos sensibles.
- [ ] Task 3: [Backend] Implementar idempotencia en el procesamiento de webhooks usando ID único de transacción.
- [ ] Task 4: [Backend] Implementar transacción atómica: confirmar venta → cambiar estado de sillas → generar entradas/factura → descontar inventario → registrar auditoría.
- [ ] Task 5: [Backend] Implementar liberación automática de sillas y rollback de carrito en caso de rechazo o timeout de la pasarela.
- [ ] Task 6: [Frontend] Construir checkout con selección de método de pago, manejo de estados de carga/error y confirmación visual.
- [ ] Task 7: [QA] Pruebas de pago aprobado, rechazado, webhook duplicado y expiración de sillas justo antes del pago.

---
### [HU-014] Generación de Entradas Digitales y Factura Electrónica

**Descripción (Formato Estándar):**
Como usuario,
Quiero recibir mis entradas digitales y comprobante de compra,
Para ingresar al cine sin necesidad de imprimir documentos.

**Prioridad:** Alta | **Estimación:** 13 SP

**Criterios de Aceptación:**
- [ ] **Escenario 1: Generación exitosa tras pago confirmado**
  - **Dado que** un pago fue aprobado
  - **Cuando** el sistema procesa la confirmación
  - **Entonces** se generan las entradas en PDF con QR único por silla y la factura electrónica correspondiente
- [ ] **Escenario 2: Redescarga desde "Mis Compras"**
  - **Dado que** el usuario ya tiene entradas generadas
  - **Cuando** accede a "Mis Compras" y selecciona una compra pasada
  - **Entonces** puede volver a descargar el PDF de sus entradas
- [ ] **Escenario 3 (Borde — fallo en generación de PDF):**
  - **Dado que** el servicio de generación de PDF/QR falla temporalmente
  - **Cuando** el pago ya fue confirmado
  - **Entonces** el sistema reintenta la generación de forma asíncrona y notifica al usuario cuando esté disponible, sin afectar la confirmación de la venta

**Tareas Técnicas:**
- [ ] Task 1: [Backend] Implementar `GET /tickets`, `GET /tickets/{id}`, `GET /invoice/{id}`, `POST /tickets/regenerate`.
- [ ] Task 2: [Backend] Integrar librería de generación de PDF (ej. PDFKit/Puppeteer) y de códigos QR únicos por entrada.
- [ ] Task 3: [Backend] Implementar cola de reintentos para generación asíncrona de PDF/QR en caso de fallo del servicio.
- [ ] Task 4: [Backend] Implementar lógica de invalidación de QR tras el ingreso a sala (integración con HU-024).
- [ ] Task 5: [Frontend] Construir sección "Mis Compras" con listado de órdenes y botón de redescarga de PDF/factura.
- [ ] Task 6: [QA] Pruebas de generación de QR único, redescarga y manejo de fallo/reintento de generación.

---

## Épica: Notificaciones

---
### [HU-015] Notificaciones Automáticas por Correo Electrónico

**Descripción (Formato Estándar):**
Como usuario,
Quiero recibir notificaciones automáticas por correo electrónico sobre los eventos importantes relacionados con mi cuenta y mis compras,
Para mantenerme informado y contar con evidencia digital de todas mis transacciones.

**Prioridad:** Alta | **Estimación:** 8 SP

**Criterios de Aceptación:**
- [ ] **Escenario 1: Envío de correo transaccional exitoso**
  - **Dado que** ocurre un evento transaccional (ej. compra exitosa)
  - **Cuando** el sistema procesa el evento
  - **Entonces** se envía un correo con plantilla HTML corporativa y se registra en el historial de notificaciones
- [ ] **Escenario 2 (Error — reintentos por fallo de envío):**
  - **Dado que** el proveedor de correo falla al enviar
  - **Cuando** el sistema detecta el error
  - **Entonces** realiza hasta 3 reintentos antes de marcar la notificación como fallida en el historial
- [ ] **Escenario 3: Respeto de preferencias de marketing**
  - **Dado que** un usuario desactivó las comunicaciones promocionales
  - **Cuando** se dispara una campaña de marketing (ej. "Próximos estrenos")
  - **Entonces** el usuario no recibe ese correo, pero sí continúa recibiendo correos transaccionales obligatorios

**Tareas Técnicas:**
- [ ] Task 1: [Backend] Implementar `POST /notifications/email`, `GET /notifications/history`, `PUT /notifications/preferences`, `POST /notifications/resend`.
- [ ] Task 2: [Backend] Integrar servicio de correo transaccional (ej. SendGrid/SES) y cola de mensajería (ej. SQS/RabbitMQ) para desacoplar el envío del flujo principal (checkout, registro).
- [ ] Task 3: [Backend] Implementar lógica de reintentos (hasta 3) con backoff y marcado de estado fallido.
- [ ] Task 4: [Backend] Diseñar plantillas HTML por tipo de evento (cuenta, compras, reservas, marketing) con branding corporativo.
- [ ] Task 5: [Frontend] Construir panel de preferencias de notificación en "Mi Cuenta".
- [ ] Task 6: [QA] Pruebas de reintentos por fallo, respeto de preferencias y registro en historial.

---

## Épica: Administración de Reservas

---
### [HU-016] Cambio de Función (Reprogramación de Reserva)

**Descripción (Formato Estándar):**
Como usuario que ha comprado una entrada,
Quiero cambiar la fecha, hora o función de mi reserva,
Para poder asistir al cine en otro horario cuando no pueda asistir a la función originalmente seleccionada.

**Prioridad:** Alta | **Estimación:** 13 SP
**Dependencias:** HU-013, HU-014

**Criterios de Aceptación:**
- [ ] **Escenario 1: Cambio exitoso sin diferencia de valor**
  - **Dado que** el usuario solicita cambiar de función con más de 1 hora de anticipación
  - **Cuando** selecciona una nueva función y sillas disponibles del mismo valor
  - **Entonces** se invalidan los QR anteriores, se generan nuevos y se envía correo de confirmación
- [ ] **Escenario 2: Cambio con diferencia de valor**
  - **Dado que** la nueva función tiene un precio distinto
  - **Cuando** el usuario confirma el cambio
  - **Entonces** el sistema cobra el excedente o genera saldo a favor según la política configurada
- [ ] **Escenario 3 (Error — fuera del tiempo permitido):**
  - **Dado que** faltan menos de 1 hora para el inicio de la función original
  - **Cuando** el usuario intenta solicitar el cambio
  - **Entonces** el sistema rechaza la solicitud e informa el motivo

**Tareas Técnicas:**
- [ ] Task 1: [Backend] Implementar `GET /reservations`, `GET /reservations/{id}`, `GET /reservations/{id}/available-functions`, `PUT /reservations/change`.
- [ ] Task 2: [Backend] Implementar validación de ventana de tiempo (RN-065) y de que la función original no haya iniciado.
- [ ] Task 3: [Backend] Implementar cálculo de diferencia de valor (cobro adicional o saldo a favor) e integración con pasarela para cobro del excedente.
- [ ] Task 4: [Backend] Reutilizar lógica de invalidación de QR e integrar con `POST /tickets/regenerate` (HU-014) conservando el número de orden original (RN-069).
- [ ] Task 5: [Frontend] Construir flujo de "Cambiar función" desde "Mis Compras" con nueva selección de sillas.
- [ ] Task 6: [QA] Pruebas de cambio fuera de tiempo, cambio con diferencia de valor y regeneración de QR/correo.

---
### [HU-017] Transferencia de Entradas a Otro Usuario

**Descripción (Formato Estándar):**
Como comprador de una entrada,
Quiero transferir mi reserva a otra persona,
Para que pueda asistir en mi lugar cuando no pueda hacerlo.

**Prioridad:** Alta | **Estimación:** 13 SP

**Criterios de Aceptación:**
- [ ] **Escenario 1: Transferencia exitosa a usuario existente**
  - **Dado que** el comprador transfiere una entrada a un correo de un usuario ya registrado
  - **Cuando** el destinatario acepta la transferencia
  - **Entonces** se invalida el QR anterior, se emite uno nuevo a nombre del nuevo titular y se actualiza el titular
- [ ] **Escenario 2: Transferencia a usuario no registrado**
  - **Dado que** el correo del destinatario no tiene cuenta
  - **Cuando** se envía la transferencia
  - **Entonces** el sistema envía una invitación de registro y completa la transferencia tras el registro
- [ ] **Escenario 3 (Error — fuera de tiempo o ya transferida):**
  - **Dado que** faltan menos de 1 hora para la función, o la entrada ya fue transferida previamente
  - **Cuando** el comprador intenta transferir nuevamente
  - **Entonces** el sistema rechaza la operación indicando el motivo
- [ ] **Escenario 4 (Borde — invitación expirada):**
  - **Dado que** el destinatario no acepta la transferencia dentro del plazo configurado
  - **Cuando** expira la invitación
  - **Entonces** la entrada permanece con el titular original y se notifica al comprador

**Tareas Técnicas:**
- [ ] Task 1: [Backend] Implementar `POST /tickets/transfer`, `GET /tickets/transfer/status`, `POST /tickets/transfer/accept` con validación de una sola transferencia por entrada (RN-072).
- [ ] Task 2: [Backend] Implementar expiración de invitación de transferencia (nuevo criterio) con job de limpieza.
- [ ] Task 3: [Backend] Integrar con HU-006 (invitación de registro) y HU-014 (regeneración de QR/entrada).
- [ ] Task 4: [Frontend] Construir flujo de transferencia desde "Mis Compras" (ingreso de datos del destinatario) y pantalla de aceptación para el destinatario.
- [ ] Task 5: [QA] Pruebas de transferencia a usuario existente, no registrado, fuera de tiempo e invitación expirada.

---

## Épica: Bonos Digitales

---
### [HU-018] Compra y Envío de Bonos de Regalo Digitales

**Descripción (Formato Estándar):**
Como usuario,
Quiero comprar bonos digitales,
Para regalarlos a familiares o amigos.

**Prioridad:** Media | **Estimación:** 13 SP

**Criterios de Aceptación:**
- [ ] **Escenario 1: Compra y envío exitoso**
  - **Dado que** el usuario selecciona un valor de bono y completa los datos del destinatario
  - **Cuando** confirma el pago
  - **Entonces** se genera un bono con código único, QR y fecha de expiración, y se envía por correo en la fecha programada
- [ ] **Escenario 2: Redención de bono**
  - **Dado que** un usuario tiene un bono vigente
  - **Cuando** lo aplica en una compra de entradas o confitería
  - **Entonces** el saldo del bono se descuenta correctamente del total
- [ ] **Escenario 3 (Error — bono expirado):**
  - **Dado que** un bono superó su fecha de expiración
  - **Cuando** el usuario intenta canjearlo
  - **Entonces** el sistema rechaza el canje e informa que el bono está vencido

**Tareas Técnicas:**
- [ ] Task 1: [DB] Modelar `giftcards` con código único, saldo, fecha de expiración y estado.
- [ ] Task 2: [Backend] Implementar `POST /giftcards`, `GET /giftcards`, `GET /giftcards/{code}`, `POST /giftcards/redeem`.
- [ ] Task 3: [Backend] Implementar validación de expiración y de uso parcial (RN-077) del bono.
- [ ] Task 4: [Backend] Implementar envío programado del correo con diseño temático (job/scheduler para fecha de envío futura).
- [ ] Task 5: [Frontend] Construir flujo de compra de bono (selección de valor, mensaje, destinatario, diseño) y componente de redención en checkout (HU-011/HU-013).
- [ ] Task 6: [QA] Pruebas de redención total/parcial y de bono expirado.

---

## Épica: Promociones

---
### [HU-019] Cine Flash (Promoción Inteligente Automática)

**Descripción (Formato Estándar):**
Como administrador del Multicine,
Quiero que el sistema active automáticamente promociones de último minuto,
Para incrementar la ocupación de salas con baja venta.

**Prioridad:** Muy Alta | **Estimación:** 21 SP

**Criterios de Aceptación:**
- [ ] **Escenario 1: Activación automática por baja ocupación**
  - **Dado que** faltan exactamente 60 minutos para una función y su ocupación es menor al 60%
  - **Cuando** el proceso automático se ejecuta
  - **Entonces** se activa "Cine Flash" con 20% de descuento solo en entradas (máximo 3 por usuario) y se muestra el banner correspondiente
- [ ] **Escenario 2: Finalización automática**
  - **Dado que** una función con Cine Flash activo inicia
  - **Cuando** llega la hora de inicio
  - **Entonces** la promoción se desactiva automáticamente
- [ ] **Escenario 3 (Borde — no acumulable):**
  - **Dado que** una función ya tiene una promoción activa no acumulable (RN-083)
  - **Cuando** el proceso evalúa activar Cine Flash
  - **Entonces** Cine Flash no se activa sobre esa función
- [ ] **Escenario 4 (Borde — ejecución concurrente del job):**
  - **Dado que** el proceso automático se ejecuta cada 5 minutos
  - **Cuando** una ejecución anterior aún está en curso
  - **Entonces** la nueva ejecución no se solapa (lock de ejecución) evitando duplicar activaciones o notificaciones

**Tareas Técnicas:**
- [ ] Task 1: [Backend] Implementar job programado (cron cada 5 min) con lock distribuido para evitar ejecuciones concurrentes.
- [ ] Task 2: [Backend] Implementar cálculo de porcentaje de ocupación por función y regla de activación (<60%, exactamente 1 hora antes).
- [ ] Task 3: [Backend] Implementar `POST /cineflash/process`, `GET /cineflash`, `GET /movies/cineflash` con lógica de no acumulación y límite de 3 entradas.
- [ ] Task 4: [Backend] Implementar desactivación automática al iniciar la función y registro de auditoría (RN-085).
- [ ] Task 5: [Backend] Integrar disparo de notificación Push y Email al activarse una promoción (RN-086).
- [ ] Task 6: [Frontend] Construir banner visual de "Cine Flash" en tarjetas de cartelera/detalle con cuenta regresiva.
- [ ] Task 7: [QA] Pruebas de activación/desactivación automática, no acumulación y límite de entradas.

---

## Épica: Administración (Panel Administrativo — Dividida)

> **Nota de refinamiento:** La HU-020 original (34 SP) se dividió en 5 historias más pequeñas y manejables por sprint, agrupadas por subdominio funcional, conservando la épica "Administración".

---
### [HU-020a] Administración de Catálogos Base

**Descripción (Formato Estándar):**
Como administrador del Multicine,
Quiero gestionar los catálogos base (países, departamentos, ciudades, complejos, salas, tipos de sala, horarios, festivos),
Para mantener actualizada la información estructural que utiliza toda la plataforma.

**Prioridad:** Crítica | **Estimación:** 8 SP

**Criterios de Aceptación:**
- [ ] **Escenario 1: CRUD exitoso de un catálogo**
  - **Dado que** un administrador con permisos válidos gestiona el catálogo de "Complejos"
  - **Cuando** crea, edita o desactiva un complejo
  - **Entonces** el cambio se refleja inmediatamente y queda registrado en auditoría
- [ ] **Escenario 2 (Error — permisos insuficientes):**
  - **Dado que** un usuario sin rol administrativo intenta acceder al módulo de catálogos
  - **Cuando** realiza la solicitud
  - **Entonces** el sistema responde HTTP 403 y no permite la operación

**Tareas Técnicas:**
- [ ] Task 1: [Backend] Implementar CRUD para `countries, departments, cities, complexes, halls, seat_maps, hall_types, schedules, holidays` bajo `/api/admin/catalogs/*`.
- [ ] Task 2: [Backend] Proteger endpoints con JWT + verificación de rol (Admin/Superadmin).
- [ ] Task 3: [Frontend] Construir vistas CRUD tabulares (listado, crear, editar, desactivar) para cada catálogo.
- [ ] Task 4: [QA] Pruebas de control de acceso por rol y de auditoría de cambios.

---
### [HU-020b] Administración de Películas y Funciones

**Descripción (Formato Estándar):**
Como administrador del Multicine,
Quiero crear, editar, publicar y programar películas y sus funciones,
Para mantener la cartelera y la programación siempre actualizada.

**Prioridad:** Crítica | **Estimación:** 13 SP
**Dependencias:** HU-020a

**Criterios de Aceptación:**
- [ ] **Escenario 1: Publicación de película**
  - **Dado que** un administrador crea una película con todos los datos obligatorios (título, tráiler, formatos, idiomas, clasificación)
  - **Cuando** la publica
  - **Entonces** la película aparece inmediatamente en la cartelera pública (si tiene funciones activas)
- [ ] **Escenario 2: Creación de función**
  - **Dado que** un administrador crea una función para una película publicada
  - **Cuando** define sala, horario, formato y precio
  - **Entonces** la función queda disponible para compra en el sitio público
- [ ] **Escenario 3 (Error — cancelación de función con entradas vendidas):**
  - **Dado que** una función tiene entradas ya vendidas
  - **Cuando** el administrador la cancela
  - **Entonces** el sistema exige confirmar el proceso de reembolso/notificación a los compradores antes de cancelar

**Tareas Técnicas:**
- [ ] Task 1: [Backend] Implementar CRUD de películas (`/api/admin/movies`) con estados (borrador, publicada, despublicada, próximo estreno).
- [ ] Task 2: [Backend] Implementar CRUD de funciones (`/api/admin/functions`) con validación de sala/horario sin solapamiento.
- [ ] Task 3: [Backend] Implementar flujo de cancelación de función con validación de entradas vendidas y disparo de notificación/reembolso.
- [ ] Task 4: [Frontend] Construir formulario de gestión de película (con asociación de tráiler de YouTube, formatos, idiomas, clasificación) y calendario de programación de funciones.
- [ ] Task 5: [QA] Pruebas de publicación/despublicación y de cancelación de función con ventas asociadas.

---
### [HU-020c] Administración de Ventas y Confitería

**Descripción (Formato Estándar):**
Como administrador del Multicine,
Quiero gestionar órdenes, pagos, facturas, reembolsos e inventario de confitería,
Para controlar la operación comercial diaria del cine.

**Prioridad:** Alta | **Estimación:** 13 SP
**Dependencias:** HU-013, HU-020a

**Criterios de Aceptación:**
- [ ] **Escenario 1: Consulta y reembolso de una orden**
  - **Dado que** un administrador localiza una orden pagada
  - **Cuando** procesa un reembolso autorizado
  - **Entonces** el estado de la orden cambia a "Reembolsada", se libera el inventario si aplica y se notifica al cliente
- [ ] **Escenario 2: Gestión de inventario de confitería**
  - **Dado que** el administrador actualiza el stock de un producto
  - **Cuando** guarda el cambio
  - **Entonces** la disponibilidad se refleja inmediatamente en el catálogo público (HU-012)

**Tareas Técnicas:**
- [ ] Task 1: [Backend] Implementar módulos `/api/admin/orders`, `/api/admin/payments`, `/api/admin/invoices`, `/api/admin/refunds`.
- [ ] Task 2: [Backend] Implementar CRUD de productos/categorías/combos/promociones de confitería (`/api/admin/snacks`).
- [ ] Task 3: [Backend] Implementar flujo de reembolso con integración a la pasarela de pago y actualización de inventario.
- [ ] Task 4: [Frontend] Construir panel de gestión de ventas (filtros por fecha/estado) y de inventario de confitería.
- [ ] Task 5: [QA] Pruebas de reembolso completo/parcial y de actualización de inventario en tiempo real.

---
### [HU-020d] Administración de Usuarios, Roles y Seguridad (RBAC)

**Descripción (Formato Estándar):**
Como administrador del Multicine,
Quiero gestionar usuarios, membresías, roles y permisos,
Para controlar quién puede acceder y modificar información crítica del sistema.

**Prioridad:** Crítica | **Estimación:** 13 SP
**Dependencias:** HU-006, HU-007

**Criterios de Aceptación:**
- [ ] **Escenario 1: Asignación de rol**
  - **Dado que** un superadministrador asigna el rol "Operador" a un colaborador
  - **Cuando** el colaborador inicia sesión
  - **Entonces** solo puede acceder a los módulos permitidos por ese rol (RBAC)
- [ ] **Escenario 2: Bloqueo administrativo de usuario**
  - **Dado que** un administrador bloquea a un usuario por fraude/abuso
  - **Cuando** el usuario bloqueado intenta iniciar sesión
  - **Entonces** el acceso es denegado con un mensaje apropiado
- [ ] **Escenario 3 (Error — intento de escalar privilegios):**
  - **Dado que** un usuario con rol "Operador" intenta modificar roles de otros usuarios
  - **Cuando** realiza la solicitud
  - **Entonces** el sistema deniega la operación (HTTP 403) y registra el intento en auditoría

**Tareas Técnicas:**
- [ ] Task 1: [DB] Modelar `roles`, `permissions`, `role_permissions`, `user_roles`.
- [ ] Task 2: [Backend] Implementar middleware de autorización RBAC reutilizable en todos los módulos `/api/admin/*`.
- [ ] Task 3: [Backend] Implementar `/api/admin/users` (gestión, bloqueo, cambio de membresía) y `/api/admin/roles` (CRUD de roles/permisos).
- [ ] Task 4: [Frontend] Construir panel de gestión de usuarios y de asignación de roles/permisos.
- [ ] Task 5: [QA] Pruebas de control de acceso por rol y de intento de escalamiento de privilegios.

---
### [HU-020e] Reportes, Auditoría y Configuración del Sistema

**Descripción (Formato Estándar):**
Como gerente/administrador del Multicine,
Quiero acceder a reportes operativos y a los registros de auditoría del sistema,
Para supervisar la operación y garantizar la trazabilidad de todas las acciones críticas.

**Prioridad:** Alta | **Estimación:** 13 SP
**Dependencias:** HU-020a, HU-020b, HU-020c, HU-020d

**Criterios de Aceptación:**
- [ ] **Escenario 1: Consulta de reporte**
  - **Dado que** un administrador selecciona el reporte "Películas más vendidas" con un rango de fechas
  - **Cuando** genera el reporte
  - **Entonces** el sistema muestra los datos correctos y permite exportar a PDF/Excel
- [ ] **Escenario 2: Consulta de auditoría**
  - **Dado que** un administrador busca en el log de auditoría
  - **Cuando** filtra por usuario y rango de fechas
  - **Entonces** se listan las acciones realizadas con usuario, fecha, hora, IP y acción

**Tareas Técnicas:**
- [ ] Task 1: [Backend] Implementar `/api/admin/reports/*` (ventas, ocupación, confitería, bonos, membresías, Cine Flash, KPIs) con exportación PDF/Excel.
- [ ] Task 2: [Backend] Implementar módulo centralizado de auditoría (`audit_logs`) consumido por todos los módulos administrativos (RN-087/RN-090).
- [ ] Task 3: [Backend] Implementar `/api/admin/settings` para parámetros del sistema (ej. máximo de sillas por compra, tiempos de bloqueo).
- [ ] Task 4: [Frontend] Construir dashboard de reportes con gráficos, filtros y exportación.
- [ ] Task 5: [QA] Pruebas de exportación y de completitud de registros de auditoría.

---

## Épica: Inteligencia Artificial

---
### [HU-021] Chatbot Inteligente para Recomendación de Películas

**Descripción (Formato Estándar):**
Como visitante o usuario autenticado,
Quiero interactuar con un asistente virtual inteligente,
Para recibir recomendaciones de películas según mis gustos, edad, tipo de acompañantes, estado de ánimo y preferencias personales, facilitando la decisión de compra.

**Prioridad:** Muy Alta | **Estimación:** 21 SP
**Dependencias:** HU-003, HU-004, HU-006, HU-007

**Criterios de Aceptación:**
- [ ] **Escenario 1: Recomendación exitosa**
  - **Dado que** el usuario responde las preguntas guiadas del chatbot
  - **Cuando** el asistente procesa las respuestas
  - **Entonces** recomienda películas disponibles en la ciudad del usuario, respetando su rango de edad y clasificación (RN-093), en menos de 5 segundos
- [ ] **Escenario 2: Compra desde la conversación**
  - **Dado que** el chatbot recomendó una película con funciones disponibles
  - **Cuando** el usuario presiona "Comprar" desde el chat
  - **Entonces** es dirigido al flujo de selección de función (HU-009) con la película preseleccionada
- [ ] **Escenario 3 (Borde — proveedor de IA no disponible):**
  - **Dado que** el proveedor de IA (OpenAI/Bedrock) no responde dentro del timeout configurado
  - **Cuando** el usuario envía un mensaje
  - **Entonces** el chatbot muestra un mensaje de degradación elegante y ofrece escalar a soporte humano (RN-095)

**Tareas Técnicas:**
- [ ] Task 1: [Backend] Implementar `POST /ai/chat`, `POST /ai/recommendations`, `POST /ai/history`.
- [ ] Task 2: [Backend] Integrar proveedor de IA generativa (OpenAI y/o Amazon Bedrock) con prompt engineering para preguntas guiadas y restricciones de clasificación por edad.
- [ ] Task 3: [Backend] Implementar timeout y fallback (mensaje de degradación + escalamiento a soporte) ante fallos del proveedor de IA.
- [ ] Task 4: [Backend] Implementar consulta a API de cartelera/membresías desde el motor del chatbot (function calling).
- [ ] Task 5: [Frontend] Construir widget de chat flotante disponible en todas las páginas, con tarjetas de recomendación interactivas.
- [ ] Task 6: [QA] Pruebas de tiempo de respuesta (<5s), restricción de clasificación por edad y comportamiento ante caída del proveedor de IA.

---
### [HU-022] Motor de Recomendaciones Personalizadas

**Descripción (Formato Estándar):**
Como usuario autenticado,
Quiero recibir recomendaciones personalizadas,
Para descubrir nuevas películas acordes con mis gustos e historial.

**Prioridad:** Alta | **Estimación:** 13 SP

**Criterios de Aceptación:**
- [ ] **Escenario 1: Recomendación basada en historial**
  - **Dado que** un usuario tiene historial de compras suficiente
  - **Cuando** el sistema genera sus recomendaciones diarias
  - **Entonces** las recomendaciones reflejan sus géneros/formatos/horarios frecuentes
- [ ] **Escenario 2 (Borde — usuario sin historial suficiente):**
  - **Dado que** un usuario nuevo no tiene historial de compras
  - **Cuando** se solicitan sus recomendaciones
  - **Entonces** el sistema muestra recomendaciones genéricas basadas en popularidad/cartelera (estrategia "cold start"), evitando una respuesta vacía
- [ ] **Escenario 3: Configuración de preferencias**
  - **Dado que** el usuario ajusta manualmente sus preferencias
  - **Cuando** guarda los cambios
  - **Entonces** las próximas recomendaciones consideran esas preferencias explícitas

**Tareas Técnicas:**
- [ ] Task 1: [Backend] Implementar `GET /recommendations`, `GET /recommendations/history`, `POST /recommendations/preferences`.
- [ ] Task 2: [Backend] Implementar algoritmo de recomendación basado en historial (filtrado por atributos: género, horario, formato, complejo, idioma).
- [ ] Task 3: [Backend] Implementar estrategia de "cold start" para usuarios sin historial (recomendaciones por popularidad).
- [ ] Task 4: [Backend] Implementar job diario de actualización de recomendaciones (RN-096).
- [ ] Task 5: [Frontend] Construir sección "Recomendado para ti" en home/perfil con explicación del criterio de recomendación.
- [ ] Task 6: [QA] Pruebas de cold start y de exclusión de películas vistas recientemente (RN-098).

---

## Épica: Membresía

---
### [HU-023] Programa de Fidelización y Acumulación de Puntos

**Descripción (Formato Estándar):**
Como miembro del programa de fidelización,
Quiero acumular puntos por cada compra,
Para redimir beneficios y obtener descuentos exclusivos.

**Prioridad:** Alta | **Estimación:** 13 SP
**Dependencias:** HU-013

**Criterios de Aceptación:**
- [ ] **Escenario 1: Acumulación de puntos tras compra**
  - **Dado que** un usuario con membresía activa completa una compra
  - **Cuando** el pago es aprobado
  - **Entonces** se acreditan los puntos correspondientes según el valor de la compra y el nivel de membresía
- [ ] **Escenario 2: Redención de puntos**
  - **Dado que** el usuario tiene puntos suficientes
  - **Cuando** los aplica en una compra de entradas, confitería o bonos
  - **Entonces** el sistema descuenta los puntos utilizados del saldo
- [ ] **Escenario 3 (Borde — expiración de puntos):**
  - **Dado que** puntos acumulados cumplen 12 meses de antigüedad
  - **Cuando** el job mensual de vencimiento se ejecuta
  - **Entonces** dichos puntos se descuentan del saldo y se notifica al usuario
- [ ] **Escenario 4 (Borde — cambio automático de nivel):**
  - **Dado que** un usuario alcanza el umbral de puntos/compras del siguiente nivel
  - **Cuando** el sistema evalúa su membresía
  - **Entonces** el nivel se actualiza automáticamente (Bronce → Plata → Oro → Platino)

**Tareas Técnicas:**
- [ ] Task 1: [DB] Modelar `points_ledger` (histórico de movimientos), `membership_levels`.
- [ ] Task 2: [Backend] Implementar `GET /points`, `POST /points/redeem`, `GET /membership/levels`.
- [ ] Task 3: [Backend] Implementar cálculo de puntos por compra (según valor, nivel y promociones activas) integrado al flujo de pago (HU-013).
- [ ] Task 4: [Backend] Implementar job mensual de expiración de puntos (RN-099) y lógica de cambio automático de nivel (RN-101).
- [ ] Task 5: [Frontend] Construir sección de puntos en "Mi Cuenta" con historial y opción de redención en checkout.
- [ ] Task 6: [QA] Pruebas de acumulación, redención, expiración a los 12 meses y cambio automático de nivel.

---

## Épica: Control de Acceso

---
### [HU-024] Escaneo y Validación de Código QR

**Descripción (Formato Estándar):**
Como colaborador del Multicine,
Quiero escanear el código QR de las entradas,
Para validar el ingreso de los asistentes.

**Prioridad:** Alta | **Estimación:** 13 SP
**Dependencias:** HU-014

**Criterios de Aceptación:**
- [ ] **Escenario 1: Validación exitosa de ingreso**
  - **Dado que** un colaborador escanea un QR válido, pagado y correspondiente a la función/fecha/hora/sala actual
  - **Cuando** el sistema valida el código
  - **Entonces** la entrada cambia a estado "Utilizada" y se registra fecha, hora y colaborador que escaneó
- [ ] **Escenario 2 (Error — QR ya utilizado):**
  - **Dado que** un QR ya fue validado previamente
  - **Cuando** se escanea nuevamente
  - **Entonces** el sistema muestra una alerta clara de "Entrada ya utilizada" con la hora del primer ingreso
- [ ] **Escenario 3 (Error — QR inválido o inexistente):**
  - **Dado que** se escanea un código que no corresponde a ninguna entrada registrada
  - **Cuando** el sistema procesa el escaneo
  - **Entonces** se muestra un mensaje de "Código no válido" sin permitir el ingreso
- [ ] **Escenario 4 (Borde — pérdida de conectividad):**
  - **Dado que** el dispositivo de escaneo pierde conexión a internet momentáneamente
  - **Cuando** el colaborador escanea un QR
  - **Entonces** el sistema almacena el escaneo localmente y lo sincroniza al recuperar conectividad, evitando bloquear el ingreso

**Tareas Técnicas:**
- [ ] Task 1: [Backend] Implementar `POST /tickets/validate` con validación de existencia, estado de pago, función/fecha/hora/sala.
- [ ] Task 2: [Backend] Implementar registro de auditoría de escaneo (colaborador, fecha, hora, resultado).
- [ ] Task 3: [Frontend] Construir aplicación web/móvil de escaneo (cámara QR) con modo offline básico (cola local de sincronización).
- [ ] Task 4: [QA] Pruebas de QR ya utilizado, QR inválido y sincronización tras pérdida de conectividad.

---

## Épica: Business Intelligence

---
### [HU-025] Dashboard Gerencial de Indicadores (KPIs)

**Descripción (Formato Estándar):**
Como gerente del Multicine,
Quiero visualizar indicadores en tiempo real,
Para tomar decisiones estratégicas sobre la operación del negocio.

**Prioridad:** Muy Alta | **Estimación:** 21 SP
**Dependencias:** HU-020e

**Criterios de Aceptación:**
- [ ] **Escenario 1: Visualización de indicadores**
  - **Dado que** un gerente accede al dashboard
  - **Cuando** selecciona un rango de fechas (diario/semanal/mensual/anual)
  - **Entonces** se muestran los indicadores de ventas, ocupación, top películas/ciudades/complejos y demás KPIs con sus gráficos correspondientes
- [ ] **Escenario 2: Exportación de reporte**
  - **Dado que** el gerente visualiza un indicador
  - **Cuando** presiona "Exportar PDF" o "Exportar Excel"
  - **Entonces** se genera el archivo con los datos filtrados actuales
- [ ] **Escenario 3 (Error — rango de fechas inválido):**
  - **Dado que** el gerente ingresa una fecha de inicio posterior a la fecha de fin
  - **Cuando** intenta generar el reporte
  - **Entonces** el sistema muestra un mensaje de validación sin ejecutar la consulta

**Tareas Técnicas:**
- [ ] Task 1: [Backend] Diseñar modelo de agregación/precálculo (ej. vistas materializadas o tablas de resumen) para los KPIs de ventas, ocupación, confitería, Cine Flash, membresías.
- [ ] Task 2: [Backend] Implementar `GET /dashboard` con filtros por periodo y por dimensión (ciudad, complejo, película).
- [ ] Task 3: [Backend] Implementar job programado de actualización de las tablas/vistas de agregación (ej. cada hora).
- [ ] Task 4: [Backend] Implementar exportación a PDF/Excel de los indicadores filtrados.
- [ ] Task 5: [Frontend] Construir dashboard con gráficos (líneas, barras, tortas), filtros y comparativos entre periodos.
- [ ] Task 6: [QA] Pruebas de validación de rango de fechas y de consistencia de datos exportados vs. dashboard.

---

## Épica: Marketing

---
### [HU-026] Administración de Promociones y Cupones

**Descripción (Formato Estándar):**
Como administrador,
Quiero crear promociones y cupones,
Para incentivar las ventas.

**Prioridad:** Alta | **Estimación:** 13 SP
**Dependencias:** HU-020a, HU-020b

**Criterios de Aceptación:**
- [ ] **Escenario 1: Creación exitosa de promoción**
  - **Dado que** un administrador configura una promoción (tipo, fechas, alcance por ciudad/complejo/película/formato, cantidad máxima)
  - **Cuando** la guarda
  - **Entonces** la promoción queda activa dentro de su vigencia y se aplica en los flujos de compra correspondientes
- [ ] **Escenario 2 (Error — cupón fuera de vigencia):**
  - **Dado que** un usuario intenta aplicar un cupón vencido o aún no vigente
  - **Cuando** lo ingresa en el checkout
  - **Entonces** el sistema rechaza el cupón e informa el motivo
- [ ] **Escenario 3 (Error — cupo máximo por usuario alcanzado):**
  - **Dado que** un usuario ya usó un cupón el número máximo de veces permitido (RN-107)
  - **Cuando** intenta aplicarlo nuevamente
  - **Entonces** el sistema rechaza la aplicación del cupón

**Tareas Técnicas:**
- [ ] Task 1: [DB] Modelar `promotions`, `coupons`, `coupon_redemptions` con reglas de alcance y vigencia.
- [ ] Task 2: [Backend] Implementar `POST/PUT/DELETE /promotions`, `POST /coupons` con validación de vigencia, cantidad máxima y acumulabilidad (RN-105).
- [ ] Task 3: [Backend] Integrar validación de cupón en el flujo de carrito/checkout (HU-011/HU-013).
- [ ] Task 4: [Frontend] Construir panel de administración de promociones/cupones con configuración de alcance (ciudad, complejo, sala, película, categoría, formato).
- [ ] Task 5: [QA] Pruebas de cupón vencido, cupo máximo por usuario y reglas de acumulabilidad.

---

## Épica: Experiencia del Cliente

---
### [HU-027] Encuestas de Satisfacción

**Descripción (Formato Estándar):**
Como usuario,
Quiero responder una encuesta,
Para calificar mi experiencia.

**Prioridad:** Media | **Estimación:** 8 SP

**Criterios de Aceptación:**
- [ ] **Escenario 1: Envío exitoso de encuesta**
  - **Dado que** un usuario asistió a una función (compra confirmada y función ya finalizada)
  - **Cuando** completa la encuesta de satisfacción
  - **Entonces** las respuestas se almacenan asociadas a esa compra
- [ ] **Escenario 2 (Error — encuesta duplicada):**
  - **Dado que** el usuario ya respondió la encuesta para esa compra
  - **Cuando** intenta acceder nuevamente al formulario
  - **Entonces** el sistema le indica que ya fue respondida y muestra un resumen de sus respuestas
- [ ] **Escenario 3 (Borde — usuario que no asistió):**
  - **Dado que** un usuario compró entradas pero la función aún no ha ocurrido o no se validó el ingreso
  - **Cuando** intenta acceder a la encuesta
  - **Entonces** el sistema no la habilita hasta confirmar la asistencia (RN-108)

**Tareas Técnicas:**
- [ ] Task 1: [Backend] Implementar `POST /surveys` con validación de asistencia (integración con HU-024) y unicidad por compra.
- [ ] Task 2: [Backend] Implementar disparo automático de invitación a encuesta post-función (integración con HU-015).
- [ ] Task 3: [Frontend] Construir formulario de encuesta (calificaciones por categoría + comentarios + NPS).
- [ ] Task 4: [QA] Pruebas de unicidad de encuesta por compra y de habilitación solo tras asistencia confirmada.

---
### [HU-028] PQRS Integrado

**Descripción (Formato Estándar):**
Como cliente,
Quiero registrar una PQRS (Petición, Queja, Reclamo, Sugerencia o Felicitación),
Para reportar inconvenientes o realizar solicitudes.

**Prioridad:** Alta | **Estimación:** 13 SP

**Criterios de Aceptación:**
- [ ] **Escenario 1: Registro exitoso de PQRS**
  - **Dado que** un cliente completa el formulario con categoría y descripción
  - **Cuando** lo envía
  - **Entonces** se genera un número consecutivo automático, queda en estado "Recibido" y se notifica al cliente por correo
- [ ] **Escenario 2: Seguimiento de PQRS**
  - **Dado que** un cliente tiene una PQRS registrada
  - **Cuando** consulta su historial
  - **Entonces** puede ver el estado actual, comentarios y cambios de estado con sus fechas
- [ ] **Escenario 3 (Error — archivo adjunto inválido):**
  - **Dado que** el cliente intenta adjuntar un archivo que excede el tamaño máximo o tiene un formato no permitido
  - **Cuando** intenta subirlo
  - **Entonces** el sistema rechaza el archivo e informa los formatos/tamaños permitidos

**Tareas Técnicas:**
- [ ] Task 1: [Backend] Implementar `POST /pqrs`, `GET /pqrs`, `PUT /pqrs` con generación de número consecutivo automático (RN-110).
- [ ] Task 2: [Backend] Implementar manejo de adjuntos con validación de tipo/tamaño de archivo (ej. máx. 5MB, formatos PDF/JPG/PNG) y almacenamiento en bucket (ej. S3).
- [ ] Task 3: [Backend] Implementar máquina de estados (Recibido, En proceso, Resuelto, Cerrado) con SLA configurable (RN-111) y notificaciones automáticas por cambio de estado.
- [ ] Task 4: [Frontend] Construir formulario de PQRS con carga de adjuntos y vista de seguimiento/historial.
- [ ] Task 5: [QA] Pruebas de generación de consecutivo, validación de adjuntos y notificaciones por cambio de estado.

---

## Épica: Integraciones

---
### [HU-029] API Pública para Aplicaciones Externas

**Descripción (Formato Estándar):**
Como desarrollador externo autorizado,
Quiero consumir una API pública,
Para integrar aplicaciones móviles, kioscos de autoservicio y sistemas de terceros con la plataforma del Multicine.

**Prioridad:** Muy Alta | **Estimación:** 21 SP

**Criterios de Aceptación:**
- [ ] **Escenario 1: Consumo exitoso con credenciales válidas**
  - **Dado que** un consumidor externo posee credenciales (API Key u OAuth 2.0) válidas
  - **Cuando** realiza una solicitud a un endpoint público (ej. `GET /api/v1/movies`)
  - **Entonces** recibe una respuesta HTTP 200 con los datos correspondientes, dentro de su límite de consumo
- [ ] **Escenario 2 (Error — rate limit excedido):**
  - **Dado que** un consumidor externo supera el límite de solicitudes configurado
  - **Cuando** realiza una solicitud adicional
  - **Entonces** el sistema responde HTTP 429 con información del tiempo de espera antes de reintentar
- [ ] **Escenario 3 (Error — credenciales inválidas o expiradas):**
  - **Dado que** un consumidor externo usa una API Key revocada o un token OAuth expirado
  - **Cuando** intenta consumir un endpoint protegido
  - **Entonces** el sistema responde HTTP 401 sin exponer información sensible
- [ ] **Escenario 4: Documentación sincronizada**
  - **Dado que** se publica una nueva versión de un endpoint
  - **Cuando** un desarrollador externo consulta Swagger/OpenAPI
  - **Entonces** la documentación refleja el contrato vigente, incluyendo códigos de error

**Tareas Técnicas:**
- [ ] Task 1: [DevOps] Implementar/gestionar API Gateway (ej. Kong, AWS API Gateway) con versionado (`/api/v1`), throttling y rate limiting configurable por consumidor.
- [ ] Task 2: [Backend] Implementar autenticación de clientes externos (OAuth 2.0 client credentials y/o API Keys) con gestión de credenciales individuales.
- [ ] Task 3: [Backend] Exponer endpoints públicos documentados (`movies, functions, cinemas, auth, profile, orders, promotions, membership`) reutilizando los servicios internos existentes.
- [ ] Task 4: [Backend] Implementar registro de auditoría/monitoreo de todas las solicitudes externas (RN-117).
- [ ] Task 5: [DevOps] Mantener documentación Swagger/OpenAPI sincronizada con CI (generación automática desde el código).
- [ ] Task 6: [QA] Pruebas de rate limiting, credenciales inválidas/expiradas y compatibilidad hacia atrás entre versiones.

---

## Resumen de Épicas y Distribución de Sprints

| Sprint | Épicas / HUs incluidas |
|---|---|
| Sprint 1 | HU-001, HU-002, HU-003, HU-004, HU-005 |
| Sprint 2 | HU-006, HU-007, HU-008, HU-009, HU-010 |
| Sprint 3 | HU-011, HU-012, HU-013, HU-014, HU-015 |
| Sprint 4 | HU-016 a HU-029 (incluye división HU-020a a HU-020e) — **recomendación:** replanificar en Sprints 4, 5 y 6, dado que el Sprint 4 original concentraba ~230 SP, muy por encima de una capacidad típica de sprint. |

> **Recomendación adicional del Product Owner:** el "Sprint 4" original agrupaba 14 historias (incluyendo la HU-020 de 34 SP). Se sugiere redistribuir estas historias en al menos 3 sprints adicionales, priorizando primero HU-016, HU-017, HU-020a-d (fundamentos administrativos) y HU-024 (control de acceso, crítico para operación), dejando HU-021/022 (IA), HU-025 (BI) y HU-026 a HU-029 para sprints posteriores una vez el flujo transaccional esté estable en producción.
