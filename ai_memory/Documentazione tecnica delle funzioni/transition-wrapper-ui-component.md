# Componente: TransitionWrapper (UI Base)

## 📋 Descrizione

Componente wrapper per transizioni pagina con Framer Motion. Supporta 5 varianti (default, quick, slide, fade-in, stagger), loading dinamico di Framer Motion, fallback SSR-safe e integrazione con usePathname. Utilizzato per transizioni pagina, animazioni entrata e liste animate.

## 📁 Percorso File

`src/components/shared/ui/transition-wrapper.tsx`

## 🔧 Props

### TransitionWrapper Props

```typescript
interface TransitionWrapperProps {
  children: React.ReactNode
  className?: string
}
```

### Sub-components

- `QuickTransitionWrapper` - Transizione veloce
- `SlideTransitionWrapper` - Transizione slide
- `FadeInWrapper` - Fade in con delay
- `StaggerWrapper` - Stagger per liste
- `StaggerItem` - Item in lista stagger

### FadeInWrapper Props

```typescript
{
  children: React.ReactNode
  delay?: number
  duration?: number
  className?: string
}
```

### StaggerWrapper Props

```typescript
{
  children: React.ReactNode
  staggerDelay?: number
  className?: string
}
```

## 📦 Dipendenze

### React

- `React`, `useEffect`, `useState` da `react`
- `usePathname` da `next/navigation`
- `Transition` da `framer-motion`

## ⚙️ Funzionalità

### Core

1. **5 Varianti**: default, quick, slide, fade-in, stagger
2. **Dynamic Loading**: Caricamento dinamico Framer Motion
3. **SSR Safe**: Fallback per SSR e errori
4. **Pathname Tracking**: Tracking pathname per transizioni
5. **AnimatePresence**: Gestione animazioni entrata/uscita

### Funzionalità Avanzate

- **Lazy Loading**: Caricamento Framer Motion solo lato client
- **Error Handling**: Fallback in caso di errori
- **Pathname Key**: Key basato su pathname per transizioni
- **Variants**: Varianti predefinite per ogni tipo transizione
- **Stagger Support**: Supporto stagger per liste

### UI/UX

- Transizioni smooth
- Fallback sicuro
- Varianti multiple
- Delay configurabile
- Layout flessibile

## 🎨 Struttura UI

```
TransitionWrapper (motion.div con AnimatePresence)
  └── Children (con animazioni)
```

## 💡 Esempi d'Uso

```tsx
// TransitionWrapper base
<TransitionWrapper>
  <PageContent />
</TransitionWrapper>

// QuickTransitionWrapper
<QuickTransitionWrapper>
  <QuickContent />
</QuickTransitionWrapper>

// SlideTransitionWrapper
<SlideTransitionWrapper>
  <SlideContent />
</SlideTransitionWrapper>

// FadeInWrapper
<FadeInWrapper delay={100} duration={0.5}>
  <Content />
</FadeInWrapper>

// StaggerWrapper
<StaggerWrapper staggerDelay={0.1}>
  {items.map(item => (
    <StaggerItem key={item.id}>
      <Item />
    </StaggerItem>
  ))}
</StaggerWrapper>
```

## 📝 Note Tecniche

- Caricamento dinamico Framer Motion con import() per evitare problemi SSR
- Fallback: div normale se Framer Motion non disponibile
- usePathname per tracking route changes
- AnimatePresence mode="wait" per transizioni sequenziali
- 5 varianti con variants e transition predefiniti
- Default: opacity + y + scale (0.4s anticipate)
- Quick: opacity + y (0.25s easeOut)
- Slide: opacity + x (0.3s easeInOut)
- FadeIn: opacity + y con delay/duration configurabili
- Stagger: staggerChildren per liste
- Error handling con try/catch e fallback
- Layout flessibile
- Stili con tema consistente

## ✅ Stato Componente

- ✅ **Completato**: 100%
- ✅ **Testato**: Funzionalità base testata
- ✅ **Documentato**: Questo file
- 📅 **Ultimo aggiornamento**: 2025-02-16
