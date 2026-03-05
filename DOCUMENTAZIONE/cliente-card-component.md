# Componente: ClienteCard

## 📋 Descrizione

Componente card per visualizzare informazioni cliente in vista griglia. Mostra avatar, nome, stato, contatti, data iscrizione, allenamenti mensili, scheda attiva e azioni (profilo, chat). Memoizzato per performance.

## 📁 Percorso File

`src/components/dashboard/cliente-card.tsx`

## 🔧 Props

```typescript
interface ClienteCardProps {
  cliente: Cliente
}
```

### Dettaglio Props

- **`cliente`** (Cliente, required): Oggetto cliente con tutte le informazioni

## 📦 Dipendenze

### React

- `memo` da `react`

### Next.js

- `Link` da `next/link`

### UI Components

- `Button`, `Avatar`, `useAvatarInitials` da `@/components/ui`

### Icons

- `Mail`, `Phone`, `Calendar`, `User`, `MessageSquare`, `AlertCircle` da `lucide-react`

### Types

- `Cliente` da `@/types/cliente`

## ⚙️ Funzionalità

### Core

1. **Visualizzazione Cliente**: Card con tutte le informazioni cliente
2. **Avatar**: Avatar con fallback iniziali
3. **Stato Badge**: Badge colorato per stato cliente
4. **Azioni**: Bottoni per profilo e chat

### Informazioni Visualizzate

- **Header**: Avatar, nome completo, alert documenti scadenza (se presente), stato badge
- **Contatti**: Email e telefono (se disponibile)
- **Info**: Data iscrizione, allenamenti/mese, scheda attiva (se presente)
- **Azioni**: Bottone profilo (full width) e bottone chat (icon)

### Funzionalità Avanzate

- **Memoization**: Componente memoizzato con `memo` per performance
- **Hover Effects**: Scale, border enhancement, shadow, gradient overlay
- **Alert Documenti**: Icona e testo se `documenti_scadenza === true`
- **Gradient Overlay**: Overlay gradiente su hover
- **Ring Avatar**: Avatar con ring colorato

### UI/UX

- Card con border teal e background gradiente
- Avatar prominente con ring
- Badge stato colorato
- Layout organizzato in sezioni
- Bottoni azioni in fondo
- Hover effects smooth

## 🎨 Struttura UI

```
div (card container, group)
  └── div (gradient overlay, absolute)
  └── div (content, relative, flex flex-col)
      ├── Header
      │   ├── Avatar + Nome + Alert (se presente)
      │   └── Badge Stato
      ├── Contatti (border-b)
      │   ├── Email
      │   └── Telefono (se presente)
      ├── Info
      │   ├── Data Iscrizione
      │   ├── Allenamenti/mese
      │   └── Scheda Attiva (se presente)
      └── Azioni (mt-auto)
          ├── Button Profilo (flex-1)
          └── Button Chat (icon)
```

## 📝 Esempi d'Uso

### Esempio Base

```tsx
import { ClienteCard } from '@/components/dashboard/cliente-card'

function ClientsGrid() {
  const cliente = {
    id: '1',
    nome: 'Mario',
    cognome: 'Rossi',
    email: 'mario@example.com',
    // ... altri campi
  }

  return <ClienteCard cliente={cliente} />
}
```

## 🔍 Note Tecniche

### Memoization

```typescript
export const ClienteCard = memo<ClienteCardProps>(function ClienteCard({ cliente }) {
  // ...
})
```

### Avatar Initials

- Utilizza `useAvatarInitials(cliente.nome, cliente.cognome)`
- Fallback se avatar_url non disponibile

### Formattazione Date

```typescript
new Date(cliente.data_iscrizione).toLocaleDateString('it-IT', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
})
```

### Hover Effects

- Scale: `hover:scale-[1.02]`
- Border: `hover:border-teal-400/50`
- Shadow: `hover:shadow-lg hover:shadow-teal-500/20`
- Gradient overlay: opacity 0 → 100 su hover

### Limitazioni

- Solo 2 azioni (profilo e chat)
- Link hardcoded (`/dashboard/atleti/${id}`)
- Layout fisso (non configurabile)

## ✅ Stato Componente

- ✅ **Completato**: Componente funzionante e utilizzato in produzione
- ✅ **Testato**: Integrato nei test E2E
- ✅ **Documentato**: Documentazione completa
