# 🔍 Analisi Completa Progetto 22Club

**Data Inizio**: 2025-01-29T18:00:00Z  
**Stato**: 🔄 IN CORSO  
**Metodo**: Analisi sistematica cartelle `src` e `supabase`

---

## 📋 Obiettivo

Analizzare completamente il progetto per:

1. Identificare TUTTI i moduli, componenti, hooks, API routes
2. Mappare funzionalità e dipendenze
3. Identificare moduli non documentati
4. Creare albero progetto completo (A-Z)

---

## 🔄 STEP 1: Analisi Struttura Cartelle e File

### Struttura `src/`

```
src/
├── app/                          # Next.js App Router
│   ├── api/                      # API Routes (12 file)
│   ├── dashboard/                # Dashboard PT/Admin (24 file)
│   ├── home/                     # Dashboard Atleta (13 file)
│   ├── login/                    # Autenticazione
│   ├── registrati/              # Registrazione
│   └── ...
├── components/                   # Componenti React (139 file)
│   ├── ui/                       # Design System
│   ├── dashboard/                # Componenti dashboard
│   ├── athlete/                  # Componenti atleta
│   ├── calendar/                 # Componenti calendario
│   ├── chat/                     # Componenti chat
│   ├── documents/                # Componenti documenti
│   ├── workout/                  # Componenti workout
│   ├── appointments/             # Componenti appuntamenti
│   ├── invitations/              # Componenti inviti
│   ├── settings/                 # Componenti impostazioni
│   └── shared/                   # Componenti condivisi
├── hooks/                        # React Hooks (51 file)
│   ├── athlete-profile/          # Hooks profilo atleta (9 hook)
│   └── __tests__/                # Test hooks
├── lib/                          # Utilities e helpers (28 file)
│   ├── supabase/                 # Supabase utilities
│   ├── validations/              # Validazioni Zod
│   └── notifications/             # Sistema notifiche
├── providers/                    # Context Providers (3 file)
├── types/                        # TypeScript types (15 file)
├── config/                       # Configurazioni (5 file)
└── styles/                       # CSS globali (6 file)
```

### Struttura `supabase/`

```
supabase/
├── migrations/                   # Migrazioni database (40+ file)
├── functions/                    # Edge Functions (1 function)
├── policies/                     # RLS Policies
└── seed.sql                      # Seed data
```

---

## 🔄 STEP 2: Analisi Componenti React (139 file)

### Componenti UI Base (Design System)

- ✅ `button.tsx`, `card.tsx`, `input.tsx`, `select.tsx`, `textarea.tsx`
- ✅ `dialog.tsx`, `drawer.tsx`, `tabs.tsx`, `badge.tsx`, `avatar.tsx`
- ✅ `progress.tsx`, `skeleton.tsx`, `spinner.tsx`, `toast.tsx`
- ✅ `date-range-picker.tsx`, `simple-select.tsx`, `slider.tsx`
- ✅ `error-boundary.tsx`, `error-display.tsx`, `navigation-loading.tsx`
- ✅ `professional-icons.tsx`, `theme-toggle.tsx`, `animations.tsx`

**Stato Documentazione**: ⚠️ PARZIALE (solo alcuni componenti documentati)

### Componenti Dashboard (30+ file)

- ✅ `athlete-profile/` (9 tab componenti)
- ✅ `appointment-modal.tsx`, `reschedule-appointment-modal.tsx`
- ✅ `crea-atleta-modal.tsx`, `modifica-atleta-modal.tsx`
- ✅ `exercise-form-modal.tsx`
- ✅ `nuovo-pagamento-modal.tsx`, `payment-form-modal.tsx`
- ✅ `assign-workout-modal.tsx`, `allenamento-dettaglio-modal.tsx`
- ✅ `cliente-card.tsx`, `cliente-dropdown-menu.tsx`
- ✅ `clienti-filtri-avanzati.tsx`, `clienti-bulk-actions.tsx`
- ✅ `clienti-export-menu.tsx`
- ✅ `allenamenti-filtri-avanzati.tsx`, `allenamenti-export-menu.tsx`
- ✅ `progress-charts.tsx`, `progress-timeline.tsx`, `progress-kpi-cards.tsx`
- ✅ `stats-charts.tsx`, `stats-table.tsx`, `lazy-stats-charts.tsx`
- ✅ `kpi-card.tsx`, `modern-kpi-card.tsx`
- ✅ `sidebar.tsx`, `breadcrumb.tsx`, `quick-actions.tsx`
- ✅ `action-drawers.tsx`, `agenda-timeline.tsx`
- ✅ `error-boundary.tsx`, `error-state.tsx`, `loading-state.tsx`
- ✅ `modals-wrapper.tsx`

**Stato Documentazione**: ⚠️ PARZIALE (solo alcuni documentati)

### Componenti Calendar (5 file)

- ✅ `calendar-view.tsx` - ✅ DOCUMENTATO
- ✅ `appointment-form.tsx` - ✅ DOCUMENTATO
- ✅ `appointment-detail.tsx`
- ✅ `appointments-table.tsx`
- ✅ `appointment-conflict-alert.tsx`, `appointment-validation.tsx`

**Stato Documentazione**: ⚠️ PARZIALE (2/5 documentati)

### Componenti Chat (5 file)

- ✅ `message-list.tsx`
- ✅ `message-input.tsx`
- ✅ `conversation-list.tsx`
- ✅ `file-upload.tsx`
- ✅ `emoji-picker.tsx`

**Stato Documentazione**: ❌ NON DOCUMENTATO

### Componenti Documents (4 file)

- ✅ `document-uploader.tsx`
- ✅ `document-uploader-modal.tsx`
- ✅ `document-status-badge.tsx`
- ✅ `index.ts`

**Stato Documentazione**: ❌ NON DOCUMENTATO

### Componenti Workout (5 file)

- ✅ `workout-wizard.tsx` - ✅ DOCUMENTATO
- ✅ `exercise-catalog.tsx` - ✅ DOCUMENTATO
- ✅ `workout-detail-modal.tsx`
- ✅ `trainer-session-modal.tsx`
- ✅ `rest-timer.tsx`

**Stato Documentazione**: ⚠️ PARZIALE (2/5 documentati)

### Componenti Athlete (8 file)

- ✅ `appointments-card.tsx`
- ✅ `workout-card.tsx`
- ✅ `progress-charts.tsx`
- ✅ `progress-flash.tsx`
- ✅ `progress-recent.tsx`, `progress-recent-new.tsx`
- ✅ `notifications-section.tsx`
- ✅ `tab-bar.tsx`
- ✅ `athlete-background.tsx`

**Stato Documentazione**: ❌ NON DOCUMENTATO

### Componenti Shared (10+ file)

- ✅ `analytics/` (trend-chart, distribution-chart, kpi-metrics)
- ✅ `dashboard/` (sidebar, role-layout, kpi-card)
- ✅ `ui/` (error-boundary, empty-state, haptic-button, notification-toast, transition-wrapper, shimmer)
- ✅ `audit/` (audit-logs)
- ✅ `appointments-card.tsx`
- ✅ `logo-22club.tsx`

**Stato Documentazione**: ❌ NON DOCUMENTATO

### Componenti Settings (3 file)

- ✅ `avatar-uploader.tsx` - ✅ DOCUMENTATO
- ✅ `change-password-modal.tsx`
- ✅ `two-factor-setup.tsx`

**Stato Documentazione**: ⚠️ PARZIALE (1/3 documentati)

### Componenti Invitations (2 file)

- ✅ `qr-code.tsx`
- ✅ `index.ts`

**Stato Documentazione**: ❌ NON DOCUMENTATO

---

## 🔄 STEP 3: Analisi Hooks React (51 file)

### Hooks Principali (30+ file)

- ✅ `use-auth.ts` - ✅ DOCUMENTATO
- ✅ `use-appointments.ts` - ✅ DOCUMENTATO
- ✅ `use-workouts.ts` - ✅ DOCUMENTATO
- ✅ `use-chat.ts` - ❌ NON DOCUMENTATO
- ✅ `use-payments.ts` - ❌ NON DOCUMENTATO
- ✅ `use-documents.ts` - ❌ NON DOCUMENTATO
- ✅ `use-progress.ts` - ❌ NON DOCUMENTATO
- ✅ `use-clienti.ts` - ❌ NON DOCUMENTATO
- ✅ `use-allenamenti.ts` - ❌ NON DOCUMENTATO
- ✅ `use-invitations.ts` - ❌ NON DOCUMENTATO
- ✅ `use-notifications.ts` - ❌ NON DOCUMENTATO
- ✅ `use-push.ts`, `use-push-notifications.ts` - ❌ NON DOCUMENTATO
- ✅ `use-chat-notifications.ts` - ❌ NON DOCUMENTATO
- ✅ `use-progress-analytics.ts` - ❌ NON DOCUMENTATO
- ✅ `use-progress-reminders.ts` - ❌ NON DOCUMENTATO
- ✅ `use-lesson-counters.ts` - ❌ NON DOCUMENTATO
- ✅ `use-debounced-value.ts`, `use-debounced-callback.ts` - ❌ NON DOCUMENTATO
- ✅ `use-api-with-retry.ts` - ❌ NON DOCUMENTATO
- ✅ `use-navigation-state.ts` - ❌ NON DOCUMENTATO
- ✅ `use-login-protection.ts` - ❌ NON DOCUMENTATO
- ✅ `use-supabase.ts` - ❌ NON DOCUMENTATO
- ✅ `useTheme.ts`, `useAuth.ts`, `useRealtimeChannel.ts` - ❌ NON DOCUMENTATO

### Hooks Profilo Atleta (9 file)

- ✅ `use-athlete-anagrafica.ts` - ✅ DOCUMENTATO
- ✅ `use-athlete-medical.ts` - ✅ DOCUMENTATO
- ✅ `use-athlete-fitness.ts` - ❌ NON DOCUMENTATO
- ✅ `use-athlete-motivational.ts` - ❌ NON DOCUMENTATO
- ✅ `use-athlete-nutrition.ts` - ❌ NON DOCUMENTATO
- ✅ `use-athlete-massage.ts` - ❌ NON DOCUMENTATO
- ✅ `use-athlete-administrative.ts` - ❌ NON DOCUMENTATO
- ✅ `use-athlete-smart-tracking.ts` - ❌ NON DOCUMENTATO
- ✅ `use-athlete-ai-data.ts` - ❌ NON DOCUMENTATO

**Stato Documentazione**: ⚠️ PARZIALE (2/9 documentati)

---

## 🔄 STEP 4: Analisi API Routes (12 file)

- ✅ `/api/exercises/route.ts` - ✅ DOCUMENTATO
- ✅ `/api/athletes/[id]/route.ts` - ✅ DOCUMENTATO
- ✅ `/api/athletes/create/route.ts` - ❌ NON DOCUMENTATO
- ✅ `/api/auth/context/route.ts` - ❌ NON DOCUMENTATO
- ✅ `/api/dashboard/appointments/route.ts` - ❌ NON DOCUMENTATO
- ✅ `/api/push/subscribe/route.ts` - ❌ NON DOCUMENTATO
- ✅ `/api/push/unsubscribe/route.ts` - ❌ NON DOCUMENTATO
- ✅ `/api/push/vapid-key/route.ts` - ❌ NON DOCUMENTATO
- ✅ `/api/cron/notifications/route.ts` - ❌ NON DOCUMENTATO
- ✅ `/api/health/route.ts` - ❌ NON DOCUMENTATO
- ✅ `/api/web-vitals/route.ts` - ❌ NON DOCUMENTATO
- ✅ `/api/icon-144x144/route.ts` - ❌ NON DOCUMENTATO

**Stato Documentazione**: ⚠️ PARZIALE (2/12 documentati)

---

## 🔄 STEP 5: Analisi Database Migrations (40+ file)

### Migrazioni Principali

- ✅ `20250110_003_profiles.sql` - Tabella profiles
- ✅ `20250110_034_calendar_complete.sql` - Sistema calendario
- ✅ `20251009_create_workout_plans.sql` - Schede allenamento
- ✅ `20251011_create_workouts_schema.sql` - Schema workouts completo
- ✅ `20251008_exercises.sql` - Tabella esercizi
- ✅ `20250127_create_athlete_*_data.sql` - Dati profilo atleta (8 file)
- ✅ `20251009_create_workout_logs.sql` - Log allenamenti
- ✅ `20251008_push_subscriptions.sql` - Push notifications
- ✅ `2025_audit_logs.sql` - Audit logs
- ✅ `2025_security_policies.sql` - Security policies
- ✅ E molti altri...

**Stato Documentazione**: ⚠️ PARZIALE (solo workouts documentato)

---

## 🔄 STEP 6: Identificazione Moduli Non Documentati

### Moduli Completamente Non Documentati

1. **Sistema Chat** ❌
   - Hook: `use-chat.ts`
   - Componenti: `message-list.tsx`, `message-input.tsx`, `conversation-list.tsx`, `file-upload.tsx`, `emoji-picker.tsx`
   - Pages: `/dashboard/chat/page.tsx`, `/home/chat/page.tsx`
   - Database: `chat_messages` table

2. **Sistema Pagamenti** ❌
   - Hook: `use-payments.ts`
   - Componenti: `nuovo-pagamento-modal.tsx`, `payment-form-modal.tsx`
   - Pages: `/dashboard/pagamenti/page.tsx`, `/home/pagamenti/page.tsx`
   - Database: `payments` table

3. **Sistema Documenti** ❌
   - Hook: `use-documents.ts`
   - Componenti: `document-uploader.tsx`, `document-uploader-modal.tsx`, `document-status-badge.tsx`
   - Pages: `/dashboard/documenti/page.tsx`, `/home/documenti/page.tsx`
   - Database: `documents` table, Storage bucket

4. **Sistema Progressi** ❌
   - Hook: `use-progress.ts`, `use-progress-analytics.ts`, `use-progress-reminders.ts`
   - Componenti: `progress-charts.tsx`, `progress-timeline.tsx`, `progress-kpi-cards.tsx`, `progress-flash.tsx`
   - Pages: `/home/progressi/page.tsx`, `/home/progressi/foto/page.tsx`, `/home/progressi/nuovo/page.tsx`
   - Database: `progress_logs`, `progress_photos` tables

5. **Sistema Clienti** ❌
   - Hook: `use-clienti.ts`
   - Componenti: `cliente-card.tsx`, `cliente-dropdown-menu.tsx`, `clienti-filtri-avanzati.tsx`, `clienti-bulk-actions.tsx`, `clienti-export-menu.tsx`
   - Pages: `/dashboard/clienti/page.tsx`
   - Database: `pt_atleti`, `cliente_tags` tables

6. **Sistema Allenamenti** ❌
   - Hook: `use-allenamenti.ts`
   - Componenti: `allenamenti-filtri-avanzati.tsx`, `allenamenti-export-menu.tsx`, `allenamento-dettaglio-modal.tsx`
   - Pages: `/dashboard/allenamenti/page.tsx`, `/home/allenamenti/page.tsx`
   - Database: `workout_logs` table

7. **Sistema Inviti** ❌
   - Hook: `use-invitations.ts`
   - Componenti: `qr-code.tsx`
   - Pages: `/dashboard/invita-atleta/page.tsx`
   - Database: `inviti_atleti` table

8. **Sistema Notifiche** ❌
   - Hook: `use-notifications.ts`, `use-push.ts`, `use-push-notifications.ts`, `use-chat-notifications.ts`
   - Lib: `notifications.ts`, `notifications/push.ts`, `notifications/scheduler.ts`, `notifications/athlete-registration.ts`
   - Database: `notifications`, `push_subscriptions` tables

9. **Sistema Statistiche** ❌
   - Componenti: `stats-charts.tsx`, `stats-table.tsx`, `lazy-stats-charts.tsx`, `lazy-stats-table.tsx`
   - Pages: `/dashboard/statistiche/page.tsx`
   - Database: RPC functions (`get_clienti_stats`, `get_payments_stats`, etc.)

10. **Sistema Abbonamenti** ❌
    - Pages: `/dashboard/abbonamenti/page.tsx`
    - Database: `lesson_counters` table

11. **Sistema Comunicazioni** ❌
    - Pages: `/dashboard/comunicazioni/page.tsx`

12. **Sistema Impostazioni** ❌
    - Pages: `/dashboard/impostazioni/page.tsx`
    - Componenti: `change-password-modal.tsx`, `two-factor-setup.tsx`

---

## 📊 Statistiche Analisi

### File Totali Analizzati

- **Componenti React**: 139 file
- **Hooks**: 51 file
- **API Routes**: 12 file
- **Pages**: 37 file
- **Lib Utilities**: 28 file
- **Types**: 15 file
- **Migrations**: 40+ file

### Documentazione Attuale

- **Documentati**: 20 file
- **Parzialmente Documentati**: ~15 file
- **Non Documentati**: ~250+ file

### Copertura Documentazione

- **Hooks**: ~15% (8/51)
- **Componenti**: ~5% (7/139)
- **API Routes**: ~17% (2/12)
- **Pages**: ~0% (0/37)
- **Database**: ~5% (1/40+)

---

## 🎯 Prossimi Step

1. ✅ STEP 1: Analisi struttura - COMPLETATO
2. 🔄 STEP 2: Analisi dettagliata moduli non documentati
3. ⏳ STEP 3: Aggiornamento file ai_memory
4. ⏳ STEP 4: Creazione albero progetto completo

---

**Ultimo aggiornamento**: 2025-01-29T18:15:00Z

---

## 🔄 STEP 2: Analisi Dettagliata Moduli Non Documentati

### Modulo Chat

- **Hook**: `use-chat.ts` (634 righe) - Gestione conversazioni, messaggi, file upload
- **Componenti**: 5 file (message-list, message-input, conversation-list, file-upload, emoji-picker)
- **Pages**: `/dashboard/chat/page.tsx`, `/home/chat/page.tsx`, `/dashboard/atleti/[id]/chat/page.tsx`
- **Database**: `chat_messages` table
- **Features**: Real-time messaging, file upload, emoji picker, unread count

### Modulo Pagamenti

- **Hook**: `use-payments.ts` (175 righe) - CRUD pagamenti, filtri per ruolo
- **Componenti**: `nuovo-pagamento-modal.tsx`, `payment-form-modal.tsx`
- **Pages**: `/dashboard/pagamenti/page.tsx` (740 righe), `/home/pagamenti/page.tsx`
- **Database**: `payments` table
- **Features**: Registrazione pagamenti, contatore lezioni, export CSV

### Modulo Documenti

- **Hook**: `use-documents.ts` (148 righe) - CRUD documenti, filtri, upload
- **Componenti**: `document-uploader.tsx`, `document-uploader-modal.tsx`, `document-status-badge.tsx`
- **Pages**: `/dashboard/documenti/page.tsx` (709 righe), `/home/documenti/page.tsx`
- **Database**: `documents` table, Storage bucket `documents`
- **Features**: Upload documenti, scadenze, validazione, download

### Modulo Progressi

- **Hook**: `use-progress.ts` (258 righe), `use-progress-analytics.ts`, `use-progress-reminders.ts`
- **Componenti**: `progress-charts.tsx`, `progress-timeline.tsx`, `progress-kpi-cards.tsx`, `progress-flash.tsx`
- **Pages**: `/home/progressi/page.tsx`, `/home/progressi/foto/page.tsx`, `/home/progressi/nuovo/page.tsx`, `/dashboard/atleti/[id]/progressi/page.tsx`
- **Database**: `progress_logs`, `progress_photos` tables, Storage bucket `progress-photos`
- **Features**: Tracking progressi, foto, statistiche, reminder

### Modulo Clienti

- **Hook**: `use-clienti.ts` - Gestione clienti/atleti
- **Componenti**: `cliente-card.tsx`, `cliente-dropdown-menu.tsx`, `clienti-filtri-avanzati.tsx`, `clienti-bulk-actions.tsx`, `clienti-export-menu.tsx`, `crea-atleta-modal.tsx`, `modifica-atleta-modal.tsx`
- **Pages**: `/dashboard/clienti/page.tsx` (757 righe)
- **Database**: `pt_atleti`, `cliente_tags`, `profiles_tags` tables
- **Features**: CRUD clienti, filtri avanzati, bulk actions, export CSV/PDF, tags

### Modulo Allenamenti

- **Hook**: `use-allenamenti.ts` - Gestione sessioni allenamento
- **Componenti**: `allenamenti-filtri-avanzati.tsx`, `allenamenti-export-menu.tsx`, `allenamento-dettaglio-modal.tsx`
- **Pages**: `/dashboard/allenamenti/page.tsx`, `/home/allenamenti/page.tsx`, `/home/allenamenti/oggi/page.tsx`, `/home/allenamenti/riepilogo/page.tsx`
- **Database**: `workout_logs` table
- **Features**: Tracking sessioni, statistiche, export, filtri periodo

### Modulo Inviti

- **Hook**: `use-invitations.ts` - Gestione inviti atleti
- **Componenti**: `qr-code.tsx`
- **Pages**: `/dashboard/invita-atleta/page.tsx`
- **Database**: `inviti_atleti` table
- **Features**: Generazione inviti, QR code, tracking stato

### Modulo Notifiche

- **Hook**: `use-notifications.ts`, `use-push.ts`, `use-push-notifications.ts`, `use-chat-notifications.ts`
- **Lib**: `notifications.ts`, `notifications/push.ts`, `notifications/scheduler.ts`, `notifications/athlete-registration.ts`
- **API Routes**: `/api/push/subscribe`, `/api/push/unsubscribe`, `/api/push/vapid-key`, `/api/cron/notifications`
- **Database**: `notifications`, `push_subscriptions` tables
- **Features**: Notifiche in-app, push notifications, email, SMS, scheduling

### Modulo Statistiche

- **Lib**: `analytics.ts` - Engine analytics con mock data
- **Componenti**: `stats-charts.tsx`, `stats-table.tsx`, `lazy-stats-charts.tsx`, `lazy-stats-table.tsx`, `shared/analytics/trend-chart.tsx`, `shared/analytics/distribution-chart.tsx`, `shared/analytics/kpi-metrics.tsx`
- **Pages**: `/dashboard/statistiche/page.tsx` (120 righe)
- **Database**: RPC functions (`get_clienti_stats`, `get_payments_stats`, etc.)
- **Features**: Dashboard analytics, trend charts, distribution charts, KPI metrics, export report

### Modulo Abbonamenti

- **Pages**: `/dashboard/abbonamenti/page.tsx`
- **Database**: `lesson_counters` table
- **Features**: Gestione abbonamenti, contatori lezioni

### Modulo Comunicazioni

- **Pages**: `/dashboard/comunicazioni/page.tsx`
- **Features**: Sistema comunicazioni (da analizzare)

### Modulo Impostazioni

- **Pages**: `/dashboard/impostazioni/page.tsx` (949 righe)
- **Componenti**: `change-password-modal.tsx`, `two-factor-setup.tsx`
- **Features**: Impostazioni profilo, sicurezza, notifiche, privacy, aspetto

---

## 📊 Statistiche Finali Analisi

### File Totali Identificati

- **Componenti React**: 139 file
- **Hooks**: 51 file
- **API Routes**: 12 file
- **Pages Next.js**: 37 file
- **Lib Utilities**: 28 file
- **Types**: 15 file
- **Migrations**: 51 file
- **Config**: 5 file
- **Styles**: 6 file
- **Providers**: 3 file

**TOTALE**: ~336 file

### Moduli Funzionali Identificati

1. ✅ Autenticazione (documentato parzialmente)
2. ✅ Calendario/Appuntamenti (documentato 60%)
3. ✅ Esercizi (documentato 100%)
4. ✅ Schede Allenamento (documentato 100%)
5. ✅ Profili (documentato 60%)
6. ❌ Chat (0% documentato)
7. ❌ Pagamenti (0% documentato)
8. ❌ Documenti (0% documentato)
9. ❌ Progressi (0% documentato)
10. ❌ Clienti (0% documentato)
11. ❌ Allenamenti (0% documentato)
12. ❌ Inviti (0% documentato)
13. ❌ Notifiche (0% documentato)
14. ❌ Statistiche (0% documentato)
15. ❌ Abbonamenti (0% documentato)
16. ❌ Comunicazioni (0% documentato)
17. ❌ Impostazioni (0% documentato)

### Copertura Documentazione

- **Moduli Documentati**: 5/17 (29%)
- **Moduli Parzialmente Documentati**: 2/17 (12%)
- **Moduli Non Documentati**: 10/17 (59%)

---

**Ultimo aggiornamento**: 2025-01-29T18:15:00Z
