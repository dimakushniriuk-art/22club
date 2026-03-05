# 🔍 Analisi Completa Pagina Clienti - V2

**Data Analisi**: 2026-01-09  
**URL**: `http://localhost:3001/dashboard/clienti`  
**Componenti Analizzati**:

- `src/app/dashboard/clienti/page.tsx`
- `src/hooks/use-clienti.ts`
- `src/hooks/use-clienti-filters.ts`
- `src/hooks/use-clienti-selection.ts`
- `src/components/dashboard/clienti/*`

---

## 📊 Riepilogo Problemi Trovati

**TOTALE PROBLEMI**: 50

- **🔴 CRITICI** (Score 70-100): 8 problemi
- **🟡 IMPORTANTI** (Score 40-69): 19 problemi
- **🟢 MINORI** (Score 1-39): 19 problemi
- **⚙️ TECNICI** (TypeScript/Performance/Security): 4 problemi

---

## 🔴 PROBLEMI CRITICI (Score 70-100)

### PROBLEMA 1: Uso di `confirm()` e `alert()` Nativi del Browser

**File**: `src/app/dashboard/clienti/page.tsx`  
**Righe**: 95, 103, 136, 143  
**Score Criticità**: 80  
**Categoria**: UX / Best Practices

**Descrizione**:

- Uso di `confirm()` nativo per conferma eliminazione (righe 95, 136)
- Uso di `alert()` nativo per errori (righe 103, 143)
- Questi metodi bloccano il thread UI e hanno styling inconsistente
- Non sono accessibili e non seguono il design system

**Impatto**:

- UX scadente: dialog nativi del browser non seguono il design system
- Inaccessibilità: screen reader non li gestisce bene
- Blocco UI: `confirm()` e `alert()` bloccano il thread JavaScript
- Inconsistenza: stile diverso dal resto dell'applicazione

**Soluzione Proposta**:

```typescript
// Sostituire con componenti Dialog/Alert del design system
import { AlertDialog } from '@/components/ui/alert-dialog'
import { toast } from '@/components/ui/toast'

// Per conferma eliminazione
const handleDelete = async (cliente: Cliente) => {
  // Usare AlertDialog invece di confirm()
}

// Per errori
catch (err) {
  toast.error("Errore durante l'eliminazione del cliente")
  // Invece di alert()
}
```

---

### PROBLEMA 2: Uso di `window.location.href` per Mailto

**File**: `src/app/dashboard/clienti/page.tsx`  
**Righe**: 90, 132  
**Score Criticità**: 70  
**Categoria**: UX / Navigation

**Descrizione**:

- Uso di `window.location.href = 'mailto:...'` per aprire client email (righe 90, 132)
- Questo può causare problemi su dispositivi mobili e interrompe il flusso della pagina
- Per email multiple (bulk), la sintassi `mailto:` con molte email può non funzionare

**Impatto**:

- Navigazione brusca: interrompe il flusso della pagina
- Problemi mobile: può aprire app email in modo non ottimale
- Email multiple: sintassi `mailto:email1,email2,...` può superare limiti URL
- Nessun fallback se client email non disponibile

**Soluzione Proposta**:

```typescript
// Per email singola: aprire modale di composizione email
// Per email multiple: copiare email in clipboard e mostrare toast
const handleBulkEmail = () => {
  const emails = selectedClienti.map((c) => c.email).join('; ')
  navigator.clipboard.writeText(emails)
  toast.success(`Indirizzi email copiati negli appunti: ${emails}`)
}
```

---

### PROBLEMA 3: Paginazione Client-Side Inefficiente

**File**: `src/hooks/use-clienti.ts`  
**Righe**: 659-662, 838-887  
**Score Criticità**: 75  
**Categoria**: Performance / Scalability

**Descrizione**:

- Paginazione completamente client-side (righe 659-662)
- Query carica `pageSize * 2` dati e poi fa slicing client-side
- Per trainer con molti atleti (37+), questo può essere lento
- Paginazione server-side sarebbe molto più efficiente

**Impatto**:

- Performance: carica più dati del necessario
- Scalabilità: non scala con dataset grandi
- Memoria: mantiene più dati in memoria del necessario
- Network: trasferisce dati non visualizzati

**Soluzione Proposta**:

- Implementare paginazione server-side con `.range(from, to)` nella query Supabase
- Query dovrebbe essere: `.range((page - 1) * pageSize, page * pageSize - 1)`
- Total count deve essere preciso per paginazione corretta

---

### PROBLEMA 4: Filtri Client-Side su Dati Già Filtrati

**File**: `src/hooks/use-clienti.ts`  
**Righe**: 591-636  
**Score Criticità**: 70  
**Categoria**: Performance / Logic

**Descrizione**:

- Filtri applicati sia server-side che client-side
- Query Supabase applica filtri `stato` e `documenti_scadenza` (righe 478-483, 509-514)
- Poi filtri vengono riapplicati client-side (righe 591-636)
- Questo causa duplicazione e possibili inconsistenze

**Impatto**:

- Performance: doppio lavoro (server + client)
- Confusione: non è chiaro dove vengono applicati i filtri
- Possibili bug: se filtri server/client divergono
- Mantenibilità: logica duplicata

**Soluzione Proposta**:

- Scegliere un approccio: o tutto server-side o tutto client-side
- Per performance: spostare TUTTI i filtri server-side
- Per semplicità: rimuovere filtri server-side e fare tutto client-side (solo per dataset piccoli)

---

### PROBLEMA 5: Sorting Client-Side Solo per Alcuni Campi

**File**: `src/hooks/use-clienti.ts`  
**Righe**: 638-657  
**Score Criticità**: 65  
**Categoria**: Performance / Logic

**Descrizione**:

- Sorting server-side solo per `data_iscrizione` (righe 486, 517)
- Per altri campi (`nome`, `cognome`, `email`, `stato`, `allenamenti_mese`): sorting client-side (righe 638-657)
- Questo è inconsistente e inefficiente

**Impatto**:

- Performance: sorting client-side può essere lento per molti record
- Inconsistenza: alcuni campi sorted server-side, altri client-side
- UX: sorting può essere lento visibile all'utente

**Soluzione Proposta**:

- Implementare sorting server-side per TUTTI i campi
- Query Supabase: `.order('nome', { ascending: sort.direction === 'asc' })` per tutti i campi
- Rimuovere sorting client-side completamente

---

### PROBLEMA 6: Count Query Background Usa Stima per Admin

**File**: `src/hooks/use-clienti.ts`  
**Righe**: 826-887  
**Score Criticità**: 70  
**Categoria**: Accuracy / UX

**Descrizione**:

- Per admin, count iniziale usa stima conservativa `data.length * 5` (riga 829)
- Count preciso viene fatto in background con `setTimeout` (righe 838-887)
- Questo causa flickering quando il count viene aggiornato
- Per trainer, count è preciso da `pt_atleti` (corretto)

**Impatto**:

- UX: flickering quando count viene aggiornato
- Accuracy: count iniziale può essere molto sbagliato
- Inconsistenza: trainer ha count preciso, admin ha stima

**Soluzione Proposta**:

- Per admin: fare count preciso SINCRONO all'inizio (bloccare UI se necessario)
- Oppure: mostrare loading state fino a quando count preciso non è disponibile
- Rimuovere stima conservativa e setTimeout

---

### PROBLEMA 7: Query `workout_logs` e `workout_plans` Sempre Eseguita

**File**: `src/hooks/use-clienti.ts`  
**Righe**: 676-754  
**Score Criticità**: 75  
**Categoria**: Performance / Network

**Descrizione**:

- Query per `allenamenti_mese` e `scheda_attiva` viene sempre eseguita dopo la query principale (righe 676-754)
- Anche se gli atleti non hanno allenamenti o schede, le query vengono eseguite
- Non c'è cache per questi dati
- Query viene eseguita anche se `queryResult.length === 0`

**Impatto**:

- Performance: 2 query aggiuntive sempre eseguite
- Network: traffico inutile se nessun dato
- Latenza: aumenta tempo di caricamento pagina
- Database: carico aggiuntivo sul database

**Soluzione Proposta**:

- Eseguire query solo se `queryResult.length > 0`
- Implementare cache per `allenamenti_mese` e `scheda_attiva` (TTL 5 minuti)
- Considerare query aggregata con JOIN invece di 2 query separate

---

### PROBLEMA 8: Nessuna Gestione Errori per Export CSV/PDF

**File**: `src/app/dashboard/clienti/page.tsx`, `src/lib/export-utils.ts`  
**Righe**: 108-116, `export-utils.ts:10-48, 55-94`  
**Score Criticità**: 70  
**Categoria**: Error Handling / UX

**Descrizione**:

- Funzioni `handleExportCSV` e `handleExportPDF` non hanno try-catch
- Se `formatClientiForExport` fallisce, errore non gestito
- Se `exportToCSV` o `exportToPDF` falliscono, nessun feedback all'utente
- `downloadBlob` può fallire se browser blocca download

**Impatto**:

- UX: nessun feedback se export fallisce
- Errori silenziosi: utente non sa perché export non funziona
- Possibili crash: se formato dati è errato

**Soluzione Proposta**:

```typescript
const handleExportCSV = async () => {
  try {
    if (clienti.length === 0) {
      toast.warning('Nessun cliente da esportare')
      return
    }
    const data = formatClientiForExport(clienti)
    exportToCSV(data, `clienti-${new Date().toISOString().split('T')[0]}.csv`)
    toast.success('Export CSV completato con successo')
  } catch (err) {
    logger.error('Errore export CSV', err)
    toast.error("Errore durante l'export CSV")
  }
}
```

---

## 🟡 PROBLEMI IMPORTANTI (Score 40-69)

### PROBLEMA 9: Stats Cards Mostrano Stats Globali Non Filtrate

**File**: `src/app/dashboard/clienti/page.tsx`  
**Righe**: 257-284  
**Score Criticità**: 60  
**Categoria**: UX / Accuracy

**Descrizione**:

- Stats cards mostrano `stats.totali`, `stats.attivi`, etc. che sono globali (tutti gli atleti)
- Queste stats non riflettono i filtri applicati (search, stato, date, etc.)
- Utente vede "Clienti Totali: 37" anche se ha filtrato per "Attivi" e ne vede solo 10

**Impatto**:

- Confusione: stats non corrispondono ai dati visualizzati
- UX scadente: utente non capisce perché stats sono diverse dai risultati
- Inconsistenza: stats dovrebbero riflettere i filtri attivi

**Soluzione Proposta**:

- Calcolare stats basate sui `clienti` filtrati visualizzati
- Oppure: chiarire che stats sono globali (non filtrate) con tooltip/label

---

### PROBLEMA 10: `viewMode` Non Persistito in URL o localStorage

**File**: `src/app/dashboard/clienti/page.tsx`  
**Righe**: 30  
**Score Criticità**: 40  
**Categoria**: UX / State Management

**Descrizione**:

- `viewMode` (table/grid) è salvato solo in state locale (riga 30)
- Se utente ricarica pagina, `viewMode` si resetta a 'grid'
- Non è sincronizzato con URL o localStorage

**Impatto**:

- UX: preferenza utente non salvata
- Inconsistenza: altri filtri sono in URL, `viewMode` no

**Soluzione Proposta**:

- Aggiungere `viewMode` agli URL params: `?viewMode=table`
- Oppure: salvare in localStorage per persistenza

---

### PROBLEMA 11: `useEffect` per Query Param 'new' Può Essere Semplificato

**File**: `src/app/dashboard/clienti/page.tsx`  
**Righe**: 35-40  
**Score Criticità**: 30  
**Categoria**: Code Quality

**Descrizione**:

- `useEffect` legge `searchParams.get('new')` ad ogni cambio di `searchParams`
- Ma `searchParams` cambia anche per altri filtri (search, stato, page)
- Questo può causare re-esecuzioni non necessarie

**Impatto**:

- Performance minore: re-esecuzioni non necessarie
- Possibili bug: se altri query params cambiano, useEffect si riattiva

**Soluzione Proposta**:

```typescript
useEffect(() => {
  const newParam = searchParams.get('new')
  if (newParam === 'true' && !showCreaAtleta) {
    setShowCreaAtleta(true)
  }
}, [searchParams.get('new'), showCreaAtleta]) // Solo quando 'new' cambia
```

---

### PROBLEMA 12: `handleCloseCreaAtleta` Modifica URL Anche Se Non Cambiato

**File**: `src/app/dashboard/clienti/page.tsx`  
**Righe**: 43-54  
**Score Criticità**: 40  
**Categoria**: Performance / Logic

**Descrizione**:

- `handleCloseCreaAtleta` chiama `router.replace()` anche se `new` param non esiste già (righe 47-52)
- Questo causa navigazione inutile se param non c'è
- `router.replace()` viene chiamato sempre, anche se URL non cambia

**Impatto**:

- Performance: navigazione inutile
- Possibili bug: può causare re-render non necessari

**Soluzione Proposta**:

```typescript
const handleCloseCreaAtleta = (open: boolean) => {
  setShowCreaAtleta(open)
  if (!open && searchParams.get('new') === 'true') {
    // Solo se 'new' param esiste, rimuovilo
    const params = new URLSearchParams(searchParams.toString())
    params.delete('new')
    const newUrl = params.toString()
      ? `/dashboard/clienti?${params.toString()}`
      : '/dashboard/clienti'
    router.replace(newUrl, { scroll: false })
  }
}
```

---

### PROBLEMA 13: `useClientiSelection` Non Resetta Quando `clienti` Cambiano

**File**: `src/hooks/use-clienti-selection.ts`  
**Righe**: 5-38  
**Score Criticità**: 50  
**Categoria**: Bug / State Management

**Descrizione**:

- `useClientiSelection` mantiene `selectedIds` anche quando `clienti` cambiano (per filtri/paginazione)
- Se utente seleziona clienti, poi cambia filtro, selezione rimane ma può puntare a clienti non più visibili
- Questo può causare problemi con azioni bulk su clienti non più nella lista

**Impatto**:

- Bug: azioni bulk possono fallire su ID non validi
- Confusione: selezione può contenere ID di clienti non visualizzati
- UX: utente può non capire perché azioni bulk non funzionano

**Soluzione Proposta**:

```typescript
// Reset selection quando clienti cambiano
useEffect(() => {
  const currentIds = new Set(clienti.map((c) => c.id))
  setSelectedIds((prev) => {
    const filtered = new Set(Array.from(prev).filter((id) => currentIds.has(id)))
    return filtered.size !== prev.size ? filtered : prev
  })
}, [clienti])
```

---

### PROBLEMA 14: `advancedFilters` Dichiarato Ma Non Usato

**File**: `src/app/dashboard/clienti/page.tsx`  
**Righe**: 63-64  
**Score Criticità**: 30  
**Categoria**: Code Quality / TypeScript

**Descrizione**:

- `advancedFilters` viene destrutturato da `useClientiFilters()` (riga 64)
- Ma è marcato come `eslint-disable-next-line @typescript-eslint/no-unused-vars` perché non usato
- Viene passato a `ClientiFiltriAvanzati` ma sembra non essere usato correttamente

**Impatto**:

- Code smell: variabile non utilizzata
- Possibili bug: se logica futura si aspetta `advancedFilters` popolato

**Soluzione Proposta**:

- Verificare se `advancedFilters` è necessario
- Se non necessario: rimuovere dalla destrutturazione
- Se necessario: usarlo correttamente nel componente

---

### PROBLEMA 15: Bulk Delete Non Gestisce Errori Parziali

**File**: `src/app/dashboard/clienti/page.tsx`  
**Righe**: 94-105  
**Score Criticità**: 65  
**Categoria**: Error Handling / UX

**Descrizione**:

- `handleBulkDelete` usa `Promise.all()` per eliminare tutti i clienti (riga 98)
- Se una eliminazione fallisce, `Promise.all()` rigetta completamente
- Non si sa quali clienti sono stati eliminati e quali no
- Selezione viene comunque pulita anche se eliminazione fallisce

**Impatto**:

- UX: nessun feedback su quali eliminazioni sono riuscite
- Data loss: selezione viene pulita anche se eliminazione fallisce
- Confusione: utente non sa quali clienti sono ancora presenti

**Soluzione Proposta**:

```typescript
const handleBulkDelete = async () => {
  if (!confirm(...)) return

  const results = await Promise.allSettled(
    Array.from(selectedIds).map((id) => deleteCliente(id))
  )

  const succeeded = results.filter(r => r.status === 'fulfilled').length
  const failed = results.filter(r => r.status === 'rejected').length

  if (failed > 0) {
    toast.warning(`${succeeded} eliminati, ${failed} errori`)
  } else {
    toast.success(`${succeeded} clienti eliminati`)
  }

  clearSelection()
  refetch()
}
```

---

### PROBLEMA 16: `formatClientiForExport` Non Gestisce Campi Null/Undefined

**File**: `src/lib/export-utils.ts`  
**Righe**: 113-127  
**Score Criticità**: 50  
**Categoria**: Data Validation / Error Handling

**Descrizione**:

- `formatClientiForExport` accede a `c.nome`, `c.cognome`, etc. senza validazione
- Se campi sono `null` o `undefined`, può generare errori
- `new Date(c.data_iscrizione as string)` può fallire se `data_iscrizione` è invalida

**Impatto**:

- Possibili crash: se dati sono malformati
- Export incompleto: alcuni campi possono essere vuoti senza motivo

**Soluzione Proposta**:

```typescript
export function formatClientiForExport(clienti: unknown[]): ExportData {
  return clienti.map((cliente) => {
    const c = cliente as Record<string, unknown>
    const dataIscrizione = c.data_iscrizione
      ? new Date(c.data_iscrizione as string).toLocaleDateString('it-IT')
      : 'N/A'

    return {
      Nome: `${c.nome || ''} ${c.cognome || ''}`.trim() || 'N/A',
      Email: (c.email as string) || 'N/A',
      // ... resto con fallback appropriati
    }
  })
}
```

---

### PROBLEMA 17: Query `workout_logs` Non Gestisce Timezone Correttamente

**File**: `src/hooks/use-clienti.ts`  
**Righe**: 681-685  
**Score Criticità**: 45  
**Categoria**: Date Handling / Accuracy

**Descrizione**:

- `firstDayOfMonth` viene calcolato con `new Date()` locale e convertito a ISO string (righe 681-685)
- Query Supabase usa `.gte('data', firstDayOfMonth)` che confronta con timezone UTC
- Questo può causare problemi se timezone locale è diverso da UTC
- Allenamenti del primo giorno del mese possono essere inclusi/esclusi erroneamente

**Impatto**:

- Accuracy: count `allenamenti_mese` può essere sbagliato per 1 giorno
- Confusione: dipende da timezone utente/database

**Soluzione Proposta**:

```typescript
// Usare UTC esplicito
const now = new Date()
const firstDayOfMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)).toISOString()
```

---

### PROBLEMA 18: Query `workout_plans` Filtra Date Client-Side

**File**: `src/hooks/use-clienti.ts`  
**Righe**: 717-735  
**Score Criticità**: 50  
**Categoria**: Performance / Logic

**Descrizione**:

- Query `workout_plans` recupera TUTTE le schede attive (righe 710-715)
- Poi filtra date client-side (righe 717-735)
- Questo trasferisce più dati del necessario dal database

**Impatto**:

- Performance: query trasferisce dati poi scartati
- Network: traffico inutile
- Scalabilità: non scala se ci sono molte schede

**Soluzione Proposta**:

- Filtrare date nella query Supabase usando `.lte('start_date', today)` e `.gte('end_date', today)`
- Oppure: usare funzioni SQL `get_scheda_attiva()` già esistenti

---

### PROBLEMA 19: `ClientiGridView` Non Mostra Paginazione

**File**: `src/components/dashboard/clienti/clienti-grid-view.tsx`  
**Righe**: 12-30  
**Score Criticità**: 60  
**Categoria**: UX / Functionality

**Descrizione**:

- `ClientiGridView` mostra solo i clienti ma non ha paginazione
- Utente non può navigare tra pagine in vista griglia
- Solo `ClientiTableView` ha paginazione (righe 268-292 di `clienti-table-view.tsx`)

**Impatto**:

- Funzionalità mancante: utente non può navigare pagine in vista griglia
- Inconsistenza: table view ha paginazione, grid view no
- UX: utente deve cambiare vista per navigare pagine

**Soluzione Proposta**:

- Aggiungere props `page`, `totalPages`, `onPageChange` a `ClientiGridView`
- Implementare component paginazione anche per grid view

---

### PROBLEMA 20: `sort` State Non Sincronizzato con URL

**File**: `src/hooks/use-clienti-filters.ts`  
**Righe**: 18-21, 75-80  
**Score Criticità**: 45  
**Categoria**: State Management / URL Sync

**Descrizione**:

- `sort` è salvato in state locale (righe 18-21)
- `handleSort` aggiorna solo state locale, non URL (righe 75-80)
- Se utente ricarica pagina, sorting si resetta

**Impatto**:

- Preferenza utente non persistita
- Inconsistenza: altri filtri sono in URL, sorting no
- Share URL: non si può condividere URL con sorting specifico

**Soluzione Proposta**:

- Aggiungere `sort` agli URL params: `?sortField=nome&sortDirection=asc`
- Leggere da URL all'inizializzazione
- Aggiornare URL quando sorting cambia

---

### PROBLEMA 21: `useClientiFilters` Non Sincronizza URL al Mount

**File**: `src/hooks/use-clienti-filters.ts`  
**Righe**: 11-21  
**Score Criticità**: 40  
**Categoria**: State Management / Initialization

**Descrizione**:

- State viene inizializzato da `searchParams` solo una volta (righe 11-21)
- Ma se URL cambia esternamente (es: browser back), state non si aggiorna
- `searchParams` viene letto solo al mount, non reagisce a cambiamenti

**Impatto**:

- Bug: state può essere desincronizzato con URL
- UX: browser back/forward non funziona correttamente

**Soluzione Proposta**:

```typescript
// Reagire a cambiamenti searchParams
useEffect(() => {
  const urlSearch = searchParams.get('search') || ''
  const urlStato = searchParams.get('stato') as ... || 'tutti'
  const urlPage = Number(searchParams.get('page')) || 1

  if (urlSearch !== searchTerm) setSearchTerm(urlSearch)
  if (urlStato !== statoFilter) setStatoFilter(urlStato)
  if (urlPage !== page) setPage(urlPage)
}, [searchParams])
```

---

### PROBLEMA 22: `resetFilters` Chiama `updateURL` Ma Non Resetta Tutti i Filtri

**File**: `src/hooks/use-clienti-filters.ts`  
**Righe**: 97-103  
**Score Criticità**: 45  
**Categoria**: Logic / Completeness

**Descrizione**:

- `resetFilters` resetta `searchTerm`, `statoFilter`, `advancedFilters`, `page` (righe 98-101)
- Ma `updateURL` viene chiamato solo con `search`, `stato`, `page` (riga 102)
- `advancedFilters` (date, allenamenti_min, etc.) non vengono rimossi dall'URL

**Impatto**:

- Inconsistenza: alcuni filtri vengono rimossi dall'URL, altri no
- Bug: se filtri avanzati sono in URL, rimangono anche dopo reset
- Confusione: utente non sa che alcuni filtri sono ancora attivi

**Soluzione Proposta**:

```typescript
const resetFilters = () => {
  setSearchTerm('')
  setStatoFilter('tutti')
  setAdvancedFilters({})
  setPage(1)
  // Rimuovere TUTTI i query params
  router.push('/dashboard/clienti')
}
```

---

### PROBLEMA 23: `formatData` in `ClientiTableView` Non Gestisce Date Invalide

**File**: `src/components/dashboard/clienti/clienti-table-view.tsx`  
**Righe**: 68-74, 205-208  
**Score Criticità**: 50  
**Categoria**: Error Handling / Data Validation

**Descrizione**:

- `formatData` chiama `new Date(dataString)` senza validazione (riga 69)
- Se `dataString` è invalido, `new Date()` ritorna `Invalid Date`
- `toLocaleDateString()` su `Invalid Date` ritorna stringa confusa

**Impatto**:

- Crash: se data è malformata, può generare errori
- UX: date mostrate come "Invalid Date" o stringhe confuse

**Soluzione Proposta**:

```typescript
const formatData = (dataString: string) => {
  if (!dataString) return 'N/A'
  const date = new Date(dataString)
  if (isNaN(date.getTime())) return 'Data non valida'
  return date.toLocaleDateString('it-IT', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}
```

---

### PROBLEMA 24: `getStatoBadge` Non Gestisce Stati Non Validi

**File**: `src/components/dashboard/clienti/clienti-table-view.tsx`  
**Righe**: 76-100, 210  
**Score Criticità**: 40  
**Categoria**: Error Handling / Type Safety

**Descrizione**:

- `getStatoBadge` ha switch con casi per 'attivo', 'inattivo', 'sospeso' (righe 78-96)
- Default case mostra stato raw senza validazione (riga 98)
- Se `cliente.stato` è un valore non valido (es: null, undefined, stringa invalida), viene mostrato come badge

**Impatto**:

- UX: badge può mostrare valori confusi (es: "null", "undefined")
- Type safety: TypeScript non garantisce che stato sia sempre valido

**Soluzione Proposta**:

```typescript
const getStatoBadge = (stato: string | null | undefined) => {
  if (!stato || typeof stato !== 'string') {
    return <Badge variant="primary" size="sm">Non specificato</Badge>
  }
  switch (stato) {
    // ... casi esistenti
    default:
      return <Badge variant="warning" size="sm">Stato non valido: {stato}</Badge>
  }
}
```

---

### PROBLEMA 25: Checkbox "Seleziona Tutti" Non Gestisce Paginazione

**File**: `src/components/dashboard/clienti/clienti-table-view.tsx`  
**Righe**: 117-121  
**Score Criticità**: 55  
**Categoria**: Logic / UX

**Descrizione**:

- Checkbox "Seleziona tutti" seleziona solo i clienti nella pagina corrente (riga 118: `clienti.length`)
- Ma label suggerisce "Seleziona tutti" i clienti, non solo quelli nella pagina
- Utente può pensare di aver selezionato tutti i clienti, ma in realtà solo quelli visibili

**Impatto**:

- Confusione: label non corrisponde al comportamento
- Possibili errori: azioni bulk su subset invece di tutti
- UX: comportamento non intuitivo

**Soluzione Proposta**:

- Cambiare label: "Seleziona tutti (pagina corrente)" o "Seleziona tutti ({clienti.length})"
- Oppure: implementare "Seleziona tutti" vero che seleziona tutti i clienti filtrati, non solo pagina corrente

---

### PROBLEMA 26: `ClientiEmptyState` Logica Condizionale Complessa

**File**: `src/components/dashboard/clienti/clienti-empty-state.tsx`  
**Righe**: 28-33  
**Score Criticità**: 30  
**Categoria**: Code Quality / Readability

**Descrizione**:

- Messaggio empty state ha logica condizionale annidata (righe 28-33)
- `totali > 0 ? ... : searchTerm || statoFilter !== 'tutti' ? ... : ...`
- Difficile da leggere e mantenere

**Impatto**:

- Code quality: logica complessa difficile da capire
- Mantenibilità: difficile modificare in futuro
- Testabilità: difficile testare tutti i casi

**Soluzione Proposta**:

```typescript
const getEmptyMessage = () => {
  if (totali > 0) {
    return `I filtri attuali non corrispondono a nessun cliente. Ci sono ${totali} clienti totali nel database.`
  }
  if (searchTerm || statoFilter !== 'tutti') {
    return 'Prova a modificare i filtri di ricerca per trovare i clienti che stai cercando.'
  }
  return 'Inizia invitando i tuoi primi atleti per gestire i loro progressi e allenamenti.'
}
```

---

### PROBLEMA 27: Export PDF Non È Un Vero PDF

**File**: `src/lib/export-utils.ts`  
**Righe**: 55-94  
**Score Criticità**: 60  
**Categoria**: Functionality / Misleading

**Descrizione**:

- `exportToPDF` genera un file con MIME type `application/pdf` (riga 92)
- Ma il contenuto è solo testo formattato (righe 77-88)
- Non è un vero PDF: è un file di testo con estensione .pdf
- Utente si aspetta un PDF vero, ma ottiene testo

**Impatto**:

- Misleading: nome funzione e MIME type suggeriscono PDF vero
- UX: utente può essere confuso quando apre "PDF" e vede solo testo
- Funzionalità mancante: non è un vero PDF

**Soluzione Proposta**:

- Usare libreria come `jsPDF` o `pdfkit` per generare PDF vero
- Oppure: rinominare funzione in `exportToText` e cambiare estensione a `.txt`
- Oppure: rimuovere funzione se PDF non è necessario

---

### PROBLEMA 28: `exportToCSV` Non Gestisce Encoding UTF-8 BOM

**File**: `src/lib/export-utils.ts`  
**Righe**: 10-49  
**Score Criticità**: 40  
**Categoria**: Internationalization / Encoding

**Descrizione**:

- `exportToCSV` crea CSV senza BOM (Byte Order Mark) UTF-8
- Excel su Windows può non riconoscere correttamente caratteri accentati italiani
- Caratteri speciali (è, à, ò, etc.) possono essere visualizzati male in Excel

**Impatto**:

- Internationalization: caratteri accentati possono essere corrotti
- UX: utente deve correggere manualmente encoding in Excel
- Compatibilità: problemi su Windows Excel

**Soluzione Proposta**:

```typescript
// Aggiungere BOM UTF-8 all'inizio del CSV
const BOM = '\uFEFF'
const csvContent = BOM + csvRows.join('\n')
```

---

### PROBLEMA 29: Cache `frequentQueryCache` Salvata Ma Mai Invalidata

**File**: `src/hooks/use-clienti.ts`  
**Righe**: 673, 762-768  
**Score Criticità**: 50  
**Categoria**: Cache Management / Stale Data

**Descrizione**:

- Cache viene salvata con `frequentQueryCache.set('clienti-list', filtered)` (riga 673)
- Cache viene letta in caso di timeout (righe 762-768)
- Ma cache non viene mai invalidata quando dati cambiano (eliminazione, modifica, creazione)
- Utente può vedere dati vecchi dalla cache

**Impatto**:

- Stale data: utente vede dati non aggiornati
- Confusione: dopo eliminazione/modifica, dati possono ancora apparire
- Data consistency: cache può essere inconsistente con database

**Soluzione Proposta**:

- Invalidare cache dopo `deleteCliente`, `updateCliente`
- Invalidare cache dopo creazione nuovo cliente
- Aggiungere TTL più breve o invalidazione esplicita

---

### PROBLEMA 30: Realtime Subscription Non Gestita Correttamente

**File**: `src/hooks/use-clienti.ts`  
**Righe**: 1108-1131  
**Score Criticità**: 55  
**Categoria**: Memory Leak / Cleanup

**Descrizione**:

- Realtime subscription viene creata in `useEffect` (righe 1108-1131)
- Ma `realtime` prop è sempre `false` nella pagina (riga 80 di `page.tsx`)
- Subscription viene creata ma mai utilizzata
- `fetchClienti` viene aggiunto alle dipendenze, ma non è memoizzato correttamente

**Impatto**:

- Memory leak potenziale: subscription può non essere cleanup correttamente
- Performance: subscription inutile viene creata anche se non usata
- Code smell: feature non utilizzata ma presente

**Soluzione Proposta**:

- Rimuovere subscription se `realtime` è sempre false
- Oppure: abilitare realtime e gestirlo correttamente
- Memoizzare `fetchClienti` con `useCallback` per evitare ri-creazioni subscription

---

## 🟢 PROBLEMI MINORI (Score 1-39)

### PROBLEMA 31: Avatar Initials Potrebbero Essere Migliorate

**File**: `src/components/dashboard/clienti/clienti-table-view.tsx`  
**Righe**: 171-172  
**Score Criticità**: 20  
**Categoria**: UX / Polish

**Descrizione**:

- Avatar initials usa fallback 'A' 'A' se nome/cognome mancanti (righe 171-172)
- Potrebbe usare iniziali da email o iniziali più intelligenti

**Soluzione**: Usare funzione helper per generare iniziali migliori.

---

### PROBLEMA 32: `ClientiToolbar` Ha Due Sezioni Separ Quanto allineamento può causare problemi

**File**: `src/components/dashboard/clienti/clienti-toolbar.tsx`  
**Righe**: 33-136  
**Score Criticità**: 25  
**Categoria**: Layout / Structure

**Descrizione**:

- Toolbar ha due `<div>` separati (righe 34-95, 97-136)
- Potrebbero essere unificati per migliore struttura

**Soluzione**: Unificare in un singolo container.

---

### PROBLEMA 33: Loading State Non Mostra Skeleton

**File**: `src/app/dashboard/clienti/page.tsx`  
**Righe**: 148-154  
**Score Criticità**: 30  
**Categoria**: UX / Loading

**Descrizione**:

- Loading state mostra solo `<LoadingState message="..." />`
- Non mostra skeleton della lista che verrà caricata
- UX migliore sarebbe mostrare skeleton della struttura

**Soluzione**: Implementare skeleton loader che mostra struttura lista.

---

### PROBLEMA 34: Error State Non Mostra Dettagli Errore

**File**: `src/app/dashboard/clienti/page.tsx`  
**Righe**: 157-163  
**Score Criticità**: 35  
**Categoria**: Error Handling / UX

**Descrizione**:

- Error state mostra solo messaggio generico `error` (riga 160)
- Non mostra dettagli tecnici o suggerimenti per risoluzione
- Non distingue tra diversi tipi di errore

**Soluzione**: Aggiungere dettagli errore e suggerimenti basati su tipo errore.

---

### PROBLEMA 35: Stats Cards Non Sono Cliccabili/Filtrabili

**File**: `src/app/dashboard/clienti/page.tsx`  
**Righe**: 257-284  
**Score Criticità**: 30  
**Categoria**: UX / Interactivity

**Descrizione**:

- Stats cards mostrano numeri ma non sono interattive
- Utente non può cliccare su "Clienti Attivi" per filtrare automaticamente
- Manca interattività che migliorerebbe UX

**Soluzione**: Rendere cards cliccabili per applicare filtro corrispondente.

---

### PROBLEMA 36: `formatClientiForExport` Usa `first_name` e `last_name` Invece di `nome` e `cognome`

**File**: `src/lib/export-utils.ts`  
**Righe**: 117  
**Score Criticità**: 25  
**Categoria**: Data Consistency

**Descrizione**:

- `formatClientiForExport` usa `c.nome` e `c.cognome` (riga 117)
- Ma tipo `Cliente` ha anche `first_name` e `last_name` (obbligatori)
- Dovrebbe usare `first_name`/`last_name` come primari, con fallback a `nome`/`cognome`

**Soluzione**: Usare `first_name`/`last_name` come primari, fallback a `nome`/`cognome`.

---

### PROBLEMA 37: `ClientiTableView` Non Ha Loading State Durante Sorting

**File**: `src/components/dashboard/clienti/clienti-table-view.tsx`  
**Righe**: 123-156  
**Score Criticità**: 25  
**Categoria**: UX / Feedback

**Descrizione**:

- Quando utente clicca header per sortare, non c'è feedback visivo
- Per sorting client-side, può esserci delay visibile senza feedback
- Manca loading indicator durante sorting

**Soluzione**: Aggiungere loading indicator durante sorting.

---

### PROBLEMA 38: `viewMode` Default 'grid' Ma Potrebbe Essere 'table'

**File**: `src/app/dashboard/clienti/page.tsx`  
**Righe**: 30  
**Score Criticità**: 15  
**Categoria**: UX / Defaults

**Descrizione**:

- Default `viewMode` è 'grid' (riga 30)
- Per dataset grandi, vista tabella potrebbe essere più appropriata
- Default potrebbe essere determinato dinamicamente

**Soluzione**: Usare 'table' come default o determinare dinamicamente.

---

### PROBLEMA 39: `pageSize` Hardcoded a 20

**File**: `src/app/dashboard/clienti/page.tsx`  
**Righe**: 79  
**Score Criticità**: 30  
**Categoria**: UX / Customization

**Descrizione**:

- `pageSize` è hardcoded a 20 (riga 79)
- Utente non può cambiare numero risultati per pagina
- Alcuni utenti preferiscono vedere più/meno risultati

**Soluzione**: Aggiungere selector per pageSize (10, 20, 50, 100).

---

### PROBLEMA 40: `ClientiGridView` Non Mostra Informazioni Complete

**File**: `src/components/dashboard/clienti/clienti-grid-view.tsx`  
**Righe**: 12-30  
**Score Criticità**: 35  
**Categoria**: UX / Information Display

**Descrizione**:

- Grid view mostra solo informazioni base tramite `ClienteCard`
- Non mostra tutte le informazioni disponibili in table view
- Utente deve cambiare vista per vedere informazioni complete

**Soluzione**: Aggiungere più informazioni a `ClienteCard` o implementare card espandibile.

---

### PROBLEMA 41: Nessuna Validazione Email Prima di Mailto

**File**: `src/app/dashboard/clienti/page.tsx`  
**Righe**: 89, 132  
**Score Criticità**: 30  
**Categoria**: Data Validation

**Descrizione**:

- `handleBulkEmail` e `handleSendEmail` non validano email prima di aprire mailto
- Se email è invalida, mailto può non funzionare
- Nessun feedback se email è invalida

**Soluzione**: Validare email prima di aprire mailto, mostrare errore se invalida.

---

### PROBLEMA 42: `aria-label` Inconsistente

**File**: `src/components/dashboard/clienti/clienti-table-view.tsx`  
**Righe**: 120, 165, 238, 249  
**Score Criticità**: 25  
**Categoria**: Accessibility

**Descrizione**:

- Alcuni elementi hanno `aria-label`, altri no
- Checkbox ha `aria-label` (righe 120, 165), ma altri bottoni no
- Inconsistenza nell'accessibilità

**Soluzione**: Aggiungere `aria-label` a tutti gli elementi interattivi senza testo visibile.

---

### PROBLEMA 43: `sr-only` Announce Non Aggiornato Dinamicamente

**File**: `src/app/dashboard/clienti/page.tsx`  
**Righe**: 217-219  
**Score Criticità**: 20  
**Categoria**: Accessibility

**Descrizione**:

- `<div role="status" aria-live="polite">` mostra solo count iniziale (righe 217-219)
- Non viene aggiornato quando clienti cambiano (filtri, paginazione)
- Screen reader non viene notificato di cambiamenti

**Soluzione**: Aggiornare announce quando `clienti` cambiano.

---

### PROBLEMA 44: Tooltip Mancanti per Icone

**File**: `src/components/dashboard/clienti/clienti-table-view.tsx`  
**Righe**: 230-242, 246-252  
**Score Criticità**: 20  
**Categoria**: UX / Accessibility

**Descrizione**:

- Bottoni con solo icone (righe 230-242, 246-252) hanno `aria-label`
- Ma non hanno tooltip visibile per utenti non screen reader
- Utente deve usare screen reader per capire cosa fa il bottone

**Soluzione**: Aggiungere tooltip visibili oltre a `aria-label`.

---

### PROBLEMA 45: Nessun Feedback Durante Export

**File**: `src/app/dashboard/clienti/page.tsx`  
**Righe**: 108-116  
**Score Criticità**: 35  
**Categoria**: UX / Feedback

**Descrizione**:

- `handleExportCSV` e `handleExportPDF` non mostrano feedback durante export
- Se export è lento, utente non sa se sta funzionando
- Nessun loading indicator o toast di successo

**Soluzione**: Aggiungere loading indicator e toast di successo/errore.

---

## 📝 Problemi Tecnici Specifici

### TypeScript Issues

**PROBLEMA T46**: `ProfileSummary` Type Non Completo

- File: `src/hooks/use-clienti.ts`, righe 52-71
- Tipo `ProfileSummary` non include tutti i campi necessari
- Dovrebbe estendere tipo completo da Supabase

**PROBLEMA T47**: Type Assertions Troppe

- File: `src/hooks/use-clienti.ts`, multiple righe
- Troppi `as` type assertions invece di validazione reale
- Dovrebbe usare type guards o validazione runtime

### Performance Issues

**PROBLEMA P48**: Query Multiple Sequentiali

- File: `src/hooks/use-clienti.ts`, righe 688-715
- Query `workout_logs` e `workout_plans` sono sequenziali
- Potrebbero essere parallele con `Promise.all()`

**PROBLEMA P49**: Cache Non Ottimizzata

- File: `src/hooks/use-clienti.ts`, righe 673, 111-116
- Cache stats ha TTL 2 minuti, ma viene invalidata troppo spesso
- Cache potrebbe essere più aggressiva

### Security Issues

**PROBLEMA S50**: Nessuna Sanitizzazione Input Export

- File: `src/lib/export-utils.ts`, righe 24-42
- CSV export non sanitizza input utente
- Possibili injection se dati contengono caratteri speciali

---

## 🎯 Priorità Risoluzione

### PRIORITÀ ALTA (Da fare subito):

1. PROBLEMA 1: Sostituire `confirm()` e `alert()` con componenti UI
2. PROBLEMA 3: Implementare paginazione server-side
3. PROBLEMA 7: Ottimizzare query `workout_logs` e `workout_plans`
4. PROBLEMA 8: Aggiungere error handling per export
5. PROBLEMA 15: Migliorare gestione errori bulk delete

### PRIORITÀ MEDIA (Prossimo sprint):

6. PROBLEMA 9: Calcolare stats basate su filtri attivi
7. PROBLEMA 13: Resettare selezione quando clienti cambiano
8. PROBLEMA 19: Aggiungere paginazione a GridView
9. PROBLEMA 27: Implementare PDF vero o rimuovere funzione
10. PROBLEMA 29: Invalidare cache correttamente

### PRIORITÀ BASSA (Backlog):

11. Tutti gli altri problemi minori
12. Miglioramenti UX/UI
13. Ottimizzazioni performance
14. Miglioramenti accessibilità

---

## 📋 Checklist Verifica

- [ ] Tutti i problemi critici risolti
- [ ] Tutti i problemi importanti risolti
- [ ] Test funzionali completati
- [ ] Test accessibilità completati
- [ ] Performance test completati
- [ ] Documentazione aggiornata

---

**Nota**: Questa analisi è completa al 2026-01-09. Dopo le correzioni, ri-analizzare per verificare risoluzione problemi.
