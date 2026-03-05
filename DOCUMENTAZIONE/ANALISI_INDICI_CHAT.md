# Analisi Indici chat_messages

## Indici Esistenti (10 totali)

### Indici da MANTENERE (5)

1. **`chat_messages_pkey`** ✅
   - Chiave primaria su `id`
   - Necessario per integrità referenziale

2. **`idx_chat_messages_conversation_optimized`** ✅
   - Composto: `(sender_id, receiver_id, created_at DESC)`
   - Utile per query che cercano messaggi tra due utenti specifici

3. **`idx_chat_messages_receiver_created`** ✅ CRITICO
   - Composto: `(receiver_id, created_at DESC)`
   - **ESSENZIALE per realtime**: cerca nuovi messaggi per un receiver
   - Usato dalle subscription realtime

4. **`idx_chat_messages_sender_created`** ✅
   - Composto: `(sender_id, created_at DESC)`
   - Utile per query che cercano messaggi inviati

5. **`idx_chat_messages_unread`** ✅
   - Parziale: `(receiver_id, read_at) WHERE read_at IS NULL`
   - Ottimizza query per messaggi non letti

### Indici RIDONDANTI da RIMUOVERE (5)

1. **`idx_chat_messages_conversation`** ❌
   - Usa `LEAST/GREATEST` che è meno efficiente
   - Già coperto da `conversation_optimized`

2. **`idx_chat_messages_created_at`** ❌
   - Solo su `created_at`
   - Già coperto da `receiver_created` e `sender_created`

3. **`idx_chat_messages_sender_id`** ❌
   - Solo su `sender_id`
   - Già coperto da `sender_created`

4. **`idx_chat_messages_receiver_id`** ❌
   - Solo su `receiver_id`
   - Già coperto da `receiver_created`

5. **`idx_chat_messages_sender_receiver`** ❌
   - Composto: `(sender_id, receiver_id)`
   - Già coperto da `conversation_optimized` che include anche `created_at`

## Impatto

- **Prima**: 10 indici (5 ridondanti)
- **Dopo**: 5 indici (tutti necessari)
- **Beneficio**:
  - INSERT/UPDATE più veloci (meno indici da aggiornare)
  - Meno spazio su disco
  - Query planner più efficiente

## Script da Eseguire

Eseguire `08_rimuovi_indici_ridondanti.sql` per rimuovere i 5 indici ridondanti.
