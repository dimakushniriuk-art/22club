# API Route — indice

Elenco `src/app/api/**/route.ts` da `audit/routes_files.txt` (prime righe). Responsabilità sintetiche dedotte dai path e da `PROJECT_DOMAINS` / `FEATURE_STATUS`.

## Admin

| Route                                                                      | Dominio                | Responsabilità            | Note             |
| -------------------------------------------------------------------------- | ---------------------- | ------------------------- | ---------------- |
| `api/admin/athletes/assign-trainer`                                        | Admin / atleti         | Assegnazione trainer      | —                |
| `api/admin/cron/refresh-marketing-kpis`                                    | Marketing / cron       | Refresh KPI               | Chiamata cron    |
| `api/admin/impersonation/start`, `stop`                                    | Admin / impersonazione | Avvio/fine impersonazione | —                |
| `api/admin/roles`                                                          | RBAC                   | Permessi ruoli            | —                |
| `api/admin/statistics`                                                     | Statistiche            | KPI aggregati             | —                |
| `api/admin/users`, `users/assignments`, `users/marketing`, `users/trainer` | Admin utenti           | CRUD / assegnazioni       | Superficie ampia |

## Athlete / workout

| Route                                      | Dominio     | Responsabilità               | Note |
| ------------------------------------------ | ----------- | ---------------------------- | ---- |
| `api/athlete/workout-plans`                | Allenamenti | Piani workout atleta         | —    |
| `api/athletes/create`, `api/athletes/[id]` | Anagrafica  | Creazione / dettaglio atleta | —    |

## Auth

| Route                      | Dominio | Responsabilità                     | Note                                  |
| -------------------------- | ------- | ---------------------------------- | ------------------------------------- |
| `api/auth/context`         | Auth    | Contesto sessione + profilo per UI | Fonte canonica in `CANONICAL_SOURCES` |
| `api/auth/forgot-password` | Auth    | recupero password                  | —                                     |

## Calendario e dashboard appuntamenti

| Route                                    | Dominio                  | Responsabilità                  | Note                                                          |
| ---------------------------------------- | ------------------------ | ------------------------------- | ------------------------------------------------------------- |
| `api/calendar/notify-appointment-change` | Appuntamenti / notifiche | Notifica su cambio              | Incrocio con `lib/notifications`                              |
| `api/calendar/send-appointment-reminder` | Appuntamenti             | Reminder email                  | —                                                             |
| `api/dashboard/appointments`             | Dashboard                | Lista appuntamenti (es. “oggi”) | Possibile divergenza criteri vs calendario (`RULE_CONFLICTS`) |

## Clienti

| Route                        | Dominio | Responsabilità           | Note |
| ---------------------------- | ------- | ------------------------ | ---- |
| `api/clienti/sync-pt-atleti` | Clienti | Sync relazioni PT–atleti | —    |

## Comunicazioni

| Route                                               | Dominio       | Responsabilità    | Note |
| --------------------------------------------------- | ------------- | ----------------- | ---- |
| `api/communications/send`                           | Comunicazioni | Invio massivo     | —    |
| `api/communications/recipients`, `recipients/count` | Comunicazioni | Destinatari       | —    |
| `api/communications/list-athletes`                  | Comunicazioni | Lista atleti      | —    |
| `api/communications/send-email-to-athlete`          | Comunicazioni | Email mirata      | —    |
| `api/communications/check-stuck`                    | Operatività   | Diagnostica batch | —    |

## Debug / health / documenti

| Route                          | Dominio     | Responsabilità     | Note            |
| ------------------------------ | ----------- | ------------------ | --------------- |
| `api/debug-trainer-visibility` | Diagnostica | Visibilità trainer | Non prod utente |
| `api/document-preview`         | Documenti   | Anteprima file     | —               |
| `api/health`                   | Infra       | Healthcheck        | —               |

## Esercizi

| Route           | Dominio           | Responsabilità | Note |
| --------------- | ----------------- | -------------- | ---- |
| `api/exercises` | Catalogo esercizi | Lista / CRUD   | —    |

## Inviti

| Route                                                     | Dominio | Responsabilità | Note |
| --------------------------------------------------------- | ------- | -------------- | ---- |
| `api/invitations`, `create`, `send-email`, `email-status` | Inviti  | Flusso inviti  | —    |

## Marketing

| Route                                                  | Dominio   | Responsabilità           | Note |
| ------------------------------------------------------ | --------- | ------------------------ | ---- |
| `api/marketing/analytics`, `athletes`, `events`, `kpi` | Marketing | Analytics / eventi / KPI | —    |
| `api/marketing/leads`, `leads/*`, `convert`            | Marketing | Lead e conversione       | —    |
| `api/marketing/automations/[id]`, `run`                | Marketing | Automazioni              | —    |

## Onboarding / registrazione

| Route                                                      | Dominio       | Responsabilità        | Note |
| ---------------------------------------------------------- | ------------- | --------------------- | ---- |
| `api/onboarding/save-step`, `save-questionnaire`, `finish` | Onboarding    | Persistenza step      | —    |
| `api/register/complete-profile`                            | Registrazione | Completamento profilo | —    |

## Nutrizionista

| Route                                   | Dominio       | Responsabilità       | Note |
| --------------------------------------- | ------------- | -------------------- | ---- |
| `api/nutritionist/extract-progress-pdf` | Nutrizionista | Export PDF progressi | —    |

## Push

| Route                                            | Dominio        | Responsabilità | Note |
| ------------------------------------------------ | -------------- | -------------- | ---- |
| `api/push/subscribe`, `unsubscribe`, `vapid-key` | Notifiche push | Web Push       | —    |

---

_Per elenco aggiornato path-per-path:_ `audit/routes_files.txt` (sezione `src/app/api/`).
