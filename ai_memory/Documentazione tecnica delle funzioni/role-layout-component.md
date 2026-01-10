# Componente: RoleLayout

## 📋 Descrizione

Componente layout wrapper per gestire layout diverso in base al ruolo utente. Mostra sidebar solo per staff, gestisce transizioni e animazioni di entrata.

## 📁 Percorso File

`src/components/shared/dashboard/role-layout.tsx`

## 🔧 Props

```typescript
interface RoleLayoutProps {
  role: 'atleta' | 'staff'
  children: React.ReactNode
}
```

### Dettaglio Props

- **`role`** ('atleta' | 'staff', required): Ruolo utente per determinare layout
- **`children`** (ReactNode, required): Contenuto da renderizzare

## 📦 Dipendenze

### React

- `React` (FC)

### Componenti Interni

- `Sidebar` da `./sidebar`
- `TransitionWrapper`, `FadeInWrapper` da `@/components/shared/ui/transition-wrapper`

## ⚙️ Funzionalità

### Core

1. **Layout Condizionale**: Mostra sidebar solo se `role === 'staff'`
2. **Transizioni**: Wrapper con transizioni e animazioni fade-in
3. **Layout Responsive**: Layout flex con sidebar e main content

### Funzionalità Avanzate

- **TransitionWrapper**: Wrapper principale per transizioni globali
- **FadeInWrapper**: Animazioni fade-in con delay per sidebar e content
- **Delay Progressivo**: Sidebar delay 0.1s, content delay 0.2s

### UI/UX

- Layout flex orizzontale
- Sidebar fissa a sinistra (solo staff)
- Main content flex-1 con overflow-auto
- Animazioni smooth per entrata

## 🎨 Struttura UI

```
TransitionWrapper
  └── div (flex min-h-screen)
      ├── Sidebar (se role === 'staff')
      │   └── FadeInWrapper (delay 0.1s)
      └── main (flex-1)
          └── FadeInWrapper (delay 0.2s)
              └── div (flex-1 overflow-auto)
                  └── {children}
```

## 📝 Esempi d'Uso

### Esempio Base

```tsx
import { RoleLayout } from '@/components/shared/dashboard/role-layout'

function DashboardPage() {
  return (
    <RoleLayout role="staff">
      <div>Contenuto dashboard</div>
    </RoleLayout>
  )
}
```

## 🔍 Note Tecniche

### Layout Condizionale

- Sidebar mostrata solo se `role === 'staff'`
- Atleti non vedono sidebar (layout diverso)

### Animazioni

- **Sidebar**: FadeInWrapper con delay 0.1s
- **Content**: FadeInWrapper con delay 0.2s
- Delay progressivo per effetto cascata

### Responsive

- Layout flex si adatta automaticamente
- Main content con overflow-auto per scroll
- Min-height screen per full height

### Limitazioni

- Solo 2 ruoli supportati
- Sidebar sempre a sinistra (non configurabile)
- Transizioni gestite da componenti wrapper esterni

## ✅ Stato Componente

- ✅ **Completato**: Componente funzionante e utilizzato in produzione
- ✅ **Testato**: Integrato nei test E2E
- ✅ **Documentato**: Documentazione completa
