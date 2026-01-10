# Componente: MessageInput

## 📋 Descrizione

Componente input per inviare messaggi nella chat. Include textarea auto-resize, emoji picker, file upload, invio con Enter e gestione upload file asincrono.

## 📁 Percorso File

`src/components/chat/message-input.tsx`

## 🔧 Props

```typescript
interface MessageInputProps {
  onSendMessage: (
    message: string,
    type: 'text' | 'file',
    fileData?: { url: string; name: string; size: number },
  ) => void
  onUploadFile: (file: File) => Promise<{ url: string; name: string; size: number }>
  disabled?: boolean
  placeholder?: string
  className?: string
}
```

### Dettaglio Props

- **`onSendMessage`** (function, required): Callback chiamato quando si invia un messaggio
- **`onUploadFile`** (function, required): Callback asincrono per upload file
- **`disabled`** (boolean, optional): Disabilita l'input
- **`placeholder`** (string, optional): Placeholder textarea (default: 'Scrivi un consiglio motivazionale...')
- **`className`** (string, optional): Classi CSS aggiuntive

## 📦 Dipendenze

### React

- `useState`, `useRef`, `useEffect` da `react`

### UI Components

- `Button` da `@/components/ui/button`
- `Textarea` da `@/components/ui/textarea`
- `Send`, `Paperclip` da `lucide-react`

### Components

- `EmojiPicker` da `./emoji-picker`
- `FileUpload` da `./file-upload`

### Utilities

- `cn` da `@/lib/utils`

### Types

- `ChatFile` da `@/types/chat`

## ⚙️ Funzionalità

### Core

1. **Input Messaggio**: Textarea per scrivere messaggi
2. **Auto-resize**: Textarea che si adatta al contenuto
3. **Emoji Picker**: Integrazione emoji picker
4. **File Upload**: Integrazione file upload
5. **Invio Messaggio**: Invio con bottone o Enter
6. **Upload File**: Upload file asincrono prima dell'invio

### Funzionalità Avanzate

- **Auto-resize Textarea**: Textarea che cresce automaticamente (max-h-32)
- **Enter to Send**: Invio con Enter (Shift+Enter per newline)
- **File Upload Async**: Upload file prima di inviare messaggio
- **Loading States**: Stato uploading durante upload
- **File Preview**: Preview file prima dell'invio
- **Emoji Insertion**: Inserimento emoji nel testo

### UI/UX

- Textarea con auto-resize
- Pulsanti emoji e file inline
- Bottone invio con gradiente
- Preview file sopra textarea
- Loading states durante upload
- Disabilitazione durante upload
- Layout responsive

## 🎨 Struttura UI

```
Container (space-y-3)
  ├── FileUpload (se selectedFile)
  └── Input Area (flex items-end gap-2)
      ├── Textarea Container (relative flex-1)
      │   ├── Textarea (auto-resize, max-h-32)
      │   └── Actions (absolute bottom-2 right-2)
      │       ├── Button File (se showFileUpload)
      │       │   └── Icon Paperclip
      │       └── EmojiPicker
      │   └── Input File (hidden)
      └── Button Send
          └── Icon Send
```

## 💡 Esempi d'Uso

```tsx
<MessageInput
  onSendMessage={handleSendMessage}
  onUploadFile={handleUploadFile}
  disabled={isLoading}
  placeholder="Scrivi un messaggio..."
/>
```

## 📝 Note Tecniche

- Utilizza `useRef` per textarea e input file
- Auto-resize textarea con `useEffect` che aggiorna height
- Gestione Enter key con `handleKeyDown` (Shift+Enter per newline)
- Upload file asincrono con `onUploadFile` callback
- Gestione stati uploading e errori
- Preview file con `FileUpload` component
- Inserimento emoji nel testo con `handleEmojiSelect`
- Focus textarea dopo inserimento emoji
- Stili con tema teal-cyan consistente

## ✅ Stato Componente

- ✅ **Completato**: 100%
- ✅ **Testato**: Funzionalità base testata
- ✅ **Documentato**: Questo file
- 📅 **Ultimo aggiornamento**: 2025-02-16
