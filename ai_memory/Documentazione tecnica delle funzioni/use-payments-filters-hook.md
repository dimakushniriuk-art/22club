# 📚 Documentazione Tecnica: usePaymentsFilters

**Percorso**: `src/hooks/use-payments-filters.ts`  
**Tipo Modulo**: React Hook (Filters Hook, Client Component)  
**Stato Completamento**: ✅ 100%  
**Ultimo Aggiornamento**: 2025-02-02T00:00:00Z

---

## 📋 Panoramica

Hook per gestione filtri pagamenti client-side. Gestisce ricerca (nome atleta, metodo), filtro metodo, filtro stato (attivi/storni), e reset filtri.

---

## 🔧 Funzioni e Export

### 1. `usePaymentsFilters`

**Classificazione**: React Hook, Filters Hook, Client Component, Pure  
**Tipo**: `(payments: Payment[]) => UsePaymentsFiltersReturn`

**Parametri**:

- `payments`: `Payment[]` - Array pagamenti da filtrare

**Output**: Oggetto con:

- **Stato Filtri**:
  - `searchTerm`: `string` - Termine ricerca
  - `methodFilter`: `string` - Filtro metodo pagamento
  - `statusFilter`: `string` - Filtro stato ('active' | 'reversals' | '')
- **Dati Filtrati**:
  - `filteredPayments`: `Payment[]` - Pagamenti filtrati (calcolato con `useMemo`)
- **Setters**:
  - `setSearchTerm`: `(term: string) => void`
  - `setMethodFilter`: `(method: string) => void`
  - `setStatusFilter`: `(status: string) => void`
  - `resetFilters()`: `() => void` - Reset tutti i filtri

**Descrizione**: Hook semplice per filtraggio client-side pagamenti con:

- Ricerca per nome atleta (`athlete_name`) o metodo (`method_text`)
- Filtro per metodo pagamento esatto
- Filtro stato: 'active' (non storni) o 'reversals' (solo storni)
- Reset completo filtri

---

## 🔄 Flusso Logico

### Filtraggio

1. **Ricerca** (`searchTerm`):
   - Filtra per `athlete_name` o `method_text` (case-insensitive)

2. **Filtro Metodo** (`methodFilter`):
   - Filtra per `method_text === methodFilter` (match esatto)

3. **Filtro Stato** (`statusFilter`):
   - `'active'` → `!payment.is_reversal`
   - `'reversals'` → `payment.is_reversal`
   - `''` → nessun filtro

4. **Reset**:
   - Reset tutti i filtri a stringa vuota

---

## 📊 Dipendenze

**Dipende da**: React (`useState`, `useMemo`), tipo `Payment`

**Utilizzato da**: Componenti lista pagamenti

---

## ⚠️ Note Tecniche

- **Client-Side Only**: Filtraggio in memoria, non query database
- **Case-Insensitive**: Ricerca non case-sensitive
- **Memoization**: `filteredPayments` calcolato con `useMemo` per performance

---

**Ultimo aggiornamento**: 2025-02-02T00:00:00Z
