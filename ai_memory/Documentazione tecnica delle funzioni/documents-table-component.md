# Componente: DocumentsTable

## 📋 Descrizione

Componente tabella per visualizzare documenti. Mostra lista documenti con atleta, categoria, file, stato, scadenza e azioni (download, visualizza). Include empty state e utilizza utility per formattazione.

## 📁 Percorso File

`src/components/dashboard/documenti/documents-table.tsx`

## 🔧 Props

```typescript
interface DocumentsTableProps {
  documents: Document[]
  onDocumentClick: (document: Document) => void
  onDownload: (document: Document) => void
}
```

### Dettaglio Props

- **`documents`** (Document[], required): Array documenti da visualizzare
- **`onDocumentClick`** (function, required): Callback click documento (apre dettaglio)
- **`onDownload`** (function, required): Callback download documento

## 📦 Dipendenze

### React

- Nessuna dipendenza React diretta

### UI Components

- `Card`, `CardContent`, `CardHeader`, `CardTitle` da `@/components/ui`
- `Badge`, `Button` da `@/components/ui`

### Icons

- `FileText`, `Calendar`, `User`, `Download`, `Eye` da `lucide-react`

### Utils

- `getStatusColor`, `getStatusText`, `getStatusIcon`, `getCategoryText`, `formatFileSize`, `formatDocumentDate` da `@/lib/document-utils`

### Types

- `Document` da `@/types/document`

## ⚙️ Funzionalità

### Core

1. **Tabella Documenti**: Visualizza documenti in formato tabella
2. **Formattazione**: Utilizza utility per formattare stato, categoria, dimensione, date
3. **Azioni**: Bottoni per download e visualizza documento
4. **Empty State**: Messaggio quando nessun documento

### Colonne Tabella

- **Atleta**: Nome atleta con icona User
- **Categoria**: Categoria documento (formattata)
- **File**: Nome file e dimensione con icona FileText
- **Stato**: Badge colorato con icona e testo
- **Scadenza**: Data scadenza formattata o "Senza scadenza"
- **Azioni**: Bottoni download e visualizza

### Funzionalità Avanzate

- **Click Riga**: Click su riga apre dettaglio
- **Stop Propagation**: Bottoni azioni fermano propagazione click
- **Utility Functions**: Utilizza utility per formattazione consistente
- **Empty State**: Messaggio con emoji e testo

### UI/UX

- Card con gradiente background
- Tabella responsive con scroll orizzontale
- Hover effects su righe
- Icone per ogni colonna
- Badge stato con icona
- Empty state con emoji

## 🎨 Struttura UI

```
Card (variant trainer)
  └── CardHeader
      └── CardTitle "Documenti (X)"
  └── CardContent
      └── table
          ├── thead
          │   └── tr
          │       └── th (per ogni colonna)
          └── tbody
              └── tr (per ogni documento, clickable)
                  ├── td Atleta (con icona)
                  ├── td Categoria
                  ├── td File (nome + dimensione)
                  ├── td Stato (badge con icona)
                  ├── td Scadenza (con icona)
                  └── td Azioni
                      ├── Button Download
                      └── Button Visualizza
```

## 📝 Esempi d'Uso

### Esempio Base

```tsx
import { DocumentsTable } from '@/components/dashboard/documenti/documents-table'

function DocumentsPage() {
  const documents = [
    // ... array documenti
  ]

  return (
    <DocumentsTable
      documents={documents}
      onDocumentClick={(doc) => setSelectedDoc(doc)}
      onDownload={(doc) => handleDownload(doc)}
    />
  )
}
```

## 🔍 Note Tecniche

### Utility Functions

- **getStatusColor**: Restituisce variante badge (success/warning/error)
- **getStatusText**: Restituisce testo stato formattato
- **getStatusIcon**: Restituisce icona stato
- **getCategoryText**: Restituisce testo categoria formattato
- **formatFileSize**: Formatta dimensione file (KB, MB)
- **formatDocumentDate**: Formatta data documento

### Limitazioni

- Tabella HTML nativa (non componente Table UI)
- Empty state generico (non personalizzabile)
- Solo 2 azioni (download e visualizza)

## ✅ Stato Componente

- ✅ **Completato**: Componente funzionante e utilizzato in produzione
- ✅ **Testato**: Integrato nei test E2E
- ✅ **Documentato**: Documentazione completa
