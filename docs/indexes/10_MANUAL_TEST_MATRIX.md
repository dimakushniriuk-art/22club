# Manual Test Matrix

Fonti incrociate: `audit/FEATURE_STATUS.md`, `audit/RULE_CONFLICTS.md`, `docs/indexes/03_FEATURES_INDEX.md`, `docs/indexes/07_AUTH_RBAC_INDEX.md`, `docs/indexes/04_DATABASE_INDEX.md`, `docs/indexes/09_KNOWN_ISSUES_INDEX.md`.  
Solo scenari deducibili da questi documenti; dove l’audit indica incertezza → **DA VERIFICARE** nel campo esito.

---

## Come usare questa matrice

- Testare **una feature alla volta** (stesso ordine delle priorità nelle sezioni).
- Per ogni test: segnare esito **PASS** / **FAIL** / **DA VERIFICARE** (es. ambiente mancante, ruolo non disponibile, comportamento non determinabile senza DB).
- In caso di FAIL: annotare sintomo, passi per riprodurre, **file coinvolti** se noti dagli audit (path sotto `src/`).
- Non sostituisce verifica SQL/RLS sul database deployato: mismatch UI vs policy resta **DA VERIFICARE** finché non confrontato con Supabase.

---

## Legenda campi (ogni test)

| Campo                | Contenuto                                                      |
| -------------------- | -------------------------------------------------------------- |
| **ID**               | Identificativo stabile                                         |
| **Dominio**          | Area funzionale                                                |
| **Feature**          | Cosa si esercita                                               |
| **Scenario**         | Condizione / obiettivo                                         |
| **Precondizioni**    | Account, ruolo, dati                                           |
| **Passi manuali**    | Azioni UI (ordine)                                             |
| **Risultato atteso** | Comportamento coerente con audit / assenza di regressioni note |
| **Priorità**         | Alta / Media / Bassa (da indici)                               |
| **Stato iniziale**   | `da eseguire`                                                  |
| **Esito**            | (da compilare) PASS / FAIL / DA VERIFICARE                     |

---

## Auth / RBAC

### TC-AUTH-001

| Campo                | Valore                                                                                                        |
| -------------------- | ------------------------------------------------------------------------------------------------------------- |
| **Dominio**          | Auth / RBAC                                                                                                   |
| **Feature**          | Login e redirect post-login                                                                                   |
| **Scenario**         | Utente **atleta**: dopo login arriva all’area portale attesa (path atleta negli audit: `/home/**`).           |
| **Precondizioni**    | Account con ruolo atleta in `profiles`; browser pulito o sessione scaduta.                                    |
| **Passi manuali**    | 1. Aprire `/login`. 2. Inserire credenziali atleta. 3. Completare login e osservare URL e shell UI.           |
| **Risultato atteso** | Redirect coerente con `role-redirect-paths` / flusso documentato; nessun loop login; area atleta accessibile. |
| **Priorità**         | Alta                                                                                                          |
| **Stato iniziale**   | da eseguire                                                                                                   |
| **Esito**            |                                                                                                               |

### TC-AUTH-002

| Campo                | Valore                                                                                                                                                |
| -------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Dominio**          | Auth / RBAC                                                                                                                                           |
| **Feature**          | Login e redirect post-login                                                                                                                           |
| **Scenario**         | Utente **trainer** (o staff generico mappato come trainer negli audit): dopo login arriva a dashboard staff.                                          |
| **Precondizioni**    | Account trainer; sessione non autenticata.                                                                                                            |
| **Passi manuali**    | 1. `/login` → credenziali trainer. 2. Verificare destinazione (es. `/dashboard` o path staff previsto). 3. Aprire almeno una voce sidebar staff nota. |
| **Risultato atteso** | Accesso staff; nessun redirect errato verso `/home` da atleta.                                                                                        |
| **Priorità**         | Alta                                                                                                                                                  |
| **Stato iniziale**   | da eseguire                                                                                                                                           |
| **Esito**            |                                                                                                                                                       |

### TC-AUTH-003

| Campo                | Valore                                                                                                                                             |
| -------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Dominio**          | Auth / RBAC                                                                                                                                        |
| **Feature**          | Login e redirect post-login                                                                                                                        |
| **Scenario**         | Utente **admin**: accesso area admin dove previsto dalla tabella redirect.                                                                         |
| **Precondizioni**    | Account admin.                                                                                                                                     |
| **Passi manuali**    | 1. Login admin. 2. Navigare verso `/dashboard/admin` (o path equivalente in uso). 3. Verificare caricamento pagina senza 403 client-side evidente. |
| **Risultato atteso** | Area admin raggiungibile per ruolo admin (permesso effettivo = RLS + API — **DA VERIFICARE** se 403 sporadici da sessione).                        |
| **Priorità**         | Alta                                                                                                                                               |
| **Stato iniziale**   | da eseguire                                                                                                                                        |
| **Esito**            |                                                                                                                                                    |

### TC-AUTH-004

| Campo                | Valore                                                                                                                                                                                                                              |
| -------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Dominio**          | Auth / RBAC                                                                                                                                                                                                                         |
| **Feature**          | Marketing vs guard / redirect                                                                                                                                                                                                       |
| **Scenario**         | Utente **marketing**: coerenza tra destinazione attesa (`role-redirect-paths` include marketing) e comportamento **guard** (audit: `use-staff-dashboard-guard` con mappa parziale → rischio `/dashboard` invece di area marketing). |
| **Precondizioni**    | Account con ruolo marketing in DB.                                                                                                                                                                                                  |
| **Passi manuali**    | 1. Login marketing. 2. Annotare URL immediato post-login. 3. Aprire manualmente `/dashboard/marketing` (se esiste nel deploy). 4. Ricaricare `/dashboard` e osservare redirect/guard.                                               |
| **Risultato atteso** | **DA VERIFICARE**: assenza di “flash” o permanenza su route non prevista; se si verifica disallineamento guard vs `role-redirect-paths`, annotare (noto in `RULE_CONFLICTS.md`).                                                    |
| **Priorità**         | Alta                                                                                                                                                                                                                                |
| **Stato iniziale**   | da eseguire                                                                                                                                                                                                                         |
| **Esito**            |                                                                                                                                                                                                                                     |

### TC-AUTH-005

| Campo                | Valore                                                                                                               |
| -------------------- | -------------------------------------------------------------------------------------------------------------------- |
| **Dominio**          | Auth / RBAC                                                                                                          |
| **Feature**          | Route protette / atleta vs staff                                                                                     |
| **Scenario**         | **Atleta** non accede a dashboard staff (middleware web + guard — su web).                                           |
| **Precondizioni**    | Sessione atleta.                                                                                                     |
| **Passi manuali**    | 1. Loggato come atleta, digitare URL `/dashboard` nella barra indirizzi. 2. Osservare redirect o messaggio di guard. |
| **Risultato atteso** | Blocco o redirect verso area atleta; nessuna shell staff completa per atleta.                                        |
| **Priorità**         | Alta                                                                                                                 |
| **Stato iniziale**   | da eseguire                                                                                                          |
| **Esito**            |                                                                                                                      |

### TC-AUTH-006

| Campo                | Valore                                                                                                                                         |
| -------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| **Dominio**          | Auth / RBAC                                                                                                                                    |
| **Feature**          | Route protette                                                                                                                                 |
| **Scenario**         | **Staff** non usa portale atleta come home principale (allineamento a redirect per ruolo).                                                     |
| **Precondizioni**    | Sessione trainer o altro staff.                                                                                                                |
| **Passi manuali**    | 1. Loggato staff, aprire `/home` (se consentito dal matcher). 2. Verificare redirect o contenuto.                                              |
| **Risultato atteso** | Comportamento coerente con policy route (es. redirect a dashboard o negazione — **DA VERIFICARE** esatto path se non documentato negli index). |
| **Priorità**         | Media                                                                                                                                          |
| **Stato iniziale**   | da eseguire                                                                                                                                    |
| **Esito**            |                                                                                                                                                |

### TC-AUTH-007

| Campo                | Valore                                                                                                                                                                                     |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Dominio**          | Auth / RBAC                                                                                                                                                                                |
| **Feature**          | Web vs Capacitor                                                                                                                                                                           |
| **Scenario**         | Con build **Capacitor** (`CAPACITOR=true`): middleware non applica stessi controlli edge — verifica comportamento reale (debito architetturale in audit).                                  |
| **Precondizioni**    | App nativa o web con env Capacitor come da build team; stessi account dei test web.                                                                                                        |
| **Passi manuali**    | 1. Login stesso ruolo usato su web. 2. Tentare accesso a route che su web sarebbe bloccato dal middleware (es. path “sbagliato” per ruolo). 3. Confrontare con stesso scenario su browser. |
| **Risultato atteso** | **DA VERIFICARE** per ambiente: documentare se guard client compensa o se esiste accesso indebito; rischio **alto** su nativo se non distribuito — seguire policy team.                    |
| **Priorità**         | Alta _(solo se Capacitor in produzione; altrimenti DA VERIFICARE / N/A)_                                                                                                                   |
| **Stato iniziale**   | da eseguire                                                                                                                                                                                |
| **Esito**            |                                                                                                                                                                                            |

### TC-AUTH-008

| Campo                | Valore                                                                                                                                     |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| **Dominio**          | Auth / RBAC                                                                                                                                |
| **Feature**          | Fallback ruolo non normalizzato                                                                                                            |
| **Scenario**         | Profilo con ruolo **legacy / non mappato** (se esiste in DB — audit: `pt`, `staff`, varianti): confronto UX/API.                           |
| **Precondizioni**    | Utente di test con stringa ruolo legacy **solo se disponibile** in ambiente (non inventare).                                               |
| **Passi manuali**    | 1. Login. 2. Osservare redirect e sezione visibile. 3. Se possibile, chiamare o ispezionare risposta `api/auth/context` (strumenti dev).   |
| **Risultato atteso** | **DA VERIFICARE**: audit segnala fallback `athlete` in provider/API vs middleware che mantiene stringa DB — annotare qualsiasi incoerenza. |
| **Priorità**         | Media                                                                                                                                      |
| **Stato iniziale**   | da eseguire                                                                                                                                |
| **Esito**            |                                                                                                                                            |

---

## Calendario / Appointments

### TC-CAL-001

| Campo                | Valore                                                                                                                         |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| **Dominio**          | Calendario / Appointments                                                                                                      |
| **Feature**          | Creazione appuntamento da **calendario staff**                                                                                 |
| **Scenario**         | Creare appuntamento in slot libero; verifica salvataggio e visualizzazione.                                                    |
| **Precondizioni**    | Staff con calendario abilitato; slot disponibile.                                                                              |
| **Passi manuali**    | 1. `/dashboard/calendario` (o calendario ruolo dedicato). 2. Nuovo appuntamento, compilare campi minimi richiesti. 3. Salvare. |
| **Risultato atteso** | Appuntamento visibile sulla griglia; nessun errore persistente.                                                                |
| **Priorità**         | Alta                                                                                                                           |
| **Stato iniziale**   | da eseguire                                                                                                                    |
| **Esito**            |                                                                                                                                |

### TC-CAL-002

| Campo                | Valore                                                                                                                                                                       |
| -------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Dominio**          | Calendario / Appointments                                                                                                                                                    |
| **Feature**          | Creazione appuntamento da **pagina / modale appuntamenti staff** (percorso tabella)                                                                                          |
| **Scenario**         | Stesso obiettivo di TC-CAL-001 ma da UI collegata a `useStaffAppointmentsTable` / modale (file citati negli audit).                                                          |
| **Precondizioni**    | Staff; accesso a `/dashboard/appuntamenti` e creazione da lì.                                                                                                                |
| **Passi manuali**    | 1. Aprire lista appuntamenti staff. 2. Creare appuntamento equivalente (stesso staff/orario se possibile in altro giorno). 3. Verificare presenza in lista e nel calendario. |
| **Risultato atteso** | Dato coerente tra lista e calendario; **DA VERIFICARE** differenza regole overlap tra percorsi (vedi TC-CAL-005).                                                            |
| **Priorità**         | Alta                                                                                                                                                                         |
| **Stato iniziale**   | da eseguire                                                                                                                                                                  |
| **Esito**            |                                                                                                                                                                              |

### TC-CAL-003

| Campo                | Valore                                                                                                                                      |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| **Dominio**          | Calendario / Appointments                                                                                                                   |
| **Feature**          | Modifica appuntamento                                                                                                                       |
| **Scenario**         | Modifica orario/dati da calendario e da lista/modale.                                                                                       |
| **Precondizioni**    | Appuntamento esistente modificabile.                                                                                                        |
| **Passi manuali**    | 1. Da calendario: aprire dettaglio → modificare → salvare. 2. Da lista appuntamenti: stessa modifica su altro record o stesso dopo refresh. |
| **Risultato atteso** | Aggiornamento riflesso ovunque; notifiche/email **DA VERIFICARE** (dipendenza deploy/cron).                                                 |
| **Priorità**         | Alta                                                                                                                                        |
| **Stato iniziale**   | da eseguire                                                                                                                                 |
| **Esito**            |                                                                                                                                             |

### TC-CAL-004

| Campo                | Valore                                                                                                                                                                                                                                              |
| -------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Dominio**          | Calendario / Appointments                                                                                                                                                                                                                           |
| **Feature**          | Overlap in **create**                                                                                                                                                                                                                               |
| **Scenario**         | Tentare secondo appuntamento **stesso staff** su slot già occupato (comportamento calendario: `checkStaffCalendarSlotOverlap` in audit).                                                                                                            |
| **Precondizioni**    | Primo appuntamento già creato nello slot.                                                                                                                                                                                                           |
| **Passi manuali**    | 1. Creare appuntamento A su slot T. 2. Creare appuntamento B stesso staff stesso slot T da **calendario**. 3. Ripetere creazione B da **lista/modale** se il flusso lo consente.                                                                    |
| **Risultato atteso** | Annotare se calendario blocca o permette sovrascrittura (`forceOverwrite` in audit); annotare se lista **non** valida overlap — **FAIL atteso dal punto di vista prodotto unico** se entrambi permettono doppio booking (noto `RULE_CONFLICTS.md`). |
| **Priorità**         | Alta                                                                                                                                                                                                                                                |
| **Stato iniziale**   | da eseguire                                                                                                                                                                                                                                         |
| **Esito**            |                                                                                                                                                                                                                                                     |

### TC-CAL-005

| Campo                | Valore                                                                                                                                                                                                                                                                                                                                                                        |
| -------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Dominio**          | Calendario / Appointments                                                                                                                                                                                                                                                                                                                                                     |
| **Feature**          | Overlap in **edit** (stesso record escluso)                                                                                                                                                                                                                                                                                                                                   |
| **Scenario**         | Modificare solo dettagli non temporali vs spostamento su slot occupato — verifica che la regola di esclusione dell’appuntamento corrente non generi falso positivo/negativo.                                                                                                                                                                                                  |
| **Precondizioni**    | Due appuntamenti vicini o slot contigui; strumenti dev per osservare eventuali chiamate **solo se il team le usa** (non obbligatorio).                                                                                                                                                                                                                                        |
| **Passi manuali**    | 1. Edit appuntamento A: spostare su orario già occupato da B. 2. Edit appuntamento A: piccolo spostamento che non collide. 3. (Opzionale, DevTools) Su salvataggio edit, verificare che la richiesta escluda l’appuntamento corrente dal controllo overlap (es. `excludeAppointmentId` o parametro equivalente nel payload/API) così da non falsare collisione con se stesso. |
| **Risultato atteso** | Comportamento coerente con `appointment-utils` / backend; **DA VERIFICARE** se il percorso lista differisce dal calendario (stesso tema TC-CAL-004).                                                                                                                                                                                                                          |
| **Priorità**         | Alta                                                                                                                                                                                                                                                                                                                                                                          |
| **Stato iniziale**   | da eseguire                                                                                                                                                                                                                                                                                                                                                                   |
| **Esito**            |                                                                                                                                                                                                                                                                                                                                                                               |

### TC-CAL-006

| Campo                | Valore                                                                                                                    |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| **Dominio**          | Calendario / Appointments                                                                                                 |
| **Feature**          | `calendar_blocks` / impostazioni staff                                                                                    |
| **Scenario**         | Creazione e modifica rispettano blocchi orari / impostazioni calendario staff (`staff_calendar_settings` negli audit).    |
| **Precondizioni**    | Impostazioni calendario con slot/blocchi definiti.                                                                        |
| **Passi manuali**    | 1. Aprire impostazioni calendario staff. 2. Tentare creare appuntamento in fascia bloccata e in fascia consentita.        |
| **Risultato atteso** | **DA VERIFICARE** regola esatta prodotto: annotare se UI impedisce, avvisa o salva comunque (dipende da implementazione). |
| **Priorità**         | Media                                                                                                                     |
| **Stato iniziale**   | da eseguire                                                                                                               |
| **Esito**            |                                                                                                                           |

### TC-CAL-007

| Campo                | Valore                                                                                                                                               |
| -------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Dominio**          | Calendario / Appointments                                                                                                                            |
| **Feature**          | Open booking / atleta                                                                                                                                |
| **Scenario**         | Flusso **atleta** su appuntamenti (`/home/appuntamenti`, open booking in RLS — `FEATURE_STATUS`: comportamento effettivo dipende da deployment SQL). |
| **Precondizioni**    | Account atleta; slot/offerta open booking configurati in ambiente **se noti**.                                                                       |
| **Passi manuali**    | 1. Login atleta. 2. Aprire lista/prenotazione appuntamenti. 3. Tentare prenotazione o cancellazione secondo UI disponibile.                          |
| **Risultato atteso** | **DA VERIFICARE** end-to-end; annotare errori RLS o successo.                                                                                        |
| **Priorità**         | Alta                                                                                                                                                 |
| **Stato iniziale**   | da eseguire                                                                                                                                          |
| **Esito**            |                                                                                                                                                      |

### TC-CAL-008

| Campo                | Valore                                                                                                                                                                 |
| -------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Dominio**          | Calendario / Appointments                                                                                                                                              |
| **Feature**          | Allineamento calendario vs tabella staff                                                                                                                               |
| **Scenario**         | Stesso giorno: conteggio e lista appuntamenti **calendario** vs **tabella staff** / widget correlati.                                                                  |
| **Precondizioni**    | Mix di appuntamenti creati da entrambi i percorsi (TC-CAL-001 / TC-CAL-002).                                                                                           |
| **Passi manuali**    | 1. Scegliere una data con N appuntamenti. 2. Confrontare elenco in calendario e in `/dashboard/appuntamenti` (filtro stesso giorno se presente).                       |
| **Risultato atteso** | Stessi record visibili salvo differenze note (“liste oggi” — `api/dashboard/appointments` vs altre query: **possibile differenza UX** in audit). Annotare discrepanze. |
| **Priorità**         | Alta                                                                                                                                                                   |
| **Stato iniziale**   | da eseguire                                                                                                                                                            |
| **Esito**            |                                                                                                                                                                        |

---

## Org / Multi-tenant

## Athletes / Open Booking

### TC-ATH-OB-001

| Campo                | Valore                                                                                                                            |
| -------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| **Dominio**          | Athletes / Open Booking                                                                                                           |
| **Feature**          | Caricamento pagina appuntamenti atleta                                                                                            |
| **Scenario**         | Accesso a `/home/appuntamenti` con atleta attivo (non `non_ancora_cliente`).                                                      |
| **Precondizioni**    | Account atleta valido; `profiles.stato_cliente` diverso da `non_ancora_cliente`.                                                  |
| **Passi manuali**    | 1. Login come atleta. 2. Aprire `/home/appuntamenti`. 3. Attendere fine caricamento calendario.                                   |
| **Risultato atteso** | Visualizzata la vista calendario atleta con header "Calendario e appuntamenti con il trainer"; nessun errore bloccante in pagina. |
| **Priorità**         | Alta                                                                                                                              |
| **Stato iniziale**   | da eseguire                                                                                                                       |
| **Esito**            |                                                                                                                                   |

### TC-ATH-OB-002

| Campo                | Valore                                                                                                                                    |
| -------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| **Dominio**          | Athletes / Open Booking                                                                                                                   |
| **Feature**          | Blocco accesso calendario per atleta non attivo                                                                                           |
| **Scenario**         | Atleta con `stato_cliente = non_ancora_cliente`.                                                                                          |
| **Precondizioni**    | Account atleta con `profiles.stato_cliente = non_ancora_cliente`.                                                                         |
| **Passi manuali**    | 1. Login come atleta non attivo. 2. Aprire `/home/appuntamenti`.                                                                          |
| **Risultato atteso** | Mostrata card informativa "Non hai accesso al calendario..."; nessun calendario interattivo e nessuna azione di prenotazione disponibile. |
| **Priorità**         | Alta                                                                                                                                      |
| **Stato iniziale**   | da eseguire                                                                                                                               |
| **Esito**            |                                                                                                                                           |

### TC-ATH-OB-003

| Campo                | Valore                                                                                                   |
| -------------------- | -------------------------------------------------------------------------------------------------------- |
| **Dominio**          | Athletes / Open Booking                                                                                  |
| **Feature**          | Trainer non disponibile                                                                                  |
| **Scenario**         | Atleta senza trainer assegnato (`get_my_trainer_profile` vuoto/errore).                                  |
| **Precondizioni**    | Account atleta senza trainer associato in ambiente test.                                                 |
| **Passi manuali**    | 1. Login come atleta senza trainer. 2. Aprire `/home/appuntamenti`. 3. Verificare CTA/azioni calendario. |
| **Risultato atteso** | Messaggio "Non hai ancora un trainer assegnato..."; creazione nuova prenotazione non disponibile.        |
| **Priorità**         | Alta                                                                                                     |
| **Stato iniziale**   | da eseguire                                                                                              |
| **Esito**            |                                                                                                          |

### TC-ATH-OB-004

| Campo                | Valore                                                                                                                                                                         |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Dominio**          | Athletes / Open Booking                                                                                                                                                        |
| **Feature**          | Visualizzazione slot open booking                                                                                                                                              |
| **Scenario**         | Presenza slot `is_open_booking_day` nel calendario atleta.                                                                                                                     |
| **Precondizioni**    | Trainer assegnato; almeno uno slot open booking configurato nel periodo visualizzato.                                                                                          |
| **Passi manuali**    | 1. Aprire `/home/appuntamenti`. 2. Identificare uno slot "Libera prenotazione". 3. Cliccare lo slot.                                                                           |
| **Risultato atteso** | Si apre il form in modalità atleta con slot precompilato; nel calendario è visibile indicazione capacità slot (x/N) coerente con testo "max N prenotazioni per fascia oraria". |
| **Priorità**         | Alta                                                                                                                                                                           |
| **Stato iniziale**   | da eseguire                                                                                                                                                                    |
| **Esito**            |                                                                                                                                                                                |

### TC-ATH-OB-005

| Campo                | Valore                                                                                                                                                           |
| -------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Dominio**          | Athletes / Open Booking                                                                                                                                          |
| **Feature**          | Creazione prenotazione atleta in slot valido                                                                                                                     |
| **Scenario**         | Inserimento prenotazione dentro intervallo di uno slot open booking, con capacità disponibile.                                                                   |
| **Precondizioni**    | Atleta attivo; trainer assegnato; slot open booking disponibile con posti residui.                                                                               |
| **Passi manuali**    | 1. Selezionare slot open booking. 2. Compilare form con orario interno allo slot. 3. Salvare. 4. Verificare refresh calendario.                                  |
| **Risultato atteso** | Prenotazione creata e visibile in calendario; evento marcato come prenotazione atleta. Se backend/RLS rifiuta l’insert, deve apparire errore utente senza crash. |
| **Priorità**         | Alta                                                                                                                                                             |
| **Stato iniziale**   | da eseguire                                                                                                                                                      |
| **Esito**            |                                                                                                                                                                  |

### TC-ATH-OB-006

| Campo                | Valore                                                                                                                 |
| -------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| **Dominio**          | Athletes / Open Booking                                                                                                |
| **Feature**          | Tentativo prenotazione fuori slot valido                                                                               |
| **Scenario**         | Nuova prenotazione con orario non contenuto in alcuno slot "Libera prenotazione".                                      |
| **Precondizioni**    | Atleta attivo con trainer; calendario con almeno uno slot open booking noto.                                           |
| **Passi manuali**    | 1. Aprire form nuova prenotazione da calendario. 2. Impostare orario fuori da qualsiasi slot open booking. 3. Salvare. |
| **Risultato atteso** | Blocco lato UI con messaggio "L’orario deve essere compreso in uno slot..."; nessuna nuova riga salvata.               |
| **Priorità**         | Alta                                                                                                                   |
| **Stato iniziale**   | da eseguire                                                                                                            |
| **Esito**            |                                                                                                                        |

### TC-ATH-OB-007

| Campo                | Valore                                                                                                                                                                       |
| -------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Dominio**          | Athletes / Open Booking                                                                                                                                                      |
| **Feature**          | Tentativo prenotazione slot pieno                                                                                                                                            |
| **Scenario**         | Prenotazione su slot con capacità già raggiunta (`max_free_pass_athletes_per_slot`).                                                                                         |
| **Precondizioni**    | Slot open booking già al limite capacità (N/N).                                                                                                                              |
| **Passi manuali**    | 1. Aprire slot saturo. 2. Tentare nuova prenotazione nello stesso intervallo. 3. Salvare.                                                                                    |
| **Risultato atteso** | Blocco con messaggio "Slot pieno" o errore equivalente; nessuna prenotazione aggiuntiva. Se backend blocca prima della UI locale, errore comunque gestito in toast/notifica. |
| **Priorità**         | Alta                                                                                                                                                                         |
| **Stato iniziale**   | da eseguire                                                                                                                                                                  |
| **Esito**            |                                                                                                                                                                              |

### TC-ATH-OB-008

| Campo                | Valore                                                                                                                                   |
| -------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| **Dominio**          | Athletes / Open Booking                                                                                                                  |
| **Feature**          | Modifica prenotazione atleta valida                                                                                                      |
| **Scenario**         | Modifica di appuntamento creato da atleta (`created_by_role = athlete`) su orario valido.                                                |
| **Precondizioni**    | Esiste appuntamento atleta modificabile non cancellato.                                                                                  |
| **Passi manuali**    | 1. Aprire popover su appuntamento creato da atleta. 2. Selezionare modifica. 3. Cambiare orario/nota e salvare.                          |
| **Risultato atteso** | Aggiornamento visibile in calendario dopo refresh; pulsante modifica disponibile solo su appuntamenti atleta (non su slot open booking). |
| **Priorità**         | Alta                                                                                                                                     |
| **Stato iniziale**   | da eseguire                                                                                                                              |
| **Esito**            |                                                                                                                                          |

### TC-ATH-OB-009

| Campo                | Valore                                                                                                                                                                                        |
| -------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Dominio**          | Athletes / Open Booking                                                                                                                                                                       |
| **Feature**          | Cancellazione prenotazione atleta                                                                                                                                                             |
| **Scenario**         | Cancellazione logica di un appuntamento atleta dal popover.                                                                                                                                   |
| **Precondizioni**    | Esiste appuntamento creato da atleta.                                                                                                                                                         |
| **Passi manuali**    | 1. Aprire popover appuntamento atleta. 2. Eseguire annulla/cancella. 3. Verificare aggiornamento calendario.                                                                                  |
| **Risultato atteso** | Appuntamento non più attivo in vista calendario; azione consentita solo per record creati da atleta. Se backend/RLS rifiuta update/delete, errore tracciabile senza incoerenze UI permanenti. |
| **Priorità**         | Alta                                                                                                                                                                                          |
| **Stato iniziale**   | da eseguire                                                                                                                                                                                   |
| **Esito**            |                                                                                                                                                                                               |

### TC-ATH-OB-010

| Campo                | Valore                                                                                                                                                                               |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Dominio**          | Athletes / Open Booking                                                                                                                                                              |
| **Feature**          | Org/dati necessari non risolvibili                                                                                                                                                   |
| **Scenario**         | Tentativo creazione con `org_id` non disponibile lato profilo atleta.                                                                                                                |
| **Precondizioni**    | Ambiente/utente di test con `profiles.org_id` assente o non risolvibile (solo se disponibile).                                                                                       |
| **Passi manuali**    | 1. Login atleta nel profilo senza org. 2. Aprire form nuova prenotazione. 3. Provare a salvare.                                                                                      |
| **Risultato atteso** | Blocco con messaggio "Organizzazione non disponibile..."; nessun insert parziale. Caso dipendente da dati reali e policy backend (**DA VERIFICARE** se utente test non disponibile). |
| **Priorità**         | Alta                                                                                                                                                                                 |
| **Stato iniziale**   | da eseguire                                                                                                                                                                          |
| **Esito**            |                                                                                                                                                                                      |

### TC-ATH-OB-011

| Campo                | Valore                                                                                                                                                                                    |
| -------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Dominio**          | Athletes / Open Booking                                                                                                                                                                   |
| **Feature**          | Distinzione future/past coerente con UI                                                                                                                                                   |
| **Scenario**         | Verifica separazione appuntamenti futuri/passati quando il flusso mostra vista lista (fallback/non-atleta).                                                                               |
| **Precondizioni**    | Dataset con appuntamenti passati e futuri; ambiente in cui è visibile la lista (se applicabile).                                                                                          |
| **Passi manuali**    | 1. Aprire vista lista appuntamenti. 2. Confrontare classificazione record passati/futuri con date reali e stato appuntamento.                                                             |
| **Risultato atteso** | Record con data malformata non finiscono in future/past; appuntamenti `completato` risultano tra i passati. **DA VERIFICARE** su percorso atleta puro, che usa principalmente calendario. |
| **Priorità**         | Media                                                                                                                                                                                     |
| **Stato iniziale**   | da eseguire                                                                                                                                                                               |
| **Esito**            |                                                                                                                                                                                           |

### TC-ATH-OB-012

| Campo                | Valore                                                                                                                                               |
| -------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Dominio**          | Athletes / Open Booking                                                                                                                              |
| **Feature**          | Refetch e allineamento UI vs backend/RLS                                                                                                             |
| **Scenario**         | Dopo create/edit/delete, controllo allineamento tra stato UI e risposta finale backend/RLS.                                                          |
| **Precondizioni**    | Almeno un’operazione create/edit/delete eseguita nello stesso ciclo test.                                                                            |
| **Passi manuali**    | 1. Eseguire create/edit/delete da casi precedenti. 2. Forzare refresh pagina o pulsante refresh se disponibile. 3. Verificare stato finale mostrato. |
| **Risultato atteso** | Dopo refetch la UI riflette solo dati realmente accettati dal backend; eventuali rifiuti RLS non devono lasciare stato locale incoerente.            |
| **Priorità**         | Media                                                                                                                                                |
| **Stato iniziale**   | da eseguire                                                                                                                                          |
| **Esito**            |                                                                                                                                                      |

### Ordine consigliato esecuzione (atleta/open booking)

1. **Smoke iniziale:** TC-ATH-OB-001, TC-ATH-OB-002, TC-ATH-OB-003, TC-ATH-OB-004
2. **Create/Edit/Delete:** TC-ATH-OB-005, TC-ATH-OB-008, TC-ATH-OB-009
3. **Casi edge:** TC-ATH-OB-006, TC-ATH-OB-007, TC-ATH-OB-010, TC-ATH-OB-011
4. **Verifica lato backend/RLS:** TC-ATH-OB-012 + note RLS raccolte in TC-ATH-OB-005/007/009/010

---

### TC-ORG-001

| Campo                | Valore                                                                                                                                                           |
| -------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Dominio**          | Org / Multi-tenant                                                                                                                                               |
| **Feature**          | `org_id` da profilo / contesto                                                                                                                                   |
| **Scenario**         | Dopo login staff, verificare che operazioni su appuntamenti non producano org “a caso”: audit richiede catena **user → profile → org_id** (`04_DATABASE_INDEX`). |
| **Precondizioni**    | Profilo con `org_id` valorizzato; accesso a creazione appuntamento.                                                                                              |
| **Passi manuali**    | 1. Creare appuntamento da calendario. 2. (Se strumenti) verificare payload/network o riga DB con team — **solo se processo interno lo consente**.                |
| **Risultato atteso** | **DA VERIFICARE** senza DB: in UI, assenza di errori RLS ricorrenti e dati visibili solo nell’org atteso.                                                        |
| **Priorità**         | Alta                                                                                                                                                             |
| **Stato iniziale**   | da eseguire                                                                                                                                                      |
| **Esito**            |                                                                                                                                                                  |

### TC-ORG-002

| Campo                | Valore                                                                                                                                            |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Dominio**          | Org / Multi-tenant                                                                                                                                |
| **Feature**          | Assenza `default-org` implicito                                                                                                                   |
| **Scenario**         | Audit segnala uso non uniforme: form/tab con fallback `'default-org'` vs calendario con org da contesto — verifica comportamento **osservabile**. |
| **Precondizioni**    | Account senza `org_id` **se esiste scenario di test consentito** (altrimenti N/A).                                                                |
| **Passi manuali**    | Se disponibile utente senza org: login e tentativo creazione appuntamento da lista e da calendario.                                               |
| **Risultato atteso** | **DA VERIFICARE**: errore controllato vs dato silenzioso in org sbagliata — annotare.                                                             |
| **Priorità**         | Alta _(condizionata a dati di test)_                                                                                                              |
| **Stato iniziale**   | da eseguire                                                                                                                                       |
| **Esito**            |                                                                                                                                                   |

### TC-ORG-003

| Campo                | Valore                                                                                                                                                    |
| -------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Dominio**          | Org / Multi-tenant                                                                                                                                        |
| **Feature**          | `org_id_text` / colonne duplicate                                                                                                                         |
| **Scenario**         | Allineamento concettuale: audit indica rischio policy/report con criteri diversi — verifica indiretta tramite coerenza liste tra schermate stesso tenant. |
| **Precondizioni**    | Stesso utente staff; più schermate che mostrano “stessi” appuntamenti.                                                                                    |
| **Passi manuali**    | Confrontare TC-CAL-008 + eventuale export/report se usato in produzione.                                                                                  |
| **Risultato atteso** | **DA VERIFICARE** a livello DB; in UI annotare qualsiasi dato “fantasma” o filtro incoerente.                                                             |
| **Priorità**         | Media                                                                                                                                                     |
| **Stato iniziale**   | da eseguire                                                                                                                                               |
| **Esito**            |                                                                                                                                                           |

### TC-ORG-004

| Campo                | Valore                                                                                                                          |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| **Dominio**          | Org / Multi-tenant                                                                                                              |
| **Feature**          | UI vs RLS                                                                                                                       |
| **Scenario**         | Schermata mostra azione consentita ma persistenza fallisce (o viceversa) — sintomo tipico “bug solo in produzione” negli audit. |
| **Precondizioni**    | Flusso salvataggio appuntamento o modifica dati sensibili a policy.                                                             |
| **Passi manuali**    | Eseguire salvataggi ripetuti; osservare toast/errori Supabase in console se permesso.                                           |
| **Risultato atteso** | Messaggi coerenti; **DA VERIFICARE** mismatch senza log DB.                                                                     |
| **Priorità**         | Alta                                                                                                                            |
| **Stato iniziale**   | da eseguire                                                                                                                     |
| **Esito**            |                                                                                                                                 |

---

## Query / Data access

### TC-DATA-001

| Campo                | Valore                                                                                                        |
| -------------------- | ------------------------------------------------------------------------------------------------------------- |
| **Dominio**          | Query / Data access                                                                                           |
| **Feature**          | Lista appuntamenti calendario                                                                                 |
| **Scenario**         | Caricamento vista calendario con filtri principali (data range, staff) come da UI.                            |
| **Precondizioni**    | Dati noti nello stesso intervallo.                                                                            |
| **Passi manuali**    | 1. Navigare tra settimane. 2. Applicare filtri disponibili. 3. Contare appuntamenti visibili vs attesi.       |
| **Risultato atteso** | Nessun “buco” inspiegabile senza motivo (ricorrenze/cancellazioni da considerare — **DA VERIFICARE** regola). |
| **Priorità**         | Alta                                                                                                          |
| **Stato iniziale**   | da eseguire                                                                                                   |
| **Esito**            |                                                                                                               |

### TC-DATA-002

| Campo                | Valore                                                                                                                |
| -------------------- | --------------------------------------------------------------------------------------------------------------------- |
| **Dominio**          | Query / Data access                                                                                                   |
| **Feature**          | Lista appuntamenti tabella staff                                                                                      |
| **Scenario**         | Hook tabella / `staff-appointments-select` — coerenza con calendario (stesso dominio dati, filtri diversi possibili). |
| **Precondizioni**    | Stessi dati di TC-DATA-001.                                                                                           |
| **Passi manuali**    | 1. Aprire tabella staff. 2. Allineare filtri equivalenti se presenti. 3. Confrontare con calendario.                  |
| **Risultato atteso** | Coerenza o differenza documentata (criteri “oggi” — `09_KNOWN_ISSUES_INDEX`).                                         |
| **Priorità**         | Alta                                                                                                                  |
| **Stato iniziale**   | da eseguire                                                                                                           |
| **Esito**            |                                                                                                                       |

### TC-DATA-003

| Campo                | Valore                                                                                                                                                             |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Dominio**          | Query / Data access                                                                                                                                                |
| **Feature**          | `useAthleteAppointments` / ruoli staff non trainer                                                                                                                 |
| **Scenario**         | **Nutrizionista** o **massaggiatore** (se account disponibili): lista appuntamenti che usa query senza filtro client dedicato — dipende da RLS (`RULE_CONFLICTS`). |
| **Precondizioni**    | Account ruolo staff non trainer/admin.                                                                                                                             |
| **Passi manuali**    | 1. Login. 2. Aprire vista appuntamenti/calendario che usa lo stesso hook (percorso UI reale). 3. Verificare assenza di dati altrui / errori.                       |
| **Risultato atteso** | **DA VERIFICARE**: solo righe permesse; annotare leak o lista vuota errata.                                                                                        |
| **Priorità**         | Alta                                                                                                                                                               |
| **Stato iniziale**   | da eseguire                                                                                                                                                        |
| **Esito**            |                                                                                                                                                                    |

### TC-DATA-004

| Campo                | Valore                                                                                       |
| -------------------- | -------------------------------------------------------------------------------------------- |
| **Dominio**          | Query / Data access                                                                          |
| **Feature**          | `staff_id` vs `trainer_id`                                                                   |
| **Scenario**         | Visualizzazione trainer collegato ad appuntamento — audit: dipendenza trigger/invariante DB. |
| **Precondizioni**    | Appuntamento con trainer e staff valorizzati.                                                |
| **Passi manuali**    | 1. Aprire dettaglio appuntamento in UI. 2. Verificare nome trainer/staff coerente.           |
| **Risultato atteso** | **DA VERIFICARE** incoerenze visuali (null/stale) da annotare.                               |
| **Priorità**         | Media                                                                                        |
| **Stato iniziale**   | da eseguire                                                                                  |
| **Esito**            |                                                                                              |

### TC-DATA-005

| Campo                | Valore                                                                                                                 |
| -------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| **Dominio**          | Query / Data access                                                                                                    |
| **Feature**          | API dashboard appuntamenti “oggi”                                                                                      |
| **Scenario**         | Widget/dashboard che usa `api/dashboard/appointments` vs calendario — possibile differenza criteri (`RULE_CONFLICTS`). |
| **Precondizioni**    | Appuntamenti a cavallo di “completato / passato da >1h” se riconducibili a dati di test.                               |
| **Passi manuali**    | 1. Home dashboard staff con widget appuntamenti. 2. Confrontare con lista calendario stesso giorno.                    |
| **Risultato atteso** | Annotare differenze (priorità bassa per impatto UX in audit, ma utile per evitare falsi bug).                          |
| **Priorità**         | Bassa                                                                                                                  |
| **Stato iniziale**   | da eseguire                                                                                                            |
| **Esito**            |                                                                                                                        |

---

## Pagamenti / ledger (casi base — area ad alta priorità in `FEATURE_STATUS`)

### TC-PAY-001

| Campo                | Valore                                                                                                        |
| -------------------- | ------------------------------------------------------------------------------------------------------------- |
| **Dominio**          | Pagamenti / ledger                                                                                            |
| **Feature**          | Vista pagamenti staff                                                                                         |
| **Scenario**         | Apertura pagina pagamenti dashboard e lettura tabella senza errori (superficie duplicata per ruolo in audit). |
| **Precondizioni**    | Account staff con permesso; dati pagamenti se presenti.                                                       |
| **Passi manuali**    | 1. `/dashboard/pagamenti` (path da `FEATURE_STATUS`). 2. Scroll, ordinamenti se presenti.                     |
| **Risultato atteso** | Caricamento completo o stato vuoto coerente; **DA VERIFICARE** coerenza cifre con DB.                         |
| **Priorità**         | Alta _(dati finanziari — inventario)_                                                                         |
| **Stato iniziale**   | da eseguire                                                                                                   |
| **Esito**            |                                                                                                               |

### TC-PAY-002

| Campo                | Valore                                                                                                |
| -------------------- | ----------------------------------------------------------------------------------------------------- |
| **Dominio**          | Pagamenti / ledger                                                                                    |
| **Feature**          | Abbonamenti                                                                                           |
| **Scenario**         | Vista abbonamenti staff e varianti ruolo (nutrizionista/massaggiatore) — **entry multiple** in audit. |
| **Precondizioni**    | Account per almeno una delle route elencate in `FEATURE_STATUS` (se disponibili).                     |
| **Passi manuali**    | 1. `/dashboard/abbonamenti`. 2. Se applicabile: route parallele nutrizionista/massaggiatore.          |
| **Risultato atteso** | Nessun crash; **DA VERIFICARE** duplicazione logica o numeri divergenti tra route.                    |
| **Priorità**         | Alta                                                                                                  |
| **Stato iniziale**   | da eseguire                                                                                           |
| **Esito**            |                                                                                                       |

### TC-PAY-003

| Campo                | Valore                                                          |
| -------------------- | --------------------------------------------------------------- |
| **Dominio**          | Pagamenti / ledger                                              |
| **Feature**          | Portale atleta — pagamenti propri                               |
| **Scenario**         | Atleta vede solo propri dati (`/home/pagamenti` in inventario). |
| **Precondizioni**    | Account atleta.                                                 |
| **Passi manuali**    | 1. Login atleta. 2. Aprire sezione pagamenti home.              |
| **Risultato atteso** | Nessun dato di altri utenti; **DA VERIFICARE** rispetto RLS.    |
| **Priorità**         | Alta                                                            |
| **Stato iniziale**   | da eseguire                                                     |
| **Esito**            |                                                                 |

---

## Flussi da verificare più avanti (non bloccanti per il “nucleo” ma citati negli audit)

Ordine suggerito: dopo le sezioni a priorità alta.

| ID             | Dominio                            | Perché “dopo”                             | Riferimento audit                         |
| -------------- | ---------------------------------- | ----------------------------------------- | ----------------------------------------- |
| **TC-DEF-001** | Admin                              | Endpoint numerosi; E2E granulare limitata | `FEATURE_STATUS` area admin               |
| **TC-DEF-002** | Impersonazione                     | Start/stop + banner                       | `07_AUTH_RBAC_INDEX`, API `impersonation` |
| **TC-DEF-003** | Comunicazioni vs notifiche         | Confine responsabilità non chiuso         | `RULE_CONFLICTS`, `FEATURE_STATUS`        |
| **TC-DEF-004** | Recupero password / registrazione  | Stato “da verificare”                     | `FEATURE_STATUS`                          |
| **TC-DEF-005** | Promemoria email appuntamenti      | Scheduling non integralmente analizzato   | `FEATURE_STATUS`                          |
| **TC-DEF-006** | Chat                               | Realtime + RLS ambiente                   | `FEATURE_STATUS`                          |
| **TC-DEF-007** | Documenti / storage                | RLS sensibile ambiente                    | `FEATURE_STATUS`                          |
| **TC-DEF-008** | Marketing (lead, KPI, automazioni) | Superficie ampia, E2E sottoinsieme        | `FEATURE_STATUS`                          |
| **TC-DEF-009** | Statistiche / reporting            | Rischio leak = policy DB                  | `FEATURE_STATUS`                          |
| **TC-DEF-010** | Onboarding / API save-step         | Copertura PO limitata                     | `FEATURE_STATUS`                          |

Per ciascun **TC-DEF-\***: stato iniziale `da eseguire`; definire precondizioni quando il team pianifica lo sprint (non dettagliate qui per non inventare flussi).

---

## Riepilogo ordine consigliato (nucleo)

1. TC-AUTH-001 … TC-AUTH-006 (login, route, marketing)
2. TC-CAL-001 … TC-CAL-005, TC-CAL-008 (CRUD, overlap, allineamento viste)
3. TC-ORG-001, TC-ORG-002, TC-ORG-004
4. TC-DATA-001 … TC-DATA-003
5. TC-PAY-001 … TC-PAY-003
6. TC-AUTH-007 (solo se Capacitor)
7. TC-CAL-006, TC-CAL-007, TC-DATA-004, TC-DATA-005
8. TC-DEF-\*

---

_Ultimo aggiornamento: matrice iniziale da indici/audit; nessun codice modificato._
