# 🔍 Debug: Esercizi non visibili

## Problema

Gli esercizi non sono visibili nella pagina `/dashboard/esercizi` anche se ci sono 121 esercizi nel database.

## Possibili cause

### 1. **Problema RLS (Row Level Security)**

- Policy RLS troppo restrittive
- Policy mancanti o duplicate
- Ricorsione RLS

### 2. **Problema codice**

- API route `/api/exercises` restituisce errore
- Fallback Supabase client non funziona
- Problema con sessione/autenticazione

## 🔧 Test da eseguire

### Test 1: Verifica console browser

1. Apri `/dashboard/esercizi`
2. Apri DevTools (F12)
3. Vai su **Console**
4. Cerca errori rossi
5. Vai su **Network**
6. Cerca chiamata a `/api/exercises`
7. Controlla:
   - Status code (200, 401, 500?)
   - Response body
   - Errori CORS?

### Test 2: Verifica API route direttamente

Apri in browser:

```
http://localhost:3001/api/exercises
```

Dovresti vedere:

- Se autenticato: `{"data":[...]}`
- Se non autenticato: `{"error":"Non autenticato"}`

### Test 3: Verifica SQL (RLS)

Esegui in Supabase SQL Editor:

```sql
-- File: 20260122_test_exercises_api.sql
```

Controlla:

- Quanti esercizi sono visibili con RLS?
- Quali policy sono attive?

### Test 4: Test fallback Supabase

Apri console browser e esegui:

```javascript
// Test diretto Supabase client
const { createClient } = await import('@/lib/supabase/client')
const supabase = createClient()

const { data, error } = await supabase.from('exercises').select('*').limit(5)

console.log('Data:', data)
console.log('Error:', error)
```

## 📊 Risultati attesi

### Se problema è RLS:

- Console browser: Nessun errore JavaScript
- Network: `/api/exercises` restituisce 200 ma `data: []`
- SQL test: 0 esercizi visibili con RLS
- **Soluzione**: Esegui `20260122_fix_exercises_rls.sql`

### Se problema è codice:

- Console browser: Errori JavaScript visibili
- Network: `/api/exercises` restituisce 401/500
- SQL test: Esercizi visibili con RLS
- **Soluzione**: Fix codice (sessione, API route, ecc.)

## 🎯 Prossimi passi

1. Esegui Test 1 (console browser) e condividi risultati
2. Esegui Test 2 (API route) e condividi risultati
3. Esegui Test 3 (SQL) e condividi risultati
4. In base ai risultati, applica fix appropriato
