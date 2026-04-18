# Setup MCP (Vercel, GitHub, Supabase)

File coinvolti:

| File                              | Versionato            | Contenuto                                        |
| --------------------------------- | --------------------- | ------------------------------------------------ |
| `.cursor/mcp.json`                | **No** (`.gitignore`) | GitHub MCP via Docker + env; altri server remoti |
| `.cursor/mcp.secrets.env`         | **No**                | Solo tuo PAT GitHub (opzionale, come promemoria) |
| `.cursor/mcp.secrets.env.example` | Sì                    | Modello senza segreti                            |

## 1. GitHub (obbligatorio per lo strumento GitHub MCP)

1. **Docker Desktop avviato** (il demone deve essere attivo: in tray l’icona Docker “running”; altrimenti `docker run` fallisce).
2. Crea un PAT: [Fine-grained](https://github.com/settings/personal-access-tokens/new) o [Classic](https://github.com/settings/tokens/new).
3. **Token in variabile utente Windows** `GITHUB_MCP_PAT` = valore del token (senza `Bearer `). Riavvia Cursor dopo averla impostata.
4. In `mcp.json` il server **github** è configurato in modalità **Docker**: il PAT viene passato come `GITHUB_PERSONAL_ACCESS_TOKEN` tramite il blocco `env` (mappato da `${env:GITHUB_MCP_PAT}`).

**Perché non l’URL remoto `api.githubcopilot.com`:** in Cursor l’interpolazione `${env:…}` negli **header** dei server MCP remoti spesso **non funziona**; il server riceve testo non valido e risponde **400** / errore SSE. Docker + `env` è il workaround allineato alla [guida ufficiale GitHub](https://github.com/github/github-mcp-server/blob/main/docs/installation-guides/install-cursor.md).

**Se dopo il riavvio GitHub MCP è ancora rosso:** nel blocco `env` di `mcp.json` sostituisci temporaneamente `${env:GITHUB_MCP_PAT}` con il PAT in chiaro (file resta locale e ignorato da Git), oppure imposta anche `GITHUB_PERSONAL_ACCESS_TOKEN` a livello utente Windows con lo stesso valore e usa `"${env:GITHUB_PERSONAL_ACCESS_TOKEN}"` nel blocco `env`.

## 2. Vercel

Nessuna riga da compilare nei file. In **Cursor → Settings → Tools & MCP** connetti il server **vercel** e completa il **login nel browser** al primo utilizzo.

## 3. Supabase

Nessun PAT nel file per l’MCP ospitato: al primo utilizzo Cursor apre **OAuth** nel browser; accedi e autorizza l’accesso al progetto.

L’URL in `mcp.json` include già `project_ref` del progetto 22Club e `read_only=true`. Se usi un altro progetto Supabase, aggiorna solo quel parametro nell’URL.

## Verifica

Dopo riavvio Cursor: **Tools & MCP** → punti verdi / strumenti disponibili. Prova in chat una richiesta che usi esplicitamente un tool MCP.
