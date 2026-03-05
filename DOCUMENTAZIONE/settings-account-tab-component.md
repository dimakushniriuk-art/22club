# Componente: SettingsAccountTab

## 📋 Descrizione

Componente tab per la gestione delle impostazioni account. Permette di configurare lingua, fuso orario, formato data/ora e cambio password.

## 📁 Percorso File

`src/components/settings/settings-account-tab.tsx`

## 🔧 Props

```typescript
interface SettingsAccountTabProps {
  account: {
    language: string
    timezone: string
    dateFormat: string
    timeFormat: string
  }
  loading: boolean
  passwords: {
    current: string
    new: string
    confirm: string
  }
  showCurrentPassword: boolean
  showNewPassword: boolean
  showConfirmPassword: boolean
  onAccountChange: (field: string, value: string) => void
  onPasswordChange: (field: string, value: string) => void
  onTogglePasswordVisibility: (field: 'current' | 'new' | 'confirm') => void
  onSave: () => void
  onChangePassword: () => void
}
```

### Dettaglio Props

- **`account`** (object, required): Impostazioni account (lingua, timezone, formati)
- **`loading`** (boolean, required): Mostra loading durante salvataggio
- **`passwords`** (object, required): Password per cambio password
- **`showCurrentPassword`**, **`showNewPassword`**, **`showConfirmPassword`** (boolean, required): Controllano visibilità password
- **`onAccountChange`** (function, required): Callback per aggiornare campo account
- **`onPasswordChange`** (function, required): Callback per aggiornare campo password
- **`onTogglePasswordVisibility`** (function, required): Callback per toggle visibilità password
- **`onSave`** (function, required): Callback per salvare impostazioni account
- **`onChangePassword`** (function, required): Callback per cambiare password

## 📦 Dipendenze

### UI Components

- `Card`, `CardContent`, `CardHeader`, `CardTitle`, `CardDescription` da `@/components/ui`
- `Button` da `@/components/ui`
- `Select` da `@/components/ui`
- `Label` da `@/components/ui`
- `Input` da `@/components/ui`
- `Globe`, `Save`, `RefreshCw`, `Lock`, `Eye`, `EyeOff` da `lucide-react`

## ⚙️ Funzionalità

### Core

1. **Lingua e Regione**: Selettori per lingua e fuso orario
2. **Formato Data/Ora**: Selettori per formato data (DD/MM/YYYY, MM/DD/YYYY, YYYY-MM-DD) e ora (24h, 12h)
3. **Cambio Password**: Form per cambiare password con toggle visibilità
4. **Salvataggio**: Pulsanti separati per salvare impostazioni account e cambiare password

### Funzionalità Avanzate

- **Toggle Password Visibility**: Mostra/nascondi password per ogni campo
- **Validazione Password**: Disabilita pulsante se password non valide
- **Loading States**: Mostra loading durante operazioni

### UI/UX

- 3 card separate (Lingua/Regione, Formato Data/Ora, Cambio Password)
- Select per opzioni predefinite
- Input password con icona toggle visibilità
- Pulsanti con loading state

## 🎨 Struttura UI

```
div (space-y-6)
  ├── Card "Lingua e Regione"
  │   ├── Select Lingua (it, en, es, fr)
  │   └── Select Fuso Orario
  ├── Card "Formato Data e Ora"
  │   ├── Select Formato Data
  │   └── Select Formato Ora
  ├── Button "Salva Impostazioni Account"
  └── Card "Cambia Password"
      ├── Input Password Attuale (con toggle)
      ├── Input Nuova Password (con toggle)
      ├── Input Conferma Password (con toggle)
      └── Button "Cambia Password"
```

## 📝 Esempi d'Uso

### Esempio Base

```tsx
import { SettingsAccountTab } from '@/components/settings/settings-account-tab'

function SettingsPage() {
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  return (
    <SettingsAccountTab
      account={account}
      loading={loading}
      passwords={passwords}
      showCurrentPassword={showCurrentPassword}
      showNewPassword={showNewPassword}
      showConfirmPassword={showConfirmPassword}
      onAccountChange={(field, value) => setAccount((prev) => ({ ...prev, [field]: value }))}
      onPasswordChange={(field, value) => setPasswords((prev) => ({ ...prev, [field]: value }))}
      onTogglePasswordVisibility={(field) => {
        if (field === 'current') setShowCurrentPassword(!showCurrentPassword)
        if (field === 'new') setShowNewPassword(!showNewPassword)
        if (field === 'confirm') setShowConfirmPassword(!showConfirmPassword)
      }}
      onSave={handleSaveAccount}
      onChangePassword={handleChangePassword}
    />
  )
}
```

## 🔍 Note Tecniche

### Lingue Supportate

- Italiano (it)
- English (en)
- Español (es)
- Français (fr)

### Fusi Orari

- Europa/Roma (GMT+1)
- Europa/Londra (GMT+0)
- America/New York (GMT-5)
- Asia/Tokyo (GMT+9)

### Formati Data

- DD/MM/YYYY
- MM/DD/YYYY
- YYYY-MM-DD

### Formati Ora

- 24 ore
- 12 ore (AM/PM)

### Validazione Password

- Pulsante disabilitato se `!passwords.new || !passwords.confirm`
- Validazione completa gestita dal parent

### Limitazioni

- Non gestisce validazione lato client (delegata al parent)
- Non mostra errori di validazione (gestiti dal parent)
- Password attuale opzionale (gestito dal parent)

## ✅ Stato Componente

- ✅ **Completato**: Componente funzionante e utilizzato in produzione
- ✅ **Testato**: Integrato nei test E2E
- ✅ **Documentato**: Documentazione completa
