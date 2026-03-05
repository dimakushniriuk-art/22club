# Utility: Validations Allenamento

## 📋 Descrizione

Utility di validazione Zod per allenamenti. Definisce schemi per validazione dati allenamento (create, update, filters) con validazione durata, stato, esercizi, volume.

## 📁 Percorso File

`src/lib/validations/allenamento.ts`

## 📦 Dipendenze

- `zod` (`z`)

## ⚙️ Funzionalità

### Schemi Esportati

1. **`allenamentoSchema`**: Schema completo allenamento
   - `id`, `atleta_id`, `atleta_nome`, `scheda_id`, `scheda_nome`
   - `data` (datetime), `durata_minuti` (0-480), `stato` (enum)
   - `esercizi_completati`, `esercizi_totali`, `volume_totale`
   - `note`, `created_at`, `updated_at`

2. **`allenamentoFiltersSchema`**: Schema filtri allenamenti
   - `search`, `stato` (tutti/completato/in_corso/programmato/saltato)
   - `atleta_id`, `data_da`, `data_a`, `periodo` (tutti/oggi/settimana/mese)

3. **`createAllenamentoSchema`**: Schema creazione allenamento
   - `atleta_id` (obbligatorio UUID)
   - `scheda_id` (opzionale UUID)
   - `data` (obbligatorio datetime)
   - `durata_minuti` (5-480 minuti)
   - `note` (max 1000 caratteri)

4. **`updateAllenamentoSchema`**: Schema aggiornamento allenamento
   - Estende `createAllenamentoSchema` con tutti campi opzionali
   - Aggiunge `id` (obbligatorio), `stato`, `esercizi_completati`, `volume_totale`

### Tipi TypeScript Esportati

- `AllenamentoValidation`
- `AllenamentoFiltersValidation`
- `CreateAllenamentoValidation`
- `UpdateAllenamentoValidation`

## 🔍 Note Tecniche

- Durata massima: 480 minuti (8 ore)
- Note max: 1000 caratteri
- Stati supportati: completato, in_corso, programmato, saltato

## ✅ Stato Utility

- ✅ **Completato**: Utility funzionante e utilizzata in produzione
