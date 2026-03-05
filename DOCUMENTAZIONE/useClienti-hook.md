# useClienti Hook - Documentazione Tecnica

**File**: `src/hooks/use-clienti.ts`  
**Tipo**: React Hook (Custom Hook)  
**Righe**: 706  
**Stato**: ✅ COMPLETO (100%)  
**Ultimo Aggiornamento**: 2025-01-29T19:00:00Z

---

## 📋 Classificazione

- **Categoria**: Clienti / Gestione Atleti
- **Tipo**: Custom React Hook
- **Dipendenze**: React, Supabase, React Query (implicito)
- **Utilizzato da**: `src/app/dashboard/clienti/page.tsx` (757 righe)

---

## 🎯 Obiettivo

Gestire CRUD clienti/atleti con:

- Fetch clienti con filtri avanzati (stato, data iscrizione, documenti scadenza, tags, ricerca)
- Paginazione client-side
- Statistiche clienti (totali, attivi, inattivi, nuovi mese, documenti scadenza)
- Update/Delete clienti
- Realtime subscriptions
- Fallback su mock data se Supabase non configurato

---

## 📥 Parametri

```typescript
interface UseClientiOptions {
  filters?: Partial<ClienteFilters>
  sort?: ClienteSort
  page?: number
  pageSize?: number
  realtime?: boolean
}
```

**Filtri**:

- `search`: Ricerca testuale (nome, cognome, email)
- `stato`: 'tutti' | 'attivo' | 'inattivo'
- `dataIscrizioneDa`: Date (ISO string)
- `dataIscrizioneA`: Date (ISO string)
- `allenamenti_min`: number (minimo allenamenti mese)
- `solo_documenti_scadenza`: boolean
- `tags`: string[] (tag clienti)

**Sort**:

- `field`: 'data_iscrizione' | 'nome' | 'cognome' | 'email'
- `direction`: 'asc' | 'desc'

---

## 📤 Output / Return Value

```typescript
{
  clienti: Cliente[]
  stats: ClienteStats
  total: number
  totalPages: number
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
  updateCliente: (id: string, updates: Partial<Cliente>) => Promise<void>
  deleteCliente: (id: string) => Promise<void>
}
```

---

## 🔄 Flusso Logico

### 1. Fetch Statistiche

- Prova RPC `get_clienti_stats` (timeout 3s)
- Fallback su query multiple con `estimated count` (timeout 2s per query)
- Calcola: totali, attivi, inattivi, nuovi_mese, documenti_scadenza

### 2. Fetch Clienti

- Se Supabase non configurato: usa mock data
- Query semplificata: carica `pageSize * 5` record
- Filtri applicati client-side (per performance con dataset piccoli)
- Paginazione client-side
- Sort client-side se campo diverso da `data_iscrizione`

### 3. Update/Delete

- Update: `supabase.from('profiles').update().eq('id', id)`
- Delete: `supabase.from('profiles').delete().eq('id', id)`
- Ricarica lista dopo operazione

### 4. Realtime

- Sottoscrive a `profiles` table changes
- Refetch automatico su insert/update/delete

---

## 🗄️ Database

### Tabelle Utilizzate

**`profiles`**:

- `id`, `user_id`, `nome`, `cognome`, `email`, `phone`
- `data_iscrizione`, `stato`, `documenti_scadenza`
- `role` (filtro: 'atleta' | 'athlete')
- `avatar`, `avatar_url`, `ultimo_accesso`, `note`

**`pt_atleti`**:

- Relazione PT-Atleta (non usata direttamente nel hook)

**`cliente_tags`**, `profiles_tags`:

- Tags clienti (non usati direttamente nel hook)

### RPC Functions

**`get_clienti_stats()`**:

- Restituisce statistiche aggregate
- Timeout 3s, fallback su query multiple

---

## ⚠️ Errori Possibili

1. **RPC Timeout**: RPC `get_clienti_stats` può andare in timeout (fallback automatico)
2. **Query Timeout**: Query individuali possono andare in timeout (fallback a 0)
3. **Errore Supabase**: Errori da query/update/delete

---

## 🔗 Dipendenze Critiche

- **Supabase Client**: `useSupabase()` hook
- **Database**: `profiles` table
- **RLS Policies**: Deve permettere lettura per PT/Admin
- **RPC Functions**: `get_clienti_stats` (opzionale, ha fallback)

---

## 📝 Esempio Utilizzo

```typescript
import { useClienti } from '@/hooks/use-clienti'

function ClientiPage() {
  const { clienti, stats, loading, refetch, updateCliente } = useClienti({
    filters: {
      search: 'Mario',
      stato: 'attivo',
      solo_documenti_scadenza: false
    },
    sort: { field: 'data_iscrizione', direction: 'desc' },
    page: 1,
    pageSize: 20
  })

  return (
    <div>
      <StatsCard stats={stats} />
      {clienti.map(cliente => (
        <ClienteCard key={cliente.id} cliente={cliente} />
      ))}
    </div>
  )
}
```

---

## 🐛 Problemi Identificati

1. **🟡 P4-001 Pattern**: Pagina clienti 757 righe (simile a WorkoutWizard)
2. **⚠️ RLS su `pt_atleti`**: Possibile problema RLS (vedi P1-001 - menzionato ma non specifico)
3. **⚠️ Performance**: Query client-side può essere lenta con molti clienti (carica `pageSize * 5`)
4. **⚠️ Export CSV/PDF**: Funzionalità export non implementata nel hook

---

## 📊 Metriche

- **Complessità Ciclomatica**: Alta (~20-25)
- **Dipendenze Esterne**: 2 (Supabase, useSupabaseWithRetry)
- **Side Effects**: Sì (database, realtime)

---

## 🔄 Changelog

### 2025-01-29T19:00:00Z

- ✅ Documentazione iniziale creata
- ✅ Identificati problemi performance e RLS
- ✅ Mappate dipendenze database

---

**Stato**: ✅ DOCUMENTATO (100%)
