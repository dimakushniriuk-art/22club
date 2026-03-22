# Resoconto finale – Calendario e impostazioni 22 Club App

Documento di riferimento per l’implementazione delle regole calendario, della pagina Impostazioni calendario e delle integrazioni di sistema.  
Terminologia: **Trainer** (non PT).

**Risposte definitive:** tutte le domande evidenziate in rosso hanno ricevuto risposta definitiva dall’utente e sono riportate come “Risposta definitiva” nel testo. Il documento è pronto per l’implementazione.

---

## 1. Regole utilizzo calendario – riepilogo con domande e risposte definitive

Per ogni punto dove esistevano scelte da chiarire, la **domanda** è evidenziata in **grassetto** e in <span style="color:#e53935">**rosso**</span>, seguita dalla **risposta definitiva** concordata.

---

### 1.1 Calendari disponibili

- Calendario **Trainer** (uno per ogni Trainer).
- Calendario **Nutrizionista**, **Massoterapista**, eventuali altri collaboratori.
- Calendario **Free Pass** (prenotazioni clienti).
- Calendario **Compleanni** clienti.
- Estensibilità per nuovi ruoli (fisioterapista, osteopata, ecc.).

<span style="color:#e53935">**Il Calendario Free Pass è un unico calendario condiviso per l’organizzazione (tutti i Trainer creano slot lì) oppure ogni Trainer ha i propri slot “Libera prenotazione” e il cliente vede tutti gli slot di tutti i Trainer (o solo del proprio Trainer)?**</span>  
**Risposta definitiva:** Il Free Pass esiste **solo per il ruolo Trainer**. Quando un Trainer inserisce uno slot Free Pass, **tutti gli altri Trainer** e **tutti gli atleti** lo vedono nel proprio calendario (per capire che possono prenotarsi per usufruire della palestra). **Un solo slot** per orario a livello organizzazione (non uno per Trainer); **massimo 4 atleti** per quello slot, con **numero massimo configurabile dalle impostazioni**. In vista calendario il Free Pass va mostrato **come sfondo** (come l’attuale “Libera prenotazione”), **non come appuntamento/evento**.

---

### 1.2 Tipologie appuntamenti

**Trainer:** Allenamento singolo, Allenamento doppio, Programma, Prova, Riunione, Privato (slot non prenotabile).  
**Collaboratori:** Prova, Appuntamento normale, Controllo, Riunione, Privato.

**DB attuale:** `appointments.type` ha CHECK con: `allenamento`, `prova`, `valutazione`, `prima_visita`, `riunione`, `massaggio`, `nutrizionista`, `cardio`, `check`, `consulenza`. Mancano: `allenamento_singolo`, `allenamento_doppio`, `programma`, `privato`, `appuntamento_normale`, `controllo` (e allineamento etichette collaboratori).

---

### 1.3 Durate default

- **Trainer:** singolo 90, doppio 90, prova 60, programma 90, riunione 45 (modificabili).
- **Collaboratori:** normale 60, prova 45, controllo 45 (modificabili).
- **Free Pass:** 90 min, **non** modificabili.

<span style="color:#e53935">**Confermare durata prove e controlli collaboratori (45 min)?**</span>  
**Risposta definitiva:** Sì. 45 minuti come durata predefinita per Prova e Controllo (collaboratori); modificabile dall’utente dalle Impostazioni calendario.

---

### 1.4 Ripetizione appuntamenti

- Opzione “Ripeti appuntamento” (ricorrenza).
- Fino a: esaurimento lezioni disponibili del cliente.
- In modifica/eliminazione: “solo questo” o “tutta la serie”.

<span style="color:#e53935">**Le occorrenze “fino a esaurimento lezioni” devono essere esattamente pari alle lezioni rimanenti o c’è un tetto massimo (es. 12 date)?**</span>  
**Risposta definitiva:** Fino a esaurimento lezioni, con **tetto massimo di 100** occorrenze (date).

<span style="color:#e53935">**“Esaurimento” si riferisce al totale crediti (lesson_counters) o a un pacchetto specifico?**</span>  
**Risposta definitiva:** Si conta il **totale crediti** dell’atleta per il tipo di appuntamento: **training / nutrition / massage** (da `lesson_counters` in base al `service_type` dell’appuntamento).

---

### 1.5 Sistema colori

- Doppio → viola scuro; Singolo → lilla; Prova/programma → azzurro; Riunioni → blu; Collaboratori normali → giallo; Controlli → rosa; Privato → arancione; Free Pass → grigio; Slot vuoti → verde.
- Pacchetto terminato → **rosso** (override in visualizzazione).

<span style="color:#e53935">**“Slot vuoti” significa celle della griglia senza eventi (sfondo verde) o un tipo di evento “slot disponibile”?**</span>  
**Risposta definitiva:** **Tipo di evento “slot disponibile”** che si crea in calendario (non solo sfondo verde sulle celle vuote). Quindi il sistema prevede la possibilità di creare eventi “slot disponibile” visualizzati in verde.

**Nota:** In `APPOINTMENT_COLORS` oggi non c’è “lilla”; usare `viola_chiaro` come chiave lilla o aggiungere la chiave `lilla` con lo stesso hex.

---

### 1.6 Visualizzazione calendari

- **Trainer:** proprio + calendari collaboratori + Free Pass; **non** altri Trainer.
- **Collaboratori:** solo proprio; no Trainer, no Free Pass, no altri collaboratori.
- **Clienti:** solo Free Pass (prenotazione).
- **Utenti non clienti:** nessun calendario.

<span style="color:#e53935">**“Utenti non clienti” è un ruolo (es. lead), uno stato (es. profilo senza abbonamento) o “account senza pacchetto attivo”?**</span>  
**Risposta definitiva:** **Stato del profilo** (es. “non ancora cliente”). L’accesso al calendario viene negato in base a questo stato (campo da definire su profilo o su scheda atleta, es. `stato_cliente` o equivalente).

---

### 1.7 Gestione appuntamenti Trainer

- Singoli: non sovrapponibili. Doppi: sovrapponibili tra loro, max 2 clienti per Trainer.
- Alert sovrapposizione con possibilità di “procedi comunque”.

---

### 1.8 Collaboratori

- Appuntamenti singoli, non sovrapponibili; alert se slot occupato.

---

### 1.9 Free Pass

- **Un solo slot** per orario (a livello org). **Max atleti per slot** = valore **configurabile dalle impostazioni** (es. default 4). Clienti modificano solo la propria prenotazione.
- **Visualizzazione:** come **sfondo** (come l’attuale “Libera prenotazione”), **non** come appuntamento/evento in griglia.

<span style="color:#e53935">**“4 clienti per slot” significa stesso identico intervallo (starts_at, ends_at) o stessa “fascia” (sovrapposizione temporale)?**</span>  
**Risposta definitiva:** Stesso intervallo orario (un solo slot per org per quel `starts_at`/`ends_at`). Il numero massimo di prenotazioni per quello slot è **gestibile dalle impostazioni** (es. 4 di default).

---

### 1.10 Slot privati

- Servono **solo per la gestione del tempo personale** di ogni utente staff (pause, blocco agenda). **Non prenotabili.**
- **Nessun altro deve vedere nulla:** lo slot privato è visibile **solo al proprietario** (lo staff che l’ha creato). Gli altri (altri Trainer, collaboratori) **non vedono** gli slot privati altrui (né “Occupato” né altro).

---

### 1.11 Pacchetti lezioni

- Tracciare acquistate/utilizzate/rimanenti; appuntamenti in rosso se terminate; in vista: nome cliente, numero lezione (es. 5/10), lezioni rimanenti.

---

### 1.12 Blocco calendario

- Ferie, chiusure, malattia per impedire prenotazioni.

<span style="color:#e53935">**I blocchi sono solo per singolo staff (ferie del Trainer X) o anche per organizzazione (chiusura palestra)?**</span>  
**Risposta definitiva:** **Entrambi.** Prevedere blocchi **per singolo staff** (ferie, malattia) e blocchi **per organizzazione** (chiusura palestra, festività).

<span style="color:#e53935">**Il blocco vieta solo le prenotazioni o si vede anche visivamente (es. fascia “chiuso”)?**</span>  
**Risposta definitiva:** **Visibile in calendario.** Mostrare una fascia in grigio con etichetta tipo “Chiusura” / “Non disponibile”; in quegli intervalli le prenotazioni sono comunque vietate.

---

### 1.13 Cancellazione e addebito

- **>24h:** annulla, lezione **non** scalata.
- **<24h:** annulla, lezione scalata (manualmente da Trainer/Collaboratore).
- **Eccezione:** “Annulla senza scalare lezione” (solo staff).
- **Storico:** cliente, data, tipo (anticipata / tardiva / eccezionale).
- **No-show:** lezione considerata utilizzata e scalata.

<span style="color:#e53935">**No-show: azione manuale (bottone “Segna no-show” che scala 1) o job automatico a fine giornata?**</span>  
**Risposta definitiva:** **Azione manuale.** Bottone “Segna no-show” nel dettaglio appuntamento (Trainer/Collaboratore) che scala 1 lezione (stesso effetto del completamento: DEBIT nel ledger).

---

### 1.14 Calendario compleanni

- Elencato tra i calendari.

<span style="color:#e53935">**È solo vista/lista (“Oggi compiono gli anni…”) o si creano eventi in calendario?**</span>  
**Risposta definitiva:** **Solo vista/lista** (es. “Oggi compiono gli anni: Mario, Sara”). Nessun evento creato in calendario; si usa `profiles.data_nascita` per il giorno selezionato (es. pannello “Compleanni oggi” in sidebar).

---

### 1.15 Email e promemoria Google Calendar per l’atleta

**Ogni volta che uno staff** (Trainer, Nutrizionista, Massoterapista, ecc.) **inserisce un appuntamento per un atleta**, il sistema deve:

1. **Inviare un’email** all’atleta con promemoria dell’appuntamento (data, ora, tipo, luogo, nome staff, eventuali note).
2. **Inserire automaticamente l’evento in Google Calendar** dell’atleta: tramite link “Aggiungi a Google Calendar” nell’email e/o allegato **file .ics** (iCalendar) che l’atleta può aprire per aggiungere l’evento al proprio Google Calendar (o altro client che supporta .ics).

Implementazione suggerita: dopo la creazione dell’appuntamento (insert in `appointments`), trigger o job che invia email (template con dati appuntamento) e genera link Google Calendar + allegato .ics; l’atleta riceve tutto in una sola email e può aggiungere l’evento con un click.

---

## 2. Impostazioni calendario (pagina aggiuntiva)

Ogni utente staff può configurare **per la propria vista** (e per i default del form):

- **Tipologie abilitate** (quali tipi di appuntamento può creare).
- **Durate default** (minuti) per tipo.
- **Colori per tipo** (mappa tipo → colore).
- **Vista default** (mese/settimana/giorno/agenda), inizio settimana, step griglia.
- **Calendari da mostrare** (solo Trainer/Admin): Free Pass, collaboratori (checkbox).
- **Opzioni ripetizione** (nessuna, 2 settimane, 1 mese, 6 mesi, 1 anno, fino a esaurimento lezioni).
- **Orari di lavoro** (opzionale): giorni e fascia oraria.

**Tabella suggerita:** `staff_calendar_settings` (id, staff_id UNIQUE, org_id, default_durations jsonb, enabled_appointment_types jsonb, type_colors jsonb, default_calendar_view, default_week_start, show_free_pass_calendar, show_collaborators_calendars, recurrence_options jsonb, work_hours jsonb, slot_duration_minutes, created_at, updated_at). RLS: lettura/scrittura solo sul proprio `staff_id`.  
Per il Free Pass: prevedere un’impostazione **numero massimo di atleti per slot Free Pass** (es. in `staff_calendar_settings` o in impostazioni org), default 4, modificabile.

**Route suggerita:** `/dashboard/calendario/impostazioni` (o sotto `/dashboard/impostazioni`). Accesso: stessi ruoli che accedono al calendario (Trainer, Admin, Nutrizionista, Massaggiatore).

---

## 3. Impostazioni aggiuntive possibili (elenco)

- Fuso orario (es. Europe/Rome).
- Lingua e formato data/ora (24h/12h).
- Notifiche/promemoria (email/push, 24h/1h/15 min prima).
- Mostra/nascondi calendari nella sidebar (Trainer: quali calendari vedere e ordine).
- Filtro atleti predefinito (ultimo usato o nessuno).
- Densità vista (compatta/comfort/spaziosa).
- Colore “pacchetto terminato” (override rosso).
- Blocco ricorrente (es. “ogni lunedì pomeriggio non disponibile”).
- Limite visibilità passato (es. ultimi 7/30 giorni).
- Esportazione (CSV/iCal).
- Stampa (layout e intervallo).
- Scorciatoie tastiera (abilitare/disabilitare).
- Slot Free Pass: capienza e durata (org-level; default 4 clienti, 90 min).
- Template appuntamenti (tipo + durata + colore + note).
- Sincronizzazione calendari esterni (Google/Outlook).
- Vista settimana: 5/7/14 giorni.
- Ora inizio/fine griglia (es. 7:00–22:00).
- Evidenzia orario corrente; solo giorni lavorativi.
- Buffer tra appuntamenti (minuti).
- Anticipo prenotazione e limite prenotazioni future.
- Conferma appuntamento (richiesta conferma cliente).
- Promemoria staff (minuti prima); avviso sovrapposizione (blocco/warning/info); avviso pacchetto in scadenza.
- Privacy: cosa mostrare agli altri (slot privati); nome cliente (completo/iniziali/“Cliente”).
- Link iCal/CalDAV; export PDF.
- Precompila atleta (ultimo/nessuno); conferma prima di uscire; salvataggio bozze.
- Dimensione font; ridurre animazioni; tema chiaro calendario.
- Orario apertura/chiusura sede; slot minimo prenotabile; messaggio predefinito note.
- Obiettivo sessioni giornaliere (visivo); evidenzia slot liberi.
- Intervallo sincronizzazione mobile; cache offline.

---

## 4. Punti esistenti da NON toccare

| #   | Elemento                                                                                                      | Dove                                                           | Motivo                                                                                                                                                                                                                                                                                            |
| --- | ------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Tabella `appointments` (struttura base)                                                                       | DB                                                             | Mantenere id, org_id, athlete_id, staff_id, starts_at, ends_at, type, status, notes, location, cancelled_at, created_at, updated_at, trainer_id, recurrence_rule, color, created_by_role, is_open_booking_day, org_id, service_type. Estendere solo constraint e valori ammessi (vedi Modifiche). |
| 2   | Trigger `appointments_apply_debit_on_completed`                                                               | DB                                                             | Scala 1 credito (DEBIT) al passaggio a `completato`; idempotenza su `credit_ledger`. Non rimuovere.                                                                                                                                                                                               |
| 3   | Tabella `credit_ledger` e `lesson_counters`                                                                   | DB                                                             | Fonte verità per crediti; `apply_credit_ledger_to_counter` aggiorna i contatori. Non cambiare logica CREDIT/DEBIT/REVERSAL.                                                                                                                                                                       |
| 4   | Funzioni `slot_is_open_booking`, `slot_has_open_booking_for_rls`                                              | DB                                                             | Usate da RLS e da logica inserimento prenotazioni atleta. Mantenere.                                                                                                                                                                                                                              |
| 5   | Trigger `cancel_athlete_appointments_on_open_slot_change`                                                     | DB                                                             | Annulla prenotazioni atleta se lo slot Libera prenotazione viene modificato/eliminato. Mantenere.                                                                                                                                                                                                 |
| 6   | Funzione `check_appointment_overlap`                                                                          | DB                                                             | Utile per validazione sovrapposizioni; può essere chiamata da app. Non rimuovere.                                                                                                                                                                                                                 |
| 7   | Policy RLS `athlete_select_open_booking_slots` e policy su `appointments`                                     | DB                                                             | Definiscono chi vede cosa. Estendere solo se serve (es. slot privati “occupato”); non stravolgere.                                                                                                                                                                                                |
| 8   | Ruoli `profiles.role`: admin, trainer, athlete, marketing, nutrizionista, massaggiatore                       | DB                                                             | Coerente con guard e flussi. Non introdurre “PT”; usare “Trainer” in UI/commenti.                                                                                                                                                                                                                 |
| 9   | `user_settings` (notification_settings, privacy_settings, account_settings, 2FA)                              | DB                                                             | Impostazioni utente generiche; calendario avrà tabella dedicata `staff_calendar_settings`. Non mischiare.                                                                                                                                                                                         |
| 10  | Ledger `addDebitFromAppointment`, `addCreditFromPayment`, `addReversalFromPayment`                            | src/lib/credits/ledger.ts                                      | Unica fonte per variazioni crediti da app. Non bypassare.                                                                                                                                                                                                                                         |
| 11  | Hook `useCalendarPage` (fetch appuntamenti per staff_id, form submit, cancel, delete, complete, drop, resize) | src/hooks/calendar/use-calendar-page.ts                        | Logica core calendario staff; estendere con impostazioni e validazioni, non riscrivere.                                                                                                                                                                                                           |
| 12  | Guard calendario (trainer/admin su `/dashboard/calendario`; nutrizionista/massaggiatore su route dedicate)    | use-calendar-page-guard.ts, layout nutrizionista/massaggiatore | Separazione per ruolo; estendere solo per “impostazioni” e multi-calendario.                                                                                                                                                                                                                      |
| 13  | Vista atleta `home/appuntamenti` (useAppointments, useAthleteCalendarPage)                                    | src/app/home/appuntamenti                                      | Clienti vedono solo slot prenotabili; mantenere logica e ownership (modifica solo propri).                                                                                                                                                                                                        |
| 14  | Tipi e colori in `src/types/appointment.ts` (APPOINTMENT_COLORS, CreateAppointmentData, ecc.)                 | types                                                          | Estendere con nuovi tipi e eventuale chiave `lilla`; non rimuovere tipi esistenti usati da DB.                                                                                                                                                                                                    |
| 15  | Calcolo lezioni rimanenti (lesson_counters, athlete_administrative_data, credit_ledger)                       | DB + hooks (use-lesson-stats-bulk, use-athlete-administrative) | Usato per “rosso” e per “5/10 lezioni”. Non cambiare logica contatori.                                                                                                                                                                                                                            |

---

## 5. Punti da MODIFICARE e come

| #   | Elemento                                       | Modifica                                              | Dettaglio                                                                                                                                                                                                                                                                                                                                                                                |
| --- | ---------------------------------------------- | ----------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Constraint `appointments_type_check`           | Estendere valori ammessi                              | Aggiungere a CHECK: `allenamento_singolo`, `allenamento_doppio`, `programma`, `privato`, `appuntamento_normale`, `controllo`. Mantenere compatibilità con `allenamento`, `massaggio`, `nutrizionista` (eventualmente mappare in UI “allenamento” → singolo/doppio). Valutare deprecare `cardio`, `check`, `consulenza` o mapparli a nuovi tipi.                                          |
| 2   | Constraint `appointments_color_check`          | Aggiungere `lilla` se assente                         | Se si usa “lilla” in UI/regole: aggiungere `lilla` all’array colori (e in `APPOINTMENT_COLORS` in types).                                                                                                                                                                                                                                                                                |
| 3   | Form nuovo/modifica appuntamento               | Durate e tipi da impostazioni                         | Leggere `staff_calendar_settings.default_durations` e `enabled_appointment_types`; precompilare durata in base al tipo selezionato; mostrare solo tipi abilitati. Per Free Pass: durata fissa 90 min, campo disabilitato.                                                                                                                                                                |
| 4   | CalendarView / pagina calendario               | Vista e calendari da impostazioni                     | Inizializzare vista da `default_calendar_view`, inizio settimana da `default_week_start`. Per Trainer: caricare anche calendari collaboratori e Free Pass se `show_collaborators_calendars` / `show_free_pass_calendar` true.                                                                                                                                                            |
| 5   | Colori eventi in calendario                    | Mappa tipo → colore da impostazioni + rosso pacchetto | Usare `staff_calendar_settings.type_colors` per colore per tipo; se `lezioni_rimanenti <= 0` per quell’atleta (lesson_counters/athlete_administrative), override colore evento in rosso.                                                                                                                                                                                                 |
| 6   | useCalendarPage (fetch)                        | Multi-calendario e lezioni rimanenti                  | Se ruolo Trainer e impostazioni lo consentono: oltre a `staff_id = current`, fare fetch (o query unica) per staff collaboratori e per slot Free Pass; esporre in una struttura unica con indicazione “calendario di chi”. Nel mapping appuntamenti, arricchire con `lessons_remaining` e `lesson_index` (es. 5/10) da lesson_counters/administrative o da API.                           |
| 7   | Validazione sovrapposizioni                    | Reintrodurre con regole Trainer/collaboratori         | In creazione/modifica/spostamento: per Trainer chiamare `check_appointment_overlap` (o logica equivalente): se tipo singolo e c’è già un appuntamento → alert e opzione “procedi comunque”; se doppio contare occorrenze nello stesso intervallo e bloccare oltre 2. Per collaboratori: bloccare qualsiasi sovrapposizione (alert + “procedi comunque” opzionale).                       |
| 8   | Annulla appuntamento (handleCancel)            | Regole 24h e “senza scalare”                          | Calcolare ore tra ora attuale e `starts_at`. Se ≥24h: solo update status/cancelled_at (nessun DEBIT). Se <24h: mostrare opzione “Annulla e scala lezione” (scrive DEBIT come per completamento) oppure “Annulla senza scalare” (solo annullamento). Esporre “Annulla senza scalare” anche per cancellazioni >24h (eccezione). Registrare in storico cancellazioni (nuova tabella o log). |
| 9   | Popover/dettaglio appuntamento                 | No-show e storico                                     | Aggiungere bottone “Segna no-show” (solo staff) che imposta flag/status e scrive DEBIT; in dettaglio mostrare nome cliente, N/10 lezioni, lezioni rimanenti.                                                                                                                                                                                                                             |
| 10  | Ripetizione nel form                           | Opzioni e “fino a esaurimento”                        | Opzioni mostrate da `staff_calendar_settings.recurrence_options`. Se “fino a esaurimento lezioni”: leggere lesson_counters per athlete_id e service_type; generare N occorrenze settimanali con **N = min(lezioni_rimanenti, 100)**; creare N record appointments.                                                                                                                       |
| 11  | Slot Free Pass (creazione prenotazione atleta) | Limite 4 clienti                                      | Prima di inserire prenotazione in uno slot Libera prenotazione: contare appuntamenti con stesso (org_id, staff_id, starts_at, ends_at) e athlete_id non null, status attivo; se count >= 4 bloccare con messaggio.                                                                                                                                                                       |
| 12  | Tipi in AppointmentForm e types                | Allineare a regole                                    | Aggiungere in UI e types: allenamento_singolo, allenamento_doppio, programma, privato (Trainer); appuntamento_normale, controllo (collaboratori). Mantenere massaggio, nutrizionista; etichette in italiano come da regole.                                                                                                                                                              |
| 13  | Guard / route impostazioni                     | Nuova route e guard                                   | Aggiungere route `/dashboard/calendario/impostazioni` (o sotto impostazioni); stesso guard del calendario (trainer, admin, nutrizionista, massaggiatore).                                                                                                                                                                                                                                |

---

## 6. Punti da AGGIUNGERE (descrizione e logica)

| #   | Elemento                                        | Descrizione                        | Logica                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| --- | ----------------------------------------------- | ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1   | Tabella `staff_calendar_settings`               | Impostazioni calendario per staff  | Un record per staff (staff_id UNIQUE). Campi: default_durations (jsonb), enabled_appointment_types (jsonb), type_colors (jsonb), default_calendar_view, default_week_start, show_free_pass_calendar, show_collaborators_calendars, recurrence_options (jsonb), work_hours (jsonb), slot_duration_minutes. RLS: SELECT/INSERT/UPDATE solo dove staff_id = profilo corrente (e admin org se previsto). Default: se nessun record, usare valori da ruolo (trainer vs collaboratore) o da org. |
| 2   | Pagina Impostazioni calendario                  | UI per configurare default         | Form con sezioni: Tipologie abilitate (checkbox per tipo in base al ruolo); Durate (input numero per tipo); Colori (select per tipo); Vista default e inizio settimana; (Trainer/Admin) Mostra Free Pass / Mostra calendari collaboratori; Opzioni ripetizione; Orari di lavoro (opzionale). Salvataggio: upsert su staff_calendar_settings.                                                                                                                                               |
| 3   | Tabella `calendar_blocks` (o equivalente)       | Blocco calendario (ferie/chiusure) | Campi: id, org_id, staff_id (null = blocco org), starts_at, ends_at, reason (ferie/chiusura/malattia), created_at. RLS: staff vede propri blocchi; admin vede blocchi org e possibilmente tutti. In creazione appuntamento e in vista: intervalli bloccati non prenotabili e mostrati come “Non disponibile”.                                                                                                                                                                              |
| 4   | Storico cancellazioni                           | Tracciamento cancellazioni         | Tabella `appointment_cancellations` (id, appointment_id, athlete_id, cancelled_at, cancelled_by_profile_id, cancellation_type: anticipata/tardiva/eccezionale, lesson_deducted boolean). Inserire riga quando si annulla un appuntamento (da popover/API). Usare per report e monitoraggio.                                                                                                                                                                                                |
| 5   | Vista “Compleanni”                              | Layer informativo nel calendario   | Query su profiles dove role atleta e data_nascita (estrazione mese-giorno) = giorno selezionato (o “oggi”). Mostrare in sidebar o piccolo pannello “Compleanni oggi” senza creare eventi.                                                                                                                                                                                                                                                                                                  |
| 6   | Mappatura tipo → durata default (fallback)      | Se manca staff_calendar_settings   | In frontend (o API): per trainer: allenamento_singolo 90, allenamento_doppio 90, prova 60, programma 90, riunione 45, privato 60; per collaboratori: appuntamento_normale 60, prova 45, controllo 45, riunione 45, privato 60; Free Pass sempre 90 non modificabile.                                                                                                                                                                                                                       |
| 7   | Mappatura tipo → colore default (fallback)      | Come da regole documento           | Doppio viola_scuro, singolo lilla, prova/programma azzurro, riunione blu, appuntamento_normale giallo, controllo rosa, privato arancione, Free Pass grigio; slot vuoti = colore griglia verde (solo stile). Rosso = override quando lezioni_rimanenti <= 0.                                                                                                                                                                                                                                |
| 8   | API o helper “lezioni per atleta” in calendario | Per badge 5/10 e rosso             | Dato athlete_id (e opzionale service_type): restituire lezioni_rimanenti, lezioni_incluse (o totale usate+rimanenti). Fonte: lesson_counters + credit_ledger o athlete_administrative_data. Usare nel mapping appuntamenti e nel popover.                                                                                                                                                                                                                                                  |
| 9   | Logica “Annulla senza scalare”                  | Scelta esplicita in UI             | Nel dialog di annullamento: oltre a “Annulla” (con regola 24h per scalare o meno), pulsante “Annulla senza scalare lezione” che imposta solo status/cancelled_at e scrive in storico tipo “eccezionale”. Solo staff.                                                                                                                                                                                                                                                                       |
| 10  | No-show                                         | Azione e DEBIT                     | Bottone “Segna no-show” nel popover (solo staff, appuntamento passato o in corso): update status/flag no_show; inserire DEBIT in credit_ledger per quell’appointment_id (idempotente come completamento); aggiornare lesson_counters tramite trigger esistente.                                                                                                                                                                                                                            |
| 11  | Visibilità slot privati                         | “Occupato” per altri staff         | Se appointment.type = 'privato' e appointment.staff_id ≠ current_staff_id: in lista e in tooltip mostrare solo “Occupato” (nascondere note e dettagli). Stessa logica in API se si espone titolo/note.                                                                                                                                                                                                                                                                                     |
| 12  | Link “Impostazioni calendario”                  | Navigazione                        | Nella pagina calendario (sidebar o toolbar) e/o in Impostazioni profilo: link a `/dashboard/calendario/impostazioni`. Visibile solo a ruoli che hanno accesso al calendario.                                                                                                                                                                                                                                                                                                               |

---

## 7. Parti da sviluppare nel sistema (non solo calendario) che lavoreranno con il calendario

| #   | Area                                | Cosa sviluppare                                                                                                                         | Relazione con il calendario                                                                                                                             |
| --- | ----------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | **Abbonamenti / Pagamenti**         | Flusso acquisto pacchetto e scrittura credit_ledger (CREDIT) + aggiornamento lesson_counters                                            | Calendario mostra “rosso” e “5/10” in base a lesson_counters; “fino a esaurimento lezioni” usa gli stessi dati.                                         |
| 2   | **Scheda atleta (dashboard)**       | Sezione “Prenotazioni / Prossimi appuntamenti” con link al calendario e eventuale “Prenota”                                             | Coerenza dati appointments; cancellazione da scheda deve rispettare stesse regole 24h e storico.                                                        |
| 3   | **Email + Google Calendar atleta**  | Ogni inserimento appuntamento da staff per un atleta: invio email con promemoria + link/ allegato .ics per “Aggiungi a Google Calendar” | Vedi regola **1.15**. Richiede template email, generazione .ics (o link Google Calendar), integrazione con servizio email (es. Resend, SendGrid, SMTP). |
| 4   | **Notifiche / Promemoria**          | Promemoria pre-appuntamento (email/push) e notifiche cancellazione                                                                      | Trigger o job che leggono appointments (starts_at, status) e inviano notifiche; integrazione con impostazioni “promemoria” (future).                    |
| 5   | **Report / Statistiche**            | Report utilizzo calendario, sessioni per Trainer, tasso cancellazioni, no-show                                                          | Lettura appointments + appointment_cancellations; KPI per organizzazione.                                                                               |
| 6   | **App atleta (home)**               | Pagina Appuntamenti: prenotazione slot Free Pass, modifica/cancellazione solo propri, vista solo Free Pass                              | Stessa tabella appointments, stesse policy RLS; limite 4 per slot e ownership già previsti.                                                             |
| 7   | **Definizione “cliente” / accesso** | Regola univoca: chi può prenotare / vedere calendario atleta                                                                            | Blocco “utenti non clienti” al calendario; possibile flag o vista “è cliente” (assegnazione Trainer attiva o lesson_counters > 0 o abbonamento attivo). |
| 8   | **Nuovi ruoli collaboratori**       | Fisioterapista, osteopata, ecc.                                                                                                         | Estendere profiles.role (o tabella ruoli) e guard; stesse regole “collaboratori”: solo proprio calendario, tipi e durate da regole/impostazioni.        |
| 9   | **Dashboard / Home staff**          | Widget “Oggi” con prossimi appuntamenti e link al calendario                                                                            | Dati da API dashboard/appointments o da stessa query calendario; coerenza con lezioni rimanenti e colori.                                               |
| 10  | **Audit / Log**                     | Log modifiche appuntamenti e cancellazioni                                                                                              | appointment_cancellations e eventuale audit_log su appointments per tracciabilità.                                                                      |
| 11  | **Esportazione / Stampabile**       | Export PDF o stampa settimana/giorno                                                                                                    | Usa gli stessi eventi e impostazioni vista; eventuale “layout stampa” in impostazioni calendario.                                                       |

---

## 8. Pronto per lo sviluppo?

**Sì:** regole, risposte definitive, cosa non toccare, modifiche e aggiunte sono definite. Si può avviare lo sviluppo.

**Da allineare in fase di implementazione (dettaglio tecnico):**

| Cosa                                 | Dettaglio                                                                                                                                                                                                                                                                                                                                           |
| ------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Free Pass “un solo slot per org”** | Oggi gli slot sono per `staff_id`. Per “un solo slot per orario a livello org” decidere: un solo record per (org_id, starts_at, ends_at) con `staff_id` del Trainer che lo crea e query che lo fanno vedere a tutti Trainer/atleti; oppure tabella/slot “org” dedicato. Definire anche dove si persiste il “chi ha creato” per eventuali modifiche. |
| **Stato “non ancora cliente”**       | Decidere dove salvarlo: nuovo campo su `profiles` (es. `stato_cliente` o `tipo_cliente`) o su `athlete_administrative_data`; nome campo e valori ammessi (es. `cliente` / `non_ancora_cliente`).                                                                                                                                                    |
| **Evento “slot disponibile”**        | Aggiungere tipo `slot_disponibile` (o nome scelto) al CHECK `appointments_type_check` e in types/UI; colore verde; definire se è prenotabile o solo informativo.                                                                                                                                                                                    |
| **Ripetizione tetto 100**            | Nella modifica #10 (Ripetizione nel form) usare **100** come tetto massimo, non 52: `N = min(lezioni_rimanenti, 100)`.                                                                                                                                                                                                                              |
| **Slot privati visibilità**          | La risposta definitiva è “nessuno vede nulla” (solo il proprietario). In query/fetch calendario: **escludere** gli appuntamenti con `type = 'privato'` quando `staff_id ≠ current_staff_id` (non mostrare “Occupato”, proprio non mostrarli). Allineare il punto “Punti da AGGIUNGERE” #11: non “mostrare Occupato” ma “nascondere del tutto”.      |
| **Max atleti Free Pass**             | Il numero (default 4) configurabile: decidere se in `staff_calendar_settings`, in impostazioni org (tabella org o `org_calendar_defaults`) o in entrambi con override org → staff.                                                                                                                                                                  |

**Decisioni che si possono rimandare:**

- Servizio email per promemoria + .ics (Resend, SendGrid, SMTP, ecc.).
- Template esatto dell’email (testo, layout, link Google Calendar vs solo .ics).
- Ordine esatto delle fasi di sviluppo (il doc dà già modifiche/aggiunte numerate; si può seguire quello o definire sprint).

**Suggerimento ordine di sviluppo (opzionale):**

1. **Fase 1 – DB e impostazioni:** migration `appointments` (nuovi type, colore lilla), `staff_calendar_settings`, `calendar_blocks`, `appointment_cancellations`; pagina Impostazioni calendario; fallback durate/colori.
2. **Fase 2 – Calendario core:** tipi in form, durate da impostazioni, colori e rosso pacchetto, vista default, link Impostazioni; slot privati (nascondere agli altri); ripetizione con tetto 100 e “fino a esaurimento”.
3. **Fase 3 – Free Pass e multi-calendario:** un solo slot per org, visibilità a tutti Trainer/atleti, sfondo (non evento), max atleti configurabile; Trainer vede collaboratori + Free Pass; validazione sovrapposizioni.
4. **Fase 4 – Cancellazioni e no-show:** regole 24h, “Annulla senza scalare”, storico cancellazioni, bottone No-show.
5. **Fase 5 – Blocchi, compleanni, email:** calendar_blocks in vista e in creazione; pannello Compleanni; email atleta + .ics/Google Calendar.
6. **Fase 6 – Atleta e “cliente”:** stato profilo “non ancora cliente”, blocco accesso calendario; app atleta (Free Pass, limite 4, ownership).

---

## 9. Riferimenti rapidi codice e DB

- **Appointments:** `backup_supabase.sql` → `CREATE TABLE public.appointments` (circa riga 9344); constraint `appointments_type_check`, `appointments_color_check`, `appointments_service_type_check`, `appointments_status_check`.
- **Credit/Lessons:** `credit_ledger`, `lesson_counters`, `apply_credit_ledger_to_counter`, `appointments_apply_debit_on_completed`; `src/lib/credits/ledger.ts`.
- **Calendario staff:** `src/app/dashboard/calendario/page.tsx`, `src/hooks/calendar/use-calendar-page.ts`, `src/hooks/calendar/use-calendar-page-guard.ts`.
- **Calendario atleta:** `src/app/home/appuntamenti/page.tsx`, `useAppointments`, `useAthleteCalendarPage`.
- **Tipi e colori:** `src/types/appointment.ts` (`APPOINTMENT_COLORS`, tipi appointment).
- **Form:** `src/components/calendar/appointment-form.tsx`; vista: `src/components/calendar/calendar-view.tsx`.
- **Profili/ruoli:** `profiles.role` (admin, trainer, athlete, marketing, nutrizionista, massaggiatore); `profiles.data_nascita` per compleanni.

---

_Documento generato per l’implementazione del calendario 22 Club. Usare Trainer (non PT) in tutta la documentazione e in UI/commenti. Per domande in rosso/grassetto sono indicate le risposte consigliate in linea con la logica attuale._
