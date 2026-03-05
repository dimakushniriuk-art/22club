# 🎨 05 - Frontend: Pagine e Componenti

> **Analisi struttura frontend Next.js 15 App Router**

---

## 📁 STRUTTURA COMPONENTI

```
src/components/
├── ui/                     # 35 file - Componenti base
│   ├── button.tsx
│   ├── input.tsx
│   ├── card.tsx
│   ├── dialog.tsx
│   ├── dropdown-menu.tsx
│   ├── animations.tsx
│   └── ...
│
├── shared/                 # 21 file - Componenti condivisi
│   ├── dashboard/         # Layout dashboard
│   │   └── role-layout.tsx
│   └── ui/
│       ├── skeleton.tsx
│       ├── error-boundary.tsx
│       └── notification-toast.tsx
│
├── dashboard/              # 120 file - Area trainer/admin
│   ├── sidebar/
│   ├── header/
│   ├── modals-wrapper.tsx
│   ├── agenda-client.tsx
│   └── ...
│
├── athlete/                # 12 file - Area atleta
│   └── ...
│
├── appointments/           # 8 file - Gestione appuntamenti
│   └── ...
│
├── calendar/               # 6 file - Calendario
│   └── ...
│
├── workout/                # 15 file - Allenamenti
│   ├── workout-wizard.tsx
│   ├── exercise-catalog.tsx
│   └── ...
│
├── chat/                   # 6 file - Messaggistica
│   └── ...
│
├── documents/              # 4 file - Documenti
│   └── ...
│
├── communications/         # 7 file - Notifiche
│   └── ...
│
└── home-profile/           # 8 file - Profilo atleta home
    └── ...
```

---

## 🏠 PAGINE PRINCIPALI

### Login Page
```typescript
// src/app/login/page.tsx
'use client'
export default function LoginPage() {
  // Form con validazione client-side
  // Supabase signInWithPassword
  // Redirect a /post-login
}
```

**Componenti usati**:
- `Button`, `Input`, `Label`, `Card` (ui/)
- `FadeIn`, `SlideUp` (animations)
- Next.js `Image`, `Link`

### Dashboard Page
```typescript
// src/app/dashboard/page.tsx
export default async function DashboardPage() {
  // Server Component
  // Query appuntamenti oggi
  // Render AgendaClient
}
```

**Componenti usati**:
- `AgendaClient` (client component)
- `NewAppointmentButton`
- `Skeleton`, `SkeletonCard`
- Lucide icons

### Home Page (Atleta)
```typescript
// src/app/home/page.tsx
'use client'
export default function HomePage() {
  // Grid di navigazione blocchi
  // useAuth per user data
}
```

**Componenti usati**:
- `Link` con prefetch
- `iconMap` per icone dinamiche
- Lucide icons

---

## 🧩 PATTERN COMPONENTI

### Server vs Client
```
Server Components (async, no 'use client'):
├── Data fetching diretto
├── Accesso a cookies/headers
├── Streaming con Suspense
└── Nessuno stato locale

Client Components ('use client'):
├── Interattività (onClick, onChange)
├── Hooks (useState, useEffect, custom)
├── Browser APIs
└── Animazioni
```

### Esempio Pattern
```typescript
// Server Component (page.tsx)
export default async function Page() {
  const data = await fetchData()  // Server fetch
  return (
    <Suspense fallback={<Skeleton />}>
      <ClientComponent initialData={data} />
    </Suspense>
  )
}

// Client Component
'use client'
function ClientComponent({ initialData }) {
  const [state, setState] = useState(initialData)
  // Interattività
}
```

---

## 🎨 DESIGN SYSTEM

### Token Design
```typescript
// src/config/design-tokens.ts
// Colori, spacing, tipografia

// src/styles/design-tokens.css
// CSS custom properties
```

### Tailwind Classes
```
Colori:
├── bg-background, bg-background-secondary
├── text-text-primary, text-text-secondary
├── border-border
└── text-brand, bg-brand

Effetti:
├── animate-pulse, animate-spin
├── hover:scale-[1.02]
├── transition-all duration-200
└── shadow-lg, shadow-brand/20
```

### Dark Mode
- Default dark mode (stile Apple)
- `ThemeProvider` per gestione tema
- CSS variables per colori

---

## 📊 STATISTICHE COMPONENTI

| Categoria | File Count | Note |
|-----------|------------|------|
| UI base | 35 | Radix UI based |
| Dashboard | 120 | Area più grande |
| Shared | 21 | Riutilizzabili |
| Athlete | 12 | Area atleta |
| Workout | 15 | Gestione schede |
| Altri | ~50 | Vari |

---

## ⚠️ PROBLEMI RILEVATI

### Componenti Troppo Grandi
```
File con >300 righe:
├── src/components/dashboard/* (vari)
├── src/components/workout/workout-wizard.tsx
└── src/components/calendar/*
```

### Debug Logging in Componenti
```
File con fetch a localhost:7242:
├── Dashboard page
├── AgendaClient
└── Vari componenti
```

---

## 📊 VALUTAZIONE

| Aspetto | Rating | Note |
|---------|--------|------|
| Chiarezza logica | ★★★★☆ | Struttura organizzata |
| Robustezza | ★★★☆☆ | Error boundaries presenti ma non ovunque |
| Debito tecnico | **MEDIO** | Alcuni file troppo grandi |
| Rischio regressioni | **BASSO** | Componenti isolati |

---

## 🔗 FILE CORRELATI

- `src/config/design-system.ts` - Configurazione design
- `src/styles/` - CSS globali
- `tailwind.config.js` - Configurazione Tailwind
