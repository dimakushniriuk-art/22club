# Auth / RBAC

- **Mappa codice:** `audit/auth_roles_map_clean.txt` (check `role`, sessioni, admin)
- **Ruoli nominati in API admin:** `admin`, `trainer`, `athlete`, `marketing`, `nutrizionista`, `massaggiatore`
- **Funzionalità sensibili:** impersonation (`api/admin/impersonation/*`), delete user, assign trainer
- **Doc legacy ruoli:** `DOCUMENTAZIONE/CHANGELOG_LEGACY_ROLES_2026-03-01.md`
- **Middleware:** `src/lib/supabase/middleware.ts`
