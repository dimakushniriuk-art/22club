# Componente: DocumentDetailDrawer

## 📋 Descrizione

Componente drawer per visualizzare dettagli completi di un documento. Mostra informazioni documento, note, anteprima (placeholder) e azioni (download, segnala non valido). Drawer laterale destro.

## 📁 Percorso File

`src/components/dashboard/documenti/document-detail-drawer.tsx`

## 🔧 Props

```typescript
interface DocumentDetailDrawerProps {
  document: Document | null
  open: boolean
  onClose: () => void
  onDownload: (document: Document) => void
  onMarkInvalid: () => void
}
```

### Dettaglio Props

- **`document`** (Document | null, required): Documento da visualizzare (null chiude drawer)
- **`open`** (boolean, required): Stato apertura drawer
- **`onClose`** (function, required): Callback chiusura drawer
- **`onDownload`** (function, required): Callback download documento
- **`onMarkInvalid`** (function, required): Callback segnala documento non valido

## 📦 Dipendenze

### React

- Nessuna dipendenza React diretta

### UI Components

- `Drawer`, `DrawerContent` da `@/components/ui`
- `Badge`, `Button` da `@/components/ui`

### Icons

- `FileText`, `Download`, `AlertTriangle` da `lucide-react`

### Utils

- `getStatusColor`, `getStatusText`, `getStatusIcon`, `getCategoryText`, `formatFileSize`, `formatDocumentDate` da `@/lib/document-utils`

### Types

- `Document` da `@/types/document`

## ⚙️ Funzionalità

### Core

1. **Dettagli Documento**: Mostra tutte le informazioni documento
2. **Note**: Mostra note documento se presenti
3. **Anteprima**: Placeholder anteprima documento
4. **Azioni**: Bottoni per download e segnala non valido

### Informazioni Visualizzate

- **Stato**: Badge colorato con icona e testo
- **Atleta**: Nome atleta
- **Categoria**: Categoria formattata
- **File**: Nome file
- **Dimensione**: Dimensione formattata
- **Scadenza**: Data scadenza o "Senza scadenza"
- **Caricato da**: Nome staff che ha caricato
- **Note**: Note documento (se presenti)
- **Anteprima**: Placeholder (non implementata)

### Funzionalità Avanzate

- **Render Condizionale**: Restituisce null se `document === null`
- **Segnala Condizionale**: Bottone segnala solo se `status !== 'non_valido'`
- **Utility Functions**: Utilizza utility per formattazione consistente
- **Anteprima Placeholder**: Placeholder per anteprima (non implementata)

### UI/UX

- Drawer laterale destro
- Layout organizzato in sezioni
- Badge stato prominente
- Informazioni in formato chiave-valore
- Note in box evidenziato
- Anteprima placeholder
- Bottoni azioni full-width

## 🎨 Struttura UI

```
Drawer (side="right")
  └── DrawerContent
      └── div (space-y-6)
          ├── Sezione Info
          │   ├── Header (titolo + badge stato)
          │   └── div (space-y-3)
          │       ├── Atleta (key-value)
          │       ├── Categoria (key-value)
          │       ├── File (key-value)
          │       ├── Dimensione (key-value)
          │       ├── Scadenza (key-value)
          │       └── Caricato da (key-value)
          ├── Note (se presente)
          │   └── Box con note
          ├── Anteprima
          │   └── Placeholder (aspect-video)
          └── Azioni
              ├── Button Download (full-width)
              └── Button Segnala (se !non_valido, full-width)
```

## 📝 Esempi d'Uso

### Esempio Base

```tsx
import { DocumentDetailDrawer } from '@/components/dashboard/documenti/document-detail-drawer'

function DocumentsPage() {
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null)

  return (
    <DocumentDetailDrawer
      document={selectedDoc}
      open={selectedDoc !== null}
      onClose={() => setSelectedDoc(null)}
      onDownload={(doc) => handleDownload(doc)}
      onMarkInvalid={() => handleMarkInvalid(selectedDoc)}
    />
  )
}
```

## 🔍 Note Tecniche

### Utility Functions

Stesse utility di DocumentsTable per formattazione consistente.

### Anteprima

- Placeholder aspect-video
- Icona FileText grande
- Messaggio "Anteprima non disponibile"
- Tipo file mostrato

### Limitazioni

- Anteprima non implementata (solo placeholder)
- Solo 2 azioni (download e segnala)
- Drawer sempre a destra (non configurabile)

## ✅ Stato Componente

- ✅ **Completato**: Componente funzionante e utilizzato in produzione
- ✅ **Testato**: Integrato nei test E2E
- ✅ **Documentato**: Documentazione completa
