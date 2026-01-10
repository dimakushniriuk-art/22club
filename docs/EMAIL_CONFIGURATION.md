# 📧 Configurazione Email - 22Club

## Problema: Non ricevo email per reset password

Se non ricevi le email per il reset password, segui questa guida per risolvere il problema.

---

## 🔍 Verifica Ambiente

### Sviluppo Locale (localhost)

Se stai usando Supabase locale, le email **NON vengono inviate realmente** ma vengono catturate da **Inbucket**, un server email di test.

#### Come verificare le email in sviluppo:

1. **Apri Inbucket nel browser:**
   ```
   http://localhost:54324
   ```

2. **Cerca l'email:**
   - Inbucket mostra tutte le email inviate durante lo sviluppo
   - Cerca l'email con il tuo indirizzo email
   - Clicca sull'email per vedere il contenuto completo

3. **Se Inbucket non è accessibile:**
   - Verifica che Supabase locale sia in esecuzione: `supabase start`
   - Verifica che la porta 54324 sia libera
   - Controlla i log di Supabase per errori

---

## 🌐 Produzione (Supabase Cloud)

Se stai usando Supabase Cloud, devi configurare un provider SMTP per inviare email reali.

### Configurazione SMTP in Supabase Dashboard

1. **Vai al Dashboard Supabase:**
   - Apri [https://app.supabase.com](https://app.supabase.com)
   - Seleziona il tuo progetto

2. **Vai su Authentication > Email Templates:**
   - Settings → Authentication → Email Templates
   - Qui puoi personalizzare i template email

3. **Configura SMTP Provider:**
   - Settings → Authentication → SMTP Settings
   - Configura uno dei provider supportati:
     - **SendGrid**
     - **Mailgun**
     - **AWS SES**
     - **Postmark**
     - **Custom SMTP**

### Esempio: Configurazione SendGrid

1. **Crea account SendGrid** (se non ce l'hai)
2. **Genera API Key** in SendGrid
3. **In Supabase Dashboard:**
   - Settings → Authentication → SMTP Settings
   - Provider: SendGrid
   - API Key: [la tua API key di SendGrid]
   - From Email: noreply@22club.it (o il tuo dominio)
   - From Name: 22Club

### Esempio: Configurazione Custom SMTP

Se hai un server SMTP personalizzato:

```
Host: smtp.tuodominio.com
Port: 587 (o 465 per SSL)
Username: noreply@tuodominio.com
Password: [tua password SMTP]
From Email: noreply@tuodominio.com
From Name: 22Club
```

---

## 🔧 Verifica Configurazione

### 1. Verifica che l'email esista nel database

```sql
-- Esegui questa query in Supabase SQL Editor
SELECT email, email_confirmed_at, created_at 
FROM auth.users 
WHERE email = 'tua@email.com';
```

### 2. Verifica i log di Supabase

- Dashboard → Logs → Auth Logs
- Cerca errori relativi all'invio email

### 3. Test manuale

Puoi testare l'invio email direttamente dal dashboard:
- Authentication → Users
- Seleziona un utente
- Clicca "Send password reset email"

---

## ⚠️ Problemi Comuni

### Email finisce in spam

- **Soluzione:** Configura SPF, DKIM e DMARC per il tuo dominio
- Aggiungi il dominio di Supabase agli allowlist del provider email

### Email non arriva mai

1. **Verifica SMTP configurato:**
   - Settings → Authentication → SMTP Settings
   - Deve essere configurato un provider

2. **Verifica rate limits:**
   - Alcuni provider SMTP hanno limiti di invio
   - Verifica i limiti del tuo provider

3. **Verifica email valida:**
   - L'email deve esistere in `auth.users`
   - L'email deve essere confermata (se `enable_confirmations = true`)

### Errore "Email rate limit exceeded"

- **Causa:** Troppi tentativi di reset password
- **Soluzione:** Attendi qualche minuto prima di riprovare

---

## 📝 Template Email Personalizzati

Puoi personalizzare i template email in:
- Settings → Authentication → Email Templates

Template disponibili:
- **Reset Password** (`reset_password`)
- **Magic Link** (`magic_link`)
- **Email Change** (`email_change`)
- **Email Confirmation** (`email_confirmation`)

---

## 🧪 Test in Sviluppo

Per testare il reset password in sviluppo:

1. **Avvia Supabase locale:**
   ```bash
   supabase start
   ```

2. **Richiedi reset password** dalla pagina `/forgot-password`

3. **Apri Inbucket:**
   ```
   http://localhost:54324
   ```

4. **Clicca sull'email** per vedere il link di reset

5. **Copia il link** e incollalo nel browser per testare il reset

---

## 🔗 Link Utili

- [Documentazione Supabase Email](https://supabase.com/docs/guides/auth/auth-email)
- [Configurazione SMTP Supabase](https://supabase.com/docs/guides/auth/auth-smtp)
- [Inbucket (Email Testing)](https://github.com/inbucket/inbucket)

---

## 💡 Note Importanti

1. **In sviluppo locale:** Le email vanno sempre su Inbucket, non vengono inviate realmente
2. **In produzione:** Devi configurare SMTP per inviare email reali
3. **Rate limits:** Rispetta i limiti del provider SMTP
4. **Spam:** Configura SPF/DKIM per evitare che le email finiscano in spam
