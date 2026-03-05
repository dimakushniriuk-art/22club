# 🏃 Layout Dashboard Atleta

Documentazione completa del layout e della struttura della dashboard per Atleti.

## 🏗️ Struttura Generale

### Layout Principale

La dashboard atleta utilizza un layout a **tab bar inferiore** con header fisso superiore.

```
┌─────────────────────────────────────────────────────────┐
│  Header (fisso)                                        │
│  ┌──────────┐              ┌──────────────────────┐   │
│  │  Logo    │              │  Time & Date         │   │
│  └──────────┘              └──────────────────────┘   │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  Main Content (scrollabile)                            │
│  ┌──────────────────────────────────────────────────┐   │
│  │  Hero Section / Welcome                         │   │
│  └──────────────────────────────────────────────────┘   │
│                                                          │
│  ┌──────────────────────────────────────────────────┐   │
│  │  Cards / Lists / Content                        │   │
│  └──────────────────────────────────────────────────┘   │
│                                                          │
├─────────────────────────────────────────────────────────┤
│  Tab Bar (fissa inferiore)                              │
│  [Home] [Allenamenti] [Appuntamenti] [Profilo]        │
└─────────────────────────────────────────────────────────┘
```

## 📁 Struttura File

```
src/app/home/
├── layout.tsx                    # Layout principale con TabBar
├── page.tsx                      # Home atleta (overview)
├── allenamenti/
│   ├── page.tsx                  # Lista allenamenti
│   └── oggi/
│       └── page.tsx              # Allenamenti di oggi
├── appuntamenti/
│   └── page.tsx                  # Appuntamenti atleta
├── documenti/
│   └── page.tsx                  # Documenti atleta
├── pagamenti/
│   └── page.tsx                  # Storico pagamenti
├── progressi/
│   └── page.tsx                  # Statistiche e progressi
├── profilo/
│   └── page.tsx                  # Profilo atleta
└── chat/
    └── page.tsx                  # Chat con PT
```

## 🎨 Componenti Layout

### 1. HomeLayout (`src/app/home/layout.tsx`)

**Responsabilità:**

- Wrappa tutte le pagine atleta
- Fornisce header fisso con logo e orario
- Configura TabBar inferiore
- Gestisce ErrorBoundary
- Mostra notifiche

**Caratteristiche:**

- **Header Sticky**: Header fisso in alto con logo e orario
- **TabBar**: Navigazione principale in fondo
- **ErrorBoundary**: Gestione errori React
- **Background**: Componente AthleteBackground per effetti visivi
- **NotificationToast**: Sistema notifiche

```typescript
export default async function HomeLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Header Sticky */}
      <header className="sticky top-0 z-50 bg-black/80 border-b border-teal-500/20">
        <div className="flex items-center justify-between px-4 py-3">
          <Logo />
          <TimeAndDate />
        </div>
      </header>

      {/* Main Content */}
      <main className="pb-20 relative z-10 bg-black">
        <ErrorBoundary>{children}</ErrorBoundary>
      </main>

      {/* Tab Bar */}
      <TabBar />

      {/* Notifications */}
      <NotificationToast />
    </div>
  )
}
```

### 2. TabBar (`src/components/athlete/tab-bar.tsx`)

**Responsabilità:**

- Navigazione principale atleta
- Highlight tab attiva
- Icone e labels
- Badge per notifiche (opzionale)

**Tab Items:**

```typescript
const tabs = [
  { label: 'Home', icon: Home, href: '/home' },
  { label: 'Allenamenti', icon: Dumbbell, href: '/home/allenamenti' },
  { label: 'Appuntamenti', icon: Calendar, href: '/home/appuntamenti' },
  { label: 'Profilo', icon: User, href: '/home/profilo' },
]
```

**Caratteristiche:**

- **Fixed Position**: Fissa in fondo allo schermo
- **Active State**: Highlight automatico della route corrente
- **Icons**: Lucide React icons
- **Responsive**: Adattamento mobile/desktop
- **Accessibility**: ARIA labels e keyboard navigation

### 3. AthleteBackground (`src/components/athlete/athlete-background.tsx`)

**Responsabilità:**

- Effetti visivi di background
- Gradients e animazioni
- Atmosfera visiva per atleta

## 🎯 Pattern di Layout

### Container Standard

Tutte le pagine atleta seguono questo pattern:

```typescript
export default function PageName() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Hero Section (opzionale) */}
      <div className="relative overflow-hidden bg-gradient-to-br from-teal-900 via-teal-800 to-cyan-900">
        <div className="mx-auto max-w-md relative p-4">
          <h1>Page Title</h1>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Cards / Lists */}
        <div className="space-y-4 p-4">
          <Card>
            {/* Content */}
          </Card>
        </div>
      </div>
    </div>
  )
}
```

### Spacing e Responsive

Utilizza il design system configurato in `src/config/master-design.config.ts`:

```typescript
athlete: {
  container: 'min-h-screen bg-black pb-24',
  content: 'space-y-6 px-4 py-4 sm:px-6 sm:py-6 tablet-landscape:px-8 tablet-landscape:py-8 max-w-4xl tablet-landscape:max-w-5xl mx-auto',
  grid: {
    stats: 'grid grid-cols-1 gap-4 tablet-landscape:grid-cols-2 tablet-landscape:gap-6',
    cards: 'space-y-4 tablet-landscape:space-y-6',
  },
}
```

## 🎨 Design System

### Colori

- **Background**: `bg-black` (dark mode)
- **Hero Sections**: Gradients teal/cyan (`from-teal-900 via-teal-800 to-cyan-900`)
- **Cards**: `bg-slate-900/95` con bordi `border-teal-500/30`
- **Primary**: Teal/Cyan (`#02b3bf`, `#0891b2`)
- **Text**: `text-white` / `text-teal-100`

### Typography

- **Headings**: `font-semibold` / `font-bold` con gradient text
- **Body**: `text-sm` / `text-base`
- **Labels**: `text-xs` / `text-sm`

### Spacing

- **Section**: `space-y-4 tablet-landscape:space-y-6`
- **Card Padding**: `p-4 sm:p-5 tablet-landscape:p-6`
- **Container**: `max-w-4xl tablet-landscape:max-w-5xl mx-auto`

## 📱 Responsive Breakpoints

```typescript
// Mobile first
sm: '640px'      // Small devices
md: '768px'      // Medium devices
lg: '1024px'     // Large devices
tablet-landscape: '1024px'  // Custom breakpoint
```

## 🔄 Navigazione

### Tab Bar Navigation

La TabBar fornisce navigazione rapida tra sezioni principali:

1. **Home**: Overview e dashboard principale
2. **Allenamenti**: Schede e workout
3. **Appuntamenti**: Calendario appuntamenti
4. **Profilo**: Dati personali e impostazioni

### Deep Links

Le pagine supportano deep linking:

- `/home/allenamenti/oggi` - Allenamenti di oggi
- `/home/chat` - Chat con PT
- `/home/progressi` - Statistiche

## 🎨 Componenti Specifici Atleta

### 1. Workout Cards

- Mostra scheda allenamento
- Progress indicator
- Quick actions

### 2. Appointment Cards

- Prossimo appuntamento
- Countdown timer
- Quick reschedule

### 3. Progress Cards

- Statistiche allenamenti
- Grafici progressi
- Metriche personali

### 4. Document Cards

- Lista documenti
- Status badges
- Quick view

## 🔐 Autenticazione e Autorizzazione

- **Middleware**: Verifica ruolo `athlete`
- **RLS**: Row Level Security in Supabase (solo dati propri)
- **Route Protection**: Next.js middleware + layout checks

## 🚀 Performance

- **Server Components**: Dove possibile
- **Suspense**: Loading states granulari
- **Code Splitting**: Automatico con Next.js
- **Image Optimization**: Next.js Image component
- **Lazy Loading**: Componenti pesanti caricati on-demand

## 📝 Best Practices

1. **Usa Server Components** quando possibile
2. **Error Boundaries** per gestione errori
3. **Loading States** con Suspense
4. **Hero Sections** per impatto visivo
5. **Cards** per contenuto strutturato
6. **Consistent Spacing** usando design system
7. **Accessibility** con ARIA labels
8. **Mobile First** design approach

## 🔗 Riferimenti

- [Design System Config](../src/config/master-design.config.ts)
- [TabBar Component](../src/components/athlete/tab-bar.tsx)
- [HomeLayout Component](../src/app/home/layout.tsx)
- [Architecture Docs](./architecture.md)
