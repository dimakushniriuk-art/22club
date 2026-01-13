# 🛤️ 04 - Routing e Middleware

> **Sistema di routing Next.js 15 e middleware di protezione**

---

## 📍 MAPPA ROUTE

### Route Pubbliche
| Route | File | Descrizione |
|-------|------|-------------|
| `/` | - | Redirect a /login |
| `/login` | `src/app/login/page.tsx` | Form login |
| `/registrati` | `src/app/registrati/page.tsx` | Registrazione atleta |
| `/forgot-password` | `src/app/forgot-password/page.tsx` | Reset password |
| `/reset-password` | `src/app/reset-password/page.tsx` | Nuova password |
| `/reset` | `src/app/reset/page.tsx` | Legacy reset |

### Route Protette - Dashboard (trainer/admin)
| Route | File | Descrizione |
|-------|------|-------------|
| `/dashboard` | `src/app/dashboard/page.tsx` | Home trainer |
| `/dashboard/admin` | `src/app/dashboard/admin/page.tsx` | Home admin |
| `/dashboard/clienti` | `src/app/dashboard/clienti/page.tsx` | Lista clienti |
| `/dashboard/calendario` | `src/app/dashboard/calendario/page.tsx` | Calendario |
| `/dashboard/schede` | `src/app/dashboard/schede/page.tsx` | Schede allenamento |
| `/dashboard/statistiche` | `src/app/dashboard/statistiche/page.tsx` | Analytics |
| `/dashboard/chat` | `src/app/dashboard/chat/page.tsx` | Messaggi |
| `/dashboard/allenamenti` | `src/app/dashboard/allenamenti/page.tsx` | Allenamenti |
| `/dashboard/profilo` | `src/app/dashboard/profilo/page.tsx` | Profilo PT |

### Route Protette - Home (athlete)
| Route | File | Descrizione |
|-------|------|-------------|
| `/home` | `src/app/home/page.tsx` | Home atleta |
| `/home/allenamenti` | `src/app/home/allenamenti/page.tsx` | Schede atleta |
| `/home/appuntamenti` | `src/app/home/appuntamenti/page.tsx` | Appuntamenti |
| `/home/progressi` | `src/app/home/progressi/page.tsx` | Progressi |
| `/home/chat` | `src/app/home/chat/page.tsx` | Chat con PT |
| `/home/profilo` | `src/app/home/profilo/page.tsx` | Profilo atleta |
| `/home/nutrizionista` | `src/app/home/nutrizionista/page.tsx` | Area nutrizionista |
| `/home/massaggiatore` | `src/app/home/massaggiatore/page.tsx` | Area massaggiatore |
| `/home/documenti` | `src/app/home/documenti/page.tsx` | Documenti |

### Route API
| Pattern | File | Descrizione |
|---------|------|-------------|
| `/api/health` | `src/app/api/health/route.ts` | Health check |
| `/api/admin/*` | `src/app/api/admin/` | Operazioni admin |
| `/api/athletes/*` | `src/app/api/athletes/` | CRUD atleti |
| `/api/communications/*` | `src/app/api/communications/` | Notifiche/email |
| `/api/push/*` | `src/app/api/push/` | Push notifications |
| `/api/webhooks/*` | `src/app/api/webhooks/` | Webhook handlers |

---

## 🛡️ MIDDLEWARE

### Configurazione
```typescript
// src/middleware.ts:279-291
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|api).*)',
  ],
  runtime: 'nodejs',
}
```

### Flusso Principale
```
Request
    │
    ▼
┌─────────────────────────────────────┐
│ 1. Skip Static Files               │
│    (.svg, .png, .css, .js, etc.)   │
└─────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────┐
│ 2. Legacy Route Redirect           │
│    /auth/login → /login            │
└─────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────┐
│ 3. Get Session (Supabase)          │
│    - Handle refresh token errors   │
│    - Silent failure → session=null │
└─────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────┐
│ 4. Check Public Routes             │
│    /login, /reset, /, /registrati  │
│    /forgot-password, /reset-password│
└─────────────────────────────────────┘
    │
    ├── Se PUBLIC + sessione → redirect role-based
    │
    ├── Se PUBLIC + no sessione → next()
    │
    ▼
┌─────────────────────────────────────┐
│ 5. Protected Route Check           │
│    - /dashboard → admin/trainer    │
│    - /home → athlete               │
│    - /api → protetta               │
└─────────────────────────────────────┘
    │
    ├── Se autorizzato → next()
    │
    └── Se non autorizzato → redirect /login
```

### Cache Ruoli
```typescript
// src/middleware.ts:8-16
interface CachedRole {
  role: string
  expires: number
}
const roleCache = new Map<string, CachedRole>()

// TTL: 1 minuto
roleCache.set(userId, { role, expires: Date.now() + 60 * 1000 })
```

### Cleanup Interval
```typescript
// src/middleware.ts:20-36
let cleanupInterval: NodeJS.Timeout | null = null

function initCleanupInterval() {
  if (cleanupInterval) return
  cleanupInterval = setInterval(() => {
    const now = Date.now()
    for (const [key, value] of roleCache.entries()) {
      if (value.expires < now) {
        roleCache.delete(key)
      }
    }
  }, 60 * 1000)
}
```

---

## 🔀 REDIRECT LOGIC

### Utente Autenticato su /login
```typescript
// src/middleware.ts:186-194
if (pathname === '/login') {
  if (normalizedRole === 'admin') {
    return NextResponse.redirect(new URL('/dashboard/admin', request.url))
  } else if (normalizedRole === 'trainer') {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  } else if (normalizedRole === 'athlete') {
    return NextResponse.redirect(new URL('/home', request.url))
  }
}
```

### Root Sempre a Login
```typescript
// src/middleware.ts:196-201
if (pathname === '/') {
  const redirectUrl = request.nextUrl.clone()
  redirectUrl.pathname = '/login'
  return NextResponse.redirect(redirectUrl)
}
```

### Accesso Negato
```typescript
// src/middleware.ts:206-220
// Dashboard solo per admin/trainer
if (pathname.startsWith('/dashboard') && !['admin', 'trainer'].includes(normalizedRole)) {
  redirectUrl.pathname = '/login'
  redirectUrl.searchParams.set('error', 'accesso_negato')
  return NextResponse.redirect(redirectUrl)
}

// Home solo per athlete
if (pathname.startsWith('/home') && normalizedRole !== 'athlete') {
  redirectUrl.pathname = '/login'
  redirectUrl.searchParams.set('error', 'accesso_negato')
  return NextResponse.redirect(redirectUrl)
}
```

---

## 📊 VALUTAZIONE

| Aspetto | Rating | Note |
|---------|--------|------|
| Chiarezza logica | ★★★★★ | Flusso lineare e documentato |
| Robustezza | ★★★★☆ | Gestione errori silenziosa ok |
| Debito tecnico | **BASSO** | Struttura pulita |
| Rischio regressioni | **BASSO** | Cambi localizzati |

---

## ⚠️ PROBLEMI RILEVATI

### SEG-005: Cache Non Distribuita
```
🧠 RISK
File: src/middleware.ts
Area: Routing
Motivo: roleCache è Map in-memory, non condivisa tra worker
Impatto: MEDIO - Ruolo stale possibile
Urgenza: MEDIA
Azione: In produzione con più worker, ogni worker ha cache separata
```

### SEG-020: Protected Routes Hardcoded
```
🧠 RISK
File: src/middleware.ts:247
Area: Security
Motivo: const PROTECTED_ROUTES = ['/dashboard', '/home', '/api']
Impatto: BASSO - Funziona ma poco flessibile
Urgenza: BASSA
```

---

## 🔗 FILE CORRELATI

- `src/middleware.ts` - Middleware principale
- `src/lib/supabase/middleware.ts` - Client Supabase per middleware
- `src/app/**/layout.tsx` - Layout con guard secondari
- `next.config.ts` - Configurazione Next.js
