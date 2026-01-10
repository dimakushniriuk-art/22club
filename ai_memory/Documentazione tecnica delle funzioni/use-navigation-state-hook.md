# 📚 Documentazione Tecnica: useNavigationState

**Percorso**: `src/hooks/use-navigation-state.ts`  
**Tipo Modulo**: React Hook (Navigation State Hook, Client Component)  
**Stato Completamento**: ✅ 100%  
**Ultimo Aggiornamento**: 2025-02-02T00:00:00Z

---

## 📋 Panoramica

Hook per gestione stato navigazione e loading states. Traccia path corrente, path precedente, stato loading, e fornisce funzioni per navigazione con loading.

---

## 🔧 Funzioni e Export

### 1. `useNavigationState`

**Classificazione**: React Hook, Navigation State Hook, Client Component, Side-Effecting  
**Tipo**: `() => UseNavigationStateReturn`

**Parametri**: Nessuno (usa `usePathname` e `useRouter`)

**Output**: Oggetto con:

- **Stato**:
  - `isLoading`: `boolean` - Stato loading navigazione
  - `currentPath`: `string` - Path corrente
  - `previousPath`: `string | null` - Path precedente
  - `loadingStartTime`: `number | null` - Timestamp inizio loading
  - `pendingPath`: `string | null` - Path in attesa di navigazione
- **Funzioni**:
  - `startNavigation(targetPath)`: `(targetPath: string) => void` - Inizia navigazione con loading
  - `endNavigation()`: `() => void` - Termina loading
  - `navigateWithLoading(path)`: `(path: string) => void` - Naviga con loading automatico
  - `getLoadingDuration()`: `() => number` - Durata loading in ms
  - `isNavigationSlow()`: `() => boolean` - True se loading > 3s

**Descrizione**: Hook per gestione navigazione con:

- Tracking automatico path corrente/precedente
- Loading state con timeout sicurezza (10s max)
- Rilevamento navigazione lenta (> 3s)
- Integrazione Next.js router

---

## 🔄 Flusso Logico

### Inizializzazione

1. Legge `pathname` da `usePathname()`
2. Inizializza stato con path corrente

### Cambio Path

1. **Path Cambia**:
   - Se `isLoading` e path cambiato → termina loading
   - Aggiorna `currentPath` e `previousPath`

### Start Navigation

1. Imposta `isLoading = true`, `loadingStartTime = Date.now()`, `pendingPath = targetPath`
2. Timeout sicurezza: dopo 10s → termina loading automaticamente

### Navigate With Loading

1. Chiama `startNavigation(path)`
2. Chiama `router.push(path)`

### End Navigation

1. Imposta `isLoading = false`, `loadingStartTime = null`

---

## 📊 Dipendenze

**Dipende da**: React (`useState`, `useCallback`, `useEffect`), Next.js (`usePathname`, `useRouter`)

**Utilizzato da**: Layout, componenti navigazione

---

## ⚠️ Note Tecniche

- **Timeout Sicurezza**: 10s max loading per evitare loading infiniti
- **Slow Navigation**: Considera lento se > 3s (per UX feedback)
- **Path Tracking**: Evita loop infiniti controllando se path già corrente

---

**Ultimo aggiornamento**: 2025-02-02T00:00:00Z
