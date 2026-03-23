# Spec finale — `check_appointment_overlap` (source of truth)

**Stato:** piano + SQL in `supabase/migrations/20260318120000_update_check_overlap.sql`.  
**Codice TS:** non modificato in questo batch.

---

## 1. Firma e parametri

| Parametro                  | Tipo          | Default | Uso                                                                  |
| -------------------------- | ------------- | ------- | -------------------------------------------------------------------- |
| `p_staff_id`               | `uuid`        | —       | Profilo staff (slot)                                                 |
| `p_starts_at`              | `timestamptz` | —       | Inizio intervallo proposto                                           |
| `p_ends_at`                | `timestamptz` | —       | Fine intervallo proposto                                             |
| `p_exclude_appointment_id` | `uuid`        | `NULL`  | Esclude riga in edit                                                 |
| `p_appointment_type`       | `text`        | `NULL`  | Se `'allenamento_doppio'` applica regola max 2 doppi                 |
| `p_is_collaborator`        | `boolean`     | `false` | Se `true`: vietata qualsiasi sovrapposizione con appuntamenti attivi |

---

## 2. Logica (ordine di valutazione)

1. **Intervallo invalido** (`starts_at >= ends_at`): `has_overlap = true`, `overlap_reason = 'invalid_interval'`.
2. **Insieme base** — righe su `appointments` che:
   - `staff_id = p_staff_id`
   - `cancelled_at IS NULL`
   - `lower(trim(status))` **non** in `('annullato','cancelled')` (status `NULL` = considerato attivo)
   - overlap temporale: `starts_at < p_ends_at AND ends_at > p_starts_at`
   - escluso `p_exclude_appointment_id` se valorizzato
3. **Se `p_is_collaborator`**: `has_overlap` se **≥1** riga nel base set. Motivo: `collaborator_slot_occupied`.
4. **Altrimenti se `p_appointment_type` normalizzato = `allenamento_doppio`**: contare solo righe con `type = 'allenamento_doppio'` nel base set; `has_overlap` se **≥2**. Non si considerano per la soglia gli altri tipi (allineato a `use-calendar-page.ts`). Motivo blocco: `double_training_limit`; in `conflicting_appointments` solo i doppi.
5. **Altrimenti** (atleta, tipi normali, `p_appointment_type` NULL/vuoto): `has_overlap` se **≥1** riga nel base set. Motivo: `active_appointment_conflict`.

---

## 3. Output

| Colonna                    | Tipo      | Note                                                                          |
| -------------------------- | --------- | ----------------------------------------------------------------------------- |
| `has_overlap`              | `boolean` |                                                                               |
| `conflicting_appointments` | `jsonb`   | Array di `{ id, type, starts_at, ends_at, status }`; `[]` se nessun conflitto |
| `overlap_reason`           | `text`    | `NULL` se OK; altrimenti codice macchina (vedi §2)                            |

Compatibilità JSON client: `jsonb` esposto come JSON da PostgREST (come prima `Json`).

---

## 4. Diff SQL / migration

File: **`supabase/migrations/20260318120000_update_check_overlap.sql`**

- `DROP` overload a 4 argomenti (`timestamptz` e `timestamp`) per non duplicare la RPC.
- `CREATE OR REPLACE` con 6 argomenti (ultimi due con default).
- `SECURITY DEFINER`, `SET search_path = public`, `STABLE`.
- `GRANT EXECUTE` a `authenticated` e `service_role` (verificare su istanza se servono altri ruoli).

---

## 5. Compatibilità codice esistente

| Chiamata                                                                                            | Effetto post-migration                                                                                                                                                                                                                               |
| --------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `useAthleteAppointments`: solo `p_staff_id`, `p_starts_at`, `p_ends_at`, `p_exclude_appointment_id` | Validi: default `p_appointment_type = NULL`, `p_is_collaborator = false` → ramo “default”: **stesso gate del calendario per tipi non-doppio**, ma **ora esclude annullati/cancellati** (diverso dalla query calendario pre-refactor che li contava). |
| Tipi generati `types.ts`                                                                            | Aggiungere in batch TS: `p_appointment_type?`, `p_is_collaborator?`, colonna `overlap_reason`; finché non rigenerati, TypeScript può dare errore su RPC — da aggiornare al refactor.                                                                 |
| `conflicting_appointments`                                                                          | Prima: shape dipendeva da RPC legacy; ora array omogeneo. Chi legge solo `has_overlap` non si rompe.                                                                                                                                                 |

**Cambiamento comportamentale atteso (voluto):** slot con solo appuntamenti annullati/cancellati non bloccano più né atleta né (dopo refactor) calendario.

**Regola collaboratore:** oggi il calendario **non** la applica in SQL locale; dopo adozione RPC con `p_is_collaborator: true` il gate diventa **più stretto** per i collaboratori (allineamento a `CALENDARIO_22CLUB_RESOCONTO_FINALE.md`).

---

## 6. Test SQL manuali

Sostituire UUID/timestamp con valori reali dell’istanza.

```sql
-- A) Atleta-style: qualsiasi attivo nel slot → overlap
SELECT * FROM check_appointment_overlap(
  'STAFF_UUID'::uuid,
  '2026-03-20T10:00:00+01'::timestamptz,
  '2026-03-20T11:00:00+01'::timestamptz,
  NULL
);

-- B) Edit: escludi id corrente
SELECT * FROM check_appointment_overlap(
  'STAFF_UUID'::uuid,
  '2026-03-20T10:00:00+01'::timestamptz,
  '2026-03-20T11:00:00+01'::timestamptz,
  'APPOINTMENT_ID'::uuid
);

-- C) Terzo allenamento_doppio nello stesso slot (attesi 2 doppi già presenti) → has_overlap true
SELECT * FROM check_appointment_overlap(
  'STAFF_UUID'::uuid,
  '2026-03-20T10:00:00+01'::timestamptz,
  '2026-03-20T11:00:00+01'::timestamptz,
  NULL,
  'allenamento_doppio',
  false
);

-- D) Collaboratore con un solo attivo nel slot → has_overlap true
SELECT * FROM check_appointment_overlap(
  'STAFF_UUID'::uuid,
  '2026-03-20T10:00:00+01'::timestamptz,
  '2026-03-20T11:00:00+01'::timestamptz,
  NULL,
  NULL,
  true
);

-- E) Intervallo invalido
SELECT * FROM check_appointment_overlap(
  'STAFF_UUID'::uuid,
  '2026-03-20T12:00:00+01'::timestamptz,
  '2026-03-20T10:00:00+01'::timestamptz
);
-- atteso: has_overlap true, overlap_reason = invalid_interval
```

Verifica dati di supporto:

```sql
SELECT id, type, status, cancelled_at, starts_at, ends_at
FROM appointments
WHERE staff_id = 'STAFF_UUID'
  AND starts_at < '2026-03-20T11:00:00+01'
  AND ends_at > '2026-03-20T10:00:00+01';
```

---

## 7. Rischi

| Rischio                                           | Mitigazione                                                                                                                                                              |
| ------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Doppia firma in DB** se non si esegue il `DROP` | Includere sempre i `DROP` della migration prima del deploy.                                                                                                              |
| **RLS vs SECURITY DEFINER**                       | La funzione legge tutte le righe `appointments` per quello `staff_id`; verificare che sia accettabile a livello privacy/org (stesso vincolo della RPC legacy).           |
| **Drift `status`**                                | Valori tipo `canceled` (EN) non esclusi se non in lista; estendere whitelist se necessario.                                                                              |
| **Performance**                                   | Una RPC per slot in loop ricorrenza; indice consigliato su `(staff_id, starts_at, ends_at)` o equivalente se non presente.                                               |
| **Atleta che prenota “doppio”**                   | Finché il client non passa `p_appointment_type`, il doppio è trattato come slot pieno al primo attivo — coerente con flusso atleta attuale se non espone il tipo doppio. |
| **Regola doppio vs singolo nello stesso slot**    | Replicata dal calendario: un singolo + un doppio non impedisce un terzo doppio finché i doppi sono < 2. Prodotto può voler restringere in seguito.                       |

---

## 8. Prossimi step (fuori da questo file)

1. Applicare migration su Supabase (dopo conferma utente).
2. Rigenerare `src/lib/supabase/types.ts`.
3. Wrapper unico TS + sostituzione query in `use-calendar-page` e delega da `appointment-utils`.
