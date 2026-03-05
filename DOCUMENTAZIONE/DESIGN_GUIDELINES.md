# 🎨 Design Guidelines - 22Club

## Indice

1. [Panoramica](#panoramica)
2. [Design System](#design-system)
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

---

## Design System

### File Principali

- `src/config/design-system.ts` - Token base (colori, spacing, radius)
- `src/config/master-design.config.ts` - Sistema completo con varianti per account
- `src/config/dkdesign.ts` - Classi utility riutilizzabili
- `tailwind.config.ts` - Configurazione Tailwind con design tokens
- `src/app/globals.css` - Stili globali e CSS variables

### Utilizzo

```typescript
// ✅ CORRETTO - Usa design tokens
import { designSystem } from '@/config/design-system'
import { masterColors, masterButtons } from '@/config/master-design.config'
import { dk } from '@/config/dkdesign'

// Usa i token nei componenti
<div className={masterColors.athlete.gradient.primary}>
  <Button className={masterButtons.athlete.primary}>
    Clicca qui
  </Button>
</div>
```

```typescript
// ❌ SBAGLIATO - Valori hardcoded
<div className="bg-gradient-to-br from-teal-900 to-cyan-900">
  <button className="bg-teal-500 text-white px-4 py-2">
    Clicca qui
  </button>
</div>
```

---

## Colori

### Palette Principale

#### Background

- **DEFAULT**: `#0A0F12` - Sfondo principale
- **Elevated**: `#10171C` - Card elevate
- **Subtle**: `#151B20` - Sfondo sottile
- **Secondary**: `#1A2024` - Card standard
- **Tertiary**: `#242A2E` - Hover states

#### Testo

- **Primary**: `#EAF0F2` - Testo principale
- **Secondary**: `#A5AFB4` - Testo secondario
- **Muted**: `#6C757D` - Testo disabilitato

#### Brand (Primary)

- **DEFAULT**: `#02B3BF` - Colore principale
- **Hover**: `#03C9D5` - Stato hover
- **Active**: `#019AA6` - Stato attivo

#### Stati

- **Success**: `#00C781` - Successo
- **Warning**: `#FFC107` - Avviso
- **Error**: `#FF3B30` - Errore

### Varianti per Account

#### Atleta (Teal/Cyan)

```typescript
import { masterColors } from '@/config/master-design.config'

// Gradiente atleta
<div className={masterColors.athlete.gradient.primary}>
  {/* from-teal-900 to-cyan-900 */}
</div>

// Bottone atleta
<button className={masterColors.athlete.button.primary}>
  {/* bg-teal-500 hover:bg-teal-600 */}
</button>
```

#### Trainer (Blue/Indigo)

```typescript
// Gradiente trainer
<div className={masterColors.trainer.gradient.primary}>
  {/* from-blue-900 to-indigo-900 */}
</div>
```

#### Admin (Gray/Purple)

```typescript
// Gradiente admin
<div className={masterColors.admin.gradient.primary}>
  {/* from-gray-800 to-purple-900 */}
</div>
```

### Utilizzo nei Componenti

```typescript
// ✅ CORRETTO
import { masterColors } from '@/config/master-design.config'

const MyCard = () => (
  <div className={masterColors.athlete.gradient.primary}>
    <h2 className={masterColors.athlete.text.primary}>
      Titolo
    </h2>
  </div>
)
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
<h1 className={masterTypography.h1}>Titolo H1</h1>
<h2 className={masterTypography.h2}>Titolo H2</h2>
<h3 className={masterTypography.h3}>Titolo H3</h3>

// Body
<p className={masterTypography.body}>Testo normale</p>
<p className={masterTypography.bodySecondary}>Testo secondario</p>
```

### Responsive Typography

```typescript
// Testo responsive
<h1 className={masterTypography.responsive.h1}>
  Titolo che si adatta
</h1>
```

---

## Spaziatura

### Scale Spaziatura

```typescript
import { designSystem } from '@/config/design-system'

// Spacing tokens
const spacing = designSystem.spacing
// xs: 4px, sm: 8px, md: 12px, lg: 16px, xl: 24px, 2xl: 32px
```

### Utilizzo

```typescript
// ✅ CORRETTO - Usa spacing tokens
<div className="space-y-4"> {/* lg = 16px */}
  <Card />
  <Card />
</div>

// ❌ SBAGLIATO - Valori hardcoded
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

// Size
<Button size="sm">Piccolo</Button>
<Button size="md">Medio</Button>
<Button size="lg">Grande</Button>

// Loading
<Button loading>Clicca</Button>

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
<Card variant="default">Card standard</Card>
<Card variant="elevated">Card elevata</Card>
<Card variant="athlete">Card atleta</Card>
<Card variant="trainer">Card trainer</Card>
<Card variant="admin">Card admin</Card>

// Hoverable
<Card hoverable>Card interattiva</Card>

// Account-specific
<Card className={masterCards.athlete.base}>
  <CardHeader>
    <CardTitle>Titolo</CardTitle>
  </CardHeader>
  <CardContent>Contenuto</CardContent>
</Card>
```

### Input

```typescript
import { Input } from '@/components/ui/input'
import { dk } from '@/config/dkdesign'

// Standard
<Input placeholder="Inserisci testo" />

// Con stile design system
<Input className={dk.input.standard} />
```

---

## Animazioni

### Transizioni

```typescript
import { masterAnimations } from '@/config/master-design.config'

// Base
<div className={masterAnimations.transition}>
  {/* transition-all duration-200 */}
</div>

// Slow
<div className={masterAnimations.transitionSlow}>
  {/* duration-300 */}
</div>
```

### Hover Effects

```typescript
// Scale
<div className={masterAnimations.hover.scale}>
  {/* hover:scale-[1.02] */}
</div>

// Lift
<div className={masterAnimations.hover.lift}>
  {/* hover:-translate-y-1 */}
</div>

// Glow
<div className={masterAnimations.hover.glow}>
  {/* hover:shadow-[0_0_10px_rgba(2,179,191,0.3)] */}
</div>
```

### Loading States

```typescript
// Pulse
<div className={masterAnimations.loading.pulse}>
  {/* animate-pulse */}
</div>

// Spin
<div className={masterAnimations.loading.spin}>
  {/* animate-spin */}
</div>
```

---

## Responsive Design

### Breakpoints

```typescript
import { masterBreakpoints } from '@/config/master-design.config'

// Mobile: 640px+
// Tablet: 768px+
// Tablet Landscape: 1024px+ (ottimizzato per tablet 10+)
// Desktop: 1280px+
// Wide: 1536px+
```

### Utilizzo

```typescript
// Hide on mobile
<div className={masterBreakpoints.hideOnMobile}>
  {/* hidden sm:block */}
</div>

// Show on mobile
<div className={masterBreakpoints.showOnMobile}>
  {/* block sm:hidden */}
</div>

// Responsive grid
<div className={masterBreakpoints.responsiveGrid}>
  {/* grid-cols-1 sm:grid-cols-2 tablet-landscape:grid-cols-3 lg:grid-cols-4 */}
</div>
```

### Tablet Landscape Optimization

Il design system include ottimizzazioni specifiche per tablet in orientamento landscape (1024px+):

```typescript
// Padding ottimizzato
<div className={layoutTokens.cardPadding}>
  {/* p-4 sm:p-5 tablet-landscape:p-6 */}
</div>

// Grid ottimizzato
<div className={layoutTokens.grid.tabletOptimal}>
  {/* grid-cols-1 sm:grid-cols-2 tablet-landscape:grid-cols-3 lg:grid-cols-4 */}
</div>
```

---

## Accessibilità

### Contrasto Colori

Tutti i colori del design system rispettano il contrasto minimo WCAG AA (4.5:1):

- Testo primario su background: ✅ 12.5:1
- Testo secondario su background: ✅ 6.2:1
- Brand color su background: ✅ 4.8:1

### Focus States

```typescript
import { masterAnimations } from '@/config/master-design.config'

// Focus ring
<button className={masterAnimations.focus.ring}>
  {/* focus:ring-2 focus:ring-cyan-500 */}
</button>
```

### Screen Readers

```typescript
// Aggiungi sempre aria-label per icone
<button aria-label="Chiudi">
  <XIcon />
</button>

// Usa semantic HTML
<nav aria-label="Navigazione principale">
  <ul>
    <li><a href="/">Home</a></li>
  </ul>
</nav>
```

---

## Best Practices

### ✅ DO

1. **Usa sempre i design tokens**

   ```typescript
   // ✅
   <div className={masterColors.athlete.gradient.primary}>
   ```

2. **Usa componenti riutilizzabili**

   ```typescript
   // ✅
   <Button variant="primary">Clicca</Button>
   ```

3. **Mantieni coerenza con il design system**

   ```typescript
   // ✅
   <Card className={masterCards.athlete.base}>
   ```

4. **Testa su tutti i breakpoint**
   - Mobile (375px - 640px)
   - Tablet (768px - 1024px)
   - Tablet Landscape (1024px+)
   - Desktop (1280px+)

### ❌ DON'T

1. **Non usare valori hardcoded**

   ```typescript
   // ❌
   <div className="bg-[#14b8a6]">
   ```

2. **Non creare varianti custom senza motivo**

   ```typescript
   // ❌
   <Button className="bg-purple-500">
   ```

3. **Non ignorare l'accessibilità**

   ```typescript
   // ❌
   <button>Click</button> // Manca aria-label se solo icona
   ```

4. **Non usare animazioni pesanti**
   ```typescript
   // ❌
   <div className="animate-bounce"> // Troppo pesante
   ```

---

## Esempi Pratici

### Card con Design System

```typescript
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { masterCards, masterColors } from '@/config/master-design.config'

const WorkoutCard = () => (
  <Card
    variant="athlete"
    hoverable
    className={masterCards.athlete.interactive}
  >
    <CardHeader>
      <CardTitle className={masterColors.athlete.text.primary}>
        Allenamento Cardio
      </CardTitle>
    </CardHeader>
    <CardContent>
      <p className={masterColors.athlete.text.secondary}>
        Durata: 30 minuti
      </p>
    </CardContent>
  </Card>
)
```

### Form con Design System

```typescript
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { dk } from '@/config/dkdesign'
import { masterButtons } from '@/config/master-design.config'

const LoginForm = () => (
  <form className="space-y-4">
    <Input
      className={dk.input.standard}
      placeholder="Email"
    />
    <Input
      className={dk.input.standard}
      type="password"
      placeholder="Password"
    />
    <Button
      className={masterButtons.athlete.primary}
      type="submit"
    >
      Accedi
    </Button>
  </form>
)
```

---

## Risorse

- [Design System Config](/src/config/design-system.ts)
- [Master Design Config](/src/config/master-design.config.ts)
- [DK Design Config](/src/config/dkdesign.ts)
- [Tailwind Config](/tailwind.config.ts)
- [Componenti UI](/src/components/ui/)

---

**Ultimo aggiornamento**: 2025-01-27
