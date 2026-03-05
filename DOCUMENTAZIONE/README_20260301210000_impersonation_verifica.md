# Verifica Impersonation (Punto 9)

## Oggetti DB

- **RPC**: `public.start_impersonation(p_target_profile_id uuid, p_actor_profile_id uuid, p_reason text)`
  - Valida admin, stessa org, target non admin; scrive `IMPERSONATE_START` con `impersonated_profile_id` = target; ritorna `{ok, target_profile_id, target_role, target_user_id, target_org_id}`.
- **RPC**: `public.stop_impersonation(p_actor_profile_id uuid, p_impersonated_profile_id uuid DEFAULT NULL)` (20260301211000)
  - Valida admin; scrive `IMPERSONATE_STOP` con `impersonated_profile_id` passato (da cookie); ritorna `{ok}`.

## Cookie

- Solo `impersonate_profile_id` (uuid target). Ruolo effettivo letto dal DB in auth context.
- Middleware: non usa ruolo da cookie per redirect/access; solo clear cookie se actor non admin.

## Query verifica audit (start e stop con impersonated_profile_id)

```sql
-- START: actor_profile_id = admin, impersonated_profile_id = target
SELECT id, action, table_name, record_id, actor_profile_id, impersonated_profile_id, org_id, created_at
FROM public.audit_logs
WHERE action = 'IMPERSONATE_START'
ORDER BY created_at DESC
LIMIT 10;

-- STOP: actor_profile_id = admin, impersonated_profile_id = target (stesso valore del cookie)
SELECT id, action, table_name, record_id, actor_profile_id, impersonated_profile_id, org_id, created_at
FROM public.audit_logs
WHERE action = 'IMPERSONATE_STOP'
ORDER BY created_at DESC
LIMIT 10;

-- Entrambi con impersonated_profile_id valorizzato (START sempre, STOP se cookie presente)
SELECT action, actor_profile_id, impersonated_profile_id, record_id, created_at
FROM public.audit_logs
WHERE action IN ('IMPERSONATE_START', 'IMPERSONATE_STOP')
ORDER BY created_at DESC
LIMIT 20;
```

## Checklist test manuale (aggiornata)

1. **Admin start impersonation (re-auth obbligatoria)**
   - Login admin → Utenti → "Impersona" su utente non-admin.
   - Senza password: atteso 400 "Password admin obbligatoria".
   - Con password errata: atteso 401 "Password admin non valida".
   - Con motivo (opzionale) + password admin corretta → "Impersona".
   - Atteso: cookie solo `impersonate_profile_id`; redirect gestito da client/modal in base al ruolo target; banner visibile; ruolo effettivo da DB in auth context.

2. **Admin stop**
   - Con impersonation attiva → "Stop impersonation".
   - Atteso: cookie rimosso; redirect a `/dashboard/admin`; audit `IMPERSONATE_STOP` con `impersonated_profile_id` = target (da cookie).

3. **Non-admin con cookie**
   - Cookie `impersonate_profile_id` presente ma utente non admin → middleware clear cookie; nessun effetto impersonation.

4. **Target inesistente o is_deleted**
   - Cookie con profile_id cancellato o soft-deleted: GET /api/auth/context restituisce `isImpersonating: false` e setta Set-Cookie per clear; UI usa contesto actor.

5. **Audit**
   - `IMPERSONATE_START`: `actor_profile_id` = admin, `impersonated_profile_id` = target (uuid).
   - `IMPERSONATE_STOP`: `actor_profile_id` = admin, `impersonated_profile_id` = target (stesso uuid da cookie).

## File modificati/creati

- `supabase/migrations/20260301210000_impersonation_rpc.sql` — RPC start/stop
- `src/app/api/admin/impersonation/start/route.ts` — POST start, cookie httpOnly
- `src/app/api/admin/impersonation/stop/route.ts` — POST stop, clear cookie
- `src/middleware.ts` — cookie impersonation, effective role, header x-impersonating
- `src/app/api/auth/context/route.ts` — GET con actorProfile, effectiveProfile, isImpersonating
- `src/providers/auth-provider.tsx` — stato impersonation, applyAuthContext
- `src/types/user.ts` — AuthContext con actorProfile, effectiveProfile, isImpersonating
- `src/components/dashboard/admin/user-impersonate-modal.tsx` — modal Impersona
- `src/components/shared/impersonation-banner.tsx` — banner + Stop
- `src/components/dashboard/admin/admin-users-content.tsx` — voce menu "Impersona"
- `src/app/dashboard/layout.tsx` — ImpersonationBanner
- `src/app/home/_components/home-layout-auth.tsx` — ImpersonationBanner
