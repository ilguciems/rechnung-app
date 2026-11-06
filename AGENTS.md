# Agent guide: rechnung-app

Local-first invoice generator for German small businesses: Next.js 16 (App Router), TypeScript, Prisma + Postgres, better-auth.

This file is the entry point. Deeper material lives in:

| Doc                                          | Contents                                                          |
| -------------------------------------------- | ----------------------------------------------------------------- |
| [docs/architecture.md](docs/architecture.md) | Auth internals, ACL, invite flows, data layer, debugging recipes  |
| [docs/product.md](docs/product.md)           | Users, brand, design principles, WCAG AA requirements             |
| [README.md](README.md)                       | User-facing overview, setup, deployment                           |
| `node_modules/next/dist/docs/`               | Bundled Next.js 16 guides — authoritative over your training data |

## Ground rules

- **Language:** everything committed is English — code, comments, docs, commit messages. Only user-facing UI copy is German (`messages/de.json`).
- **Package manager is pnpm** (pinned in `packageManager`). Never use `npm install` or bare `npx`; use `pnpm` and `pnpm exec`.
- **Line endings are LF** (`.gitattributes`, `.editorconfig`, `files.eol`). Biome enforces formatting.
- **Never edit `app/generated/prisma/**`** — it is produced by `prisma generate` and is gitignored.
- **Pushing to `main` deploys to production.** Dokploy watches the branch and runs `pnpm start`, which executes `prisma migrate deploy` — a merged migration hits the live database immediately.

## Commands

| Task             | Command                                                                                |
| ---------------- | -------------------------------------------------------------------------------------- |
| Install          | `pnpm install`                                                                         |
| Dev server       | `pnpm dev` → http://localhost:3000                                                     |
| Build            | `pnpm build`                                                                           |
| Production start | `pnpm start` (migrates, then serves)                                                   |
| Tests            | `pnpm test --run` (one shot); `pnpm test` watches                                      |
| Lint / format    | `pnpm lint` / `pnpm format`                                                            |
| Deep diagnostics | `pnpm doctor` (react-doctor score and findings)                                        |
| Prisma           | `pnpm exec prisma generate`, `pnpm exec prisma migrate dev`, `pnpm exec prisma studio` |
| Local DB         | `docker compose up -d`                                                                 |

## Repository map

| Path                                   | Contents                                                                                                        |
| -------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| `app/`                                 | App Router pages, route handlers in `app/api/**`, shared components                                             |
| `lib/`                                 | `auth.ts` / `auth-client.ts` (better-auth), `permissions.ts` (ACL), `prisma-client.ts`, `zod-schema.ts`, `pdf/` |
| `hooks/`, `store/`, `utils/`, `types/` | TanStack Query hooks, jotai atoms, helpers, shared types                                                        |
| `i18n/`, `messages/`                   | next-intl config and German translations                                                                        |
| `prisma/`                              | `schema.prisma` is the source of truth; migrations in `prisma/migrations/`                                      |
| `tests/`                               | msw mocks and test helpers                                                                                      |

## Invariants you must not break

- **First user becomes `superadmin`** (`databaseHooks.user.create.before`). Users in `GLOBAL_PROTECTED_ROLES` cannot be updated or deleted — the hook throws `APIError("FORBIDDEN")`.
- **Email verification is required** before sign-in (`requireEmailVerification`).
- **Invite links span three forms**: `token` / `inviteToken` / `welcome` params are read by `ForgotPasswordForm`, `ResetPasswordForm` and `RefreshVerificationForm`. Changing a link in an email means checking all three.
- **The Prisma schema must match what better-auth expects.** A mismatch is logged as `[Better Auth]: Prisma schema mismatch` at startup — for example `session.impersonatedBy` is required by the admin plugin. Identity columns for credential accounts stay `account.accountId`; the `providerAccountId` / `issuer` fields apply only to OAuth providers, which this app does not use.
- **Roles:** `superadmin` / `admin` get `adminAc.statements`, `user` gets nothing. New admin permissions arrive through `defaultStatements`, so they do not need to be copied by hand.

## Verification before committing

1. `pnpm lint`
2. `pnpm exec tsc --noEmit`
3. `pnpm test --run`
4. `pnpm build` — required for anything touching routes, config, or dependencies

Keep changes small and run the smallest useful command first; see the debugging recipes in [docs/architecture.md](docs/architecture.md).

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
