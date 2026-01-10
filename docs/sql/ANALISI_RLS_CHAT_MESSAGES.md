# Analisi Policy RLS chat_messages

## Policy Esistenti

### 1. SELECT: "Users can view own messages"

```sql
(EXISTS ( SELECT 1 FROM profiles
  WHERE ((profiles.id = chat_messages.sender_id) AND (profiles.user_id = auth.uid())))
OR
(EXISTS ( SELECT 1 FROM profiles
  WHERE ((profiles.id = chat_messages.receiver_id) AND (profiles.user_id = auth.uid()))))
```

**Analisi**:

- ✅ Logica corretta: permette di vedere messaggi dove sei sender o receiver
- ⚠️ Performance: fa 2 subquery EXISTS con JOIN su profiles per ogni messaggio
- ⚠️ Potenziale problema: se profiles è grande, può essere lento

### 2. INSERT: "Users can send messages"

```sql
WITH CHECK: (EXISTS ( SELECT 1 FROM profiles
  WHERE ((profiles.id = chat_messages.sender_id) AND (profiles.user_id = auth.uid()))))
```

**Analisi**:

- ✅ Logica corretta: permette di inviare solo se sei il sender
- ⚠️ Performance: fa subquery EXISTS con JOIN su profiles
- ⚠️ Potenziale problema: ogni INSERT deve verificare profiles

### 3. UPDATE: "Users can mark messages as read"

```sql
USING: (EXISTS ( SELECT 1 FROM profiles
  WHERE ((profiles.id = chat_messages.receiver_id) AND (profiles.user_id = auth.uid()))))

WITH CHECK: ((EXISTS ( SELECT 1 FROM profiles
  WHERE ((profiles.id = chat_messages.receiver_id) AND (profiles.user_id = auth.uid()))))
  AND (read_at IS NOT NULL))
```

**Analisi**:

- ✅ Logica corretta: permette di aggiornare solo messaggi ricevuti
- ❌ **PROBLEMA CRITICO**: `read_at IS NOT NULL` nel WITH CHECK impedisce di impostare `read_at` quando è NULL!
- ⚠️ Performance: fa subquery EXISTS con JOIN su profiles

### 4. DELETE: "No deletion allowed"

```sql
USING: false
```

**Analisi**:

- ✅ Corretto: non permette cancellazioni

## Problemi Identificati

### 1. **PROBLEMA CRITICO - Policy UPDATE**

La condizione `read_at IS NOT NULL` nel WITH CHECK impedisce di impostare `read_at` quando è NULL (cioè quando si vuole marcare un messaggio come letto).

**Soluzione**: Rimuovere `read_at IS NOT NULL` dal WITH CHECK, o cambiare la logica.

### 2. **Performance - JOIN con profiles**

Tutte le policy fanno JOIN con `profiles` per convertire `profile_id` in `user_id`. Questo può essere lento se:

- La tabella profiles è grande
- Non ci sono indici ottimizzati su `profiles.id` e `profiles.user_id`

**Soluzione**: Verificare che ci siano indici su:

- `profiles.id` (chiave primaria, dovrebbe già esistere)
- `profiles.user_id` (dovrebbe già esistere)

### 3. **Ottimizzazione Possibile**

Invece di fare 2 EXISTS separati nella policy SELECT, potremmo usare una singola query, ma questo potrebbe non migliorare le performance.

## Raccomandazioni

1. **Correggere policy UPDATE**: Rimuovere `read_at IS NOT NULL` dal WITH CHECK
2. **Verificare indici**: Assicurarsi che ci siano indici su `profiles.id` e `profiles.user_id`
3. **Testare performance**: Eseguire EXPLAIN ANALYZE sulle query per verificare se le policy causano delay
