# Utility: Validations Invito

## 📋 Descrizione

Utility di validazione Zod per inviti. Definisce schemi per validazione dati invito (create, filters) con validazione nome, email, giorni validità.

## 📁 Percorso File

`src/lib/validations/invito.ts`

## 📦 Dipendenze

- `zod` (`z`)

## ⚙️ Funzionalità

### Schemi Esportati

1. **`createInvitoSchema`**: Schema creazione invito
   - `nome_atleta` (trim, 1-100 caratteri, obbligatorio)
   - `email` (opzionale, email valida o stringa vuota)
   - `giorni_validita` (int 1-365, default 7)

2. **`invitoSchema`**: Schema completo invito
   - `id` (UUID), `codice` (8 caratteri)
   - `nome_atleta`, `email` (nullable)
   - `stato` (inviato/registrato/scaduto)
   - `created_at`, `expires_at` (nullable), `used_at` (nullable)
   - `created_by` (UUID)

3. **`invitoFiltersSchema`**: Schema filtri inviti
   - `search`, `stato` (tutti/inviato/registrato/scaduto)
   - `data_da`, `data_a` (datetime nullable)

### Tipi TypeScript Esportati

- `CreateInvitoValidation`
- `InvitoValidation`
- `InvitoFiltersValidation`

## 🔍 Note Tecniche

- Email opzionale: accetta email valida o stringa vuota
- Giorni validità: 1-365 giorni (aumentato da 90)
- Codice invito: esattamente 8 caratteri

## ✅ Stato Utility

- ✅ **Completato**: Utility funzionante e utilizzata in produzione
