# Aree ad alto rischio (non toccare senza analisi)

| Area                                         | Perché                                                                                |
| -------------------------------------------- | ------------------------------------------------------------------------------------- |
| **RLS / policies Supabase**                  | Errori silenziosi o esposizione dati; ogni fix = SQL esplicito + conferma             |
| **`src/app/api/admin/users/route.ts`**       | DELETE cascata su più tabelle, impersonation, service role                            |
| **Impersonation**                            | `api/admin/impersonation/*`, cookie, RPC `start_impersonation` / `stop_impersonation` |
| **Marketing KPI / cron**                     | `refresh-marketing-kpis`, RPC, segreti CRON                                           |
| **Doppio modello atleta–trainer**            | `athlete_trainer_assignments` vs `trainer_athletes` vs sync legacy                    |
| **Middleware auth**                          | Redirect ruoli, sessioni; regressione = login rotto                                   |
| **`src/app/home/allenamenti/oggi/page.tsx`** | File enorme, molti punti di fallimento                                                |
| **Chat realtime**                            | `use-chat-realtime*`, cleanup sottoscrizioni                                          |
| **API debug esposta**                        | `api/debug-trainer-visibility` — rimuovere o proteggere solo dopo valutazione         |
