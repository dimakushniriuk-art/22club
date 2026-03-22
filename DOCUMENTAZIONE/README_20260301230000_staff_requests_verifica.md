# Verifica migration 20260301230000_staff_requests_and_staff_atleti_types

## A) Controllo ruoli DB

```sql
SELECT role, count(*) FROM profiles GROUP BY role ORDER BY role;
```

Attesi: almeno i 6 ruoli `admin`, `trainer`, `athlete`, `marketing`, `nutrizionista`, `massaggiatore` (nessun `pt`, `staff`, `owner`, `atleta`).

```sql
SELECT conname, pg_get_constraintdef(oid) FROM pg_constraint
WHERE conrelid = 'public.profiles'::regclass AND conname = 'profiles_role_check';
```

Atteso: `CHECK ((role = ANY (ARRAY['admin'::text, 'trainer'::text, 'athlete'::text, 'marketing'::text, 'nutrizionista'::text, 'massaggiatore'::text])))`.

---

## B) staff_atleti: vincolo “un solo attivo per tipo”

```sql
SELECT atleta_id, staff_type, count(*)
FROM staff_atleti
WHERE status = 'active'
GROUP BY atleta_id, staff_type
HAVING count(*) > 1;
```

Atteso: **0 righe**. Se ci sono righe, il vincolo unique partial è violato.

---

## C) staff_requests workflow e audit

1. Inserire richiesta **pending** (come staff nutrizionista/massaggiatore, stesso org dell’atleta).
2. Atleta accetta: `UPDATE staff_requests SET status = 'athlete_accepted' WHERE id = ?`.
3. Staff conferma: `UPDATE staff_requests SET status = 'staff_confirmed' WHERE id = ?`.
4. Verificare che esista **una sola** riga attiva in `staff_atleti` per quel `(athlete_id, staff_type)`:

```sql
SELECT * FROM staff_atleti
WHERE atleta_id = '<athlete_uuid>' AND staff_type = 'nutrizionista' AND status = 'active';
```

Atteso: 1 riga.

5. Verificare audit:

```sql
SELECT action, table_name, record_id, new_data, created_at
FROM audit_logs
WHERE table_name = 'staff_requests'
  AND action LIKE 'STAFF_REQUEST_%'
ORDER BY created_at DESC
LIMIT 10;
```

Attesi: azioni `STAFF_REQUEST_ACCEPTED`, `STAFF_REQUEST_CONFIRMED`, eventualmente `STAFF_REQUEST_REJECTED` / `STAFF_REQUEST_CANCELLED`.

---

## D) RLS smoke

- **Athlete**: vede solo le proprie righe in `staff_atleti` e `staff_requests` (athlete_id = proprio profile id).
- **Staff (nutrizionista/massaggiatore)**: vede solo le proprie righe (staff_id = proprio profile id); non può creare richiesta per atleta di org diversa (INSERT con athlete di altra org deve fallire).
- **Admin**: vede tutte le righe della propria org (org_id = get_org_id_for_current_user()).

Query di esempio (sostituire con profile_id reali):

```sql
-- Come atleta: solo mie righe staff_atleti
SET request.jwt.claims = '{"sub": "<athlete_user_id>"}';
SELECT * FROM staff_atleti;  -- solo dove atleta_id = mio profile_id

-- Come staff: solo mie righe
SET request.jwt.claims = '{"sub": "<staff_user_id>"}';
SELECT * FROM staff_atleti;  -- solo dove staff_id = mio profile_id
```

---

## Riassunto modifiche migration

| Area             | Modifica                                                                                                                                             |
| ---------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| profiles / roles | CHECK ruoli a 6 valori (incl. nutrizionista, massaggiatore); trigger guard aggiornato                                                                |
| staff_atleti     | Colonne org_id, staff_type, status, activated_at, deactivated_at, updated_at; backfill; unique partial (atleta_id, staff_type) WHERE status='active' |
| staff_requests   | Nuova tabella con org_id, athlete_id, staff_id, staff_type, status; unique partial per richieste aperte                                              |
| Trigger          | AFTER UPDATE status su staff_requests: su staff_confirmed disattiva vecchio staff_atleti, inserisce nuovo, audit_write                               |
| RLS              | staff_atleti e staff_requests: admin/staff/athlete; reintrodotte policy su profiles, appointments, workout_logs per nutrizionista/massaggiatore      |

---

## FASE 0 – Stato attuale (pre-implementazione)

- **Ruoli**: UserRole e validRoles solo 4 (admin, trainer, athlete, marketing). DB: profiles_role_check e \_profiles_role_guard solo 4 ruoli; nutrizionista/massaggiatore erano stati migrati a trainer (20260301170000).
- **staff_atleti**: Esiste con id, staff_id, atleta_id, created_at. Nessun org_id, staff_type, status. RLS disabilitata (20260225_rollback). Policy su profiles/appointments/workout_logs per nutrizionista/massaggiatore rimosse in 20260301170000.
- **Pagine**: /dashboard/nutrizionista e /dashboard/massaggiatore presenti; useStaffDashboardGuard già previsto; middleware non gestiva i due ruoli (redirect/allow path).
- **audit_write**: Firma (p_action, p_table_name, p_record_id, p_before, p_after, p_actor_profile_id, p_org_id uuid, p_impersonated_profile_id). audit_logs.org_id uuid. get_org_id_for_current_user() ritorna uuid.
