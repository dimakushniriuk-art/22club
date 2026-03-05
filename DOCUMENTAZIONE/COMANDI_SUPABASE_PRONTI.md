# 🚀 Comandi Supabase Pronti - 22Club-NEW

**Project ID**: `icibqnmtacibgnhaidlz`  
**Progetto**: 22Club-NEW

---

## 📋 Comandi Pronti all'Uso

### 1. 📝 Generare Types TypeScript (Senza Token!)

```powershell
npm run supabase:gen:types:direct
```

**Cosa fa**: Genera i types TypeScript dal database remoto e li salva in `src/lib/supabase/types.ts`

**Quando usarlo**: Dopo ogni modifica al database (tabelle, colonne, tipi)

**Output**: File `src/lib/supabase/types.ts` aggiornato

---

### 2. 👀 Vedere i Tuoi Progetti

```powershell
npx supabase projects list
```

**Cosa fa**: Mostra tutti i progetti Supabase a cui hai accesso

**Quando usarlo**: Per verificare autenticazione o vedere i progetti disponibili

**Output**: Lista progetti con ID, nome, regione, data creazione

---

### 3. 💾 Fare Backup del Database

**📚 Guida Completa**: Vedi `docs/GUIDA_BACKUP_COMPLETO.md` per tutte le opzioni dettagliate.

**🚀 Metodo Veloce (Script Automatico)**:

```powershell
npm run supabase:db:backup:complete
```

Questo script:

- ✅ Verifica se `pg_dump` è installato
- ✅ Chiede password in modo sicuro
- ✅ Crea backup completo automaticamente
- ✅ Salva in `backups/backup_completo_YYYY-MM-DD_HH-mm-ss.sql`

**📋 Opzioni Disponibili**:

1. **Dashboard Supabase** (più semplice, senza installazioni)
   - Vai su: https://supabase.com/dashboard/project/icibqnmtacibgnhaidlz/database/backups
   - Clicca "Create backup"

2. **Script Automatico** (se hai PostgreSQL installato)

   ```powershell
   npm run supabase:db:backup:complete
   ```

3. **pg_dump Manuale** (se hai PostgreSQL installato)

   ```powershell
   $date = Get-Date -Format "yyyy-MM-dd_HH-mm-ss"
   pg_dump "postgresql://postgres:[PASSWORD]@db.icibqnmtacibgnhaidlz.supabase.co:5432/postgres" > "backups\backup_$date.sql"
   ```

4. **Client SQL** (DBeaver, pgAdmin, TablePlus)
   - Connettiti usando la connection string dal dashboard
   - Usa la funzione "Export" o "Backup"

**Quando usarlo**:

- Prima di modifiche importanti
- Periodicamente per sicurezza
- Prima di migrazioni complesse

**Output**: File SQL completo con schema, dati, indici, RLS policies, funzioni, trigger, ecc.

---

### 4. 📤 Caricare Modifiche al Database

```powershell
npx supabase db push
```

**Cosa fa**: Carica le migrazioni dal tuo computer al database remoto (usa il progetto linkato automaticamente)

**Quando usarlo**: Dopo aver creato/modificato file di migrazione in `supabase/migrations/`

**Attenzione**: ⚠️ Modifica il database remoto! Usa con cautela.

**Prima di usarlo**: Fai sempre un backup!

---

### 5. 🔄 Sincronizzare Schema Locale (Scaricare dal Remoto)

```powershell
npx supabase db pull
```

**Cosa fa**: Scarica lo schema del database remoto e crea migrazioni locali (usa il progetto linkato automaticamente)

**Quando usarlo**:

- Quando il database è stato modificato da altri
- Per sincronizzare lo schema locale con quello remoto
- Per vedere le differenze

**Output**: Crea nuove migrazioni in `supabase/migrations/`

---

### 6. ⚡ Eseguire Query SQL

**Nota**: Il comando `db execute` non esiste nella CLI Supabase. Per eseguire SQL, usa una di queste opzioni:

**Opzione 1: Dashboard Supabase (Raccomandato)**

1. Vai su: https://supabase.com/dashboard/project/icibqnmtacibgnhaidlz/sql/new
2. Incolla il tuo SQL
3. Esegui

**Opzione 2: Usa psql direttamente**

```powershell
# Prima ottieni la connection string dal dashboard
# Settings → Database → Connection string
psql "postgresql://postgres:[PASSWORD]@db.icibqnmtacibgnhaidlz.supabase.co:5432/postgres" -f query.sql
```

**Opzione 3: Usa un client SQL**

- DBeaver, pgAdmin, TablePlus, ecc.
- Connection string dal dashboard Supabase

**Attenzione**: ⚠️ Modifica il database remoto! Verifica sempre il contenuto del file SQL prima di eseguirlo.

---

## 🔍 Comandi di Verifica e Informazioni

### Verificare Autenticazione

```powershell
npx supabase projects list
```

### Informazioni Progetto

```powershell
npx supabase projects get --project-ref icibqnmtacibgnhaidlz
```

### Vedere Chiavi API

```powershell
npx supabase projects api-keys --project-ref icibqnmtacibgnhaidlz
```

### Lista Funzioni RPC

```powershell
npx supabase functions list --project-ref icibqnmtacibgnhaidlz
```

---

## 📦 Comandi Utili per Sviluppo

### Generare Types e Verificare

```powershell
# 1. Genera types
npm run supabase:gen:types:direct

# 2. Verifica che non ci siano errori
npm run typecheck

# 3. Build per verificare tutto
npm run build
```

### Workflow Completo: Modifica Database → Aggiorna Types

```powershell
# 1. Fai backup (opzionale ma consigliato)
npx supabase db dump --project-ref icibqnmtacibgnhaidlz > backup_$(Get-Date -Format "yyyy-MM-dd").sql

# 2. Esegui modifiche SQL (es. da dashboard o file)
# ... fai le modifiche ...

# 3. Genera nuovi types
npm run supabase:gen:types:direct

# 4. Verifica
npm run typecheck
```

---

## 🛡️ Comandi di Sicurezza

### Backup Prima di Modifiche Importanti

```powershell
# Backup con data e ora
$timestamp = Get-Date -Format "yyyy-MM-dd_HH-mm-ss"
npx supabase db dump -f "backups/backup_$timestamp.sql"
```

### Verificare Differenze Schema

```powershell
# Sincronizza e vedi cosa è cambiato
npx supabase db pull --project-ref icibqnmtacibgnhaidlz
```

---

## 📝 Esempi Pratici

### Esempio 1: Ho modificato una tabella, aggiorno i types

```powershell
npm run supabase:gen:types:direct
npm run typecheck
```

### Esempio 2: Voglio eseguire un fix SQL dal file docs

```powershell
# Prima: backup
npx supabase db dump -f backup_prima_fix.sql

# Poi: esegui fix dal dashboard Supabase
# Vai su: https://supabase.com/dashboard/project/icibqnmtacibgnhaidlz/sql/new
# Copia il contenuto di docs/FIX_23_VERIFICA_FINALE.sql e incollalo nel dashboard

# Infine: aggiorna types
npm run supabase:gen:types:direct
```

### Esempio 3: Backup settimanale automatico

```powershell
$week = Get-Date -Format "yyyy-MM-WW"
npx supabase db dump -f "backups/backup_settimanale_$week.sql"
```

---

## ⚠️ Attenzione

**Comandi che MODIFICANO il database remoto** (usa con cautela):

- `npx supabase db push` - Carica migrazioni
- Esecuzione SQL tramite dashboard o psql

**Sempre fare backup prima di questi comandi!**

**Comandi SICURI** (solo lettura):

- `npx supabase projects list` - Solo visualizza
- `npx supabase db dump` - Solo backup (non modifica)
- `npx supabase db pull` - Solo sincronizza locale
- `npm run supabase:gen:types:direct` - Solo genera types

---

## 🎯 Quick Reference

| Operazione         | Comando NPM (Semplice)                | Comando Completo                                                      |
| ------------------ | ------------------------------------- | --------------------------------------------------------------------- |
| Genera types       | `npm run supabase:gen:types:direct`   | `npx supabase gen types typescript --project-id icibqnmtacibgnhaidlz` |
| Backup DB          | `npm run supabase:db:backup:complete` | Script automatico completo (vedi sezione 3)                           |
| Carica modifiche   | `npm run supabase:db:push`            | `npx supabase db push`                                                |
| Sincronizza schema | `npm run supabase:db:pull`            | `npx supabase db pull`                                                |
| Esegui SQL         | -                                     | Usa dashboard o psql (vedi sezione 6)                                 |
| Verifica auth      | `npm run supabase:projects:list`      | `npx supabase projects list`                                          |

**💡 Suggerimento**: Usa i comandi NPM (colonna sinistra) - sono più semplici e già configurati!

---

## 📚 File Correlati

- `docs/GUIDA_BACKUP_COMPLETO.md` - **Guida completa backup database** ⭐
- `docs/GUIDA_AUTENTICAZIONE_SUPABASE.md` - Guida completa autenticazione
- `docs/GUIDA_GENERAZIONE_TYPES.md` - Guida dettagliata types
- `scripts/backup-database-complete.ps1` - Script backup automatico completo
- `scripts/generate-types-direct.ps1` - Script generazione types

---

**Ultimo aggiornamento**: 2025-02-01  
**Project ID**: `icibqnmtacibgnhaidlz`  
**Progetto**: 22Club-NEW
