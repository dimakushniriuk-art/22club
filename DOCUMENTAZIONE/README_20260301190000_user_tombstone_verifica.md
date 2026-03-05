# Verifica migration 20260301190000 – User tombstone (DELETE utente non distruttivo)

## Obiettivo
- **auth.users**: eliminato (reale) così l’utente non può più loggarsi.
- **public.profiles**: NON eliminato; marcato con `is_deleted`, `deleted_at`, `deleted_by_profile_id` (tombstone).
- **profile_tombstones**: snapshot minimo (display_name, email_hash, role_at_time, org_id, …).
- Storico e FK restano intatti; audit obbligatorio (action `DELETE_USER`, table_name `profiles`).

## Oggetti DB toccati

| Tipo | Nome |
|------|------|
| Colonne profiles | `is_deleted`, `deleted_at`, `deleted_by_profile_id` |
| Tabella | `profile_tombstones` (profile_id PK, display_name, email_hash, role_at_time, org_id, deleted_at, deleted_by_profile_id, reason, created_at) |
| Indici | `idx_profiles_is_deleted`, `idx_profiles_org_id_is_deleted`, `idx_profile_tombstones_org_id`, `idx_profile_tombstones_deleted_at` |
| Funzione | `soft_delete_profile(p_profile_id, p_actor_profile_id, p_reason)` |
| Policy profiles | SELECT/UPDATE aggiornate con filtro `(is_deleted = false OR is_admin())`; "Admin can view all profiles including deleted" |
| Policy profile_tombstones | Solo admin può fare SELECT |

## Query di verifica (dopo la migration)

```sql
-- 1) Colonne tombstone su profiles
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'profiles'
  AND column_name IN ('is_deleted', 'deleted_at', 'deleted_by_profile_id');

-- 2) Conteggio is_deleted
SELECT is_deleted, COUNT(*) FROM public.profiles GROUP BY is_deleted;

-- 3) Tombstones
SELECT COUNT(*) FROM public.profile_tombstones;
SELECT profile_id, display_name, role_at_time, org_id, deleted_at FROM public.profile_tombstones ORDER BY deleted_at DESC LIMIT 5;

-- 4) Audit DELETE_USER
SELECT id, action, table_name, record_id, created_at
FROM public.audit_logs
WHERE table_name = 'profiles' AND action = 'DELETE_USER'
ORDER BY created_at DESC LIMIT 5;

-- 5) Dopo soft delete di un profilo test: profilo marcato + tombstone + audit
-- (eseguire soft_delete_profile su un profilo poi)
-- SELECT * FROM profiles WHERE id = '<profile_id>';  -> is_deleted true, deleted_at not null
-- SELECT * FROM profile_tombstones WHERE profile_id = '<profile_id>';
-- SELECT * FROM audit_logs WHERE table_name = 'profiles' AND action = 'DELETE_USER' AND record_id = '<profile_id>';
```

## Checklist test manuali

1. **Admin avvia “Elimina utente”**  
   Dashboard admin → Elimina utente (profile id). Atteso: profilo con `is_deleted = true`, riga in `profile_tombstones`, riga in `audit_logs` (action `DELETE_USER`), auth.users eliminato (utente non può più loggarsi).

2. **Trainer list athletes esclude deleted**  
   Login trainer → Lista clienti/atleti. Atteso: non compaiono profili con `is_deleted = true`.

3. **Admin vede anche deleted**  
   Login admin → Lista utenti (se esiste “Includi eliminati”). Atteso: profili con `is_deleted = true` visibili (es. con badge “Eliminato”).

4. **Utente deleted non può autenticarsi**  
   Dopo delete: tentativo login con le credenziali di quell’utente. Atteso: auth fallisce (auth.users eliminato).

5. **FK e storico intatti**  
   Dopo delete: verificare che pagamenti, appuntamenti, workout, ecc. collegati al `profile_id` restino presenti (nessun CASCADE che elimina il profilo).

## Rischi / edge cases

- **Ripristino utente**: non previsto da questa migration; richiederebbe ricreare auth.users e impostare `is_deleted = false` (e opzionalmente cleared `deleted_at`/`deleted_by_profile_id`) con flusso dedicato.
- **Conflitti email**: se si ricrea un utente con stessa email dopo delete, auth e profilo sono indipendenti; il tombstone conserva `email_hash` per riferimento.
- **GDPR/PII**: PII lasciate in `profiles` (strategia A); in `profile_tombstones` solo `display_name` e `email_hash` (no email in chiaro). Payload audit limitato (no PII).
- **Altre policy SELECT su profiles**: eventuali policy aggiunte in altre migration (es. “Athletes can view their staff profiles for chat”, “Marketing and admin can view org profiles”) andrebbero aggiornate con `(is_deleted = false OR public.is_admin())` se devono nascondere i deleted ai non-admin.
