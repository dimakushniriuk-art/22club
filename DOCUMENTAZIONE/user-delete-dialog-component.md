# Componente: UserDeleteDialog

## 📋 Descrizione

Componente AlertDialog per confermare eliminazione utente. Mostra nome utente (o email) e messaggio di conferma con avviso che l'operazione è permanente e non può essere annullata.

## 📁 Percorso File

`src/components/dashboard/admin/user-delete-dialog.tsx`

## 🔧 Props

```typescript
interface UserDeleteDialogProps {
  user: User
  open: boolean
  onClose: () => void
  onConfirm: () => void
}

interface User {
  id: string
  nome: string | null
  cognome: string | null
  email: string | null
}
```

### Dettaglio Props

- **`user`** (User, required): Utente da eliminare
- **`open`** (boolean, required): Stato apertura dialog
- **`onClose`** (function, required): Callback chiusura dialog
- **`onConfirm`** (function, required): Callback conferma eliminazione

## 📦 Dipendenze

### React

- Nessuna dipendenza React diretta

### UI Components

- `AlertDialog`, `AlertDialogAction`, `AlertDialogCancel`, `AlertDialogContent`, `AlertDialogDescription`, `AlertDialogFooter`, `AlertDialogHeader`, `AlertDialogTitle` da `@/components/ui/alert-dialog`

## ⚙️ Funzionalità

### Core

1. **Conferma Eliminazione**: Dialog di conferma per eliminazione utente
2. **Nome Utente**: Mostra nome completo o email come fallback
3. **Avviso Permanente**: Messaggio che l'operazione è permanente
4. **Azioni**: Bottoni annulla e conferma

### Funzionalità Avanzate

- **Nome Dinamico**: Costruisce nome da `nome + cognome` o usa email
- **Stile Pericoloso**: Bottone conferma con colore rosso
- **Messaggio Chiaro**: Spiega conseguenze eliminazione

### UI/UX

- AlertDialog standard
- Titolo chiaro
- Descrizione con nome utente evidenziato
- Avviso operazione permanente
- Bottoni annulla/conferma

## 🎨 Struttura UI

```
AlertDialog
  └── AlertDialogContent
      ├── AlertDialogHeader
      │   ├── AlertDialogTitle "Elimina Utente"
      │   └── AlertDialogDescription
      │       └── Messaggio con nome utente evidenziato
      └── AlertDialogFooter
          ├── AlertDialogCancel "Annulla"
          └── AlertDialogAction "Elimina" (rosso)
```

## 📝 Esempi d'Uso

### Esempio Base

```tsx
import { UserDeleteDialog } from '@/components/dashboard/admin/user-delete-dialog'

function AdminUsersPage() {
  const [deletingUser, setDeletingUser] = useState<User | null>(null)

  return (
    <UserDeleteDialog
      user={deletingUser!}
      open={deletingUser !== null}
      onClose={() => setDeletingUser(null)}
      onConfirm={async () => {
        await deleteUser(deletingUser!.id)
        setDeletingUser(null)
        fetchUsers()
      }}
    />
  )
}
```

## 🔍 Note Tecniche

### Nome Utente

```typescript
const userName =
  user.nome || user.cognome
    ? `${user.nome || ''} ${user.cognome || ''}`.trim()
    : user.email || 'Questo utente'
```

### Limitazioni

- Solo conferma (non gestisce eliminazione effettiva)
- Nome utente costruito semplicemente (non gestisce casi edge)
- Dialog sempre stesso stile (non configurabile)

## ✅ Stato Componente

- ✅ **Completato**: Componente funzionante e utilizzato in produzione
- ✅ **Testato**: Integrato nei test E2E
- ✅ **Documentato**: Documentazione completa
