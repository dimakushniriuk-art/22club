# Isolamento Dati Trainer - RLS Policies

## Ordine di Esecuzione

Esegui i blocchi nell'ordine seguente:

### 1. Funzioni Helper (OBBLIGATORIO - PRIMO)
**File**: `20260108_trainer_data_isolation_rls_01_functions.sql`
- Crea le funzioni helper necessarie per tutte le policies
- **DEVE essere eseguito per primo**

### 2. Profiles (OBBLIGATORIO)
**File**: `20260108_trainer_data_isolation_rls_02_profiles.sql`
- RLS policies per la tabella `profiles`
- Filtra atleti per trainer

### 3. PT_ATLETI (OBBLIGATORIO)
**File**: `20260108_trainer_data_isolation_rls_03_pt_atleti.sql`
- RLS policies per la tabella `pt_atleti`
- Filtra relazioni trainer-atleta

### 4. Appointments (OPZIONALE - solo se tabella esiste)
**File**: `20260108_trainer_data_isolation_rls_04_appointments.sql`
- RLS policies per la tabella `appointments`
- Filtra appuntamenti per trainer
- Se la tabella non esiste, viene saltata automaticamente

### 5. Workouts (OPZIONALE - solo se tabella esiste)
**File**: `20260108_trainer_data_isolation_rls_05_workouts.sql`
- RLS policies per la tabella `workouts`
- Filtra schede per trainer
- Se la tabella non esiste, viene saltata automaticamente

### 6. Workout Logs (OPZIONALE - solo se tabella esiste)
**File**: `20260108_trainer_data_isolation_rls_06_workout_logs.sql`
- RLS policies per la tabella `workout_logs`
- Filtra log allenamenti per trainer
- Se la tabella non esiste, viene saltata automaticamente

### 7. Payments (OPZIONALE - solo se tabella esiste)
**File**: `20260108_trainer_data_isolation_rls_07_payments.sql`
- RLS policies per la tabella `payments`
- Filtra pagamenti/abbonamenti per trainer
- Se la tabella non esiste, viene saltata automaticamente

### 8. Lesson Counters (OPZIONALE - solo se tabella esiste)
**File**: `20260108_trainer_data_isolation_rls_08_lesson_counters.sql`
- RLS policies per la tabella `lesson_counters`
- Filtra contatori lezioni per trainer
- Se la tabella non esiste, viene saltata automaticamente

### 9. Chat Messages (OPZIONALE - solo se tabella esiste)
**File**: `20260108_trainer_data_isolation_rls_09_chat_messages.sql`
- RLS policies per la tabella `chat_messages`
- Filtra messaggi chat per trainer
- Se la tabella non esiste, viene saltata automaticamente

### 10. Progress Logs (OPZIONALE - solo se tabella esiste)
**File**: `20260108_trainer_data_isolation_rls_10_progress_logs.sql`
- RLS policies per la tabella `progress_logs`
- Filtra log progresso per trainer
- Se la tabella non esiste, viene saltata automaticamente

### 11. Exercises (OPZIONALE - solo se tabella esiste)
**File**: `20260108_trainer_data_isolation_rls_11_exercises.sql`
- RLS policies per la tabella `exercises`
- **CONDIVISI** - visibili a tutti (non filtrati per trainer)
- Se la tabella non esiste, viene saltata automaticamente

## Note

- I blocchi 1, 2, 3 sono **OBBLIGATORI** e devono essere eseguiti sempre
- I blocchi 4-11 sono **OPZIONALI** e verificano automaticamente l'esistenza delle tabelle
- Se una tabella non esiste, il blocco viene saltato senza errori
- Puoi eseguire i blocchi opzionali anche in seguito, quando le tabelle saranno disponibili

## Esecuzione Rapida

Se vuoi eseguire tutto in una volta, usa il file completo:
- `20260108_trainer_data_isolation_rls.sql` (contiene tutti i blocchi)
