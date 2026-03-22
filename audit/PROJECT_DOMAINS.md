# Domini reali 22Club

Legenda priorità: **P0** critico path revenue/legale, **P1** core giornaliero, **P2** verticali, **P3** polish.

---

### Auth & sessione
- **Responsabilità:** login, reset password, post-login redirect, contesto utente.
- **File:** `src/app/login`, `forgot-password`, `reset-password`, `post-login`, `welcome`; `src/components/auth/*`; `src/lib/supabase/middleware.ts`, `get-current-profile.ts`.
- **Route:** `/login`, `/post-login`, `/welcome`, `/api/auth/*`.
- **API:** `api/auth/context`, `api/auth/forgot-password`, onboarding `api/onboarding/*`.
- **Hook:** `use-auth`, `use-user-role` (vedi `hooks_clean`).
- **Rischi:** middleware, cookie, ruoli errati → lockout.
- **Priorità:** P0.

### Dashboard Staff (trainer-centric)
- **Responsabilità:** home staff, clienti, schede, esercizi, documenti staff, statistiche trainer.
- **Route:** `/dashboard`, `/dashboard/clienti`, `/dashboard/schede`, `/dashboard/esercizi`, `/dashboard/documenti`, `/dashboard/statistiche`.
- **Componenti:** `components/dashboard/*` (non nutrizionista/massaggiatore/marketing).
- **Priorità:** P1.

### Dashboard Athlete / Home
- **Responsabilità:** app mobile-first atleta, allenamenti del giorno, progressi, documenti atleta.
- **Route:** `/home`, `/home/allenamenti/*`, `/home/progressi`, `/home/documenti`, `/home/profilo`.
- **Hook:** `use-workout-session`, workout hooks, `hooks/home-profile/*`.
- **Rischi:** pagine molto grandi (oggi workout).
- **Priorità:** P1.

### Appuntamenti / Calendario
- **Responsabilità:** prenotazioni, promemoria email, vista calendario staff.
- **Route:** `/dashboard/appuntamenti`, `/dashboard/calendario`, `/home/appuntamenti`.
- **API:** `api/dashboard/appointments`, `api/calendar/notify-appointment-change`, `send-appointment-reminder`.
- **Lib:** `lib/calendar/appointment-reminder-email.ts`.
- **Componenti:** `components/appointments/*`, `components/calendar/*`.
- **Priorità:** P1.

### Clienti / Atleti
- **Responsabilità:** lista clienti, scheda atleta `[id]`, assegnazioni trainer.
- **Route:** `/dashboard/clienti`, `/dashboard/atleti/[id]`.
- **API:** `api/athletes/*`, `api/admin/athletes/assign-trainer`, `api/clienti/sync-pt-atleti`.
- **Rischi:** RLS trainer visibility, doppia sorgente relazioni.
- **Priorità:** P0.

### Schede / Allenamenti (staff)
- **Route:** `/dashboard/allenamenti`, `/dashboard/schede`, wizard modifica.
- **API:** `api/exercises`, `api/athlete/workout-plans`, eventuali RPC workout.
- **Priorità:** P1.

### Pagamenti / Abbonamenti
- **Route:** `/dashboard/pagamenti`, `/dashboard/abbonamenti`, varianti massaggiatore/nutrizionista.
- **Rischi:** importi, metodi pagamento, soft delete (vedi doc README payments).
- **Priorità:** P0.

### Documenti
- **Staff:** `/dashboard/documenti` (**build blocker attuale**).
- **Atleta:** `/home/documenti`; nutrizionista: `/dashboard/nutrizionista/documenti`.
- **API:** `api/document-preview`.
- **Hook:** `use-documents`, `use-documents-filters`.
- **Tipi:** `src/types/document.ts`.
- **Priorità:** P1 (fix TS immediato).

### Comunicazioni / Email
- **Route:** `/dashboard/comunicazioni`, template.
- **API:** `api/communications/*`.
- **Lib:** `src/lib/communications/*` (Resend, batch, scheduler).
- **Priorità:** P1.

### Chat
- **Route:** `/dashboard/chat`, `/home/chat`, massaggiatore chat.
- **Hook:** `hooks/chat/*`, realtime.
- **Priorità:** P2.

### Marketing
- **Route:** `/dashboard/marketing/*` (leads, campaigns, segments, automations, analytics).
- **API:** `api/marketing/*`, cron KPI.
- **Priorità:** P2.

### Admin
- **Route:** `/dashboard/admin/*`, API `api/admin/*`.
- **Rischi:** service role, delete user.
- **Priorità:** P0 sicurezza.

### Nutrizione
- **Route:** `/dashboard/nutrizionista/*`, `/home/nutrizionista`.
- **API:** `api/nutritionist/extract-progress-pdf`.
- **Priorità:** P2.

### Massaggiatore
- **Route:** `/dashboard/massaggiatore/*`, `/home/massaggiatore`.
- **Priorità:** P2.

### Supabase / RLS
- **Fonte:** `supabase/migrations/*`, `DOCUMENTAZIONE/07_database_supabase_e_rls.md`.
- **Client:** `lib/supabase/server|client|admin`.
- **Priorità:** trasversale P0 per modifiche schema.

### Test / Quality
- **E2E:** `tests/e2e/*.spec.ts` (~35+ file).
- **Unit/integration:** `tests/unit`, `tests/integration`, `src/hooks/**/__tests__`.
- **Priorità:** dopo build green.

### Mobile / Capacitor
- **File root:** `capacitor.config.ts`, `android/`.
- **Doc:** `DOCUMENTAZIONE/CAPACITOR_*.md`.
- **Priorità:** P3 salvo release app.

### Design system / UI
- **Route:** `/design-system`.
- **Lib:** `lib/design-tokens/*`, `components/ui/*`.
- **Obbligo:** `GUIDA_DESIGN_SYSTEM.md` aggiornata a ogni cambio DS.
- **Priorità:** P2.

---

Ordine consigliato interventi: **build** → **lint critici** → **auth/RBAC** → **data layer** → **feature rotte** → **test core** → **debug cleanup** → refactor locali.
