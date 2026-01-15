# 📋 Istruzioni Fix Workout Logs per Storico Allenamenti

**Data**: 2026-01-14  
**File SQL**: `FIX_WORKOUT_LOGS_STORICO.sql`  
**Scopo**: Creare/riparare tabelle `workouts` e `workout_logs` per la pagina Storico Allenamenti

---

## 🎯 Cosa fa questo SQL

### 1. **Crea tabella `workouts`**
Schede allenamento create dai trainer:
- `id`, `athlete_id`, `created_by_trainer_id`
- `titolo`, `descrizione`, `difficulty`, `status`
- Indici per performance
- RLS policies per isolamento dati trainer

### 2. **Crea/Ripara tabella `workout_logs`**
Log degli allenamenti completati:
- `id`, `workout_id`, `user_id`
- `started_at`, `completed_at`, `duration_minutes`, `notes`
- Supporta anche aggiunta colonne se tabella esiste già
- RLS policies per isolamento dati

### 3. **RLS Policies**
- **Trainer**: Vede solo dati dei propri atleti
- **Atleti**: Vedono solo i propri dati
- **Admin**: Vede tutto

### 4. **Trigger automatici**
- `updated_at` si aggiorna automaticamente

---

## ⚡ Come eseguire

### Opzione 1: Supabase Dashboard (CONSIGLIATA)

1. Vai su [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Seleziona il tuo progetto **22Club**
3. Vai su **SQL Editor** (icona database a sinistra)
4. Click su **New query**
5. Copia-incolla **TUTTO il contenuto** del file `FIX_WORKOUT_LOGS_STORICO.sql`
6. Click su **Run** (o `Ctrl+Enter`)
7. ✅ Verifica output finale (mostra colonne e policies)

### Opzione 2: Supabase CLI (Locale)

```bash
# Assicurati di essere nella root del progetto
cd "c:\Users\d.kushniriuk\Desktop\22club-setup V1 online"

# Esegui migration
supabase db push

# Oppure esegui direttamente il file
supabase db execute -f supabase/migrations/FIX_WORKOUT_LOGS_STORICO.sql
```

---

## ✅ Verifica Successo

Dopo l'esecuzione, dovresti vedere:

### 1. **Output Verifica Struttura `workouts`**
```
column_name              | data_type           | is_nullable
-------------------------|---------------------|------------
id                       | uuid                | NO
athlete_id               | uuid                | YES
created_by_trainer_id    | uuid                | YES
titolo                   | character varying   | NO
descrizione              | text                | YES
difficulty               | text                | YES
status                   | text                | YES
created_at               | timestamp with...   | YES
updated_at               | timestamp with...   | YES
```

### 2. **Output Verifica Struttura `workout_logs`**
```
column_name       | data_type           | is_nullable
------------------|---------------------|------------
id                | uuid                | NO
workout_id        | uuid                | YES
user_id           | uuid                | YES
started_at        | timestamp with...   | NO
completed_at      | timestamp with...   | YES
duration_minutes  | integer             | YES
notes             | text                | YES
created_at        | timestamp with...   | YES
updated_at        | timestamp with...   | YES
```

### 3. **Output Verifica Policies**
Dovresti vedere 8 policies (4 per `workouts`, 4 per `workout_logs`):
- `workouts_select_policy`
- `workouts_insert_policy`
- `workouts_update_policy`
- `workouts_delete_policy`
- `workout_logs_select_policy`
- `workout_logs_insert_policy`
- `workout_logs_update_policy`
- `workout_logs_delete_policy`

---

## 🧪 Inserire Dati di Test (OPZIONALE)

Se vuoi testare subito la pagina, **decommenta la sezione STEP 7** nel file SQL:

```sql
-- Trova questa sezione nel file SQL:
-- STEP 7: Dati di test (OPZIONALE)

-- Rimuovi i commenti /* e */ e riesegui
```

Questo inserirà:
- 1 scheda "Scheda Forza Base"
- 3 allenamenti completati (2, 5, 7 giorni fa)

**⚠️ ATTENZIONE**: Sostituisci `'25b279e7-6b70-47b6-973b-1ee1f98ed02d'` con l'ID effettivo del tuo atleta!

---

## 🔧 Problemi Comuni

### Errore: "relation workouts already exists"
✅ **Normale!** La tabella esiste già, il SQL la salta e aggiunge solo colonne mancanti.

### Errore: "foreign key violation"
❌ Verifica che:
1. La tabella `profiles` esista
2. La colonna `profiles.user_id` esista
3. Ci sia almeno un utente nella tabella `profiles`

### Errore: "policy already exists"
✅ **Normale!** Il SQL fa DROP prima di CREATE, quindi è safe.

### Nessun dato nella pagina Storico
1. Verifica che l'atleta abbia un `user_id` valido in `profiles`
2. Verifica che ci siano workout_logs con quel `user_id`
3. Controlla console browser per errori (F12)
4. Verifica che il trainer sia collegato all'atleta in `pt_atleti`

---

## 📊 Query Utili Post-Esecuzione

### Verifica atleti e i loro user_id
```sql
SELECT 
  id, 
  user_id, 
  nome, 
  cognome, 
  email, 
  role
FROM profiles
WHERE role IN ('atleta', 'athlete')
ORDER BY cognome, nome;
```

### Verifica schede create
```sql
SELECT 
  w.id,
  w.titolo,
  w.status,
  p.nome || ' ' || p.cognome AS atleta,
  t.nome || ' ' || t.cognome AS trainer,
  w.created_at
FROM workouts w
LEFT JOIN profiles p ON p.id = w.athlete_id
LEFT JOIN profiles t ON t.id = w.created_by_trainer_id
ORDER BY w.created_at DESC;
```

### Verifica workout logs
```sql
SELECT 
  wl.id,
  w.titolo AS scheda,
  p.nome || ' ' || p.cognome AS atleta,
  wl.started_at,
  wl.completed_at,
  wl.duration_minutes,
  wl.notes
FROM workout_logs wl
LEFT JOIN workouts w ON w.id = wl.workout_id
LEFT JOIN profiles p ON p.user_id = wl.user_id
ORDER BY wl.started_at DESC
LIMIT 20;
```

### Verifica connessione trainer-atleta
```sql
SELECT 
  t.nome || ' ' || t.cognome AS trainer,
  a.nome || ' ' || a.cognome AS atleta,
  a.id AS atleta_id,
  a.user_id AS atleta_user_id,
  pa.created_at AS assegnato_il
FROM pt_atleti pa
INNER JOIN profiles t ON t.id = pa.trainer_id
INNER JOIN profiles a ON a.id = pa.atleta_id
ORDER BY t.cognome, a.cognome;
```

---

## 🚀 Prossimi Passi

Dopo aver eseguito questo SQL:

1. ✅ Refresh della pagina `/dashboard/atleti/[id]/storico`
2. ✅ Verifica che non ci siano errori in console
3. ✅ Se vuoi dati di test, esegui STEP 7
4. ✅ Crea schede e workout logs dalla UI (o manualmente via SQL)

---

## 📚 Riferimenti

- **Pagina**: `src/app/dashboard/atleti/[id]/storico/page.tsx`
- **Types**: `src/types/cliente.ts`
- **File SQL**: `supabase/migrations/FIX_WORKOUT_LOGS_STORICO.sql`
- **Documentazione RLS**: `supabase/migrations/20260108_trainer_data_isolation_rls_README.md`

---

## 💡 Note Finali

- Questo SQL è **idempotente**: puoi eseguirlo più volte senza problemi
- Usa `IF NOT EXISTS` per non sovrascrivere dati esistenti
- Le policies RLS garantiscono isolamento dati tra trainer
- I trigger `updated_at` si aggiornano automaticamente ad ogni modifica

**Buon lavoro! 🎉**
