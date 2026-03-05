# 📚 Documentazione Tecnica: useProgressReminders

**Percorso**: `src/hooks/use-progress-reminders.ts`  
**Tipo Modulo**: React Hook (Reminders Hook, Client Component)  
**Stato Completamento**: ✅ 100%  
**Ultimo Aggiornamento**: 2025-02-02T00:00:00Z

---

## 📋 Panoramica

Hook per promemoria progressi atleta. Controlla ultima misurazione e foto, e crea notifiche se necessario (7 giorni per misurazione, 14 giorni per foto).

---

## 🔧 Funzioni e Export

### 1. `useProgressReminders`

**Classificazione**: React Hook, Reminders Hook, Client Component, Side-Effecting  
**Tipo**: `(props: UseProgressRemindersProps) => UseProgressRemindersReturn`

**Parametri**:

- `props`: `UseProgressRemindersProps`
  - `userId?`: `string | null` - ID utente atleta
  - `role?`: `string | null` - Ruolo utente (solo 'atleta')

**Output**: Oggetto con:

- **Stato**:
  - `reminders`: `RemindersState` - Stato reminder
    - `needsMeasurement`: `boolean` - True se serve misurazione (>= 7 giorni)
    - `needsPhoto`: `boolean` - True se serve foto (>= 14 giorni)
    - `lastMeasurementDate`: `string | null` - Data ultima misurazione
    - `lastPhotoDate`: `string | null` - Data ultima foto
    - `daysSinceMeasurement`: `number | null` - Giorni dall'ultima misurazione
    - `daysSincePhoto`: `number | null` - Giorni dall'ultima foto
- **Funzioni**:
  - `checkReminders()`: `() => Promise<void>` - Controlla e aggiorna reminder
  - `markReminderAsSent(type)`: `(type: 'measurement' | 'photo') => Promise<void>` - Marca reminder come inviato

**Descrizione**: Hook per promemoria progressi con:

- Controllo automatico ogni ora
- Fetch ultima misurazione (`progress_logs`) e foto (`progress_photos`)
- Calcolo giorni trascorsi
- Creazione notifiche automatiche se necessario
- Tracking reminder inviati (localStorage, TODO: database)

---

## 🔄 Flusso Logico

### Check Reminders

1. **Verifica Prerequisiti**:
   - Se `userId` null o `role !== 'atleta'` → return

2. **Fetch Ultima Misurazione**:
   - SELECT `progress_logs` WHERE `athlete_id = userId` ORDER BY `date DESC` LIMIT 1

3. **Fetch Ultima Foto**:
   - SELECT `progress_photos` WHERE `athlete_id = userId` ORDER BY `date DESC` LIMIT 1

4. **Calcolo Giorni**:
   - `daysSinceMeasurement`: `Math.floor((now - lastMeasurementDate) / (1000 * 60 * 60 * 24))`
   - `daysSincePhoto`: stesso calcolo

5. **Determina Reminder**:
   - `needsMeasurement = daysSinceMeasurement >= 7`
   - `needsPhoto = daysSincePhoto >= 14`

6. **Crea Notifiche**:
   - Se `needsMeasurement` → INSERT notifica: "È ora di aggiornare i tuoi progressi 💪"
   - Se `needsPhoto` → INSERT notifica: "Carica nuove foto per vedere il tuo cambiamento 📸"

7. **Aggiorna Stato**:
   - Aggiorna `reminders` state con tutti i dati

### Mark Reminder As Sent

1. Salva in localStorage: `reminder_sent_${userId}_${type} = now` (TODO: database)

### Auto-Check

1. Controlla al mount
2. Controlla ogni ora: `setInterval(checkReminders, 60 * 60 * 1000)`

---

## 📊 Dipendenze

**Dipende da**: React (`useState`, `useEffect`, `useCallback`), `createClient` (Supabase)

**Utilizzato da**: Layout atleta, componenti progressi

---

## ⚠️ Note Tecniche

- **Solo Atleti**: Funziona solo per `role === 'atleta'`
- **Threshold**: 7 giorni per misurazione, 14 giorni per foto
- **LocalStorage Tracking**: Usa localStorage per evitare notifiche duplicate (TODO: database `reminder_tracking`)
- **Interval**: Controlla ogni ora (non troppo frequente)

---

**Ultimo aggiornamento**: 2025-02-02T00:00:00Z
