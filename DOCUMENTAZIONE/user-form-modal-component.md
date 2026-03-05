# Componente: UserFormModal

## 📋 Descrizione

Modal per creare o modificare utenti amministratore. Gestisce form completo con email, nome, cognome, telefono, ruolo, stato e password (solo per nuovi utenti). Integrato con API `/api/admin/users`.

## 📁 Percorso File

`src/components/dashboard/admin/user-form-modal.tsx`

## 🔧 Props

```typescript
interface UserFormModalProps {
  user: User | null
  open: boolean
  onClose: () => void
  onSuccess: () => void
}

interface User {
  id: string
  user_id: string
  email: string | null
  nome: string | null
  cognome: string | null
  phone: string | null
  role: 'admin' | 'pt' | 'trainer' | 'atleta' | 'athlete'
  stato: 'attivo' | 'inattivo' | 'sospeso'
  org_id: string | null
}
```

### Dettaglio Props

- **`user`** (User | null, required): Utente da modificare (null per creazione)
- **`open`** (boolean, required): Stato apertura modal
- **`onClose`** (function, required): Callback chiusura modal
- **`onSuccess`** (function, required): Callback dopo successo

## 📦 Dipendenze

### React Hooks

- `useState`, `useEffect` da `react`

### UI Components

- `Dialog`, `DialogContent`, `DialogHeader`, `DialogTitle` da `@/components/ui/dialog`
- `Button`, `Input`, `Label` da `@/components/ui`
- `Select`, `SelectContent`, `SelectItem`, `SelectTrigger`, `SelectValue` da `@/components/ui/select`

### Icons

- `X` da `lucide-react`

### Utils

- `notifySuccess`, `notifyError` da `@/lib/notifications`

## ⚙️ Funzionalità

### Core

1. **Creazione/Modifica Utente**: Form completo per utenti
2. **Validazione**: Validazione email, password, corrispondenza password
3. **API Integration**: Chiama API POST (crea) o PUT (modifica)
4. **Popolamento Form**: Popola form quando `user` cambia

### Campi Form

- **Email**: Input obbligatorio
- **Nome**: Input opzionale
- **Cognome**: Input opzionale
- **Telefono**: Input opzionale
- **Ruolo**: Select (admin, pt, trainer, atleta, athlete)
- **Stato**: Select (attivo, inattivo, sospeso)
- **Password**: Input obbligatorio solo per nuovi utenti
- **Conferma Password**: Input obbligatorio solo per nuovi utenti

### Funzionalità Avanzate

- **Sincronizzazione Props**: `useEffect` popola form quando `user` o `open` cambiano
- **Validazione Password**: Minimo 6 caratteri, corrispondenza
- **Password Opzionale**: Solo per nuovi utenti (non per modifica)
- **Notifiche**: Success/error notifications

### Validazioni

- Email obbligatoria
- Password obbligatoria solo per nuovi utenti
- Password min 6 caratteri
- Conferma password deve corrispondere

### UI/UX

- Dialog standard
- Form organizzato
- Loading state durante submit
- Notifiche success/error
- Reset form dopo successo

## 🎨 Struttura UI

```
Dialog
  └── DialogContent
      ├── DialogHeader
      │   └── DialogTitle
      ├── form
      │   ├── Input Email
      │   ├── Input Nome
      │   ├── Input Cognome
      │   ├── Input Telefono
      │   ├── Select Ruolo
      │   ├── Select Stato
      │   ├── Input Password (solo se !user)
      │   ├── Input Conferma Password (solo se !user)
      │   └── DialogFooter
      │       ├── Button Annulla
      │       └── Button Salva
```

## 📝 Esempi d'Uso

### Esempio Creazione

```tsx
import { UserFormModal } from '@/components/dashboard/admin/user-form-modal'

function AdminUsersPage() {
  const [showModal, setShowModal] = useState(false)

  return (
    <UserFormModal
      user={null}
      open={showModal}
      onClose={() => setShowModal(false)}
      onSuccess={() => {
        fetchUsers()
        setShowModal(false)
      }}
    />
  )
}
```

### Esempio Modifica

```tsx
<UserFormModal
  user={selectedUser}
  open={selectedUser !== null}
  onClose={() => setSelectedUser(null)}
  onSuccess={() => {
    fetchUsers()
    setSelectedUser(null)
  }}
/>
```

## 🔍 Note Tecniche

### API Calls

**Creazione**:

```typescript
POST / api / admin / users
{
  ;(email, password, nome, cognome, phone, role, stato)
}
```

**Modifica**:

```typescript
PUT / api / admin / users
{
  ;(userId, email, nome, cognome, phone, role, stato, password(opzionale))
}
```

### Popolamento Form

```typescript
useEffect(() => {
  if (user) {
    setFormData({
      email: user.email || '',
      nome: user.nome || '',
      // ... altri campi
      password: '', // Non popola password
      confirmPassword: '',
    })
  } else {
    // Reset per nuovo utente
  }
}, [user, open])
```

### Limitazioni

- Password non modificabile (solo per nuovi utenti)
- API endpoint deve essere implementato
- Validazione solo client-side (non server-side)

## ✅ Stato Componente

- ✅ **Completato**: Componente funzionante e utilizzato in produzione
- ✅ **Testato**: Integrato nei test E2E
- ✅ **Documentato**: Documentazione completa
