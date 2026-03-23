# RLS — matrice tabella/policy (fonte: `supabase-backups/schema.sql`)

**Metodo:** estrazione `CREATE POLICY` su `public.*` + `ALTER TABLE … ENABLE ROW LEVEL SECURITY` per `public`. Nel dump compaiono più occorrenze testuali di `CREATE POLICY`; le policy univoche per `(tabella, nome)` risultano **288** su **61** tabelle. **14** tabelle hanno RLS attivo ma **zero policy** (negazione totale per sessione `authenticated` senza bypass).

**Non in tabella:** `auth.*` e `realtime.messages` hanno RLS di sistema Supabase (non dettagliato qui).

**Legenda:** S/I/U/D = policy esplicite per SELECT/INSERT/UPDATE/DELETE; ALL = policy senza `FOR …` (copre tutte le operazioni consentite dal comando).

**data.sql:** utile per verificare distribuzione `profiles.role`, `org_id` / `org_id_text` coerenti con le condizioni policy (non usato per conteggi qui).

| Tabella                        | RLS | Policy |   S |   I |   U |   D | ALL | Note sintetiche                                                                                                             |
| ------------------------------ | --: | -----: | --: | --: | --: | --: | --: | --------------------------------------------------------------------------------------------------------------------------- |
| appointment_cancellations      |  sì |      2 |   1 |   1 |   0 |   0 |   0 | **USING/WITH CHECK true** su `authenticated` — eccessivamente permissivo                                                    |
| appointments                   |  sì |     13 |   4 |   1 |   4 |   4 |   0 | Mix `org_id` / `org_id_text`, ruoli `trainer`/`pt`/`staff`, `get_profile_id_from_user_id` vs `get_current_staff_profile_id` |
| athlete_administrative_data    |  sì |      0 |   0 |   0 |   0 |   0 |   0 | **zero policy**                                                                                                             |
| athlete_ai_data                |  sì |      1 |   0 |   0 |   0 |   1 |   0 | solo DELETE admin                                                                                                           |
| athlete_fitness_data           |  sì |      0 |   0 |   0 |   0 |   0 |   0 | **zero policy**                                                                                                             |
| athlete_marketing_kpis         |  sì |      1 |   1 |   0 |   0 |   0 |   0 | `get_org_id_for_current_user`                                                                                               |
| athlete_massage_data           |  sì |      0 |   0 |   0 |   0 |   0 |   0 | **zero policy**                                                                                                             |
| athlete_medical_data           |  sì |      0 |   0 |   0 |   0 |   0 |   0 | **zero policy**                                                                                                             |
| athlete_motivational_data      |  sì |      1 |   0 |   0 |   0 |   1 |   0 | solo DELETE admin                                                                                                           |
| athlete_nutrition_data         |  sì |      0 |   0 |   0 |   0 |   0 |   0 | **zero policy**                                                                                                             |
| athlete_questionnaires         |  sì |      1 |   0 |   0 |   0 |   0 |   1 | `auth.uid()` via subquery `profiles`                                                                                        |
| athlete_smart_tracking_data    |  sì |      0 |   0 |   0 |   0 |   0 |   0 | **zero policy**                                                                                                             |
| athlete_trainer_assignments    |  sì |      3 |   2 |   0 |   0 |   0 |   1 | mix `is_admin` ALL + SELECT atleta/trainer                                                                                  |
| audit_logs                     |  sì |      3 |   1 |   2 |   0 |   0 |   0 | INSERT service_role **WITH CHECK true**; SELECT solo admin                                                                  |
| calendar_blocks                |  sì |      3 |   1 |   1 |   0 |   0 |   1 | `profiles.id` da `auth.uid()`                                                                                               |
| chat_messages                  |  sì |      6 |   2 |   1 |   2 |   1 |   0 | **due SELECT** (conversation + `get_profile_id_from_user_id`)                                                               |
| cliente_tags                   |  sì |      2 |   1 |   0 |   0 |   0 |   1 | ruoli legacy in EXISTS                                                                                                      |
| communication_recipients       |  sì |      7 |   3 |   1 |   1 |   1 |   1 | mix `is_admin`, `get_current_staff_profile_id`, EXISTS staff                                                                |
| communications                 |  sì |      8 |   2 |   2 |   2 |   2 |   0 | duplicazione logica staff vs admin                                                                                          |
| credit_ledger                  |  sì |      6 |   3 |   3 |   0 |   0 |   0 | policy staff con **WITH CHECK true** su insert                                                                              |
| documents                      |  sì |      8 |   3 |   2 |   2 |   1 |   0 | `org_id_text` + staff/trainer                                                                                               |
| exercises                      |  sì |      5 |   1 |   1 |   1 |   2 |   0 | SELECT usa **`org_id_text`** vs profilo                                                                                     |
| inviti_atleti                  |  sì |      9 |   2 |   2 |   2 |   3 |   0 | convive policy **quoted PT legacy** + snake_case org                                                                        |
| inviti_cliente                 |  sì |      4 |   1 |   1 |   1 |   1 |   0 | `profiles.id`                                                                                                               |
| lead_to_athlete_links          |  sì |      3 |   1 |   1 |   1 |   0 |   0 | **`current_setting('request.jwt.claims')`** — non allineato agli helper SQL                                                 |
| lesson_counters                |  sì |      2 |   2 |   0 |   0 |   0 |   0 | staff vs atleta                                                                                                             |
| marketing_automations          |  sì |      4 |   1 |   1 |   1 |   1 |   0 | UPDATE **WITH CHECK true**                                                                                                  |
| marketing_campaigns            |  sì |      4 |   1 |   1 |   1 |   1 |   0 | idem                                                                                                                        |
| marketing_events               |  sì |      2 |   1 |   1 |   0 |   0 |   0 | `org_id_text`                                                                                                               |
| marketing_lead_notes           |  sì |      2 |   1 |   1 |   0 |   0 |   0 | `org_id_text`                                                                                                               |
| marketing_lead_status_history  |  sì |      4 |   1 |   1 |   1 |   1 |   0 | UPDATE **WITH CHECK true**                                                                                                  |
| marketing_leads                |  sì |      3 |   1 |   1 |   1 |   0 |   0 | UPDATE **WITH CHECK true**                                                                                                  |
| marketing_segments             |  sì |      4 |   1 |   1 |   1 |   1 |   0 | UPDATE **WITH CHECK true**                                                                                                  |
| marketing_trials               |  sì |      3 |   1 |   1 |   1 |   0 |   0 | JWT claims                                                                                                                  |
| notifications                  |  sì |      3 |   1 |   1 |   1 |   0 |   0 | UPDATE **WITH CHECK true**                                                                                                  |
| nutrition_adaptive_settings    |  sì |      3 |   1 |   1 |   1 |   0 |   0 | `get_profile_id_from_user_id`, `is_admin`                                                                                   |
| nutrition_auto_config          |  sì |      3 |   1 |   1 |   1 |   0 |   0 | idem                                                                                                                        |
| nutrition_plan_days            |  sì |      3 |   1 |   1 |   0 |   0 |   1 |                                                                                                                             |
| nutrition_plan_groups          |  sì |      6 |   3 |   2 |   1 |   0 |   0 |                                                                                                                             |
| nutrition_plan_items           |  sì |      5 |   1 |   1 |   1 |   1 |   1 |                                                                                                                             |
| nutrition_plan_meals           |  sì |      3 |   1 |   1 |   0 |   0 |   1 |                                                                                                                             |
| nutrition_plan_versions        |  sì |      1 |   1 |   0 |   0 |   0 |   0 |                                                                                                                             |
| nutrition_plan_versions_legacy |  sì |      3 |   1 |   1 |   1 |   0 |   0 | nome tabella legacy                                                                                                         |
| nutrition_progress             |  sì |      2 |   1 |   1 |   0 |   0 |   0 |                                                                                                                             |
| nutrition_weekly_analysis      |  sì |      3 |   1 |   1 |   1 |   0 |   0 |                                                                                                                             |
| payments                       |  sì |     14 |   5 |   4 |   3 |   2 |   0 | molte policy sovrapposte per ruolo                                                                                          |
| profile_tombstones             |  sì |      1 |   1 |   0 |   0 |   0 |   0 | `is_admin`                                                                                                                  |
| profiles                       |  sì |     17 |  11 |   2 |   3 |   1 |   0 | **17 policy**; service_role **true**; SELECT multipli (admin, marketing, staff, atleta)                                     |
| profiles_tags                  |  sì |      2 |   1 |   0 |   0 |   0 |   1 | `org_id_text`                                                                                                               |
| progress_logs                  |  sì |      7 |   3 |   2 |   1 |   1 |   0 | **DELETE/UPDATE atleta usano `athlete_id = auth.uid()`** (UUID utente ≠ profile id)                                         |
| progress_photos                |  sì |     11 |   3 |   2 |   2 |   2 |   2 | naming legacy IT/EN                                                                                                         |
| pt_atleti                      |  sì |      4 |   0 |   1 |   1 |   1 |   1 | solo `is_admin` su CRUD                                                                                                     |
| push_subscriptions             |  sì |      2 |   1 |   0 |   0 |   0 |   1 |                                                                                                                             |
| roles                          |  sì |      1 |   1 |   0 |   0 |   0 |   0 |                                                                                                                             |
| staff_atleti                   |  sì |      6 |   2 |   0 |   1 |   1 |   2 | admin org + staff nut/mass                                                                                                  |
| staff_calendar_settings        |  sì |      6 |   2 |   2 |   2 |   0 |   0 | mix quoted + snake                                                                                                          |
| staff_inviti_esterni           |  sì |      2 |   1 |   1 |   0 |   0 |   0 |                                                                                                                             |
| staff_requests                 |  sì |      4 |   2 |   1 |   0 |   0 |   1 |                                                                                                                             |
| trainer_athletes               |  sì |      5 |   2 |   1 |   1 |   1 |   0 | `org_id_text`                                                                                                               |
| trainer_certifications         |  sì |      0 |   0 |   0 |   0 |   0 |   0 | **zero policy**                                                                                                             |
| trainer_courses                |  sì |      0 |   0 |   0 |   0 |   0 |   0 | **zero policy**                                                                                                             |
| trainer_education              |  sì |      0 |   0 |   0 |   0 |   0 |   0 | **zero policy**                                                                                                             |
| trainer_experience             |  sì |      0 |   0 |   0 |   0 |   0 |   0 | **zero policy**                                                                                                             |
| trainer_profiles               |  sì |      0 |   0 |   0 |   0 |   0 |   0 | **zero policy**                                                                                                             |
| trainer_specializations        |  sì |      0 |   0 |   0 |   0 |   0 |   0 | **zero policy**                                                                                                             |
| trainer_testimonials           |  sì |      0 |   0 |   0 |   0 |   0 |   0 | **zero policy**                                                                                                             |
| trainer_transformations        |  sì |      0 |   0 |   0 |   0 |   0 |   0 | **zero policy**                                                                                                             |
| user_settings                  |  sì |      5 |   1 |   1 |   1 |   1 |   1 |                                                                                                                             |
| web_vitals                     |  sì |      2 |   1 |   1 |   0 |   0 |   0 | admin/**pt** in EXISTS (non `is_admin`)                                                                                     |
| workout_day_exercises          |  sì |      8 |   2 |   2 |   2 |   2 |   0 |                                                                                                                             |
| workout_days                   |  sì |      8 |   2 |   2 |   2 |   2 |   0 |                                                                                                                             |
| workout_logs                   |  sì |      9 |   4 |   2 |   2 |   1 |   0 | `atleta_id` / `athlete_id` + staff                                                                                          |
| workout_plans                  |  sì |     10 |   3 |   2 |   2 |   3 |   0 |                                                                                                                             |
| workout_sets                   |  sì |     11 |   3 |   3 |   3 |   2 |   0 | **WITH CHECK true** su insert                                                                                               |
| workouts                       |  sì |      4 |   1 |   1 |   1 |   1 |   0 |                                                                                                                             |
