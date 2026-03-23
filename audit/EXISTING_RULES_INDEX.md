# Existing Rules Index

Inventario fonti **regole, documentazione operativa, workflow** (marzo 2026). Escluso il codice business. I path sono relativi alla root del repo.

## Premessa (metadati inventario)

- Path: `audit/EXISTING_RULES_INDEX.md` (questo file)
- Tipo: meta / indice
- Scopo: mappa fonti per evitare duplicati e conflitti tra nuove regole
- Valido: sì
- Duplicato: no (si incrocia con `audit/CANONICAL_SOURCES.md` e `audit/RULE_CONFLICTS.md` — complementari)
- Conflitti: no
- Note: `ai_memory/`, `project_memory/`, `project_tracker/`, `__project_logic_docs__/`, `backups/` sono **citate** in `.cursor/rules` ma **assenti** nel workspace attuale. Nessun `CONTRIBUTING.md` in root; vedi `DOCUMENTAZIONE/GUIDA_CONTRIBUTING.md`. Contenuto dei workflow `.github/workflows/*.y` non verificato byte-per-byte (permessi ambiente); classificazione da nome file.

---

## .cursor/rules/22club-project-rules.mdc

- Path: `.cursor/rules/22club-project-rules.mdc`
- Tipo: regole (agent / workspace, alwaysApply)
- Scopo: stack, cartelle modificabili vs vietate, DB/SQL, stile sviluppo, test, UI dark, design system, spaziatura dashboard
- Valido: sì
- Duplicato: parziale (`DOCUMENTAZIONE/GUIDA_CONTRIBUTING.md`, `audit/CANONICAL_SOURCES.md` sovrappongono concetti “codice vivo”)
- Conflitti: sì — vedi nota
- Note: **vs stesso file:** `docs/` marcato “non modificare” ma in repo esistono indici aggiornabili in `docs/indexes/` (tensione operativa). Path test: `e2e/` vs effettivo `tests/e2e/` (allineato in `audit/CANONICAL_SOURCES.md`).

## .cursor/settings.json

- Path: `.cursor/settings.json`
- Tipo: configurazione IDE (plugin)
- Scopo: abilitazione plugin Supabase in Cursor
- Valido: sì
- Duplicato: no
- Conflitti: no
- Note: non contiene regole testuali di progetto.

## .cursor/mcp.json

- Path: `.cursor/mcp.json`
- Tipo: configurazione MCP / segreti ambiente (URL progetto)
- Scopo: endpoint server MCP Supabase per l’agent
- Valido: sì (verificare ref progetto in ambiente reale)
- Duplicato: no
- Conflitti: no
- Note: dato sensibile/ambiente — non duplicare in doc pubblica.

---

## docs/DEPLOY_VERCEL.md

- Path: `docs/DEPLOY_VERCEL.md`
- Tipo: docs (deploy)
- Scopo: istruzioni deploy Vercel
- Valido: parziale (da incrociare con `DOCUMENTAZIONE/GUIDA_DEPLOYMENT.md`)
- Duplicato: parziale
- Conflitti: no
- Note: —

## docs/indexes/00_PROJECT_INDEX.md

- Path: `docs/indexes/00_PROJECT_INDEX.md`
- Tipo: docs (indice navigabile)
- Scopo: puntatori a cartelle codice, audit, regole agent, serie DOCUMENTAZIONE 01–12
- Valido: sì
- Duplicato: parziale (`audit/CANONICAL_SOURCES.md`, `DOCUMENTAZIONE/00_indice_dati_progetto.md`)
- Conflitti: parziale — regole Cursor scoraggiano modifica `docs/` mentre gli indici sono “viventi” per navigazione
- Note: —

## docs/indexes/01_MODULE_INDEX.md … 09_TESTS_INDEX.md

- Path: `docs/indexes/01_MODULE_INDEX.md`, `02_ROUTES_INDEX.md`, `03_FEATURES_INDEX.md`, `04_DATABASE_INDEX.md`, `05_COMPONENTS_INDEX.md`, `06_HOOKS_INDEX.md`, `07_AUTH_RBAC_INDEX.md`, `08_SERVICES_INDEX.md`, `09_TESTS_INDEX.md`
- Tipo: docs (indici)
- Scopo: mappa moduli, route, feature, DB, componenti, hook, auth, servizi, test
- Valido: sì (rigenerabili / da allineare al codice)
- Duplicato: parziale (sovrapposizione con file in `audit/*_clean.txt` citati in CANONICAL)
- Conflitti: come `00_PROJECT_INDEX.md`
- Note: nove file distinti, stesso ruolo macro.

---

## src/app/design-system/GUIDA_DESIGN_SYSTEM.md

- Path: `src/app/design-system/GUIDA_DESIGN_SYSTEM.md`
- Tipo: regole UI / reference design system
- Scopo: token, principi, struttura pagina `/design-system`, pattern coerenza UI
- Valido: sì
- Duplicato: parziale (regole spaziatura/UI anche in `.cursor/rules`)
- Conflitti: no
- Note: obbligo di aggiornamento esplicito in `.cursor/rules`.

---

## DOCUMENTAZIONE — serie architettura 00–12 (canonica citata)

- Path: `DOCUMENTAZIONE/00_indice_dati_progetto.md`, `01_architettura_generale.md`, `02_flussi_logici_applicazione.md`, `03_autenticazione_e_ruoli.md`, `04_routing_e_middleware.md`, `05_frontend_pagine_e_componenti.md`, `06_backend_api_e_servizi.md`, `07_database_supabase_e_rls.md`, `08_stato_globale_hooks_cache.md`, `09_test_e_affidabilita_e2e.md`, `10_performance_scalabilita.md`, `11_problemi_rilevati.md`, `12_suggerimenti_prioritizzati.md`
- Tipo: docs (architettura / stato)
- Scopo: panoramica tecnica ordinata del progetto
- Valido: parziale — `11_problemi_rilevati` vs fix storici in altri MD (vedi `audit/RULE_CONFLICTS.md`)
- Duplicato: no tra loro; sovrapposto a indici `docs/indexes/*`
- Conflitti: sì — backlog problemi vs doc FIX/RESOCONTO puntuali
- Note: tratte come “spina dorsale” in `audit/CANONICAL_SOURCES.md`.

---

## DOCUMENTAZIONE/README.md

- Path: `DOCUMENTAZIONE/README.md`
- Tipo: docs (export Supabase / comandi)
- Scopo: quick start export schema, riferimenti ad altri MD istruzioni
- Valido: parziale
- Duplicato: parziale (`README-SCHEMA.md`, `DOCUMENTAZIONE` vari su DB)
- Conflitti: no
- Note: non è README root repo.

## DOCUMENTAZIONE/README-SCHEMA.md

- Path: `DOCUMENTAZIONE/README-SCHEMA.md`
- Tipo: docs (schema DB)
- Scopo: schema / export — da incrociare con `supabase/migrations`
- Valido: parziale
- Duplicato: parziale (`SCHEMA-SOURCE-OF-TRUTH` citato in CANONICAL)
- Conflitti: no
- Note: —

## DOCUMENTAZIONE/README_BLOCCHI.md

- Path: `DOCUMENTAZIONE/README_BLOCCHI.md`
- Tipo: docs operativo
- Scopo: blocchi / procedure (titolo interno al file)
- Valido: parziale
- Duplicato: no
- Conflitti: no
- Note: —

## DOCUMENTAZIONE/README_ORDINE_ESECUZIONE_PULIZIA_FK.md

- Path: `DOCUMENTAZIONE/README_ORDINE_ESECUZIONE_PULIZIA_FK.md`
- Tipo: docs (procedure SQL/migrazioni)
- Scopo: ordine esecuzione pulizia FK
- Valido: parziale (dipende da migrazioni applicate)
- Duplicato: no
- Conflitti: no
- Note: —

## DOCUMENTAZIONE/README_20260301170000_verifica.md … README_20260301240000_staff_requests_hardening_verifica.md

- Path: `DOCUMENTAZIONE/README_20260301170000_verifica.md`, `README_20260301180000_payments_soft_delete_verifica.md`, `README_20260301190000_user_tombstone_verifica.md`, `README_20260301200000_audit_trail_extended_verifica.md`, `README_20260301210000_impersonation_verifica.md`, `README_20260301220000_org_uuid_migration_verifica.md`, `README_20260301230000_staff_requests_verifica.md`, `README_20260301240000_staff_requests_hardening_verifica.md`
- Tipo: docs (verifica post-change / checklist)
- Scopo: tracciamento verifiche per batch migrazione/feature datata
- Valido: parziale — storico per timestamp
- Duplicato: no
- Conflitti: no
- Note: otto file “README\_\*\_verifica”.

---

## DOCUMENTAZIONE — guide operative (_GUIDA_ e correlate)

Per ciascuno: Tipo = docs/workflow; **Duplicato** spesso **sì** tra guide che toccano deploy/test/types; **Conflitto** gestibile con priorità CANONICAL + regole Cursor.

| Path                                             | Scopo sintetico                           | Valido                                          |
| ------------------------------------------------ | ----------------------------------------- | ----------------------------------------------- |
| `GUIDA_CONTRIBUTING.md`                          | Workflow contribuzione, stack, PR, commit | parziale (es. nome cartella clone legacy)       |
| `GUIDA_DEPLOYMENT.md`                            | Deploy generale                           | parziale vs `docs/DEPLOY_VERCEL.md`             |
| `GUIDA_VERIFICHE_PRE_DEPLOY.md`                  | Checklist pre-deploy                      | sì                                              |
| `GUIDA_TROUBLESHOOTING.md`                       | Troubleshooting generale                  | parziale                                        |
| `GUIDA_TESTING.md`                               | Strategia test                            | parziale vs `09_test_e_affidabilita_e2e`        |
| `GUIDA_TEST_MANUALI_DETTAGLIATA.md`              | Test manuali                              | parziale                                        |
| `GUIDA_TEST_COMUNICAZIONI_CON_MOCK.md`           | Test comunicazioni mocking                | parziale                                        |
| `TEST_MANUALE_GUIDATO_QUERY_PROFILES.md`         | Test guidato profili                      | parziale                                        |
| `48_FASE_8_GUIDA_TEST_MANUALE.md`                | Fase 8 test manuale                       | storico                                         |
| `FASE9_TEST_MANUALI_GUIDA.md`                    | Fase 9 test                               | storico                                         |
| `FASE9_COMPLETAMENTO_GUIDA.md`                   | Completamento fase 9                      | storico                                         |
| `GUIDA_AUTENTICAZIONE_SUPABASE.md`               | Auth Supabase                             | parziale vs `03_autenticazione_e_ruoli`         |
| `GUIDA_CONFIGURAZIONE_PROVIDER_COMUNICAZIONI.md` | Provider email/comms                      | sì                                              |
| `GUIDA_CONFIGURAZIONE_VAPID_KEYS.md`             | VAPID push                                | sì                                              |
| `GUIDA_RIGENERAZIONE_TIPI_SUPABASE.md`           | Rigenera tipi                             | parziale vs `GUIDA_GENERAZIONE_TYPES.md`        |
| `GUIDA_GENERAZIONE_TYPES.md`                     | Generazione types                         | parziale (duplicato concettuale con precedente) |
| `GUIDA_BACKUP_COMPLETO.md`                       | Backup                                    | parziale                                        |
| `GUIDA_MONITORING.md`                            | Monitoring                                | parziale                                        |
| `GUIDA_PERFORMANCE.md`                           | Performance                               | parziale vs `10_performance_scalabilita`        |
| `GUIDA_SICUREZZA.md`                             | Sicurezza                                 | parziale vs `security.md`                       |
| `GUIDA_SEQUENZA_FIX.md`                          | Sequenza fix                              | storico                                         |
| `GUIDA_SEQUENZA_FIX_COMPLETA.md`                 | Sequenza fix estesa                       | storico                                         |
| `GUIDA_COMPLETA_FIX_18.md`                       | Fix batch “18”                            | storico                                         |
| `FIX_18_GUIDA_ESECUZIONE.md`                     | Esecuzione fix 18                         | storico                                         |
| `GUIDA_CREAZIONE_NUOVA_REPOSITORY.md`            | Nuovo repo                                | parziale                                        |
| `CAPACITOR_GUIDA_COMPLETA.md`                    | Mobile Capacitor                          | sì                                              |
| `SQL_ISOLAMENTO_PT_ATLETA_GUIDA_COMPLETA.md`     | Isolamento SQL PT/atleta                  | parziale                                        |
| `PAGE_AUDIT_STEP2_GUIDA.md`                      | Audit pagina step 2                       | storico                                         |
| `PAGE_AUDIT_FIX_RLS_PROFILES_GUIDA.md`           | Fix RLS profiles                          | storico                                         |
| `PAGE_AUDIT_FIX_RLS_PROFILES_POLICIES_GUIDA.md`  | Policies RLS profiles                     | storico                                         |
| `PAGE_AUDIT_FIX_APPOINTMENT_VISIBILITY_GUIDA.md` | Visibilità appuntamenti                   | storico                                         |
| `PAGE_AUDIT_FIX_STAFF_ID_MISMATCH_GUIDA.md`      | Staff id mismatch                         | storico                                         |

**Duplicato (aggregato):** sì — molte guide ripetono temi (test, deploy, types). **Conflitti:** no critici se si rispetta priorità “canonica” in `audit/CANONICAL_SOURCES.md`.

---

## DOCUMENTAZIONE/REGOLE_TECNICHE_CHAT.md

- Path: `DOCUMENTAZIONE/REGOLE_TECNICHE_CHAT.md`
- Tipo: regole tecniche (decisioni dominio, es. workout wizard, tipi appuntamento)
- Scopo: decisioni da chat consolidate testualmente
- Valido: parziale — da verificare vs codice attuale
- Duplicato: parziale (possibili overlap con audit appointment/RLS)
- Conflitti: no
- Note: utile come memo; non è fonte unica senza verifica codice.

## DOCUMENTAZIONE/GIT_HOOKS.md

- Path: `DOCUMENTAZIONE/GIT_HOOKS.md`
- Tipo: workflow (Husky / git hooks)
- Scopo: cosa eseguono pre-commit (format, lint, typecheck)
- Valido: sì (verificare che `.husky/*` coincida)
- Duplicato: parziale (`GUIDA_CONTRIBUTING.md` menziona qualità)
- Conflitti: no
- Note: —

## DOCUMENTAZIONE/security.md

- Path: `DOCUMENTAZIONE/security.md`
- Tipo: docs sicurezza
- Scopo: pratiche / note sicurezza progetto
- Valido: parziale
- Duplicato: parziale (`GUIDA_SICUREZZA.md`)
- Conflitti: no
- Note: non `SECURITY.md` root standard.

---

## DOCUMENTAZIONE — resto (~850+ file `.md`)

- Path: `DOCUMENTAZIONE/*.md` esclusi i gruppi elencati sopra (stima **~850 file** nel workspace)
- Tipo: docs / report / analisi / doc per singolo componente-hook-route (`*-component.md`, `*-hook.md`, `api-*-route.md`, PAGE_AUDIT, RESOCONTO, FIX, ANALISI, ecc.)
- Scopo: knowledge base estesa, tracciamento fix, reference micro-moduli
- Valido: parziale — molti file storici o generati
- Duplicato: sì — molteplici PAGE_AUDIT/FIX sullo stesso tema
- Conflitti: sì — verità multipla; mitigazione in `audit/RULE_CONFLICTS.md` (priorità serie 01–12 + audit)
- Note: non elencati uno per uno; pattern nominativo riconducibile a grep/glob.

---

## audit/CANONICAL_SOURCES.md

- Path: `audit/CANONICAL_SOURCES.md`
- Tipo: regole / mappa fonti
- Scopo: definisce codice vivo, indici, doc umana canonica, duplicazioni note
- Valido: sì
- Duplicato: parziale (`.cursor/rules`, `docs/indexes/00`)
- Conflitti: no
- Note: complementare alle regole agent.

## audit/RULE_CONFLICTS.md

- Path: `audit/RULE_CONFLICTS.md`
- Tipo: meta (conflitti)
- Scopo: tabella conflitti (ai_memory vs agent, ruoli, doc, trainer path, TODO)
- Valido: sì
- Duplicato: no
- Conflitti: (documenta conflitti — non ne crea)
- Note: da leggere prima di nuove policy.

## audit/NOTE_AI_MEMORY.md

- Path: `audit/NOTE_AI_MEMORY.md`
- Tipo: meta / workflow agent
- Scopo: spiega mirror `audit/operative_memory/` vs `ai_memory/` vietato
- Valido: sì
- Duplicato: no
- Conflitti: risolve tensione policy/destinazione file
- Note: —

## audit/operative_memory/current_status.md, next_steps.md, problem_list.md, recent_changes.md, touched_files.md, build_blockers.md, source_of_truth.md

- Path: `audit/operative_memory/*.md` (sette file)
- Tipo: workflow / stato sessioni
- Scopo: stato lavoro, prossimi passi, file toccati, blocker — sostituto operativo di `ai_memory/`
- Valido: parziale (dipende da ultimo aggiornamento manuale)
- Duplicato: parziale (`audit/BUILD_BLOCKERS.md` vs `operative_memory/build_blockers.md`)
- Conflitti: parziale — due `build_blockers` (root audit e operative_memory)
- Note: —

## audit/BUILD_BLOCKERS.md

- Path: `audit/BUILD_BLOCKERS.md`
- Tipo: workflow / stato build
- Scopo: blocchi compilazione
- Valido: parziale
- Duplicato: sì — `audit/operative_memory/build_blockers.md`
- Conflitti: sì — due fonti omonime; allineare o deprecare una
- Note: —

## audit/FEATURE_STATUS.md

- Path: `audit/FEATURE_STATUS.md`
- Tipo: docs stato prodotto
- Scopo: stato feature
- Valido: parziale
- Duplicato: parziale (`DOCUMENTAZIONE/IMPLEMENTATION_STATUS.md` e simili)
- Conflitti: no
- Note: —

## audit/PROJECT_DOMAINS.md

- Path: `audit/PROJECT_DOMAINS.md`
- Tipo: docs architettura
- Scopo: domini progetto
- Valido: parziale
- Duplicato: parziale (serie 01–12)
- Conflitti: no
- Note: —

## audit/HIGH_RISK_AREAS.md

- Path: `audit/HIGH_RISK_AREAS.md`
- Tipo: docs rischio
- Scopo: aree ad alto rischio modifica
- Valido: parziale
- Duplicato: no
- Conflitti: no
- Note: —

## audit/ROUTE_PROTECTION_MATRIX.md

- Path: `audit/ROUTE_PROTECTION_MATRIX.md`
- Tipo: docs auth/routing
- Scopo: matrice protezione route
- Valido: parziale — allineare a codice middleware
- Duplicato: parziale (`docs/indexes/07_AUTH_RBAC_INDEX.md`)
- Conflitti: no
- Note: —

## audit/AUTH_RBAC_GAP_ANALYSIS.md

- Path: `audit/AUTH_RBAC_GAP_ANALYSIS.md`
- Tipo: docs gap analysis
- Scopo: lacune RBAC
- Valido: parziale
- Duplicato: parziale (`07_AUTH_RBAC`, migrazioni)
- Conflitti: no
- Note: —

## audit/SUPABASE_USAGE_MAP.md, SUPABASE_PROBLEMS.md, SUPABASE_REFACTOR_CANDIDATES.md

- Path: `audit/SUPABASE_USAGE_MAP.md`, `audit/SUPABASE_PROBLEMS.md`, `audit/SUPABASE_REFACTOR_CANDIDATES.md`
- Tipo: docs backend / audit
- Scopo: uso client Supabase, problemi, candidati refactor
- Valido: parziale
- Duplicato: parziale (`07_database_supabase_e_rls.md`, `DOCUMENTAZIONE` tecnica)
- Conflitti: no
- Note: tre file distinti.

## audit/NEXT_PATCH_CANDIDATES.md, PATCH_BATCH_PLAN.md

- Path: `audit/NEXT_PATCH_CANDIDATES.md`, `audit/PATCH_BATCH_PLAN.md`
- Tipo: workflow pianificazione
- Scopo: patch e batch
- Valido: parziale
- Duplicato: parziale (altri PIANO\_\* in DOCUMENTAZIONE)
- Conflitti: no
- Note: —

## audit/APPOINTMENTS_DOMAIN_MAP.md, APPOINTMENTS_DUPLICATIONS.md, APPOINTMENTS_NEXT_BATCHES.md, APPOINTMENTS_OVERLAP_DECISION.md, APPOINTS_RPC_FINAL_SPEC.md

- Path: `audit/APPOINTMENTS_*.md`, `audit/APPOINTS_RPC_FINAL_SPEC.md`
- Tipo: docs dominio appuntamenti / decisioni
- Scopo: mappa, duplicazioni logiche, batch, overlap, spec RPC
- Valido: parziale
- Duplicato: parziale (doc appuntamenti anche in `DOCUMENTAZIONE`)
- Conflitti: no se coordinato con codice RPC
- Note: cinque file tema appointments.

## audit/rls/RLS_TABLE_MATRIX.md, RLS_DUPLICATES.md, RLS_BATCH_PLAN.md, RLS_NEXT_BATCH_PLAN.md, RLS_APPOINTMENTS_CLEANUP_PLAN.md, RLS_APPOINTMENTS_NEXT_FIXES.md, RLS_APPOINTMENT_CANCELLATIONS_FIX.md, RLS_APPOINTMENT_CANCELLATIONS_FIX_V2.md

- Path: `audit/rls/*.md` (sottoelenco)
- Tipo: docs / piano RLS
- Scopo: matrice tabelle RLS, duplicati policy, piani fix, appuntamenti/cancellazioni
- Valido: parziale — dipende da migrazioni
- Duplicato: parziale (`DOCUMENTAZIONE` SQL/RLS, `07_database`)
- Conflitti: parziale — versioni V1/V2 stesso tema cancellazioni
- Note: otto file in `audit/rls/`; **conflitto** potenziale tra fix V1 e V2 finché non si dichiara quale attiva.

## audit/rls/sql_proposto/README.md

- Path: `audit/rls/sql_proposto/README.md`
- Tipo: docs SQL proposto
- Scopo: istruzioni cartella SQL audit (non eseguire senza review — allineato regole Cursor DB)
- Valido: parziale
- Duplicato: no
- Conflitti: no
- Note: —

---

## .github/workflows/ci.yml

- Path: `.github/workflows/ci.yml`
- Tipo: workflow CI
- Scopo: pipeline integrazione continua (dettaglio dipende da YAML)
- Valido: presunto sì
- Duplicato: parziale (`ci-check.yml`)
- Conflitti: parziale — due workflow CI nel nome; verificare ridondanza
- Note: —

## .github/workflows/ci-check.yml

- Path: `.github/workflows/ci-check.yml`
- Tipo: workflow CI
- Scopo: check aggiuntivi / job leggeri
- Valido: presunto sì
- Duplicato: parziale (`ci.yml`)
- Conflitti: come sopra
- Note: —

## .github/workflows/e2e-tests.yml

- Path: `.github/workflows/e2e-tests.yml`
- Tipo: workflow test E2E
- Scopo: esecuzione Playwright in CI
- Valido: presunto sì
- Duplicato: parziale (`e2e-trainer-appointment-lifecycle.yml`)
- Conflitti: no
- Note: —

## .github/workflows/e2e-trainer-appointment-lifecycle.yml

- Path: `.github/workflows/e2e-trainer-appointment-lifecycle.yml`
- Tipo: workflow test E2E mirato
- Scopo: lifecycle appuntamenti trainer
- Valido: presunto sì
- Duplicato: parziale (altri E2E)
- Conflitti: no
- Note: —

## .github/workflows/deploy.yml

- Path: `.github/workflows/deploy.yml`
- Tipo: workflow deploy
- Scopo: rilascio ambiente
- Valido: presunto sì
- Duplicato: parziale (`pr-preview.yml`, `release.yml`, doc deploy)
- Conflitti: no
- Note: —

## .github/workflows/pr-preview.yml

- Path: `.github/workflows/pr-preview.yml`
- Tipo: workflow preview
- Scopo: preview PR
- Valido: presunto sì
- Duplicato: no
- Conflitti: no
- Note: —

## .github/workflows/release.yml

- Path: `.github/workflows/release.yml`
- Tipo: workflow release
- Scopo: rilascio versionato
- Valido: presunto sì
- Duplicato: parziale (`deploy.yml`)
- Conflitti: no
- Note: —

## .github/workflows/performance.yml

- Path: `.github/workflows/performance.yml`
- Tipo: workflow performance
- Scopo: job relativi performance
- Valido: presunto sì
- Duplicato: no
- Conflitti: no
- Note: —

## .github/workflows/codeql.yml

- Path: `.github/workflows/codeql.yml`
- Tipo: workflow sicurezza
- Scopo: analisi CodeQL
- Valido: presunto sì
- Duplicato: no
- Conflitti: no
- Note: —

## .github/dependabot.yml

- Path: `.github/dependabot.yml`
- Tipo: workflow automazione dipendenze
- Scopo: aggiornamenti dipendenze programmati
- Valido: presunto sì
- Duplicato: no
- Conflitti: no
- Note: —

---

## .vscode/settings.json, .vscode/extensions.json, .vscode/cpx.json

- Path: `.vscode/settings.json`, `.vscode/extensions.json`, `.vscode/cpx.json`
- Tipo: configurazione IDE
- Scopo: preferenze workspace, estensioni raccomandate, config CPX
- Valido: sconosciuto (file non letti in scan)
- Duplicato: parziale (`.cursor/settings.json` solo plugin)
- Conflitti: no
- Note: possono contenere regole formattazione team-level.

---

## Riepilogo conflitti / duplicati ad alta priorità

| Area                     | Problema                                                                       |
| ------------------------ | ------------------------------------------------------------------------------ |
| Policy Cursor vs `docs/` | Regola “non modificare docs” vs indici da aggiornare                           |
| Path E2E                 | `e2e/` in regole vs `tests/e2e/` reale                                         |
| Build blockers           | `audit/BUILD_BLOCKERS.md` vs `audit/operative_memory/build_blockers.md`        |
| RLS appointments         | `RLS_APPOINTMENT_CANCELLATIONS_FIX*.md` V1 vs V2                               |
| CONTRIBUTING             | Nessun root file; guide in `DOCUMENTAZIONE/` + overlap `.cursor`               |
| DOCUMENTAZIONE massa     | Centinaia di doc concorrenti stesso dominio — usare CANONICAL + RULE_CONFLICTS |

---

_Fine indice. Aggiornare questo file quando si aggiungono nuove fonti normative o workflow._
