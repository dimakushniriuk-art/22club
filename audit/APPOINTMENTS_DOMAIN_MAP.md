# Mappa dominio Appointments / Calendario

Analisi operativa (nessuna modifica codice). Riferimenti incrociati: `data_access_map_clean.txt`, `SUPABASE_USAGE_MAP.md`, `03_FEATURES_INDEX.md`.

---

## Legenda tipo accesso

| Tipo                | Significato                          |
| ------------------- | ------------------------------------ |
| **Supabase client** | `@/lib/supabase/client` dal browser  |
| **Supabase server** | `@/lib/supabase/server` in API Route |
| **HTTP API**        | `fetch` verso route Next             |
| **Nessuno**         | Solo UI / props / logica locale      |

---

## 1. Hook

| File                                                    | Tipo accesso               | Tabelle / RPC principali                                                                                                                        | Scopo                                                                                                                                                  |
| ------------------------------------------------------- | -------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `src/hooks/use-appointments.ts`                         | Supabase client + Realtime | `profiles`, `appointments` (+ join), RPC `check_appointment_overlap`                                                                            | Lista appuntamenti per **userId + role** (atleta: futuri propri; staff: `staff_id` OR `trainer_id`). CRUD + invalidazione React Query.                 |
| `src/hooks/appointments/use-appointments.ts`            | Supabase client            | `profiles`, `appointments`                                                                                                                      | **Staff dashboard** `/dashboard/appuntamenti`: lista per `staff_id`, atleti `role=athlete`, CRUD semplice, `addDebitFromAppointment` al completamento. |
| `src/hooks/calendar/use-calendar-page.ts`               | Supabase client + HTTP     | `profiles`, `appointments`, `lesson_counters`, `calendar_blocks`, `staff_atleti`, `appointment_cancellations`, `notifications`, `credit_ledger` | Calendario staff: fetch aggregato (miei + Free Pass org + collaboratori), CRUD avanzato, overlap inline, promemoria/notify via API.                    |
| `src/hooks/calendar/use-athlete-calendar-page.ts`       | Supabase client            | `profiles`, `appointments`, `staff_calendar_settings`, RPC `get_my_trainer_profile`                                                             | Calendario atleta: lista via RLS, prenotazione su slot liberi, update/cancel/delete limitati.                                                          |
| `src/hooks/calendar/use-staff-calendar-settings.ts`     | Supabase client            | `profiles`, `staff_calendar_settings`                                                                                                           | Impostazioni calendario staff (non lettura massiva `appointments`).                                                                                    |
| `src/hooks/calendar/use-birthdays.ts`                   | Supabase client            | `profiles`                                                                                                                                      | Compleanni (correlato UI calendario, **non** `appointments`).                                                                                          |
| `src/hooks/calendar/use-calendar-keyboard-shortcuts.ts` | Nessuno                    | —                                                                                                                                               | Scorciatoie UI.                                                                                                                                        |
| `src/hooks/calendar/use-calendar-page-guard.ts`         | Nessuno / guard            | —                                                                                                                                               | Accesso pagina impostazioni.                                                                                                                           |

---

## 2. API Routes (dominio calendario / dashboard)

| File                                                      | Tipo accesso    | Scopo                                                                                                                                   |
| --------------------------------------------------------- | --------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| `src/app/api/dashboard/appointments/route.ts`             | Supabase server | GET: appuntamenti **oggi** per `staff_id` sessione, join atleta, filtri status/ora lato server.                                         |
| `src/app/api/calendar/notify-appointment-change/route.ts` | Supabase server | POST: lettura `appointments` + `profiles` + `staff_calendar_settings`, invio email modifica/cancel/delete.                              |
| `src/app/api/calendar/send-appointment-reminder/route.ts` | Supabase server | POST: batch `appointments`, `profiles`, `staff_calendar_settings`, `lesson_counters`, `appointments` (completati), `payments` fallback. |

---

## 3. Lib

| File                           | Tipo accesso                     | Scopo                                                                                                                                        |
| ------------------------------ | -------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/lib/appointment-utils.ts` | Supabase client (`createClient`) | `checkAppointmentOverlap` query diretta su `appointments`; funzioni pure `canCancel`, `canModify`, `getAppointmentStatus`, format date/time. |

---

## 4. Componenti `src/components/appointments/**`

| File                             | Tipo accesso     | Scopo                                                                             |
| -------------------------------- | ---------------- | --------------------------------------------------------------------------------- |
| `appointments-list.tsx`          | Props            | Lista da hook padre.                                                              |
| `appointments-header.tsx`        | Props            | Header.                                                                           |
| `appointments-stats.tsx`         | Props            | Statistiche da dati passati.                                                      |
| `appointment-item.tsx`           | Props / callback | Azioni su singolo item.                                                           |
| `appointment-validation.tsx`     | Locale           | Validazione form.                                                                 |
| `appointment-conflict-alert.tsx` | Locale           | Alert conflitto.                                                                  |
| `recurrence-selector.tsx`        | Locale           | UI ripetizione.                                                                   |
| `email-to-athlete-modal.tsx`     | HTTP API         | `fetch` → `/api/communications/send-email-to-athlete` (non tabella appointments). |
| `index.ts`                       | —                | Re-export.                                                                        |

---

## 5. Componenti `src/components/calendar/**`

| File                      | Tipo accesso               | Scopo             |
| ------------------------- | -------------------------- | ----------------- |
| `calendar-view.tsx`       | `useStaffCalendarSettings` | Vista calendario. |
| `mini-calendar.tsx`       | Props                      | Mini calendario.  |
| `appointment-detail.tsx`  | Props                      | Dettaglio evento. |
| `appointment-popover.tsx` | `useStaffCalendarSettings` | Popover.          |
| `appointments-table.tsx`  | Props                      | Tabella.          |
| `appointment-form.tsx`    | Props                      | Form.             |
| `index.ts`                | —                          | Re-export.        |

---

## 6. Flussi principali (end-to-end)

| Flusso                           | Entry                                    | Persistenza       | Effetti collaterali                                                                            |
| -------------------------------- | ---------------------------------------- | ----------------- | ---------------------------------------------------------------------------------------------- |
| Lista atleta (home appuntamenti) | `use-appointments.ts` (root)             | `appointments`    | Realtime → invalidate query.                                                                   |
| Lista staff tabellare            | `hooks/appointments/use-appointments.ts` | `appointments`    | Refetch manuale.                                                                               |
| Calendario staff                 | `use-calendar-page.ts`                   | `appointments`, … | Dopo create → `send-appointment-reminder`; modify/cancel/delete → `notify-appointment-change`. |
| Calendario atleta                | `use-athlete-calendar-page.ts`           | `appointments`    | Nessuna email API dal codice analizzato.                                                       |
| Widget dashboard “oggi”          | `GET /api/dashboard/appointments`        | `appointments`    | Solo lettura.                                                                                  |

---

## 7. Perimetro esteso (fuori cartelle richieste, citato in audit)

Accesso a `appointments` anche in: `dashboard/page.tsx`, `upcoming-appointments-client.tsx`, `agenda-client.tsx`, `appointment-modal.tsx`, `reschedule-appointment-modal.tsx`, pagine nutrizionista/massaggiatore, admin API, profilo atleta. Non duplicati nel dettaglio qui: vedi `data_access_map_clean.txt`.

---

## 8. Source of truth (dati)

| Livello                   | Verità                                                                   |
| ------------------------- | ------------------------------------------------------------------------ |
| **Persistenza**           | Tabella Postgres `appointments` (+ RLS).                                 |
| **Lettura unificata app** | **Assente**: più query divergenti per scope/filtri/campi.                |
| **Sovrapposizione slot**  | Tre implementazioni (RPC, query inline calendario, `appointment-utils`). |

Proposta consolidata in `APPOINTMENTS_DUPLICATIONS.md` e batch in `APPOINTMENTS_NEXT_BATCHES.md`.
