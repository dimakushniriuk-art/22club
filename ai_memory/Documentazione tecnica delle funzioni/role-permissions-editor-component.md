# Componente: RolePermissionsEditor

## 📋 Descrizione

Componente editor per configurare permessi ruoli. Organizza permessi per categoria con accordion expand/collapse, checkbox per ogni permesso, toggle "seleziona tutti" per categoria e conteggio permessi abilitati.

## 📁 Percorso File

`src/components/dashboard/admin/role-permissions-editor.tsx`

## 🔧 Props

```typescript
interface RolePermissionsEditorProps {
  permissions: Record<string, boolean>
  onChange: (permissions: Record<string, boolean>) => void
  categories: PermissionCategory[]
}

interface PermissionCategory {
  category: string
  permissions: {
    key: string
    label: string
    description: string
  }[]
}
```

### Dettaglio Props

- **`permissions`** (Record<string, boolean>, required): Oggetto permessi corrente (key -> boolean)
- **`onChange`** (function, required): Callback cambio permessi
- **`categories`** (PermissionCategory[], required): Array categorie permessi

## 📦 Dipendenze

### React Hooks

- `useState` da `react`

### UI Components

- `Label` da `@/components/ui/label`

### Icons

- `ChevronDown`, `ChevronRight` da `lucide-react`

## ⚙️ Funzionalità

### Core

1. **Editor Permessi**: Checkbox per ogni permesso
2. **Categorie Accordion**: Expand/collapse per categoria
3. **Toggle Tutti**: Seleziona/deseleziona tutti permessi in categoria
4. **Conteggio**: Mostra permessi abilitati per categoria

### Funzionalità Avanzate

- **State Accordion**: Set per tracciare categorie espanse
- **Toggle Singolo**: Click checkbox per toggle singolo permesso
- **Toggle Categoria**: Click "Seleziona tutti" per toggle tutti permessi categoria
- **Conteggio Dinamico**: Calcola permessi abilitati per categoria

### UI/UX

- Scroll container (max-h-96)
- Categorie con border e background
- Icone expand/collapse
- Checkbox con label e descrizione
- Hover effects su permessi

## 🎨 Struttura UI

```
div (space-y-2, max-h-96, overflow-y-auto)
  └── div (per ogni categoria, border rounded-lg)
      ├── Header (flex justify-between)
      │   ├── Button Expand/Collapse
      │   │   ├── Chevron icon
      │   │   ├── Nome categoria
      │   │   └── Conteggio (X/Y)
      │   └── Button "Seleziona tutti"
      └── div (se expanded, space-y-2, pl-6)
          └── div (per ogni permesso)
              ├── Checkbox
              └── Label + Descrizione
```

## 📝 Esempi d'Uso

### Esempio Base

```tsx
import { RolePermissionsEditor } from '@/components/dashboard/admin/role-permissions-editor'

function RoleForm() {
  const [permissions, setPermissions] = useState<Record<string, boolean>>({})

  const categories = [
    {
      category: 'Utenti',
      permissions: [
        { key: 'users.view', label: 'Visualizza utenti', description: '...' },
        // ...
      ],
    },
    // ...
  ]

  return (
    <RolePermissionsEditor
      permissions={permissions}
      onChange={setPermissions}
      categories={categories}
    />
  )
}
```

## 🔍 Note Tecniche

### Toggle Categoria

```typescript
const toggleAllInCategory = (category: PermissionCategory) => {
  const categoryPermissions = category.permissions.map((p) => p.key)
  const allEnabled = categoryPermissions.every((key) => permissions[key] === true)

  const newPermissions = { ...permissions }
  categoryPermissions.forEach((key) => {
    newPermissions[key] = !allEnabled
  })
  onChange(newPermissions)
}
```

### Conteggio

```typescript
const enabledCount = categoryPermissions.filter((key) => permissions[key] === true).length
```

### Limitazioni

- Scroll container fisso (max-h-96)
- Solo permessi binari (true/false)
- Categorie devono essere fornite (non caricate internamente)

## ✅ Stato Componente

- ✅ **Completato**: Componente funzionante e utilizzato in produzione
- ✅ **Testato**: Integrato nei test E2E
- ✅ **Documentato**: Documentazione completa
