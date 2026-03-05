# Utility: Communications Email Template

## 📋 Descrizione

Utility per generazione HTML email da template. Supporta template personalizzati o template HTML di default con stile responsive.

## 📁 Percorso File

`src/lib/communications/email-template.ts`

## 📦 Dipendenze

- Nessuna dipendenza esterna

## ⚙️ Funzionalità

### Funzioni Principali

1. **`generateEmailHTML(title, message, metadata?)`**: Genera HTML email
   - Se metadata.email_template presente, usa template personalizzato
   - Altrimenti usa template HTML di default
   - Sostituisce placeholder {{title}} e {{message}}
   - Template responsive con stile inline

### Template Default

- HTML5 con meta viewport
- Stile responsive (max-width 600px)
- Footer con branding 22Club
- Supporta newline nel messaggio (replace \n con <br>)

## 🔍 Note Tecniche

- Template personalizzato: sostituisce {{title}} e {{message}}
- Template default: HTML completo con stile inline
- Responsive design per mobile

## ✅ Stato Utility

- ✅ **Completato**: Utility funzionante e utilizzata in produzione
