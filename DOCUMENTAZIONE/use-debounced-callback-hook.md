# 📚 Documentazione Tecnica: useDebouncedCallback

**Percorso**: `src/hooks/use-debounced-callback.ts`  
**Tipo Modulo**: React Hook (Debounce Hook, Client Component)  
**Stato Completamento**: ✅ 100%  
**Ultimo Aggiornamento**: 2025-02-02T00:00:00Z

---

## 📋 Panoramica

Hook per creare callback debounced. Ritarda l'esecuzione del callback fino a quando non passa il delay specificato senza nuove chiamate.

---

## 🔧 Funzioni e Export

### 1. `useDebouncedCallback`

**Classificazione**: React Hook, Debounce Hook, Client Component, Pure  
**Tipo**: `<T extends AnyFunction>(callback: T, delay: number) => (...args: Parameters<T>) => void`

**Parametri**:

- `callback`: `T` - Funzione da debounciare
- `delay`: `number` - Ritardo in millisecondi

**Output**: Callback debounced con stessa signature di `callback`

**Descrizione**: Hook per debounce callback con:

- Mantiene riferimento callback aggiornato (usa `useRef`)
- Cancella timeout precedente se callback chiamato prima del delay
- Cleanup automatico timeout al unmount

---

## 🔄 Flusso Logico

### Esecuzione Callback

1. **Chiamata Callback Debounced**:
   - Se esiste timeout precedente → `clearTimeout(timeoutRef.current)`
   - Crea nuovo timeout: `setTimeout(() => callbackRef.current(...args), delay)`

2. **Aggiornamento Callback**:
   - `callbackRef.current = callback` (aggiornato quando cambia)

3. **Cleanup**:
   - Al unmount → `clearTimeout(timeoutRef.current)`

---

## 📊 Dipendenze

**Dipende da**: React (`useCallback`, `useEffect`, `useRef`)

**Utilizzato da**: Componenti che necessitano debounce (ricerca, input, etc.)

---

## ⚠️ Note Tecniche

- **Ref Pattern**: Usa `useRef` per mantenere callback aggiornato senza ricreare timeout
- **Cleanup**: Cleanup automatico timeout al unmount per evitare memory leaks

---

**Ultimo aggiornamento**: 2025-02-02T00:00:00Z
