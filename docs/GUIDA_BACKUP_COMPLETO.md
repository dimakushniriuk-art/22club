# 💾 Guida Completa Backup Database Supabase - 22Club

**Project ID**: `icibqnmtacibgnhaidlz`  
**Progetto**: 22Club-NEW

---

## 🎯 Metodi Disponibili per Backup Completo

Hai **4 opzioni** per creare un backup completo in SQL del database Supabase:

---

## ✅ OPZIONE 1: Dashboard Supabase (PIÙ SEMPLICE - RACCOMANDATO)

### Vantaggi

- ✅ Non richiede installazioni
- ✅ Interfaccia grafica intuitiva
- ✅ Backup completo con un click
- ✅ Funziona su qualsiasi sistema operativo

### Procedura

1. **Vai al Dashboard Supabase**

   ```
   https://supabase.com/dashboard/project/icibqnmtacibgnhaidlz
   ```

2. **Naviga a Database → Backups**
   - Menu laterale → **Database** → **Backups**
   - Oppure: https://supabase.com/dashboard/project/icibqnmtacibgnhaidlz/database/backups

3. **Crea Backup Manuale**
   - Clicca su **"Create backup"** o **"New backup"**
   - Attendi il completamento (può richiedere alcuni minuti)
   - Scarica il file SQL quando pronto

### ⚠️ Limitazioni

- I backup automatici sono disponibili solo su piani a pagamento
- I backup manuali potrebbero avere limiti di frequenza

---

## ✅ OPZIONE 2: pg_dump (POTENTE - RACCOMANDATO PER AUTOMAZIONE)

### Vantaggi

- ✅ Backup completo e dettagliato
- ✅ Scriptabile e automatizzabile
- ✅ Controllo totale sul processo
- ✅ Supporta compressione

### Prerequisiti

**Installa PostgreSQL** (include pg_dump):

#### Windows (PowerShell come Admin)

```powershell
# Opzione A: Chocolatey
choco install postgresql

# Opzione B: Download diretto
# Vai su: https://www.postgresql.org/download/windows/
# Scarica e installa PostgreSQL
```

#### Verifica Installazione

```powershell
pg_dump --version
```

### Procedura

1. **Ottieni Connection String**
   - Vai su: https://supabase.com/dashboard/project/icibqnmtacibgnhaidlz/settings/database
   - Scorri fino a **"Connection string"**
   - Copia la connection string in formato **URI mode**
   - Sostituisci `[YOUR-PASSWORD]` con la password del database

2. **Esegui Backup**

```powershell
# Backup base
$date = Get-Date -Format "yyyy-MM-dd_HH-mm-ss"
$backupFile = "backups\backup_$date.sql"

# Crea cartella backups se non esiste
New-Item -ItemType Directory -Force -Path "backups"

# Esegui backup (sostituisci [PASSWORD] con la password reale)
pg_dump "postgresql://postgres:[PASSWORD]@db.icibqnmtacibgnhaidlz.supabase.co:5432/postgres" > $backupFile
```

**Variante con compressione**:

```powershell
$date = Get-Date -Format "yyyy-MM-dd_HH-mm-ss"
$backupFile = "backups\backup_$date.sql.gz"

pg_dump "postgresql://postgres:[PASSWORD]@db.icibqnmtacibgnhaidlz.supabase.co:5432/postgres" | gzip > $backupFile
```

**Variante con opzioni avanzate** (schema completo, dati, permessi):

```powershell
$date = Get-Date -Format "yyyy-MM-dd_HH-mm-ss"
$backupFile = "backups\backup_completo_$date.sql"

pg_dump `
  --verbose `
  --clean `
  --if-exists `
  --create `
  --format=plain `
  --no-owner `
  --no-privileges `
  "postgresql://postgres:[PASSWORD]@db.icibqnmtacibgnhaidlz.supabase.co:5432/postgres" > $backupFile
```

### 🔒 Sicurezza Password

**Opzione A: Variabile d'ambiente** (più sicuro)

```powershell
# Imposta password come variabile
$env:PGPASSWORD = "tua-password-qui"

# Esegui backup (senza password nella connection string)
pg_dump "postgresql://postgres@db.icibqnmtacibgnhaidlz.supabase.co:5432/postgres" > backup.sql

# Rimuovi password dalla memoria
Remove-Item Env:\PGPASSWORD
```

**Opzione B: File .pgpass** (Windows: `%APPDATA%\postgresql\pgpass.conf`)

```
db.icibqnmtacibgnhaidlz.supabase.co:5432:postgres:postgres:tua-password
```

---

## ✅ OPZIONE 3: Client SQL (DBeaver, pgAdmin, TablePlus)

### Vantaggi

- ✅ Interfaccia grafica
- ✅ Visualizzazione dati durante backup
- ✅ Funzionalità avanzate

### Procedura con DBeaver (Gratuito)

1. **Installa DBeaver**
   - Download: https://dbeaver.io/download/
   - Installa e avvia

2. **Crea Connessione**
   - Nuova connessione → PostgreSQL
   - **Host**: `db.icibqnmtacibgnhaidlz.supabase.co`
   - **Port**: `5432`
   - **Database**: `postgres`
   - **Username**: `postgres`
   - **Password**: (password del database)
   - Test connessione → Finish

3. **Esegui Backup**
   - Click destro sul database → **Tools** → **Backup Database**
   - Seleziona opzioni:
     - ✅ Include schema
     - ✅ Include data
     - ✅ Include privileges
   - Scegli percorso file
   - Esegui backup

### Procedura con TablePlus

1. **Installa TablePlus**
   - Download: https://tableplus.com/
   - Installa e avvia

2. **Crea Connessione**
   - Nuova connessione → PostgreSQL
   - Compila i dati di connessione
   - Salva

3. **Esegui Backup**
   - Click destro sul database → **Export** → **SQL**
   - Seleziona tutte le tabelle
   - Scegli percorso
   - Esegui

---

## ✅ OPZIONE 4: Script PowerShell Automatico

Ho creato uno script che automatizza il processo. Vedi `scripts/backup-database-complete.ps1`

### Uso

```powershell
npm run supabase:db:backup:complete
```

Oppure direttamente:

```powershell
.\scripts\backup-database-complete.ps1
```

### Funzionalità

- ✅ Verifica se pg_dump è installato
- ✅ Chiede password in modo sicuro
- ✅ Crea cartella backups automaticamente
- ✅ Nome file con timestamp
- ✅ Verifica integrità backup
- ✅ Mostra dimensione file

---

## 📋 Checklist Backup Completo

Un backup completo dovrebbe includere:

- ✅ **Schema completo** (tutte le tabelle, viste, funzioni, trigger)
- ✅ **Dati** (tutti i record)
- ✅ **Indici** (per performance)
- ✅ **Foreign Keys** (relazioni)
- ✅ **RLS Policies** (Row Level Security)
- ✅ **Funzioni e Stored Procedures**
- ✅ **Trigger**
- ✅ **Sequenze** (per auto-increment)
- ✅ **Tipi personalizzati** (ENUM, custom types)

---

## 🔍 Verifica Backup

Dopo aver creato il backup, verifica che sia completo:

```sql
-- Conta tabelle nel backup (dovrebbe essere ~50+ per 22Club)
SELECT COUNT(*) FROM information_schema.tables
WHERE table_schema = 'public';

-- Verifica che ci siano dati
SELECT COUNT(*) FROM profiles;
SELECT COUNT(*) FROM workout_logs;
-- ... altre tabelle importanti
```

---

## 📦 Struttura Cartella Backups Consigliata

```
backups/
├── 2025-02-01_backup_completo.sql
├── 2025-02-01_backup_schema_only.sql
├── 2025-01-15_backup_completo.sql
└── README.md (documentazione backup)
```

---

## ⚠️ Best Practices

1. **Frequenza Backup**
   - Prima di modifiche importanti: **SEMPRE**
   - Sviluppo attivo: **Giornaliero**
   - Produzione: **Settimanale** (o usa backup automatici Supabase)

2. **Sicurezza**
   - ⚠️ **NON committare** file di backup nel repository
   - ⚠️ **NON condividere** file di backup pubblicamente
   - ⚠️ **Cripta** backup se contengono dati sensibili
   - Aggiungi `backups/` a `.gitignore`

3. **Verifica**
   - Verifica sempre che il backup sia completo
   - Testa il restore su un database di test
   - Mantieni almeno 3 backup recenti

4. **Automazione**
   - Crea script schedulati (Task Scheduler su Windows)
   - Usa variabili d'ambiente per password
   - Logga tutte le operazioni di backup

---

## 🚀 Quick Start (Metodo Veloce)

**Se vuoi fare un backup SUBITO senza installare nulla**:

1. Vai su: https://supabase.com/dashboard/project/icibqnmtacibgnhaidlz/database/backups
2. Clicca "Create backup"
3. Scarica quando pronto

**Fine!** ✅

---

## 📚 File Correlati

- `scripts/backup-database-complete.ps1` - Script automatico completo
- `scripts/backup-database.ps1` - Script informativo (legacy)
- `docs/COMANDI_SUPABASE_PRONTI.md` - Altri comandi Supabase

---

**Ultimo aggiornamento**: 2025-02-01  
**Project ID**: `icibqnmtacibgnhaidlz`  
**Progetto**: 22Club-NEW
