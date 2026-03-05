# 📚 Documentazione Tecnica: useClientiFilters

**Percorso**: `src/hooks/use-clienti-filters.ts`  
**Tipo Modulo**: React Hook (Filters State Hook, Client Component)  
**Stato Completamento**: ✅ 100%  
**Ultimo Aggiornamento**: 2025-02-02T00:00:00Z

---

## 📋 Panoramica

Hook per gestione filtri e ordinamento clienti con sincronizzazione URL. Gestisce ricerca (debounced), filtri stato, filtri avanzati (date, allenamenti, documenti), paginazione, e sorting. Sincronizza stato con URL query params.

---

## 🔧 Funzioni e Export

### 1. `useClientiFilters`

**Classificazione**: React Hook, Filters State Hook, Client Component, URL Sync  
**Tipo**: `() => UseClientiFiltersReturn`

**Parametri**: Nessuno (usa `useSearchParams` per inizializzazione da URL)

**Output**: Oggetto con:

- **Stato Filtri Base**:
  - `searchTerm`: `string` - Termine ricerca (non debounced)
  - `statoFilter`: `'tutti' | 'attivo' | 'inattivo' | 'sospeso'` - Filtro stato
  - `page`: `number` - Pagina corrente
- **Sorting**:
  - `sort`: `ClienteSort` - `{ field: string, direction: 'asc' | 'desc' }`
  - `handleSort(field)`: `(field: ClienteSort['field']) => void` - Toggle sort per campo
  - `setSort`: `(sort: ClienteSort) => void` - Imposta sort direttamente
- **Filtri Avanzati**:
  - `advancedFilters`: `Partial<ClienteFilters>` - Filtri avanzati (date, allenamenti, documenti)
  - `setAdvancedFilters`: `(filters: Partial<ClienteFilters>) => void` - Aggiorna filtri avanzati
- **Filtri Completi**:
  - `filters`: `Partial<ClienteFilters>` - Filtri completi (base + avanzati + ricerca debounced)
- **Setters**:
  - `updateSearchTerm(value)`: `(value: string) => void` - Aggiorna ricerca e URL
  - `updateStatoFilter(value)`: `(value) => void` - Aggiorna filtro stato e URL
  - `updatePage(newPage)`: `(newPage: number) => void` - Aggiorna pagina e URL
  - `resetFilters()`: `() => void` - Reset tutti i filtri e URL

**Descrizione**: Hook completo per gestione filtri clienti con:

- Inizializzazione da URL query params (`useSearchParams`)
- Ricerca con debounce (300ms) per evitare query eccessive
- Filtri base: ricerca, stato
- Filtri avanzati: date iscrizione, allenamenti minimi, documenti scadenza
- Paginazione sincronizzata con URL
- Sorting con toggle ascendente/discendente
- Sincronizzazione automatica URL (Next.js router)

---

## 🔄 Flusso Logico

### Inizializzazione

1. Legge URL query params:
   - `search` → `searchTerm`
   - `stato` → `statoFilter`
   - `page` → `page`
2. Inizializza `sort` con default: `{ field: 'data_iscrizione', direction: 'desc' }`
3. Inizializza `advancedFilters` vuoto

### Ricerca Debounced

1. `searchTerm` aggiornato immediatamente (UI reattiva)
2. `debouncedSearch` calcolato con `useDebouncedValue(searchTerm, 300)`
3. `filters.search` usa `debouncedSearch` (evita query eccessive)

### Aggiornamento Filtri

1. **Ricerca**: `updateSearchTerm(value)`:
   - Aggiorna `searchTerm`
   - Aggiorna URL con `?search=value`
2. **Stato**: `updateStatoFilter(value)`:
   - Aggiorna `statoFilter`
   - Aggiorna URL con `?stato=value`
3. **Pagina**: `updatePage(newPage)`:
   - Aggiorna `page`
   - Aggiorna URL con `?page=newPage`
4. **Filtri Avanzati**: `setAdvancedFilters(filters)`:
   - Aggiorna `advancedFilters`
   - Non aggiorna URL (filtri avanzati non in URL)

### Sorting

1. `handleSort(field)`:
   - Se `sort.field === field` → toggle `direction` (asc ↔ desc)
   - Altrimenti → imposta `field` e `direction: 'asc'`

### Reset Filtri

1. `resetFilters()`:
   - Reset `searchTerm`, `statoFilter`, `advancedFilters`, `page`
   - Aggiorna URL con valori default

### Costruzione Filtri Completi

1. `filters` calcolato con `useMemo`:
   ```typescript
   {
     search: debouncedSearch,
     stato: statoFilter,
     ...advancedFilters
   }
   ```

---

## 📊 Dipendenze

**Dipende da**: React (`useState`, `useMemo`), Next.js (`useSearchParams`, `useRouter`), `useDebouncedValue`, tipo `ClienteFilters`, `ClienteSort`

**Utilizzato da**: Pagina clienti, componenti filtri clienti

---

## ⚠️ Note Tecniche

- **URL Sync**: Sincronizza filtri base con URL (ricerca, stato, pagina) per bookmarking e condivisione
- **Debounce Ricerca**: 300ms debounce per evitare query eccessive durante digitazione
- **Filtri Avanzati**: Non sincronizzati con URL (troppo complessi per query params)
- **Sorting Toggle**: Toggle automatico ascendente/discendente per stesso campo

---

**Ultimo aggiornamento**: 2025-02-02T00:00:00Z
