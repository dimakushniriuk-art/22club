# 🔍 Diagnostica Errori Login

## Problema
Dopo hard reload, non riesci più a loggarti e vedi "9 Issues" in basso a sinistra.

## Passi per Diagnosticare

### 1. Apri la Console del Browser
1. Premi **F12** (o **Ctrl+Shift+I** su Windows/Linux, **Cmd+Option+I** su Mac)
2. Vai alla tab **Console**
3. Cerca errori in **rosso**

### 2. Errori Comuni da Cercare

#### A. Errori di Variabili d'Ambiente
```
Missing environment variable: NEXT_PUBLIC_SUPABASE_URL
Missing environment variable: NEXT_PUBLIC_SUPABASE_ANON_KEY
```

**Soluzione**: Verifica che il file `.env.local` esista e contenga:
```
NEXT_PUBLIC_SUPABASE_URL=https://tuo-progetto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=la-tua-anon-key
```

#### B. Errori di Build/Compilazione
```
Module not found: Can't resolve '@/...'
SyntaxError: Unexpected token
```

**Soluzione**: 
1. Ferma il server (`Ctrl+C`)
2. Esegui `npm run build` per vedere errori di build
3. Se ci sono errori, correggili prima di riavviare

#### C. Errori di Network/CORS
```
Failed to fetch
CORS policy blocked
NetworkError
```

**Soluzione**: Verifica che Supabase sia raggiungibile e che le variabili d'ambiente siano corrette.

#### D. Errori di Autenticazione
```
Invalid credentials
Email not confirmed
```

**Soluzione**: Verifica le credenziali o conferma l'email.

### 3. Verifica Variabili d'Ambiente

Aggiungi questo codice temporaneamente in `src/app/login/page.tsx` per verificare:

```typescript
useEffect(() => {
  console.log('=== VERIFICA VARIABILI AMBIENTE ===')
  console.log('NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ Presente' : '❌ Mancante')
  console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ Presente' : '❌ Mancante')
}, [])
```

### 4. Verifica Build

Esegui:
```bash
npm run build
```

Se ci sono errori, correggili prima di riavviare il server.

### 5. Pulisci Cache e Riavvia

```bash
# Pulisci cache Next.js
rm -rf .next

# Reinstalla dipendenze (se necessario)
npm install

# Riavvia il server
npm run dev
```

## Cosa Fare Dopo

1. **Copia tutti gli errori dalla console** e condividili
2. **Verifica le variabili d'ambiente** nel file `.env.local`
3. **Prova a fare build** per vedere se ci sono errori di compilazione
4. **Pulisci cache** e riavvia il server

## Informazioni da Condividere

Quando condividi gli errori, includi:
- ✅ Tutti gli errori dalla console del browser (tab Console)
- ✅ Il contenuto del file `.env.local` (senza mostrare le chiavi complete, solo i primi caratteri)
- ✅ L'output di `npm run build` se ci sono errori
- ✅ Quale browser stai usando (Chrome, Firefox, Edge, etc.)
