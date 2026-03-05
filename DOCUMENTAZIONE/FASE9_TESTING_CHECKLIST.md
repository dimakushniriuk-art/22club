# 🧪 Fase 9: QA + Testing - Checklist Completa

**Data Inizio**: 2025-01-28  
**Stato**: ⏳ **IN SVILUPPO**  
**Priorità**: 🔴 ALTA

---

## 📋 Overview

Checklist completa per testare il modulo Profilo Atleta in tutte le sue componenti.

---

## ✅ EPICA 9.1: Testing CRUD Hook → DB

### Task 9.1.1: Test Hooks React Query

#### ✅ Test `useAthleteAnagrafica`

- [ ] **GET**: Verifica caricamento dati anagrafici da `profiles`
- [ ] **UPDATE**: Verifica aggiornamento dati anagrafici
- [ ] **Validazione Zod**: Verifica che validazione funzioni correttamente
- [ ] **Error handling**: Verifica gestione errori (network, validazione, DB)
- [ ] **Optimistic updates**: Verifica aggiornamento immediato UI
- [ ] **Cache invalidation**: Verifica che cache si aggiorni dopo mutazioni

#### ✅ Test `useAthleteMedical`

- [ ] **GET**: Verifica caricamento dati medici
- [ ] **UPDATE**: Verifica aggiornamento dati medici
- [ ] **UPLOAD**: Verifica upload certificato medico
- [ ] **UPLOAD**: Verifica upload referto medico
- [ ] **Array operations**: Verifica aggiunta/rimozione allergie, patologie, farmaci
- [ ] **Validazione**: Verifica validazione scadenza certificato
- [ ] **Error handling**: Verifica gestione errori

#### ✅ Test `useAthleteFitness`

- [ ] **GET**: Verifica caricamento dati fitness
- [ ] **UPDATE**: Verifica aggiornamento dati fitness
- [ ] **Array operations**: Verifica gestione obiettivi secondari, zone problematiche
- [ ] **JSONB operations**: Verifica gestione infortuni pregressi
- [ ] **Validazione**: Verifica validazione enum (livello esperienza, obiettivi)

#### ✅ Test `useAthleteMotivational`

- [ ] **GET**: Verifica caricamento dati motivazionali
- [ ] **UPDATE**: Verifica aggiornamento dati motivazionali
- [ ] **Slider**: Verifica aggiornamento livello motivazione (1-10)
- [ ] **Array operations**: Verifica gestione motivazioni/ostacoli
- [ ] **JSONB operations**: Verifica gestione storico abbandoni

#### ✅ Test `useAthleteNutrition`

- [ ] **GET**: Verifica caricamento dati nutrizionali
- [ ] **UPDATE**: Verifica aggiornamento dati nutrizionali
- [ ] **JSONB operations**: Verifica gestione macronutrienti target
- [ ] **JSONB operations**: Verifica gestione preferenze orari pasti
- [ ] **Array operations**: Verifica gestione intolleranze, allergie, preferenze

#### ✅ Test `useAthleteMassage`

- [ ] **GET**: Verifica caricamento dati massaggi
- [ ] **UPDATE**: Verifica aggiornamento dati massaggi
- [ ] **Array operations**: Verifica gestione tipi massaggio, zone problematiche
- [ ] **JSONB operations**: Verifica gestione storico massaggi

#### ✅ Test `useAthleteAdministrative`

- [ ] **GET**: Verifica caricamento dati amministrativi
- [ ] **UPDATE**: Verifica aggiornamento dati amministrativi
- [ ] **UPLOAD**: Verifica upload documenti contrattuali
- [ ] **Trigger test**: Verifica calcolo automatico `lezioni_rimanenti`
- [ ] **Validazione**: Verifica validazione stato abbonamento

#### ✅ Test `useAthleteSmartTracking`

- [ ] **GET**: Verifica caricamento dati smart tracking (ultimo record)
- [ ] **GET HISTORY**: Verifica caricamento storico con paginazione
- [ ] **CREATE**: Verifica creazione nuovo entry
- [ ] **UPDATE**: Verifica aggiornamento entry esistente
- [ ] **PAGINATION**: Verifica paginazione funzionante
- [ ] **FILTERS**: Verifica filtri per data range

#### ✅ Test `useAthleteAIData`

- [ ] **GET**: Verifica caricamento ultima analisi AI
- [ ] **GET HISTORY**: Verifica caricamento storico analisi con paginazione
- [ ] **REFRESH**: Verifica trigger nuova analisi
- [ ] **PAGINATION**: Verifica paginazione storico

**Criteri di Accettazione**:

- ✅ Tutti i test passati
- ✅ Error handling testato
- ✅ Edge cases testati (dati nulli, array vuoti, JSONB vuoti)

---

## ✅ EPICA 9.2: Testing UI Tab → Hook → DB

### Task 9.2.1: Test Integrazione UI

#### Test Tab Anagrafica

- [ ] **Caricamento**: Verifica che tab carichi dati correttamente
- [ ] **Edit inline**: Verifica modifica campo e salvataggio
- [ ] **Validazione UI**: Verifica che errori validazione vengano mostrati
- [ ] **Empty state**: Verifica visualizzazione quando dati mancanti
- [ ] **Loading state**: Verifica spinner durante caricamento
- [ ] **Error state**: Verifica messaggio errore e retry

#### Test Tab Medica

- [ ] **Caricamento**: Verifica caricamento dati medici
- [ ] **Upload certificato**: Verifica upload file certificato
- [ ] **Upload referto**: Verifica upload referto
- [ ] **Array operations**: Verifica aggiunta/rimozione allergie, patologie
- [ ] **Alert scadenze**: Verifica alert per certificati in scadenza
- [ ] **Visualizzazione file**: Verifica preview/download file

#### Test Tab Fitness

- [ ] **Caricamento**: Verifica caricamento dati fitness
- [ ] **Edit**: Verifica modifica e salvataggio
- [ ] **Selezione obiettivi**: Verifica selezione obiettivo primario + secondari
- [ ] **Gestione infortuni**: Verifica aggiunta/modifica infortuni pregressi
- [ ] **Zone problematiche**: Verifica gestione array zone problematiche

#### Test Tab Motivazionale

- [ ] **Caricamento**: Verifica caricamento dati motivazionali
- [ ] **Slider**: Verifica slider livello motivazione (1-10)
- [ ] **Array operations**: Verifica gestione motivazioni/ostacoli
- [ ] **Storico abbandoni**: Verifica visualizzazione storico

#### Test Tab Nutrizione

- [ ] **Caricamento**: Verifica caricamento dati nutrizionali
- [ ] **Calcolatore**: Verifica calcolatore macronutrienti
- [ ] **Array operations**: Verifica gestione intolleranze, preferenze
- [ ] **Orari pasti**: Verifica selettore orari pasti

#### Test Tab Massaggi

- [ ] **Caricamento**: Verifica caricamento dati massaggi
- [ ] **Selezione multipla**: Verifica selezione tipi massaggio
- [ ] **Zone problematiche**: Verifica gestione zone
- [ ] **Storico**: Verifica visualizzazione storico massaggi

#### Test Tab Amministrativa

- [ ] **Caricamento**: Verifica caricamento dati amministrativi
- [ ] **Visualizzazione abbonamento**: Verifica info abbonamento corrette
- [ ] **Contatore lezioni**: Verifica calcolo lezioni (incluse/utilizzate/rimanenti)
- [ ] **Upload documenti**: Verifica upload documenti contrattuali
- [ ] **Integrazione payments**: Verifica collegamento con tabella payments

#### Test Tab Smart Tracking

- [ ] **Caricamento**: Verifica caricamento ultimo record
- [ ] **Tabella storico**: Verifica tabella con paginazione
- [ ] **Filtri data**: Verifica filtri per data range
- [ ] **Grafici**: Verifica visualizzazione grafici metriche
- [ ] **Form inserimento**: Verifica creazione nuovo entry

#### Test Tab AI Data

- [ ] **Caricamento**: Verifica caricamento ultima analisi
- [ ] **Visualizzazione insights**: Verifica visualizzazione insights
- [ ] **Raccomandazioni**: Verifica visualizzazione raccomandazioni
- [ ] **Pattern**: Verifica visualizzazione pattern rilevati
- [ ] **Score**: Verifica visualizzazione score engagement/progresso
- [ ] **Refresh**: Verifica pulsante refresh analisi
- [ ] **Storico**: Verifica paginazione storico analisi

**Criteri di Accettazione**:

- ✅ Tutti i test passati
- ✅ Integrazione completa verificata
- ✅ UX fluida e responsive

---

## ✅ EPICA 9.3: Testing RLS (Sicurezza)

### Task 9.3.1: Test Sicurezza

#### Test Accesso PT

- [ ] **PT può vedere**: Solo atleti assegnati (verificare con `pt_atleti`)
- [ ] **PT può modificare**: Solo dati atleti assegnati
- [ ] **PT NON può vedere**: Atleti non assegnati
- [ ] **PT NON può modificare**: Dati atleti non assegnati

#### Test Accesso Atleta

- [ ] **Atleta può vedere**: Solo propri dati
- [ ] **Atleta può modificare**: Solo dati anagrafici, fitness, motivazionali, nutrizione, massaggi
- [ ] **Atleta NON può modificare**: Dati medici
- [ ] **Atleta NON può modificare**: Dati amministrativi
- [ ] **Atleta NON può vedere**: Dati di altri atleti

#### Test Accesso Admin

- [ ] **Admin può vedere**: Tutti i dati di tutti gli atleti
- [ ] **Admin può modificare**: Tutti i dati
- [ ] **Admin può eliminare**: Tutti i dati (solo admin)

#### Test Storage RLS

- [ ] **Certificati**: PT e Atleta possono vedere solo propri file
- [ ] **Referti**: PT e Atleta possono vedere solo propri file
- [ ] **Foto progressi**: PT e Atleta possono vedere solo propri file
- [ ] **Documenti contrattuali**: PT e Atleta possono vedere solo propri file
- [ ] **Upload**: Solo PT e Admin possono caricare certificati/referti
- [ ] **Upload**: PT, Atleta e Admin possono caricare foto progressi
- [ ] **Delete**: Solo Admin può eliminare file

**Criteri di Accettazione**:

- ✅ Tutti i test sicurezza passati
- ✅ Nessun accesso non autorizzato possibile
- ✅ RLS policies funzionanti correttamente

---

## ✅ EPICA 9.4: Testing File Storage

### Task 9.4.1: Test File Storage

#### Test Upload Certificato Medico

- [ ] **Upload**: Verifica upload file certificato
- [ ] **Validazione**: Verifica validazione tipo file (PDF, immagini)
- [ ] **Dimensione**: Verifica limite dimensione file
- [ ] **Storage**: Verifica file salvato nel bucket corretto
- [ ] **Database**: Verifica URL salvato in `athlete_medical_data`
- [ ] **Preview**: Verifica preview file dopo upload

#### Test Upload Referto

- [ ] **Upload**: Verifica upload referto
- [ ] **Array JSONB**: Verifica referto aggiunto a `referti_medici`
- [ ] **Metadata**: Verifica metadata (data, tipo, note) salvati correttamente

#### Test Upload Foto Progressi

- [ ] **Upload**: Verifica upload foto progressi
- [ ] **Storage**: Verifica file salvato nel bucket `athlete-progress-photos`
- [ ] **Database**: Verifica record salvato in `progress_photos`

#### Test Upload Documenti Contrattuali

- [ ] **Upload**: Verifica upload documento contrattuale
- [ ] **Array JSONB**: Verifica documento aggiunto a `documenti_contrattuali`
- [ ] **Metadata**: Verifica metadata salvati correttamente

#### Test Download File

- [ ] **Download certificato**: Verifica download certificato medico
- [ ] **Download referto**: Verifica download referto
- [ ] **Download documento**: Verifica download documento contrattuale
- [ ] **Permessi**: Verifica che solo utenti autorizzati possano scaricare

#### Test Eliminazione File

- [ ] **Delete**: Verifica eliminazione file (solo Admin)
- [ ] **Database cleanup**: Verifica che URL venga rimosso dal database
- [ ] **Storage cleanup**: Verifica che file venga rimosso dallo storage

**Criteri di Accettazione**:

- ✅ Tutti i test file storage passati
- ✅ Permessi corretti
- ✅ File salvati/scaricati correttamente

---

## ✅ EPICA 9.5: Testing Integrazione Dashboard

### Task 9.5.1: Test Integrazione Completa

#### Test Pagina Dashboard PT: `/dashboard/atleti/[id]`

- [ ] **Caricamento**: Verifica caricamento pagina con tutti i tab
- [ ] **Navigazione tab**: Verifica navigazione tra i 9 tab
- [ ] **Lazy load**: Verifica che tab vengano caricati solo quando attivi
- [ ] **Indicatori completamento**: Verifica indicatori per ogni tab
- [ ] **Empty state**: Verifica empty state quando profilo vuoto
- [ ] **Error handling**: Verifica gestione errori per singola categoria
- [ ] **Performance**: Verifica performance con molti dati

#### Test Pagina Profilo Atleta: `/home/profilo`

- [ ] **Caricamento**: Verifica caricamento pagina con tutte le sezioni
- [ ] **Dati reali**: Verifica che vengano mostrati dati reali (non mock)
- [ ] **Statistiche**: Verifica statistiche reali (workout_logs, progress_score, lezioni)
- [ ] **Tab Overview**: Verifica tab Overview
- [ ] **Tab Profilo Completo**: Verifica 9 sub-tab
- [ ] **Tab Progressi**: Verifica visualizzazione progressi
- [ ] **Tab AI Insights**: Verifica visualizzazione insights AI
- [ ] **Responsive**: Verifica layout responsive mobile-first

#### Test Performance

- [ ] **Lazy load**: Verifica lazy load tab funzionante
- [ ] **Caching**: Verifica caching React Query funzionante
- [ ] **Optimistic updates**: Verifica aggiornamento immediato UI
- [ ] **Paginazione**: Verifica paginazione per smart-tracking e AI data
- [ ] **Memoization**: Verifica memoization componenti funzionante

#### Test Responsive Mobile

- [ ] **Mobile layout**: Verifica layout su schermi piccoli (< 768px)
- [ ] **Tablet layout**: Verifica layout su tablet (768px - 1024px)
- [ ] **Desktop layout**: Verifica layout su desktop (> 1024px)
- [ ] **Touch interactions**: Verifica interazioni touch funzionanti
- [ ] **Navigation**: Verifica navigazione mobile funzionante

**Criteri di Accettazione**:

- ✅ Integrazione completa verificata
- ✅ Performance ottimale
- ✅ Responsive funzionante
- ✅ UX fluida su tutti i dispositivi

---

## 📊 Statistiche Test

### Test Totali: 100+ test case

- **EPICA 9.1**: ~45 test case (9 hook × 5 test/hook)
- **EPICA 9.2**: ~45 test case (9 tab × 5 test/tab)
- **EPICA 9.3**: ~15 test case (RLS e sicurezza)
- **EPICA 9.4**: ~15 test case (File storage)
- **EPICA 9.5**: ~10 test case (Integrazione completa)

---

## 🚀 Come Eseguire i Test

### Test Manuali

1. Segui la checklist sopra
2. Testa ogni funzionalità manualmente
3. Segna i test completati con ✅
4. Segnala eventuali problemi

### Test Automatici (SQL)

1. Esegui script SQL per testare RLS
2. Verifica risultati
3. Segnala eventuali fallimenti

### Test E2E (Playwright)

1. Esegui test E2E esistenti
2. Aggiungi nuovi test per profilo atleta
3. Verifica che tutti i test passino

---

## 📝 Note

- I test devono essere eseguiti sia in ambiente di sviluppo che produzione
- Verificare che tutti i dati vengano salvati correttamente nel database
- Verificare che le RLS policies funzionino correttamente
- Verificare che i file vengano caricati/scaricati correttamente
- Verificare che l'UI sia responsive e funzionante su tutti i dispositivi

---

**Prossimo Step**: Creare script SQL per testare RLS e sicurezza
