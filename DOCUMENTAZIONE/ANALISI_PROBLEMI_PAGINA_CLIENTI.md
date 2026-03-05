# 🔍 Analisi Completa Problemi Pagina `/dashboard/clienti`

**Data**: 2026-01-09  
**URL Analizzata**: `http://localhost:3001/dashboard/clienti?stato=tutti&page=1`  
**Analista**: Auto (Cursor Autopilot)

---

## 📋 LISTA COMPLETA PROBLEMI IDENTIFICATI

### 🔴 **PROBLEMA 1: Count Query non Gestisce Trainer**
**File**: `src/hooks/use-clienti.ts` (riga 1120-1123)  
**Criticità**: 80 (blocca paginazione corretta per trainer)  
**Descrizione**:  
Il count query in background (righe 1114-1167) usa SEMPRE `.or('role.eq.atleta,role.eq.athlete')` senza verificare se l'utente è un trainer. Per i trainer, il count dovrebbe essere basato sul numero di atleti assegnati in `pt_atleti`, non su tutti gli atleti.

**Codice Problematico**:
```typescript
let countQuery = supabase
  .from('profiles')
  .select('*', { count: 'estimated', head: true })
  .or('role.eq.atleta,role.eq.athlete')  // ❌ Non gestisce trainer!
```

**Soluzione**:  
Verificare il ruolo dell'utente e, se è trainer, contare gli atleti assegnati da `pt_atleti` invece di tutti gli atleti.

---

### 🔴 **PROBLEMA 2: fetchStats() non Gestisce Trainer**
**File**: `src/hooks/use-clienti.ts` (righe 181-216)  
**Criticità**: 70 (stats errate per trainer)  
**Descrizione**:  
La funzione `fetchStats()` usa SEMPRE `.or('role.eq.atleta,role.eq.athlete')` per tutte le query stats, senza verificare se l'utente è un trainer. Per i trainer, le stats dovrebbero essere calcolate solo sugli atleti assegnati.

**Codice Problematico**:
```typescript
const [totaliRes, attiviRes, inattiviRes, nuoviRes, documentiRes] = await Promise.allSettled([
  queryWithTimeout(
    supabase
      .from('profiles')
      .select('id', { count: 'estimated', head: true })
      .or('role.eq.atleta,role.eq.athlete'),  // ❌ Non gestisce trainer!
  ),
  // ... altre query con stesso problema
])
```

**Soluzione**:  
Verificare il ruolo dell'utente e, se è trainer, filtrare le query stats usando gli ID degli atleti assegnati da `pt_atleti`.

---

### 🔴 **PROBLEMA 3: Query Test pt_atleti Senza Filtri (Possibile Problema RLS)**
**File**: `src/hooks/use-clienti.ts` (righe 546-549)  
**Criticità**: 60 (potrebbe fallire per RLS o restituire dati non corretti)  
**Descrizione**:  
C'è una query di test a `pt_atleti` senza filtri che potrebbe fallire per RLS o restituire dati non corretti (tutti i trainer, non solo quello corrente).

**Codice Problematico**:
```typescript
// Test: prima prova a vedere tutte le righe in pt_atleti (senza filtri)
const { data: allPtAtleti, error: allPtAtletiError } = await supabase
  .from('pt_atleti')
  .select('pt_id, atleta_id')
  .limit(10)  // ❌ Nessun filtro per trainer corrente!
```

**Soluzione**:  
Rimuovere questa query di test oppure filtrarla per il trainer corrente (anche se è solo per debug).

---

### 🟡 **PROBLEMA 4: Campi `allenamenti_mese` e `scheda_attiva` Hardcoded**
**File**: `src/hooks/use-clienti.ts` (righe 1193-1195)  
**Criticità**: 50 (dati mancanti nella UI)  
**Descrizione**:  
I campi `allenamenti_mese` e `scheda_attiva` sono hardcoded a `0` e `null` rispettivamente. Il commento dice "Calcolo reale implementato in fetchClienti" ma il calcolo non è presente.

**Codice Problematico**:
```typescript
allenamenti_mese: 0, // Calcolo reale implementato in fetchClienti
ultimo_accesso: (profile.ultimo_accesso as string | null | undefined) ?? null,
scheda_attiva: null, // Query reale implementata in fetchClienti
```

**Soluzione**:  
Implementare il calcolo di `allenamenti_mese` (contando gli allenamenti del mese corrente da `workout_logs`) e la query per `scheda_attiva` (recuperando la scheda attiva da `workout_plans`).

---

### 🟡 **PROBLEMA 5: Paginazione Client-Side non Ottimale**
**File**: `src/hooks/use-clienti.ts` (righe 1026-1029)  
**Criticità**: 40 (performance con molti dati)  
**Descrizione**:  
La paginazione è completamente client-side: vengono caricati tutti i dati, poi vengono filtrati e paginati. Questo può causare problemi di performance con molti dati.

**Codice Problematico**:
```typescript
// Paginazione client-side
const from = (page - 1) * pageSize
const to = from + pageSize
queryResult = filtered.slice(from, to)
```

**Soluzione**:  
Implementare paginazione server-side usando `limit()` e `range()` di Supabase, oppure almeno limitare il numero di dati caricati inizialmente.

---

### 🟡 **PROBLEMA 6: Filtri Client-Side Potrebbero Essere Applicati Due Volte**
**File**: `src/hooks/use-clienti.ts` (righe 952-1024)  
**Criticità**: 30 (possibile duplicazione logica)  
**Descrizione**:  
I filtri vengono applicati client-side anche se alcuni filtri (come `stato`) potrebbero già essere applicati nella query Supabase. Questo può causare confusione e problemi di performance.

**Nota**:  
Il codice commenta "Per trainer, il filtro è già applicato nella query (solo atleti assegnati)" ma poi applica comunque tutti i filtri client-side.

---

### 🟡 **PROBLEMA 7: Count Stima Conservativa Non Preciso**
**File**: `src/hooks/use-clienti.ts` (righe 1106-1112)  
**Criticità**: 30 (pagina potrebbe mostrare count errato)  
**Descrizione**:  
Il count viene stimato come `data.length * 5` se la pagina è piena, che è molto conservativo e potrebbe non essere preciso.

**Codice Problematico**:
```typescript
if (data.length === pageSize) {
  // Se abbiamo una pagina piena, probabilmente ce ne sono altre
  queryCount = data.length * 5 // Stima conservativa
} else {
  queryCount = data.length
}
```

**Soluzione**:  
Usare il count effettivo dalla query quando disponibile, oppure fare una query count separata più precisa.

---

### 🟡 **PROBLEMA 8: Query Limit Applicato Prima dei Filtri**
**File**: `src/hooks/use-clienti.ts` (righe 689-691, 716-718)  
**Criticità**: 30 (paginazione potrebbe non funzionare correttamente)  
**Descrizione**:  
Il `limit(pageSize)` viene applicato nella query Supabase, ma poi i dati vengono filtrati client-side. Questo significa che potresti avere meno di `pageSize` risultati dopo il filtering, anche se ci sono più dati disponibili.

**Soluzione**:  
Caricare più dati di `pageSize` (ad esempio `pageSize * 2`) per compensare il filtering client-side, oppure applicare tutti i filtri nella query Supabase.

---

### 🟡 **PROBLEMA 9: Tags Sempre Vuoto**
**File**: `src/hooks/use-clienti.ts` (riga 1198)  
**Criticità**: 20 (funzionalità tags non implementata)  
**Descrizione**:  
Il campo `tags` è sempre un array vuoto `[]`. Non c'è query per recuperare i tags associati ai clienti.

**Codice Problematico**:
```typescript
tags: [],
```

**Soluzione**:  
Implementare query per recuperare i tags dalla tabella `profiles_tags` e `cliente_tags`.

---

### 🟡 **PROBLEMA 10: Logging Eccessivo con fetch() a URL Hardcoded**
**File**: `src/hooks/use-clienti.ts` (multiple righe)  
**Criticità**: 20 (spam console, possibile problema sicurezza)  
**Descrizione**:  
Ci sono molti `fetch()` a `http://127.0.0.1:7242/ingest/...` hardcoded che vengono eseguiti ad ogni query. Questo può causare spam nella console e possibili problemi di sicurezza se il server non è disponibile.

**Soluzione**:  
Rimuovere questi log di debug o spostarli in un sistema di logging configurato.

---

### 🟡 **PROBLEMA 11: Test Query pt_atleti Non Necessaria**
**File**: `src/hooks/use-clienti.ts` (righe 546-571)  
**Criticità**: 20 (query non necessaria, performance)  
**Descrizione**:  
C'è una query di test a `pt_atleti` senza filtri che viene eseguita ad ogni fetch. Questa query non è necessaria e può causare problemi di performance e RLS.

**Soluzione**:  
Rimuovere questa query di test.

---

### 🟡 **PROBLEMA 12: fetchStats() Eseguita in Background con setTimeout**
**File**: `src/hooks/use-clienti.ts` (righe 1232-1238)  
**Criticità**: 20 (stats potrebbero non essere aggiornate immediatamente)  
**Descrizione**:  
`fetchStats()` viene eseguita in background con `setTimeout(..., 100)`, il che significa che le stats potrebbero non essere disponibili immediatamente.

**Soluzione**:  
Eseguire `fetchStats()` in parallelo con `fetchClienti()` usando `Promise.all()` o simile.

---

### 🟡 **PROBLEMA 13: Total Count per Trainer Basato su Stima**
**File**: `src/hooks/use-clienti.ts` (righe 1106-1112, 1169)  
**Criticità**: 30 (count potrebbe essere errato per trainer)  
**Descrizione**:  
Per i trainer, il `total` viene calcolato usando una stima (`data.length * 5`) se la pagina è piena, invece di usare il count effettivo degli atleti assegnati.

**Soluzione**:  
Per i trainer, calcolare il count effettivo dal numero di atleti assegnati in `pt_atleti`, non usando una stima.

---

### 🟡 **PROBLEMA 14: ClientiTableView Usa Campi Mancanti**
**File**: `src/components/dashboard/clienti/clienti-table-view.tsx` (riga 213)  
**Criticità**: 40 (UI mostra 0 per allenamenti/mese)  
**Descrizione**:  
`ClientiTableView` mostra `allenamenti_mese` che è sempre 0 (hardcoded). Questo rende la colonna "Allenamenti/mese" inutile.

---

### 🟡 **PROBLEMA 15: ClientiGridView Non Mostra Informazioni Complete**
**File**: `src/components/dashboard/clienti/clienti-grid-view.tsx`  
**Criticità**: 20 (funzionalità limitata)  
**Descrizione**:  
`ClientiGridView` passa solo `clienti` e `total` a `ClienteCard`, ma non passa informazioni sulla paginazione o altri dati utili.

---

### 🟡 **PROBLEMA 16: useClientiFilters() Non Sincronizza con URL**
**File**: `src/hooks/use-clienti-filters.ts` (righe 11-15)  
**Criticità**: 30 (stato potrebbe essere desincronizzato)  
**Descrizione**:  
Gli stati iniziali (`searchTerm`, `statoFilter`, `page`) vengono letti da `searchParams` solo all'inizializzazione, ma non vengono aggiornati se l'URL cambia esternamente.

**Soluzione**:  
Usare `useEffect` per sincronizzare lo stato con i `searchParams` quando cambiano.

---

### 🟡 **PROBLEMA 17: TotalPages Calcolato con Total che Potrebbe Essere 0**
**File**: `src/hooks/use-clienti.ts` (riga 1457)  
**Criticità**: 20 (paginazione potrebbe mostrare "0 di 0 pagine")  
**Descrizione**:  
`totalPages` viene calcolato come `Math.ceil(total / pageSize)`, ma se `total` è 0 (ad esempio per trainer senza atleti o durante il loading), `totalPages` sarà 0, causando problemi nella UI.

**Soluzione**:  
Gestire il caso `total === 0` e mostrare almeno 1 pagina vuota.

---

### 🟡 **PROBLEMA 18: Sorting Client-Side per Campi Diversi da data_iscrizione**
**File**: `src/hooks/use-clienti.ts` (righe 1006-1024)  
**Criticità**: 30 (performance con molti dati)  
**Descrizione**:  
Il sorting per campi diversi da `data_iscrizione` viene fatto client-side, il che può essere lento con molti dati.

**Soluzione**:  
Applicare il sorting nella query Supabase usando `.order()`.

---

### 🟡 **PROBLEMA 19: Query con `.in('id', validIds)` Potrebbe Essere Lenta con Molti ID**
**File**: `src/hooks/use-clienti.ts` (riga 689)  
**Criticità**: 30 (performance con molti atleti assegnati)  
**Descrizione**:  
Per i trainer, la query usa `.in('id', validIds)` dove `validIds` può contenere molti ID (37 nel caso del trainer). Questa query potrebbe essere lenta con molti ID.

**Soluzione**:  
Usare una JOIN con `pt_atleti` invece di `.in('id', validIds)` per migliorare le performance.

---

### 🟡 **PROBLEMA 20: Count Query nel Background Non Gestisce Trainer**
**File**: `src/hooks/use-clienti.ts` (righe 1114-1167)  
**Criticità**: 60 (count errato per trainer)  
**Descrizione**:  
Il count query nel background (che viene eseguito dopo il rendering iniziale) non gestisce i trainer. Usa sempre `.or('role.eq.atleta,role.eq.athlete')` senza verificare il ruolo.

**Soluzione**:  
Verificare il ruolo dell'utente e, se è trainer, contare gli atleti assegnati invece di tutti gli atleti.

---

### 🟡 **PROBLEMA 21: Error Handling Generico**
**File**: `src/hooks/use-clienti.ts` (righe 891-918, 1042-1090)  
**Criticità**: 40 (difficile debug di errori specifici)  
**Descrizione**:  
L'error handling è generico e non distingue tra diversi tipi di errori (RLS, timeout, network, etc.). Questo rende difficile il debug.

**Soluzione**:  
Implementare error handling più specifico che distingue tra diversi tipi di errori e fornisce messaggi più chiari.

---

### 🟡 **PROBLEMA 22: Timeout Query 15 Secondi Troppo Lungo**
**File**: `src/hooks/use-clienti.ts` (riga 838)  
**Criticità**: 20 (UX povera se la query è lenta)  
**Descrizione**:  
Il timeout per la query è di 15 secondi, che è molto lungo. L'utente potrebbe pensare che l'applicazione sia bloccata.

**Soluzione**:  
Ridurre il timeout a 5-10 secondi e mostrare un messaggio di loading più chiaro.

---

### 🟡 **PROBLEMA 23: Loading State Gestito Male**
**File**: `src/app/dashboard/clienti/page.tsx` (righe 148-154, 222-225)  
**Criticità**: 30 (doppio loading state potrebbe causare flickering)  
**Descrizione**:  
Ci sono due controlli di loading state: uno all'inizio (riga 148) e uno nella lista clienti (riga 222). Questo può causare flickering o comportamenti strani.

---

### 🟡 **PROBLEMA 24: Stats Cards Usano Stats Generali Non Filtrate**
**File**: `src/app/dashboard/clienti/page.tsx` (righe 259-289)  
**Criticità**: 40 (stats non riflettono i filtri applicati)  
**Descrizione**:  
Le stats cards mostrano stats generali (`stats.totali`, `stats.attivi`, etc.) che non riflettono i filtri applicati (ricerca, stato, etc.). Questo può confondere l'utente.

**Soluzione**:  
Calcolare le stats basate sui dati filtrati, oppure chiarire che le stats sono globali.

---

### 🟡 **PROBLEMA 25: Query Profiles per Trainer Non Include Filtro Stato**
**File**: `src/hooks/use-clienti.ts` (righe 683-691)  
**Criticità**: 30 (filtro stato applicato solo client-side per trainer)  
**Descrizione**:  
Per i trainer, la query a `profiles` con `.in('id', validIds)` non include il filtro `stato` o altri filtri. Tutti i filtri vengono applicati client-side, il che può causare problemi di performance.

**Soluzione**:  
Applicare i filtri essenziali (come `stato`) nella query Supabase per i trainer.

---

### 🟡 **PROBLEMA 26: RLS Policy su pt_atleti Troppo Permissiva**
**File**: `supabase/migrations/20250110_022_pt_atleti.sql` (righe 42-45)  
**Criticità**: 60 (sicurezza: tutti possono vedere tutte le relazioni)  
**Descrizione**:  
La policy RLS su `pt_atleti` è `USING (true)`, il che significa che TUTTI gli utenti autenticati possono vedere TUTTE le relazioni trainer-atleta, non solo le proprie.

**Codice Problematico**:
```sql
CREATE POLICY "Users can view pt_atleti"
  ON pt_atleti FOR SELECT
  TO authenticated
  USING (true);  -- ❌ Troppo permissiva!
```

**Soluzione**:  
Creare una policy più restrittiva che permetta ai trainer di vedere solo le loro relazioni (`pt_id = get_current_trainer_profile_id()`) e agli admin di vedere tutto.

---

### 🟡 **PROBLEMA 27: Query pt_atleti Potrebbe Fallire per RLS**
**File**: `src/hooks/use-clienti.ts` (riga 591)  
**Criticità**: 50 (query potrebbe fallire se RLS è troppo restrittiva)  
**Descrizione**:  
La query `supabase.from('pt_atleti').select('atleta_id').eq('pt_id', user.id)` potrebbe fallire se la policy RLS su `pt_atleti` non permette ai trainer di vedere le proprie relazioni.

**Nota**:  
Attualmente la policy è `USING (true)` quindi funziona, ma se viene cambiata, questa query potrebbe fallire.

---

### 🟡 **PROBLEMA 28: Mapping ProfileSummary a Cliente Non Gestisce Errori**
**File**: `src/hooks/use-clienti.ts` (righe 1172-1203)  
**Criticità**: 30 (dati potrebbero essere null o undefined causando errori)  
**Descrizione**:  
Il mapping da `ProfileSummary` a `Cliente` non gestisce correttamente tutti i casi di `null` o `undefined`. Alcuni campi potrebbero causare errori se sono null.

**Soluzione**:  
Aggiungere validazione più robusta per tutti i campi obbligatori.

---

### 🟡 **PROBLEMA 29: useEffect con Dipendenze Mancanti**
**File**: `src/hooks/use-clienti.ts` (riga 1247)  
**Criticità**: 30 (useEffect potrebbe non eseguirsi quando necessario)  
**Descrizione**:  
L'`useEffect` che chiama `fetchClienti()` ha un commento `eslint-disable-next-line react-hooks/exhaustive-deps` e `total` è stato rimosso dalle dipendenze. Questo potrebbe causare problemi se `total` cambia e dovrebbe triggerare un refetch.

**Nota**:  
Il commento spiega che `total` è stato rimosso per evitare loop infinito, ma questo potrebbe causare altri problemi.

---

### 🟡 **PROBLEMA 30: fetchClienti() Non Gestisce Caso user Non Disponibile**
**File**: `src/hooks/use-clienti.ts` (riga 507)  
**Criticità**: 30 (query potrebbe fallire se user non è disponibile)  
**Descrizione**:  
La query per i trainer controlla `if (isTrainerRole && user?.id)`, ma se `user` non è disponibile durante il primo render, la query potrebbe non essere eseguita correttamente.

**Soluzione**:  
Aggiungere un controllo per verificare che `user` sia disponibile prima di eseguire la query.

---

## 📊 RIEPILOGO PROBLEMI PER CRITICITÀ

### 🔴 **Criticità Alta (70-80)** - 3 problemi
1. Count Query non Gestisce Trainer
2. fetchStats() non Gestisce Trainer  
3. Query Test pt_atleti Senza Filtri

### 🟡 **Criticità Media (40-60)** - 10 problemi
4. Campi `allenamenti_mese` e `scheda_attiva` Hardcoded
5. Paginazione Client-Side non Ottimale
6. Count Stima Conservativa Non Preciso
7. Query Limit Applicato Prima dei Filtri
8. Total Count per Trainer Basato su Stima
9. Count Query nel Background Non Gestisce Trainer
10. Error Handling Generico
11. Stats Cards Usano Stats Generali Non Filtrate
12. Query Profiles per Trainer Non Include Filtro Stato
13. RLS Policy su pt_atleti Troppo Permissiva
14. Query pt_atleti Potrebbe Fallire per RLS

### 🟡 **Criticità Bassa (20-30)** - 13 problemi
15. Filtri Client-Side Potrebbero Essere Applicati Due Volte
16. Tags Sempre Vuoto
17. Logging Eccessivo con fetch() a URL Hardcoded
18. Test Query pt_atleti Non Necessaria
19. fetchStats() Eseguita in Background con setTimeout
20. ClientiTableView Usa Campi Mancanti
21. ClientiGridView Non Mostra Informazioni Complete
22. useClientiFilters() Non Sincronizza con URL
23. TotalPages Calcolato con Total che Potrebbe Essere 0
24. Sorting Client-Side per Campi Diversi da data_iscrizione
25. Query con `.in('id', validIds)` Potrebbe Essere Lenta
26. Timeout Query 15 Secondi Troppo Lungo
27. Loading State Gestito Male
28. Mapping ProfileSummary a Cliente Non Gestisce Errori
29. useEffect con Dipendenze Mancanti
30. fetchClienti() Non Gestisce Caso user Non Disponibile

---

## 🎯 PRIORITÀ FIX

### ⚡ **FIX IMMEDIATO** (Blocca funzionalità trainer)
1. ✅ Count Query per Trainer - Usa count da `pt_atleti` invece di tutti gli atleti
2. ✅ fetchStats() per Trainer - Calcola stats solo su atleti assegnati
3. ✅ RLS Policy su pt_atleti - Restringere per sicurezza

### 🔧 **FIX IMPORTANTE** (Migliora UX e Performance)
4. ✅ Campi `allenamenti_mese` e `scheda_attiva` - Implementare calcolo reale
5. ✅ Paginazione Server-Side - Applicare limit nella query Supabase
6. ✅ Query Profiles per Trainer - Includere filtri essenziali nella query
7. ✅ Count Query nel Background - Gestire trainer correttamente

### 📦 **FIX BACKLOG** (Miglioramenti)
8. ✅ Rimuovere query test `pt_atleti` non necessaria
9. ✅ Rimuovere logging eccessivo con fetch() hardcoded
10. ✅ Gestire errori più specificamente
11. ✅ Ottimizzare query `.in('id', validIds)` con JOIN
12. ✅ Sincronizzare useClientiFilters() con URL

---

## 📝 NOTE TECNICHE

- **RLS**: Le policy RLS potrebbero causare problemi se non sono configurate correttamente per i trainer
- **Performance**: Con molti atleti assegnati (37+), la paginazione client-side potrebbe essere lenta
- **Count**: Il count per i trainer deve essere basato su `pt_atleti`, non su tutti gli atleti
- **Stats**: Le stats per i trainer devono essere calcolate solo sugli atleti assegnati

---

**Totale Problemi Identificati**: 30  
**Criticità Alta**: 3  
**Criticità Media**: 10  
**Criticità Bassa**: 13  
**Fix Priorità Alta**: 3  
**Fix Priorità Media**: 4  
**Fix Priorità Bassa**: 23
