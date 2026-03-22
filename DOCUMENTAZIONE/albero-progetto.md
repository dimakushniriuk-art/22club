# Albero del progetto 22Club (Gestionale fitness)

Documento generato per descrivere la struttura delle cartelle e dei file principali.  
Esclusi: `node_modules`, `.next`, `.git` (e build/cache).

---

## Radice del progetto

```
Gestionale_22club/
├── .cursor/                 # Configurazione Cursor (rules, commands)
├── .github/                 # Workflow CI/CD (ci.yml, deploy.yml, e2e, etc.)
├── .husky/                  # Git hooks (pre-commit, pre-push)
├── .qodo/
├── .storybook/              # Storybook
├── .supabase/
├── .vercel/
├── .vscode/
├── ai_memory/
├── android/                 # Capacitor Android
├── assets/
├── backups/
├── data/
├── docs/                    # Documentazione (questo file in docs/)
├── e2e/                     # Test E2E Playwright
├── export/
├── ios/                     # Capacitor iOS
├── out/
├── public/                  # Asset statici (favicon, immagini, manifest)
├── scripts/
├── src/                     # Codice sorgente principale (vedi sotto)
├── supabase/                # Supabase: migrations, functions, config (vedi sotto)
├── supabase-config-export/
├── tests/
├── types/
├── __project_logic_docs__/
│
├── capacitor.config.ts
├── next.config.ts
├── next.config.production.ts
├── package.json
├── pnpm-lock.yaml
├── tailwind.config.ts
├── tsconfig.json
├── eslint.config.mjs
├── postcss.config.mjs
├── playwright.config.ts
├── vitest.config.ts
├── Dockerfile.production
├── docker-compose.production.yml
├── vercel.json
├── sentry.*.config.ts
├── CHANGELOG.md
├── README.md
├── .env.example
├── .gitignore
├── .cursorignore
└── .prettierignore
```

---

## src/ (codice applicazione)

```
src/
├── app/                     # Next.js App Router (pagine e API)
│   ├── api/                 # Route API
│   │   ├── admin/           # roles, statistics, users
│   │   ├── athletes/        # create, [id]
│   │   ├── auth/            # context, forgot-password
│   │   ├── dashboard/       # appointments
│   │   ├── debug-trainer-visibility/
│   │   ├── document-preview/
│   │   ├── exercises/
│   │   ├── health/
│   │   ├── invitations/     # create, email-status, send-email
│   │   ├── onboarding/      # finish
│   │   ├── push/            # subscribe, unsubscribe, vapid-key
│   │   └── register/        # complete-profile
│   │
│   ├── dashboard/           # Area staff (trainer, admin, nutrizionista, massaggiatore)
│   │   ├── _components/     # agenda-client, new-appointment-button, upcoming-appointments-client
│   │   ├── abbonamenti/
│   │   ├── admin/           # page, utenti, ruoli, organizzazioni, statistiche
│   │   ├── allenamenti/
│   │   ├── appuntamenti/     # page, nuovo/
│   │   ├── atleti/          # [id]/ (profilo atleta)
│   │   ├── calendario/
│   │   ├── chat/
│   │   ├── clienti/
│   │   ├── comunicazioni/
│   │   ├── documenti/
│   │   ├── esercizi/
│   │   ├── impostazioni/
│   │   ├── invita-atleta/
│   │   ├── massaggiatore/
│   │   ├── nutrizionista/
│   │   ├── pagamenti/
│   │   ├── profilo/
│   │   ├── schede/          # page, nuova/, [id]/modifica/
│   │   ├── statistiche/
│   │   ├── layout.tsx
│   │   └── page.tsx
│   │
│   ├── design-system/       # page + _sections (foundations, patterns, componenti)
│   ├── forgot-password/
│   ├── home/                # Area atleta
│   │   ├── _components/    # home-layout-auth, home-layout-client, time-display
│   │   ├── allenamenti/     # page, oggi/, [id], esercizio/[exerciseId], riepilogo/
│   │   ├── appuntamenti/
│   │   ├── chat/
│   │   ├── documenti/
│   │   ├── foto-risultati/  # page, aggiungi/
│   │   ├── massaggiatore/
│   │   ├── nutrizionista/
│   │   ├── pagamenti/
│   │   ├── progressi/       # page, allenamenti/, storico/, foto/, misurazioni/, nuovo/
│   │   ├── profilo/
│   │   ├── trainer/
│   │   ├── layout.tsx
│   │   └── page.tsx
│   │
│   ├── login/
│   ├── logout-forced/
│   ├── post-login/
│   ├── privacy/             # page + _components
│   ├── registrati/
│   ├── reset/
│   ├── reset-password/
│   ├── termini/             # page + _components
│   ├── welcome/             # Primo accesso atleta
│   ├── favicon.ico
│   ├── globals.css
│   ├── layout.tsx
│   ├── not-found.tsx
│   └── page.tsx
│
├── components/              # Componenti React
│   ├── appointments/
│   ├── athlete/
│   ├── auth/
│   ├── calendar/
│   ├── charts/
│   ├── chat/
│   ├── common/
│   ├── communications/
│   ├── dashboard/           # admin, athlete-profile, clienti, documenti, pagamenti, ...
│   ├── documents/
│   ├── home/
│   ├── home-profile/
│   ├── icons/
│   ├── invitations/
│   ├── layout/
│   ├── profile/
│   ├── settings/
│   ├── shared/              # analytics, audit, dashboard (sidebar, role-layout), ui
│   ├── ui/                  # Design system / UI primitives
│   ├── workout/
│   ├── workout-plans/
│   ├── header.tsx
│   ├── index.ts
│   └── ...
│
├── config/
├── data/
├── db/
├── hooks/                   # use-clienti, use-workout-plans, use-chat-hidden-conversations, ...
├── lib/                     # supabase, logger, utils, export-utils, design-system-data, ...
├── providers/               # auth-provider, ...
├── styles/
├── types/                   # cliente, workout, supabase, ...
└── middleware.ts            # Auth, ruoli, redirect per path
```

---

## supabase/

```
supabase/
├── .temp/                   # CLI state (versioni, project-ref, ...)
├── functions/               # Edge functions
│   └── document-reminders/
│       └── index.ts
├── migrations/              # SQL migrations (oltre 150 file)
│   ├── 001_* ... 002_* ... 09_* ... 10_* ... 11_*
│   ├── 20240115_documents.sql
│   ├── 20241220_*.sql
│   ├── 20250110_* ... 20250127_* ... 20250128_* ... 20250129_* ... 20250130_* ... 20250131_*
│   ├── 20250201_* ... 20250202_* ... 20250216_*
│   ├── 20251008_* ... 20251009_* ... 20251011_* ... 20251031_*
│   ├── 2025_audit_logs.sql, 2025_security_policies.sql
│   ├── 20260104_* ... 20260106_* ... 20260107_* ... 20260108_*
│   ├── 20260109_* ... 20260110_* ... 20260122_* ... 20260126_*
│   ├── 20260207_* ... 20260208_* ... 20260209_* ... 20260210_* ... 20260211_* ... 20260212_*
│   ├── 20260213_* ... 20260217_* ... 20260218_* ... 20260219_* ... 20260220_*
│   ├── 20260221_* ... 20260222_* ... 20260223_* ... 20260224_* ... 20260225_* ... 20260226_*
│   ├── 20260227_* ... 20260228_* ... 20260229_* ... 20260230_* ... 20260231_* ... 20260232_*
│   ├── 20260233_* ... 20260234_* ... 20260235_* ... 20260236_* ... 20260237_* ... 20260238_*
│   ├── 20260239_* ... 20260240_* ... 20260241_* ... 20260242_* ... 20260243_* ... 20260244_*
│   ├── 20260245_* ... 20260246_*  # workout_plans RLS, security definer
│   └── ...
├── policies/
├── templates/
├── config.toml
└── seed.sql
```

---

## Altre cartelle rilevanti

```
e2e/                 # Test end-to-end (Playwright)
public/              # File statici serviti da Next (favicon, icone, manifest, ecc.)
docs/                # Documentazione (albero-progetto.md, Logica supabase, sql, ...)
scripts/             # Script di utilità
tests/               # Test unitari/integrazione
types/               # Tipi TypeScript globali (se fuori da src)
```

---

## Pagine (route) per ruolo

| Ruolo         | Prefisso route                                                                                                                                                     | Note                                                                                                                                                                        |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Pubbliche     | `/login`, `/registrati`, `/forgot-password`, `/reset-password`, `/reset`, `/privacy`, `/termini`                                                                   | Senza auth                                                                                                                                                                  |
| Atleta        | `/home`, `/home/*`, `/welcome`                                                                                                                                     | Solo `role = atleta`                                                                                                                                                        |
| Trainer/PT    | `/dashboard`, `/dashboard/*` (eccetto admin/nutrizionista/massaggiatore come home)                                                                                 | Clienti, Schede, Appuntamenti, Calendario, Esercizi, Abbonamenti, Chat, Comunicazioni, Invita atleta, Impostazioni, Profilo, Statistiche, Allenamenti, Documenti, Pagamenti |
| Nutrizionista | `/dashboard/nutrizionista`, `/dashboard/calendario`, `/dashboard/clienti`, `/dashboard/atleti`, `/dashboard/chat`, `/dashboard/profilo`, `/dashboard/impostazioni` | Accesso limitato middleware                                                                                                                                                 |
| Massaggiatore | `/dashboard/massaggiatore` + stessi path del nutrizionista                                                                                                         | Accesso limitato middleware                                                                                                                                                 |
| Admin         | `/dashboard/admin`, `/dashboard/admin/utenti`, `/dashboard/admin/ruoli`, `/dashboard/admin/organizzazioni`, `/dashboard/admin/statistiche`                         | Solo `role = admin`                                                                                                                                                         |

---

_Ultimo aggiornamento: struttura coerente con codebase 22Club (Next.js App Router, Supabase, TypeScript)._
