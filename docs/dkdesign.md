# 🎨 DK Design System - 22Club

**Design System completo per il progetto 22Club**  
Documentazione centralizzata di tutti gli stili, pattern e componenti utilizzati nel progetto.

---

## 📐 Layout & Container

### Container Principale Dashboard

```tsx
// Container standard per tutte le pagine dashboard
<div className="flex-1 flex flex-col space-y-4 sm:space-y-6 px-4 sm:px-6 py-4 sm:py-6 max-w-[1800px] mx-auto w-full relative">
  {/* Contenuto */}
</div>
```

**Classi:**

- `flex-1 flex flex-col` - Layout flex verticale che occupa tutto lo spazio
- `space-y-4 sm:space-y-6` - Spaziatura verticale responsive (16px mobile, 24px desktop)
- `px-4 sm:px-6` - Padding orizzontale responsive (16px mobile, 24px desktop)
- `py-4 sm:py-6` - Padding verticale responsive (16px mobile, 24px desktop)
- `max-w-[1800px]` - Larghezza massima container
- `mx-auto` - Centratura orizzontale
- `w-full` - Larghezza completa
- `relative` - Posizionamento relativo per elementi assoluti interni

### Container Sezione

```tsx
// Per sezioni con contenuto scrollabile
<div className="flex flex-col h-full space-y-6 px-6 py-6 overflow-y-auto">{/* Contenuto */}</div>
```

**Classi:**

- `flex flex-col h-full` - Layout flex verticale a tutta altezza
- `space-y-6` - Spaziatura verticale 24px
- `px-6 py-6` - Padding uniforme 24px
- `overflow-y-auto` - Scroll verticale quando necessario

### Container Sezione Compatta

```tsx
// Per sezioni più compatte
<div className="space-y-6 p-6">{/* Contenuto */}</div>
```

---

## 🎴 Card & Componenti

### Card Standard

```tsx
import { dk } from '@/config/dkdesign'
;<Card variant="trainer" className={dk.card.standard}>
  {/* Gradient overlay - SEMPRE usare dk.card.gradientOverlay */}
  <div className={dk.card.gradientOverlay} />

  <CardContent className={dk.card.content}>{/* Contenuto */}</CardContent>
</Card>
```

**Varianti Card:**

- `variant="trainer"` - Gradiente blu/indigo per PT
- `variant="athlete"` - Gradiente teal/cyan per atleti
- `variant="default"` - Gradiente teal/cyan standard

**Gradient Overlay - IMPORTANTE:**

```tsx
// ✅ CORRETTO - Usa dkdesign
import { dk } from '@/config/dkdesign'
<div className={dk.card.gradientOverlay} />

// ❌ SBAGLIATO - Non hardcodare
<div className="absolute inset-0 bg-gradient-to-br from-teal-500/5 via-transparent to-cyan-500/5" />
```

**Regola:** Il gradient overlay deve SEMPRE usare `dk.card.gradientOverlay` per mantenere la coerenza del design system.

### Card con Header

```tsx
import { dk } from '@/config/dkdesign'
;<Card variant="trainer" className={dk.card.standard}>
  <div className={dk.card.gradientOverlay} />

  <CardHeader className={dk.card.header}>
    <div className={dk.sectionHeader.withIcon}>
      <div className={dk.sectionHeader.icon}>
        <Icon className="h-4 w-4" />
      </div>
      <h2 className={dk.sectionHeader.title}>Titolo Sezione</h2>
    </div>
  </CardHeader>

  <CardContent className={dk.card.content}>{/* Contenuto */}</CardContent>
</Card>
```

---

## 🎨 Colori & Gradienti

### Palette Colori Principali

**Teal/Cyan (Primary):**

- `bg-teal-500` - Colore primario
- `bg-teal-500/20` - Background semi-trasparente
- `text-teal-400` - Testo accent
- `border-teal-500/30` - Bordo semi-trasparente

**Gradienti Standard:**

```tsx
import { dk } from '@/config/dkdesign'

// Background gradient
className={dk.gradient.background}

// Border gradient
className={dk.gradient.border}

// Overlay gradient (per card)
className={dk.card.gradientOverlay}

// Overlay gradient generico
className={dk.gradient.overlay}
```

**⚠️ IMPORTANTE:** Per il gradient overlay nelle card, usa sempre `dk.card.gradientOverlay` invece di hardcodare le classi.

### Colori Stato

**Success (Verde):**

- `bg-green-500/25 text-green-400 border-green-500/40`

**Warning (Arancione):**

- `bg-orange-500/25 text-orange-400 border-orange-500/40`

**Error (Rosso):**

- `bg-red-500/10 text-red-400 border-red-500/30`

**Info (Blu):**

- `bg-blue-500/20 text-blue-400 border-blue-500/30`

---

## 📝 Input & Form

### Input Standard

```tsx
<Input className="bg-gradient-to-br from-teal-900 to-cyan-900 border-teal-500/30 text-text-primary placeholder:text-gray-400 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition-all duration-200" />
```

**Classi Input:**

- `bg-gradient-to-br from-teal-900 to-cyan-900` - Background gradient
- `border-teal-500/30` - Bordo semi-trasparente
- `text-text-primary` - Testo principale
- `placeholder:text-gray-400` - Placeholder grigio
- `focus:border-teal-500` - Bordo focus
- `focus:ring-2 focus:ring-teal-500/20` - Ring focus
- `transition-all duration-200` - Transizioni

### Select/Dropdown

```tsx
<SimpleSelect className="bg-gradient-to-br from-teal-900 to-cyan-900 border-teal-500/30 text-text-primary" />
```

---

## 🔘 Bottoni

### Bottone Primario

```tsx
<Button variant="primary" className="w-full">
  Testo
</Button>
```

**Varianti:**

- `variant="primary"` - Teal solido (`bg-teal-500 hover:bg-teal-600`)
- `variant="outline"` - Bordo teal (`border-teal-500 text-teal-400`)
- `variant="ghost"` - Trasparente (`text-teal-400 hover:bg-teal-500/10`)

### Bottone con Icona

```tsx
<Button variant="outline" className="flex items-center gap-2">
  <Icon className="h-4 w-4" />
  <span>Testo</span>
</Button>
```

---

## 📊 KPI Cards

### ModernKPICard

```tsx
<ModernKPICard
  title="Titolo"
  value={42}
  icon={IconComponent}
  color="blue" // blue | green | orange | purple | cyan | indigo | teal | red | gray
  href="/dashboard/path"
/>
```

**Colori Disponibili:**

- `blue` - Blu
- `green` - Verde
- `orange` - Arancione
- `purple` - Viola
- `cyan` - Ciano
- `indigo` - Indaco
- `teal` - Teal
- `red` - Rosso
- `gray` - Grigio

---

## 🏷️ Badge & Status

### Badge Status

```tsx
// Completato
<div className="rounded-lg border px-3 py-1.5 flex items-center justify-center bg-green-500/25 text-green-400 border-green-500/40">
  Completato
</div>

// In corso
<div className="rounded-lg border px-3 py-1.5 flex items-center justify-center bg-orange-500/25 text-orange-400 border-orange-500/40">
  In corso
</div>

// Programmato
<div className="rounded-lg border px-3 py-1.5 flex items-center justify-center bg-blue-500/25 text-blue-400 border-blue-500/40">
  Programmato
</div>
```

**Pattern:**

- `rounded-lg border` - Bordo arrotondato
- `px-3 py-1.5` - Padding compatto
- `flex items-center justify-center` - Centratura contenuto
- `bg-{color}-500/25` - Background semi-trasparente
- `text-{color}-400` - Testo colorato
- `border-{color}-500/40` - Bordo semi-trasparente

---

## 📋 Tabelle

### Tabella Standard

```tsx
<Card variant="trainer" className="relative overflow-hidden">
  <div className="absolute inset-0 bg-gradient-to-br from-teal-500/5 via-transparent to-cyan-500/5" />

  <CardHeader className="relative">
    <div className="flex items-center gap-3 mb-4">
      <div className="bg-teal-500/20 text-teal-400 rounded-full p-2">
        <Icon className="h-4 w-4" />
      </div>
      <h2 className="text-lg font-bold text-text-primary">Titolo Tabella</h2>
    </div>
  </CardHeader>

  <CardContent className="relative">
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Colonna</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow>
          <TableCell>Dato</TableCell>
        </TableRow>
      </TableBody>
    </Table>
  </CardContent>
</Card>
```

---

## 🔍 Filtri & Ricerca

### Barra Ricerca

```tsx
<div className="relative">
  <Input
    placeholder="Cerca per atleta o note..."
    className="bg-gradient-to-br from-teal-900 to-cyan-900 border-teal-500/30 pl-10"
  />
  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-tertiary" />
</div>
```

### Filtri a Pill

```tsx
<div className="flex flex-wrap gap-3">
  <Button
    variant={filter === 'tutti' ? 'primary' : 'outline'}
    size="sm"
    onClick={() => setFilter('tutti')}
  >
    Tutti
  </Button>
  <Button
    variant={filter === 'attivi' ? 'primary' : 'outline'}
    size="sm"
    onClick={() => setFilter('attivi')}
  >
    Attivi
  </Button>
</div>
```

---

## 📱 Empty States

### Empty State Standard (Card)

```tsx
<Card variant="trainer" className="relative overflow-hidden">
  <div className={dk.card.gradientOverlay} />

  <CardContent className={cn(dk.emptyState.container, 'relative')}>
    <div className={dk.emptyState.icon}>
      <div className={dk.emptyState.iconWrapper}>
        <Icon className="h-12 w-12" />
      </div>
    </div>
    <h3 className={dk.emptyState.title}>Nessun elemento trovato</h3>
    <p className={dk.emptyState.description}>Descrizione del messaggio vuoto.</p>
    <Button variant="primary">
      <Icon className="mr-2 h-4 w-4" />
      Azione Primaria
    </Button>
  </CardContent>
</Card>
```

### Empty State Modulo (Div standalone)

```tsx
// Per moduli che non usano Card ma div standalone
<div className={dk.emptyStateModule.container}>
  <div className={dk.emptyStateModule.gradientOverlay} />
  <div className={dk.emptyStateModule.content}>
    <div className={dk.emptyStateModule.iconContainer}>
      <div className={dk.emptyStateModule.iconWrapper}>
        <Icon className="h-8 w-8" />
      </div>
    </div>
    <h3 className={dk.emptyStateModule.title}>Nessun elemento</h3>
    <p className={dk.emptyStateModule.description}>Descrizione del messaggio vuoto.</p>
  </div>
</div>
```

### Empty State Component (Riutilizzabile)

```tsx
import { EmptyState } from '@/components/shared/ui/empty-state'
;<EmptyState
  icon={Calendar}
  title="Nessun appuntamento"
  description="Non hai appuntamenti programmati per oggi."
  action={
    <Button variant="primary" onClick={onAdd}>
      <Plus className="mr-2 h-4 w-4" />
      Nuovo Appuntamento
    </Button>
  }
  variant="trainer"
  iconSize="large"
/>
```

---

## 🎯 Icone & Avatar

### Icona Container

```tsx
// Icona piccola
<div className="bg-teal-500/20 text-teal-400 rounded-full p-2">
  <Icon className="h-4 w-4" />
</div>

// Icona media
<div className="bg-teal-500/20 text-teal-400 rounded-full p-3">
  <Icon className="h-5 w-5" />
</div>

// Icona grande
<div className="bg-teal-500/20 text-teal-400 rounded-full p-6">
  <Icon className="h-12 w-12" />
</div>
```

**Pattern:**

- `bg-{color}-500/20` - Background semi-trasparente
- `text-{color}-400` - Colore icona
- `rounded-full` - Cerchio perfetto
- `p-{size}` - Padding proporzionale

---

## 📐 Spaziatura

### Spaziatura Verticale

- `space-y-2` - 8px (compatto)
- `space-y-4` - 16px (standard mobile)
- `space-y-6` - 24px (standard desktop)
- `space-y-8` - 32px (ampio)

### Padding

- `p-4` - 16px (compatto)
- `p-6` - 24px (standard)
- `px-4 sm:px-6` - Padding orizzontale responsive
- `py-4 sm:py-6` - Padding verticale responsive

---

## 🎭 Modali

### Modal Standard

```tsx
<div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
  <div className="relative z-50 w-full rounded-lg border p-6 max-w-4xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-teal-900 to-cyan-900 border-teal-500 shadow-2xl">
    {/* Header */}
    <div className="flex items-center justify-between mb-6">
      <h2 className="text-xl font-bold text-text-primary">Titolo Modal</h2>
      <Button variant="ghost" size="sm" onClick={onClose}>
        <X className="h-4 w-4" />
      </Button>
    </div>

    {/* Content */}
    <div className="space-y-4">{/* Contenuto scrollabile */}</div>

    {/* Footer */}
    <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-teal-500/30">
      <Button variant="outline" onClick={onClose}>
        Annulla
      </Button>
      <Button variant="primary" onClick={onSubmit}>
        Salva
      </Button>
    </div>
  </div>
</div>
```

**Classi Modal:**

- Backdrop: `bg-black/60 backdrop-blur-md`
- Container: `bg-gradient-to-br from-teal-900 to-cyan-900 border-teal-500`
- Max width: `max-w-4xl` (o `max-w-2xl`, `max-w-6xl`)
- Scroll: `max-h-[90vh] overflow-y-auto`

---

## 🎨 Tipografia

### Heading

```tsx
// H1
<h1 className="text-3xl font-bold text-text-primary">Titolo Principale</h1>

// H2
<h2 className="text-xl font-bold text-text-primary">Titolo Sezione</h2>

// H3
<h3 className="text-lg font-semibold text-text-primary">Sottotitolo</h3>
```

### Testo

```tsx
// Testo primario
<p className="text-text-primary">Testo principale</p>

// Testo secondario
<p className="text-text-secondary text-sm">Testo secondario</p>

// Testo terziario
<p className="text-text-tertiary text-xs">Testo terziario</p>
```

### Gradient Text

```tsx
<h2 className="text-xl font-bold mb-6 gradient-text bg-gradient-to-r from-teal-500 to-cyan-500 bg-clip-text text-transparent">
  Titolo con Gradiente
</h2>
```

---

## 🔄 Loading States

### Loading Spinner

```tsx
<div className="flex items-center justify-center py-16">
  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500"></div>
</div>
```

### Skeleton

```tsx
<div className="space-y-4">
  <div className="h-4 bg-teal-900/50 rounded animate-pulse"></div>
  <div className="h-4 bg-teal-900/50 rounded animate-pulse w-3/4"></div>
</div>
```

---

## 📱 Responsive Breakpoints

### Breakpoints Tailwind

- `sm:` - 640px (mobile landscape)
- `md:` - 768px (tablet)
- `lg:` - 1024px (desktop)
- `xl:` - 1280px (large desktop)
- `2xl:` - 1536px (extra large)

### Pattern Responsive

```tsx
// Padding responsive
className = 'px-4 sm:px-6 lg:px-8'

// Spaziatura responsive
className = 'space-y-4 sm:space-y-6 lg:space-y-8'

// Grid responsive
className = 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'
```

---

## 🎯 Quick Reference

### Container Pattern Completo

```tsx
<div className="flex-1 flex flex-col space-y-4 sm:space-y-6 px-4 sm:px-6 py-4 sm:py-6 max-w-[1800px] mx-auto w-full relative">
  {/* Header */}
  <div className="flex items-center justify-between">
    <div className="flex items-center gap-3">
      <div className="bg-teal-500/20 text-teal-400 rounded-full p-2">
        <Icon className="h-4 w-4" />
      </div>
      <h2 className="text-xl font-bold text-text-primary">Titolo</h2>
    </div>
    <Button variant="primary">
      <Plus className="mr-2 h-4 w-4" />
      Nuovo
    </Button>
  </div>

  {/* Content */}
  <Card variant="trainer" className={dk.card.standard}>
    <div className={dk.card.gradientOverlay} />
    <CardContent className={dk.card.content}>{/* Contenuto */}</CardContent>
  </Card>
</div>
```

---

## 📚 Componenti Riutilizzabili

### Sezione con Icona e Titolo

```tsx
<div className="flex items-center gap-3 mb-4">
  <div className="bg-teal-500/20 text-teal-400 rounded-full p-2">
    <Icon className="h-4 w-4" />
  </div>
  <h2 className="text-lg font-bold text-text-primary">Titolo Sezione</h2>
</div>
```

### Statistiche a Pill

```tsx
<div className="flex items-center gap-3 flex-wrap">
  <div className="rounded-lg border px-3 py-1.5 bg-blue-500/25 text-blue-400 border-blue-500/40">
    4 totali
  </div>
  <div className="rounded-lg border px-3 py-1.5 bg-green-500/25 text-green-400 border-green-500/40">
    1 completati
  </div>
</div>
```

---

## ⚠️ Regole Importanti

### Gradient Overlay - SEMPRE usare dkdesign

**❌ SBAGLIATO - Non fare così:**

```tsx
<div className="absolute inset-0 bg-gradient-to-br from-teal-500/5 via-transparent to-cyan-500/5" />
```

**✅ CORRETTO - Usa sempre:**

```tsx
import { dk } from '@/config/dkdesign'
;<div className={dk.card.gradientOverlay} />
```

**Perché?**

- Mantiene la coerenza del design system
- Facilita le modifiche future (cambi in un solo posto)
- Garantisce lo stesso stile in tutto il progetto

### Pattern di Migrazione

Se trovi questo pattern hardcoded:

```tsx
// Vecchio codice
<div className="absolute inset-0 bg-gradient-to-br from-teal-500/5 via-transparent to-cyan-500/5" />
```

Sostituiscilo con:

```tsx
// Nuovo codice
import { dk } from '@/config/dkdesign'
;<div className={dk.card.gradientOverlay} />
```

---

## ✅ Checklist Implementazione

Quando crei una nuova pagina, assicurati di:

- [ ] Usare il container principale standard (`dk.container.main`)
- [ ] Applicare gradient overlay alle card (`dk.card.gradientOverlay`)
- [ ] **NON hardcodare** il gradient overlay - usa sempre `dk.card.gradientOverlay`
- [ ] Usare colori teal/cyan per elementi primari
- [ ] Implementare stati vuoti con icona e messaggio
- [ ] Aggiungere loading states appropriati
- [ ] Rendere responsive con breakpoint `sm:`
- [ ] Usare spaziatura consistente (`space-y-6`)
- [ ] Applicare padding responsive (`px-4 sm:px-6`)

---

**Ultimo aggiornamento:** 2025-01-10  
**Versione:** 1.0.0
