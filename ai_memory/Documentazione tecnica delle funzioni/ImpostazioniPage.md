# ImpostazioniPage - Documentazione Tecnica

**File**: `src/app/dashboard/impostazioni/page.tsx`  
**Tipo**: Next.js Page Component  
**Righe**: 949  
**Stato**: ⚠️ PARZIALMENTE COMPLETO  
**Ultimo Aggiornamento**: 2025-01-29T19:00:00Z

---

## 📋 Classificazione

- **Categoria**: Impostazioni / Configurazione Account
- **Tipo**: Next.js Page Component
- **Dipendenze**: React, Supabase Client, UI Components
- **Utilizzato da**: Route `/dashboard/impostazioni`

---

## 🎯 Obiettivo

Gestire impostazioni account utente:

- Profilo (nome, cognome, email, telefono, avatar)
- Notifiche (email, push, SMS, preferenze)
- Privacy (visibilità profilo, dati condivisi)
- Account (lingua, timezone, formato data/ora)
- Password (cambio password)
- 2FA (Two-Factor Authentication - da implementare)

---

## 📥 Parametri

Nessun parametro (page component)

---

## 📤 Output / Return Value

Componente React che renderizza pagina impostazioni con 4 tab:

1. Profilo
2. Notifiche
3. Privacy
4. Account

---

## 🔄 Flusso Logico

### 1. Caricamento Profilo

- Fetch profilo da `profiles` table usando `user_id` da Supabase Auth
- Popola stato `profile` con dati utente

### 2. Tab Profilo

- Form per: nome, cognome, email, telefono
- Upload avatar (componente `AvatarUploader`)
- Salvataggio: update `profiles` table

### 3. Tab Notifiche

- Switch per: email, push, SMS, newClients, payments, appointments, messages
- **TODO**: Salvataggio in Supabase (attualmente solo mock)

### 4. Tab Privacy

- Switch per: profileVisible, showEmail, showPhone, analytics
- **TODO**: Salvataggio in Supabase (attualmente solo mock)

### 5. Tab Account

- Select per: language, timezone, dateFormat, timeFormat
- **TODO**: Salvataggio in Supabase (attualmente solo mock)

### 6. Cambio Password

- Form per: current password, new password, confirm password
- Validazione: password >= 8 caratteri, corrispondenza
- Update via `supabase.auth.updateUser({ password })`

---

## 🗄️ Database

### Tabelle Utilizzate

**`profiles`**:

- `id`, `user_id`, `nome`, `cognome`, `email`, `phone`
- `avatar`, `avatar_url`
- `updated_at`

**Futuro** (da implementare):

- Tabella `user_settings` per notifiche, privacy, account settings

---

## ⚠️ Errori Possibili

1. **Profilo non trovato**: Errore quando `profiles` query fallisce
2. **Errore update password**: Errori da `supabase.auth.updateUser()`
3. **Errore update profilo**: Errori da `supabase.from('profiles').update()`

---

## 🔗 Dipendenze Critiche

- **Supabase Client**: `createClient()` da `@/lib/supabase/client`
- **Database**: `profiles` table
- **UI Components**: Card, Button, Input, Switch, Tabs, Select, Avatar
- **AvatarUploader**: Componente upload avatar

---

## 📝 Esempio Utilizzo

```typescript
// Accessibile via route: /dashboard/impostazioni
// Non richiede parametri
```

---

## 🐛 Problemi Identificati

1. **🟡 P4-001 Pattern**: Pagina impostazioni 949 righe (simile a WorkoutWizard)
2. **⚠️ Gestione 2FA**: Funzionalità 2FA non implementata (componente `two-factor-setup.tsx` presente ma non integrato)
3. **⚠️ Salvataggio notifiche/privacy/account**: TODO - salvataggio in Supabase non implementato (solo mock)
4. **⚠️ Validazione email**: Nessuna validazione formato email nel form profilo

---

## 📊 Metriche

- **Complessità Ciclomatica**: Alta (~15-20)
- **Dipendenze Esterne**: Supabase, UI Components
- **Side Effects**: Sì (database, auth)

---

## 🔄 Changelog

### 2025-01-29T19:00:00Z

- ✅ Documentazione iniziale creata
- ✅ Identificati problemi TODO e 2FA
- ✅ Mappate dipendenze database

---

**Stato**: ⚠️ DOCUMENTATO (Parzialmente Completo - TODO presenti)
