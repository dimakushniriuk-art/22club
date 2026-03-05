# useAllenamenti Hook - Documentazione Tecnica

**File**: `src/hooks/use-allenamenti.ts`  
**Tipo**: React Hook (Custom Hook)  
**Righe**: 432  
**Stato**: ✅ COMPLETO (100%)  
**Ultimo Aggiornamento**: 2025-01-29T19:00:00Z

---

## 📋 Classificazione

- **Categoria**: Allenamenti / Workout Logs
- **Tipo**: Custom React Hook
- **Dipendenze**: React, Supabase, React Query (implicito)
- **Utilizzato da**: Componenti allenamenti, pages allenamenti

---

## 🎯 Obiettivo

Gestire CRUD allenamenti (workout logs) con:

- Fetch allenamenti con filtri (stato, atleta, periodo, date, ricerca)
- Calcolo statistiche (oggi, completati, in_corso, programmati, saltati, questa_settimana, questo_mese)
- Sort (data, atleta, durata)
- Realtime subscriptions
- Fallback su mock data se Supabase non configurato

---

## 📥 Parametri

```typescript
filters?: Partial<AllenamentoFilters>
sort?: AllenamentoSort
```

**Filtri**:

- `stato`: 'tutti' | 'completato' | 'in_corso' | 'programmato' | 'saltato'
- `atleta_id`: string
- `periodo`: 'tutti' | 'oggi' | 'settimana' | 'mese'
- `data_da`: Date (ISO string)
- `data_a`: Date (ISO string)
- `search`: string (ricerca su nome atleta o scheda)

**Sort**:

- 'data_desc' | 'data_asc' | 'atleta_asc' | 'durata_desc'

---

## 📤 Output / Return Value

```typescript
{
  allenamenti: Allenamento[]
  stats: AllenamentoStats
  loading: boolean
  error: Error | null
}
```

**Tipo `Allenamento`**:

```typescript
{
  id: string
  atleta_id: string
  atleta_nome: string
  scheda_id: string
  scheda_nome: string
  data: string
  durata_minuti: number
  stato: 'completato' | 'in_corso' | 'programmato' | 'saltato'
  esercizi_completati: number
  esercizi_totali: number
  volume_totale: number
  note: string | null
  created_at: string
  updated_at: string
}
```

---

## 🔄 Flusso Logico

### 1. Fetch Allenamenti

- Se Supabase non configurato: usa mock data
- Query `workout_logs` con join a `profiles` (atleta) e `workout_plans` (scheda)
- Applica filtri database (stato, atleta_id, periodo, date)
- Filtro ricerca applicato client-side (nome atleta, nome scheda)
- Sort applicato client-side
- Mappa `WorkoutLogWithRelations` → `Allenamento`

### 2. Calcolo Statistiche

- Filtra per data (oggi, settimana, mese)
- Conta per stato (completati, in_corso, programmati, saltati)
- Calcola: oggi, questa_settimana, questo_mese

### 3. Realtime

- Sottoscrive a `workout_logs` table changes
- Refetch automatico su insert/update/delete

---

## 🗄️ Database

### Tabelle Utilizzate

**`workout_logs`**:

- `id` (uuid, PK)
- `atleta_id` (uuid, FK → profiles.id)
- `scheda_id` (uuid, FK → workout_plans.id)
- `data` (date)
- `durata_minuti` (integer)
- `stato` (text) - 'completato' | 'in_corso' | 'programmato' | 'saltato'
- `esercizi_completati` (integer)
- `esercizi_totali` (integer)
- `volume_totale` (numeric)
- `note` (text, nullable)
- `created_at` (timestamp)
- `updated_at` (timestamp)

**Join**:

- `atleta:profiles!workout_logs_atleta_id_fkey(id, nome, cognome)`
- `scheda:workout_plans!workout_logs_scheda_id_fkey(id, name)`

---

## ⚠️ Errori Possibili

1. **Errore Supabase**: Errori da query Supabase
2. **Errore mapping**: Errori nella trasformazione dati

---

## 🔗 Dipendenze Critiche

- **Supabase Client**: `useSupabase()` hook
- **Database**: `workout_logs`, `profiles`, `workout_plans` tables
- **RLS Policies**: Deve permettere lettura per atleti (solo propri) e staff (tutti)

---

## 📝 Esempio Utilizzo

```typescript
import { useAllenamenti } from '@/hooks/use-allenamenti'

function AllenamentiPage() {
  const { allenamenti, stats, loading } = useAllenamenti(
    {
      stato: 'completato',
      periodo: 'mese',
      search: 'Mario'
    },
    'data_desc'
  )

  return (
    <div>
      <StatsCard stats={stats} />
      {allenamenti.map(allenamento => (
        <AllenamentoCard key={allenamento.id} allenamento={allenamento} />
      ))}
    </div>
  )
}
```

---

## 🐛 Problemi Identificati

1. **⚠️ RLS su `workout_logs`**: Possibile problema RLS (non verificato)
2. **⚠️ Calcolo statistiche**: Calcolo client-side può essere lento con molti allenamenti
3. **⚠️ Export allenamenti**: Funzionalità export non implementata nel hook
4. **⚠️ Filtri avanzati performance**: Query può essere lenta con molti filtri

---

## 📊 Metriche

- **Complessità Ciclomatica**: Media (~12-15)
- **Dipendenze Esterne**: 2 (Supabase, useSupabaseWithRetry)
- **Side Effects**: Sì (database, realtime)

---

## 🔄 Changelog

### 2025-01-29T19:00:00Z

- ✅ Documentazione iniziale creata
- ✅ Identificati problemi RLS e performance
- ✅ Mappate dipendenze database

---

**Stato**: ✅ DOCUMENTATO (100%)
