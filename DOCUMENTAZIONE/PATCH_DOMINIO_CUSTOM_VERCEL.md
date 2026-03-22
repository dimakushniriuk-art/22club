# 🔧 Patch Dominio Custom Vercel - Redirect Production-Safe

**Data:** ${new Date().toISOString().split('T')[0]}
**Problema:** Redirect strani su Vercel per dominio custom `https://app.22club.it`
**Causa:** Uso di `NEXT_PUBLIC_APP_URL` hardcoded a localhost o URL Vercel temporaneo

---

## 📋 File Modificati

### 1. **`src/lib/utils/get-app-url.ts`** (NUOVO)

**Creazione utility production-safe per ottenere URL base**

**Priorità:**

1. `request.nextUrl.origin` (server-side, middleware, API routes)
2. `window.location.origin` (client-side)
3. `NEXT_PUBLIC_APP_URL` (fallback env var)
4. `https://app.22club.it` (fallback hardcoded produzione)

**Motivazione:** Centralizza la logica di costruzione URL assoluti evitando hardcode a localhost o URL Vercel temporanei.

---

### 2. **`src/components/invitations/qr-code.tsx`**

**Cambio:** `NEXT_PUBLIC_APP_URL` → `window.location.origin`

**Prima:**

```typescript
const registrationUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3007'}/registrati?code=${invitationCode}`
```

**Dopo:**

```typescript
const registrationUrl =
  typeof window !== 'undefined'
    ? `${window.location.origin}/registrati?code=${invitationCode}`
    : `${process.env.NEXT_PUBLIC_APP_URL || 'https://app.22club.it'}/registrati?code=${invitationCode}`
```

**Motivazione:** Client component → usa sempre `window.location.origin` (production-safe). SSR fallback usa env var o dominio produzione.

---

### 3. **`src/hooks/use-invitations.ts`**

**Cambio:** `NEXT_PUBLIC_APP_URL` → `window.location.origin`

**Prima:**

```typescript
const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3007'
```

**Dopo:**

```typescript
const baseUrl =
  typeof window !== 'undefined'
    ? window.location.origin
    : process.env.NEXT_PUBLIC_APP_URL || 'https://app.22club.it'
```

**Motivazione:** Hook client → usa sempre `window.location.origin` (production-safe).

---

### 4. **`src/lib/communications/email-resend-client.ts`**

**Cambio:** Fallback da `https://22club.it` → `https://app.22club.it`

**Prima:**

```typescript
const trackingPixel = `<img src="${process.env.NEXT_PUBLIC_APP_URL || 'https://22club.it'}/api/track/email-open/${trackingPixelId}" ...>`
```

**Dopo:**

```typescript
const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://app.22club.it'
const trackingPixel = `<img src="${baseUrl}/api/track/email-open/${trackingPixelId}" ...>`
```

**Motivazione:** Server-side → usa fallback corretto (subdomain `app.` invece di root domain). In futuro potrebbe accettare `baseUrl` come parametro da API route.

---

### 5. **`src/lib/communications/sms.ts`**

**Cambio:** Fallback da `https://22club.it` → `https://app.22club.it`

**Prima:**

```typescript
const statusCallback = `${process.env.NEXT_PUBLIC_APP_URL || 'https://22club.it'}/api/webhooks/sms?recipient_id=${recipientId}`
```

**Dopo:**

```typescript
const statusCallback = `${process.env.NEXT_PUBLIC_APP_URL || 'https://app.22club.it'}/api/webhooks/sms?recipient_id=${recipientId}`
```

**Motivazione:** Server-side → usa fallback corretto (subdomain `app.` invece di root domain). In futuro potrebbe accettare `baseUrl` come parametro da API route.

---

## ✅ File GIÀ Production-Safe (Nessuna Modifica)

### 1. **`src/app/login/page.tsx`**

- ✅ `signInWithPassword()` non usa `redirectTo` (ok)

### 2. **`src/app/forgot-password/page.tsx`**

- ✅ `resetPasswordForEmail()` usa `window.location.origin` (ok)

### 3. **`src/hooks/use-auth.ts`**

- ✅ `resetPasswordForEmail()` usa `window.location.origin` (ok)

### 4. **`src/middleware.ts`**

- ✅ Usa `redirect()` con path relativi (ok)
- ✅ Usa `request.nextUrl` per costruire URL (ok)

### 5. **`src/app/post-login/page.tsx`**

- ✅ Usa `redirect()` con path relativi (ok)

---

## 🔍 Configurazione Supabase (Verifica Manuale Richiesta)

### Site URL

Nel Dashboard Supabase → Settings → Auth:

- **Site URL:** `https://app.22club.it`

### Redirect URLs

Nel Dashboard Supabase → Settings → Auth → Redirect URLs:
Aggiungi (se non già presenti):

```
https://app.22club.it/*
https://app.22club.it/auth/callback
https://app.22club.it/reset-password
https://app.22club.it/reset?token=*
```

**Nota:** Il wildcard `*` è supportato da Supabase per pattern matching.

---

## 📝 Checklist Post-Fix

### ✅ Verifica Locale

- [ ] Verifica che `npm run dev` funzioni senza errori
- [ ] Test login locale: `http://localhost:3001/login` → redirect a `/post-login`
- [ ] Test reset password: `http://localhost:3001/forgot-password` → email con link `http://localhost:3001/reset-password`

### ✅ Verifica Produzione (Vercel)

- [ ] Deploy su Vercel: `git push origin main` (o branch configurato)
- [ ] Verifica variabile ambiente `NEXT_PUBLIC_APP_URL` in Vercel:
  - Vercel Dashboard → Project → Settings → Environment Variables
  - `NEXT_PUBLIC_APP_URL` = `https://app.22club.it` (o rimuovi se non necessaria con le patch)
- [ ] Test login produzione: `https://app.22club.it/login` → redirect a `/post-login`
- [ ] Test reset password: `https://app.22club.it/forgot-password` → email con link `https://app.22club.it/reset-password`
- [ ] Verifica redirect dopo login: admin → `/dashboard/admin`, trainer → `/dashboard`, athlete → `/home`
- [ ] Verifica QR code inviti: URL generati devono usare `https://app.22club.it/registrati?code=...`

### ✅ Verifica Supabase

- [ ] **Site URL** in Supabase Dashboard = `https://app.22club.it`
- [ ] **Redirect URLs** include `https://app.22club.it/*`
- [ ] Test callback OAuth (se usato): deve funzionare con `https://app.22club.it/auth/callback`

---

## 🎯 Risultato Atteso

### Prima delle Patch

- ❌ Redirect dopo login puntano a `localhost` o URL Vercel temporaneo
- ❌ Email reset password contengono link `localhost` o URL Vercel temporaneo
- ❌ QR code inviti contengono URL `localhost` o URL Vercel temporaneo

### Dopo le Patch

- ✅ Redirect dopo login usano sempre dominio corretto (`https://app.22club.it`)
- ✅ Email reset password contengono link `https://app.22club.it/reset-password`
- ✅ QR code inviti contengono URL `https://app.22club.it/registrati?code=...`
- ✅ Client components usano `window.location.origin` (production-safe)
- ✅ Server components usano fallback sicuro (`https://app.22club.it`)

---

## 🔄 Prossimi Passi (Opzionale)

Per ulteriori miglioramenti futuri:

1. **Passare `baseUrl` come parametro in server-side functions:**
   - `sendEmailViaResend()` potrebbe accettare `baseUrl?: string`
   - `sendSMSViaTwilio()` potrebbe accettare `baseUrl?: string`
   - API routes passano `request.nextUrl.origin` come `baseUrl`

2. **Centralizzare tutti gli utilizzi con `getAppUrl()`:**
   - Sostituire tutti i `process.env.NEXT_PUBLIC_APP_URL` con `getAppUrl(request)`
   - Richiede refactoring più ampio

3. **Rimuovere `NEXT_PUBLIC_APP_URL` da variabili ambiente:**
   - Non più necessaria con `window.location.origin` per client
   - Mantenere solo per fallback server-side

---

## 📚 Riferimenti

- **Next.js URL Handling:** https://nextjs.org/docs/app/building-your-application/routing/linking-and-navigating#absolute-urls
- **Supabase Auth Redirect URLs:** https://supabase.com/docs/guides/auth/auth-redirects
- **Vercel Custom Domains:** https://vercel.com/docs/concepts/projects/domains
