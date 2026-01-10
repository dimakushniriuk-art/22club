# Utility: Error Handler

## 📋 Descrizione

Sistema centralizzato di gestione errori per API calls. Gestisce errori API, retry logic, logging, reporting a servizio monitoring.

## 📁 Percorso File

`src/lib/error-handler.ts`

## 📦 Dipendenze

- `./api-logger` (`apiLogger`)

## ⚙️ Funzionalità

### Interfacce Esportate

- `ApiError`: Errore API (message, code?, status?, details?, timestamp, context?)

### Classe ApiErrorHandler

- **Singleton pattern**: getInstance()
- **`handleApiError(error, context?)`**: Gestisce errore API
  - Estrae message, code, status, details
  - Log errore
  - Report a monitoring in produzione
- **`handleRetryError(error, attempt, maxAttempts, context?)`**: Gestisce errore retry
  - Aggiunge info tentativo al messaggio
- **`logError(error)`**: Log errore
- **`reportError(error)`**: Report a monitoring (Sentry, ecc.)

## 🔍 Note Tecniche

- Singleton per gestione centralizzata
- Estrazione automatica dettagli errore
- Reporting solo in produzione

## ✅ Stato Utility

- ✅ **Completato**: Utility funzionante e utilizzata in produzione
