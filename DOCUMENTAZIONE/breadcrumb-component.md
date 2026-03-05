# Componente: Breadcrumb

## 📋 Descrizione

Componente breadcrumb per navigazione gerarchica. Mostra percorso navigazione con link cliccabili e separatori. L'ultimo elemento è non-cliccabile e evidenziato.

## 📁 Percorso File

`src/components/dashboard/breadcrumb.tsx`

## 🔧 Props

```typescript
interface BreadcrumbProps {
  items: BreadcrumbItem[]
  className?: string
}

export interface BreadcrumbItem {
  label: string
  href?: string
}
```

### Dettaglio Props

- **`items`** (BreadcrumbItem[], required): Array elementi breadcrumb
- **`className`** (string, optional): Classi CSS aggiuntive

### BreadcrumbItem

- **`label`** (string, required): Testo elemento
- **`href`** (string, optional): Link href (se non presente, elemento non cliccabile)

## 📦 Dipendenze

### React

- Nessuna dipendenza React diretta

### Next.js

- `Link` da `next/link`

### Icons

- `ChevronRight` da `lucide-react`

### Utils

- `cn` da `@/lib/utils`

## ⚙️ Funzionalità

### Core

1. **Navigazione Gerarchica**: Mostra percorso con link
2. **Ultimo Elemento**: Non cliccabile, evidenziato, aria-current="page"
3. **Separatori**: ChevronRight tra elementi
4. **Accessibilità**: ARIA label e attributes

### Funzionalità Avanzate

- **Link Condizionali**: Solo elementi con `href` sono link
- **Ultimo Elemento**: Sempre span (non link), font-medium, text-primary
- **Separatori**: Solo tra elementi (non dopo ultimo)
- **Hover Effects**: Link con hover text-primary

### UI/UX

- Layout orizzontale con gap
- Separatori tra elementi
- Link con hover effect
- Ultimo elemento evidenziato
- Testo piccolo e leggibile

## 🎨 Struttura UI

```
nav (flex items-center gap-2, aria-label="Breadcrumb")
  └── ol (flex items-center gap-2)
      └── li (per ogni item)
          ├── Link o span (in base a href)
          └── ChevronRight (se non ultimo)
```

## 📝 Esempi d'Uso

### Esempio Base

```tsx
import { Breadcrumb } from '@/components/dashboard/breadcrumb'

function DashboardPage() {
  return (
    <Breadcrumb
      items={[
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'Clienti', href: '/dashboard/clienti' },
        { label: 'Mario Rossi' }, // Ultimo elemento, no href
      ]}
    />
  )
}
```

## 🔍 Note Tecniche

### Logica Ultimo Elemento

- Se `index === items.length - 1`: elemento è ultimo
- Ultimo elemento: sempre `span`, `text-text-primary font-medium`, `aria-current="page"`
- Altri elementi: `Link` se `href` presente, altrimenti `span`

### Separatori

- `ChevronRight` solo se `!isLast`
- Icona con `aria-hidden="true"` (decorativa)
- Colore: `text-text-tertiary`

### Accessibilità

- `nav` con `aria-label="Breadcrumb"`
- `aria-current="page"` sull'ultimo elemento
- Link con href appropriati

### Limitazioni

- Solo un livello di nesting (non supporta breadcrumb annidati)
- Separatore fisso (ChevronRight, non configurabile)
- Stile fisso (non temabile)

## ✅ Stato Componente

- ✅ **Completato**: Componente funzionante e utilizzato in produzione
- ✅ **Testato**: Integrato nei test E2E
- ✅ **Documentato**: Documentazione completa
