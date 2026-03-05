# Pagina Appuntamenti (Home)

Documentazione della pagina **Appuntamenti** accessibile da Home: `/home/appuntamenti`.

---

## Panoramica

- **URL:** `http://localhost:3001/home/appuntamenti` (o base URL di deploy)
- **Ruoli:** Atleta, Trainer (PT), Admin
- **Comportamento:** La pagina mostra una **vista calendario** per gli atleti e una **vista lista** (card) per trainer/admin.

---

## Due modalità in base al ruolo

### 1. Vista Atleta (ruolo `athlete` / `atleta`)

L’atleta vede:

- Un **calendario FullCalendar** con i propri appuntamenti e gli slot **Libera prenotazione**.
- **Slot Libera prenotazione:** fasce orarie create dal trainer/admin in cui l’atleta può prenotare; sono mostrate come **blocchi di sfondo cyan** (senza titolo negli slot), con indicazione **x/6** (prenotazioni per slot, max 6).
- **Click su slot Libera:** apre il form “Nuovo appuntamento” con data/ora già compilate.
- **Click su evento normale:** apre un **popover** con dettagli, Modifica, Annulla, Elimina (solo per eventi creati dall’atleta).
- **FAB “+”** per nuovo appuntamento (solo se ha un trainer assegnato).
- **Drag & resize** solo sugli eventi creati dall’atleta (`created_by_role === 'athlete'`).
- Se **non ha un trainer assegnato**, viene mostrato il messaggio: *“Non hai ancora un trainer assegnato. Contatta l’organizzazione per poter prenotare.”* e il FAB non è mostrato.

### 2. Vista Trainer / Admin (ruoli `pt`, `trainer`, `admin`)

Il trainer/admin vede:

- **Lista a card** (nessun calendario):
  - **Prossimi Appuntamenti:** card cliccabili con tipo, data, orario, sede, trainer, note.
  - **Appuntamenti Passati:** stessa struttura per il passato.
- **Click su una card:** apre il **popover** con Modifica, Annulla, Elimina.
- **Modifica:** apre il **form** in modale; al salvataggio i dati vengono aggiornati e la lista refresha.

---

## Calendario (solo atleta)

### Viste disponibili

- **Mese** (dayGridMonth)
- **Settimana** (timeGridWeek)
- **Giorno** (timeGridDay)
- **Agenda** (listWeek)

Navigazione: pulsanti **Oggi**, **Precedente**, **Successivo** e titolo corrente; tab per cambiare vista.

### Contenuto degli eventi per vista

- **Vista Mese:** in ogni barra evento vengono mostrati **avatar atleta** (foto profilo o iniziale) + **titolo** (es. “Allenamento – Nome Atleta”).
- **Vista Settimana / Giorno:** **avatar atleta** + **tipo** (es. Allenamento) + **nome atleta** + **orario** (es. 08:15 – 09:15).
- **Vista Agenda:** **tipo – atleta** in grassetto; sotto, **sede** (se presente). L’orario è già nella colonna tempo del calendario, quindi non viene ripetuto nel blocco evento.

### Slot Libera prenotazione (vista atleta)

- Sono eventi con `is_open_booking_day === true`, mostrati come **sfondo** (colore cyan) nella griglia.
- In vista mese, i **giorni** che contengono almeno uno slot Libera sono evidenziati con un evento **all-day** di sfondo (stesso cyan).
- Su ogni slot Libera può essere mostrato **x/6** (numero prenotazioni / massimo 6 per slot).
- Le date sono gestite in **locale** (no UTC) per evitare slittamenti di giorno (es. slot che finiscono il giorno dopo).

### FAB e modale form

- **FAB** (pulsante “+”) in basso a destra, con posizione che rispetta **safe area** (notch / barra di navigazione su mobile).
- **Form** in modale fullscreen: su **mobile** è scrollabile e allineato in alto; su desktop centrato. Supporta creazione e modifica; per l’atleta può essere precompilato con lo slot selezionato (Libera prenotazione o selezione area).

### Responsive (smartphone)

- **Header calendario:** su mobile su due righe (navigazione + titolo, poi tab vista); pulsanti con area tocco minima 44px.
- **Altezza calendario:** su mobile `55vh` / `min-h 260px`, da `sm` in su `70vh` / `min-h 380px`.
- **Modale form:** padding con `env(safe-area-inset-*)`, scroll verticale, form con `max-h: calc(100dvh - 2rem)`.
- **Popover:** larghezza massima `calc(100vw - 2rem)` e pulsanti con area tocco 44px.

---

## Dati e permessi

### Origine dati

- **Atleta:** `useAthleteCalendarPage(profileId)`  
  - Carica appuntamenti (RLS: propri + eventuali slot weekend visibili a tutti).  
  - Risolve nomi atleti/trainer e **avatar atleta** da `profiles` (avatar, avatar_url).  
  - Calcola `slotBookingCounts` per gli slot Libera (conteggio prenotazioni per `starts_at|ends_at`).  
  - Trainer assegnato tramite RPC `get_my_trainer_profile` (pt_id, nome, cognome).

- **Trainer/Admin:** `useAppointments({ userId: profileId, role })`  
  - Query su `appointments` con join su `profiles` per atleta (nome, cognome, **avatar, avatar_url**), trainer, staff.  
  - Restituisce lista con `athlete_name`, `athlete_avatar_url`, `trainer_name`, ecc.

### Tipo appuntamento e titolo in calendario

- Tipi supportati: Allenamento, Prova, Valutazione, Prima Visita, Riunione, Massaggio, Nutrizionista.
- Titolo evento: **“Tipo – Nome atleta”** (es. “Allenamento – Mario Rossi”), usato nelle barre e nel tooltip.

### RLS e Libera prenotazione

- Le policy su `appointments` (incluse quelle per slot aperti e limite 6) sono definite nelle migration (es. `20260237_libera_prenotazione_slot_capacity_and_visibility.sql`, `20260238_appointments_open_slots_policy_no_recursion.sql`).
- La logica “max 6 prenotazioni per slot” e la visibilità degli slot sono applicate lato DB/RLS; la UI mostra solo **x/6** e messaggi di slot pieno dove previsto.

---

## File principali

| File | Ruolo |
|------|--------|
| `src/app/home/appuntamenti/page.tsx` | Pagina: branching atleta vs lista, header, calendario/liste, modale form, popover |
| `src/components/calendar/calendar-view.tsx` | FullCalendar: viste, eventContent (mese/settimana/giorno/agenda), avatar, FAB, tooltip, Oggi/Prev/Next |
| `src/components/calendar/appointment-form.tsx` | Form creazione/modifica appuntamento (date, orari, tipo, atleta, note, sede, Libera prenotazione) |
| `src/components/calendar/appointment-popover.tsx` | Popover su click evento/card: dettagli, Modifica, Annulla, Elimina |
| `src/hooks/use-appointments.ts` | Hook lista appuntamenti per trainer/admin (con avatar atleta da profiles) |
| `src/hooks/calendar/use-athlete-calendar-page.ts` | Hook calendario atleta: fetch, slotBookingCounts, trainer, submit/cancel/delete/drop/resize |
| `src/types/appointment.ts` | Tipi `AppointmentUI`, `CreateAppointmentData`, `EditAppointmentData`, colori, `athlete_avatar_url` |

---

## Flussi principali

### Atleta: prenotare su slot Libera

1. L’atleta vede gli slot cyan (Libera prenotazione) e eventualmente “x/6”.
2. Click sullo slot → si apre il form con data/ora già impostate, atleta = “Tu”, staff = trainer assegnato.
3. Submit → insert in `appointments` con `created_by_role = 'athlete'`; calendario si aggiorna.

### Atleta: modificare / annullare un proprio evento

1. Click su evento (non Libera) → popover.
2. “Modifica” → form in modale con dati evento → submit → update + chiusura + refresh.
3. “Annulla” / “Elimina” → azione corrispondente su DB + chiusura popover + refresh.

### Trainer/Admin: modificare un appuntamento dalla lista

1. Click su una card (prossimi o passati) → popover.
2. “Modifica” → form in modale → submit → `updateAppointment` + refetch lista + chiusura form e ripristino focus.

---

## Accessibilità e UX

- **Focus:** alla chiusura del form il focus torna all’elemento che aveva aperto il form (`formPreviousFocusRef`).
- **Popover:** focus sul primo pulsante all’apertura; chiusura con Escape o click fuori; focus restaurato alla chiusura.
- **Card lista:** `role="button"`, `tabIndex={0}`, gestione `onKeyDown` (Enter/Space) per aprire il popover.
- **Pulsanti:** area tocco minima 44px dove possibile (header calendario, FAB, popover, modale).

---

## Riepilogo funzionalità implementate

- Vista atleta: calendario con Mese, Settimana, Giorno, Agenda.
- Libera prenotazione: slot come sfondo cyan, x/6, click per prenotare.
- Eventi: tipo, atleta, orario e **avatar atleta** in Mese / Settimana / Giorno; in Agenda tipo, atleta e sede.
- Pulsante “Oggi” e navigazione calendario affidabili (ref API + callback ref).
- Vista lista trainer/admin: card cliccabili, popover, form modifica, refresh dopo azioni.
- Pagina e calendario responsive (mobile: header a due righe, safe area, altezze e modali adattate).
- Copy: “Sessioni con il tuo Trainer”, “CALENDARIO” in home dove previsto.
- Tipi di appuntamento e colori coerenti con il tipo; titolo evento sempre “Tipo – Nome atleta” dove applicabile.
