# useLessonCounters Hook - Documentazione Tecnica

**File**: `src/hooks/use-lesson-counters.ts`  
**Tipo**: React Hook (Custom Hook)  
**Righe**: 222  
**Stato**: ✅ COMPLETO (100%)  
**Ultimo Aggiornamento**: 2025-01-29T19:00:00Z

---

## 📋 Classificazione

- **Categoria**: Abbonamenti / Lezioni
- **Tipo**: Custom React Hook
- **Dipendenze**: React, Supabase Client
- **Utilizzato da**: `src/app/dashboard/abbonamenti/page.tsx`

---

## 🎯 Obiettivo

Gestire contatori lezioni per atleti:

- Fetch contatori (filtrati per ruolo)
- Aggiornamento contatore (aggiunta lezioni acquistate)
- Decremento contatore (uso lezione)
- Calcolo lezioni rimanenti

---

## 📥 Parametri

```typescript
interface UseLessonCountersProps {
  userId?: string | null
  role?: string | null
}
```

**Parametri**:

- `userId` (string | null): ID profilo utente
- `role` (string | null): Ruolo utente ('atleta' | 'admin' | 'pt')

---

## 📤 Output / Return Value

```typescript
{
  counters: LessonCounter[]
  loading: boolean
  error: string | null
  fetchCounters: () => Promise<void>
  updateCounter: (athleteId: string, lessonsPurchased: number) => Promise<LessonCounter>
  decrementCounter: (athleteId: string) => Promise<LessonCounter>
  getCounterForAthlete: (athleteId: string) => LessonCounter | undefined
  getRemainingLessons: (athleteId: string) => number
}
```

**Tipo `LessonCounter`**:

```typescript
{
  athlete_id: string
  lessons_total: number
  lessons_used: number
  updated_at: string
}
```

---

## 🔄 Flusso Logico

### 1. Fetch Contatori

- Se `role === 'atleta'`: filtra per `athlete_id = userId`
- Se `role === 'admin' || 'pt'`: mostra tutti i contatori
- Mappa dati da `Tables<'lesson_counters'>` a `LessonCounter`

### 2. Aggiornamento Contatore

- Legge contatore esistente per `athlete_id`
- Se esiste: update `lessons_total = existing + lessonsPurchased`
- Se non esiste: insert nuovo contatore con `lessons_total = lessonsPurchased`, `lessons_used = 0`
- Aggiorna `updated_at`
- Aggiorna stato locale

### 3. Decremento Contatore

- Legge contatore corrente per `athlete_id`
- Update `lessons_used = current + 1`
- Aggiorna `updated_at`
- Aggiorna stato locale

### 4. Utility

- `getCounterForAthlete()`: Trova contatore per atleta specifico
- `getRemainingLessons()`: Calcola `lessons_total - lessons_used`

---

## 🗄️ Database

### Tabelle Utilizzate

**`lesson_counters`**:

- `athlete_id` (uuid, PK, FK → profiles.id)
- `lessons_total` (integer) - lezioni totali acquistate
- `lessons_used` (integer) - lezioni utilizzate
- `updated_at` (timestamp)

**Relazione con `payments`**:

- Quando si crea un pagamento con `lessons_purchased > 0`, dovrebbe aggiornare `lesson_counters` (da verificare trigger)

---

## ⚠️ Errori Possibili

1. **Errore Supabase**: Errori da query/insert/update Supabase
2. **Contatore non trovato**: Errore quando si decrementa contatore inesistente

---

## 🔗 Dipendenze Critiche

- **Supabase Client**: `createClient()` da `@/lib/supabase`
- **Database**: `lesson_counters` table
- **RLS Policies**: Deve permettere lettura per atleti (solo propri) e staff (tutti)
- **Sincronizzazione**: Deve essere sincronizzato con `payments` table (trigger o logica applicazione)

---

## 📝 Esempio Utilizzo

```typescript
import { useLessonCounters } from '@/hooks/use-lesson-counters'

function AbbonamentiPage() {
  const { user } = useAuth()
  const { counters, loading, updateCounter, decrementCounter, getRemainingLessons } =
    useLessonCounters({
      userId: user?.id,
      role: user?.role,
    })

  const handlePurchase = async (athleteId: string, lessons: number) => {
    await updateCounter(athleteId, lessons)
  }

  const remaining = getRemainingLessons(athleteId)
  // Mostra lezioni rimanenti
}
```

---

## 🐛 Problemi Identificati

1. **⚠️ RLS su `lesson_counters`**: Possibile problema RLS (non verificato)
2. **⚠️ Sincronizzazione contatori**: Creazione pagamento non aggiorna automaticamente `lesson_counters` (da verificare trigger)
3. **⚠️ Scadenze abbonamenti**: Nessuna logica per gestire scadenze abbonamenti

---

## 📊 Metriche

- **Complessità Ciclomatica**: Bassa (~6-8)
- **Dipendenze Esterne**: 1 (Supabase)
- **Side Effects**: Sì (database)

---

## 🔄 Changelog

### 2025-01-29T19:00:00Z

- ✅ Documentazione iniziale creata
- ✅ Identificati problemi RLS e sincronizzazione
- ✅ Mappate dipendenze database

---

**Stato**: ✅ DOCUMENTATO (100%)
