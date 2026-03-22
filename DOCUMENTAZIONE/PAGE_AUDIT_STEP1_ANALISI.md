# 📋 STEP 1 — ANALISI PROFONDA PAGINA DASHBOARD

**Data**: 2025-01-27  
**Pagina**: `/dashboard` (`src/app/dashboard/page.tsx`)  
**Metodo**: Analisi codice sorgente (TypeScript/React/Next.js)

---

## 🗺️ MAPPA COMPONENTI E LAYOUT

### Struttura Pagina

```
DashboardPage (Server Component)
├── Quick Actions Section
│   ├── Nuovo Cliente (Link → /dashboard/clienti?new=true)
│   ├── Nuovo Appuntamento (NewAppointmentButton → Modal/Calendario)
│   ├── Nuova Scheda (Link → /dashboard/schede/nuova)
│   ├── Messaggi (Link → /dashboard/chat)
│   └── Statistiche (Link → /dashboard/statistiche)
│
└── Agenda Timeline Section
    └── AgendaClient (Client Component)
        └── AgendaTimeline
            ├── Header con statistiche (Totali, Completati, In corso, Programm., Cancellati)
            ├── Events List (rendering condizionale)
            │   ├── Empty State (se events.length === 0)
            │   └── Event Cards (se events.length > 0)
            │       ├── Time Display
            │       ├── Avatar Atleta
            │       ├── Info Atleta + Tipo
            │       └── Action Buttons (Visualizza Profilo, Schede, Modifica, Elimina)
            └── RescheduleAppointmentModal
```

### Layout Generale

- **Container**: `flex flex-col h-full space-y-6 px-6 py-6 overflow-y-auto`
- **Sections**: 2 sezioni principali (Quick Actions + Agenda)
- **Responsive**: Grid responsive (`grid-cols-2 sm:grid-cols-3 lg:grid-cols-5`)

---

## 🔍 ANALISI COMPONENTI DETTAGLIATA

### 1. Quick Actions Section

**Componenti**:

- 5 bottoni di azione rapida
- Stile: gradient backgrounds, hover effects, scale animations
- Tutti usano `Link` di Next.js (client-side navigation)

**Problemi individuati**:

- ❌ **MED**: I bottoni non hanno `aria-label` descrittivi (solo testo visibile)
- ❌ **LOW**: Hover effects potrebbero essere troppo invasivi per utenti sensibili
- ⚠️ **INFO**: `NewAppointmentButton` ha fallback a navigazione se modal non disponibile

### 2. Agenda Timeline

**Query Server-Side**:

```typescript
// Query per appuntamenti oggi del staff corrente
SELECT
  id, starts_at, ends_at, type, status, athlete_id,
  athlete:profiles!athlete_id(avatar, avatar_url, nome, cognome)
FROM appointments
WHERE staff_id = profileData.id
  AND starts_at >= todayStart
  AND starts_at < todayEnd
  AND cancelled_at IS NULL
ORDER BY starts_at ASC
```

**Filtri applicati lato codice**:

- Esclude `status === 'completato' || 'completed'`
- Esclude `status === 'cancelled' || 'annullato'`
- Esclude appuntamenti passati > 1 ora (tranne se in corso)

**Problemi individuati**:

- ⚠️ **HIGH**: Logica filtro duplicata (DB + codice) → rischio inconsistenze
- ❌ **MED**: Nessun limite alla query (potrebbe caricare 100+ appuntamenti)
- ❌ **MED**: Gestione errori silenziosa (solo logger, agendaData rimane vuoto)

---

## ♿ ANALISI ACCESSIBILITÀ (A11y)

### Problemi Critici

1. **BLOCKER**: Alert nativi (`alert()`, `confirm()`) in `AgendaClient`
   - File: `src/app/dashboard/_components/agenda-client.tsx:89, 99, 120, 134`
   - Impatto: Blocca interazione, non screen-reader friendly
   - Fix: Sostituire con modali accessibili (Dialog component)

2. **HIGH**: Bottoni senza `aria-label` sufficienti
   - File: `src/components/dashboard/agenda-timeline.tsx`
   - Solo alcuni bottoni hanno `aria-label` (linee 501, 514, 531, ecc.)
   - Fix: Aggiungere `aria-label` a tutti i bottoni icon-only

3. **MED**: Contraste colori su stati temporali
   - File: `src/components/dashboard/agenda-timeline.tsx:173-184`
   - Colori: `text-red-400`, `text-orange-400`, `text-yellow-400`, `text-blue-400`
   - Fix: Verificare contrast ratio WCAG AA (4.5:1 per testo normale)

4. **MED**: Stati vuoti senza `aria-live` region
   - File: `src/components/dashboard/agenda-timeline.tsx:292-345`
   - Fix: Aggiungere `role="status" aria-live="polite"` all'empty state

5. **LOW**: Focus management nei bottoni di azione
   - I bottoni in `flex-shrink-0` potrebbero avere problemi di tab order
   - Fix: Verificare `tabindex` e ordine logico

### Punti Positivi

✅ Uso di `Button` component con varianti semantiche  
✅ Avatar con `alt` text via `fallbackText`  
✅ Heading hierarchy (`h2`, `h3`) corretta

---

## 🔍 ANALISI SEO BASE

### Problemi

- ❌ **LOW**: Nessun `<title>` specifico (usa default Next.js)
- ❌ **LOW**: Nessuna `<meta>` description per dashboard
- ❌ **INFO**: Pagina server-side (OK per SEO, ma non pubblica)

**Note**: Dashboard è area privata autenticata, SEO non critica.

---

## ⚡ ANALISI PERFORMANCE

### Problemi Critici

1. **HIGH**: Fetch esterno in Server Component (agent log)

   ```typescript
   fetch('http://127.0.0.1:7242/ingest/...', { method: 'POST', ... })
   ```

   - File: `src/app/dashboard/page.tsx:57-71, 283-315`
   - Problema: Richiesta sincrona che può bloccare render se endpoint non disponibile
   - Impatto: Aumenta TTFB (Time To First Byte)
   - Fix: Spostare in client-side o usare `fire-and-forget` con timeout

2. **MED**: Serializzazione `agendaData` verificata ma non necessaria
   - File: `src/app/dashboard/page.tsx:273-315`
   - Problema: Doppio `JSON.stringify()` (verifica + fetch)
   - Impatto: Overhead CPU minimo ma non necessario
   - Fix: Rimuovere log debug o spostare in client

3. **MED**: Query senza paginazione
   - File: `src/app/dashboard/page.tsx:109-126`
   - Problema: Se ci sono 100+ appuntamenti oggi, carica tutto
   - Impatto: Latenza query, memory usage
   - Fix: Aggiungere `.limit(50)` o paginazione

4. **MED**: Nessun caching per query ripetute
   - Problema: Ogni refresh esegue query completa
   - Impatto: Load DB anche se dati invariati
   - Fix: Usare Next.js cache o React Query

5. **LOW**: Animazioni CSS multiple potenzialmente pesanti
   - File: `src/components/dashboard/agenda-timeline.tsx:419-423`
   - Problema: `animationDelay` per ogni evento può creare jank
   - Fix: Usare `will-change` o `transform` per GPU acceleration

### Performance Positivi

✅ Server Component per data fetching (riduce bundle client)  
✅ Lazy loading modali (`Suspense`)  
✅ `useMemo` per statistiche (linee 188-197, 199-234)

---

## 🔒 ANALISI SICUREZZA

### Problemi Critici

1. **BLOCKER**: RLS Policy troppo permissiva

   ```sql
   -- File: supabase/migrations/20250110_034_calendar_complete.sql:574-585
   CREATE POLICY "Users can view appointments"
     ON appointments FOR SELECT
     TO authenticated
     USING (true);  -- ❌ Tutti gli authenticated vedono TUTTI gli appuntamenti

   CREATE POLICY "Users can manage appointments"
     ON appointments FOR ALL
     TO authenticated
     USING (true)   -- ❌ Tutti possono modificare/eliminare qualsiasi appuntamento
     WITH CHECK (true);
   ```

   - Impatto: Nessun isolamento dati tra organizzazioni/staff
   - Rischio: Violazione privacy, accesso non autorizzato
   - Fix: Aggiungere filtri `org_id` e `staff_id` nelle policy

2. **HIGH**: Client-side delete senza conferma sicura
   - File: `src/app/dashboard/_components/agenda-client.tsx:82-101`
   - Problema: `confirm()` può essere bypasseato, nessuna validazione server-side prima
   - Rischio: Eliminazione accidentale o maliziosa
   - Fix: Conferma server-side o soft-delete con `cancelled_at`

3. **MED**: Nessuna validazione `staff_id` nella query
   - File: `src/app/dashboard/page.tsx:94-98`
   - Problema: Se `profile` è null, query non viene eseguita (silent fail)
   - Rischio: Nessun feedback all'utente se profilo mancante
   - Fix: Gestione errori esplicita

4. **MED**: Logging esterno senza sanitizzazione
   - File: `src/app/dashboard/page.tsx:283-315`
   - Problema: `agendaData` può contenere dati sensibili (nomi, ID)
   - Rischio: Leak dati via endpoint logging esterno
   - Fix: Rimuovere o sanitizzare dati sensibili

5. **LOW**: Nessun rate limiting sulle query
   - Problema: Query può essere chiamata infinite volte
   - Rischio: DoS sul database
   - Fix: Implementare rate limiting middleware

### XSS Surface

✅ Nessun `dangerouslySetInnerHTML`  
✅ Dati sanitizzati via Supabase client  
⚠️ **ATTENZIONE**: `event.athlete` viene renderizzato direttamente (ma è da DB, quindi OK se DB sicuro)

---

## 🎨 ANALISI UX

### Problemi

1. **HIGH**: Empty state poco informativo
   - File: `src/components/dashboard/agenda-timeline.tsx:292-345`
   - Problema: Solo testo, nessun suggerimento o CTA alternativo
   - Fix: Aggiungere link "Visualizza calendario completo" o "Crea primo appuntamento"

2. **MED**: Stati loading non differenziati
   - File: `src/app/dashboard/page.tsx:372`
   - Problema: `SkeletonCard` generico, non specifico per agenda
   - Fix: Skeleton customizzato per struttura agenda

3. **MED**: Feedback errori mancante
   - File: `src/app/dashboard/page.tsx:268-270`
   - Problema: Errore loggato ma utente non vede nulla
   - Fix: Toast/notification per errori critici

4. **MED**: Bottoni azione nascosti/condizionali
   - File: `src/components/dashboard/agenda-timeline.tsx:522-588`
   - Problema: Bottoni compaiono/scompaiono in base a stato (confusione)
   - Fix: Tooltip o label più chiari, o raggruppare in dropdown

5. **LOW**: Animazioni potenzialmente distraenti
   - File: `src/components/dashboard/agenda-timeline.tsx:419-423`
   - Problema: `fadeInUp` per ogni evento può essere troppo
   - Fix: Ridurre delay o animare solo scroll viewport

### Punti Positivi

✅ Design coerente con gradient e colori  
✅ Feedback visivo chiaro per stati temporali  
✅ Empty state con CTA primario

---

## 📊 DATA-FLOW IPOTIZZATO

### Flow Server-Side

```
1. DashboardPage (Server Component) render
2. createClient() → Supabase server client
3. supabase.auth.getUser() → Verifica autenticazione
4. Query profiles per ottenere staff_id corrente
5. Query appointments filtrati per:
   - staff_id = current_staff_id
   - starts_at >= today 00:00
   - starts_at < tomorrow 00:00
   - cancelled_at IS NULL
6. Transform results → AgendaEvent[]
7. Passa agendaData come prop a AgendaClient (client component)
```

### Flow Client-Side

```
1. AgendaClient riceve initialEvents
2. useState(initialEvents) → Local state
3. AgendaTimeline renderizza events
4. User interactions:
   - Delete → supabase.from('appointments').delete().eq('id', eventId)
   - Complete → supabase.from('appointments').update({status: 'completed'})
   - View Profile → router.push(`/dashboard/clienti/${athleteId}`)
   - Edit → router.push(`/dashboard/appuntamenti?edit=${eventId}`)
```

### Tabelle Coinvolte

- `appointments` (tabella principale)
  - Colonne usate: `id`, `starts_at`, `ends_at`, `type`, `status`, `athlete_id`, `staff_id`, `cancelled_at`
- `profiles` (FK e join per nome/avatar)
  - Colonne usate: `id`, `avatar`, `avatar_url`, `nome`, `cognome`

### Endpoint API Coinvolti

- ❌ Nessun endpoint API custom utilizzato (solo Supabase client diretto)
- ⚠️ **POSSIBILE MIGLIORAMENTO**: Endpoint API per operazioni complesse (es. bulk delete)

---

## 🐛 PROBLEMI IDENTIFICATI - RIEPILOGO

### BLOCKER (Critici - Risolvere immediatamente)

1. **RLS Policy permissiva**: Tutti gli utenti vedono tutti gli appuntamenti
   - Gravità: BLOCKER
   - Impatto: Violazione privacy, sicurezza
   - Evidenza: `supabase/migrations/20250110_034_calendar_complete.sql:574-585`
   - Causa: Policy senza filtri `org_id`/`staff_id`
   - Fix: Policy con filtri specifici (vedi STEP 2)

2. **Alert nativi non accessibili**: `alert()`, `confirm()` in client component
   - Gravità: BLOCKER (accessibilità)
   - Impatto: UX pessima, non screen-reader friendly
   - Evidenza: `src/app/dashboard/_components/agenda-client.tsx:89, 99, 120, 134`
   - Causa: Usato per conferme rapide
   - Fix: Dialog component accessibile (shadcn/ui Dialog)

### HIGH (Alti - Risolvere presto)

3. **Fetch esterno bloccante**: Agent log in Server Component
   - Gravità: HIGH
   - Impatto: Aumenta TTFB, potenziale blocco render
   - Evidenza: `src/app/dashboard/page.tsx:57-71, 283-315`
   - Fix: Spostare in client-side async o rimuovere

4. **Query senza paginazione**: Carica tutti gli appuntamenti oggi
   - Gravità: HIGH (scalabilità)
   - Impatto: Performance degrada con molti appuntamenti
   - Evidenza: `src/app/dashboard/page.tsx:109-126`
   - Fix: Aggiungere `.limit(50)` o paginazione

5. **Delete senza validazione server-side**: Client-side delete diretto
   - Gravità: HIGH (sicurezza)
   - Impatto: Possibile eliminazione non autorizzata
   - Evidenza: `src/app/dashboard/_components/agenda-client.tsx:82-101`
   - Fix: API endpoint con validazione RLS o soft-delete

6. **Empty state poco informativo**: Solo testo, nessun CTA
   - Gravità: HIGH (UX)
   - Impatto: Utente non sa come procedere
   - Evidenza: `src/components/dashboard/agenda-timeline.tsx:292-345`
   - Fix: Aggiungere link a calendario o suggerimenti

### MED (Medi - Risolvere in seguito)

7. **Bottoni senza aria-label**: Alcuni bottoni icon-only senza label
8. **Gestione errori silenziosa**: Errori loggati ma utente non informato
9. **Logica filtro duplicata**: DB + codice → rischio inconsistenze
10. **Nessun caching**: Query ripetute senza cache
11. **Stati loading generici**: Skeleton non specifico per agenda

### LOW (Bassi - Miglioramenti futuri)

12. **SEO meta tags**: Nessun title/description specifico (OK per area privata)
13. **Animazioni potenzialmente pesanti**: Potrebbe creare jank
14. **Focus management**: Verificare tab order

---

## ✅ PROSSIMI STEP

**STEP 2**: SQL di controllo per verificare stato attuale DB (tabelle, indici, RLS, integrità)  
**STEP 3**: SQL di fix/migrazione basato su risultati STEP 2  
**STEP 4**: Piano risoluzione problemi FE/BE  
**STEP 5**: Rianalisi dopo fix  
**STEP 6**: Implementazione finale + report

---

**Stato**: ✅ STEP 1 COMPLETATO  
**Prossimo**: Attendere conferma per procedere a STEP 2
