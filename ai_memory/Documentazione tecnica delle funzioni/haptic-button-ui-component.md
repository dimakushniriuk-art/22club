# Componente: HapticButton (UI Base)

## 📋 Descrizione

Componente bottone con feedback haptic. Supporta 5 varianti, 3 dimensioni, loading state, icone, 4 tipi haptic (light, medium, heavy, success, error, warning) e animazioni Framer Motion. Include sub-componenti ActionButton e ConfirmButton. Utilizzato per bottoni con feedback tattile su dispositivi mobili.

## 📁 Percorso File

`src/components/shared/ui/haptic-button.tsx`

## 🔧 Props

### HapticButton Props

```typescript
interface HapticButtonProps extends Omit<HTMLMotionProps<'button'>, 'children'> {
  children: React.ReactNode
  hapticType?: HapticType
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  icon?: React.ReactNode
  iconPosition?: 'left' | 'right'
}
```

### ActionButton Props

```typescript
{
  children: React.ReactNode
  action: 'success' | 'error' | 'warning' | 'info'
  onClick?: () => void
  className?: string
}
```

### ConfirmButton Props

```typescript
{
  children: React.ReactNode
  onConfirm: () => void
  confirmText?: string
  className?: string
}
```

## 📦 Dipendenze

### React

- `React` da `react`
- `motion`, `HTMLMotionProps` da `framer-motion`

### Libraries

- `triggerHaptic`, `HapticType` da `@/lib/haptics`

## ⚙️ Funzionalità

### Core

1. **5 Varianti**: primary, secondary, outline, ghost, danger
2. **3 Dimensioni**: sm, md, lg
3. **Haptic Feedback**: Feedback haptic su click
4. **Loading State**: Spinner durante loading
5. **Icon Support**: Icone left/right
6. **Framer Motion**: Animazioni scale on hover/tap

### Funzionalità Avanzate

- **Haptic Types**: light, medium, heavy, success, error, warning
- **Motion Animations**: whileHover scale 1.02, whileTap scale 0.98
- **ActionButton**: Variante con haptic mappato per azione
- **ConfirmButton**: Bottone con conferma doppia (click → confirm)
- **Loading Spinner**: Spinner animato con Framer Motion

### UI/UX

- Bottone con animazioni smooth
- Haptic feedback su click
- Loading spinner
- Icone posizionabili
- Hover/tap effects
- Layout responsive

## 🎨 Struttura UI

```
HapticButton (motion.button)
  ├── Loading Spinner (se loading)
  ├── Icon Left (se icon && iconPosition === 'left' && !loading)
  ├── Children (se !loading)
  └── Icon Right (se icon && iconPosition === 'right' && !loading)
```

## 💡 Esempi d'Uso

```tsx
// HapticButton base
<HapticButton
  hapticType="medium"
  variant="primary"
  onClick={handleClick}
>
  Clicca
</HapticButton>

// HapticButton con loading
<HapticButton
  loading
  hapticType="light"
>
  Caricamento...
</HapticButton>

// ActionButton
<ActionButton
  action="success"
  onClick={handleSuccess}
>
  Salva
</ActionButton>

// ConfirmButton
<ConfirmButton
  onConfirm={handleDelete}
  confirmText="Conferma eliminazione"
>
  Elimina
</ConfirmButton>
```

## 📝 Note Tecniche

- Integrazione con Framer Motion per animazioni
- Haptic feedback tramite triggerHaptic da @/lib/haptics
- 5 varianti con stili predefiniti
- 3 dimensioni: sm (px-3 py-1.5), md (px-4 py-2), lg (px-6 py-3)
- Haptic types: light, medium, heavy, success, error, warning
- Motion animations: whileHover scale 1.02, whileTap scale 0.98
- Loading spinner con Framer Motion animate rotate
- Icone posizionabili left/right
- ActionButton: mappa azione → haptic type e variant
- ConfirmButton: doppio click (primo click mostra confirm, secondo esegue)
- Disabled state con opacity-50 e cursor-not-allowed
- Focus ring cyan-500/50 per accessibilità
- Stili con tema consistente

## ✅ Stato Componente

- ✅ **Completato**: 100%
- ✅ **Testato**: Funzionalità base testata
- ✅ **Documentato**: Questo file
- 📅 **Ultimo aggiornamento**: 2025-02-16
