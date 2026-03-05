# 🔍 Debug Client Supabase - Guida

## Problema
Errore vuoto `{}` durante caricamento profilo nel client Supabase.

## Possibili Cause

### 1. Mock Client Attivo
Se le variabili d'ambiente non sono configurate correttamente, il client usa un mock che restituisce errori vuoti.

**Verifica**:
- Apri la console del browser (F12)
- Esegui: `console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)`
- Se è `undefined` o contiene "mock", il problema è qui

**Fix**: Verifica che `.env.local` contenga:
```
NEXT_PUBLIC_SUPABASE_URL=https://tuo-progetto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=la-tua-anon-key
```

### 2. Sessione Non Valida
Il token JWT potrebbe essere scaduto o non valido.

**Verifica**:
- Controlla i log `[AUTH PROVIDER] Session details:`
- Verifica `hasAccessToken: true`
- Verifica `tokenLength > 0`

**Fix**: Fai logout e login di nuovo.

### 3. Problema di Rete
La query potrebbe fallire per problemi di rete.

**Verifica**:
- Apri Network tab nella console (F12)
- Cerca richieste a Supabase
- Verifica se ci sono errori 4xx o 5xx

### 4. Policy RLS Non Funziona
La policy potrebbe non essere applicata correttamente.

**Verifica**:
- Esegui `docs/VERIFICA_POLICIES_SEMPLICE.sql`
- Verifica che "Users can view own profile" esista

**Fix**: Esegui `docs/FIX_POLICY_PROFILES_IMMEDIATO.sql`

## Test Rapido

1. **Verifica Configurazione**:
   ```javascript
   // Nella console del browser
   console.log('URL:', process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 30))
   console.log('Key:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.substring(0, 20))
   ```

2. **Verifica Sessione**:
   ```javascript
   // Nella console del browser
   import { supabase } from '@/lib/supabase/client'
   const { data: { session } } = await supabase.auth.getSession()
   console.log('Session:', session)
   ```

3. **Test Query Diretta**:
   ```javascript
   // Nella console del browser (dopo login)
   const { data, error } = await supabase
     .from('profiles')
     .select('*')
     .eq('user_id', session.user.id)
     .single()
   console.log('Data:', data)
   console.log('Error:', error)
   ```

## Prossimi Passi

1. Esegui i test sopra nella console del browser
2. Condividi i risultati
3. Verifica i log dettagliati nella console
