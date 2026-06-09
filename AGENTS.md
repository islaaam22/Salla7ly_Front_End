# AI Agent Guidance for Salla7ly

## Purpose
This file helps AI coding agents understand the repository structure, common workflows, and where to make safe changes.

## Project type
- Angular application generated with Angular CLI 20.3.x
- Uses standalone-style app entrypoints rather than a classic `app.module.ts`
- UI is built with Bootstrap and Angular components/pages

## Important commands
- `npm start` → runs `ng serve` on `http://localhost:4200`
- `npm run build` → compiles production build with Angular build system
- `npm test` → executes unit tests via Karma

## Key directories
- `src/app/` — main app code
- `src/app/pages/` — page components and their templates/styles
- `src/app/shared/` — reusable UI pieces like `navbar` and `footer`
- `src/app/services/` — frontend services such as auth
- `src/app/app.routes.ts` — client-side route definitions
- `src/app/app.ts` — app shell / root component setup

## Code conventions
- HTML, CSS, and TypeScript are colocated by page/component folder
- Templates use Angular template syntax and Bootstrap classes
- Tests are present for some pages and services with `.spec.ts`

## Agent behavior
- Prefer editing code under `src/app/` when changing UI or app behavior
- Avoid adding backend-specific files; this repo is frontend-only
- Respect Angular CLI conventions and use existing component/page folder structure
- Use `npm test` after modifying logic that affects existing `.spec.ts` files

## Notes for reviewers
- There is no `AGENTS.md` or `.github/copilot-instructions.md` in the repository yet, so this file is the primary AI guidance source
- Use `README.md` for basic Angular CLI operations and refer to it for development server/build instructions
