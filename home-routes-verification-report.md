# Report verifica route `/home` e sottopagine

**Data:** 2026-04-10  
**Ambiente:** Next.js dev (`npm run dev`), `http://localhost:3001`  
**Metodo:** HTTP `HEAD` senza cookie di sessione (utente non autenticato) + `tsc --noEmit` + `eslint .`

---

## Sintesi

| Area                              | Esito                                                                                                         |
| --------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| Route documentate (25 `page.tsx`) | Tutte rispondono **HTTP 307** → `/login?...&reason=auth_required` (comportamento atteso per sessione assente) |
| TypeScript                        | **OK** (`npm run typecheck`)                                                                                  |
| ESLint                            | **OK** (`npm run lint`)                                                                                       |
| Login dopo redirect               | **HTTP 200** su `/login?redirectedFrom=/home&reason=auth_required`                                            |

**Non verificato in questo report:** comportamento con **sessione atleta autenticata** (caricamento dati Supabase, RLS, stati errore UI, 404 lato app per ID inesistenti). Per quello servono login di test o E2E con credenziali.

---

## Dettaglio HTTP (senza autenticazione)

Per ogni path: prima risposta, **senza seguire redirect** (`curl -I --max-redirs 0`).

UUID di esempio per segmenti dinamici: `00000000-0000-4000-8000-000000000001`.

| Path                                                                                                 | Status                 | Location (primo redirect)                                                                                 |
| ---------------------------------------------------------------------------------------------------- | ---------------------- | --------------------------------------------------------------------------------------------------------- |
| `/home`                                                                                              | 307 Temporary Redirect | `/login?redirectedFrom=%2Fhome&reason=auth_required`                                                      |
| `/home/allenamenti`                                                                                  | 307                    | `/login?redirectedFrom=%2Fhome%2Fallenamenti&reason=auth_required`                                        |
| `/home/allenamenti/oggi`                                                                             | 307                    | `/login?redirectedFrom=%2Fhome%2Fallenamenti%2Foggi&reason=auth_required`                                 |
| `/home/allenamenti/00000000-0000-4000-8000-000000000001`                                             | 307                    | `/login?redirectedFrom=%2Fhome%2Fallenamenti%2F00000000-0000-4000-8000-000000000001&reason=auth_required` |
| `/home/allenamenti/00000000-0000-4000-8000-000000000001/giorno/00000000-0000-4000-8000-000000000001` | 307                    | (stesso schema, URL codificato)                                                                           |
| `/home/allenamenti/esercizio/00000000-0000-4000-8000-000000000001`                                   | 307                    | …                                                                                                         |
| `/home/allenamenti/riepilogo`                                                                        | 307                    | …                                                                                                         |
| `/home/appuntamenti`                                                                                 | 307                    | …                                                                                                         |
| `/home/chat`                                                                                         | 307                    | …                                                                                                         |
| `/home/documenti`                                                                                    | 307                    | …                                                                                                         |
| `/home/foto-risultati`                                                                               | 307                    | …                                                                                                         |
| `/home/foto-risultati/aggiungi`                                                                      | 307                    | …                                                                                                         |
| `/home/massaggiatore`                                                                                | 307                    | …                                                                                                         |
| `/home/nutrizionista`                                                                                | 307                    | …                                                                                                         |
| `/home/pagamenti`                                                                                    | 307                    | …                                                                                                         |
| `/home/profilo`                                                                                      | 307                    | …                                                                                                         |
| `/home/progressi`                                                                                    | 307                    | …                                                                                                         |
| `/home/progressi/allenamenti`                                                                        | 307                    | …                                                                                                         |
| `/home/progressi/allenamenti/00000000-0000-4000-8000-000000000001`                                   | 307                    | …                                                                                                         |
| `/home/progressi/foto`                                                                               | 307                    | …                                                                                                         |
| `/home/progressi/misurazioni`                                                                        | 307                    | …                                                                                                         |
| `/home/progressi/misurazioni/peso`                                                                   | 307                    | …                                                                                                         |
| `/home/progressi/nuovo`                                                                              | 307                    | …                                                                                                         |
| `/home/progressi/storico`                                                                            | 307                    | …                                                                                                         |
| `/home/trainer`                                                                                      | 307                    | …                                                                                                         |

---

## Test aggiuntivo: path inesistente sotto `/home`

| Path               | Status                 | Osservazione                          |
| ------------------ | ---------------------- | ------------------------------------- |
| `/home/non-esiste` | 307 Temporary Redirect | Stesso redirect al login, **non** 404 |

Con sessione assente, il middleware tratta il prefisso `/home` come protetto: anche URL non mappati da `page.tsx` finiscono al login invece che a una 404 Next. Con utente **autenticato**, Next può comunque servire `not-found` se la route non esiste (da verificare a parte).

---

## Controllo statico codice

- `npm run typecheck` — completato senza errori.
- `npm run lint` — completato senza errori.

---

## Note da codice (complementari)

- Layout `/home`: `ErrorBoundary` sui figli; nessun `error.tsx` / `not-found.tsx` dedicato sotto `src/app/home`.
- Hub `/home`: se profilo non valido, rendering minimale finché il layout non completa redirect/loading.
- `/home/pagamenti`: pagina presente; dalla griglia principale in `home/page.tsx` non c’è link diretto (scopribilità).
- `src/app/home/nutrizionista/page.tsx`: TODO su hook statistiche quando disponibile.

---

## Come ripetere la verifica

Avviare `npm run dev` (porta **3001** da `package.json`), poi:

```text
curl.exe -sI --max-redirs 0 "http://localhost:3001/home/..."
```

Per report **con sessione atleta**: ripetere con cookie Supabase validi o E2E Playwright dopo login.
