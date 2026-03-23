# Patch candidate Auth/RBAC (max 5) — non applicate

Ordine per impatto / rischio. Solo raccomandazioni.

1. **`POST /api/athletes/create`** — Aggiungere verifica esplicita ruolo (`admin`, `trainer`, eventualmente altri staff) prima di qualsiasi `createAdminClient` / creazione auth user.

2. **`POST /api/auth/context`** — Rimuovere o restringere l’aggiornamento di `role`/`org_id` da header client; oppure consentire solo sync da valori già verificati server-side / solo admin.

3. **Allineamento `getUser` vs `getSession`** sulle API ad alto impatto (admin, impersonation, delete user, assign trainer): preferire `getUser()` dove serve parità con middleware.

4. **`/api/debug-trainer-visibility`** — Oltre al gate dev: richiedere ruolo `trainer` (o rimuovere endpoint in favore di tool interno).

5. **Matcher middleware opzionale** — Valutare inclusione selettiva di prefissi API critici _oppure_ documentare che **tutte** le API sensibili devono autonomamente enforceare ruolo (checklist in review) — evitare doppio redirect su API pubbliche (`forgot-password`).
