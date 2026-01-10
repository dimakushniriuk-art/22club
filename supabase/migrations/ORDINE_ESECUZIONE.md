# 📋 Ordine di Esecuzione Migrazioni - Progetto Completo

Tutti gli script sono stati divisi in blocchi numerati. Esegui nell'ordine seguente.

## 🎯 Totale: 33 Blocchi

### 📦 FASE 1: Funzioni Base e Tabelle (Blocchi 001-024)

#### Funzioni di Supporto

1. ✅ `20250110_001_functions.sql` - Funzioni di supporto (`update_updated_at_column`, `column_exists`)

#### Tabelle Principali

2. ✅ `20250110_002_roles.sql` - Tabella roles e ruoli base
3. ✅ `20250110_003_profiles.sql` - Tabella profiles (utenti)
4. ✅ `20250110_004_appointments.sql` - Tabella appointments (appuntamenti)
5. ✅ `20250110_005_exercises.sql` - Tabella exercises (esercizi)
6. ✅ `20250110_006_workouts.sql` - Tabella workouts (schede allenamento)
7. ✅ `20250110_007_workout_days.sql` - Tabella workout_days (giorni scheda)
8. ✅ `20250110_008_workout_day_exercises.sql` - Tabella workout_day_exercises (esercizi per giorno)
9. ✅ `20250110_009_workout_sets.sql` - Tabella workout_sets (serie)
10. ✅ `20250110_010_workout_plans.sql` - Tabella workout_plans (legacy)
11. ✅ `20250110_011_workout_logs.sql` - Tabella workout_logs (log allenamenti)
12. ✅ `20250110_012_documents.sql` - Tabella documents (documenti atleti)
13. ✅ `20250110_013_payments.sql` - Tabella payments (pagamenti)
14. ✅ `20250110_014_lesson_counters.sql` - Tabella lesson_counters (contatori lezioni)
15. ✅ `20250110_015_notifications.sql` - Tabella notifications (notifiche)
16. ✅ `20250110_016_chat_messages.sql` - Tabella chat_messages (messaggi)
17. ✅ `20250110_017_inviti_atleti.sql` - Tabella inviti_atleti (inviti)
18. ✅ `20250110_018_cliente_tags.sql` - Tabella cliente_tags (tag clienti)
19. ✅ `20250110_019_profiles_tags.sql` - Tabella profiles_tags (relazione profili-tag)
20. ✅ `20250110_020_progress_logs.sql` - Tabella progress_logs (log progressi)
21. ✅ `20250110_021_progress_photos.sql` - Tabella progress_photos (foto progresso)
22. ✅ `20250110_022_pt_atleti.sql` - Tabella pt_atleti (relazione PT-Atleti)
23. ✅ `20250110_023_audit_logs.sql` - Tabella audit_logs (log audit)
24. ✅ `20250110_024_push_subscriptions.sql` - Tabella push_subscriptions (sottoscrizioni push)

### ⚙️ FASE 2: Funzioni RPC (Blocchi 026-030)

25. ✅ `20250110_026_rpc_payments.sql` - Funzioni RPC per pagamenti
    - `create_payment()` - Crea pagamento e aggiorna contatore
    - `reverse_payment()` - Storna pagamento
    - `decrement_lessons_used()` - Decrementa lezioni usate
    - `get_monthly_revenue()` - Statistiche mensili revenue

26. ✅ `20250110_027_rpc_notifications.sql` - Funzioni RPC per notifiche
    - `create_notification()` - Crea notifica
    - `mark_notification_as_read()` - Marca come letta
    - `mark_all_notifications_as_read()` - Marca tutte come lette
    - `get_unread_notifications_count()` - Conta non lette
    - `notify_expiring_documents()` - Notifica documenti in scadenza
    - `notify_missing_progress()` - Notifica progressi mancanti
    - `notify_low_lesson_balance()` - Notifica lezioni basse
    - `notify_no_active_workouts()` - Notifica nessuna scheda attiva
    - `run_daily_notifications()` - Esegue tutte le notifiche automatiche

27. ✅ `20250110_028_rpc_chat.sql` - Funzioni RPC per chat
    - `check_pt_athlete_relationship()` - Verifica relazione PT-atleta
    - `get_conversation_participants()` - Ottiene partecipanti conversazioni

28. ✅ `20250110_029_rpc_documents.sql` - Funzioni RPC per documenti
    - `update_document_statuses()` - Aggiorna stati documenti
    - `create_document_reminders()` - Crea reminder documenti

29. ✅ `20250110_030_rpc_clienti_stats.sql` - Funzione RPC statistiche clienti
    - `get_clienti_stats()` - Statistiche aggregate clienti (ottimizzata)

### 👁️ FASE 3: Viste Analitiche (Blocco 031)

30. ✅ `20250110_031_analytics_views.sql` - Viste analitiche per reportistica
    - `monthly_kpi_view` - KPI mensili
    - `workout_completion_rate_view` - Tasso completamento schede
    - `payments_per_staff_view` - Pagamenti per staff
    - `progress_trend_view` - Trend progressi
    - `athlete_stats_view` - Statistiche complete atleti
    - `staff_performance_view` - Performance staff

### 📦 FASE 4: Storage Buckets (Blocco 032)

31. ✅ `20250110_032_storage_buckets.sql` - Storage buckets e policies
    - `exercise-videos` - Bucket per video esercizi
    - `exercise-thumbs` - Bucket per thumbnail esercizi
    - Policies RLS per accesso

### ✅ FASE 5: Verifiche Finali (Blocchi 025, 033)

32. ✅ `20250110_025_verifica_finale.sql` - Verifica tabelle base (OPZIONALE)
    - Verifica esistenza di tutte le 24 tabelle

33. ✅ `20250110_033_verifica_completa_finale.sql` - Verifica completa progetto
    - Verifica tabelle (24)
    - Verifica funzioni RPC (17)
    - Verifica viste (6)
    - Verifica storage buckets (2)

## 🚀 Come Usare

### Metodo 1: Esecuzione Sequenziale (Consigliato)

1. Apri il file `20250110_001_functions.sql` nella dashboard Supabase SQL Editor
2. Copia e incolla il contenuto
3. Esegui e verifica che non ci siano errori
4. Procedi con il blocco successivo fino al 033
5. Alla fine esegui il blocco 033 per la verifica completa

### Metodo 2: Esecuzione a Fasi

- **Fase 1**: Blocchi 001-024 (Tabelle base)
- **Fase 2**: Blocchi 026-030 (Funzioni RPC)
- **Fase 3**: Blocco 031 (Viste)
- **Fase 4**: Blocco 032 (Storage)
- **Fase 5**: Blocco 033 (Verifica)

### ⚠️ Note Importanti

- **Ordine critico**: I blocchi devono essere eseguiti nell'ordine numerico
- **Dipendenze**: Le funzioni RPC (026-030) richiedono che le tabelle (001-024) siano già create
- **Storage**: Il blocco 032 richiede accesso alle tabelle `storage.buckets` e `storage.objects`
- **Verifica**: Il blocco 033 è opzionale ma consigliato per confermare che tutto sia stato creato correttamente

## 📊 Riepilogo Componenti

- **24 Tabelle** principali del database
- **17 Funzioni RPC** per logica business
- **6 Viste Analitiche** per reportistica
- **2 Storage Buckets** per file/media
- **Totale: 49 componenti** del progetto

## 🔍 Risoluzione Errori

Se incontri errori durante l'esecuzione:

1. Verifica che i blocchi precedenti siano stati eseguiti correttamente
2. Controlla i messaggi di errore nella dashboard Supabase
3. Alcuni errori possono essere ignorati se il componente esiste già (es. "already exists")
4. Se una tabella/funzione già esiste con struttura diversa, potrebbe essere necessario aggiornarla manualmente

---

**Ultima modifica**: 2025-01-10
**Versione**: 1.0 Completa
