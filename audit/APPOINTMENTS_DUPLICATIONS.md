# Duplicazioni e conflitti — dominio Appointments

---

## 1. Duplicazioni (stesso concetto, implementazioni multiple)

### 1.1 Due hook `useAppointments` (nome identico, API diversa)

| Path | Firma | Consumatori tipici |
|------|-------|-------------------|
| `src/hooks/use-appointments.ts` | `useAppointments({ userId, role })` | Home atleta `/home/appuntamenti` |
| `src/hooks/appointments/use-appointments.ts` | `useAppointments()` | Dashboard staff `/dashboard/appuntamenti` |

**Effetto:** stesso nome simbolo, comportamento e cache (React Query vs useState) incomparabili.

---

### 1.2 Fetch lista appuntamenti staff (tre “mondi”)

1. **`use-calendar-page.ts`**: `staff_id` + merge Free Pass (`org_id` + `is_open_booking_day`) + collaboratori; campi estesi (`color`, `is_open_booking_day`, …).
2. **`hooks/appointments/use-appointments.ts`**: solo `eq('staff_id', staffId)`, select ridotto, N+1 su `profiles` per nome atleta.
3. **`GET /api/dashboard/appointments`**: solo **giorno corrente**, filtri aggiuntivi su status e “ora passata > 1h”.

Stesso dominio dati, shape e filtri diversi.

---

### 1.3 Risoluzione profilo utente → id lavoro

- Root `use-appointments.ts`: `getProfileId` con cache (id vs `user_id`).
- API dashboard: solo `profiles.user_id = session.user.id`.
- Altri hook: `auth.getUser()` + `profiles.user_id`.

Logica equivalente ma non centralizzata.

---

### 1.4 Controllo sovrapposizione (tre vie)

| Implementazione | Meccanismo | Note |
|-----------------|------------|------|
| `use-appointments.ts` (root) | RPC `check_appointment_overlap` | Usato dal hook React Query |
| `use-calendar-page.ts` | Funzione locale `checkAppointmentOverlap`: select su `appointments` | Regole extra: `allenamento_doppio`, collaboratori |
| `appointment-utils.ts` | Query `appointments` + filtri `cancelled_at`, `status != annullato` | Non allineata 1:1 alla logica calendario |

`appointment-utils.checkAppointmentOverlap` è **commentato** nei punti che un tempo lo usavano; rischio drift tra RPC e query inline.

---

### 1.5 Lista atleti per form appuntamento

- **`use-calendar-page.ts`**: trainer/admin = tutti atleti attivi org; nutrizionista/massaggiatore = `staff_atleti`.
- **`hooks/appointments/use-appointments.ts`**: `profiles` con `role = 'athlete'` (senza ramo collaboratori).

Stesso form concettuale, popolamento diverso.

---

### 1.6 Completamento seduta + crediti

- **`use-calendar-page.ts`**: `status = completato` + messaggio success (scalata descritta in UI).
- **`hooks/appointments/use-appointments.ts`**: `completato` + **`addDebitFromAppointment`** + invalidazione cache locale abbonamenti.

Due percorsi di business non equivalenti.

---

### 1.7 Cancellazione

- **Staff calendario** (`use-calendar-page`): `appointment_cancellations`, opzione debito, `notify-appointment-change`.
- **Staff tabella** (`hooks/appointments`): solo `cancelled_at` + `annullato`.
- **Atleta** (`use-athlete-calendar-page`): stesso pattern tabellare semplice, senza tabella cancellazioni né email.

---

### 1.8 Label tipo appuntamento (custom types)

Duplicata in `notify-appointment-change` e `send-appointment-reminder` (`getTypeLabel` + `APPOINTMENT_TYPE_LABELS`).

---

## 2. Conflitti hook / lib / API

| Area | Conflitto |
|------|-----------|
| **Nome hook** | Import errato possibile tra `@/hooks/use-appointments` e `@/hooks/appointments/use-appointments`. |
| **Atleta: lista** | Root hook filtra **futuri** + `cancelled_at` null; calendario atleta affida molto a **RLS** (set potenzialmente più ampio). |
| **Overlap** | RPC vs query client vs lib: esiti diversi se DB e client applicano filtri diversi (es. `cancelled_at`, tipi doppio). |
| **Completamento** | Solo un ramo esegue ledger debit; incoerenza crediti tra pagina appuntamenti staff e calendario. |
| **React Query** | Root hook invalida `queryKeys.appointments.all`; calendario e hook staff **non** usano quella cache → UI può divergere dopo mutazioni altrove. |
| **API reminder** | Conteggio lezioni (`lesson_counters` + `appointments` completati + `payments`): logica duplicata concettualmente con altre parti dashboard. |

---

## 3. Proposta source of truth (dominio applicativo)

1. **Dati:** resta **Supabase `appointments`** (e tabelle correlate: `appointment_cancellations`, `credit_ledger`, …).
2. **Lettura lato client:** definire un **unico layer** (es. funzioni + React Query con chiavi per scenario: `staffCalendar`, `staffTable`, `athleteList`, `dashboardToday`) che incapsula select/filtri; evitare nuove query ad-hoc nelle pagine.
3. **Regole business:** una sola implementazione per **overlap** (preferenza: RPC o server-side condivisa) e per **completamento/cancellazione** (allineare ledger + email).
4. **Hook naming:** rinominare o unificare i due `useAppointments` per eliminare ambiguità (batch futuro).

---

*Riferimento indice feature:* `docs/indexes/03_FEATURES_INDEX.md` — Calendario → `dashboard/calendario/page.tsx`, appointments, calendar notify.
