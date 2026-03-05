# 🔐 Guida Autenticazione Supabase CLI - Spiegazione Semplice

## 📖 Cos'è l'Autenticazione?

L'autenticazione è come avere una **chiave speciale** che ti permette di accedere al tuo progetto Supabase direttamente dal computer, senza dover inserire password ogni volta.

**In parole semplici**:

- Prima dovevi inserire il token ogni volta (come una password)
- Ora il token è salvato sul tuo computer
- Puoi fare operazioni sul database senza dover reinserire nulla

---

## ✅ Come Verificare se Sei Autenticato

### Metodo 1: Comando Rapido

```powershell
npx supabase projects list
```

**Se vedi la lista dei tuoi progetti** → ✅ Sei autenticato!  
**Se vedi "Unauthorized"** → ❌ Non sei autenticato

### Metodo 2: Script Automatico

```powershell
npm run supabase:auth:setup
```

Lo script ti dirà automaticamente se sei già autenticato o meno.

---

## 🎯 Cosa Puoi Fare Ora che Sei Autenticato

### 1. 📝 Generare Types TypeScript (Senza Token!)

```powershell
npm run supabase:gen:types:direct
```

**Prima**: Dovevi inserire il token ogni volta  
**Ora**: Funziona automaticamente! 🎉

### 2. 📊 Vedere i Tuoi Progetti

```powershell
npx supabase projects list
```

Vedi tutti i progetti Supabase a cui hai accesso.

### 3. 🔍 Informazioni sul Progetto

```powershell
npx supabase projects api-keys --project-ref icibqnmtacibgnhaidlz
```

Vedi le chiavi API del progetto.

### 4. 📥 Scaricare il Database (Backup)

```powershell
npx supabase db dump --project-ref icibqnmtacibgnhaidlz > backup.sql
```

Crea un backup completo del database.

### 5. 📤 Caricare Migrazioni

```powershell
npx supabase db push --project-ref icibqnmtacibgnhaidlz
```

Carica le modifiche al database dal tuo computer.

### 6. 🔄 Sincronizzare Schema Locale

```powershell
npx supabase db pull --project-ref icibqnmtacibgnhaidlz
```

Scarica lo schema del database remoto sul tuo computer.

### 7. 🗄️ Eseguire Query SQL

```powershell
npx supabase db execute --project-ref icibqnmtacibgnhaidlz --file query.sql
```

Esegue file SQL direttamente sul database remoto.

---

## 🔑 A Cosa Serve in Pratica?

### Scenario 1: Sviluppo Locale

**Prima** (senza autenticazione):

- Devi copiare manualmente i types dal dashboard
- Devi inserire il token ogni volta
- Operazioni lente e ripetitive

**Ora** (con autenticazione):

- Generi i types con un comando: `npm run supabase:gen:types:direct`
- Tutto automatico, niente token da inserire
- Risparmi tempo! ⏱️

### Scenario 2: Aggiornamento Database

**Prima**:

- Devi andare sul dashboard web
- Copiare/incollare SQL manualmente
- Controllare ogni passaggio

**Ora**:

- Modifichi i file SQL localmente
- Carichi tutto con: `npx supabase db push`
- Più veloce e sicuro! 🚀

### Scenario 3: Backup e Ripristino

**Prima**:

- Devi usare l'interfaccia web
- Processo manuale e lento

**Ora**:

- Backup: `npx supabase db dump`
- Ripristino: `npx supabase db restore`
- Automatizzabile! 🤖

---

## 🛠️ Comandi Utili Disponibili

### Verifica Stato

```powershell
# Verifica autenticazione
npx supabase projects list

# Vedi informazioni progetto
npx supabase projects get --project-ref icibqnmtacibgnhaidlz
```

### Gestione Database

```powershell
# Genera types (quello che usiamo spesso!)
npm run supabase:gen:types:direct

# Backup database
npx supabase db dump --project-ref icibqnmtacibgnhaidlz > backup.sql

# Carica migrazioni
npx supabase db push --project-ref icibqnmtacibgnhaidlz

# Sincronizza schema
npx supabase db pull --project-ref icibqnmtacibgnhaidlz
```

### Gestione Funzioni

```powershell
# Lista funzioni RPC
npx supabase functions list --project-ref icibqnmtacibgnhaidlz

# Deploy funzione
npx supabase functions deploy nome-funzione --project-ref icibqnmtacibgnhaidlz
```

---

## 🔒 Sicurezza

**Il token è salvato in modo sicuro:**

- Non è nel codice del progetto
- Non viene committato su Git
- È salvato nel profilo utente del sistema
- Solo tu puoi usarlo

**Dove è salvato:**

- Windows: `%APPDATA%\supabase\`
- Il token è criptato e protetto

---

## ❓ FAQ

### Q: Devo rifare l'autenticazione ogni volta?

**A:** No! Una volta fatto, rimane salvata. A meno che:

- Non cambi computer
- Non scada il token (raramente)
- Non lo rimuovi manualmente

### Q: È sicuro?

**A:** Sì! Il token è salvato localmente sul tuo computer, non nel progetto. È come avere una password salvata nel browser.

### Q: Cosa succede se perdo l'accesso?

**A:** Puoi rigenerare un nuovo token dal dashboard e rifare `npm run supabase:auth:setup`

### Q: Posso usare più progetti?

**A:** Sì! L'autenticazione ti dà accesso a tutti i progetti Supabase a cui hai permessi.

---

## 📋 Riepilogo

**In 3 punti:**

1. **Autenticazione = Chiave salvata** sul tuo computer
2. **Ti permette** di fare operazioni sul database senza inserire token ogni volta
3. **Risparmia tempo** e rende il lavoro più fluido

**Comando più usato:**

```powershell
npm run supabase:gen:types:direct
```

Questo genera i types TypeScript dal database remoto, automaticamente! 🎯
