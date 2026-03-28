# Inventario DB — lezioni PT (training)

Fonte: `backup_supabase.sql` (dump schema `public`).

## Decisione prodotto (allineamento)

**Opzione A — `credit_ledger` come fonte per “lezioni usate” (training)**  
L’app calcola `totalUsed` per `service_type = 'training'` dalla somma dei DEBIT sul ledger (`qty` negativi).  
`lesson_counters` resta utile per diagnostica/legacy ma non governa più il numero mostrato in UI per il PT.

## Flusso debiti (training)

1. **Calendario**: trigger `appointments_debit_on_completed` su `appointments` (AFTER UPDATE quando `status = completato`) inserisce una riga `credit_ledger` DEBIT se non esiste già per `appointment_id`.
2. **App atleta**: insert DEBIT via API/service role (`coached-app:wl:*` su `reason`), dedup con appuntamenti sovrapposti (logica app).
3. **App trainer/staff**: `addDebitFromAppointment` può tentare insert; l’indice unico `credit_ledger_unique_appointment_debit` evita duplicati se il trigger DB ha già inserito.

## `lesson_counters`

- Aggiornamento su **INSERT `payments`** con `lessons_purchased > 0`: trigger `trigger_sync_lesson_counters_on_payment` → `sync_lesson_counters_on_payment` (mappa `service_type` → `lesson_type` `training`/`nutrition`/`massage`).
- Funzioni `apply_credit_ledger_to_counter` e `sync_lesson_counter_from_ledger` **esistono** ma **non risultano collegate** a trigger su `credit_ledger` nel dump: i DEBIT nel ledger **non** decrementano automaticamente `lesson_counters.count`. Da qui la necessità di non basare la UI PT sul solo contatore.

## Bug RPC corretto in migration

`get_abbonamenti_with_stats` filtrava `lesson_counters` con `lesson_type = 'standard'` mentre i trigger scrivono **`training`** per il PT. La RPC restituiva `lessons_used` / `lessons_remaining` errati. Vedi migration `20260329103000_fix_get_abbonamenti_lesson_counters_training.sql`.

## Vincoli utili (`credit_ledger`)

- `credit_ledger_unique_appointment_debit`: un DEBIT per `appointment_id`.
- `credit_ledger_unique_payment_credit` / `_reversal`: idempotenza pagamenti.

## Predisposizione futura — aggiustamenti admin

Movimenti correttivi: prevedere in futuro `entry_type` dedicato o `reason` prefissato + policy INSERT solo admin; non implementato in questa iterazione.
