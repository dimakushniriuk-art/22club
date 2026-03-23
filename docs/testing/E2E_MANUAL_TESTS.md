# 22Club — E2E Manual Test Suite

Suite operativa per verifica finale post RLS e stabilizzazione DB/app. Nessun codice: solo passi utente e attese.

---

## 1. Test Critici

### C1 — Appuntamento: creazione staff

| Campo                     | Contenuto                                                                                                                                                                                                                                                                                                                 |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **ID**                    | C1                                                                                                                                                                                                                                                                                                                        |
| **Ruolo**                 | Staff con accesso calendario/appuntamenti (es. trainer o ruolo equivalente abilitato)                                                                                                                                                                                                                                     |
| **Setup**                 | Account staff loggato; organizzazione corretta; almeno un atleta assegnato o selezionabile secondo regole prodotto                                                                                                                                                                                                        |
| **Azione (step-by-step)** | 1) Apri area Calendario / Appuntamenti. 2) Avvia creazione nuovo appuntamento. 3) Seleziona atleta consentito. 4) Imposta data, ora inizio e durata coerenti. 5) Salva / conferma. 6) Attendi messaggio di successo o assenza errori. 7) Verifica che l’evento compaia sulla vista calendario nella fascia oraria scelta. |
| **Risultato atteso**      | Appuntamento persistito; visibile nel calendario; nessun errore bloccante in UI o toast di fallimento                                                                                                                                                                                                                     |
| **Note (se fallisce)**    | Possibile blocco RLS su `appointments`, errore API, mapping org/atleta errato, o validazione solo lato client                                                                                                                                                                                                             |

---

### C2 — Appuntamento: modifica staff

| Campo                     | Contenuto                                                                                                                                                                                                                                                                                        |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **ID**                    | C2                                                                                                                                                                                                                                                                                               |
| **Ruolo**                 | Stesso staff di C1                                                                                                                                                                                                                                                                               |
| **Setup**                 | Esiste almeno un appuntamento creato in C1 (o preesistente equivalente)                                                                                                                                                                                                                          |
| **Azione (step-by-step)** | 1) Individua l’appuntamento sul calendario. 2) Apri dettaglio / modifica. 3) Cambia data o ora inizio (o durata se il form è unico). 4) Salva. 5) Chiudi il pannello se presente. 6) Verifica posizione e orario sulla griglia. 7) Riapri dettaglio e controlla che i valori salvati coincidano. |
| **Risultato atteso**      | Modifica persistita; calendario e dettaglio allineati                                                                                                                                                                                                                                            |
| **Note (se fallisce)**    | UPDATE negato (RLS/API), cache UI obsoleta, o trigger che altera campi inattesi                                                                                                                                                                                                                  |

---

### C3 — Appuntamento: eliminazione staff

| Campo                     | Contenuto                                                                                                                                                                                                                                    |
| ------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **ID**                    | C3                                                                                                                                                                                                                                           |
| **Ruolo**                 | Stesso staff                                                                                                                                                                                                                                 |
| **Setup**                 | Appuntamento modificabile (es. quello di C2)                                                                                                                                                                                                 |
| **Azione (step-by-step)** | 1) Seleziona l’appuntamento. 2) Avvia eliminazione (icona cestino / menu contestuale / conferma dialog). 3) Conferma se richiesto. 4) Verifica che l’evento sparisca dal calendario. 5) Aggiorna la pagina (F5) e verifica che non riappaia. |
| **Risultato atteso**      | Record rimosso o coerente con soft-delete atteso dal prodotto; nessun “fantasma” dopo refresh                                                                                                                                                |
| **Note (se fallisce)**    | DELETE bloccato da RLS; vincoli FK; bug UI che rimuove solo in memoria                                                                                                                                                                       |

---

### C4 — Appuntamento: drag (spostamento)

| Campo                     | Contenuto                                                                                                                                                                                                                                                                                              |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **ID**                    | C4                                                                                                                                                                                                                                                                                                     |
| **Ruolo**                 | Staff calendario                                                                                                                                                                                                                                                                                       |
| **Setup**                 | Almeno un appuntamento visibile su vista che supporta il trascinamento                                                                                                                                                                                                                                 |
| **Azione (step-by-step)** | 1) Posiziona il puntatore sull’evento. 2) Trascina l’evento su un altro slot temporale (stesso giorno o altro, come consentito dall’UI). 3) Rilascia. 4) Attendi eventuale salvataggio automatico o conferma. 5) Verifica nuova posizione sulla griglia. 6) Ricarica la pagina e verifica persistenza. |
| **Risultato atteso**      | Nuovo orario salvato lato server; dopo refresh l’evento resta nel nuovo slot                                                                                                                                                                                                                           |
| **Note (se fallisce)**    | PATCH/UPDATE fallito dopo drag, ottimistic UI senza commit, conflitto con regole overlap                                                                                                                                                                                                               |

---

### C5 — Appuntamento: resize (durata)

| Campo                     | Contenuto                                                                                                                                                                                                                     |
| ------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **ID**                    | C5                                                                                                                                                                                                                            |
| **Ruolo**                 | Staff calendario                                                                                                                                                                                                              |
| **Setup**                 | Evento con maniglia di ridimensionamento verticale (o controllo durata equivalente)                                                                                                                                           |
| **Azione (step-by-step)** | 1) Allunga o accorcia la durata trascinando il bordo inferiore (o equivalente). 2) Rilascia. 3) Verifica fascia oraria aggiornata. 4) Ricarica la pagina. 5) Controlla che ora di fine e durata siano coerenti con il resize. |
| **Risultato atteso**      | Durata persistita; coerenza tra calendario e dettaglio                                                                                                                                                                        |
| **Note (se fallisce)**    | Stesso cluster di C4; validazione durata minima/massima solo in UI                                                                                                                                                            |

---

### C6 — Appuntamento: overlap (sovrapposizione)

| Campo                     | Contenuto                                                                                                                                                                                                                                                         |
| ------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **ID**                    | C6                                                                                                                                                                                                                                                                |
| **Ruolo**                 | Staff                                                                                                                                                                                                                                                             |
| **Setup**                 | Conoscere la regola business attesa: sovrapposizione vietata vs consentita per stesso trainer/risorsa                                                                                                                                                             |
| **Azione (step-by-step)** | 1) Crea o sposta un appuntamento A in un intervallo. 2) Crea o sposta un secondo appuntamento B in modo che si sovrapponga ad A secondo la regola del prodotto. 3) Osserva se l’UI blocca, avvisa, o salva. 4) Se salvato, verifica entrambi in lista/calendario. |
| **Risultato atteso**      | Comportamento allineato alla regola dichiarata (blocco/warning o doppio evento se consentito); nessuna incoerenza tra messaggio UI e dati dopo refresh                                                                                                            |
| **Note (se fallisce)**    | Regola solo in app e DB che accetta overlap (o viceversa); RLS che maschera uno dei due                                                                                                                                                                           |

---

### C7 — Open booking atleta

| Campo                     | Contenuto                                                                                                                                                                                                                                                                                                                                                                                |
| ------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **ID**                    | C7                                                                                                                                                                                                                                                                                                                                                                                       |
| **Ruolo**                 | Atleta (account dedicato, non staff)                                                                                                                                                                                                                                                                                                                                                     |
| **Setup**                 | Esistono slot prenotabili o flusso “prenota lezione” configurato; atleta nella org corretta                                                                                                                                                                                                                                                                                              |
| **Azione (step-by-step)** | 1) Logout staff se necessario; login come atleta. 2) Apri sezione prenotazione / calendario atleta (o percorso equivalente). 3) Seleziona slot disponibile. 4) Completa conferma prenotazione. 5) Verifica messaggio di successo. 6) Controlla che la prenotazione compaia nella vista atleta. 7) (Opzionale) Login staff e verifica che lo stesso appuntamento sia visibile lato staff. |
| **Risultato atteso**      | Prenotazione creata; visibile ad atleta e coerente con vista staff; nessun errore permessi                                                                                                                                                                                                                                                                                               |
| **Note (se fallisce)**    | RLS su `appointments` / `calendar_blocks` incoerente tra ruoli; filtri org errati                                                                                                                                                                                                                                                                                                        |

---

### C8 — Pagamento → movimenti credito (ledger)

| Campo                     | Contenuto                                                                                                                                                                                                                                                                                                                                    |
| ------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **ID**                    | C8                                                                                                                                                                                                                                                                                                                                           |
| **Ruolo**                 | Staff abilitato a registrare pagamenti (o admin operativo)                                                                                                                                                                                                                                                                                   |
| **Setup**                 | Atleta con profilo valido per registrazione incasso; ambiente dove è lecito creare un pagamento di test                                                                                                                                                                                                                                      |
| **Azione (step-by-step)** | 1) Apri flusso registrazione pagamento (abbonamenti / cassa / scheda atleta — percorso reale dell’app). 2) Seleziona atleta e importo coerente con il caso di test. 3) Completa salvataggio. 4) Apri la vista movimenti / credito / storico collegato (se esiste in app). 5) Verifica presenza della riga attesa e coerenza importo e segno. |
| **Risultato atteso**      | Record su pagamenti; movimento corrispondente su credito/ledger coerente con la regola business (importo, verso, riferimento)                                                                                                                                                                                                                |
| **Note (se fallisce)**    | Trigger su `credit_ledger`, policy su `payments`/`credit_ledger`, transazione non atomica                                                                                                                                                                                                                                                    |

---

### C9 — Comunicazione: invio e destinatari

| Campo                     | Contenuto                                                                                                                                                                                                                                                            |
| ------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **ID**                    | C9                                                                                                                                                                                                                                                                   |
| **Ruolo**                 | Staff comunicazioni / marketing (ruolo reale del prodotto)                                                                                                                                                                                                           |
| **Setup**                 | Lista atleti o segmento disponibile; contenuto di test non sensibile                                                                                                                                                                                                 |
| **Azione (step-by-step)** | 1) Apri modulo invio comunicazione. 2) Imposta titolo/corpo minimi. 3) Seleziona uno o più destinatari (o segmento). 4) Invia. 5) Verifica stato invio e presenza nella cronologia comunicazioni. 6) Controlla che il numero destinatari corrisponda alla selezione. |
| **Risultato atteso**      | Comunicazione registrata; destinatari coerenti con la selezione; nessun errore permessi                                                                                                                                                                              |
| **Note (se fallisce)**    | INSERT su `communications` / `communication_recipients` bloccato da RLS; job asincrono fallito                                                                                                                                                                       |

---

### C10 — Visibilità comunicazione: destinatario

| Campo                     | Contenuto                                                                                                                                                                              |
| ------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **ID**                    | C10                                                                                                                                                                                    |
| **Ruolo**                 | Atleta incluso tra i destinatari di C9                                                                                                                                                 |
| **Setup**                 | Comunicazione inviata in C9; logout staff                                                                                                                                              |
| **Azione (step-by-step)** | 1) Login come atleta destinatario. 2) Apri area notifiche / comunicazioni / centro messaggi (percorso reale). 3) Individua la comunicazione di test. 4) Apri il dettaglio se previsto. |
| **Risultato atteso**      | La comunicazione è visibile e leggibile; nessun errore                                                                                                                                 |
| **Note (se fallisce)**    | Policy lettura su `communication_recipients` o join errata; filtro stato “inviata”                                                                                                     |

---

### C11 — Visibilità comunicazione: non destinatario

| Campo                     | Contenuto                                                                                                                     |
| ------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| **ID**                    | C11                                                                                                                           |
| **Ruolo**                 | Altro atleta della stessa org **non** incluso in C9                                                                           |
| **Setup**                 | Account atleta distinto; stessa org se pertinente                                                                             |
| **Azione (step-by-step)** | 1) Login come secondo atleta. 2) Apri la stessa area di C10. 3) Cerca la comunicazione di test (ricerca per titolo o scroll). |
| **Risultato atteso**      | La comunicazione di C9 **non** è visibile a questo utente                                                                     |
| **Note (se fallisce)**    | Fuga dati tra atleti; policy troppo permissiva su SELECT                                                                      |

---

### C12 — Allineamento ruoli: staff vs atleta su stesso appuntamento

| Campo                     | Contenuto                                                                                                                                                                                                                             |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **ID**                    | C12                                                                                                                                                                                                                                   |
| **Ruolo**                 | Staff + atleta coinvolto                                                                                                                                                                                                              |
| **Setup**                 | Appuntamento esistente che collega staff e atleta (es. dopo C1 o C7)                                                                                                                                                                  |
| **Azione (step-by-step)** | 1) Come staff, annota data, ora, titolo/atleta dell’evento. 2) Come atleta, apri calendario/prenotazioni e localizza lo stesso appuntamento. 3) Confronta orario e identificativo visibile (nome trainer / tipo lezione se mostrato). |
| **Risultato atteso**      | Stesso evento logico riconoscibile da entrambi i lati; nessuna discrepanza di orario o assenza lato atleta                                                                                                                            |
| **Note (se fallisce)**    | Filtri RLS diversi tra route; bug timezone; mapping id atleta                                                                                                                                                                         |

---

## 2. Test Medi

### M1 — Permessi ruolo: staff senza calendario

| Campo                     | Contenuto                                                                                               |
| ------------------------- | ------------------------------------------------------------------------------------------------------- |
| **ID**                    | M1                                                                                                      |
| **Ruolo**                 | Staff con ruolo che **non** dovrebbe gestire appuntamenti (se esiste nel tenant)                        |
| **Setup**                 | Account dedicato o disabilitazione temporanea permessi solo se gestibile in sicurezza                   |
| **Azione (step-by-step)** | 1) Login. 2) Naviga verso Calendario / Appuntamenti. 3) Tenta creazione o modifica se l’UI lo permette. |
| **Risultato atteso**      | Voce di menu assente o azioni disabilitate; oppure errore chiaro dal server se si forza l’azione        |
| **Note (se fallisce)**    | Controllo solo UI senza enforcement API/RLS                                                             |

---

### M2 — Calendar blocks (chiusure / blocchi)

| Campo                     | Contenuto                                                                                                                                               |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **ID**                    | M2                                                                                                                                                      |
| **Ruolo**                 | Staff che gestisce calendario o impostazioni blocco                                                                                                     |
| **Setup**                 | Possibilità di creare un blocco orario/giorno di test                                                                                                   |
| **Azione (step-by-step)** | 1) Crea un `calendar_block` (o equivalente UI) su fascia oraria. 2) Tenta di creare un appuntamento nella fascia bloccata. 3) Osserva blocco o warning. |
| **Risultato atteso**      | Comportamento coerente con la regola prodotto; staff vede il blocco                                                                                     |
| **Note (se fallisce)**    | Lettura `calendar_blocks` o policy INSERT su appuntamenti non allineate                                                                                 |

---

### M3 — Filtri lista vs calendario

| Campo                     | Contenuto                                                                                                                                                     |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **ID**                    | M3                                                                                                                                                            |
| **Ruolo**                 | Staff                                                                                                                                                         |
| **Setup**                 | Più appuntamenti in giorni diversi o con filtri applicabili                                                                                                   |
| **Azione (step-by-step)** | 1) Imposta filtri data/atleta nella vista lista (se presente). 2) Confronta con la vista calendario per lo stesso intervallo. 3) Verifica conteggi o elenchi. |
| **Risultato atteso**      | Stessi record logici tra le due viste per gli stessi filtri                                                                                                   |
| **Note (se fallisce)**    | Query diverse, parametri timezone, paginazione lista                                                                                                          |

---

### M4 — Storno / annullo pagamento

| Campo                     | Contenuto                                                                                                        |
| ------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| **ID**                    | M4                                                                                                               |
| **Ruolo**                 | Staff autorizzato agli storni (se il flusso esiste)                                                              |
| **Setup**                 | Pagamento di test registrato (es. legato a C8)                                                                   |
| **Azione (step-by-step)** | 1) Individua il pagamento. 2) Esegui storno/annullo secondo UI. 3) Verifica stato pagamento e movimenti credito. |
| **Risultato atteso**      | Stato aggiornato; ledger coerente (contropartita o segno atteso)                                                 |
| **Note (se fallisce)**    | Policy UPDATE/DELETE, trigger incompleto, doppia registrazione                                                   |

---

### M5 — Stato comunicazione (bozza → invio)

| Campo                     | Contenuto                                                                                      |
| ------------------------- | ---------------------------------------------------------------------------------------------- |
| **ID**                    | M5                                                                                             |
| **Ruolo**                 | Staff comunicazioni                                                                            |
| **Setup**                 | Flusso bozza se disponibile                                                                    |
| **Azione (step-by-step)** | 1) Salva bozza. 2) Verifica in elenco. 3) Invia dalla bozza. 4) Controlla stato e destinatari. |
| **Risultato atteso**      | Transizioni di stato corrette; nessun doppio invio non voluto                                  |
| **Note (se fallisce)**    | Campo stato o tabella recipients non aggiornata                                                |

---

### M6 — Vista admin / incroci pagamenti

| Campo                     | Contenuto                                                                                                                           |
| ------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| **ID**                    | M6                                                                                                                                  |
| **Ruolo**                 | Admin (se applicabile al tenant)                                                                                                    |
| **Setup**                 | Pagamento di test noto                                                                                                              |
| **Azione (step-by-step)** | 1) Apri vista elenco pagamenti o report rilevante. 2) Cerca il record di test. 3) Confronta con quanto visto dallo staff operativo. |
| **Risultato atteso**      | Coerenza tra ruoli; nessun record “invisibile” ad admin che lo staff vede                                                           |
| **Note (se fallisce)**    | Policy differenziate admin vs staff errate                                                                                          |

---

## 3. Test Opzionali

### O1 — Concorrenza: due schede stesso utente

| Campo                     | Contenuto                                                                                                                                                  |
| ------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **ID**                    | O1                                                                                                                                                         |
| **Ruolo**                 | Staff                                                                                                                                                      |
| **Setup**                 | Due finestre/tab sullo stesso browser con stesso account                                                                                                   |
| **Azione (step-by-step)** | 1) Tab A: apri appuntamento X. 2) Tab B: modifica stesso X con altro orario. 3) Tab A: salva. 4) Osserva messaggi e stato finale dopo refresh in entrambe. |
| **Risultato atteso**      | Ultimo salvataggio coerente oppure conflitto gestito esplicitamente                                                                                        |
| **Note (se fallisce)**    | Last-write-wins silenzioso, perdita dati                                                                                                                   |

---

### O2 — Mobile / PWA

| Campo                     | Contenuto                                                                                                |
| ------------------------- | -------------------------------------------------------------------------------------------------------- |
| **ID**                    | O2                                                                                                       |
| **Ruolo**                 | Staff e/o atleta                                                                                         |
| **Setup**                 | Dispositivo mobile o emulatore; stesso ambiente di test                                                  |
| **Azione (step-by-step)** | Ripetere sottoinsieme: C4 drag se supportato mobile, C7 prenotazione atleta, apertura comunicazioni C10. |
| **Risultato atteso**      | Parità funzionale con desktop salvo limitazioni dichiarate                                               |
| **Note (se fallisce)**    | Problemi solo client/layout, non DB                                                                      |

---

### O3 — Refresh e consistenza UI

| Campo                     | Contenuto                                                                                                          |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| **ID**                    | O3                                                                                                                 |
| **Ruolo**                 | Staff                                                                                                              |
| **Setup**                 | Dopo C2 o C4                                                                                                       |
| **Azione (step-by-step)** | 1) Esegui modifica salvata. 2) Hard refresh (Ctrl+F5). 3) Verifica dati. 4) Naviga via e torna alla stessa pagina. |
| **Risultato atteso**      | Dati sempre allineati al server                                                                                    |
| **Note (se fallisce)**    | Cache React/SWR o route segment stale                                                                              |

---

### O4 — Lesson counters

| Campo                     | Contenuto                                                                                                                                          |
| ------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| **ID**                    | O4                                                                                                                                                 |
| **Ruolo**                 | Staff                                                                                                                                              |
| **Setup**                 | Flusso che incrementa/decrementa contatori lezioni (presenza, completamento, o pagamento legato)                                                   |
| **Azione (step-by-step)** | 1) Annota valore contatore prima. 2) Esegui azione che dovrebbe aggiornarlo (es. lezione completata). 3) Ricarica scheda atleta o vista contatori. |
| **Risultato atteso**      | Contatore aggiornato secondo regola business                                                                                                       |
| **Note (se fallisce)**    | Trigger, policy su `lesson_counters`, o aggiornamento solo in memoria                                                                              |

---

## 4. Ordine di esecuzione consigliato

1. **C1** → **C2** → **C3** (CRUD lineare sullo stesso evento, dove possibile).
2. **C4** → **C5** (drag/resize sullo stesso evento ricreato se C3 ha eliminato il precedente).
3. **C6** (overlap, con eventi dedicati).
4. **C7** (atleta, ambiente pulito dopo i test staff o con dati separati).
5. **C12** (allineamento staff/atleta).
6. **C8** (pagamenti; usare importi di test tracciabili).
7. **C9** → **C10** → **C11** (comunicazioni e confidenzialità).
8. **M1**–**M6** (permessi, blocchi, filtri, storni, stato, admin).
9. **O1**–**O4** (opzionali, in qualsiasi ordine).

_Nota:_ se **C9** richiede destinatari reali, pianificare account atleta prima dell’invio.

---

## 5. Log risultati

Compilare durante l’esecuzione.

| Test ID | Esito | Note | Data |
| ------- | ----- | ---- | ---- |
| C1      |       |      |      |
| C2      |       |      |      |
| C3      |       |      |      |
| C4      |       |      |      |
| C5      |       |      |      |
| C6      |       |      |      |
| C7      |       |      |      |
| C8      |       |      |      |
| C9      |       |      |      |
| C10     |       |      |      |
| C11     |       |      |      |
| C12     |       |      |      |
| M1      |       |      |      |
| M2      |       |      |      |
| M3      |       |      |      |
| M4      |       |      |      |
| M5      |       |      |      |
| M6      |       |      |      |
| O1      |       |      |      |
| O2      |       |      |      |
| O3      |       |      |      |
| O4      |       |      |      |
