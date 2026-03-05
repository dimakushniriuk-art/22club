# Changelog – Pulizia legacy ruoli (2026-03-01)

## Ruoli definitivi
Solo: **admin**, **trainer**, **athlete**, **marketing**.

Rimossi da flussi e DB: **pt**, **atleta**, **staff**, **owner**, **nutrizionista**, **massaggiatore**.

## DB
- Migration `20260301160000_legacy_roles_cleanup_final.sql`: backfill nutrizionista/massaggiatore → trainer; constraint `profiles.role` e `roles.name` solo (admin, trainer, athlete, marketing); `get_current_trainer_profile_id()` solo `role = 'trainer'`; `workout_plans_staff_assigned_condition` solo trainer.
- Migration `20260301150000`: `workout_plans_staff_assigned_condition` usa solo `staff.role = 'trainer'` (rimosso 'pt').

## App
- API admin users/roles: enum ruoli solo 4.
- Login, post-login, middleware: redirect solo per admin, trainer, athlete, marketing.
- UI: form utente, import CSV, admin utenti/ruoli, sidebar, nav mobile: ruoli solo 4; chat atleta solo PT (nessun staff_atleti).
- Guard pagine dashboard: accesso solo trainer, admin (marketing ha sua area).
- Normalizer: nutrizionista/massaggiatore in input → trainer; tipo NormalizedRole solo 4 valori.
- Home atleta: rimossi blocchi Nutrizionista e Massaggiatore.

## Verifiche
Vedi sezione "Query di verifica" nel resoconto operativo.
