# Componente: ChangePasswordModal

## 📋 Descrizione

Componente drawer/modal per cambiare la password dell'account. Include validazione password, verifica password attuale opzionale e aggiornamento tramite Supabase Auth.

## 📁 Percorso File

`src/components/settings/change-password-modal.tsx`

## 🔧 Props

```typescript
interface ChangePasswordModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}
```

### Dettaglio Props

- **`open`** (boolean, required): Controlla la visibilità del drawer
- **`onOpenChange`** (function, required): Callback chiamato quando il drawer viene aperto/chiuso

## 📦 Dipendenze

### React

- `React` (useState)

### UI Components

- `Drawer`, `DrawerContent`, `DrawerHeader`, `DrawerBody`, `DrawerFooter` da `@/components/ui`
- `Button`, `Input` da `@/components/ui`
- `useToast` da `@/components/ui/toast`

### Hooks

- `useSupabase` da `@/hooks/use-supabase`

## ⚙️ Funzionalità

### Core

1. **Input Password**: 3 campi (attuale opzionale, nuova, conferma)
2. **Validazione**: Valida lunghezza, complessità, corrispondenza
3. **Verifica Password Attuale**: Opzionale, verifica password corrente se fornita
4. **Aggiornamento**: Aggiorna password tramite Supabase Auth
5. **Reset Form**: Reset automatico dopo successo

### Validazione Password

- **Lunghezza**: Minimo 8 caratteri
- **Maiuscola**: Almeno una lettera maiuscola
- **Numero**: Almeno un numero
- **Simbolo**: Almeno un carattere speciale
- **Corrispondenza**: Nuova password e conferma devono coincidere

### Funzionalità Avanzate

- **Password Attuale Opzionale**: Se fornita, viene verificata prima dell'aggiornamento
- **Auto-reset**: Form viene resettato dopo successo
- **Gestione Errori**: Toast per errori validazione e aggiornamento

### Stati

- **Idle**: Form vuoto
- **Filling**: Utente sta compilando
- **Submitting**: Aggiornamento in corso
- **Success**: Password aggiornata con successo
- **Error**: Errore durante validazione/aggiornamento

### UI/UX

- Drawer laterale (side="right", size="md")
- 3 input password con placeholder descrittivi
- Messaggio errore sotto input
- Pulsanti Annulla e Aggiorna
- Loading state durante submit

## 🎨 Struttura UI

```
Drawer (side="right", size="md")
  └── DrawerContent
      ├── DrawerHeader
      │   ├── Title "Cambia password"
      │   └── Description
      ├── DrawerBody
      │   └── div (space-y-4)
      │       ├── Input "Password attuale (opzionale)"
      │       ├── Input "Nuova password"
      │       ├── Input "Conferma nuova password"
      │       └── Error Message (se errorMessage)
      └── DrawerFooter
          ├── Button "Annulla"
          └── Button "Aggiorna password"
```

## 📝 Esempi d'Uso

### Esempio Base

```tsx
import { ChangePasswordModal } from '@/components/settings/change-password-modal'

function SettingsPage() {
  const [isOpen, setIsOpen] = useState(false)

  return <ChangePasswordModal open={isOpen} onOpenChange={setIsOpen} />
}
```

## 🔍 Note Tecniche

### Validazione Password

```typescript
const validate = (): string | null => {
  if (!newPassword || !confirmPassword) return 'Compila tutti i campi'
  if (newPassword !== confirmPassword) return 'Le password non coincidono'
  if (newPassword.length < 8) return 'La nuova password deve avere almeno 8 caratteri'
  const hasUpper = /[A-Z]/.test(newPassword)
  const hasNumber = /\d/.test(newPassword)
  const hasSpecial = /[^A-Za-z0-9]/.test(newPassword)
  if (!hasUpper || !hasNumber || !hasSpecial)
    return 'La password deve includere almeno una maiuscola, un numero e un simbolo'
  return null
}
```

### Verifica Password Attuale

- Se `currentPassword` fornita e `user.email` presente:
  - Chiama `supabase.auth.signInWithPassword` per verificare
  - Se fallisce, mostra errore e blocca aggiornamento
- Se non fornita, procede direttamente all'aggiornamento

### Aggiornamento Password

- Utilizza `supabase.auth.updateUser({ password: newPassword })`
- Non richiede password attuale se non fornita (gestito da Supabase)
- Toast success dopo aggiornamento
- Reset form e chiusura drawer

### Limitazioni

- Password attuale opzionale (potrebbe essere un rischio sicurezza)
- Non mostra strength meter
- Validazione solo lato client (non server-side)

## ✅ Stato Componente

- ✅ **Completato**: Componente funzionante e utilizzato in produzione
- ✅ **Testato**: Integrato nei test E2E
- ✅ **Documentato**: Documentazione completa
