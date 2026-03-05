# 📚 Documentazione Tecnica: usePayments

**Percorso**: `src/hooks/use-payments.ts`  
**Tipo Modulo**: React Hook (Data Fetching Hook, CRUD Hook, Client Component)  
**Stato Completamento**: ✅ 100%  
**Ultimo Aggiornamento**: 2025-02-02T00:00:00Z

---

## 📋 Panoramica

Hook principale per gestione pagamenti. Fornisce fetch lista con filtri ruolo, CRUD (create, reverse), calcolo statistiche, e join con profili atleti/staff.

---

## 🔧 Funzioni e Export

### 1. `usePayments`

**Classificazione**: React Hook, Data Fetching Hook, CRUD Hook, Client Component, Async  
**Tipo**: `(props: UsePaymentsProps) => UsePaymentsReturn`

**Parametri**:

- `props`: `UsePaymentsProps`
  - `userId?`: `string | null` - ID utente corrente
  - `role?`: `string | null` - Ruolo utente ('atleta' | 'admin' | 'pt')

**Output**: Oggetto con:

- **Dati**:
  - `payments`: `Payment[]` - Array pagamenti (con `athlete_name` e `created_by_staff_name`)
  - `loading`: `boolean` - Stato caricamento
  - `error`: `string | null` - Errore
- **Operazioni**:
  - `fetchPayments()`: `Promise<void>` - Ricarica pagamenti
  - `createPayment(paymentData)`: `Promise<Payment>` - Crea pagamento
  - `reversePayment(paymentId, reason)`: `Promise<Payment>` - Crea storno pagamento
  - `getStats()`: `() => PaymentStats` - Calcola statistiche mese corrente

**Descrizione**: Hook completo per gestione pagamenti con:

- Fetch lista con filtri basati su ruolo:
  - `'atleta'`: WHERE `athlete_id = userId`
  - `'admin' | 'pt'`: tutti i pagamenti (nessun filtro)
- Join con `profiles` per nomi atleti e staff
- CRUD operations (create, reverse)
- Calcolo statistiche mese corrente (revenue, lezioni, count)

---

## 🔄 Flusso Logico

### Fetch Payments

1. **Query Base**:
   - SELECT da `payments` con join:
     - `athlete:profiles!athlete_id(nome, cognome)`
     - `created_by_staff:profiles!created_by_staff_id(nome, cognome)`

2. **Filtri Ruolo**:
   - `'atleta'`: WHERE `athlete_id = userId`
   - `'admin' | 'pt'`: nessun filtro (vede tutti)

3. **Trasformazione Dati**:
   - Aggiunge `athlete_name`: `${athlete.nome} ${athlete.cognome}`
   - Aggiunge `created_by_staff_name`: `${staff.nome} ${staff.cognome}`

4. **Ordinamento**:
   - ORDER BY `created_at DESC`

### Create Payment

1. INSERT in `payments` con `paymentData`
2. Refetch automatico lista

### Reverse Payment

1. **Fetch Pagamento Originale**:
   - SELECT `payments` WHERE `id = paymentId`

2. **Crea Storno**:
   - INSERT nuovo pagamento con:
     - `athlete_id`: stesso del pagamento originale
     - `amount`: `-originalPayment.amount` (negativo)
     - `method_text`: `${original.method_text} (Storno: ${reason})`
     - `lessons_purchased`: 0
     - `is_reversal`: true
     - `ref_payment_id`: ID pagamento originale

3. Refetch automatico lista

### Get Stats

1. Filtra pagamenti mese corrente (`created_at` nel mese/anno corrente)
2. Esclude storni (`!payment.is_reversal`)
3. Calcola:
   - `totalRevenue`: somma `amount`
   - `totalLessons`: somma `lessons_purchased`
   - `totalPayments`: count pagamenti
   - `allPayments`: count totale (inclusi storni)

---

## 📊 Dipendenze

**Dipende da**: React (`useState`, `useEffect`, `useCallback`), `createClient` (Supabase), tipo `Payment`

**Utilizzato da**: Pagina pagamenti, componenti gestione pagamenti

---

## ⚠️ Note Tecniche

- **Join Supabase**: Usa sintassi `profiles!athlete_id` per join automatico
- **Storni**: Creano nuovo record con `amount` negativo e `is_reversal = true`
- **Statistiche**: Calcolate client-side (mese corrente, escludendo storni)

---

**Ultimo aggiornamento**: 2025-02-02T00:00:00Z
