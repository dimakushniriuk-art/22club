# 🎯 Schema SQL - Fonte di Verità Unica

**Data creazione**: 17 Gennaio 2026  
**File di riferimento**: `schema-with-data.sql`

## 📋 Regola Fondamentale

**`schema-with-data.sql` è l'UNICA fonte di verità per lo schema del database.**

Tutte le modifiche al database devono:
1. ✅ Essere basate su questo file
2. ✅ Essere applicate a questo file dopo l'esecuzione
3. ✅ Essere sincronizzate con questo file

---

## 🔄 Workflow di Modifica

### Quando Modifichi il Database:

1. **Parti sempre da `schema-with-data.sql`**
   - Leggi il file per capire lo stato attuale
   - Verifica le dipendenze e le relazioni esistenti

2. **Crea la migrazione SQL**
   - Basa la migrazione su `schema-with-data.sql`
   - Assicurati che sia compatibile con lo schema esistente

3. **Esegui la migrazione su Supabase**
   - Usa Supabase Dashboard SQL Editor
   - Oppure usa Supabase CLI: `supabase db push`

4. **Aggiorna `schema-with-data.sql`**
   - Dopo aver eseguito la migrazione, esporta di nuovo lo schema
   - Sostituisci `schema-with-data.sql` con la nuova versione
   - Committa il file aggiornato

---

## 📝 Come Aggiornare il File

### Metodo 1: Esportazione Automatica (Raccomandato)

```bash
# Usa lo script di esportazione
npm run db:export-schema-pgdump

# Oppure usa il comando diretto
bash supabase-config-export/pg-dump-completo.sh
```

Questo genererà un nuovo `schema-complete.sql` che puoi usare per aggiornare `schema-with-data.sql`.

### Metodo 2: Esportazione Manuale

1. Vai su Supabase Dashboard
2. Settings > Database
3. Usa `pg_dump` con la connection string
4. Sostituisci `schema-with-data.sql` con il nuovo dump

---

## ✅ Checklist Prima di Ogni Modifica

Prima di modificare il database, verifica:

- [ ] Ho letto `schema-with-data.sql` per capire lo stato attuale
- [ ] Ho verificato le dipendenze (foreign keys, trigger, policies)
- [ ] Ho creato la migrazione SQL basata sullo schema esistente
- [ ] Ho testato la migrazione in un ambiente di test
- [ ] Dopo l'esecuzione, aggiornerò `schema-with-data.sql`

---

## 🚨 Regole Importanti

### ❌ NON Fare:

- ❌ Modificare il database senza aggiornare `schema-with-data.sql`
- ❌ Creare migrazioni che non sono basate su `schema-with-data.sql`
- ❌ Usare altri file SQL come fonte di verità
- ❌ Ignorare le dipendenze esistenti nel file

### ✅ FARE:

- ✅ Sempre partire da `schema-with-data.sql`
- ✅ Aggiornare `schema-with-data.sql` dopo ogni modifica
- ✅ Committare il file aggiornato nel repository
- ✅ Verificare che il file sia sincronizzato con il database reale

---

## 📦 Struttura File

```
supabase-config-export/
├── schema-with-data.sql          ← 🎯 FONTE DI VERITÀ (questo file)
├── schema-complete.sql           ← Export temporaneo (può essere sovrascritto)
├── SCHEMA-SOURCE-OF-TRUTH.md     ← Questo documento
└── ...
```

---

## 🔧 Script Utili

### Aggiorna Schema da Database

```bash
# Esporta schema attuale
npm run db:export-schema-pgdump

# Copia il nuovo schema come fonte di verità
cp supabase-config-export/schema-complete.sql supabase-config-export/schema-with-data.sql
```

### Verifica Differenze

```bash
# Confronta schema attuale con fonte di verità
diff supabase-config-export/schema-with-data.sql supabase-config-export/schema-complete.sql
```

---

## 📚 Documentazione Correlata

- `ERRORI-DA-CORREGGERE.md` - Analisi errori nel file
- `ANALISI-ERRORI-SCHEMA.md` - Report analisi completo
- `ISTRUZIONI-ESPORTazione.md` - Come esportare lo schema
- `COMANDI-PRONTI.md` - Comandi pronti per esportazione

---

## 🎯 Obiettivo

Mantenere `schema-with-data.sql` sempre:
- ✅ Sincronizzato con il database reale
- ✅ Aggiornato dopo ogni modifica
- ✅ Usato come base per tutte le nuove migrazioni
- ✅ Committato nel repository come fonte di verità

---

**Ultimo aggiornamento**: 17 Gennaio 2026  
**Versione schema**: 1.0 (basato su export pg_dump)
