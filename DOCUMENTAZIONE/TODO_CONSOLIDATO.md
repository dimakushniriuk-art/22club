# 📋 TODO Consolidato - 22Club

**Data creazione**: 2025-01-30T23:45:00Z  
**Ultimo aggiornamento**: 2025-01-31T17:00:00Z

## 🎯 PRIORITÀ ALTA (Blocca funzionalità core)

### 1. Sistema Comunicazioni - Test e Configurazione (98% → 100%) ✅ QUASI COMPLETO

**Stato**: 🟢 **98% Completato** (2025-01-31)  
**Tempo stimato**: 1 giorno (rimane solo config provider esterni)  
**Autonomia**: 40% (richiede API keys per produzione)

**✅ Completato**:

- [x] ✅ **STEP 1: Test manuali completi** - **COMPLETATO** (2025-01-31)
  - [x] ✅ Test 1-10: Test Critici (Creazione, Modifica, Eliminazione, Invio, Navigazione)
  - [x] ✅ Test 11-12: Test Funzionali (Schedulazione, Tracking/Statistiche)
  - [x] ✅ Test 13-15: Test UX (Validazione, Toast, Progress Bar)
  - [x] ✅ Report finale: `docs/STEP1_REPORT_FINALE.md`
- [x] ✅ **STEP 2: Configurazione VAPID Keys** - **COMPLETATO** (2025-01-31)
  - [x] ✅ Chiavi verificate e funzionanti
  - [x] ✅ API `/api/push/vapid-key` testata
  - [x] ✅ Report: `docs/STEP2_REPORT_FINALE.md`
- [x] ✅ **FASE 7.3: Tracking errori completo** - **COMPLETATO** (2025-01-31)
  - [x] ✅ Catturare errori invio dettagliati
  - [x] ✅ Salvare `error_message` in `communication_recipients`
  - [x] ✅ Aggiornare `communications.total_failed` automaticamente

**⏸️ Rimandato (prima deploy produzione)**:

- [ ] ⏸️ **STEP 3: Configurazione provider esterni** - **RIMANDATO**
  - [ ] Configurare variabili ambiente Resend (`RESEND_API_KEY`, `RESEND_FROM_EMAIL`)
  - [ ] Configurare variabili ambiente Twilio (`TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_PHONE_NUMBER`)
  - [ ] Configurare webhook URL in dashboard Resend/Twilio
  - [ ] Test connessione provider in produzione
  - [ ] **NOTA**: Sistema funziona in modalità simulazione durante sviluppo

### 2. Test Manuali UI Workouts (FASE 8 rimanenti)

**Stato**: ⏳ Test SQL completati (8/8), test manuali UI da eseguire  
**Tempo stimato**: 1-2 giorni  
**Autonomia**: 0% (richiede interazione utente)

- [ ] **STEP 8.1**: Test creazione scheda
- [ ] **STEP 8.2**: Test lettura schede
- [ ] **STEP 8.3**: Test aggiornamento scheda
- [ ] **STEP 8.4**: Test eliminazione scheda
- [ ] **STEP 8.5**: Test filtri e ricerca
- [ ] **STEP 8.6**: Test statistiche e dashboard
- [ ] **STEP 8.8**: Test performance
- [ ] **STEP 8.9**: Test RLS policies (manuali)
- [ ] **STEP 8.10**: Test end-to-end workflow

**File Guida**: `docs/48_FASE_8_GUIDA_TEST_MANUALE.md`

---

## 🟡 PRIORITÀ MEDIA (Miglioramenti importanti)

### 3. Completare Dashboard Admin (Blocco 14 - 80% → 100%)

**Stato**: ⏳ Parzialmente implementato  
**Tempo stimato**: 3-4 giorni  
**Autonomia**: 70% (serve decisione su multi-tenancy)

- [ ] Implementare dashboard Admin base
- [ ] Gestione utenti (CRUD completo)
- [ ] ⚠️ Gestione organizzazioni (multi-tenancy) - Richiede decisione architetturale
- [ ] Statistiche globali admin
- [ ] Gestione permessi e ruoli avanzata

### 4. Implementare Test E2E (Blocco 9 - 40% → 80%)

**Stato**: ⏳ Framework base presente, coverage bassa  
**Tempo stimato**: 5-7 giorni  
**Autonomia**: 60% (richiede setup e validazione)

- [ ] Setup framework test E2E (Playwright) se non presente
- [ ] Test E2E flusso registrazione nuovo atleta
- [ ] Test E2E flusso creazione appuntamento
- [ ] Test E2E flusso creazione scheda allenamento
- [ ] Test E2E flusso upload documento
- [ ] Test E2E flusso chat tra PT e Atleta
- [ ] Test E2E flusso pagamento e aggiornamento contatore lezioni
- [ ] Test E2E performance con dati voluminosi
- [ ] Test E2E sicurezza penetration
- [ ] Aumentare coverage test unitari (target: >70%)

### 5. Aumentare Coverage Documentazione

**Stato**: ⏳ Documentazione parziale  
**Tempo stimato**: 3-4 giorni  
**Autonomia**: 100%

- [ ] Documentare layout generale dashboard PT
- [ ] Documentare layout generale dashboard Atleta
- [ ] Documentare tutti i componenti UI (attualmente solo alcuni)
- [ ] Documentare strategia testing
- [ ] Documentare pattern architetturali (React Query, form management, error handling)
- [ ] Documentare configurazione servizi esterni (email, SMS, 2FA)

---

## 🟢 PRIORITÀ BASSA (Code Quality e Ottimizzazioni)

### 6. Ottimizzazioni Performance

**Stato**: ⏳ Alcune ottimizzazioni implementate  
**Tempo stimato**: 4-6 giorni  
**Autonomia**: 100%

- [ ] Ottimizzare query RPC `get_clienti_stats()` (timeout dopo 3s)
- [ ] Ottimizzare query `fetchClienti` (timeout dopo 5-8s)
- [ ] Verificare indici database esistenti, aggiungere se mancanti
- [ ] Ottimizzare calcolo statistiche client-side (clienti, allenamenti)
- [ ] Implementare caching avanzato con persistenza locale
- [ ] Ottimizzare lazy loading componenti (più aggressivo)
- [ ] Ottimizzare bundle size (code splitting)

### 7. Implementare Logger Strutturato

**Stato**: ⏳ Non implementato  
**Tempo stimato**: 2-3 giorni  
**Autonomia**: 100%

- [ ] Sostituire `console.log` con logger strutturato
- [ ] Configurare log levels (debug, info, warn, error)
- [ ] Rimuovere log in produzione
- [ ] Implementare log rotation
- [ ] Test logging in sviluppo e produzione

### 8. Ottimizzazioni Varie (Chat, Progressi, Clienti, Pagamenti, Inviti, Abbonamenti)

**Stato**: ⏳ Ottimizzazioni parziali  
**Tempo stimato**: 3-4 giorni  
**Autonomia**: 100%

#### Chat (Blocco 15)

- [ ] Verificare storage bucket chat (non specificato nel codice)
- [ ] Ottimizzare performance query conversazioni con molti messaggi
- [ ] Gestire memory leak realtime subscriptions (verificare unsubscribe corretto)
- [ ] (Domanda: Quale bucket Supabase Storage viene usato per file chat?)
- [ ] (Domanda: Ci sono limiti dimensione file per upload chat?)

#### Progressi (Blocco 18)

- [ ] Creare RPC function per statistiche progressi (attualmente query manuale)
- [ ] Ottimizzare calcolo variazioni peso/forza
- [ ] (Domanda: Ci sono altre metriche progressi da tracciare?)
- [ ] (Domanda: È prevista integrazione con dispositivi wearable per tracking automatico?)

#### Clienti (Blocco 19)

- [ ] Ottimizzare performance query client-side (carica `pageSize * 5` record)
- [ ] Verificare export CSV/PDF (implementato completamente o parzialmente?)
- [ ] (Domanda: Ci sono altre funzionalità clienti da aggiungere?)

#### Pagamenti (Blocco 16)

- [ ] Verificare export CSV pagamenti (implementato o da implementare?)
- [ ] Validazione importi (verificare che `amount > 0` tranne storni)
- [ ] (Domanda: Ci sono integrazioni con gateway pagamento (Stripe, PayPal) previste?)
- [ ] (Domanda: È prevista gestione fatture/ricevute automatiche?)

#### Inviti (Blocco 21)

- [ ] (Domanda: Qual è la durata di validità default per un invito?)
- [ ] (Domanda: È prevista notifica email quando si crea un invito?)

#### Abbonamenti (Blocco 24)

- [ ] (Domanda: Qual è la durata default di un abbonamento?)
- [ ] (Domanda: È prevista notifica quando un abbonamento sta per scadere?)

### 9. Code Review e Polish Finale

**Stato**: ⏳ Non iniziato  
**Tempo stimato**: 2-3 giorni  
**Autonomia**: 100%

- [ ] Code review finale codice refactored
- [ ] Verifica coerenza architetturale
- [ ] Fix minori identificati
- [ ] Rimozione codice commentato non necessario
- [ ] Verifica convenzioni naming
- [ ] Verifica TypeScript strict mode compliance

### 10. Verifiche VAPID Key e Cron Notifications (Blocco 22)

**Stato**: ⏳ Da verificare  
**Tempo stimato**: 1-2 giorni  
**Autonomia**: 100%

- [ ] Verificare VAPID key management (gestione sicura chiavi)
- [ ] Verificare cron notifications (scheduling funzionante)
- [ ] Verificare push subscriptions cleanup (rimozione subscription scadute)
- [ ] Test push notifications end-to-end
- [ ] (Domanda: Ci sono limiti rate limiting per notifiche?)

---

## ❓ Domande da Risolvere - Integrazioni Future

**Stato**: ⏳ Decisioni architetturali da prendere  
**Tempo stimato**: N/A  
**Autonomia**: 0% (richiede decisioni)

- [ ] Autenticazione social (Google, Facebook) - da implementare?
- [ ] Autenticazione a due fattori (2FA) integrata con sistema esistente - prevista?
- [ ] Integrazione calendari esterni (Google Calendar, Outlook) - prevista?
- [ ] Integrazione dispositivi wearable per Smart Tracking - prevista?
- [ ] Integrazione gateway pagamento (Stripe, PayPal) - prevista?
- [ ] Dashboard personalizzabile per PT - prevista?
- [ ] Dashboard personalizzabile per atleta - prevista?

---

## ✅ COMPLETATI (Non richiedono azione)

### Completati Recentemente (2025-01-30)

1. ✅ **Sistema Impostazioni (Blocco 26)** - 100% COMPLETATO
   - Tabella `user_settings` creata
   - Salvataggio impostazioni (notifiche, privacy, account)
   - 2FA completo (QR code, verifica, backup codes)

2. ✅ **Sistema Statistiche (Blocco 23)** - 100% COMPLETATO
   - Query reali Supabase (sostituito mock data)
   - Export report CSV
   - Ottimizzazione query con RPC functions

3. ✅ **Upload Avatar a Storage (P4-012)** - 100% COMPLETATO
   - Upload a bucket `avatars`
   - Validazione formato/dimensione
   - Resize automatico
   - Aggiornamento `profiles.avatar_url`

4. ✅ **Upload Diretto File Esercizi (P4-007)** - 100% COMPLETATO
   - Upload video a `exercise-videos`
   - Upload immagini a `exercise-thumbs`
   - Validazione formati e dimensioni

5. ✅ **UI Ricorrenze Appuntamenti (P4-005)** - 100% COMPLETATO
   - UI selezione tipo ricorrenza
   - Logica creazione appuntamenti ricorrenti
   - Gestione modifica/cancellazione

6. ✅ **Validazioni e Ottimizzazioni Varie** - 100% COMPLETATO
   - Validazione sovrapposizioni appuntamenti (P4-004)
   - Validazione formato URL video esercizi (P4-006)
   - Validazione target workout (P4-009)
   - Completare statistiche workout (P4-010)
   - Risolvere naming confusion profili (P4-011)
   - Calcolo `streak_giorni` da `workout_logs` (P4-003)

7. ✅ **Fix Critici Gestione File Multimediali Esercizi** - 100% COMPLETATO
   - Cleanup file orfani dopo eliminazione
   - Cleanup file vecchi durante modifica
   - Rollback file se DB insert fallisce
   - Standardizzazione colonne database

8. ✅ **Split File Lunghi (P4-001, P4-015, P4-016)** - 100% COMPLETATO
   - Tutti i file >500 righe sono stati splittati

9. ✅ **Estrazione Logica Form (P4-002)** - 100% COMPLETATO
   - Utility `handleAthleteProfileSave()` creata
   - Hook form per tutti i tab creati

10. ✅ **Verifiche Automatiche e Sincronizzazioni** - 100% COMPLETATO
    - Trigger sincronizzazione `lesson_counters`
    - Logica automatica scadenza documenti/inviti/abbonamenti
    - Generazione `qr_url` inviti

---

## 📊 Riepilogo Statistiche

**Totale Task Identificati**: 200+ task  
**PRIORITÀ ALTA**: 2 categorie, 20+ task  
**PRIORITÀ MEDIA**: 3 categorie, 30+ task  
**PRIORITÀ BASSA**: 5 categorie, 50+ task  
**COMPLETATI**: 10+ categorie, 100+ task

**Stima Ore Totali Rimanenti**: ~80-100 ore  
**Stima Sprint Critici (PRIORITÀ ALTA)**: ~5-7 ore  
**Stima Sprint Importanti (PRIORITÀ MEDIA)**: ~40-50 ore  
**Stima Sprint Opzionali (PRIORITÀ BASSA)**: ~35-43 ore

---

**Nota**: Questo documento è stato generato automaticamente analizzando `sviluppo.md`.  
Per dettagli completi, consultare il file principale `ai_memory/sviluppo.md`.
