# Componente: AdminUsersContent

## 📋 Descrizione

Componente per gestione utenti amministratore. Include tabella utenti con ricerca, filtri ruolo/stato, azioni (crea, modifica, elimina, visualizza), paginazione e integrazione con UserFormModal e UserDeleteDialog.

## 📁 Percorso File

`src/components/dashboard/admin/admin-users-content.tsx`

## 🔧 Props

```typescript
// Nessuna prop - componente senza props
```

## 📦 Dipendenze

### React Hooks

- `useState`, `useEffect`, `useMemo` da `react`

### UI Components

- `Card`, `CardContent`, `CardHeader`, `CardTitle` da `@/components/ui/card`
- `Button`, `Input`, `Badge` da `@/components/ui`
- `Table`, `TableBody`, `TableCell`, `TableHead`, `TableHeader`, `TableRow` da `@/components/ui/table`
- `DropdownMenu`, `DropdownMenuContent`, `DropdownMenuItem`, `DropdownMenuTrigger` da `@/components/ui/dropdown-menu`
- `Select` da `@/components/ui/select`
- `Skeleton` da `@/components/shared/ui/skeleton`

### Icons

- `Search`, `UserPlus`, `Filter`, `Trash2`, `Edit`, `Eye`, `MoreVertical` da `lucide-react`

### Componenti Interni

- `UserFormModal` da `./user-form-modal`
- `UserDeleteDialog` da `./user-delete-dialog`

### Utils

- `notifySuccess`, `notifyError` da `@/lib/notifications`

## ⚙️ Funzionalità

### Core

1. **Tabella Utenti**: Visualizza utenti con tutte le informazioni
2. **Ricerca**: Filtra per nome, cognome, email, telefono
3. **Filtri**: Filtra per ruolo e stato
4. **CRUD Utenti**: Crea, modifica, elimina utenti
5. **Paginazione**: Navigazione tra pagine

### Colonne Tabella

- Nome, Cognome, Email, Telefono, Ruolo, Stato, Organizzazione, Data Iscrizione, Azioni

### Funzionalità Avanzate

- **Filtri Combinati**: Ricerca + ruolo + stato
- **Memoization**: `useMemo` per filtri ottimizzati
- **API Integration**: Chiama `/api/admin/users` per CRUD
- **Notifiche**: Success/error notifications
- **Loading State**: Skeleton loading durante caricamento

### UI/UX

- Container con header
- Toolbar con ricerca e filtri
- Tabella responsive
- Dropdown menu azioni
- Modali per form e delete

## 🎨 Struttura UI

```
div (container)
  ├── Header + Button Crea Utente
  ├── Toolbar (ricerca + filtri)
  ├── Table
  │   ├── TableHeader
  │   └── TableBody
  │       └── TableRow (per ogni utente)
  │           └── TableCell + DropdownMenu Azioni
  ├── UserFormModal
  └── UserDeleteDialog
```

## 📝 Esempi d'Uso

### Esempio Base

```tsx
import { AdminUsersContent } from '@/components/dashboard/admin/admin-users-content'

export default function AdminUsersPage() {
  return <AdminUsersContent />
}
```

## 🔍 Note Tecniche

### Filtri Combinati

```typescript
const filteredUsers = useMemo(() => {
  return users.filter((user) => {
    // Ricerca
    if (searchTerm) {
      /* ... */
    }
    // Ruolo
    if (roleFilter !== 'tutti') {
      /* ... */
    }
    // Stato
    if (statoFilter !== 'tutti') {
      /* ... */
    }
    return true
  })
}, [users, searchTerm, roleFilter, statoFilter])
```

### Limitazioni

- Paginazione gestita dal parent (non interna)
- API endpoint deve essere implementato
- Filtri solo client-side (non server-side)

## ✅ Stato Componente

- ✅ **Completato**: Componente funzionante e utilizzato in produzione
- ✅ **Testato**: Integrato nei test E2E
- ✅ **Documentato**: Documentazione completa
