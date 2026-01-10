# 📚 Documentazione Tecnica: useUserSettings

**Percorso**: `src/hooks/use-user-settings.ts`  
**Tipo Modulo**: React Hook (Settings Hook, Client Component)  
**Stato Completamento**: ✅ 100%  
**Ultimo Aggiornamento**: 2025-02-02T00:00:00Z

---

## 📋 Panoramica

Hook per gestione impostazioni utente. Gestisce notifiche, privacy, account, e 2FA con persistenza database (`user_settings`).

---

## 🔧 Funzioni e Export

### 1. `useUserSettings`

**Classificazione**: React Hook, Settings Hook, Client Component, Async  
**Tipo**: `() => UseUserSettingsReturn`

**Parametri**: Nessuno

**Output**: Oggetto con:

- **Stato**:
  - `settings`: `UserSettings | null` - Impostazioni complete
    - `notifications`: Notifiche (email, push, sms, newClients, payments, appointments, messages)
    - `privacy`: Privacy (profileVisible, showEmail, showPhone, analytics)
    - `account`: Account (language, timezone, dateFormat, timeFormat)
    - `two_factor_enabled`: `boolean` - 2FA abilitato
    - `two_factor_secret`: `string | null` - Secret 2FA
    - `two_factor_backup_codes`: `string[] | null` - Backup codes
    - `two_factor_enabled_at`: `string | null` - Data abilitazione 2FA
  - `loading`: `boolean` - Stato caricamento
  - `error`: `string | null` - Errore
- **Funzioni**:
  - `loadSettings()`: `() => Promise<void>` - Ricarica impostazioni
  - `saveNotifications(notifications)`: `(notifications: NotificationSettings) => Promise<{ success: boolean, error?: string }>` - Salva notifiche
  - `savePrivacy(privacy)`: `(privacy: PrivacySettings) => Promise<{ success: boolean, error?: string }>` - Salva privacy
  - `saveAccount(account)`: `(account: AccountSettings) => Promise<{ success: boolean, error?: string }>` - Salva account
  - `saveTwoFactor(enabled, secret?, backupCodes?)`: `(enabled: boolean, secret?: string, backupCodes?: string[]) => Promise<{ success: boolean, error?: string }>` - Salva 2FA

**Descrizione**: Hook per impostazioni utente con:

- Caricamento da `user_settings` (RPC `get_or_create_user_settings` o query diretta)
- Fallback a valori default se record non esiste
- Salvataggio separato per categoria (notifications, privacy, account, 2FA)
- Gestione errori migration (colonne non esistenti)
- Auto-load al mount

---

## 🔄 Flusso Logico

### Load Settings

1. **Fetch Auth User**:
   - `supabase.auth.getUser()`

2. **Tentativo RPC**:
   - `supabase.rpc('get_or_create_user_settings', { p_user_id: userId })`

3. **Fallback Query Diretta**:
   - Se RPC fallisce → SELECT `user_settings` WHERE `user_id = userId`
   - Se record non esiste → INSERT con `user_id` (default JSONB)
   - Se colonne non esistono → usa valori default in memoria

4. **Parsing Settings**:
   - Estrae `notifications`, `privacy`, `account` (JSONB)
   - Estrae `two_factor_*` fields
   - Fallback a default se null

### Save Notifications/Privacy/Account

1. UPSERT `user_settings`:
   - `{ user_id, notifications }` (o privacy/account)
   - `onConflict: 'user_id'`

2. Aggiorna stato locale

3. Gestisce errore 42703 (colonna non esiste) → suggerisce migration

### Save Two Factor

1. Costruisce `updateData`:
   - Se `enabled` → `two_factor_secret`, `two_factor_backup_codes`, `two_factor_enabled_at = now`
   - Se `disabled` → `two_factor_secret = null`, `two_factor_backup_codes = null`, `two_factor_enabled_at = null`

2. UPSERT `user_settings`

3. Aggiorna stato locale

---

## 📊 Dipendenze

**Dipende da**: React (`useState`, `useEffect`, `useCallback`), `createClient` (Supabase)

**Utilizzato da**: Pagina impostazioni utente

---

## ⚠️ Note Tecniche

- **RPC Preferito**: Usa RPC `get_or_create_user_settings` se disponibile
- **Fallback Graceful**: Fallback a query diretta e valori default se necessario
- **Migration Check**: Gestisce errore 42703 (colonna non esiste) suggerendo migration
- **JSONB Columns**: Settings salvati come JSONB (notifications, privacy, account)

---

**Ultimo aggiornamento**: 2025-02-02T00:00:00Z
