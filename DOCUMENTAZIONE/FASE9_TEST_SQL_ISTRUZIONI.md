# 🧪 Fase 9: Istruzioni Esecuzione Test SQL

**Data**: 2025-01-28  
**Script**: `supabase/migrations/20250128_test_athlete_profile_complete.sql`

---

## ⚠️ Problema Foreign Key

Lo script SQL cerca di creare utenti di test, ma richiede che gli utenti esistano prima in `auth.users` a causa della foreign key constraint `profiles_user_id_fkey`.

---

## 🔧 Soluzioni

### Soluzione 1: Eseguire con Service Role Key (CONSIGLIATO)

Lo script è stato modificato per creare automaticamente gli utenti in `auth.users`. Tuttavia, questo richiede permessi admin.

**Come eseguire**:

1. **Apri Supabase Dashboard** → Il tuo progetto → SQL Editor
2. **Assicurati di essere loggato come admin** o usa Service Role Key
3. **Copia e incolla** il contenuto di `20250128_test_athlete_profile_complete.sql`
4. **Esegui lo script**

Lo script:

- ✅ Crea automaticamente utenti in `auth.users`
- ✅ Crea profili in `profiles`
- ✅ Esegue tutti i test
- ✅ Pulisce i dati di test alla fine

---

### Soluzione 2: Usare Utenti Esistenti

Se non hai permessi per creare utenti in `auth.users`, modifica lo script per usare utenti esistenti:

**Modifica lo script**:

```sql
-- Sostituisci questa parte:
test_pt_user_id := gen_random_uuid();
test_athlete_user_id := gen_random_uuid();

-- Con:
-- Usa UUID di utenti esistenti
SELECT id INTO test_pt_user_id
FROM auth.users
WHERE email = 'pt-esistente@example.com'  -- Sostituisci con email reale
LIMIT 1;

SELECT id INTO test_athlete_user_id
FROM auth.users
WHERE email = 'atleta-esistente@example.com'  -- Sostituisci con email reale
LIMIT 1;

IF test_pt_user_id IS NULL OR test_athlete_user_id IS NULL THEN
  RAISE EXCEPTION 'Utenti non trovati. Crea prima gli utenti in Supabase Auth.';
END IF;
```

---

### Soluzione 3: Creare Utenti Manualmente Prima

1. **Crea utenti in Supabase Auth Dashboard**:
   - Vai a Authentication → Users
   - Crea due utenti:
     - Email: `pt-test@example.com` (ruolo: pt)
     - Email: `atleta-test@example.com` (ruolo: atleta)

2. **Ottieni gli UUID**:

   ```sql
   SELECT id, email FROM auth.users
   WHERE email IN ('pt-test@example.com', 'atleta-test@example.com');
   ```

3. **Modifica lo script** per usare questi UUID invece di generarne di nuovi

---

## ✅ Verifica Esecuzione

Dopo l'esecuzione, verifica i NOTICE per vedere i risultati:

```
✅ Utenti di test creati
✅ TEST 1: CRUD Anagrafica - TUTTI I TEST PASSATI
✅ TEST 2: CRUD Medica - TUTTI I TEST PASSATI
✅ TEST 3: CRUD Fitness - TUTTI I TEST PASSATI
✅ TEST 4: Trigger updated_at - PASSATO
✅ TEST 5: Constraint CHECK - TUTTI I TEST PASSATI
✅ TEST 6: RLS Policies - VERIFICATO
✅ Dati di test rimossi
```

---

## 🐛 Risoluzione Errori

### Errore: "insufficient_privilege"

**Causa**: Non hai permessi per inserire in `auth.users`

**Soluzione**:

- Usa Service Role Key
- Oppure usa Soluzione 2 o 3 sopra

### Errore: "Key (user_id)=... is not present in table users"

**Causa**: Lo script sta cercando di creare un profilo con un `user_id` che non esiste in `auth.users`

**Soluzione**:

- Assicurati che gli utenti esistano prima in `auth.users`
- Oppure usa Soluzione 2 o 3 sopra

### Errore: "Nessun utente trovato"

**Causa**: Lo script non trova utenti esistenti con le email specificate

**Soluzione**:

- Crea manualmente gli utenti in Supabase Auth
- Oppure modifica lo script per usare email di utenti esistenti

---

## 📝 Note

- Lo script pulisce automaticamente i dati di test alla fine
- Se l'esecuzione fallisce, i dati potrebbero rimanere nel database
- Verifica sempre che i dati di test siano stati rimossi dopo l'esecuzione
- Gli utenti in `auth.users` vengono rimossi solo se hai i permessi necessari

---

**Ultimo aggiornamento**: 2025-01-28T23:55:00Z
