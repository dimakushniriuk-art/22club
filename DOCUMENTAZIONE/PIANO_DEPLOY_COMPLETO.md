clear

# 🚀 Piano Deploy Completo - 22Club

**Data**: 2025-01-27T20:20:00Z  
**Obiettivo**: Deploy completo del progetto su Vercel

---

## 📊 Stato Attuale

**Problema**: Deploy non riuscito, necessario ricaricare tutto

**Azioni Richieste**:

1. Verificare stato repository locale
2. Push completo su GitHub
3. Deploy completo su Vercel

---

## 🔧 Opzione 1: Push Completo su GitHub (Raccomandato)

### Step 1: Verifica Stato

```bash
# Verifica commit da pushare
git log --oneline origin/main..HEAD

# Verifica stato repository
git status
```

### Step 2: Push Completo

**Opzione A: Push Incrementale (Script)**

```powershell
.\scripts\push-incremental.ps1
```

**Opzione B: Push Forzato (Se remoto è vuoto/nuovo)**

```bash
# ⚠️ ATTENZIONE: Sovrascrive completamente il remoto
git push origin main --force
```

**Opzione C: Push con SSH (Più stabile per repository grandi)**

```bash
# Cambia remote a SSH
git remote set-url origin git@github.com:dimakushniriuk-art/club_1225.git

# Push
git push origin main
```

### Step 3: Verifica Push

```bash
# Fetch da remoto
git fetch origin

# Verifica commit sul remoto
git log --oneline origin/main -10
```

---

## 🔧 Opzione 2: Deploy Diretto Vercel (Se GitHub non funziona)

### Step 1: Installa Vercel CLI

```bash
npm i -g vercel
```

### Step 2: Login Vercel

```bash
vercel login
```

### Step 3: Link Progetto

```bash
vercel link
```

### Step 4: Deploy Produzione

```bash
vercel --prod
```

---

## 🔧 Opzione 3: Reset e Push Completo

### Step 1: Verifica Commit Locali

```bash
# Conta commit da pushare
git rev-list --count origin/main..HEAD
```

### Step 2: Push Incrementale Grande

```bash
# Push 20 commit alla volta
git push origin HEAD~40:main
git push origin HEAD~30:main
git push origin HEAD~20:main
git push origin HEAD~10:main
git push origin main
```

---

## 📋 Checklist Pre-Deploy

### Verifiche Obbligatorie

- [ ] Build locale funziona: `npm run build:prod`
- [ ] TypeScript senza errori: `npm run typecheck`
- [ ] Linting passa: `npm run lint`
- [ ] Variabili d'ambiente configurate in Vercel
- [ ] Database Supabase accessibile

### Variabili d'Ambiente Vercel

Verifica che siano configurate:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_APP_URL`
- `NODE_ENV=production`

---

## 🎯 Strategia Consigliata

1. **Prima**: Verifica stato repository
2. **Poi**: Push completo su GitHub (usando script incrementale o SSH)
3. **Infine**: Verifica deploy automatico Vercel (se GitHub Actions configurato)

Se GitHub Actions non è configurato:

- Deploy manuale via Vercel CLI: `vercel --prod`

---

## ⚠️ Note Importanti

- **Force Push**: Usare solo se remoto è vuoto/nuovo
- **Repository Grande**: Usare SSH o script incrementale
- **Timeout**: Se timeout persiste, provare da rete diversa o aumentare timeout

---

**Ultimo aggiornamento**: 2025-01-27T20:20:00Z
