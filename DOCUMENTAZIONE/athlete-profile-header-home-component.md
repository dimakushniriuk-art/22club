# Componente: AthleteProfileHeaderHome

## 📋 Descrizione

Componente header per il profilo atleta nella home. Mostra avatar, nome completo, ruolo e badge con data iscrizione.

## 📁 Percorso File

`src/components/home-profile/athlete-profile-header-home.tsx`

## 🔧 Props

```typescript
interface AthleteProfileHeaderHomeProps {
  user: {
    nome: string | null
    cognome: string | null
    email: string
    phone: string | null
    avatar_url: string | null
    avatar: string | null
    data_iscrizione: string | null
    created_at: string | null
  }
  avatarInitials: string
}
```

### Dettaglio Props

- **`user`** (object, required): Informazioni utente complete
- **`avatarInitials`** (string, required): Iniziali per fallback avatar

## 📦 Dipendenze

### UI Components

- `Card`, `CardContent` da `@/components/ui`
- `Badge` da `@/components/ui`
- `Avatar` da `@/components/ui/avatar`
- `User` da `lucide-react`

### Utils

- `formatSafeDate` da `./utils`

## ⚙️ Funzionalità

### Core

1. **Avatar**: Mostra avatar utente con fallback a iniziali
2. **Nome Completo**: Mostra nome e cognome
3. **Ruolo**: Mostra "Atleta" con icona
4. **Badge Iscrizione**: Mostra data iscrizione in badge

### UI/UX

- Card con bordo teal
- Layout flex con avatar e info
- Avatar con bordo ring teal
- Badge con variante primary

## 🎨 Struttura UI

```
Card
  └── CardContent
      └── div (flex justify-between)
          └── div (flex items-center gap-4)
              ├── Avatar
              │   ├── Immagine (se presente)
              │   └── Fallback iniziali
              └── div
                  ├── h1 (Nome Cognome)
                  ├── p "Atleta" (icona User)
                  └── Badge "Membro da [data]"
```

## 📝 Esempi d'Uso

### Esempio Base

```tsx
import { AthleteProfileHeaderHome } from '@/components/home-profile/athlete-profile-header-home'

function ProfilePage() {
  const avatarInitials = `${user.nome?.[0] || ''}${user.cognome?.[0] || ''}`.toUpperCase()

  return <AthleteProfileHeaderHome user={user} avatarInitials={avatarInitials} />
}
```

## 🔍 Note Tecniche

### Avatar

- Usa `Avatar` component con size "xl"
- Priorità: `avatar_url` > `avatar`
- Fallback a `avatarInitials` se nessuna immagine
- Bordo ring teal per coerenza design

### Formattazione Data

- Usa `formatSafeDate` per formattare data iscrizione
- Fallback a `created_at` se `data_iscrizione` non presente

### Limitazioni

- Non permette modifiche (solo visualizzazione)
- Avatar iniziali devono essere forniti come prop
- Badge sempre presente (non condizionale)

## ✅ Stato Componente

- ✅ **Completato**: Componente funzionante e utilizzato in produzione
- ✅ **Testato**: Integrato nei test E2E
- ✅ **Documentato**: Documentazione completa
