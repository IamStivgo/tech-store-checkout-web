# AGENTS.md

Guidance for AI coding assistants working in this repository.

## Project

Mobile-first checkout SPA for a tech accessories store. The user picks a product, enters card and delivery data, reviews a summary and pays with a credit card through a third-party payment provider (sandbox only). Built with React 19, TypeScript (strict), Redux Toolkit, React Router, Vite and SCSS Modules.

## Architecture rules (hybrid Atomic Design)

- `src/components/{atoms,molecules,organisms,templates}`: pure UI. Props only — never import `store/`, `services/`, `modules/` or `context/`.
- Each atomic level imports only lower levels: molecules → atoms; organisms → molecules and atoms; templates → organisms, molecules and atoms.
- `src/modules/<module>`: business modules that own their pages, connected components, store slices, schemas and hooks. A module uses another module only through its `index.ts`.
- `src/store`, `src/services`, `src/hooks`, `src/context`, `src/config`, `src/data`, `src/utils`: cross-cutting layers. `utils`, `data` and `config` import nothing from the app.
- All business state lives in Redux (Flux). Contexts hold no business state.
- `src/config/env.ts` is the only place that reads `import.meta.env`.
- These rules are enforced by `eslint-plugin-boundaries`; do not disable them.
- Each component lives in its own folder: `Button/Button.tsx`, `Button.module.scss`, `index.ts`. Its test lives in `test/`, mirroring `src/` (`test/components/atoms/Button/Button.test.tsx`).

## Code conventions

- Identifiers, code, comments and commit messages in English. User-facing text in Spanish (es-CO). The README is in Spanish.
- No `export default`, no `any`, small components and functions, no magic numbers.
- Styles: SCSS Modules with design tokens as CSS custom properties; Flexbox and Grid; no UI component libraries.
- Mobile-first, responsive from 320 px, accessible (WCAG 2.2 AA): keyboard navigation, visible focus, `prefers-reduced-motion`.
- Comments only for non-obvious constraints.

## Testing

- Jest + React Testing Library + user-event. Test behavior from the user's perspective, following the AAA pattern.
- Tests never live in `src/`: they go in `test/` with the same path as the file they test and import it relatively. `tsconfig.test.json` type-checks them with the app settings; `tsconfig.jest.json` only adapts them for ts-jest (CommonJS).
- Components in `src/components/` are tested with props only (no store, no API).
- Coverage gates: statements, lines and functions ≥ 85 %, branches ≥ 81 %.

## Security and compliance (mandatory)

- Never write the name of the company that proposed this exercise anywhere in the repository: code, comments, configuration, commit messages, branch names or docs. Refer to it as "payment provider".
- Never commit secrets, keys or real provider URLs; use placeholders and `.env` (git-ignored).
- Card number (PAN) and CVC are tokenized in the browser and never stored (state, storage or logs) nor sent to the backend.
- Amounts shown are informative; the backend always computes the charged total.

## Commands

```bash
nvm use                 # Node.js 24
npm ci
npm test                # Jest with coverage gates
npm run typecheck
npm run lint
npm run lint:styles
npm run format:check
npm run contract:check  # API types match the api release pinned in contract.json
npm run build
```

CI (`.github/workflows/ci.yml`) runs all of the above plus `npm audit` on every pull request and push to `develop` and `main`. Actions are pinned by commit SHA.

## API contract

- `contract.json` pins the api release (`version` is its git tag). `npm run contract:sync` downloads that release's `openapi.json` and regenerates `src/services/api/generated/api-contract.ts`; never edit that file by hand. CI runs `contract:check`.
- To adopt a new API version: bump `contract.json`, run `npm run contract:sync`, fix type errors, commit both files.
- Use the generated `paths`/`components` types for API calls instead of redeclaring response shapes.

## Deployment

- `deploy.yml` runs after CI succeeds on `main`, in the `production` environment, with the OIDC role from `secrets.AWS_DEPLOY_ROLE_ARN`. Resource names come from `/checkout-app/prod/deploy/*`; never hard-code them or print the AWS account ID.
- Upload: `assets/` (hashed) as immutable and never deleted, other files for one hour, `index.html` with `no-cache`; `api-docs/` belongs to the api pipeline and is never touched. Only `/index.html` is invalidated (every SPA route is served from it).

## Git workflow

- Branches: `main` (stable), `develop` (integration), `feature/HU-xxx-description`.
- Conventional Commits, enforced by commitlint; lint-staged runs ESLint, Stylelint and Prettier on staged files.
- The developer creates branches and commits; assistants propose changes and commit messages.
