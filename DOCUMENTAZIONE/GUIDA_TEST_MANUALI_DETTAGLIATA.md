# 🧪 Guida Test Manuali Dettagliata - Sistema Comunicazioni

**Data**: 2025-01-31  
**Obiettivo**: Eseguire test manuali completi del sistema comunicazioni  
**Tempo stimato**: 1-2 giorni

---

## 📋 Preparazione Pre-Test

### 1. Verifica Ambiente

Prima di iniziare, verifica che:

- [ ] Server Next.js in esecuzione (`npm run dev`)
- [ ] Supabase configurato e accessibile
- [ ] Utente staff autenticato (admin, pt, trainer)
- [ ] Browser aperto su `http://localhost:3001/dashboard/comunicazioni` (o porta corretta)

### 2. Credenziali Test

**Utente consigliato**: `pt1@22club.it` / `PTMarco2024!` (ruolo: pt)

### 3. Database Setup (Opzionale)

Se vuoi testare con subscription mock, esegui:

```sql
-- Esegui lo script: docs/SQL_RESET_E_TEST_COMUNICAZIONI.sql
```

---

## 🔴 TEST CRITICI (Priorità Alta)

### Test 1: Creazione Comunicazione Push

**Tempo**: 5 minuti

#### Passi:

1. **Apri pagina comunicazioni**
   - Vai a: `http://localhost:3001/dashboard/comunicazioni`
   - Verifica che la pagina carichi senza errori

2. **Clicca "Nuova Comunicazione"**
   - Il modal dovrebbe aprirsi
   - Verifica che il titolo sia "Nuova Comunicazione"

3. **Compila il form**:
   - **Tipo**: Seleziona "Push" (icona campanella)
   - **Titolo**: `Test Push - [DATA_OGGI]`
   - **Messaggio**: `Questo è un test di creazione comunicazione push`
   - **Destinatari**: Seleziona "Tutti gli utenti"

4. **Verifica conteggio destinatari**:
   - Dovrebbe mostrare: `Tutti gli utenti (X)` dove X > 0
   - Se mostra 0, c'è un problema

5. **Salva come bozza**:
   - Clicca "Salva bozza"
   - Verifica che appaia un toast di successo
   - Il modal dovrebbe chiudersi

6. **Verifica nella lista**:
   - La comunicazione dovrebbe apparire nella lista
   - Status: "Bozza" (badge giallo)
   - Tipo: Push (icona campanella)

**✅ Risultato Atteso**:

- ✅ Comunicazione creata con successo
- ✅ Conteggio destinatari corretto
- ✅ Toast di successo
- ✅ Comunicazione visibile nella lista

**❌ Problemi Comuni**:

- Conteggio destinatari = 0 → Verifica subscription mock o utenti attivi
- Errore "User not authenticated" → Fai logout e login di nuovo
- Modal non si chiude → Errore nel salvataggio

---

### Test 2: Creazione Comunicazione Email

**Tempo**: 3 minuti

#### Passi:

1. **Apri modal "Nuova Comunicazione"**

2. **Compila form**:
   - **Tipo**: Seleziona "Email" (icona lettera)
   - **Titolo**: `Test Email - [DATA_OGGI]`
   - **Messaggio**: `Questo è un test di creazione comunicazione email`
   - **Destinatari**: Seleziona "Solo atleti"

3. **Verifica conteggio**:
   - Dovrebbe mostrare: `Solo atleti (X)` dove X > 0

4. **Salva come bozza**

**✅ Risultato Atteso**: Comunicazione email creata correttamente

---

### Test 3: Creazione Comunicazione SMS

**Tempo**: 5 minuti

#### Passi:

1. **Apri modal "Nuova Comunicazione"**

2. **Compila form**:
   - **Tipo**: Seleziona "SMS" (icona messaggio)
   - **Titolo**: `Test SMS - [DATA_OGGI]`
   - **Messaggio**: Inserisci un messaggio di **Meno di 160 caratteri** (es: "Ciao! Questo è un test SMS breve.")
   - **Destinatari**: Seleziona "Tutti gli utenti"

3. **Verifica validazione**:
   - Scrivi un messaggio di **più di 160 caratteri**
   - Dovrebbe apparire un messaggio di errore rosso
   - I pulsanti "Salva bozza" e "Invia" dovrebbero essere disabilitati
   - Riduci il messaggio a < 160 caratteri
   - L'errore dovrebbe sparire, pulsanti abilitati

4. **Salva come bozza**

**✅ Risultato Atteso**:

- ✅ Validazione SMS funziona (blocca > 160 caratteri)
- ✅ Comunicazione SMS creata

---

### Test 4: Creazione Comunicazione "All" (Tutti i tipi)

**Tempo**: 3 minuti

#### Passi:

1. **Apri modal "Nuova Comunicazione"**

2. **Compila form**:
   - **Tipo**: Seleziona "Tutti" (icona invio)
   - **Titolo**: `Test All - [DATA_OGGI]`
   - **Messaggio**: `Questo è un test per comunicazione multipla (push + email + SMS)`
   - **Destinatari**: Seleziona "Tutti gli utenti"

3. **Salva come bozza**

**✅ Risultato Atteso**: Comunicazione "all" creata

---

### Test 5: Selezione Destinatari Specifici

**Tempo**: 5 minuti

#### Passi:

1. **Apri modal "Nuova Comunicazione"**

2. **Test "Tutti gli utenti"**:
   - Seleziona "Tutti gli utenti"
   - Verifica conteggio: dovrebbe mostrare tutti gli utenti attivi

3. **Test "Solo atleti"**:
   - Seleziona "Solo atleti"
   - Verifica conteggio: dovrebbe mostrare solo atleti attivi

4. **Test "Atleti specifici"**:
   - Seleziona "Atleti specifici"
   - Dovrebbe apparire un selettore/lista atleti
   - Seleziona 2-3 atleti
   - Verifica conteggio: dovrebbe mostrare il numero esatto di atleti selezionati

5. **Salva come bozza**

**✅ Risultato Atteso**:

- ✅ Tutti i filtri funzionano
- ✅ Conteggio corretto per ogni filtro
- ✅ Selezione atleti specifici funziona

---

### Test 6: Modifica Comunicazione

**Tempo**: 5 minuti

#### Passi:

1. **Trova una comunicazione in stato "Bozza"**

2. **Clicca "Modifica"**:
   - Il modal dovrebbe aprirsi con titolo "Modifica Comunicazione"
   - I campi dovrebbero essere precompilati con i valori esistenti

3. **Modifica i dati**:
   - Cambia il titolo (es: aggiungi " - Modificato")
   - Cambia il messaggio
   - Cambia il filtro destinatari (es: da "Tutti" a "Solo atleti")

4. **Salva**:
   - Clicca "Salva bozza"
   - Verifica toast di successo

5. **Verifica**:
   - La comunicazione nella lista dovrebbe avere i nuovi valori
   - Se hai cambiato il filtro destinatari, `total_recipients` dovrebbe essere resettato a 0 (i vecchi recipients vengono eliminati)

**✅ Risultato Atteso**:

- ✅ Modal si apre con dati precompilati
- ✅ Modifiche salvate correttamente
- ✅ Se filtro cambiato, recipients resettati

**🔍 Verifica Database (Opzionale)**:

```sql
-- Verifica che i recipients vecchi siano stati eliminati
SELECT COUNT(*) FROM communication_recipients
WHERE communication_id = 'ID_COMUNICAZIONE_MODIFICATA';
-- Dovrebbe essere 0 se il filtro è cambiato
```

---

### Test 7: Invio Immediato Push

**Tempo**: 10 minuti

#### Passi:

1. **Crea o usa comunicazione push in stato "Bozza"**

2. **Clicca "Invia" o "Invia ora"**:
   - Status dovrebbe cambiare a "Invio in corso" (badge arancione)
   - Dovrebbe apparire una progress bar
   - Dovrebbe apparire un toast di notifica

3. **Attendi completamento**:
   - Se subscription mock: fallirà (normale)
   - Se VAPID keys configurate: tenterà invio reale
   - Progress bar dovrebbe aggiornarsi

4. **Verifica risultato**:
   - Se successo: Status "Inviata" (badge verde), `total_sent > 0`
   - Se fallito: Status "Fallita" (badge rosso), `total_failed > 0`, pulsante "Riprova invio"

5. **Verifica dettagli**:
   - Clicca "Dettagli" per vedere i recipients
   - Verifica che mostri status (sent/failed) per ogni recipient
   - Verifica che mostri errori se falliti

**✅ Risultato Atteso**:

- ✅ Status aggiornato correttamente
- ✅ Progress bar visibile durante invio
- ✅ Recipients creati correttamente
- ✅ Statistiche aggiornate (`total_sent` o `total_failed`)

**⚠️ Nota**: Con subscription mock, i push falliranno. Questo è normale e dimostra che la gestione errori funziona.

---

### Test 8: Paginazione

**Tempo**: 5 minuti

#### Prerequisito: Avere più di 10 comunicazioni nella lista

#### Passi:

1. **Verifica paginazione**:
   - Dovresti vedere controlli di paginazione in fondo alla lista
   - Pulsanti "Precedente" e "Successiva"
   - Indicatore pagina corrente (es: "Pagina 1 di 3")

2. **Test navigazione**:
   - Clicca "Successiva"
   - Dovrebbe caricare la pagina successiva
   - I pulsanti dovrebbero aggiornarsi (Precedente abilitato)
   - Clicca "Precedente"
   - Dovrebbe tornare alla pagina precedente

3. **Test con filtri**:
   - Cambia tab (es: da "Tutte" a "Push")
   - La paginazione dovrebbe resettare a pagina 1
   - Verifica che mostri solo comunicazioni push

**✅ Risultato Atteso**:

- ✅ Navigazione pagine funziona
- ✅ Paginazione si resetta quando cambi filtro
- ✅ Liste aggiornate correttamente

---

### Test 9: Dettaglio Recipients

**Tempo**: 5 minuti

#### Passi:

1. **Trova una comunicazione inviata** (status: "Inviata" o "Fallita")

2. **Clicca "Dettagli"**:
   - Il modal "Dettagli Recipients" dovrebbe aprirsi
   - Dovrebbe mostrare una tabella con tutti i recipients

3. **Verifica tabella**:
   - Colonne: Nome, Email, Telefono, Tipo, Status
   - Dovrebbe mostrare tutti i recipients della comunicazione

4. **Test filtri**:
   - Clicca sui filtri status (es: "Inviati", "Falliti")
   - La lista dovrebbe filtrarsi
   - Verifica che i contatori in alto si aggiornino

5. **Test ricerca**:
   - Usa la barra di ricerca
   - Cerca per nome o email
   - La lista dovrebbe filtrarsi in tempo reale

6. **Chiudi modal**:
   - Clicca "Chiudi" o fuori dal modal
   - Il modal dovrebbe chiudersi

**✅ Risultato Atteso**:

- ✅ Modal si apre correttamente
- ✅ Tabella mostra tutti i recipients
- ✅ Filtri funzionano
- ✅ Ricerca funziona

---

## 🟡 TEST FUNZIONALI (Priorità Media)

### Test 10: Schedulazione Comunicazione

**Tempo**: 10-15 minuti

#### Passi:

1. **Crea nuova comunicazione push**

2. **Attiva schedulazione**:
   - Attiva checkbox "Programma invio"
   - Dovrebbe apparire un campo data/ora
   - Seleziona data/ora futura (es: tra 2-3 minuti)

3. **Salva**:
   - Clicca "Salva bozza"
   - Status dovrebbe essere "Programmata" (non "Bozza")

4. **Verifica nel database**:

```sql
-- Verifica comunicazione schedulata
SELECT id, title, status, scheduled_for
FROM communications
WHERE status = 'scheduled'
ORDER BY scheduled_for DESC
LIMIT 1;
```

5. **Attendi scadenza**:
   - Attendi che arrivi l'ora programmata
   - Se il cron job è configurato, dovrebbe essere processata automaticamente

6. **Verifica dopo scadenza**:
   - Se cron job attivo: Status dovrebbe cambiare a "Inviata"
   - Se cron job non configurato: Rimane "Programmata" (normale)

**✅ Risultato Atteso**:

- ✅ Comunicazione salvata come "scheduled"
- ✅ `scheduled_for` impostato correttamente
- ✅ Se cron job configurato, viene processata automaticamente

**⚠️ Nota**: Il cron job richiede configurazione su hosting (Vercel Cron o altro).

---

### Test 11: Tracking e Statistiche

**Tempo**: 5 minuti

#### Passi:

1. **Invia una comunicazione**

2. **Verifica nel database**:

```sql
-- Verifica statistiche comunicazione
SELECT
  id,
  title,
  total_recipients,
  total_sent,
  total_delivered,
  total_opened,
  total_failed
FROM communications
WHERE id = 'ID_COMUNICAZIONE'
ORDER BY created_at DESC
LIMIT 1;
```

3. **Verifica recipients**:

```sql
-- Verifica status recipients
SELECT
  status,
  COUNT(*) as count
FROM communication_recipients
WHERE communication_id = 'ID_COMUNICAZIONE'
GROUP BY status;
```

4. **Verifica timestamp**:

```sql
-- Verifica timestamp recipients
SELECT
  status,
  sent_at,
  delivered_at,
  opened_at,
  failed_at,
  error_message
FROM communication_recipients
WHERE communication_id = 'ID_COMUNICAZIONE'
LIMIT 5;
```

**✅ Risultato Atteso**:

- ✅ `total_sent` aggiornato
- ✅ `total_failed` aggiornato (se fallimenti)
- ✅ Timestamp corretti (`sent_at`, `failed_at`)
- ✅ Errori salvati in `error_message`

---

### Test 12: Gestione Errori e Retry

**Tempo**: 5 minuti

#### Passi:

1. **Trova comunicazione fallita** (status: "Fallita")

2. **Verifica pulsante "Riprova invio"**:
   - Dovrebbe essere visibile
   - Clicca "Riprova invio"
   - Status dovrebbe cambiare a "Invio in corso"
   - Dovrebbe tentare l'invio di nuovo

3. **Test reset comunicazione bloccata**:
   - Se una comunicazione rimane in "Invio in corso" per troppo tempo
   - Dovrebbe essere rilevata da `check-stuck` (ogni 2 minuti)
   - Status dovrebbe cambiare automaticamente a "Fallita"

**✅ Risultato Atteso**:

- ✅ Retry manuale funziona
- ✅ Check stuck rileva comunicazioni bloccate

---

## 🟢 TEST UX (Priorità Bassa)

### Test 13: Validazione Form

**Tempo**: 5 minuti

#### Passi:

1. **Test campi obbligatori**:
   - Apri modal "Nuova Comunicazione"
   - Prova a salvare senza titolo
   - Dovrebbe apparire un errore o toast
   - Il salvataggio dovrebbe essere bloccato

2. **Test validazione SMS** (già testato in Test 3):
   - Messaggio > 160 caratteri: errore, pulsanti disabilitati
   - Messaggio < 160 caratteri: nessun errore, pulsanti abilitati

**✅ Risultato Atteso**:

- ✅ Validazione funziona correttamente
- ✅ Toast errori informativi

---

### Test 14: Toast Notifications

**Tempo**: 3 minuti

#### Passi:

1. **Esegui varie azioni**:
   - Crea comunicazione → Toast success
   - Modifica comunicazione → Toast success
   - Invia comunicazione → Toast success/error
   - Elimina comunicazione → Toast success

2. **Verifica**:
   - Dovrebbero apparire toast in alto a destra (o posizione configurata)
   - Nessun `alert()` del browser
   - Toast scompaiono automaticamente dopo qualche secondo

**✅ Risultato Atteso**:

- ✅ Solo toast, nessun alert
- ✅ Toast appropriati per ogni azione

---

### Test 15: Progress Bar

**Tempo**: 3 minuti

#### Passi:

1. **Invia una comunicazione**

2. **Durante invio**:
   - Dovrebbe apparire una progress bar sotto il titolo
   - La barra dovrebbe mostrare: `X / Y inviati`
   - La barra dovrebbe aggiornarsi durante l'invio

3. **Dopo invio**:
   - La progress bar dovrebbe sparire
   - Status aggiornato a "Inviata" o "Fallita"

**✅ Risultato Atteso**:

- ✅ Progress bar visibile durante invio
- ✅ Aggiornamento in tempo reale
- ✅ Scompare dopo completamento

---

## 📊 Checklist Riepilogo

### Test Critici

- [ ] Test 1: Creazione Push
- [ ] Test 2: Creazione Email
- [ ] Test 3: Creazione SMS
- [ ] Test 4: Creazione "All"
- [ ] Test 5: Selezione Destinatari
- [ ] Test 6: Modifica Comunicazione
- [ ] Test 7: Invio Immediato
- [ ] Test 8: Paginazione
- [ ] Test 9: Dettaglio Recipients

### Test Funzionali

- [ ] Test 10: Schedulazione
- [ ] Test 11: Tracking/Statistiche
- [ ] Test 12: Gestione Errori/Retry

### Test UX

- [ ] Test 13: Validazione Form
- [ ] Test 14: Toast Notifications
- [ ] Test 15: Progress Bar

**Totale Test**: 15  
**Tempo Totale Stimato**: ~1.5-2 ore

---

## 📝 Report Test

Dopo aver completato tutti i test, compila questo report:

### Test Passati: \_\_\_ / 15

### Test Falliti: \_\_\_ / 15

### Problemi Riscontrati:

1. **Problema 1**: ...
   - Test: ...
   - Descrizione: ...
   - Screenshot: ...

2. **Problema 2**: ...
   - ...

### Note:

---

**Ultimo Aggiornamento**: 2025-01-31
