# Audit: performance letture Supabase e percezione di lentezza

**Ultimo aggiornamento:** 2026-04-11  
**Ambito:** analisi da repository locale + esecuzione script `npm run db:analyze-complete` (con `.env.local` se presente). **Non** sostituisce misure su DB reale con sessione utente (RLS) né `EXPLAIN ANALYZE` in produzione.

---

## 1. Cosa è stato fatto davvero

| Fonte                                  | Cosa produce                                                                                                                                                   |
| -------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Codice (`src/`)                        | Pattern che **aumentano costo** o round-trip (misurabili in teoria).                                                                                           |
| `scripts/analyze-supabase-complete.ts` | Smoke su tabelle/RPC con **anon key** e **nessuna sessione** (utente non loggato): i conteggi righe e alcuni check **non** riflettono il carico reale con JWT. |
| MCP Supabase (`.cursor/mcp.json`)      | In questa sessione **non disponibile** (`mcp server` non esposto all’agente): **nessuna** query SQL interattiva diretta al progetto da qui.                    |

Conclusione metodologica: i **problemi reali di latenza** su dati/foto si confermano solo con:

- DevTools Rete (TTFB vs download),
- Supabase Dashboard → **Query Performance** / logs,
- `EXPLAIN (ANALYZE, BUFFERS)` su query rappresentative **con lo stesso ruolo** dell’utente (RLS attivo).

Questo documento elenca **rischi concreti nel codice** e **come interpretare** l’output dello script, non latenze in ms misurate sul tuo traffico.

---

## 2. Output script `db:analyze-complete` — come leggerlo

Eseguendo lo script con credenziali in `.env.local`:

- **“profiles: 0 righe”** (e simili con anon **senza** `auth.getSession`): è **atteso** con RLS: l’anon non vede righe. **Non** indica DB vuoto.
- **“appointments / workout_logs: possibile problema RLS”**: lo script fa `.select('*').limit(1)` **senza utente**; errori `42501` = permesso negato, **non** necessariamente policy errate o lentezza.
- **Trigger “NON ESISTE”** (`handle_new_user`, `update_updated_at_column`): lo script tenta RPC `pg_get_triggerdef` via client; su Supabase gestito spesso **non è esposta** → **falso negativo** frequente. Verificare in SQL Editor: `SELECT tgname FROM pg_trigger …`.
- **Bucket storage “NON ESISTE”**: verifica tramite **Dashboard → Storage** o API admin; l’elenco via script può fallire per permessi/metodo, non prova che i bucket mancano in produzione.

Quindi: lo script è utile per **allineamento** e **smoke**, non per diagnosticare “query lente” in produzione.

---

## 3. Problemi / rischi reali nel codice (statico)

Questi pattern **aggiungono lavoro** a Postgres o al client indipendentemente dalla rete geografica o dalla dimensione del file su Storage.

### 3.1 `select('*')` + dati non necessari

Molte query selezionano **tutte** le colonne. Per tabelle larghe o JSON allegati aumenta I/O e serializzazione.

**Esempi:**

- `src/hooks/use-progress-photos.ts`: ~~`progress_photos` con `select('*', { count: 'exact' })`~~ **mitigato** (colonne esplicite, senza count sulla lista — §8).
- Hook profilo atleta: `use-athlete-fitness.ts`, `use-athlete-medical.ts`, `use-athlete-ai-data.ts`, … con `.select('*')` sulle rispettive tabelle.
- `src/hooks/workouts/use-workout-session.ts`: `workout_plans`, `workout_days`, … con `*`.
- `src/hooks/chat/use-chat-messages.ts`: `*`.

**Effetto:** più byte per riga, più tempo di parsing in JS. **Fix tipico:** elenco colonne esplicito; evitare colonne pesanti se non servono alla UI.

### 3.2 `count: 'exact'` sulla stessa richiesta dei dati

**File:** `src/hooks/use-progress-photos.ts` — ~~`select('*', { count: 'exact' })` insieme a `range()`~~ **rimosso dalla lista paginata** (§8); restano altri file con `count: 'exact'` da valutare caso per caso.

**Effetto:** Postgres deve contare le righe che matchano i filtri **oltre** a restituire la pagina: costo maggiore rispetto a `planned` / approssimazione o count separato solo quando serve.

**Altri file con count exact** (da valutare caso per caso): `use-communications.ts`, `use-workout-exercise-stats.ts`, `use-athlete-profile-data.ts`, `use-pt-profile.ts`, `use-athlete-stats.ts`, `admin-dashboard-content.tsx`, pagine dashboard nutrizionista/massaggiatore/abbonamenti, `sidebar.tsx`, ecc.

### 3.3 React Query: refetch e stale time

**File:** `src/providers/query-provider.tsx`

- `staleTime: 60_000`, `refetchOnMount: true`, ~~`refetchOnWindowFocus: true`~~ → **`refetchOnWindowFocus: false`** (default globale; §8). Query che devono rifetch al focus possono impostare `refetchOnWindowFocus: true` sulla singola `useQuery`.

**Effetto:** più **richieste legittime** a Supabase quando l’utente cambia tab o torna sulla finestra, anche se i dati erano “abbastanza freschi”. Migliora coerenza, può **peggiorare** la percezione di lentezza se ogni focus rifà query pesanti.

### 3.4 Invalidazioni post-mutazione (recenti)

Dopo salvataggi, il progetto invalida spesso query (`post-mutation-cache`, calendario, pagamenti, ecc.).

**Effetto:** subito dopo un’azione l’utente vede **un refetch**: è corretto per dati freschi, ma somma latenza “azione + rilettura”.

### 3.5 Doppio hop: API Route Next → Supabase (web)

**File:** `src/lib/api-client.ts` — su web `apiGet` / `apiCall` provano prima la route API, poi fallback Supabase su mobile.

**Effetto:** su web, una lettura può passare da **browser → Vercel/server → Supabase** invece che **browser → Supabase** solo. Trade-off sicurezza/latenza.

### 3.6 Cache parallela non-React Query

**File:** `src/hooks/use-progress-photos.ts` — `frequentQueryCache` per pagine già visitate.

**Effetto:** riduce duplicati **solo** per chiavi in cache; al primo accesso o dopo `invalidateProgressPhotosFrequentCache` si paga comunque la query piena (punto 3.1–3.2).

### 3.7 Più letture `progress_photos` da punti diversi

Oltre a `use-progress-photos.ts`, compaiono letture su `progress_photos` in:

- `use-progress.ts`, `use-progress-optimized.ts`, `use-progress-reminders.ts`,
- `src/app/home/foto-risultati/page.tsx`, `aggiungi/page.tsx`.

**Effetto:** rischio di **logica duplicata** o di **non** condividere la stessa cache React Query → più round-trip verso la stessa tabella in flussi diversi.

### 3.8 RLS (database)

Le policy RLS **non** sono analizzate riga per riga in questo documento (serve accesso SQL con ruolo reale). In generale: policy con **subquery correlate** per riga o join complessi su grandi volumi aumentano il tempo CPU lato Postgres.

**Azione:** in Supabase, abilitare **Advisor** / rivedere policy sulle tabelle più lette (`appointments`, `workout_logs`, `profiles`, …) con query plan reali.

---

## 4. Cosa **non** abbiamo dimostrato qui

- Assenza o presenza di **indici** ottimali su `progress_photos(date, athlete_id)`, ecc. (serve `backup_supabase.sql` aggiornato o introspection SQL).
- **Peso reale** delle policy RLS in ms.
- **Cold start** Vercel sulle API route (solo osservazione qualitativa al §3.5).
- **Dimensione effettiva** degli oggetti Storage (escluso per tua richiesta precedente).

---

## 5. Piano di verifica consigliato (operativo)

1. In **Chrome DevTools → Rete**, filtra `supabase.co`: per una richiesta lenta annota **tempo attesa (TTFB)** vs **download**.
2. In **Supabase Dashboard → Reports → Query performance** (o Logs): individua le query più costose per `mean_time` / `calls`.
3. Per una query sospetta, in SQL Editor con contesto che simula l’utente (o `set role` / service documentato da Supabase): `EXPLAIN (ANALYZE, BUFFERS) …`.
4. Allineare **indici** e **select** minimi in una PR dedicata (con SQL migrazione, come da regole progetto).

---

## 6. Priorità suggerite (solo codice, senza DB write)

| Priorità | Intervento                                                                                                        | Motivo                             |
| -------- | ----------------------------------------------------------------------------------------------------------------- | ---------------------------------- |
| Alta     | Ridurre `select('*')` + `count: 'exact'` su `use-progress-photos` (colonne minime; count solo se serve UI totale) | Lista foto è UX sensibile.         |
| Media    | Rivedere `refetchOnWindowFocus` / `staleTime` per query **pesanti** (override per-query, non solo default)        | Meno rifetch involontari.          |
| Media    | Unificare letture `progress_photos` dietro un solo hook/query key dove possibile                                  | Meno duplicazione.                 |
| Bassa    | Audit mirato `apiGet` su percorsi caldi                                                                           | Ridurre hop server dove non serve. |

---

## 7. Riferimenti interni

- Script analisi: `npm run db:analyze-complete` → `scripts/analyze-supabase-complete.ts`
- Altri script DB: `package.json` (`db:analyze-rls`, `db:verify-data-deep`, …)
- Regole progetto (dump schema, SQL manuale): `.cursor/rules/22club-project-rules.mdc`

---

## 8. Interventi applicati in codice (2026-04-11)

- **`progress_photos`:** costante condivisa `PROGRESS_PHOTOS_LIST_COLUMNS` in `src/lib/progress/progress-photos-columns.ts`; usata in `use-progress-photos.ts`, `use-progress.ts` (fetch foto), `home/foto-risultati/aggiungi/page.tsx`.
- **Lista foto paginata:** `use-progress-photos` — rimosso `select('*')` e `count: 'exact'` sulla stessa richiesta; `hasMore` basato su pagina piena / pagina vuota in append; rimosso `totalCount` dal return (nessun consumer lo usava).
- **Fallback stats senza RPC:** `use-progress.ts` e `use-progress-optimized.ts` — conteggio foto con `select('id', { count: 'exact', head: true })` al posto di `limit(1)` + `select('*')` (totale foto corretto nel fallback).
- **React Query:** default `refetchOnWindowFocus: false` in `query-provider.tsx` e `use-cached-query.ts`; `use-progress-analytics` allineato (restano invalidazioni realtime + `refetchOnMount`).
- **Non affrontato qui:** audit mirato `apiGet` percorsi caldi (§6 bassa); indici DB / RLS (richiedono SQL manuale).
