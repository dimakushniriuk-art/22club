# 📊 Analisi Completa: Creazione Esercizi e Gestione File Multimediali

**Data Analisi**: 2025-01-30  
**Versione**: 1.0  
**Stato**: Analisi Completa

---

## 📋 Indice

1. [Architettura Generale](#architettura-generale)
2. [Flusso Creazione Esercizio](#flusso-creazione-esercizio)
3. [Gestione File Multimediali](#gestione-file-multimediali)
4. [Struttura Database](#struttura-database)
5. [Storage Supabase](#storage-supabase)
6. [Problemi Identificati](#problemi-identificati)
7. [Raccomandazioni](#raccomandazioni)
8. [SQL per Fix](#sql-per-fix)

---

## 🏗️ Architettura Generale

### Componenti Principali

1. **Frontend UI**: `src/components/dashboard/exercise-form-modal.tsx`
   - Form per creazione/modifica esercizi
   - Upload video e thumbnail con drag & drop
   - Generazione automatica thumbnail da video

2. **API Route**: `src/app/api/exercises/route.ts`
   - `GET`: Lista esercizi
   - `POST`: Creazione nuovo esercizio
   - `PUT`: Modifica esercizio esistente
   - `DELETE`: Eliminazione esercizio

3. **Database**: Tabella `exercises` in Supabase
   - Struttura definita in `supabase/migrations/20250110_005_exercises.sql`
   - Colonne multimediali: `video_url`, `thumb_url`, `image_url`

4. **Storage Buckets**: Supabase Storage
   - `exercise-videos`: Video esercizi (pubblico, max 50MB)
   - `exercise-thumbs`: Thumbnail esercizi (pubblico, max 5MB)

---

## 🔄 Flusso Creazione Esercizio

### 1. Frontend - Upload Video (`exercise-form-modal.tsx`)

```typescript
// Linee 78-189: handleVideoUpload
```

**Processo**:

1. ✅ Validazione tipo file (`file.type.startsWith('video/')`)
2. ✅ Generazione nome file univoco: `${user.id}/${Date.now()}-${random}.${ext}`
3. ✅ Upload a Supabase Storage bucket `exercise-videos`
   - Opzioni: `upsert: true`, `cacheControl: '3600'`
4. ✅ Generazione URL pubblico con `getPublicUrl()`
5. ✅ **Generazione automatica thumbnail** dal video:
   - Crea elemento `<video>` temporaneo
   - Estrae frame a `currentTime = 0.5`
   - Converte a canvas → blob JPEG
   - Upload thumbnail a bucket `exercise-thumbs`
6. ✅ Aggiornamento form state con `video_url` e `thumb_url`

**Problemi**:

- ❌ Nessuna validazione dimensione file (max 50MB non applicato lato client)
- ❌ Nessun rollback se upload thumbnail fallisce
- ❌ File vecchi non eliminati se si sostituisce video

### 2. Frontend - Upload Thumbnail Manuale

```typescript
// Linee 191-228: handleThumbnailUpload
```

**Processo**:

1. ✅ Validazione tipo file (`file.type.startsWith('image/')`)
2. ✅ Generazione nome file univoco
3. ✅ Upload a bucket `exercise-thumbs`
4. ✅ Aggiornamento form state

**Problemi**:

- ❌ Nessuna validazione dimensione file
- ❌ File vecchi non eliminati se si sostituisce thumbnail

### 3. Frontend - Salvataggio Esercizio

```typescript
// Linee 230-289: handleSave
```

**Processo**:

1. ✅ Validazione campi obbligatori (`name`, `muscle_group`)
2. ✅ Preparazione payload (rimozione campi non necessari)
3. ✅ Chiamata API `/api/exercises` (POST o PUT)
4. ✅ Gestione errori e toast notifications

**Problemi**:

- ❌ Nessun rollback file storage se salvataggio DB fallisce
- ❌ File caricati rimangono nello storage anche se esercizio non viene salvato

### 4. Backend - API POST `/api/exercises`

```typescript
// Linee 126-189: POST handler
```

**Processo**:

1. ✅ Validazione schema Zod (`exerciseSchema`)
2. ✅ Autenticazione utente
3. ✅ Recupero `org_id` da profilo
4. ✅ Normalizzazione `difficulty` (mapping valori)
5. ✅ Inserimento in database `exercises`
6. ✅ Risposta JSON `{ ok: true }`

**Problemi**:

- ❌ **CRITICO**: Nessuna gestione file storage
- ❌ Se inserimento DB fallisce, file già caricati rimangono orfani
- ❌ Nessuna validazione esistenza file prima di salvare URL

### 5. Backend - API PUT `/api/exercises`

```typescript
// Linee 193-250: PUT handler
```

**Processo**:

1. ✅ Validazione schema con `id`
2. ✅ Autenticazione
3. ✅ Aggiornamento selettivo campi
4. ✅ Normalizzazione `difficulty`
5. ✅ Update database

**Problemi**:

- ❌ **CRITICO**: File vecchi non eliminati quando si aggiorna `video_url` o `thumb_url`
- ❌ Accumulo file orfani nello storage

### 6. Backend - API DELETE `/api/exercises`

```typescript
// Linee 254-284: DELETE handler
```

**Processo**:

1. ✅ Validazione `id` UUID
2. ✅ Autenticazione
3. ✅ Eliminazione record da database

**Problemi**:

- ❌ **CRITICO**: File multimediali NON vengono eliminati dallo storage
- ❌ Accumulo file orfani dopo eliminazione esercizi

---

## 📁 Gestione File Multimediali

### Upload Video

**Bucket**: `exercise-videos`  
**Path Pattern**: `${user.id}/${timestamp}-${random}.${ext}`  
**Esempio**: `550e8400-e29b-41d4-a716-446655440000/1738256400000-abc123.mp4`

**Caratteristiche**:

- ✅ Upload diretto da client a Supabase Storage
- ✅ Generazione automatica thumbnail
- ✅ URL pubblico accessibile

**Problemi**:

- ❌ Nessun limite dimensione lato client
- ❌ Nessun progress indicator per upload grandi
- ❌ Nessuna compressione video

### Upload Thumbnail

**Bucket**: `exercise-thumbs`  
**Path Pattern**:

- Auto-generato: `${user.id}/${timestamp}-${random}.jpg` (da video)
- Manuale: `${user.id}/${timestamp}-${random}.${ext}`

**Caratteristiche**:

- ✅ Generazione automatica da video (frame a 0.5s)
- ✅ Upload manuale opzionale
- ✅ Qualità JPEG 0.8

**Problemi**:

- ❌ Thumbnail auto-generata potrebbe fallire silenziosamente
- ❌ Nessuna validazione dimensioni thumbnail

### Generazione Thumbnail Automatica

```typescript
// Linee 106-162: generateThumbnail
```

**Processo**:

1. Crea elemento `<video>` temporaneo
2. Imposta `src` = URL video caricato
3. Attende `onloadedmetadata`
4. Imposta `currentTime = 0.5`
5. Attende `onseeked`
6. Disegna frame su canvas
7. Converte a blob JPEG
8. Upload a `exercise-thumbs`

**Problemi**:

- ⚠️ Funziona solo lato client (richiede browser)
- ⚠️ Potrebbe fallire per video CORS-protected
- ⚠️ Nessun fallback se generazione fallisce

---

## 🗄️ Struttura Database

### Tabella `exercises`

```sql
CREATE TABLE exercises (
  id UUID PRIMARY KEY,
  org_id TEXT DEFAULT 'default-org',
  name TEXT NOT NULL,
  muscle_group TEXT,
  category TEXT, -- Alias per muscle_group
  equipment TEXT,
  difficulty TEXT CHECK (difficulty IN (...)),
  description TEXT,
  image_url TEXT,
  video_url TEXT,
  thumbnail_url TEXT, -- ⚠️ INCONSISTENZA: codice usa thumb_url
  thumb_url TEXT,     -- ✅ Aggiunto in migration 20251008
  duration_seconds INTEGER,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Inconsistenze Identificate

1. **Colonne duplicate**: `thumbnail_url` vs `thumb_url`
   - Migration `20250110_005_exercises.sql` crea `thumbnail_url`
   - Migration `20251008_exercises_add_video.sql` aggiunge `thumb_url`
   - Codice usa solo `thumb_url`
   - **Raccomandazione**: Rimuovere `thumbnail_url` o migrare dati

2. **Mancanza trigger cleanup**: Nessun trigger per eliminare file quando esercizio viene eliminato

3. **Mancanza validazione**: Nessun constraint su formato URL

---

## 🪣 Storage Supabase

### Bucket `exercise-videos`

**Configurazione**:

- **Pubblico**: ✅ Sì
- **File size limit**: 50MB (configurato in `CREATE_STORAGE_BUCKETS_COMPLETE.sql`)
- **MIME types**: `video/*`
- **RLS Policies**:
  - ✅ Lettura pubblica
  - ✅ Scrittura solo PT/Admin autenticati
  - ✅ Eliminazione solo PT/Admin autenticati

### Bucket `exercise-thumbs`

**Configurazione**:

- **Pubblico**: ✅ Sì
- **File size limit**: 5MB (stimato)
- **MIME types**: `image/*`
- **RLS Policies**: Stesse di `exercise-videos`

### Problemi Storage

1. **File orfani**: File rimangono dopo eliminazione esercizi
2. **Nessun cleanup automatico**: Nessun processo per rimuovere file non referenziati
3. **Nessun limite applicato lato client**: Validazione solo lato server

---

## ⚠️ Problemi Identificati

### 🔴 Critici

1. **File orfani dopo eliminazione esercizio**
   - **Impatto**: Accumulo file inutilizzati, costi storage
   - **Fix**: Eliminare file storage in DELETE handler

2. **File vecchi non eliminati durante modifica**
   - **Impatto**: Accumulo file duplicati
   - **Fix**: Eliminare file vecchi prima di caricare nuovi

3. **Nessun rollback se DB insert fallisce**
   - **Impatto**: File caricati ma esercizio non salvato
   - **Fix**: Eliminare file se insert fallisce

### 🟡 Importanti

4. **Inconsistenza colonne database**: `thumbnail_url` vs `thumb_url`
   - **Impatto**: Confusione, possibili bug
   - **Fix**: Standardizzare su `thumb_url`

5. **Nessuna validazione dimensione file lato client**
   - **Impatto**: Upload fallisce solo dopo caricamento completo
   - **Fix**: Validare dimensione prima di upload

6. **Thumbnail auto-generata può fallire silenziosamente**
   - **Impatto**: Esercizi senza thumbnail
   - **Fix**: Migliorare gestione errori, fallback

### 🟢 Minori

7. **Nessun progress indicator per upload grandi**
8. **Nessuna compressione video**
9. **Nessun CDN per distribuzione file**

---

## 💡 Raccomandazioni

### Immediate (Priorità Alta)

1. **Implementare cleanup file in DELETE handler**

   ```typescript
   // In DELETE /api/exercises
   // 1. Recupera video_url e thumb_url
   // 2. Estrai path file da URL
   // 3. Elimina da storage
   // 4. Elimina da database
   ```

2. **Implementare cleanup file vecchi in PUT handler**

   ```typescript
   // In PUT /api/exercises
   // 1. Recupera esercizio esistente
   // 2. Se video_url/thumb_url cambiano, elimina file vecchi
   // 3. Aggiorna con nuovi URL
   ```

3. **Implementare rollback in POST handler**
   ```typescript
   // In POST /api/exercises
   // 1. Upload file
   // 2. Try insert DB
   // 3. Se fallisce, elimina file caricati
   ```

### Breve Termine (1-2 settimane)

4. **Standardizzare colonne database**
   - Rimuovere `thumbnail_url` o migrare a `thumb_url`
   - Aggiornare tutte le migration

5. **Aggiungere validazione dimensione file lato client**

   ```typescript
   const MAX_VIDEO_SIZE = 50 * 1024 * 1024 // 50MB
   if (file.size > MAX_VIDEO_SIZE) {
     throw new Error('File troppo grande')
   }
   ```

6. **Migliorare gestione errori thumbnail**
   - Log errori
   - Fallback a placeholder
   - Retry mechanism

### Medio Termine (1 mese)

7. **Implementare progress indicator upload**
8. **Aggiungere compressione video lato server**
9. **Implementare CDN per distribuzione file**
10. **Cron job per cleanup file orfani**

---

## 🔧 SQL per Fix

### 1. Rimuovere colonna `thumbnail_url` duplicata

```sql
-- Verifica dati esistenti
SELECT id, thumbnail_url, thumb_url
FROM exercises
WHERE thumbnail_url IS NOT NULL AND thumb_url IS NULL;

-- Migra dati da thumbnail_url a thumb_url
UPDATE exercises
SET thumb_url = thumbnail_url
WHERE thumbnail_url IS NOT NULL AND thumb_url IS NULL;

-- Rimuovi colonna (se non ci sono più riferimenti)
ALTER TABLE exercises DROP COLUMN IF EXISTS thumbnail_url;
```

### 2. Trigger per cleanup file (opzionale, meglio lato API)

```sql
-- Funzione per estrarre path da URL Supabase Storage
CREATE OR REPLACE FUNCTION extract_storage_path(url TEXT)
RETURNS TEXT AS $$
BEGIN
  -- Pattern: https://[project].supabase.co/storage/v1/object/public/[bucket]/[path]
  RETURN substring(url from '/(exercise-videos|exercise-thumbs)/(.+)$');
END;
$$ LANGUAGE plpgsql;

-- Trigger per eliminare file quando esercizio viene eliminato
-- NOTA: Richiede funzione server-side o edge function per eliminare da storage
-- Meglio implementare lato API
```

### 3. Verifica file orfani

```sql
-- Query per trovare file storage non referenziati (da eseguire manualmente)
-- Richiede accesso diretto a storage.objects
SELECT
  o.name as file_path,
  o.bucket_id,
  o.created_at
FROM storage.objects o
WHERE o.bucket_id IN ('exercise-videos', 'exercise-thumbs')
  AND NOT EXISTS (
    SELECT 1 FROM exercises e
    WHERE e.video_url LIKE '%' || o.name
       OR e.thumb_url LIKE '%' || o.name
  );
```

---

## 📝 Note Implementative

### Funzione Helper per Estrazione Path da URL

```typescript
/**
 * Estrae il path del file dall'URL pubblico Supabase Storage
 * @param publicUrl URL pubblico da Supabase Storage
 * @returns Path del file (es: "user-id/timestamp-random.ext") o null
 */
function extractStoragePath(publicUrl: string): string | null {
  try {
    // Pattern: https://[project].supabase.co/storage/v1/object/public/[bucket]/[path]
    const match = publicUrl.match(/\/(exercise-videos|exercise-thumbs)\/(.+)$/)
    return match ? match[2] : null
  } catch {
    return null
  }
}
```

### Funzione Helper per Eliminazione File

```typescript
/**
 * Elimina file da Supabase Storage
 * @param supabase Client Supabase
 * @param bucket Nome bucket
 * @param filePath Path del file
 */
async function deleteStorageFile(
  supabase: SupabaseClient,
  bucket: 'exercise-videos' | 'exercise-thumbs',
  filePath: string,
): Promise<void> {
  const { error } = await supabase.storage.from(bucket).remove([filePath])
  if (error) {
    console.error(`Errore eliminazione file ${filePath}:`, error)
    // Non lanciare errore per non bloccare eliminazione esercizio
  }
}
```

---

## ✅ Checklist Implementazione Fix

### Fix Critici

- [ ] Implementare cleanup file in DELETE `/api/exercises`
- [ ] Implementare cleanup file vecchi in PUT `/api/exercises`
- [ ] Implementare rollback file in POST `/api/exercises`
- [ ] Test eliminazione esercizio con file
- [ ] Test modifica esercizio con sostituzione file
- [ ] Test creazione esercizio con fallimento DB

### Fix Importanti

- [ ] Standardizzare colonne database (`thumb_url` unico)
- [ ] Aggiungere validazione dimensione file lato client
- [ ] Migliorare gestione errori thumbnail
- [ ] Test edge cases (file mancanti, URL invalidi)

### Fix Minori

- [ ] Progress indicator upload
- [ ] Compressione video (opzionale)
- [ ] CDN distribuzione (opzionale)

---

## 📊 Metriche e Monitoraggio

### Metriche da Tracciare

1. **File orfani**: Numero file storage non referenziati
2. **Dimensione storage**: Spazio utilizzato per esercizi
3. **Tasso successo upload**: % upload completati con successo
4. **Tasso generazione thumbnail**: % thumbnail generate con successo
5. **Errori upload**: Numero errori per tipo

### Query Monitoraggio

```sql
-- File orfani (approssimativo, richiede accesso storage)
-- Da eseguire periodicamente

-- Dimensione media esercizi
SELECT
  COUNT(*) as total_exercises,
  COUNT(video_url) as exercises_with_video,
  COUNT(thumb_url) as exercises_with_thumb,
  AVG(LENGTH(description)) as avg_description_length
FROM exercises;

-- Esercizi senza media
SELECT id, name
FROM exercises
WHERE video_url IS NULL AND thumb_url IS NULL;
```

---

**Fine Analisi**
