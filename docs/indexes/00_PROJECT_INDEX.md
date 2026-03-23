# Indice progetto — 22Club

## Overview

Gestionale fitness multi-ruolo: staff (dashboard) e atleta (portale `/home`), con integrazione Supabase (Auth + Postgres + RLS), UI dark Apple-like, test E2E Playwright e build mobile Capacitor.

## Stack

- Next.js (App Router), TypeScript strict
- Supabase (Auth, DB, Storage, Realtime)
- Tailwind CSS
- Playwright E2E, Vitest (unit/integration dove presenti in `audit/tests.txt`)
- Capacitor (`capacitor.config.ts`, `android/`, `ios/`)

## Domini principali (mappa logica)

Vedi dettaglio in `audit/PROJECT_DOMAINS.md`: auth/ingresso, RBAC/admin, shell dashboard, home atleta, clienti/atleti, profilo atleta (staff), calendario/appuntamenti, comunicazioni, chat, documenti, pagamenti/abbonamenti, allenamenti/workout, progressi, inviti, onboarding, marketing, aree nutrizionista/massaggiatore, notifiche/push, impostazioni, statistiche, pagine pubbliche, design system, infrastruttura (`src/lib/supabase`, API trasversali), DB (`supabase/`), test, diagnostica.

## Indici in questa cartella

| File                       | Contenuto                                                                               |
| -------------------------- | --------------------------------------------------------------------------------------- |
| `01_ARCHITECTURE_INDEX.md` | Frontend / backend / DB, shared vs feature vs infrastructure, note da audit             |
| `02_ROUTES_INDEX.md`       | Gruppi path App Router, file principali, dominio, ruoli                                 |
| `03_FEATURES_INDEX.md`     | Per dominio: feature, file chiave, hook/servizi, stato e priorità (da `FEATURE_STATUS`) |
| `04_DATABASE_INDEX.md`     | File DB/migrazioni/RLS citati negli audit, collegamenti domini                          |
| `05_API_INDEX.md`          | `src/app/api/**/route.ts` raggruppati per responsabilità                                |
| `06_COMPONENTS_INDEX.md`   | Shared, feature, layout; note riuso                                                     |
| `07_AUTH_RBAC_INDEX.md`    | Fonti canoniche auth, redirect, guard/middleware, conflitti                             |
| `08_TESTING_INDEX.md`      | E2E, unit, integration, security; coperture e lacune                                    |
| `09_KNOWN_ISSUES_INDEX.md` | Conflitti logici, debiti, priorità operative                                            |

## Audit e elenchi di riferimento

- `audit/PROJECT_DOMAINS.md` — domini e path
- `audit/FEATURE_STATUS.md` — stato sintetico e priorità
- `audit/CANONICAL_SOURCES.md` — fonti canoniche per area
- `audit/RULE_CONFLICTS.md` — conflitti tra implementazioni
- `audit/EXISTING_RULES_INDEX.md` — inventario doc/regole
- `audit/routes_files.txt`, `audit/components.txt`, `audit/lib_utils_services.txt`, `audit/database_files.txt`, `audit/tests.txt`

_Nota:_ esistono anche indici legacy nella stessa cartella (`01_MODULE_INDEX.md`, `06_HOOKS_INDEX.md`, `08_SERVICES_INDEX.md`, `09_TESTS_INDEX.md`); la serie `01–09` sopra è la mappa “navigazione documentale” richiesta nel 2026-03.
