# STEP 1 — Flussi reali

## Layout chain

1. `src/app/layout.tsx` — `AuthProvider` → `QueryProvider` → …
2. `src/app/dashboard/layout.tsx` (client) — realtime, `RoleLayout`, `Suspense` children, modals.
3. Layout annidati (`calendario`, `clienti`, `chat`): metadata only → `children`.

## Middleware (`src/middleware.ts`)

- `getUser()` + cache ruolo 60s o `profiles(role, first_login)` per `user_id`.
- Redirect ruoli (`/dashboard` vs `/home`, whitelist nutrizionista/massaggiatore/marketing, admin).

## Auth client (`src/providers/auth-provider.tsx`)

- Bootstrap: `getUser` → `/api/auth/context` (impersonation) oppure `fetchProfile(user_id)` con cache 30s + singleflight.

## Duplicazione identità (evidenza)

- Middleware + AuthProvider: due layer profilo/ruolo (TTL diversi).
- (Rimosso) helper `get-current-staff-profile-client` — sostituito da `useAuth` nei hook staff.
- `useStaffAppointmentsTable` (prima del fix): `getUser` + `profiles`.
- `use-clienti` + `use-supabase.ts`: secondo canale `getSession` parallelo ad AuthProvider.

## Realtime (`useRealtimeChannel.ts`)

- Layout staff: `notifications` (INSERT → toast); `appointments` e `profiles` (atleti org) con filtro + throttle + invalidate/evento dove previsto.

## Navigazione

- `TransitionWrapper`: `key={pathname}` + animazione pagina (prima: `mode="wait"`).
