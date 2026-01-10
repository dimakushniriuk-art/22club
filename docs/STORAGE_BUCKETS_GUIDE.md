# 📦 Guida Creazione Storage Buckets

**Data**: 2025-12-07  
**Progetto**: icibqnmtacibgnhaidlz

---

## 🎯 Obiettivo

Creare 4 storage buckets necessari per il funzionamento dell'applicazione:

1. `documents` - Documenti atleti
2. `exercise-videos` - Video esercizi
3. `progress-photos` - Foto progressi
4. `avatars` - Avatar utenti

---

## 📋 Istruzioni Step-by-Step

### 1. Apri Dashboard Storage

Vai a: https://supabase.com/dashboard/project/icibqnmtacibgnhaidlz/storage/buckets

### 2. Crea Bucket 1: documents

1. Clicca **"New bucket"**
2. **Nome**: `documents`
3. **Pubblico**: ❌ NO (privato)
4. **File size limit**: 10 MB (o come necessario)
5. **Allowed MIME types**:
   - `application/pdf`
   - `image/*`
   - `application/msword`
   - `application/vnd.openxmlformats-officedocument.wordprocessingml.document`
6. Clicca **"Create bucket"**

### 3. Crea Bucket 2: exercise-videos

1. Clicca **"New bucket"**
2. **Nome**: `exercise-videos`
3. **Pubblico**: ❌ NO (privato)
4. **File size limit**: 50 MB (o come necessario)
5. **Allowed MIME types**:
   - `video/*`
6. Clicca **"Create bucket"**

### 4. Crea Bucket 3: progress-photos

1. Clicca **"New bucket"**
2. **Nome**: `progress-photos`
3. **Pubblico**: ❌ NO (privato)
4. **File size limit**: 5 MB (o come necessario)
5. **Allowed MIME types**:
   - `image/*`
6. Clicca **"Create bucket"**

### 5. Crea Bucket 4: avatars

1. Clicca **"New bucket"**
2. **Nome**: `avatars`
3. **Pubblico**: ✅ YES (pubblico - per accesso diretto)
4. **File size limit**: 2 MB (o come necessario)
5. **Allowed MIME types**:
   - `image/*`
6. Clicca **"Create bucket"**

---

## ✅ Verifica

Dopo aver creato tutti i bucket, verifica con:

```bash
npm run db:analyze-complete
```

Dovrebbe mostrare:

- ✅ documents: ESISTE
- ✅ exercise-videos: ESISTE
- ✅ progress-photos: ESISTE
- ✅ avatars: ESISTE

---

## 🔒 RLS Policies Storage

I bucket privati (`documents`, `exercise-videos`, `progress-photos`) richiedono RLS policies per l'accesso.

**Nota**: Lo script `docs/CREATE_STORAGE_BUCKETS.sql` contiene le RLS policies per i bucket. Eseguilo dopo aver creato i bucket.

---

## 📝 Note

- I bucket pubblici (`avatars`) sono accessibili direttamente via URL
- I bucket privati richiedono autenticazione e RLS policies
- I file size limits possono essere modificati in base alle esigenze
- Le MIME types possono essere aggiunte/modificate in base alle necessità

---

## 🚀 Prossimi Passi

Dopo aver creato i bucket:

1. Esegui `docs/CREATE_STORAGE_BUCKETS.sql` per configurare RLS policies
2. Verifica con `npm run db:analyze-complete`
3. Testa upload file da applicazione

---

**Tempo stimato**: ~5 minuti
