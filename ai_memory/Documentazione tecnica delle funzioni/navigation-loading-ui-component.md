# Componente: NavigationLoading (UI Base)

## 📋 Descrizione

Componente per loading state durante la navigazione. Supporta progress bar simulata, rilevamento navigazione lenta, suggerimenti utente, target path e varianti (full, spinner, sidebar). Utilizzato per feedback durante navigazione Next.js e transizioni pagina.

## 📁 Percorso File

`src/components/ui/navigation-loading.tsx`

## 🔧 Props

### NavigationLoading Props

```typescript
interface NavigationLoadingProps {
  isLoading: boolean
  loadingDuration: number
  isSlow?: boolean
  targetPath?: string
  className?: string
}
```

### Sub-components

- `NavigationSpinner` - Spinner minimale
- `SidebarNavigationLoading` - Loading nella sidebar

## 📦 Dipendenze

### React

- `useEffect`, `useState` da `react`
- `Loader2`, `Clock`, `AlertCircle` da `lucide-react`

### Components

- `Card`, `CardContent` da `@/components/ui`
- `Progress` da `@/components/ui`

## ⚙️ Funzionalità

### Core

1. **Loading Overlay**: Overlay fullscreen durante navigazione
2. **Progress Bar**: Progress bar simulata (0-90%)
3. **Slow Detection**: Rilevamento navigazione lenta
4. **Target Path**: Visualizzazione path di destinazione
5. **Duration Display**: Visualizzazione durata caricamento
6. **Suggestions**: Suggerimenti per navigazione lenta

### Funzionalità Avanzate

- **Progress Simulation**: Simulazione progress con interval
- **Slow Warning**: Alert quando navigazione lenta
- **Suggestions**: Suggerimenti quando durata > 5s
- **Variants**: 3 varianti (full, spinner, sidebar)
- **Backdrop Blur**: Backdrop con blur effect

### UI/UX

- Overlay fixed fullscreen
- Card centrata con spinner
- Progress bar con percentuale
- Messaggi informativi
- Suggerimenti per problemi
- Layout responsive

## 🎨 Struttura UI

```
NavigationLoading (fixed inset-0 z-50)
  └── Backdrop (bg-black/20 backdrop-blur-sm)
      └── Card (centrato)
          └── CardContent
              ├── Icon (Loader2, con AlertCircle se slow)
              ├── Title + Description
              ├── Progress Bar
              ├── Duration Info
              ├── Slow Warning (se slow)
              └── Suggestions (se slow && duration > 5s)
```

## 💡 Esempi d'Uso

```tsx
// NavigationLoading base
<NavigationLoading
  isLoading={isNavigating}
  loadingDuration={duration}
  targetPath="/dashboard"
/>

// NavigationLoading con slow detection
<NavigationLoading
  isLoading={isNavigating}
  loadingDuration={duration}
  isSlow={duration > 3000}
  targetPath="/dashboard"
/>

// NavigationSpinner minimale
<NavigationSpinner isLoading={isNavigating} />

// SidebarNavigationLoading
<SidebarNavigationLoading isLoading={isNavigating} />
```

## 📝 Note Tecniche

- Progress simulation con setInterval (0-90%, mai 100% fino completamento)
- Slow detection: isSlow prop per navigazione lenta
- AlertCircle overlay su spinner quando slow
- Suggestions mostrati quando duration > 5000ms
- Backdrop blur per overlay
- Z-index z-50 per overlay
- Varianti: full (centrato), spinner (top-right), sidebar (overlay sidebar)
- Layout responsive
- Stili con tema consistente

## ✅ Stato Componente

- ✅ **Completato**: 100%
- ✅ **Testato**: Funzionalità base testata
- ✅ **Documentato**: Questo file
- 📅 **Ultimo aggiornamento**: 2025-02-16
