# Componente: Avatar (UI Base)

## 📋 Descrizione

Componente avatar per visualizzare immagini profilo utente con fallback a iniziali. Supporta loading states, error handling e dimensioni multiple. Include hook helper per generare iniziali da nome e cognome.

## 📁 Percorso File

`src/components/ui/avatar.tsx`

## 🔧 Props

```typescript
interface AvatarProps {
  src?: string | null
  alt?: string
  fallbackText?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}
```

### Dettaglio Props

- **`src`** (string | null, optional): URL immagine avatar
- **`alt`** (string, optional): Testo alternativo immagine (default: 'Avatar')
- **`fallbackText`** (string, optional): Testo fallback se immagine non disponibile (default: '?')
- **`size`** ('sm' | 'md' | 'lg' | 'xl', optional): Dimensione avatar (default: 'md')
- **`className`** (string, optional): Classi CSS aggiuntive

## 📦 Dipendenze

### React

- `useState` da `react`
- `Image` da `next/image`

### Utilities

- `cn` da `@/lib/utils`

## ⚙️ Funzionalità

### Core

1. **Immagine Avatar**: Visualizza immagine profilo con Next.js Image
2. **Fallback Iniziali**: Mostra iniziali se immagine non disponibile o errore
3. **Loading State**: Animazione pulse durante caricamento immagine
4. **Error Handling**: Gestione errori caricamento immagine
5. **Dimensioni Multiple**: 4 dimensioni predefinite (sm, md, lg, xl)

### Funzionalità Avanzate

- **Hook Helper**: `useAvatarInitials` per generare iniziali da nome/cognome
- **Gradient Fallback**: Fallback con gradient teal-cyan
- **Image Optimization**: Utilizzo Next.js Image per ottimizzazione
- **Responsive Sizes**: Sizes attribute per responsive images

### UI/UX

- Avatar circolare con overflow hidden
- Fallback con iniziale in maiuscolo
- Loading state con pulse animation
- Gradient fallback colorato
- Dimensioni responsive

## 🎨 Struttura UI

```
Container (rounded-full overflow-hidden)
  ├── Se !src || imageError
  │   └── Fallback Div (gradient teal-cyan)
  │       └── Iniziale (primo carattere fallbackText.toUpperCase())
  └── Se src && !imageError
      ├── Loading Overlay (se imageLoading)
      │   └── Pulse Animation
      └── Image (Next.js Image, fill, object-cover)
```

## 💡 Esempi d'Uso

```tsx
// Avatar base
<Avatar src={user.avatar_url} alt={user.name} />

// Avatar con fallback personalizzato
<Avatar
  src={user.avatar_url}
  fallbackText={useAvatarInitials(user.nome, user.cognome)}
  size="lg"
/>

// Hook helper
const initials = useAvatarInitials('Mario', 'Rossi') // 'MR'
```

## 📝 Note Tecniche

- Utilizza `useState` per gestire errori e loading
- Next.js Image con `fill` e `object-cover` per aspect ratio
- Fallback automatico se `src` null o errore caricamento
- Iniziale generata da primo carattere `fallbackText.toUpperCase()`
- Hook `useAvatarInitials` genera iniziali da nome e cognome
- Dimensioni: sm (8x8), md (12x12), lg (16x16), xl (20x20)
- Gradient fallback: `from-teal-500 to-cyan-500`
- Stili con tema teal-cyan consistente

## ✅ Stato Componente

- ✅ **Completato**: 100%
- ✅ **Testato**: Funzionalità base testata
- ✅ **Documentato**: Questo file
- 📅 **Ultimo aggiornamento**: 2025-02-16
