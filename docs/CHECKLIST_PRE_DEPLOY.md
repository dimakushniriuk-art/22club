# 📋 Checklist Completa Pre-Deploy - 22Club

Lista organizzata per categoria. Comando unico per eseguirli tutti alla fine.

---

## 📝 Categoria 1: Codice e Qualità

### 1.1 TypeScript

```bash
npm run typecheck
```

**Cosa fa**: Verifica errori TypeScript nel progetto.  
**Fallisce se**: Ci sono errori di tipo (tipi mancanti, incompatibili, proprietà inesistenti, ecc.).  
**Fix**: Correggere gli errori TypeScript indicati nell'output.  
**Nota**: Essenziale prima di ogni deploy.

### 1.2 ESLint

```bash
npm run lint
```

**Cosa fa**: Analisi statica del codice per problemi e best practices.  
**Fallisce se**: Errori o warning (se `--max-warnings=0`).  
**Fix rapido**: `npm run lint:fix` (corregge automaticamente i problemi risolvibili).  
**Nota**: Verifica stile codice, import non usati, variabili non usate, anti-pattern.

### 1.3 Formattazione

```bash
npm run format:check
```

**Cosa fa**: Verifica che il codice sia formattato con Prettier (solo controllo, non modifica).  
**Fallisce se**: Codice non formattato secondo le regole Prettier.  
**Fix rapido**: `npm run format` (formatta automaticamente tutto il codice).  
**Nota**: Formattazione consistente migliora la leggibilità e riduce conflitti Git.

### 1.4 Auto-fix Linting (Opzionale)

```bash
npm run lint:fix
```

**Cosa fa**: Corregge automaticamente i problemi ESLint risolvibili.  
**Quando usare**: Dopo `npm run lint` se ci sono problemi risolvibili automaticamente.  
**Nota**: Non corregge tutti i problemi, solo quelli con fix automatico disponibile.

---

## 🧪 Categoria 2: Test

### 2.1 Unit Test

```bash
npm run test:run
```

**Cosa fa**: Esegue tutti i test unitari una volta (Vitest).  
**Fallisce se**: Test falliscono o ci sono errori nei test.  
**Nota**: Verifica che tutti i test passino (target: 368/368 o superiore).  
**Tempo stimato**: 30-60 secondi.  
**Fix**: Correggere i test falliti o il codice testato.

---

## 🏗️ Categoria 3: Build

### 3.1 Build Produzione

```bash
npm run build
```

**Cosa fa**: Compila l'app Next.js per produzione.  
**Fallisce se**: Errori di build, dipendenze mancanti, errori TypeScript, problemi di import.  
**Nota**: Verifica che il build sia completato con successo. Questo è il test definitivo che tutto compila correttamente.  
**Tempo stimato**: 1-3 minuti.  
**Output**: Cartella `.next` con build di produzione ottimizzata.

---

## 🗄️ Categoria 4: Database e Supabase

**⚠️ IMPORTANTE**: Questi comandi sono **solo di verifica (lettura)**. Non modificano il database, tranne `npx supabase db push` e `npm run db:repair-migrations`.

### 4.1 Verifica Configurazione Supabase

```bash
npm run db:verify-config
```

**Cosa fa**: Verifica variabili d'ambiente e connessione a Supabase.  
**Fallisce se**: Variabili mancanti (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`) o connessione fallita.  
**Nota**: Solo lettura, non modifica nulla.  
**Requisito**: Richiede `.env.local` con variabili Supabase configurate.

### 4.2 Analisi Completa Supabase

```bash
npm run db:analyze-complete
```

**Cosa fa**: Analizza tabelle, migrazioni, RLS policies, funzioni, trigger, storage.  
**Fallisce se**: Problemi strutturali nel database o connessione fallita.  
**Output**: Report dettagliato JSON (`supabase-analysis-report.json`) con stato completo del database.  
**Nota**: Solo lettura, non modifica nulla.  
**Tempo stimato**: 10-30 secondi.

### 4.3 Verifica Dati Database

```bash
npm run db:verify-data-deep
```

**Cosa fa**: Verifica accessibilità tabelle e dati (conteggi, integrità).  
**Fallisce se**: Problemi di accesso, RLS troppo restrittive, o errori di query.  
**Nota**: Solo lettura, non modifica nulla.  
**Output**: Report con conteggi e statistiche dei dati.

### 4.4 Verifica Differenze Schema (se modifichi schema DB)

```bash
npx supabase db diff
```

**Cosa fa**: Mostra differenze tra schema locale e remoto.  
**Quando**: Prima di creare nuove migrazioni dopo modifiche allo schema.  
**Output**: SQL delle differenze.  
**Nota**: Richiede Docker Desktop avviato (se sviluppo locale).  
**⚠️ Solo lettura**: Non applica modifiche, solo mostra differenze.

### 4.5 Verifica Stato Migrazioni (se modifichi schema DB)

```bash
npx supabase migration list
```

**Cosa fa**: Elenca migrazioni e il loro stato (applied/reverted).  
**Quando**: Prima di applicare migrazioni per vedere quali sono pendenti.  
**Output**: Lista migrazioni con stato.  
**Action**: Se ci sono migrazioni da applicare, usa `npx supabase db push`.

### 4.6 Applica Migrazioni (se modifichi schema DB) ⚠️ MODIFICA DATABASE

```bash
npx supabase db push
```

**Cosa fa**: Applica migrazioni pendenti al database remoto.  
**Quando**: Dopo aver creato/modificato migrazioni nello schema database.  
**Fallisce se**: Migrazioni in conflitto, errori SQL, o problemi di connessione.  
**⚠️ ATTENZIONE**: **Questo comando modifica il database remoto**. Usa solo se hai modificato lo schema.  
**Nota**: Esegui sempre `npx supabase db diff` prima per vedere cosa verrà applicato.

### 4.7 Ripara Migrazioni (se necessario) ⚠️ MODIFICA DATABASE

```bash
npm run db:repair-migrations
```

**Cosa fa**: Ripara disallineamenti tra migrazioni locali e remote.  
**Quando**: Solo se `npx supabase db push` fallisce per migrazioni disallineate.  
**⚠️ WARNING**: Usa solo se necessario. Modifica lo stato delle migrazioni nel database.  
**Nota**: Script PowerShell che marca migrazioni come "applied" o "reverted" per allineare locale e remoto.

---

## 🌐 Categoria 5: Servizi e Integrazioni

### 5.1 Verifica Tutti i Servizi

```bash
npm run verify:all
```

**Cosa fa**: Verifica comunicazione con tutti i servizi (Next.js, Supabase, Database, Profili).  
**Fallisce se**: Servizi non raggiungibili o mal configurati.  
**Output**: Report completo dello stato dei servizi (5/5 servizi OK).  
**Nota**: Solo lettura, non modifica nulla.  
**Requisito**: Richiede `.env.local` con variabili Supabase configurate.  
**Tempo stimato**: 5-15 secondi.

---

## 🎯 Categoria 6: Check Completo Pre-Deploy

### 6.1 Pre-Deploy Check Completo

```bash
npm run pre-deploy
```

**Cosa fa**: Esegue tutti i controlli automatici:

- Package.json
- File di configurazione (environment files)
- Build files
- Documentazione
- TypeScript check
- ESLint check
- Test run
- Build check

**Fallisce se**: Uno dei controlli fallisce.  
**Output**: Score finale (es. 9/9 checks passed).  
**Nota**: Questo è il controllo finale che verifica tutto prima del deploy.  
**Tempo stimato**: 2-4 minuti.

---

## 🚀 Categoria 7: Script Unico Completo (Nuovo)

### 7.1 Check All - Tutti i Controlli in Sequenza

```bash
npm run check:all
```

**Cosa fa**: Esegue automaticamente tutti i controlli delle categorie 1-6 in sequenza:

- Categoria 1: Formattazione e Lint (format:check, lint, lint:fix opzionale)
- Categoria 2: TypeScript (typecheck)
- Categoria 3: Test (test:run)
- Categoria 4: Build (build)
- Categoria 5: Database/Supabase (opzionali, solo se .env.local esiste)
- Categoria 6: Servizi (verify:all, opzionale)
- Categoria 7: Pre-Deploy Finale (pre-deploy)

**Output**: Riepilogo finale con statistiche:

- Controlli Obbligatori: X/Y passati
- Controlli Opzionali: X/Y passati
- Messaggio finale di successo/errore

**Nota**: Questo è il comando principale da usare prima di ogni deploy.  
**Tempo stimato**: 3-5 minuti.

### 7.2 Update Sviluppo - Documentazione Automatica

```bash
npm run update:sviluppo
```

**Cosa fa**: Aggiorna `ai_memory/sviluppo.md` con i fix completati:

- Aggiorna timestamp
- Aggiunge nuova sezione con dettagli implementazione
- Documenta automaticamente il lavoro svolto

**Quando usare**: Dopo aver completato modifiche/fix per documentare il lavoro.  
**Nota**: Esegue anche `check:all` (opzionale) per raccogliere informazioni sui risultati.

---

## 📋 Workflow Consigliato

### Scenario A: Modifica Codice (NO Database)

**Quando**: Hai modificato solo file TypeScript/React/CSS, nessuna modifica al database.

```bash
# 1. Formatta codice
npm run format

# 2. Fix ESLint automatici
npm run lint:fix

# 3. Verifica TypeScript
npm run typecheck

# 4. Esegui test
npm run test:run

# 5. Build
npm run build

# 6. Check completo (OPPURE usa check:all per tutto insieme)
npm run check:all

# 7. Se tutto ok, aggiorna documentazione
npm run update:sviluppo
```

### Scenario B: Modifica Database/Supabase

**Quando**: Hai modificato lo schema del database, creato nuove tabelle, modificato RLS, ecc.

```bash
# 1. Verifica differenze schema
npx supabase db diff

# 2. Crea migrazione (se necessario)
# (crea file in supabase/migrations/ manualmente o con CLI)

# 3. Verifica migrazioni
npx supabase migration list

# 4. Applica migrazioni (se necessario)
npx supabase db push

# 5. Verifica database
npm run db:analyze-complete
npm run db:verify-data-deep

# 6. Verifica servizi
npm run verify:all

# 7. Test codice
npm run typecheck
npm run lint
npm run test:run
npm run build

# 8. Check completo
npm run check:all

# 9. Se tutto ok, aggiorna documentazione
npm run update:sviluppo
```

### Scenario C: Deploy Completo (Tutto)

**Quando**: Prima di fare deploy in produzione, dopo modifiche significative.

```bash
# 1. Formatta e fix
npm run format
npm run lint:fix

# 2. Verifica database (se modifiche)
npm run db:analyze-complete
npx supabase db diff  # (se hai modificato schema)

# 3. Test e build
npm run typecheck
npm run test:run
npm run build

# 4. Verifica servizi
npm run verify:all

# 5. Check finale completo
npm run check:all

# 6. Pre-deploy (verifica finale)
npm run pre-deploy

# 7. Se tutto ok, aggiorna documentazione
npm run update:sviluppo

# 8. Deploy
vercel --prod
```

---

## ✅ Checklist Rapida Pre-Deploy

Prima di ogni deploy, verifica:

- [ ] `npm run format` - Codice formattato
- [ ] `npm run lint` - Nessun errore ESLint
- [ ] `npm run typecheck` - Nessun errore TypeScript
- [ ] `npm run test:run` - Tutti i test passano
- [ ] `npm run build` - Build completato
- [ ] `npm run verify:all` - Servizi funzionanti (opzionale se .env.local non disponibile)
- [ ] `npx supabase db diff` - Nessuna migrazione pendente (solo se modificato DB)
- [ ] `npm run check:all` - Tutti i controlli passati
- [ ] `npm run pre-deploy` - Tutti i check passati (9/9)

**OPPURE usa semplicemente:**

```bash
npm run check:all
```

Questo esegue automaticamente la maggior parte dei controlli sopra.

---

## 📊 Quando Eseguire Cosa

| Modifica                      | Controlli Necessari                                                                                                                               |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Codice TypeScript/React**   | Format, Lint, TypeCheck, Test, Build, Check:All, Pre-Deploy                                                                                       |
| **Stile CSS/Tailwind**        | Format, Lint, Build, Check:All, Pre-Deploy                                                                                                        |
| **Schema Database**           | DB Diff, Migrations List, DB Push (se necessario), DB Analyze, DB Verify, Format, Lint, TypeCheck, Test, Build, Verify All, Check:All, Pre-Deploy |
| **Configurazione**            | TypeCheck, Lint, Build, Verify All, Check:All, Pre-Deploy                                                                                         |
| **Dipendenze (package.json)** | Test, Build, Verify All, Check:All, Pre-Deploy                                                                                                    |
| **Variabili d'ambiente**      | Verify All, DB Verify Config, Check:All, Pre-Deploy                                                                                               |

---

## 🔄 Automatizzazione

### Comando Unico Completo

Per eseguire tutti i controlli in sequenza automaticamente:

```bash
npm run check:all
```

Questo script esegue:

1. ✅ Formattazione (format:check)
2. ✅ Linting (lint)
3. ✅ TypeScript (typecheck)
4. ✅ Test (test:run)
5. ✅ Build (build)
6. ✅ Database checks (opzionali, se .env.local esiste)
7. ✅ Services verification (opzionale)
8. ✅ Pre-deploy check finale

**Output**: Riepilogo finale con statistiche e messaggio di successo/errore.

---

## ⚠️ Note Importanti

1. **Comandi Database Opzionali**: I comandi della categoria 4 (tranne `db:push` e `repair-migrations`) sono solo di lettura e non modificano il database.

2. **Comandi che Modificano Database**: Solo `npx supabase db push` e `npm run db:repair-migrations` modificano il database. Usali con cautela.

3. **Requisiti .env.local**: I comandi database e servizi richiedono `.env.local` con variabili Supabase configurate.

4. **Tempo Totale**: Un run completo di `check:all` richiede 3-5 minuti. Pianifica di conseguenza.

5. **Docker per db diff**: `npx supabase db diff` richiede Docker Desktop avviato (solo per sviluppo locale).

---

## 📝 Documentazione Aggiornata

Ultima revisione: 2026-01-03  
Versione checklist: 2.0  
Script principale: `npm run check:all`
