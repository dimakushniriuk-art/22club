# 🚀 Applica Storage Buckets - Istruzioni Immediate

**Data**: 2025-12-07  
**Tempo richiesto**: 2 minuti

---

## ✅ Script Pronto!

Ho creato uno script SQL completo che crea automaticamente tutti i 4 bucket e configura le RLS policies.

**File**: `docs/CREATE_STORAGE_BUCKETS_COMPLETE.sql`

---

## 📋 Istruzioni Rapide

### 1. Apri SQL Editor

👉 https://supabase.com/dashboard/project/icibqnmtacibgnhaidlz/sql/new

### 2. Copia e Incolla

Apri il file `docs/CREATE_STORAGE_BUCKETS_COMPLETE.sql` e copia **tutto il contenuto**.

### 3. Esegui

Incolla nel SQL Editor e clicca **"Run"** (o premi Ctrl+Enter).

### 4. Verifica

Lo script include query di verifica automatica che mostrano:

- ✅ Bucket creati
- ✅ Policies configurate
- ✅ Riepilogo finale

---

## 🎯 Cosa Crea lo Script

### Bucket 1: documents

- Privato
- 10MB limite
- MIME: PDF, immagini, Word

### Bucket 2: exercise-videos

- Privato
- 50MB limite
- MIME: Video

### Bucket 3: progress-photos

- Privato
- 5MB limite
- MIME: Immagini

### Bucket 4: avatars

- Pubblico
- 2MB limite
- MIME: Immagini

---

## ✅ Dopo l'Esecuzione

Esegui nel terminale:

```bash
npm run db:analyze-complete
```

Dovrebbe mostrare:

- ✅ documents: ESISTE
- ✅ exercise-videos: ESISTE
- ✅ progress-photos: ESISTE
- ✅ avatars: ESISTE

---

## 🆘 Problemi?

Se vedi errori:

- **"permission denied"**: Verifica di avere i permessi admin nel progetto
- **"bucket already exists"**: Il bucket esiste già, lo script lo aggiorna
- **"policy already exists"**: Lo script rimuove le policies esistenti prima di crearle

---

**Pronto per l'esecuzione! 🚀**
