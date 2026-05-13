# Runbook: stabilità sessione / rete (QA)

Eseguire prima di ogni release che tocca auth, React Query, Service Worker o Realtime.

## Costanti piattaforma (timing)

File unico: `src/lib/session-stability/platform-sync-constants.ts`

- `SESSION_QUERY_SYNC_DEBOUNCE_MS` — debounce invalidazione RQ + `router.refresh` dopo eventi sessione/JWT (`SessionQuerySync`).
- `PLATFORM_DATA_PULSE_MS` — intervallo pulse con tab visibile (`SessionDataPulse`): `getSession` + invalidazione whitelist `session-query-invalidation`.
- `AUTH_VISIBILITY_MIN_HIDDEN_MS` / `AUTH_VISIBILITY_RECOVERY_THROTTLE_MS` — recovery auth su visibility (`AuthProvider`).
- **`NEXT_PUBLIC_STAFF_DASHBOARD_REALTIME_DISABLE`** — lista opzionale (virgole): `appointments`, `profiles`, `notifications` per spegnere canali singoli senza disattivare tutto il layout.

**Wake Lock:** disattivato di default. Abilitare solo se serve al prodotto: variabile build `NEXT_PUBLIC_WAKE_LOCK=1` (vedi `WakeLockProvider`). L’oscuramento schermo resta governato da OS/browser.

**Wake Lock mirato (atleta):** durante sessione live su `/home/allenamenti/oggi`, il lock si attiva solo con timer recupero/circuito automazione/video ingrandito (`useWakeLock` in `live-workout-session-page.tsx`), non sulla sola lista esercizi.

**Realtime staff — rollback:** `NEXT_PUBLIC_STAFF_DASHBOARD_REALTIME=0` o `false` disattiva tutte le subscription del layout (`StaffDashboardRealtimeBindings` non montato). Per rollback parziale usare `NEXT_PUBLIC_STAFF_DASHBOARD_REALTIME_DISABLE` (vedi costanti).

**Subscribe tabella (client):** più listener sulla stessa tabella condividono un canale (`postgres_changes` `*` + dispatch); il canale si chiude solo quando non restano listener (`subscribeToTable` in `realtimeClient.ts`).

**SessionQuerySync:** `router.refresh` viene eseguito solo su evento `session-resumed` (e tab visibile), non su `auth-token-refreshed` (invalidazione React Query resta attiva su entrambi).

**Realtime osservabilità:** chiusura canale per `CHANNEL_ERROR` / `TIMED_OUT` / `CLOSED` → breadcrumb Sentry `session_stability.realtime` con `status` e nome canale (senza payload riga).

## Ambiente

- iOS Safari (iPhone o iPad): PWA o browser, con e senza notifiche push (SW registrato).
- Android Chrome: stesso dual test.
- Desktop: Chrome.

## Scenari (circa 15–30 minuti)

1. **Login** → apri una dashboard con lista dati (clienti o calendario).
2. **Background 3+ minuti**: passa ad altra app o spegni schermo.
3. **Foreground**: verifica che liste si aggiornino o restino coerenti; esegui un’azione di lettura (apri dettaglio) e una **scrittura** leggera se possibile.
4. **Modalità aereo** 10s → disattiva: deve comparire stato connessione; i dati devono poter ricaricarsi con “Riprova” / refetch senza chiudere il tab.
5. **Console / Sentry**: nessun errore non spiegato su auth; eventuali breadcrumb `session_stability.*` coerenti con i passi. Su issue Sentry verificare tag `app.route`, `app.role`, `app.org_id` (nessun PII).

## Matrice dispositivo — scrittura per ruolo (1–2 flussi)

Ripetere su **iPhone Safari**, **Android Chrome**, **tablet landscape** dove possibile.

| Ruolo                                   | Flusso scrittura suggerito                                                      | Cosa verificare                                                     |
| --------------------------------------- | ------------------------------------------------------------------------------- | ------------------------------------------------------------------- |
| Admin / staff                           | Modifica o annullamento appuntamento con rete **on → aereo** a metà salvataggio | Toast “in coda”; dopo ripristino rete dati allineati (flush coda)   |
| Qualsiasi ruolo                         | Segna notifica letta / “segna tutte” con rete instabile                         | Toast in coda; dopo online le notifiche risultano lette lato server |
| Trainer / nutrizionista / massaggiatore | Stessa idea su una schermata con appuntamenti o nota breve                      | Nessun “non ha salvato” silenzioso; lista coerente dopo foreground  |
| Atleta                                  | Salvataggio rapido su form home (es. preferenze o nota se presente)             | Tastiera non rompe CTA; scroll usabile                              |

Annotare PASS/FAIL per combinazione dispositivo × ruolo.

## Esito

Annotare: dispositivo, versione build, PASS/FAIL per ogni scenario e note (es. 429, offline lungo).

---

## Matrice route (URL, file, layout, tier)

Rigenerare la tabella con:

`node scripts/generate-session-stability-route-matrix.mjs`

**Tier**: L = basso (contenuti statici / poche chiamate), M = medio (auth, onboarding, dashboard generica), H = alto (allenamenti, progressi, embed, marketing, calendario, pagamenti, clienti, staff verticale).

Il contenuto sotto è la copia generata al momento dell’implementazione del piano (allineare al comando sopra prima del release se le route cambiano).

<!-- BEGIN_ROUTE_MATRIX -->

| Tier | URL                                                                    | File                                                                                   | Layout chain                                                                              |
| ---- | ---------------------------------------------------------------------- | -------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| M    | `/dashboard/abbonamenti`                                               | `src/app/dashboard/abbonamenti/page.tsx`                                               | layout.tsx -> dashboard/layout.tsx                                                        |
| M    | `/dashboard/admin/organizzazioni`                                      | `src/app/dashboard/admin/organizzazioni/page.tsx`                                      | layout.tsx -> dashboard/layout.tsx -> dashboard/admin/layout.tsx                          |
| M    | `/dashboard/admin`                                                     | `src/app/dashboard/admin/page.tsx`                                                     | layout.tsx -> dashboard/layout.tsx -> dashboard/admin/layout.tsx                          |
| M    | `/dashboard/admin/ruoli`                                               | `src/app/dashboard/admin/ruoli/page.tsx`                                               | layout.tsx -> dashboard/layout.tsx -> dashboard/admin/layout.tsx                          |
| M    | `/dashboard/admin/statistiche`                                         | `src/app/dashboard/admin/statistiche/page.tsx`                                         | layout.tsx -> dashboard/layout.tsx -> dashboard/admin/layout.tsx                          |
| M    | `/dashboard/admin/utenti/marketing`                                    | `src/app/dashboard/admin/utenti/marketing/page.tsx`                                    | layout.tsx -> dashboard/layout.tsx -> dashboard/admin/layout.tsx                          |
| M    | `/dashboard/admin/utenti`                                              | `src/app/dashboard/admin/utenti/page.tsx`                                              | layout.tsx -> dashboard/layout.tsx -> dashboard/admin/layout.tsx                          |
| H    | `/dashboard/allenamenti`                                               | `src/app/dashboard/allenamenti/page.tsx`                                               | layout.tsx -> dashboard/layout.tsx -> dashboard/allenamenti/layout.tsx                    |
| H    | `/dashboard/appuntamenti`                                              | `src/app/dashboard/appuntamenti/page.tsx`                                              | layout.tsx -> dashboard/layout.tsx                                                        |
| H    | `/dashboard/atleti/[id]`                                               | `src/app/dashboard/atleti/[id]/page.tsx`                                               | layout.tsx -> dashboard/layout.tsx                                                        |
| H    | `/dashboard/atleti/[id]/progressi/allenamenti/[exerciseId]`            | `src/app/dashboard/atleti/[id]/progressi/allenamenti/[exerciseId]/page.tsx`            | layout.tsx -> dashboard/layout.tsx                                                        |
| H    | `/dashboard/atleti/[id]/progressi/allenamenti`                         | `src/app/dashboard/atleti/[id]/progressi/allenamenti/page.tsx`                         | layout.tsx -> dashboard/layout.tsx                                                        |
| H    | `/dashboard/atleti/[id]/progressi/foto`                                | `src/app/dashboard/atleti/[id]/progressi/foto/page.tsx`                                | layout.tsx -> dashboard/layout.tsx                                                        |
| H    | `/dashboard/atleti/[id]/progressi/misurazioni/[field]`                 | `src/app/dashboard/atleti/[id]/progressi/misurazioni/[field]/page.tsx`                 | layout.tsx -> dashboard/layout.tsx                                                        |
| H    | `/dashboard/atleti/[id]/progressi/misurazioni`                         | `src/app/dashboard/atleti/[id]/progressi/misurazioni/page.tsx`                         | layout.tsx -> dashboard/layout.tsx                                                        |
| H    | `/dashboard/atleti/[id]/progressi`                                     | `src/app/dashboard/atleti/[id]/progressi/page.tsx`                                     | layout.tsx -> dashboard/layout.tsx                                                        |
| H    | `/dashboard/atleti/[id]/progressi/storico/appuntamenti`                | `src/app/dashboard/atleti/[id]/progressi/storico/appuntamenti/page.tsx`                | layout.tsx -> dashboard/layout.tsx -> dashboard/atleti/[id]/progressi/storico/layout.tsx  |
| H    | `/dashboard/atleti/[id]/progressi/storico/completati`                  | `src/app/dashboard/atleti/[id]/progressi/storico/completati/page.tsx`                  | layout.tsx -> dashboard/layout.tsx -> dashboard/atleti/[id]/progressi/storico/layout.tsx  |
| H    | `/dashboard/atleti/[id]/progressi/storico`                             | `src/app/dashboard/atleti/[id]/progressi/storico/page.tsx`                             | layout.tsx -> dashboard/layout.tsx -> dashboard/atleti/[id]/progressi/storico/layout.tsx  |
| H    | `/dashboard/atleti/[id]/progressi/storico/schede`                      | `src/app/dashboard/atleti/[id]/progressi/storico/schede/page.tsx`                      | layout.tsx -> dashboard/layout.tsx -> dashboard/atleti/[id]/progressi/storico/layout.tsx  |
| H    | `/dashboard/atleti/[id]/progressi/storico/sessioni-aperte`             | `src/app/dashboard/atleti/[id]/progressi/storico/sessioni-aperte/page.tsx`             | layout.tsx -> dashboard/layout.tsx -> dashboard/atleti/[id]/progressi/storico/layout.tsx  |
| H    | `/dashboard/calendario/impostazioni`                                   | `src/app/dashboard/calendario/impostazioni/page.tsx`                                   | layout.tsx -> dashboard/layout.tsx -> dashboard/calendario/layout.tsx                     |
| H    | `/dashboard/calendario`                                                | `src/app/dashboard/calendario/page.tsx`                                                | layout.tsx -> dashboard/layout.tsx -> dashboard/calendario/layout.tsx                     |
| M    | `/dashboard/chat`                                                      | `src/app/dashboard/chat/page.tsx`                                                      | layout.tsx -> dashboard/layout.tsx -> dashboard/chat/layout.tsx                           |
| H    | `/dashboard/clienti`                                                   | `src/app/dashboard/clienti/page.tsx`                                                   | layout.tsx -> dashboard/layout.tsx -> dashboard/clienti/layout.tsx                        |
| M    | `/dashboard/comunicazioni`                                             | `src/app/dashboard/comunicazioni/page.tsx`                                             | layout.tsx -> dashboard/layout.tsx                                                        |
| M    | `/dashboard/comunicazioni/template`                                    | `src/app/dashboard/comunicazioni/template/page.tsx`                                    | layout.tsx -> dashboard/layout.tsx                                                        |
| M    | `/dashboard/database`                                                  | `src/app/dashboard/database/page.tsx`                                                  | layout.tsx -> dashboard/layout.tsx                                                        |
| M    | `/dashboard/documenti`                                                 | `src/app/dashboard/documenti/page.tsx`                                                 | layout.tsx -> dashboard/layout.tsx                                                        |
| M    | `/dashboard/esercizi`                                                  | `src/app/dashboard/esercizi/page.tsx`                                                  | layout.tsx -> dashboard/layout.tsx                                                        |
| M    | `/dashboard/impostazioni`                                              | `src/app/dashboard/impostazioni/page.tsx`                                              | layout.tsx -> dashboard/layout.tsx -> dashboard/impostazioni/layout.tsx                   |
| M    | `/dashboard/invita-atleta`                                             | `src/app/dashboard/invita-atleta/page.tsx`                                             | layout.tsx -> dashboard/layout.tsx                                                        |
| H    | `/dashboard/marketing/analytics`                                       | `src/app/dashboard/marketing/analytics/page.tsx`                                       | layout.tsx -> dashboard/layout.tsx                                                        |
| H    | `/dashboard/marketing/athletes`                                        | `src/app/dashboard/marketing/athletes/page.tsx`                                        | layout.tsx -> dashboard/layout.tsx                                                        |
| H    | `/dashboard/marketing/automations/[id]`                                | `src/app/dashboard/marketing/automations/[id]/page.tsx`                                | layout.tsx -> dashboard/layout.tsx                                                        |
| H    | `/dashboard/marketing/automations/new`                                 | `src/app/dashboard/marketing/automations/new/page.tsx`                                 | layout.tsx -> dashboard/layout.tsx                                                        |
| H    | `/dashboard/marketing/automations`                                     | `src/app/dashboard/marketing/automations/page.tsx`                                     | layout.tsx -> dashboard/layout.tsx                                                        |
| H    | `/dashboard/marketing/campaigns/[id]/edit`                             | `src/app/dashboard/marketing/campaigns/[id]/edit/page.tsx`                             | layout.tsx -> dashboard/layout.tsx                                                        |
| H    | `/dashboard/marketing/campaigns/[id]`                                  | `src/app/dashboard/marketing/campaigns/[id]/page.tsx`                                  | layout.tsx -> dashboard/layout.tsx                                                        |
| H    | `/dashboard/marketing/campaigns/new`                                   | `src/app/dashboard/marketing/campaigns/new/page.tsx`                                   | layout.tsx -> dashboard/layout.tsx                                                        |
| H    | `/dashboard/marketing/campaigns`                                       | `src/app/dashboard/marketing/campaigns/page.tsx`                                       | layout.tsx -> dashboard/layout.tsx                                                        |
| H    | `/dashboard/marketing/impostazioni`                                    | `src/app/dashboard/marketing/impostazioni/page.tsx`                                    | layout.tsx -> dashboard/layout.tsx                                                        |
| H    | `/dashboard/marketing/leads/[id]`                                      | `src/app/dashboard/marketing/leads/[id]/page.tsx`                                      | layout.tsx -> dashboard/layout.tsx                                                        |
| H    | `/dashboard/marketing/leads`                                           | `src/app/dashboard/marketing/leads/page.tsx`                                           | layout.tsx -> dashboard/layout.tsx                                                        |
| H    | `/dashboard/marketing`                                                 | `src/app/dashboard/marketing/page.tsx`                                                 | layout.tsx -> dashboard/layout.tsx                                                        |
| H    | `/dashboard/marketing/report`                                          | `src/app/dashboard/marketing/report/page.tsx`                                          | layout.tsx -> dashboard/layout.tsx                                                        |
| H    | `/dashboard/marketing/segments/[id]/edit`                              | `src/app/dashboard/marketing/segments/[id]/edit/page.tsx`                              | layout.tsx -> dashboard/layout.tsx                                                        |
| H    | `/dashboard/marketing/segments/[id]`                                   | `src/app/dashboard/marketing/segments/[id]/page.tsx`                                   | layout.tsx -> dashboard/layout.tsx                                                        |
| H    | `/dashboard/marketing/segments/new`                                    | `src/app/dashboard/marketing/segments/new/page.tsx`                                    | layout.tsx -> dashboard/layout.tsx                                                        |
| H    | `/dashboard/marketing/segments`                                        | `src/app/dashboard/marketing/segments/page.tsx`                                        | layout.tsx -> dashboard/layout.tsx                                                        |
| H    | `/dashboard/massaggiatore/abbonamenti`                                 | `src/app/dashboard/massaggiatore/abbonamenti/page.tsx`                                 | layout.tsx -> dashboard/layout.tsx -> dashboard/massaggiatore/layout.tsx                  |
| H    | `/dashboard/massaggiatore/appuntamenti`                                | `src/app/dashboard/massaggiatore/appuntamenti/page.tsx`                                | layout.tsx -> dashboard/layout.tsx -> dashboard/massaggiatore/layout.tsx                  |
| H    | `/dashboard/massaggiatore/calendario`                                  | `src/app/dashboard/massaggiatore/calendario/page.tsx`                                  | layout.tsx -> dashboard/layout.tsx -> dashboard/massaggiatore/layout.tsx                  |
| H    | `/dashboard/massaggiatore/chat`                                        | `src/app/dashboard/massaggiatore/chat/page.tsx`                                        | layout.tsx -> dashboard/layout.tsx -> dashboard/massaggiatore/layout.tsx                  |
| H    | `/dashboard/massaggiatore/clienti/[id]`                                | `src/app/dashboard/massaggiatore/clienti/[id]/page.tsx`                                | layout.tsx -> dashboard/layout.tsx -> dashboard/massaggiatore/layout.tsx                  |
| H    | `/dashboard/massaggiatore/clienti`                                     | `src/app/dashboard/massaggiatore/clienti/page.tsx`                                     | layout.tsx -> dashboard/layout.tsx -> dashboard/massaggiatore/layout.tsx                  |
| H    | `/dashboard/massaggiatore/impostazioni`                                | `src/app/dashboard/massaggiatore/impostazioni/page.tsx`                                | layout.tsx -> dashboard/layout.tsx -> dashboard/massaggiatore/layout.tsx                  |
| H    | `/dashboard/massaggiatore`                                             | `src/app/dashboard/massaggiatore/page.tsx`                                             | layout.tsx -> dashboard/layout.tsx -> dashboard/massaggiatore/layout.tsx                  |
| H    | `/dashboard/massaggiatore/profilo`                                     | `src/app/dashboard/massaggiatore/profilo/page.tsx`                                     | layout.tsx -> dashboard/layout.tsx -> dashboard/massaggiatore/layout.tsx                  |
| H    | `/dashboard/massaggiatore/statistiche`                                 | `src/app/dashboard/massaggiatore/statistiche/page.tsx`                                 | layout.tsx -> dashboard/layout.tsx -> dashboard/massaggiatore/layout.tsx                  |
| M    | `/dashboard/notifiche`                                                 | `src/app/dashboard/notifiche/page.tsx`                                                 | layout.tsx -> dashboard/layout.tsx                                                        |
| H    | `/dashboard/nutrizionista/abbonamenti`                                 | `src/app/dashboard/nutrizionista/abbonamenti/page.tsx`                                 | layout.tsx -> dashboard/layout.tsx -> dashboard/nutrizionista/layout.tsx                  |
| H    | `/dashboard/nutrizionista/analisi`                                     | `src/app/dashboard/nutrizionista/analisi/page.tsx`                                     | layout.tsx -> dashboard/layout.tsx -> dashboard/nutrizionista/layout.tsx                  |
| H    | `/dashboard/nutrizionista/atleti/[id]`                                 | `src/app/dashboard/nutrizionista/atleti/[id]/page.tsx`                                 | layout.tsx -> dashboard/layout.tsx -> dashboard/nutrizionista/layout.tsx                  |
| H    | `/dashboard/nutrizionista/atleti`                                      | `src/app/dashboard/nutrizionista/atleti/page.tsx`                                      | layout.tsx -> dashboard/layout.tsx -> dashboard/nutrizionista/layout.tsx                  |
| H    | `/dashboard/nutrizionista/calendario`                                  | `src/app/dashboard/nutrizionista/calendario/page.tsx`                                  | layout.tsx -> dashboard/layout.tsx -> dashboard/nutrizionista/layout.tsx                  |
| H    | `/dashboard/nutrizionista/chat`                                        | `src/app/dashboard/nutrizionista/chat/page.tsx`                                        | layout.tsx -> dashboard/layout.tsx -> dashboard/nutrizionista/layout.tsx                  |
| H    | `/dashboard/nutrizionista/checkin/[id]`                                | `src/app/dashboard/nutrizionista/checkin/[id]/page.tsx`                                | layout.tsx -> dashboard/layout.tsx -> dashboard/nutrizionista/layout.tsx                  |
| H    | `/dashboard/nutrizionista/checkin`                                     | `src/app/dashboard/nutrizionista/checkin/page.tsx`                                     | layout.tsx -> dashboard/layout.tsx -> dashboard/nutrizionista/layout.tsx                  |
| H    | `/dashboard/nutrizionista/documenti`                                   | `src/app/dashboard/nutrizionista/documenti/page.tsx`                                   | layout.tsx -> dashboard/layout.tsx -> dashboard/nutrizionista/layout.tsx                  |
| H    | `/dashboard/nutrizionista/impostazioni`                                | `src/app/dashboard/nutrizionista/impostazioni/page.tsx`                                | layout.tsx -> dashboard/layout.tsx -> dashboard/nutrizionista/layout.tsx                  |
| H    | `/dashboard/nutrizionista`                                             | `src/app/dashboard/nutrizionista/page.tsx`                                             | layout.tsx -> dashboard/layout.tsx -> dashboard/nutrizionista/layout.tsx                  |
| H    | `/dashboard/nutrizionista/piani/nuovo`                                 | `src/app/dashboard/nutrizionista/piani/nuovo/page.tsx`                                 | layout.tsx -> dashboard/layout.tsx -> dashboard/nutrizionista/layout.tsx                  |
| H    | `/dashboard/nutrizionista/piani`                                       | `src/app/dashboard/nutrizionista/piani/page.tsx`                                       | layout.tsx -> dashboard/layout.tsx -> dashboard/nutrizionista/layout.tsx                  |
| H    | `/dashboard/nutrizionista/progressi`                                   | `src/app/dashboard/nutrizionista/progressi/page.tsx`                                   | layout.tsx -> dashboard/layout.tsx -> dashboard/nutrizionista/layout.tsx                  |
| H    | `/dashboard/pagamenti/atleta/[athleteId]`                              | `src/app/dashboard/pagamenti/atleta/[athleteId]/page.tsx`                              | layout.tsx -> dashboard/layout.tsx                                                        |
| H    | `/dashboard/pagamenti`                                                 | `src/app/dashboard/pagamenti/page.tsx`                                                 | layout.tsx -> dashboard/layout.tsx                                                        |
| L    | `/dashboard`                                                           | `src/app/dashboard/page.tsx`                                                           | layout.tsx -> dashboard/layout.tsx                                                        |
| H    | `/dashboard/prenotazioni/atleti/[id]`                                  | `src/app/dashboard/prenotazioni/atleti/[id]/page.tsx`                                  | layout.tsx -> dashboard/layout.tsx                                                        |
| H    | `/dashboard/prenotazioni`                                              | `src/app/dashboard/prenotazioni/page.tsx`                                              | layout.tsx -> dashboard/layout.tsx                                                        |
| M    | `/dashboard/profilo`                                                   | `src/app/dashboard/profilo/page.tsx`                                                   | layout.tsx -> dashboard/layout.tsx -> dashboard/profilo/layout.tsx                        |
| H    | `/dashboard/schede/[id]/modifica`                                      | `src/app/dashboard/schede/[id]/modifica/page.tsx`                                      | layout.tsx -> dashboard/layout.tsx                                                        |
| H    | `/dashboard/schede/nuova`                                              | `src/app/dashboard/schede/nuova/page.tsx`                                              | layout.tsx -> dashboard/layout.tsx                                                        |
| H    | `/dashboard/schede`                                                    | `src/app/dashboard/schede/page.tsx`                                                    | layout.tsx -> dashboard/layout.tsx                                                        |
| M    | `/dashboard/statistiche`                                               | `src/app/dashboard/statistiche/page.tsx`                                               | layout.tsx -> dashboard/layout.tsx                                                        |
| H    | `/dashboard/workouts`                                                  | `src/app/dashboard/workouts/@slot1/page.tsx`                                           | layout.tsx -> dashboard/layout.tsx -> dashboard/workouts/layout.tsx                       |
| H    | `/dashboard/workouts`                                                  | `src/app/dashboard/workouts/@slot2/page.tsx`                                           | layout.tsx -> dashboard/layout.tsx -> dashboard/workouts/layout.tsx                       |
| H    | `/dashboard/workouts`                                                  | `src/app/dashboard/workouts/page.tsx`                                                  | layout.tsx -> dashboard/layout.tsx -> dashboard/workouts/layout.tsx                       |
| L    | `/design-system`                                                       | `src/app/design-system/page.tsx`                                                       | layout.tsx -> design-system/layout.tsx                                                    |
| H    | `/embed/athlete-allenamenti/[athleteProfileId]/[id]/giorno/[dayId]`    | `src/app/embed/athlete-allenamenti/[athleteProfileId]/[id]/giorno/[dayId]/page.tsx`    | layout.tsx -> embed/layout.tsx -> embed/athlete-allenamenti/[athleteProfileId]/layout.tsx |
| H    | `/embed/athlete-allenamenti/[athleteProfileId]/[id]`                   | `src/app/embed/athlete-allenamenti/[athleteProfileId]/[id]/page.tsx`                   | layout.tsx -> embed/layout.tsx -> embed/athlete-allenamenti/[athleteProfileId]/layout.tsx |
| H    | `/embed/athlete-allenamenti/[athleteProfileId]/esercizio/[exerciseId]` | `src/app/embed/athlete-allenamenti/[athleteProfileId]/esercizio/[exerciseId]/page.tsx` | layout.tsx -> embed/layout.tsx -> embed/athlete-allenamenti/[athleteProfileId]/layout.tsx |
| H    | `/embed/athlete-allenamenti/[athleteProfileId]/oggi`                   | `src/app/embed/athlete-allenamenti/[athleteProfileId]/oggi/page.tsx`                   | layout.tsx -> embed/layout.tsx -> embed/athlete-allenamenti/[athleteProfileId]/layout.tsx |
| H    | `/embed/athlete-allenamenti/[athleteProfileId]`                        | `src/app/embed/athlete-allenamenti/[athleteProfileId]/page.tsx`                        | layout.tsx -> embed/layout.tsx -> embed/athlete-allenamenti/[athleteProfileId]/layout.tsx |
| H    | `/embed/athlete-allenamenti/[athleteProfileId]/riepilogo`              | `src/app/embed/athlete-allenamenti/[athleteProfileId]/riepilogo/page.tsx`              | layout.tsx -> embed/layout.tsx -> embed/athlete-allenamenti/[athleteProfileId]/layout.tsx |
| M    | `/forgot-password`                                                     | `src/app/forgot-password/page.tsx`                                                     | layout.tsx -> forgot-password/layout.tsx                                                  |
| H    | `/home/allenamenti/[id]/giorno/[dayId]`                                | `src/app/home/allenamenti/[id]/giorno/[dayId]/page.tsx`                                | layout.tsx -> home/layout.tsx                                                             |
| H    | `/home/allenamenti/[id]`                                               | `src/app/home/allenamenti/[id]/page.tsx`                                               | layout.tsx -> home/layout.tsx                                                             |
| H    | `/home/allenamenti/esercizio/[exerciseId]`                             | `src/app/home/allenamenti/esercizio/[exerciseId]/page.tsx`                             | layout.tsx -> home/layout.tsx                                                             |
| H    | `/home/allenamenti/oggi`                                               | `src/app/home/allenamenti/oggi/page.tsx`                                               | layout.tsx -> home/layout.tsx                                                             |
| H    | `/home/allenamenti`                                                    | `src/app/home/allenamenti/page.tsx`                                                    | layout.tsx -> home/layout.tsx                                                             |
| H    | `/home/allenamenti/riepilogo`                                          | `src/app/home/allenamenti/riepilogo/page.tsx`                                          | layout.tsx -> home/layout.tsx                                                             |
| H    | `/home/appuntamenti`                                                   | `src/app/home/appuntamenti/page.tsx`                                                   | layout.tsx -> home/layout.tsx                                                             |
| H    | `/home/chat`                                                           | `src/app/home/chat/page.tsx`                                                           | layout.tsx -> home/layout.tsx                                                             |
| H    | `/home/documenti`                                                      | `src/app/home/documenti/page.tsx`                                                      | layout.tsx -> home/layout.tsx                                                             |
| L    | `/home/foto-risultati/aggiungi`                                        | `src/app/home/foto-risultati/aggiungi/page.tsx`                                        | layout.tsx -> home/layout.tsx                                                             |
| L    | `/home/foto-risultati`                                                 | `src/app/home/foto-risultati/page.tsx`                                                 | layout.tsx -> home/layout.tsx                                                             |
| M    | `/home/massaggiatore`                                                  | `src/app/home/massaggiatore/page.tsx`                                                  | layout.tsx -> home/layout.tsx                                                             |
| M    | `/home/nutrizionista`                                                  | `src/app/home/nutrizionista/page.tsx`                                                  | layout.tsx -> home/layout.tsx                                                             |
| H    | `/home/pagamenti`                                                      | `src/app/home/pagamenti/page.tsx`                                                      | layout.tsx -> home/layout.tsx                                                             |
| L    | `/home`                                                                | `src/app/home/page.tsx`                                                                | layout.tsx -> home/layout.tsx                                                             |
| M    | `/home/profilo`                                                        | `src/app/home/profilo/page.tsx`                                                        | layout.tsx -> home/layout.tsx                                                             |
| H    | `/home/progressi/allenamenti/[exerciseId]`                             | `src/app/home/progressi/allenamenti/[exerciseId]/page.tsx`                             | layout.tsx -> home/layout.tsx                                                             |
| H    | `/home/progressi/allenamenti`                                          | `src/app/home/progressi/allenamenti/page.tsx`                                          | layout.tsx -> home/layout.tsx                                                             |
| H    | `/home/progressi/foto`                                                 | `src/app/home/progressi/foto/page.tsx`                                                 | layout.tsx -> home/layout.tsx                                                             |
| H    | `/home/progressi/misurazioni/[field]`                                  | `src/app/home/progressi/misurazioni/[field]/page.tsx`                                  | layout.tsx -> home/layout.tsx                                                             |
| H    | `/home/progressi/misurazioni`                                          | `src/app/home/progressi/misurazioni/page.tsx`                                          | layout.tsx -> home/layout.tsx                                                             |
| H    | `/home/progressi/nuovo`                                                | `src/app/home/progressi/nuovo/page.tsx`                                                | layout.tsx -> home/layout.tsx                                                             |
| H    | `/home/progressi`                                                      | `src/app/home/progressi/page.tsx`                                                      | layout.tsx -> home/layout.tsx                                                             |
| H    | `/home/progressi/storico`                                              | `src/app/home/progressi/storico/page.tsx`                                              | layout.tsx -> home/layout.tsx                                                             |
| M    | `/home/trainer`                                                        | `src/app/home/trainer/page.tsx`                                                        | layout.tsx -> home/layout.tsx                                                             |
| M    | `/login`                                                               | `src/app/login/page.tsx`                                                               | layout.tsx -> login/layout.tsx                                                            |
| L    | `/`                                                                    | `src/app/page.tsx`                                                                     | layout.tsx                                                                                |
| M    | `/post-login`                                                          | `src/app/post-login/page.tsx`                                                          | layout.tsx -> post-login/layout.tsx                                                       |
| L    | `/privacy`                                                             | `src/app/privacy/page.tsx`                                                             | layout.tsx -> privacy/layout.tsx                                                          |
| M    | `/registrati`                                                          | `src/app/registrati/page.tsx`                                                          | layout.tsx -> registrati/layout.tsx                                                       |
| M    | `/reset-password`                                                      | `src/app/reset-password/page.tsx`                                                      | layout.tsx -> reset-password/layout.tsx                                                   |
| L    | `/sentry-example-page`                                                 | `src/app/sentry-example-page/page.tsx`                                                 | layout.tsx -> sentry-example-page/layout.tsx                                              |
| L    | `/termini`                                                             | `src/app/termini/page.tsx`                                                             | layout.tsx -> termini/layout.tsx                                                          |
| M    | `/welcome`                                                             | `src/app/welcome/page.tsx`                                                             | layout.tsx -> welcome/layout.tsx                                                          |

**Totale route:** 130

<!-- END_ROUTE_MATRIX -->

## Inventario mutazioni client (classificazione)

Aggiornare questo elenco quando si aggiungono flussi di scrittura sensibili alla rete.

### Livello 1 — Coda offline (`pending-write-queue`)

| Kind                                                     | Origine                  | Note                                                    |
| -------------------------------------------------------- | ------------------------ | ------------------------------------------------------- |
| `appointments_update`, `appointments_cancel`             | `useAthleteAppointments` | Atleta                                                  |
| `notifications_mark_read`, `notifications_mark_all_read` | `use-notifications`      |                                                         |
| `workout_logs_update`, `workout_logs_delete`             | `use-allenamenti`        | Atleta: update/delete `workout_logs` su fallimento rete |

### Livello 2 — `useMutation` TanStack senza coda (retry via `executeSupabaseCall` / UX errore)

| File                                         | Uso                                                                 |
| -------------------------------------------- | ------------------------------------------------------------------- |
| `src/hooks/athlete-profile/use-athlete-*.ts` | Salvataggi tab profilo atleta                                       |
| `src/hooks/useAthleteAppointments.ts`        | `create` / `delete` appuntamento (non in coda; valutare estensione) |

### Livello 3 — Scritture `supabase.from(...).insert/update/delete` in `page.tsx` o componenti

Esempi: dashboard marketing (campaigns, segments, automations), nutrizionista (documenti, check-in, progressi), `home/allenamenti/oggi` (`workout_sets`), dashboard esercizi, impostazioni profilo, modali pagamenti, `settings-trainer-profile-tab`, liste progressi (`misurazione-valori-by-date-list`, `workout-exercise-sessioni-by-date-list`). **Strategia consigliata**: estrarre in hook + messaggio “non salvato” / retry, oppure estendere la coda solo dove l’idempotenza è chiara.

### Livello 4 — Hook calendario / staff

| File                                                                      | Operazioni                 |
| ------------------------------------------------------------------------- | -------------------------- |
| `src/hooks/calendar/use-calendar-page.ts`, `use-athlete-calendar-page.ts` | insert/delete appuntamenti |
| `src/hooks/appointments/useStaffAppointmentsTable.ts`                     | delete                     |
| `src/hooks/use-communications.ts`                                         | delete comunicazioni       |

### Realtime `subscribePostgresChanges`

Tutti gli hook che usano `subscribePostgresChanges` includono `useRealtimeResubscribeToken()` nelle dipendenze dell’effetto: `use-chat-realtime.ts`, `use-chat-realtime-optimized.ts`, `use-chat-notifications.ts`, `use-clienti.ts`.

---

## Smoke minimo per gruppo (QA manuale + Playwright)

Una rotta rappresentativa per gruppo basta per regressioni trasversali; approfondire le righe **H** della matrice su iOS.

| Gruppo               | URL rappresentativa                                            | Cosa verificare in 2–3 min                 |
| -------------------- | -------------------------------------------------------------- | ------------------------------------------ |
| Pubblico / auth      | `/login`, `/`                                                  | Redirect, form submit, messaggio rete      |
| Home atleta          | `/home/allenamenti/oggi`                                       | Lista allenamenti, barra bassa / safe-area |
| Home progressi       | `/home/progressi`                                              | Dati dopo resume tab                       |
| Dashboard staff      | `/dashboard/clienti`                                           | Lista + eventuale realtime                 |
| Dashboard calendario | `/dashboard/calendario`                                        | Dati dopo background lungo                 |
| Marketing            | `/dashboard/marketing/segments`                                | Toggle/lista dopo resume                   |
| Massaggiatore        | `/dashboard/massaggiatore/appuntamenti`                        | Lista appuntamenti                         |
| Nutrizionista        | `/dashboard/nutrizionista/documenti`                           | Reload policy visibilità                   |
| Embed                | `/embed/athlete-allenamenti/[id]` (con token reale in staging) | Stesso comportamento allenamenti           |
| Workouts (parallel)  | `/dashboard/workouts`                                          | Navigazione slot senza perdita stato       |

Test automatici: vedi [`tests/e2e/session-stability-smoke.spec.ts`](tests/e2e/session-stability-smoke.spec.ts) (`PLAYWRIGHT_BASE_URL` / variabili `PLAYWRIGHT_*` come negli altri test E2E).
