# 📊 Layout Dashboard PT (Personal Trainer)

Documentazione completa del layout e della struttura della dashboard per Personal Trainer.

## 🏗️ Struttura Generale

### Layout Principale

La dashboard PT utilizza un layout a **sidebar fissa** con contenuto principale scrollabile.

```
┌─────────────────────────────────────────────────────────┐
│  Sidebar (fissa)  │  Main Content (scrollabile)         │
│                   │                                      │
│  - Dashboard      │  ┌──────────────────────────────┐   │
│  - Clienti        │  │  Breadcrumb Navigation       │   │
│  - Schede         │  └──────────────────────────────┘   │
│  - Appuntamenti   │                                      │
│  - Calendario     │  ┌──────────────────────────────┐   │
│  - Esercizi       │  │  Page Content               │   │
│  - Abbonamenti    │  │  (KPI Cards, Tables, etc.)  │   │
│  - Chat           │  └──────────────────────────────┘   │
│  - Comunicazioni  │                                      │
│  - Impostazioni   │                                      │
│  - [Admin]        │                                      │
└─────────────────────────────────────────────────────────┘
```

## 📁 Struttura File

```
src/app/dashboard/
├── layout.tsx                    # Layout principale con Sidebar
├── page.tsx                       # Dashboard home (overview)
├── clienti/
│   └── page.tsx                  # Gestione clienti
├── schede/
│   └── page.tsx                  # Gestione schede allenamento
├── appuntamenti/
│   └── page.tsx                  # Gestione appuntamenti
├── calendario/
│   └── page.tsx                  # Vista calendario
├── esercizi/
│   └── page.tsx                  # Gestione esercizi
├── abbonamenti/
│   └── page.tsx                  # Gestione abbonamenti
├── chat/
│   └── page.tsx                  # Chat con atleti
├── comunicazioni/
│   └── page.tsx                  # Sistema comunicazioni
├── impostazioni/
│   └── page.tsx                  # Impostazioni account
└── admin/                        # Solo per admin
    ├── page.tsx
    ├── utenti/
    ├── ruoli/
    └── statistiche/
```

## 🎨 Componenti Layout

### 1. DashboardLayout (`src/app/dashboard/layout.tsx`)

**Responsabilità:**

- Wrappa tutte le pagine dashboard
- Gestisce autenticazione e autorizzazione
- Fornisce ErrorBoundary e Suspense
- Configura realtime subscriptions
- Mostra NavigationLoading overlay

**Caratteristiche:**

- **RoleLayout**: Wrapper per layout specifico ruolo (staff)
- **ErrorBoundary**: Gestione errori React
- **Suspense**: Loading states durante navigazione
- **Realtime**: Subscriptions per appuntamenti, documenti, notifiche
- **ModalsWrapper**: Gestione modali globali

```typescript
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const navigationState = useNavigationState()
  const { org_id } = useAuth()

  // Realtime subscriptions
  useAppointmentsRealtime(org_id || undefined)
  useDocumentsRealtime(org_id || undefined)
  useRealtimeChannel('notifications', handleNotification)

  return (
    <>
      <RoleLayout role="staff">
        <ErrorBoundary>
          <Suspense fallback={<LoadingSpinner />}>
            {children}
          </Suspense>
        </ErrorBoundary>
        <NavigationLoading {...navigationState} />
      </RoleLayout>
      <NotificationToast />
      <ModalsWrapper />
    </>
  )
}
```

### 2. RoleLayout (`src/components/shared/dashboard/role-layout.tsx`)

**Responsabilità:**

- Layout base per ruoli (staff/atleta)
- Gestisce Sidebar per staff
- Applica transizioni e animazioni

```typescript
export const RoleLayout: React.FC<Props> = ({ role, children }) => {
  return (
    <TransitionWrapper>
      <div className="flex min-h-screen bg-background">
        {role === 'staff' && <Sidebar role={role} />}
        <main className="flex-1 flex flex-col">
          <div className="flex-1 overflow-auto">{children}</div>
        </main>
      </div>
    </TransitionWrapper>
  )
}
```

### 3. Sidebar (`src/components/shared/dashboard/sidebar.tsx`)

**Responsabilità:**

- Navigazione principale
- Collapse/expand sidebar
- Logout
- Highlight route attiva

**Menu Items:**

```typescript
const staffNav = [
  { label: 'Dashboard', icon: Home, href: '/dashboard' },
  { label: 'Clienti', icon: Users, href: '/dashboard/clienti' },
  { label: 'Schede', icon: Dumbbell, href: '/dashboard/schede' },
  { label: 'Appuntamenti', icon: Calendar, href: '/dashboard/appuntamenti' },
  { label: 'Calendario', icon: Calendar, href: '/dashboard/calendario' },
  { label: 'Esercizi', icon: Dumbbell, href: '/dashboard/esercizi' },
  { label: 'Abbonamenti', icon: Euro, href: '/dashboard/abbonamenti' },
  { label: 'Chat', icon: MessageSquare, href: '/dashboard/chat' },
  { label: 'Comunicazioni', icon: Send, href: '/dashboard/comunicazioni' },
  { label: 'Impostazioni', icon: Settings, href: '/dashboard/impostazioni' },
]

// Admin menu (condizionale)
{
  isAdmin && { label: 'Admin', icon: Shield, href: '/dashboard/admin' }
}
```

**Caratteristiche:**

- **Collapsible**: Sidebar può essere collassata (stato salvato in localStorage)
- **Active Route**: Highlight automatico della route corrente
- **Responsive**: Adattamento mobile/desktop
- **Icons**: Lucide React icons

## 🎯 Pattern di Layout

### Container Standard

Tutte le pagine dashboard seguono questo pattern:

```typescript
export default function PageName() {
  return (
    <div className="relative min-h-screen flex flex-col">
      <div className="flex-1 flex flex-col space-y-4 sm:space-y-6 px-4 sm:px-6 py-4 sm:py-6 max-w-[1800px] mx-auto w-full">
        {/* Breadcrumb */}
        <Breadcrumb />

        {/* Header con titolo e azioni */}
        <div className="flex items-center justify-between">
          <h1>Page Title</h1>
          <Button>Action</Button>
        </div>

        {/* KPI Cards (opzionale) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <KPICard />
        </div>

        {/* Contenuto principale */}
        <Card>
          {/* Page content */}
        </Card>
      </div>
    </div>
  )
}
```

### Spacing e Responsive

Utilizza il design system configurato in `src/config/master-design.config.ts`:

```typescript
trainer: {
  container: 'min-h-screen bg-black pb-24 tablet-landscape:pb-32',
  content: 'space-y-6 px-4 py-4 sm:px-6 sm:py-6 tablet-landscape:px-8 tablet-landscape:py-8 max-w-6xl tablet-landscape:max-w-7xl mx-auto',
  grid: {
    stats: 'grid grid-cols-1 gap-4 tablet-landscape:grid-cols-2 lg:grid-cols-3 tablet-landscape:gap-6',
  },
}
```

## 🔄 Realtime Features

Il layout dashboard gestisce automaticamente:

1. **Appuntamenti Realtime**: Aggiornamenti in tempo reale
2. **Documenti Realtime**: Notifiche nuovi documenti
3. **Notifiche**: Toast notifications per eventi importanti

```typescript
// Automaticamente configurato nel layout
useAppointmentsRealtime(org_id)
useDocumentsRealtime(org_id)
useRealtimeChannel('notifications', handleNotification)
```

## 🎨 Design System

### Colori

- **Background**: `bg-black` (dark mode)
- **Cards**: `bg-slate-900/95` con bordi `border-slate-700`
- **Primary**: Teal/Cyan (`#02b3bf`, `#0891b2`)
- **Text**: `text-white` / `text-slate-200`

### Typography

- **Headings**: `font-semibold` / `font-bold`
- **Body**: `text-sm` / `text-base`
- **Labels**: `text-xs` / `text-sm`

### Spacing

- **Section**: `space-y-4 tablet-landscape:space-y-6`
- **Card Padding**: `p-4 sm:p-5 tablet-landscape:p-6 lg:p-8`
- **Container**: `max-w-6xl tablet-landscape:max-w-7xl mx-auto`

## 📱 Responsive Breakpoints

```typescript
// Mobile first
sm: '640px'      // Small devices
md: '768px'      // Medium devices
lg: '1024px'     // Large devices
xl: '1280px'     // Extra large
tablet-landscape: '1024px'  // Custom breakpoint
```

## 🔐 Autenticazione e Autorizzazione

- **Middleware**: Verifica ruolo `staff` o `admin`
- **RLS**: Row Level Security in Supabase
- **Route Protection**: Next.js middleware + layout checks

## 🚀 Performance

- **Server Components**: Dove possibile
- **Suspense**: Loading states granulari
- **Code Splitting**: Automatico con Next.js
- **Image Optimization**: Next.js Image component

## 📝 Best Practices

1. **Usa Server Components** quando possibile
2. **Error Boundaries** per gestione errori
3. **Loading States** con Suspense
4. **Breadcrumb** per navigazione
5. **KPI Cards** per overview rapida
6. **Consistent Spacing** usando design system
7. **Accessibility** con ARIA labels

## 🔗 Riferimenti

- [Design System Config](../src/config/master-design.config.ts)
- [Sidebar Component](../src/components/shared/dashboard/sidebar.tsx)
- [RoleLayout Component](../src/components/shared/dashboard/role-layout.tsx)
- [Architecture Docs](./architecture.md)
