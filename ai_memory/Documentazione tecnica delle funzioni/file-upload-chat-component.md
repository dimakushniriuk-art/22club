# Componente: FileUpload (Chat)

## 📋 Descrizione

Componente per upload file nella chat. Supporta drag & drop, preview immagini, validazione file e rimozione file selezionato. Utilizzato nel sistema di chat per inviare file.

## 📁 Percorso File

`src/components/chat/file-upload.tsx`

## 🔧 Props

```typescript
interface FileUploadProps {
  onFileSelect: (file: ChatFile) => void
  onFileRemove: () => void
  selectedFile: ChatFile | null
  className?: string
}

interface ChatFile {
  file: File
  preview?: string
  type: 'image' | 'pdf' | 'other'
}
```

### Dettaglio Props

- **`onFileSelect`** (function, required): Callback chiamato quando si seleziona un file
- **`onFileRemove`** (function, required): Callback chiamato quando si rimuove il file
- **`selectedFile`** (ChatFile | null, required): File attualmente selezionato
- **`className`** (string, optional): Classi CSS aggiuntive

## 📦 Dipendenze

### React

- `useState`, `useRef` da `react`
- `Image` da `next/image`

### UI Components

- `Button` da `@/components/ui/button`
- `Paperclip`, `X`, `FileText`, `Image as ImageIcon` da `lucide-react`

### Utilities

- `cn` da `@/lib/utils`

### Types

- `ChatFile` da `@/types/chat`

## ⚙️ Funzionalità

### Core

1. **Drag & Drop**: Supporto drag & drop file
2. **File Selection**: Click per selezionare file
3. **Preview**: Preview immagini con `URL.createObjectURL`
4. **Validazione**: Validazione tipo e dimensione file
5. **Rimozione**: Rimozione file selezionato
6. **Formattazione**: Formattazione dimensione file

### Funzionalità Avanzate

- **Drag States**: Gestione stati drag (dragOver, dragLeave)
- **File Validation**: Validazione tipo (image/\*, application/pdf) e dimensione (max 10MB)
- **Preview Images**: Preview automatico per immagini
- **File Icons**: Icone diverse per tipo file (image, pdf, other)
- **Error Handling**: Alert per errori validazione

### UI/UX

- Drop zone con border dashed
- Hover effects durante drag
- Preview immagine se tipo image
- Icona file se tipo pdf/other
- Nome file e dimensione
- Pulsante rimozione
- Layout responsive

## 🎨 Struttura UI

```
Container
  ├── Se selectedFile
  │   └── File Preview Card
  │       ├── Preview Image (se type === 'image')
  │       │   └── Image (32x32)
  │       ├── File Icon (se type !== 'image')
  │       │   └── Icon (ImageIcon/FileText)
  │       ├── Info
  │       │   ├── Nome file
  │       │   └── Dimensione
  │       └── Button Rimuovi (X icon)
  └── Se !selectedFile
      └── Drop Zone
          ├── Icon Paperclip
          ├── Testo "Trascina o seleziona"
          └── Info "PDF, JPG, PNG (max 10MB)"
      └── Input File (hidden)
```

## 💡 Esempi d'Uso

```tsx
<FileUpload
  selectedFile={selectedFile}
  onFileSelect={handleFileSelect}
  onFileRemove={handleFileRemove}
/>
```

## 📝 Note Tecniche

- Utilizza `useRef` per input file
- Drag & drop con event handlers (dragenter, dragover, dragleave, drop)
- Preview immagini con `URL.createObjectURL` (ricordare di revocare)
- Validazione: max 10MB, tipi image/\* e application/pdf
- Formattazione dimensione con logaritmo per unità appropriate
- Icone dinamiche in base al tipo file
- Stili con tema teal-cyan consistente

## ✅ Stato Componente

- ✅ **Completato**: 100%
- ✅ **Testato**: Funzionalità base testata
- ✅ **Documentato**: Questo file
- 📅 **Ultimo aggiornamento**: 2025-02-16
