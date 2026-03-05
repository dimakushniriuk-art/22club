# 📚 Documentazione Tecnica: useLoginProtection

**Percorso**: `src/hooks/use-login-protection.ts`  
**Tipo Modulo**: React Hook (Security Hook, Client Component)  
**Stato Completamento**: ✅ 100%  
**Ultimo Aggiornamento**: 2025-02-02T00:00:00Z

---

## 📋 Panoramica

Hook per protezione login con rate limiting. Blocca login dopo MAX_ATTEMPTS tentativi falliti per LOCKOUT_DURATION. Usa localStorage per persistenza.

---

## 🔧 Funzioni e Export

### 1. `useLoginProtection`

**Classificazione**: React Hook, Security Hook, Client Component, Side-Effecting  
**Tipo**: `() => UseLoginProtectionReturn`

**Parametri**: Nessuno

**Output**: Oggetto con:

- **Stato**:
  - `isLocked`: `boolean` - True se account bloccato
  - `remainingTime`: `string` - Tempo rimanente formato "MM:SS"
  - `attempts`: `number` - Numero tentativi falliti
  - `maxAttempts`: `number` - Max tentativi (5)
- **Funzioni**:
  - `recordFailedAttempt()`: `() => void` - Registra tentativo fallito
  - `recordSuccessfulAttempt()`: `() => void` - Reset tentativi dopo login riuscito

**Descrizione**: Hook per protezione login con:

- Rate limiting: max 5 tentativi falliti
- Lockout: 10 minuti dopo 5 tentativi falliti
- Persistenza localStorage (sopravvive refresh)
- Countdown automatico tempo rimanente
- Reset automatico dopo lockout scaduto

---

## 🔄 Flusso Logico

### Inizializzazione

1. **Carica da localStorage**:
   - Legge `22club_login_attempts` da localStorage
   - Se `lockedUntil > now` → `isLocked = true`, calcola `remainingTime`
   - Se `lockedUntil <= now` → sblocca, rimuove localStorage

### Record Failed Attempt

1. Incrementa `count`
2. Aggiorna `lastAttempt = now`
3. Se `count >= MAX_ATTEMPTS` (5):
   - Imposta `lockedUntil = now + LOCKOUT_DURATION` (10 minuti)
   - `isLocked = true`
   - `remainingTime = LOCKOUT_DURATION / 1000` (secondi)
4. Salva in localStorage

### Record Successful Attempt

1. Rimuove localStorage
2. Reset stato: `isLocked = false`, `remainingTime = 0`, `attempts = 0`

### Countdown

1. Se `isLocked && remainingTime > 0`:
   - Interval ogni 1s: decrementa `remainingTime`
   - Se `remainingTime <= 1` → sblocca, rimuove localStorage

---

## 📊 Dipendenze

**Dipende da**: React (`useState`, `useEffect`)

**Utilizzato da**: Pagina login, componenti autenticazione

---

## ⚠️ Note Tecniche

- **MAX_ATTEMPTS**: 5 tentativi falliti
- **LOCKOUT_DURATION**: 10 minuti (600000ms)
- **LocalStorage**: Persistenza client-side (non server-side, può essere bypassato)
- **Format Time**: Formato "MM:SS" per `remainingTime`

---

**Ultimo aggiornamento**: 2025-02-02T00:00:00Z
