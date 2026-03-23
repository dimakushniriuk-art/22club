# RLS — piano batch priorità (solo pianificazione)

Ordine consigliato per **ridurre rischio** (prima chiusure ovvie e tabelle piccole, poi core).

## P0 — rischio sicurezza / incoerenza grave

| Tabella                                   | Rischio    | Motivo priorità                                             | Dipendenze                            | Strategia                                                                           |
| ----------------------------------------- | ---------- | ----------------------------------------------------------- | ------------------------------------- | ----------------------------------------------------------------------------------- |
| **appointment_cancellations**             | Alto       | SELECT/INSERT **true** per tutti authenticated              | appointments                          | **Cleanup minimo:** sostituire con predicato org/atleta/staff                       |
| **appointments**                          | Alto       | 13 policy, DELETE/UPDATE duplicati, due helper staff        | calendar, payments, credit, notifiche | **Refactor policy completo** (batch v1–v3, vedi `RLS_APPOINTMENTS_CLEANUP_PLAN.md`) |
| **progress_logs**                         | Alto       | `athlete_id = auth.uid()` errato su colonna profile id      | profiles, workout                     | **Cleanup minimo** + allineamento a pattern SELECT                                  |
| **profiles**                              | Alto       | 17 policy, superficie ampia                                 | quasi tutto                           | **Refactor graduale** (raggruppare SELECT admin, service invariato)                 |
| **athlete*\*\_data (6) + trainer*\* (8)** | Medio-alto | RLS ON, **0 policy** — dati inaccessibili o solo via bypass | UI se legge queste tabelle            | **O policy esplicite o DISABLE RLS** (decisione prodotto)                           |

## P1 — complessità / debito

| Tabella                                                                 | Rischio | Motivo                        | Dipendenze           | Strategia                                                           |
| ----------------------------------------------------------------------- | ------- | ----------------------------- | -------------------- | ------------------------------------------------------------------- |
| **payments**                                                            | Medio   | 14 policy                     | appointments, ledger | Consolidamento per ruolo                                            |
| **chat_messages**                                                       | Medio   | doppio SELECT                 | profiles             | Unificare modello conversazione                                     |
| **credit_ledger**                                                       | Medio   | WITH CHECK true               | payments, staff      | Restringere CHECK                                                   |
| **inviti_atleti**                                                       | Medio   | doppio stile policy           | profiles, trainer    | Consolidare su snake_case + org                                     |
| **lead_to_athlete_links**                                               | Medio   | solo JWT org                  | marketing            | Allineare a `get_org_id_for_current_user` o documentare vincolo JWT |
| **workout_plans / workout_days / workout_sets / workout_day_exercises** | Medio   | molte policy, org_id_text mix | exercises            | Refactor unificato workout tree                                     |

## P2 — pulizia incrementale

| Tabella            | Strategia                                                                 |
| ------------------ | ------------------------------------------------------------------------- |
| **marketing\_\***  | Rimuovere WITH CHECK true dove possibile; allineare org_id vs org_id_text |
| **notifications**  | CHECK su update                                                           |
| **web_vitals**     | Allineare admin a `is_admin()`                                            |
| **exercises**      | Allineare org_id_text vs org_id con resto org                             |
| **communications** | Ridurre duplicati quoted vs snake                                         |

## Dipendenze logiche

```
appointments → appointment_cancellations, calendar_blocks (indiretto), payments/credit_ledger
profiles → tutte le FK staff_id, athlete_id, created_by
org_id_text ↔ org_id → verificare in data.sql che siano sempre coerenti prima di unificare policy
```

## Prima tabella operativa consigliata

1. **appointment_cancellations** — intervento piccolo, impatto sicurezza immediato.  
   2 Subito dopo (o in parallelo pianificato): **appointments** — nodo centrale calendario.
