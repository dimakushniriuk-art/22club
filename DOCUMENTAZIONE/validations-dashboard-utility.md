# Utility: Validations Dashboard

## 📋 Descrizione

Utility di validazione Zod per dashboard. Definisce schemi per validazione query params dashboard, response appointments e KPI stats.

## 📁 Percorso File

`src/lib/validations/dashboard.ts`

## 📦 Dipendenze

- `zod` (`z`)

## ⚙️ Funzionalità

### Schemi Esportati

1. **`DashboardQuerySchema`**: Schema query params dashboard
   - `limit` (coerce number, 1-100, default 10)
   - `offset` (coerce number, >= 0, default 0)

2. **`AppointmentSchema`**: Schema singolo appuntamento response
   - `id` (UUID), `date`, `time`, `athlete_name` (min 1), `type` (min 1)

3. **`AppointmentsResponseSchema`**: Schema array appuntamenti
   - Array di `AppointmentSchema`

4. **`KPIStatsSchema`**: Schema KPI stats
   - `active_clients` (int >= 0)
   - `scheduled_sessions` (int >= 0)
   - `expiring_documents` (int >= 0)
   - `monthly_revenue` (number >= 0)

### Tipi TypeScript Esportati

- `DashboardQuery`
- `Appointment`
- `KPIStats`

## 🔍 Note Tecniche

- Usa `z.coerce.number()` per query params (conversione automatica string -> number)
- Limit max: 100
- Tutti i numeri sono non-negativi

## ✅ Stato Utility

- ✅ **Completato**: Utility funzionante e utilizzata in produzione
