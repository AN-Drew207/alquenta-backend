# Entornos

Dos entornos, cada uno con su propia rama, base de datos y servicio de Render.
`main` es producción; `develop` es donde se prueba todo. Ninguna otra rama
larga viva — el trabajo en curso pasa por `feature/*` con PR hacia `develop`.

| | `main` (producción) | `develop` (pruebas) |
| --- | --- | --- |
| Rama | `main` | `develop` |
| Backend (Render) | `gestion-inmueble-api` | `gestion-inmueble-api-dev` |
| Base de datos (Neon) | branch `main` | branch `develop` |
| Frontend | dominio de producción (Vercel Production) | preview de Vercel para `develop` |
| Cloudinary | carpeta `alquenta/...` | carpeta `alquenta-dev/...` (`CLOUDINARY_FOLDER_PREFIX=alquenta-dev`) |

## Flujo de trabajo

```
feature/mi-cambio → PR → develop → (probar en el preview) → PR → main
```

- Todo el trabajo nuevo sale de `develop` (o de una rama `feature/*` con PR
  hacia `develop`).
- `main` solo recibe merges vía PR desde `develop`, nunca commits directos.
- Cada PR corre CI (`.github/workflows/ci.yml`): install, lint, `tsc --noEmit`
  y los tests unitarios contra una base Postgres efímera.

## Variables de entorno

Ver `.env.example` para la lista completa comentada. Puntos importantes:

- **`APP_ENV`** (`development` | `production` | `test`) es quién distingue
  el entorno a nivel de aplicación — separado de `NODE_ENV`, que Render
  puede forzar a `production` por optimización de build incluso en el
  servicio de pruebas.
- Las cookies de sesión (`secure`, `sameSite`) **no** dependen de `NODE_ENV`
  ni de `APP_ENV` — dependen de `process.env.RENDER === 'true'`
  (`src/modules/auth/presentation/http/auth-cookie.ts`), variable que Render
  setea solo él mismo. Ninguna otra plataforma (local, otro host) la define,
  así que ahí la cookie usa los defaults de desarrollo. Esto es deliberado:
  `NODE_ENV`/`APP_ENV` no distinguen de forma confiable "desplegado" de
  "local" (Render puede forzar `NODE_ENV=production` incluso en el servicio
  de pruebas), y el backend de pruebas corre en HTTPS hablando con un
  preview de Vercel en otro dominio, donde la cookie necesita `secure`+
  `sameSite=none` para funcionar.
- **`FRONT_URL`**: se usa tanto para CORS como para armar los links que
  van en los correos (invitación de admin, cambio de email). No existe una
  variable separada `CORS_ORIGINS` en el código — es la misma `FRONT_URL`,
  y acepta una lista separada por comas si hace falta más de un origen.
- **`DATABASE_URL`**: nunca la connection string de producción en un
  proceso que no sea `APP_ENV=production`. Al arrancar, `src/config/env.validation.ts`
  corta el boot si detecta esa combinación — pero el chequeo solo funciona
  una vez que completes `PRODUCTION_DB_HOST` en ese archivo con el host de
  Neon de producción (se dejó en blanco a propósito, ver el comentario ahí).
- **`CLOUDINARY_FOLDER_PREFIX`**: separa las carpetas de Cloudinary por
  entorno sin necesitar credenciales distintas. Producción puede dejarlo
  sin definir (usa `alquenta` por defecto); en el servicio de pruebas,
  `alquenta-dev`.

## Advertencia

**La connection string de producción no va nunca en Render "-dev", en tu
`.env` local de trabajo diario, ni en ningún secret de CI.** Si necesitás
datos reales para depurar algo puntual, hacelo desde una rama de Neon
aparte y bórrala después — nunca apuntes un proceso no productivo
directamente a la base `main` de Neon.

## Problemas conocidos, no relacionados a este cambio

- `npm test` corre contra una base Postgres real: local usa la
  `DATABASE_URL` de tu `.env`, CI levanta un contenedor Postgres efímero.
