# Prossimo batch RLS — micro-step (solo pianificazione)

Scope: `appointment_cancellations` + `appointments`. Profili **fuori** da questo batch.

Riferimento baseline policy: `supabase-backups/schema.sql`. Stato **dopo** migration già predisposte:

- **v1** (`20260318143000_*`): rimossi UPDATE/DELETE quoted nut/mass + `staff_can_update_own_appointments`.
- **v2** (`20260318143100_*`): rimosso `appointments_delete_staff_or_admin`.

---

## Ordine consigliato (2–4 micro-step)

| Step  | Azione                                                                                                                                                | Rischio                                                       | Dipendenze                                                              | Se si sbaglia                                                                                                 |
| ----- | ----------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------- | ----------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| **1** | RLS su **`appointment_cancellations`** (drop `true`, nuove SELECT/INSERT)                                                                             | **Basso** (tabella isolata; niente impatto su `appointments`) | App che legge/scrive storico cancellazioni                              | Insert select su storico falliscono o 403; leak dati chiuso                                                   |
| **2** | **`appointments` INSERT atleta** (policy dedicata, vincoli stretti)                                                                                   | **Medio**                                                     | Flusso prenotazione atleta; validazione lato app                        | Slot vuoti riempiti male, doppie prenotazioni (mitigare con vincoli DB/trigger)                               |
| **3** | **`appointments` DELETE row owner** (`staff_id` / `trainer_id` = profilo corrente)                                                                    | **Medio-basso**                                               | v2 ha tolto delete per staff_id/marketing                               | Nut/mass/trainer non in ARRAY org non possono cancellare “propri” slot; step ripristina solo chi è owner riga |
| **4** | **SELECT open booking** (unificare o documentare convivenza `athlete_select_open_booking_slots` vs `authenticated_select_appointments_in_open_slots`) | **Alto**                                                      | Calendario, `get_my_trainer_profile()`, `slot_has_open_booking_for_rls` | Atleti/staff non vedono slot; leak cross-org se allargato troppo                                              |

---

## Test dopo ogni step

### Dopo step 1 (`appointment_cancellations`)

- [ ] Utente A (altra org) **non** SELECT righe di org B (né per `appointment_id` non visibile).
- [ ] Atleta: SELECT righe dove è `athlete_id` o dove vede l’`appointment` collegato.
- [ ] Staff/trainer: INSERT storico solo con `cancelled_by_profile_id` = sé e `appointment_id` tra quelli **visibili** in SELECT su `appointments`.
- [ ] Regression: cancellazione da UI ancora persiste riga (o errore esplicito se permesso mancante).

### Dopo step 2 (INSERT atleta)

- [ ] Atleta crea solo righe con `athlete_id` = proprio profile, `created_by_role = 'athlete'`, vincoli open-booking attesi.
- [ ] Atleta **non** crea appuntamenti “normali” staff-owned se policy ristretta correttamente.

### Dopo step 3 (DELETE owner)

- [ ] Staff/trainer come `staff_id` o `trainer_id` DELETE propria riga anche se ruolo DB ≠ `trainer`/`pt` in ARRAY org.
- [ ] Utente random stessa org **non** DELETE riga altrui solo per org.

### Dopo step 4 (open slot SELECT)

- [ ] Stesso scenario calendario prima/dopo (screenshot o query conteggio).
- [ ] Nessuna lettura appuntamenti al di fuori open slot per utenti che non passerebbero `appointments_select_own_org` / athlete.

---

## Nota su `data.sql`

Prima degli step 2–4: campionare `profiles.role` per utenti che cancellano/prenotano (nutrizionista, massaggiatore, trainer) e coerenza `org_id` / `org_id_text` su `appointments` per evitare policy che falliscono in produzione.
