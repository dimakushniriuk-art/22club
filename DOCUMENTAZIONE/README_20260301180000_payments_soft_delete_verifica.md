# Verifica migration 20260301180000 + 20260301180100 – Payments soft delete + audit

**Fix 20260301180100**: audit con `table_name = 'payments'`; trigger solo AFTER INSERT OR UPDATE (no DELETE); action `soft_delete` quando `OLD.deleted_at IS NULL AND NEW.deleted_at IS NOT NULL`. Rimozione di `audit_payments_trigger` (generico) per evitare doppia scrittura in audit_logs.

## Oggetti DB toccati

| Tipo       | Nome |
|-----------|------|
| Colonne   | `payments.created_by_profile_id`, `payments.payment_type`, `payments.deleted_at`, `payments.deleted_by_profile_id` |
| Constraint| `payments_payment_type_check` (trainer \| marketing) |
| Indici    | `idx_payments_org_id`, `idx_payments_deleted_at`, `idx_payments_created_by_profile_id`, `idx_payments_org_athlete_deleted` |
| Funzioni  | `payments_set_created_by_profile()`, `payments_audit_trigger_fn()`, `soft_delete_payments_for_profile(uuid, uuid)` |
| Trigger   | `payments_set_created_by_trigger` (BEFORE INSERT), `payments_audit_trigger` (AFTER INSERT OR UPDATE; no DELETE) |
| Policy RLS| `payments_select`, `payments_insert`, `payments_update`; rimosse le 4 policy precedenti su payments |

## Query di verifica (eseguire dopo la migration)

```sql
-- 1) Colonne presenti
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'payments'
  AND column_name IN ('created_by_profile_id', 'payment_type', 'deleted_at', 'deleted_by_profile_id');

-- 2) Policy attive
SELECT policyname, cmd, qual IS NOT NULL AS has_using, with_check IS NOT NULL AS has_with_check
FROM pg_policies WHERE tablename = 'payments';

-- 3) Nessuna policy DELETE per authenticated (DELETE fisico negato)
SELECT COUNT(*) FROM pg_policies WHERE tablename = 'payments' AND cmd = 'DELETE';
-- Atteso: 0

-- 4) Trigger (solo payments_audit_trigger per audit; audit_payments_trigger deve essere assente)
SELECT tgname, tgenabled FROM pg_trigger WHERE tgrelid = 'public.payments'::regclass ORDER BY tgname;

-- 5) RPC soft delete
SELECT proname, proargnames FROM pg_proc WHERE proname = 'soft_delete_payments_for_profile';

-- 6) Audit consistency: table_name = 'payments', solo INSERT/UPDATE/soft_delete (no DELETE in flusso normale)
SELECT action, table_name, COUNT(*) FROM audit_logs WHERE table_name = 'payments' GROUP BY action, table_name;

-- 7) Soft delete produce action='soft_delete'; update normale produce action='UPDATE'
--    (nessun action='DELETE' atteso per flusso app)
SELECT id, action, table_name, record_id, created_at
FROM audit_logs WHERE table_name = 'payments' ORDER BY created_at DESC LIMIT 10;
```

## Checklist test manuali

1. **Trainer inserisce pagamento per atleta assegnato**  
   Login trainer → Dashboard pagamenti → Nuovo pagamento per atleta in `athlete_trainer_assignments` (status active). Atteso: inserimento OK; in `audit_logs` una riga con `table_name = 'payments'`, `action = 'INSERT'`.

2. **Trainer tenta pagamento per atleta non assegnato**  
   Stesso flusso per atleta non in `athlete_trainer_assignments` (o non active). Atteso: INSERT negato (RLS).

3. **Athlete vede solo i propri pagamenti**  
   Login atleta → Home pagamenti / documenti. Atteso: solo righe con `athlete_id = profile.id` e `deleted_at IS NULL`.

4. **Marketing SELECT payments**  
   Login marketing → nessuna chiamata diretta a `payments` dall’UI. Se si prova da client (es. Supabase client): SELECT da payments con ruolo marketing. Atteso: 0 righe (RLS) o errore/empty.

5. **Soft delete**  
   - Da app: eliminazione utente (admin) o atleta (trainer/admin) → i pagamenti collegati devono essere aggiornati con `deleted_at` e `deleted_by_profile_id`, non rimossi.  
   - Verifica DB: `SELECT id, deleted_at, deleted_by_profile_id FROM payments WHERE deleted_at IS NOT NULL LIMIT 5;` dopo una “eliminazione” utente/atleta.

6. **Admin vede anche eliminati**  
   Login admin → lista pagamenti. Con `includeDeleted: true` (se esposto in UI) o query diretta senza filtro `deleted_at`: atteso vedere anche righe con `deleted_at` non null. La policy SELECT consente `(deleted_at IS NULL OR public.is_admin())`.

7. **Audit**  
   Dopo insert/update/soft-delete di un payment:  
   `SELECT id, action, table_name, record_id, created_at FROM audit_logs WHERE table_name = 'payments' ORDER BY created_at DESC LIMIT 5;`  
   Atteso: righe con `table_name = 'payments'` e `action` IN ('INSERT', 'UPDATE', 'SOFT_DELETE') (standard 20260301200000). Nessun `action = 'DELETE'` nel flusso normale.

## Rischi / edge cases

- **created_by_profile_id NOT NULL**: se il backfill lascia righe con `created_by_profile_id` NULL (es. nessun admin, nessun `created_by_staff_id`), la migration non imposta NOT NULL; le righe esistenti restano con NULL. Nuovi INSERT hanno il trigger che imposta il valore.
- **Chiamate con service_role**: la RPC `soft_delete_payments_for_profile` richiede `p_actor_profile_id` quando chiamata da backend con service role (auth.uid() null), altrimenti `deleted_by_profile_id` può essere NULL.
- **Trigger org_id**: se esiste un trigger “org_id guard” su `payments`, resta attivo; il trigger `payments_set_created_by_profile` imposta anche `org_id` se NULL/vuoto; verificare che non ci siano conflitti.
- **Marketing**: nessun endpoint app deve esporre pagamenti al ruolo marketing; la RLS già nega le righe.
