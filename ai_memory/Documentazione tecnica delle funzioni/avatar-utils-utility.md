# Utility: Avatar Utils

## 📋 Descrizione

Utility per gestione avatar. Valida file immagine avatar, ridimensiona immagini mantenendo proporzioni, converte a File object.

## 📁 Percorso File

`src/lib/avatar-utils.ts`

## 📦 Dipendenze

- Nessuna dipendenza esterna

## ⚙️ Funzionalità

### Funzioni Principali

1. **`validateAvatarFile(file)`**: Valida file avatar
   - Controlla tipo MIME (jpeg, jpg, png, gif, webp)
   - Controlla dimensione (max 2MB)
   - Ritorna { valid, error? }

2. **`resizeImage(file, maxWidth?, maxHeight?, quality?)`**: Ridimensiona immagine
   - Mantiene proporzioni
   - Default: 512x512, quality 0.9
   - Usa Canvas API per ridimensionamento
   - Converte a File object
   - Ritorna Promise<File>

## 🔍 Note Tecniche

- Formati supportati: JPEG, PNG, GIF, WebP
- Dimensione max: 2MB
- Ridimensionamento: mantiene aspect ratio
- Usa FileReader e Canvas API

## ✅ Stato Utility

- ✅ **Completato**: Utility funzionante e utilizzata in produzione
