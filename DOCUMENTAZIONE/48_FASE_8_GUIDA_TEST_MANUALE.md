# 🧪 FASE 8: GUIDA TEST MANUALE

**Data**: 2025-01-30  
**Stato**: ⏳ PRONTA PER ESECUZIONE  
**Obiettivo**: Testare manualmente tutte le funzionalità dopo la migrazione da `workouts` a `workout_plans`

---

## 📋 PREPARAZIONE

### Prerequisiti

1. ✅ Database aggiornato (FASE 7 completata)
2. ✅ Build applicazione completata (`npm run build`)
3. ✅ Applicazione in esecuzione (`npm run dev`)
4. ✅ Accesso come trainer/admin e come atleta

### Checklist Pre-Test

- [ ] Database connesso e funzionante
- [ ] Almeno 1 atleta nel database
- [ ] Almeno 1 trainer nel database
- [ ] Almeno 1 esercizio nel database
- [ ] Browser aperto con applicazione
- [ ] Console browser aperta (F12)

---

## 🧪 STEP 8.1: TEST CREAZIONE SCHEDA

### Obiettivo

Verificare che la creazione di una nuova scheda funzioni correttamente.

### Procedura

1. **Accedi come Trainer/Admin**
   - Vai a `/dashboard/schede`
   - Verifica che la pagina carichi senza errori

2. **Crea Nuova Scheda**
   - Clicca su "Nuova Scheda"
   - Compila il wizard:
     - **Step 1**: Nome scheda, seleziona atleta, note
     - **Step 2**: Aggiungi almeno 2 giorni
     - **Step 3**: Aggiungi esercizi ai giorni
     - **Step 4**: Imposta serie, ripetizioni, pesi
     - **Step 5**: Riepilogo e conferma

3. **Verifica Database**
   - Esegui query SQL (vedi `48_FASE_8_TEST_VERIFICATION.sql` - Query 1-3)
   - Verifica che:
     - ✅ Scheda creata in `workout_plans`
     - ✅ `is_active = true`
     - ✅ `created_by` contiene `user_id` del trainer
     - ✅ Giorni creati in `workout_days` con `workout_plan_id` corretto
     - ✅ Esercizi creati in `workout_day_exercises`

### Risultati Attesi

- ✅ Wizard completa senza errori
- ✅ Scheda visibile nella lista
- ✅ Nessun errore in console browser
- ✅ Dati corretti nel database

### Checklist

- [ ] Wizard si apre correttamente
- [ ] Tutti gli step del wizard funzionano
- [ ] Scheda creata con successo
- [ ] Scheda visibile nella lista
- [ ] Dati corretti nel database
- [ ] Nessun errore in console

---

## 🧪 STEP 8.2: TEST LETTURA SCHEDE

### Obiettivo

Verificare che la visualizzazione delle schede funzioni correttamente.

### Procedura

1. **Visualizza Lista Schede**
   - Vai a `/dashboard/schede`
   - Verifica che tutte le schede vengano caricate

2. **Verifica Informazioni Mostrate**
   - Nome scheda
   - Nome atleta
   - Nome trainer
   - Stato (Attiva/Completata)
   - Data creazione

3. **Verifica Database**
   - Esegui query SQL (vedi `48_FASE_8_TEST_VERIFICATION.sql` - Query 4-6)
   - Verifica che i dati corrispondano

### Risultati Attesi

- ✅ Lista schede carica correttamente
- ✅ Tutte le informazioni mostrate correttamente
- ✅ Nomi atleta e trainer corretti
- ✅ Stato mostrato correttamente (Attiva/Completata)

### Checklist

- [ ] Lista schede carica senza errori
- [ ] Tutte le schede visibili
- [ ] Nomi atleta corretti
- [ ] Nomi trainer corretti
- [ ] Stato mostrato correttamente
- [ ] Date formattate correttamente

---

## 🧪 STEP 8.3: TEST AGGIORNAMENTO SCHEDA

### Obiettivo

Verificare che la modifica di una scheda funzioni correttamente.

### Procedura

1. **Apri Dettaglio Scheda**
   - Clicca su una scheda nella lista
   - Verifica che il modal si apra

2. **Modifica Nome**
   - Modifica il nome della scheda
   - Salva
   - Verifica che il nome sia aggiornato

3. **Modifica Descrizione**
   - Modifica la descrizione
   - Salva
   - Verifica che la descrizione sia aggiornata

4. **Cambia Stato**
   - Cambia stato da "Attiva" a "Completata"
   - Verifica che `is_active` diventi `false` nel database

5. **Verifica Database**
   - Esegui query SQL (vedi `48_FASE_8_TEST_VERIFICATION.sql` - Query 7)
   - Verifica che `updated_at` sia aggiornato

### Risultati Attesi

- ✅ Modifiche salvate correttamente
- ✅ `is_active` aggiornato correttamente
- ✅ `updated_at` aggiornato automaticamente
- ✅ Nessun errore in console

### Checklist

- [ ] Modal dettaglio si apre
- [ ] Modifica nome funziona
- [ ] Modifica descrizione funziona
- [ ] Cambio stato funziona
- [ ] `updated_at` aggiornato
- [ ] Nessun errore

---

## 🧪 STEP 8.4: TEST ELIMINAZIONE SCHEDA

### Obiettivo

Verificare che l'eliminazione di una scheda funzioni correttamente.

### Procedura

1. **Elimina Scheda**
   - Apri dettaglio scheda
   - Clicca su "Elimina" (se disponibile)
   - Conferma eliminazione

2. **Verifica Database**
   - Esegui query SQL (vedi `48_FASE_8_TEST_VERIFICATION.sql` - Query 8)
   - Verifica che:
     - ✅ Scheda rimossa da `workout_plans`
     - ✅ Giorni associati rimossi (CASCADE)
     - ✅ Esercizi associati rimossi (CASCADE)

### Risultati Attesi

- ✅ Scheda eliminata correttamente
- ✅ Record correlati eliminati (CASCADE)
- ✅ Nessun record orfano

### Checklist

- [ ] Eliminazione funziona
- [ ] Scheda rimossa dal database
- [ ] Giorni rimossi (CASCADE)
- [ ] Esercizi rimossi (CASCADE)
- [ ] Nessun record orfano

---

## 🧪 STEP 8.5: TEST FILTRI E RICERCA

### Obiettivo

Verificare che i filtri e la ricerca funzionino correttamente.

### Procedura

1. **Test Filtro per Atleta**
   - Seleziona un atleta dal filtro
   - Verifica che solo le schede di quell'atleta vengano mostrate

2. **Test Filtro per Stato**
   - Seleziona "Attive"
   - Verifica che solo schede con `is_active = true` vengano mostrate
   - Seleziona "Completate"
   - Verifica che solo schede con `is_active = false` vengano mostrate

3. **Test Ricerca per Nome**
   - Inserisci un termine di ricerca
   - Verifica che le schede corrispondenti vengano mostrate

4. **Test Combinazione Filtri**
   - Combina filtro atleta + stato + ricerca
   - Verifica che i risultati siano corretti

5. **Verifica Database**
   - Esegui query SQL (vedi `48_FASE_8_TEST_VERIFICATION.sql` - Query 9-11)
   - Confronta risultati

### Risultati Attesi

- ✅ Filtri funzionano correttamente
- ✅ Ricerca funziona correttamente
- ✅ Combinazione filtri funziona
- ✅ Risultati corretti

### Checklist

- [ ] Filtro atleta funziona
- [ ] Filtro stato funziona
- [ ] Ricerca nome funziona
- [ ] Combinazione filtri funziona
- [ ] Risultati corretti

---

## 🧪 STEP 8.6: TEST STATISTICHE E DASHBOARD

### Obiettivo

Verificare che le statistiche e il dashboard funzionino correttamente.

### Procedura

1. **Test Dashboard Atleta**
   - Vai a `/dashboard/atleti/[id]`
   - Verifica statistiche:
     - Conteggio schede attive
     - Statistiche mensili
     - KPI vari

2. **Test Analytics Progressi**
   - Vai a pagina progressi
   - Verifica calcolo percentuale completamento
   - Verifica streak
   - Verifica grafici

3. **Verifica Database**
   - Esegui query SQL (vedi `48_FASE_8_TEST_VERIFICATION.sql` - Query 12-13)
   - Confronta risultati

### Risultati Attesi

- ✅ Statistiche calcolate correttamente
- ✅ Grafici mostrati correttamente
- ✅ KPI corretti
- ✅ Nessun errore

### Checklist

- [ ] Statistiche atleta corrette
- [ ] Statistiche mensili corrette
- [ ] Percentuale completamento corretta
- [ ] Streak calcolato correttamente
- [ ] Grafici mostrati
- [ ] Nessun errore

---

## 🧪 STEP 8.7: TEST RELAZIONI E FOREIGN KEYS

### Obiettivo

Verificare l'integrità referenziale e le relazioni.

### Procedura

1. **Verifica Database**
   - Esegui query SQL (vedi `48_FASE_8_TEST_VERIFICATION.sql` - Query 14-16)
   - Verifica che:
     - ✅ Foreign keys siano presenti
     - ✅ Nessun record orfano
     - ✅ Integrità referenziale OK

### Risultati Attesi

- ✅ Tutte le foreign keys presenti
- ✅ Nessun record orfano
- ✅ Integrità referenziale OK

### Checklist

- [ ] Foreign keys verificate
- [ ] Nessun record orfano workout_days
- [ ] Nessun record orfano workout_logs
- [ ] Integrità referenziale OK

---

## 🧪 STEP 8.8: TEST PERFORMANCE

### Obiettivo

Verificare che le performance siano accettabili.

### Procedura

1. **Test Tempi di Caricamento**
   - Apri `/dashboard/schede`
   - Misura tempo di caricamento (console browser)
   - Verifica che sia < 2 secondi

2. **Test Query Database**
   - Esegui query SQL (vedi `48_FASE_8_TEST_VERIFICATION.sql` - Query 17-18)
   - Verifica che gli indici siano utilizzati
   - Verifica tempi di esecuzione

### Risultati Attesi

- ✅ Tempi di caricamento accettabili
- ✅ Indici utilizzati correttamente
- ✅ Query ottimizzate

### Checklist

- [ ] Tempo caricamento < 2 secondi
- [ ] Indici presenti e utilizzati
- [ ] Query ottimizzate
- [ ] Nessun N+1 query problem

---

## 🧪 STEP 8.9: TEST RLS POLICIES

### Obiettivo

Verificare che le RLS policies funzionino correttamente.

### Procedura

1. **Test come Atleta**
   - Accedi come atleta
   - Vai a `/dashboard/schede`
   - Verifica che veda solo le proprie schede

2. **Test come Trainer**
   - Accedi come trainer
   - Vai a `/dashboard/schede`
   - Verifica che veda le schede create da lui

3. **Test come Admin**
   - Accedi come admin
   - Vai a `/dashboard/schede`
   - Verifica che veda tutte le schede

4. **Verifica Database**
   - Esegui query SQL (vedi `48_FASE_8_TEST_VERIFICATION.sql` - Query 19-20)
   - Verifica che le policies siano corrette

### Risultati Attesi

- ✅ Atleti vedono solo proprie schede
- ✅ Trainer vedono schede create da loro
- ✅ Admin vedono tutte le schede
- ✅ Policies RLS corrette

### Checklist

- [ ] RLS abilitato
- [ ] Policies corrette
- [ ] Atleti vedono solo proprie schede
- [ ] Trainer vedono schede create da loro
- [ ] Admin vedono tutte le schede

---

## 🧪 STEP 8.10: TEST END-TO-END WORKFLOW

### Obiettivo

Verificare il workflow completo dall'inizio alla fine.

### Procedura

1. **Workflow Completo**
   - Trainer crea scheda per atleta
   - Atleta visualizza scheda
   - Atleta completa allenamento
   - Trainer visualizza progressi
   - Trainer modifica scheda
   - Atleta visualizza scheda aggiornata

2. **Verifica Database**
   - Esegui query SQL (vedi `48_FASE_8_TEST_VERIFICATION.sql` - Query 21-23)
   - Verifica che tutti i dati siano coerenti

### Risultati Attesi

- ✅ Workflow completo funziona
- ✅ Dati coerenti durante tutto il workflow
- ✅ Nessun errore

### Checklist

- [ ] Workflow completo funziona
- [ ] Dati coerenti
- [ ] Nessun errore
- [ ] Tutte le funzionalità integrate

---

## 📊 RIEPILOGO TEST

### Risultati Generali

- [ ] STEP 8.1: Test Creazione Scheda - ✅/❌
- [ ] STEP 8.2: Test Lettura Schede - ✅/❌
- [ ] STEP 8.3: Test Aggiornamento Scheda - ✅/❌
- [ ] STEP 8.4: Test Eliminazione Scheda - ✅/❌
- [ ] STEP 8.5: Test Filtri e Ricerca - ✅/❌
- [ ] STEP 8.6: Test Statistiche e Dashboard - ✅/❌
- [ ] STEP 8.7: Test Relazioni e Foreign Keys - ✅/❌
- [ ] STEP 8.8: Test Performance - ✅/❌
- [ ] STEP 8.9: Test RLS Policies - ✅/❌
- [ ] STEP 8.10: Test End-to-End Workflow - ✅/❌

### Problemi Riscontrati

[Lista problemi riscontrati durante i test]

### Note

[Note aggiuntive sui test]

---

**Data Test**: **\*\***\_\_\_**\*\***  
**Eseguito da**: **\*\***\_\_\_**\*\***  
**Stato**: ⏳ IN CORSO / ✅ COMPLETATO / ❌ PROBLEMI
