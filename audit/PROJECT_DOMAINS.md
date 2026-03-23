# Project Domains

Mappa dei domini logica del **codice vivo**, ricavata **solo** da questi artefatti: `audit/tree.txt`, `audit/routes_files.txt`, `audit/components.txt`, `audit/lib_utils_services.txt`.

---

## Autenticazione e flussi ingresso

- **Tipo:** feature
- **Cartelle:** `src/app/login/`, `src/app/forgot-password/`, `src/app/reset-password/`, `src/app/registrati/`, `src/app/welcome/`, `src/app/post-login/`, `src/app/api/auth/`
- **File chiave:** `src/app/login/page.tsx`, `src/app/api/auth/context/route.ts`, `src/app/api/auth/forgot-password/route.ts`, `src/components/auth/login-form.tsx`, `src/components/auth/LoginCard.tsx`, `src/lib/auth-page-styles.ts`
- **Dipendenze:** client/server Supabase; redirect ruoli (vedi RBAC)
- **Note:** Nei path audit compaiono sia `src/hooks/useAuth.ts` sia `src/hooks/use-auth.ts` (omonimia da verificare nel sorgente).

---

## RBAC, amministrazione e impersonazione

- **Tipo:** feature
- **Cartelle:** `src/app/dashboard/admin/`, `src/app/api/admin/`, `src/components/dashboard/admin/`, `src/components/shared/impersonation-banner.tsx`
- **File chiave:** `src/app/dashboard/admin/ruoli/page.tsx`, `src/app/api/admin/roles/route.ts`, `src/app/api/admin/impersonation/start/route.ts`, `src/app/api/admin/impersonation/stop/route.ts`, `src/components/dashboard/admin/role-permissions-editor.tsx`, `src/lib/utils/role-normalizer.ts`, `src/lib/utils/role-redirect-paths.ts`
- **Dipendenze:** utenti/org; Supabase; (facoltativo) audit middleware
- **Note:** Superficie API ampia: utenti, statistiche, marketing su utenti, assegnazioni trainer, cron refresh KPI.

---

## Shell dashboard staff e layout condiviso

- **Tipo:** shared
- **Cartelle:** `src/app/dashboard/`, `src/components/dashboard/` (parti trasversali), `src/components/shared/dashboard/`, `src/components/layout/`
- **File chiave:** `src/app/dashboard/layout.tsx`, `src/components/dashboard/sidebar.tsx`, `src/components/shared/dashboard/staff-dashboard-layout.tsx`, `src/components/shared/dashboard/staff-content-layout.tsx`, `src/components/shared/dashboard/role-layout.tsx`, `src/app/dashboard/page.tsx`
- **Dipendenze:** quasi tutte le feature sotto `src/app/dashboard/*`
- **Note:** `src/components/dashboard/` include anche feature molto grandi (es. profilo atleta): non è solo “guscio” UI.

---

## Home atleta (portale)

- **Tipo:** feature
- **Cartelle:** `src/app/home/`, `src/app/home/_components/`
- **File chiave:** `src/app/home/layout.tsx`, `src/app/home/page.tsx`, `src/app/home/_components/home-layout-client.tsx`, `src/app/home/_components/home-layout-auth.tsx`
- **Dipendenze:** sottoroute `home/*` (allenamenti, appuntamenti, documenti, chat, ecc.)
- **Note:** Struttura parallela a `src/app/dashboard/*` (staff vs atleta).

---

## Clienti (staff) e anagrafica atleti

- **Tipo:** feature
- **Cartelle:** `src/app/dashboard/clienti/`, `src/app/dashboard/atleti/`, `src/app/api/clienti/`, `src/app/api/athletes/`, `src/components/dashboard/clienti/`
- **File chiave:** `src/app/dashboard/clienti/page.tsx`, `src/app/dashboard/atleti/[id]/page.tsx`, `src/app/api/clienti/sync-pt-atleti/route.ts`, `src/app/api/athletes/create/route.ts`, `src/app/api/athletes/[id]/route.ts`, `src/components/dashboard/crea-atleta-modal.tsx`, `src/lib/validations/cliente.ts`
- **Dipendenze:** Supabase; profilo atleta; inviti
- **Note:** Lessico misto “clienti” / “atleti” tra route e componenti.

---

## Profilo atleta (dettaglio staff)

- **Tipo:** feature
- **Cartelle:** `src/components/dashboard/athlete-profile/` (sottocartelle `fitness/`, `nutrition/`, `smart-tracking/`, `motivational/`, `ai-data/`), `src/lib/athlete-profile/`
- **File chiave:** `src/components/dashboard/athlete-profile/athlete-profile-tabs.tsx`, `src/lib/athlete-profile/handle-athlete-profile-save.ts`
- **Dipendenze:** documenti, allenamenti, marketing/AI (presenti nei path degli audit)
- **Note:** Moltissimi file in un’unica area; accoppiamento potenzialmente alto.

---

## Profilo home atleta e impostazioni account

- **Tipo:** feature
- **Cartelle:** `src/app/home/profilo/`, `src/app/dashboard/profilo/`, `src/components/home-profile/`, `src/components/profile/`, `src/components/settings/`
- **File chiave:** `src/app/home/profilo/page.tsx`, `src/app/dashboard/profilo/page.tsx`, `src/components/settings/settings-profile-tab.tsx`, `src/components/profile/pt-profile-tab.tsx`, `src/components/home-profile/athlete-overview-tab.tsx`
- **Dipendenze:** autenticazione; Supabase
- **Note:** Due entry “profilo”: home atleta vs dashboard staff.

---

## Calendario, appuntamenti e promemoria

- **Tipo:** feature
- **Cartelle:** `src/app/dashboard/calendario/`, `src/app/dashboard/appuntamenti/`, `src/app/dashboard/massaggiatore/calendario/`, `src/app/home/appuntamenti/`, `src/app/api/calendar/`, `src/app/api/dashboard/appointments/`, `src/components/calendar/`, `src/components/appointments/`, `src/lib/appointments/`, `src/lib/calendar/`
- **File chiave:** `src/app/dashboard/calendario/page.tsx`, `src/components/calendar/calendar-view.tsx`, `src/components/dashboard/appointment-modal.tsx`, `src/lib/appointment-utils.ts`, `src/lib/recurrence-utils.ts`, `src/app/api/calendar/send-appointment-reminder/route.ts`, `src/lib/calendar/appointment-reminder-email.ts`
- **Dipendenze:** comunicazioni/email; anagrafica; impostazioni calendario (`src/app/dashboard/calendario/impostazioni/`)
- **Note:** Logica e UI distribuite tra `calendar/`, `appointments/`, `dashboard/_components` (agenda).

---

## Comunicazioni di massa e invio email

- **Tipo:** feature
- **Cartelle:** `src/app/dashboard/comunicazioni/`, `src/app/api/communications/`, `src/components/communications/`, `src/lib/communications/`
- **File chiave:** `src/app/api/communications/send/route.ts`, `src/lib/communications/service.ts`, `src/lib/communications/email.ts`, `src/components/communications/communications-list.tsx`
- **Dipendenze:** destinatari; template HTML sotto `src/lib/communications/`
- **Note:** Batch e scheduler in `src/lib/communications/`; sovrapposizione tematica con `src/lib/notifications/`.

---

## Chat

- **Tipo:** feature
- **Cartelle:** `src/app/dashboard/chat/`, `src/app/home/chat/`, `src/components/chat/`
- **File chiave:** `src/components/chat/message-list.tsx`, `src/components/chat/conversation-list.tsx`
- **Dipendenze:** `src/lib/realtimeClient.ts`; Supabase
- **Note:** —

---

## Documenti e anteprima

- **Tipo:** feature
- **Cartelle:** `src/app/dashboard/documenti/`, `src/app/home/documenti/`, `src/app/api/document-preview/`, `src/components/documents/`, `src/components/dashboard/documenti/`
- **File chiave:** `src/app/api/document-preview/route.ts`, `src/components/documents/document-uploader.tsx`, `src/lib/documents.ts`, `src/lib/all-athlete-documents.ts`
- **Dipendenze:** storage; profilo atleta
- **Note:** —

---

## Pagamenti e abbonamenti

- **Tipo:** feature
- **Cartelle:** `src/app/dashboard/pagamenti/`, `src/app/dashboard/abbonamenti/`, `src/app/home/pagamenti/`, `src/app/dashboard/nutrizionista/abbonamenti/`, `src/app/dashboard/massaggiatore/abbonamenti/`, `src/components/dashboard/pagamenti/`
- **File chiave:** `src/components/dashboard/pagamenti/payments-table.tsx`, `src/lib/export-payments.ts`, `src/lib/abbonamenti-service-type.ts`, `src/lib/credits/ledger.ts`
- **Dipendenze:** clienti/atleti; dati lezioni/abbonamenti
- **Note:** Più superfici per ruolo (generico vs nutrizionista/massaggiatore).

---

## Esercizi, allenamenti, schede e piani workout

- **Tipo:** feature
- **Cartelle:** `src/app/dashboard/allenamenti/`, `src/app/dashboard/esercizi/`, `src/app/dashboard/schede/`, `src/app/home/allenamenti/`, `src/app/api/exercises/`, `src/app/api/athlete/workout-plans/`, `src/components/workout/`, `src/components/workout-plans/`, `src/lib/exercises-data.ts`, `src/lib/exercises-storage.ts`, `src/lib/workouts/`, `src/lib/validations/allenamento.ts`
- **File chiave:** `src/components/workout/workout-wizard.tsx`, `src/lib/workouts/workout-transformers.ts`, `src/app/api/athlete/workout-plans/route.ts`, `src/lib/export-allenamenti.ts`
- **Dipendenze:** catalogo esercizi; atleta; upload media esercizi (`src/lib/exercise-upload-utils.ts`)
- **Note:** Nomenclatura mista allenamenti / workout / schede.

---

## Progressi, misurazioni e foto atleta

- **Tipo:** feature
- **Cartelle:** `src/app/home/progressi/`, `src/app/home/foto-risultati/`, `src/components/athlete/progress-*.tsx`, `src/components/dashboard/progress-*.tsx`, `src/lib/constants/progress-ranges.ts`, `src/lib/mock-data-progress.ts`
- **File chiave:** `src/app/home/progressi/page.tsx`, `src/lib/analytics.ts` (uso condiviso con statistiche)
- **Dipendenze:** Supabase; dominio nutrizionista per export PDF
- **Note:** Componenti “progress” sia in `athlete/` che in `dashboard/`.

---

## Inviti atleti

- **Tipo:** feature
- **Cartelle:** `src/app/dashboard/invita-atleta/`, `src/app/api/invitations/`, `src/components/invitations/`, `src/lib/invitations/`, `src/components/home/invito-cliente-wizard.tsx`
- **File chiave:** `src/app/api/invitations/send-email/route.ts`, `src/lib/invitations/send-invitation-email.ts`, `src/lib/validations/invito.ts`
- **Dipendenze:** email/comunicazioni; registrazione (`src/app/registrati/`, `src/app/api/register/complete-profile/`)
- **Note:** —

---

## Onboarding, questionari e completamento profilo

- **Tipo:** feature
- **Cartelle:** `src/app/api/onboarding/`, `src/app/api/register/complete-profile/`
- **File chiave:** `src/app/api/onboarding/save-step/route.ts`, `src/app/api/onboarding/save-questionnaire/route.ts`, `src/app/api/onboarding/finish/route.ts`, `src/app/api/register/complete-profile/route.ts`
- **Dipendenze:** autenticazione; profili
- **Note:** Nei file audit la superficie è soprattutto API (poche page dedicate rispetto ad altri domini).

---

## Marketing (analytics, lead, automazioni, campagne, segmenti)

- **Tipo:** feature
- **Cartelle:** `src/app/dashboard/marketing/`, `src/app/dashboard/admin/utenti/marketing/`, `src/app/api/marketing/`, `src/app/api/admin/cron/refresh-marketing-kpis/`, `src/lib/marketing/`, `src/components/shared/analytics/`
- **File chiave:** `src/app/dashboard/marketing/leads/page.tsx`, `src/app/api/marketing/leads/route.ts`, `src/lib/marketing/segment-rules.ts`, `src/app/api/admin/users/marketing/route.ts`
- **Dipendenze:** anagrafica/atleti; email; Supabase; cron admin
- **Note:** Gerarchia ampia di sottoroute (`campaigns`, `segments`, `automations`, `report`, … negli audit).

---

## Area nutrizionista

- **Tipo:** feature
- **Cartelle:** `src/app/dashboard/nutrizionista/`, `src/app/api/nutritionist/extract-progress-pdf/`
- **File chiave:** `src/app/dashboard/nutrizionista/layout.tsx`, `src/app/api/nutritionist/extract-progress-pdf/route.ts`, `src/lib/nutrition-tables.ts`, `src/lib/dossier-pdf.ts`
- **Dipendenze:** atleti; documenti/progressi; abbonamenti
- **Note:** Albero parallelo alla dashboard generica (piani, check-in, progressi, …).

---

## Area massaggiatore

- **Tipo:** feature
- **Cartelle:** `src/app/dashboard/massaggiatore/`, `src/app/home/massaggiatore/`
- **File chiave:** `src/app/dashboard/massaggiatore/layout.tsx`, `src/app/dashboard/massaggiatore/page.tsx`, `src/app/home/massaggiatore/page.tsx`
- **Dipendenze:** calendario/appuntamenti; chat; abbonamenti (route dedicate in audit)
- **Note:** Presenza sia sotto `dashboard/` sia sotto `home/`.

---

## Notifiche e push

- **Tipo:** feature (con parti infrastrutturali)
- **Cartelle:** `src/app/api/push/`, `src/lib/notifications/`, `src/lib/notifications.ts`, `src/components/athlete/notifications-section.tsx`, `src/components/sw-register.tsx`
- **File chiave:** `src/app/api/push/subscribe/route.ts`, `src/lib/notifications/push.ts`, `src/lib/notifications/scheduler.ts`, `src/app/api/calendar/notify-appointment-change/route.ts`
- **Dipendenze:** Supabase; service worker lato client
- **Note:** Collegamento operativo con email calendario e comunicazioni.

---

## Impostazioni per area

- **Tipo:** feature
- **Cartelle:** `src/app/dashboard/impostazioni/`, `src/app/dashboard/calendario/impostazioni/`, `src/app/dashboard/marketing/impostazioni/`, `src/app/dashboard/nutrizionista/impostazioni/`, `src/app/dashboard/massaggiatore/impostazioni/`, `src/components/settings/`, `src/components/dashboard/impostazioni-page-header.tsx`
- **File chiave:** `src/app/dashboard/impostazioni/page.tsx`, `src/components/settings/settings-account-tab.tsx`, `src/components/settings/two-factor-setup.tsx`, `src/components/settings/settings-notifications-tab.tsx`
- **Dipendenze:** profilo utente; preferenze notifiche
- **Note:** Molteplici route “impostazioni” per contesto.

---

## Statistiche e reporting staff

- **Tipo:** feature
- **Cartelle:** `src/app/dashboard/statistiche/`, `src/app/dashboard/admin/statistiche/`, `src/app/dashboard/massaggiatore/statistiche/`, `src/components/dashboard/statistiche*.tsx`, `src/components/dashboard/stats-*.tsx`, `src/app/api/admin/statistics/`, `src/components/charts/`
- **File chiave:** `src/components/dashboard/statistiche-content.tsx`, `src/app/api/admin/statistics/route.ts`, `src/lib/analytics.ts`, `src/lib/analytics-export.ts`
- **Dipendenze:** KPI operativi (appuntamenti, pagamenti, …)
- **Note:** —

---

## Pagine pubbliche e legal

- **Tipo:** feature
- **Cartelle:** `src/app/privacy/`, `src/app/termini/`, `src/app/page.tsx`, `src/app/not-found.tsx`
- **File chiave:** `src/app/privacy/page.tsx`, `src/app/termini/page.tsx`
- **Dipendenze:** —
- **Note:** —

---

## Design system (UI reference interna)

- **Tipo:** shared
- **Cartelle:** `src/app/design-system/`, `src/lib/design-tokens/`, `src/lib/design-system-data.ts`, `src/lib/design-system-export.ts`
- **File chiave:** `src/app/design-system/page.tsx`, `src/app/design-system/GUIDA_DESIGN_SYSTEM.md`
- **Dipendenze:** componenti primitivi (`src/components/ui/`)
- **Note:** —

---

## Kit UI primitivo e pattern condivisi

- **Tipo:** shared
- **Cartelle:** `src/components/ui/`, `src/components/shared/ui/`, `src/components/common/`, `src/lib/ui/notify.ts`, `src/lib/design-tokens/*`
- **File chiave:** `src/components/ui/button.tsx`, `src/components/ui/dialog.tsx`, `src/components/shared/ui/empty-state.tsx`, `src/components/shared/ui/notification-toast.tsx`
- **Dipendenze:** nessun dominio di business
- **Note:** Due alberi `ui/` vs `shared/ui/` (possibile duplicazione di ruoli).

---

## Infrastruttura client/server e API trasversali

- **Tipo:** infrastructure
- **Cartelle:** `src/lib/supabase/`, `src/lib/supabase.ts`, `src/lib/realtimeClient.ts`, `src/lib/api-client.ts`, `src/lib/api-logger.ts`, `src/lib/error-handler.ts`, `src/lib/rate-limit.ts`, `src/lib/retry-policy.ts`, `src/lib/cache/`, `src/lib/query-keys.ts`, `src/lib/fetchWithCache.ts`, `src/lib/sanitize.ts`, `src/app/api/health/`, `src/providers/` (auth/query/theme da `audit/tree.txt`)
- **File chiave:** `src/lib/supabase/client.ts`, `src/lib/supabase/server.ts`, `src/lib/supabase/middleware.ts`, `src/app/api/health/route.ts`
- **Dipendenze:** runtime Next.js; variabili ambiente Supabase
- **Note:** `src/lib/utils.ts` e `src/lib/utils/*` concentrano helper molto trasversali (validazione, ruoli client, URL app, …).

---

## Database Supabase (migrazioni, policy, edge functions)

- **Tipo:** infrastructure
- **Cartelle:** `supabase/` (in `audit/tree.txt`: `config.toml`, `migrations/`, `functions/document-reminders/`, `functions/marketing-kpi-refresh/`, `policies/`, `templates/`)
- **File chiave:** `supabase/config.toml`; esempi migrazioni presenti in tree: `20250308000000_calendario_full.sql`, `20250314_workout_plans_rls.sql`, `20260318143000_appointments_rls_cleanup_v1.sql`; `supabase/functions/document-reminders/index.ts`, `supabase/functions/marketing-kpi-refresh/index.ts`
- **Dipendenze:** tutti i domini con persistenza; cron/marketing lato server per refresh KPI
- **Note:** RLS e schema sono qui e in migrazioni; il client runtime resta in `src/lib/supabase/*`.

---

## Modelli TypeScript di dominio

- **Tipo:** shared
- **Cartelle:** `src/types/` (elencato in `audit/tree.txt` con file per allenamento, appuntamenti, profilo atleta, pagamenti, workout, ecc.)
- **File chiave:** `src/types/index.ts`, `src/types/supabase.ts`, `src/types/athlete-profile.ts`, `src/types/appointment.ts`
- **Dipendenze:** feature che importano questi tipi
- **Note:** Allineamento con DB tipicamente via rigenerazione tipi Supabase (non dettagliato negli audit testuali).

---

## Audit applicativo e middleware

- **Tipo:** infrastructure
- **Cartelle:** `src/lib/audit.ts`, `src/lib/audit-middleware.ts`, `src/components/shared/audit/`
- **File chiave:** `src/lib/audit.ts`, `src/lib/audit-middleware.ts`, `src/components/shared/audit/audit-logs.tsx`
- **Dipendenze:** azioni sensibili (admin, auth)
- **Note:** Distinto da cartella `audit/` del repo (documentazione / report).

---

## Diagnostica e operatività

- **Tipo:** infrastructure
- **Cartelle:** `src/app/api/debug-trainer-visibility/`, `src/app/api/communications/check-stuck/`
- **File chiave:** `src/app/api/debug-trainer-visibility/route.ts`, `src/app/api/communications/check-stuck/route.ts`
- **Dipendenze:** domini rispettivi (staff visibility; comunicazioni)
- **Note:** Route di supporto, non feature utente finale.

---

## App nativa Capacitor

- **Tipo:** infrastructure
- **Cartelle:** `android/`, `ios/`, `capacitor.config.ts` (presenti in `audit/tree.txt`)
- **File chiave:** `capacitor.config.ts`
- **Dipendenze:** build web Next; asset nativi sotto `android/` e `ios/`
- **Note:** —

---

## Test automatizzati

- **Tipo:** infrastructure
- **Cartelle:** `tests/e2e/` (numerosi `*.spec.ts` in `audit/tree.txt`, es. `appointments.spec.ts`, `clienti.spec.ts`, `marketing-lead-convert.spec.ts`), `tests/integration/`, `tests/unit/`, `tests/security/`, `playwright.config.ts`, `playwright.config.ci.ts`, `src/components/dashboard/__tests__/`, `src/components/workout/__tests__/` (da `audit/components.txt`)
- **File chiave:** `playwright.config.ts`, `tests/e2e/global-setup.ts`, `src/components/dashboard/__tests__/appointment-modal.test.tsx`, `src/components/workout/__tests__/trainer-session-modal.test.tsx`
- **Dipendenze:** domini coperti dai singoli spec
- **Note:** Workflow CI (inclusi job E2E) compaiono sotto `.github/workflows/` in `audit/tree.txt`.
