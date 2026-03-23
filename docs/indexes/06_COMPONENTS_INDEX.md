# Componenti — indice

Fonti: `audit/components.txt`, `audit/PROJECT_DOMAINS.md`.

## Shared / primitivi

| Area              | Path                                            | Note                                               |
| ----------------- | ----------------------------------------------- | -------------------------------------------------- |
| UI primitivi      | `src/components/ui/*`                           | button, dialog, input, …                           |
| UI condivisi      | `src/components/shared/ui/*`                    | empty-state, notification-toast, confirm-dialog, … |
| Pattern comuni    | `src/components/common/*`                       | es. `RefreshButton`                                |
| Layout            | `src/components/layout/*`                       | (se presenti in tree)                              |
| Design token / DS | `src/app/design-system/*`, sezioni `_sections/` | Reference interna                                  |

**Nota dominio:** due alberi `ui/` vs `shared/ui/` — possibile sovrapposizione ruoli (`PROJECT_DOMAINS`).

## Shell dashboard staff

- `src/components/dashboard/sidebar.tsx`
- `src/components/shared/dashboard/staff-dashboard-layout.tsx`, `staff-content-layout.tsx`, `role-layout.tsx`
- `src/app/dashboard/_components/*` (agenda, upcoming appointments, new appointment)

## Auth

- `src/components/auth/login-form.tsx`, `LoginCard.tsx`, `index.ts`

## Calendario e appuntamenti

- `src/components/calendar/*` — `calendar-view`, `appointment-form`, `appointment-detail`, `appointment-popover`, `appointments-table`, `mini-calendar`
- `src/components/appointments/*` — lista, stats, validazione, ricorrenze, email-to-athlete
- `src/components/dashboard/appointment-modal.tsx` — modale legata a tabella staff

## Chat

- `src/components/chat/*` — message-list, conversation-list, input, file-upload, tema

## Comunicazioni

- `src/components/communications/*` — list, header, search, modal nuova comunicazione

## Clienti / atleti

- `src/components/dashboard/clienti/**`
- `src/components/dashboard/crea-atleta-modal.tsx`

## Profilo atleta (staff)

- `src/components/dashboard/athlete-profile/**` — sottocartelle fitness, nutrition, smart-tracking, motivational, ai-data
- Volume elevato; accoppiamento alto (`PROJECT_DOMAINS`)

## Home atleta

- `src/components/athlete/*` — progress, workout, notifications, tab-bar, …
- `src/components/home-profile/*`
- `src/app/home/_components/*` — layout auth/client

## Profilo / impostazioni

- `src/components/profile/*`, `src/components/settings/*` — tab account, 2FA, notifiche

## Workout

- `src/components/workout/*`, `src/components/workout-plans/*`
- Test: `src/components/workout/__tests__/` (citato in `PROJECT_DOMAINS`)

## Documenti

- `src/components/documents/*`, `src/components/dashboard/documenti/*`

## Pagamenti

- `src/components/dashboard/pagamenti/*` — es. `payments-table.tsx`

## Marketing / admin

- `src/components/dashboard/admin/*` — users, roles, statistics, organizations
- `src/components/shared/analytics/*`
- `src/components/charts/*` — recharts client

## Altri

- `src/components/invitations/*`
- `src/components/athlete/notifications-section.tsx`, `src/components/sw-register.tsx` (push)
- `src/components/shared/impersonation-banner.tsx`
- `src/components/shared/audit/audit-logs.tsx`
- Dashboard: molti file `statistiche`, `progress`, `allenamenti` (prefissi in `components.txt`)

## Dipendenze e riuso

- Calendario ↔ appuntamenti ↔ dashboard: stesso dominio dati, più entry UI (`appointment-modal` vs `calendar/*` vs `appointments/*`).
- **Da verificare:** allineamento regole business solo lato componente (vedi `CANONICAL_SOURCES` calendario).
