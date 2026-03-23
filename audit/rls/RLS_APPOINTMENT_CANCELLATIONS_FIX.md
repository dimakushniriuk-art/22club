# `appointment_cancellations` — fix RLS minimo

## Policy attuali (schema.sql)

| Nome                                             | Comando | Espressione         |
| ------------------------------------------------ | ------- | ------------------- |
| `appointment_cancellations_insert_authenticated` | INSERT  | `WITH CHECK (true)` |
| `appointment_cancellations_select_authenticated` | SELECT  | `USING (true)`      |

Entrambe su ruolo **`authenticated`**.

## Problema di sicurezza

Qualsiasi utente loggato può:

- **leggere** tutto lo storico cancellazioni (anche altre org / altri atleti);
- **inserire** righe arbitrarie (appointment_id qualsiasi, dati falsi).

Impatto: **violazione privacy** + **integrità** dello storio audit.

## Modello target minimo

1. **SELECT:** riga visibile se l’utente ha “diritto” su quella cancellazione:
   - è il profilo che ha cancellato (`cancelled_by_profile_id`), **oppure**
   - è l’atleta (`athlete_id`), **oppure**
   - l’`appointment_id` punta a un appuntamento che **già** può vedere grazie alle policy RLS su `appointments` (subquery su `appointments` rispetta RLS).

2. **INSERT:** solo se:
   - `cancelled_by_profile_id` = profilo dell’utente corrente;
   - esiste un `appointments` con quell’`id` **visibile** allo stesso utente (subquery con RLS su `appointments`).

Nessun UPDATE/DELETE per `authenticated` (tabella append-only; eventuali correzioni solo service_role o admin separato — fuori scope minimo).

## SQL proposto (non eseguito)

File copiabile: `audit/rls/sql_proposto/appointment_cancellations_rls.sql`.

Sintesi:

```sql
DROP POLICY IF EXISTS appointment_cancellations_insert_authenticated ON public.appointment_cancellations;
DROP POLICY IF EXISTS appointment_cancellations_select_authenticated ON public.appointment_cancellations;

CREATE POLICY appointment_cancellations_select_restrictive
  ON public.appointment_cancellations FOR SELECT TO authenticated
  USING (
    cancelled_by_profile_id = public.get_profile_id_from_user_id(auth.uid())
    OR athlete_id = public.get_profile_id_from_user_id(auth.uid())
    OR EXISTS (
      SELECT 1 FROM public.appointments a
      WHERE a.id = appointment_cancellations.appointment_id
    )
  );

CREATE POLICY appointment_cancellations_insert_restrictive
  ON public.appointment_cancellations FOR INSERT TO authenticated
  WITH CHECK (
    cancelled_by_profile_id = public.get_profile_id_from_user_id(auth.uid())
    AND cancelled_by_profile_id IS NOT NULL
    AND EXISTS (
      SELECT 1 FROM public.appointments a
      WHERE a.id = appointment_cancellations.appointment_id
    )
  );
```

**Cosa si rompe se incompleto:** `get_profile_id_from_user_id` NULL → nessun INSERT/SELECT per quel login. **Mitigazione:** usare solo sessioni con profilo; oppure estendere con `service_role` per job.

**Nota:** se `athlete_id` sulla riga inserita deve coincidere con l’atleta dell’appuntamento, si può aggiungere in WITH CHECK un vincolo su join `appointments.athlete_id` (più stretto, da valutare con il flusso reale).
