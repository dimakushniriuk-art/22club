# 📚 Documentazione Tecnica: useClientiSelection

**Percorso**: `src/hooks/use-clienti-selection.ts`  
**Tipo Modulo**: React Hook (Selection State Hook, Client Component)  
**Stato Completamento**: ✅ 100%  
**Ultimo Aggiornamento**: 2025-02-02T00:00:00Z

---

## 📋 Panoramica

Hook per gestione selezione multipla clienti. Gestisce stato selezione (Set di ID), seleziona/deseleziona singoli o tutti, e fornisce array clienti selezionati.

---

## 🔧 Funzioni e Export

### 1. `useClientiSelection`

**Classificazione**: React Hook, Selection State Hook, Client Component, Pure  
**Tipo**: `(clienti: Cliente[]) => UseClientiSelectionReturn`

**Parametri**:

- `clienti`: `Cliente[]` - Array clienti disponibili

**Output**: Oggetto con:

- `selectedIds`: `Set<string>` - Set di ID clienti selezionati
- `selectedClienti`: `Cliente[]` - Array clienti selezionati (filtrati da `clienti`)
- `handleSelectAll(e)`: `(e: React.ChangeEvent<HTMLInputElement>) => void` - Seleziona/deseleziona tutti
- `handleSelectOne(id, e)`: `(id: string, e: React.ChangeEvent<HTMLInputElement>) => void` - Seleziona/deseleziona singolo
- `clearSelection()`: `() => void` - Pulisce selezione

**Descrizione**: Hook semplice per gestione selezione multipla con:

- Stato interno `Set<string>` per ID selezionati
- Handler per checkbox "seleziona tutti"
- Handler per checkbox singolo cliente
- Funzione per pulire selezione
- Array clienti selezionati calcolato automaticamente

---

## 🔄 Flusso Logico

### Inizializzazione

1. Hook inizializza `selectedIds` come `Set<string>` vuoto
2. `selectedClienti` calcolato filtrando `clienti` per ID in `selectedIds`

### Seleziona Tutti

1. `handleSelectAll(e)`:
   - Se `e.target.checked === true` → `setSelectedIds(new Set(clienti.map(c => c.id)))`
   - Se `e.target.checked === false` → `setSelectedIds(new Set())`

### Seleziona Singolo

1. `handleSelectOne(id, e)`:
   - Crea nuovo Set da `selectedIds`
   - Se `e.target.checked === true` → `newSelected.add(id)`
   - Se `e.target.checked === false` → `newSelected.delete(id)`
   - Aggiorna stato con nuovo Set

### Pulisci Selezione

1. `clearSelection()`:
   - `setSelectedIds(new Set())`

---

## 📊 Dipendenze

**Dipende da**: React (`useState`), tipo `Cliente`

**Utilizzato da**: Componenti che necessitano selezione multipla clienti (es. bulk actions, export, etc.)

---

## ⚠️ Note Tecniche

- **Set per Performance**: Usa `Set<string>` invece di array per O(1) lookup
- **Reactive**: `selectedClienti` si aggiorna automaticamente quando cambia `selectedIds` o `clienti`
- **Controlled Component**: Gestisce eventi checkbox, non gestisce rendering UI

---

**Ultimo aggiornamento**: 2025-02-02T00:00:00Z
