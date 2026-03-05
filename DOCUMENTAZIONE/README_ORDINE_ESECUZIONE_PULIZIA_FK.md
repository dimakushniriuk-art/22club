# 📋 Ordine di Esecuzione - Pulizia Dati Orfani e Foreign Key

## ⚠️ IMPORTANTE: Leggere prima di procedere

Questo processo elimina dati orfani e aggiunge Foreign Key constraints. Eseguire in ordine.

---

## 📝 STEP 1: Analisi Record Orfano Specifico (Opzionale)

Se vuoi analizzare in dettaglio il record `workout_day_exercises` orfano prima di eliminarlo:

1. **`SQL_ANALISI_1_VERIFICA_RECORD.sql`** - Verifica completa del record
2. **`SQL_ANALISI_2_VERIFICA_COLONNE_WORKOUT_DAYS.sql`** - Verifica colonne tabella
3. **`SQL_ANALISI_3_VERIFICA_WORKOUT_DAY_ID.sql`** - Verifica workout_day_id
4. **`SQL_ANALISI_4_VERIFICA_EXERCISE_ID.sql`** - Verifica exercise_id
5. **`SQL_VERIFICA_COLONNE_WORKOUT_SETS.sql`** - Verifica colonne workout_sets (OPZIONALE - se serve vedere schema)
6. **`SQL_ANALISI_5_VERIFICA_WORKOUT_SETS.sql`** - Verifica workout_sets collegati

**Risultato atteso**: Conferma che il record è orfano e può essere eliminato.

---

## 📝 STEP 2: Verifica Dati Orfani (Tutti)

Eseguire le query SELECT in **`SQL_PULIZIA_DATI_ORFANI.sql`** (righe 15-75) per vedere cosa verrà eliminato:

- `notifications (user_id)`: 3 record
- `chat_messages (sender_id)`: 8 record
- `chat_messages (receiver_id)`: 8 record
- `workout_day_exercises (workout_day_id)`: 12 record
- `workout_day_exercises (exercise_id)`: 1 record

**Totale**: 32 record da eliminare

---

## 📝 STEP 3: Pulizia Dati Orfani

### Opzione A: Eliminare solo il record specifico

Eseguire **`SQL_PULIZIA_ELIMINA_RECORD_ORFANO.sql`**:

- Elimina solo il record `workout_day_exercises` con `exercise_id` orfano
- Gestisce automaticamente i `workout_sets` collegati (CASCADE)
- Esegue in transazione (COMMIT/ROLLBACK)

### Opzione B: Eliminare tutti i dati orfani

Eseguire **`SQL_PULIZIA_TUTTI_DATI_ORFANI.sql`**:

- Elimina tutti i 32 record orfani identificati
- Gestisce automaticamente i `workout_sets` collegati (CASCADE)
- Esegue in transazione (COMMIT/ROLLBACK)

**⚠️ IMPORTANTE**:

- Verificare i risultati delle SELECT prima di eseguire le DELETE
- Eseguire in transazione (BEGIN...COMMIT/ROLLBACK)
- Se qualcosa non va, fare ROLLBACK

---

## 📝 STEP 4: Eseguire Migrazione Foreign Key

Dopo aver pulito i dati orfani, eseguire la migrazione:

**`SQL_ESEGUI_MIGRAZIONE_FOREIGN_KEYS.sql`** oppure direttamente:

**`supabase/migrations/20250201_add_missing_foreign_keys.sql`**

La migrazione:

- Verifica automaticamente i dati orfani prima di aggiungere ogni FK
- Mostra WARNING se ci sono ancora dati orfani
- Aggiunge tutte le FK mancanti
- Mostra un report finale con tutte le FK create

---

## 📝 STEP 5: Verifica Finale

1. **Verificare diagramma Supabase**: Le tabelle dovrebbero ora mostrare collegamenti visibili
2. **Verificare FK create**: Usare la query in `SQL_ESEGUI_MIGRAZIONE_FOREIGN_KEYS.sql`
3. **Testare integrità**: Provare a inserire un record con FK invalida (dovrebbe fallire)

---

## 🔄 Ordine Completo (Riassunto)

```
1. SQL_ANALISI_* (opzionale - per analisi dettagliata)
   ↓
2. SQL_PULIZIA_DATI_ORFANI.sql (SELECT - vedere cosa verrà eliminato)
   ↓
3. SQL_PULIZIA_ELIMINA_RECORD_ORFANO.sql OPPURE SQL_PULIZIA_TUTTI_DATI_ORFANI.sql
   ↓
4. SQL_ESEGUI_MIGRAZIONE_FOREIGN_KEYS.sql (o direttamente il file migration)
   ↓
5. Verifica diagramma Supabase e test integrità
```

---

## ⚠️ Note Importanti

- **Backup**: Fare backup del database prima di procedere
- **Transazioni**: Tutti gli script di pulizia usano transazioni (COMMIT/ROLLBACK)
- **Verifica**: Sempre verificare i risultati delle SELECT prima delle DELETE
- **Idempotenza**: La migrazione FK è idempotente (può essere eseguita più volte)

---

## 📊 Record da Eliminare (Riepilogo)

| Tabella                 | Campo Orfano     | Record | Script                                                                        |
| ----------------------- | ---------------- | ------ | ----------------------------------------------------------------------------- |
| `notifications`         | `user_id`        | 3      | `SQL_PULIZIA_TUTTI_DATI_ORFANI.sql`                                           |
| `chat_messages`         | `sender_id`      | 8      | `SQL_PULIZIA_TUTTI_DATI_ORFANI.sql`                                           |
| `chat_messages`         | `receiver_id`    | 8      | `SQL_PULIZIA_TUTTI_DATI_ORFANI.sql`                                           |
| `workout_day_exercises` | `workout_day_id` | 12     | `SQL_PULIZIA_TUTTI_DATI_ORFANI.sql`                                           |
| `workout_day_exercises` | `exercise_id`    | 1      | `SQL_PULIZIA_ELIMINA_RECORD_ORFANO.sql` o `SQL_PULIZIA_TUTTI_DATI_ORFANI.sql` |
| **TOTALE**              |                  | **32** |                                                                               |
