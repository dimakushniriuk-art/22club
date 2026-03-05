# 💪 ExerciseFormModal Component - Documentazione Tecnica

**File**: `src/components/dashboard/exercise-form-modal.tsx`  
**Classificazione**: React Component, Client Component, Form Component, Modal Component  
**Stato**: ✅ COMPLETO (100%)  
**Ultimo Aggiornamento**: 2025-01-29T17:00:00Z

---

## 📋 Panoramica

Componente React modal form per creare e modificare esercizi nel catalogo. Supporta upload video e thumbnail tramite Supabase Storage, generazione automatica thumbnail da video, e validazione client-side. Integrato con API route `/api/exercises` per operazioni CRUD.

---

## 🔧 Parametri

### Props

```typescript
interface ExerciseFormModalProps {
  open: boolean // Stato apertura modal
  onOpenChange: (open: boolean) => void // Callback cambio stato
  editing?: Exercise | null // Esercizio da modificare (opzionale)
  onSuccess?: () => void // Callback dopo salvataggio riuscito
}
```

**Parametri**:

- `open` (obbligatorio): Stato apertura/chiusura modal
- `onOpenChange` (obbligatorio): Funzione chiamata quando cambia stato modal
- `editing` (opzionale): Esercizio esistente per modifica. Se assente, form in modalità creazione
- `onSuccess` (opzionale): Callback chiamato dopo salvataggio riuscito

---

## 📤 Output

**Tipo**: `JSX.Element`

**Rendering**:

- Dialog modal con form completo
- Sezioni: Informazioni Base, Media Upload, Dettagli Aggiuntivi
- Drag & drop per upload video/thumbnail
- Preview video e thumbnail dopo upload
- Pulsanti azione: Annulla, Salva

**Campi Form**:

1. **Nome esercizio** (obbligatorio): Input text
2. **Gruppo muscolare** (obbligatorio): Select dropdown (`MUSCLE_GROUPS`)
3. **Attrezzo** (opzionale): Select dropdown (`EQUIPMENT`)
4. **Difficoltà** (opzionale): Select dropdown (easy, medium, hard)
5. **Video MP4** (opzionale): Upload drag & drop o file picker
6. **Thumbnail** (opzionale): Upload drag & drop o file picker
7. **Durata (secondi)** (opzionale): Input number
8. **Descrizione** (opzionale): Textarea

---

## 🔄 Flusso Logico

### 1. Inizializzazione Form

```typescript
useEffect(() => {
  if (open) {
    if (editing) {
      setForm(editing) // Modifica: carica dati esistenti
    } else {
      setForm({ difficulty: 'medium' }) // Creazione: reset form
    }
  } else {
    setForm({ difficulty: 'medium' }) // Reset al chiudere
  }
}, [open, editing])
```

**Comportamento**:

- **Apertura con editing**: Carica dati esercizio esistente
- **Apertura senza editing**: Reset form con default `difficulty: 'medium'`
- **Chiusura**: Reset form

### 2. Upload Video

```typescript
const handleVideoUpload = async (file: File) => {
  // Validazione tipo file
  if (!file.type.startsWith('video/')) {
    addToast({ title: 'Errore', message: 'Il file deve essere un video', variant: 'error' })
    return
  }

  // Upload a Supabase Storage
  const fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
  const { error } = await supabase.storage.from('exercise-videos').upload(fileName, file, {
    upsert: true,
    cacheControl: '3600',
  })

  // Genera thumbnail automaticamente
  const thumbUrl = await generateThumbnail(data.publicUrl)

  // Aggiorna form
  setForm((prev) => ({
    ...prev,
    video_url: data.publicUrl,
    thumb_url: thumbUrl || prev.thumb_url,
  }))
}
```

**Funzionalità**:

- Validazione tipo file (deve essere video)
- Upload a bucket `exercise-videos` in Supabase Storage
- Generazione automatica thumbnail dal video (frame a 0.5s)
- Upload thumbnail a bucket `exercise-thumbs`
- Aggiornamento form con URL video e thumbnail

**Nota**: ⚠️ Richiede bucket `exercise-videos` e `exercise-thumbs` (vedi P1-003)

### 3. Generazione Thumbnail Automatica

```typescript
const generateThumbnail = async (videoUrl: string): Promise<string | null> => {
  return new Promise((resolve) => {
    const video = document.createElement('video')
    video.src = videoUrl
    video.crossOrigin = 'anonymous'
    video.preload = 'metadata'

    video.onloadedmetadata = () => {
      video.currentTime = 0.5 // Frame a 0.5 secondi
    }

    video.onseeked = async () => {
      const canvas = document.createElement('canvas')
      canvas.width = video.videoWidth || 640
      canvas.height = video.videoHeight || 360
      const ctx = canvas.getContext('2d')
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
        canvas.toBlob(
          async (blob) => {
            // Upload thumbnail a Supabase Storage
            const thumbPath = fileName.replace(/\.(mp4|mov|avi|webm)$/i, '.jpg')
            const { error: thumbError } = await supabase.storage
              .from('exercise-thumbs')
              .upload(thumbPath, blob, { upsert: true })

            if (!thumbError) {
              const { data: thumbData } = supabase.storage
                .from('exercise-thumbs')
                .getPublicUrl(thumbPath)
              resolve(thumbData.publicUrl)
            } else {
              resolve(null)
            }
          },
          'image/jpeg',
          0.8,
        )
      }
    }
  })
}
```

**Processo**:

1. Crea elemento `<video>` temporaneo
2. Carica video e va al frame 0.5s
3. Disegna frame su canvas
4. Converte canvas a blob JPEG (qualità 0.8)
5. Upload blob a Supabase Storage bucket `exercise-thumbs`
6. Ritorna URL pubblico thumbnail

### 4. Upload Thumbnail Manuale

```typescript
const handleThumbnailUpload = async (file: File) => {
  if (!file.type.startsWith('image/')) {
    throw new Error("Il file deve essere un'immagine")
  }

  const fileExt = file.name.split('.').pop() || 'jpg'
  const fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`

  const { error } = await supabase.storage.from('exercise-thumbs').upload(fileName, file, {
    upsert: true,
    cacheControl: '3600',
  })

  const { data } = supabase.storage.from('exercise-thumbs').getPublicUrl(fileName)
  setForm((prev) => ({ ...prev, thumb_url: data.publicUrl }))
}
```

**Comportamento**:

- Validazione tipo file (deve essere immagine)
- Upload a bucket `exercise-thumbs`
- Aggiornamento form con URL thumbnail

### 5. Salvataggio Esercizio

```typescript
const handleSave = async () => {
  // Validazione campi obbligatori
  if (!form.name || !form.muscle_group) {
    addToast({
      title: 'Errore',
      message: 'Compila tutti i campi obbligatori',
      variant: 'error',
    })
    return
  }

  // Chiama API route
  const method = editing ? 'PUT' : 'POST'
  const res = await fetch('/api/exercises', {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(editing ? { id: editing.id, ...form } : form),
  })

  if (!res.ok) throw new Error('Salvataggio fallito')

  // Successo
  addToast({
    title: 'Salvato',
    message: 'Esercizio salvato correttamente',
    variant: 'success',
  })
  onOpenChange(false)
  onSuccess?.()
}
```

**Comportamento**:

- Valida campi obbligatori (`name`, `muscle_group`)
- Chiama API route `/api/exercises` (POST per creazione, PUT per modifica)
- Gestisce errori con toast
- Chiude modal e chiama `onSuccess` se presente

---

## ⚠️ Errori Possibili

### Errori Upload

- **Tipo File Non Valido**: Se file non è video/immagine
  - Sintomo: Toast errore "Il file deve essere un video/immagine"
  - Fix: Validazione client-side già implementata

- **Storage Bucket Non Esiste**: Se bucket `exercise-videos` o `exercise-thumbs` non esiste
  - Sintomo: `Bucket not found` error
  - Fix: Creare bucket via Supabase Dashboard o SQL (vedi P1-003)

- **Upload Fallito**: Se upload a Supabase Storage fallisce
  - Sintomo: Toast errore con messaggio Supabase
  - Fix: Verificare permessi RLS bucket, quota storage, connessione

### Errori Validazione

- **Campi Obbligatori Vuoti**: Se `name` o `muscle_group` mancanti
  - Sintomo: Toast errore "Compila tutti i campi obbligatori"
  - Fix: Validazione client-side già implementata

### Errori API

- **Network Error**: Se API route non raggiungibile
  - Sintomo: `Salvataggio fallito` error
  - Fix: Verificare connessione, API route attiva

- **RLS Policy Error**: Se RLS policies bloccano inserimento
  - Sintomo: `403 Forbidden` o `permission denied`
  - Fix: Verificare RLS policies su tabella `exercises` (vedi P1-001)

---

## 🔗 Dipendenze Critiche

### Dipendenze Esterne

1. **Supabase Storage** (`@/hooks/use-supabase`)
   - Richiesto per upload video/thumbnail
   - Bucket: `exercise-videos`, `exercise-thumbs`

2. **React Hooks** (`useState`, `useEffect`)
   - Gestione stato form e upload

3. **UI Components** (`@/components/ui`)
   - `Dialog`, `DialogContent`, `DialogHeader`, `DialogTitle`
   - `Button`, `Input`, `SimpleSelect`, `Textarea`
   - `useToast` hook

4. **Icons** (`lucide-react`)
   - `Video`, `ImageIcon`, `Clock`, `Save`, `X`, `CheckCircle2`, `Loader2`, `Dumbbell`, `Target`

5. **Next.js Image** (`next/image`)
   - Per preview thumbnail

### Dipendenze Interne

- **Types**: `Exercise` interface
- **Data**: `MUSCLE_GROUPS`, `EQUIPMENT` da `@/lib/exercises-data`
- **API Route**: `/api/exercises` (POST, PUT)

---

## 📝 Esempi d'Uso

### Esempio 1: Creazione Esercizio

```typescript
import { ExerciseFormModal } from '@/components/dashboard/exercise-form-modal'

function EserciziPage() {
  const [showForm, setShowForm] = useState(false)
  const [exercises, setExercises] = useState([])

  const handleSuccess = () => {
    // Ricarica lista esercizi
    fetchExercises()
  }

  return (
    <>
      <Button onClick={() => setShowForm(true)}>Nuovo Esercizio</Button>
      <ExerciseFormModal
        open={showForm}
        onOpenChange={setShowForm}
        onSuccess={handleSuccess}
      />
    </>
  )
}
```

### Esempio 2: Modifica Esercizio

```typescript
const [editingExercise, setEditingExercise] = useState<Exercise | null>(null)

<ExerciseFormModal
  open={editingExercise !== null}
  onOpenChange={(open) => !open && setEditingExercise(null)}
  editing={editingExercise}
  onSuccess={() => {
    setEditingExercise(null)
    fetchExercises()
  }}
/>
```

### Esempio 3: Con Gestione Errori

```typescript
const handleSuccess = () => {
  addToast({
    title: 'Successo',
    message: 'Esercizio salvato correttamente',
    variant: 'success',
  })
  fetchExercises()
}

// Gli errori sono gestiti internamente dal componente con toast
```

---

## 🎯 Side-Effects

### Side-Effects Positivi

1. **Upload File**: Upload video/thumbnail a Supabase Storage
2. **State Updates**: Aggiorna `form`, `loading`, `uploadingVideo`, `uploadingThumb`
3. **Toast Notifications**: Mostra feedback utente (successo/errore)
4. **Canvas Operations**: Genera thumbnail da video usando HTML5 Canvas API
5. **API Calls**: Chiama `/api/exercises` per salvataggio

### Side-Effects Negativi (da evitare)

- Nessun side-effect negativo identificato

---

## 🔍 Note Tecniche

### Performance

- **Lazy Upload**: Upload solo quando utente seleziona file
- **Thumbnail Generation**: Asincrona, non blocca UI
- **File Validation**: Client-side prima di upload (riduce chiamate inutili)

### Limitazioni

- **Dimensione File**: Nessun limite esplicito (dipende da Supabase Storage quota)
- **Formati Video**: Supporta tutti i formati video (validazione solo `video/*`)
- **Thumbnail Generation**: Funziona solo per video caricati (non URL esterni)

### Miglioramenti Futuri

- Aggiungere validazione dimensione file (max 50MB per video, 5MB per thumbnail)
- Supportare più formati video specifici (mp4, webm, mov)
- Aggiungere progress bar per upload
- Validazione URL video esterni (se supportato)

---

## 🎨 UI/UX

### Design

- **Modal Style**: Dialog con gradient teal/cyan, backdrop blur
- **Drag & Drop**: Zone drag & drop con feedback visivo (bordo colorato)
- **Preview**: Preview video e thumbnail dopo upload
- **Loading States**: Spinner durante upload

### Accessibilità

- **Labels**: Ogni campo ha label associata
- **Required Fields**: Indicati con asterisco (\*)
- **Error Messages**: Toast notifications per feedback
- **Disabled States**: Form disabilitato durante upload/salvataggio

---

## 📚 Changelog

### 2025-01-29T17:00:00Z - Documentazione Iniziale

- ✅ Documentazione completa componente `ExerciseFormModal`
- ✅ Descrizione upload video/thumbnail
- ✅ Generazione automatica thumbnail
- ✅ Esempi d'uso
- ✅ Note tecniche e miglioramenti futuri
- ⚠️ Identificato problema P1-003 (storage buckets mancanti)

---

**Stato**: ✅ COMPLETO  
**Prossimi Passi**: Documentare `ExerciseCatalog` component
