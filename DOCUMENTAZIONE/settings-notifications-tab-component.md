# Componente: SettingsNotificationsTab

## 📋 Descrizione

Componente tab per la gestione delle preferenze notifiche. Permette di abilitare/disabilitare canali di notifica (email, push, SMS) e tipi di notifiche (nuovi clienti, pagamenti, appuntamenti, messaggi).

## 📁 Percorso File

`src/components/settings/settings-notifications-tab.tsx`

## 🔧 Props

```typescript
interface SettingsNotificationsTabProps {
  notifications: {
    email: boolean
    push: boolean
    sms: boolean
    newClients: boolean
    payments: boolean
    appointments: boolean
    messages: boolean
  }
  loading: boolean
  onNotificationChange: (field: string, value: boolean) => void
  onSave: () => void
}
```

### Dettaglio Props

- **`notifications`** (object, required): Stato di tutte le notifiche (canali e tipi)
- **`loading`** (boolean, required): Mostra loading durante salvataggio
- **`onNotificationChange`** (function, required): Callback per aggiornare notifica (field, value)
- **`onSave`** (function, required): Callback per salvare impostazioni notifiche

## 📦 Dipendenze

### UI Components

- `Card`, `CardContent`, `CardHeader`, `CardTitle`, `CardDescription` da `@/components/ui`
- `Button` da `@/components/ui`
- `Switch` da `@/components/ui`
- `Label` da `@/components/ui`
- `Bell`, `Mail`, `Smartphone`, `Save`, `RefreshCw` da `lucide-react`

## ⚙️ Funzionalità

### Core

1. **Canali Notifica**: Switch per email, push notifications, SMS
2. **Tipi Notifica**: Switch per nuovi clienti, pagamenti, appuntamenti, messaggi
3. **Salvataggio**: Pulsante per salvare tutte le preferenze

### Canali Notifica

- **Email**: Notifiche via email
- **Push**: Notifiche push sul dispositivo
- **SMS**: Notifiche via SMS

### Tipi Notifica

- **Nuovi Clienti**: Notifiche quando un nuovo cliente si iscrive
- **Pagamenti**: Notifiche su nuovi pagamenti e fatture
- **Appuntamenti**: Notifiche su appuntamenti e modifiche
- **Messaggi**: Notifiche quando ricevi nuovi messaggi

### UI/UX

- Card unica con tutte le impostazioni
- Switch con layout orizzontale (label sinistra, switch destra)
- Icone colorate per ogni canale/tipo
- Hover effect su ogni riga
- Pulsante salva con loading state

## 🎨 Struttura UI

```
Card
  ├── CardHeader
  │   ├── CardTitle "Preferenze Notifiche"
  │   └── CardDescription
  └── CardContent
      ├── Sezione "Canali di Notifica"
      │   ├── Switch Email (icona Mail)
      │   ├── Switch Push (icona Smartphone)
      │   └── Switch SMS (icona Smartphone)
      ├── Sezione "Tipi di Notifiche"
      │   ├── Switch Nuovi Clienti
      │   ├── Switch Pagamenti
      │   ├── Switch Appuntamenti
      │   └── Switch Messaggi
      └── Button "Salva Impostazioni Notifiche"
```

## 📝 Esempi d'Uso

### Esempio Base

```tsx
import { SettingsNotificationsTab } from '@/components/settings/settings-notifications-tab'

function SettingsPage() {
  const handleNotificationChange = (field: string, value: boolean) => {
    setNotifications((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <SettingsNotificationsTab
      notifications={notifications}
      loading={loading}
      onNotificationChange={handleNotificationChange}
      onSave={handleSaveNotifications}
    />
  )
}
```

## 🔍 Note Tecniche

### Gestione Switch

- Ogni switch è controllato tramite prop `checked`
- Cambio gestito tramite `onCheckedChange` che chiama `onNotificationChange`
- Stato locale non gestito (completamente controllato)

### Layout Switch

- Ogni switch in card con bordo e hover effect
- Icona + label + descrizione a sinistra
- Switch a destra
- Layout responsive

### Limitazioni

- Non gestisce validazione (sempre salvabile)
- Non mostra preview notifiche
- Non gestisce permessi dispositivo (push, SMS)

## ✅ Stato Componente

- ✅ **Completato**: Componente funzionante e utilizzato in produzione
- ✅ **Testato**: Integrato nei test E2E
- ✅ **Documentato**: Documentazione completa
