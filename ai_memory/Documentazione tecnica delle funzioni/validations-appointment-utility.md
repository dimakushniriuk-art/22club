# Utility: Validations Appointment

## 📋 Descrizione

Utility di validazione Zod per appuntamenti. Definisce schemi per validazione dati appuntamento (create, update) con validazione date, tipo, status, note, location.

## 📁 Percorso File

`src/lib/validations/appointment.ts`

## 📦 Dipendenze

- `zod` (`z`)

## ⚙️ Funzionalità

### Schemi Esportati

1. **`createAppointmentSchema`**: Schema creazione appuntamento
   - `athlete_id` (obbligatorio UUID)
   - `staff_id` (obbligatorio UUID)
   - `type` (enum: allenamento, cardio, check, consulenza, prima_visita, riunione, massaggio, nutrizionista)
   - `starts_at`, `ends_at` (datetime, con refine: ends_at > starts_at)
   - `status` (opzionale, default 'attivo': attivo, completato, annullato, in_corso, cancelled)
   - `notes` (max 1000 caratteri, opzionale)
   - `location` (max 255 caratteri, opzionale)
   - `org_id` (opzionale, default 'default-org')

2. **`updateAppointmentSchema`**: Schema aggiornamento appuntamento
   - Tutti i campi opzionali tranne `id` (obbligatorio UUID)
   - Stessa validazione date se entrambe presenti

### Tipi TypeScript Esportati

- `CreateAppointmentData`
- `UpdateAppointmentData`

## 🔍 Note Tecniche

- Validazione date: `ends_at` deve essere > `starts_at` (refine)
- Note max: 1000 caratteri
- Location max: 255 caratteri
- Tipi supportati: 8 tipi (inclusi prima_visita, riunione, massaggio, nutrizionista)

## ✅ Stato Utility

- ✅ **Completato**: Utility funzionante e utilizzata in produzione
