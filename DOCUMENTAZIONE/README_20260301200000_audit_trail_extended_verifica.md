# Verifica migration 20260301200000 – Audit trail esteso (Punto 8)

## Standard audit
- **Colonne minime**: id, org_id (text), actor_profile_id, impersonated_profile_id, action, table_name, record_id, old_data (payload_before), new_data (payload_after), created_at. user_id mantenuto per compatibilità.
- **Action ufficiali**: `INSERT`, `UPDATE`, `SOFT_DELETE`, `DELETE_USER`, `CHANGE_TRAINER`, `CHANGE_ROLE`, `IMPERSONATION_ACTION`.
- **PII**: non loggare email/telefono/nome in chiaro nei payload; solo id, role, status, flag, org_id dove utile.

## Oggetti DB

| Tipo | Nome |
|------|------|
| Colonne audit_logs | org_id (text), actor_profile_id, impersonated_profile_id |
| Indici | idx_audit_logs_org_created, idx_audit_logs_table_record, idx_audit_logs_actor |
| Funzioni | get_actor_profile_id_from_jwt(), get_impersonated_profile_id_from_jwt(), audit_write(...) |
| Trigger | payments_audit_trigger_fn (usa audit_write, action INSERT/UPDATE/SOFT_DELETE), athlete_trainer_assignments_audit_trigger (CHANGE_TRAINER), profiles_change_role_audit_trigger (CHANGE_ROLE) |
| RPC | soft_delete_profile aggiornata per usare audit_write con org_id/actor |

## Mapping azioni → dove scattano

| Action | Tabella | Dove |
|--------|---------|------|
| INSERT | payments | Trigger AFTER INSERT su payments |
| UPDATE | payments | Trigger AFTER UPDATE su payments (modifica campi non soft-delete) |
| SOFT_DELETE | payments | Trigger AFTER UPDATE su payments (deleted_at da NULL a NOT NULL) |
| DELETE_USER | profiles | RPC soft_delete_profile |
| CHANGE_TRAINER | athlete_trainer_assignments | Trigger AFTER INSERT/UPDATE (nuovo active o cambio trainer_id/status) |
| CHANGE_ROLE | profiles | Trigger AFTER UPDATE OF role su profiles |
| IMPERSONATION_ACTION | (futuro) | Endpoint/server che setta claim e chiama audit_write |

## Query di verifica

```sql
-- 1) Colonne audit_logs
SELECT column_name, data_type FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'audit_logs'
ORDER BY ordinal_position;

-- 2) Azioni per tabella (dopo aver generato traffico)
SELECT action, table_name, COUNT(*) FROM public.audit_logs
WHERE created_at > now() - interval '7 days'
GROUP BY action, table_name ORDER BY table_name, action;

-- 3) Payments: INSERT/UPDATE/SOFT_DELETE
SELECT id, action, table_name, record_id, org_id, actor_profile_id, created_at
FROM public.audit_logs WHERE table_name = 'payments' ORDER BY created_at DESC LIMIT 5;

-- 4) Profiles: DELETE_USER
SELECT id, action, table_name, record_id, org_id, actor_profile_id, created_at
FROM public.audit_logs WHERE table_name = 'profiles' AND action = 'DELETE_USER' ORDER BY created_at DESC LIMIT 5;

-- 5) athlete_trainer_assignments: CHANGE_TRAINER
SELECT id, action, table_name, record_id, org_id, old_data, new_data, created_at
FROM public.audit_logs WHERE table_name = 'athlete_trainer_assignments' AND action = 'CHANGE_TRAINER' ORDER BY created_at DESC LIMIT 5;

-- 6) profiles: CHANGE_ROLE
SELECT id, action, table_name, record_id, old_data, new_data, created_at
FROM public.audit_logs WHERE table_name = 'profiles' AND action = 'CHANGE_ROLE' ORDER BY created_at DESC LIMIT 5;

-- 7) RLS: solo admin vede audit
-- (eseguire come utente non-admin: SELECT * FROM audit_logs; deve tornare 0 righe o solo proprie se policy diversa)
```

## Checklist test manuali

1. **Payments**: crea/aggiorna/soft-delete pagamento → in audit_logs compaiono INSERT, UPDATE o SOFT_DELETE con table_name='payments', org_id e actor_profile_id valorizzati.
2. **Delete utente**: admin elimina utente → riga con action=DELETE_USER, table_name='profiles', org_id e actor_profile_id valorizzati.
3. **Cambio trainer**: assegna atleta a nuovo trainer o attiva assegnazione → riga con action=CHANGE_TRAINER, table_name='athlete_trainer_assignments'.
4. **Cambio ruolo**: admin cambia role di un profilo → riga con action=CHANGE_ROLE, table_name='profiles', payload before/after con solo role.
5. **RLS**: login come trainer/athlete → SELECT su audit_logs non deve restituire righe (solo admin).

## Rischi / edge cases

- **Log spam**: trigger CHANGE_TRAINER su ogni INSERT con status=active; CHANGE_ROLE solo su modifica effettiva di role. Valutare filtro su UPDATE assignment (es. evitare log se solo deactivated_at cambia e status resta inactive).
- **actor null (service_role)**: audit_write usata da soft_delete_profile passa sempre p_actor_profile_id e p_org_id; da trigger l’actor viene da get_actor_profile_id_from_jwt() → auth.uid() → profile; con service_role auth.uid() può essere null: in quel caso actor_profile_id resta null (accettabile per operazioni batch).
- **GDPR/PII**: payload in audit_write/trigger costruiti senza email/telefono/nome; solo id, role, status, org_id, trainer_id, athlete_id, ecc.
- **Impersonation**: non implementata; get_impersonated_profile_id_from_jwt() e colonna impersonated_profile_id predisposti; qualsiasi endpoint che fa impersonation dovrà settare il claim e chiamare audit_write con action IMPERSONATION_ACTION.
