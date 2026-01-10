# Componente: Animations (UI Base)

## 📋 Descrizione

Componente libreria animazioni per effetti visivi. Include FadeIn, SlideUp, ScaleOnHover, StaggerContainer, PulseIndicator, BounceIn con delay personalizzabile e configurazione. Utilizzato per animazioni di entrata, hover effects, liste animate e indicatori.

## 📁 Percorso File

`src/components/ui/animations.tsx`

## 🔧 Props

### AnimationProps

```typescript
interface AnimationProps {
  children: ReactNode
  className?: string
  delay?: number
}
```

### Components

- `FadeIn` - Fade in animation
- `SlideUp` - Slide up animation
- `ScaleOnHover` - Scale on hover
- `StaggerContainer` - Stagger animation per liste
- `PulseIndicator` - Pulse indicator
- `BounceIn` - Bounce in animation

## 📦 Dipendenze

### React

- `ReactNode` da `react`

### Utilities

- `cn` da `@/lib/utils`

## ⚙️ Funzionalità

### Core

1. **FadeIn**: Fade in animation con delay
2. **SlideUp**: Slide up from bottom animation
3. **ScaleOnHover**: Scale on hover per bottoni
4. **StaggerContainer**: Stagger animation per liste
5. **PulseIndicator**: Pulse indicator per notifiche
6. **BounceIn**: Bounce in animation per success

### Funzionalità Avanzate

- **Delay Support**: Delay personalizzabile per ogni animazione
- **Stagger Children**: Stagger automatico per children array
- **Animation Fill Mode**: animationFillMode: 'both'
- **Tailwind Animations**: Utilizzo classi Tailwind animate-in
- **Configurable Duration**: Durata configurabile

### UI/UX

- Animazioni smooth
- Delay configurabile
- Stagger per liste
- Hover effects
- Layout flessibile

## 🎨 Struttura UI

```
Animation Component
  └── Wrapper Div (con classi animazione)
      └── Children
```

## 💡 Esempi d'Uso

```tsx
// FadeIn
<FadeIn delay={100}>
  <Card>Content</Card>
</FadeIn>

// SlideUp
<SlideUp delay={200}>
  <Button>Click</Button>
</SlideUp>

// ScaleOnHover
<ScaleOnHover>
  <Button>Hover me</Button>
</ScaleOnHover>

// StaggerContainer
<StaggerContainer>
  {items.map(item => <Item key={item.id} />)}
</StaggerContainer>

// PulseIndicator
<PulseIndicator />

// BounceIn
<BounceIn>
  <SuccessMessage />
</BounceIn>
```

## 📝 Note Tecniche

- Utilizzo classi Tailwind animate-in
- FadeIn: fade-in duration-500 ease-out
- SlideUp: slide-in-from-bottom-4 duration-500 ease-out
- ScaleOnHover: scale-105 hover, scale-95 active
- StaggerContainer: stagger automatico con delay incrementale
- PulseIndicator: animate-ping per pulse effect
- BounceIn: zoom-in-50 duration-300 ease-out
- Delay support con style animationDelay
- Animation fill mode: 'both' per mantenere stato finale
- Layout flessibile
- Stili con tema consistente

## ✅ Stato Componente

- ✅ **Completato**: 100%
- ✅ **Testato**: Funzionalità base testata
- ✅ **Documentato**: Questo file
- 📅 **Ultimo aggiornamento**: 2025-02-16
