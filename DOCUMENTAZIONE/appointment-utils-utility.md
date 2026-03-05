# Utility: Appointment Utils

## 📋 Descrizione

Utility per gestione appuntamenti. Verifica sovrapposizioni temporali per staff, query diretta senza RPC functions.

## 📁 Percorso File

`src/lib/appointment-utils.ts`

## 📦 Dipendenze

- `@/lib/supabase` (`createClient`)
- `@/types/appointment` (`Appointment`)

## ⚙️ Funzionalità

### Funzioni Principali

1. **`checkAppointmentOverlap(staffId, startsAt, endsAt, excludeAppointmentId?)`**: Verifica sovrapposizioni
   - Query appuntamenti che si sovrappongono con intervallo specificato
   - Logica: starts_at < endsAt AND ends_at > startsAt
   - Filtra: staff_id, cancelled_at IS NULL, status != 'annullato'
   - Esclude appointment corrente se excludeAppointmentId fornito
   - Ritorna { hasOverlap, conflictingAppointments }

## 🔍 Note Tecniche

- Query diretta senza RPC functions
- Logica sovrapposizione: due intervalli si sovrappongono se starts_at < new_ends_at AND ends_at > new_starts_at
- Gestione errori: ritorna hasOverlap: false se errore

## ✅ Stato Utility

- ✅ **Completato**: Utility funzionante e utilizzata in produzione
