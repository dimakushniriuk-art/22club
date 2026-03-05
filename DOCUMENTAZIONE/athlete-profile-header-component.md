# Componente: AthleteProfileHeader

## 📋 Descrizione

Componente header per profilo atleta. Mostra informazioni principali (nome, cognome, stato, email, telefono, data iscrizione, ultimo accesso), avatar con bordo sfumato, badge stato, e bottoni per navigazione (indietro, chat, modifica).

## 📁 Percorso File

`src/components/dashboard/athlete-profile/athlete-profile-header.tsx`

## 🔧 Props

```typescript
interface AthleteProfileHeaderProps {
  athlete: Cliente
  athleteId: string
  stats: {
    ultimo_accesso: string | null
  }
  avatarInitials: string
  onEditClick: () => void
  formatDate: (dateString: string | null) => string
}
```

### Dettaglio Props

- **`athlete`** (Cliente, required): Dati atleta completo
- **`athleteId`** (string, required): ID atleta
- **`stats`** (object, required): Statistiche atleta (ultimo accesso)
- **`avatarInitials`** (string, required): Iniziali per avatar fallback
- **`onEditClick`** (function, required): Callback click bottone modifica
- **`formatDate`** (function, required): Funzione formattazione date

## 📦 Dipendenze

### Next.js

- `Link` da `next/link`

### UI Components

- `Button`, `Badge` da `@/components/ui`
- `Avatar` da `@/components/ui/avatar`

### Icons

- `ArrowLeft`, `Mail`, `Phone`, `Calendar`, `Clock`, `MessageSquare`, `Edit`, `CheckCircle`, `AlertCircle` da `lucide-react`

### Types

- `Cliente` da `@/types/cliente`

## ⚙️ Funzionalità

### Core

1. **Header Navigazione**: Bottone indietro, titolo, descrizione
2. **Card Profilo**: Avatar, nome, cognome, badge stato
3. **Informazioni Contatto**: Email, telefono (se disponibile)
4. **Informazioni Iscrizione**: Data iscrizione, ultimo accesso (se disponibile)
5. **Azioni**: Bottoni chat e modifica

### Funzionalità Avanzate

- **Avatar con Bordo Sfumato**: Gradiente blur per effetto glow
- **Badge Stato Dinamico**: Colore e icona in base a stato (attivo/inattivo)
- **Layout Responsive**: Flex column mobile, row desktop
- **Grid Informazioni**: Grid responsive 1 colonna mobile, 2 tablet/desktop

### UI/UX

- Header con navigazione indietro
- Card profilo con bordo teal
- Avatar con ring e shadow
- Badge stato con icona
- Card informazioni con icone colorate
- Bottoni azioni con gradienti

## 🎨 Struttura UI

```
div (container)
  ├── Header (flex justify-between)
  │   ├── Link Indietro + Titolo + Descrizione
  │   └── Bottoni Chat + Modifica
  └── Card Profilo (border teal, rounded-lg)
      └── div (flex flex-col lg:flex-row)
          ├── Avatar (con bordo sfumato blur)
          └── div Informazioni
              ├── Nome + Badge Stato
              └── Grid Informazioni (2 colonne)
                  ├── Email
                  ├── Telefono (se disponibile)
                  ├── Data Iscrizione
                  └── Ultimo Accesso (se disponibile)
```

## 📝 Esempi d'Uso

### Esempio Base

```tsx
import { AthleteProfileHeader } from '@/components/dashboard/athlete-profile/athlete-profile-header'

function AthleteProfilePage({ athleteId }: { athleteId: string }) {
  const athlete = useAthlete(athleteId)
  const stats = useAthleteStats(athleteId)

  return (
    <AthleteProfileHeader
      athlete={athlete}
      athleteId={athleteId}
      stats={stats}
      avatarInitials={getInitials(athlete.nome, athlete.cognome)}
      onEditClick={() => setEditing(true)}
      formatDate={(date) => format(date, 'dd/MM/yyyy')}
    />
  )
}
```

## 🔍 Note Tecniche

### Avatar Bordo Sfumato

```tsx
<div className="absolute -inset-1 rounded-full bg-gradient-to-br from-teal-500/60 via-cyan-500/60 to-teal-500/60 blur-md opacity-75" />
<div className="relative">
  <Avatar ... />
</div>
```

### Badge Stato

```tsx
<Badge variant={athlete.stato === 'attivo' ? 'success' : 'warning'} size="sm">
  {athlete.stato === 'attivo' ? <CheckCircle /> : <AlertCircle />}
  {athlete.stato.charAt(0).toUpperCase() + athlete.stato.slice(1)}
</Badge>
```

### Limitazioni

- Formattazione date delegata a prop `formatDate`
- Avatar initials devono essere calcolati esternamente
- Stats solo ultimo accesso (non estendibile facilmente)

## ✅ Stato Componente

- ✅ **Completato**: Componente funzionante e utilizzato in produzione
- ✅ **Testato**: Integrato nei test E2E
- ✅ **Documentato**: Documentazione completa
