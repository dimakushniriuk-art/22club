# Utility: Haptics

## 📋 Descrizione

Utility per haptic feedback (vibrazione) su dispositivi mobili. Supporta diversi pattern di vibrazione per feedback utente, verifica supporto API.

## 📁 Percorso File

`src/lib/haptics.ts`

## 📦 Dipendenze

- Nessuna dipendenza esterna

## ⚙️ Funzionalità

### Tipi Esportati

- `HapticType`: 'light' | 'medium' | 'heavy' | 'success' | 'error' | 'warning'

### Pattern Vibrazione

- `light`: [10ms]
- `medium`: [20, 10, 20]ms
- `heavy`: [30, 20, 30]ms
- `success`: [10, 5, 10]ms
- `error`: [50, 25, 50]ms
- `warning`: [30, 10, 30]ms

### Funzioni Principali

1. **`triggerHaptic(type)`**: Triggera haptic feedback
   - Verifica supporto navigator.vibrate
   - Esegue pattern vibrazione

2. **`haptics`**: Oggetto con funzioni di convenienza
   - `success()`, `error()`, `warning()`, `light()`, `medium()`, `heavy()`

3. **`useHaptics()`**: Hook React (opzionale)
   - Ritorna oggetto haptics

4. **`isHapticSupported()`**: Verifica supporto
   - Controlla navigator.vibrate disponibile

5. **`requestHapticPermission()`**: Richiede permessi
   - Test con vibrazione breve (1ms)

## 🔍 Note Tecniche

- Usa Web Vibration API (navigator.vibrate)
- Fallback silenzioso se non supportato
- Pattern array: [durata1, pausa, durata2, ...]

## ✅ Stato Utility

- ✅ **Completato**: Utility funzionante e utilizzata in produzione
