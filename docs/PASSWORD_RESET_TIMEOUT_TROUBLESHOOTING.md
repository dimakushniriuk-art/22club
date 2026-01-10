# 🔧 Troubleshooting Reset Password Timeout

## Problema
Il reset password va in timeout dopo 30-60 secondi, ma potrebbe comunque aver cambiato la password.

## Verifica se la password è stata cambiata

### Metodo 1: Prova a fare login
1. Vai su `/login`
2. Inserisci l'email
3. Inserisci la **nuova password** che hai appena impostato
4. Se il login funziona → **La password è stata cambiata con successo!**
5. Se il login non funziona → La password non è stata cambiata, richiedi un nuovo link

### Metodo 2: Verifica tramite Supabase Studio
1. Apri Supabase Studio: `http://localhost:54323`
2. Vai su **Authentication** → **Users**
3. Trova l'utente per email
4. Controlla **Last Sign In** - se è recente, la password potrebbe essere stata cambiata

### Metodo 3: Verifica tramite database
```sql
-- Verifica ultimo aggiornamento utente
SELECT 
  id,
  email,
  updated_at,
  last_sign_in_at,
  email_confirmed_at
FROM auth.users
WHERE email = 'tua-email@example.com';
```

## Possibili cause del timeout

### 1. Problema di rete
- **Sintomo**: Timeout costante
- **Soluzione**: 
  - Verifica connessione internet
  - Controlla firewall/proxy
  - Prova da un'altra rete

### 2. Token di recovery scaduto
- **Sintomo**: "Link non valido o scaduto"
- **Soluzione**: 
  - Richiedi un nuovo link di reset
  - Verifica che `jwt_expiry` in `supabase/config.toml` sia almeno 3600 (1 ora)

### 3. Sessione non valida
- **Sintomo**: "Sessione scaduta"
- **Soluzione**: 
  - Il codice ora fa `refreshSession()` prima di `updateUser()`
  - Se persiste, richiedi un nuovo link

### 4. Supabase locale lento
- **Sintomo**: Timeout solo in sviluppo locale
- **Soluzione**: 
  - Riavvia Supabase: `npx supabase stop && npx supabase start`
  - Verifica che non ci siano altri processi che usano le porte
  - Controlla i log: `npx supabase logs`

### 5. Problema con updateUser API
- **Sintomo**: Timeout costante anche con rete stabile
- **Soluzione**: 
  - Verifica i log di Supabase: `npx supabase logs --db`
  - Controlla che non ci siano trigger o constraint che bloccano l'update
  - Esegui la migration: `20260109_verify_password_reset_flow.sql`

## Configurazione ottimale

### `supabase/config.toml`
```toml
[auth]
enabled = true
site_url = "http://localhost:3001"
additional_redirect_urls = [
  "http://localhost:3000",
  "http://localhost:3001"
]
jwt_expiry = 3600  # 1 ora (minimo per recovery token)
enable_refresh_token_rotation = true
```

### Timeout nel codice
- **Attuale**: 60 secondi (aumentato da 30)
- **Raccomandato**: 60-90 secondi per sviluppo locale
- **Produzione**: 30 secondi dovrebbero essere sufficienti

## Logging e Debug

### Console del browser
Cerca questi log:
```
[RESET PASSWORD] Inizio aggiornamento password...
[RESET PASSWORD] Utente autenticato: { userId, email }
[RESET PASSWORD] Risultato ricevuto: { hasData, hasError, errorMessage }
```

### Log Supabase
```bash
# Log generali
npx supabase logs

# Log database
npx supabase logs --db

# Log auth
npx supabase logs | grep -i auth
```

### Verifica sessione
Il codice ora:
1. Fa `refreshSession()` prima di `updateUser()`
2. Verifica l'utente con `getUser()` dopo il timeout
3. Suggerisce di provare a fare login se il timeout si verifica

## Workaround temporaneo

Se il timeout si verifica costantemente:

1. **Aumenta il timeout** (già fatto: 30s → 60s)
2. **Prova a fare login** con la nuova password anche se vedi il timeout
3. **Richiedi un nuovo link** se il login non funziona
4. **Usa il cambio password** da impostazioni (se già loggato) invece del reset

## Test completo

1. **Richiedi reset password**: `/forgot-password`
2. **Controlla email**: Inbucket `http://localhost:54324`
3. **Clicca link**: Dovrebbe aprire `/reset-password`
4. **Inserisci password**: Minimo 6 caratteri
5. **Attendi**: Anche se vedi timeout, prova a fare login
6. **Verifica**: Login con nuova password

## Note importanti

- ⚠️ **Il timeout non significa che la password non è stata cambiata**
- ✅ **Sempre provare a fare login dopo un timeout**
- 🔄 **Se il login non funziona, richiedi un nuovo link**
- 📝 **I log aiutano a capire cosa è successo**

## Supporto

Se il problema persiste:
1. Controlla i log di Supabase
2. Verifica la configurazione `supabase/config.toml`
3. Esegui la migration di verifica
4. Controlla che non ci siano errori nella console del browser
