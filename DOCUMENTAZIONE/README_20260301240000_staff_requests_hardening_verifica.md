# Verifica migration 20260301240000_staff_requests_hardening

## 1) org_id coerente con athlete

Nessuna riga in `staff_atleti` deve avere `org_id` diverso da `profiles.org_id` dell’atleta:

```sql
-- Deve restituire 0 righe
SELECT sa.id, sa.atleta_id, sa.org_id AS sa_org, p.org_id AS athlete_org
FROM staff_atleti sa
JOIN profiles p ON p.id = sa.atleta_id
WHERE sa.org_id IS DISTINCT FROM p.org_id;
```

Verifica atleti con org_id NULL (inammissibile per righe in staff_atleti):

```sql
SELECT sa.id, sa.atleta_id FROM staff_atleti sa
JOIN profiles p ON p.id = sa.atleta_id WHERE p.org_id IS NULL;
-- Atteso: 0 righe
```

---

## 2) Workflow solo via RPC; UPDATE diretto bloccato

- Chiamata RPC (come atleta per accept/reject, come staff per confirm/cancel):
  - `SELECT * FROM staff_requests_apply_transition('<request_id>'::uuid, 'athlete_accepted');`
  - `SELECT * FROM staff_requests_apply_transition('<request_id>'::uuid, 'staff_confirmed');`
  - Verificare che ritorni `{"ok": true, "new_status": "..."}` e che lo status in `staff_requests` e in `staff_atleti` (in caso di staff_confirmed) sia aggiornato.

- UPDATE diretto come atleta/staff deve fallire (solo admin può fare UPDATE diretto):
  - Con sessione atleta: `UPDATE staff_requests SET status = 'athlete_accepted' WHERE id = '<id>' AND athlete_id = '<athlete_profile_id>';`
  - Atteso: 0 rows updated (policy UPDATE per athlete rimossa) o errore RLS.
  - Con sessione staff: `UPDATE staff_requests SET status = 'staff_confirmed' WHERE id = '<id>' AND staff_id = '<staff_profile_id>';`
  - Atteso: 0 rows updated o errore RLS.

---

## 3) Staff NON vede workout_logs atleta prima di staff_confirmed

- Creare una richiesta in stato `pending` o `athlete_accepted` (senza mai arrivare a `staff_confirmed`).
- Verificare che lo staff (nutrizionista/massaggiatore) **non** veda i `workout_logs` di quell’atleta (l’accesso è solo tramite `staff_atleti` con `status = 'active'`, creata solo dopo `staff_confirmed`).

```sql
-- Come staff: SELECT su workout_logs filtrato da staff_atleti active.
-- Prima di staff_confirmed non esiste riga staff_atleti active per (atleta, staff) → nessun log restituito.
```

---

## 4) audit_logs con STAFF_REQUEST_* e org_id corretto

```sql
SELECT id, action, table_name, record_id, org_id, actor_profile_id, new_data, created_at
FROM audit_logs
WHERE table_name = 'staff_requests'
  AND action LIKE 'STAFF_REQUEST_%'
ORDER BY created_at DESC
LIMIT 20;
```

Verificare che:
- `org_id` sia valorizzato e uguale a `staff_requests.org_id` della richiesta.
- `actor_profile_id` corrisponda al profilo che ha eseguito la transizione (athlete per accept/reject, staff/admin per confirm/cancel).

---

## Riepilogo hardening

| Controllo | Cosa verifica |
|-----------|----------------|
| org_id    | staff_atleti.org_id = profiles.org_id dell’atleta; nessun fallback “org esistente” |
| RPC       | Transizioni solo via `staff_requests_apply_transition(p_request_id, p_new_status)`; actor da auth.uid() |
| UPDATE    | UPDATE diretto su `staff_requests` non consentito a athlete/staff (solo admin o RPC) |
| Invited   | Accesso a dati atleta (profiles, workout_logs, appointments) solo tramite staff_atleti con status = 'active' |
| Audit     | audit_logs con action STAFF_REQUEST_* e org_id/actor corretti |
