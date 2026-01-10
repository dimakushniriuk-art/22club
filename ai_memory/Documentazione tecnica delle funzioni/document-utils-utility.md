# Utility: Document Utils

## 📋 Descrizione

Utility per gestione documenti. Fornisce funzioni helper per formattazione status documenti (colore, testo, icona), formattazione date.

## 📁 Percorso File

`src/lib/document-utils.ts`

## 📦 Dipendenze

- `@/types/document` (`Document`)

## ⚙️ Funzionalità

### Funzioni Principali

1. **`getStatusColor(status)`**: Ottiene colore badge per status
   - valido → success
   - in_scadenza/scaduto/non_valido → warning
   - in-revisione → neutral
   - default → neutral

2. **`getStatusText(status)`**: Ottiene testo status
   - Mappa status a testo italiano

3. **`getStatusIcon(status)`**: Ottiene icona status
   - valido → ✅
   - in_scadenza → ⚠️
   - scaduto → ❌
   - non_valido → ❌
   - in-revisione → ⏳

4. **`getCategoryText(category)`**: Ottiene testo categoria documento

5. **`formatDocumentDate(dateString)`**: Formatta data documento
   - Formato italiano (DD/MM/YYYY)

## 🔍 Note Tecniche

- Status supportati: valido, scaduto, in-revisione, in_scadenza, non_valido
- Mapping colori per Badge component
- Formattazione date in formato italiano

## ✅ Stato Utility

- ✅ **Completato**: Utility funzionante e utilizzata in produzione
