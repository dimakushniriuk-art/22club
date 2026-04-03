# 22CLUB — MASTER PROMPT / SPEC UNIFICATA PER CREARE NUOVI TEMPLATE EMAIL

## OBIETTIVO

Questo file è la fonte unica da usare in futuro dentro Cursor o ChatGPT per creare
nuovi template email coerenti con il sistema 22Club.

Serve per generare:

- email auth
- email sicurezza
- email appuntamenti
- email notifiche operative
- email informative
- email transazionali prodotto

Il risultato desiderato NON è una semplice email HTML generica.
Il risultato desiderato è un template email 22Club coerente, moderno, premium,
riutilizzabile e compatibile con i client email.

---

## 1. IDENTITÀ DEL BRAND

**Nome prodotto:**

- 22Club

**Contesto prodotto:**

- gestionale fitness multi-ruolo
- trainer, staff, atleti
- dark mode
- stile pulito, premium, ordinato, Apple-like
- UX chiara, gerarchia forte, pochi ornamenti

**Tono:**

- professionale
- cordiale
- diretto
- semplice
- affidabile
- mai troppo aggressivo
- mai troppo "marketing"

**Lingua:**

- default: italiano
- salvo richieste diverse

---

## 2. DIREZIONE VISIVA OBBLIGATORIA

Tutti i nuovi template email devono seguire questo stile.

**Modalità:**

- dark premium

**Wrapper esterno:**

- background: #000000

**Card principale:**

- background: #0f1115
- border: 1px solid #1d2430
- border-radius: 20px
- max-width: 560px
- overflow: hidden

**Logo:**

- URL logo ufficiale:
  https://icibqnmtacibgnhaidlz.supabase.co/storage/v1/object/public/logo/LOGO%2022club%20per%20sfondo%20nero.png
- width standard: 140
- centrato in alto

**Label superiore:**

- piccola
- uppercase
- tracking largo
- colore teal brand

**Titolo principale:**

- grande
- forte
- bianco
- centrato
- premium
- senza effetti inutili

**Gerarchia:**

- logo
- label
- title
- intro text
- blocchi contenuto
- footer

**Stile generale:**

- nessun gradient necessario nella variante dark
- niente elementi decorativi superflui
- niente layout complessi multi-colonna
- una sola colonna
- tanto respiro
- aspetto SaaS premium 2026

---

## 3. PALETTE UFFICIALE

**Colori principali:**

- primary teal: #02B3BF
- dark background outer: #000000
- card background: #0f1115
- soft block background: #12161c
- border: #1d2430
- main text: #f5f7fa
- secondary text: #a7b0bc
- muted text: #6b7280
- micro label text: #7c8796

**Uso del colore:**

- teal solo per:
  - label
  - pulsanti principali
  - highlight codice OTP
  - brand footer
  - link fallback
- bianco per:
  - title
  - valori importanti
- grigi morbidi per testo secondario
- niente colori casuali extra salvo casi eccezionali

---

## 4. TIPOGRAFIA

**Font stack sicuro:**

- -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif

**Regole:**

- niente font custom obbligatori
- massimo focus su compatibilità email

**Title:**

- 30px
- weight 700
- line-height 1.2
- letter-spacing leggermente negativo

**Body text:**

- 16px
- line-height 1.7
- colore #a7b0bc

**Meta label:**

- 12px
- uppercase
- tracking largo
- weight 700

**Footer:**

- 12px
- leggero
- poco invasivo

**Codici OTP:**

- monospace
- grandi
- spaziati
- teal

---

## 5. REGOLE HTML EMAIL OBBLIGATORIE

Ogni nuovo template deve rispettare queste regole:

- usare HTML email semplice e stabile
- usare layout con table
- usare inline styles
- evitare CSS fragile
- evitare JS
- evitare dipendenze frontend
- evitare layout multi-colonna
- evitare componenti non compatibili email
- nessuna immagine obbligatoria oltre al logo
- niente path locali per immagini
- solo URL HTTPS pubblici

**Compatibilità:**

- Gmail
- Outlook
- Apple Mail
- client mobile principali

**Regole pratiche:**

- wrapper esterno con padding 40px 16px
- card centrale max-width 560px
- contenuti centrati dove serve
- testo con max-width leggibile
- footer sempre presente
- fallback link sempre presente quando esiste CTA con URL

---

## 6. STRUTTURA MASTER DEL TEMPLATE

Ogni email nuova deve seguire, salvo eccezioni, questo schema:

1. wrapper esterno nero
2. card principale dark
3. logo
4. label categoria
5. titolo
6. testo introduttivo
7. uno o più blocchi contenuto
8. eventuale CTA
9. eventuale blocco link diretto
10. footer

**Ordine tipico:**

- LOGO
- LABEL
- TITLE
- INTRO
- PRIMARY CONTENT BLOCK
- SECONDARY BLOCKS
- CTA
- FALLBACK LINK
- FOOTER

**Eccezioni:**

- email OTP: niente CTA, focus sul codice
- email di conferma post-azione: spesso niente CTA
- email puramente informative di sicurezza: no CTA salvo necessità reale

---

## 7. TIPI DI BLOCCHI RIUTILIZZABILI

Quando crei nuove email, usa questi blocchi concettuali.

**A. TEXT BLOCK** — testo normale, spiegazione semplice, uno o due paragrafi brevi

**B. BUTTON BLOCK** — CTA primaria, teal pieno, testo bianco, border-radius 12px, padding 14px 26px, weight 700

**C. INFO CARD** — box dark interno, background #12161c, border #1d2430, radius 14px, padding 18px

**D. KEY / VALUE ROWS** — dettagli (data, ora, trainer, …)

**E. LINK FALLBACK BLOCK** — titolo "Link diretto", link teal, word-break attivo

**F. CODE BLOCK** — OTP / token

**G. ALERT / SECURITY BLOCK** — verifica attività, attenzione

---

## 8. LABEL STANDARD CONSIGLIATE

- Registrazione
- Invito
- Accesso
- Sicurezza
- Appuntamento
- Comunicazione
- Promemoria
- Notifica
- Aggiornamento account

---

## 9. COPYWRITING RULES

**Regole obbligatorie:**

- frasi brevi
- linguaggio chiaro
- niente testo inutile
- una sola azione principale
- messaggio subito comprensibile
- titolo molto chiaro
- niente inglese misto con italiano salvo reale necessità
- niente tono robotico
- niente marketing eccessivo
- niente emoji se non richieste

**Regole CTA:**

- massimo una CTA primaria
- copy breve e diretto

**Footer:**

- standard:
  Questa è un'email automatica di sistema. Ti chiediamo di non rispondere a questo messaggio, salvo diversa indicazione.

---

## 10. REGOLE UX PER TIPO DI EMAIL

**E. EMAIL OPERATIVE / APPUNTAMENTI**

- title chiaro
- dettaglio appuntamento in key/value
- eventuale nota
- eventuali crediti
- eventuale ringraziamento
- tono molto leggibile e concreto

---

## 11. MASTER HTML VISIVO DA RISPETTARE

- body background nero
- table wrapper
- card da 560px
- logo in alto
- label teal
- title bianco
- intro text secondario
- blocchi info dark interni
- footer sottile

---

## 12. ESEMPIO DI RICHIESTA FUTURA A CHATGPT O CURSOR

Usa un prompt di questo tipo:

«Crea un nuovo template email HTML per 22Club usando il design system email ufficiale.
Mantieni esattamente lo stile dark premium del sistema 22Club:

- wrapper nero
- card dark #0f1115
- bordo #1d2430
- radius 20px
- logo ufficiale 22Club in alto
- label teal #02B3BF
- titolo bianco grande
- testo secondario #a7b0bc
- blocchi info dark interni
- footer standard 22Club

Vincoli:

- HTML email compatibile
- table layout
- inline styles
- larghezza massima 560px
- niente JS
- niente CSS fragile
- niente layout multi-colonna

Tipo email: [SCRIVI QUI IL TIPO]

Obiettivo della mail: [SCRIVI QUI LO SCOPO]

Dati disponibili: [SCRIVI QUI LE VARIABILI, es. {{link}}, {{email}}, {{provider}}, {{date}}, {{time}}]

Voglio output finale pronto da incollare, coerente con i template auth/security già esistenti di 22Club.»

---

## 13. PROMPT BREVE RIUTILIZZABILE

Prompt compatto da usare al volo:

«Usa il design system email dark premium 22Club. Crea un template HTML email con:

- sfondo esterno nero #000000
- card centrale #0f1115 con bordo #1d2430, radius 20px, max-width 560px
- logo 22Club ufficiale in alto
- label uppercase teal #02B3BF
- titolo bianco grande
- testo secondario #a7b0bc
- blocchi info interni #12161c
- footer standard 22Club
- compatibilità email client
- table layout
- inline styles

Mantieni lo stile identico ai template auth/security 22Club già definiti.
Genera una versione pronta da incollare.»

---

## 14. REGOLE PER CURSOR / CHATGPT QUANDO GENERANO NUOVI TEMPLATE

Quando generi un nuovo template, verifica sempre:

1. È chiaramente 22Club?
2. È dark premium?
3. Usa la card corretta?
4. Usa il logo corretto?
5. La gerarchia è giusta?
6. Il titolo è chiaro?
7. Il testo è troppo lungo?
8. C'è una sola azione principale?
9. Se c'è un link, esiste un fallback?
10. Se è sicurezza, c'è un alert?
11. Se è OTP, il codice è protagonista?
12. Se è conferma post-azione, evita CTA inutili?
13. È compatibile email?
14. Usa inline styles?
15. È pronto da incollare senza refactor?

Se una o più risposte sono «no», il template va corretto.

---

## 15. ERRORI DA EVITARE

Mai fare:

- email light mode casuali
- html minimal senza branding
- solo `<h2>` + `<p>` + `<a>`
- card bianche
- pulsanti senza stile 22Club
- più CTA principali
- testo enorme e lungo
- gradient casuali
- ombre pesanti inutili
- layout complessi
- font strani
- immagini locali
- colori incoerenti col brand
- footer assente
- copy inglese/italiano mischiato a caso

---

## 16. ESTENSIONI FUTURE CONSIGLIATE

In futuro si può estendere il sistema con:

- preview text sempre configurabile
- support email dinamica
- timestamp modifica account
- IP / location per email sicurezza
- tema light opzionale
- tracking open / click
- unification Resend + Supabase
- catalogo template centralizzato
- funzione `renderEmail({ ... })` unica per tutto il sistema

---

## 17. RISULTATO ATTESO

Ogni nuovo template prodotto con questo file deve risultare:

- coerente con 22Club
- moderno
- premium
- pulito
- chiaro
- pronto per utenti reali
- pronto da incollare nel codice
- compatibile con email client
- manutenzionabile
- riutilizzabile

Se il risultato sembra una normale email HTML generica, non è corretto.
Se il risultato sembra parte del prodotto 22Club, allora è corretto.

---

**Riferimento codice (appuntamenti):** layout table + palette allineati a questa spec in `src/lib/calendar/appointment-reminder-email.ts`.

**Fine file**
