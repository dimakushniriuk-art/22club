# 💪 API Exercises Route - Documentazione Tecnica

**File**: `src/app/api/exercises/route.ts`  
**Classificazione**: Next.js API Route, Server Component, Async Function  
**Stato**: ✅ COMPLETO (100%)  
**Ultimo Aggiornamento**: 2025-01-29T17:10:00Z

---

## 📋 Panoramica

API route Next.js per operazioni CRUD su esercizi. Supporta GET (lista), POST (creazione), PUT (modifica), DELETE (eliminazione) con autenticazione, autorizzazione, validazione Zod, e mappatura difficoltà multi-lingua.

---

## 🔧 Endpoints

### GET `/api/exercises`

**Descrizione**: Recupera lista completa di esercizi

**Autenticazione**: Opzionale (ma consigliata per RLS)

**Query Parameters**: Nessuno

**Response**:

```typescript
{
  data: ExerciseRow[]  // Array di esercizi
}
```

**Status Codes**:

- `200`: Successo
- `403`: Accesso negato (RLS policy)
- `500`: Errore server

**Comportamento**:

- Seleziona tutti gli esercizi ordinati per nome
- Arricchisce dati con campi opzionali (fallback a `null`)
- Gestisce errori RLS con messaggio chiaro

---

### POST `/api/exercises`

**Descrizione**: Crea un nuovo esercizio

**Autenticazione**: Obbligatoria

**Request Body**:

```typescript
{
  name: string                    // 2-120 caratteri
  category?: string               // 2-60 caratteri (opzionale)
  muscle_group?: string           // 2-60 caratteri (opzionale, alias di category)
  equipment?: string              // 2-60 caratteri (opzionale)
  difficulty?: 'easy' | 'medium' | 'hard' | 'bassa' | 'media' | 'alta'  // Opzionale
  description?: string           // Max 2000 caratteri (opzionale)
  video_url?: string             // URL valido (opzionale)
  thumb_url?: string             // URL valido (opzionale)
  image_url?: string             // URL valido (opzionale)
  duration_seconds?: number      // Intero positivo (opzionale)
}
```

**Response**:

```typescript
{
  ok: true
}
```

**Status Codes**:

- `200`: Esercizio creato
- `400`: Validazione fallita (Zod error)
- `401`: Non autenticato
- `500`: Errore server

**Comportamento**:

1. Valida input con Zod schema
2. Verifica autenticazione utente
3. Recupera `org_id` dal profilo utente
4. Mappa difficoltà (easy/medium/hard → bassa/media/alta)
5. Inserisce in database con `created_by = user.id`
6. Ritorna successo

---

### PUT `/api/exercises`

**Descrizione**: Modifica un esercizio esistente

**Autenticazione**: Obbligatoria

**Request Body**:

```typescript
{
  id: string                     // UUID esercizio (obbligatorio)
  name?: string                  // 2-120 caratteri (opzionale)
  category?: string              // 2-60 caratteri (opzionale)
  muscle_group?: string          // 2-60 caratteri (opzionale)
  equipment?: string             // 2-60 caratteri (opzionale)
  difficulty?: string            // Opzionale
  description?: string           // Max 2000 caratteri (opzionale)
  video_url?: string             // URL valido (opzionale)
  thumb_url?: string             // URL valido (opzionale)
  image_url?: string             // URL valido (opzionale)
  duration_seconds?: number      // Intero positivo (opzionale)
}
```

**Response**:

```typescript
{
  ok: true
}
```

**Status Codes**:

- `200`: Esercizio modificato
- `400`: Validazione fallita (Zod error o ID mancante)
- `401`: Non autenticato
- `500`: Errore server

**Comportamento**:

1. Valida input con Zod schema esteso (include `id`)
2. Verifica autenticazione
3. Normalizza difficoltà se presente
4. Aggiorna solo campi forniti (partial update)
5. Ritorna successo

---

### DELETE `/api/exercises`

**Descrizione**: Elimina un esercizio

**Autenticazione**: Obbligatoria

**Request Body**:

```typescript
{
  id: string // UUID esercizio (obbligatorio)
}
```

**Response**:

```typescript
{
  ok: true
}
```

**Status Codes**:

- `200`: Esercizio eliminato
- `400`: ID non valido
- `401`: Non autenticato
- `500`: Errore server

**Comportamento**:

1. Valida ID con Zod schema
2. Verifica autenticazione
3. Elimina esercizio dal database
4. Ritorna successo

---

## 🔄 Flusso Logico

### 1. Validazione Input (Zod)

```typescript
const exerciseSchema = z.object({
  name: z.string().min(2).max(120),
  category: z.string().min(2).max(60).optional(),
  muscle_group: z.string().min(2).max(60).optional(),
  equipment: z.string().min(2).max(60).optional(),
  difficulty: z.enum(['easy', 'medium', 'hard', 'bassa', 'media', 'alta']).optional(),
  description: z.string().max(2000).optional(),
  video_url: z.string().url().optional(),
  thumb_url: z.string().url().optional(),
  image_url: z.string().url().optional(),
  duration_seconds: z.number().int().positive().optional(),
})

const parsed = exerciseSchema.safeParse(json)
if (!parsed.success) {
  return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
}
```

**Validazioni**:

- `name`: 2-120 caratteri (obbligatorio per POST)
- `category`/`muscle_group`: 2-60 caratteri (opzionale)
- `equipment`: 2-60 caratteri (opzionale)
- `difficulty`: Enum valori supportati (opzionale)
- `description`: Max 2000 caratteri (opzionale)
- `video_url`/`thumb_url`/`image_url`: URL valido (opzionale)
- `duration_seconds`: Intero positivo (opzionale)

### 2. Mappatura Difficoltà

```typescript
const difficultyMap: Record<
  | 'easy'
  | 'medium'
  | 'hard'
  | 'bassa'
  | 'media'
  | 'alta'
  | 'beginner'
  | 'intermediate'
  | 'advanced',
  ExerciseRow['difficulty']
> = {
  easy: 'bassa',
  medium: 'media',
  hard: 'alta',
  bassa: 'bassa',
  media: 'media',
  alta: 'alta',
  beginner: 'bassa',
  intermediate: 'media',
  advanced: 'alta',
}
```

**Mappatura**:

- Inglese → Italiano: `easy` → `bassa`, `medium` → `media`, `hard` → `alta`
- Italiano → Italiano: `bassa` → `bassa`, `media` → `media`, `alta` → `alta`
- Livelli → Italiano: `beginner` → `bassa`, `intermediate` → `media`, `advanced` → `alta`

**Default**: Se difficoltà non fornita o non riconosciuta, usa `'media'`

### 3. Recupero Org ID

```typescript
const {
  data: { user },
} = await supabase.auth.getUser()
if (!user) {
  return NextResponse.json({ error: 'Autenticazione richiesta' }, { status: 401 })
}

const { data: profile } = await supabase
  .from('profiles')
  .select('org_id')
  .eq('user_id', user.id)
  .single()

const orgId: string | null = typeof profile?.org_id === 'string' ? profile.org_id : null
```

**Comportamento**:

- Recupera utente autenticato
- Cerca profilo associato
- Estrae `org_id` per multi-tenancy
- Fallback a `null` se profilo non trovato

### 4. Inserimento Database (POST)

```typescript
const insertPayload: TablesInsert<'exercises'> = {
  name: payload.name,
  muscle_group: payload.muscle_group ?? payload.category ?? 'Generale',
  difficulty: difficultyMap[difficultyKey] ?? 'media',
  created_at: new Date().toISOString(),
  created_by: user.id,
  description: payload.description ?? null,
  equipment: payload.equipment ?? null,
  image_url: payload.image_url ?? null,
  video_url: payload.video_url ?? null,
  thumb_url: payload.thumb_url ?? null,
  duration_seconds: payload.duration_seconds ?? null,
  category: payload.category ?? payload.muscle_group ?? null,
  org_id: orgId,
}

const { error: insertError } = await supabase.from('exercises').insert(insertPayload)
```

**Comportamento**:

- Costruisce payload con tutti i campi
- Usa `muscle_group` o `category` (preferenza a `muscle_group`)
- Default `muscle_group: 'Generale'` se entrambi mancanti
- Default `difficulty: 'media'` se non fornita
- Imposta `created_by` a `user.id`
- Imposta `org_id` dal profilo

### 5. Aggiornamento Database (PUT)

```typescript
const updatePayload: TablesUpdate<'exercises'> = {}

if (rest.name !== undefined) updatePayload.name = rest.name
if (rest.category !== undefined) updatePayload.category = rest.category ?? rest.muscle_group ?? null
if (rest.muscle_group !== undefined)
  updatePayload.muscle_group = rest.muscle_group ?? rest.category ?? null
// ... altri campi

if (rest.difficulty) {
  const normalizedDifficulty =
    difficultyMap[rest.difficulty as keyof typeof difficultyMap] ?? rest.difficulty
  updatePayload.difficulty = normalizedDifficulty
}

const { error: updateError } = await supabase.from('exercises').update(updatePayload).eq('id', id)
```

**Comportamento**:

- Aggiorna solo campi forniti (partial update)
- Normalizza difficoltà se presente
- Gestisce `category`/`muscle_group` come alias

---

## ⚠️ Errori Possibili

### Errori Validazione

- **Zod Validation Error**: Se input non valida schema
  - Sintomo: `400 Bad Request` con `parsed.error.flatten()`
  - Fix: Verificare formato input, lunghezza stringhe, tipo dati

- **Missing Required Fields**: Se `name` mancante in POST
  - Sintomo: `400 Bad Request` con errore Zod
  - Fix: Fornire `name` obbligatorio

### Errori Autenticazione

- **Not Authenticated**: Se utente non autenticato
  - Sintomo: `401 Unauthorized` con messaggio "Autenticazione richiesta"
  - Fix: Assicurarsi che utente sia autenticato prima di chiamare API

### Errori Database

- **RLS Policy Error**: Se RLS policies bloccano operazione
  - Sintomo: `403 Forbidden` o `permission denied` error
  - Fix: Verificare RLS policies su tabella `exercises` (vedi P1-001)

- **Foreign Key Error**: Se `created_by` non esiste in `auth.users`
  - Sintomo: `Foreign key constraint violation`
  - Fix: Verificare che `user.id` esista

- **Insert/Update Error**: Se operazione database fallisce
  - Sintomo: `500 Internal Server Error` con messaggio Supabase
  - Fix: Verificare schema database, constraint, RLS policies

### Errori Network

- **Timeout**: Se query database troppo lenta
  - Sintomo: `500 Internal Server Error` con timeout
  - Fix: Ottimizzare query, aggiungere indici

---

## 🔗 Dipendenze Critiche

### Dipendenze Esterne

1. **Next.js** (`next/server`)
   - `NextResponse` per risposte HTTP

2. **Zod** (`zod`)
   - Validazione schema input

3. **Supabase Client** (`@/lib/supabase/server`)
   - `createClient()` per operazioni database

4. **Types** (`@/types/supabase`)
   - `Tables`, `TablesInsert`, `TablesUpdate` per type safety

### Dipendenze Interne

- **Database Schema**: Tabella `exercises` con colonne corrette
- **RLS Policies**: Policies configurate per permettere operazioni a PT/Admin
- **Profiles Table**: Per recupero `org_id` utente

---

## 📝 Esempi d'Uso

### Esempio 1: Creare Esercizio

```typescript
const response = await fetch('/api/exercises', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'Squat con Bilanciere',
    muscle_group: 'Gambe',
    equipment: 'Bilanciere',
    difficulty: 'media',
    description: 'Esercizio fondamentale per gambe e glutei',
  }),
})

if (response.ok) {
  const data = await response.json()
  console.log('Esercizio creato:', data)
}
```

### Esempio 2: Modificare Esercizio

```typescript
const response = await fetch('/api/exercises', {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    id: 'exercise-uuid',
    name: 'Squat con Bilanciere (Modificato)',
    difficulty: 'alta',
  }),
})
```

### Esempio 3: Eliminare Esercizio

```typescript
const response = await fetch('/api/exercises', {
  method: 'DELETE',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    id: 'exercise-uuid',
  }),
})
```

### Esempio 4: Lista Esercizi

```typescript
const response = await fetch('/api/exercises')
if (response.ok) {
  const { data } = await response.json()
  console.log('Esercizi:', data)
}
```

### Esempio 5: Con Gestione Errori

```typescript
try {
  const response = await fetch('/api/exercises', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(exerciseData),
  })

  if (!response.ok) {
    const error = await response.json()
    if (response.status === 400) {
      console.error('Validazione fallita:', error.error)
    } else if (response.status === 401) {
      console.error('Non autenticato')
    } else {
      console.error('Errore server:', error.error)
    }
    return
  }

  const data = await response.json()
  console.log('Successo:', data)
} catch (err) {
  console.error('Errore network:', err)
}
```

---

## 🎯 Side-Effects

### Side-Effects Positivi

1. **Database Operations**: INSERT, UPDATE, DELETE su tabella `exercises`
2. **Console Logging**: Log errori e successi per debugging
3. **HTTP Responses**: Ritorna risposte HTTP con status codes appropriati

### Side-Effects Negativi (da evitare)

- Nessun side-effect negativo identificato

---

## 🔍 Note Tecniche

### Performance

- **Query Ottimizzate**: GET ordina per nome (richiede indice su `name`)
- **Partial Updates**: PUT aggiorna solo campi forniti (riduce payload)
- **Error Handling**: Gestione errori robusta con logging

### Limitazioni

- **Nessuna Autorizzazione Esplicita**: Non verifica ruolo PT/Admin (dipende da RLS)
- **Nessuna Validazione Video URL**: Accetta qualsiasi URL (vedi P4-006)
- **Nessun Rate Limiting**: Non limita numero richieste

### Miglioramenti Futuri

- Aggiungere verifica ruolo PT/Admin esplicita
- Validare formato video URL (mp4, webm, etc.)
- Aggiungere rate limiting per prevenire abuse
- Aggiungere paginazione per GET (se molti esercizi)
- Aggiungere filtri query parameters per GET (search, muscle_group, etc.)

---

## 📚 Changelog

### 2025-01-29T17:10:00Z - Documentazione Iniziale

- ✅ Documentazione completa API route `/api/exercises`
- ✅ Descrizione tutti gli endpoint (GET, POST, PUT, DELETE)
- ✅ Validazione Zod e mappatura difficoltà
- ✅ Esempi d'uso completi
- ✅ Gestione errori
- ⚠️ Identificato problema P4-006 (validazione video URL mancante)

---

**Stato**: ✅ COMPLETO  
**Prossimi Passi**: Documentare sistema Schede Allenamento
