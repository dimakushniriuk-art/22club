# Componente: SettingsPrivacyTab

## 📋 Descrizione

Componente tab per la gestione delle impostazioni privacy e sicurezza. Permette di controllare visibilità profilo, email, telefono e condivisione analytics.

## 📁 Percorso File

`src/components/settings/settings-privacy-tab.tsx`

## 🔧 Props

```typescript
interface SettingsPrivacyTabProps {
  privacy: {
    profileVisible: boolean
    showEmail: boolean
    showPhone: boolean
    analytics: boolean
  }
  loading: boolean
  onPrivacyChange: (field: string, value: boolean) => void
  onSave: () => void
}
```

### Dettaglio Props

- **`privacy`** (object, required): Impostazioni privacy
- **`loading`** (boolean, required): Mostra loading durante salvataggio
- **`onPrivacyChange`** (function, required): Callback per aggiornare impostazione privacy (field, value)
- **`onSave`** (function, required): Callback per salvare impostazioni privacy

## 📦 Dipendenze

### UI Components

- `Card`, `CardContent`, `CardHeader`, `CardTitle`, `CardDescription` da `@/components/ui`
- `Button` da `@/components/ui`
- `Switch` da `@/components/ui`
- `Label` da `@/components/ui`
- `Shield`, `Save`, `RefreshCw` da `lucide-react`

## ⚙️ Funzionalità

### Core

1. **Profilo Pubblico**: Switch per rendere profilo visibile ad altri utenti
2. **Mostra Email**: Switch per mostrare email nel profilo pubblico
3. **Mostra Telefono**: Switch per mostrare telefono nel profilo pubblico
4. **Condividi Analytics**: Switch per permettere uso dati anonimi per migliorare servizio
5. **Salvataggio**: Pulsante per salvare impostazioni privacy

### UI/UX

- Card unica con tutte le impostazioni
- Switch con layout orizzontale (label sinistra, switch destra)
- Descrizioni chiare per ogni opzione
- Hover effect su ogni riga
- Pulsante salva con loading state

## 🎨 Struttura UI

```
Card
  ├── CardHeader
  │   ├── CardTitle "Privacy e Sicurezza"
  │   └── CardDescription
  └── CardContent
      ├── Switch "Profilo Pubblico"
      ├── Switch "Mostra Email"
      ├── Switch "Mostra Telefono"
      ├── Switch "Condividi Analytics"
      └── Button "Salva Impostazioni Privacy"
```

## 📝 Esempi d'Uso

### Esempio Base

```tsx
import { SettingsPrivacyTab } from '@/components/settings/settings-privacy-tab'

function SettingsPage() {
  const handlePrivacyChange = (field: string, value: boolean) => {
    setPrivacy((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <SettingsPrivacyTab
      privacy={privacy}
      loading={loading}
      onPrivacyChange={handlePrivacyChange}
      onSave={handleSavePrivacy}
    />
  )
}
```

## 🔍 Note Tecniche

### Dipendenze Logiche

- `showEmail` e `showPhone` dovrebbero essere disabilitati se `profileVisible === false` (non gestito internamente)
- Logica di dipendenza gestita dal parent se necessario

### Layout Switch

- Stesso layout di `SettingsNotificationsTab`
- Card con bordo e hover effect
- Descrizioni informative per ogni opzione

### Limitazioni

- Non gestisce validazione (sempre salvabile)
- Non mostra preview visibilità profilo
- Dipendenze logiche tra switch non gestite internamente

## ✅ Stato Componente

- ✅ **Completato**: Componente funzionante e utilizzato in produzione
- ✅ **Testato**: Integrato nei test E2E
- ✅ **Documentato**: Documentazione completa
