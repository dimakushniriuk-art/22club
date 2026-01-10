# Utility: Validations Cliente

## 📋 Descrizione

Utility di validazione Zod per clienti. Definisce schemi per validazione dati cliente (create, update, filters, sort, pagination) con validazione email, telefono, avatar, tags.

## 📁 Percorso File

`src/lib/validations/cliente.ts`

## 📦 Dipendenze

- `zod` (`z`)

## ⚙️ Funzionalità

### Schemi Esportati

1. **`clienteTagSchema`**: Schema tag cliente
   - `id` (UUID), `nome` (1-50 caratteri), `colore` (hex #RRGGBB)

2. **`clienteSchema`**: Schema completo cliente
   - `id`, `nome`, `cognome` (1-100 caratteri)
   - `email` (email valida)
   - `phone` (regex: `^\+?[0-9\s\-()]+$`, nullable)
   - `avatar_url` (URL o path relativo, nullable)
   - `data_iscrizione`, `stato` (attivo/inattivo/sospeso)
   - `allenamenti_mese`, `ultimo_accesso`, `scheda_attiva`
   - `documenti_scadenza`, `note`, `tags` (array), `role`
   - `created_at`, `updated_at`

3. **`clienteFiltersSchema`**: Schema filtri clienti
   - `search`, `stato` (tutti/attivo/inattivo/sospeso)
   - `dataIscrizioneDa`, `dataIscrizioneA` (datetime nullable)
   - `allenamenti_min` (int >= 0, nullable)
   - `solo_documenti_scadenza` (boolean)
   - `tags` (array UUID)

4. **`clienteSortSchema`**: Schema ordinamento
   - `field` (nome, cognome, email, data_iscrizione, stato, allenamenti_mese)
   - `direction` (asc, desc)

5. **`clientePaginationSchema`**: Schema paginazione
   - `page` (int >= 1, default 1)
   - `pageSize` (int 10-100, default 20)

6. **`createClienteSchema`**: Schema creazione cliente
   - `nome`, `cognome` (obbligatori, 1-100 caratteri)
   - `email` (obbligatorio, email valida)
   - `phone` (opzionale, regex validata)
   - `note` (max 1000 caratteri, opzionale)

7. **`updateClienteSchema`**: Schema aggiornamento cliente
   - Estende `createClienteSchema` con tutti campi opzionali
   - Aggiunge `id` (obbligatorio), `stato` (opzionale)

### Tipi TypeScript Esportati

- `ClienteValidation`
- `ClienteFiltersValidation`
- `ClienteSortValidation`
- `ClientePaginationValidation`
- `CreateClienteValidation`
- `UpdateClienteValidation`

## 🔍 Note Tecniche

- Validazione telefono: regex `^\+?[0-9\s\-()]+$`
- Avatar URL: accetta URL o path relativi (starts with '/')
- Note max: 1000 caratteri

## ✅ Stato Utility

- ✅ **Completato**: Utility funzionante e utilizzata in produzione
