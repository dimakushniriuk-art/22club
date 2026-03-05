# useDocuments Hook - Documentazione Tecnica

**File**: `src/hooks/use-documents.ts`  
**Tipo**: React Hook (Custom Hook)  
**Righe**: 148  
**Stato**: ✅ COMPLETO (100%)  
**Ultimo Aggiornamento**: 2025-01-29T19:00:00Z

---

## 📋 Classificazione

- **Categoria**: Documenti / File Management
- **Tipo**: Custom React Hook
- **Dipendenze**: React, Supabase Client
- **Utilizzato da**: `src/app/dashboard/documenti/page.tsx`, componenti documenti

---

## 🎯 Obiettivo

Gestire CRUD documenti per atleti, inclusa:

- Fetch documenti (con filtri per atleta, status, categoria, ricerca)
- Refresh documenti
- Trasformazione dati con nomi utenti

---

## 📥 Parametri

```typescript
interface UseDocumentsProps {
  athleteId?: string | null
  filters?: {
    status?: string
    category?: string
    search?: string
  }
}
```

**Parametri**:

- `athleteId` (string | null): ID atleta per filtrare documenti
- `filters` (object, optional):
  - `status`: Filtro per stato documento ('valido' | 'scaduto' | 'in-revisione' | 'in_scadenza' | 'non_valido')
  - `category`: Filtro per categoria documento
  - `search`: Ricerca testuale su `file_name` e `notes`

---

## 📤 Output / Return Value

```typescript
{
  documents: Document[]
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
}
```

**Tipo `Document`**:

```typescript
{
  id: string
  org_id: string
  athlete_id: string
  file_url: string
  file_name: string
  file_size: number
  file_type: string
  category: string
  status: 'valido' | 'scaduto' | 'in-revisione' | 'in_scadenza' | 'non_valido'
  expires_at: string | null
  uploaded_by_user_id: string
  uploaded_by_name: string | null
  notes: string | null
  created_at: string
  updated_at?: string
  athlete_name: string | null
  staff_name: string | null
}
```

---

## 🔄 Flusso Logico

### 1. Fetch Documenti

- Query base su `documents` con join a `profiles`:
  - `athlete:profiles!athlete_id(nome, cognome)`
  - `uploaded_by:profiles!uploaded_by_user_id(nome, cognome)`
- Applica filtri:
  - `athleteId`: `eq('athlete_id', athleteId)`
  - `status`: `eq('status', filters.status)`
  - `category`: `eq('category', filters.category)`
- Ordina per `created_at` (desc)
- Trasforma dati:
  - Combina `nome` e `cognome` per `athlete_name` e `staff_name`
  - Normalizza `status` (default: 'valido')
  - Gestisce valori null/undefined

### 2. Filtro Ricerca (Client-side)

- Se `filters.search` presente:
  - Filtra su `file_name` (case-insensitive)
  - Filtra su `notes` (case-insensitive)

### 3. Refresh

- Richiama `fetchDocuments()` per ricaricare dati

---

## 🗄️ Database

### Tabelle Utilizzate

**`documents`**:

- `id` (uuid, PK)
- `org_id` (uuid, FK → organizations.id)
- `athlete_id` (uuid, FK → profiles.id)
- `file_url` (text) - URL file in Supabase Storage
- `file_name` (text)
- `file_size` (integer)
- `file_type` (text)
- `category` (text) - categoria documento
- `status` (text) - 'valido' | 'scaduto' | 'in-revisione' | 'in_scadenza' | 'non_valido'
- `expires_at` (timestamp, nullable)
- `uploaded_by_user_id` (uuid, FK → profiles.id)
- `notes` (text, nullable)
- `created_at` (timestamp)
- `updated_at` (timestamp)

**Join con `profiles`**:

- `athlete:profiles!athlete_id(nome, cognome)`
- `uploaded_by:profiles!uploaded_by_user_id(nome, cognome)`

### Storage Buckets

- **`documents`**: Bucket Supabase Storage per file documenti (da verificare esistenza - P1-003)

---

## ⚠️ Errori Possibili

1. **Errore Supabase**: Errori da query Supabase
2. **Errore trasformazione dati**: Errori nella mappatura nomi utenti

---

## 🔗 Dipendenze Critiche

- **Supabase Client**: `createClient()` da `@/lib/supabase`
- **Database**: `documents` table
- **Storage**: Bucket `documents` (P1-003 - da verificare)
- **RLS Policies**: Deve permettere lettura per atleti (solo propri) e staff (tutti)

---

## 📝 Esempio Utilizzo

```typescript
import { useDocuments } from '@/hooks/use-documents'

function DocumentiPage() {
  const { documents, loading, refetch } = useDocuments({
    athleteId: selectedAthleteId,
    filters: {
      status: 'valido',
      category: 'certificato',
      search: 'medico'
    }
  })

  return (
    <div>
      {documents.map(doc => (
        <DocumentCard key={doc.id} document={doc} />
      ))}
    </div>
  )
}
```

---

## 🐛 Problemi Identificati

1. **🔴 P1-003**: Storage bucket `documents` mancante - già identificato ma non collegato a questo modulo
2. **⚠️ RLS Storage bucket**: Possibile problema accesso file se RLS storage non configurato
3. **⚠️ Gestione scadenze**: Nessuna logica automatica per aggiornare `status` quando `expires_at` scade
4. **⚠️ Validazione file upload**: Nessuna validazione formato/dimensione file nel hook (gestita altrove)

---

## 📊 Metriche

- **Complessità Ciclomatica**: Bassa (~5-7)
- **Dipendenze Esterne**: 1 (Supabase)
- **Side Effects**: Sì (database)

---

## 🔄 Changelog

### 2025-01-29T19:00:00Z

- ✅ Documentazione iniziale creata
- ✅ Identificati problemi storage e scadenze
- ✅ Mappate dipendenze database

---

**Stato**: ✅ DOCUMENTATO (100%)
