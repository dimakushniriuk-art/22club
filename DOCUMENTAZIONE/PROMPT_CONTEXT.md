Compila questo file prima di generare il prompt di analisi del progetto.

# 1. Obiettivo dell’analisi

- Fornire a un agente AI tutto il contesto per analizzare lo stato tecnico/funzionale di 22Club, individuare rischi e priorità e proporre interventi mirati senza esplorazioni superflue.

# 2. Tipo di progetto

- Web app gestionale multiruolo per club/allenatori/atleti (Next.js 15 App Router) con aree dashboard e home dedicate ai ruoli.

# 3. Tecnologie usate

- Next.js 15 (App Router) + TypeScript strict, React server/client components.
- Tailwind CSS (dark mode stile Apple), Radix UI.
- Supabase (Postgres prod / SQLite dev) per auth, DB e storage; middleware custom per routing/ruoli.
- DuckDB per analytics/parquet (da stack standard).
- ESLint flat + Prettier (semi=false), Playwright per E2E, GitHub Actions (CI/CD, CodeQL, coverage), deploy su Vercel.

# 4. Ruoli utente e permessi

- admin → redirect a `/dashboard/admin`; pieno accesso amministrativo (gestione globale).
- trainer (pt) → `/dashboard`; gestione allenamenti/appuntamenti/clienti.
- athlete (atleta) → `/home`; fruizione allenamenti/appuntamenti personali.
- Accesso pubblico solo a `/login`, `/reset`, `/`, `/registrati`, `/forgot-password`, `/reset-password`; altre route protette via middleware Supabase.

# 5. Stato attuale del progetto

- Core Next.js/Tailwind/Supabase funzionante; middleware ruoli con cache e redirect attivi.
- E2E: suite smoke/dynamic-routes/navigation-spa/simple verdi; workflow/accessibility/integration/invita-atleta verdi; allenamenti verdi; login suite ancora con fail su alcune combinazioni browser (Chromium/Firefox/Mobile Chrome PT/atleta), skip Safari/WebKit per cookie secure.
- Fix recente su `analytics.ts`/`supabase/server.ts` per uso corretto di `cookies()` con `unstable_cache`; da monitorare `/dashboard/statistiche`.
- Documentazione e checklists ricche; numerosi report Playwright già generati.

# 6. Problemi noti

- Flakiness/fail login (timeout/redirect bloccati su `/login`/`/post-login` per PT/atleta su alcuni browser; cookie secure su HTTP per Safari/WebKit).
- Log Supabase “Invalid Refresh Token”/rate limit in middleware (non bloccanti ma rumore).
- Possibile errore passato su `/dashboard/statistiche` (unstable_cache + cookies) mitigato ma da verificare.

# 7. Aspettative dall’AI

- Operare in autonomia avanzata con patch chirurgiche e rispetto convenzioni; chiedere conferma solo per azioni strutturali/distruttive.
- Essere critica su rischi e debito tecnico; proporre fix mirati e prioritizzati.
- Mantenere italiano; aggiornare memoria `ai_memory/sviluppo.md` automaticamente.

# 8. Limiti e regole

- Non effettuare deploy o push senza richiesta esplicita; non modificare DB prod direttamente.
- Ogni modifica a logica Supabase deve produrre SQL della parte modificata.
- Evitare refactor massivi non necessari; non usare comandi distruttivi (reset hard, force push).
- Seguire design system dark mode, semi-colons off (Prettier), naming coerente.

# 9. Output desiderato

- Analisi strutturata per sezione (stato, rischi, priorità, proposte) con azioni operative brevi, motivazioni tecniche e stima impatto/urgenza.
- Formato markdown sintetico ma completo, facilmente copiabile in prompt.

# 10. Note aggiuntive

- Preferire soluzioni compatibili con Next 15 (App Router, cookies async); mantenere compatibilità Supabase middleware/server.
- Tenere conto dei ruoli (admin/trainer/athlete) nelle policy di accesso e routing.
- Design: dark mode stile Apple, componenti riusabili, token centralizzati.
