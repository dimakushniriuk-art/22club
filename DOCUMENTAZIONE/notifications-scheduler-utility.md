# Utility: Notifications Scheduler

## 📋 Descrizione

Utility per scheduler notifiche automatiche. Gestisce notifiche automatiche per documenti in scadenza, progressi mancanti, lezioni residue basse, nessuna scheda attiva.

## 📁 Percorso File

`src/lib/notifications/scheduler.ts`

## 📦 Dipendenze

- `@supabase/supabase-js` (`createClient`)

## ⚙️ Funzionalità

### Funzioni Principali

1. **`notifyExpiringDocuments()`**: Notifica documenti in scadenza
   - Chiama RPC `notify_expiring_documents`
   - Ritorna count notifiche inviate

2. **`notifyMissingProgress()`**: Notifica progressi mancanti
   - Chiama RPC `notify_missing_progress`
   - Ritorna count notifiche inviate

3. **`notifyLowLessonBalance()`**: Notifica lezioni residue basse
   - Chiama RPC `notify_low_lesson_balance`
   - Ritorna count notifiche inviate

4. **`notifyNoActiveWorkouts()`**: Notifica nessuna scheda attiva
   - Chiama RPC `notify_no_active_workouts`
   - Ritorna count notifiche inviate

## 🔍 Note Tecniche

- Usa Supabase RPC functions per logica notifiche
- Tutte le funzioni ritornano { success, count, error }
- Gestione errori con logging

## ✅ Stato Utility

- ✅ **Completato**: Utility funzionante e utilizzata in produzione
