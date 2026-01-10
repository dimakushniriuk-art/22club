# 🔍 Report Verifica Supabase - 22Club

**Data verifica**: 2025-01-27  
**Progetto**: 22Club-NEW  
**Project ID**: `icibqnmtacibgnhaidlz`  
**Ambiente**: main PRODUCTION

## 📋 Stato API Keys (dal Dashboard)

### ✅ Chiavi Configurate

1. **`anon public` key**
   - ✅ Presente e configurata
   - ⏰ Ultima richiesta: 5 minuti fa (attività recente)
   - ⚠️ Raccomandazione: Usare "Publishable API keys" invece delle legacy keys
   - 🔒 Sicura per browser se RLS è abilitato e policies configurate

2. **`service_role secret` key**
   - ✅ Presente e configurata
   - ⚠️ Nessuna richiesta nelle ultime 24 ore
   - 🔒 ⚠️ **ATTENZIONE**: Questa chiave può bypassare RLS
   - ⚠️ Raccomandazione: Usare "Secret API keys" invece delle legacy keys

## 🔍 Verifiche da Eseguire

### 1. Verifica Configurazione Locale

Esegui lo script di verifica:

```bash
npm run db:verify-config
```

Oppure:

```bash
npx tsx scripts/verify-supabase-config.ts
```

Questo script verifica:

- ✅ Presenza variabili d'ambiente
- ✅ Connessione a Supabase
- ✅ Query tabella profiles
- ✅ RLS policies
- ✅ Profilo utente corrente

### 2. Verifica Profili nel Database

Esegui lo script di verifica profili:

```bash
npm run db:verify-profiles
```

Oppure usa le query SQL nel dashboard Supabase (vedi `docs/VERIFY_PROFILES.md`)

### 3. Query SQL da Eseguire nel Dashboard

#### Verifica Profili Totali

```sql
SELECT COUNT(*) as total_profiles FROM profiles;
```

#### Verifica Utenti Senza Profilo

```sql
SELECT
  u.id,
  u.email,
  u.created_at
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.user_id
WHERE p.id IS NULL;
```

#### Verifica Trigger handle_new_user

```sql
-- Verifica che il trigger esista
SELECT
  trigger_name,
  event_manipulation,
  event_object_table,
  action_statement
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created';

-- Verifica che la funzione esista
SELECT
  routine_name,
  routine_type
FROM information_schema.routines
WHERE routine_name = 'handle_new_user';
```

#### Verifica RLS Policies su profiles

```sql
SELECT
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'profiles';
```

## ⚠️ Problemi Potenziali Identificati

### 1. Service Role Key Non Utilizzata

- **Problema**: Nessuna richiesta nelle ultime 24 ore per `service_role` key
- **Impatto**: Se il progetto usa questa chiave per operazioni server-side, potrebbe indicare un problema
- **Verifica**: Controlla se ci sono API routes o server actions che usano `SUPABASE_SERVICE_ROLE_KEY`

### 2. Legacy API Keys

- **Problema**: Il progetto usa ancora le "Legacy API keys"
- **Raccomandazione**: Migrare a "Publishable and Secret API keys"
- **Nota**: Le legacy keys funzionano ancora, ma Supabase raccomanda di migrare

### 3. Possibile Problema Profilo Non Trovato

- **Sintomo**: Errore "Errore caricamento profilo" nel browser
- **Causa possibile**: Utente autenticato ma senza profilo corrispondente
- **Soluzione**: Verificare che il trigger `handle_new_user()` sia attivo

## 🔧 Azioni Consigliate

### Priorità Alta

1. ✅ **Verificare trigger `handle_new_user()`**
   - Eseguire query SQL sopra
   - Se non esiste, applicare migrazione `20250127_create_profile_trigger.sql`

2. ✅ **Verificare utenti senza profilo**
   - Eseguire query SQL sopra
   - Creare profili mancanti se necessario

3. ✅ **Verificare RLS policies**
   - Assicurarsi che le policy permettano SELECT su profiles per utenti autenticati

### Priorità Media

4. ⚠️ **Verificare uso service_role key**
   - Controllare se è necessaria per operazioni server-side
   - Se non usata, considerare di rimuoverla per sicurezza

5. 📝 **Considerare migrazione a nuove API keys**
   - Publishable API key invece di anon key
   - Secret API key invece di service_role key

## 📊 Statistiche Dashboard

- **Progetto**: 22Club-NEW
- **Ambiente**: main PRODUCTION
- **Ultima attività anon key**: 5 minuti fa
- **Ultima attività service_role key**: Nessuna nelle ultime 24 ore

## 🔗 Link Utili

- Dashboard API Keys: https://supabase.com/dashboard/project/icibqnmtacibgnhaidlz/settings/api-keys/legacy
- Documentazione Verifica Profili: `docs/VERIFY_PROFILES.md`
- Documentazione Fix Auth: `docs/FIX_AUTH_PROFILE_ISSUE.md`

## 📝 Note

- Le chiavi API sono visibili nel dashboard Supabase
- Le legacy keys sono ancora supportate ma deprecate
- Il progetto ID è: `icibqnmtacibgnhaidlz`
- L'URL del progetto dovrebbe essere: `https://icibqnmtacibgnhaidlz.supabase.co`
