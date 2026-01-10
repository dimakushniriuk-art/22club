# Utility: Sanitize

## 📋 Descrizione

Utility per sanitizzazione input utente. Funzioni per sanitizzare e validare input prima dell'invio al server, rimuove caratteri pericolosi, gestisce maxLength.

## 📁 Percorso File

`src/lib/sanitize.ts`

## 📦 Dipendenze

- Nessuna dipendenza esterna

## ⚙️ Funzionalità

### Funzioni Principali

1. **`sanitizeString(value, maxLength?)`**: Sanitizza stringa
   - Trim spazi iniziali/finali
   - Applica maxLength se specificato
   - Rimuove caratteri di controllo (eccetto newline e tab)
   - Ritorna stringa o null se vuota

2. **`sanitizeStringArray(values, maxLength?)`**: Sanitizza array stringhe
   - Sanitizza ogni elemento
   - Rimuove null/undefined e duplicati
   - Ritorna array unico

3. **`sanitizeEmail(email)`**: Sanitizza email
   - Trim, lowercase, rimuove spazi
   - Validazione formato base

4. **`sanitizePhone(phone)`**: Sanitizza telefono
   - Rimuove caratteri non numerici (eccetto +, spazi, -, parentesi)
   - Trim

5. **`sanitizeNumber(value, min?, max?)`**: Sanitizza numero
   - Converte a number
   - Applica min/max se specificati
   - Ritorna number o null

## 🔍 Note Tecniche

- Rimuove caratteri di controllo: `[\x00-\x08\x0B-\x0C\x0E-\x1F\x7F]`
- Mantiene newline e tab per textarea
- Gestione null/undefined: ritorna null o array vuoto

## ✅ Stato Utility

- ✅ **Completato**: Utility funzionante e utilizzata in produzione
