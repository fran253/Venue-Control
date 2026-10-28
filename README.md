# Venue Control

Aplicación móvil interna (React Native) para gestionar los **espacios operativos** de un gran festival, con un backend serverless en TypeScript sobre AWS (API Gateway + Lambda) desplegado con Serverless Framework.

## Arquitectura

```
React Native (mobile/)  →  HTTP  →  API Gateway  →  Lambda Node.js (backend/)  →  Respuesta JSON  →  Logs (CloudWatch)
```

- **mobile/**: app Expo + React Native (TSX). Se puede ver en el navegador con React Native Web. Solo usa `fetch` contra la URL pública de la API; no lleva SDK de AWS ni credenciales.
- **backend/**: una función Lambda por operación, en TypeScript. `serverless.yml` conecta cada ruta HTTP con su handler compilado (`dist/zones/*.handler`). En local lo ejecuta `serverless-offline`.

```
venue-control/
├── backend/
│   ├── serverless.yml
│   └── src/zones/        list, get, create, replace, update, delete + model (tipos, catálogo, validación)
├── mobile/
│   ├── App.tsx           pantallas: listado, detalle, nuevo, editar, estado, eliminar
│   └── src/              api.ts (cliente HTTP), types.ts, ZoneForm.tsx, styles.ts
└── README.md
```

## Contrato de la API

Una zona se representa así:

```json
{ "id": "ZONE-07", "name": "Garden Stage", "capacity": 2500, "status": "OPEN" }
```

| Método | Ruta | Qué hace | Respuestas |
|---|---|---|---|
| GET | `/zones` | Lista las zonas | 200 |
| GET | `/zones/{id}` | Detalle de una zona | 200, 404 |
| POST | `/zones` | Crea una zona (simulado) | 201, 400 |
| PUT | `/zones/{id}` | Sustituye la zona completa | 200 (`REPLACED`), 400, 404 |
| PATCH | `/zones/{id}` | Cambia solo `status` | 200 (`UPDATED`), 400, 404 |
| DELETE | `/zones/{id}` | Elimina la zona (simulado) | 200 (`DELETED`), 404 |

### Validación y errores

- `name`: texto de 1 a 60 caracteres.
- `capacity`: entero entre 1 y 100000.
- `status`: `OPEN`, `FULL` o `CLOSED`.
- PUT exige los tres campos; PATCH admite únicamente `status`.
- Los errores devuelven JSON `{ "message": "..." }` con el motivo concreto: 400 (body o valor inválido), 404 (zona inexistente).

## Ejecución local

Requisitos: Node 22, y haber iniciado sesión en Serverless Framework (`npx serverless login`).

Backend (en `backend/`):

```bash
npm install
# Serverless Offline lee estas variables al arrancar (valores cualesquiera en local):
export STUDENT_CODE=alumnoXX AWS_REGION=us-east-1 LAMBDA_ROLE_ARN=arn:aws:iam::000000000000:role/local
npm start        # compila y arranca Offline en http://localhost:3000/dev
```

App (en `mobile/`):

```bash
npm install
npm run web      # React Native Web en el navegador
```

`mobile/src/api.ts` → `API_URL` apunta a `http://localhost:3000/dev` para trabajar en local.

Comprobar tipos: `npm run typecheck` en `backend/` y en `mobile/`.

## Despliegue en AWS (AWS Academy)

1. Iniciar el laboratorio y configurar el perfil `academy` con las credenciales del laboratorio **en `~/.aws/credentials`, nunca dentro del repositorio**.
2. En la terminal, exportar los valores reales:

   ```bash
   export AWS_PROFILE=academy
   export AWS_REGION=<región autorizada>
   export STUDENT_CODE=<código de alumno>
   export LAMBDA_ROLE_ARN=<ARN completo del LabRole>
   ```

3. Desde `backend/`:

   ```bash
   npx serverless deploy --stage dev --region "$AWS_REGION"
   npx serverless info --stage dev --region "$AWS_REGION"   # muestra los endpoints
   ```

4. Copiar la URL base (hasta `/dev`, sin `/zones`) en `API_URL` de `mobile/src/api.ts`. **El cambio local ⇄ cloud es solo esa línea.** Para volver a local hay que cambiar `API_URL` a `http://localhost:3000/dev` y arrancar `npm start` en `backend/`.
5. Probar con curl / Thunder Client y ver los logs de una invocación:

   ```bash
   curl -i "<URL_BASE>/zones"
   npx serverless logs -f listZones --stage dev --region "$AWS_REGION"
   ```

## Decisiones de diseño

- **Una Lambda por operación**: cada ruta de `serverless.yml` tiene su propio handler, fácil de aislar en los logs.
- **Lógica compartida en `model.ts`**: tipos, catálogo, respuesta JSON y validación en un único sitio.
- **Estados `OPEN`, `FULL`, `CLOSED`**: el contrato solo muestra `OPEN` y `FULL`; se añade `CLOSED` para cubrir una zona cerrada al público.
- **Validación en el servidor**: el formulario de la app no filtra nada; el backend es quien responde 400 con el motivo, y la app lo muestra.
- **CORS activado** (`cors: true`) para que React Native Web pueda llamar a la API desde el navegador.
- **Variables de entorno** (`STUDENT_CODE`, `AWS_REGION`, `LAMBDA_ROLE_ARN`) en `serverless.yml`: nada de valores de la cuenta dentro del repo.

## Limitaciones declaradas

- **Sin persistencia**: el catálogo es fijo (4 zonas). POST, PUT, PATCH y DELETE validan y responden como si hubieran funcionado (`ZONE-NEW`, `REPLACED`, `UPDATED`, `DELETED`) pero no modifican nada; tras cada escritura el listado sigue igual.
- **Sin autenticación**: la API es pública.

## Evidencias de entrega

Pendientes de adjuntar en `evidencias/` y enlazar aquí (solo evidencias reales, sin credenciales):

- [ ] Captura de `serverless-offline` con las rutas.
- [ ] Thunder Client: GET, POST, PUT, PATCH y DELETE.
- [ ] Al menos tres operaciones con curl.
- [ ] App funcionando contra el backend local.
- [ ] Endpoint AWS obtenido del despliegue.
- [ ] Thunder / curl contra AWS.
- [ ] App consumiendo AWS.
- [ ] Logs de una invocación cloud provocada desde la app.

No hay Access Key, Secret Key ni Session Token en el repositorio (`.gitignore` excluye `.aws/`, `.env` y los artefactos de build).
