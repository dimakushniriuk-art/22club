# Componente: PTProfileTab

## 📋 Descrizione

Componente tab principale per il profilo del Personal Trainer. Mostra informazioni personali, statistiche professionali, badge e permette la modifica dei dati del profilo.

## 📁 Percorso File

`src/components/profile/pt-profile-tab.tsx`

## 🔧 Props

```typescript
interface PTProfileTabProps {
  profile: {
    nome: string
    cognome: string
    email: string
    phone: string
    data_nascita: string
    data_iscrizione: string
    specializzazione: string
    certificazioni: string
    avatar: string | null
    stats: {
      clienti_attivi: number
      sessioni_mese: number
      anni_esperienza: number
      valutazione_media: number
      certificazioni_conseguite: number
      revenue_mensile: number
    }
    badge: Array<{ id: string; name: string; icon: string; unlocked: boolean }>
  }
  isEditing: boolean
  onEdit: () => void
  onSave: () => void
  onCancel: () => void
  onProfileChange: (field: string, value: string) => void
  isSaving?: boolean
  onViewStats?: () => void
  onViewSettings?: () => void
  onLogout?: () => void
}
```

### Dettaglio Props

- **`profile`** (object, required): Dati completi del profilo PT con statistiche e badge
- **`isEditing`** (boolean, required): Stato di modifica attivo
- **`onEdit`** (function, required): Callback per attivare modalità modifica
- **`onSave`** (function, required): Callback per salvare modifiche
- **`onCancel`** (function, required): Callback per annullare modifiche
- **`onProfileChange`** (function, required): Callback per aggiornare campo profilo (field, value)
- **`isSaving`** (boolean, optional): Stato di salvataggio in corso
- **`onViewStats`** (function, optional): Callback per visualizzare statistiche
- **`onViewSettings`** (function, optional): Callback per visualizzare impostazioni
- **`onLogout`** (function, optional): Callback per logout

## 📦 Dipendenze

### UI Components

- `Card`, `CardContent`, `CardHeader`, `CardTitle` da `@/components/ui`
- `Button` da `@/components/ui`
- `Input` da `@/components/ui`
- `Avatar`, `useAvatarInitials` da `@/components/ui`
- `Badge` da `@/components/ui`
- `Progress` da `@/components/ui`
- `Edit`, `Briefcase`, `Mail`, `Phone`, `Target`, `Award`, `Users`, `Save`, `X`, `Shield`, `LogOut` da `lucide-react`

## ⚙️ Funzionalità

### Core

1. **Visualizzazione Profilo**: Mostra informazioni personali e professionali
2. **Modifica Profilo**: Modalità edit per modificare dati profilo
3. **Statistiche Rapide**: Card con KPI principali (clienti attivi, sessioni, esperienza)
4. **Performance**: Sezione con anni esperienza, revenue, soddisfazione clienti
5. **Badge**: Visualizzazione badge e riconoscimenti
6. **Azioni Rapide**: Pulsanti per statistiche, impostazioni, logout

### Funzionalità Avanzate

- **Modalità Edit**: Toggle tra visualizzazione e modifica
- **Avatar con Initials**: Avatar con fallback a iniziali
- **Progress Bar**: Barra progresso per soddisfazione clienti
- **Badge Stato**: Badge sbloccati/bloccati con stili diversi
- **Hover Effects**: Effetti hover sulle card statistiche
- **Gradient Text**: Testi con gradiente teal-cyan

### UI/UX

- Header con avatar grande e badge "Attivo da"
- Grid statistiche rapide (3 card)
- Sezione informazioni professionali editabile
- Sezione performance con progress bar
- Grid badge con stati visivi
- Azioni rapide opzionali
- Layout responsive

## 🎨 Struttura UI

```
Container (space-y-6)
  ├── Header Card (con avatar)
  │   ├── Avatar (XL con ring)
  │   ├── Nome Cognome (gradient text)
  │   ├── Badge "Personal Trainer"
  │   ├── Badge "Attivo da..."
  │   └── Button Edit (se !isEditing)
  ├── Grid Statistiche Rapide (3 card)
  │   ├── Card: Clienti Attivi
  │   ├── Card: Sessioni/mese
  │   └── Card: Anni Esperienza
  ├── Card Informazioni Professionali
  │   ├── Header con Button Edit/Save/Cancel
  │   └── Content
  │       ├── Se isEditing: Input fields
  │       └── Se !isEditing: Display fields
  ├── Card Performance Professionale
  │   ├── Grid: Anni Esperienza + Revenue
  │   └── Progress: Soddisfazione Clienti
  ├── Card Badge e Riconoscimenti
  │   └── Grid Badge (sbloccati/bloccati)
  └── Card Azioni Rapide (opzionale)
      └── Buttons: Statistiche, Impostazioni, Logout
```

## 💡 Esempi d'Uso

```tsx
<PTProfileTab
  profile={profileData}
  isEditing={isEditing}
  onEdit={() => setIsEditing(true)}
  onSave={handleSave}
  onCancel={() => setIsEditing(false)}
  onProfileChange={handleProfileChange}
  isSaving={isSaving}
  onViewStats={() => router.push('/dashboard/statistiche')}
  onViewSettings={() => setActiveTab('settings')}
  onLogout={handleLogout}
/>
```

## 📝 Note Tecniche

- Componente estratto da `profilo/page.tsx` per migliorare manutenibilità (FASE C - Split File Lunghi)
- Utilizza `useAvatarInitials` per generare iniziali avatar
- Modalità edit con toggle tra display e input
- Formattazione date per data iscrizione
- Formattazione currency per revenue mensile
- Badge con stati unlocked/bloccato e stili condizionali
- Hover effects con scale e opacity transitions
- Stili con tema teal-cyan consistente

## ✅ Stato Componente

- ✅ **Completato**: 100%
- ✅ **Testato**: Funzionalità base testata
- ✅ **Documentato**: Questo file
- 📅 **Ultimo aggiornamento**: 2025-02-16
