# 🚀 Avvio Test Manuali - Guida Rapida

**Tempo totale stimato**: 1-2 ore  
**Documenti di riferimento**:

- `GUIDA_TEST_MANUALI_DETTAGLIATA.md` - Guida completa passo-passo
- `CHECKLIST_TEST_RAPIDA.md` - Checklist da seguire durante i test

---

## ⚡ Setup Rapido (5 minuti)

### 1. Prepara Ambiente

```bash
# Assicurati che il server sia in esecuzione
npm run dev

# Dovrebbe essere disponibile su:
# http://localhost:3001
```

### 2. Login

1. Vai a: `http://localhost:3001/login`
2. Accedi come:
   - **Email**: `pt1@22club.it`
   - **Password**: `PTMarco2024!`

### 3. Vai alla Pagina Comunicazioni

- Vai a: `http://localhost:3001/dashboard/comunicazioni`
- Verifica che la pagina carichi senza errori

---

## 🎯 Ordine Consigliato Test

### Fase 1: Test Base (30 min)

1. ✅ Test 1: Creazione Push
2. ✅ Test 2: Creazione Email
3. ✅ Test 3: Creazione SMS (con validazione)
4. ✅ Test 5: Selezione Destinatari

### Fase 2: Test CRUD (20 min)

5. ✅ Test 6: Modifica Comunicazione
6. ✅ Test 7: Invio Immediato
7. ✅ Test 9: Dettaglio Recipients

### Fase 3: Test Avanzati (30 min)

8. ✅ Test 8: Paginazione
9. ✅ Test 10: Schedulazione
10. ✅ Test 11: Tracking/Statistiche

### Fase 4: Test UX (15 min)

11. ✅ Test 13: Validazione
12. ✅ Test 14: Toast
13. ✅ Test 15: Progress Bar

**Totale**: ~1.5 ore

---

## 📋 Durante i Test

1. **Apri `CHECKLIST_TEST_RAPIDA.md`** in un editor/nota
2. **Segna ogni test completato** con ✅ o ❌
3. **Note problemi** nella sezione "PROBLEMI RISCONTRATI"
4. **Screenshot** di eventuali errori o comportamenti strani

---

## 🔍 Verifica Database

Dopo ogni test importante, puoi verificare nel database:

### Supabase SQL Editor

```sql
-- Ultima comunicazione
SELECT * FROM communications ORDER BY created_at DESC LIMIT 1;

-- Recipients ultima comunicazione
SELECT * FROM communication_recipients
WHERE communication_id = (
  SELECT id FROM communications ORDER BY created_at DESC LIMIT 1
);
```

---

## ❓ Cosa Fare se Trovate Problemi

1. **Segna nella checklist** con ❌
2. **Prendi screenshot** dell'errore
3. **Verifica console browser** (F12) per errori JavaScript
4. **Verifica network tab** per errori API
5. **Verifica database** con query SQL
6. **Nota il problema** nel documento

---

## ✅ Cosa Cercare (Successo)

- ✅ Toast notifications invece di alert()
- ✅ Progress bar durante invio
- ✅ Conteggio destinatari corretto
- ✅ Modal si apre/chiude correttamente
- ✅ Paginazione funziona
- ✅ Filtri funzionano
- ✅ Status aggiornati correttamente

---

## 🚨 Segnali di Problema

- ❌ Alert() del browser (dovrebbero essere toast)
- ❌ Conteggio destinatari = 0 quando ci sono utenti
- ❌ Invio rimane bloccato in "Invio in corso"
- ❌ Modal non si apre o non si chiude
- ❌ Errori nella console browser
- ❌ Status non si aggiorna

---

## 📝 Template Report Test

Dopo aver completato tutti i test, compila:

```
DATA: _______________
UTENTE: _______________
BROWSER: _______________

TEST COMPLETATI: ___ / 15
TEST PASSATI: ___ / 15
TEST FALLITI: ___ / 15

PROBLEMI PRINCIPALI:
1. ...
2. ...

NOTE:
...
```

---

**Buon test! 🧪**

**Riferimenti**:

- Guida dettagliata: `GUIDA_TEST_MANUALI_DETTAGLIATA.md`
- Checklist rapida: `CHECKLIST_TEST_RAPIDA.md`
