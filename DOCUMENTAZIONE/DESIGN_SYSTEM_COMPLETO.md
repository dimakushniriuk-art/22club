# 🎨 Design System Completo - 22Club

**Ultimo Aggiornamento**: 2025-02-02  
**Versione**: 1.0.0

---

## 📋 Indice

1. [Panoramica](#panoramica)
2. [Design Tokens](#design-tokens)
3. [Colori](#colori)
4. [Tipografia](#tipografia)
5. [Spaziatura](#spaziatura)
6. [Componenti](#componenti)
7. [Animazioni](#animazioni)
8. [Responsive Design](#responsive-design)
9. [Accessibilità](#accessibilità)
10. [Best Practices](#best-practices)

---

## Panoramica

Il design system di 22Club è basato su un tema dark moderno ispirato ad Apple, con palette colori coerente e componenti riusabili.

### Principi Fondamentali

1. **Coerenza**: Usa sempre i design tokens invece di valori hardcoded
2. **Accessibilità**: Contrasto minimo WCAG AA (4.5:1)
3. **Responsive**: Mobile-first approach
4. **Performance**: Animazioni fluide (60fps)
5. **Manutenibilità**: Design tokens centralizzati

### File Principali

- `src/config/design-system.ts` - Token base
- `src/config/master-design.config.ts` - Sistema completo con varianti
- `src/config/dkdesign.ts` - Classi utility
- `tailwind.config.ts` - Configurazione Tailwind
- `src/app/globals.css` - CSS variables globali

---

## Design Tokens

### Import Tokens

```typescript
// Token base
import { designSystem } from '@/config/design-system'

// Sistema completo
import { masterColors, masterButtons, masterCards } from '@/config/master-design.config'

// Utility classes
import { dk } from '@/config/dkdesign'
```

### Utilizzo

```typescript
// ✅ CORRETTO - Usa design tokens
<div className={masterColors.athlete.gradient.primary}>
  <Button className={masterButtons.athlete.primary}>
    Clicca qui
  </Button>
</div>

// ❌ SBAGLIATO - Valori hardcoded
<div className="bg-gradient-to-br from-teal-900 to-cyan-900">
  <button className="bg-teal-500 text-white px-4 py-2">
    Clicca qui
  </button>
</div>
```

---

## Colori

### Palette Base

**Background**:

- `DEFAULT`: `#0A0F12`
- `elevated`: `#10171C`
- `subtle`: `#151B20`
- `secondary`: `#1A2024`
- `tertiary`: `#242A2E`

**Testo**:

- `primary`: `#EAF0F2`
- `secondary`: `#A5AFB4`
- `muted`: `#6C757D`

**Brand**:

- `DEFAULT`: `#02B3BF`
- `hover`: `#03C9D5`
- `active`: `#019AA6`

**Stati**:

- `success`: `#00C781`
- `warning`: `#FFC107`
- `error`: `#FF3B30`

### Varianti per Account

**Atleta** (Teal/Cyan):

```typescript
masterColors.athlete.gradient.primary // from-teal-900 to-cyan-900
masterColors.athlete.button.primary // bg-teal-500
```

**Trainer** (Blue/Indigo):

```typescript
masterColors.trainer.gradient.primary // from-blue-900 to-indigo-900
```

**Admin** (Gray/Purple):

```typescript
masterColors.admin.gradient.primary // from-gray-800 to-purple-900
```

---

## Tipografia

### Font Family

```css
font-family: 'Inter', 'SF Pro Display', system-ui, sans-serif;
```

### Scale Tipografica

```typescript
import { masterTypography } from '@/config/master-design.config'

// Headings
masterTypography.h1 // text-3xl tablet-landscape:text-4xl
masterTypography.h2 // text-2xl tablet-landscape:text-3xl
masterTypography.h3 // text-xl tablet-landscape:text-2xl

// Body
masterTypography.body // text-base tablet-landscape:text-lg
masterTypography.bodySecondary // text-gray-400
```

---

## Spaziatura

### Scale Spaziatura

```typescript
import { designSystem } from '@/config/design-system'

const spacing = designSystem.spacing
// xs: 4px, sm: 8px, md: 12px, lg: 16px, xl: 24px, 2xl: 32px
```

### Utilizzo

```typescript
// ✅ CORRETTO
<div className="space-y-4"> {/* lg = 16px */}
  <Card />
  <Card />
</div>

// ❌ SBAGLIATO
<div className="space-y-[16px]">
  <Card />
  <Card />
</div>
```

---

## Componenti

### Button

```typescript
import { Button } from '@/components/ui/button'
import { masterButtons } from '@/config/master-design.config'

// Varianti
<Button variant="primary">Primario</Button>
<Button variant="secondary">Secondario</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="outline">Outline</Button>

// Account-specific
<Button className={masterButtons.athlete.primary}>
  Bottone Atleta
</Button>
```

### Card

```typescript
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { masterCards } from '@/config/master-design.config'

// Varianti
<Card variant="athlete">Card atleta</Card>
<Card variant="trainer">Card trainer</Card>
<Card variant="admin">Card admin</Card>
<Card hoverable>Card interattiva</Card>
```

---

## Animazioni

### Transizioni

```typescript
import { masterAnimations } from '@/config/master-design.config'

// Base
masterAnimations.transition // transition-all duration-200

// Slow
masterAnimations.transitionSlow // duration-300
```

### Hover Effects

```typescript
// Scale
masterAnimations.hover.scale // hover:scale-[1.02]

// Lift
masterAnimations.hover.lift // hover:-translate-y-1

// Glow
masterAnimations.hover.glow // hover:shadow-[0_0_10px_rgba(2,179,191,0.3)]
```

---

## Responsive Design

### Breakpoints

- **Mobile**: 640px+
- **Tablet**: 768px+
- **Tablet Landscape**: 1024px+ (ottimizzato)
- **Desktop**: 1280px+
- **Wide**: 1536px+

### Utilizzo

```typescript
import { masterBreakpoints } from '@/config/master-design.config'

// Hide on mobile
masterBreakpoints.hideOnMobile // hidden sm:block

// Responsive grid
masterBreakpoints.responsiveGrid // grid-cols-1 sm:grid-cols-2 tablet-landscape:grid-cols-3
```

---

## Accessibilità

### Contrasto Colori

Tutti i colori rispettano WCAG AA (4.5:1):

- Testo primario: ✅ 12.5:1
- Testo secondario: ✅ 6.2:1
- Brand color: ✅ 4.8:1

### Focus States

```typescript
masterAnimations.focus.ring // focus:ring-2 focus:ring-cyan-500
```

### Screen Readers

```typescript
// Aggiungi sempre aria-label per icone
<button aria-label="Chiudi">
  <XIcon />
</button>
```

---

## Best Practices

### ✅ DO

1. Usa sempre i design tokens
2. Usa componenti riutilizzabili
3. Mantieni coerenza con il design system
4. Testa su tutti i breakpoint

### ❌ DON'T

1. Non usare valori hardcoded
2. Non creare varianti custom senza motivo
3. Non ignorare l'accessibilità
4. Non usare animazioni pesanti

---

**Per documentazione completa**: Vedi [DESIGN_GUIDELINES.md](./DESIGN_GUIDELINES.md)

**Ultimo aggiornamento**: 2025-02-02
