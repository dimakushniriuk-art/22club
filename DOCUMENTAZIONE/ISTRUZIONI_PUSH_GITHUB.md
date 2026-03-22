# 🚀 Istruzioni Push su GitHub - 22Club

**Repository**: https://github.com/dimakushniriuk-art/club_1225  
**Branch**: `main`  
**Commit Locali**: ~40 commit da pushare

---

## ✅ Stato Attuale

- ✅ Remote configurato: `https://github.com/dimakushniriuk-art/club_1225.git`
- ✅ Branch locale: `main`
- ✅ Branch remoto: `origin/main` (trovato)
- ⚠️ Commit locali non pushati: ~40 commit

---

## 🚀 Push su GitHub

### Verifica Pre-Push

```bash
# 1. Verifica stato
git status

# 2. Verifica commit da pushare
git log --oneline origin/main..HEAD

# 3. Verifica differenze (opzionale)
git diff origin/main
```

### Push

```bash
# Push su GitHub
git push origin main
```

### Se Push Fallisce (conflitti o storie non correlate)

**Problema**: "refusing to merge unrelated histories"

**Soluzione**:

```bash
# 1. Stash cambiamenti non committati
git stash

# 2. Merge con flag per permettere storie non correlate
git merge origin/main --allow-unrelated-histories

# 3. Risolvi eventuali conflitti (se presenti)
# 4. Push
git push origin main

# 5. Ripristina cambiamenti
git stash pop
```

**Nota**: Se il push fallisce per timeout (HTTP 408), riprova. Il repository potrebbe essere grande e richiedere più tempo.

### Push con Force (⚠️ Solo se necessario)

**ATTENZIONE**: Usare solo se si è sicuri e dopo backup

```bash
git push origin main --force
```

---

## 🔄 Deploy Automatico

Dopo il push su `main`, GitHub Actions eseguirà automaticamente:

1. **Build and Test**
   - ESLint
   - TypeScript check
   - Unit tests
   - Coverage

2. **Security Scan**
   - Vulnerabilità check

3. **Deploy to Vercel**
   - Build produzione
   - Deploy su Vercel
   - URL: https://22club.vercel.app (o dominio configurato)

4. **Supabase Migrations**
   - Push migrazioni database
   - Generazione tipi

---

## 📊 Monitoraggio Deploy

### GitHub Actions

1. Vai su: https://github.com/dimakushniriuk-art/club_1225/actions
2. Verifica workflow eseguito
3. Controlla logs per errori

### Vercel Dashboard

1. Vai su: https://vercel.com/dashboard
2. Seleziona progetto 22Club
3. Verifica deployment

---

## ⚠️ Prerequisiti

Prima del push, assicurati che:

- [x] ✅ Variabili d'ambiente Vercel configurate (vedi `GUIDA_VERIFICHE_PRE_DEPLOY.md`)
- [x] ✅ GitHub Secrets configurati (vedi `GUIDA_VERIFICHE_PRE_DEPLOY.md`)
- [x] ✅ Build locale funziona (`npm run build:prod`)
- [x] ✅ Test passano (opzionale ma consigliato)

---

## 🎯 Comandi Rapidi

```bash
# Push completo
git push origin main

# Se timeout, riprova (il repository è grande)
git push origin main

# Verifica stato
git status
git log --oneline origin/main..HEAD

# Se necessario, pull prima
git pull origin main
git push origin main
```

## ⚠️ Problemi Comuni

### Errore HTTP 408 (Timeout)

**Causa**: Repository grande, molti file da pushare

**Soluzione**:

1. Riprova il push (potrebbe essere un problema temporaneo di rete)
2. Se persiste, verifica connessione internet
3. Push in batch più piccoli (non consigliato, meglio riprovare)

### Errore "unrelated histories"

**Causa**: Repository remoto ha storia diversa

**Soluzione**: Vedi sezione "Se Push Fallisce" sopra

---

**Ultimo aggiornamento**: 2025-01-27T19:30:00Z
