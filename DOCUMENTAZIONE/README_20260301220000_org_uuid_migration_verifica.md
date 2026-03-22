# Verifica org_id UUID migration (multi-tenant)

## Obiettivo

- `organizations`: tabella con id (uuid), slug (es. 'default-org'), name.
- Tutte le colonne `org_id` TEXT migrate a UUID; colonna legacy rinominata in `org_id_text` (non drop).
- `get_org_id_for_current_user()` ritorna uuid; `audit_write` e RLS usano uuid.
- `audit_logs.org_id` valorizzato (anche per default org).

## Query verifica

```sql
-- 1) Organizations
SELECT * FROM public.organizations ORDER BY created_at DESC;

-- 2) Tutte le colonne org_id (tipo deve essere uuid tranne audit_logs che era già uuid)
SELECT table_schema, table_name, column_name, data_type, is_nullable
FROM information_schema.columns
WHERE column_name = 'org_id'
  AND table_schema = 'public'
ORDER BY table_name;

-- 3) Colonne legacy org_id_text (devono esistere dove abbiamo migrato)
SELECT table_schema, table_name, column_name, data_type
FROM information_schema.columns
WHERE column_name = 'org_id_text'
  AND table_schema = 'public'
ORDER BY table_name;

-- 4) Record con org_id NULL (nelle tabelle tenant-scoped dovrebbe essere 0)
SELECT 'profiles' AS tbl, COUNT(*) AS nulls FROM public.profiles WHERE org_id IS NULL
UNION ALL SELECT 'payments', COUNT(*) FROM public.payments WHERE org_id IS NULL
UNION ALL SELECT 'athlete_trainer_assignments', COUNT(*) FROM public.athlete_trainer_assignments WHERE org_id IS NULL
UNION ALL SELECT 'profile_tombstones', COUNT(*) FROM public.profile_tombstones WHERE org_id IS NULL;

-- 5) Audit: org_id non null dopo fix (impersonation / payments)
SELECT id, action, org_id, table_name, created_at
FROM public.audit_logs
WHERE action ILIKE '%IMPERSON%' OR table_name = 'payments'
ORDER BY created_at DESC
LIMIT 20;

-- 6) get_org_id_for_current_user() ritorna uuid
SELECT pg_get_function_result(oid) FROM pg_proc WHERE proname = 'get_org_id_for_current_user';
```

## Checklist manuale

1. **Login** admin / trainer / athlete / marketing: ok.
2. **Impersonation** start/stop: audit con `org_id` non null.
3. **Payments** insert/update/soft_delete: audit con `org_id` non null.
4. **Marketing** pagine: filtro per org corretto (uuid).
5. **Trainer** vede solo atleti della propria org (RLS uuid = uuid).
6. **Default org**: `organizations.slug = 'default-org'` ha un id uuid; profili/payments con ex 'default-org' ora hanno quel uuid.

## Tabelle migrate + tipo finale org_id

| Tabella                       | org_id (dopo) | org_id_text (legacy) |
| ----------------------------- | ------------- | -------------------- |
| profiles                      | uuid NOT NULL | sì                   |
| payments                      | uuid NOT NULL | sì                   |
| documents                     | uuid NOT NULL | sì                   |
| appointments                  | uuid NOT NULL | sì                   |
| exercises                     | uuid NOT NULL | sì                   |
| workouts                      | uuid NOT NULL | sì (se esiste)       |
| marketing_leads               | uuid NOT NULL | sì                   |
| marketing_lead_notes          | uuid NOT NULL | sì                   |
| marketing_campaigns           | uuid NOT NULL | sì                   |
| marketing_events              | uuid NOT NULL | sì                   |
| marketing_segments            | uuid NOT NULL | sì                   |
| marketing_automations         | uuid NOT NULL | sì                   |
| marketing_lead_status_history | uuid NOT NULL | sì                   |
| athlete_marketing_kpis        | uuid NOT NULL | sì                   |
| athlete_trainer_assignments   | uuid NOT NULL | sì                   |
| profile_tombstones            | uuid NOT NULL | sì                   |
| audit_logs                    | uuid (già)    | no                   |

## Funzioni aggiornate

- `get_org_id_for_current_user()` → ritorna `uuid`
- `resolve_org_text_to_uuid(text)` → nuovo helper backfill
- `audit_write(...)` → legge `org_id` uuid da profiles
- `start_impersonation` / `stop_impersonation` → confronto e audit con uuid
- `soft_delete_profile` → tombstone e audit con org_id uuid
- `payments_set_created_by_profile` / `payments_audit_trigger_fn` → org_id uuid
- `athlete_trainer_assignments_audit_fn` / `profiles_change_role_audit_fn` → org_id uuid
- `marketing_segments_set_org_id` / `marketing_campaigns_set_org_id` / `marketing_automations_set_org_id` → set uuid
- `refresh_athlete_marketing_kpis(p_org_id uuid, ...)` → parametro uuid
- `marketing_list_athletes` → `v_org_id uuid`

## Policies

Le policy che usano `org_id = get_org_id_for_current_user()` non richiedono modifica: entrambi i lati sono uuid dopo la migration.

## Rischi / edge cases

- **Tabelle mancanti**: il DO block salta tabelle inesistenti (workouts, documents, appointments, exercises potrebbero non esistere in tutti gli ambienti).
- **NULL dopo backfill**: se `resolve_org_text_to_uuid` o default org mancasse, resterebbero NULL → `ALTER COLUMN SET NOT NULL` fallirebbe; in quel caso verificare default org e eventuali slug anomali.
- **App che inviano 'default-org'**: dopo la migration gli INSERT devono passare l’uuid della default org (es. da `organizations` o RPC). Aggiornare almeno `register/complete-profile` e qualsiasi altro punto che imposta `org_id` a stringa.

## Cleanup legacy (step successivo)

- In un secondo momento: `ALTER TABLE ... DROP COLUMN org_id_text` per ogni tabella migrata, dopo deploy e verifica.
- Rimuovere `resolve_org_text_to_uuid` se non più usato.
