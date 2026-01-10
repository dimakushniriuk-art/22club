# Componente: DocumentUploaderModal

## 📋 Descrizione

Componente modal per upload documenti da parte dello staff. Include selezione atleta, upload file a Supabase Storage, inserimento metadata nel database e gestione errori con rollback.

## 📁 Percorso File

`src/components/documents/document-uploader-modal.tsx`

## 🔧 Props

```typescript
interface DocumentUploaderModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}
```

### Dettaglio Props

- **`open`** (boolean, required): Stato apertura/chiusura modal
- **`onOpenChange`** (function, required): Callback per cambiare stato apertura
- **`onSuccess`** (function, optional): Callback chiamato dopo upload riuscito

## 📦 Dipendenze

### React

- `useState` da `react`

### UI Components

- `Dialog`, `DialogContent`, `DialogHeader`, `DialogTitle` da `@/components/ui/dialog`
- `Button` da `@/components/ui/button`
- `Input` da `@/components/ui/input`
- `Label` da `@/components/ui/label`
- `Upload`, `User`, `FileText`, `Calendar`, `X`, `Loader2`, `File` da `lucide-react`

### Hooks

- `useClienti` da `@/hooks/use-clienti`
- `useToast` da `@/components/ui/toast`

### Libraries

- `createClient` da `@/lib/supabase`

## ⚙️ Funzionalità

### Core

1. **Modal Dialog**: Dialog per upload documenti
2. **Selezione Atleta**: Select per scegliere atleta
3. **File Upload**: Upload file a Supabase Storage
4. **Database Insert**: Inserimento metadata in tabella documents
5. **Progress Tracking**: Progress bar durante upload
6. **Error Handling**: Gestione errori con rollback

### Funzionalità Avanzate

- **Supabase Storage**: Upload file a bucket 'documents'
- **Rollback**: Eliminazione file se DB insert fallisce
- **Progress Bar**: Progress bar con percentuali (0-50-100)
- **Toast Notifications**: Notifiche successo/errore
- **Form Validation**: Validazione form (atleta, file, categoria)
- **File Path**: Path file strutturato (`{athlete_id}/{timestamp}_{filename}`)
- **Metadata Complete**: Inserimento metadata completo (nome, dimensione, tipo, scadenza, note, status)

### UI/UX

- Dialog con max-width 2xl
- Form completo con validazione
- Select atleta con lista clienti
- Input file con preview
- Select categoria
- Input data scadenza
- Textarea note
- Progress bar durante upload
- Toast notifications
- Layout responsive

## 🎨 Struttura UI

```
Dialog
  └── DialogContent (max-w-2xl)
      ├── DialogHeader
      │   ├── Icon Upload
      │   └── DialogTitle: "Carica Documento"
      └── Form
          ├── Error Message (se error)
          ├── Select Atleta (con icona User)
          ├── Input File (con icona File)
          │   └── Preview (se file selezionato)
          ├── Select Categoria
          ├── Input Data Scadenza (con icona Calendar)
          ├── Textarea Note (con icona FileText)
          ├── Progress Bar (se loading)
          └── Actions
              ├── Button Annulla
              └── Button Carica (con loading state)
```

## 💡 Esempi d'Uso

```tsx
<DocumentUploaderModal
  open={isOpen}
  onOpenChange={setIsOpen}
  onSuccess={() => {
    refetchDocuments()
    setIsOpen(false)
  }}
/>
```

## 📝 Note Tecniche

- Utilizza `createClient` per Supabase client
- Upload a bucket 'documents' con path strutturato
- Inserimento in tabella `documents` con metadata completo
- Rollback: elimina file da storage se DB insert fallisce
- Progress tracking: 0% → 50% (upload) → 100% (DB insert)
- Toast notifications per feedback utente
- Form reset dopo successo
- Validazione: atleta, file, categoria obbligatori
- Status default: 'valido'
- `uploaded_by_user_id` da profile corrente
- Stili con tema blue-cyan consistente

## ✅ Stato Componente

- ✅ **Completato**: 100%
- ✅ **Testato**: Funzionalità base testata
- ✅ **Documentato**: Questo file
- 📅 **Ultimo aggiornamento**: 2025-02-16
