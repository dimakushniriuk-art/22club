# ✅ Checklist Test Rapida - Sistema Comunicazioni

**Usa questo documento durante i test** - Segna ogni test completato con ✅ o ❌

---

## 🔴 TEST CRITICI (Fai questi PRIMA)

### 1. Creazione Comunicazioni

- [ ] **Push**: Crea comunicazione push, salva bozza → ✅ Comunicazione appare in lista
- [ ] **Email**: Crea comunicazione email, salva bozza → ✅ Appare in lista
- [ ] **SMS**: Crea comunicazione SMS (< 160 caratteri), salva bozza → ✅ Appare in lista
- [ ] **SMS validazione**: Prova SMS > 160 caratteri → ✅ Errore, pulsanti disabilitati
- [ ] **All**: Crea comunicazione "all", salva bozza → ✅ Appare in lista

### 2. Conteggio Destinatari

- [ ] **Tutti gli utenti**: Seleziona "Tutti" → ✅ Mostra conteggio corretto (es: "Tutti gli utenti (19)")
- [ ] **Solo atleti**: Seleziona "Solo atleti" → ✅ Mostra solo atleti attivi
- [ ] **Atleti specifici**: Seleziona atleti → ✅ Mostra numero esatto selezionati

### 3. Modifica ed Eliminazione

- [ ] **Modifica titolo**: Modifica comunicazione draft → ✅ Salvata correttamente
- [ ] **Modifica destinatari**: Cambia filtro destinatari → ✅ Recipients resettati (verifica DB)
- [ ] **Eliminazione**: Clicca "Elimina" su comunicazione → ✅ Conferma appare → ✅ Comunicazione eliminata → ✅ Toast success

### 4. Invio

- [ ] **Invio push**: Invia comunicazione push → ✅ Status "Inviata" o "Fallita"
- [ ] **Progress bar**: Durante invio → ✅ Progress bar visibile con "X / Y inviati"
- [ ] **Toast**: Dopo invio → ✅ Toast success/error (NO alert browser)

### 5. Paginazione

- [ ] **Navigazione**: Clicca "Successiva" → ✅ Carica pagina successiva
- [ ] **Filtro reset**: Cambia tab (Push/Email) → ✅ Reset a pagina 1

### 6. Dettagli Recipients

- [ ] **Apri dettagli**: Clicca "Dettagli" su comunicazione inviata → ✅ Modal si apre
- [ ] **Tabella**: Verifica colonne (Nome, Email, Status) → ✅ Tutte presenti
- [ ] **Filtri**: Clicca filtro status → ✅ Lista filtrata
- [ ] **Ricerca**: Cerca per nome → ✅ Filtro in tempo reale

---

## 🟡 TEST FUNZIONALI

### 7. Schedulazione

- [ ] **Programma**: Attiva checkbox, imposta data futura → ✅ Status "Programmata"
- [ ] **DB**: Verifica `scheduled_for` nel DB → ✅ Impostato correttamente
- [ ] **Cron**: Attendi scadenza (se cron configurato) → ✅ Processata automaticamente

### 8. Tracking

- [ ] **Statistiche**: Dopo invio, verifica DB `total_sent`, `total_failed` → ✅ Aggiornati
- [ ] **Errori**: Verifica `error_message` in recipients falliti → ✅ Presente

---

## 🟢 TEST UX

### 9. Validazione

- [ ] **Campi obbligatori**: Prova salvare senza titolo → ✅ Errore/Toast

### 10. Toast

- [ ] **Creazione**: Crea comunicazione → ✅ Toast success (NO alert)
- [ ] **Modifica**: Modifica comunicazione → ✅ Toast success
- [ ] **Invio**: Invia comunicazione → ✅ Toast success/error

---

## 📊 QUERY SQL DI VERIFICA

### Dopo ogni test, puoi eseguire queste query per verificare:

```sql
-- Ultima comunicazione creata
SELECT id, title, type, status, total_recipients
FROM communications
ORDER BY created_at DESC
LIMIT 1;

-- Recipients ultima comunicazione
SELECT status, COUNT(*)
FROM communication_recipients
WHERE communication_id = (
  SELECT id FROM communications ORDER BY created_at DESC LIMIT 1
)
GROUP BY status;
```

---

## ❌ PROBLEMI RISCONTRATI

Segna qui i problemi:

1. **Test**: **\_\_**  
   **Problema**: **\_\_**  
   **Screenshot/Note**: **\_\_**

2. **Test**: **\_\_**  
   **Problema**: **\_\_**

---

**Data Test**: **\_\_\_**  
**Utente Test**: **\_\_\_**  
**Browser**: **\_\_\_**
