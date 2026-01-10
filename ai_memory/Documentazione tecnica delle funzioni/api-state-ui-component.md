# Componente: ApiState (UI Base)

## 📋 Descrizione

Componente wrapper per gestire stati API (loading, error, success). Supporta loading skeleton, error display, retry button, skeleton custom e sub-componenti (SectionSkeleton, OfflineError). Utilizzato per gestione stati API, loading states e error handling.

## 📁 Percorso File

`src/components/ui/api-state.tsx`

## 🔧 Props

### ApiState Props

```typescript
interface ApiStateProps {
  loading?: boolean
  error?: string | null
  onRetry?: () => void
  children: React.ReactNode
  skeleton?: React.ReactNode
}
```

### Sub-components

- `SectionSkeleton` - Skeleton per sezioni
- `OfflineError` - Errore offline

## 📦 Dipendenze

### Components

- `Card`, `CardContent` da `@/components/ui`
- `Button` da `@/components/ui`
- `Skeleton` da `@/components/ui`
- `AlertCircle`, `RefreshCw`, `WifiOff` da `lucide-react`

## ⚙️ Funzionalità

### Core

1. **Loading State**: Skeleton predefinito o custom
2. **Error State**: Error display con retry
3. **Success State**: Render children quando success
4. **Custom Skeleton**: Skeleton custom opzionale
5. **Retry Button**: Bottone riprova per errori

### Funzionalità Avanzate

- **Conditional Rendering**: Render condizionale basato su stato
- **Default Skeleton**: Skeleton predefinito se non fornito
- **Error Variants**: Varianti errore (yellow per warning)
- **Offline Detection**: Componente specifico per offline
- **Section Skeleton**: Skeleton specializzato per sezioni

### UI/UX

- Skeleton durante loading
- Error card durante errori
- Children durante success
- Retry button per errori
- Layout responsive

## 🎨 Struttura UI

```
ApiState
  ├── Se loading
  │   ├── Se skeleton custom
  │   │   └── Custom Skeleton
  │   └── Se !skeleton custom
  │       └── Default Skeleton (Card con Skeleton[])
  ├── Se error
  │   └── Error Card
  │       ├── Icon AlertCircle
  │       ├── Title + Message
  │       └── Retry Button (se onRetry)
  └── Se !loading && !error
      └── Children
```

## 💡 Esempi d'Uso

```tsx
// ApiState base
<ApiState
  loading={isLoading}
  error={error}
  onRetry={refetch}
>
  <DataDisplay data={data} />
</ApiState>

// ApiState con skeleton custom
<ApiState
  loading={isLoading}
  error={error}
  skeleton={<CustomSkeleton />}
>
  <Content />
</ApiState>

// SectionSkeleton
<SectionSkeleton />

// OfflineError
<OfflineError onRetry={refetch} />
```

## 📝 Note Tecniche

- Render condizionale: loading → skeleton, error → error card, success → children
- Default skeleton: Card con 3 Skeleton (h-4 w-3/4, h-4 w-1/2, h-24 w-full)
- Custom skeleton: supporto per skeleton custom
- Error card: border-yellow-200 bg-yellow-50 per warning
- Retry button: RefreshCw icon con onClick onRetry
- OfflineError: componente specifico per errori offline
- SectionSkeleton: skeleton specializzato per sezioni
- Layout responsive
- Stili con tema consistente

## ✅ Stato Componente

- ✅ **Completato**: 100%
- ✅ **Testato**: Funzionalità base testata
- ✅ **Documentato**: Questo file
- 📅 **Ultimo aggiornamento**: 2025-02-16
