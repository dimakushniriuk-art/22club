# Piano pubblicazione e risoluzione problemi noti (22Club)

## Analisi (stato attuale)

### 1. `verify:all` — Next.js con status 500

- **Script:** `scripts/verify-all-services.ts` chiama `http://localhost:${PORT}/api/health` (default porta **3001**, allineata a `npm run dev`).
- **Causa probabile:** `GET /api/health` usava `createClient()` da `@/lib/supabase/server` dentro un `try/catch` che rispondeva **HTTP 500** su qualsiasi eccezione (es. variabili env mancanti nel processo dev, errori su `cookies()`, ecc.). Il check “server avviato” veniva quindi confuso con “errore applicativo”.
- **Supabase remoto:** i passi successivi dello script (config + query `profiles`) risultavano OK; **non** era un problema di connettività DB lato script di verifica, ma di semantica del endpoint health.
- **Intervento applicato:** `/api/health` restituisce **sempre 200** se la route risponde; lo stato DB è nel JSON (`database`: `connected` | `error` | `unavailable`).

### 2. Husky — messaggi di deprecazione

- Progetto su **husky ^9**; le righe `#!/usr/bin/env sh` + `. "$(dirname -- "$0")/_/husky.sh"` sono il formato vecchio e generano avvisi verso Husky 10.
- **Intervento:** hook `pre-commit` / `pre-push` senza `husky.sh`; `package.json` → `prepare`: `husky` (non `husky install`).

### 3. `npm audit` (Vercel / locale)

- Segnalazioni di vulnerabilità transitive: **non** risolte automaticamente in questo piano (rischio di breaking change). Azione consigliata: `npm audit` periodico e `npm audit fix` / aggiornamenti mirati quando accettabile.

### 4. Identità Git (committer automatico)

- Avviso locale se user.name / user.email non configurati. **Azione manuale:** `git config --global user.name` / `user.email`.

### 5. Pre-commit lento

- `npm run format` esegue Prettier su **tutto** il repo: previsto con setup attuale. Miglioramento futuro opzionale: **lint-staged** (solo file staged).

---

## Comando “upload” unificato

- **Script:** `scripts/git-upload-deploy.mjs`
- **npm:** `npm run upload -- "messaggio commit"`
- Comportamento:
  1. Se ci sono modifiche (`git status --porcelain`): `git add -A` (solo file effettivamente cambiati, nuovi o eliminati; rispetta `.gitignore`), poi `git commit`.
  2. Se ci sono commit da inviare: `git push` verso il branch corrente sul remote `origin`.
  3. `npx vercel --prod --yes` (deploy produzione).
- Opzioni: `--no-vercel` (solo Git), `--no-push` (solo commit locale).

---

## Checklist post-intervento

- [ ] `npm run verify:all` con dev su porta 3001: Next.js **200** su `/api/health`.
- [ ] `git commit` / `git push` senza warning Husky deprecati (fino a Husky 10).
- [ ] `npm run upload -- "test"` in scenario con modifiche (dopo approvazione utente).
