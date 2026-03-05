# 👤 AvatarUploader Component - Documentazione Tecnica

**File**: `src/components/settings/avatar-uploader.tsx`  
**Classificazione**: React Component, Client Component, Upload Component  
**Stato**: ✅ COMPLETO (100%)  
**Ultimo Aggiornamento**: 2025-01-29T17:35:00Z

---

## 📋 Panoramica

Componente React per upload avatar utente a Supabase Storage. Supporta preview immagine prima di upload, validazione tipo file, e callback dopo upload riuscito. Integrato con bucket `avatars` in Supabase Storage.

---

## 🔧 Parametri

### Props

```typescript
interface AvatarUploaderProps {
  userId: string | null // ID utente (per path storage)
  onUploaded?: (publicUrl: string) => void // Callback dopo upload riuscito
}
```

**Parametri**:

- `userId` (obbligatorio): ID utente per creare path univoco in storage
- `onUploaded` (opzionale): Funzione chiamata dopo upload riuscito con URL pubblico

---

## 📤 Output

**Tipo**: `JSX.Element`

**Rendering**:

- Input file picker
- Pulsante "Carica" (disabilitato durante upload)
- Preview immagine (se file selezionato)

---

## 🔄 Flusso Logico

### 1. Selezione File

```typescript
const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const f = e.target.files?.[0]
  if (!f) return
  setFile(f)
  const url = URL.createObjectURL(f)
  setPreview(url)
}
```

**Comportamento**:

- Seleziona primo file dall'input
- Crea preview usando `URL.createObjectURL`
- Aggiorna stato `file` e `preview`

### 2. Upload File

```typescript
const upload = async () => {
  if (!file || !userId) return

  const ext = file.name.split('.').pop() || 'jpg'
  const path = `${userId}/avatar.${ext}`

  const { error: upErr } = await supabase.storage
    .from('avatars')
    .upload(path, file, { upsert: true })

  if (upErr) throw upErr

  const { data } = supabase.storage.from('avatars').getPublicUrl(path)
  const publicUrl = data.publicUrl

  onUploaded?.(publicUrl)
}
```

**Processo**:

1. Estrae estensione file (default: `jpg`)
2. Crea path: `{userId}/avatar.{ext}`
3. Upload a bucket `avatars` con `upsert: true` (sovrascrive se esiste)
4. Ottiene URL pubblico
5. Chiama `onUploaded` con URL

**Nota**: ⚠️ Richiede bucket `avatars` (vedi P1-003, P4-012)

---

## ⚠️ Errori Possibili

### Errori Upload

- **Storage Bucket Non Esiste**: Se bucket `avatars` non esiste
  - Sintomo: `Bucket not found` error
  - Fix: Creare bucket via Supabase Dashboard o SQL (vedi P1-003)

- **RLS Policy Error**: Se RLS bucket blocca upload
  - Sintomo: `permission denied` error
  - Fix: Configurare RLS policies per bucket `avatars`

- **File Too Large**: Se file supera quota storage
  - Sintomo: `File too large` error
  - Fix: Validare dimensione file prima di upload (non implementato)

### Errori Validazione

- **Tipo File Non Valido**: Input accetta solo `image/*` (validazione browser)
  - Sintomo: File picker non mostra file non-immagine
  - Fix: Validazione già implementata

---

## 🔗 Dipendenze Critiche

### Dipendenze Esterne

1. **Supabase Storage** (`@/hooks/use-supabase`)
   - `supabase.storage.from('avatars')` per upload

2. **React Hooks** (`useState`)
   - Gestione stato file e preview

3. **UI Components** (`@/components/ui`)
   - `Button`, `Input`

4. **Next.js Image** (`next/image`)
   - Per preview immagine

5. **Toast** (`@/components/ui/toast`)
   - Feedback successo/errore

### Dipendenze Interne

- **Storage Bucket**: `avatars` deve esistere in Supabase Storage
- **RLS Policies**: Bucket deve permettere upload agli utenti autenticati

---

## 📝 Esempi d'Uso

### Esempio 1: Uso Base

```typescript
import { AvatarUploader } from '@/components/settings/avatar-uploader'

function ProfiloPage() {
  const { user } = useAuth()
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)

  return (
    <AvatarUploader
      userId={user?.id || null}
      onUploaded={(url) => {
        setAvatarUrl(url)
        // Aggiorna profilo in database
        updateProfile({ avatar: url })
      }}
    />
  )
}
```

### Esempio 2: Con Gestione Errori

```typescript
const handleUploaded = (url: string) => {
  toast.success('Avatar aggiornato!')
  // Aggiorna stato locale
  setProfile(prev => ({ ...prev, avatar: url }))
  // Aggiorna database
  updateProfileInDatabase({ avatar: url })
}

<AvatarUploader
  userId={userId}
  onUploaded={handleUploaded}
/>
```

---

## 🎯 Side-Effects

### Side-Effects Positivi

1. **Upload Storage**: Upload file a Supabase Storage
2. **State Updates**: Aggiorna `file`, `preview`, `isUploading`
3. **Toast Notifications**: Mostra feedback utente
4. **Callback Invocation**: Chiama `onUploaded` con URL pubblico

### Side-Effects Negativi (da evitare)

- **Memory Leak**: `URL.createObjectURL` crea blob URL che deve essere revocato
  - Fix: Aggiungere `URL.revokeObjectURL(preview)` in cleanup

---

## 🔍 Note Tecniche

### Performance

- **Preview Locale**: Usa `URL.createObjectURL` per preview immediata (non upload)
- **Upsert**: Sovrascrive avatar esistente (un solo avatar per utente)

### Limitazioni

- **Nessuna Validazione Dimensione**: Non valida dimensione file (max 5MB consigliato)
- **Nessuna Compressione**: Non comprime immagini prima di upload
- **Nessun Crop/Resize**: Non permette crop o resize immagine

### Miglioramenti Futuri

- Aggiungere validazione dimensione file (max 5MB)
- Aggiungere compressione immagini prima di upload
- Aggiungere crop/resize immagine (usando libreria come `react-image-crop`)
- Revocare `URL.createObjectURL` in cleanup per evitare memory leak

---

## 📚 Changelog

### 2025-01-29T17:35:00Z - Documentazione Iniziale

- ✅ Documentazione completa componente `AvatarUploader`
- ✅ Descrizione upload e preview
- ✅ Esempi d'uso
- ✅ Note tecniche e miglioramenti futuri
- ⚠️ Identificato problema P1-003 (storage bucket mancante)
- ⚠️ Identificato problema P4-012 (upload implementato ma bucket mancante)

---

**Stato**: ✅ COMPLETO  
**Prossimi Passi**: Documentare profilo Admin (se esiste) o segnalare mancanza
