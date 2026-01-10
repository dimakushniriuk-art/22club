# Componente: AvatarUploader

## 📋 Descrizione

Componente per caricare e aggiornare l'avatar utente. Gestisce validazione file, resize automatico, upload a Supabase Storage e aggiornamento database.

## 📁 Percorso File

`src/components/settings/avatar-uploader.tsx`

## 🔧 Props

```typescript
interface AvatarUploaderProps {
  userId: string | null
  onUploaded?: (publicUrl: string) => void
}
```

### Dettaglio Props

- **`userId`** (string | null, required): ID utente per upload e aggiornamento database
- **`onUploaded`** (function, optional): Callback chiamato quando upload completato (riceve publicUrl)

## 📦 Dipendenze

### React

- `React` (useState)

### Next.js

- `Image` da `next/image`

### UI Components

- `Button`, `Input` da `@/components/ui`
- `useToast` da `@/components/ui/toast`

### Hooks

- `useSupabase` da `@/hooks/use-supabase`

### Utils

- `validateAvatarFile`, `resizeImage`, `getFileExtension` da `@/lib/avatar-utils`

## ⚙️ Funzionalità

### Core

1. **Selezione File**: Input file per selezionare immagine
2. **Validazione**: Valida tipo file, dimensione, formato
3. **Resize Automatico**: Ridimensiona immagine a max 512x512px con qualità 0.9
4. **Preview**: Mostra anteprima immagine prima dell'upload
5. **Upload**: Carica file a Supabase Storage (bucket 'avatars')
6. **Aggiornamento DB**: Aggiorna `profiles.avatar_url` nel database

### Funzionalità Avanzate

- **Validazione File**: Tipo (JPEG, JPG, PNG, GIF, WebP), dimensione max
- **Resize Intelligente**: Mantiene aspect ratio, max 512x512px
- **Gestione Errori**: Toast per errori validazione, upload, DB update
- **Upsert**: Sostituisce avatar esistente se presente

### Stati

- **Idle**: Nessun file selezionato
- **File Selected**: File selezionato con preview
- **Uploading**: Upload in corso
- **Error**: Errore durante validazione/upload

### UI/UX

- Input file con accettazione formati immagine
- Pulsante "Carica" disabilitato se nessun file o uploading
- Preview immagine 40x40px con bordo
- Messaggio errore sotto input
- Info file (nome, dimensione) quando selezionato

## 🎨 Struttura UI

```
div (space-y-2)
  ├── div (flex items-center gap-3)
  │   ├── Input (type="file", accept immagini)
  │   ├── Button "Carica" (disabilitato se !file || uploading)
  │   └── Image Preview (se preview presente)
  ├── Error Message (se error)
  └── File Info (se file && !error)
      └── "File: nome.ext (X.X KB)"
```

## 📝 Esempi d'Uso

### Esempio Base

```tsx
import { AvatarUploader } from '@/components/settings/avatar-uploader'

function MyComponent() {
  const handleUploaded = (publicUrl: string) => {
    // Aggiorna stato locale con nuovo avatar
    setAvatar(publicUrl)
  }

  return <AvatarUploader userId={user.id} onUploaded={handleUploaded} />
}
```

## 🔍 Note Tecniche

### Validazione File

- Utilizza `validateAvatarFile` da `@/lib/avatar-utils`
- Controlla tipo MIME, dimensione, formato
- Mostra toast error se non valido

### Resize Immagine

- Utilizza `resizeImage` da `@/lib/avatar-utils`
- Max dimensioni: 512x512px
- Qualità: 0.9 (90%)
- Mantiene aspect ratio

### Upload Storage

- **Bucket**: `avatars`
- **Path**: `${userId}/avatar.${ext}`
- **Upsert**: `true` (sostituisce se esiste)
- **Content-Type**: Preservato dal file originale

### Aggiornamento Database

- Aggiorna `profiles.avatar_url` con URL pubblico
- Se fallisce, mostra warning ma non blocca (upload riuscito)
- URL pubblico ottenuto da `getPublicUrl`

### Limitazioni

- Non gestisce cancellazione avatar esistente
- Non mostra progress upload
- Resize sempre a 512x512px (non configurabile)

## ✅ Stato Componente

- ✅ **Completato**: Componente funzionante e utilizzato in produzione
- ✅ **Testato**: Integrato nei test E2E
- ✅ **Documentato**: Documentazione completa
