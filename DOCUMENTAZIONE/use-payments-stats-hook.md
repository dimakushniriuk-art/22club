# 📚 Documentazione Tecnica: usePaymentsStats

**Percorso**: `src/hooks/use-payments-stats.ts`  
**Tipo Modulo**: React Hook (Stats Hook, Client Component)  
**Stato Completamento**: ✅ 100%  
**Ultimo Aggiornamento**: 2025-02-02T00:00:00Z

---

## 📋 Panoramica

Hook per calcolo statistiche pagamenti mese corrente. Calcola revenue totale, lezioni acquistate, e numero pagamenti (escludendo storni).

---

## 🔧 Funzioni e Export

### 1. `usePaymentsStats`

**Classificazione**: React Hook, Stats Hook, Client Component, Pure  
**Tipo**: `(payments: Payment[]) => PaymentStats`

**Parametri**:

- `payments`: `Payment[]` - Array pagamenti

**Output**: Oggetto con:

- `totalRevenue`: `number` - Revenue totale mese corrente (somma `amount`)
- `totalLessons`: `number` - Lezioni acquistate mese corrente (somma `lessons_purchased`)
- `totalPayments`: `number` - Numero pagamenti mese corrente (escludendo storni)

**Descrizione**: Hook per calcolo statistiche mensili pagamenti con:

- Filtro mese corrente (mese e anno)
- Esclusione storni (`!payment.is_reversal`)
- Calcolo revenue, lezioni, e count pagamenti
- Memoization per performance

---

## 🔄 Flusso Logico

### Calcolo Statistiche

1. **Filtro Mese Corrente**:
   - Filtra pagamenti con `created_at` nel mese/anno corrente
   - Esclude storni (`!payment.is_reversal`)

2. **Calcolo Metriche**:
   - `totalRevenue`: `reduce((sum, p) => sum + p.amount, 0)`
   - `totalLessons`: `reduce((sum, p) => sum + p.lessons_purchased, 0)`
   - `totalPayments`: `monthlyPayments.length`

3. **Memoization**:
   - Ricalcola solo quando cambia `payments`

---

## 📊 Dipendenze

**Dipende da**: React (`useMemo`), tipo `Payment`

**Utilizzato da**: Dashboard pagamenti, componenti statistiche

---

## ⚠️ Note Tecniche

- **Mese Corrente**: Usa `Date.getMonth()` e `Date.getFullYear()` per filtrare
- **Esclusione Storni**: Solo pagamenti con `is_reversal === false`
- **Memoization**: Calcolo memoizzato per evitare ricalcoli inutili

---

**Ultimo aggiornamento**: 2025-02-02T00:00:00Z
