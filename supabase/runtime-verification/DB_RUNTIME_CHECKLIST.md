# Verifica DB runtime — checklist, ispezione, piano batch SQL/RLS

**Scopo:** eseguire solo ispezione sul database Supabase reale (nessuna modifica in questo step).  
**Riferimento schema app:** `src/lib/supabase/types.ts` (allineare eventuali differenze runtime vs tipi generati).

**Esecuzione consigliata:** SQL Editor Supabase (ruolo con lettura catalog + `SELECT` su tabelle; per policy effettive lato client usare anche test con JWT reali).

---

## FASE 1 — Checklist ordinata (runtime)

Eseguire nell’ordine; ogni blocco è indipendente ma 1.x va prima dei domini se serve contesto globale.

| #   | Cosa verificare                     | Output atteso minimo                                                  |
| --- | ----------------------------------- | --------------------------------------------------------------------- |
| 1.1 | RLS abilitato per tabella target    | Una riga per tabella con `relrowsecurity = true` dove previsto        |
| 1.2 | Policy per tabella                  | Elenco `cmd`, `roles`, `qual`, `with_check` (o note se troppo lunghe) |
| 1.3 | Trigger                             | Nome, timing, eventi, funzione trigger, `enabled`                     |
| 1.4 | Funzioni / RPC usate dai flussi     | Definizione o almeno `prosrc` fingerprint + argomenti                 |
| 1.5 | Colonne chiave e tipi               | Coerenza con app (`org_id`, `org_id_text`, status, owner)             |
| 1.6 | Vincoli UNIQUE / PK / FK            | Presenza e colonne                                                    |
| 1.7 | Indici utili (non “decorativi”)     | PK/unique + indici su FK e filtri frequenti                           |
| 1.8 | Helper duplicati / overload ambigui | Stesso `proname` con più overload; funzioni quasi identiche           |

**Tabelle minime (scope):**  
`appointments`, `appointment_cancellations`, `calendar_blocks`, `payments`, `credit_ledger`, `lesson_counters`, `communication_recipients`, `communications`, `profiles`  
(+ `organizations` per join `org_id`).

---

### 1.A — RLS on/off (catalog)

```sql
SELECT c.relname AS table_name,
       c.relrowsecurity AS rls_enabled,
       c.relforcerowsecurity AS rls_forced
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public'
  AND c.relkind = 'r'
  AND c.relname IN (
    'appointments', 'appointment_cancellations', 'calendar_blocks',
    'payments', 'credit_ledger', 'lesson_counters',
    'communication_recipients', 'communications', 'profiles', 'organizations'
  )
ORDER BY c.relname;
```

### 1.B — Policy RLS (per tabella)

```sql
SELECT schemaname, tablename, policyname, permissive, roles, cmd,
       qual, with_check
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN (
    'appointments', 'appointment_cancellations', 'calendar_blocks',
    'payments', 'credit_ledger', 'lesson_counters',
    'communication_recipients', 'communications', 'profiles', 'organizations'
  )
ORDER BY tablename, policyname;
```

_Lettura:_ confrontare `cmd` (SELECT/INSERT/UPDATE/DELETE/ALL) con operazioni reali dell’app. `qual` / `with_check` devono includere vincoli di org e ruolo attesi. Assenza di policy su tabella con RLS ⇒ nessun accesso (spesso bug).

### 1.C — Trigger

```sql
SELECT evt.event_object_table AS table_name,
       trg.tgname AS trigger_name,
       CASE trg.tgtype & 66
         WHEN 2 THEN 'BEFORE'
         WHEN 64 THEN 'INSTEAD OF'
         ELSE 'AFTER'
       END AS timing,
       ARRAY_AGG(evt.event_manipulation ORDER BY evt.event_manipulation) AS events,
       p.proname AS function_name,
       trg.tgenabled AS enabled
FROM information_schema.triggers evt
JOIN pg_trigger trg ON trg.tgname = evt.trigger_name
JOIN pg_class c ON c.relname = evt.event_object_table
JOIN pg_namespace n ON n.oid = c.relnamespace AND n.nspname = evt.event_object_schema
JOIN pg_proc p ON p.oid = trg.tgfoid
WHERE evt.event_object_schema = 'public'
  AND evt.event_object_table IN (
    'appointments', 'appointment_cancellations', 'calendar_blocks',
    'payments', 'credit_ledger', 'lesson_counters',
    'communication_recipients', 'communications', 'profiles'
  )
  AND NOT trg.tgisinternal
GROUP BY evt.event_object_table, trg.tgname, trg.tgtype, p.proname, trg.tgenabled
ORDER BY evt.event_object_table, trg.tgname;
```

### 1.D — Colonne chiave (information_schema)

```sql
SELECT table_name, column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name IN (
    'appointments', 'appointment_cancellations', 'calendar_blocks',
    'payments', 'credit_ledger', 'lesson_counters',
    'communication_recipients', 'communications', 'profiles'
  )
  AND column_name IN (
    'org_id', 'org_id_text', 'status', 'staff_id', 'trainer_id', 'athlete_id',
    'created_by_profile_id', 'created_by_staff_id', 'is_open_booking_day',
    'entry_type', 'applies_to_counter', 'lesson_type', 'recipient_profile_id',
    'communication_id', 'role', 'user_id', 'is_deleted'
  )
ORDER BY table_name, column_name;
```

### 1.E — Vincoli PK / UNIQUE / FK

```sql
SELECT tc.table_name, tc.constraint_type, tc.constraint_name,
       kcu.column_name, ccu.table_name AS foreign_table_name,
       ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints tc
LEFT JOIN information_schema.key_column_usage kcu
  ON tc.constraint_name = kcu.constraint_name AND tc.table_schema = kcu.table_schema
LEFT JOIN information_schema.constraint_column_usage ccu
  ON ccu.constraint_name = tc.constraint_name AND ccu.table_schema = tc.table_schema
WHERE tc.table_schema = 'public'
  AND tc.table_name IN (
    'appointments', 'appointment_cancellations', 'calendar_blocks',
    'payments', 'credit_ledger', 'lesson_counters',
    'communication_recipients', 'communications', 'profiles'
  )
ORDER BY tc.table_name, tc.constraint_type, tc.constraint_name, kcu.ordinal_position;
```

### 1.F — Indici (utili per drift e performance)

```sql
SELECT tab.relname AS table_name,
       idx.relname AS index_name,
       pg_get_indexdef(ix.indexrelid) AS index_def
FROM pg_index ix
JOIN pg_class idx ON idx.oid = ix.indexrelid
JOIN pg_class tab ON tab.oid = ix.indrelid
JOIN pg_namespace n ON n.oid = tab.relnamespace
WHERE n.nspname = 'public'
  AND tab.relname IN (
    'appointments', 'appointment_cancellations', 'calendar_blocks',
    'payments', 'credit_ledger', 'lesson_counters',
    'communication_recipients', 'communications', 'profiles'
  )
ORDER BY tab.relname, idx.relname;
```

### 1.G — Funzioni RPC rilevanti (nome + overload + lingua)

```sql
SELECT p.oid::regprocedure AS signature,
       l.lanname AS language,
       p.prosecdef AS security_definer
FROM pg_proc p
JOIN pg_namespace n ON n.oid = p.pronamespace
JOIN pg_language l ON l.oid = p.prolang
WHERE n.nspname = 'public'
  AND p.proname IN (
    'check_appointment_overlap',
    'count_slot_bookings',
    'get_open_slot_booking_count',
    'slot_has_open_booking_for_rls',
    'slot_is_open_booking',
    'create_appointment_simple',
    'create_payment',
    'reverse_payment',
    'decrement_lessons_used',
    'current_org_id',
    'current_profile_ctx',
    'get_my_org_id',
    'get_user_org_id',
    'resolve_org_text_to_uuid',
    'safe_text_to_uuid',
    'is_staff_appointments'
  )
ORDER BY p.proname, signature;
```

### 1.H — Definizione funzione (campione: sostituire nome)

```sql
SELECT pg_get_functiondef(p.oid)
FROM pg_proc p
JOIN pg_namespace n ON n.oid = p.pronamespace
WHERE n.nspname = 'public'
  AND p.proname = 'slot_is_open_booking';  -- ripetere per altre RPC critiche
```

### 1.I — Possibili duplicati logici (stesso nome, più overload)

```sql
SELECT proname, COUNT(*) AS overload_count,
       array_agg(oid::regprocedure ORDER BY oid) AS signatures
FROM pg_proc p
JOIN pg_namespace n ON n.oid = p.pronamespace
WHERE n.nspname = 'public'
  AND proname IN (
    'count_slot_bookings', 'slot_is_open_booking', 'slot_has_open_booking_for_rls',
    'get_open_slot_booking_count', 'current_org_id', 'get_my_org_id', 'get_user_org_id'
  )
GROUP BY proname
HAVING COUNT(*) > 1
ORDER BY proname;
```

### 1.J — Funzioni con definizione simile (euristica: prime righe sorgente)

Utile per trovare copie non rinominate: confrontare manualmente gli output.

```sql
SELECT p.proname,
       p.oid::regprocedure AS signature,
       LEFT(p.prosrc, 200) AS src_head
FROM pg_proc p
JOIN pg_namespace n ON n.oid = p.pronamespace
WHERE n.nspname = 'public'
  AND p.prokind = 'f'
ORDER BY p.proname, signature;
```

_(Opzionale: filtrare `proname` ILIKE '%org%' OR … per ridurre rumore.)_

### 1.K — Realtime (se gli slot/appuntamenti usano subscribe)

```sql
SELECT schemaname, tablename
FROM pg_publication_tables
WHERE pubname = 'supabase_realtime'
  AND tablename IN ('appointments', 'communications', 'communication_recipients');
```

---

## FASE 2 — Mappa “verifica DB” per dominio

Per ogni dominio: **query** → **corretto** → **segnali di drift** → **intervento tipico** (solo descrizione).

---

### Dominio 1 — `appointments` + `appointment_cancellations`

**Colonne chiave (da tipi):** `org_id`, `org_id_text`, `staff_id`, `trainer_id`, `athlete_id`, `starts_at`, `ends_at`, `status`, `type`, `is_open_booking_day`, `cancelled_at`.

**Query ispezione dati (drift):**

```sql
-- org_id assente o non presente in organizations
SELECT a.id, a.org_id, a.starts_at
FROM appointments a
LEFT JOIN organizations o ON o.id = a.org_id
WHERE o.id IS NULL
LIMIT 200;

-- org_id_text valorizzato ma diverso da cast text(org_id) (se policy usa entrambi)
SELECT id, org_id, org_id_text
FROM appointments
WHERE org_id_text IS NOT NULL
  AND org_id_text <> org_id::text
LIMIT 200;

-- status o type: distribuzione valori (cattura enum “fantasma”)
SELECT COALESCE(status, '(null)') AS status, type, COUNT(*) AS n
FROM appointments
GROUP BY 1, 2
ORDER BY n DESC;

-- cancellazioni orfane o duplicate per appointment
SELECT appointment_id, COUNT(*) AS n
FROM appointment_cancellations
GROUP BY appointment_id
HAVING COUNT(*) > 1
LIMIT 100;
```

**Corretto:** ogni riga `appointments.org_id` FK-valida; `org_id`/`org_id_text` allineati dove entrambi usati; status coerenti con app; al massimo una logica definita per cancellazione per evento (se il modello è 1:1).

**Drift:** policy che filtra solo `org_id` ma insert da client popola `org_id_text` diverso; atleta vede righe sbagliate; trigger che aggiorna `lesson_counters`/`credit_ledger` doppio.

**Intervento se fallisce:** allineare policy USING/WITH CHECK a `current_org_id()` / `profiles.org_id`; vincolo o trigger di coerenza `org_id_text`; migrazione dati one-off per righe storiche; documentare enum `status`/`type`.

---

### Dominio 2 — `calendar_blocks`

**Colonne:** `org_id`, `staff_id`, `starts_at`, `ends_at`, `reason`.

**Query:**

```sql
SELECT cb.id, cb.org_id
FROM calendar_blocks cb
LEFT JOIN organizations o ON o.id = cb.org_id
WHERE o.id IS NULL
LIMIT 200;

SELECT staff_id, COUNT(*) FROM calendar_blocks WHERE staff_id IS NOT NULL GROUP BY 1 HAVING COUNT(*) > 500;
```

**Corretto:** FK org; staff opzionale coerente con modello (blocco personale vs organizzativo).

**Drift:** RLS troppo permissivo ⇒ un trainer legge blocchi di altri; troppo restrittivo ⇒ calendario vuoto.

**Intervento:** policy per ruolo + `staff_id` match `auth.uid()` mapping; indici su `(org_id, staff_id, starts_at)`.

---

### Dominio 3 — Open booking / capacità slot

**App/tipi:** `appointments.is_open_booking_day`; RPC: `count_slot_bookings`, `get_open_slot_booking_count`, `slot_is_open_booking`, `slot_has_open_booking_for_rls`, `check_appointment_overlap`.

**Query:**

```sql
-- Appuntamenti segnati open booking: coerenza type/status
SELECT type, status, is_open_booking_day, COUNT(*)
FROM appointments
GROUP BY 1, 2, 3
ORDER BY 4 DESC;

-- Confronto conteggio slot (esempio: una finestra recente; adattare timestamp)
SELECT
  a.starts_at,
  a.ends_at,
  a.org_id,
  public.get_open_slot_booking_count(a.starts_at, a.ends_at, a.org_id) AS fn_count
FROM appointments a
WHERE a.is_open_booking_day = true
LIMIT 20;
```

**Corretto:** una sola semantica per “slot aperto”; RPC duplicate non discordi; RLS per lettura slot allineata a `slot_has_open_booking_for_rls` (se usata in policy).

**Drift:** due overload di `count_slot_bookings` con logica diversa; atleta prenota oltre capienza; overlap non rilevato.

**Intervento:** unificare overload; test SQL su funzioni; policy che chiama la stessa funzione del client; indici su range time + `org_id`.

---

### Dominio 4 — `payments` → `credit_ledger` → `lesson_counters`

**Colonne chiave:**  
payments: `org_id`, `org_id_text`, `athlete_id`, `lessons_purchased`, `status`, `deleted_at`, `is_reversal`, `ref_payment_id`  
credit_ledger: `org_id`, `athlete_id`, `entry_type`, `qty`, `applies_to_counter`, `appointment_id`, `payment_id`  
lesson_counters: `athlete_id`, `lesson_type`, `count`

**Query:**

```sql
-- Pagamenti senza org valida
SELECT p.id FROM payments p
LEFT JOIN organizations o ON o.id = p.org_id
WHERE o.id IS NULL LIMIT 200;

-- org vs org_id_text payments
SELECT id, org_id, org_id_text FROM payments
WHERE org_id_text IS NOT NULL AND org_id_text <> org_id::text LIMIT 200;

-- Ledger senza org coerente con atleta (se regola attesa)
SELECT cl.id, cl.org_id, pr.org_id AS profile_org
FROM credit_ledger cl
JOIN profiles pr ON pr.id = cl.athlete_id
WHERE cl.org_id IS DISTINCT FROM pr.org_id
LIMIT 200;

-- Aggregati lezione: confronto grezzo ledger (verificare valori reali di entry_type nel DB)
SELECT cl.athlete_id, cl.service_type,
       SUM(CASE WHEN lower(cl.entry_type) IN ('credit') THEN cl.qty
                WHEN lower(cl.entry_type) IN ('debit') THEN -cl.qty
                ELSE 0 END) AS net_ledger,
       COUNT(*) AS ledger_rows
FROM credit_ledger cl
GROUP BY 1, 2
ORDER BY ledger_rows DESC
LIMIT 50;

SELECT athlete_id, lesson_type, COUNT(*) AS rows_per_key
FROM lesson_counters
GROUP BY 1, 2
HAVING COUNT(*) > 1;
```

**Corretto:** catena pagamento → movimenti ledger → counter con regole uniche per `lesson_type`; nessun org mismatch atleta/pagamento/ledger (salvo processi cross-org documentati).

**Drift:** doppio accredito; reversal incompleto; `lesson_counters` duplicati per (`athlete_id`, `lesson_type`); RLS che nasconde pagamenti ma non ledger.

**Intervento:** UNIQUE parziale su `lesson_counters`; trigger unico su insert payment; allineare policy tra le tre tabelle; job di riconciliazione dati.

---

### Dominio 5 — `communications` / `communication_recipients`

**Colonne:** `communications.created_by_profile_id`, status aggregati; `communication_recipients.recipient_profile_id`, `status`, `recipient_type`.

**Query:**

```sql
-- Recipients senza communication padre
SELECT cr.id FROM communication_recipients cr
LEFT JOIN communications c ON c.id = cr.communication_id
WHERE c.id IS NULL LIMIT 100;

-- Recipient che non esiste in profiles
SELECT cr.id FROM communication_recipients cr
LEFT JOIN profiles p ON p.id = cr.recipient_profile_id
WHERE p.id IS NULL LIMIT 100;

SELECT status, recipient_type, COUNT(*) FROM communication_recipients GROUP BY 1, 2 ORDER BY 3 DESC;
```

**Corretto:** FK e RLS: creatore/mittente e destinatario vedono solo ciò che deve; atleta vede proprie righe recipient.

**Drift:** staff legge tutti i recipient cross-org; atleta vede broadcast di altri; totals su `communications` non aggiornati (trigger mancante).

**Intervento:** policy su `recipient_profile_id = current_profile_id()` per atleti; policy org per staff; trigger di aggiornamento conteggi o job.

---

### Dominio 6 — `org_id` / `org_id_text` residui

**Tabelle interessate (tipi):** `profiles`, `payments`, `appointments` (+ altre se emerse).

**Query:**

```sql
SELECT 'profiles' AS t, COUNT(*) AS mismatch
FROM profiles WHERE org_id_text IS NOT NULL AND org_id_text <> org_id::text
UNION ALL
SELECT 'payments', COUNT(*) FROM payments WHERE org_id_text IS NOT NULL AND org_id_text <> org_id::text
UNION ALL
SELECT 'appointments', COUNT(*) FROM appointments WHERE org_id_text IS NOT NULL AND org_id_text <> org_id::text;

SELECT org_id, org_id_text, COUNT(*) FROM profiles GROUP BY 1, 2 HAVING COUNT(*) < 5 ORDER BY 3 DESC LIMIT 30;
```

**Corretto:** una sola fonte di verità (`uuid`); `org_id_text` legacy allineato o sempre NULL.

**Drift:** policy che confronta `org_id_text` con JWT claim testuale mentre uuid è diverso.

**Intervento:** backfill; deprecare colonna testo; policy solo su uuid; funzione unica `resolve_org_text_to_uuid` in tutti i path.

---

## FASE 3 — Struttura futuro batch SQL/RLS (per priorità)

Ogni item: **obiettivo** — **oggetti** — **rischio se ignorato** — **dipendenze**.

### Critici (bloccanti sicurezza o integrità contabile)

| ID  | Obiettivo                                                                                                    | Tabella/funzione                 | Rischio                                     | Dipendenze                                     |
| --- | ------------------------------------------------------------------------------------------------------------ | -------------------------------- | ------------------------------------------- | ---------------------------------------------- |
| C1  | RLS su `payments`, `credit_ledger`, `appointments` coerente con org e ruolo                                  | tabelle + policy                 | furto/modifica dati finanziari o calendario | `profiles`, JWT helpers, `organizations`       |
| C2  | Nessun mismatch `org_id` tra `profiles`, `payments`, `credit_ledger`                                         | dati + eventuale vincolo/trigger | accessi incrociati e report errati          | migrazione dati prima di vincoli rigidi        |
| C3  | Una sola implementazione per RPC slot/overlap (`count_slot_bookings`, `slot_*`, `check_appointment_overlap`) | `pg_proc`                        | overbooking o slot invisibili               | app che chiama RPC; policy che citano funzioni |
| C4  | `communication_recipients`: isolamento destinatario vs staff                                                 | policy                           | leak messaggi tra utenti/org                | `communications`, `profiles`                   |

### Medi (correttezza operativa / bug frequenti)

| ID  | Obiettivo                                                                     | Tabella/funzione                       | Rischio                         | Dipendenze                          |
| --- | ----------------------------------------------------------------------------- | -------------------------------------- | ------------------------------- | ----------------------------------- |
| M1  | Unicità logica `lesson_counters (athlete_id, lesson_type)`                    | indice UNIQUE                          | doppi contatori                 | job di merge duplicati              |
| M2  | Trigger allineati su cancellazione appuntamento / `appointment_cancellations` | trigger                                | lezioni scalate male            | `credit_ledger`, `lesson_counters`  |
| M3  | Allineamento `org_id_text` vs `org_id` (regola NULL o uguale)                 | `profiles`, `payments`, `appointments` | policy errate                   | funzioni `resolve_org_text_to_uuid` |
| M4  | Indici range su `appointments (org_id, starts_at)` e `calendar_blocks`        | indici                                 | lentezza e timeout in dashboard | nessuna                             |

### Hardening opzionale (qualità, osservabilità)

| ID  | Obiettivo                                                   | Oggetto   | Rischio      | Dipendenze                 |
| --- | ----------------------------------------------------------- | --------- | ------------ | -------------------------- |
| H1  | Commenti `COMMENT ON` su policy e funzioni security definer | catalog   | manutenzione | documentazione interna     |
| H2  | Vista di audit incrociato ledger vs counters (solo lettura) | VIEW      | —            | nessuna                    |
| H3  | Rimuovere RPC deprecate duplicate dopo verifica `pg_depend` | `pg_proc` | confusione   | ricerca riferimenti in app |

---

## Note finali

- **Tipi vs runtime:** se una query su `information_schema` mostra colonne assenti in `types.ts`, rigenerare i tipi dopo il consolidamento DB.
- **Prove funzionali:** le query dati sopra non sostituiscono test con ruoli JWT (anon/authenticated/service_role) su API e client Supabase.
- **Modifiche:** questo documento non contiene DDL/DML; il batch successivo va versionato e applicato solo dopo esito positivo di questa checklist.
