# Utility: Recurrence Utils

## 📋 Descrizione

Utility per gestione ricorrenze appuntamenti. Serializza/deserializza configurazione ricorrenza, genera appuntamenti ricorrenti, gestisce tipi ricorrenza (daily, weekly, monthly).

## 📁 Percorso File

`src/lib/recurrence-utils.ts`

## 📦 Dipendenze

- Nessuna dipendenza esterna

## ⚙️ Funzionalità

### Tipi Esportati

- `RecurrenceType`: 'none' | 'daily' | 'weekly' | 'monthly'
- `RecurrenceConfig`: Configurazione ricorrenza (type, interval?, endDate?, count?, daysOfWeek?)

### Funzioni Principali

1. **`serializeRecurrence(config)`**: Serializza configurazione in JSON string
   - Per database (recurrence_rule column)
   - Ritorna null se type === 'none'

2. **`deserializeRecurrence(recurrenceRule)`**: Deserializza JSON string
   - Da database a RecurrenceConfig
   - Default: { type: 'none' } se null o errore

3. **`generateRecurringAppointments(...)`**: Genera appuntamenti ricorrenti
   - Genera serie appuntamenti in base a configurazione
   - Supporta daily, weekly, monthly
   - Gestisce endDate e count

## 🔍 Note Tecniche

- Serializzazione JSON per storage database
- Supporta interval (ogni N giorni/settimane/mesi)
- Supporta daysOfWeek per weekly (0=domenica, 1=lunedì, ...)

## ✅ Stato Utility

- ✅ **Completato**: Utility funzionante e utilizzata in produzione
