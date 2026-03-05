# Documentazione interventi Abbonamenti, Pagamenti e Fatture (2026-02-07)

**Riferimento unico per gli interventi effettuati. Non modificare il comportamento descritto senza aggiornare questa documentazione.**

---

## 1. Storno pagamento (errore FK su `credit_ledger`)

### Problema

Eliminando uno abbonamento dalla lista (es. dati in cache ma pagamento già cancellato nel DB), l’app eseguiva:

1. `UPDATE payments SET status = 'cancelled'` (0 righe aggiornate)
2. `addReversalFromPayment(...)` → INSERT in `credit_ledger` con `payment_id` = quell’id

L’INSERT in `credit_ledger` violava la FK `credit_ledger_payment_id_fkey` perché il pagamento non esisteva più.

### Soluzione

- **`src/app/dashboard/abbonamenti/page.tsx`**
  - Dopo l’UPDATE su `payments` si usa `.select('id')` e si controlla se sono state aggiornate righe.
  - Se **nessuna riga** è aggiornata: **non** si chiama `addReversalFromPayment`, si mostra toast “Pagamento non trovato. Il pagamento potrebbe essere già stato eliminato. Lista aggiornata.”, si invalida la cache abbonamenti e si richiama `loadAbbonamenti()`.
- **Cache al mount**
  - Alla mount della pagina Abbonamenti si invalida la cache con prefisso `abbonamenti` così il primo caricamento va sempre a Supabase (niente righe “fantasma” da cache).
- **`src/lib/cache/cache-strategies.ts`**
  - Aggiunto `frequentQueryCache.invalidatePrefix(queryKeyPrefix)` che usa `cacheManager.invalidatePattern()`.

---

## 2. Nuovo pagamento (errore “ON CONFLICT specification”)

### Problema

All’inserimento di un nuovo pagamento l’app riceveva:  
`there is no unique or exclusion constraint matching the ON CONFLICT specification`.

Il trigger **`sync_lesson_counters_on_payment`** su tabella `payments` (migrazione 20250130) faceva:

- `INSERT INTO lesson_counters (athlete_id, lessons_total, lessons_used) ... ON CONFLICT (athlete_id)`
- La tabella `lesson_counters` ha schema `(athlete_id, lesson_type, count)` e **non** ha UNIQUE su `athlete_id`; le colonne `lessons_total`/`lessons_used` non esistono più.

### Soluzione

- **Migrazione `supabase/migrations/20260207_fix_sync_lesson_counters_on_payment.sql`**
  - Aggiunto vincolo **UNIQUE(athlete_id, lesson_type)** su `lesson_counters` (dopo consolidamento eventuali duplicati).
  - Funzione `sync_lesson_counters_on_payment` riscritta: INSERT con `(athlete_id, lesson_type, count)` e `lesson_type = 'standard'`, con **ON CONFLICT (athlete_id, lesson_type)** e aggiornamento di `count` e `updated_at`.

---

## 3. Numero allenamenti nel modale Nuovo pagamento

### Modifica

- **`src/components/dashboard/nuovo-pagamento-modal.tsx`**
  - La select “Allenamenti” (numero lezioni/crediti) offre opzioni da **1 a 600** (prima 1–20).
  - Implementazione: `Array.from({ length: 600 }, (_, i) => ({ value: (i+1).toString(), label: (i+1).toString() }))`.

---

## 4. Upload fattura (RLS Storage)

### Problema

Caricando una fattura nel bucket `documents` con path **`fatture/{athlete_id}/{paymentId}.{ext}`**, l’upload falliva con:  
`new row violates row-level security policy`.

Le policy Storage (migrazione 20260108) per `documents` richiedono che il **primo segmento** del path sia `atleta.user_id`; l’app usa invece il primo segmento **`fatture`**.

### Soluzione

- **Migrazione `supabase/migrations/20260207_storage_documents_fatture_upload.sql`**
  - Aggiunte 4 policy su `storage.objects` per bucket **`documents`** quando **`(storage.foldername(name))[1] = 'fatture'`** e l’utente ha ruolo **admin, pt, trainer o staff**:
    - **INSERT** – caricamento file in `fatture/...`
    - **SELECT** – lettura/scaricamento (e creazione signed URL)
    - **UPDATE** – aggiornamento file (es. upsert)
    - **DELETE** – eliminazione file

---

## 5. Anteprima fattura nel modale (InvoiceViewModal)

### Problema

- In caso di errore da `createSignedUrl` si impostava `signedUrl = url` (path storage), quindi l’iframe aveva `src` non valido e restava vuoto.
- Anche con signed URL corretto, molti browser **non** mostrano PDF cross-origin dentro un iframe; l’utente vedeva solo il link “Apri in nuova scheda”.

### Soluzione

- **`src/app/dashboard/abbonamenti/page.tsx` – componente `InvoiceViewModal`**
  - **Gestione errore**: in caso di errore da `createSignedUrl` o assenza di `data.signedUrl` non si imposta più `signedUrl` con il path; si imposta un messaggio di errore e si mostra l’UI di errore (nessun iframe con path invalido).
  - **UI anteprima**: rimosso l’iframe. Contenuto quando il signed URL è disponibile: breve messaggio (“Apri la fattura in una nuova scheda per visualizzarla”) e pulsante **“Apri fattura”** che apre il PDF in nuova scheda (comportamento affidabile su tutti i browser).

---

## File toccati (riepilogo)

| File                                                                   | Intervento                                                                                                               |
| ---------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| `src/app/dashboard/abbonamenti/page.tsx`                               | Storno: check `updatedRows`; cache invalidate al mount; InvoiceViewModal: gestione errore + solo pulsante “Apri fattura” |
| `src/lib/cache/cache-strategies.ts`                                    | `frequentQueryCache.invalidatePrefix()`                                                                                  |
| `src/components/dashboard/nuovo-pagamento-modal.tsx`                   | Select allenamenti 1–600                                                                                                 |
| `supabase/migrations/20260207_fix_sync_lesson_counters_on_payment.sql` | UNIQUE(athlete_id, lesson_type); trigger `sync_lesson_counters_on_payment` allineato                                     |
| `supabase/migrations/20260207_storage_documents_fatture_upload.sql`    | Policy storage `documents` per path `fatture/*` (INSERT/SELECT/UPDATE/DELETE)                                            |

---

## Migrazioni da applicare su Supabase

Se il progetto viene clonato o il DB resettato, assicurarsi che siano state eseguite (nell’ordine):

1. `20260207_fix_sync_lesson_counters_on_payment.sql`
2. `20260207_storage_documents_fatture_upload.sql`

(Le altre migrazioni 20260207 già presenti – credit_ledger, payments, RPC abbonamenti, ecc. – restano invariate e vanno applicate secondo l’ordine esistente.)

---

_Ultimo aggiornamento: 2026-02-07. Non modificare il comportamento senza aggiornare questo documento._
