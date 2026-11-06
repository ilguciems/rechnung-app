# Context: rechnung-app

## A) Quick Start

**Stack**

- Next.js (App Router) + TypeScript
- UI: Tailwind + components in `app/components/*`
- Data: Prisma + Postgres
- Auth: **better-auth** (server config in `lib/auth.ts`, client in `lib/auth-client.ts`)
- Email: Mailjet (`node-mailjet`) via utils
- i18n: `next-intl`

**Scripts**

- `pnpm dev`
- `pnpm build`
- `pnpm start` (runs `prisma migrate deploy` before starting)
- `pnpm test` / `pnpm test:ui`
- `pnpm lint` / `pnpm format`

**Environment**

- See `env.example` (key values: database/email/callback URL, etc.)

---

## B) Architecture (how the project is organized)

**Entry points**

- `app/layout.tsx` — RootLayout:
  - `next-intl` (`NextIntlClientProvider`)
  - theme (`next-themes`, `getThemeScript`, `ThemeProvider`)
  - global providers + UI shell:
    - `LogoutWrapper`
    - `TimerProvider` (`context/TimerContext.tsx`)
    - `Providers` (`app/providers.tsx`) — React Query
    - `RealtimeProvider` + `RealtimeNotifications`
    - `Header`, `SessionTimerUI`, `Toaster`

**Providers**

- `app/providers.tsx` — `@tanstack/react-query` `QueryClientProvider` with `staleTime: 60s`

---

## C) Auth & Security (better-auth)

### 1) Server configuration

**File:** `lib/auth.ts`

Key points:

- `betterAuth({ database: prismaAdapter(prisma, { provider: "postgresql" }) })`
- `emailAndPassword.enabled = true`
- `requireEmailVerification = true`
- Reset password email:
  - checks the `url` for `welcome=true`
  - switches subject/text (welcome vs reset)
  - sends through `sendAuthorizationEmail(...)` (`utils/authorization-email.ts`)

**Email verification**

- `emailVerification.sendVerificationEmail(...)` -> `sendAuthorizationEmail(...)`

### 2) Per-user hooks (security invariants)

**`databaseHooks.user.*`**

- `user.create.before`:
  - if the user count is 0 -> assigns `role: GlobalRole.superadmin`
- `user.update.before`:
  - if the target user has a protected role (`GLOBAL_PROTECTED_ROLES`) -> throws
    `APIError("FORBIDDEN", { message: "This protected account cannot be modified." })`
- `user.delete.before`:
  - same rule for delete -> `APIError("FORBIDDEN", ...)`

### 3) ACL / roles

**File:** `lib/permissions.ts`

- `ac = createAccessControl(statement)`
- roles:
  - `superadmin` and `admin` — with `adminAc.statements`
  - `user` — no permissions (`user: []`, `session: []`)

Roles/permissions are used in:

- `adminPlugin(...)` in `lib/auth.ts`
- `adminClient(...)` in `lib/auth-client.ts`

### 4) Client-side auth layer

**File:** `lib/auth-client.ts`

- `createAuthClient({ baseURL: NEXT_PUBLIC_BASE_URL || "http://localhost:3000", plugins: [adminClient(...)] })`
- Exports:
  - `signIn/signUp/signOut`
  - `useSession`
  - `requestPasswordReset`, `resetPassword`
  - `sendVerificationEmail`
  - `changePassword/changeEmail`
  - `admin`

---

## D) Auth UI flows (pages + components)

### Verify email

- `app/(auth)/verify-email/page.tsx` (server)
  - `auth.api.getSession({ headers })`
  - reads `searchParams.email`
  - if a `session` already exists OR the email is invalid -> `redirect("/")`

### Forgot password

- `app/(auth)/forgot-password/components/ForgotPasswordForm.tsx` (client)
  - email field + zod validation
  - `requestPasswordReset({ email, redirectTo })`
  - `redirectTo`: `/reset-password` + `?inviteToken=...` when a `token` is present in the query
  - onSuccess -> `/forgot-password-email-sent?email=...`

- `app/(auth)/forgot-password-email-sent/page.tsx` (server)
  - checks session + email validity
  - renders "sent / check spam / close window"

### Reset password

- `app/(auth)/reset-password/components/ResetPasswordForm.tsx` (client)
  - `token` is required: `const token = searchParams.get("token")`
    - missing token -> `redirect("/")`
  - `inviteToken` affects the redirect after a successful reset:
    - `inviteToken` present -> `/organization/invite?token=...`
    - otherwise -> `/sign-in`
  - `welcome=true` in the search params affects texts/subject/toast
  - submit -> `resetPassword({ newPassword, token }, callbacks)`

### Refresh email verification (resend)

- `app/(auth)/refresh-email-verification/components/RefreshVerificationForm.tsx` (client)
  - email form + validation
  - `sendVerificationEmail({ email, callbackURL })`
    - if `token` is present -> `callbackURL=/organization/invite?token=${token}`
    - otherwise -> `/`
  - onSuccess -> `toast.success` and `router.push("/verify-email")`

---

## E) Organization / Invites (what to check when changing things)

**Entry points to keep in mind:**

- `app/organization/invite/page.tsx`
- auth -> invite wiring:
  - reset password: if `inviteToken` is present -> redirect to invite
  - refresh verification: if `token` is present -> `callbackURL=/organization/invite?token=...`

**Approach when making changes:**

- if you change the parameters of a link inside an email (callbackURL/redirectTo), always check:
  - `ForgotPasswordForm` (inviteToken)
  - `ResetPasswordForm` (inviteToken routing)
  - `RefreshVerificationForm` (callbackURL token)

---

## F) Data layer (Prisma) and domain concepts

**File:** `prisma/schema.prisma`

- source of truth for the models
- migrations live in `prisma/migrations/*`

**Where data access happens:**

- `lib/prisma-client.ts` — creates the prisma client
- `lib/auth.ts` — uses `prisma.user.count()` and `findUnique({ role: true })`

**better-auth schema contract:**

- the Prisma models must match what better-auth expects; otherwise it logs
  `[Better Auth]: Prisma schema mismatch` on startup and lists the missing columns
- the admin plugin needs `session.impersonatedBy`
- credential accounts keep `account.accountId`; the `providerAccountId` / `issuer`
  columns only apply to OAuth providers, which this app does not use
- the client in `app/generated/prisma/**` is generated — never edit it by hand

**Domain (structural pointers):**

- Invoices:
  - `app/api/invoices/**`
  - PDF:
    - `lib/pdf/**`
- Timer:
  - `context/TimerContext.tsx`
  - `app/api/timer/**` (including SSE)

---

## G) Debugging / how to debug

### 1) Auth (session/cookies)

- Auth server: `lib/auth.ts`
- Auth client: `lib/auth-client.ts`
- Getting the session in server components:
  - `auth.api.getSession({ headers: await headers() })`
- Cookie integration:
  - the `nextCookies()` plugin in `lib/auth.ts`

### 2) Redirect / callbackURL

The most common sources of bugs:

- wrong query params (`token`, `inviteToken`, `welcome`)
- wrong URLs:
  - `ForgotPasswordForm`: redirectTo `/reset-password?...`
  - `ResetPasswordForm`: redirect after reset
  - `RefreshVerificationForm`: callbackURL for resend verification

### 3) Role business rules

- "protected roles" — update/delete is blocked:
  - see `GLOBAL_PROTECTED_ROLES` and the logic in `lib/auth.ts`
- When admin/role actions fail, check:
  - whether `APIError("FORBIDDEN")` is thrown
  - how the frontend handles it (toast/messages)

### 4) Email

- Sending service: `node-mailjet` (see deps)
- Auth emails:
  - `utils/authorization-email.ts`
  - (for org) `utils/organization-email.ts`
- It helps to log the `subject/text` payload and the final URL (`callbackURL`/`redirectTo`).
