# Componente: DocumentStatusBadge

## 📋 Descrizione

Componente badge per visualizzare lo stato di un documento. Supporta 5 stati (valido, in_scadenza, scaduto, non_valido, in-revisione) con icone, colori e tooltip. Include funzioni helper per gestione stati documenti.

## 📁 Percorso File

`src/components/documents/document-status-badge.tsx`

## 🔧 Props

```typescript
interface DocumentStatusBadgeProps {
  status: 'valido' | 'in_scadenza' | 'scaduto' | 'non_valido' | 'in-revisione'
  showIcon?: boolean
  size?: 'sm' | 'md' | 'lg'
  className?: string
}
```

### Dettaglio Props

- **`status`** (string, required): Stato del documento
- **`showIcon`** (boolean, optional): Mostra/nasconde l'icona (default: true)
- **`size`** ('sm' | 'md' | 'lg', optional): Dimensione badge (default: 'md')
- **`className`** (string, optional): Classi CSS aggiuntive

## 📦 Dipendenze

### UI Components

- `Badge` da `@/components/ui`
- `CheckCircle`, `Clock`, `XCircle`, `AlertTriangle`, `FileText` da `lucide-react`
- `CheckIcon`, `AlertTriangleIcon`, `XIcon` da `@/components/ui/professional-icons`

## ⚙️ Funzionalità

### Core

1. **Badge Stato**: Visualizza badge con stato documento
2. **Icone Dinamiche**: Icone diverse per ogni stato
3. **Colori Varianti**: Varianti Badge diverse per stato
4. **Tooltip**: Tooltip con descrizione stato
5. **Helper Functions**: Funzioni helper esportate per gestione stati

### Funzionalità Avanzate

- **5 Stati Supportati**: valido, in_scadenza, scaduto, non_valido, in-revisione
- **Helper Functions**: Funzioni per colore, icona, testo, scadenza
- **Expiry Logic**: Logica per calcolare scadenza e giorni rimanenti
- **Expiry Messages**: Messaggi formattati per scadenze

### UI/UX

- Badge con varianti colorate
- Icone per ogni stato
- Tooltip informativi
- Dimensioni personalizzabili
- Layout flex con icona e testo

## 🎨 Struttura UI

```
Badge (variant dinamico, size)
  ├── Icon (se showIcon)
  │   └── Icon dinamica (CheckCircle/Clock/XCircle/AlertTriangle/FileText)
  └── Testo
      └── Testo stato ("Valido", "In scadenza", etc.)
```

## 💡 Esempi d'Uso

```tsx
;<DocumentStatusBadge status="valido" showIcon={true} size="md" />

// Con helper functions
import { getDocumentStatusColor, isDocumentExpiring } from './document-status-badge'

const color = getDocumentStatusColor('in_scadenza')
const isExpiring = isDocumentExpiring(expiresAt)
```

## 📝 Note Tecniche

- Configurazione stati con `getStatusConfig` function
- Varianti Badge: success, warning, neutral in base allo stato
- Icone da lucide-react e professional-icons
- Tooltip con `title` attribute
- Helper functions esportate per riuso:
  - `getDocumentStatusColor`: Colore CSS per stato
  - `getDocumentStatusIcon`: Icona React per stato
  - `getDocumentStatusText`: Testo per stato
  - `isDocumentExpiring`: Controlla se scade entro 7 giorni
  - `isDocumentExpired`: Controlla se scaduto
  - `getDaysUntilExpiry`: Giorni rimanenti
  - `getExpiryMessage`: Messaggio formattato scadenza
- Stili con tema consistente

## ✅ Stato Componente

- ✅ **Completato**: 100%
- ✅ **Testato**: Funzionalità base testata
- ✅ **Documentato**: Questo file
- 📅 **Ultimo aggiornamento**: 2025-02-16
