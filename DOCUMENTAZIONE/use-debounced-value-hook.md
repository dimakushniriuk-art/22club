# 📚 Documentazione Tecnica: useDebouncedValue

**Percorso**: `src/hooks/use-debounced-value.ts`  
**Tipo Modulo**: React Hook (Debounce Hook, Client Component)  
**Stato Completamento**: ✅ 100%  
**Ultimo Aggiornamento**: 2025-02-02T00:00:00Z

---

## 📋 Panoramica

Hook per debounce di un valore. Utile per ricerche in tempo reale per evitare troppe chiamate API. Ritorna valore aggiornato solo dopo che il delay è trascorso senza cambiamenti.

---

## 🔧 Funzioni e Export

### 1. `useDebouncedValue`

**Classificazione**: React Hook, Debounce Hook, Client Component, Pure  
**Tipo**: `<T>(value: T, delay?: number) => T`

**Parametri**:

- `value`: `T` - Valore da debounciare
- `delay`: `number` - Ritardo in millisecondi (default: 300ms)

**Output**: Valore debounced (stesso tipo di `value`)

**Descrizione**: Hook per debounce valore con:

- Inizializza `debouncedValue` con `value` iniziale
- Aggiorna `debouncedValue` solo dopo `delay` ms senza cambiamenti
- Cleanup automatico timeout quando `value` cambia

---

## 🔄 Flusso Logico

### Aggiornamento Valore

1. **Valore Cambia**:
   - Crea timeout: `setTimeout(() => setDebouncedValue(value), delay)`

2. **Valore Cambia Prima del Delay**:
   - Cleanup timeout precedente: `clearTimeout(handler)`
   - Crea nuovo timeout

3. **Delay Trascorso**:
   - Aggiorna `debouncedValue` con nuovo `value`

---

## 📊 Dipendenze

**Dipende da**: React (`useState`, `useEffect`)

**Utilizzato da**: Componenti ricerca, input con debounce

---

## ⚠️ Note Tecniche

- **Default Delay**: 300ms (ottimale per ricerca in tempo reale)
- **Cleanup**: Cleanup automatico timeout quando `value` cambia

---

**Ultimo aggiornamento**: 2025-02-02T00:00:00Z
