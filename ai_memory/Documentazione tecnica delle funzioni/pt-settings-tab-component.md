# Componente: PTSettingsTab

## 📋 Descrizione

Componente tab per le impostazioni del Personal Trainer. Gestisce profilo, notifiche (email, push, SMS), privacy e aspetto dell'interfaccia. Include sub-tabs per organizzare le diverse sezioni.

## 📁 Percorso File

`src/components/profile/pt-settings-tab.tsx`

## 🔧 Props

```typescript
interface PTSettingsTabProps {
  settings: Settings
  authUserId: string | null
  isSavingSettings: boolean
  saveSuccess: boolean
  onSave: () => void
  onUpdateProfile: (field: string, value: string) => void
  onToggleNotification: (key: string) => void
  onTogglePrivacy: (key: string) => void
  onUpdateAppearance: (field: string, value: unknown) => void
}

interface Settings {
  profile: {
    nome: string
    cognome: string
    email: string
    phone: string
    bio: string
    address: string
    avatar: string | null
  }
  notifications: {
    email_nuovi_clienti: boolean
    email_appuntamenti: boolean
    email_pagamenti: boolean
    push_nuovi_messaggi: boolean
    push_reminder_appuntamenti: boolean
    push_scadenze_documenti: boolean
    sms_conferma_appuntamenti: boolean
  }
  privacy: {
    profilo_pubblico: boolean
    mostra_email: boolean
    mostra_telefono: boolean
    condividi_statistiche: boolean
  }
  appearance: {
    theme: 'dark' | 'light'
    accent_color: string
    sidebar_collapsed: boolean
  }
}
```

### Dettaglio Props

- **`settings`** (Settings, required): Oggetto con tutte le impostazioni (profilo, notifiche, privacy, aspetto)
- **`authUserId`** (string | null, required): ID utente autenticato per upload avatar
- **`isSavingSettings`** (boolean, required): Stato di salvataggio in corso
- **`saveSuccess`** (boolean, required): Stato di successo salvataggio
- **`onSave`** (function, required): Callback per salvare tutte le impostazioni
- **`onUpdateProfile`** (function, required): Callback per aggiornare campo profilo (field, value)
- **`onToggleNotification`** (function, required): Callback per toggle notifica (key)
- **`onTogglePrivacy`** (function, required): Callback per toggle privacy (key)
- **`onUpdateAppearance`** (function, required): Callback per aggiornare aspetto (field, value)

## 📦 Dipendenze

### React

- `useState`, `lazy`, `Suspense` da `react`

### UI Components

- `Card`, `CardContent`, `CardHeader`, `CardTitle`, `CardDescription` da `@/components/ui`
- `Button` da `@/components/ui`
- `Input` da `@/components/ui`
- `Textarea` da `@/components/ui`
- `Tabs`, `TabsList`, `TabsTrigger`, `TabsContent` da `@/components/ui`
- `Badge` da `@/components/ui`
- `AvatarUploader` da `@/components/settings/avatar-uploader`
- `LoadingState` da `@/components/dashboard/loading-state`
- `Mail`, `Phone`, `MapPin`, `User`, `Bell`, `Shield`, `Palette`, `Save`, `Check` da `lucide-react`

### Hooks

- `usePush` da `@/hooks/use-push`

### Components (Lazy Loaded)

- `ChangePasswordModal` (lazy) da `@/components/settings/change-password-modal`
- `TwoFactorSetup` (lazy) da `@/components/settings/two-factor-setup`

## ⚙️ Funzionalità

### Core

1. **Gestione Profilo**: Modifica informazioni personali, avatar, bio, indirizzo
2. **Notifiche Email**: Toggle per notifiche email (nuovi clienti, appuntamenti, pagamenti)
3. **Notifiche Push**: Gestione push notifications con subscribe/unsubscribe
4. **Notifiche SMS**: Toggle per SMS conferma appuntamenti
5. **Privacy**: Impostazioni privacy (profilo pubblico, mostra email/telefono, statistiche)
6. **Aspetto**: Personalizzazione tema (dark/light) e colore accent
7. **Sicurezza**: Cambio password e autenticazione 2FA

### Funzionalità Avanzate

- **Sub-tabs**: Organizzazione in 4 sub-tabs (Profilo, Notifiche, Privacy, Aspetto)
- **Lazy Loading**: Modali pesanti caricate lazy (ChangePasswordModal, TwoFactorSetup)
- **Toggle Switches**: Switch personalizzati per notifiche e privacy
- **Push Notifications**: Integrazione con `usePush` hook per subscribe/unsubscribe
- **Theme Selector**: Selettore tema con preview
- **Accent Color**: Selettore colore accent con preview
- **Avatar Upload**: Upload avatar tramite `AvatarUploader`
- **Character Counter**: Contatore caratteri per bio (max 500)

### UI/UX

- Header con icona Shield e pulsante salva
- Sub-tabs con icone per navigazione
- Card colorate per ogni sezione (blue, green, yellow, red, purple, indigo)
- Toggle switches accessibili con keyboard support
- Modali lazy loaded con Suspense
- Preview temi e colori
- Loading states durante salvataggio
- Success feedback dopo salvataggio

## 🎨 Struttura UI

```
Container (space-y-6)
  ├── Header Card (blue theme)
  │   ├── Icon Shield + Titolo
  │   └── Button Salva (con loading/success states)
  └── Tabs
      ├── TabsList
      │   ├── Profilo (User icon)
      │   ├── Notifiche (Bell icon)
      │   ├── Privacy (Shield icon)
      │   └── Aspetto (Palette icon)
      └── TabsContent
          ├── Profilo
          │   ├── Card Informazioni Personali
          │   │   ├── Avatar + AvatarUploader
          │   │   ├── Nome, Cognome
          │   │   ├── Email, Telefono
          │   │   ├── Indirizzo
          │   │   └── Bio (Textarea con counter)
          │   └── Card Sicurezza
          │       ├── Cambia Password (Button → Modal)
          │       └── 2FA (Button → Modal)
          ├── Notifiche
          │   ├── Card Notifiche Email (green)
          │   │   └── Toggle switches (3)
          │   ├── Card Notifiche Push (blue)
          │   │   ├── Buttons Subscribe/Unsubscribe
          │   │   └── Toggle switches (3)
          │   └── Card Notifiche SMS (yellow)
          │       └── Toggle switch (1)
          ├── Privacy
          │   └── Card Impostazioni Privacy (red)
          │       └── Toggle switches (4)
          └── Aspetto
              └── Card Personalizzazione (indigo)
                  ├── Theme Selector (grid 2x)
                  └── Accent Color Selector (grid 4x)
      └── Modali (Suspense)
          ├── ChangePasswordModal (lazy)
          └── TwoFactorSetup (lazy)
```

## 💡 Esempi d'Uso

```tsx
<PTSettingsTab
  settings={settings}
  authUserId={userId}
  isSavingSettings={isSaving}
  saveSuccess={saveSuccess}
  onSave={handleSaveSettings}
  onUpdateProfile={handleUpdateProfile}
  onToggleNotification={handleToggleNotification}
  onTogglePrivacy={handleTogglePrivacy}
  onUpdateAppearance={handleUpdateAppearance}
/>
```

## 📝 Note Tecniche

- Componente estratto da `profilo/page.tsx` per migliorare manutenibilità (FASE C - Split File Lunghi)
- Utilizza `Tabs` component per organizzare sub-sezioni
- Lazy loading per modali pesanti (ChangePasswordModal, TwoFactorSetup)
- Toggle switches personalizzati con accessibilità (keyboard support, aria attributes)
- Integrazione con `usePush` hook per gestione push notifications
- Character counter per bio (max 500 caratteri)
- Preview temi e colori con card interattive
- Stili con tema colorato per ogni sezione (blue, green, yellow, red, purple, indigo)
- Loading states e success feedback
- Suspense fallback con LoadingState

## ✅ Stato Componente

- ✅ **Completato**: 100%
- ✅ **Testato**: Funzionalità base testata
- ✅ **Documentato**: Questo file
- 📅 **Ultimo aggiornamento**: 2025-02-16
