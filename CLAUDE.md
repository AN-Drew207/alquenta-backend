# Arquitectura — api/ (backend)

NestJS 11 + Prisma 7 (driver adapter `@prisma/adapter-pg`, sin engine binario) + PostgreSQL (Neon). TypeScript, `noImplicitAny: false`. Auth JWT vía cookie httpOnly con sesión revocable server-side.

Dev: `npm run start:dev` (puerto 3001, prefijo global `/api`, Swagger en `/api/docs`).

## Estructura por módulo (Clean/Hexagonal Architecture)

Todo módulo en `src/modules/` (salvo `media`, ver más abajo) sigue 4 capas:

```
<modulo>/
  domain/
    entities/*.entity.ts        # clases con constructor privado + factories estáticos (.create()/.reconstitute())
    enums/*.enum.ts
    exceptions/*.exception.ts   # extienden shared/domain/exceptions
    repositories/*.repository.ts # clases ABSTRACTAS usadas como token de DI (no interfaces TS)
  application/
    use-cases/<caso>/*.command|query.ts + *.use-case.ts  # un par por caso de uso, implementa UseCase<TInput,TOutput>
    tasks/                       # cron jobs (@nestjs/schedule), delegan a un use-case
  infrastructure/
    persistence/prisma-*.repository.ts + *.mapper.ts   # Prisma row ⇄ entidad de dominio
    security|strategies|email/  # adaptadores concretos (bcrypt, passport-jwt, Resend)
  presentation/
    http/*.controller.ts + dto/ (class-validator + @ApiProperty) + mappers/*-response.mapper.ts
```

Regla: los use-cases nunca inyectan `PrismaService` directo, siempre el repo abstracto (`{ provide: XRepository, useClass: PrismaXRepository }` en cada `*.module.ts`).

**Módulos** (`src/modules/`):
- `auth` — registro/login/logout, sesiones (`Session` en DB, revocable), perfil, cambio password/email, cuenta (export/borrado), superadmin (gestión de cuentas ADMIN). `GET /auth/:id` (perfil público, sin auth) expone `bio`/`avatarUrl`/`website`/`memberSince`/`isVerified` siempre, y `phone`/`email` solo si el usuario activó `showWhatsapp`/`showEmail` — ver `UserResponseMapper.toPublicDto`. `isVerified` es un booleano manual (`User.verify()`/`unverify()`, `PATCH /superadmin/admins/:id/verify|unverify`) — sin criterio automático, decisión del SUPERADMIN.
- `messaging` también expone `GET /conversations/admins/:adminId/response-stats` (público) — tasa de respuesta y tiempo promedio, calculado de verdad sobre `Conversation`/`Message` (primer mensaje del cliente → primera respuesta del admin), no un placeholder. `O(n)` en conversaciones del admin (una query de mensajes por conversación) — aceptable a esta escala, no optimizado con una sola query agregada.
- `properties` — CRUD, catálogo público filtrable (incluye `search` por título, `sortBy`/`sortOrder` — ver `PropertyFilters`), límite de listados activos por plan, soft-cancel (`status=CANCELLED`) + purga programada (hard delete) vía cron. `images` es obligatorio (mínimo 1) al publicar (`CreatePropertyRequestDto`). `RENTED_OR_SOLD` es un estado terminal, real e irreversible: `Property.updateDetails()` rechaza cualquier cambio (`PropertyAlreadyFinalizedException`, 422) en cuanto `this._status === RENTED_OR_SOLD` — se aplica antes de tocar ningún campo, así que ni edición de datos ni un intento de cancelar (que también pasa por `updateDetails({status: CANCELLED})`) lo evaden. Esto afecta también a `CancelPropertyUseCase` (oversight de SUPERADMIN), que igualmente usa `updateDetails()` por debajo — no hay excepción especial para SUPERADMIN, "permanente" es literal. La transición AVAILABLE→RENTED_OR_SOLD sigue permitida (el guard solo bloquea cuando el estado *actual* ya es RENTED_OR_SOLD). `latitude`/`longitude` (`Float?`, ambos o ninguno en la práctica aunque no hay constraint que lo obligue) son opcionales — no hay geocoding en el backend, las coordenadas llegan tal cual las mandó el admin desde el picker del frontend (`@IsLatitude`/`@IsLongitude` en `CreatePropertyRequestDto` solo validan rango, no que la ubicación sea real). Listados publicados antes de este campo, o donde el admin no tocó el mapa, tienen `null` — no hay backfill, simplemente no aparecen en la búsqueda por mapa del frontend hasta que se editen. No hay filtro de bounding-box en `GET /properties`: el mapa del frontend renderiza pines sobre el mismo array ya filtrado por los demás query params, no pide un subconjunto geográfico aparte. **Contact reveal (A-09, anti-scraping de WhatsApp)**: ninguna respuesta pública o alcanzable por cualquier usuario autenticado (`GET /properties`, `GET /properties/:id`, `GET /favorites`) incluye el número crudo — usan `PropertyResponseMapper.toPublicDto()`, que solo expone `hasWhatsappContact: boolean`. `GET /properties/:id` además emite `contactRevealToken`: un token HMAC-SHA256 (`ContactRevealTokenService`, firma con `JWT_SECRET`, no un secreto propio) atado al `propertyId`, con 90s de TTL, formato `${expiresAt}.${signature}`. El botón "Ver WhatsApp" del frontend lo canjea en `POST /properties/:id/reveal-contact` (`@Public()`, `@Throttle({limit:10, ttl:60_000})` — mucho más estricto que el rate limit general de 60/60s), que revalida el token y vuelve a resolver el WhatsApp fresco (`ResolvePropertyWhatsappUseCase`: `property.whatsapp` si tiene override, si no el `phone` del admin dueño cuando tiene `showWhatsapp=true`) en vez de confiar en nada del payload del token. Token inválido/expirado/de otra propiedad → `InvalidContactRevealTokenException` (403). `toDto()` (con `whatsapp` crudo) sigue existiendo para contextos owner/SUPERADMIN (`/properties/mine`, `/properties/admin/:adminId`, publish/update/cancel) — nunca usarlo en una respuesta alcanzable por un CLIENT o por un visitante anónimo.
- `messaging` — conversaciones 1:1 ancladas a una propiedad (`@@unique([propertyId,clientId])`, findOrCreate idempotente), mensajes, dispara notificación. `POST /conversations` acepta tanto CLIENT como ADMIN (`@Roles(Role.CLIENT, Role.ADMIN)`) — un ADMIN puede escribirle a otro ADMIN sobre su propiedad (ej. representando a un cliente propio), nunca a la suya (`StartConversationUseCase` lo rechaza con `CannotMessageOwnPropertyException`, 422, si `property.adminId === command.clientId`). Los campos `clientId`/`clientName` de `Conversation` son nombres heredados de cuando solo CLIENT podía iniciar — hoy significan "quien inició el contacto" sin importar su rol; no confundir con una validación de rol real, `hasParticipant()`/`otherParticipant()` son puramente por ID. El resto del módulo (listar, responder, leer mensajes) ya era agnóstico de rol desde antes, no necesitó cambios.
- `notifications` — in-app (leído/no leído) + email best-effort (Resend), enviado **después** del commit de la transacción, nunca dentro.
- `plans` — catálogo de tiers, `activeListingsLimit: Int?` (`null` = ilimitado).
- `reports` — cualquier usuario autenticado puede reportar una propiedad (`POST /reports`, motivo de un enum fijo `ReportReason` + `details` libre opcional). Cola de moderación mínima: `GET /reports` (SUPERADMIN, filtra por `?status=`) y `PATCH /reports/:id/dismiss` — sin acciones automáticas sobre la propiedad ni notificación al reportante, solo queda el registro.
- `favorites` — cualquier usuario autenticado puede favoritear propiedades (`Favorite`, `@@unique([userId,propertyId])`). `add`/`remove` son idempotentes (upsert / deleteMany, nunca lanzan si ya estaba en ese estado). `GET /favorites/ids` es la versión liviana (solo IDs) para hidratar el ícono de corazón sin traer los payloads completos.
- `media` — **único módulo "flat"** sin capas domain/application/infra/presentation, **deliberado**: no persiste entidades propias (solo firma subidas directas a Cloudinary y hace borrado best-effort), así que las capas completas serían ceremonia sin beneficio. Vive en `media.controller.ts` + `media.service.ts` + `dto/` + `exceptions/` (excepciones de dominio propias, sin capa `domain/` dedicada).

`shared/` (módulo `@Global`): `UnitOfWork`/`TransactionContext` (`PrismaUnitOfWork` sobre `$transaction`, para casos multi-entidad atómicos), jerarquía `DomainException` → `DomainNotFoundException`/`Conflict`/`Validation`/`Forbidden`/`Unauthorized` → excepciones concretas, `DomainExceptionFilter` (global, mapea a HTTP status), guards (`JwtAuthGuard`, `RolesGuard`), decoradores (`@Public()`, `@Roles(...)`, `@CurrentUser()`).

## Modelo de datos (`prisma/schema.prisma`)

Modelos: `User`, `Session`, `Property`, `Conversation`, `Message`, `Plan`, `Notification`.

- `id` siempre `String @id @default(uuid())`, pero en la práctica el UUID se genera en la capa de dominio (`randomUUID()`) antes de persistir.
- Timestamps estándar `createdAt`/`updatedAt @updatedAt`, salvo `Session` (tiene `lastActiveAt` en vez de `updatedAt`) y `Conversation` (solo `createdAt`).
- No hay soft-delete genérico: cada entidad implementa su propia semántica ad-hoc (`User.deactivatedAt`, `Property.cancelledAt`+`status`). Borrado real = hard-delete vía cascada de FK.
- `price`/`squareMeters` son `Decimal`, nunca float. `Property.latitude`/`longitude` sí son `Float` — no son dinero, no aplica la misma regla.
- Roles: `Role` = ADMIN | CLIENT | SUPERADMIN (chequeo de igualdad exacta en `RolesGuard`, sin jerarquía).
- `User.accountType`, `twoFactorEnabled`, `notificationPrefs`/`privacyPrefs`/`generalPrefs`: existen en el schema sin lógica de negocio real todavía — **son placeholders deliberados para features futuras**, no código muerto a limpiar.
- `splitName()` (parte un `name` en `firstName`/`lastName` por el primer espacio) vive en `src/modules/auth/domain/entities/split-name.ts` — única fuente, usada por `User.create()`, `prisma/seed.ts` y `test/utils/create-test-app.ts`. No reimplementar.

## Auth

- JWT en cookie httpOnly `access_token` (o `Authorization: Bearer` como fallback). Payload `{ sub, email, role, sid }`.
- Cada JWT tiene una fila `Session` asociada; `jwt.strategy.ts` valida firma **y** hace lookup a `Session` — logout/revocación invalida el token aunque siga vigente criptográficamente.
- Guards globales (`APP_GUARD` en `app.module.ts`): `JwtAuthGuard` (respeta `@Public()`) + `RolesGuard` (respeta `@Roles(...)`). **Todo endpoint requiere auth por defecto**, hay que marcar `@Public()` explícitamente para lo contrario.
- `secure`/`sameSite` de la cookie se deciden por `process.env.RENDER === 'true'`, NO por `NODE_ENV`/`APP_ENV` (ver `auth-cookie.ts`) — README-entornos.md ya refleja esto correctamente.
- `maxAge` de la cookie (`cookieMaxAgeMs()` en `auth-cookie.ts`) se deriva de `JWT_EXPIRES_IN`, igual que el `expiresIn` de `JwtModule` en `auth.module.ts` — ambos comparten el mismo default (`JWT_EXPIRES_IN_DEFAULT_SECONDS = 604800`), no hardcodear otro valor por separado.

## Convenciones API

- Prefijo global `/api`, sin versionado.
- `ValidationPipe` global: `whitelist: true`, `forbidNonWhitelisted: true`, `transform: true`.
- Errores: excepciones de dominio tipadas → `DomainExceptionFilter` → `{ statusCode, message, error }` (incluye 503 vía `DomainServiceUnavailableException`, para el caso de `media` sin Cloudinary configurado). Todo el código de módulos usa excepciones de dominio, no `HttpException` nativas de Nest.
- Sin envelope de respuesta estándar; acciones sin cuerpo devuelven `{ ok: true }` ad-hoc.
- CORS: origin desde `FRONT_URL` (split por coma), `credentials: true`.
- Rate limiting: `@nestjs/throttler` global (`ThrottlerGuard` vía `APP_GUARD`, corre antes que los guards de auth), default 60 req/60s por IP. `POST /auth/login` 10/60s, `POST /auth/register` y `POST /auth/reactivate` 5/60s (`@Throttle` por endpoint). Se desactiva solo cuando `NODE_ENV === 'test'` (Jest lo setea automáticamente, incluso si `.env` dice `development`) — nunca gatear esto en `APP_ENV`, que en `.env` local no cambia entre test runs.

## Config / entornos

- `APP_ENV` (lógica propia: development/production/test) ≠ `NODE_ENV` (solo runtime Node, Render puede forzarlo a production sin que sea el entorno real) — variables deliberadamente separadas.
- `DATABASE_URL` (pooled, runtime app) vs `DIRECT_URL` (sin pooler, solo `prisma migrate deploy` — PgBouncer transaction-mode no sostiene el advisory lock de Migrate).
- `FRONT_URL`: usado en CORS y en links de emails.
- `assertNotPointingAtProductionDatabase()` (`env.validation.ts`) está **activo**: `PRODUCTION_DB_HOST = 'ep-empty-shape-axezc2a4'` (confirmado 2026-08-17). Aborta el boot si un proceso con `APP_ENV !== 'production'` apunta a ese host.
- `.env` local **siempre** debe apuntar a la rama "develop" de Neon (`ep-long-scene-axf0lhh2`), nunca a prod. `.env.render-dev`/`.env.render-prod` (git-ignorados, no se cargan solos) son espejo de lo que hay realmente en Render — mirar ahí en vez de adivinar. Ver también `scripts/*.sh` (`local-dev`, `local-prod`, `dev`, `prod`) para correr localmente con cada configuración sin arriesgar apuntar mal.
- Ver también memoria `project_alquenta_dev_deploy_fixes` para el mapeo Render/Neon y los incidentes de 2026-08-15 (OOM por Start Command incorrecto, P1002 por falta de `DIRECT_URL`, CORS por `FRONT_URL` mal seteado).

## Testing

- Unitarios (`src/**/*.spec.ts`): pocos archivos, ninguno de los ~30 use-cases tiene test dedicado.
- E2E (`test/*.e2e-spec.ts`): 4 specs (app/auth/messaging/properties) contra Postgres real, vía `test/utils/create-test-app.ts` (replica el bootstrap de `main.ts` a mano). Para borrar una propiedad (`DELETE /properties/:id`) primero hay que cancelarla (`PATCH /properties/:id` con `status: "CANCELLED"`) — el endpoint exige `status === CANCELLED`.
- CI corre lint, typecheck, `npm test` **y `npm run test:e2e`** (`.github/workflows/ci.yml`), ambos contra el contenedor Postgres efímero del job.
- `test/jest-e2e.json` tiene `testTimeout: 20000` (default de Jest es 5000ms) — contra Neon real, un arranque en frío de conexión + los intentos de email a Resend (que sandbox rechaza, pero igual tardan) ocasionalmente superaban los 5s y tiraban timeouts falsos, no relacionados con el código bajo test.

## Scripts

`start:dev` (dev, watch) · `start:prod` (`node dist/src/main`, el correcto para producción/Render) · `build` · `seed` (`prisma db seed`, requiere `tsx`, no `ts-node`) · `test` / `test:e2e` · `lint`.

## Migraciones y drift del historial

`prisma migrate dev` reconstruye un shadow DB reproduciendo **todas** las migraciones desde cero — y eso falla porque `20260814120000_add_first_last_name_and_rename_show_whatsapp` fue escrita a mano y deliberadamente no incluyó SQL para un drift no relacionado que ya existía en ese momento (ver el comentario en ese archivo). El efecto: **`migrate dev` ya no funciona para generar migraciones nuevas**, tira P3006/P3018 al intentar el diff.

Patrón establecido (usado en `20260817110622_add_conversation_relation_to_notification` y `20260817175448_add_favorites`): escribir el SQL de la migración a mano, crear la carpeta en `prisma/migrations/<timestamp>_<nombre>/migration.sql`, y aplicarla con `npx prisma migrate deploy` (corre migraciones pendientes en orden, sin diff ni shadow DB). Repetir este patrón para cualquier migración nueva hasta que alguien reconcilie el historial completo (tarea aparte, no trivial: implica recrear el enum `NotificationType` sin `NEW_OFFER`, dropear `Message.offerAmount`, y reconstruir el split de `Property.city` a `state`+`municipality` con los datos que había en ese momento).

## Pendientes conocidos (no urgentes)

- Redundancia `name`/`firstName`/`lastName` en `User` sigue existiendo (los tres se guardan) — `splitName()` ya está unificado, pero no se eliminó ningún campo.
- `.env.render-prod` tiene TODOs sin confirmar contra el dashboard real de Render (si `JWT_SECRET`/`RESEND_API_KEY` realmente son compartidos con dev, o deberían separarse).
- Falta confirmar si `CLOUDINARY_FOLDER_PREFIX=alquenta-dev` está seteada en Render dev (si no, dev sube medios a la misma carpeta que prod) — no verificable desde acá, hay que mirar el dashboard.
