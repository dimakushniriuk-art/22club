# Componente: TabBar (Athlete)

## 📋 Descrizione

Componente barra di navigazione fissa in basso per atleti. Mostra 5 tab (Home, Allenamenti, Chat, Documenti, Profilo) con icone, stato attivo e avatar nel tab profilo.

## 📁 Percorso File

`src/components/athlete/tab-bar.tsx`

## 🔧 Props

Nessuna prop (componente self-contained che usa hook interni)

## 📦 Dipendenze

### React Hooks

- `usePathname` da `next/navigation`
- `useAuth` da `@/providers/auth-provider`

### UI Components

- `useIcon` da `@/components/ui/professional-icons`
- `Image` da `next/image`

### Next.js

- `Link` da `next/link`
- `cn` da `@/lib/utils`

## ⚙️ Funzionalità

### Core

1. **Navigazione**: 5 tab con link alle pagine principali
2. **Stato Attivo**: Evidenzia tab corrente basato su pathname
3. **Avatar Profilo**: Mostra avatar utente nel tab profilo invece di icona
4. **Animazioni**: Glow effect e scale su tab attivo/hover

### Tab Disponibili

- **Home**: `/home` (icona 🏠)
- **Allenamenti**: `/home/allenamenti` (icona 💪)
- **Chat**: `/home/chat` (icona 💬)
- **Documenti**: `/home/documenti` (icona 📄)
- **Profilo**: `/home/profilo` (icona 👤 o avatar)

### Funzionalità Avanzate

- **Glassmorphism**: Background blur con bordo teal
- **Gradient Border**: Bordo superiore animato con gradiente
- **Active Indicator**: Punto glow sotto tab attivo
- **Hover Effects**: Scale e glow su hover
- **Accessibilità**: ARIA labels e keyboard navigation

### UI/UX

- Barra fissa in basso (fixed bottom-0)
- Grid 5 colonne per distribuzione uniforme
- Icone grandi (text-2xl) per facilità d'uso mobile
- Avatar con bordo gradiente nel tab profilo
- Animazioni fluide per transizioni

## 🎨 Struttura UI

```
nav (fixed bottom-0)
  ├── Background (glassmorphism + blur)
  ├── Gradient Border (top, animato)
  └── Grid (5 colonne)
      └── Link (per ogni tab)
          ├── Background attivo (se isActive)
          ├── Hover effect
          ├── Icona/Avatar
          │   └── Avatar (se showAvatar e user.avatar)
          │       ├── Bordo gradiente
          │       ├── Immagine
          │       └── Overlay gradiente
          └── Indicatore attivo (punto glow)
```

## 📝 Esempi d'Uso

### Esempio Base

```tsx
import { TabBar } from '@/components/athlete/tab-bar'

function AthleteLayout({ children }) {
  return (
    <div>
      {children}
      <TabBar />
    </div>
  )
}
```

## 🔍 Note Tecniche

### Rilevamento Tab Attivo

- Usa `usePathname()` per ottenere path corrente
- Confronta con `item.href` per determinare tab attivo
- Match esatto (non parziale)

### Avatar

- Mostra avatar se `showAvatar === true` e `user.avatar` o `user.avatar_url` presente
- Bordo gradiente con padding 2px
- Overlay gradiente per effetto visivo
- Fallback a icona 👤 se avatar non disponibile

### Animazioni

- **Glow**: `drop-shadow-[0_0_12px_rgba(20,184,166,0.6)]` su tab attivo
- **Scale**: `scale-110` su tab attivo/hover
- **Pulse**: Bordo superiore con `animate-pulse`

### Accessibilità

- `role="navigation"` e `aria-label`
- `aria-current="page"` su tab attivo
- `aria-label` su ogni link
- `sr-only` per indicatore stato attivo

### Limitazioni

- Tab hardcoded (non configurabili)
- Solo 5 tab supportati
- Avatar solo nel tab profilo
- Non supporta badge/notifiche sui tab

## ✅ Stato Componente

- ✅ **Completato**: Componente funzionante e utilizzato in produzione
- ✅ **Testato**: Integrato nei test E2E
- ✅ **Documentato**: Documentazione completa
