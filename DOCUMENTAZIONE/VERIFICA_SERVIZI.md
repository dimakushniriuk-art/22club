# 🔍 Report Verifica Servizi - 22Club

**Data verifica**: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")

---

## 📡 1. SERVER NEXT.JS

### Stato

- **Porta**: 3001
- **Endpoint Health**: `/api/health`
- **URL**: `http://localhost:3001`

### Verifica

Per verificare manualmente:

```powershell
Invoke-WebRequest -Uri "http://localhost:3001/api/health" -UseBasicParsing
```

### Note

- Il server dovrebbe essere avviato con `npm run dev`
- L'endpoint health restituisce informazioni su:
  - Status del server
  - Uptime
  - Uso memoria
  - Stato database (placeholder)

---

## ⚙️ 2. CONFIGURAZIONE SUPABASE

### Variabili Richieste

- `NEXT_PUBLIC_SUPABASE_URL`: URL del progetto Supabase
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Chiave anonima pubblica
- `SUPABASE_SERVICE_ROLE_KEY`: Chiave di servizio (opzionale, server-side)

### File di Configurazione

- **Template**: `env.example`
- **Configurazione**: `.env.local` (non committato)

### Verifica Configurazione

Eseguire:

```bash
npm run db:verify-config
```

Oppure:

```bash
npx tsx scripts/verify-supabase-config.ts
```

---

## 🔗 3. CONNESSIONE SUPABASE

### Test Disponibili

#### Test Base

```bash
npm run db:test
```

#### Verifica Configurazione

```bash
npm run db:verify-config
```

#### Verifica Profili

```bash
npm run db:verify-profiles
```

#### Verifica Completa Database

```bash
npm run db:verify-data-deep
```

#### Analisi RLS

```bash
npm run db:analyze-rls
```

### Componenti Verificati

1. **Autenticazione**: Sessione utente
2. **Database**: Query a tabelle principali
3. **RLS Policies**: Permessi e sicurezza
4. **Profili**: Esistenza e accessibilità

---

## 👥 4. PROFILI UTENTE

### Verifica

```bash
npm run db:verify-profiles
```

### Tabelle Verificate

- `profiles`: Profili utente
- `exercises`: Esercizi
- `appointments`: Appuntamenti
- `workout_plans`: Piani di allenamento
- `payments`: Pagamenti
- `notifications`: Notifiche

---

## 🛠️ SCRIPT DI VERIFICA COMPLETA

### Script Creati

1. **verify-all-services.ts**: Verifica completa di tutti i servizi

   ```bash
   npm run verify:all
   ```

2. **verify-services-simple.ts**: Versione semplificata con moduli Node.js nativi

3. **run-verification.ps1**: Script PowerShell per eseguire tutte le verifiche

### Utilizzo

#### Verifica Completa

```bash
npm run verify:all
```

#### Verifica Singola Supabase

```bash
npm run db:verify-config
```

#### Verifica Server

```powershell
Invoke-WebRequest -Uri "http://localhost:3001/api/health" -UseBasicParsing
```

---

## 📊 CHECKLIST VERIFICA

- [ ] Server Next.js avviato e risponde su porta 3001
- [ ] Endpoint `/api/health` funzionante
- [ ] File `.env.local` presente e configurato
- [ ] `NEXT_PUBLIC_SUPABASE_URL` configurato correttamente
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` configurato correttamente
- [ ] Connessione Supabase funzionante
- [ ] Query a `profiles` riuscite
- [ ] RLS policies configurate correttamente
- [ ] Profili utente accessibili

---

## 🔧 TROUBLESHOOTING

### Server non risponde

1. Verificare che il server sia avviato: `npm run dev`
2. Controllare la porta: dovrebbe essere 3001
3. Verificare che non ci siano errori nel terminale

### Supabase non configurato

1. Verificare che `.env.local` esista
2. Controllare che le variabili non contengano placeholder
3. Eseguire `npm run db:verify-config` per dettagli

### Errori di connessione

1. Verificare che l'URL Supabase sia corretto
2. Controllare che la chiave anonima sia valida
3. Verificare la connessione internet
4. Controllare le RLS policies se ci sono errori di permessi

---

## 📝 NOTE

- Tutti gli script di verifica sono disponibili in `scripts/`
- I report possono essere salvati in formato JSON
- Le verifiche possono essere eseguite singolarmente o tutte insieme
