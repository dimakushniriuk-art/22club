# 📚 Documentazione Tecnica: useDocumentsFilters

**Percorso**: `src/hooks/use-documents-filters.ts`  
**Tipo Modulo**: React Hook (Filters Hook, Client Component)  
**Stato Completamento**: ✅ 100%  
**Ultimo Aggiornamento**: 2025-02-02T00:00:00Z

---

## 📋 Panoramica

Hook per gestione filtri documenti client-side. Gestisce ricerca (nome atleta, nome file, categoria), filtro stato, filtro categoria, e reset filtri.

---

## 🔧 Funzioni e Export

### 1. `useDocumentsFilters`

**Classificazione**: React Hook, Filters Hook, Client Component, Pure  
**Tipo**: `(documents: Document[]) => UseDocumentsFiltersReturn`

**Parametri**:

- `documents`: `Document[]` - Array documenti da filtrare

**Output**: Oggetto con:

- **Stato Filtri**:
  - `searchTerm`: `string` - Termine ricerca
  - `statusFilter`: `string` - Filtro stato
  - `categoryFilter`: `string` - Filtro categoria
- **Dati Filtrati**:
  - `filteredDocuments`: `Document[]` - Documenti filtrati (calcolato con `useMemo`)
- **Setters**:
  - `setSearchTerm`: `(term: string) => void`
  - `setStatusFilter`: `(status: string) => void`
  - `setCategoryFilter`: `(category: string) => void`
  - `resetFilters()`: `() => void` - Reset tutti i filtri

**Descrizione**: Hook semplice per filtraggio client-side documenti con:

- Ricerca per nome atleta (`athlete_name`), nome file (`file_name`), o categoria (`category`)
- Filtro per stato esatto
- Filtro per categoria esatta
- Reset completo filtri

---

## 🔄 Flusso Logico

### Filtraggio

1. **Ricerca** (`searchTerm`):
   - Filtra per `athlete_name`, `file_name`, o `category` (case-insensitive)

2. **Filtro Stato** (`statusFilter`):
   - Filtra per `status === statusFilter` (match esatto)

3. **Filtro Categoria** (`categoryFilter`):
   - Filtra per `category === categoryFilter` (match esatto)

4. **Reset**:
   - Reset tutti i filtri a stringa vuota

---

## 📊 Dipendenze

**Dipende da**: React (`useState`, `useMemo`), tipo `Document`

**Utilizzato da**: Componenti lista documenti

---

## ⚠️ Note Tecniche

- **Client-Side Only**: Filtraggio in memoria, non query database
- **Case-Insensitive**: Ricerca non case-sensitive
- **Memoization**: `filteredDocuments` calcolato con `useMemo` per performance

---

**Ultimo aggiornamento**: 2025-02-02T00:00:00Z
