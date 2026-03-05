# Componente: ProgressRecent

## 📋 Descrizione

Componente per visualizzare i progressi recenti dell'atleta. Mostra statistiche rapide (numero misurazioni, peso medio) con link alla pagina completa dei progressi.

## 📁 Percorso File

`src/components/athlete/progress-recent.tsx`

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
- `useIcon` da `@/components/ui/professional-icons`
- `Weight` da `lucide-react`

### Next.js

- `Link` da `next/link`

## ⚙️ Funzionalità

### Core

1. **Caricamento Dati**: Utilizza hook `useProgressAnalytics` per caricare dati progressi
2. **Statistiche Rapide**: Mostra numero misurazioni e peso medio attuale
3. **Empty State**: Mostra messaggio e pulsante quando non ci sono dati
4. **Link Dettagli**: Link alla pagina completa progressi

### Stati Supportati

- **Loading**: Skeleton durante caricamento
- **Error**: Gestione errori con retry
- **Empty**: Messaggio quando non ci sono dati
- **With Data**: Visualizzazione statistiche

### UI/UX

- Card con gradiente e backdrop blur
- Griglia 2 colonne per statistiche
- Pulsante con link alla pagina progressi
- Empty state con icona e messaggio

## 🎨 Struttura UI

```
ApiState (gestisce loading/error)
  └── Card
      ├── CardHeader
      │   └── CardTitle "Progressi Recenti"
      └── CardContent
          ├── Empty State (se !data)
          │   ├── Icona
          │   ├── Messaggio
          │   └── Button "Inizia a tracciare"
          └── With Data
              ├── Grid (2 colonne)
              │   ├── Misurazioni (numero)
              │   └── Peso medio (kg)
              └── Button "Vedi tutti i progressi"
```

## 📝 Esempi d'Uso

### Esempio Base

```tsx
import { ProgressRecent } from '@/components/athlete/progress-recent'

function MyComponent() {
  return <ProgressRecent />
}
```

## 🔍 Note Tecniche

### Hook useProgressAnalytics

- Carica dati progressi per l'utente corrente
- Restituisce `{ data, isLoading, error, refetch }`
- Dati includono: `ultimiProgressi`, `pesoAttuale`

### Formattazione Peso

- Mostra peso con 1 decimale: `pesoAttuale.toFixed(1)kg`
- Mostra "N/A" se peso non disponibile

### Limitazioni

- Non permette modifiche (solo visualizzazione)
- Non mostra grafici (solo statistiche aggregate)
- Link sempre a `/home/progressi` (non configurabile)

## ✅ Stato Componente

- ✅ **Completato**: Componente funzionante e utilizzato in produzione
- ✅ **Testato**: Integrato nei test E2E
- ✅ **Documentato**: Documentazione completa
