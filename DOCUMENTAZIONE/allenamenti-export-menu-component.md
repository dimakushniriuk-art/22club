# Componente: AllenamentiExportMenu

## 📋 Descrizione

Componente dropdown menu per esportare dati allenamenti. Attualmente supporta solo esportazione CSV. Bottone con icona Download e menu dropdown.

## 📁 Percorso File

`src/components/dashboard/allenamenti-export-menu.tsx`

## 🔧 Props

```typescript
interface AllenamentiExportMenuProps {
  onExport: (format: 'csv') => void
  disabled?: boolean
}
```

### Dettaglio Props

- **`onExport`** (function, required): Callback esportazione con formato
- **`disabled`** (boolean, optional): Disabilita bottone

## 📦 Dipendenze

### React

- Nessuna dipendenza React diretta

### UI Components

- `DropdownMenu`, `DropdownMenuContent`, `DropdownMenuItem`, `DropdownMenuTrigger` da `@/components/ui/dropdown-menu`
- `Button` da `@/components/ui/button`

### Icons

- `Download`, `File` da `lucide-react`

## ⚙️ Funzionalità

### Core

1. **Dropdown Menu**: Menu dropdown con opzioni export
2. **Esportazione CSV**: Opzione per esportare come CSV
3. **Disabled State**: Supporto per stato disabilitato

### Funzionalità Avanzate

- **Icona Download**: Icona visibile nel bottone
- **Menu Item con Icona**: Icona File nel menu item
- **Accessibilità**: ARIA label per bottone

### UI/UX

- Bottone outline con icona
- Menu dropdown allineato a destra
- Menu item con icona e testo
- Stato disabilitato visibile

## 🎨 Struttura UI

```
DropdownMenu
  └── DropdownMenuTrigger
      └── Button (variant outline)
          ├── Download icon
          └── "Export"
  └── DropdownMenuContent (align end)
      └── DropdownMenuItem
          ├── File icon
          └── "Esporta come CSV"
```

## 📝 Esempi d'Uso

### Esempio Base

```tsx
import { AllenamentiExportMenu } from '@/components/dashboard/allenamenti-export-menu'

function SchedePage() {
  const handleExport = (format: 'csv') => {
    // Logica esportazione CSV
    console.log(`Exporting as ${format}`)
  }

  return <AllenamentiExportMenu onExport={handleExport} />
}
```

## 🔍 Note Tecniche

### Formato Export

- Attualmente solo 'csv' supportato
- Type `'csv'` hardcoded (non estendibile facilmente)

### Limitazioni

- Solo formato CSV (non supporta altri formati come Excel, PDF)
- Logica esportazione deve essere implementata nel parent
- Menu item non configurabile (hardcoded)

## ✅ Stato Componente

- ✅ **Completato**: Componente funzionante e utilizzato in produzione
- ✅ **Testato**: Integrato nei test E2E
- ✅ **Documentato**: Documentazione completa
