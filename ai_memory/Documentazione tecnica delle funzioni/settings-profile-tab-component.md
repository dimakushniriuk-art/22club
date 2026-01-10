# Componente: SettingsProfileTab

## 📋 Descrizione

Componente tab per la gestione del profilo utente nelle impostazioni. Permette di modificare nome, cognome, email, telefono e caricare/aggiornare l'avatar.

## 📁 Percorso File

`src/components/settings/settings-profile-tab.tsx`

## 🔧 Props

```typescript
interface SettingsProfileTabProps {
  profile: {
    id: string
    nome: string
    cognome: string
    email: string
    phone: string
    avatar: string | null
    avatar_url: string | null
  }
  profileLoading: boolean
  loading: boolean
  onProfileChange: (field: string, value: string) => void
  onSaveProfile: () => void
}
```

### Dettaglio Props

- **`profile`** (object, required): Dati profilo utente
- **`profileLoading`** (boolean, required): Mostra loading durante caricamento profilo
- **`loading`** (boolean, required): Mostra loading durante salvataggio
- **`onProfileChange`** (function, required): Callback per aggiornare campo profilo (field, value)
- **`onSaveProfile`** (function, required): Callback per salvare profilo

## 📦 Dipendenze

### UI Components

- `Card`, `CardContent`, `CardHeader`, `CardTitle`, `CardDescription` da `@/components/ui`
- `Button` da `@/components/ui`
- `Input` da `@/components/ui`
- `Avatar` da `@/components/ui/avatar`
- `AvatarUploader` da `@/components/settings/avatar-uploader`
- `UserCircle`, `Save`, `RefreshCw` da `lucide-react`

## ⚙️ Funzionalità

### Core

1. **Gestione Avatar**: Mostra avatar corrente e permette upload nuovo tramite `AvatarUploader`
2. **Modifica Dati**: Permette di modificare nome, cognome, email, telefono
3. **Salvataggio**: Pulsante per salvare modifiche al profilo
4. **Loading States**: Gestisce loading durante caricamento e salvataggio

### UI/UX

- Card con gradiente e backdrop blur
- Avatar con bordo ring teal
- Grid responsive per campi (1 colonna mobile, 2 desktop)
- Pulsante salva con loading state
- Spinner durante caricamento profilo

## 🎨 Struttura UI

```
div (space-y-6)
  └── Card
      ├── CardHeader
      │   ├── CardTitle "Profilo Utente"
      │   └── CardDescription
      └── CardContent
          ├── Loading (se profileLoading)
          │   └── Spinner
          └── Form (se !profileLoading)
              ├── Avatar + AvatarUploader
              ├── Grid (Nome, Cognome)
              ├── Grid (Email, Telefono)
              └── Button "Salva Profilo"
```

## 📝 Esempi d'Uso

### Esempio Base

```tsx
import { SettingsProfileTab } from '@/components/settings/settings-profile-tab'

function SettingsPage() {
  const handleProfileChange = (field: string, value: string) => {
    setProfile((prev) => ({ ...prev, [field]: value }))
  }

  const handleSaveProfile = async () => {
    await saveProfile(profile)
  }

  return (
    <SettingsProfileTab
      profile={profile}
      profileLoading={loading}
      loading={saving}
      onProfileChange={handleProfileChange}
      onSaveProfile={handleSaveProfile}
    />
  )
}
```

## 🔍 Note Tecniche

### Avatar Upload

- Utilizza componente `AvatarUploader` per gestire upload
- Callback `onUploaded` aggiorna sia `avatar_url` che `avatar`
- Limite file: JPG, PNG, GIF, max 2MB

### Formattazione Campi

- **Nome/Cognome**: Input text standard
- **Email**: Input type="email" con validazione browser
- **Telefono**: Input type="tel" con placeholder formato italiano

### Limitazioni

- Non gestisce validazione lato client (delegata al parent)
- Non mostra errori di validazione (gestiti dal parent)
- Avatar upload gestito da componente separato

## ✅ Stato Componente

- ✅ **Completato**: Componente funzionante e utilizzato in produzione
- ✅ **Testato**: Integrato nei test E2E
- ✅ **Documentato**: Documentazione completa
