# 📋 TO-DO - Task Rimanenti per Completamento 100% Progetto 22Club

**Data Creazione**: 2025-02-17  
**Stato Progetto**: ~85% completato  
**Obiettivo**: Completare tutti i task rimanenti per raggiungere 100% di completamento

---

## 📋 Tabella Riassuntiva - Ordine Esecuzione

| #   | Task                         | Priorità | Tempo        | Stato | Autonomia | Ordine   |
| --- | ---------------------------- | -------- | ------------ | ----- | --------- | -------- |
| 1   | A3. Test Manuali UI Workouts | 🟡 ALTA  | 1-2 giorni   | 0%    | ❌ 0%     | STEP 1.1 |
| 2   | A1. Config Provider Esterni  | 🟡 ALTA  | 1-2 giorni   | 85%   | ❌ 0%     | STEP 1.2 |
| 3   | H1. Code Review Finale       | 🟡 MEDIA | 2-3 giorni   | 60%   | ✅ 100%   | STEP 2.1 |
| 4   | D2. Doc Comunicazioni        | 🟡 MEDIA | 6-8 ore      | 33%   | ✅ 100%   | STEP 2.2 |
| 5   | D3. Doc Progressi            | 🟡 MEDIA | 4-6 ore      | 50%   | ✅ 100%   | STEP 2.3 |
| 6   | G1. Test E2E (opzionale)     | 🟡 MEDIA | 2-3 giorni   | 80%   | ⚠️ 30%    | STEP 3   |
| 7   | D1. Doc Componenti UI        | 🟡 MEDIA | 15-20 giorni | 29%   | ✅ 100%   | STEP 4   |
| 8   | D4. Doc Utilities            | 🟢 BASSA | 10-15 ore    | 14%   | ✅ 100%   | STEP 5.1 |
| 9   | E3. DuckDB (opzionale)       | 🟢 BASSA | 5-7 giorni   | 0%    | ✅ 100%   | STEP 5.2 |

**Legenda**:

- 🟡 ALTA = Priorità Alta (bloccante)
- 🟡 MEDIA = Priorità Media (importante)
- 🟢 BASSA = Priorità Bassa (opzionale)
- ✅ = Autonomo
- ⚠️ = Parzialmente autonomo
- ❌ = Richiede utente

---

## ⚡ PRIORITÀ ALTA - Da Fare Subito

### 1. A3. Test Manuali UI Workouts (FASE 8 rimanenti)

**Priorità**: 🟡 MEDIA-ALTA  
**Tempo stimato**: 1-2 giorni  
**Stato**: ⏳ **IN ATTESA** (0% completato)  
**Autonomia**: ❌ 0% (richiede interazione utente)  
**Ordine Esecuzione**: **STEP 1.1** (Primo task critico)

**Descrizione**: Eseguire test manuali completi del workflow schede allenamento per validare il consolidamento workouts appena completato.

**Task da completare**:

- ⏳ **STEP 8.1**: Test creazione scheda (WorkoutWizard)
  - Verificare creazione in `workout_plans`
  - Verificare `is_active=true`
  - Verificare `created_by` corretto
  - Verificare giorni ed esercizi creati correttamente

- ⏳ **STEP 8.2**: Test lettura schede (lista, filtri, ricerca)
  - Verificare caricamento lista schede
  - Verificare filtri atleta/stato
  - Verificare ricerca per nome
  - Verificare nomi atleta/trainer corretti
  - Verificare stato attivo/completato

- ⏳ **STEP 8.3**: Test aggiornamento scheda
  - Modificare nome/descrizione
  - Cambiare stato
  - Verificare `updated_at` aggiornato

- ⏳ **STEP 8.4**: Test eliminazione scheda
  - Eliminare scheda
  - Verificare CASCADE su giorni ed esercizi

- ⏳ **STEP 8.5**: Test filtri e ricerca
  - Filtro atleta
  - Filtro stato
  - Ricerca nome
  - Combinazione filtri

- ⏳ **STEP 8.6**: Test statistiche e dashboard
  - Statistiche atleta
  - Statistiche mensili
  - Percentuale completamento
  - KPI dashboard

- ⏳ **STEP 8.8**: Test performance (tempi caricamento)
  - Verificare tempi risposta UI
  - Verificare ottimizzazioni

- ⏳ **STEP 8.9**: Test RLS policies (come atleta/trainer/admin)
  - Verificare accesso come atleta (solo proprie schede)
  - Verificare accesso come trainer (tutte le schede)
  - Verificare accesso come admin (accesso completo)

- ⏳ **STEP 8.10**: Test end-to-end workflow
  - Workflow completo: creazione → visualizzazione → completamento
  - Verificare coerenza dati
  - Verificare statistiche aggiornate

**Note**:

- I test automatici (FASE 8.AUTO e FASE 8.SQL) sono già completati al 100%
- Questo task richiede test manuali con interazione utente
- Validazione consolidamento workouts appena completato

---

### 2. A1. Sistema Comunicazioni - Configurazione Provider Esterni

**Priorità**: 🟡 MEDIA-ALTA  
**Tempo stimato**: 1-2 giorni  
**Stato**: 🟡 **85% IN PROGRESS** (configurazione quasi completa, manca solo verifica DNS e test finali)  
**Autonomia**: ❌ 0% (richiede API keys e setup esterno)  
**Ordine Esecuzione**: **STEP 1.2** (Dopo A3, necessario per produzione)  
**Ultimo Aggiornamento**: 2025-02-17

**Progresso Completo**:

- ✅ **Setup Iniziale** (100% completato):
  - ✅ Pacchetti `resend` e `twilio` installati
  - ✅ Variabili ambiente aggiunte a `env.example`
  - ✅ Script di verifica creato: `scripts/verify-communications-providers.ts`
  - ✅ Script di test creato: `scripts/test-communications-providers.ts`
  - ✅ Guida completa creata: `docs/GUIDA_CONFIGURAZIONE_PROVIDER_COMUNICAZIONI.md`
  - ✅ Script npm aggiunti: `npm run verify:communications`, `npm run test:communications`

- ✅ **Configurazione Resend** (90% completato):
  - ✅ Account Resend creato: https://resend.com/dashboard
  - ✅ API Key "22Club Production" creata e configurata: `re_exufsYGV_PTh7fuxornCSDRtcNs7UKJHD`
  - ✅ Variabili ambiente configurate in `.env.local`:
    - ✅ `RESEND_API_KEY` configurata
    - ✅ `RESEND_FROM_EMAIL=noreply@22club.it` configurata
    - ✅ `RESEND_FROM_NAME=22Club` configurata
    - ✅ `RESEND_WEBHOOK_SECRET=whsec_U3qCucTP6IkqkEDR3hjlTkZ889t8ugp3` configurata
  - ✅ Webhook configurato: `https://22club.it/api/webhooks/email`
  - ✅ Dominio `22club.it` aggiunto a Resend
  - ⚠️ **DNS Records ancora "Pending"** (da completare):
    - ⏳ DKIM (TXT): `resend._domainkey` → da aggiungere al registrar
    - ⏳ SPF (TXT): `send` → da aggiungere al registrar
    - ⏳ MX: `send` → da aggiungere al registrar
  - ✅ Verifica connessione: **SUCCESS** (`npm run verify:communications`)

  - ✅ **Configurazione Twilio** (100% completato):
  - ✅ Account Twilio creato: https://console.twilio.com/
  - ✅ Credenziali configurate:
    - ✅ `TWILIO_ACCOUNT_SID=AC[REMOVED_FOR_SECURITY]`
    - ✅ `TWILIO_AUTH_TOKEN=[REMOVED_FOR_SECURITY]`
    - ✅ `TWILIO_PHONE_NUMBER=+1[REMOVED]` (numero acquistato)
  - ⏳ Webhook secret da generare (opzionale)
  - ✅ Verifica connessione: **SUCCESS** (`npm run verify:communications`)

- ⚠️ **Test Integrazione** (50% completato):
  - ✅ Script di test creato e funzionante
  - ⚠️ Test email fallito: dominio `22club.it` non ancora verificato (DNS pending)
  - ⚠️ Test SMS fallito: numero destinatario non verificato (serve numero verificato per account trial)

**Descrizione**: Configurare provider esterni per email (Resend) e SMS (Twilio) per il sistema comunicazioni. Il sistema è già funzionale al 98%, manca solo la configurazione dei provider esterni.

**Task Rimanenti da Completare**:

- ⚠️ **Verifica DNS Resend** (PRIORITÀ ALTA - Bloccante per produzione):
  - ⏳ Aggiungere DNS records nel registrar del dominio `22club.it`:
    - **DKIM (TXT)**:
      - Nome: `resend._domainkey`
      - Valore: (vedere in Resend Dashboard > Domains > 22club.it)
      - Link: https://resend.com/domains
    - **SPF (TXT)**:
      - Nome: `send`
      - Valore: `v=spf1 include:amazons...` (vedere in Resend Dashboard)
    - **MX**:
      - Nome: `send`
      - Valore: `feedback-smtp.eu-west-...` (vedere in Resend Dashboard)
      - Priority: `10`
  - ⏳ Attendere propagazione DNS (minuti/ore)
  - ⏳ Verificare in Resend che status passi da "Pending" a "Verified"
  - 📚 **Guida**: `docs/GUIDA_CONFIGURAZIONE_PROVIDER_COMUNICAZIONI.md` (STEP A1 - Configurazione Domain)
  - 🔗 **Dashboard Resend Domains**: https://resend.com/domains

- ⏳ **Configurazione Webhook Twilio** (Opzionale ma consigliato):
  - ⏳ Configurare webhook URL in Twilio Dashboard:
    - URL: `https://22club.it/api/webhooks/sms`
    - Metodo: `HTTP POST`
    - Link: https://console.twilio.com/us1/develop/phone-numbers/manage/incoming
  - ⏳ Generare webhook secret sicuro:

    ```bash
    # Windows PowerShell
    -join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | ForEach-Object {[char]$_})

    # Linux/Mac
    openssl rand -hex 32
    ```

  - ⏳ Aggiungere `TWILIO_WEBHOOK_SECRET` a `.env.local`

- ⏳ **Test Integrazione Completa**:
  - ⏳ **Test Email** (dopo verifica DNS):
    - Configurare `TEST_EMAIL=your-email@example.com` in `.env.local` (opzionale)
    - Eseguire: `npm run test:communications`
    - Oppure testare dalla UI: `http://localhost:3001/dashboard/comunicazioni`
  - ⏳ **Test SMS**:
    - Verificare numero destinatario in Twilio (per account trial):
      - Link: https://console.twilio.com/us1/develop/phone-numbers/manage/verified
      - Aggiungere numero destinatario come "Verified Caller ID"
    - Configurare `TEST_PHONE_NUMBER=+39XXXXXXXXXX` in `.env.local` (numero verificato)
    - Eseguire: `npm run test:communications`
    - Oppure testare dalla UI: `http://localhost:3001/dashboard/comunicazioni`
  - ⏳ Verificare tracking email opens (webhook Resend)
  - ⏳ Verificare tracking SMS delivery (webhook Twilio)
  - ⏳ Verificare webhook funzionanti (controllare log database `communication_recipients`)

**Note e Link Utili**:

- ✅ Il sistema comunicazioni è già funzionale al 98%
- ✅ I test manuali completi (15/15 test passati) sono già stati eseguiti
- ✅ La configurazione VAPID Keys è già completata
- ✅ Entrambi i provider sono configurati e connessi (verificato con script)
- ⚠️ **Problemi Identificati**:
  - **Resend**: Dominio `22club.it` non ancora verificato (DNS records pending)
    - **Soluzione**: Aggiungere DNS records nel registrar del dominio
    - **Alternativa sviluppo**: Usare `onboarding@resend.dev` come `RESEND_FROM_EMAIL`
  - **Twilio**: Account trial richiede numeri verificati per inviare SMS
    - **Soluzione**: Verificare numero destinatario in Twilio Dashboard
    - **Link**: https://console.twilio.com/us1/develop/phone-numbers/manage/verified

**Link Dashboard e Risorse**:

- 📧 **Resend Dashboard**: https://resend.com/dashboard
  - API Keys: https://resend.com/api-keys
  - Domains: https://resend.com/domains
  - Webhooks: https://resend.com/webhooks
  - Documentation: https://resend.com/docs
- 📱 **Twilio Console**: https://console.twilio.com/
  - Account Info: https://console.twilio.com/us1/account/settings
  - Phone Numbers: https://console.twilio.com/us1/develop/phone-numbers/manage/incoming
  - Verified Caller IDs: https://console.twilio.com/us1/develop/phone-numbers/manage/verified
  - Documentation: https://www.twilio.com/docs

**File e Script Disponibili**:

- 📚 **Guida Completa**: [`docs/GUIDA_CONFIGURAZIONE_PROVIDER_COMUNICAZIONI.md`](docs/GUIDA_CONFIGURAZIONE_PROVIDER_COMUNICAZIONI.md)
- ✅ **Script Verifica**: `npm run verify:communications`
  - Verifica configurazione e connessione provider
  - File: `scripts/verify-communications-providers.ts`
- 🧪 **Script Test**: `npm run test:communications`
  - Test invio email e SMS reali
  - File: `scripts/test-communications-providers.ts`
- 📝 **Template Variabili**: [`env.example`](env.example) (sezione Resend e Twilio)

**Prossimi Passi Immediati** (in ordine di priorità):

1. **🔴 PRIORITÀ ALTA - Verifica DNS Resend**:
   - Aprire: https://resend.com/domains
   - Cliccare su dominio `22club.it`
   - Copiare i 3 DNS records (DKIM, SPF, MX)
   - Aggiungere nel registrar del dominio `22club.it`
   - Attendere propagazione (minuti/ore)
   - Verificare che status passi a "Verified"
   - **Dopo verifica**: Eseguire `npm run test:communications` per testare invio email

2. **🟡 PRIORITÀ MEDIA - Test SMS Twilio**:
   - Aprire: https://console.twilio.com/us1/develop/phone-numbers/manage/verified
   - Aggiungere numero destinatario come "Verified Caller ID"
   - Configurare `TEST_PHONE_NUMBER=+39XXXXXXXXXX` in `.env.local` (numero verificato)
   - Eseguire: `npm run test:communications`

3. **🟢 PRIORITÀ BASSA - Webhook Twilio** (opzionale):
   - Configurare webhook URL in Twilio Dashboard
   - Generare e configurare `TWILIO_WEBHOOK_SECRET`

4. **✅ Test Finale UI**:
   - Aprire: `http://localhost:3001/dashboard/comunicazioni`
   - Testare invio email e SMS dalla pagina comunicazioni
   - Verificare che email/SMS vengano ricevuti
   - Controllare log provider per conferma invio

---

## 🔧 PRIORITÀ MEDIA - Importante per Qualità e Produzione

### 3. H1. Code Review Finale

**Priorità**: 🟡 MEDIA (CRITICO per Produzione)  
**Tempo stimato**: 2-3 giorni (per completare dal 60% al 100%)  
**Stato**: ⏳ **60% IN PROGRESS**  
**Autonomia**: ✅ 100% (completamente autonomo)  
**Ordine Esecuzione**: **STEP 1** (può essere fatto immediatamente in parallelo con task priorità alta)

**Descrizione**: Completare code review finale per preparare il codice alla produzione. Strumenti e roadmap sono già completi, mancano i fix rimanenti. **CRITICO** per qualità codice produzione.

**Priorità**: 🟡 MEDIA  
**Tempo stimato**: 2-3 giorni (per completare dal 60% al 100%)  
**Stato**: ⏳ **60% IN PROGRESS**  
**Autonomia**: ✅ 100% (completamente autonomo)

**Descrizione**: Completare code review finale per preparare il codice alla produzione. Strumenti e roadmap sono già completi, mancano i fix rimanenti.

**Task da completare**:

- ✅ **Completato**: Script code review automatico (`scripts/code-review-check.js`)
- ✅ **Completato**: Checklist code review completa (`docs/CODE_REVIEW_CHECKLIST.md`)
- ✅ **Completato**: Scan automatico eseguito (22 TODO/FIXME, 7 console.log, 25 any types)
- ✅ **Completato**: Script auto-fix creato (`scripts/code-review-fix.js`)
- ✅ **Completato**: Piano completamento creato (`docs/CODE_REVIEW_COMPLETION_PLAN.md`)
- ✅ **Completato**: Checklist finale creata (`docs/CODE_REVIEW_FINAL_CHECKLIST.md`)

- ⏳ **Fix Rimanenti da Applicare** (40% rimanente):
  - ⏳ Fix 24 `any` types rimanenti (priorità alta: 3 file)
  - ⏳ Rimuovere import inutilizzati
  - ⏳ Fix React hooks dependencies (useEffect, useMemo, useCallback)
  - ⏳ Fix problemi accessibilità (ARIA labels, keyboard navigation)

- ⏳ **Verifica Coerenza Architetturale**:
  - ⏳ Verificare pattern consistency
  - ⏳ Verificare file organization

- ⏳ **Rimozione Codice Commentato**:
  - ⏳ Scan automatico identifica codice commentato
  - ⏳ Rimozione manuale necessaria

- ⏳ **Verifica Convenzioni Naming**:
  - ⏳ ESLint verifica naming
  - ⏳ Review manuale necessaria

- ⏳ **Verifica TypeScript Strict Mode Compliance**:
  - ⏳ Eseguire `npm run typecheck`
  - ⏳ Fixare errori TypeScript necessari

**Prossimi Comandi**:

```bash
# Verifiche
npm run typecheck
npm run lint
npm run build

# Fix automatici
npm run code-review:fix
npm run lint:fix

# Verifica finale
npm run code-review:verify
npm run pre-deploy
```

**File Coinvolti**:

- ⏳ `src/**/*.ts` - Altri file da revieware e fixare (24 any types rimanenti)
- ✅ `scripts/code-review-check.js` - Script scan automatico
- ✅ `scripts/code-review-fix.js` - Script auto-fix
- ✅ `docs/CODE_REVIEW_CHECKLIST.md` - Checklist completa
- ✅ `docs/CODE_REVIEW_COMPLETION_PLAN.md` - Piano completamento
- ✅ `docs/CODE_REVIEW_FINAL_CHECKLIST.md` - Checklist finale 100%

**Guida 100%**: `docs/CODE_REVIEW_100_PERCENT_GUIDE.md` - Guida step-by-step per completamento

---

### 4. D2. Documentazione Sistema Comunicazioni

**Priorità**: 🟡 MEDIA  
**Tempo stimato**: 6-8 ore (per completare dal 33% al 100%)  
**Stato**: ⏳ **33% IN PROGRESS**  
**Autonomia**: ✅ 100% (completamente autonomo)  
**Ordine Esecuzione**: **STEP 2** (veloce, sistema già al 98% funzionale)

**Descrizione**: Completare documentazione tecnica dei componenti comunicazioni. Attualmente solo 2 hooks e 1 page sono documentati, mancano 6 componenti.

**Task da completare**:

- ✅ **Completato**: Hook `use-communications.ts` - Documentato
- ✅ **Completato**: Hook `use-communications-page.tsx` - Documentato
- ✅ **Completato**: Page `ComunicazioniPage.md` - Documentato
- ✅ **Completato**: Database tables (`communications`, `communication_recipients`) - Documentato

- ⏳ **Componenti da Documentare** (6 componenti rimanenti):
  - ⏳ `communication-card.tsx` - Card singola comunicazione
  - ⏳ `communications-header.tsx` - Header sezione
  - ⏳ `communications-list.tsx` - Lista comunicazioni
  - ⏳ `communications-search.tsx` - Barra ricerca
  - ⏳ `new-communication-modal.tsx` - Modal creazione
  - ⏳ `recipients-detail-modal.tsx` - Modal destinatari

**Note**:

- Componenti già implementati e funzionanti
- Manca solo documentazione tecnica
- Priorità alta per sistema comunicazioni (98% funzionale)

---

### 5. D3. Documentazione Sistema Progressi

**Priorità**: 🟡 MEDIA  
**Tempo stimato**: 4-6 ore (per completare dal 50% al 100%)  
**Stato**: ⏳ **50% IN PROGRESS**  
**Autonomia**: ✅ 100% (completamente autonomo)  
**Ordine Esecuzione**: **STEP 3** (veloce, può essere fatto subito dopo D2)

**Descrizione**: Completare documentazione tecnica dei componenti progressi. Attualmente solo 2 hooks e 2 componenti sono documentati.

**Task da completare**:

- ✅ **Completato**: Hook `use-progress.ts` - Documentato
- ✅ **Completato**: Hook `use-progress-stats.ts` - Documentato
- ✅ **Completato**: Componente `progress-charts.tsx` (dashboard) - Documentato
- ✅ **Completato**: Componente `progress-charts.tsx` (athlete) - Documentato
- ✅ **Completato**: Pages - Documentate
- ✅ **Completato**: Database tables (`progress_logs`, `progress_photos`) - Documentato

- ⏳ **Componenti da Documentare**:
  - ⏳ `progress-flash.tsx` - Flash progressi recenti
  - ⏳ `progress-recent.tsx` - Progressi recenti
  - ⏳ `progress-recent-new.tsx` - Nuovo componente progressi recenti
  - ⏳ Altri componenti progressi

**Note**:

- Componenti già implementati e funzionanti
- Manca solo documentazione tecnica
- Priorità media

---

### 6. G1. Test E2E (End-to-End) - Miglioramenti Opzionali

**Priorità**: 🟡 MEDIA  
**Tempo stimato**: 2-3 giorni (per miglioramenti opzionali)  
**Stato**: ✅ **80% COMPLETATO** (miglioramenti opzionali rimanenti)  
**Autonomia**: ⚠️ 30% (parzialmente autonomo, richiede validazione utente)  
**Ordine Esecuzione**: **STEP 3** (già funzionale all'80%, miglioramenti opzionali)

**Priorità**: 🟡 MEDIA  
**Tempo stimato**: 2-3 giorni (per miglioramenti opzionali)  
**Stato**: ✅ **80% COMPLETATO** (miglioramenti opzionali rimanenti)  
**Autonomia**: ⚠️ 30% (parzialmente autonomo, richiede validazione utente)

**Descrizione**: Miglioramenti opzionali per test end-to-end. Il sistema di test E2E è già all'80% completato con framework configurato, test principali implementati (232 test cases in 31 file), e coverage configurata (>70%). Rimangono solo miglioramenti opzionali.

**Task Completati** (80%):

- ✅ **Setup Framework Playwright** - COMPLETATO
  - ✅ Configurazione `playwright.config.ts` per sviluppo
  - ✅ Configurazione `playwright.config.ci.ts` per CI/CD
  - ✅ Supporto multi-browser e dispositivi mobili

- ✅ **Test E2E Flussi Principali** - COMPLETATO
  - ✅ Registrazione atleta (5 test)
  - ✅ Appuntamenti (6 test)
  - ✅ Schede allenamento (7 test)
  - ✅ Chat (7 test)
  - ✅ Pagamenti (6 test)
  - ✅ User journey completi
  - ✅ **Totale**: 232 test cases in 31 file E2E

- ✅ **Test Performance e Sicurezza** - COMPLETATO
  - ✅ Performance (9 test) - Core Web Vitals, LCP, paginazione, lazy loading
  - ✅ Sicurezza (11 test) - XSS, SQL injection, CSRF, autenticazione
  - ✅ Accessibility (8 test)
  - ✅ Error handling (10 test)

- ✅ **Coverage Test Unitari** - COMPLETATO
  - ✅ Coverage configurato: lines 70%, functions 70%, branches 65%, statements 70%
  - ✅ 30+ file di test unitari

**Miglioramenti Opzionali Rimanenti** (20%):

- ⏳ **Visual Regression Testing** (opzionale):
  - ⏳ Screenshot comparison per rilevare cambiamenti UI
  - ⏳ **Autonomia**: ⚠️ PARZIALE - Richiede validazione utente

- ⏳ **Test API Endpoints Isolati** (opzionale):
  - ⏳ Test isolati per endpoint API specifici
  - ⏳ **Autonomia**: ✅ 100% autonomo

- ⏳ **Test Integrazione Supabase Real-time** (opzionale):
  - ⏳ Test per subscription real-time
  - ⏳ **Autonomia**: ⚠️ PARZIALE - Richiede validazione utente

**Note**:

- ✅ Il sistema di test E2E è già funzionale e completo all'80%
- ⏳ I miglioramenti rimanenti sono **opzionali** e non necessari per il 100% di completamento
- Alcuni miglioramenti richiedono validazione utente per confermare comportamento atteso
- Il sistema è già pronto per produzione con i test attuali

---

### 7. D1. Documentazione Componenti UI

**Priorità**: 🟡 MEDIA  
**Tempo stimato**: 15-20 giorni (per completare dal 29% al 100%)  
**Stato**: ⏳ **29% IN PROGRESS** (40/139 componenti documentati)  
**Autonomia**: ✅ 100% (completamente autonomo)  
**Ordine Esecuzione**: **STEP 4** (lungo, può essere fatto gradualmente in background)

**Descrizione**: Completare documentazione tecnica di tutti i componenti UI rimanenti. Attualmente solo 40 componenti su 139 sono documentati (29%).

**Task da completare**:

- ⏳ **Componenti da Documentare** (99 componenti rimanenti):
  - ⏳ Componenti Workout (~13 componenti) - Priorità Media
  - ⏳ Componenti Calendar/Appointments (~5 componenti) - Priorità Media
  - ⏳ Componenti Athlete/Home-Profile (~10 componenti) - Priorità Media
  - ⏳ Componenti Settings (~6 componenti) - Priorità Media
  - ⏳ Componenti Shared/Analytics (~5 componenti) - Priorità Media
  - ⏳ Altri Componenti Dashboard (~60+ componenti) - Priorità Bassa

**Componenti Già Documentati** (40/139):

- ✅ Componenti UI Base: 38/38 (100%)
- ✅ Componenti Comunicazioni: 6/6 (100%)
- ✅ Componenti Dashboard: 100/100 (100%)

**Note**:

- La documentazione è importante per manutenibilità e onboarding
- Non bloccante per produzione, ma migliora qualità codice
- Priorità ai componenti più critici (workout, calendar, athlete profile)
- **Può essere fatto gradualmente** in background mentre si lavora su altri task

---

## 📦 PRIORITÀ BASSA - Opzionale / Backlog

### 8. D4. Documentazione Utilities

**Priorità**: 🟢 BASSA  
**Tempo stimato**: 10-15 ore (per completare dal 14% al 100%)  
**Stato**: ⏳ **14% IN PROGRESS** (4/28 utilities documentate)  
**Autonomia**: ✅ 100% (completamente autonomo)  
**Ordine Esecuzione**: **STEP 5.1** (opzionale, solo utilities critiche)

**Priorità**: 🟢 BASSA  
**Tempo stimato**: 10-15 ore (per completare dal 14% al 100%)  
**Stato**: ⏳ **14% IN PROGRESS** (4/28 utilities documentate)  
**Autonomia**: ✅ 100% (completamente autonomo)

**Descrizione**: Completare documentazione tecnica delle utilities rimanenti. Attualmente solo 4 utilities su 28 sono documentate (14%).

**Utilities Già Documentate** (4/28):

- ✅ `sanitize.ts.md` - 12 funzioni documentate
- ✅ `createClient-supabase.md` - Factory Supabase client
- ✅ `analytics-lib.md` - Libreria analytics
- ✅ `AuthProvider.md` - Provider autenticazione

**Utilities da Documentare** (24 rimanenti):

- ⏳ Validations (7 file): `validations/*.ts` - Priorità Media
- ⏳ Communications (7 file): `communications/*.ts` - Priorità Media
- ⏳ Notifications (3 file): `notifications/*.ts` - Priorità Bassa
- ⏳ Supabase (5 file): `supabase/*.ts` - Priorità Bassa
- ⏳ Utils (3 file): `utils/*.ts` - Priorità Bassa

**Note**:

- Strategia: Documentare solo utilities critiche, resto successivamente
- Non bloccante per produzione
- Priorità alle utilities più usate (validations, communications)

---

### 9. E3. Integrazione DuckDB (Opzionale)

**Priorità**: 🟢 BASSA  
**Tempo stimato**: 5-7 giorni  
**Stato**: ⏸️ **RIMANDATO** (non critico)  
**Autonomia**: ✅ 100% (completamente autonomo)  
**Ordine Esecuzione**: **STEP 5.2** (opzionale, solo se necessario)

**Descrizione**: Integrare DuckDB per analytics avanzati. Utile solo se Supabase non è sufficiente per dataset molto grandi.

**Task da completare**:

- ⏸️ Integrare DuckDB per analytics avanzati
- ⏸️ Setup DuckDB con Parquet files
- ⏸️ Migrazione query analytics da Supabase a DuckDB (se necessario)
- ⏸️ Ottimizzazioni query per dataset molto grandi

**Note**:

- **NON CRITICO**: Utile solo se Supabase non è sufficiente
- Richiede decisione architetturale (quando/come usare DuckDB)
- Può essere implementato in futuro se necessario

---

## 📊 Riepilogo Task Rimanenti

### Statistiche Aggiornate (2025-02-17)

- **Totale Task**: 9 task rimanenti
- **Priorità Alta**: 2 task (A3: 0%, A1: 85% ✅)
- **Priorità Media**: 5 task (H1: 60%, D2: 33%, D3: 50%, G1: 80%, D1: 29%)
- **Priorità Bassa**: 2 task (D4: 14%, E3: 0%)
- **Progresso Complessivo**: ~85% del progetto completato

### Statistiche

- **Task Priorità Alta**: 2 task (A3, A1)
- **Task Priorità Media**: 5 task (H1, D2, D3, G1, D1 - ordinati per criticità)
- **Task Priorità Bassa**: 2 task (D4, E3 - opzionale)

### Ordine Esecuzione per Priorità

**STEP 1 (Critici Bloccanti)**:

- 1.1 A3 (Test Manuali UI Workouts)
- 1.2 A1 (Config Provider Esterni)

**STEP 2 (Parallelo - Qualità Codice)**:

- 2.1 H1 (Code Review Finale) - CRITICO
- 2.2 D2 (Doc Comunicazioni) - Veloce
- 2.3 D3 (Doc Progressi) - Veloce

**STEP 3 (Testing)**:

- 3.1 G1 (Test E2E miglioramenti opzionali)

**STEP 4 (Documentazione Estesa)**:

- 4.1 D1 (Doc Componenti UI) - Graduale

**STEP 5 (Opzionale)**:

- 5.1 D4 (Doc Utilities)
- 5.2 E3 (DuckDB)

### Tempo Totale Stimato

- **Priorità Alta**: 2-4 giorni
- **Priorità Media**: 20-30 giorni (D1: 15-20 giorni, D2: 1 giorno, D3: 0.5-1 giorno, H1: 2-3 giorni, G1: 2-3 giorni opzionali)
- **Priorità Bassa**: 6-8 giorni (D4: 1-2 giorni, E3: 5-7 giorni opzionale)

**Totale (escluso opzionale)**: ~22-34 giorni  
**Totale (incluso opzionale)**: ~28-42 giorni

### Autonomia

- **100% Autonomo**: 5 task (D1, D2, D3, D4, H1 - Documentazione e Code Review)
- **Parzialmente Autonomo**: 1 task (G1 - Test E2E miglioramenti opzionali, 30% autonomo)
- **0% Autonomo (Richiede Utente)**: 2 task (A3 - Test Manuali, A1 - Config Provider)

---

## ✅ Task Già Completati (Esclusi da TO-DO)

I seguenti task sono stati completati al 100% e **NON** sono inclusi in questo TO-DO:

- ✅ **Sistema Impostazioni Utente (A2)** - COMPLETATO AL 100% (2025-02-16)
- ✅ **Validazioni e Ottimizzazioni Varie (B1)** - COMPLETATO AL 100% (2025-02-16)
- ✅ **Fix Critici Gestione File Multimediali Esercizi (B3)** - COMPLETATO AL 100% (2025-02-16)
- ✅ **Upload Avatar a Storage (D1)** - COMPLETATO AL 100% (2025-02-16)
- ✅ **Upload Diretto File Esercizi (D2)** - COMPLETATO AL 100% (2025-02-16)
- ✅ **Sistema Statistiche - Completamento (E1)** - COMPLETATO AL 100% (2025-02-16)
- ✅ **Dashboard Admin - Completamento (E2)** - COMPLETATO AL 100% (2025-02-16)
- ✅ **Ottimizzazioni Performance (F1)** - COMPLETATO AL 100% (2025-02-16)
- ✅ **Logger Strutturato (F2)** - COMPLETATO AL 100% (2025-02-17)
- ✅ **Split File Lunghi (C1)** - COMPLETATO AL 100% (2025-01-30)
- ✅ **Estrazione Logica Form (C2)** - COMPLETATO AL 100% (2025-01-30)
- ✅ **UI Ricorrenze Appuntamenti (D3)** - COMPLETATO AL 100% (2025-02-16)
- ✅ **Ottimizzazioni Chat (F3.1)** - COMPLETATO AL 100% (2025-02-17)

---

## 🎯 Sequenza Consigliata di Esecuzione (Ordinata per Priorità)

### ⚡ STEP 1 - Task Critici Bloccanti (Priorità Alta)

**Ordine sequenziale** (uno dopo l'altro):

1. **STEP 1.1: A3. Test Manuali UI Workouts** (1-2 giorni)
   - **Perché prima**: Valida consolidamento workouts appena completato
   - **Bloccante**: ✅ Sì, necessario per validare sistema
   - **Autonomia**: ❌ 0% (richiede utente)
   - **Dipendenze**: Nessuna

2. **STEP 1.2: A1. Configurazione Provider Esterni** (1-2 giorni) - **🟡 85% COMPLETATO**
   - **Perché dopo A3**: Sistema già funzionale al 98%, necessario solo per produzione
   - **Bloccante**: ⚠️ Solo per produzione, sistema funziona già
   - **Autonomia**: ❌ 0% (richiede API keys e verifica DNS)
   - **Dipendenze**: Nessuna (può essere fatto anche prima se API keys disponibili)
   - **Stato Attuale**:
     - ✅ Resend configurato (90% - manca solo verifica DNS)
     - ✅ Twilio configurato (100%)
     - ⏳ Verifica DNS Resend (priorità alta)
     - ⏳ Test integrazione finale
   - **Link**: Vedi sezione completa sopra per dettagli e link dashboard

**Tempo totale STEP 1**: 2-4 giorni

---

### 🔧 STEP 2 - Qualità Codice (Priorità Media - Critici)

**Ordine parallelo** (possono essere fatti contemporaneamente):

3. **STEP 2.1: H1. Code Review Finale** (2-3 giorni) - **🔴 CRITICO per produzione**
   - **Perché subito**: Preparazione codice per produzione
   - **Può essere fatto in parallelo**: ✅ Sì, con D2 e D3
   - **Autonomia**: ✅ 100%
   - **Priorità**: **MASSIMA** tra i task STEP 2

4. **STEP 2.2: D2. Documentazione Sistema Comunicazioni** (6-8 ore)
   - **Perché subito**: Veloce, sistema al 98%
   - **Può essere fatto in parallelo**: ✅ Sì, con H1 e D3
   - **Autonomia**: ✅ 100%
   - **Priorità**: Alta (veloce da completare)

5. **STEP 2.3: D3. Documentazione Sistema Progressi** (4-6 ore)
   - **Perché subito**: Veloce, può essere fatto dopo D2 o in parallelo
   - **Può essere fatto in parallelo**: ✅ Sì, con H1 e D2
   - **Autonomia**: ✅ 100%
   - **Priorità**: Media

**Strategia STEP 2**:

- Iniziare con **H1 (Code Review)** in parallelo con **D2 (Doc Comunicazioni)**
- Completare **D3 (Doc Progressi)** subito dopo D2 (veloce)
- **H1** può continuare in background mentre si lavora su altri task

**Tempo totale STEP 2**: 2-3 giorni (se fatto in parallelo, altrimenti 3-4 giorni sequenziali)

---

### 🧪 STEP 3 - Testing e Qualità (Priorità Media)

6. **STEP 3: G1. Test E2E - Miglioramenti Opzionali** (2-3 giorni opzionali)
   - **Perché dopo STEP 2**: Sistema già funzionale all'80%
   - **Bloccante**: ❌ No, miglioramenti opzionali
   - **Autonomia**: ⚠️ 30% (richiede validazione utente)
   - **Nota**: Già pronto per produzione, miglioramenti opzionali

**Tempo totale STEP 3**: 2-3 giorni (opzionale)

---

### 📚 STEP 4 - Documentazione Estesa (Priorità Media - Lungo Termine)

7. **STEP 4: D1. Documentazione Componenti UI** (15-20 giorni)
   - **Perché dopo**: Molto lungo, non bloccante
   - **Può essere fatto gradualmente**: ✅ Sì, in background
   - **Autonomia**: ✅ 100%
   - **Strategia**:
     - Documentare componenti critici prima (Workout, Calendar, Athlete Profile)
     - Resto gradualmente mentre si lavora su altri task
     - Può essere fatto in parallelo con altri task

**Tempo totale STEP 4**: 15-20 giorni (graduale, non bloccante)

---

### 📦 STEP 5 - Opzionale (Priorità Bassa)

8. **STEP 5.1: D4. Documentazione Utilities** (10-15 ore)
   - **Quando**: Solo utilities critiche se necessario
   - **Autonomia**: ✅ 100%
   - **Priorità**: Bassa (solo utilities critiche)

9. **STEP 5.2: E3. Integrazione DuckDB** (5-7 giorni)
   - **Quando**: Solo se Supabase non è sufficiente
   - **Autonomia**: ✅ 100%
   - **Priorità**: Bassa (non critico)

**Tempo totale STEP 5**: 6-8 giorni (opzionale)

---

### 📋 Riepilogo Ordine Esecuzione

**STEP 1 (Sequenziale - Critici)**:

- 1.1 A3 (Test Manuali UI Workouts) → 1.2 A1 (Config Provider)

**STEP 2 (Parallelo - Qualità Codice)**:

- 2.1 H1 (Code Review) ⚡ CRITICO
- 2.2 D2 (Doc Comunicazioni) + 2.3 D3 (Doc Progressi) in parallelo

**STEP 3 (Testing)**:

- 3.1 G1 (Test E2E miglioramenti opzionali)

**STEP 4 (Graduale)**:

- 4.1 D1 (Doc Componenti UI) - può essere fatto in background

**STEP 5 (Opzionale)**:

- 5.1 D4 (Doc Utilities) + 5.2 E3 (DuckDB)

### ⏱️ Timeline Ottimale

**Settimana 1**: STEP 1 (A3 + A1) + STEP 2 in parallelo (H1 + D2 + D3)  
**Settimana 2**: Completare STEP 2 + STEP 3 (G1 opzionale)  
**Settimana 3-6**: STEP 4 (D1 gradualmente in background)  
**Dopo**: STEP 5 (D4 + E3 opzionali)

**Timeline minima (solo critici)**: ~1-2 settimane  
**Timeline completa (tutto)**: ~4-6 settimane

---

---

## 📝 Note Aggiuntive

### Task Esclusi (Già Completati o Non Necessari)

I seguenti task sono stati esclusi dal TO-DO perché:

- **Statistiche allenamenti (70%)** - ✅ Completato al 100% in B1 (2025-02-16)
- **Validazione target workout (50%)** - ✅ Completato al 100% in B1 (2025-02-16)
- **F3. Ottimizzazioni Varie (~17%)** - ✅ Tutti i sottotask (F3.1-F3.7) completati al 100%, errore di aggiornamento nel file sviluppo.md
- **Sistema Impostazioni (80%)** - ✅ Completato al 100% (2025-02-16)
- **Dashboard Admin (80%)** - ✅ Completato al 100% (2025-02-16)
- **Upload Avatar (60%)** - ✅ Completato al 100% (2025-02-16)
- **Upload File Esercizi (50%)** - ✅ Completato al 100% (2025-02-16)
- **Comunicazioni (`/comunicazioni`) (30%)** - Sistema funzionale al 98%, solo mock data per test (non critico)
- **Admin Dashboard (40%)** - ✅ Completato al 100% (2025-02-16)

---

**Ultimo Aggiornamento**: 2025-02-17  
**Fonte**: Analisi completa di `ai_memory/sviluppo.md` (righe 1-12982)  
**Criterio Inclusione**: Tutti i task/moduli con percentuale di completamento < 95%

300 .update(updates)

```

src/lib/documents.ts:315:24 - error TS2352: Conversion of type '{ id: string; org_id: string; athlete_id: string; status: "valido" | "scaduto" | "in-revisione" | "in_scadenza" | "non_valido"; notes?: string | undefined; created_at: string; updated_at?: string | undefined; ... 7 more ...; uploaded_by: SelectQueryError<...>; }' to type 'DocumentWithRelations' may be a mistake because neither type sufficiently overlaps with the other. If this was intentional, convert the expression to 'unknown' first.
Type '{ id: string; org_id: string; athlete_id: string; status: "valido" | "scaduto" | "in-revisione" | "in_scadenza" | "non_valido"; notes?: string | undefined; created_at: string; updated_at?: string | undefined; ... 7 more ...; uploaded_by: SelectQueryError<...>; }' is missing the following properties from type '{ athlete_id: string; category: string; created_at: string | null; expires_at: string | null; file_url: string; id: string; notes: string | null; status: string | null; uploaded_by_user_id: string; }': category, uploaded_by_user_id

315 return mapDocument(data as DocumentWithRelations)
```

src/lib/dom-protection.ts:29:83 - error TS2554: Expected 1-2 arguments, but got 3.

29 logger.warn('DOM Protection: Intercepted className.split error', undefined, {
~
30 message: errorMessage,

```
...
33 colno,
~~~~~~~~~~~~~~
34 })
~~~~~~~

src/lib/exercises-storage.ts:80:60 - error TS2554: Expected 1-2 arguments, but got 3.

80 logger.debug('File eliminato con successo', undefined, { filePath, bucket })
~~~~~~~~~~~~~~~~~~~~

src/lib/exercises-storage.ts:106:71 - error TS2554: Expected 1-2 arguments, but got 3.

106 logger.warn('Impossibile estrarre bucket/path da URL', undefined, { publicUrl })
~~~~~~~~~~~~~

src/lib/export-payments.ts:16:21 - error TS2339: Property 'payment_date' does not exist on type 'Payment'.

16 Data: payment.payment_date
~~~~~~~~~~~~

src/lib/export-payments.ts:17:28 - error TS2339: Property 'payment_date' does not exist on type 'Payment'.

17 ? new Date(payment.payment_date).toLocaleDateString('it-IT')
~~~~~~~~~~~~

src/lib/export-payments.ts:23:23 - error TS2339: Property 'payment_method' does not exist on type 'Payment'.

23 Metodo: payment.payment_method || payment.method_text || '',
~~~~~~~~~~~~~~

src/lib/export-payments.ts:25:22 - error TS2339: Property 'status' does not exist on type 'Payment'.

25 Stato: payment.status || '',
~~~~~~

src/lib/export-payments.ts:27:21 - error TS2339: Property 'notes' does not exist on type 'Payment'.

27 Note: payment.notes || '',
~~~~~

src/lib/export-utils.ts:12:56 - error TS2554: Expected 1-2 arguments, but got 3.

12 logger.warn('Nessun dato da esportare', undefined, { filename })
~~~~~~~~~~~~

src/lib/export-utils.ts:57:56 - error TS2554: Expected 1-2 arguments, but got 3.

57 logger.warn('Nessun dato da esportare', undefined, { filename })
~~~~~~~~~~~~

src/lib/fetchWithCache.ts:92:14 - error TS2352: Conversion of type '{ id: string; org_id: string; athlete_id: string; status: "valido" | "scaduto" | "in-revisione" | "in_scadenza" | "non_valido"; notes?: string | undefined; created_at: string; updated_at?: string | undefined; ... 5 more ...; expires_at?: string | undefined; }[]' to type '{ athlete_id: string; category: string; created_at: string | null; expires_at: string | null; file_url: string; id: string; notes: string | null; status: string | null; uploaded_by_user_id: string; }[]' may be a mistake because neither type sufficiently overlaps with the other. If this was intentional, convert the expression to 'unknown' first.
Type '{ id: string; org_id: string; athlete_id: string; status: "valido" | "scaduto" | "in-revisione" | "in_scadenza" | "non_valido"; notes?: string | undefined; created_at: string; updated_at?: string | undefined; ... 5 more ...; expires_at?: string | undefined; }' is missing the following properties from type '{ athlete_id: string; category: string; created_at: string | null; expires_at: string | null; file_url: string; id: string; notes: string | null; status: string | null; uploaded_by_user_id: string; }': category, uploaded_by_user_id

92 return data as DocumentRow[]
~~~~~~~~~~~~~~~~~~~~~

src/lib/haptics.ts:36:58 - error TS2554: Expected 1-2 arguments, but got 3.

36 logger.debug('Haptic feedback not supported', error, { type })
~~~~~~~~

src/lib/haptics.ts:82:46 - error TS2345: Argument of type 'unknown' is not assignable to parameter of type 'Record<string, unknown> | undefined'.

82 logger.debug('Haptic permission denied', error)
~~~~~

src/lib/notifications/athlete-registration.ts:94:55 - error TS2554: Expected 1-2 arguments, but got 3.

94 logger.debug('Email notification to PT', undefined, {
~
95 to: ptEmail,
~~~~~~~~~~~~~~~~
...
99 ptName,
~~~~~~~~~~~
100 })
~~~

src/lib/notifications/athlete-registration.ts:119:48 - error TS2554: Expected 1-2 arguments, but got 3.

119 logger.debug('Push notification', undefined, { userId, notification })
~~~~~~~~~~~~~~~~~~~~~~~~

src/lib/notifications/push.ts:103:53 - error TS2554: Expected 1-2 arguments, but got 3.

103 logger.info('Push token registered', undefined, { userId })
~~~~~~~~~~

src/lib/notifications/push.ts:131:54 - error TS2554: Expected 1-2 arguments, but got 3.

131 logger.info('Push token deactivated', undefined, { userId })
~~~~~~~~~~

src/lib/notifications/push.ts:156:13 - error TS2769: No overload matches this call.
Overload 1 of 2, '(relation: "appointments" | "chat_messages" | "cliente_tags" | "documents" | "exercises" | "inviti_atleti" | "lesson_counters" | "notifications" | "user_push_tokens" | "payments" | "profiles" | "roles" | "workout_stats_mensili"): PostgrestQueryBuilder<...>', gave the following error.
Argument of type '"push_subscriptions"' is not assignable to parameter of type '"appointments" | "chat_messages" | "cliente_tags" | "documents" | "exercises" | "inviti_atleti" | "lesson_counters" | "notifications" | "user_push_tokens" | "payments" | "profiles" | "roles" | "workout_stats_mensili"'.
Overload 2 of 2, '(relation: never): PostgrestQueryBuilder<{ PostgrestVersion: "12"; }, { Tables: { appointments: { Row: { id: string; org_id: string; athlete_id: string; trainer_id: string; starts_at: string; ends_at: string; status: "attivo" | ... 2 more ... | "in_corso"; ... 8 more ...; updated_at?: string | undefined; }; Insert: { ...; }; Update: { ...; }; Relationships: []; }; ... 11 more ...; workout_stats_mensili: { ...; }; }; Views: {}; Functions: {}; Enums: {}; CompositeTypes: {}; }, never, never, never>', gave the following error.
Argument of type '"push_subscriptions"' is not assignable to parameter of type 'never'.

156 .from('push_subscriptions')
~~~~~~~~~~~~~~~~~~~~

src/lib/notifications/push.ts:163:17 - error TS2339: Property 'endpoint' does not exist on type 'SelectQueryError<"column 'endpoint' does not exist on 'appointments'."> | SelectQueryError<"column 'endpoint' does not exist on 'chat_messages'."> | ... 10 more ... | SelectQueryError<...>'.
Property 'endpoint' does not exist on type 'SelectQueryError<"column 'endpoint' does not exist on 'appointments'.">'.

163 if (sub.endpoint && sub.p256dh && sub.auth) {
~~~~~~~~

src/lib/notifications/push.ts:163:33 - error TS2339: Property 'p256dh' does not exist on type 'SelectQueryError<"column 'endpoint' does not exist on 'appointments'."> | SelectQueryError<"column 'endpoint' does not exist on 'chat_messages'."> | ... 10 more ... | SelectQueryError<...>'.
Property 'p256dh' does not exist on type 'SelectQueryError<"column 'endpoint' does not exist on 'appointments'.">'.

163 if (sub.endpoint && sub.p256dh && sub.auth) {
~~~~~~

src/lib/notifications/push.ts:163:47 - error TS2339: Property 'auth' does not exist on type 'SelectQueryError<"column 'endpoint' does not exist on 'appointments'."> | SelectQueryError<"column 'endpoint' does not exist on 'chat_messages'."> | ... 10 more ... | SelectQueryError<...>'.
Property 'auth' does not exist on type 'SelectQueryError<"column 'endpoint' does not exist on 'appointments'.">'.

163 if (sub.endpoint && sub.p256dh && sub.auth) {
~~~~

src/lib/notifications/push.ts:166:27 - error TS2339: Property 'endpoint' does not exist on type 'SelectQueryError<"column 'endpoint' does not exist on 'appointments'."> | SelectQueryError<"column 'endpoint' does not exist on 'chat_messages'."> | ... 10 more ... | SelectQueryError<...>'.
Property 'endpoint' does not exist on type 'SelectQueryError<"column 'endpoint' does not exist on 'appointments'.">'.

166 endpoint: sub.endpoint,
~~~~~~~~

src/lib/notifications/push.ts:168:27 - error TS2339: Property 'p256dh' does not exist on type 'SelectQueryError<"column 'endpoint' does not exist on 'appointments'."> | SelectQueryError<"column 'endpoint' does not exist on 'chat_messages'."> | ... 10 more ... | SelectQueryError<...>'.
Property 'p256dh' does not exist on type 'SelectQueryError<"column 'endpoint' does not exist on 'appointments'.">'.

168 p256dh: sub.p256dh,
~~~~~~

src/lib/notifications/push.ts:169:25 - error TS2339: Property 'auth' does not exist on type 'SelectQueryError<"column 'endpoint' does not exist on 'appointments'."> | SelectQueryError<"column 'endpoint' does not exist on 'chat_messages'."> | ... 10 more ... | SelectQueryError<...>'.
Property 'auth' does not exist on type 'SelectQueryError<"column 'endpoint' does not exist on 'appointments'.">'.

169 auth: sub.auth,
~~~~

src/lib/notifications/push.ts:180:70 - error TS2554: Expected 1-2 arguments, but got 3.

180 logger.warn('Error fetching web push subscriptions', webError, { userId })
~~~~~~~~~~

src/lib/notifications/push.ts:195:68 - error TS2554: Expected 1-2 arguments, but got 3.

195 logger.warn('Error fetching other push tokens', tokensError, { userId })
~~~~~~~~~~

src/lib/notifications/push.ts:229:65 - error TS2554: Expected 1-2 arguments, but got 3.

229 logger.debug('No active push tokens for user', undefined, { userId })
~~~~~~~~~~

src/lib/notifications/push.ts:261:54 - error TS2554: Expected 1-2 arguments, but got 3.

261 logger.info('Push notification sent', undefined, {
~
262 userId,
~~~~~~~~~~~~~
...
264 total: tokens.length,
~~~~~~~~~~~~~~~~~~~~~~~~~~~
265 })
~~~~~

src/lib/notifications/push.ts:297:97 - error TS2554: Expected 1-2 arguments, but got 3.

297 logger.warn('VAPID keys not configured, push notifications will be simulated', undefined, {
~
298 hasPublicKey: !!VAPID_PUBLIC_KEY,
```

299 hasPrivateKey: !!VAPID_PRIVATE_KEY,

```
300 })
~~~~~~~

src/lib/notifications/push.ts:303:63 - error TS2554: Expected 1-2 arguments, but got 3.

303 logger.debug('Simulating push notification', undefined, {
~
304 tokenPreview: tokenStr.substring(0, 20),
```

...
306 body: payload.body,

```
307 })
~~~~~~~

src/lib/notifications/push.ts:313:34 - error TS7016: Could not find a declaration file for module 'web-push'. 'C:/Users/d.kushniriuk/Desktop/22 Club/22club-setup V1 online/node_modules/web-push/src/index.js' implicitly has an 'any' type.
Try `npm i --save-dev @types/web-push` if it exists or add a new declaration (.d.ts) file containing `declare module 'web-push';`

313 const webpush = await import('web-push')
~~~~~~~~~~

src/lib/notifications/push.ts:319:27 - error TS2503: Cannot find namespace 'webpush'.

319 let pushSubscription: webpush.PushSubscription
~~~~~~~

src/lib/notifications/push.ts:326:40 - error TS2503: Cannot find namespace 'webpush'.

326 pushSubscription = parsed as webpush.PushSubscription
~~~~~~~

src/lib/notifications/push.ts:354:35 - error TS2503: Cannot find namespace 'webpush'.

354 pushSubscription = token as webpush.PushSubscription
~~~~~~~

src/lib/notifications/push.ts:371:70 - error TS2554: Expected 1-2 arguments, but got 3.

371 logger.debug('Push notification sent successfully', undefined, {
~
372 endpointPreview: endpointStr,
```

373 })

```

src/lib/notifications/push.ts:387:84 - error TS2554: Expected 1-2 arguments, but got 3.

387 logger.warn('Push notification failed (token invalid/expired)', undefined, { errorMessage })
```

src/lib/notifications/push.ts:407:63 - error TS2554: Expected 1-2 arguments, but got 3.

407 logger.warn('Falling back to simulation mode', undefined, { errorMessage })

```

src/lib/notifications/push.ts:409:72 - error TS2554: Expected 1-2 arguments, but got 3.

409 logger.debug('Simulating push notification (fallback)', undefined, {
~
410 tokenPreview: tokenStr.substring(0, 20),
```

...
412 body: payload.body,

```
413 })
~~~~~

src/lib/notifications/push.ts:463:64 - error TS2554: Expected 1-2 arguments, but got 3.

463 logger.info('Broadcast push notification sent', undefined, { totalSent })
~~~~~~~~~~~~~

src/lib/notifications/push.ts:534:62 - error TS2554: Expected 1-2 arguments, but got 3.

534 logger.info('Processed unsent notifications', undefined, {
~
535 processed: processedCount,
```

536 total: notifications?.length || 0,

```
537 })
~~~~~

src/lib/notifications/scheduler.ts:34:73 - error TS2554: Expected 1-2 arguments, but got 3.

34 logger.info('Sent notifications for expiring documents', undefined, { count: data })
~~~~~~~~~~~~~~~

src/lib/notifications/scheduler.ts:60:71 - error TS2554: Expected 1-2 arguments, but got 3.

60 logger.info('Sent notifications for missing progress', undefined, { count: data })
~~~~~~~~~~~~~~~

src/lib/notifications/scheduler.ts:86:73 - error TS2554: Expected 1-2 arguments, but got 3.

86 logger.info('Sent notifications for low lesson balance', undefined, { count: data })
~~~~~~~~~~~~~~~

src/lib/notifications/scheduler.ts:112:73 - error TS2554: Expected 1-2 arguments, but got 3.

112 logger.info('Sent notifications for no active workouts', undefined, { count: data })
~~~~~~~~~~~~~~~

src/lib/notifications/scheduler.ts:193:71 - error TS2554: Expected 1-2 arguments, but got 3.

193 logger.info('Sent notifications for skipped workouts', undefined, { count: notificationCount })
~~~~~~~~~~~~~~~~~~~~~~~~~~~~

src/lib/notifications/scheduler.ts:273:78 - error TS2554: Expected 1-2 arguments, but got 3.

273 logger.info('Sent notifications for missing progress photos', undefined, {
~
274 count: notificationCount,
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
275 })
~~~~~

src/lib/notifications/scheduler.ts:292:68 - error TS2554: Expected 1-2 arguments, but got 3.

292 logger.info('Starting daily notifications scheduler', undefined, {
~
293 timestamp: new Date().toISOString(),
```

294 })

```

src/lib/notifications/scheduler.ts:308:57 - error TS2554: Expected 1-2 arguments, but got 3.

308 logger.info('Daily notifications summary', undefined, {
~
309 documents: results.documents.count,
```

...
316 hasErrors,

```
317 })
~~~

src/lib/notifications/scheduler.ts:320:65 - error TS2554: Expected 1-2 arguments, but got 3.

320 logger.warn('Some notifications failed to send', undefined, {
~
321 errors: Object.entries(results)
```

...
323 .map(([key, result]) => ({ key, error: result.error })),

````
324 })
~~~~~

src/lib/notifications/scheduler.ts:365:72 - error TS2554: Expected 1-2 arguments, but got 3.

365 logger.info('Test notification created successfully', undefined, {
~
366 adminId: adminProfile.user_id,
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
367 })
~~~~~~~

src/lib/recurrence-management.ts:26:16 - error TS2352: Conversion of type '{ id: string; org_id: string; athlete_id: string; trainer_id: string; starts_at: string; ends_at: string; status: "attivo" | "completato" | "annullato" | "in_corso"; type: "allenamento" | "cardio" | "check" | "consulenza"; ... 7 more ...; updated_at?: string | undefined; }' to type 'Appointment' may be a mistake because neither type sufficiently overlaps with the other. If this was intentional, convert the expression to 'unknown' first.
Property 'staff_id' is missing in type '{ id: string; org_id: string; athlete_id: string; trainer_id: string; starts_at: string; ends_at: string; status: "attivo" | "completato" | "annullato" | "in_corso"; type: "allenamento" | "cardio" | "check" | "consulenza"; ... 7 more ...; updated_at?: string | undefined; }' but required in type 'Appointment'.

26 const appt = appointment as Appointment
~~~~~~~~~~~~~~~~~~~~~~~~~~

src/types/appointment.ts:10:3
10 staff_id: string
~~~~~~~~
'staff_id' is declared here.

src/lib/recurrence-management.ts:49:13 - error TS2352: Conversion of type '{ id: string; org_id: string; athlete_id: string; trainer_id: string; starts_at: string; ends_at: string; status: "attivo" | "completato" | "annullato" | "in_corso"; type: "allenamento" | "cardio" | "check" | "consulenza"; ... 7 more ...; updated_at?: string | undefined; }[]' to type 'Appointment[]' may be a mistake because neither type sufficiently overlaps with the other. If this was intentional, convert the expression to 'unknown' first.
 Property 'staff_id' is missing in type '{ id: string; org_id: string; athlete_id: string; trainer_id: string; starts_at: string; ends_at: string; status: "attivo" | "completato" | "annullato" | "in_corso"; type: "allenamento" | "cardio" | "check" | "consulenza"; ... 7 more ...; updated_at?: string | undefined; }' but required in type 'Appointment'.

49 series: series as Appointment[],
~~~~~~~~~~~~~~~~~~~~~~~

src/types/appointment.ts:10:3
10 staff_id: string
~~~~~~~~
'staff_id' is declared here.

src/lib/recurrence-management.ts:136:64 - error TS2345: Argument of type 'Partial<Appointment>' is not assignable to parameter of type '{ id?: string | undefined; org_id?: string | undefined; athlete_id?: string | undefined; trainer_id?: string | undefined; starts_at?: string | undefined; ends_at?: string | undefined; ... 9 more ...; updated_at?: string | undefined; }'.
Types of property 'location' are incompatible.
Type 'string | null | undefined' is not assignable to type 'string | undefined'.
Type 'null' is not assignable to type 'string | undefined'.

136 const { error } = await supabase.from('appointments').update(updates).eq('id', appointmentId)
~~~~~~~

src/lib/recurrence-management.ts:160:64 - error TS2345: Argument of type '{ id?: string | undefined; org_id?: string | undefined; athlete_id?: string | undefined; staff_id?: string | undefined; starts_at?: string | undefined; ends_at?: string | undefined; ... 8 more ...; staff_name?: string | undefined; }' is not assignable to parameter of type '{ id?: string | undefined; org_id?: string | undefined; athlete_id?: string | undefined; trainer_id?: string | undefined; starts_at?: string | undefined; ends_at?: string | undefined; ... 9 more ...; updated_at?: string | undefined; }'.
Types of property 'location' are incompatible.
Type 'string | null | undefined' is not assignable to type 'string | undefined'.
Type 'null' is not assignable to type 'string | undefined'.

160 const { error } = await supabase.from('appointments').update(updateData).in('id', seriesIds)
~~~~~~~~~~

src/lib/recurrence-management.ts:190:64 - error TS2345: Argument of type '{ id?: string | undefined; org_id?: string | undefined; athlete_id?: string | undefined; staff_id?: string | undefined; starts_at?: string | undefined; ends_at?: string | undefined; ... 8 more ...; staff_name?: string | undefined; }' is not assignable to parameter of type '{ id?: string | undefined; org_id?: string | undefined; athlete_id?: string | undefined; trainer_id?: string | undefined; starts_at?: string | undefined; ends_at?: string | undefined; ... 9 more ...; updated_at?: string | undefined; }'.
Types of property 'location' are incompatible.
Type 'string | null | undefined' is not assignable to type 'string | undefined'.
Type 'null' is not assignable to type 'string | undefined'.

190 const { error } = await supabase.from('appointments').update(updateData).in('id', futureIds)
~~~~~~~~~~

src/lib/streak-calculator.ts:105:13 - error TS2769: No overload matches this call.
Overload 1 of 2, '(relation: "appointments" | "chat_messages" | "cliente_tags" | "documents" | "exercises" | "inviti_atleti" | "lesson_counters" | "notifications" | "user_push_tokens" | "payments" | "profiles" | "roles" | "workout_stats_mensili"): PostgrestQueryBuilder<...>', gave the following error.
Argument of type '"workout_logs"' is not assignable to parameter of type '"appointments" | "chat_messages" | "cliente_tags" | "documents" | "exercises" | "inviti_atleti" | "lesson_counters" | "notifications" | "user_push_tokens" | "payments" | "profiles" | "roles" | "workout_stats_mensili"'.
Overload 2 of 2, '(relation: never): PostgrestQueryBuilder<{ PostgrestVersion: "12"; }, { Tables: { appointments: { Row: { id: string; org_id: string; athlete_id: string; trainer_id: string; starts_at: string; ends_at: string; status: "attivo" | ... 2 more ... | "in_corso"; ... 8 more ...; updated_at?: string | undefined; }; Insert: { ...; }; Update: { ...; }; Relationships: []; }; ... 11 more ...; workout_stats_mensili: { ...; }; }; Views: {}; Functions: {}; Enums: {}; CompositeTypes: {}; }, never, never, never>', gave the following error.
Argument of type '"workout_logs"' is not assignable to parameter of type 'never'.

105 .from('workout_logs')
~~~~~~~~~~~~~~

src/lib/streak-calculator.ts:113:7 - error TS2304: Cannot find name 'logger'.

113 logger.error('Errore query workout_logs per streak', error, { athleteId })
~~~~~~

src/lib/streak-calculator.ts:117:32 - error TS2345: Argument of type '(SelectQueryError<"column 'data' does not exist on 'appointments'."> | SelectQueryError<"column 'data' does not exist on 'chat_messages'."> | ... 10 more ... | SelectQueryError<...>)[]' is not assignable to parameter of type '{ data: string | Date | null; stato?: string | null | undefined; }[]'.
Type 'SelectQueryError<"column 'data' does not exist on 'appointments'."> | SelectQueryError<"column 'data' does not exist on 'chat_messages'."> | ... 10 more ... | SelectQueryError<...>' is not assignable to type '{ data: string | Date | null; stato?: string | null | undefined; }'.
Property 'data' is missing in type '{ error: true; } & String' but required in type '{ data: string | Date | null; stato?: string | null | undefined; }'.

117 return calculateStreakDays(workoutLogs || [])
~~~~~~~~~~~~~~~~~

src/lib/streak-calculator.ts:10:24
10 workoutLogs: Array<{ data: string | Date | null; stato?: string | null }>,
~~~~
'data' is declared here.

src/lib/streak-calculator.ts:119:5 - error TS2304: Cannot find name 'logger'.

119 logger.error('Errore calcolo streak', err, { athleteId })
~~~~~~

src/lib/supabase/client.ts:69:7 - error TS2554: Expected 1-2 arguments, but got 3.

69 { url: url.substring(0, 30) },
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

src/lib/supabase/client.ts:69:14 - error TS18048: 'url' is possibly 'undefined'.

69 { url: url.substring(0, 30) },
~~~

src/lib/supabase/client.ts:87:93 - error TS2554: Expected 1-2 arguments, but got 3.

87 logger.warn('Nessun token di accesso disponibile per impostare il contesto', undefined, {
~
88 role,

```
89       org_id,
```

90 })

```

src/lib/supabase/client.ts:106:80 - error TS2554: Expected 1-2 arguments, but got 3.

106       logger.warn('Impossibile sincronizzare il contesto Supabase', undefined, {
                                                                                ~
107         role,
 ~~~~~~~~~~~~~
...
109         status: response.status,
 ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
110       })
 ~~~~~~~

src/lib/supabase/client.ts:113:75 - error TS2554: Expected 1-2 arguments, but got 3.

113     logger.warn('Errore durante la sincronizzazione del contesto', error, { role, org_id })
                                                                           ~~~~~~~~~~~~~~~~

src/lib/supabase/client.ts:138:57 - error TS2345: Argument of type 'unknown' is not assignable to parameter of type 'Record<string, unknown> | undefined'.

138     logger.warn('Errore durante la decodifica del JWT', error)
                                                         ~~~~~

src/lib/supabase/server.ts:31:65 - error TS2554: Expected 1-2 arguments, but got 3.

31           logger.warn('Impossibile impostare il cookie', error, { cookieName: name })
                                                                ~~~~~~~~~~~~~~~~~~~~

src/lib/supabase/server.ts:42:84 - error TS2554: Expected 1-2 arguments, but got 3.

42             logger.warn('Impossibile rimuovere il cookie', fallbackError ?? error, {
                                                                                   ~
43               cookieName: name,
```

44 })

```

src/lib/supabase/verify-connection.ts:96:59 - error TS2554: Expected 1-2 arguments, but got 3.

96   logger.info('Verifica Connessione Supabase', undefined, {
                                                           ~
97     connected: status.connected,
 ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
...
102     details: status.details,
 ~~~~~~~~~~~~~~~~~~~~~~~~~~~~
103   })
 ~~~

src/lib/utils/athlete-profile-form.ts:23:49 - error TS2339: Property 'errors' does not exist on type 'ZodError<T>'.

23       const firstError = validationResult.error.errors[0]
                                                ~~~~~~

src/lib/utils/handle-pt-profile-save.ts:44:7 - error TS2304: Cannot find name 'logger'.

44       logger.error('Errore nel salvare il profilo', error, { userId })
      ~~~~~~

src/lib/utils/handle-pt-profile-save.ts:50:5 - error TS2304: Cannot find name 'logger'.

50     logger.error('Errore nel salvare il profilo', error, { userId })
    ~~~~~~

src/lib/validations/appointment.ts:12:13 - error TS2769: No overload matches this call.
Overload 1 of 2, '(values: readonly ["allenamento", "cardio", "check", "consulenza", "prima_visita", "riunione", "massaggio", "nutrizionista"], params?: string | { error?: string | $ZodErrorMap<$ZodIssueInvalidValue<unknown>> | undefined; message?: string | undefined; } | undefined): ZodEnum<...>', gave the following error.
 Object literal may only specify known properties, and 'errorMap' does not exist in type '{ error?: string | $ZodErrorMap<$ZodIssueInvalidValue<unknown>> | undefined; message?: string | undefined; }'.
Overload 2 of 2, '(entries: Readonly<Record<string, EnumValue>>, params?: string | { error?: string | $ZodErrorMap<$ZodIssueInvalidValue<unknown>> | undefined; message?: string | undefined; } | undefined): ZodEnum<...>', gave the following error.
 Argument of type 'string[]' is not assignable to parameter of type 'Readonly<Record<string, EnumValue>>'.
   Index signature for type 'string' is missing in type 'string[]'.

12     type: z.enum(
            ~~~~


src/providers/auth-provider.tsx:29:25 - error TS2352: Conversion of type 'Error' to type 'Record<string, unknown>' may be a mistake because neither type sufficiently overlaps with the other. If this was intentional, convert the expression to 'unknown' first.
Index signature for type 'string' is missing in type 'Error'.

29             acc[key] = (err as Record<string, unknown>)[key]
                        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

src/providers/auth-provider.tsx:464:81 - error TS2554: Expected 1-2 arguments, but got 3.

464           logger.warn('Errore caricamento profilo in onAuthStateChange', error, {
                                                                                 ~
465             errorDetails,
 ~~~~~~~~~~~~~~~~~~~~~~~~~
...
468             userId: session.user.id,
 ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
469           })
 ~~~~~~~~~~~

src/types/athlete-profile.schema.ts:521:38 - error TS2554: Expected 2-3 arguments, but got 1.

521 export const metricaCustomSchema = z.record(z.unknown())
                                      ~~~~~~

node_modules/zod/v4/classic/schemas.d.cts:482:107
 482 export declare function record<Key extends core.$ZodRecordKey, Value extends core.SomeType>(keyType: Key, valueType: Value, params?: string | core.$ZodRecordParams): ZodRecord<Key, Value>;
                                                                                                               ~~~~~~~~~~~~~~~~
 An argument for 'valueType' was not provided.

src/types/athlete-profile.schema.ts:603:41 - error TS2554: Expected 2-3 arguments, but got 1.

603 export const insightAggregatoSchema = z.record(z.unknown())
                                         ~~~~~~

node_modules/zod/v4/classic/schemas.d.cts:482:107
 482 export declare function record<Key extends core.$ZodRecordKey, Value extends core.SomeType>(keyType: Key, valueType: Value, params?: string | core.$ZodRecordParams): ZodRecord<Key, Value>;
                                                                                                               ~~~~~~~~~~~~~~~~
 An argument for 'valueType' was not provided.

tests/e2e/chat-flow.spec.ts:104:93 - error TS2345: Argument of type '{ min: number; }' is not assignable to parameter of type 'number'.

104       await expect(page.locator('[data-message], .message, [role="listitem"]')).toHaveCount({
                                                                                             ~
105         min: 0,
 ~~~~~~~~~~~~~~~
106       })
 ~~~~~~~

tests/e2e/chat-flow.spec.ts:169:74 - error TS2345: Argument of type '{ min: number; }' is not assignable to parameter of type 'number'.

169       await expect(page.locator('[data-message], .message')).toHaveCount({ min: 1 })
                                                                          ~~~~~~~~~~

tests/e2e/performance.spec.ts:117:56 - error TS2345: Argument of type '{ min: number; }' is not assignable to parameter of type 'number'.

117     await expect(page.locator('tbody tr')).toHaveCount({ min: 0 })
                                                        ~~~~~~~~~~

tests/integration/auth-provider.test.tsx:34:33 - error TS2304: Cannot find name 'useAuth'.

34       const { user, loading } = useAuth()
                                ~~~~~~~

tests/integration/hooks.test.tsx:5:24 - error TS2307: Cannot find module '@/hooks/useApi' or its corresponding type declarations.

5 import { useApi } from '@/hooks/useApi'
                      ~~~~~~~~~~~~~~~~

tests/integration/hooks.test.tsx:33:36 - error TS2339: Property 'signIn' does not exist on type 'AuthContext'.

33       expect(typeof result.current.signIn).toBe('function')
                                   ~~~~~~

tests/integration/hooks.test.tsx:34:36 - error TS2339: Property 'signOut' does not exist on type 'AuthContext'.

34       expect(typeof result.current.signOut).toBe('function')
                                   ~~~~~~~

tests/integration/hooks.test.tsx:45:36 - error TS2339: Property 'toggleTheme' does not exist on type 'ThemeContextType'.

45       expect(typeof result.current.toggleTheme).toBe('function')
                                   ~~~~~~~~~~~

tests/security/athlete-profile-security.test.ts:102:43 - error TS2339: Property 'errors' does not exist on type 'ZodError<{ user_id: string; nome: string; cognome: string; email: string; created_at: string; updated_at: string; telefono?: string | null | undefined; data_nascita?: string | null | undefined; sesso?: "altro" | ... 4 more ... | undefined; ... 12 more ...; gruppo_sanguigno?: string | ... 1 more ... | undefined; }>'.

102           const emailError = result.error.errors.find((e) => e.path.includes('email'))
                                           ~~~~~~

tests/security/athlete-profile-security.test.ts:102:56 - error TS7006: Parameter 'e' implicitly has an 'any' type.

102           const emailError = result.error.errors.find((e) => e.path.includes('email'))
                                                        ~

tests/security/athlete-profile-security.test.ts:124:44 - error TS2339: Property 'errors' does not exist on type 'ZodError<{ user_id: string; nome: string; cognome: string; email: string; created_at: string; updated_at: string; telefono?: string | null | undefined; data_nascita?: string | null | undefined; sesso?: "altro" | ... 4 more ... | undefined; ... 12 more ...; gruppo_sanguigno?: string | ... 1 more ... | undefined; }>'.

124           const heightError = result.error.errors.find((e) => e.path.includes('altezza_cm'))
                                            ~~~~~~

tests/security/athlete-profile-security.test.ts:124:57 - error TS7006: Parameter 'e' implicitly has an 'any' type.

124           const heightError = result.error.errors.find((e) => e.path.includes('altezza_cm'))
                                                         ~

tests/unit/analytics.test.ts:54:3 - error TS2304: Cannot find name 'beforeEach'.

54   beforeEach(() => {
  ~~~~~~~~~~

tests/unit/fetch-with-cache.test.ts:23:63 - error TS2559: Type '60000' has no properties in common with type 'FetchWithCacheOptions'.

23       const result = await fetchWithCache('test-key', mockFn, 60000)
                                                              ~~~~~

tests/unit/fetch-with-cache.test.ts:70:58 - error TS2345: Argument of type '{ id: string; org_id: string; athlete_id: string; trainer_id: string; date: string; time_start: string; time_end: string; status: string; type: string; note: string; created_at: string; updated_at: null; }[]' is not assignable to parameter of type '{ org_id: string | null; athlete_id: string; cancelled_at: string | null; created_at: string | null; ends_at: string; id: string; location: string | null; notes: string | null; recurrence_rule: string | null; ... 7 more ...; updated_at: string | null; }[]'.
Type '{ id: string; org_id: string; athlete_id: string; trainer_id: string; date: string; time_start: string; time_end: string; status: string; type: string; note: string; created_at: string; updated_at: null; }' is missing the following properties from type '{ org_id: string | null; athlete_id: string; cancelled_at: string | null; created_at: string | null; ends_at: string; id: string; location: string | null; notes: string | null; recurrence_rule: string | null; ... 7 more ...; updated_at: string | null; }': cancelled_at, ends_at, location, notes, and 5 more.

70       vi.mocked(getAppointmentsCached).mockResolvedValue(mockAppointments)
                                                         ~~~~~~~~~~~~~~~~

tests/unit/hooks.test.tsx:3:24 - error TS2307: Cannot find module '@/hooks/useApi' or its corresponding type declarations.

3 import { useApi } from '@/hooks/useApi'
                      ~~~~~~~~~~~~~~~~

tests/unit/realtime-hooks.test.tsx:6:3 - error TS2305: Module '"@/hooks/useRealtimeChannel"' has no exported member 'useNotifications'.

6   useNotifications,
 ~~~~~~~~~~~~~~~~

tests/unit/realtime-hooks.test.tsx:33:43 - error TS2345: Argument of type '"test-table"' is not assignable to parameter of type '"appointments" | "chat_messages" | "cliente_tags" | "documents" | "exercises" | "inviti_atleti" | "lesson_counters" | "notifications" | "user_push_tokens" | "payments" | "profiles" | "roles" | "workout_stats_mensili"'.

33       renderHook(() => useRealtimeChannel('test-table', mockCallback, 'INSERT'))
                                          ~~~~~~~~~~~~

tests/unit/realtime-hooks.test.tsx:44:43 - error TS2345: Argument of type '"test-table"' is not assignable to parameter of type '"appointments" | "chat_messages" | "cliente_tags" | "documents" | "exercises" | "inviti_atleti" | "lesson_counters" | "notifications" | "user_push_tokens" | "payments" | "profiles" | "roles" | "workout_stats_mensili"'.

44       renderHook(() => useRealtimeChannel('test-table', mockCallback))
                                          ~~~~~~~~~~~~

tests/unit/realtime.test.ts:32:53 - error TS2345: Argument of type '{ on: Mock<any, any>; subscribe: Mock<any, any>; unsubscribe: Mock<any, any>; }' is not assignable to parameter of type 'RealtimeChannel'.
Type '{ on: Mock<any, any>; subscribe: Mock<any, any>; unsubscribe: Mock<any, any>; }' is missing the following properties from type 'RealtimeChannel': topic, params, socket, bindings, and 16 more.

32       vi.mocked(getRealtimeChannel).mockReturnValue(mockChannel)
                                                    ~~~~~~~~~~~

tests/unit/realtime.test.ts:48:39 - error TS2345: Argument of type '"test-table"' is not assignable to parameter of type '"appointments" | "chat_messages" | "cliente_tags" | "documents" | "exercises" | "inviti_atleti" | "lesson_counters" | "notifications" | "user_push_tokens" | "payments" | "profiles" | "roles" | "workout_stats_mensili"'.

48       const result = subscribeToTable('test-table', mockCallback, 'INSERT')
                                      ~~~~~~~~~~~~

tests/unit/realtime.test.ts:60:39 - error TS2345: Argument of type '"test-table"' is not assignable to parameter of type '"appointments" | "chat_messages" | "cliente_tags" | "documents" | "exercises" | "inviti_atleti" | "lesson_counters" | "notifications" | "user_push_tokens" | "payments" | "profiles" | "roles" | "workout_stats_mensili"'.

60       const result = subscribeToTable('test-table', mockCallback)
                                      ~~~~~~~~~~~~

tests/unit/types.test.ts:89:9 - error TS2353: Object literal may only specify known properties, and 'uploaded_by' does not exist in type 'Document'.

89         uploaded_by: 'test-staff-id',
        ~~~~~~~~~~~

tests/unit/types.test.ts:113:13 - error TS2741: Property 'muscle_group' is missing in type '{ id: string; org_id: string; name: string; category: string; description: string; image_url: string; difficulty: "media"; created_at: string; updated_at: string; }' but required in type 'Exercise'.

113       const exercise: Exercise = {
             ~~~~~~~~

src/types/exercise.ts:6:3
 6   muscle_group: string
     ~~~~~~~~~~~~
 'muscle_group' is declared here.

tests/unit/types.test.ts:139:9 - error TS2353: Object literal may only specify known properties, and 'trainer_id' does not exist in type 'Appointment'.

139         trainer_id: 'test-trainer-id',
         ~~~~~~~~~~

tests/unit/types.test.ts:152:26 - error TS2339: Property 'trainer_id' does not exist on type 'Appointment'.

152       expect(appointment.trainer_id).toBeDefined()
                          ~~~~~~~~~~

tests/unit/utils-functions.test.ts:23:63 - error TS2559: Type '60000' has no properties in common with type 'FetchWithCacheOptions'.

23       const result = await fetchWithCache('test-key', mockFn, 60000)
                                                              ~~~~~

tests/unit/utils-functions.test.ts:70:58 - error TS2345: Argument of type '{ id: string; org_id: string; athlete_id: string; trainer_id: string; date: string; time_start: string; time_end: string; status: string; type: string; note: string; created_at: string; updated_at: null; }[]' is not assignable to parameter of type '{ org_id: string | null; athlete_id: string; cancelled_at: string | null; created_at: string | null; ends_at: string; id: string; location: string | null; notes: string | null; recurrence_rule: string | null; ... 7 more ...; updated_at: string | null; }[]'.
Type '{ id: string; org_id: string; athlete_id: string; trainer_id: string; date: string; time_start: string; time_end: string; status: string; type: string; note: string; created_at: string; updated_at: null; }' is missing the following properties from type '{ org_id: string | null; athlete_id: string; cancelled_at: string | null; created_at: string | null; ends_at: string; id: string; location: string | null; notes: string | null; recurrence_rule: string | null; ... 7 more ...; updated_at: string | null; }': cancelled_at, ends_at, location, notes, and 5 more.

70       vi.mocked(getAppointmentsCached).mockResolvedValue(mockAppointments)
                                                         ~~~~~~~~~~~~~~~~


Found 1495 errors in 176 files.

Errors  Files
 23  src/app/api/admin/statistics/route.ts:85
  3  src/app/api/admin/users/route.ts:151
  7  src/app/api/communications/check-stuck/route.ts:33
  1  src/app/api/communications/count-recipients/route.ts:32
  1  src/app/api/communications/list-athletes/route.ts:30
  3  src/app/api/communications/list/route.ts:31
 20  src/app/api/communications/recipients/route.ts:30
 22  src/app/api/communications/send/route.ts:45
  2  src/app/api/cron/notifications/route.ts:54
  1  src/app/api/dashboard/appointments/route.ts:25
  2  src/app/api/exercises/route.ts:312
  7  src/app/api/settings/route.ts:57
  5  src/app/api/track/email-open/[id]/route.ts:46
 17  src/app/api/webhooks/email/route.ts:68
 12  src/app/api/webhooks/sms/route.ts:72
  2  src/app/dashboard/_components/new-appointment-button.tsx:16
  1  src/app/dashboard/_components/upcoming-appointments.ts:68
 11  src/app/dashboard/abbonamenti/page.tsx:106
  1  src/app/dashboard/atleti/[id]/chat/page.tsx:58
  2  src/app/dashboard/comunicazioni/page.tsx:136
  1  src/app/dashboard/documenti/page.tsx:69
  1  src/app/dashboard/impostazioni/page.tsx:425
  6  src/app/dashboard/page.tsx:189
  1  src/app/dashboard/schede/[id]/modifica/page.tsx:39
  6  src/app/home/allenamenti/oggi/page.tsx:253
  1  src/app/home/appuntamenti/page.tsx:6
  1  src/app/home/documenti/page.tsx:229
  2  src/app/home/pagamenti/page.tsx:75
  1  src/app/home/page.tsx:85
  4  src/app/home/profilo/page.tsx:84
  1  src/app/home/progressi/foto/page.tsx:480
  2  src/app/home/progressi/nuovo/page.tsx:40
  1  src/app/registrati/page.tsx:98
  6  src/app/welcome/page.tsx:78
  1  src/components/appointments/appointment-conflict-alert.tsx:5
  5  src/components/appointments/appointment-validation.tsx:10
 25  src/components/athlete/progress-charts.tsx:158
  1  src/components/athlete/progress-flash.tsx:182
  1  src/components/calendar/appointment-detail.tsx:137
  1  src/components/calendar/appointment-form.tsx:159
  1  src/components/calendar/appointments-table.tsx:123
 10  src/components/calendar/calendar-view.tsx:91
 51  src/components/communications/communication-card.tsx:41
  6  src/components/communications/communications-list.tsx:33
  1  src/components/communications/recipients-detail-modal.tsx:49
  4  src/components/dashboard/admin/admin-organizations-content.tsx:47
 25  src/components/dashboard/admin/admin-statistics-content.tsx:16
  1  src/components/dashboard/admin/admin-users-content.tsx:142
  1  src/components/dashboard/agenda-timeline.tsx:70
  1  src/components/dashboard/appointment-modal.tsx:154
  2  src/components/dashboard/assign-workout-modal.tsx:84
  3  src/components/dashboard/athlete-profile/athlete-administrative-tab.tsx:63
  3  src/components/dashboard/athlete-profile/athlete-ai-data-tab.tsx:51
  6  src/components/dashboard/athlete-profile/athlete-fitness-tab.tsx:49
  1  src/components/dashboard/athlete-profile/athlete-massage-tab.tsx:63
  1  src/components/dashboard/athlete-profile/athlete-medical-tab.tsx:67
  6  src/components/dashboard/athlete-profile/athlete-motivational-tab.tsx:48
  7  src/components/dashboard/athlete-profile/athlete-nutrition-tab.tsx:48
  1  src/components/dashboard/athlete-profile/athlete-profile-tabs-optimized.tsx:344
 11  src/components/dashboard/athlete-profile/athlete-smart-tracking-tab.tsx:75
  5  src/components/dashboard/exercise-form-modal.tsx:167
 11  src/components/dashboard/nuovo-pagamento-modal.tsx:170
  3  src/components/dashboard/payment-form-modal.tsx:94
 21  src/components/dashboard/progress-charts.tsx:132
  3  src/components/dashboard/sidebar.tsx:281
 42  src/components/dashboard/stats-charts.tsx:18
  1  src/components/documents/document-uploader-modal.tsx:109
  3  src/components/settings/settings-account-tab.tsx:55
  1  src/components/settings/two-factor-setup.tsx:174
 11  src/components/shared/analytics/distribution-chart.tsx:5
 23  src/components/shared/analytics/trend-chart.tsx:29
  1  src/components/shared/dashboard/sidebar.tsx:67
  1  src/components/ui/error-boundary.tsx:80
  5  src/components/workout/workout-wizard.tsx:18
  1  src/hooks/__tests__/use-appointments.test.ts:127
  1  src/hooks/__tests__/use-payments.test.ts:129
 11  src/hooks/appointments/use-appointments.ts:101
  2  src/hooks/athlete-profile/__tests__/use-athlete-administrative.test.ts:207
  2  src/hooks/athlete-profile/__tests__/use-athlete-ai-data.test.ts:12
  1  src/hooks/athlete-profile/__tests__/use-athlete-fitness.test.ts:210
  2  src/hooks/athlete-profile/__tests__/use-athlete-massage.test.ts:132
  3  src/hooks/athlete-profile/__tests__/use-athlete-nutrition.test.ts:137
  1  src/hooks/athlete-profile/__tests__/use-athlete-smart-tracking.test.ts:12
 35  src/hooks/athlete-profile/use-athlete-administrative.ts:49
  4  src/hooks/athlete-profile/use-athlete-ai-data-form.ts:57
 28  src/hooks/athlete-profile/use-athlete-ai-data.ts:47
 48  src/hooks/athlete-profile/use-athlete-anagrafica.ts:15
  3  src/hooks/athlete-profile/use-athlete-fitness-form.ts:85
 29  src/hooks/athlete-profile/use-athlete-fitness.ts:45
  1  src/hooks/athlete-profile/use-athlete-massage-form.ts:157
 21  src/hooks/athlete-profile/use-athlete-massage.ts:45
  6  src/hooks/athlete-profile/use-athlete-medical-form.ts:83
 38  src/hooks/athlete-profile/use-athlete-medical.ts:49
  4  src/hooks/athlete-profile/use-athlete-motivational-form.ts:75
 25  src/hooks/athlete-profile/use-athlete-motivational.ts:48
  5  src/hooks/athlete-profile/use-athlete-nutrition-form.ts:83
 29  src/hooks/athlete-profile/use-athlete-nutrition.ts:45
  9  src/hooks/athlete-profile/use-athlete-profile-data.ts:141
 51  src/hooks/athlete-profile/use-athlete-smart-tracking.ts:52
  8  src/hooks/athlete-profile/use-athlete-tab-prefetch.ts:52
  6  src/hooks/calendar/use-calendar-page.ts:31
  5  src/hooks/chat/use-chat-conversations.ts:64
 13  src/hooks/chat/use-chat-messages.ts:74
 14  src/hooks/communications/use-communications-page.tsx:56
 10  src/hooks/home-profile/use-athlete-stats.ts:64
  4  src/hooks/use-allenamenti.ts:162
 11  src/hooks/use-appointments.ts:74
  8  src/hooks/use-clienti.ts:9
 29  src/hooks/use-communications.ts:11
  1  src/hooks/use-documents.ts:61
  3  src/hooks/use-invitations.ts:153
  6  src/hooks/use-lesson-counters.ts:86
  2  src/hooks/use-notifications.ts:55
  5  src/hooks/use-payments-stats.ts:57
 10  src/hooks/use-payments.ts:105
 31  src/hooks/use-progress-analytics.ts:40
 11  src/hooks/use-progress-optimized.ts:21
  2  src/hooks/use-progress-photos.ts:89
  4  src/hooks/use-progress-reminders.ts:85
 24  src/hooks/use-progress.ts:31
  4  src/hooks/use-pt-profile.ts:71
  1  src/hooks/use-pt-settings.ts:104
  2  src/hooks/use-push-notifications.ts:136
 30  src/hooks/use-user-settings.ts:91
 22  src/hooks/workout-plans/use-workout-plans.ts:123
  7  src/hooks/workout/use-workout-detail.ts:99
  2  src/hooks/workout/use-workout-wizard.ts:88
  6  src/hooks/workouts/use-workout-mutations.ts:21
  7  src/hooks/workouts/use-workout-plans-list.ts:37
  3  src/hooks/workouts/use-workout-session.ts:69
  7  src/hooks/workouts/use-workout-stats.ts:34
  1  src/lib/analytics-export.ts:4
 35  src/lib/analytics.ts:166
  1  src/lib/appointment-utils.ts:48
  1  src/lib/athlete-profile/handle-athlete-profile-save.ts:52
  7  src/lib/audit.ts:37
 15  src/lib/communications/email-batch-processor.ts:13
  1  src/lib/communications/email-resend-client.ts:42
 21  src/lib/communications/email.ts:16
 36  src/lib/communications/push.ts:15
  8  src/lib/communications/recipients.ts:98
 17  src/lib/communications/scheduler.ts:60
 55  src/lib/communications/service.ts:13
 41  src/lib/communications/sms.ts:14
 10  src/lib/documents.ts:94
  1  src/lib/dom-protection.ts:29
  2  src/lib/exercises-storage.ts:80
  5  src/lib/export-payments.ts:16
  2  src/lib/export-utils.ts:12
  1  src/lib/fetchWithCache.ts:92
  2  src/lib/haptics.ts:36
  2  src/lib/notifications/athlete-registration.ts:94
 25  src/lib/notifications/push.ts:103
 10  src/lib/notifications/scheduler.ts:34
  5  src/lib/recurrence-management.ts:26
  4  src/lib/streak-calculator.ts:105
  6  src/lib/supabase/client.ts:69
  2  src/lib/supabase/server.ts:31
  1  src/lib/supabase/verify-connection.ts:96
  1  src/lib/utils/athlete-profile-form.ts:23
  2  src/lib/utils/handle-pt-profile-save.ts:44
  1  src/lib/validations/appointment.ts:12
  2  src/providers/auth-provider.tsx:29
  2  src/types/athlete-profile.schema.ts:521
  2  tests/e2e/chat-flow.spec.ts:104
  1  tests/e2e/performance.spec.ts:117
  1  tests/integration/auth-provider.test.tsx:34
  4  tests/integration/hooks.test.tsx:5
  4  tests/security/athlete-profile-security.test.ts:102
  1  tests/unit/analytics.test.ts:54
  2  tests/unit/fetch-with-cache.test.ts:23
  1  tests/unit/hooks.test.tsx:3
  3  tests/unit/realtime-hooks.test.tsx:6
  3  tests/unit/realtime.test.ts:32
  4  tests/unit/types.test.ts:89
  2  tests/unit/utils-functions.test.ts:23
PS C:\Users\d.kushniriuk\Desktop\22 Club\22club-setup V1 online>



PS C:\Users\d.kushniriuk\Desktop\22 Club\22club-setup V1 online> npm run lint

> 22club-setup@0.1.0 lint
> eslint .


C:\Users\d.kushniriuk\Desktop\22 Club\22club-setup V1 online\scripts\analyze-supabase-complete.ts
170:15  warning  'data' is assigned a value but never used  @typescript-eslint/no-unused-vars
171:28  warning  Unexpected any. Specify a different type   @typescript-eslint/no-explicit-any
204:14  warning  'error' is defined but never used          @typescript-eslint/no-unused-vars
248:54  warning  Unexpected any. Specify a different type   @typescript-eslint/no-explicit-any
279:14  warning  'error' is defined but never used          @typescript-eslint/no-unused-vars
300:59  warning  Unexpected any. Specify a different type   @typescript-eslint/no-explicit-any
313:14  warning  'error' is defined but never used          @typescript-eslint/no-unused-vars
326:15  warning  'data' is assigned a value but never used  @typescript-eslint/no-unused-vars
326:62  warning  Unexpected any. Specify a different type   @typescript-eslint/no-explicit-any
347:14  warning  'error' is defined but never used          @typescript-eslint/no-unused-vars
364:14  warning  Unexpected any. Specify a different type   @typescript-eslint/no-explicit-any
379:16  warning  'error' is defined but never used          @typescript-eslint/no-unused-vars
423:12  warning  'error' is defined but never used          @typescript-eslint/no-unused-vars

C:\Users\d.kushniriuk\Desktop\22 Club\22club-setup V1 online\scripts\check-table-columns.ts
71:29  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
73:12  warning  'error' is defined but never used         @typescript-eslint/no-unused-vars
80:26  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any

C:\Users\d.kushniriuk\Desktop\22 Club\22club-setup V1 online\scripts\check-tables-existence.ts
57:26  warning  Unexpected any. Specify a different type         @typescript-eslint/no-explicit-any
70:12  warning  'error' is defined but never used                @typescript-eslint/no-unused-vars
75:16  warning  'getTableColumns' is defined but never used      @typescript-eslint/no-unused-vars
89:21  warning  'directData' is assigned a value but never used  @typescript-eslint/no-unused-vars
90:28  warning  Unexpected any. Specify a different type         @typescript-eslint/no-explicit-any
101:28  warning  Unexpected any. Specify a different type         @typescript-eslint/no-explicit-any
136:36  warning  Unexpected any. Specify a different type         @typescript-eslint/no-explicit-any

C:\Users\d.kushniriuk\Desktop\22 Club\22club-setup V1 online\scripts\code-review-check.js
92:16  warning  'error' is defined but never used  @typescript-eslint/no-unused-vars
112:12  warning  'error' is defined but never used  @typescript-eslint/no-unused-vars
121:12  warning  'error' is defined but never used  @typescript-eslint/no-unused-vars

C:\Users\d.kushniriuk\Desktop\22 Club\22club-setup V1 online\scripts\create-test-athletes.ts
165:23  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any

C:\Users\d.kushniriuk\Desktop\22 Club\22club-setup V1 online\scripts\create-workout-script.ts
63:6  warning  'WorkoutRecord' is defined but never used  @typescript-eslint/no-unused-vars

C:\Users\d.kushniriuk\Desktop\22 Club\22club-setup V1 online\scripts\export-users.ts
78:11  warning  'userIds' is assigned a value but never used  @typescript-eslint/no-unused-vars

C:\Users\d.kushniriuk\Desktop\22 Club\22club-setup V1 online\scripts\test-communications-api.ts
23:13  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
29:60  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any

C:\Users\d.kushniriuk\Desktop\22 Club\22club-setup V1 online\scripts\test-communications-providers.ts
82:11  warning  'smsModule' is assigned a value but never used  @typescript-eslint/no-unused-vars

C:\Users\d.kushniriuk\Desktop\22 Club\22club-setup V1 online\scripts\verify-all-services.ts
23:5   error    'envVars' is never reassigned. Use 'const' instead  prefer-const
191:13  warning  'profiles' is assigned a value but never used       @typescript-eslint/no-unused-vars
233:16  warning  'err' is defined but never used                     @typescript-eslint/no-unused-vars
245:19  warning  'testQuery' is assigned a value but never used      @typescript-eslint/no-unused-vars

C:\Users\d.kushniriuk\Desktop\22 Club\22club-setup V1 online\scripts\verify-and-save.ts
24:5   error    'envVars' is never reassigned. Use 'const' instead  prefer-const
71:20  warning  'e' is defined but never used                       @typescript-eslint/no-unused-vars
166:15  warning  'session' is assigned a value but never used        @typescript-eslint/no-unused-vars

C:\Users\d.kushniriuk\Desktop\22 Club\22club-setup V1 online\scripts\verify-communications-providers.ts
67:11  warning  'resend' is assigned a value but never used  @typescript-eslint/no-unused-vars

C:\Users\d.kushniriuk\Desktop\22 Club\22club-setup V1 online\scripts\verify-profiles.ts
50:11  warning  'ProfileStats' is defined but never used  @typescript-eslint/no-unused-vars

C:\Users\d.kushniriuk\Desktop\22 Club\22club-setup V1 online\scripts\verify-rls-with-auth.ts
50:26  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any

C:\Users\d.kushniriuk\Desktop\22 Club\22club-setup V1 online\scripts\verify-services-simple.ts
16:5   error    'envVars' is never reassigned. Use 'const' instead  prefer-const
64:20  warning  'e' is defined but never used                       @typescript-eslint/no-unused-vars
185:13  warning  'profiles' is assigned a value but never used       @typescript-eslint/no-unused-vars
210:19  warning  'testQuery' is assigned a value but never used      @typescript-eslint/no-unused-vars

C:\Users\d.kushniriuk\Desktop\22 Club\22club-setup V1 online\scripts\verify-supabase-config.ts
82:13  warning  'profiles' is assigned a value but never used   @typescript-eslint/no-unused-vars
125:19  warning  'testQuery' is assigned a value but never used  @typescript-eslint/no-unused-vars

C:\Users\d.kushniriuk\Desktop\22 Club\22club-setup V1 online\scripts\verify-supabase-data-deep.ts
62:26  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
113:48  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
133:30  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
171:49  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any

C:\Users\d.kushniriuk\Desktop\22 Club\22club-setup V1 online\scripts\verify-with-output.ts
21:5   error    'envVars' is never reassigned. Use 'const' instead  prefer-const
69:20  warning  'e' is defined but never used                       @typescript-eslint/no-unused-vars

C:\Users\d.kushniriuk\Desktop\22 Club\22club-setup V1 online\src\app\api\admin\roles\route.ts
15:27  warning  'request' is defined but never used       @typescript-eslint/no-unused-vars
65:19  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
109:23  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
128:19  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any

C:\Users\d.kushniriuk\Desktop\22 Club\22club-setup V1 online\src\app\api\admin\statistics\route.ts
 8:27  warning  'request' is defined but never used       @typescript-eslint/no-unused-vars
221:19  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any

C:\Users\d.kushniriuk\Desktop\22 Club\22club-setup V1 online\src\app\api\admin\users\route.ts
31:27  warning  'request' is defined but never used       @typescript-eslint/no-unused-vars
62:19  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
173:19  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
247:26  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
270:23  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
293:19  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
369:19  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any

C:\Users\d.kushniriuk\Desktop\22 Club\22club-setup V1 online\src\app\api\communications\list-athletes\route.ts
9:27  warning  'request' is defined but never used  @typescript-eslint/no-unused-vars

C:\Users\d.kushniriuk\Desktop\22 Club\22club-setup V1 online\src\app\api\exercises\route.ts
186:15  warning  'created_by' is assigned a value but never used  @typescript-eslint/no-unused-vars

C:\Users\d.kushniriuk\Desktop\22 Club\22club-setup V1 online\src\app\api\settings\route.ts
43:27  warning  'request' is defined but never used  @typescript-eslint/no-unused-vars

C:\Users\d.kushniriuk\Desktop\22 Club\22club-setup V1 online\src\app\api\webhooks\email\route.ts
57:11  warning  'recipientEmail' is assigned a value but never used  @typescript-eslint/no-unused-vars

C:\Users\d.kushniriuk\Desktop\22 Club\22club-setup V1 online\src\app\api\webhooks\sms\route.ts
56:11  warning  'to' is assigned a value but never used  @typescript-eslint/no-unused-vars

C:\Users\d.kushniriuk\Desktop\22 Club\22club-setup V1 online\src\app\dashboard\appuntamenti\page.tsx
22:5  warning  'staffId' is assigned a value but never used  @typescript-eslint/no-unused-vars

C:\Users\d.kushniriuk\Desktop\22 Club\22club-setup V1 online\src\app\dashboard\calendario\page.tsx
19:5  warning  'trainerId' is assigned a value but never used  @typescript-eslint/no-unused-vars

C:\Users\d.kushniriuk\Desktop\22 Club\22club-setup V1 online\src\app\dashboard\clienti\page.tsx
39:5  warning  'advancedFilters' is assigned a value but never used  @typescript-eslint/no-unused-vars

C:\Users\d.kushniriuk\Desktop\22 Club\22club-setup V1 online\src\app\dashboard\impostazioni\page.tsx
24:14  warning  'settingsLoading' is assigned a value but never used  @typescript-eslint/no-unused-vars

C:\Users\d.kushniriuk\Desktop\22 Club\22club-setup V1 online\src\app\dashboard\pagamenti\page.tsx
110:38  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any

C:\Users\d.kushniriuk\Desktop\22 Club\22club-setup V1 online\src\app\dashboard\profilo\page.tsx
13:10  warning  'LoadingState' is defined but never used           @typescript-eslint/no-unused-vars
96:9   warning  'handleLogout' is assigned a value but never used  @typescript-eslint/no-unused-vars
216:80  warning  Unexpected any. Specify a different type           @typescript-eslint/no-explicit-any

C:\Users\d.kushniriuk\Desktop\22 Club\22club-setup V1 online\src\app\dashboard\schede\[id]\modifica\page.tsx
75:6  warning  React Hook useMemo has an unnecessary dependency: 'athletes'. Either exclude it or remove the dependency array  react-hooks/exhaustive-deps

C:\Users\d.kushniriuk\Desktop\22 Club\22club-setup V1 online\src\app\dashboard\schede\nuova\page.tsx
23:42  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any

C:\Users\d.kushniriuk\Desktop\22 Club\22club-setup V1 online\src\app\home\layout.tsx
2:10  warning  'AthleteBackground' is defined but never used  @typescript-eslint/no-unused-vars

C:\Users\d.kushniriuk\Desktop\22 Club\22club-setup V1 online\src\app\home\progressi\foto\page.tsx
3:39  warning  'useCallback' is defined but never used          @typescript-eslint/no-unused-vars
46:44  warning  'totalCount' is assigned a value but never used  @typescript-eslint/no-unused-vars

C:\Users\d.kushniriuk\Desktop\22 Club\22club-setup V1 online\src\components\appointments\appointments-header.tsx
11:18  warning  'Calendar' is defined but never used          @typescript-eslint/no-unused-vars
28:3   warning  'onNewAppointment' is defined but never used  @typescript-eslint/no-unused-vars

C:\Users\d.kushniriuk\Desktop\22 Club\22club-setup V1 online\src\components\appointments\recurrence-selector.tsx
4:18  warning  'Calendar' is defined but never used  @typescript-eslint/no-unused-vars

C:\Users\d.kushniriuk\Desktop\22 Club\22club-setup V1 online\src\components\athlete\appointments-card.tsx
8:62  warning  'MapPin' is defined but never used                   @typescript-eslint/no-unused-vars
46:9   warning  'getTypeIcon' is assigned a value but never used     @typescript-eslint/no-unused-vars
86:9   warning  'getStatusBadge' is assigned a value but never used  @typescript-eslint/no-unused-vars

C:\Users\d.kushniriuk\Desktop\22 Club\22club-setup V1 online\src\components\calendar\calendar-header.tsx
9:11  warning  An empty interface declaration allows any non-nullish value, including literals like `0` and `""`.
- If that's what you want, disable this lint rule with an inline comment or configure the 'allowInterfaces' rule option.
- If you want a type meaning "any object", you probably want `object` instead.
- If you want a type meaning "any value", you probably want `unknown` instead  @typescript-eslint/no-empty-object-type

C:\Users\d.kushniriuk\Desktop\22 Club\22club-setup V1 online\src\components\communications\communication-card.tsx
12:10  warning  'Badge' is defined but never used
   @typescript-eslint/no-unused-vars
15:3   warning  'Bell' is defined but never used
   @typescript-eslint/no-unused-vars
17:3   warning  'MessageSquare' is defined but never used
   @typescript-eslint/no-unused-vars
22:3   warning  'AlertCircle' is defined but never used
   @typescript-eslint/no-unused-vars
91:6   warning  React Hook useCallback has a missing dependency: 'communication.id'. Either include it or remove the dependency array  react-hooks/exhaustive-deps

C:\Users\d.kushniriuk\Desktop\22 Club\22club-setup V1 online\src\components\communications\communications-list.tsx
55:3  warning  'onPageChange' is defined but never used  @typescript-eslint/no-unused-vars

C:\Users\d.kushniriuk\Desktop\22 Club\22club-setup V1 online\src\components\communications\recipients-detail-modal.tsx
81:6  warning  React Hook useEffect has a missing dependency: 'fetchRecipients'. Either include it or remove the dependency array
react-hooks/exhaustive-deps

C:\Users\d.kushniriuk\Desktop\22 Club\22club-setup V1 online\src\components\dashboard\admin\admin-dashboard-content.tsx
4:27  warning  'Settings' is defined but never used         @typescript-eslint/no-unused-vars
8:29  warning  'CardDescription' is defined but never used  @typescript-eslint/no-unused-vars

C:\Users\d.kushniriuk\Desktop\22 Club\22club-setup V1 online\src\components\dashboard\admin\admin-organizations-content.tsx
 4:21  warning  'Plus' is defined but never used
    @typescript-eslint/no-unused-vars
 4:33  warning  'Trash2' is defined but never used
    @typescript-eslint/no-unused-vars
21:10  warning  'notifySuccess' is defined but never used
    @typescript-eslint/no-unused-vars
39:6   warning  React Hook useEffect has a missing dependency: 'fetchOrganizations'. Either include it or remove the dependency array  react-hooks/exhaustive-deps
101:21  warning  Unexpected any. Specify a different type
    @typescript-eslint/no-explicit-any

C:\Users\d.kushniriuk\Desktop\22 Club\22club-setup V1 online\src\components\dashboard\admin\admin-roles-content.tsx
21:16  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
201:62  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
219:21  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
261:21  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any

C:\Users\d.kushniriuk\Desktop\22 Club\22club-setup V1 online\src\components\dashboard\admin\admin-statistics-content.tsx
4:33  warning  'FileText' is defined but never used      @typescript-eslint/no-unused-vars
87:21  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any

C:\Users\d.kushniriuk\Desktop\22 Club\22club-setup V1 online\src\components\dashboard\admin\admin-users-content.tsx
 4:28  warning  'Filter' is defined but never used        @typescript-eslint/no-unused-vars
 4:50  warning  'Eye' is defined but never used           @typescript-eslint/no-unused-vars
76:21  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
161:21  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any

C:\Users\d.kushniriuk\Desktop\22 Club\22club-setup V1 online\src\components\dashboard\admin\user-delete-dialog.tsx
43:54  warning  `'` can be escaped with `&apos;`, `&lsquo;`, `&#39;`, `&rsquo;`  react/no-unescaped-entities
44:14  warning  `'` can be escaped with `&apos;`, `&lsquo;`, `&#39;`, `&rsquo;`  react/no-unescaped-entities

C:\Users\d.kushniriuk\Desktop\22 Club\22club-setup V1 online\src\components\dashboard\admin\user-form-modal.tsx
 4:10  warning  'X' is defined but never used             @typescript-eslint/no-unused-vars
108:27  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
157:21  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any

C:\Users\d.kushniriuk\Desktop\22 Club\22club-setup V1 online\src\components\dashboard\athlete-profile\ai-data\ai-data-recommendations-section.tsx
50:60  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any

C:\Users\d.kushniriuk\Desktop\22 Club\22club-setup V1 online\src\components\dashboard\athlete-profile\athlete-administrative-tab.tsx
29:3   warning  'Upload' is defined but never used               @typescript-eslint/no-unused-vars
80:5   warning  'uploadFile' is assigned a value but never used  @typescript-eslint/no-unused-vars
176:51  warning  Unexpected any. Specify a different type         @typescript-eslint/no-explicit-any

C:\Users\d.kushniriuk\Desktop\22 Club\22club-setup V1 online\src\components\dashboard\athlete-profile\athlete-ai-data-tab.tsx
77:64  warning  `'` can be escaped with `&apos;`, `&lsquo;`, `&#39;`, `&rsquo;`  react/no-unescaped-entities

C:\Users\d.kushniriuk\Desktop\22 Club\22club-setup V1 online\src\components\dashboard\athlete-profile\athlete-anagrafica-tab.tsx
71:51  warning  `'` can be escaped with `&apos;`, `&lsquo;`, `&#39;`, `&rsquo;`  react/no-unescaped-entities

C:\Users\d.kushniriuk\Desktop\22 Club\22club-setup V1 online\src\components\dashboard\athlete-profile\athlete-massage-tab.tsx
92:47  warning  `'` can be escaped with `&apos;`, `&lsquo;`, `&#39;`, `&rsquo;`  react/no-unescaped-entities

C:\Users\d.kushniriuk\Desktop\22 Club\22club-setup V1 online\src\components\dashboard\athlete-profile\athlete-medical-tab.tsx
50:5   warning  'uploadFile' is assigned a value but never used                  @typescript-eslint/no-unused-vars
119:61  warning  `'` can be escaped with `&apos;`, `&lsquo;`, `&#39;`, `&rsquo;`  react/no-unescaped-entities
182:58  warning  Unexpected any. Specify a different type                         @typescript-eslint/no-explicit-any

C:\Users\d.kushniriuk\Desktop\22 Club\22club-setup V1 online\src\components\dashboard\athlete-profile\athlete-motivational-tab.tsx
82:52  warning  `'` can be escaped with `&apos;`, `&lsquo;`, `&#39;`, `&rsquo;`  react/no-unescaped-entities

C:\Users\d.kushniriuk\Desktop\22 Club\22club-setup V1 online\src\components\dashboard\athlete-profile\athlete-nutrition-tab.tsx
10:10  warning  'useToast' is defined but never used                             @typescript-eslint/no-unused-vars
68:58  warning  `'` can be escaped with `&apos;`, `&lsquo;`, `&#39;`, `&rsquo;`  react/no-unescaped-entities

C:\Users\d.kushniriuk\Desktop\22 Club\22club-setup V1 online\src\components\dashboard\athlete-profile\athlete-profile-tabs-optimized.tsx
 8:20  warning  'lazy' is defined but never used                @typescript-eslint/no-unused-vars
 8:60  warning  'useMemo' is defined but never used             @typescript-eslint/no-unused-vars
278:23  warning  'tabConfig' is assigned a value but never used  @typescript-eslint/no-unused-vars
279:23  warning  'isActive' is assigned a value but never used   @typescript-eslint/no-unused-vars
280:23  warning  'isLoaded' is assigned a value but never used   @typescript-eslint/no-unused-vars
337:21  warning  'isActive' is assigned a value but never used   @typescript-eslint/no-unused-vars

C:\Users\d.kushniriuk\Desktop\22 Club\22club-setup V1 online\src\components\dashboard\athlete-profile\fitness\fitness-injuries-section.tsx
35:3  warning  'infortuni' is defined but never used  @typescript-eslint/no-unused-vars

C:\Users\d.kushniriuk\Desktop\22 Club\22club-setup V1 online\src\components\dashboard\athlete-profile\motivational\motivational-abandonments-section.tsx
13:10  warning  'Badge' is defined but never used      @typescript-eslint/no-unused-vars
34:3   warning  'abbandoni' is defined but never used  @typescript-eslint/no-unused-vars

C:\Users\d.kushniriuk\Desktop\22 Club\22club-setup V1 online\src\components\dashboard\exercise-form-modal.tsx
26:3   warning  'formatFileSize' is defined but never used          @typescript-eslint/no-unused-vars
368:15  warning  'id' is assigned a value but never used             @typescript-eslint/no-unused-vars
368:19  warning  'created_at' is assigned a value but never used     @typescript-eslint/no-unused-vars
368:31  warning  'updated_at' is assigned a value but never used     @typescript-eslint/no-unused-vars
368:43  warning  'org_id' is assigned a value but never used         @typescript-eslint/no-unused-vars
368:51  warning  'thumbnail_url' is assigned a value but never used  @typescript-eslint/no-unused-vars

C:\Users\d.kushniriuk\Desktop\22 Club\22club-setup V1 online\src\components\invitations\qr-code.tsx
50:6  warning  React Hook useEffect has missing dependencies: 'athleteName' and 'invitationCode'. Either include them or remove the dependency array  react-hooks/exhaustive-deps

C:\Users\d.kushniriuk\Desktop\22 Club\22club-setup V1 online\src\components\settings\settings-account-tab.tsx
338:37  warning  `'` can be escaped with `&apos;`, `&lsquo;`, `&#39;`, `&rsquo;`  react/no-unescaped-entities

C:\Users\d.kushniriuk\Desktop\22 Club\22club-setup V1 online\src\components\shared\ui\transition-wrapper.tsx
 7:19  warning  Unexpected any. Specify a different type                                                                 @typescript-eslint/no-explicit-any
102:52  warning  Unexpected any. Specify a different type                                                                 @typescript-eslint/no-explicit-any
106:7   error    Do not assign to the variable `module`. See: https://nextjs.org/docs/messages/no-assign-module-variable  @next/next/no-assign-module-variable
150:52  warning  Unexpected any. Specify a different type                                                                 @typescript-eslint/no-explicit-any
154:7   error    Do not assign to the variable `module`. See: https://nextjs.org/docs/messages/no-assign-module-variable  @next/next/no-assign-module-variable
196:52  warning  Unexpected any. Specify a different type                                                                 @typescript-eslint/no-explicit-any
200:7   error    Do not assign to the variable `module`. See: https://nextjs.org/docs/messages/no-assign-module-variable  @next/next/no-assign-module-variable
243:52  warning  Unexpected any. Specify a different type                                                                 @typescript-eslint/no-explicit-any
247:7   error    Do not assign to the variable `module`. See: https://nextjs.org/docs/messages/no-assign-module-variable  @next/next/no-assign-module-variable
288:52  warning  Unexpected any. Specify a different type                                                                 @typescript-eslint/no-explicit-any
292:7   error    Do not assign to the variable `module`. See: https://nextjs.org/docs/messages/no-assign-module-variable  @next/next/no-assign-module-variable
336:52  warning  Unexpected any. Specify a different type                                                                 @typescript-eslint/no-explicit-any
340:7   error    Do not assign to the variable `module`. See: https://nextjs.org/docs/messages/no-assign-module-variable  @next/next/no-assign-module-variable

C:\Users\d.kushniriuk\Desktop\22 Club\22club-setup V1 online\src\components\ui\alert-dialog.tsx
4:10  warning  'X' is defined but never used  @typescript-eslint/no-unused-vars

C:\Users\d.kushniriuk\Desktop\22 Club\22club-setup V1 online\src\components\workout\wizard-steps\workout-wizard-step-4.tsx
14:10  warning  'Target' is defined but never used  @typescript-eslint/no-unused-vars

C:\Users\d.kushniriuk\Desktop\22 Club\22club-setup V1 online\src\components\workout\workout-wizard-content.tsx
121:9  warning  'StepIcon' is assigned a value but never used  @typescript-eslint/no-unused-vars

C:\Users\d.kushniriuk\Desktop\22 Club\22club-setup V1 online\src\components\workout\workout-wizard.tsx
17:7  warning  'STEPS' is assigned a value but never used  @typescript-eslint/no-unused-vars

C:\Users\d.kushniriuk\Desktop\22 Club\22club-setup V1 online\src\hooks\appointments\use-appointments.ts
100:15  warning  'athleteIds' is assigned a value but never used  @typescript-eslint/no-unused-vars
185:7   warning  'athletes' is defined but never used             @typescript-eslint/no-unused-vars

C:\Users\d.kushniriuk\Desktop\22 Club\22club-setup V1 online\src\hooks\athlete-profile\__tests__\use-athlete-administrative.test.ts
56:10  error  Component definition is missing display name  react/display-name

C:\Users\d.kushniriuk\Desktop\22 Club\22club-setup V1 online\src\hooks\athlete-profile\__tests__\use-athlete-ai-data.test.ts
53:10  error  Component definition is missing display name  react/display-name

C:\Users\d.kushniriuk\Desktop\22 Club\22club-setup V1 online\src\hooks\athlete-profile\__tests__\use-athlete-anagrafica.test.ts
43:10  error    Component definition is missing display name  react/display-name
189:44  warning  Unexpected any. Specify a different type      @typescript-eslint/no-explicit-any

C:\Users\d.kushniriuk\Desktop\22 Club\22club-setup V1 online\src\hooks\athlete-profile\__tests__\use-athlete-fitness.test.ts
44:10  error  Component definition is missing display name  react/display-name

C:\Users\d.kushniriuk\Desktop\22 Club\22club-setup V1 online\src\hooks\athlete-profile\__tests__\use-athlete-massage.test.ts
44:10  error  Component definition is missing display name  react/display-name

C:\Users\d.kushniriuk\Desktop\22 Club\22club-setup V1 online\src\hooks\athlete-profile\__tests__\use-athlete-medical.test.ts
57:10  error  Component definition is missing display name  react/display-name

C:\Users\d.kushniriuk\Desktop\22 Club\22club-setup V1 online\src\hooks\athlete-profile\__tests__\use-athlete-motivational.test.ts
44:10  error  Component definition is missing display name  react/display-name

C:\Users\d.kushniriuk\Desktop\22 Club\22club-setup V1 online\src\hooks\athlete-profile\__tests__\use-athlete-nutrition.test.ts
44:10  error  Component definition is missing display name  react/display-name

C:\Users\d.kushniriuk\Desktop\22 Club\22club-setup V1 online\src\hooks\athlete-profile\__tests__\use-athlete-smart-tracking.test.ts
51:10  error  Component definition is missing display name  react/display-name

C:\Users\d.kushniriuk\Desktop\22 Club\22club-setup V1 online\src\hooks\athlete-profile\use-athlete-administrative-form.ts
145:14  warning  'error' is defined but never used  @typescript-eslint/no-unused-vars

C:\Users\d.kushniriuk\Desktop\22 Club\22club-setup V1 online\src\hooks\athlete-profile\use-athlete-anagrafica.ts
20:15  warning  'UpdateAthleteAnagraficaValidation' is defined but never used  @typescript-eslint/no-unused-vars
285:17  warning  '_data' is defined but never used                              @typescript-eslint/no-unused-vars
285:24  warning  '_updates' is defined but never used                           @typescript-eslint/no-unused-vars

C:\Users\d.kushniriuk\Desktop\22 Club\22club-setup V1 online\src\hooks\athlete-profile\use-athlete-medical-form.ts
159:14  warning  'error' is defined but never used  @typescript-eslint/no-unused-vars
193:14  warning  'error' is defined but never used  @typescript-eslint/no-unused-vars

C:\Users\d.kushniriuk\Desktop\22 Club\22club-setup V1 online\src\hooks\athlete-profile\use-athlete-motivational-form.ts
182:6  warning  React Hook useCallback has a missing dependency: 'newArrayItem'. Either include it or remove the dependency array. You can also do a functional update 'setNewArrayItem(n => ...)' if you only need 'newArrayItem' in the 'setNewArrayItem' call  react-hooks/exhaustive-deps

C:\Users\d.kushniriuk\Desktop\22 Club\22club-setup V1 online\src\hooks\athlete-profile\use-athlete-nutrition-form.ts
238:5  warning  React Hook useCallback has a missing dependency: 'formData.preferenze_orari_pasti'. Either include it or remove the dependency array  react-hooks/exhaustive-deps

C:\Users\d.kushniriuk\Desktop\22 Club\22club-setup V1 online\src\hooks\athlete-profile\use-athlete-profile-cache.ts
102:5  warning  React Hook useCallback has a missing dependency: 'athleteId'. Either include it or remove the dependency array  react-hooks/exhaustive-deps

C:\Users\d.kushniriuk\Desktop\22 Club\22club-setup V1 online\src\hooks\athlete-profile\use-athlete-profile-data.ts
10:26  warning  'createSupabaseClient' is defined but never used  @typescript-eslint/no-unused-vars
27:9   warning  'queryClient' is assigned a value but never used  @typescript-eslint/no-unused-vars

C:\Users\d.kushniriuk\Desktop\22 Club\22club-setup V1 online\src\hooks\athlete-profile\use-athlete-profile-form-base.ts
28:3  warning  'athleteId' is defined but never used  @typescript-eslint/no-unused-vars

C:\Users\d.kushniriuk\Desktop\22 Club\22club-setup V1 online\src\hooks\calendar\use-calendar-page.ts
38:9  warning  'router' is assigned a value but never used        @typescript-eslint/no-unused-vars
39:9  warning  'searchParams' is assigned a value but never used  @typescript-eslint/no-unused-vars

C:\Users\d.kushniriuk\Desktop\22 Club\22club-setup V1 online\src\hooks\communications\use-communications-page.tsx
365:5  warning  React Hook useCallback has a missing dependency: 'addToast'. Either include it or remove the dependency array
                        react-hooks/exhaustive-deps
393:5  warning  React Hook useCallback has an unnecessary dependency: 'addToast'. Either exclude it or remove the dependency array                          react-hooks/exhaustive-deps
575:5  warning  React Hook useCallback has missing dependencies: 'addToast' and 'formSelectedAthletes'. Either include them or remove the dependency array  react-hooks/exhaustive-deps

C:\Users\d.kushniriuk\Desktop\22 Club\22club-setup V1 online\src\hooks\home-profile\use-athlete-stats.ts
63:21  warning  'profileComplete' is assigned a value but never used  @typescript-eslint/no-unused-vars

C:\Users\d.kushniriuk\Desktop\22 Club\22club-setup V1 online\src\hooks\use-chat.ts
11:15  warning  'ChatMessage' is defined but never used
       @typescript-eslint/no-unused-vars
11:39  warning  'ConversationParticipant' is defined but never used
       @typescript-eslint/no-unused-vars
69:15  warning  'existingMessages' is assigned a value but never used
       @typescript-eslint/no-unused-vars
161:5   warning  React Hook useCallback has a missing dependency: 'getCurrentProfileId'. Either include it or remove the dependency array  react-hooks/exhaustive-deps

C:\Users\d.kushniriuk\Desktop\22 Club\22club-setup V1 online\src\hooks\use-clienti.ts
141:16  warning  'rpcError' is defined but never used    @typescript-eslint/no-unused-vars
234:14  warning  'error' is defined but never used       @typescript-eslint/no-unused-vars
469:16  warning  'queryError' is defined but never used  @typescript-eslint/no-unused-vars
535:20  warning  'error' is defined but never used       @typescript-eslint/no-unused-vars
601:29  warning  'statsErr' is defined but never used    @typescript-eslint/no-unused-vars

C:\Users\d.kushniriuk\Desktop\22 Club\22club-setup V1 online\src\hooks\use-documents-filters.ts
1:20  warning  'useEffect' is defined but never used  @typescript-eslint/no-unused-vars

C:\Users\d.kushniriuk\Desktop\22 Club\22club-setup V1 online\src\hooks\use-documents.ts
132:6  warning  React Hook useCallback has a missing dependency: 'filters'. Either include it or remove the dependency array  react-hooks/exhaustive-deps

C:\Users\d.kushniriuk\Desktop\22 Club\22club-setup V1 online\src\hooks\use-payments-filters.ts
1:20  warning  'useEffect' is defined but never used  @typescript-eslint/no-unused-vars

C:\Users\d.kushniriuk\Desktop\22 Club\22club-setup V1 online\src\hooks\use-payments-stats.ts
25:14  warning  Unexpected any. Specify a different type      @typescript-eslint/no-explicit-any
33:10  warning  'loading' is assigned a value but never used  @typescript-eslint/no-unused-vars

C:\Users\d.kushniriuk\Desktop\22 Club\22club-setup V1 online\src\hooks\use-progress.ts
156:37  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
157:39  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
158:37  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
159:44  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
160:46  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any

C:\Users\d.kushniriuk\Desktop\22 Club\22club-setup V1 online\src\hooks\use-pt-profile.ts
207:72  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any

C:\Users\d.kushniriuk\Desktop\22 Club\22club-setup V1 online\src\hooks\use-pt-settings.ts
200:51  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any

C:\Users\d.kushniriuk\Desktop\22 Club\22club-setup V1 online\src\hooks\use-user-settings.ts
6:15  warning  'SupabaseClient' is defined but never used             @typescript-eslint/no-unused-vars
97:42  error    'queryError' is never reassigned. Use 'const' instead  prefer-const

C:\Users\d.kushniriuk\Desktop\22 Club\22club-setup V1 online\src\hooks\workout-plans\use-workout-plans.ts
7:44  warning  'useMemo' is defined but never used                       @typescript-eslint/no-unused-vars
21:7   warning  'difficultyUiToDbMap' is assigned a value but never used  @typescript-eslint/no-unused-vars

C:\Users\d.kushniriuk\Desktop\22 Club\22club-setup V1 online\src\hooks\workouts\use-workout-mutations.ts
10:15  warning  'Tables' is defined but never used  @typescript-eslint/no-unused-vars

C:\Users\d.kushniriuk\Desktop\22 Club\22club-setup V1 online\src\lib\analytics-export.ts
3:26  warning  'DistributionData' is defined but never used  @typescript-eslint/no-unused-vars

C:\Users\d.kushniriuk\Desktop\22 Club\22club-setup V1 online\src\lib\analytics.ts
45:7   warning  'mockTrendData' is assigned a value but never used  @typescript-eslint/no-unused-vars
108:40  warning  'orgId' is defined but never used                   @typescript-eslint/no-unused-vars

C:\Users\d.kushniriuk\Desktop\22 Club\22club-setup V1 online\src\lib\cache\cache-strategies.ts
63:11  warning  'config' is assigned a value but never used  @typescript-eslint/no-unused-vars

C:\Users\d.kushniriuk\Desktop\22 Club\22club-setup V1 online\src\lib\cache\use-cached-query.ts
29:9  warning  'queryClient' is assigned a value but never used  @typescript-eslint/no-unused-vars

C:\Users\d.kushniriuk\Desktop\22 Club\22club-setup V1 online\src\lib\communications\email-batch-processor.ts
11:10  warning  'generateEmailHTML' is defined but never used  @typescript-eslint/no-unused-vars

C:\Users\d.kushniriuk\Desktop\22 Club\22club-setup V1 online\src\lib\communications\email-resend-client.ts
11:10  warning  'requiredEnv' is defined but never used  @typescript-eslint/no-unused-vars

C:\Users\d.kushniriuk\Desktop\22 Club\22club-setup V1 online\src\lib\communications\email.ts
16:6  warning  'CommunicationRow' is defined but never used  @typescript-eslint/no-unused-vars

C:\Users\d.kushniriuk\Desktop\22 Club\22club-setup V1 online\src\lib\communications\sms.ts
14:6  warning  'CommunicationRow' is defined but never used  @typescript-eslint/no-unused-vars

C:\Users\d.kushniriuk\Desktop\22 Club\22club-setup V1 online\src\lib\document-utils.ts
1:15  warning  'Document' is defined but never used  @typescript-eslint/no-unused-vars

C:\Users\d.kushniriuk\Desktop\22 Club\22club-setup V1 online\src\lib\exercise-upload-utils.ts
58:45  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
90:45  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any

C:\Users\d.kushniriuk\Desktop\22 Club\22club-setup V1 online\src\lib\notifications\athlete-registration.ts
90:41  warning  'athleteEmail' is assigned a value but never used  @typescript-eslint/no-unused-vars

C:\Users\d.kushniriuk\Desktop\22 Club\22club-setup V1 online\src\lib\recurrence-management.ts
 5:10  warning  'deserializeRecurrence' is defined but never used     @typescript-eslint/no-unused-vars
158:11  warning  'recurrence_rule' is assigned a value but never used  @typescript-eslint/no-unused-vars
188:11  warning  'recurrence_rule' is assigned a value but never used  @typescript-eslint/no-unused-vars

C:\Users\d.kushniriuk\Desktop\22 Club\22club-setup V1 online\src\lib\supabase\verify-connection.ts
57:19  warning  'profile' is assigned a value but never used  @typescript-eslint/no-unused-vars

C:\Users\d.kushniriuk\Desktop\22 Club\22club-setup V1 online\src\lib\utils\athlete-profile-form.ts
6:10  warning  'z' is defined but never used                        @typescript-eslint/no-unused-vars
65:5   warning  'successMessage' is assigned a value but never used  @typescript-eslint/no-unused-vars

C:\Users\d.kushniriuk\Desktop\22 Club\22club-setup V1 online\tests\e2e\athlete-registration-flow.spec.ts
60:73  warning  'context' is defined but never used  @typescript-eslint/no-unused-vars

C:\Users\d.kushniriuk\Desktop\22 Club\22club-setup V1 online\tests\e2e\payment-lesson-counter-flow.spec.ts
15:7  warning  'initialLessonCount' is assigned a value but never used  @typescript-eslint/no-unused-vars

C:\Users\d.kushniriuk\Desktop\22 Club\22club-setup V1 online\tests\e2e\security.spec.ts
151:11  warning  'hasFrameProtection' is assigned a value but never used  @typescript-eslint/no-unused-vars

C:\Users\d.kushniriuk\Desktop\22 Club\22club-setup V1 online\tests\security\athlete-profile-security.test.ts
 6:32  warning  'beforeEach' is defined but never used            @typescript-eslint/no-unused-vars
19:10  warning  'z' is defined but never used                     @typescript-eslint/no-unused-vars
27:22  warning  'table' is defined but never used                 @typescript-eslint/no-unused-vars
28:26  warning  'columns' is defined but never used               @typescript-eslint/no-unused-vars
29:24  warning  'column' is defined but never used                @typescript-eslint/no-unused-vars
29:40  warning  'value' is defined but never used                 @typescript-eslint/no-unused-vars
151:15  warning  'invalidData' is assigned a value but never used  @typescript-eslint/no-unused-vars

C:\Users\d.kushniriuk\Desktop\22 Club\22club-setup V1 online\tests\unit\zod-schema-validation.test.ts
9:3  warning  'updateAppointmentSchema' is defined but never used  @typescript-eslint/no-unused-vars

✖ 254 problems (20 errors, 234 warnings)
4 errors and 0 warnings potentially fixable with the `--fix` option.

PS C:\Users\d.kushniriuk\Desktop\22 Club\22club-setup V1 online>

PS C:\Users\d.kushniriuk\Desktop\22 Club\22club-setup V1 online> npm run build

> 22club-setup@0.1.0 build
> next build

▲ Next.js 15.5.4
- Environments: .env.local
- Experiments (use with caution):
  · optimizePackageImports

Creating an optimized production build ...
⚠ Compiled with warnings in 10.5s

./src/components/dashboard/admin/admin-statistics-content.tsx
Attempted import error: 'PieChart' is not exported from '@/components/charts/client-recharts' (imported as 'PieChart').

Import trace for requested module:
./src/components/dashboard/admin/admin-statistics-content.tsx

./src/components/dashboard/admin/admin-statistics-content.tsx
Attempted import error: 'Pie' is not exported from '@/components/charts/client-recharts' (imported as 'Pie').

Import trace for requested module:
./src/components/dashboard/admin/admin-statistics-content.tsx

./src/components/dashboard/admin/admin-statistics-content.tsx
Attempted import error: 'Cell' is not exported from '@/components/charts/client-recharts' (imported as 'Cell').

Import trace for requested module:
./src/components/dashboard/admin/admin-statistics-content.tsx

./src/components/dashboard/admin/admin-statistics-content.tsx
Attempted import error: 'PieChart' is not exported from '@/components/charts/client-recharts' (imported as 'PieChart').

Import trace for requested module:
./src/components/dashboard/admin/admin-statistics-content.tsx

./src/components/dashboard/admin/admin-statistics-content.tsx
Attempted import error: 'Pie' is not exported from '@/components/charts/client-recharts' (imported as 'Pie').

Import trace for requested module:
./src/components/dashboard/admin/admin-statistics-content.tsx

./src/components/dashboard/admin/admin-statistics-content.tsx
Attempted import error: 'Cell' is not exported from '@/components/charts/client-recharts' (imported as 'Cell').

Import trace for requested module:
./src/components/dashboard/admin/admin-statistics-content.tsx

./src/components/shared/analytics/distribution-chart.tsx
Attempted import error: 'PieChart' is not exported from '@/components/charts/client-recharts' (imported as 'PieChart').

Import trace for requested module:
./src/components/shared/analytics/distribution-chart.tsx
./src/components/dashboard/statistiche-page-content.tsx

./src/components/shared/analytics/distribution-chart.tsx
Attempted import error: 'Pie' is not exported from '@/components/charts/client-recharts' (imported as 'Pie').

Import trace for requested module:
./src/components/shared/analytics/distribution-chart.tsx
./src/components/dashboard/statistiche-page-content.tsx

./src/components/shared/analytics/distribution-chart.tsx
Attempted import error: 'Cell' is not exported from '@/components/charts/client-recharts' (imported as 'Cell').

Import trace for requested module:
./src/components/shared/analytics/distribution-chart.tsx
./src/components/dashboard/statistiche-page-content.tsx

./src/components/dashboard/admin/admin-statistics-content.tsx
Attempted import error: 'PieChart' is not exported from '@/components/charts/client-recharts' (imported as 'PieChart').

Import trace for requested module:
./src/components/dashboard/admin/admin-statistics-content.tsx

./src/components/dashboard/admin/admin-statistics-content.tsx
Attempted import error: 'Pie' is not exported from '@/components/charts/client-recharts' (imported as 'Pie').

Import trace for requested module:
./src/components/dashboard/admin/admin-statistics-content.tsx

./src/components/dashboard/admin/admin-statistics-content.tsx
Attempted import error: 'Cell' is not exported from '@/components/charts/client-recharts' (imported as 'Cell').

Import trace for requested module:
./src/components/dashboard/admin/admin-statistics-content.tsx

./src/components/dashboard/admin/admin-statistics-content.tsx
Attempted import error: 'PieChart' is not exported from '@/components/charts/client-recharts' (imported as 'PieChart').

Import trace for requested module:
./src/components/dashboard/admin/admin-statistics-content.tsx

./src/components/dashboard/admin/admin-statistics-content.tsx
Attempted import error: 'Pie' is not exported from '@/components/charts/client-recharts' (imported as 'Pie').

Import trace for requested module:
./src/components/dashboard/admin/admin-statistics-content.tsx

./src/components/dashboard/admin/admin-statistics-content.tsx
Attempted import error: 'Cell' is not exported from '@/components/charts/client-recharts' (imported as 'Cell').

Import trace for requested module:
./src/components/dashboard/admin/admin-statistics-content.tsx

./src/components/shared/analytics/distribution-chart.tsx
Attempted import error: 'PieChart' is not exported from '@/components/charts/client-recharts' (imported as 'PieChart').

Import trace for requested module:
./src/components/shared/analytics/distribution-chart.tsx
./src/components/dashboard/statistiche-page-content.tsx

./src/components/shared/analytics/distribution-chart.tsx
Attempted import error: 'Pie' is not exported from '@/components/charts/client-recharts' (imported as 'Pie').

Import trace for requested module:
./src/components/shared/analytics/distribution-chart.tsx
./src/components/dashboard/statistiche-page-content.tsx

./src/components/shared/analytics/distribution-chart.tsx
Attempted import error: 'Cell' is not exported from '@/components/charts/client-recharts' (imported as 'Cell').

Import trace for requested module:
./src/components/shared/analytics/distribution-chart.tsx
./src/components/dashboard/statistiche-page-content.tsx


Failed to compile.

./src/app/api/admin/roles/route.ts
15:27  Warning: 'request' is defined but never used.  @typescript-eslint/no-unused-vars
65:19  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
109:23  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
128:19  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./src/app/api/admin/statistics/route.ts
8:27  Warning: 'request' is defined but never used.  @typescript-eslint/no-unused-vars
221:19  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./src/app/api/admin/users/route.ts
31:27  Warning: 'request' is defined but never used.  @typescript-eslint/no-unused-vars
62:19  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
173:19  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
247:26  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
270:23  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
293:19  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
369:19  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./src/app/api/communications/list-athletes/route.ts
9:27  Warning: 'request' is defined but never used.  @typescript-eslint/no-unused-vars

./src/app/api/exercises/route.ts
186:15  Warning: 'created_by' is assigned a value but never used.  @typescript-eslint/no-unused-vars

./src/app/api/settings/route.ts
43:27  Warning: 'request' is defined but never used.  @typescript-eslint/no-unused-vars

./src/app/api/webhooks/email/route.ts
57:11  Warning: 'recipientEmail' is assigned a value but never used.  @typescript-eslint/no-unused-vars

./src/app/api/webhooks/sms/route.ts
56:11  Warning: 'to' is assigned a value but never used.  @typescript-eslint/no-unused-vars

./src/app/dashboard/appuntamenti/page.tsx
22:5  Warning: 'staffId' is assigned a value but never used.  @typescript-eslint/no-unused-vars

./src/app/dashboard/calendario/page.tsx
19:5  Warning: 'trainerId' is assigned a value but never used.  @typescript-eslint/no-unused-vars

./src/app/dashboard/clienti/page.tsx
39:5  Warning: 'advancedFilters' is assigned a value but never used.  @typescript-eslint/no-unused-vars

./src/app/dashboard/impostazioni/page.tsx
24:14  Warning: 'settingsLoading' is assigned a value but never used.  @typescript-eslint/no-unused-vars

./src/app/dashboard/pagamenti/page.tsx
110:38  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./src/app/dashboard/profilo/page.tsx
13:10  Warning: 'LoadingState' is defined but never used.  @typescript-eslint/no-unused-vars
96:9  Warning: 'handleLogout' is assigned a value but never used.  @typescript-eslint/no-unused-vars
216:80  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./src/app/dashboard/schede/nuova/page.tsx
23:42  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./src/app/dashboard/schede/[id]/modifica/page.tsx
75:6  Warning: React Hook useMemo has an unnecessary dependency: 'athletes'. Either exclude it or remove the dependency array.  react-hooks/exhaustive-deps

./src/app/home/layout.tsx
2:10  Warning: 'AthleteBackground' is defined but never used.  @typescript-eslint/no-unused-vars

./src/app/home/progressi/foto/page.tsx
3:39  Warning: 'useCallback' is defined but never used.  @typescript-eslint/no-unused-vars
46:44  Warning: 'totalCount' is assigned a value but never used.  @typescript-eslint/no-unused-vars

./src/components/appointments/appointments-header.tsx
11:18  Warning: 'Calendar' is defined but never used.  @typescript-eslint/no-unused-vars
28:3  Warning: 'onNewAppointment' is defined but never used.  @typescript-eslint/no-unused-vars

./src/components/appointments/recurrence-selector.tsx
4:18  Warning: 'Calendar' is defined but never used.  @typescript-eslint/no-unused-vars

./src/components/athlete/appointments-card.tsx
8:62  Warning: 'MapPin' is defined but never used.  @typescript-eslint/no-unused-vars
46:9  Warning: 'getTypeIcon' is assigned a value but never used.  @typescript-eslint/no-unused-vars
86:9  Warning: 'getStatusBadge' is assigned a value but never used.  @typescript-eslint/no-unused-vars

./src/components/calendar/calendar-header.tsx
9:11  Warning: An empty interface declaration allows any non-nullish value, including literals like `0` and `""`.
- If that's what you want, disable this lint rule with an inline comment or configure the 'allowInterfaces' rule option.
- If you want a type meaning "any object", you probably want `object` instead.
- If you want a type meaning "any value", you probably want `unknown` instead.  @typescript-eslint/no-empty-object-type

./src/components/communications/communication-card.tsx
12:10  Warning: 'Badge' is defined but never used.  @typescript-eslint/no-unused-vars
15:3  Warning: 'Bell' is defined but never used.  @typescript-eslint/no-unused-vars
17:3  Warning: 'MessageSquare' is defined but never used.  @typescript-eslint/no-unused-vars
22:3  Warning: 'AlertCircle' is defined but never used.  @typescript-eslint/no-unused-vars
91:6  Warning: React Hook useCallback has a missing dependency: 'communication.id'. Either include it or remove the dependency array.  react-hooks/exhaustive-deps

./src/components/communications/communications-list.tsx
55:3  Warning: 'onPageChange' is defined but never used.  @typescript-eslint/no-unused-vars

./src/components/communications/recipients-detail-modal.tsx
81:6  Warning: React Hook useEffect has a missing dependency: 'fetchRecipients'. Either include it or remove the dependency array.  react-hooks/exhaustive-deps

./src/components/dashboard/admin/admin-dashboard-content.tsx
4:27  Warning: 'Settings' is defined but never used.  @typescript-eslint/no-unused-vars
8:29  Warning: 'CardDescription' is defined but never used.  @typescript-eslint/no-unused-vars

./src/components/dashboard/admin/admin-organizations-content.tsx
4:21  Warning: 'Plus' is defined but never used.  @typescript-eslint/no-unused-vars
4:33  Warning: 'Trash2' is defined but never used.  @typescript-eslint/no-unused-vars
21:10  Warning: 'notifySuccess' is defined but never used.  @typescript-eslint/no-unused-vars
39:6  Warning: React Hook useEffect has a missing dependency: 'fetchOrganizations'. Either include it or remove the dependency array.  react-hooks/exhaustive-deps
101:21  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./src/components/dashboard/admin/admin-roles-content.tsx
21:16  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
201:62  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
219:21  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
261:21  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./src/components/dashboard/admin/admin-statistics-content.tsx
4:33  Warning: 'FileText' is defined but never used.  @typescript-eslint/no-unused-vars
87:21  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./src/components/dashboard/admin/admin-users-content.tsx
4:28  Warning: 'Filter' is defined but never used.  @typescript-eslint/no-unused-vars
4:50  Warning: 'Eye' is defined but never used.  @typescript-eslint/no-unused-vars
76:21  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
161:21  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./src/components/dashboard/admin/user-delete-dialog.tsx
43:54  Warning: `'` can be escaped with `&apos;`, `&lsquo;`, `&#39;`, `&rsquo;`.  react/no-unescaped-entities
44:14  Warning: `'` can be escaped with `&apos;`, `&lsquo;`, `&#39;`, `&rsquo;`.  react/no-unescaped-entities

./src/components/dashboard/admin/user-form-modal.tsx
4:10  Warning: 'X' is defined but never used.  @typescript-eslint/no-unused-vars
108:27  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
157:21  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./src/components/dashboard/athlete-profile/ai-data/ai-data-recommendations-section.tsx
50:60  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./src/components/dashboard/athlete-profile/athlete-administrative-tab.tsx
29:3  Warning: 'Upload' is defined but never used.  @typescript-eslint/no-unused-vars
80:5  Warning: 'uploadFile' is assigned a value but never used.  @typescript-eslint/no-unused-vars
176:51  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./src/components/dashboard/athlete-profile/athlete-ai-data-tab.tsx
77:64  Warning: `'` can be escaped with `&apos;`, `&lsquo;`, `&#39;`, `&rsquo;`.  react/no-unescaped-entities

./src/components/dashboard/athlete-profile/athlete-anagrafica-tab.tsx
71:51  Warning: `'` can be escaped with `&apos;`, `&lsquo;`, `&#39;`, `&rsquo;`.  react/no-unescaped-entities

./src/components/dashboard/athlete-profile/athlete-massage-tab.tsx
92:47  Warning: `'` can be escaped with `&apos;`, `&lsquo;`, `&#39;`, `&rsquo;`.  react/no-unescaped-entities

./src/components/dashboard/athlete-profile/athlete-medical-tab.tsx
50:5  Warning: 'uploadFile' is assigned a value but never used.  @typescript-eslint/no-unused-vars
119:61  Warning: `'` can be escaped with `&apos;`, `&lsquo;`, `&#39;`, `&rsquo;`.  react/no-unescaped-entities
182:58  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./src/components/dashboard/athlete-profile/athlete-motivational-tab.tsx
82:52  Warning: `'` can be escaped with `&apos;`, `&lsquo;`, `&#39;`, `&rsquo;`.  react/no-unescaped-entities

./src/components/dashboard/athlete-profile/athlete-nutrition-tab.tsx
10:10  Warning: 'useToast' is defined but never used.  @typescript-eslint/no-unused-vars
68:58  Warning: `'` can be escaped with `&apos;`, `&lsquo;`, `&#39;`, `&rsquo;`.  react/no-unescaped-entities

./src/components/dashboard/athlete-profile/athlete-profile-tabs-optimized.tsx
8:20  Warning: 'lazy' is defined but never used.  @typescript-eslint/no-unused-vars
8:60  Warning: 'useMemo' is defined but never used.  @typescript-eslint/no-unused-vars
278:23  Warning: 'tabConfig' is assigned a value but never used.  @typescript-eslint/no-unused-vars
279:23  Warning: 'isActive' is assigned a value but never used.  @typescript-eslint/no-unused-vars
280:23  Warning: 'isLoaded' is assigned a value but never used.  @typescript-eslint/no-unused-vars
337:21  Warning: 'isActive' is assigned a value but never used.  @typescript-eslint/no-unused-vars

./src/components/dashboard/athlete-profile/fitness/fitness-injuries-section.tsx
35:3  Warning: 'infortuni' is defined but never used.  @typescript-eslint/no-unused-vars

./src/components/dashboard/athlete-profile/motivational/motivational-abandonments-section.tsx
13:10  Warning: 'Badge' is defined but never used.  @typescript-eslint/no-unused-vars
34:3  Warning: 'abbandoni' is defined but never used.  @typescript-eslint/no-unused-vars

./src/components/dashboard/exercise-form-modal.tsx
26:3  Warning: 'formatFileSize' is defined but never used.  @typescript-eslint/no-unused-vars
368:15  Warning: 'id' is assigned a value but never used.  @typescript-eslint/no-unused-vars
368:19  Warning: 'created_at' is assigned a value but never used.  @typescript-eslint/no-unused-vars
368:31  Warning: 'updated_at' is assigned a value but never used.  @typescript-eslint/no-unused-vars
368:43  Warning: 'org_id' is assigned a value but never used.  @typescript-eslint/no-unused-vars
368:51  Warning: 'thumbnail_url' is assigned a value but never used.  @typescript-eslint/no-unused-vars

./src/components/invitations/qr-code.tsx
50:6  Warning: React Hook useEffect has missing dependencies: 'athleteName' and 'invitationCode'. Either include them or remove the dependency array.  react-hooks/exhaustive-deps

./src/components/settings/settings-account-tab.tsx
338:37  Warning: `'` can be escaped with `&apos;`, `&lsquo;`, `&#39;`, `&rsquo;`.  react/no-unescaped-entities

./src/components/shared/ui/transition-wrapper.tsx
7:19  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
102:52  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
106:7  Error: Do not assign to the variable `module`. See: https://nextjs.org/docs/messages/no-assign-module-variable  @next/next/no-assign-module-variable
150:52  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
154:7  Error: Do not assign to the variable `module`. See: https://nextjs.org/docs/messages/no-assign-module-variable  @next/next/no-assign-module-variable
196:52  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
200:7  Error: Do not assign to the variable `module`. See: https://nextjs.org/docs/messages/no-assign-module-variable  @next/next/no-assign-module-variable
243:52  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
247:7  Error: Do not assign to the variable `module`. See: https://nextjs.org/docs/messages/no-assign-module-variable  @next/next/no-assign-module-variable
288:52  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
292:7  Error: Do not assign to the variable `module`. See: https://nextjs.org/docs/messages/no-assign-module-variable  @next/next/no-assign-module-variable
336:52  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
340:7  Error: Do not assign to the variable `module`. See: https://nextjs.org/docs/messages/no-assign-module-variable  @next/next/no-assign-module-variable

./src/components/ui/alert-dialog.tsx
4:10  Warning: 'X' is defined but never used.  @typescript-eslint/no-unused-vars

./src/components/workout/wizard-steps/workout-wizard-step-4.tsx
14:10  Warning: 'Target' is defined but never used.  @typescript-eslint/no-unused-vars

./src/components/workout/workout-wizard-content.tsx
121:9  Warning: 'StepIcon' is assigned a value but never used.  @typescript-eslint/no-unused-vars

./src/components/workout/workout-wizard.tsx
17:7  Warning: 'STEPS' is assigned a value but never used.  @typescript-eslint/no-unused-vars

./src/hooks/appointments/use-appointments.ts
100:15  Warning: 'athleteIds' is assigned a value but never used.  @typescript-eslint/no-unused-vars
185:7  Warning: 'athletes' is defined but never used.  @typescript-eslint/no-unused-vars

./src/hooks/athlete-profile/use-athlete-administrative-form.ts
145:14  Warning: 'error' is defined but never used.  @typescript-eslint/no-unused-vars

./src/hooks/athlete-profile/use-athlete-anagrafica.ts
20:15  Warning: 'UpdateAthleteAnagraficaValidation' is defined but never used.  @typescript-eslint/no-unused-vars
285:17  Warning: '_data' is defined but never used.  @typescript-eslint/no-unused-vars
285:24  Warning: '_updates' is defined but never used.  @typescript-eslint/no-unused-vars

./src/hooks/athlete-profile/use-athlete-medical-form.ts
159:14  Warning: 'error' is defined but never used.  @typescript-eslint/no-unused-vars
193:14  Warning: 'error' is defined but never used.  @typescript-eslint/no-unused-vars

./src/hooks/athlete-profile/use-athlete-motivational-form.ts
182:6  Warning: React Hook useCallback has a missing dependency: 'newArrayItem'. Either include it or remove the dependency array. You can also do a functional update 'setNewArrayItem(n => ...)' if you only need 'newArrayItem' in the 'setNewArrayItem' call.  react-hooks/exhaustive-deps

./src/hooks/athlete-profile/use-athlete-nutrition-form.ts
238:5  Warning: React Hook useCallback has a missing dependency: 'formData.preferenze_orari_pasti'. Either include it or remove the dependency array.  react-hooks/exhaustive-deps

./src/hooks/athlete-profile/use-athlete-profile-cache.ts
102:5  Warning: React Hook useCallback has a missing dependency: 'athleteId'. Either include it or remove the dependency array.  react-hooks/exhaustive-deps

./src/hooks/athlete-profile/use-athlete-profile-data.ts
10:26  Warning: 'createSupabaseClient' is defined but never used.  @typescript-eslint/no-unused-vars
27:9  Warning: 'queryClient' is assigned a value but never used.  @typescript-eslint/no-unused-vars

./src/hooks/athlete-profile/use-athlete-profile-form-base.ts
28:3  Warning: 'athleteId' is defined but never used.  @typescript-eslint/no-unused-vars

./src/hooks/athlete-profile/__tests__/use-athlete-administrative.test.ts
56:10  Error: Component definition is missing display name  react/display-name

./src/hooks/athlete-profile/__tests__/use-athlete-ai-data.test.ts
53:10  Error: Component definition is missing display name  react/display-name

./src/hooks/athlete-profile/__tests__/use-athlete-anagrafica.test.ts
43:10  Error: Component definition is missing display name  react/display-name
189:44  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./src/hooks/athlete-profile/__tests__/use-athlete-fitness.test.ts
44:10  Error: Component definition is missing display name  react/display-name

./src/hooks/athlete-profile/__tests__/use-athlete-massage.test.ts
44:10  Error: Component definition is missing display name  react/display-name

./src/hooks/athlete-profile/__tests__/use-athlete-medical.test.ts
57:10  Error: Component definition is missing display name  react/display-name

./src/hooks/athlete-profile/__tests__/use-athlete-motivational.test.ts
44:10  Error: Component definition is missing display name  react/display-name

./src/hooks/athlete-profile/__tests__/use-athlete-nutrition.test.ts
44:10  Error: Component definition is missing display name  react/display-name

./src/hooks/athlete-profile/__tests__/use-athlete-smart-tracking.test.ts
51:10  Error: Component definition is missing display name  react/display-name

./src/hooks/calendar/use-calendar-page.ts
38:9  Warning: 'router' is assigned a value but never used.  @typescript-eslint/no-unused-vars
39:9  Warning: 'searchParams' is assigned a value but never used.  @typescript-eslint/no-unused-vars

./src/hooks/communications/use-communications-page.tsx
365:5  Warning: React Hook useCallback has a missing dependency: 'addToast'. Either include it or remove the dependency array.  react-hooks/exhaustive-deps
393:5  Warning: React Hook useCallback has an unnecessary dependency: 'addToast'. Either exclude it or remove the dependency array.  react-hooks/exhaustive-deps
575:5  Warning: React Hook useCallback has missing dependencies: 'addToast' and 'formSelectedAthletes'. Either include them or remove the dependency array.  react-hooks/exhaustive-deps

./src/hooks/home-profile/use-athlete-stats.ts
63:21  Warning: 'profileComplete' is assigned a value but never used.  @typescript-eslint/no-unused-vars

./src/hooks/use-chat.ts
11:15  Warning: 'ChatMessage' is defined but never used.  @typescript-eslint/no-unused-vars
11:39  Warning: 'ConversationParticipant' is defined but never used.  @typescript-eslint/no-unused-vars
69:15  Warning: 'existingMessages' is assigned a value but never used.  @typescript-eslint/no-unused-vars
161:5  Warning: React Hook useCallback has a missing dependency: 'getCurrentProfileId'. Either include it or remove the dependency array.  react-hooks/exhaustive-deps

./src/hooks/use-clienti.ts
141:16  Warning: 'rpcError' is defined but never used.  @typescript-eslint/no-unused-vars
234:14  Warning: 'error' is defined but never used.  @typescript-eslint/no-unused-vars
469:16  Warning: 'queryError' is defined but never used.  @typescript-eslint/no-unused-vars
535:20  Warning: 'error' is defined but never used.  @typescript-eslint/no-unused-vars
601:29  Warning: 'statsErr' is defined but never used.  @typescript-eslint/no-unused-vars

./src/hooks/use-documents-filters.ts
1:20  Warning: 'useEffect' is defined but never used.  @typescript-eslint/no-unused-vars

./src/hooks/use-documents.ts
132:6  Warning: React Hook useCallback has a missing dependency: 'filters'. Either include it or remove the dependency array.  react-hooks/exhaustive-deps

./src/hooks/use-payments-filters.ts
1:20  Warning: 'useEffect' is defined but never used.  @typescript-eslint/no-unused-vars

./src/hooks/use-payments-stats.ts
25:14  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
33:10  Warning: 'loading' is assigned a value but never used.  @typescript-eslint/no-unused-vars

./src/hooks/use-progress.ts
156:37  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
157:39  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
158:37  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
159:44  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
160:46  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./src/hooks/use-pt-profile.ts
207:72  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./src/hooks/use-pt-settings.ts
200:51  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./src/hooks/use-user-settings.ts
6:15  Warning: 'SupabaseClient' is defined but never used.  @typescript-eslint/no-unused-vars
97:42  Error: 'queryError' is never reassigned. Use 'const' instead.  prefer-const

./src/hooks/workout-plans/use-workout-plans.ts
7:44  Warning: 'useMemo' is defined but never used.  @typescript-eslint/no-unused-vars
21:7  Warning: 'difficultyUiToDbMap' is assigned a value but never used.  @typescript-eslint/no-unused-vars

./src/hooks/workouts/use-workout-mutations.ts
10:15  Warning: 'Tables' is defined but never used.  @typescript-eslint/no-unused-vars

./src/lib/analytics-export.ts
3:26  Warning: 'DistributionData' is defined but never used.  @typescript-eslint/no-unused-vars

./src/lib/analytics.ts
45:7  Warning: 'mockTrendData' is assigned a value but never used.  @typescript-eslint/no-unused-vars
108:40  Warning: 'orgId' is defined but never used.  @typescript-eslint/no-unused-vars

./src/lib/cache/cache-strategies.ts
63:11  Warning: 'config' is assigned a value but never used.  @typescript-eslint/no-unused-vars

./src/lib/cache/use-cached-query.ts
29:9  Warning: 'queryClient' is assigned a value but never used.  @typescript-eslint/no-unused-vars

./src/lib/communications/email-batch-processor.ts
11:10  Warning: 'generateEmailHTML' is defined but never used.  @typescript-eslint/no-unused-vars

./src/lib/communications/email-resend-client.ts
11:10  Warning: 'requiredEnv' is defined but never used.  @typescript-eslint/no-unused-vars

./src/lib/communications/email.ts
16:6  Warning: 'CommunicationRow' is defined but never used.  @typescript-eslint/no-unused-vars

./src/lib/communications/sms.ts
14:6  Warning: 'CommunicationRow' is defined but never used.  @typescript-eslint/no-unused-vars

./src/lib/document-utils.ts
1:15  Warning: 'Document' is defined but never used.  @typescript-eslint/no-unused-vars

./src/lib/exercise-upload-utils.ts
58:45  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
90:45  Warning: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./src/lib/notifications/athlete-registration.ts
90:41  Warning: 'athleteEmail' is assigned a value but never used.  @typescript-eslint/no-unused-vars

./src/lib/recurrence-management.ts
5:10  Warning: 'deserializeRecurrence' is defined but never used.  @typescript-eslint/no-unused-vars
158:11  Warning: 'recurrence_rule' is assigned a value but never used.  @typescript-eslint/no-unused-vars
188:11  Warning: 'recurrence_rule' is assigned a value but never used.  @typescript-eslint/no-unused-vars

./src/lib/supabase/verify-connection.ts
57:19  Warning: 'profile' is assigned a value but never used.  @typescript-eslint/no-unused-vars

./src/lib/utils/athlete-profile-form.ts
6:10  Warning: 'z' is defined but never used.  @typescript-eslint/no-unused-vars
65:5  Warning: 'successMessage' is assigned a value but never used.  @typescript-eslint/no-unused-vars

info  - Need to disable some ESLint rules? Learn more here: https://nextjs.org/docs/app/api-reference/config/eslint#disabling-rules
PS C:\Users\d.kushniriuk\Desktop\22 Club\22club-setup V1 online>
```
````
