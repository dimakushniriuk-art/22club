# Componente: ClientiExportMenu

## 📋 Descrizione

Componente dropdown menu per esportare dati clienti. Supporta esportazione CSV e PDF. Bottone con icona Download e menu dropdown con opzioni.

## 📁 Percorso File

`src/components/dashboard/clienti-export-menu.tsx`

## 🔧 Props

```typescript
interface ClientiExportMenuProps {
  onExportCSV: () => void
  onExportPDF: () => void
  disabled?: boolean
}
```

### Dettaglio Props

- **`onExportCSV`** (function, required): Callback export CSV
- **`onExportPDF`** (function, required): Callback export PDF
- **`disabled`** (boolean, optional): Disabilita bottone (default: false)

## 📦 Dipendenze

### React

- Nessuna dipendenza React diretta

### UI Components

- `DropdownMenu`, `DropdownMenuTrigger`, `DropdownMenuContent`, `DropdownMenuItem`, `Button` da `@/components/ui`

### Icons

- `Download`, `FileText`, `FileSpreadsheet` da `lucide-react`

## ⚙️ Funzionalità

### Core

1. **Dropdown Menu**: Menu dropdown con opzioni export
2. **Export CSV**: Opzione per esportare come CSV
3. **Export PDF**: Opzione per esportare come PDF
4. **Disabled State**: Supporto per stato disabilitato

### Funzionalità Avanzate

- **Icona Download**: Icona visibile nel bottone
- **Menu Items con Icone**: Icone FileSpreadsheet (CSV) e FileText (PDF)
- **Accessibilità**: ARIA label per bottone
- **Disabled State**: Bottone disabilitato se `disabled === true`

### UI/UX

- Bottone outline con icona
- Menu dropdown allineato a destra
- Menu items con icona e testo
- Stato disabilitato visibile

## 🎨 Struttura UI

```
DropdownMenu
  └── DropdownMenuTrigger
      └── Button (variant outline, size sm)
          ├── Download icon
          └── "Export"
  └── DropdownMenuContent (align end)
      ├── DropdownMenuItem (CSV)
      │   ├── FileSpreadsheet icon
      │   └── "Esporta come CSV"
      └── DropdownMenuItem (PDF)
          ├── FileText icon
          └── "Esporta come PDF"
```

## 📝 Esempi d'Uso

### Esempio Base

```tsx
import { ClientiExportMenu } from '@/components/dashboard/clienti-export-menu'

function ClientsPage() {
  return (
    <ClientiExportMenu
      onExportCSV={() => {
        // Logica export CSV
        exportToCSV(clienti)
      }}
      onExportPDF={() => {
        // Logica export PDF
        exportToPDF(clienti)
      }}
      disabled={clienti.length === 0}
    />
  )
}
```

## 🔍 Note Tecniche

### Formati Export

- **CSV**: Formato tabellare standard
- **PDF**: Formato documento

### Limitazioni

- Solo 2 formati (CSV e PDF, non supporta altri formati)
- Logica esportazione deve essere implementata nel parent
- Menu items non configurabili (hardcoded)

## ✅ Stato Componente

- ✅ **Completato**: Componente funzionante e utilizzato in produzione
- ✅ **Testato**: Integrato nei test E2E
- ✅ **Documentato**: Documentazione completa
