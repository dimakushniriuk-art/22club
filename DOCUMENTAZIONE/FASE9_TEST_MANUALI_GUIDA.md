# 🧪 Fase 9: Guida Test Manuali

**Data**: 2025-01-28  
**Stato**: ⏳ **IN CORSO**  
**Priorità**: 🔴 ALTA

---

## 📋 Overview

Questa guida fornisce istruzioni dettagliate per eseguire i test manuali rimanenti della Fase 9.

---

## ✅ EPICA 9.1: Test CRUD Hooks → DB

### Preparazione

1. **Accedi all'applicazione** come PT o Atleta
2. **Apri la console del browser** (F12 → Console)
3. **Apri Network tab** per monitorare le chiamate API

### Test Hook `useAthleteAnagrafica`

#### Test GET

1. Naviga a `/dashboard/atleti/[id]` (PT) o `/home/profilo` (Atleta)
2. Apri il tab "Anagrafica"
3. **Verifica**:
   - [ ] Dati anagrafici vengono caricati correttamente
   - [ ] Nessun errore in console
   - [ ] Chiamata API a `profiles` visibile in Network tab
   - [ ] Loading state funziona (spinner durante caricamento)

#### Test UPDATE

1. Modifica un campo (es. telefono)
2. Clicca "Salva"
3. **Verifica**:
   - [ ] Aggiornamento ottimistico (UI si aggiorna immediatamente)
   - [ ] Chiamata API `UPDATE` visibile in Network tab
   - [ ] Dati salvati correttamente nel database
   - [ ] Messaggio di successo visualizzato
   - [ ] Cache invalidata e dati aggiornati

#### Test Validazione

1. Inserisci dati invalidi (es. email non valida)
2. Clicca "Salva"
3. **Verifica**:
   - [ ] Errore di validazione visualizzato
   - [ ] Dati NON salvati nel database
   - [ ] Messaggio errore chiaro e comprensibile

---

### Test Hook `useAthleteMedical`

#### Test GET

1. Apri il tab "Medica"
2. **Verifica**:
   - [ ] Dati medici caricati correttamente
   - [ ] Certificato medico visualizzato (se presente)
   - [ ] Referti medici visualizzati (se presenti)
   - [ ] Allergie e patologie visualizzate

#### Test UPDATE

1. Modifica allergie o patologie
2. Aggiungi una nuova allergia
3. Clicca "Salva"
4. **Verifica**:
   - [ ] Dati aggiornati correttamente
   - [ ] Nuova allergia aggiunta all'array
   - [ ] Dati salvati nel database

#### Test UPLOAD Certificato

1. Clicca "Carica Certificato"
2. Seleziona un file PDF
3. **Verifica**:
   - [ ] File caricato correttamente
   - [ ] URL salvato in `athlete_medical_data.certificato_medico_url`
   - [ ] File visibile nel bucket `athlete-certificates`
   - [ ] Preview file funzionante

#### Test UPLOAD Referto

1. Clicca "Carica Referto"
2. Seleziona un file
3. **Verifica**:
   - [ ] File caricato correttamente
   - [ ] Referto aggiunto a `athlete_medical_data.referti_medici` (JSONB array)
   - [ ] File visibile nel bucket `athlete-reports`

---

### Test Hook `useAthleteFitness`

#### Test GET

1. Apri il tab "Fitness"
2. **Verifica**:
   - [ ] Dati fitness caricati correttamente
   - [ ] Misurazioni visualizzate
   - [ ] Obiettivi visualizzati
   - [ ] Zone problematiche visualizzate

#### Test UPDATE

1. Modifica misurazioni (es. peso, altezza)
2. Modifica obiettivo primario
3. Aggiungi zona problematica
4. Clicca "Salva"
5. **Verifica**:
   - [ ] Dati aggiornati correttamente
   - [ ] Array zone problematiche aggiornato
   - [ ] Dati salvati nel database

---

### Test Hook `useAthleteMotivational`

#### Test GET

1. Apri il tab "Motivazionale"
2. **Verifica**:
   - [ ] Dati motivazionali caricati correttamente
   - [ ] Livello motivazione visualizzato (slider 1-10)
   - [ ] Motivazioni visualizzate
   - [ ] Ostacoli visualizzati

#### Test UPDATE

1. Modifica livello motivazione (slider)
2. Aggiungi motivazione
3. Aggiungi ostacolo
4. Clicca "Salva"
5. **Verifica**:
   - [ ] Livello motivazione aggiornato (valore tra 1-10)
   - [ ] Array motivazioni/ostacoli aggiornato
   - [ ] Dati salvati nel database

---

### Test Hook `useAthleteNutrition`

#### Test GET

1. Apri il tab "Nutrizione"
2. **Verifica**:
   - [ ] Dati nutrizionali caricati correttamente
   - [ ] Obiettivi nutrizionali visualizzati
   - [ ] Macronutrienti target visualizzati
   - [ ] Intolleranze/preferenze visualizzate

#### Test UPDATE

1. Modifica obiettivi nutrizionali
2. Modifica macronutrienti target (JSONB)
3. Aggiungi intolleranza
4. Clicca "Salva"
5. **Verifica**:
   - [ ] Dati aggiornati correttamente
   - [ ] JSONB macronutrienti aggiornato
   - [ ] Array intolleranze aggiornato
   - [ ] Dati salvati nel database

---

### Test Hook `useAthleteMassage`

#### Test GET

1. Apri il tab "Massaggi"
2. **Verifica**:
   - [ ] Dati massaggi caricati correttamente
   - [ ] Tipi massaggio preferiti visualizzati
   - [ ] Zone problematiche visualizzate
   - [ ] Storico massaggi visualizzato (se presente)

#### Test UPDATE

1. Modifica tipi massaggio preferiti
2. Aggiungi zona problematica
3. Clicca "Salva"
4. **Verifica**:
   - [ ] Dati aggiornati correttamente
   - [ ] Array tipi massaggio aggiornato
   - [ ] Dati salvati nel database

---

### Test Hook `useAthleteAdministrative`

#### Test GET

1. Apri il tab "Amministrativa"
2. **Verifica**:
   - [ ] Dati amministrativi caricati correttamente
   - [ ] Tipo abbonamento visualizzato
   - [ ] Stato abbonamento visualizzato
   - [ ] Lezioni (incluse/utilizzate/rimanenti) visualizzate
   - [ ] Documenti contrattuali visualizzati

#### Test UPDATE

1. Modifica tipo abbonamento
2. Modifica stato abbonamento
3. Clicca "Salva"
4. **Verifica**:
   - [ ] Dati aggiornati correttamente
   - [ ] Trigger calcolo `lezioni_rimanenti` funziona
   - [ ] Dati salvati nel database

#### Test UPLOAD Documento

1. Clicca "Carica Documento"
2. Seleziona un file
3. **Verifica**:
   - [ ] File caricato correttamente
   - [ ] Documento aggiunto a `documenti_contrattuali` (JSONB array)
   - [ ] File visibile nel bucket `athlete-contracts`

---

### Test Hook `useAthleteSmartTracking`

#### Test GET

1. Apri il tab "Smart Tracking"
2. **Verifica**:
   - [ ] Ultimo record caricato correttamente
   - [ ] Metriche visualizzate (passi, calorie, sonno, ecc.)
   - [ ] Data/ora ultimo aggiornamento visualizzata

#### Test GET HISTORY

1. Clicca "Visualizza Storico"
2. **Verifica**:
   - [ ] Storico caricato con paginazione
   - [ ] Tabella con record storici
   - [ ] Paginazione funzionante

#### Test CREATE

1. Clicca "Aggiungi Entry"
2. Compila i campi (passi, calorie, sonno, ecc.)
3. Clicca "Salva"
4. **Verifica**:
   - [ ] Nuovo record creato
   - [ ] Record salvato nel database
   - [ ] UI aggiornata con nuovo record

#### Test UPDATE

1. Modifica un record esistente
2. Clicca "Salva"
3. **Verifica**:
   - [ ] Record aggiornato correttamente
   - [ ] Dati salvati nel database

---

### Test Hook `useAthleteAIData`

#### Test GET

1. Apri il tab "AI Data"
2. **Verifica**:
   - [ ] Ultima analisi AI caricata correttamente
   - [ ] Insights visualizzati
   - [ ] Raccomandazioni visualizzate
   - [ ] Pattern rilevati visualizzati
   - [ ] Score engagement/progresso visualizzati

#### Test GET HISTORY

1. Clicca "Visualizza Storico"
2. **Verifica**:
   - [ ] Storico analisi caricato con paginazione
   - [ ] Tabella con analisi storiche
   - [ ] Paginazione funzionante

#### Test REFRESH

1. Clicca "Rigenera Analisi"
2. **Verifica**:
   - [ ] Nuova analisi triggerata
   - [ ] Loading state durante generazione
   - [ ] Nuova analisi visualizzata dopo completamento

---

## ✅ EPICA 9.2: Test Integrazione UI Tab → Hook → DB

### Test Generali per Ogni Tab

Per ogni tab (Anagrafica, Medica, Fitness, Motivazionale, Nutrizione, Massaggi, Amministrativa, Smart Tracking, AI Data):

1. **Test Caricamento**:
   - [ ] Tab carica dati correttamente
   - [ ] Loading state funziona
   - [ ] Empty state visualizzato quando dati mancanti

2. **Test Edit Inline**:
   - [ ] Modifica campo e salvataggio funzionano
   - [ ] Validazione errori visualizzati
   - [ ] Messaggio successo visualizzato

3. **Test Error State**:
   - [ ] Errore network visualizzato
   - [ ] Pulsante retry funzionante
   - [ ] Messaggio errore chiaro

4. **Test Empty State**:
   - [ ] Empty state visualizzato quando dati mancanti
   - [ ] Pulsante "Aggiungi dati" funzionante
   - [ ] Creazione dati funziona

---

## ✅ EPICA 9.4: Test File Storage

### Test Upload Certificato Medico

1. Vai al tab "Medica"
2. Clicca "Carica Certificato"
3. Seleziona file PDF (max 10MB)
4. **Verifica**:
   - [ ] Upload progress visualizzato
   - [ ] File caricato correttamente
   - [ ] URL salvato in database
   - [ ] File visibile nel bucket `athlete-certificates`
   - [ ] Preview file funzionante

### Test Upload Referto

1. Vai al tab "Medica"
2. Clicca "Carica Referto"
3. Seleziona file
4. **Verifica**:
   - [ ] File caricato correttamente
   - [ ] Referto aggiunto a JSONB array
   - [ ] File visibile nel bucket `athlete-reports`

### Test Upload Foto Progressi

1. Vai al tab "Progressi" (pagina profilo atleta)
2. Clicca "Carica Foto"
3. Seleziona immagine
4. **Verifica**:
   - [ ] File caricato correttamente
   - [ ] Foto salvata in `progress_photos`
   - [ ] File visibile nel bucket `athlete-progress-photos`

### Test Upload Documento Contrattuale

1. Vai al tab "Amministrativa"
2. Clicca "Carica Documento"
3. Seleziona file
4. **Verifica**:
   - [ ] File caricato correttamente
   - [ ] Documento aggiunto a JSONB array
   - [ ] File visibile nel bucket `athlete-contracts`

### Test Download File

1. Clicca su un file esistente (certificato, referto, documento)
2. **Verifica**:
   - [ ] Download file funziona
   - [ ] File scaricato correttamente
   - [ ] Permessi corretti (solo utenti autorizzati)

### Test Eliminazione File

1. Clicca "Elimina" su un file (solo Admin)
2. **Verifica**:
   - [ ] File eliminato dallo storage
   - [ ] URL rimosso dal database
   - [ ] Atleta/PT NON può eliminare (solo Admin)

---

## ✅ EPICA 9.5: Test Integrazione Dashboard

### Test Pagina Dashboard PT: `/dashboard/atleti/[id]`

1. **Caricamento**:
   - [ ] Pagina carica correttamente
   - [ ] Tutti i 9 tab visibili
   - [ ] Indicatori completamento funzionanti

2. **Navigazione Tab**:
   - [ ] Navigazione tra tab funziona
   - [ ] Lazy load tab funziona (tab caricati solo quando attivi)
   - [ ] Stato tab preservato durante navigazione

3. **Empty State**:
   - [ ] Empty state visualizzato quando profilo vuoto
   - [ ] Messaggi informativi chiari

4. **Error Handling**:
   - [ ] Errori per singola categoria non bloccano altre
   - [ ] Messaggi errore chiari

5. **Performance**:
   - [ ] Caricamento rapido anche con molti dati
   - [ ] Nessun lag durante navigazione

### Test Pagina Profilo Atleta: `/home/profilo`

1. **Caricamento**:
   - [ ] Pagina carica correttamente
   - [ ] Statistiche reali visualizzate (workout_logs, progress_score, lezioni)
   - [ ] Tutte le sezioni visibili

2. **Tab Overview**:
   - [ ] Statistiche visualizzate correttamente
   - [ ] Dati reali (non mock)

3. **Tab Profilo Completo**:
   - [ ] 9 sub-tab funzionanti
   - [ ] Dati reali caricati

4. **Tab Progressi**:
   - [ ] Progressi visualizzati correttamente
   - [ ] Grafici funzionanti

5. **Tab AI Insights**:
   - [ ] Insights visualizzati correttamente
   - [ ] Dati reali (non mock)

### Test Responsive Mobile

1. **Mobile (< 768px)**:
   - [ ] Layout adattato correttamente
   - [ ] Tab navigabili su mobile
   - [ ] Touch interactions funzionanti

2. **Tablet (768px - 1024px)**:
   - [ ] Layout adattato correttamente
   - [ ] Tab visibili e navigabili

3. **Desktop (> 1024px)**:
   - [ ] Layout completo visualizzato
   - [ ] Tutte le funzionalità accessibili

---

## 📊 Checklist Completa

Usa questa checklist per tracciare i test completati:

- [ ] EPICA 9.1: Test CRUD Hooks (9 hook testati)
- [ ] EPICA 9.2: Test Integrazione UI (9 tab testati)
- [ ] EPICA 9.3: Test RLS (completato con script SQL ✅)
- [ ] EPICA 9.4: Test File Storage (upload/download testati)
- [ ] EPICA 9.5: Test Integrazione Dashboard (pagine testate)

---

## 🎯 Prossimi Step

Dopo aver completato tutti i test manuali:

1. Documenta eventuali problemi trovati
2. Crea issue per bug trovati
3. Aggiorna la checklist in `FASE9_TESTING_CHECKLIST.md`
4. Segna i test completati

---

**Buon testing! 🚀**
