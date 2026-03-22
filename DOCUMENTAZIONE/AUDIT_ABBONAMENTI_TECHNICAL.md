# Audit tecnico: /dashboard/abbonamenti (22Club)

**Data audit:** 2025-01-30  
**Pagina:** `http://localhost:3001/dashboard/abbonamenti`  
**Vincolo:** Abbonamenti = crediti lezioni PT; DB: payments, lesson_counters (trigger), credit_ledger; scalata idempotente e tracciabile.

---

## 1) AS-IS Summary

La pagina mostra una tabella di abbonamenti (un record per pagamento) con colonne: Atleta, Data, Allenamenti (lessons_purchased), Usufruiti, Rimasti, Fattura, Pagato, Azioni. I dati arrivano da **RPC `get_abbonamenti_with_stats`** (solo se paginazione attiva e ruolo ≠ trainer) oppure da **fallback** con query dirette su `payments`, `profiles`, `appointments`, `lesson_counters`. Nel fallback **Usufruiti/Rimasti sono calcolati da conteggio `appointments` con status completato** e **lesson_counters viene caricato ma non usato**; per il trainer il filtro usa `user_id` (auth) invece di `profiles.id` su `created_by_staff_id`, quindi il trainer in fallback non vede pagamenti. Filtri (ricerca, lezioni, importo, periodo) sono **tutti client-side** su `abbonamenti` già caricati. Paginazione si attiva per `totalCount > 100`; cache usa chiave con role/userId ma **invalidate** usa chiave senza, quindi dopo storno/nuovo pagamento/upload fattura la cache non viene svuotata e si possono vedere dati stale.

---

## 2) Azione utente → Query/Mutazione → Tabelle → Effetto UI

| Azione utente                                   | Query / Mutazione                                                                                                                                                                                                                                  | Tabelle coinvolte                                                                      | Effetto UI                                                          |
| ----------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- | ------------------------------------------------------------------- |
| Apertura pagina                                 | `loadAbbonamenti()`: cache get → se miss, RPC `get_abbonamenti_with_stats(p_page, p_page_size)` **oppure** (fallback) `payments` select, poi `payments` (extended), `profiles`, `appointments` (status=completato), `lesson_counters` in parallelo | payments, profiles, appointments, lesson_counters (RPC: anche lesson_counters in JOIN) | Tabella popolata, loading → contenuto                               |
| Cambio filtro (ricerca/lezioni/importo/periodo) | Nessuna query; `useMemo` su `abbonamenti`                                                                                                                                                                                                          | -                                                                                      | `filteredAbbonamenti` aggiornato, tabella filtrata                  |
| Cambio pagina                                   | `setCurrentPage(page)` → `useEffect` richiama `loadAbbonamenti()`                                                                                                                                                                                  | Come apertura (RPC o fallback)                                                         | Nuova pagina di risultati                                           |
| Nuovo pagamento (modal)                         | `payments` insert → `credit_ledger` insert (CREDIT) via `addCreditFromPayment`; `onSuccess`: invalidate cache + `loadAbbonamenti()`                                                                                                                | payments, credit_ledger                                                                | Modal chiusa, lista refresh (cache invalidation inefficace, v. bug) |
| Carica fattura PDF                              | Storage `documents` upload → `createSignedUrl` o `getPublicUrl` → `payments` update `invoice_url`; invalidate cache + `loadAbbonamenti()`                                                                                                          | storage (documents), payments                                                          | Toast successo, lista refresh                                       |
| Storna pagamento                                | `payments` update `status='cancelled'` → `credit_ledger` insert (REVERSAL) via `addReversalFromPayment`; invalidate cache + `loadAbbonamenti()`                                                                                                    | payments, credit_ledger                                                                | Dialog chiuso, toast, lista refresh                                 |
| Apri anteprima fattura                          | Storage `createSignedUrl(path, 3600)` (se URL non già signed)                                                                                                                                                                                      | storage (documents)                                                                    | Modal iframe con PDF                                                |
| Download fattura                                | Storage `createSignedUrl` → `window.open(signedUrl)`                                                                                                                                                                                               | storage (documents)                                                                    | Nuova scheda con PDF                                                |

---

## 3) BUG / Rischi (priorità)

### P0 – Critici

| #   | Descrizione                                                                                                                                                                                                                                                                                                | File e riga                  | Impatto                                                                                                                | Fix suggerito                                                                                                                                                                                                                                      |
| --- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------- | ---------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | **Fallback trainer:** filtro payments usa `userId` (auth.users.id) invece di profilo staff (`user.id` = profiles.id). `created_by_staff_id` in payments è profiles.id.                                                                                                                                     | `page.tsx` ~339–340          | Trainer in fallback vede **0 pagamenti** (solo admin/athlete vedono dati).                                             | Usare `user?.id` (profiles.id) per trainer: `paymentsQuery.eq('created_by_staff_id', user?.id)`.                                                                                                                                                   |
| 1b  | **Fallback athlete:** filtro usa `userId` (auth) per `athlete_id`; in payments `athlete_id` è profiles.id.                                                                                                                                                                                                 | `page.tsx` ~341–342          | Athlete in fallback potrebbe vedere 0 pagamenti se RLS non allinea auth a profile.                                     | Usare `user?.id` (profiles.id) per athlete: `paymentsQuery.eq('athlete_id', user?.id)`.                                                                                                                                                            |
| 2   | **Fallback Usufruiti/Rimasti:** calcolo basato su **conteggio `appointments` con status completato**; `lesson_counters` viene caricato (Query 4) ma **non usato**. Coerenza con architettura ledger: Rimasti deve venire da `lesson_counters.count`, Usufruiti da (totale acquistato − count) o da ledger. | `page.tsx` ~424–434, 438–474 | Dati “Usufruiti” e “Rimasti” in fallback **non allineati** a lesson_counters/ledger; possibile doppia fonte di verità. | Nel fallback: usare `countersResult` per costruire `lessonsRemainingMap` (athlete_id → count); `lessons_used` = totale acquistato per atleta − count (o da ledger se disponibile). Rimuovere uso di `completedAppointmentsMap` per used/remaining. |

### P1 – Importanti

| #   | Descrizione                                                                                                                                                                                                                                                                            | File e riga                                                                     | Impatto                                                                                                                                                                    | Fix suggerito                                                                                                                                                                                                                  |
| --- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 3   | **Cache invalidate:** chiave di get/set è `abbonamenti:${currentPage}:${enablePagination}:${role}:${userId}`; `invalidate` usa `abbonamenti:${currentPage}:${enablePagination}` (senza role/userId). La cache è per-strategia con prefisso; la entry salvata non viene mai cancellata. | `page.tsx` ~235–237, ~572, ~711, ~1260                                          | Dopo storno, nuovo pagamento o upload fattura l’utente può continuare a vedere **lista vecchia** fino a scadenza TTL (5 min) o cambio pagina/filtro che forza nuovo fetch. | Invalidare con la **stessa chiave** usata per get/set, oppure usare `invalidatePattern('abbonamenti:', 'frequent-query')` (se l’API cache supporta pattern) o costruire tutte le chiavi possibili (role/userId) e invalidarle. |
| 4   | **RPC `get_abbonamenti_with_stats` (schema export):** in `athlete_stats` usa `lc.lessons_used` e `lc.lessons_remaining`; la tabella `lesson_counters` ha solo `count`. Se la funzione in DB non è stata aggiornata, la RPC fallisce o restituisce colonne inesistenti.                 | SQL schema (es. `schema-with-data.sql`): get_abbonamenti_with_stats, ~1732–1735 | RPC errata o non allineata a schema; paginazione (admin/non-trainer) può dare errore o dati sbagliati.                                                                     | Verificare in DB: RPC deve usare `lc.count` come “rimanenti” e derivare “usati” come (totale acquistato − lc.count). Correggere la funzione se ancora usa colonne inesistenti.                                                 |

### P2 – Minori / Miglioramenti

| #   | Descrizione                                                                                                                                          | File e riga                   | Impatto                                                                                           | Fix suggerito                                                                                                                                                                                  |
| --- | ---------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------- | ------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 5   | Fallback **non filtra** `is_reversal` né `status = 'cancelled'`. La RPC esclude `is_reversal = FALSE`.                                               | `page.tsx` ~334–343           | Pagamenti stornati/cancellati o reversal potrebbero apparire in fallback.                         | Aggiungere `.eq('is_reversal', false)` e, se desiderato, `.neq('status', 'cancelled')` (o equivalente) nella query payments del fallback.                                                      |
| 6   | **invoice_url** salvato con signed URL (o public URL). I signed URL scadono (es. 1h); dopo scadenza il link in DB è rotto.                           | `page.tsx` ~547–554, ~559–561 | Dopo 1h l’anteprima/download fattura può fallire.                                                 | Salvare in DB il **path** (es. `documents/fatture/{athlete_id}/{timestamp}.pdf`); generare signed URL **on demand** in anteprima/download (come già parzialmente fatto estraendo path da URL). |
| 7   | Upload fattura: `invoice_url` aggiornato con signed URL (1h). Overwrite: `upsert: false` → ogni upload crea nuovo file; nessuna pulizia vecchi file. | `page.tsx` ~530, ~532–536     | Più file per stesso pagamento; storage cresce; possibile confusione su “quale” fattura è attuale. | Valutare path stabile per payment (es. `fatture/{athlete_id}/{payment_id}.pdf`) con upsert, oppure policy di sostituzione e cleanup.                                                           |

---

## 4) TO-BE Suggestions

### Quick wins (≤ 1h)

- **Trainer fallback:** usare `user?.id` invece di `userId` nel filtro `created_by_staff_id` (page.tsx ~340).
- **Cache:** invalidare con la chiave completa (stessa di get/set) dopo storno, nuovo pagamento, upload fattura (page.tsx ~572, ~711, ~1260).
- **Fallback:** escludere reversal e opzionalmente cancelled: `.eq('is_reversal', false)` (e filtro status se richiesto) nella query payments (~334).

### Medium (1–4h)

- **Fallback Usufruiti/Rimasti:** usare `lesson_counters.count` dal risultato già caricato; calcolare `lessons_remaining` = count, `lessons_used` = somma(lessons_purchased) per atleta − count; rimuovere la logica basata su `appointments` per used/remaining (page.tsx ~424–474).
- **Verifica/aggiornamento RPC:** controllare in DB che `get_abbonamenti_with_stats` usi `lesson_counters.count` e non colonne inesistenti; correggere e deployare.
- **Invoice:** salvare in `payments.invoice_url` il path (o un identificatore stabile) e generare signed URL solo in anteprima/download (page.tsx + eventuale helper).

### Larger refactor (≥ 1 giorno)

- Estrarre data-fetching abbonamenti in un hook (`useAbbonamenti`) con cache key univoca e invalidazione centralizzata; allineare RPC e fallback alla stessa semantica (lesson_counters = Rimasti, no doppia fonte).
- Policy RLS su `payments`: documentare e testare che trainer veda solo i propri (created_by_staff_id = profile id), admin tutto, athlete solo i propri; verificare storage signed URL con RLS bucket.
- Unificare un solo flusso dati (solo RPC o solo query con lesson_counters) e rimuovere la doppia logica fallback/RPC per evitare drift.

---

## 5) Piano refactor (max 5 file)

1. **`src/app/dashboard/abbonamenti/page.tsx`**
   - Fix trainer: `user?.id` per created_by_staff_id.
   - Fix cache: invalidate con cacheKey completo (o helper che invalida tutte le chiavi abbonamenti per il contesto).
   - Fallback: filtrare is_reversal (e status cancelled se richiesto).
   - Fallback: usare countersResult per lessons_remaining/lessons_used; rimuovere calcolo da appointments per used/remaining.

2. **`src/lib/cache/cache-strategies.ts`** (o wrapper usato dalla pagina)
   - Aggiungere `invalidatePattern` / `invalidateByPrefix` per `frequent-query` in modo che la pagina possa invalidare tutte le chiavi `abbonamenti:*` senza dover conoscere role/userId (opzionale se si preferisce invalidare con chiave piena nella page).

3. **SQL/DB: funzione `get_abbonamenti_with_stats`**
   - Verificare e correggere: JOIN con `lesson_counters` usando `lc.count`; `lessons_remaining` = COALESCE(lc.count, 0) o simile; `lessons_used` = totale_acquistato − lessons_remaining; escludere is_reversal (e eventualmente status cancelled) se non già fatto.

4. **`src/app/dashboard/abbonamenti/page.tsx` (upload fattura)**
   - Salvare path invece di signed URL in `invoice_url`; in `handleDownloadInvoice` e in `InvoiceViewModal` continuare a derivare path da URL o da campo path e generare signed URL on demand (eventuale piccolo helper in `src/lib/` per path ↔ signed URL).

5. **Nessun quinto file obbligatorio;** opzionale: `src/hooks/use-abbonamenti.ts` per estrarre loadAbbonamenti, cache e filtro trainer/role in un unico punto e usarlo dalla page (riduce duplicazione e rischio di incoerenza).

---

## A) Mappa file e dipendenze

| Path                                                 | Ruolo                  | Parti critiche                                                                                                                                                                               |
| ---------------------------------------------------- | ---------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/app/dashboard/abbonamenti/page.tsx`             | Pagina principale      | `loadAbbonamenti` (RPC vs fallback), cache key, filtro trainer `userId`, calcolo used/remaining da appointments, `handleStornoConfirm`, `handleInvoiceUpload`, `filteredAbbonamenti` useMemo |
| `src/components/dashboard/nuovo-pagamento-modal.tsx` | Modal nuovo pagamento  | Insert payments, `addCreditFromPayment` (credit_ledger), nessun update lesson_counters (OK)                                                                                                  |
| `InvoiceViewModal` (inline in page)                  | Anteprima fattura      | `createSignedUrl` su storage; gestione URL public vs signed                                                                                                                                  |
| `src/components/shared/ui/confirm-dialog.tsx`        | Dialog conferma storno | Solo UI; onConfirm = `handleStornoConfirm`                                                                                                                                                   |
| `src/lib/credits/ledger.ts`                          | Ledger crediti         | `addCreditFromPayment`, `addDebitFromAppointment`, `addReversalFromPayment`; nessuna scrittura su lesson_counters (OK)                                                                       |
| `src/lib/cache/cache-strategies.ts`                  | Cache                  | `frequentQueryCache.get/set/invalidate`; buildKey con strategia; invalidate non by-prefix                                                                                                    |
| `src/hooks/use-auth.ts` → `providers/auth-provider`  | Auth                   | `user.id` (profiles.id), `user.user_id` (auth); usato per role e userId                                                                                                                      |
| `src/lib/supabase/types.ts`                          | Tipi DB                | `payments`, `lesson_counters`, `credit_ledger`                                                                                                                                               |

---

## B) Data flow (sintesi)

- **Apertura:** cache get (chiave con currentPage, enablePagination, role, userId) → se miss o con paginazione: RPC (se paginazione e non trainer) altrimenti fallback (payments + extended + profiles + appointments + lesson_counters). Fallback: calcolo used/remaining da appointments; counters non usati.
- **Filtri:** nessuna query; filtro client-side su `abbonamenti` → `filteredAbbonamenti`.
- **Pagina:** setCurrentPage → useEffect → loadAbbonamenti (stessa logica).
- **Nuovo pagamento:** insert payments → addCreditFromPayment → onSuccess invalidate (chiave corta) + loadAbbonamenti.
- **Upload fattura:** storage upload → signed/public URL → update payments.invoice_url → invalidate (chiave corta) + loadAbbonamenti.
- **Storno:** update payments status → addReversalFromPayment → invalidate (chiave corta) + loadAbbonamenti.
- **Loading/error:** setLoading(true) all’inizio loadAbbonamenti; setError su catch; empty da filteredAbbonamenti.length === 0.

---

## C) Business logic (definizioni e coerenza)

- **Allenamenti (per riga):** `lessons_purchased` del pagamento (da payments / RPC). OK.
- **Usufruiti:**
  - **RPC:** da RPC (schema export usa `lc.lessons_used` – da verificare se in DB è sostituito con derivazione da count).
  - **Fallback:** attualmente = conteggio `appointments` con status completato per athlete_id. **Non** allineato a ledger/lesson_counters.
- **Rimasti:**
  - **RPC:** da RPC (schema export usa `lc.lessons_remaining` – idem, verificare che in DB sia da lc.count).
  - **Fallback:** attualmente = totale acquistato − conteggio appointments completato. **Dovrebbe** essere `lesson_counters.count`; i dati lesson_counters sono caricati ma non usati.
- **Pagato:** `amount` da payments. OK.
- **Fattura:** `invoice_url` (path o URL); anteprima/download via signed URL generato da path/URL.

Coerenza con architettura ledger: **Rimasti** deve derivare da `lesson_counters.count` (aggiornato da trigger/ledger). **Usufruiti** da (totale acquistato − count) o da somma DEBIT nel ledger. Il fallback oggi non rispetta questa regola; la RPC va verificata in DB.

---

## D) Sicurezza / RLS

- **Trainer:** in fallback il filtro è su `created_by_staff_id`; valore usato è `userId` (auth) invece di profile id → **bug** (nessun risultato). Con fix (user.id), trainer vedrebbe solo i propri pagamenti se RLS su payments restringe per created_by_staff_id = profile id.
- **Admin:** fallback senza filtro role (solo trainer/athlete hanno filtro) → vedrebbe tutti i payments; coerente con “admin vede tutto” se RLS lo consente.
- **Athlete:** filtro `athlete_id = userId`; in questo caso `userId` è user_id (auth); payments.athlete_id è profiles.id dell’atleta. Stesso bug: athlete_id in DB è profiles.id, non auth. Quindi anche per athlete andrebbe usato `user?.id` (profiles.id) per coerenza con schema.
- **RPC:** `SECURITY DEFINER` → esegue con diritti owner; può bypassare RLS. La RPC deve quindi applicare internamente i filtri per ruolo (trainer/athlete/admin) se si vuole isolamento dati; altrimenti un trainer potrebbe vedere tutti i pagamenti quando usa RPC. Oggi la RPC **non** viene usata per trainer (solo `enablePagination && role !== 'trainer'`).
- **Storage:** signed URL e upload su bucket `documents`; RLS bucket va verificata (chi può read/write su quali path).

---

## E) UX / Edge cases

- **invoice_url nullo:** tabella mostra “Nessuna fattura” e pulsante Carica; gestito.
- **Upload fattura:** path `fatture/{athlete_id}/{Date.now()}.{ext}`; naming univoco; overwrite disabilitato → più file per stesso pagamento; signed URL salvato in DB → scade (v. P2).
- **Pagamento pending vs completed:** status mostrato dalla RPC/fallback; non c’è distinzione visiva forte in tabella (es. badge “Stornato” per status cancelled è implicito dal pulsante Storna disabilitato).
- **is_reversal:** RPC esclude; fallback no → possibili righe “reversal” in fallback (P2).
- **Più pagamenti per atleta:** ogni riga = un pagamento; Usufruiti/Rimasti in fallback sono **per atleta** (aggregati da totalPurchasedMap/lessonsUsedMap), quindi tutte le righe dello stesso atleta mostrano gli stessi valori. Coerente con “crediti per atleta”; RPC restituisce per riga pagamento, da verificare se RPC aggrega per atleta o per payment.
- **Performance:** fallback fa 4 query in parallelo (payments extended, profiles, appointments, counters); nessun N+1 evidente; ricerca filtro è su array in memoria (useMemo); nessun debounce sulla ricerca (accettabile per client-side su dataset già caricato).

---

_Fine audit. Nessuna modifica al codice applicata; solo analisi e proposte._
