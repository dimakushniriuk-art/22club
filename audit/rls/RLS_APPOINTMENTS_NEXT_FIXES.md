# `appointments` — stato dopo v1/v2 e prossimi fix

## Cosa facevano v1 e v2

| Migration | Policy rimosse                                                                                                  | Effetto                                                                                                                                                                                                                                                                           |
| --------- | --------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **v1**    | `"Staff (nutrizionista massaggiatore) can update/delete own appointments"`, `staff_can_update_own_appointments` | UPDATE solo tramite `appointments_update_own_org` (ruoli admin/trainer/pt/staff + stessa `org_id_text`) e `athlete_update_own_athlete_created_*`. **Nutrizionista/massaggiatore** non sono in quell’ARRAY → **non aggiornano** più righe dove sono `staff_id` salvo altre policy. |
| **v2**    | `appointments_delete_staff_or_admin`                                                                            | DELETE restano: `appointments_delete_own_org` (solo ruoli admin/trainer/pt/staff + org), `athlete_delete_own_athlete_created_*`. **Perso:** delete per **staff_id = io** (qualsiasi ruolo) e per **admin/marketing** via quella policy.                                           |

## Policy ancora attive (riepilogo post v1+v2)

- **SELECT:** `appointments_select_own_athlete`, `appointments_select_own_org`, `athlete_select_open_booking_slots`, `authenticated_select_appointments_in_open_slots`
- **INSERT:** `staff_or_admin_insert_appointments` (solo `staff_id = get_current_staff_profile_id()` o admin + org)
- **UPDATE:** `appointments_update_own_org`, `athlete_update_own_athlete_created_appointments`
- **DELETE:** `appointments_delete_own_org`, `athlete_delete_own_athlete_created_appointments`

---

## Problemi rimasti (e ordine fix)

### 1) INSERT atleta (priorità funzionale alta se serve open booking)

**Sintomo:** `staff_or_admin_insert_appointments` non consente all’atleta di creare righe (es. prenotazione su slot libero).

**Ordine fix consigliato:** dopo `appointment_cancellations`, **prima** del DELETE owner se il prodotto dipende dalla prenotazione atleta.

**Rischio:** medio — duplicati slot, org sbagliata.

**SQL proposto (micro-batch A):** file `audit/rls/sql_proposto/appointments_insert_athlete_rls.sql`.

Idea: policy INSERT con `WITH CHECK` che impone ad esempio:

- `athlete_id = get_profile_id_from_user_id(auth.uid())`
- `created_by_role = 'athlete'`
- `staff_id` / `org_id` coerenti con uno slot open (predicato allineato a `authenticated_select_appointments_in_open_slots` o funzione esistente `slot_has_open_booking_for_rls`), **oppure** vincolo minimo + affidamento a trigger già presenti (`check_open_slot_capacity`, ecc.).

_(Il dump non sostituisce la policy INSERT: va definito il predicato esatto con chi sviluppa il flusso.)_

---

### 2) DELETE trainer/staff owner (priorità dopo v2)

**Sintomo:** utente con `staff_id` o `trainer_id` = proprio `profiles.id` ma ruolo **`nutrizionista` / `massaggiatore`** (o altro non in ARRAY di `appointments_delete_own_org`) **non** può più cancellare la propria riga. Stesso discorso per **marketing** che prima poteva via `appointments_delete_staff_or_admin`.

**Ordine fix consigliato:** subito dopo stabilizzazione INSERT atleta (o in parallelo se insert non toccato).

**Rischio:** basso se ristretto a `staff_id`/`trainer_id` = profilo corrente.

**SQL proposto (micro-batch B):** `audit/rls/sql_proposto/appointments_delete_row_owner_rls.sql`.

---

### 3) SELECT open booking (due modelli)

**Sintomo:** convivenza di:

- `athlete_select_open_booking_slots` — `get_my_trainer_profile()`, `is_open_booking_day`, staff_id vs admin-created;
- `authenticated_select_appointments_in_open_slots` — `org_id` da profilo + `slot_has_open_booking_for_rls(org_id, starts_at, ends_at)`.

Possibili sovrapposizioni, divergenza `org_id` vs `org_id_text`, comportamenti diversi per atleta vs reception.

**Ordine fix consigliato:** **ultimo** — richiede test calendario estesi.

**SQL proposto (micro-batch C):** documentare quale policy tenere come primaria; eventualmente `DROP` una + ampliare l’altra (solo dopo test). File stub: `appointments_select_open_booking_consolidate.sql` (commenti + opzioni, non un’unica verità senza QA).

---

## Cosa si rompe se si sbaglia

| Fix errato                 | Effetto                                                       |
| -------------------------- | ------------------------------------------------------------- |
| INSERT atleta troppo largo | Prenotazioni fraudolente cross-org / su slot non liberi       |
| DELETE owner troppo largo  | Cancellazioni incrociate se si usa solo org senza legame riga |
| SELECT open unificato male | Calendario vuoto o esposizione slot altrui                    |

---

## Verifica consigliata su `data.sql`

- Quante righe `appointments` con `created_by_role = 'athlete'` e `is_open_booking_day = true`.
- Distribuzione `profiles.role` per `staff_id` su appuntamenti cancellati in produzione.
- Coerenza `appointments.org_id` e `org_id_text` per righe open booking.
