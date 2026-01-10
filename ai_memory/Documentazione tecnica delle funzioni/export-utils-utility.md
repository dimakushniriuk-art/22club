# Utility: Export Utils

## 📋 Descrizione

Utility generica per export dati. Esporta dati in formato CSV e PDF, gestisce escape caratteri speciali, download blob.

## 📁 Percorso File

`src/lib/export-utils.ts`

## 📦 Dipendenze

- Nessuna dipendenza esterna

## ⚙️ Funzionalità

### Tipi

- `ExportData`: Array di oggetti Record<string, string | number | boolean | null>

### Funzioni Principali

1. **`exportToCSV(data, filename)`**: Esporta dati in CSV
   - Ottiene headers dal primo oggetto
   - Crea righe CSV con escape virgolette e virgole
   - Gestisce valori null/undefined
   - Crea blob e avvia download

2. **`exportToPDF(data, filename)`**: Esporta dati in PDF
   - PDF semplice (solo testo)
   - Nota: per PDF complessi usare jsPDF

3. **`downloadBlob(blob, filename)`**: Helper download blob
   - Crea URL object e link temporaneo
   - Triggera download

## 🔍 Note Tecniche

- Escape CSV: doppie virgolette per valori con virgole/virgolette/newline
- PDF: implementazione semplice, per PDF complessi usare jsPDF
- Download: usa URL.createObjectURL e link temporaneo

## ✅ Stato Utility

- ✅ **Completato**: Utility funzionante e utilizzata in produzione
