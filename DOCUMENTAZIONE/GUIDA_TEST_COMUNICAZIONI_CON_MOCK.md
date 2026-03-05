# 🧪 Guida Test Comunicazioni con Subscription Mock

**Data**: 2025-01-31  
**Obiettivo**: Testare tutte le funzioni del modulo comunicazioni usando subscription push mock

---

## 📋 Situazione Attuale

Hai eseguito lo script `SQL_RESET_E_TEST_COMUNICAZIONI.sql` che ha creato subscription push mock per tutti gli utenti attivi. Quando tenti di inviare una comunicazione, ricevi l'errore:

```
"Tutti i 12 destinatari sono falliti. Verifica i token push attivi."
```

**Questo è normale!** ✅ Le subscription mock hanno endpoint fittizi che non possono ricevere push notifications reali.

---

## ✅ Cosa Funziona Comunque

Anche se i push falliscono, puoi testare queste funzioni:

### 1. ✅ Creazione Comunicazioni

- Crea nuove comunicazioni push/email/sms/all
- Modifica comunicazioni esistenti
- Selezione destinatari (tutti / ruolo / atleti specifici)
- Conteggio destinatari (ora troverà le subscription mock)

### 2. ✅ Creazione Recipients

- I recipients vengono creati correttamente per ogni destinatario
- Status iniziale: `pending`
- Tracking per ogni destinatario

### 3. ✅ Dashboard e UI

- Visualizzazione lista comunicazioni
- Filtri per status, tipo, data
- Paginazione
- Badge stati
- Progress bar per comunicazioni in invio
- Modal dettagli recipients

### 4. ✅ Tracking e Statistiche

- Aggiornamento status recipients (pending → failed)
- Salvataggio errori in `error_message`
- Aggiornamento statistiche comunicazione (`total_sent`, `total_failed`)
- Timestamp (`sent_at`, `failed_at`)

### 5. ✅ Gestione Errori

- Errori vengono catturati e salvati
- Status comunicazione aggiornato correttamente
- Messaggi di errore informativi

---

## 🎯 Due Modalità di Test

### Modalità A: Test con Errori Realistici (Attuale)

**Come funziona**:

- Subscription mock presenti nel database
- VAPID keys configurate (se presenti)
- Sistema tenta invio reale → fallisce → gestisce errori correttamente

**Cosa testi**:

- ✅ Tutto il flusso di invio
- ✅ Gestione errori
- ✅ Tracking fallimenti
- ✅ Dashboard con stati falliti
- ⚠️ Non vedi "success" ma testi la gestione errori

**Quando usare**: Per testare la robustezza e la gestione errori del sistema

---

### Modalità B: Test con Simulazione (Senza Errori)

**Come attivare**:

1. Rimuovi temporaneamente le VAPID keys dal `.env` (o commentale):
   ```env
   # NEXT_PUBLIC_VAPID_KEY=...
   # VAPID_PRIVATE_KEY=...
   # VAPID_EMAIL=...
   ```
2. Riavvia il server Next.js
3. Invia una comunicazione

**Come funziona**:

- Subscription mock presenti nel database
- VAPID keys NON configurate
- Sistema usa modalità simulazione → restituisce successo simulato

**Cosa testi**:

- ✅ Tutto il flusso di invio
- ✅ Status recipients: pending → sent
- ✅ Statistiche aggiornate (`total_sent`)
- ✅ Dashboard con stati "sent"
- ✅ Tracking completo

**Quando usare**: Per vedere il flusso completo con successo

---

## 📊 Verifica Stato Test

### Query per verificare le subscription create:

```sql
SELECT
  COUNT(*) as total_subscriptions,
  COUNT(DISTINCT user_id) as utenti_con_subscription
FROM push_subscriptions;
```

**Risultato atteso**: Dovresti vedere un numero di subscriptions pari al numero di utenti attivi.

---

### Query per verificare i recipients dopo un invio:

```sql
SELECT
  status,
  COUNT(*) as count,
  recipient_type
FROM communication_recipients
GROUP BY status, recipient_type
ORDER BY status;
```

**Risultato atteso**:

- **Modalità A (con errori)**: Tutti i recipients in status `failed` con `error_message`
- **Modalità B (simulazione)**: Tutti i recipients in status `sent`

---

## 🔍 Verifica VAPID Keys

### Controlla se le VAPID keys sono configurate:

Nel file `.env` o `.env.local`, cerca:

```env
NEXT_PUBLIC_VAPID_KEY=...
VAPID_PRIVATE_KEY=...
VAPID_EMAIL=...
```

- **Se presenti**: Sistema tenta invio reale → fallisce con subscription mock
- **Se assenti**: Sistema usa simulazione → successo simulato

---

## ✅ Checklist Test Completo

### Funzionalità Base

- [ ] Creare comunicazione push
- [ ] Creare comunicazione email
- [ ] Creare comunicazione SMS
- [ ] Creare comunicazione "all" (tutti i tipi)
- [ ] Modificare comunicazione esistente
- [ ] Eliminare comunicazione

### Selezione Destinatari

- [ ] Selezione "Tutti gli utenti"
- [ ] Selezione per ruolo (admin, pt, atleta)
- [ ] Selezione atleti specifici
- [ ] Conteggio destinatari corretto

### Invio

- [ ] Invio immediato
- [ ] Invio schedulato (se implementato)
- [ ] Creazione recipients automatica
- [ ] Aggiornamento status comunicazione
- [ ] Tracking errori (se fallisce)

### Dashboard

- [ ] Visualizzazione lista comunicazioni
- [ ] Filtri per status
- [ ] Filtri per tipo
- [ ] Paginazione
- [ ] Badge stati corretti
- [ ] Progress bar per invio in corso
- [ ] Modal dettagli recipients

### Tracking

- [ ] Status recipients aggiornati
- [ ] Timestamp corretti (`sent_at`, `failed_at`)
- [ ] Errori salvati in `error_message`
- [ ] Statistiche comunicazione aggiornate

---

## 🎯 Test Consigliati

### Test 1: Flusso Completo con Simulazione

1. Rimuovi VAPID keys (Modalità B)
2. Crea comunicazione push
3. Seleziona "Tutti gli utenti"
4. Invia
5. Verifica:
   - Recipients creati correttamente
   - Status = `sent`
   - Dashboard mostra "Inviata"
   - Statistiche aggiornate

### Test 2: Gestione Errori (Attuale)

1. Mantieni VAPID keys (Modalità A)
2. Crea comunicazione push
3. Seleziona "Tutti gli utenti"
4. Invia
5. Verifica:
   - Recipients creati correttamente
   - Status = `failed`
   - Errori salvati in `error_message`
   - Dashboard mostra "Fallita"
   - Possibilità di "Riprova invio"

### Test 3: Selezione Destinatari Specifici

1. Crea comunicazione push
2. Seleziona "Atleti specifici"
3. Seleziona 2-3 atleti
4. Verifica conteggio destinatari
5. Invia
6. Verifica che solo i recipients selezionati siano creati

### Test 4: Dashboard e Filtri

1. Crea multiple comunicazioni (draft, sent, failed)
2. Verifica filtri per status
3. Verifica filtri per tipo
4. Verifica paginazione (se ci sono molte comunicazioni)
5. Apri modal dettagli recipients

---

## ⚠️ Note Importanti

1. **Subscription Mock**: Le subscription create sono mock e non funzioneranno per push reali. Per push reali in produzione, gli utenti devono sottoscrivere le notifiche dal browser.

2. **VAPID Keys**: Per push reali funzionanti, serve:
   - VAPID keys configurate (vedi `docs/GUIDA_CONFIGURAZIONE_VAPID_KEYS.md`)
   - Subscription reali create dagli utenti dal browser
   - Endpoint validi (non mock)

3. **Modalità Simulazione**: La modalità simulazione è utile per test, ma in produzione servono subscription e VAPID keys reali.

4. **Errori sono Normali**: Con subscription mock, gli errori sono attesi e dimostrano che il sistema gestisce correttamente i fallimenti.

---

## 🚀 Prossimi Passi

Dopo aver testato tutte le funzionalità:

1. ✅ **Per Produzione**: Configura VAPID keys reali
2. ✅ **Per Produzione**: Rimuovi subscription mock (gli utenti si sottoscriveranno dal browser)
3. ✅ **Test Finale**: Testa con subscription reali create da utenti reali

---

**Ultimo Aggiornamento**: 2025-01-31
