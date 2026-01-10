# Componente: ExerciseFormModal

## 📋 Descrizione

Modal per creare o modificare esercizi. Supporta upload video e thumbnail, validazione file, selezione gruppo muscolare e attrezzatura, configurazione difficoltà e durata. Gestisce drag & drop per upload file.

## 📁 Percorso File

`src/components/dashboard/exercise-form-modal.tsx`

## 🔧 Props

```typescript
interface ExerciseFormModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  editing?: Exercise | null
  onSuccess?: () => void
}

interface Exercise {
  id?: string
  name: string
  muscle_group?: string | null
  equipment?: string | null
  difficulty: 'easy' | 'medium' | 'hard'
  description?: string | null
  video_url?: string | null
  thumb_url?: string | null
  duration_seconds?: number | null
}
```

### Dettaglio Props

- **`open`** (boolean, required): Stato apertura modal
- **`onOpenChange`** (function, required): Callback cambio stato
- **`editing`** (Exercise | null, optional): Esercizio da modificare (null per creazione)
- **`onSuccess`** (function, optional): Callback dopo successo

## 📦 Dipendenze

### React Hooks

- `useState`, `useEffect` da `react`

### Next.js

- `Image` da `next/image`

### UI Components

- `Dialog`, `DialogContent`, `DialogHeader`, `DialogTitle`, `DialogDescription` da `@/components/ui/dialog`
- `Button`, `Input`, `Textarea` da `@/components/ui`
- `SimpleSelect` da `@/components/ui/simple-select`
- `useToast` da `@/components/ui/toast`

### Hooks

- `useSupabase` da `@/hooks/use-supabase`

### Utils

- `MUSCLE_GROUPS`, `EQUIPMENT` da `@/lib/exercises-data`
- `validateVideoFile`, `validateImageFile`, `generateUniqueFileName`, `formatFileSize` da `@/lib/exercise-upload-utils`
- `isValidVideoUrl`, `VIDEO_URL_ERROR_MESSAGE` da `@/lib/validations/video-url`

### Icons

- `Video`, `Image as ImageIcon`, `Clock`, `Save`, `X`, `CheckCircle2`, `Loader2`, `Dumbbell`, `Target` da `lucide-react`

## ⚙️ Funzionalità

### Core

1. **Creazione/Modifica Esercizio**: Form completo per esercizi
2. **Upload Media**: Upload video e thumbnail con drag & drop
3. **Validazione File**: Validazione formato e dimensione
4. **URL Video**: Supporto per URL video esterni

### Campi Form

- **Nome**: Input obbligatorio
- **Gruppo Muscolare**: Select opzionale
- **Attrezzatura**: Select opzionale
- **Difficoltà**: Select (easy, medium, hard)
- **Descrizione**: Textarea opzionale
- **Video URL**: Input opzionale (alternativo a upload)
- **Video File**: Upload file opzionale
- **Thumbnail**: Upload immagine opzionale
- **Durata**: Input numerico (secondi) opzionale

### Funzionalità Avanzate

- **Drag & Drop**: Supporto drag & drop per file
- **Preview Media**: Preview video e thumbnail prima di upload
- **Validazione File**: Formato e dimensione file
- **Upload Progress**: Stati loading per upload
- **Reset Form**: Reset automatico quando modal si chiude

### Validazioni

- Nome obbligatorio
- Video: formato valido, dimensione max
- Thumbnail: formato immagine valido, dimensione max
- Video URL: formato URL valido (se fornito)

### UI/UX

- Modal responsive
- Sezioni organizzate (info base, media, descrizione)
- Drag & drop zones evidenziate
- Preview media
- Loading states per upload
- Error messages inline

## 🎨 Struttura UI

```
Dialog
  └── DialogContent
      ├── DialogHeader
      │   ├── DialogTitle
      │   └── DialogDescription
      ├── form
      │   ├── Input Nome
      │   ├── Select Gruppo Muscolare
      │   ├── Select Attrezzatura
      │   ├── Select Difficoltà
      │   ├── Textarea Descrizione
      │   ├── Input Video URL (o)
      │   ├── Upload Video File (o)
      │   ├── Upload Thumbnail
      │   ├── Input Durata
      │   └── DialogFooter
      │       ├── Button Cancel
      │       └── Button Save
```

## 📝 Esempi d'Uso

### Esempio Creazione

```tsx
import { ExerciseFormModal } from '@/components/dashboard/exercise-form-modal'

function ExercisesPage() {
  const [showModal, setShowModal] = useState(false)

  return (
    <ExerciseFormModal
      open={showModal}
      onOpenChange={setShowModal}
      onSuccess={() => router.refresh()}
    />
  )
}
```

### Esempio Modifica

```tsx
<ExerciseFormModal
  open={showModal}
  onOpenChange={setShowModal}
  editing={selectedExercise}
  onSuccess={() => router.refresh()}
/>
```

## 🔍 Note Tecniche

### Upload File

- Video: Supabase Storage bucket `exercises-videos`
- Thumbnail: Supabase Storage bucket `exercises-thumbs`
- File names: `generateUniqueFileName` per nomi unici
- Public URLs: `getPublicUrl` dopo upload

### Validazione File

- Video: Formati supportati, dimensione max (da `validateVideoFile`)
- Thumbnail: Formati immagine, dimensione max (da `validateImageFile`)

### Reset Form

- `useEffect` resetta form quando `open` o `editing` cambiano
- Reset a valori default quando modal si chiude

### Limitazioni

- Solo un video (file o URL, non entrambi)
- Upload sincrono (potrebbe essere lento per file grandi)
- Preview solo per file locali (non URL esterni)

## ✅ Stato Componente

- ✅ **Completato**: Componente funzionante e utilizzato in produzione
- ✅ **Testato**: Integrato nei test E2E
- ✅ **Documentato**: Documentazione completa
