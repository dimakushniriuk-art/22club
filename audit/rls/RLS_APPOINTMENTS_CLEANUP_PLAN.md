# RLS — `public.appointments` piano dettagliato (non applicare)

Fonte: definizioni in `schema.sql` (policy quoted in blocco iniziale + policy snake_case dopo `ALTER ENABLE RLS`).

## SELECT (4 policy)

| Nome                                              | Modello                                                                                   | Note                                                                    |
| ------------------------------------------------- | ----------------------------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| `appointments_select_own_athlete`                 | Atleta: `profiles.id = athlete_id`, ruoli atleta/athlete                                  | **Canonico** per riga “mio appuntamento”                                |
| `appointments_select_own_org`                     | Staff/trainer/admin/pt/staff stessa `org_id_text` **o** `staff_id`/`trainer_id` = profile | **Canonico org-wide**; ARRAY ruoli legacy                               |
| `athlete_select_open_booking_slots`               | `is_open_booking_day` + atleta + stesso athlete                                           | Slot liberi per atleta                                                  |
| `authenticated_select_appointments_in_open_slots` | Stessa org (`profiles.org_id`) + open slot + funzione anti-ricorsione (commento dump)     | **Sovrapposto** a sopra per dominio “open slot”; pubblico org più ampio |

## INSERT (1 policy)

| Nome                                 | Modello                                                                                             |
| ------------------------------------ | --------------------------------------------------------------------------------------------------- |
| `staff_or_admin_insert_appointments` | `staff_id = get_current_staff_profile_id()` **OR** admin + `org_id = get_org_id_for_current_user()` |

**Canonico** unico per INSERT; niente duplicato.

## UPDATE (4 policy)

| Nome                                                              | Predicato staff                                            | Note                                             |
| ----------------------------------------------------------------- | ---------------------------------------------------------- | ------------------------------------------------ |
| `Staff (nutrizionista massaggiatore) can update own appointments` | `get_profile_id_from_user_id(auth.uid())`                  | **Legacy quoted**                                |
| `appointments_update_own_org`                                     | org + ruoli trainer/pt/staff/admin                         | Ampio                                            |
| `athlete_update_own_athlete_created_appointments`                 | `created_by_role = 'athlete'` + athlete_id ∈ miei profiles | Per appuntamenti creati da atleta                |
| `staff_can_update_own_appointments`                               | `get_current_staff_profile_id()`                           | **Stesso intento** della prima ma helper diverso |

**Duplicati:** prima policy quoted vs `staff_can_update_own_appointments` (stesso staff “own row”). **Sovrapposizione:** `appointments_update_own_org` include trainer/admin che possono aggiornare più righe org.

## DELETE (4 policy)

| Nome                                                              | Note                                                |
| ----------------------------------------------------------------- | --------------------------------------------------- |
| `Staff (nutrizionista massaggiatore) can delete own appointments` | staff_id = profile da `get_profile_id_from_user_id` |
| `appointments_delete_own_org`                                     | org_id_text + trainer/pt/staff/admin                |
| `appointments_delete_staff_or_admin`                              | staff_id = mio profile **OR** admin/marketing org   |
| `athlete_delete_own_athlete_created_appointments`                 | athlete creati da atleta                            |

**Duplicati:** nut/mass delete ⊆ `appointments_delete_staff_or_admin` quando staff_id coincide. **Sovrapposizione:** delete org vs delete staff_or_admin (chi cancella cosa va chiarito a livello prodotto).

---

## Classificazione sintetica

| Categoria                                  | Policy                                                                                                                                                                                                                                   |
| ------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Canoniche (da mantenere come concetto)** | `appointments_select_own_athlete`, `appointments_select_own_org`, `staff_or_admin_insert_appointments`, `athlete_*_open_booking` / `authenticated_select_*` (una delle due per open slot), `athlete_update/delete_own_athlete_created_*` |
| **Duplicate**                              | UPDATE/DELETE quoted nut/mass vs `staff_can_update` / `appointments_delete_staff_or_admin`                                                                                                                                               |
| **Legacy**                                 | Nomi quoted; ARRAY `pt`/`staff`/`trainer`; `org_id_text` vs `org_id` in policy diverse                                                                                                                                                   |
| **Sospette**                               | Due SELECT open-slot con criteri org diversi (`org_id` vs ruolo atleta); DELETE multipli che ampliano superficie                                                                                                                         |

## Modello target consigliato (documentale)

1. **SELECT:** (a) atleta vede proprie righe; (b) staff vede org (`org_id` unico, non doppio text/uuid se allineati); (c) open slot — **una** policy con predicato unico testato.
2. **INSERT:** staff row owner + admin org (come ora).
3. **UPDATE/DELETE:** un predicato **staff** basato su **un solo** helper (`get_current_staff_profile_id` **o** `get_profile_id_from_user_id`, mai entrambi); admin/marketing separato; atleta solo su righe `created_by_role = 'athlete'`.
4. Allineare ruoli ARRAY a set definito prodotto (`trainer` vs `pt` deprecato).

## Batch proposti (ordine, senza SQL)

| Batch  | Contenuto                                                                                                                                        | Rischio                                           |
| ------ | ------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------- |
| **v1** | Documentare e testare matrice attuale in staging; nessun DROP                                                                                    | Zero                                              |
| **v2** | Rimuovere **solo** policy quoted nut/mass UPDATE/DELETE se coperte da `staff_can_update_own_appointments` e `appointments_delete_staff_or_admin` | Medio — verificare nut/mass non perdono casi edge |
| **v3** | Unificare SELECT open slot in un’unica policy; deprecare l’altra                                                                                 | Medio-alto — calendario                           |
| **v4** | Consolidare `appointments_update_own_org` vs staff row (separare esplicitamente ruoli)                                                           | Alto                                              |
| **v5** | Normalizzare `org_id` vs `org_id_text` nelle condizioni dopo verifica dati                                                                       | Alto                                              |

---

## Verifica data.sql

Controllare: frequenza `profiles.role` ∈ (`pt`,`staff`,`trainer`), coerenza `org_id` / `org_id_text` su `appointments`, presenza `created_by_role = 'athlete'` prima di stringere DELETE atleta.
