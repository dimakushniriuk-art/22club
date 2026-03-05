# 🔌 Configurazione Servizi Esterni

Documentazione completa per la configurazione di servizi esterni in 22Club.

## 📧 Email Service

### Overview

22Club utilizza servizi email per:

- Inviti atleti
- Notifiche appuntamenti
- Reset password
- Comunicazioni di sistema

### Configurazione

#### Opzione 1: Supabase Email (Default)

Supabase include un servizio email integrato che può essere configurato nel dashboard Supabase.

**Setup:**

1. Vai a **Supabase Dashboard** → **Settings** → **Auth**
2. Configura **SMTP Settings**:
   - SMTP Host: `smtp.gmail.com` (o provider)
   - SMTP Port: `587`
   - SMTP User: `your-email@gmail.com`
   - SMTP Password: App password
   - Sender Email: `noreply@22club.it`

**Environment Variables:**

```env
# Email già gestito da Supabase Auth
# Nessuna configurazione aggiuntiva necessaria
```

#### Opzione 2: Resend (Raccomandato per produzione)

**Setup:**

1. Crea account su [Resend](https://resend.com)
2. Verifica dominio
3. Ottieni API key

**Installazione:**

```bash
npm install resend
```

**Configurazione:**

```typescript
// src/lib/email/resend.ts
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string
  subject: string
  html: string
}) {
  try {
    const { data, error } = await resend.emails.send({
      from: '22Club <noreply@22club.it>',
      to,
      subject,
      html,
    })

    if (error) {
      throw new Error(`Failed to send email: ${error.message}`)
    }

    return data
  } catch (error) {
    console.error('Email send error:', error)
    throw error
  }
}
```

**Environment Variables:**

```env
RESEND_API_KEY=re_xxxxxxxxxxxxx
RESEND_FROM_EMAIL=noreply@22club.it
```

**Usage:**

```typescript
import { sendEmail } from '@/lib/email/resend'

await sendEmail({
  to: 'athlete@example.com',
  subject: 'Invito 22Club',
  html: '<h1>Benvenuto!</h1><p>Il tuo PT ti ha invitato...</p>',
})
```

#### Opzione 3: SendGrid

**Setup:**

1. Crea account su [SendGrid](https://sendgrid.com)
2. Verifica sender
3. Ottieni API key

**Installazione:**

```bash
npm install @sendgrid/mail
```

**Configurazione:**

```typescript
// src/lib/email/sendgrid.ts
import sgMail from '@sendgrid/mail'

sgMail.setApiKey(process.env.SENDGRID_API_KEY!)

export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string
  subject: string
  html: string
}) {
  try {
    await sgMail.send({
      from: process.env.SENDGRID_FROM_EMAIL!,
      to,
      subject,
      html,
    })
  } catch (error) {
    console.error('SendGrid error:', error)
    throw error
  }
}
```

**Environment Variables:**

```env
SENDGRID_API_KEY=SG.xxxxxxxxxxxxx
SENDGRID_FROM_EMAIL=noreply@22club.it
```

## 📱 SMS Service

### Overview

SMS può essere utilizzato per:

- Notifiche appuntamenti
- Codici 2FA
- Promemoria allenamenti

### Configurazione Twilio

**Setup:**

1. Crea account su [Twilio](https://www.twilio.com)
2. Ottieni Account SID e Auth Token
3. Acquista numero telefono

**Installazione:**

```bash
npm install twilio
```

**Configurazione:**

```typescript
// src/lib/sms/twilio.ts
import twilio from 'twilio'

const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)

export async function sendSMS({ to, message }: { to: string; message: string }) {
  try {
    const result = await client.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to,
    })

    return result
  } catch (error) {
    console.error('Twilio error:', error)
    throw error
  }
}
```

**Environment Variables:**

```env
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=xxxxxxxxxxxxx
TWILIO_PHONE_NUMBER=+1234567890
```

**Usage:**

```typescript
import { sendSMS } from '@/lib/sms/twilio'

await sendSMS({
  to: '+393456789012',
  message: 'Il tuo appuntamento è domani alle 10:00',
})
```

## 🔐 Two-Factor Authentication (2FA)

### Overview

2FA può essere implementato usando:

- **TOTP** (Time-based One-Time Password)
- **SMS** (via Twilio)
- **Email** (codici via email)

### Configurazione TOTP

**Installazione:**

```bash
npm install speakeasy qrcode
```

**Configurazione:**

```typescript
// src/lib/auth/2fa.ts
import speakeasy from 'speakeasy'
import QRCode from 'qrcode'

export async function generate2FASecret(userId: string) {
  const secret = speakeasy.generateSecret({
    name: `22Club (${userId})`,
    issuer: '22Club',
  })

  // Genera QR code
  const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url!)

  return {
    secret: secret.base32,
    qrCodeUrl,
  }
}

export function verify2FAToken(secret: string, token: string): boolean {
  return speakeasy.totp.verify({
    secret,
    encoding: 'base32',
    token,
    window: 2, // Allow 2 time steps tolerance
  })
}
```

**Database Schema:**

```sql
-- Aggiungi colonna per 2FA secret
ALTER TABLE profiles
ADD COLUMN two_factor_secret TEXT,
ADD COLUMN two_factor_enabled BOOLEAN DEFAULT FALSE;
```

**Usage:**

```typescript
// Setup 2FA
const { secret, qrCodeUrl } = await generate2FASecret(userId)
// Salva secret nel database
// Mostra QR code all'utente

// Verifica token
const isValid = verify2FAToken(secret, userToken)
```

### Configurazione SMS 2FA

```typescript
// src/lib/auth/2fa-sms.ts
import { sendSMS } from '@/lib/sms/twilio'
import { generateRandomCode } from '@/lib/utils'

export async function send2FACode(phoneNumber: string) {
  const code = generateRandomCode(6) // 6-digit code

  // Salva code nel database con expiry (5 minuti)
  await save2FACode(phoneNumber, code, 5 * 60 * 1000)

  // Invia SMS
  await sendSMS({
    to: phoneNumber,
    message: `Il tuo codice 2FA 22Club: ${code}`,
  })

  return code
}

export async function verify2FACode(phoneNumber: string, code: string): Promise<boolean> {
  const savedCode = await get2FACode(phoneNumber)

  if (!savedCode || savedCode.expiresAt < Date.now()) {
    return false
  }

  if (savedCode.code !== code) {
    return false
  }

  // Elimina code dopo verifica
  await delete2FACode(phoneNumber)

  return true
}
```

## 🔔 Push Notifications

### Overview

Push notifications per notifiche in-app e desktop.

### Configurazione Web Push

**Installazione:**

```bash
npm install web-push
```

**Configurazione:**

```typescript
// src/lib/push/web-push.ts
import webpush from 'web-push'

// Configura VAPID keys
webpush.setVapidDetails(
  'mailto:noreply@22club.it',
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!,
)

export async function sendPushNotification(
  subscription: PushSubscription,
  payload: { title: string; body: string; icon?: string },
) {
  try {
    await webpush.sendNotification(subscription, JSON.stringify(payload))
  } catch (error) {
    console.error('Push notification error:', error)
    throw error
  }
}
```

**Environment Variables:**

```env
NEXT_PUBLIC_VAPID_PUBLIC_KEY=xxxxxxxxxxxxx
VAPID_PRIVATE_KEY=xxxxxxxxxxxxx
```

**Generazione VAPID Keys:**

```bash
npx web-push generate-vapid-keys
```

## 📊 Analytics

### Overview

Analytics per tracking eventi e metriche.

### Configurazione (Opzionale)

Per analytics avanzati, considera:

- **Google Analytics**
- **Plausible** (privacy-friendly)
- **Posthog**

## 🔗 Integrazioni Future

### Servizi Potenziali

1. **Stripe**: Pagamenti
2. **Calendly**: Scheduling
3. **Zoom**: Video calls
4. **WhatsApp Business API**: Messaging

## 📝 Best Practices

### 1. Environment Variables

- Usa `.env.local` per sviluppo
- Non committare secrets
- Usa variabili d'ambiente in produzione

### 2. Error Handling

- Gestisci errori di servizi esterni
- Implementa retry logic
- Logga errori per debugging

### 3. Rate Limiting

- Rispetta rate limits dei servizi
- Implementa queue per richieste massive
- Usa exponential backoff

### 4. Cost Management

- Monitora usage e costi
- Implementa caching dove possibile
- Usa webhooks invece di polling

## 🔗 Riferimenti

- [Resend Docs](https://resend.com/docs)
- [Twilio Docs](https://www.twilio.com/docs)
- [Web Push Docs](https://web.dev/push-notifications-overview/)
- [Supabase Auth](https://supabase.com/docs/guides/auth)
