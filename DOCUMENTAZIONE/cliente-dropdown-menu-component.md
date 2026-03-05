# Componente: ClienteDropdownMenu

## 📋 Descrizione

Componente dropdown menu per azioni cliente. Mostra menu contestuale con azioni opzionali (modifica, storico, documenti, email, elimina) per ogni cliente.

## 📁 Percorso File

`src/components/dashboard/cliente-dropdown-menu.tsx`

## 🔧 Props

```typescript
interface ClienteDropdownMenuProps {
  cliente: Cliente
  trigger: React.ReactNode
  onEdit?: (cliente: Cliente) => void
  onViewHistory?: (cliente: Cliente) => void
  onViewDocuments?: (cliente: Cliente) => void
  onSendEmail?: (cliente: Cliente) => void
  onDelete?: (cliente: Cliente) => void
}
```

### Dettaglio Props

- **`cliente`** (Cliente, required): Cliente per cui mostrare menu
- **`trigger`** (ReactNode, required): Elemento trigger (bottone/icona)
- **`onEdit`** (function, optional): Callback modifica profilo
- **`onViewHistory`** (function, optional): Callback storico allenamenti
- **`onViewDocuments`** (function, optional): Callback documenti
- **`onSendEmail`** (function, optional): Callback invia email
- **`onDelete`** (function, optional): Callback elimina cliente

## 📦 Dipendenze

### React

- Nessuna dipendenza React diretta

### UI Components

- `DropdownMenu`, `DropdownMenuTrigger`, `DropdownMenuContent`, `DropdownMenuItem`, `DropdownMenuSeparator` da `@/components/ui`

### Icons

- `Edit`, `History`, `Trash`, `FileText`, `Mail` da `lucide-react`

### Types

- `Cliente` da `@/types/cliente`

## ⚙️ Funzionalità

### Core

1. **Menu Contestuale**: Dropdown menu con azioni cliente
2. **Azioni Opzionali**: Solo azioni con callback forniti vengono mostrate
3. **Separatori**: Separatori tra gruppi di azioni
4. **Stile Delete**: Azione elimina con colore rosso

### Azioni Disponibili

1. **Modifica profilo**: Se `onEdit` fornito
2. **Storico allenamenti**: Se `onViewHistory` fornito
3. **Documenti**: Se `onViewDocuments` fornito
4. **Invia email**: Se `onSendEmail` fornito (con separatore prima)
5. **Elimina cliente**: Se `onDelete` fornito (con separatore prima, stile rosso)

### Funzionalità Avanzate

- **Condizionale Rendering**: Solo azioni con callback vengono mostrate
- **Separatori Logici**: Separatori prima di email e delete
- **Stile Delete**: Colore rosso per azione pericolosa
- **Trigger Personalizzabile**: Trigger può essere qualsiasi ReactNode

### UI/UX

- Menu dropdown allineato a destra
- Icone per ogni azione
- Separatori visivi
- Stile pericoloso per delete
- Hover effects

## 🎨 Struttura UI

```
DropdownMenu
  └── DropdownMenuTrigger
      └── {trigger}
  └── DropdownMenuContent (align end)
      ├── DropdownMenuItem (Modifica) - se onEdit
      ├── DropdownMenuItem (Storico) - se onViewHistory
      ├── DropdownMenuItem (Documenti) - se onViewDocuments
      ├── DropdownMenuSeparator (se onSendEmail o onDelete)
      ├── DropdownMenuItem (Email) - se onSendEmail
      ├── DropdownMenuSeparator (se onDelete)
      └── DropdownMenuItem (Elimina, rosso) - se onDelete
```

## 📝 Esempi d'Uso

### Esempio Base

```tsx
import { ClienteDropdownMenu } from '@/components/dashboard/cliente-dropdown-menu'
import { MoreVertical } from 'lucide-react'
import { Button } from '@/components/ui'

function ClientsTable() {
  return (
    <ClienteDropdownMenu
      cliente={cliente}
      trigger={
        <Button variant="ghost" size="icon">
          <MoreVertical />
        </Button>
      }
      onEdit={(c) => setEditCliente(c)}
      onViewHistory={(c) => router.push(`/dashboard/atleti/${c.id}/storico`)}
      onDelete={(c) => handleDelete(c)}
    />
  )
}
```

## 🔍 Note Tecniche

### Rendering Condizionale

```typescript
{onEdit && (
  <DropdownMenuItem onClick={() => onEdit(cliente)}>
    <Edit className="mr-2 h-4 w-4" />
    Modifica profilo
  </DropdownMenuItem>
)}
```

### Separatori

- Separatore prima di email (se presente)
- Separatore prima di delete (se presente)
- Solo se ci sono azioni prima e dopo

### Stile Delete

```typescript
className = 'text-state-error hover:bg-state-error/10'
```

### Limitazioni

- Solo 5 azioni predefinite (non configurabili)
- Separatori hardcoded (non configurabili)
- Trigger deve essere ReactNode (non string)

## ✅ Stato Componente

- ✅ **Completato**: Componente funzionante e utilizzato in produzione
- ✅ **Testato**: Integrato nei test E2E
- ✅ **Documentato**: Documentazione completa
