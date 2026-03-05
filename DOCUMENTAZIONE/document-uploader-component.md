# Componente: DocumentUploader

## 📋 Descrizione

Componente per upload documenti con drag & drop, validazione, progress bar e gestione categorie. Supporta varianti staff e athlete con comportamenti diversi. Include form per categoria, data scadenza e note.

## 📁 Percorso File

`src/components/documents/document-uploader.tsx`

## 🔧 Props

```typescript
interface DocumentUploaderProps {
  onUpload?: (file: File, category: string, expiresAt?: string, notes?: string) => Promise<void>
  onCancel?: () => void
  variant?: 'staff' | 'athlete'
  className?: string
}
```

### Dettaglio Props

- **`onUpload`** (function, optional): Callback asincrono chiamato quando si carica il documento
- **`onCancel`** (function, optional): Callback chiamato quando si annulla
- **`variant`** ('staff' | 'athlete', optional): Variante componente (default: 'athlete')
- **`className`** (string, optional): Classi CSS aggiuntive

## 📦 Dipendenze

### React

- `useState`, `useRef`, `useCallback` da `react`

### UI Components

- `Card`, `CardContent`, `CardHeader`, `CardTitle` da `@/components/ui`
- `Button` da `@/components/ui`
- `Input` da `@/components/ui`
- `SimpleSelect` da `@/components/ui`
- `Textarea` da `@/components/ui`
- `Progress` da `@/components/ui`
- `Upload`, `FileText`, `X`, `CheckCircle`, `AlertTriangle`, `Calendar`, `Image as ImageIcon`, `File` da `lucide-react`

## ⚙️ Funzionalità

### Core

1. **Drag & Drop**: Supporto drag & drop file
2. **File Selection**: Click per selezionare file
3. **Validazione**: Validazione tipo e dimensione (PDF, JPG, PNG, max 20MB)
4. **Categoria**: Selettore categoria documento
5. **Data Scadenza**: Input data scadenza opzionale
6. **Note**: Textarea per note opzionali
7. **Upload Progress**: Progress bar durante upload
8. **Success State**: Feedback successo dopo upload

### Funzionalità Avanzate

- **Varianti**: Comportamento diverso per staff/athlete
- **Progress Simulation**: Simulazione progress durante upload
- **Auto-reset**: Reset form dopo successo (2 secondi)
- **Error Handling**: Gestione errori validazione e upload
- **File Icons**: Icone diverse per tipo file (PDF, immagine)
- **Formattazione Dimensione**: Formattazione dimensione file

### UI/UX

- Card con header e content
- Drop zone con border dashed
- Preview file selezionato
- Form con categoria, scadenza, note
- Progress bar durante upload
- Success state con icona
- Info footer con note
- Layout responsive

## 🎨 Struttura UI

```
Card (max-w-2xl)
  ├── CardHeader
  │   └── CardTitle (dinamico: "Carica Documento" / "Documento caricato!")
  └── CardContent
      ├── Se success
      │   ├── Icon CheckCircle
      │   ├── Titolo successo
      │   └── Messaggio
      └── Se !success
          ├── Upload Area (drag & drop)
          │   ├── Se file
          │   │   ├── Icon File
          │   │   ├── Nome + Dimensione
          │   │   └── Button Rimuovi
          │   └── Se !file
          │       ├── Icon Upload
          │       ├── Testo
          │       └── Button "Scegli file" (se !isStaff)
          ├── Form
          │   ├── SimpleSelect Categoria
          │   ├── Input Data Scadenza
          │   └── Textarea Note
          ├── Error Message (se error)
          ├── Progress Bar (se uploading)
          └── Actions
              ├── Button Carica
              └── Button Annulla (se onCancel)
          └── Info Footer
```

## 💡 Esempi d'Uso

```tsx
<DocumentUploader
  variant="athlete"
  onUpload={async (file, category, expiresAt, notes) => {
    await uploadDocument(file, category, expiresAt, notes)
  }}
  onCancel={() => setShowUploader(false)}
/>
```

## 📝 Note Tecniche

- Utilizza `useRef` per input file
- Drag & drop con `useCallback` per performance
- Validazione: max 20MB, tipi PDF, JPG, PNG
- Progress simulation con `setInterval` (0-90%, poi 100% al completamento)
- Auto-reset form dopo successo (2 secondi timeout)
- Varianti: staff mostra solo drag, athlete mostra anche button
- Formattazione dimensione con logaritmo
- Icone file dinamiche in base al tipo
- Stili con tema consistente

## ✅ Stato Componente

- ✅ **Completato**: 100%
- ✅ **Testato**: Funzionalità base testata
- ✅ **Documentato**: Questo file
- 📅 **Ultimo aggiornamento**: 2025-02-16
