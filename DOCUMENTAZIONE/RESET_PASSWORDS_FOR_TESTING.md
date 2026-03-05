# 🔐 Reset Password per Testing - 22Club

## 📋 Utenti da Testare

1. **Trainer**: `b.francesco@22club.it`
2. **Admin**: `admin@22club.it`
3. **Athlete**: `dima.kushniriuk@gmail.com`

## 🔧 Procedura Reset Password

### Metodo 1: Dashboard Supabase (Consigliato)

1. **Accedi al Dashboard**
   - Vai su https://supabase.com/dashboard
   - Seleziona progetto: `icibqnmtacibgnhaidlz`

2. **Vai a Authentication → Users**
   - Clicca su "Users" nel menu laterale
   - Cerca l'utente per email

3. **Reset Password**
   - Clicca sull'utente
   - Clicca su "Reset Password" o "Update Password"
   - Imposta una nuova password (es: `Test123!`)
   - Salva

4. **Test Login**
   - Vai su http://localhost:3001/login
   - Inserisci email e nuova password
   - Verifica che il login funzioni

### Metodo 2: SQL Direct (Avanzato)

Esegui questa query nel SQL Editor:

```sql
-- Reset password per trainer
UPDATE auth.users 
SET encrypted_password = crypt('FrancescoB', gen_salt('bf'))
WHERE email = 'b.francesco@22club.it';

-- Reset password per admin
UPDATE auth.users 
SET encrypted_password = crypt('adminadmin', gen_salt('bf'))
WHERE email = 'admin@22club.it';

-- Reset password per athlete
UPDATE auth.users 
SET encrypted_password = crypt('dimon280894', gen_salt('bf'))
WHERE email = 'dima.kushniriuk@gmail.com';
```

**⚠️ Nota**: Questo metodo richiede conoscenza avanzata di PostgreSQL. Usa il Metodo 1 se possibile.

### Metodo 3: Via API (Programmatico)

Usa lo script TypeScript per resettare password:

```typescript
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Reset password
await supabase.auth.admin.updateUserById(userId, {
  password: 'nuova_password'
})
```

## ✅ Verifica Post-Reset

Dopo aver resettato la password:

1. **Test Login Manuale**
   - Vai su http://localhost:3001/login
   - Inserisci email e nuova password
   - Verifica redirect a `/post-login`
   - Verifica redirect finale in base al ruolo

2. **Verifica Console**
   - Apri DevTools → Console
   - Verifica log `[PERF]` senza errori
   - Verifica che `signInWithPassword` sia `(success)`

3. **Verifica Network**
   - Apri DevTools → Network
   - Verifica che `POST /auth/v1/token` restituisca 200
   - Verifica redirect a `/post-login`

## 🐛 Troubleshooting

### Problema: Password reset non funziona

**Soluzione**:
- Verifica che l'utente esista in `auth.users`
- Verifica che l'email sia corretta
- Prova a resettare via email (`/forgot-password`)

### Problema: Login ancora fallisce dopo reset

**Soluzione**:
- Verifica che la password sia stata salvata correttamente
- Controlla console per errori dettagliati
- Verifica RLS policies non bloccano l'accesso

### Problema: Redirect non funziona

**Soluzione**:
- Verifica che `/post-login` esista
- Verifica che AuthProvider carichi correttamente
- Controlla console per errori JavaScript
