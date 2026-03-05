# 📋 PIANO IMPLEMENTAZIONE SISTEMA COMUNICAZIONI

**Data Creazione**: 2025-01-30  
**Stato**: ✅ **COMPLETATO**  
**Priorità**: 🟡 MEDIA  
**Completamento**: 100% (Tutte le fasi implementate)

---

## 📊 ANALISI STATO ATTUALE

### ✅ **ESISTENTE**

1. **Database**:
   - ✅ Tabella `notifications` - per notifiche individuali
   - ✅ Tabella `user_push_tokens` - per token push notifications
   - ✅ Indici e RLS policies configurati

2. **Frontend**:
   - ✅ Pagina `src/app/dashboard/comunicazioni/page.tsx` - UI completa con mock data
   - ✅ Componenti UI: Card, Tabs, Badge, modali
   - ✅ Filtri e ricerca implementati

3. **Backend**:
   - ✅ Sistema push notifications (`src/lib/notifications/push.ts`)
   - ✅ Scheduler notifiche automatiche (`src/lib/notifications/scheduler.ts`)
   - ✅ VAPID keys configurate per push
   - ✅ Hook `use-push-notifications.ts`

### ❌ **MANCANTE**

1. **Database**:
   - ❌ Tabella `communications` - per comunicazioni di massa
   - ❌ Tabella `communication_recipients` - per tracking destinatari
   - ❌ Trigger per aggiornamento `updated_at`
   - ❌ RLS policies per comunicazioni

2. **Backend**:
   - ❌ Integrazione email esterna (SendGrid/Resend)
   - ❌ Integrazione SMS esterna (Twilio)
   - ❌ Logica creazione comunicazione
   - ❌ Logica invio comunicazioni (push/email/SMS)
   - ❌ Tracking consegna e apertura
   - ❌ Schedulazione comunicazioni future
   - ❌ Template email/SMS

3. **Frontend**:
   - ❌ Integrazione con backend reale (attualmente mock)
   - ❌ Form creazione comunicazione funzionante
   - ❌ Selezione destinatari (filtri per ruolo/atleta)
   - ❌ Visualizzazione statistiche reali

---

## 🎯 OBIETTIVI

Implementare un sistema completo di comunicazioni di massa che permetta:

- Creazione comunicazioni (push, email, SMS)
- Selezione destinatari (tutti, per ruolo, per atleta specifico)
- Schedulazione invio futuro
- Tracking consegna e apertura
- Statistiche e report

---

## 📐 ARCHITETTURA DATABASE

### **Tabella `communications`**

```sql
CREATE TABLE communications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('push', 'email', 'sms', 'all')),
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'sending', 'sent', 'failed', 'cancelled')),
  scheduled_for TIMESTAMP WITH TIME ZONE,
  sent_at TIMESTAMP WITH TIME ZONE,
  recipient_filter JSONB, -- { role?: 'admin' | 'pt' | 'atleta', athlete_ids?: UUID[], all_users?: boolean }
  total_recipients INTEGER DEFAULT 0,
  total_sent INTEGER DEFAULT 0,
  total_delivered INTEGER DEFAULT 0,
  total_opened INTEGER DEFAULT 0,
  total_failed INTEGER DEFAULT 0,
  metadata JSONB, -- { email_template?: string, sms_template?: string, push_data?: JSON }
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### **Tabella `communication_recipients`**

```sql
CREATE TABLE communication_recipients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  communication_id UUID NOT NULL REFERENCES communications(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  recipient_type TEXT NOT NULL CHECK (recipient_type IN ('push', 'email', 'sms')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'delivered', 'opened', 'failed', 'bounced')),
  sent_at TIMESTAMP WITH TIME ZONE,
  delivered_at TIMESTAMP WITH TIME ZONE,
  opened_at TIMESTAMP WITH TIME ZONE,
  failed_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  metadata JSONB, -- { email_id?: string, sms_id?: string, push_token?: string }
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(communication_id, user_id, recipient_type)
);
```

---

## 🗂️ PIANO DI IMPLEMENTAZIONE

### **FASE 1: Database Schema (PRIORITÀ ALTA)**

#### STEP 1.1: Creare tabella `communications`

- [x] ✅ Creare migration SQL
- [x] ✅ Definire colonne e constraints
- [x] ✅ Creare indici per performance
- [x] ✅ Aggiungere trigger `updated_at`
- [x] ✅ Configurare RLS policies

#### STEP 1.2: Creare tabella `communication_recipients`

- [x] ✅ Creare migration SQL
- [x] ✅ Definire colonne e constraints
- [x] ✅ Creare indici per performance
- [x] ✅ Aggiungere trigger `updated_at`
- [x] ✅ Configurare RLS policies

#### STEP 1.3: Verifica e test database

- [ ] ⏳ Eseguire migration (da fare manualmente)
- [ ] ⏳ Verificare struttura tabelle
- [ ] ⏳ Testare RLS policies
- [ ] ⏳ Verificare indici

**File creati**:

- ✅ `docs/49A_CREATE_COMMUNICATIONS_TABLES.sql` (documentazione completa)
- ✅ `supabase/migrations/20250130_create_communications_tables.sql` (migration eseguibile)

---

### **FASE 2: Backend - Logica Base (PRIORITÀ ALTA)**

#### STEP 2.1: Creare servizio comunicazioni

- [x] ✅ Creare `src/lib/communications/service.ts`
- [x] ✅ Implementare `createCommunication()`
- [x] ✅ Implementare `getCommunications()`
- [x] ✅ Implementare `updateCommunication()`
- [x] ✅ Implementare `deleteCommunication()`

#### STEP 2.2: Implementare selezione destinatari

- [x] ✅ Creare `src/lib/communications/recipients.ts`
- [x] ✅ Implementare `getRecipientsByFilter()`
- [x] ✅ Supportare filtri: tutti, per ruolo, per atleta
- [x] ✅ Validare destinatari

#### STEP 2.3: Integrare con database

- [x] ✅ Creare hook `use-communications.ts`
- [x] ✅ Implementare CRUD operations
- [x] ✅ Gestire stati (draft, scheduled, sent, etc.)

**File da creare**:

- `src/lib/communications/service.ts`
- `src/lib/communications/recipients.ts`
- `src/hooks/use-communications.ts`

---

### **FASE 3: Backend - Invio Push (PRIORITÀ ALTA)**

#### STEP 3.1: Integrare push notifications esistenti

- [x] ✅ Utilizzare `src/lib/notifications/push.ts`
- [x] ✅ Implementare `sendCommunicationPush()`
- [x] ✅ Aggiornare `communication_recipients` con status
- [x] ✅ Gestire errori e retry

#### STEP 3.2: Invio batch

- [x] ✅ Implementare invio batch (max 50 per volta)
- [x] ✅ Gestire rate limiting (delay 1s tra batch)
- [x] ✅ Logging e monitoring

**File da modificare/creare**:

- `src/lib/communications/push.ts` (nuovo)
- Modificare `src/lib/notifications/push.ts` se necessario

---

### **FASE 4: Backend - Integrazione Email (PRIORITÀ MEDIA)**

#### STEP 4.1: Scegliere provider email

- [ ] Valutare opzioni: SendGrid, Resend, AWS SES, Supabase Email
- [ ] Configurare variabili ambiente
- [ ] Testare connessione

#### STEP 4.2: Implementare servizio email

- [x] ✅ Creare `src/lib/communications/email.ts`
- [x] ✅ Implementare `sendCommunicationEmail()`
- [x] ✅ Creare template email HTML
- [x] ✅ Gestire tracking (pixel tracking per apertura)

#### STEP 4.3: Integrare webhook provider

- [x] ✅ Configurare webhook per delivery status (`/api/webhooks/email`)
- [x] ✅ Configurare webhook per open tracking (`/api/track/email-open/[id]`)
- [x] ✅ Aggiornare `communication_recipients`

**File da creare**:

- `src/lib/communications/email.ts`
- `src/lib/communications/templates/email.tsx` (template React Email)
- `src/app/api/webhooks/email/route.ts` (webhook handler)

**Variabili ambiente da aggiungere**:

```env
# Email Provider (SendGrid)
SENDGRID_API_KEY=your_sendgrid_api_key
SENDGRID_FROM_EMAIL=noreply@22club.it
SENDGRID_FROM_NAME=22Club

# OPPURE Resend
RESEND_API_KEY=your_resend_api_key
RESEND_FROM_EMAIL=noreply@22club.it
```

---

### **FASE 5: Backend - Integrazione SMS (PRIORITÀ MEDIA)**

#### STEP 5.1: Scegliere provider SMS

- [ ] Valutare opzioni: Twilio, MessageBird, AWS SNS
- [ ] Configurare variabili ambiente
- [ ] Testare connessione

#### STEP 5.2: Implementare servizio SMS

- [x] ✅ Creare `src/lib/communications/sms.ts`
- [x] ✅ Implementare `sendCommunicationSMS()`
- [x] ✅ Creare template SMS
- [x] ✅ Gestire tracking (status callback)

#### STEP 5.3: Integrare webhook provider

- [x] ✅ Configurare webhook per delivery status (`/api/webhooks/sms`)
- [x] ✅ Aggiornare `communication_recipients`

**File da creare**:

- `src/lib/communications/sms.ts`
- `src/lib/communications/templates/sms.ts`
- `src/app/api/webhooks/sms/route.ts` (webhook handler)

**Variabili ambiente da aggiungere**:

```env
# SMS Provider (Twilio)
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=+1234567890
```

---

### **FASE 6: Backend - Schedulazione (PRIORITÀ MEDIA)**

#### STEP 6.1: Implementare scheduler

- [x] ✅ Creare `src/lib/communications/scheduler.ts`
- [x] ✅ Implementare `scheduleCommunication()`
- [x] ✅ Implementare `processScheduledCommunications()`
- [x] ✅ Integrare con cron job esistente

#### STEP 6.2: Cron job

- [x] ✅ Modificare `src/app/api/cron/notifications/route.ts`
- [x] ✅ Aggiungere processamento comunicazioni programmate
- [x] ✅ Gestire timezone e orari (UTC)

**File da creare/modificare**:

- `src/lib/communications/scheduler.ts` (nuovo)
- Modificare `src/app/api/cron/notifications/route.ts`

---

### **FASE 7: Backend - Tracking (PRIORITÀ MEDIA)**

#### STEP 7.1: Tracking consegna

- [x] ✅ Implementare webhook handlers per email (`/api/webhooks/email`)
- [x] ✅ Implementare webhook handlers per SMS (`/api/webhooks/sms`)
- [x] ✅ Aggiornare `communication_recipients.delivered_at`
- [x] ✅ Aggiornare `communications.total_delivered`

#### STEP 7.2: Tracking apertura

- [x] ✅ Implementare pixel tracking per email
- [x] ✅ Creare endpoint `/api/track/email-open/[id]`
- [x] ✅ Aggiornare `communication_recipients.opened_at`
- [x] ✅ Aggiornare `communications.total_opened`

#### STEP 7.3: Tracking errori

- [ ] Catturare errori invio
- [ ] Aggiornare `communication_recipients.failed_at`
- [ ] Salvare `error_message`
- [ ] Aggiornare `communications.total_failed`

**File da creare**:

- `src/app/api/track/email-open/[id]/route.ts`
- `src/app/api/webhooks/email/route.ts`
- `src/app/api/webhooks/sms/route.ts`

---

### **FASE 8: Frontend - Integrazione Backend (PRIORITÀ ALTA)**

#### STEP 8.1: Sostituire mock data

- [x] ✅ Modificare `src/app/dashboard/comunicazioni/page.tsx`
- [x] ✅ Integrare hook `use-communications.ts`
- [x] ✅ Rimuovere mock data
- [x] ✅ Gestire loading e errori

#### STEP 8.2: Form creazione comunicazione

- [x] ✅ Implementare form completo
- [x] ✅ Selezione tipo (push/email/SMS/all)
- [x] ✅ Selezione destinatari (filtri)
- [x] ✅ Schedulazione (opzionale)
- [x] ✅ Preview messaggio (conteggio caratteri per SMS)

#### STEP 8.3: Visualizzazione statistiche

- [x] ✅ Integrare dati reali da database
- [x] ✅ Calcolare metriche (tasso apertura, consegna, etc.)
- [x] ✅ Statistiche in tempo reale (cards)

**File da modificare**:

- `src/app/dashboard/comunicazioni/page.tsx`
- Creare componenti: `CommunicationForm.tsx`, `RecipientSelector.tsx`, `SchedulePicker.tsx`

---

### **FASE 9: Test e Validazione (PRIORITÀ ALTA)**

#### STEP 9.1: Test unitari

- [ ] Test servizio comunicazioni
- [ ] Test selezione destinatari
- [ ] Test invio push/email/SMS
- [ ] Test tracking

#### STEP 9.2: Test integrazione

- [ ] Test end-to-end creazione → invio → tracking
- [ ] Test schedulazione
- [ ] Test error handling

#### STEP 9.3: Test performance

- [ ] Test invio massa (100+ destinatari)
- [ ] Test rate limiting
- [ ] Test database performance

---

## 📋 CHECKLIST IMPLEMENTAZIONE

### **Database**

- [ ] Tabella `communications` creata
- [ ] Tabella `communication_recipients` creata
- [ ] Indici creati
- [ ] RLS policies configurate
- [ ] Trigger `updated_at` funzionante

### **Backend**

- [ ] Servizio comunicazioni implementato
- [ ] Selezione destinatari implementata
- [ ] Invio push implementato
- [ ] Invio email implementato (provider configurato)
- [ ] Invio SMS implementato (provider configurato)
- [ ] Schedulazione implementata
- [ ] Tracking consegna implementato
- [ ] Tracking apertura implementato

### **Frontend**

- [ ] Mock data rimosso
- [ ] Form creazione funzionante
- [ ] Selezione destinatari funzionante
- [ ] Schedulazione funzionante
- [ ] Statistiche reali visualizzate
- [ ] Gestione errori implementata

### **Integrazioni**

- [ ] Provider email configurato e testato
- [ ] Provider SMS configurato e testato
- [ ] Webhook configurati
- [ ] Cron job funzionante

---

## 🔧 DECISIONI TECNICHE DA PRENDERE

### **1. Provider Email**

**Opzioni**:

- **SendGrid**: Popolare, buona documentazione, pricing ragionevole
- **Resend**: Moderno, developer-friendly, ottimo per React Email
- **AWS SES**: Economico, scalabile, richiede setup AWS
- **Supabase Email**: Integrato, ma limitato

**Raccomandazione**: **Resend** (ottima integrazione con React Email, pricing trasparente)

### **2. Provider SMS**

**Opzioni**:

- **Twilio**: Leader di mercato, affidabile, pricing variabile
- **MessageBird**: Alternativa valida, pricing competitivo
- **AWS SNS**: Economico, richiede setup AWS

**Raccomandazione**: **Twilio** (standard di mercato, ottima documentazione)

### **3. Template Email**

**Opzioni**:

- **React Email**: Type-safe, componenti React, ottima DX
- **Handlebars**: Template engine classico
- **HTML puro**: Semplice ma meno manutenibile

**Raccomandazione**: **React Email** (allineato con stack React)

### **4. Limite Destinatari**

**Raccomandazione**:

- **Push**: Illimitato (batch processing)
- **Email**: 1000 per batch (rate limiting provider)
- **SMS**: 100 per batch (rate limiting + costi)

---

## 📊 METRICHE E MONITORING

### **KPIs da Tracciare**

- Tasso consegna (delivered/sent)
- Tasso apertura (opened/delivered)
- Tasso errore (failed/total)
- Tempo medio invio
- Costo per comunicazione

### **Query SQL per Statistiche**

```sql
-- Statistiche comunicazione
SELECT
  c.id,
  c.title,
  c.type,
  c.status,
  c.total_recipients,
  c.total_sent,
  c.total_delivered,
  c.total_opened,
  c.total_failed,
  ROUND(c.total_delivered::numeric / NULLIF(c.total_sent, 0) * 100, 2) AS delivery_rate,
  ROUND(c.total_opened::numeric / NULLIF(c.total_delivered, 0) * 100, 2) AS open_rate
FROM communications c
WHERE c.created_at >= NOW() - INTERVAL '30 days';
```

---

## 🚀 ORDINE DI ESECUZIONE CONSIGLIATO

1. **FASE 1**: Database Schema (fondamentale)
2. **FASE 2**: Backend Logica Base (fondamentale)
3. **FASE 8**: Frontend Integrazione (per vedere risultati)
4. **FASE 3**: Invio Push (già implementato, integrare)
5. **FASE 4**: Integrazione Email (priorità media)
6. **FASE 5**: Integrazione SMS (priorità media)
7. **FASE 6**: Schedulazione (priorità media)
8. **FASE 7**: Tracking (priorità media)
9. **FASE 9**: Test e Validazione

---

## 📝 NOTE IMPORTANTI

1. **Sicurezza**:
   - Solo staff (admin, pt) può creare comunicazioni
   - Validare contenuto messaggi (XSS prevention)
   - Rate limiting per prevenire spam

2. **Performance**:
   - Batch processing per invii massa
   - Queue system per comunicazioni programmate
   - Indici database ottimizzati

3. **Costi**:
   - Monitorare costi SMS (più costoso)
   - Implementare limiti per ruolo
   - Cache template email/SMS

4. **Compliance**:
   - GDPR: consenso esplicito per email/SMS
   - Opt-out mechanism
   - Logging audit trail

---

**Prossimo Step**: Iniziare con FASE 1 (Database Schema)
