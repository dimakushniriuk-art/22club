# 🚀 Guida Configurazione CLI Supabase

## Prerequisiti

Prima di iniziare, assicurati di avere:

- ✅ Un account Supabase attivo
- ✅ Un progetto Supabase creato
- ✅ Node.js installato (già presente)

---

## 📋 Step 1: Recupera le Credenziali Supabase

### 1.1 Vai sul Dashboard Supabase

1. Apri il browser e vai su: [https://app.supabase.com](https://app.supabase.com)
2. Fai login
3. Seleziona il tuo progetto

### 1.2 Recupera Project Reference ID

1. Nel dashboard, vai su **Settings** (⚙️)
2. Seleziona **General** nel menu laterale
3. Copia il **Reference ID** (esempio: `abc123xyz456`)
   - Sarà qualcosa tipo: `xyzabcdefgh`

### 1.3 Recupera l'URL e le chiavi API

1. Nel dashboard, vai su **Settings** (⚙️)
2. Seleziona **API** nel menu laterale
3. Copia questi valori:
   - **Project URL**: `https://xyzabcdefgh.supabase.co`
   - **anon public**: `eyJhbGc...` (chiave anonima pubblica)
   - **service_role**: `eyJhbGc...` (chiave di servizio - SEGRETA!)

### 1.4 Recupera la Database Password

1. Nel dashboard, vai su **Settings** (⚙️)
2. Seleziona **Database** nel menu laterale
3. Copia la **Database Password** (o resettala se non la ricordi)

---

## 📝 Step 2: Configura File .env.local

Esegui questi comandi nel terminale:

```powershell
# 1. Vai nella directory del progetto
cd "22club-setup"

# 2. Crea il file .env.local dal template
Copy-Item env.example .env.local

# 3. Apri il file .env.local con un editor
code .env.local
# Oppure: notepad .env.local
```

Modifica il file `.env.local` con i tuoi valori:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://xyzabcdefgh.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc... (la tua chiave anon)

# Push Notifications (opzionale per ora)
NEXT_PUBLIC_VAPID_KEY=your_vapid_public_key_here
VAPID_PRIVATE_KEY=your_vapid_private_key_here
VAPID_EMAIL=mailto:admin@22club.it

# Cron Job Secret
CRON_SECRET=22club-cron-secret
```

---

## 🔗 Step 3: Link il Progetto con Supabase CLI

Nel terminale PowerShell, esegui:

```powershell
# 1. Verifica che Supabase CLI funzioni
npx supabase --version

# 2. Fai login a Supabase (si aprirà il browser)
npx supabase login

# 3. Link il progetto con il tuo Reference ID
npx supabase link --project-ref YOUR_PROJECT_REF

# Esempio:
# npx supabase link --project-ref xyzabcdefgh

# Ti verrà chiesta la database password che hai recuperato prima
```

---

## ✅ Step 4: Verifica la Configurazione

```powershell
# Verifica che il link sia attivo
npx supabase projects list

# Dovresti vedere il tuo progetto nella lista
```

---

## 🗄️ Step 5: Applica le Migrazioni

Una volta configurato, esegui:

```powershell
# Pusha tutte le migrazioni al database
npx supabase db push

# Verifica che siano state applicate
npx supabase db remote --help
```

---

## 🔍 Troubleshooting

### Errore: "Cannot find project ref"

```powershell
# Ri-esegui il link con il flag --debug per vedere l'errore
npx supabase link --project-ref YOUR_PROJECT_REF --debug
```

### Errore: "Invalid database password"

1. Vai su Supabase Dashboard > Settings > Database
2. Clicca su **Reset database password**
3. Copia la nuova password
4. Ri-esegui: `npx supabase link --project-ref YOUR_PROJECT_REF`

### Errore: "Unknown config field"

✅ Questi warning sono normali e non bloccano l'esecuzione. Puoi ignorarli.

### Errore: "EADDRINUSE: address already in use"

```powershell
# Trova e termina il processo che usa la porta 3001
Get-Process -Name node | Stop-Process -Force

# Riavvia il server
npm run dev
```

---

## 📚 Comandi Utili

```powershell
# Mostra lo status del progetto
npx supabase status

# Resetta il database locale (se usi local dev)
npx supabase db reset

# Mostra le migrazioni applicate
npx supabase migration list

# Genera types TypeScript dal database
npx supabase gen types typescript --local > src/types/supabase-generated.ts
```

---

## ⚡ Quick Start (Riepilogo)

```powershell
# 1. Crea .env.local
Copy-Item env.example .env.local
code .env.local  # Modifica con i tuoi valori

# 2. Login
npx supabase login

# 3. Link progetto
npx supabase link --project-ref YOUR_PROJECT_REF

# 4. Pusha migrazioni
npx supabase db push

# 5. Avvia app
npm run dev
```

---

**Prossimo Step**: Una volta completata la configurazione, dimmi e procediamo con l'applicazione delle migrazioni! 🚀
