# Audit Abbonamenti 22Club — AS-IS

**Data audit:** 2025-01-30  
**Scope:** Sezione /dashboard/abbonamenti (pacchetti crediti + ledger + fatture).

---

## 1) Route e file principali

| Path                                                 | Ruolo                                                                                                                             |
| ---------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| `src/app/dashboard/abbonamenti/page.tsx`             | Pagina principale: lista “abbonamenti” (righe = pagamenti), filtri, tabella, modali                                               |
| `src/components/dashboard/nuovo-pagamento-modal.tsx` | Modal “Nuovo Pagamento”: form atleta/data/allenamenti/importo/fattura PDF, insert in `payments` + aggiornamento `lesson_counters` |
| `src/components/shared/dashboard/sidebar.tsx`        | Link “Abbonamenti” → `/dashboard/abbonamenti`                                                                                     |
| `InvoiceViewModal`                                   | Definita inline in `page.tsx`: preview fattura PDF via signed URL (storage `documents`)                                           |

**Altri file correlati (non sotto /abbonamenti):**

- `src/app/dashboard/pagamenti/page.tsx` — Altra route “Pagamenti” (hook `usePayments`, KPI, tabella, storno).
- `src/hooks/use-payments.ts` — Fetch/creazione/storno pagamenti (tabella `payments`).
- `src/hooks/appointments/use-appointments.ts` — Completamento appuntamento → update `appointments.status = 'completato'` + decremento `lesson_counters.count`.
- `src/app/home/allenamenti/oggi/page.tsx` — Completamento workout “con PT” → decremento `lesson_counters`.
- `src/components/home-profile/athlete-subscriptions-tab.tsx` — Tab “abbonamenti” in home/profilo atleta (stessa logica: payments + appointments completati).
- `src/hooks/home-profile/use-athlete-stats.ts` — Calcolo lezioni rimanenti (payments + appointments).
- RPC: `get_abbonamenti_with_stats(p_page, p_page_size)` — Migration `supabase/migrations/20250201_create_abbonamenti_stats_rpc.sql`.

---

## 2) Componenti UI e azioni

| Elemento                          | Azione                                                                                                                                                                     |
| --------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Pulsante “Nuovo Pagamento”        | Apre `NuovoPagamentoModal` (lazy). On success: invalida cache, `loadAbbonamenti()`.                                                                                        |
| Pulsante “Crea primo abbonamento” | Stesso modal (stato vuoto).                                                                                                                                                |
| Tabella colonne                   | Atleta, Data, Allenamenti (acquistati), Usufruiti, Rimasti, Fattura (Visualizza/Scarica/Carica), Pagato (importo), Azioni (Visualizza/Scarica fattura, Elimina pagamento). |
| Filtri                            | Ricerca nome atleta; Lezioni rimanenti (tutte/basse/medie/alte); Importo (tutti/basso/medio/alto); Periodo (tutte/oggi/settimana/mese/anno). “Rimuovi filtri” resetta.     |
| Upload fattura                    | Input file PDF per riga → upload su storage `documents` path `fatture/{athlete_id}/{timestamp}.pdf` → update `payments.invoice_url`.                                       |
| Elimina pagamento                 | Conferma con `ConfirmDialog` → rimozione file da storage (se presente) + `payments` DELETE.                                                                                |
| Paginazione                       | Attiva se totalCount > 100; Prev/Next; RPC usata solo con `enablePagination && role !== 'trainer'`.                                                                        |

---

## 3) Query / Supabase: tabelle e viste usate

| Fonte                                | Uso                                                                                                                                                                                                                                                                                                                                                              |
| ------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Tabella `payments`**               | Lettura (select id, athlete_id, amount, created_at, created_by_staff_id; opz. payment_date, status, invoice_url, lessons_purchased). Filtro per ruolo: trainer = created_by_staff_id, athlete = athlete_id. Insert da NuovoPagamentoModal. Update per invoice_url. Delete da pagina abbonamenti.                                                                 |
| **Tabella `profiles`**               | Nome/cognome atleti (id, nome, cognome) per etichette.                                                                                                                                                                                                                                                                                                           |
| **Tabella `appointments`**           | Conteggio sessioni completate: `status = 'completato'` per athlete_id → “Usufruiti” (aggregato per atleta).                                                                                                                                                                                                                                                      |
| **Tabella `lesson_counters`**        | Colonna `count` (e `lesson_type = 'standard'`): in pagina usata in fallback come fonte “usate” solo se RPC non usata; in RPC la funzione riferisce `lc.lessons_used` (nome colonna da verificare su DB: nello schema export la tabella ha `count`, non `lessons_used`). Acquisto: incremento `count`; completamento appuntamento/workout PT: decremento `count`. |
| **RPC `get_abbonamenti_with_stats`** | Chiamata solo se `enablePagination && role !== 'trainer'`. Restituisce pagine di payments con athlete_name, lessons_purchased, lessons_used, lessons_remaining, amount, invoice_url, status, total_count. La RPC fa JOIN con `lesson_counters` e usa `lc.lessons_used` — possibile disallineamento se in DB la colonna è `count`.                                |
| **Storage `documents`**              | Path `fatture/{athlete_id}/{filename}` per PDF fatture; signed URL per visualizzazione/download.                                                                                                                                                                                                                                                                 |

Nessuna tabella/vista dedicata: `invoices`, `package_templates`, `athlete_packages`, `credit_ledger` non risultano dal codice.

---

## 4) Modello dati attuale (campi principali)

- **payments:** id, athlete_id, amount, lessons_purchased, created_by_staff_id, created_at, payment_date, status, invoice_url, payment_method, method_text, is_reversal, ref_payment_id, notes, org_id, currency, updated_at.  
  Vincoli: athlete_id NOT NULL, amount NOT NULL, lessons_purchased (usato come “crediti” del singolo acquisto).
- **lesson_counters:** id, athlete_id, lesson_type ('standard'), count.  
  Semantica: `count` = crediti rimanenti (incrementato all’acquisto, decrementato a sessione completata). Non c’è storico per singolo pagamento.
- **appointments:** athlete_id, status ('completato' = sessione fatta con PT). Usato per conteggio “Usufruiti” (totale per atleta).
- **profiles:** id (coincide con athlete_id), nome, cognome.

Calcoli in UI:

- **Allenamenti** = `lessons_purchased` della riga (singolo pagamento).
- **Usufruiti / Rimasti** = aggregati per atleta: somma di tutti i `lessons_purchased` per athlete_id − conteggio `appointments` con status `completato` (fallback lato client); in RPC: totale acquistato − `lc.lessons_used` (o equivalente da verificare).
- **Pagato** = `amount`. **Fattura** = `invoice_url` (link a PDF in storage). **Stato** = `status` (es. completed).

---

## 5) Cosa manca rispetto al modello “PACCHETTI CREDITI + LEDGER + FATTURE”

- **Package templates:** Nessun concetto di “tipo pacchetto” (nome, numero crediti, prezzo). Ogni riga è un pagamento libero (athlete + amount + lessons_purchased).
- **Athlete packages (acquisti):** Non c’è entità “pacchetto acquistato” distinta dal pagamento; un pagamento = una riga in lista e contribuisce al totale crediti.
- **Credit ledger:** Nessun movimento per singola sessione (quale “pacchetto” o pagamento ha scalato il credito). Lo “scalo” è solo: 1) completamento appuntamento → decremento `lesson_counters.count`; 2) acquisto → incremento `lesson_counters.count`. Non c’è traccia payment_id ↔ appointment_id.
- **Fatture (entità):** Nessuna tabella `invoices` (numero, data, id pagamento, stato, file). Solo `payments.invoice_url` (URL storage) e path fisso `fatture/{athlete_id}/...`.
- **Stato pagato/non pagato:** C’è `payments.status` ma non un flusso “fattura → pagato” separato; filtri “pagato/non pagato” non sono esposti in UI in abbonamenti (solo in filtri generici).
- **Lista movimenti (ledger):** Non esiste vista “movimenti” (acquisti + scalate con data, tipo, riferimento).

---

## 6) Rischi / bug probabili

- **RPC `get_abbonamenti_with_stats`:** Usa `lc.lessons_used` su `lesson_counters`; negli export e nel codice TypeScript la tabella ha `count` (crediti rimanenti), non `lessons_used`. Su DB reale se la colonna è solo `count`, la RPC può fallire o restituire NULL. Da verificare con SQL.
- **Doppio scalo:** Scalata in due punti: 1) completamento appuntamento (`use-appointments.ts`), 2) completamento workout “con PT” (`home/allenamenti/oggi`). Se un appuntamento è anche registrato come workout con PT, il credito potrebbe essere scalato due volte (appointment + workout).
- **Scalo per payment:** Non si sa da quale “pagamento” viene scalato il credito (FIFO, LIFO, ecc.); `lesson_counters` è un solo numero per atleta.
- **Storico:** Eliminando un pagamento si perdono invoice_url e collegamento; non c’è storico movimenti per audit.
- **Trainer:** Con `role === 'trainer'` la RPC non viene usata; sempre fallback client (payments + profiles + appointments + lesson_counters). Coerenza dati uguale ma performance diversa.
- **method_text / invoice_url nei types:** `src/types/supabase.ts` non include `invoice_url` in `payments` Row; usato nel codice. Possibile disallineamento types/DB.

---

_Fine report AS-IS. Fase C: vedi blocco SQL READ-ONLY sotto._
