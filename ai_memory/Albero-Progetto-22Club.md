# 🌳 Albero Progetto 22Club - Struttura Completa A-Z

**Data Creazione**: 2025-01-29T18:20:00Z  
**Versione**: 1.0  
**Stato**: ✅ COMPLETO

---

## 📁 Struttura Completa Progetto

```
22club-setup V1 online/
│
├── 📁 src/                                    # Source code principale
│   │
│   ├── 📁 app/                                # Next.js App Router (37 file)
│   │   │
│   │   ├── 📁 api/                            # API Routes (12 file)
│   │   │   ├── 📁 athletes/
│   │   │   │   ├── 📁 [id]/
│   │   │   │   │   └── route.ts              # GET/PUT/DELETE atleta
│   │   │   │   └── 📁 create/
│   │   │   │       └── route.ts              # POST crea atleta
│   │   │   ├── 📁 auth/
│   │   │   │   └── 📁 context/
│   │   │   │       └── route.ts              # GET auth context
│   │   │   ├── 📁 cron/
│   │   │   │   └── 📁 notifications/
│   │   │   │       └── route.ts              # POST cron notifiche
│   │   │   ├── 📁 dashboard/
│   │   │   │   └── 📁 appointments/
│   │   │   │       └── route.ts              # GET appuntamenti dashboard
│   │   │   ├── 📁 exercises/
│   │   │   │   └── route.ts                  # GET/POST/PUT/DELETE esercizi ✅ DOC
│   │   │   ├── 📁 health/
│   │   │   │   └── route.ts                  # GET health check
│   │   │   ├── 📁 icon-144x144/
│   │   │   │   └── route.ts                  # GET icon
│   │   │   ├── 📁 push/
│   │   │   │   ├── 📁 subscribe/
│   │   │   │   │   └── route.ts              # POST subscribe push
│   │   │   │   ├── 📁 unsubscribe/
│   │   │   │   │   └── route.ts              # POST unsubscribe push
│   │   │   │   └── 📁 vapid-key/
│   │   │   │       └── route.ts              # GET VAPID key
│   │   │   └── 📁 web-vitals/
│   │   │       └── route.ts                  # POST web vitals
│   │   │
│   │   ├── 📁 dashboard/                      # Dashboard PT/Admin (24 file)
│   │   │   ├── layout.tsx                     # Layout dashboard
│   │   │   ├── page.tsx                       # Home dashboard
│   │   │   ├── 📁 _components/                # Componenti interni
│   │   │   │   ├── agenda-client.tsx
│   │   │   │   ├── new-appointment-button.tsx
│   │   │   │   ├── upcoming-appointments-client.tsx
│   │   │   │   └── upcoming-appointments.ts
│   │   │   ├── 📁 abbonamenti/
│   │   │   │   └── page.tsx                   # Gestione abbonamenti
│   │   │   ├── 📁 allenamenti/
│   │   │   │   ├── layout.tsx
│   │   │   │   └── page.tsx                   # Gestione allenamenti
│   │   │   ├── 📁 appuntamenti/
│   │   │   │   └── page.tsx                   # Lista appuntamenti
│   │   │   ├── 📁 atleti/
│   │   │   │   ├── 📁 [id]/
│   │   │   │   │   ├── page.tsx               # Profilo atleta
│   │   │   │   │   ├── 📁 chat/
│   │   │   │   │   │   └── page.tsx           # Chat con atleta
│   │   │   │   │   └── 📁 progressi/
│   │   │   │   │       └── page.tsx           # Progressi atleta
│   │   │   ├── 📁 calendario/
│   │   │   │   └── page.tsx                   # Vista calendario
│   │   │   ├── 📁 chat/
│   │   │   │   └── page.tsx                   # Chat generale
│   │   │   ├── 📁 clienti/
│   │   │   │   └── page.tsx                   # Gestione clienti
│   │   │   ├── 📁 comunicazioni/
│   │   │   │   └── page.tsx                   # Comunicazioni
│   │   │   ├── 📁 documenti/
│   │   │   │   └── page.tsx                   # Gestione documenti
│   │   │   ├── 📁 esercizi/
│   │   │   │   └── page.tsx                   # Catalogo esercizi
│   │   │   ├── 📁 impostazioni/
│   │   │   │   └── page.tsx                   # Impostazioni
│   │   │   ├── 📁 invita-atleta/
│   │   │   │   └── page.tsx                   # Invita atleta
│   │   │   ├── 📁 pagamenti/
│   │   │   │   └── page.tsx                   # Gestione pagamenti
│   │   │   ├── 📁 profilo/
│   │   │   │   └── page.tsx                   # Profilo PT ✅ DOC
│   │   │   ├── 📁 schede/
│   │   │   │   └── page.tsx                   # Schede allenamento
│   │   │   └── 📁 statistiche/
│   │   │       └── page.tsx                   # Dashboard statistiche
│   │   │
│   │   ├── 📁 home/                            # Dashboard Atleta (13 file)
│   │   │   ├── layout.tsx                      # Layout atleta
│   │   │   ├── page.tsx                        # Home atleta
│   │   │   ├── 📁 allenamenti/
│   │   │   │   ├── page.tsx                    # Lista allenamenti
│   │   │   │   ├── 📁 oggi/
│   │   │   │   │   └── page.tsx                # Allenamenti oggi
│   │   │   │   └── 📁 riepilogo/
│   │   │   │       └── page.tsx                # Riepilogo allenamenti
│   │   │   ├── 📁 appuntamenti/
│   │   │   │   └── page.tsx                    # Appuntamenti atleta
│   │   │   ├── 📁 chat/
│   │   │   │   └── page.tsx                    # Chat atleta
│   │   │   ├── 📁 documenti/
│   │   │   │   └── page.tsx                    # Documenti atleta
│   │   │   ├── 📁 pagamenti/
│   │   │   │   └── page.tsx                    # Pagamenti atleta
│   │   │   ├── 📁 profilo/
│   │   │   │   └── page.tsx                    # Profilo atleta
│   │   │   └── 📁 progressi/
│   │   │       ├── page.tsx                    # Lista progressi
│   │   │       ├── 📁 foto/
│   │   │       │   └── page.tsx                # Foto progressi
│   │   │       └── 📁 nuovo/
│   │   │           └── page.tsx                # Nuovo progresso
│   │   │
│   │   ├── 📁 login/
│   │   │   └── page.tsx                        # Login
│   │   ├── 📁 registrati/
│   │   │   └── page.tsx                        # Registrazione
│   │   ├── 📁 forgot-password/
│   │   │   └── page.tsx                        # Password dimenticata
│   │   ├── 📁 reset/
│   │   │   └── page.tsx                        # Reset password
│   │   ├── 📁 welcome/
│   │   │   └── page.tsx                        # Welcome page
│   │   ├── layout.tsx                           # Root layout
│   │   ├── page.tsx                             # Root page
│   │   ├── globals.css                          # CSS globale
│   │   └── favicon.ico
│   │
│   ├── 📁 components/                          # Componenti React (139 file)
│   │   │
│   │   ├── 📁 ui/                              # Design System (30+ file)
│   │   │   ├── animations.tsx
│   │   │   ├── api-state.tsx
│   │   │   ├── avatar.tsx
│   │   │   ├── badge.tsx
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── checkbox.tsx
│   │   │   ├── date-range-picker.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── drawer.tsx
│   │   │   ├── dropdown-menu.tsx
│   │   │   ├── error-boundary.tsx
│   │   │   ├── error-display.tsx
│   │   │   ├── heading.tsx
│   │   │   ├── index.ts                        # Export UI components
│   │   │   ├── input.tsx
│   │   │   ├── label.tsx
│   │   │   ├── navigation-loading.tsx
│   │   │   ├── professional-icons.tsx
│   │   │   ├── progress.tsx
│   │   │   ├── select.tsx
│   │   │   ├── separator.tsx
│   │   │   ├── simple-select.tsx
│   │   │   ├── skeleton.tsx
│   │   │   ├── slider.tsx
│   │   │   ├── spacing.tsx
│   │   │   ├── spinner.tsx
│   │   │   ├── stepper.tsx
│   │   │   ├── switch.tsx
│   │   │   ├── table.tsx
│   │   │   ├── tabs.tsx
│   │   │   ├── textarea.tsx
│   │   │   ├── theme-toggle.tsx
│   │   │   └── toast.tsx
│   │   │
│   │   ├── 📁 dashboard/                        # Componenti Dashboard (30+ file)
│   │   │   ├── 📁 athlete-profile/             # Tab profilo atleta (9 file)
│   │   │   │   ├── athlete-anagrafica-tab.tsx  ✅ DOC
│   │   │   │   ├── athlete-medical-tab.tsx
│   │   │   │   ├── athlete-fitness-tab.tsx
│   │   │   │   ├── athlete-motivational-tab.tsx
│   │   │   │   ├── athlete-nutrition-tab.tsx
│   │   │   │   ├── athlete-massage-tab.tsx
│   │   │   │   ├── athlete-administrative-tab.tsx
│   │   │   │   ├── athlete-smart-tracking-tab.tsx
│   │   │   │   ├── athlete-ai-data-tab.tsx
│   │   │   │   └── index.ts
│   │   │   ├── 📁 __tests__/
│   │   │   │   └── appointment-modal.test.tsx
│   │   │   ├── action-drawers.tsx
│   │   │   ├── agenda-timeline.tsx
│   │   │   ├── allenamenti-export-menu.tsx
│   │   │   ├── allenamenti-filtri-avanzati.tsx
│   │   │   ├── allenamento-dettaglio-modal.tsx
│   │   │   ├── appointment-modal.tsx
│   │   │   ├── assign-workout-modal.tsx
│   │   │   ├── athlete-progress.tsx
│   │   │   ├── breadcrumb.tsx
│   │   │   ├── cliente-card.tsx
│   │   │   ├── cliente-dropdown-menu.tsx
│   │   │   ├── clienti-bulk-actions.tsx
│   │   │   ├── clienti-export-menu.tsx
│   │   │   ├── clienti-filtri-avanzati.tsx
│   │   │   ├── crea-atleta-modal.tsx
│   │   │   ├── error-boundary.tsx
│   │   │   ├── error-state.tsx
│   │   │   ├── exercise-form-modal.tsx
│   │   │   ├── index.ts
│   │   │   ├── kpi-card.tsx
│   │   │   ├── lazy-stats-charts.tsx
│   │   │   ├── lazy-stats-table.tsx
│   │   │   ├── loading-state.tsx
│   │   │   ├── modals-wrapper.tsx
│   │   │   ├── modern-kpi-card.tsx
│   │   │   ├── modifica-atleta-modal.tsx
│   │   │   ├── nuovo-pagamento-modal.tsx
│   │   │   ├── payment-form-modal.tsx
│   │   │   ├── progress-charts.tsx
│   │   │   ├── progress-kpi-cards.tsx
│   │   │   ├── progress-timeline.tsx
│   │   │   ├── quick-actions.tsx
│   │   │   ├── reschedule-appointment-modal.tsx
│   │   │   ├── sidebar.tsx
│   │   │   ├── stats-charts.tsx
│   │   │   └── stats-table.tsx
│   │   │
│   │   ├── 📁 calendar/                        # Componenti Calendario (5 file)
│   │   │   ├── appointment-detail.tsx
│   │   │   ├── appointment-form.tsx             ✅ DOC
│   │   │   ├── appointments-table.tsx
│   │   │   ├── calendar-view.tsx               ✅ DOC
│   │   │   └── index.ts
│   │   │
│   │   ├── 📁 chat/                            # Componenti Chat (5 file)
│   │   │   ├── conversation-list.tsx
│   │   │   ├── emoji-picker.tsx
│   │   │   ├── file-upload.tsx
│   │   │   ├── index.ts
│   │   │   ├── message-input.tsx
│   │   │   └── message-list.tsx
│   │   │
│   │   ├── 📁 documents/                       # Componenti Documenti (4 file)
│   │   │   ├── document-status-badge.tsx
│   │   │   ├── document-uploader-modal.tsx
│   │   │   ├── document-uploader.tsx
│   │   │   └── index.ts
│   │   │
│   │   ├── 📁 workout/                         # Componenti Workout (5 file)
│   │   │   ├── exercise-catalog.tsx            ✅ DOC
│   │   │   ├── index.ts
│   │   │   ├── rest-timer.tsx
│   │   │   ├── trainer-session-modal.tsx
│   │   │   ├── workout-detail-modal.tsx
│   │   │   └── workout-wizard.tsx              ✅ DOC
│   │   │
│   │   ├── 📁 athlete/                         # Componenti Atleta (8 file)
│   │   │   ├── appointments-card.tsx
│   │   │   ├── athlete-background.tsx
│   │   │   ├── index.ts
│   │   │   ├── notifications-section.tsx
│   │   │   ├── progress-charts.tsx
│   │   │   ├── progress-flash.tsx
│   │   │   ├── progress-recent-new.tsx
│   │   │   ├── progress-recent.tsx
│   │   │   ├── tab-bar.tsx
│   │   │   └── workout-card.tsx
│   │   │
│   │   ├── 📁 appointments/                    # Componenti Appuntamenti (3 file)
│   │   │   ├── appointment-conflict-alert.tsx
│   │   │   ├── appointment-validation.tsx
│   │   │   └── index.ts
│   │   │
│   │   ├── 📁 invitations/                     # Componenti Inviti (2 file)
│   │   │   ├── index.ts
│   │   │   └── qr-code.tsx
│   │   │
│   │   ├── 📁 settings/                        # Componenti Impostazioni (3 file)
│   │   │   ├── avatar-uploader.tsx             ✅ DOC
│   │   │   ├── change-password-modal.tsx
│   │   │   └── two-factor-setup.tsx
│   │   │
│   │   ├── 📁 shared/                          # Componenti Condivisi (10+ file)
│   │   │   ├── 📁 analytics/
│   │   │   │   ├── distribution-chart.tsx
│   │   │   │   ├── kpi-metrics.tsx
│   │   │   │   └── trend-chart.tsx
│   │   │   ├── 📁 audit/
│   │   │   │   └── audit-logs.tsx
│   │   │   ├── 📁 dashboard/
│   │   │   │   ├── kpi-card.stories.tsx
│   │   │   │   ├── role-layout.tsx
│   │   │   │   └── sidebar.tsx
│   │   │   ├── 📁 ui/
│   │   │   │   ├── empty-state.tsx
│   │   │   │   ├── error-boundary.stories.tsx
│   │   │   │   ├── error-boundary.tsx
│   │   │   │   ├── haptic-button.tsx
│   │   │   │   ├── notification-toast.tsx
│   │   │   │   ├── shimmer.tsx
│   │   │   │   └── transition-wrapper.tsx
│   │   │   ├── appointments-card.stories.tsx
│   │   │   └── logo-22club.tsx
│   │   │
│   │   ├── 📁 auth/                            # Componenti Autenticazione (2 file)
│   │   │   ├── index.ts
│   │   │   └── login-form.tsx
│   │   │
│   │   ├── 📁 charts/                          # Componenti Charts (1 file)
│   │   │   └── client-recharts.tsx
│   │   │
│   │   ├── header.tsx                          # Header globale
│   │   ├── index.ts                            # Export principale
│   │   └── sw-register.tsx                     # Service Worker
│   │
│   ├── 📁 hooks/                               # React Hooks (51 file)
│   │   │
│   │   ├── 📁 athlete-profile/                 # Hooks Profilo Atleta (9 hook)
│   │   │   ├── 📁 __tests__/                   # Test hooks (9 file)
│   │   │   │   ├── use-athlete-administrative.test.ts
│   │   │   │   ├── use-athlete-ai-data.test.ts
│   │   │   │   ├── use-athlete-anagrafica.test.ts
│   │   │   │   ├── use-athlete-fitness.test.ts
│   │   │   │   ├── use-athlete-massage.test.ts
│   │   │   │   ├── use-athlete-medical.test.ts
│   │   │   │   ├── use-athlete-motivational.test.ts
│   │   │   │   ├── use-athlete-nutrition.test.ts
│   │   │   │   └── use-athlete-smart-tracking.test.ts
│   │   │   ├── use-athlete-administrative.ts
│   │   │   ├── use-athlete-ai-data.ts
│   │   │   ├── use-athlete-anagrafica.ts       ✅ DOC
│   │   │   ├── use-athlete-fitness.ts
│   │   │   ├── use-athlete-massage.ts
│   │   │   ├── use-athlete-medical.ts          ✅ DOC
│   │   │   ├── use-athlete-motivational.ts
│   │   │   ├── use-athlete-nutrition.ts
│   │   │   └── use-athlete-smart-tracking.ts
│   │   │
│   │   ├── 📁 __tests__/                       # Test hooks principali (5 file)
│   │   │   ├── use-appointments.test.ts
│   │   │   ├── use-auth.test.ts
│   │   │   ├── use-clienti.test.ts
│   │   │   ├── use-documents.test.ts
│   │   │   ├── use-payments.test.ts
│   │   │   └── use-workouts.test.ts
│   │   │
│   │   ├── use-allenamenti.ts                  # Hook gestione allenamenti
│   │   ├── use-api-with-retry.ts               # Hook retry API calls
│   │   ├── use-appointments.ts                 ✅ DOC
│   │   ├── use-auth.ts                         ✅ DOC
│   │   ├── use-chat-notifications.ts           # Hook notifiche chat
│   │   ├── use-chat.ts                          # Hook gestione chat
│   │   ├── use-clienti.ts                       # Hook gestione clienti
│   │   ├── use-debounced-callback.ts           # Hook debounce callback
│   │   ├── use-debounced-value.ts              # Hook debounce value
│   │   ├── use-documents.ts                     # Hook gestione documenti
│   │   ├── use-invitations.ts                   # Hook gestione inviti
│   │   ├── use-lesson-counters.ts               # Hook contatori lezioni
│   │   ├── use-login-protection.ts              # Hook protezione login
│   │   ├── use-navigation-state.ts              # Hook stato navigazione
│   │   ├── use-notifications.ts                 # Hook notifiche
│   │   ├── use-payments.ts                      # Hook gestione pagamenti
│   │   ├── use-progress-analytics.ts            # Hook analytics progressi
│   │   ├── use-progress-reminders.ts            # Hook reminder progressi
│   │   ├── use-progress.ts                      # Hook gestione progressi
│   │   ├── use-push-notifications.ts             # Hook push notifications
│   │   ├── use-push.ts                          # Hook push base
│   │   ├── use-supabase.ts                      # Hook Supabase client
│   │   ├── use-workouts.ts                      ✅ DOC
│   │   ├── useAuth.ts                           # Hook auth alternativo
│   │   ├── useRealtimeChannel.ts                # Hook realtime channel
│   │   ├── useTheme.ts                          # Hook theme
│   │   └── index.ts                             # Export hooks
│   │
│   ├── 📁 lib/                                 # Utilities e Helpers (28 file)
│   │   │
│   │   ├── 📁 supabase/                        # Supabase utilities (5 file)
│   │   │   ├── client.ts                       # Client Supabase
│   │   │   ├── middleware.ts                   # Middleware Supabase
│   │   │   ├── server.ts                       # Server Supabase ✅ DOC
│   │   │   ├── types.ts                        # Types Supabase
│   │   │   └── verify-connection.ts            # Verifica connessione
│   │   │
│   │   ├── 📁 validations/                     # Validazioni Zod (5 file)
│   │   │   ├── allenamento.ts
│   │   │   ├── appointment.ts
│   │   │   ├── cliente.ts
│   │   │   ├── dashboard.ts
│   │   │   └── invito.ts
│   │   │
│   │   ├── 📁 notifications/                   # Sistema notifiche (3 file)
│   │   │   ├── athlete-registration.ts
│   │   │   ├── push.ts
│   │   │   └── scheduler.ts
│   │   │
│   │   ├── analytics.ts                        # Engine analytics
│   │   ├── api-logger.ts                       # Logger API
│   │   ├── appointment-utils.ts                # Utility appuntamenti
│   │   ├── audit-middleware.ts                 # Middleware audit
│   │   ├── audit.ts                            # Sistema audit
│   │   ├── documents.ts                        # Utility documenti
│   │   ├── dom-protection.ts                   # Protezione DOM
│   │   ├── error-handler.ts                    # Gestione errori
│   │   ├── exercises-data.ts                   # Dati esercizi (MUSCLE_GROUPS, EQUIPMENT)
│   │   ├── export-allenamenti.ts               # Export allenamenti
│   │   ├── export-utils.ts                     # Utility export
│   │   ├── fetchWithCache.ts                   # Fetch con cache
│   │   ├── haptics.ts                          # Haptic feedback
│   │   ├── mock-data-progress.ts               # Mock data progressi
│   │   ├── notifications.ts                    # Sistema notifiche principale
│   │   ├── rate-limit.ts                       # Rate limiting
│   │   ├── realtimeClient.ts                   # Client realtime
│   │   ├── sanitize.ts                         ✅ DOC (12 funzioni)
│   │   ├── supabase.ts                         # Supabase factory
│   │   └── utils.ts                            # Utility generiche (cn function)
│   │
│   ├── 📁 providers/                           # Context Providers (3 file)
│   │   ├── auth-provider.tsx                   ✅ DOC
│   │   ├── index.ts
│   │   ├── query-provider.tsx                  # React Query provider
│   │   └── theme-provider.tsx                  # Theme provider
│   │
│   ├── 📁 types/                               # TypeScript Types (15 file)
│   │   ├── allenamento.ts
│   │   ├── appointment.ts
│   │   ├── athlete-profile.schema.ts
│   │   ├── athlete-profile.ts
│   │   ├── chat.ts
│   │   ├── cliente.ts
│   │   ├── document.ts
│   │   ├── exercise.ts
│   │   ├── index.ts                            # Export types
│   │   ├── invitation.ts
│   │   ├── payment.ts
│   │   ├── progress.ts
│   │   ├── supabase.ts                         # Types generati Supabase
│   │   ├── user.ts
│   │   └── workout.ts
│   │
│   ├── 📁 config/                              # Configurazioni (5 file)
│   │   ├── design-system.ts
│   │   ├── design-tokens.ts
│   │   ├── dkdesign.ts
│   │   ├── index.ts
│   │   └── master-design.config.ts
│   │
│   ├── 📁 styles/                              # CSS Globali (6 file)
│   │   ├── agenda-animations.css
│   │   ├── athlete-colors.css
│   │   ├── design-tokens.css
│   │   ├── fullcalendar-theme.css
│   │   ├── sidebar-enhanced.css
│   │   └── tablet-landscape.css
│   │
│   └── middleware.ts                           # Next.js middleware
│
├── 📁 supabase/                                # Supabase Backend
│   │
│   ├── 📁 migrations/                          # Migrazioni Database (51 file)
│   │   ├── 001_create_tables.sql               # Creazione tabelle base
│   │   ├── 001_create_appointments_table.sql
│   │   ├── 002_create_notifications_table.sql
│   │   ├── 002_rls_policies.sql
│   │   ├── 09_progress_reminders.sql
│   │   ├── 09_progress_tracking.sql
│   │   ├── 11_notifications.sql
│   │   ├── 20240115_documents.sql
│   │   ├── 20240116_payments.sql
│   │   ├── 20241220_chat_messages.sql
│   │   ├── 20241220_inviti_atleti.sql
│   │   ├── 20250110_002_roles.sql              # Tabella ruoli
│   │   ├── 20250110_003_profiles.sql           # Tabella profiles
│   │   ├── 20250110_004_appointments.sql       # Tabella appuntamenti
│   │   ├── 20250110_005_exercises.sql          # Tabella esercizi
│   │   ├── 20250110_006_workouts.sql           # Tabella workouts
│   │   ├── 20250110_007_workout_days.sql       # Tabella workout_days
│   │   ├── 20250110_008_workout_day_exercises.sql
│   │   ├── 20250110_009_workout_sets.sql
│   │   ├── 20250110_010_workout_plans.sql
│   │   ├── 20250110_011_workout_logs.sql
│   │   ├── 20250110_012_documents.sql
│   │   ├── 20250110_013_payments.sql
│   │   ├── 20250110_014_lesson_counters.sql
│   │   ├── 20250110_015_notifications.sql
│   │   ├── 20250110_016_chat_messages.sql
│   │   ├── 20250110_017_inviti_atleti.sql
│   │   ├── 20250110_018_cliente_tags.sql
│   │   ├── 20250110_019_profiles_tags.sql
│   │   ├── 20250110_020_progress_logs.sql
│   │   ├── 20250110_021_progress_photos.sql
│   │   ├── 20250110_022_pt_atleti.sql
│   │   ├── 20250110_023_audit_logs.sql
│   │   ├── 20250110_024_push_subscriptions.sql
│   │   ├── 20250110_034_calendar_complete.sql
│   │   ├── 20250110_035_fix_appointments_insert.sql
│   │   ├── 20250110_036_verify_calendar_complete.sql
│   │   ├── 20250110_036_verify_calendar_view_only.sql
│   │   ├── 20250110_COMPLETE_DATABASE_ALIGNMENT.sql
│   │   ├── 20250110_COMPLETE_TABLE_VERIFICATION_AND_ALIGNMENT.sql
│   │   ├── 20250110_fix_rls_performance.sql
│   │   ├── 20250127_add_athlete_profile_indexes.sql
│   │   ├── 20250127_create_athlete_administrative_data.sql
│   │   ├── 20250127_create_athlete_ai_data.sql
│   │   ├── 20250127_create_athlete_fitness_data.sql
│   │   ├── 20250127_create_athlete_massage_data.sql
│   │   ├── 20250127_create_athlete_medical_data.sql
│   │   ├── 20250127_create_athlete_motivational_data.sql
│   │   ├── 20250127_create_athlete_nutrition_data.sql
│   │   ├── 20250127_create_athlete_smart_tracking_data.sql
│   │   ├── 20250127_create_helper_functions.sql
│   │   ├── 20250127_create_profile_trigger.sql
│   │   ├── 20250127_extend_profiles_anagrafica.sql
│   │   ├── 20250127_setup_storage_buckets.sql
│   │   ├── 20250127_verify_rls_policies.sql
│   │   ├── 20250127_verify_storage_rls_policies.sql
│   │   ├── 20250128_add_server_validation_athlete_profile.sql
│   │   ├── 20250128_complete_audit_logs_task_6_7.sql
│   │   ├── 20250128_complete_rls_verification_task_6_1.sql
│   │   ├── 20250128_complete_server_validation_verification_task_6_5.sql
│   │   ├── 20250128_complete_storage_rls_verification_task_6_2.sql
│   │   ├── 20250128_link_documents_to_profile_data.sql
│   │   ├── 20250128_link_payments_to_administrative_data.sql
│   │   ├── 20250128_migrate_progress_logs_to_fitness.sql
│   │   ├── 20250128_test_athlete_profile_complete.sql
│   │   ├── 20250128_test_athlete_profile_functions.sql
│   │   ├── 20250128_test_rls_athlete_profile.sql
│   │   ├── 20250128_verify_and_secure_file_access_task_6_8.sql
│   │   ├── 20250128_verify_athlete_profile_data.sql
│   │   ├── 20250129_add_telefono_column_to_profiles.sql
│   │   ├── 20250129_fix_profiles_rls_recursion.sql
│   │   ├── 20251008_exercises.sql
│   │   ├── 20251008_exercises_add_video.sql
│   │   ├── 20251008_push_subscriptions.sql
│   │   ├── 20251008_storage_exercise_buckets.sql
│   │   ├── 20251009_COMPLETE_allenamenti_setup.sql
│   │   ├── 20251009_create_tags_system.sql
│   │   ├── 20251009_create_workout_logs.sql
│   │   ├── 20251009_create_workout_plans.sql
│   │   ├── 20251009_fix_rls_policies.sql
│   │   ├── 20251009_update_profiles_for_clienti.sql
│   │   ├── 20251009_update_workout_logs_for_allenamenti.sql
│   │   ├── 20251011_create_workouts_schema.sql ✅ DOC
│   │   ├── 20251031_add_updated_at_to_exercises.sql
│   │   ├── 2025_audit_logs.sql
│   │   ├── 2025_security_policies.sql
│   │   ├── ANALYZE_PAYMENTS_TABLE_SIMPLE.sql
│   │   ├── ANALYZE_PAYMENTS_TABLE.sql
│   │   ├── CHECK_PAYMENT_METHOD.sql
│   │   ├── FIX_DOCUMENTS_STORAGE_RLS.sql
│   │   ├── FIX_PAYMENTS_TABLE_FINAL.sql
│   │   ├── FIX_PAYMENTS_TABLE.sql
│   │   ├── ORDINE_ESECUZIONE.md
│   │   ├── QUICK_CHECK_PAYMENTS.sql
│   │   ├── README_BLOCCHI.md
│   │   ├── TEST_INSERT_PAYMENT.sql
│   │   ├── VERIFY_PAYMENTS_RLS.sql
│   │   ├── _split_migration.ps1
│   │   └── split_migration.py
│   │
│   ├── 📁 functions/                          # Edge Functions (1 function)
│   │   └── 📁 document-reminders/
│   │       └── index.ts                        # Function reminder documenti
│   │
│   ├── 📁 policies/                            # RLS Policies
│   │   └── documents_rls.sql
│   │
│   ├── config.toml                            # Config Supabase
│   └── seed.sql                               # Seed data
│
└── 📁 ai_memory/                               # Memoria AI (documentazione)
    ├── 📁 Documentazione tecnica delle funzioni/  # 20 documenti tecnici
    ├── ANALISI-COMPLETA-PROGETTO.md
    ├── Analisi-Moduli-Mancanti.md
    ├── Documentazione-Completa-Riepilogo.md
    ├── Lista-Argomenti-Analizzati.md
    ├── problem_list.md
    ├── STEP7-RiepilogoFinale.md
    └── sviluppo.md
```

---

## 📊 Statistiche Progetto

### File Totali

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
- **Edge Functions**: 1 file

**TOTALE**: ~338 file

### Moduli Funzionali

1. ✅ Autenticazione
2. ✅ Calendario/Appuntamenti
3. ✅ Esercizi
4. ✅ Schede Allenamento
5. ✅ Profili
6. ❌ Chat
7. ❌ Pagamenti
8. ❌ Documenti
9. ❌ Progressi
10. ❌ Clienti
11. ❌ Allenamenti
12. ❌ Inviti
13. ❌ Notifiche
14. ❌ Statistiche
15. ❌ Abbonamenti
16. ❌ Comunicazioni
17. ❌ Impostazioni

### Database Tables (19+ tabelle)

1. `profiles` - Utenti
2. `roles` - Ruoli
3. `appointments` - Appuntamenti
4. `exercises` - Esercizi
5. `workouts` / `workout_plans` - Schede allenamento
6. `workout_days` - Giorni allenamento
7. `workout_day_exercises` - Esercizi per giorno
8. `workout_sets` - Set completati
9. `workout_logs` - Log allenamenti
10. `documents` - Documenti
11. `payments` - Pagamenti
12. `lesson_counters` - Contatori lezioni
13. `notifications` - Notifiche
14. `chat_messages` - Messaggi chat
15. `inviti_atleti` - Inviti
16. `progress_logs` - Log progressi
17. `progress_photos` - Foto progressi
18. `pt_atleti` - Relazione PT-Atleta
19. `cliente_tags` / `profiles_tags` - Tags
20. `audit_logs` - Log audit
21. `push_subscriptions` - Sottoscrizioni push
22. `athlete_*_data` (8 tabelle) - Dati profilo atleta

### Storage Buckets (4+ bucket)

1. `documents` - Documenti
2. `exercise-videos` - Video esercizi
3. `exercise-thumbs` - Thumbnail esercizi
4. `progress-photos` - Foto progressi
5. `avatars` - Avatar utenti

---

## 🔗 Dipendenze Principali

### Frontend

- **Next.js 15** - Framework React
- **React 18** - Library UI
- **TypeScript** - Type safety
- **TailwindCSS** - Styling
- **Radix UI** - Componenti UI
- **Framer Motion** - Animazioni
- **React Query** - State management server
- **Zod** - Validazione
- **FullCalendar** - Calendario
- **Recharts** - Charts

### Backend

- **Supabase** - BaaS (Database, Auth, Storage, Realtime)
- **PostgreSQL** - Database
- **Edge Functions** - Serverless functions

---

## 📝 Legenda

- ✅ **DOC** = Documentato
- ⚠️ **PARZIALE** = Parzialmente documentato
- ❌ **NON DOC** = Non documentato

---

**Ultimo aggiornamento**: 2025-01-29T18:20:00Z
