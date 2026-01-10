# Componente: AthleteOverviewTab

## 📋 Descrizione

Componente tab per la sezione overview del profilo atleta. Mostra informazioni personali, obiettivo peso con progresso e lezioni rimanenti.

## 📁 Percorso File

`src/components/home-profile/athlete-overview-tab.tsx`

## 🔧 Props

```typescript
interface AthleteOverviewTabProps {
  user: {
    email: string
    phone: string | null
    data_iscrizione: string | null
    created_at: string | null
  }
  stats: {
    peso_iniziale: number | null
    peso_attuale: number | null
    obiettivo_peso: number | null
    lezioni_rimanenti: number
  }
  calculateProgress: () => number
}
```

### Dettaglio Props

- **`user`** (object, required): Informazioni utente (email, telefono, data iscrizione)
- **`stats`** (object, required): Statistiche atleta (pesi, lezioni)
- **`calculateProgress`** (function, required): Funzione per calcolare progresso verso obiettivo

## 📦 Dipendenze

### UI Components

- `Card`, `CardContent`, `CardHeader`, `CardTitle` da `@/components/ui`
- `Progress` da `@/components/ui`
- `Mail`, `Phone`, `Calendar`, `User`, `Target`, `TrendingUp`, `CreditCard` da `lucide-react`

### Utils

- `formatSafeDate` da `./utils`

## ⚙️ Funzionalità

### Core

1. **Informazioni Personali**: Mostra email, telefono (se presente), data iscrizione
2. **Obiettivo Peso**: Mostra peso iniziale, attuale, obiettivo con progress bar
3. **Lezioni Rimanenti**: Mostra numero lezioni rimanenti (se > 0)

### Calcolo Progresso

- Funzione `calculateProgress()` fornita come prop
- Calcola percentuale progresso verso obiettivo peso
- Mostra differenza in kg e kg rimanenti all'obiettivo

### UI/UX

- Grid responsive (1 colonna mobile, 2 desktop)
- Card separate per ogni sezione
- Progress bar visuale per obiettivo
- Icone per ogni informazione

## 🎨 Struttura UI

```
div (space-y-4)
  └── Grid (1 colonna mobile, 2 desktop)
      ├── Card "Informazioni Personali"
      │   ├── Email (icona Mail)
      │   ├── Telefono (icona Phone, se presente)
      │   └── Data iscrizione (icona Calendar)
      ├── Card "Obiettivo Peso" (se peso_iniziale e obiettivo_peso)
      │   ├── Grid 3 colonne (Partenza, Attuale, Obiettivo)
      │   ├── Progress bar
      │   └── Info progresso (kg persi/guadagnati, kg rimanenti)
      └── Card "Lezioni" (se lezioni_rimanenti > 0)
          └── Numero lezioni rimanenti
```

## 📝 Esempi d'Uso

### Esempio Base

```tsx
import { AthleteOverviewTab } from '@/components/home-profile/athlete-overview-tab'

function ProfilePage() {
  const calculateProgress = () => {
    if (!stats.peso_iniziale || !stats.obiettivo_peso || !stats.peso_attuale) return 0
    const total = Math.abs(stats.peso_iniziale - stats.obiettivo_peso)
    const current = Math.abs(stats.peso_iniziale - stats.peso_attuale)
    return (current / total) * 100
  }

  return <AthleteOverviewTab user={user} stats={stats} calculateProgress={calculateProgress} />
}
```

## 🔍 Note Tecniche

### Formattazione Date

- Usa `formatSafeDate` per formattare date in modo sicuro
- Gestisce `data_iscrizione` o `created_at` come fallback

### Calcolo Progresso

- Calcolo fornito come prop (non gestito internamente)
- Tipicamente: `(current / total) * 100`
- Mostra anche differenza assoluta in kg

### Visibilità Condizionale

- **Telefono**: Mostrato solo se presente
- **Obiettivo Peso**: Mostrato solo se `peso_iniziale` e `obiettivo_peso` presenti
- **Lezioni**: Mostrato solo se `lezioni_rimanenti > 0`

### Limitazioni

- Non permette modifiche (solo visualizzazione)
- Calcolo progresso deve essere fornito dal parent
- Non gestisce obiettivi multipli

## ✅ Stato Componente

- ✅ **Completato**: Componente funzionante e utilizzato in produzione
- ✅ **Testato**: Integrato nei test E2E
- ✅ **Documentato**: Documentazione completa
