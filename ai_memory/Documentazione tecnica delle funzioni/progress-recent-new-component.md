# Componente: ProgressRecent (Nuova Versione)

## 📋 Descrizione

Versione alternativa/semplificata del componente `ProgressRecent`. Stessa funzionalità ma con design leggermente diverso (usa `BarChartIcon` invece di `useIcon` generico).

## 📁 Percorso File

`src/components/athlete/progress-recent-new.tsx`

## 🔧 Props

Nessuna prop (componente self-contained che usa hook interni)

## 📦 Dipendenze

### React Hooks

- `useAuth` da `@/providers/auth-provider`
- `useProgressAnalytics` da `@/hooks/use-progress-analytics`

### UI Components

- `Card`, `CardContent`, `CardHeader`, `CardTitle` da `@/components/ui`
- `Button` da `@/components/ui`
- `ApiState`, `SectionSkeleton` da `@/components/ui/api-state`
- `BarChartIcon` da `@/components/ui/professional-icons`
- `Weight` da `lucide-react`

### Next.js

- `Link` da `next/link`

## ⚙️ Funzionalità

### Core

1. **Caricamento Dati**: Utilizza hook `useProgressAnalytics` per caricare dati progressi
2. **Statistiche Rapide**: Mostra numero misurazioni e peso medio attuale
3. **Empty State**: Mostra messaggio e pulsante quando non ci sono dati
4. **Link Dettagli**: Link alla pagina completa progressi

### Differenze da `progress-recent.tsx`

- Usa `BarChartIcon` invece di `useIcon` generico
- Design più semplice (variant="default" invece di gradiente)
- Pulsante "Vedi tutti i progressi" con variant="outline" invece di "primary"

### Stati Supportati

- **Loading**: Skeleton durante caricamento
- **Error**: Gestione errori con retry
- **Empty**: Messaggio quando non ci sono dati
- **With Data**: Visualizzazione statistiche

## 🎨 Struttura UI

```
ApiState (gestisce loading/error)
  └── Card (variant="default")
      ├── CardHeader
      │   └── CardTitle "Progressi Recenti"
      └── CardContent
          ├── Empty State (se !data)
          │   ├── BarChartIcon
          │   ├── Messaggio
          │   └── Button "Inizia a tracciare"
          └── With Data
              ├── Grid (2 colonne)
              │   ├── Misurazioni (numero)
              │   └── Peso medio (kg)
              └── Button "Vedi tutti i progressi" (outline)
```

## 📝 Esempi d'Uso

### Esempio Base

```tsx
import { ProgressRecent } from '@/components/athlete/progress-recent-new'

function MyComponent() {
  return <ProgressRecent />
}
```

## 🔍 Note Tecniche

### Hook useProgressAnalytics

- Stesso hook di `progress-recent.tsx`
- Carica dati progressi per l'utente corrente

### Design Differences

- Design più minimalista rispetto alla versione originale
- Meno effetti visivi (gradienti, backdrop blur)
- Focus su semplicità e leggibilità

### Limitazioni

- Non permette modifiche (solo visualizzazione)
- Non mostra grafici (solo statistiche aggregate)
- Link sempre a `/home/progressi` (non configurabile)

## ✅ Stato Componente

- ✅ **Completato**: Componente funzionante e utilizzato in produzione
- ✅ **Testato**: Integrato nei test E2E
- ✅ **Documentato**: Documentazione completa
