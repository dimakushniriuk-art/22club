# useProgress Hook - Documentazione Tecnica

**File**: `src/hooks/use-progress.ts`  
**Tipo**: React Hook (Custom Hook)  
**Righe**: 258  
**Stato**: ✅ COMPLETO (100%)  
**Ultimo Aggiornamento**: 2025-01-29T19:00:00Z

---

## 📋 Classificazione

- **Categoria**: Progressi / Tracking Atleta
- **Tipo**: Custom React Hook
- **Dipendenze**: React, Supabase Client
- **Utilizzato da**: Componenti progressi, pages progressi

---

## 🎯 Obiettivo

Gestire CRUD progressi atleti, inclusa:

- Fetch progress logs (misure, peso, forza)
- Fetch progress photos
- Creazione log e foto
- Calcolo statistiche progressi
- Utility per calcolo variazioni (peso, forza)

---

## 📥 Parametri

```typescript
interface UseProgressProps {
  userId?: string | null
  role?: string | null
}
```

**Parametri**:

- `userId` (string | null): ID profilo atleta
- `role` (string | null): Ruolo utente ('atleta' | 'admin' | 'pt')

---

## 📤 Output / Return Value

```typescript
{
  progressLogs: ProgressLog[]
  progressPhotos: ProgressPhoto[]
  loading: boolean
  error: string | null
  fetchProgressLogs: () => Promise<void>
  fetchProgressPhotos: () => Promise<void>
  createProgressLog: (logData: Omit<ProgressLog, 'id' | 'created_at' | 'updated_at'>) => Promise<ProgressLog>
  createProgressPhoto: (photoData: Omit<ProgressPhoto, 'id' | 'created_at' | 'updated_at'>) => Promise<ProgressPhoto>
  getProgressStats: () => Promise<ProgressStats | null>
  getLatestProgressLog: () => Promise<ProgressLog | null>
  getPhotosForDate: (date: string) => ProgressPhoto[]
  hasPhotosForDate: (date: string) => boolean
  getWeightChange: (current: number, previous?: number) => { value: number, isPositive: boolean, percentage: string } | null
  getStrengthChange: (current: number, previous?: number) => { value: number, isPositive: boolean, percentage: string } | null
}
```

**Tipi**:

```typescript
interface ProgressLog {
  id: string
  athlete_id: string
  date: string
  weight_kg?: number | null
  chest_cm?: number | null
  waist_cm?: number | null
  hips_cm?: number | null
  biceps_cm?: number | null
  thighs_cm?: number | null
  strength_notes?: string | null
  created_at: string
  updated_at?: string
}

interface ProgressPhoto {
  id: string
  athlete_id: string
  date: string
  photo_url: string
  notes?: string | null
  created_at: string
  updated_at?: string
}

interface ProgressStats {
  total_logs: number
  avg_weight?: number
  total_photos: number
  weight_change_30d?: number
  latest_measurements?: {
    chest_cm: number | null
    waist_cm: number | null
    hips_cm: number | null
    biceps_cm: number | null
    thighs_cm: number | null
  }
}
```

---

## 🔄 Flusso Logico

### 1. Fetch Progress Logs

- Se `role === 'atleta'`: filtra per `athlete_id = userId`
- Se `role === 'admin' || 'pt'`: mostra tutti i log
- Ordina per `date` (desc)

### 2. Fetch Progress Photos

- Stessa logica filtri di logs
- Ordina per `date` (desc)

### 3. Creazione Progress Log

- Inserisce in `progress_logs`
- Ricarica lista logs

### 4. Creazione Progress Photo

- Inserisce in `progress_photos`
- Ricarica lista foto

### 5. Statistiche Progressi

- Query ultimi 2 log per calcolo variazione peso
- Query ultima foto
- Calcola:
  - `total_logs`: conteggio totale
  - `avg_weight`: media peso da tutti i log
  - `total_photos`: conteggio foto
  - `weight_change_30d`: differenza tra ultimo e penultimo log
  - `latest_measurements`: misure ultimo log

### 6. Utility Variazioni

- **`getWeightChange`**: Calcola variazione peso (perdita = positiva)
- **`getStrengthChange`**: Calcola variazione forza (aumento = positivo)
- **`getPhotosForDate`**: Filtra foto per data specifica
- **`hasPhotosForDate`**: Verifica esistenza foto per data

---

## 🗄️ Database

### Tabelle Utilizzate

**`progress_logs`**:

- `id` (uuid, PK)
- `athlete_id` (uuid, FK → profiles.id)
- `date` (date)
- `weight_kg` (numeric, nullable)
- `chest_cm` (numeric, nullable)
- `waist_cm` (numeric, nullable)
- `hips_cm` (numeric, nullable)
- `biceps_cm` (numeric, nullable)
- `thighs_cm` (numeric, nullable)
- `strength_notes` (text, nullable)
- `created_at` (timestamp)
- `updated_at` (timestamp)

**`progress_photos`**:

- `id` (uuid, PK)
- `athlete_id` (uuid, FK → profiles.id)
- `date` (date)
- `photo_url` (text) - URL foto in Supabase Storage
- `notes` (text, nullable)
- `created_at` (timestamp)
- `updated_at` (timestamp)

### Storage Buckets

- **`progress-photos`**: Bucket Supabase Storage per foto progressi (da verificare esistenza - P1-003)

---

## ⚠️ Errori Possibili

1. **Errore Supabase**: Errori da query/insert Supabase
2. **User ID mancante**: Ritorna `null` per statistiche se `userId` non presente

---

## 🔗 Dipendenze Critiche

- **Supabase Client**: `createClient()` da `@/lib/supabase`
- **Database**: `progress_logs`, `progress_photos` tables
- **Storage**: Bucket `progress-photos` (P1-003 - da verificare)
- **RLS Policies**: Deve permettere lettura per atleti (solo propri) e staff (tutti)

---

## 📝 Esempio Utilizzo

```typescript
import { useProgress } from '@/hooks/use-progress'

function ProgressiPage() {
  const { user } = useAuth()
  const {
    progressLogs,
    progressPhotos,
    loading,
    createProgressLog,
    getProgressStats,
    getWeightChange
  } = useProgress({
    userId: user?.id,
    role: user?.role
  })

  const stats = await getProgressStats()
  const weightChange = getWeightChange(
    progressLogs[0]?.weight_kg,
    progressLogs[1]?.weight_kg
  )

  return (
    <div>
      <StatsCard stats={stats} />
      {progressLogs.map(log => (
        <ProgressLogCard key={log.id} log={log} />
      ))}
    </div>
  )
}
```

---

## 🐛 Problemi Identificati

1. **🔴 P1-003**: Storage bucket `progress-photos` mancante - già identificato ma non collegato
2. **⚠️ RLS Storage bucket**: Possibile problema accesso foto se RLS storage non configurato
3. **⚠️ Calcolo statistiche**: Query manuale invece di RPC (funzione non esistente nel DB)
4. **⚠️ Reminder progressi**: Funzionalità reminder non implementata nel hook (vedi `use-progress-reminders.ts`)

---

## 📊 Metriche

- **Complessità Ciclomatica**: Media (~10-12)
- **Dipendenze Esterne**: 1 (Supabase)
- **Side Effects**: Sì (database, storage)

---

## 🔄 Changelog

### 2025-01-29T19:00:00Z

- ✅ Documentazione iniziale creata
- ✅ Identificati problemi storage e statistiche
- ✅ Mappate dipendenze database

---

**Stato**: ✅ DOCUMENTATO (100%)
