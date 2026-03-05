# Componente: Sidebar (Dashboard)

## 📋 Descrizione

Componente sidebar di navigazione per dashboard staff. Gestisce navigazione per ruolo (atleta/staff), stato collapsed/expanded, logout e integrazione con autenticazione.

## 📁 Percorso File

`src/components/shared/dashboard/sidebar.tsx`

## 🔧 Props

```typescript
interface SidebarProps {
  role?: 'atleta' | 'staff'
}
```

### Dettaglio Props

- **`role`** ('atleta' | 'staff', optional): Ruolo utente per determinare menu di navigazione

## 📦 Dipendenze

### React Hooks

- `useState`, `useEffect`, `useRef` da `react`

### Next.js

- `Link` da `next/link`
- `usePathname`, `useRouter` da `next/navigation`

### UI Components

- `Home`, `Dumbbell`, `FileText`, `BarChart3`, `User`, `Calendar`, `Users`, `Settings`, `MessageSquare`, `Euro`, `LogOut`, `ChevronLeft`, `ChevronRight`, `Send`, `Shield` da `lucide-react`

### Hooks

- `useAuth` da `@/providers/auth-provider`

### Supabase

- `createClient` da `@/lib/supabase/client`

### Componenti Interni

- `Logo22Club` da `../logo-22club`

## ⚙️ Funzionalità

### Core

1. **Navigazione**: Menu di navigazione diverso per atleta e staff
2. **Collapse/Expand**: Sidebar collassabile con stato persistente in localStorage
3. **Active Route**: Evidenzia route corrente basato su pathname
4. **Logout**: Gestisce logout con redirect

### Menu Navigazione

**Atleta**:

- Home, Allenamenti, Appuntamenti, Documenti, Pagamenti, Statistiche, Profilo

**Staff**:

- Dashboard, Clienti, Schede, Appuntamenti, Calendario, Esercizi, Abbonamenti, Chat, Comunicazioni, Impostazioni

### Funzionalità Avanzate

- **Persistenza Stato**: Salva stato collapsed in localStorage
- **SSR-Safe**: Gestisce localStorage in modo sicuro per SSR
- **Active Indicator**: Evidenzia link attivo con stile teal
- **Responsive**: Si adatta a schermi piccoli

### UI/UX

- Sidebar fissa a sinistra
- Logo in alto
- Menu items con icone
- Pulsante collapse/expand
- Pulsante logout in basso
- Transizioni smooth per collapse

## 🎨 Struttura UI

```
aside (sidebar)
  ├── Header
  │   └── Logo22Club
  ├── Nav
  │   └── ul
  │       └── li (per ogni item)
  │           └── Link
  │               ├── Icona
  │               └── Label (se !collapsed)
  ├── Toggle Button (collapse/expand)
  └── Logout Button
```

## 📝 Esempi d'Uso

### Esempio Base

```tsx
import { Sidebar } from '@/components/shared/dashboard/sidebar'

function DashboardLayout() {
  return (
    <div className="flex">
      <Sidebar role="staff" />
      <main>{children}</main>
    </div>
  )
}
```

## 🔍 Note Tecniche

### Persistenza Stato

- Salva `sidebar-collapsed` in localStorage
- Legge stato iniziale in modo SSR-safe
- Aggiorna localStorage quando cambia stato

### Active Route

- Usa `usePathname()` per ottenere route corrente
- Confronta con `item.href` per determinare active
- Match esatto o parziale (gestito internamente)

### Logout

- Chiama `supabase.auth.signOut()`
- Redirect a `/login` dopo logout
- Gestisce errori con console.error

### Limitazioni

- Menu hardcoded (non configurabile)
- Solo 2 ruoli supportati (atleta, staff)
- Non gestisce permessi granulari

## ✅ Stato Componente

- ✅ **Completato**: Componente funzionante e utilizzato in produzione
- ✅ **Testato**: Integrato nei test E2E
- ✅ **Documentato**: Documentazione completa
