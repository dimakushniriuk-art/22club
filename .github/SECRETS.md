# 🔐 GitHub Secrets Configuration

Questo documento descrive i secrets necessari per il funzionamento della pipeline CI/CD.

## Secrets Richiesti

### Vercel Deployment

- `VERCEL_TOKEN` - Token di accesso Vercel
- `VERCEL_ORG_ID` - ID organizzazione Vercel
- `VERCEL_PROJECT_ID` - ID progetto Vercel

### Supabase Database

- `SUPABASE_ACCESS_TOKEN` - Token di accesso Supabase
- `SUPABASE_PROJECT_REF` - Riferimento progetto Supabase

### Security Scanning (Opzionale)

- `SNYK_TOKEN` - Token per Snyk security scanning

## Come Configurare i Secrets

### 1. Vercel Secrets

1. Vai su [Vercel Dashboard](https://vercel.com/dashboard)
2. Vai su Settings > Tokens
3. Crea un nuovo token con scope appropriati
4. Copia il token e aggiungilo come `VERCEL_TOKEN`

Per ottenere `VERCEL_ORG_ID` e `VERCEL_PROJECT_ID`:

```bash
# Installa Vercel CLI
npm i -g vercel

# Login e link del progetto
vercel login
vercel link

# I valori saranno nel file .vercel/project.json
```

### 2. Supabase Secrets

1. Vai su [Supabase Dashboard](https://supabase.com/dashboard)
2. Seleziona il tuo progetto
3. Vai su Settings > API
4. Copia il `Project URL` per `SUPABASE_PROJECT_REF`
5. Vai su Settings > Access Tokens
6. Crea un nuovo token e copialo come `SUPABASE_ACCESS_TOKEN`

### 3. Aggiungere Secrets su GitHub

1. Vai su GitHub Repository > Settings > Secrets and variables > Actions
2. Clicca "New repository secret"
3. Aggiungi ogni secret con il nome e valore corrispondente

## Verifica Configurazione

Dopo aver configurato i secrets, puoi testare la pipeline:

```bash
# Testa la pipeline in locale (richiede act)
act push -j build_and_test

# Oppure fai un push su main per triggerare la pipeline
git push origin main
```

## Troubleshooting

### Vercel Deployment Fails

- Verifica che `VERCEL_TOKEN` abbia i permessi corretti
- Controlla che `VERCEL_ORG_ID` e `VERCEL_PROJECT_ID` siano corretti
- Assicurati che il progetto sia linkato correttamente

### Supabase Migrations Fail

- Verifica che `SUPABASE_ACCESS_TOKEN` sia valido
- Controlla che `SUPABASE_PROJECT_REF` sia corretto
- Assicurati che il progetto Supabase sia attivo

### Security Scanning Fails

- `SNYK_TOKEN` è opzionale, puoi rimuoverlo se non usi Snyk
- Verifica che il token abbia i permessi corretti

## Sicurezza

⚠️ **IMPORTANTE**: Non committare mai i secrets nel codice!

- I secrets sono crittografati da GitHub
- Sono disponibili solo durante l'esecuzione delle Actions
- Non sono visibili nei log delle Actions
