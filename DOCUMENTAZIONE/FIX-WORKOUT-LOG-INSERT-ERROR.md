# 🔧 Fix Errore Salvataggio Workout Log

**Data**: 17 Gennaio 2026  
**Problema**: Errore salvataggio workout_log mostra `{}` vuoto, inserimento fallisce

## 🐛 Problema Identificato

L'errore `Errore salvataggio workout_log {}` si verifica quando:
1. **RLS Policy mancante**: Non c'è una policy che permette agli atleti di inserire i propri `workout_logs`
2. **Errore non serializzato**: L'errore Supabase non viene serializzato correttamente nel logger
3. **user_id mancante**: Alcune RLS policies verificano `user_id = auth.uid()` ma il campo non viene passato

**Dettagli**:
- Policy esistente: Solo "Staff can insert workout logs" (admin/pt)
- Policy mancante: "Athletes can insert own workout logs"
- Il codice inserisce `athlete_id` e `atleta_id` ma non `user_id`

## ✅ Fix Applicati

### 1. Migliorata Gestione Errore

**File**: `src/app/home/allenamenti/oggi/page.tsx` (righe 673-720)

**Modifiche**:
- Serializzazione corretta dell'errore Supabase
- Log dettagliati con tutte le informazioni
- Messaggio errore più descrittivo

**Prima**:
```typescript
if (logError) {
  logger.error('Errore salvataggio workout_log', logError, { athleteId: profileTyped.id })
  throw new Error("Errore nel salvataggio dell'allenamento completato")
}
```

**Dopo**:
```typescript
if (logError) {
  const errorDetails = {
    message: logError.message,
    code: logError.code,
    details: logError.details,
    hint: logError.hint,
    athleteId: profileTyped.id,
    workoutLogData,
  }
  console.error('❌ Errore salvataggio workout_log:', JSON.stringify(errorDetails, null, 2))
  logger.error('Errore salvataggio workout_log', logError, errorDetails)
  throw new Error(`${logError.message}${logError.hint ? ` (${logError.hint})` : ''}`)
}
```

### 2. Aggiunto `user_id` ai Dati Inseriti

**File**: `src/app/home/allenamenti/oggi/page.tsx` (righe 661-671)

**Modifiche**:
- Aggiunto `user_id` ai dati inseriti
- `user_id` è necessario per alcune RLS policies che verificano `auth.uid()`

**Prima**:
```typescript
const workoutLogData = {
  athlete_id: profileTyped.id,
  atleta_id: profileTyped.id,
  // ❌ user_id mancante
}
```

**Dopo**:
```typescript
const workoutLogData = {
  athlete_id: profileTyped.id,
  atleta_id: profileTyped.id,
  user_id: userId || undefined, // ✅ Aggiunto
}
```

### 3. Creata Migration SQL per RLS Policy

**File**: `supabase/migrations/20250117_fix_workout_logs_athlete_insert.sql`

**Contenuto**:
- Crea policy "Athletes can insert own workout logs"
- Permette agli atleti di inserire i propri `workout_logs`
- Verifica che `athlete_id`, `atleta_id` o `user_id` corrispondano all'utente corrente

## 🔧 Come Applicare il Fix

### 1. Esegui la Migration SQL

**Opzione A: Supabase Dashboard**
1. Vai su Supabase Dashboard > SQL Editor
2. Copia il contenuto di `supabase/migrations/20250117_fix_workout_logs_athlete_insert.sql`
3. Esegui lo script

**Opzione B: Supabase CLI**
```bash
supabase db push
```

### 2. Verifica la Policy

Dopo aver eseguito la migration, verifica che la policy esista:

```sql
SELECT 
  policyname,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename = 'workout_logs' 
  AND policyname = 'Athletes can insert own workout logs';
```

Dovresti vedere una policy con `cmd = 'INSERT'`.

### 3. Testa l'Inserimento

1. Completa un allenamento come atleta
2. Scegli "Completato da solo" o "Completato con Personal Trainer"
3. Verifica che il workout_log venga salvato correttamente
4. Controlla la console per eventuali errori dettagliati

## 📊 Informazioni Aggiuntive nel Log

Ora quando un inserimento fallisce, vedrai:

```json
{
  "message": "new row violates row-level security policy",
  "code": "42501",
  "details": null,
  "hint": "Policy violation",
  "athleteId": "uuid",
  "workoutLogData": {
    "athlete_id": "uuid",
    "atleta_id": "uuid",
    "user_id": "uuid",
    ...
  }
}
```

## 🔍 Possibili Cause dell'Errore

1. **RLS Policy mancante** (più probabile)
   - Gli atleti non hanno permesso di INSERT
   - **Fix**: Esegui la migration SQL

2. **Foreign key constraint**
   - `scheda_id` punta a un `workout_plan` inesistente
   - **Fix**: Verifica che `workoutSession?.workout_id` esista

3. **Constraint violation**
   - `stato` non è valido (deve essere uno dei valori permessi)
   - **Fix**: Verifica che `stato: 'completato'` sia valido

4. **Dati mancanti**
   - `atleta_id` è NOT NULL ma potrebbe essere undefined
   - **Fix**: Verifica che `profileTyped.id` sia sempre definito

## ✅ Comportamento Dopo Fix

1. **Log dettagliati**: Ora vedrai informazioni complete sull'errore
2. **RLS Policy**: Gli atleti possono inserire i propri workout_logs
3. **user_id incluso**: Compatibilità con tutte le RLS policies
4. **Messaggi chiari**: L'utente vede un messaggio di errore descrittivo

## 🧪 Come Testare

1. **Esegui la migration SQL** (vedi sopra)
2. **Ricarica la pagina** `/home/allenamenti/oggi`
3. **Completa un allenamento**
4. **Verifica**:
   - Il workout_log viene salvato correttamente
   - Nessun errore nella console
   - Il redirect alla pagina riepilogo funziona

## 📝 Note Importanti

1. **Migration SQL**: Deve essere eseguita prima che il fix funzioni
2. **RLS attivo**: Se RLS è disabilitato, la policy non viene applicata
3. **user_id**: Ora viene sempre incluso per compatibilità

---

**Stato**: ✅ **Fix applicato** - Esegui la migration SQL per completare il fix
