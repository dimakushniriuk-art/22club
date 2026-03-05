# usePayments Hook - Documentazione Tecnica

**File**: `src/hooks/use-payments.ts`  
**Tipo**: React Hook (Custom Hook)  
**Righe**: 175  
**Stato**: ✅ COMPLETO (100%)  
**Ultimo Aggiornamento**: 2025-01-29T19:00:00Z

---

## 📋 Classificazione

- **Categoria**: Pagamenti / Finanze
- **Tipo**: Custom React Hook
- **Dipendenze**: React, Supabase Client
- **Utilizzato da**: `src/app/dashboard/pagamenti/page.tsx`, componenti pagamenti

---

## 🎯 Obiettivo

Gestire CRUD pagamenti per atleti, inclusa:

- Fetch pagamenti (filtrati per ruolo)
- Creazione pagamento
- Storno pagamento (reversal)
- Calcolo statistiche mensili

---

## 📥 Parametri

```typescript
interface UsePaymentsProps {
  userId?: string | null
  role?: string | null
}
```

**Parametri**:

- `userId` (string | null): ID profilo utente corrente
- `role` (string | null): Ruolo utente ('atleta' | 'admin' | 'pt')

---

## 📤 Output / Return Value

```typescript
{
  payments: Payment[]
  loading: boolean
  error: string | null
  fetchPayments: () => Promise<void>
  createPayment: (paymentData: Omit<Payment, 'id' | 'created_at' | 'updated_at' | 'athlete_name' | 'created_by_staff_name'>) => Promise<Payment>
  reversePayment: (paymentId: string, reason: string) => Promise<Payment>
  getStats: () => {
    totalRevenue: number
    totalLessons: number
    totalPayments: number
    allPayments: number
  }
}
```

---

## 🔄 Flusso Logico

### 1. Fetch Pagamenti

- Se `role === 'atleta'`: filtra per `athlete_id = userId`
- Se `role === 'admin' || 'pt'`: mostra tutti i pagamenti
- Join con `profiles` per nomi atleta e staff
- Ordina per `created_at` (desc)
- Trasforma dati aggiungendo `athlete_name` e `created_by_staff_name`

### 2. Creazione Pagamento

- Inserisce in `payments` table
- Ricarica lista pagamenti
- Restituisce pagamento creato

### 3. Storno Pagamento

- Legge pagamento originale
- Crea nuovo pagamento con:
  - `amount: -originalPayment.amount` (negativo)
  - `method_text: "${original.method_text} (Storno: ${reason})"`
  - `lessons_purchased: 0`
  - `is_reversal: true`
  - `ref_payment_id: paymentId` (riferimento al pagamento originale)
- Ricarica lista pagamenti

### 4. Statistiche Mensili

- Filtra pagamenti del mese corrente
- Esclude storni (`!payment.is_reversal`)
- Calcola:
  - `totalRevenue`: somma `amount`
  - `totalLessons`: somma `lessons_purchased`
  - `totalPayments`: conteggio pagamenti mensili
  - `allPayments`: totale pagamenti (tutti i tempi)

---

## 🗄️ Database

### Tabelle Utilizzate

**`payments`**:

- `id` (uuid, PK)
- `athlete_id` (uuid, FK → profiles.id)
- `amount` (numeric) - può essere negativo per storni
- `method_text` (text) - metodo pagamento
- `lessons_purchased` (integer) - lezioni acquistate
- `created_by_staff_id` (uuid, FK → profiles.id)
- `is_reversal` (boolean) - se è uno storno
- `ref_payment_id` (uuid, nullable, FK → payments.id) - riferimento pagamento originale
- `created_at` (timestamp)
- `updated_at` (timestamp)

**Join con `profiles`**:

- `athlete:profiles!athlete_id(nome, cognome)`
- `created_by_staff:profiles!created_by_staff_id(nome, cognome)`

---

## ⚠️ Errori Possibili

1. **User ID mancante**: `Error('User ID is required')` (per reversePayment)
2. **Errore Supabase**: Errori da query/insert Supabase
3. **Pagamento non trovato**: Errore quando si cerca pagamento originale per storno

---

## 🔗 Dipendenze Critiche

- **Supabase Client**: `createClient()` da `@/lib/supabase`
- **Database**: `payments` table
- **RLS Policies**: Deve permettere lettura per atleti (solo propri) e staff (tutti)

---

## 📝 Esempio Utilizzo

```typescript
import { usePayments } from '@/hooks/use-payments'

function PagamentiPage() {
  const { user } = useAuth()
  const { payments, loading, createPayment, reversePayment, getStats } = usePayments({
    userId: user?.id,
    role: user?.role,
  })

  const handleCreate = async () => {
    await createPayment({
      athlete_id: athleteId,
      amount: 100,
      method_text: 'Carta',
      lessons_purchased: 10,
      created_by_staff_id: user.id,
    })
  }

  const stats = getStats()
  // stats.totalRevenue, stats.totalLessons, etc.
}
```

---

## 🐛 Problemi Identificati

1. **🔴 P1-001**: RLS su `payments` - 0 righe visibili (4 reali) - già identificato ma non specifico
2. **⚠️ Validazione importi**: Nessuna validazione che `amount > 0` (tranne storni)
3. **⚠️ Sincronizzazione `lesson_counters`**: Creazione pagamento non aggiorna automaticamente `lesson_counters` (da verificare trigger)
4. **⚠️ Export pagamenti**: Funzionalità export non implementata nel hook

---

## 📊 Metriche

- **Complessità Ciclomatica**: Media (~8-10)
- **Dipendenze Esterne**: 1 (Supabase)
- **Side Effects**: Sì (database)

---

## 🔄 Changelog

### 2025-01-29T19:00:00Z

- ✅ Documentazione iniziale creata
- ✅ Identificati problemi RLS e validazione
- ✅ Mappate dipendenze database

---

**Stato**: ✅ DOCUMENTATO (100%)
