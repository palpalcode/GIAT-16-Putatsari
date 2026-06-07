# [Project name]

_Replace the heading above with the project's name, and this line with one sentence describing what this app does for users._

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

_Populate as you build — short repo map plus pointers to the source-of-truth file for DB schema, API contracts, theme files, etc._

## Architecture decisions

_Populate as you build — non-obvious choices a reader couldn't infer from the code (3-5 bullets)._

## Product

_Describe the high-level user-facing capabilities of this app once they exist._

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- Form state in the website pages must use the generated union types (e.g. `KasInputType`, `IssueInputStatus`) for enum-like fields, not plain `string`. Option arrays (`{ id: "..." }`) infer `id` as `string`, so cast at the setter call site (`cat.id as KasInputCategory`). Plain `string` form fields fail `tsc` against the Orval-generated `*Input`/`*Update` types.
- Auth is role-based: passwords map to roles in `api-server/src/lib/auth.ts`. ketua/sekretaris always have full edit access; managed roles (bendahara) start with NO access and the ketua grants per-resource edit rights via `/kelola-akses`. `ensureSeeded()` only inserts missing rows (defaulting `canEdit: false`); it never overwrites existing grants.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
