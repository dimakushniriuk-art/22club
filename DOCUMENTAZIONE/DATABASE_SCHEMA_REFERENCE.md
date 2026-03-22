# Riferimento schema database – 22Club

Documento di riferimento per tabelle, struttura e relazioni del database Supabase. Aggiornare dopo modifiche allo schema.

---

## 1. Elenco tabelle e viste (public)

| Tabella                     | Tipo  | Commento                                                                   |
| --------------------------- | ----- | -------------------------------------------------------------------------- |
| appointments                | table | Tabella semplificata per gestire appuntamenti                              |
| athlete_administrative_data | table | Dati amministrativi: abbonamenti, pagamenti, documenti contrattuali        |
| athlete_ai_data             | table | Dati AI: insights, raccomandazioni, pattern, predizioni, score             |
| athlete_fitness_data        | table | Dati fitness: livello, obiettivi, preferenze, infortuni                    |
| athlete_massage_data        | table | Dati massaggi: preferenze, zone, intensità, storico                        |
| athlete_medical_data        | table | Dati medici: certificati, referti, allergie, patologie, farmaci            |
| athlete_motivational_data   | table | Dati motivazionali: motivazioni, ostacoli, preferenze, abbandoni           |
| athlete_nutrition_data      | table | Dati nutrizionali: obiettivi, macro, dieta, intolleranze                   |
| athlete_questionnaires      | table | Questionario onboarding atleta (anamnesi, manleva, liberatoria) versionato |
| athlete_smart_tracking_data | table | Dati smart tracking: wearable, metriche, storico giornaliero               |
| audit_logs                  | table | Log azioni utente                                                          |
| chat_messages               | table | Messaggi chat 1-1                                                          |
| cliente_tags                | table | Definizione tag clienti                                                    |
| communication_recipients    | table | Tracking destinatari comunicazioni                                         |
| communications              | table | Comunicazioni di massa (push, email, SMS)                                  |
| credit_ledger               | table | Movimenti crediti/lezioni                                                  |
| documents                   | table | Documenti atleta                                                           |
| exercises                   | table | Catalogo esercizi                                                          |
| inviti_atleti               | table | Inviti atleti da PT                                                        |
| lesson_counters             | table | Contatori lezioni per atleta                                               |
| notifications               | table | Notifiche utente                                                           |
| payments                    | table | Pagamenti atleta                                                           |
| profiles                    | table | Profili utenti (atleti, staff, admin)                                      |
| profiles_tags               | table | Associazione profili–tag                                                   |
| progress_logs               | table | Misure e valori progressi atleta                                           |
| progress_photos             | table | Foto progresso                                                             |
| pt_atleti                   | table | Assegnazione atleti a PT                                                   |
| push_subscriptions          | table | Sottoscrizioni push                                                        |
| roles                       | table | Ruoli e permessi                                                           |
| trainer_athletes            | table | Assegnazione atleti a trainer                                              |
| user_settings               | table | Impostazioni utente (notifiche, privacy, account, 2FA)                     |
| web_vitals                  | table | Core Web Vitals dal client                                                 |
| workout_day_exercises       | table | Esercizi per giorno di scheda (serie, rip, peso, recupero)                 |
| workout_days                | table | Giorni di una scheda                                                       |
| workout_logs                | table | Sessione allenamento eseguita                                              |
| workout_plans               | table | Scheda assegnata all’atleta (wizard “Nuova scheda”)                        |
| workout_sets                | table | Singole serie per esercizio (target/completamento)                         |
| workouts                    | table | Schede allenamento (struttura per pagina storico)                          |
| payments_per_staff_view     | view  | Statistiche pagamenti per staff                                            |
| progress_trend_view         | view  | Trend progressi atleti con percentuali                                     |
| workout_stats_mensili       | view  | Statistiche workout mensili                                                |

---

## 2. Punto critico: profiles.id vs profiles.user_id

- **profiles.id** (PK): identificativo del profilo. Usato da: `workout_plans.athlete_id`, `documents`, `chat_messages`, `progress_photos`, `athlete_questionnaires`, `profiles_tags`, `payments.athlete_id`, `trainer_athletes`, `pt_atleti`, `inviti_atleti`, `workout_logs`, `credit_ledger.athlete_id`, `lesson_counters`, `appointments`, `workouts`, ecc.
- **profiles.user_id**: utente Auth Supabase. Le tabelle **athlete\_\*\_data** e **progress_logs** usano **profiles.user_id** per la colonna `athlete_id`.

Quando una colonna si chiama `athlete_id`, verificare la FK: se punta a `profiles(id)` è il profilo; se punta a `profiles(user_id)` è l’user Auth.

---

## 3. Catena “Nuova scheda” (wizard /dashboard/schede/nuova)

Flusso dati per creazione e lettura schede:

```
workout_plans (scheda: nome, atleta, obiettivo, created_by)
  └── workout_days (giorno 1, 2, …)  [workout_plan_id]
        └── workout_day_exercises (esercizio nel giorno)  [workout_day_id, exercise_id, circuit_block_id?]
              └── workout_sets (serie 1, 2, …)  [workout_day_exercise_id]
```

- **workout_day_exercises.circuit_block_id** (UUID, nullable): se non null, l’esercizio fa parte di un blocco circuito; tutti gli esercizi dello stesso giorno con lo stesso `circuit_block_id` formano un unico circuito (ordine da `order_index`). Non esiste una tabella separata "circuiti": il circuito è l'insieme delle righe con lo stesso `(workout_day_id, circuit_block_id)`.
- **workout_plans**: `athlete_id` → profiles.id, `created_by` / `trainer_id` → profiles.id.
- **workout_days**: solo `workout_plan_id` → workout_plans.id (nessun `workout_id`).
- **workout_logs**: può riferire la scheda con `scheda_id` → workout_plans.id oppure `workout_id` → workouts.id.

### 3.1 Circuiti (wizard Nuova scheda / Modifica)

- I circuiti sono gestiti solo tramite **workout_day_exercises.circuit_block_id**.
- Stesso UUID su più righe dello stesso `workout_day_id` = stesso circuito; l'ordine è dato da `order_index`.
- Creazione: il frontend genera un UUID al salvataggio e lo scrive in `circuit_block_id` per ogni esercizio del blocco.
- Modifica: il frontend ricostruisce la lista circuiti raggruppando per `circuit_block_id` e, al salvataggio, riusa lo stesso UUID.
- Dettaglio flusso: vedi **docs/CIRCUITI_WORKOUT_WIZARD.md**.

---

## 4. Due strutture “scheda”

| Struttura          | Tabella principale | Uso                                                                                                                                         |
| ------------------ | ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------- |
| **Scheda wizard**  | workout_plans      | Pagina “Nuova scheda”, lista schede, assegnazione atleta. Giorni in workout_days, esercizi in workout_day_exercises, serie in workout_sets. |
| **Scheda storico** | workouts           | Pagina/storico allenamenti (“nuova struttura per pagina storico”).                                                                          |

Non confondere le due: stessi concetto logico (scheda allenamento), due tabelle e due flussi (creazione wizard vs storico).

---

## 5. Foreign key principali (riepilogo)

| Da tabella                | Colonna                            | → Tabella              | Colonna | ON DELETE          |
| ------------------------- | ---------------------------------- | ---------------------- | ------- | ------------------ |
| workout_days              | workout_plan_id                    | workout_plans          | id      | CASCADE            |
| workout_day_exercises     | workout_day_id                     | workout_days           | id      | CASCADE            |
| workout_day_exercises     | exercise_id                        | exercises              | id      | RESTRICT           |
| workout_sets              | workout_day_exercise_id            | workout_day_exercises  | id      | CASCADE            |
| workout_plans             | athlete_id                         | profiles               | id      | CASCADE            |
| workout_plans             | trainer_id                         | profiles               | id      | SET NULL           |
| workout_logs              | scheda_id                          | workout_plans          | id      | SET NULL           |
| workout_logs              | workout_id                         | workouts               | id      | SET NULL           |
| workout_logs              | athlete_id, atleta_id              | profiles               | id      | CASCADE            |
| appointments              | athlete_id, staff_id               | profiles               | id      | CASCADE            |
| documents                 | athlete_id, uploaded_by_profile_id | profiles               | id      | CASCADE            |
| payments                  | athlete_id, created_by_staff_id    | profiles               | id      | CASCADE / RESTRICT |
| athlete_questionnaires    | athlete_id                         | profiles               | id      | CASCADE            |
| athlete\_\*\_data (tutte) | athlete_id                         | profiles               | user_id | CASCADE            |
| progress_logs             | athlete_id                         | profiles               | user_id | CASCADE            |
| communication_recipients  | communication_id                   | communications         | id      | CASCADE            |
| profiles_tags             | profile_id, tag_id                 | profiles, cliente_tags | id      | CASCADE            |

---

## 6. Query SQL per rigenerare il report

Eseguire in Supabase SQL Editor per elenco tabelle, colonne, PK e FK:

```sql
-- Tabelle e commenti
SELECT n.nspname AS schema_name, c.relname AS table_name,
  CASE c.relkind WHEN 'r' THEN 'table' WHEN 'v' THEN 'view' WHEN 'm' THEN 'materialized view' ELSE c.relkind::text END AS object_type,
  obj_description(c.oid, 'pg_class') AS table_comment
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public' AND c.relkind IN ('r', 'v', 'm')
ORDER BY c.relname;

-- Foreign key (chi referenzia chi)
SELECT tc.table_schema AS from_schema, tc.table_name AS from_table, kcu.column_name AS from_column,
  ccu.table_schema AS to_schema, ccu.table_name AS to_table, ccu.column_name AS to_column,
  rc.update_rule, rc.delete_rule
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage ccu ON tc.constraint_name = ccu.constraint_name AND tc.table_schema = ccu.table_schema
JOIN information_schema.referential_constraints rc ON tc.constraint_name = rc.constraint_name AND tc.table_schema = rc.constraint_schema
WHERE tc.constraint_type = 'FOREIGN KEY' AND tc.table_schema = 'public'
ORDER BY tc.table_name, kcu.ordinal_position;
```

---

_Ultimo aggiornamento: febbraio 2025. Aggiornare questo file dopo modifiche alle migration._
