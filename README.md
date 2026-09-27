# Tech Store — Frontend (checkout con tarjeta de crédito)

| Repositorio                                                                         | Contenido                                      |
| ----------------------------------------------------------------------------------- | ---------------------------------------------- |
| [tech-store-checkout-web](https://github.com/IamStivgo/tech-store-checkout-web)     | Frontend: SPA React (este repositorio)         |
| [tech-store-checkout-api](https://github.com/IamStivgo/tech-store-checkout-api)     | Backend: API NestJS, Swagger y modelo de datos |
| [tech-store-checkout-infra](https://github.com/IamStivgo/tech-store-checkout-infra) | Infraestructura: Terraform y despliegue en AWS |

SPA mobile-first en React + Redux Toolkit para comprar accesorios tecnológicos con tarjeta de crédito a través de una pasarela de pagos en modo sandbox.

> Proyecto en construcción. Este README se completa a medida que avanza la implementación.

## Stack

| Componente  | Elección                                                           |
| ----------- | ------------------------------------------------------------------ |
| Framework   | React 19 + TypeScript (modo estricto)                              |
| Build       | Vite                                                               |
| Estado      | Redux Toolkit (Flux) + RTK Query                                   |
| Rutas       | React Router                                                       |
| Formularios | React Hook Form + Zod                                              |
| Estilos     | SCSS Modules + CSS custom properties (sin librería de componentes) |
| Pruebas     | Jest + React Testing Library                                       |

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
│   ├── payment-status/
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

## Ejecución local

Requisitos: Node.js 24 (`nvm use`).

```bash
npm ci
```

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

## Contrato con el API

El API publica su contrato OpenAPI en cada release ([tech-store-checkout-api](https://github.com/IamStivgo/tech-store-checkout-api/releases)). `contract.json` fija la versión que usa este frontend; `npm run contract:sync` descarga ese `openapi.json` y genera los tipos en `src/services/api/generated/api-contract.ts`, y el CI falla (`contract:check`) si no coinciden.

## Despliegue

`deploy.yml` se ejecuta cuando el CI de `main` termina en verde (o manualmente), tras la aprobación del environment `production`, con un rol OIDC de AWS (secret `AWS_DEPLOY_ROLE_ARN`, sin llaves). Lee el bucket, la distribución y la URL de los parámetros SSM `/checkout-app/prod/deploy/*`, sube los assets con hash como inmutables e `index.html` sin caché, invalida `/index.html` y prueba la URL pública (`/`, una ruta de la SPA, `/api/v1/health` y los headers de seguridad).

## Flujo de trabajo

- Ramas: `main` (estable), `develop` (integración) y `feature/HU-xxx-descripcion`.
- Commits en inglés con [Conventional Commits](https://www.conventionalcommits.org/), validados por commitlint.
- Antes de cada commit, lint-staged ejecuta ESLint, Stylelint y Prettier sobre los archivos modificados.
- Integración continua con GitHub Actions en cada PR y push a `develop` y `main`: lint, estilos, formato, tipos, pruebas con umbrales de cobertura, build y `npm audit`. Dependabot propone actualizaciones semanales de npm y de las acciones.
