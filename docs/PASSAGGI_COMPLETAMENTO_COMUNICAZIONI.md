# 📋 Passaggi Completo Sistema Comunicazioni (95% → 100%)

**Obiettivo**: Completare test, validazione e configurazione provider esterni

---

## ✅ PASSAGGIO 1: Verifica Database Schema

**Obiettivo**: Verificare che le tabelle `communications` e `communication_recipients` esistano nel database

**Azioni**:

1. Aprire Supabase Dashboard SQL Editor
2. Eseguire questa query di verifica:

```sql
-- Verifica esistenza tabelle
SELECT
  table_name,
  table_type
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN ('communications', 'communication_recipients')
ORDER BY table_name;
```

**Risultato Atteso**:

- ✅ Deve restituire 2 righe (communications, communication_recipients)

**Se le tabelle NON esistono**:

- Applicare la migration: `supabase/migrations/20250130_create_communications_tables.sql`
- Copiare il contenuto del file nel SQL Editor
- Eseguire la migration

**Verifica RLS Policies**:

```sql
-- Verifica RLS attivo
SELECT
  tablename,
  rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('communications', 'communication_recipients');
```

**Risultato Atteso**:

- ✅ `rowsecurity = true` per entrambe le tabelle

**Quando completato**: ✅ PASSAGGIO 1 COMPLETATO (✅ Verificato 2025-01-31)
**Prossimo**: PASSAGGIO 2

---

## ✅ PASSAGGIO 2: Verifica RLS Policies

**Obiettivo**: Verificare che le RLS policies siano attive e configurate correttamente

**Azioni**:

Eseguire questa query nel SQL Editor di Supabase:

```sql
-- Verifica RLS attivo
SELECT
  tablename,
  rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('communications', 'communication_recipients');
```

**Risultato Atteso**:

- ✅ `rowsecurity = true` per entrambe le tabelle

**Verifica Policies Esistenti**:

```sql
-- Verifica policies RLS create
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('communications', 'communication_recipients')
ORDER BY tablename, policyname;
```

**Risultato Atteso**:

- ✅ Almeno 2-3 policies per `communications` (SELECT, INSERT, UPDATE per utenti autenticati)
- ✅ Almeno 2-3 policies per `communication_recipients` (SELECT, INSERT, UPDATE per utenti autenticati)

**Quando completato**: ✅ PASSAGGIO 2 COMPLETATO (✅ Verificato 2025-01-31)
**Prossimo**: PASSAGGIO 3

---

## ✅ PASSAGGIO 3: Test Creazione Comunicazione (Push)

**Obiettivo**: Verificare che il sistema permetta di creare una comunicazione push di test

**Prerequisiti**:

- Essere autenticato come utente con ruolo `admin`, `pt`, `trainer` o `staff`
- Avere almeno 1 utente nel database (destinatario)

**Azioni**:

### Opzione A: Test tramite UI (Consigliato)

1. **Avvia l'applicazione in sviluppo**:

   ```bash
   npm run dev
   ```

2. **Accedi come utente staff** (admin, pt, trainer):
   - Vai a: http://localhost:3000/dashboard/comunicazioni
   - Se non sei autenticato, fai login con un account staff

3. **Crea una comunicazione push**:
   - Clicca sul pulsante "Nuova Comunicazione" o "Crea"
   - Compila il form:
     - **Tipo**: Seleziona "Push"
     - **Titolo**: `Test Push Notification`
     - **Messaggio**: `Questo è un messaggio di test per verificare il sistema comunicazioni`
     - **Destinatari**: Seleziona "Tutti gli utenti" o un ruolo specifico
   - Salva come bozza (status: `draft`)

4. **Verifica nel database**:

Esegui questa query nel SQL Editor di Supabase:

```sql
-- Verifica comunicazione creata
SELECT
  id,
  title,
  message,
  type,
  status,
  total_recipients,
  created_at
FROM communications
WHERE title = 'Test Push Notification'
ORDER BY created_at DESC
LIMIT 1;
```

**Risultato Atteso**:

- ✅ La query deve restituire 1 riga con:
  - `type = 'push'`
  - `status = 'draft'`
  - `total_recipients > 0` (se destinatari selezionati)

### Opzione B: Test tramite SQL (Alternativo)

Se preferisci testare direttamente tramite SQL:

```sql
-- Inserisci comunicazione di test (sostituisci YOUR_USER_ID con un user_id reale)
INSERT INTO communications (
  created_by,
  title,
  message,
  type,
  status,
  recipient_filter,
  total_recipients
)
SELECT
  auth.uid(), -- Oppure un UUID specifico se esegui da SQL Editor
  'Test Push Notification',
  'Questo è un messaggio di test per verificare il sistema comunicazioni',
  'push',
  'draft',
  '{"all_users": true}'::jsonb,
  0 -- Verrà calcolato automaticamente quando inviata
WHERE EXISTS (
  SELECT 1 FROM profiles
  WHERE user_id = auth.uid()
  AND role IN ('admin', 'pt', 'trainer', 'staff')
)
RETURNING *;
```

**Nota**: Per SQL Editor, potrebbe essere necessario usare un UUID specifico invece di `auth.uid()`. Usa un user_id reale dalla tabella `profiles`.

**📋 Query SQL per vedere utenti disponibili**:

Esegui questa query nel SQL Editor per vedere utenti staff disponibili:

```sql
-- Utenti staff con password demo
SELECT
  p.role AS ruolo,
  u.email AS email,
  p.nome || ' ' || p.cognome AS nome_completo,
  'password123' AS password_demo
FROM auth.users u
INNER JOIN profiles p ON p.user_id = u.id
WHERE p.role IN ('admin', 'pt', 'trainer', 'staff')
ORDER BY
  CASE p.role
    WHEN 'admin' THEN 1
    WHEN 'pt' THEN 2
    WHEN 'trainer' THEN 2
    WHEN 'staff' THEN 3
  END,
  u.email;
```

**Credenziali Demo (da login-form.tsx)**:

- **Admin**: `admin@22club.it` / `password123`
- **PT**: `pt1@22club.it` / `password123`

Vedi anche: `docs/QUERY_UTENTI_PASSWORD.sql` per query completa

---

**⚠️ TROUBLESHOOTING - Errore "User not authenticated"**:

Se ricevi l'errore "User not authenticated", prova:

1. **Verifica sessione nel browser**:
   - Apri la console del browser (F12)
   - Esegui questo codice:

   ```javascript
   // Controlla sessione
   import('@/lib/supabase/client').then(({ createClient }) => {
     const supabase = createClient()
     supabase.auth.getSession().then(({ data, error }) => {
       console.log('Session:', data?.session)
       console.log('Error:', error)
       if (data?.session?.user) {
         console.log('User ID:', data.session.user.id)
       }
     })
   })
   ```

2. **Se la sessione è null**:
   - Fai logout e login di nuovo
   - Verifica che i cookie siano abilitati
   - Controlla che non ci siano errori nella console

3. **Alternativa: Usa Opzione B (SQL diretto)** per bypassare il problema temporaneamente

**Quando completato**: ✅ PASSAGGIO 3 COMPLETATO (✅ Verificato 2025-01-31)
**Prossimo**: PASSAGGIO 4

**Nota**: `total_recipients = 0` è normale per comunicazioni in stato `draft`. I recipients vengono calcolati/creati quando la comunicazione viene inviata.

---

## ✅ PASSAGGIO 4: Verifica Recipients e Test Invio Immediato (Push)

**Obiettivo**: Verificare che i recipients vengano creati correttamente e testare l'invio immediato di una comunicazione push

**Azioni**:

### 4.1: Verifica recipients della comunicazione creata

Esegui questa query nel SQL Editor di Supabase per vedere se ci sono recipients creati:

```sql
-- Verifica recipients della comunicazione di test
SELECT
  cr.id,
  cr.communication_id,
  cr.user_id,
  cr.recipient_type,
  cr.status,
  p.email AS recipient_email,
  p.nome || ' ' || p.cognome AS recipient_name,
  cr.created_at
FROM communication_recipients cr
LEFT JOIN profiles p ON p.user_id = cr.user_id
WHERE cr.communication_id = '0054eecd-e652-4a12-a339-582e693cbbe2' -- ID della comunicazione creata
ORDER BY cr.created_at DESC;
```

**Risultato Atteso**:

- Se `status = 'draft'`: probabilmente 0 recipients (normale, vengono creati all'invio)
- Se già inviata: dovrebbe mostrare recipients con `status = 'pending'` o `'sent'`

### 4.2: Test invio immediato tramite UI

1. **Vai alla pagina comunicazioni**: http://localhost:3000/dashboard/comunicazioni

2. **Trova la comunicazione "Test Push Notification"** nella lista

3. **Clicca su "Invia" o "Send"** (bottone di invio)

4. **Verifica il risultato**:
   - La comunicazione dovrebbe cambiare status da `draft` a `sending` e poi `sent`
   - Dovrebbero essere creati i recipients nella tabella `communication_recipients`

### 4.3: Verifica dopo invio

Esegui di nuovo la query per vedere i recipients creati:

```sql
-- Verifica comunicazione e recipients dopo invio
SELECT
  c.id,
  c.title,
  c.status,
  c.total_recipients,
  c.total_sent,
  c.total_delivered,
  c.total_failed,
  COUNT(cr.id) AS recipients_count
FROM communications c
LEFT JOIN communication_recipients cr ON cr.communication_id = c.id
WHERE c.id = '0054eecd-e652-4a12-a339-582e693cbbe2'
GROUP BY c.id, c.title, c.status, c.total_recipients, c.total_sent, c.total_delivered, c.total_failed;
```

**Risultato Atteso**:

- ✅ `status` dovrebbe essere `'sent'` o `'sending'`
- ✅ `total_recipients > 0`
- ✅ `recipients_count` dovrebbe corrispondere a `total_recipients`
- ✅ `total_sent > 0` se l'invio è riuscito

---

**🔍 DIAGNOSTICA - Problema "0 destinatari" e "Invio in corso" bloccato**:

Se vedi "0 destinatari" e l'invio rimane bloccato in "Invio in corso", esegui queste query diagnostiche:

```sql
-- 1. Verifica recipient_filter salvato
SELECT
  id,
  title,
  type,
  status,
  recipient_filter,
  total_recipients
FROM communications
WHERE id = '0054eecd-e652-4a12-a339-582e693cbbe2';
```

```sql
-- 2. Verifica quanti utenti esistono nel database
SELECT
  role,
  COUNT(*) AS count
FROM profiles
WHERE stato = 'attivo'
GROUP BY role;
```

```sql
-- 3. Verifica se la tabella user_push_tokens esiste
SELECT EXISTS (
  SELECT FROM information_schema.tables
  WHERE table_schema = 'public'
  AND table_name = 'user_push_tokens'
) AS table_exists;
```

Se la tabella esiste, verifica i token:

```sql
-- Verifica se ci sono push tokens attivi
SELECT
  COUNT(*) AS total_tokens,
  COUNT(DISTINCT user_id) AS users_with_tokens
FROM user_push_tokens
WHERE is_active = true;
```

**Nota**: Se la tabella non esiste, applica la migration `supabase/migrations/11_notifications.sql`. La tabella è opzionale - se non ci sono token, i recipients verranno marcati come `failed`.

**✅ FIX APPLICATO**:

- Creato API route `/api/communications/send` che gestisce:
  1. Creazione recipients tramite `ensureRecipientsCreated`
  2. Invio effettivo tramite `sendCommunicationPush/Email/SMS`
- Modificato hook `sendCommunication` per chiamare l'API route
- Esportata funzione `ensureRecipientsCreated` da `scheduler.ts`

**Nota sulla tabella `user_push_tokens`**:
Se ricevi errore "relation user_push_tokens does not exist", verifica che la migration `11_notifications.sql` sia stata applicata. La tabella è opzionale per l'invio (se non ci sono token, i recipients verranno marcati come `failed` con messaggio "No active push tokens").

---

**Quando completato**: ✅ PASSAGGIO 4-FIX APPLICATO (✅ Verificato 2025-01-31)
**Prossimo**: PASSAGGIO 5

---

## ✅ PASSAGGIO 5: Fix UI - Conteggio Destinatari e Modifica Comunicazioni

**Obiettivo**: Correggere i problemi UI del sistema comunicazioni

**Problemi Risolti**:

### 5.1: Fix conteggio destinatari nel form (0 destinatari)

**Problema**: Il form mostrava "Tutti gli utenti (0)" anche con 19 utenti nel database.

**Causa**: `countRecipientsByFilter` veniva chiamata dal client ma richiedeva `SUPABASE_SERVICE_ROLE_KEY` non disponibile lato client.

**Soluzione**:

- Creato API route `/api/communications/count-recipients` (`src/app/api/communications/count-recipients/route.ts`)
- Modificato hook `use-communications-page.tsx` per chiamare l'API route invece di `countRecipientsByFilter` direttamente
- Aggiornate funzioni `getRecipientsByFilter` e `countRecipientsByFilter` per gestire correttamente il filtro "atleta" (include sia `'atleta'` che `'athlete'`)

**Risultato**: ✅ Il form ora mostra correttamente il conteggio dei destinatari (es. "Tutti gli utenti (19)")

### 5.2: Fix pulsante "Modifica" non funzionante

**Problema**: Il pulsante "Modifica" su comunicazioni in stato `draft` non aveva handler `onClick`.

**Soluzione**:

- Aggiunto handler `onEdit` in `CommunicationCard`
- Implementata funzione `handleEditCommunication` nell'hook per caricare i dati nel form
- Implementata funzione `handleUpdateCommunication` nell'hook per aggiornare la comunicazione
- Aggiornato modal per supportare modalità edit (mostra "Modifica Comunicazione" invece di "Nuova Comunicazione")
- Aggiunto stato `editingCommunicationId` per tracciare quale comunicazione si sta modificando

**Risultato**: ✅ Il pulsante "Modifica" ora funziona correttamente, apre il modal con dati precompilati e permette di aggiornare la comunicazione

**Quando completato**: ✅ PASSAGGIO 5 COMPLETATO (✅ Verificato 2025-01-31)
**Prossimo**: PASSAGGIO 6 (se necessario)

---

### 4.4: Reset comunicazione bloccata (se necessario)

Se la comunicazione è bloccata in stato "sending", resettala a "draft" per riprovare:

```sql
-- Reset status comunicazione bloccata
UPDATE communications
SET status = 'draft',
    total_recipients = 0
WHERE id = '0054eecd-e652-4a12-a339-582e693cbbe2';

-- Opzionale: Elimina recipients esistenti (se vuoi ripartire da zero)
DELETE FROM communication_recipients
WHERE communication_id = '0054eecd-e652-4a12-a339-582e693cbbe2';
```

Poi riprova l'invio dall'UI - ora dovrebbe funzionare correttamente.

---
