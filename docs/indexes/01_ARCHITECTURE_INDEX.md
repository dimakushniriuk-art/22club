# Architettura — indice

## Struttura logica

| Livello                | Dove                                        | Ruolo                                                                                                                       |
| ---------------------- | ------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| UI pagine              | `src/app/**`                                | App Router: route pubbliche, `/dashboard/*`, `/home/*`, `/login`, API `src/app/api/**`                                      |
| Componenti             | `src/components/**`                         | Feature + shared + `ui/` primitivi                                                                                          |
| Logica dominio         | `src/lib/**`                                | Servizi, query helper, validazioni, notifiche, comunicazioni                                                                |
| Stato / orchestrazione | `src/hooks/**`                              | Data fetching client, guard pagina, calendario                                                                              |
| Tipi                   | `src/types/**`, `src/lib/supabase/types.ts` | Modelli TS (allineamento tipi Supabase da processo documentato in DOCUMENTAZIONE)                                           |
| Persistenza            | Supabase                                    | Postgres + RLS; client in `src/lib/supabase/*`; migrazioni in `supabase/migrations/` (elenco in `audit/database_files.txt`) |

## Frontend / backend / DB

- **Frontend:** React/Next client components + server components; provider in `src/providers/` (auth, query, tema).
- **Backend (app):** Route Handler `src/app/api/**/route.ts` — logica server, Supabase server client.
- **DB:** Schema e policy in SQL sotto `supabase/migrations/`; piani/criticità RLS anche in `audit/rls/**` e `audit/RULE_CONFLICTS.md`.
- **Edge / cron:** Edge Functions citate in `audit/PROJECT_DOMAINS.md` (`supabase/functions/document-reminders`, `marketing-kpi-refresh`).

## Shared vs feature vs infrastructure

Da `audit/PROJECT_DOMAINS.md`:

- **Shared:** shell dashboard (`staff-dashboard-layout`, sidebar), kit UI (`components/ui`, `components/shared/ui`), design system (`src/app/design-system/`), token (`src/lib/design-tokens/`), tipi condivisi (`src/types/`).
- **Feature:** domini business (calendario, clienti, marketing, chat, …) con cartelle dedicate sotto `app/`, `components/`, `lib/<dominio>/`.
- **Infrastructure:** `src/lib/supabase/*`, `src/middleware.ts`, `src/lib/realtimeClient.ts`, cache/rate-limit, `src/app/api/health/`, audit applicativo (`src/lib/audit*.ts`), Capacitor, test harness.

## Note architetturali (solo audit)

- **Niente Server Actions unificate:** `RULE_CONFLICTS.md` — ricerca `'use server'` in `src/` senza risultati; persistenza via client Supabase, API route, hook.
- **Due alberi navigazione paralleli:** `/dashboard/**` (staff) vs `/home/**` (atleta) — stesso auth, RBAC a strati.
- **Capacitor:** con `CAPACITOR=true` il middleware non applica gli stessi controlli edge; parità richiesta via guard client (`CANONICAL_SOURCES`, `FEATURE_STATUS`).
- **Fonti canoniche per conflitti futuri:** `audit/CANONICAL_SOURCES.md` (auth, appuntamenti, `org_id`, data access).
