# Guida Sequenza Esecuzione Fix

## 📋 Riepilogo Stato

### ✅ FASE 1: Sicurezza Critica - COMPLETATA

- ✅ FIX_01_RLS_ROLES.sql
- ✅ FIX_02_RLS_WEB_VITALS.sql
- ✅ FIX_03_RLS_WORKOUT_SETS.sql
- ✅ FIX_04_STORAGE_DOCUMENTS_POLICIES.sql

### ⏳ FASE 2: Integrità Dati - IN CORSO

- ⏳ FIX_05_FK_CHAT_MESSAGES.sql (richiede pulizia dati orfani)
- ⏳ FIX_06_FK_NOTIFICATIONS.sql (richiede pulizia dati orfani)
- ⏳ FIX_07_FK_PAYMENTS.sql (richiede pulizia dati orfani)

---

## 🔄 SEQUENZA DI ESECUZIONE (FASE 2)

### STEP 1: Pulizia Dati Orfani - chat_messages

**Eseguire:**

```sql
docs/FIX_05_CLEANUP_EXECUTE.sql
```

**Cosa fa:**

- Mostra i 6 messaggi orfani che verranno eliminati
- Elimina i messaggi con sender_id o receiver_id orfani
- Verifica che non ci siano più orfani

**Risultato atteso:**

- 6 messaggi eliminati
- 0 messaggi orfani rimanenti

---

### STEP 2: Aggiungi Foreign Keys - chat_messages

**Eseguire:**

```sql
docs/FIX_05_FK_CHAT_MESSAGES.sql
```

**Cosa fa:**

- Migra automaticamente i dati da auth.users.id a profiles.id (se necessario)
- Aggiunge FK: sender_id → profiles.id
- Aggiunge FK: receiver_id → profiles.id

**Risultato atteso:**

- Success. No rows returned
- Foreign keys aggiunte con successo

---

### STEP 3: Pulizia Dati Orfani - notifications

**Eseguire:**

```sql
docs/FIX_06_CLEANUP_EXECUTE.sql
```

**Cosa fa:**

- Mostra le 3 notifiche orfane che verranno eliminate
- Elimina le notifiche con user_id orfano
- Verifica che non ci siano più orfani

**Risultato atteso:**

- 3 notifiche eliminate
- 0 notifiche orfane rimanenti

---

### STEP 4: Aggiungi Foreign Key - notifications

**Eseguire:**

```sql
docs/FIX_06_FK_NOTIFICATIONS.sql
```

**Cosa fa:**

- Migra automaticamente i dati da profiles.id a profiles.user_id (se necessario)
- Aggiunge FK: user_id → auth.users.id

**Risultato atteso:**

- Success. No rows returned
- Foreign key aggiunta con successo

---

### STEP 5: Verifica Dati Orfani - payments

**Eseguire:**

```sql
docs/FIX_07_RESOLVE_ORPHANS.sql
```

**Cosa fa:**

- Mostra i pagamenti con athlete_id o created_by_staff_id orfani
- Mostra l'importo totale coinvolto
- **NON elimina** (solo diagnostica)

**Risultato atteso:**

- Visualizzazione dei 5 pagamenti orfani
- Verifica dell'impatto finanziario

---

### STEP 6: Pulizia Dati Orfani - payments (OPZIONALE)

**⚠️ ATTENZIONE: Verificare l'impatto finanziario prima di eliminare!**

**Se i pagamenti sono di test/legacy, eseguire:**

```sql
docs/FIX_07_RESOLVE_ORPHANS.sql
```

Poi scommentare la sezione STEP 5 per eliminare.

**Oppure creare uno script esecutivo simile a FIX_05_CLEANUP_EXECUTE.sql**

**Cosa fa:**

- Elimina i pagamenti con athlete_id o created_by_staff_id orfani
- Verifica che non ci siano più orfani

---

### STEP 7: Aggiungi Foreign Keys - payments

**Eseguire:**

```sql
docs/FIX_07_FK_PAYMENTS.sql
```

**Cosa fa:**

- Migra automaticamente i dati da profiles.user_id a profiles.id (se necessario)
- Aggiunge FK: athlete_id → profiles.id
- Aggiunge FK: created_by_staff_id → profiles.id

**Risultato atteso:**

- Success. No rows returned
- Foreign keys aggiunte con successo

---

## 📝 Checklist Esecuzione

- [ ] STEP 1: Eseguire `FIX_05_CLEANUP_EXECUTE.sql`
- [ ] STEP 2: Eseguire `FIX_05_FK_CHAT_MESSAGES.sql`
- [ ] STEP 3: Eseguire `FIX_06_CLEANUP_EXECUTE.sql`
- [ ] STEP 4: Eseguire `FIX_06_FK_NOTIFICATIONS.sql`
- [ ] STEP 5: Eseguire `FIX_07_RESOLVE_ORPHANS.sql` (diagnostica)
- [ ] STEP 6: Decidere se eliminare pagamenti orfani (opzionale)
- [ ] STEP 7: Eseguire `FIX_07_FK_PAYMENTS.sql`

---

## 🎯 Ordine Rapido (Senza Pagamenti)

Se vuoi procedere velocemente senza gestire i pagamenti orfani per ora:

1. `FIX_05_CLEANUP_EXECUTE.sql`
2. `FIX_05_FK_CHAT_MESSAGES.sql`
3. `FIX_06_CLEANUP_EXECUTE.sql`
4. `FIX_06_FK_NOTIFICATIONS.sql`

I pagamenti possono essere gestiti successivamente.

---

## ⚠️ Note Importanti

1. **Eseguire sempre in ordine**: La pulizia dei dati orfani deve essere fatta PRIMA di aggiungere le foreign keys
2. **Verificare i risultati**: Controllare sempre che gli script mostrino "Success. No rows returned"
3. **Backup**: Considerare un backup prima di eliminare dati (anche se sono di test)
4. **Pagamenti**: Verificare sempre l'impatto finanziario prima di eliminare pagamenti

---

## 🔍 Script di Diagnostica (Opzionali)

Se vuoi vedere i dettagli prima di eliminare:

- `FIX_05_RESOLVE_ORPHANS.sql` - Mostra dettagli messaggi orfani
- `FIX_06_RESOLVE_ORPHANS.sql` - Mostra dettagli notifiche orfane
- `FIX_07_RESOLVE_ORPHANS.sql` - Mostra dettagli pagamenti orfani
