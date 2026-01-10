# Utility: Communications Email Resend Client

## 📋 Descrizione

Client Resend per invio email. Verifica configurazione Resend, invia email tramite Resend API, supporta tracking pixel, simulazione in sviluppo.

## 📁 Percorso File

`src/lib/communications/email-resend-client.ts`

## 📦 Dipendenze

- `resend` (opzionale, solo in produzione)

## ⚙️ Funzionalità

### Funzioni Principali

1. **`isResendConfigured()`**: Verifica se Resend è configurato
   - Controlla: RESEND_API_KEY, RESEND_FROM_EMAIL, RESEND_FROM_NAME

2. **`sendEmailViaResend(to, subject, html, trackingPixelId?)`**: Invia email tramite Resend
   - Se non configurato: simula invio in sviluppo
   - Se configurato: usa Resend API
   - Aggiunge tracking pixel se fornito
   - Ritorna success/error con emailId

## 🔍 Note Tecniche

- Simulazione in sviluppo se Resend non configurato
- Tracking pixel: aggiunge immagine 1x1 invisibile per tracking opens
- From email/name da env vars

## ✅ Stato Utility

- ✅ **Completato**: Utility funzionante e utilizzata in produzione
