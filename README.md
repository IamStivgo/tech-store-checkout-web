# Tech Store — Frontend (checkout con tarjeta de crédito)

| Repositorio                                                                         | Contenido                                      |
| ----------------------------------------------------------------------------------- | ---------------------------------------------- |
| [tech-store-checkout-web](https://github.com/IamStivgo/tech-store-checkout-web)     | Frontend: SPA React (este repositorio)         |
| [tech-store-checkout-api](https://github.com/IamStivgo/tech-store-checkout-api)     | Backend: API NestJS, Swagger y modelo de datos |
| [tech-store-checkout-infra](https://github.com/IamStivgo/tech-store-checkout-infra) | Infraestructura: Terraform y despliegue en AWS |

SPA mobile-first en React + Redux Toolkit para comprar accesorios tecnológicos con tarjeta de crédito a través de una pasarela de pagos (sandbox provisto en la prueba).

## Demo

- **App:** https://d7vch0fsx8645.cloudfront.net
- **Swagger del API:** https://d7vch0fsx8645.cloudfront.net/api-docs/index.html
- **Tarjetas de prueba** (cualquier nombre, CVC de 3 dígitos y fecha futura): `4242 4242 4242 4242` → aprobada; `4111 1111 1111 1111` → rechazada.

## Funcionalidades

Flujo de 5 pasos: **Producto → Tarjeta y entrega → Resumen → Resultado → Producto**.

1. **Catálogo y producto:** grilla responsive (1 a 4 columnas) con stock en tiempo real, página de producto con cantidad (hasta el máximo por pedido) y aviso de tarifas.
2. **Tarjeta y entrega (modal):** tarjeta con detección de marca y validación (Luhn, vencimiento, CVC), datos del cliente y dirección con departamento y municipio (DIVIPOLA). Al continuar, la tarjeta se **tokeniza en el navegador**.
3. **Resumen (backdrop):** desglose calculado por el API (productos, tarifa de servicio, envío por zona, envío gratis), fecha estimada de entrega y las dos **aceptaciones** obligatorias con enlace a sus documentos.
4. **Pago y resultado:** crea el cliente y la transacción (que reserva el stock) y paga con claves de idempotencia; la página `/transactions/:id` muestra el pago aprobado (referencia, total y fecha de entrega), rechazado (con el motivo) o vencido, y consulta de nuevo mientras sigue pendiente.
5. **Regreso a la tienda:** el checkout se limpia y el stock se vuelve a consultar.

Ante una recarga se conserva lo escrito en el formulario (nunca la tarjeta) y, si ya se había llegado al resumen, se pide la tarjeta otra vez.

## Seguridad en el cliente

- El número y el CVC solo existen en el formulario: se cifran (JWE, RSA-OAEP-256 + A256GCM) y se tokenizan directo con la pasarela; al estado de Redux, al almacenamiento y al API solo llegan la marca, los últimos 4 dígitos y el token (este último solo en memoria).
- La llave de cifrado se descarga del API del mismo origen, porque la pasarela no permite leerla desde el navegador (CORS).
- Los montos que se muestran son informativos: el API calcula y firma el total.
- CloudFront envía CSP estricta (`connect-src` limitado al propio origen y a la pasarela), HSTS y demás headers de seguridad (repositorio de infraestructura).

## Diseño y accesibilidad

- Design system propio con tokens en SCSS (colores, tipografía fluida, espacios y radios) y sin librerías de componentes.
- Mobile-first desde 320 px, sin scroll horizontal; foco visible, navegación por teclado, modales con foco atrapado y `prefers-reduced-motion`.
- Imágenes de producto propias (ilustraciones en `design/product-illustrations/`) en AVIF, WebP y JPEG a 320, 640 y 960 px (`npm run images:build`).

## Stack

| Componente  | Elección                                                              |
| ----------- | --------------------------------------------------------------------- |
| Framework   | React 19 + TypeScript (modo estricto)                                 |
| Build       | Vite                                                                  |
| Estado      | Redux Toolkit (Flux) + RTK Query                                      |
| Rutas       | React Router                                                          |
| Formularios | React Hook Form + Zod                                                 |
| Estilos     | SCSS Modules + CSS custom properties (sin librería de componentes)    |
| Pruebas     | Jest + React Testing Library, en `test/` con la misma ruta que `src/` |

## Arquitectura: Atomic Design híbrido

La UI pura se organiza por niveles atómicos y la lógica de negocio vive en módulos:

```
src/
├── components/          # UI pura: solo props, sin Redux ni API
│   ├── atoms/
│   ├── molecules/
│   ├── organisms/
│   └── templates/
├── modules/             # Módulos de negocio con sus páginas, componentes conectados y estado
│   ├── catalog/
│   ├── product/
│   ├── checkout/
│   ├── payment-result/
│   └── not-found/
├── store/               # Configuración del store de Redux
├── services/            # API (RTK Query), tokenización de tarjeta y persistencia
├── hooks/               # Hooks genéricos
├── context/             # Contextos sin estado de negocio
├── config/              # Variables de entorno, rutas y constantes
├── data/                # Textos y catálogos estáticos
├── utils/               # Funciones puras
├── styles/              # Tokens, mixins y estilos base
└── assets/              # Logos e ilustraciones
```

Las reglas de dependencia entre capas se verifican con ESLint (`eslint-plugin-boundaries`): por ejemplo, un átomo no puede importar moléculas ni el store, y un módulo solo puede usar otro módulo a través de su `index.ts`.

## Estado con Redux Toolkit (Flux)

- `store/` combina el slice `checkout` (paso actual, producto, cantidad, borrador y detalles sin tarjeta) y la caché de RTK Query.
- `services/api/` define los endpoints con RTK Query (catálogo, ubicaciones, cotización, clientes, transacciones, pagos) y normaliza los errores Problem Details.
- El checkout se guarda en `localStorage` con lista blanca, versión y vencimiento de 30 minutos; los datos de tarjeta nunca se guardan.

## Pruebas y cobertura

| Statements | Branches | Functions | Lines   |
| ---------- | -------- | --------- | ------- |
| 99,64 %    | 96,01 %  | 99,62 %   | 99,61 % |

Medido el 2026-09-28 con `npm test` (389 pruebas en 70 suites). Umbrales del CI: 85 % en statements, lines y functions y 81 % en branches. Las pruebas viven en `test/` con la misma ruta que `src/`.

**E2E con Playwright** (`npm run test:e2e`, en el CI dentro de la imagen oficial): catálogo, producto, formulario, recarga y la compra completa aprobada y rechazada, en iPhone SE (WebKit, 320 px), Pixel 7 (Chromium) y Firefox de escritorio (1440 px), con el API simulado por `page.route`. Además, la compra real se verificó en producción desde el navegador con las dos tarjetas de prueba.

## Ejecución local

Requisitos: Node.js 24 (`nvm use`) y el API corriendo en `http://localhost:3000` ([tech-store-checkout-api](https://github.com/IamStivgo/tech-store-checkout-api#ejecución-local)).

```bash
npm ci
npm run dev   # http://localhost:5173, con proxy de /api hacia el API local
```

Por defecto la tarjeta se tokeniza con un tokenizador falso que solo funciona con la pasarela falsa del API (`4242…` aprobada, `4111…` rechazada); no se llama a la pasarela real.

| Script                   | Descripción                                                                            |
| ------------------------ | -------------------------------------------------------------------------------------- |
| `npm run lint`           | ESLint con reglas estrictas de TypeScript, React, accesibilidad y capas                |
| `npm run lint:styles`    | Stylelint sobre los archivos SCSS                                                      |
| `npm run format:check`   | Verifica el formato con Prettier                                                       |
| `npm run format`         | Aplica el formato con Prettier                                                         |
| `npm test`               | Pruebas con Jest y umbrales de cobertura                                               |
| `npm run typecheck`      | Verifica los tipos con TypeScript                                                      |
| `npm run build`          | Genera el build de producción en `dist/`                                               |
| `npm run contract:sync`  | Genera los tipos del API desde el `openapi.json` del release fijado en `contract.json` |
| `npm run contract:check` | Verifica que los tipos generados coincidan con esa versión (se ejecuta en CI)          |
| `npm run test:e2e`       | Pruebas E2E con Playwright (en Ubuntu 20.04, dentro de la imagen oficial de Docker)    |
| `npm run images:build`   | Genera las imágenes de producto desde las ilustraciones SVG                            |

### Ejecución local con Docker

La tienda completa (web, API y DynamoDB Local) sin Node.js ni cuenta de AWS. Necesita el repositorio del API clonado al lado de este (`../tech-store-checkout-api`), porque este `docker-compose.yml` incluye el suyo:

```bash
docker compose up --build    # http://localhost:8080 (WEB_PORT=8088 para usar otro puerto)
docker compose down -v       # detiene todo y borra los datos
```

- `web`: build de Vite servido por nginx sin privilegios (`Dockerfile` multi-stage), con las rutas de la SPA, `/api` redirigido al contenedor del API (mismo origen que en producción) y los headers de seguridad.
- `api`, `api-init` y `dynamodb`: el stack del repositorio del API, con las tablas y el catálogo creados automáticamente.
- Pagos con la pasarela falsa, sin llamar a la real: `4242 4242 4242 4242` → aprobado, `4111 1111 1111 1111` → rechazado.

## Contrato con el API

El API publica su contrato OpenAPI en cada release ([tech-store-checkout-api](https://github.com/IamStivgo/tech-store-checkout-api/releases)). `contract.json` fija la versión que usa este frontend; `npm run contract:sync` descarga ese `openapi.json` y genera los tipos en `src/services/api/generated/api-contract.ts`, y el CI falla (`contract:check`) si no coinciden.

## Despliegue

`deploy.yml` se ejecuta cuando el CI de `main` termina en verde (o manualmente), tras la aprobación del environment `production`, con un rol OIDC de AWS (secret `AWS_DEPLOY_ROLE_ARN`, sin llaves). Lee el bucket, la distribución y la URL de los parámetros SSM `/checkout-app/prod/deploy/*`, sube los assets con hash como inmutables e `index.html` sin caché, invalida `/index.html` y prueba la URL pública (`/`, una ruta de la SPA, `/api/v1/health` y los headers de seguridad).

## Flujo de trabajo

- Ramas: `main` (estable), `develop` (integración) y `feature/HU-xxx-descripcion`.
- Commits en inglés con [Conventional Commits](https://www.conventionalcommits.org/), validados por commitlint.
- Antes de cada commit, lint-staged ejecuta ESLint, Stylelint y Prettier sobre los archivos modificados.
- Integración continua con GitHub Actions en cada PR y push a `develop` y `main`: lint, estilos, formato, tipos, pruebas con umbrales de cobertura, build y `npm audit`. Dependabot propone actualizaciones semanales de npm y de las acciones.

## Decisiones y limitaciones

- **Atomic Design híbrido:** la UI pura por niveles atómicos (probada solo con props) y la lógica en módulos de negocio; las capas se verifican con ESLint.
- **Resultado en su propia ruta** (`/transactions/:id`): se puede recargar o compartir y sigue consultando el estado mientras el pago está pendiente.
- **Pendiente:** cuenta regresiva para volver a la tienda desde el resultado, recuperar un pago en curso si se recarga justo mientras se procesa, y tema oscuro.

## Autor

Stiven · [@IamStivgo](https://github.com/IamStivgo)
