# Utility: Exercise Upload Utils

## 📋 Descrizione

Utility per upload esercizi. Valida file video e immagini, gestisce formati supportati, dimensioni massime, genera nomi file unici.

## 📁 Percorso File

`src/lib/exercise-upload-utils.ts`

## 📦 Dipendenze

- Nessuna dipendenza esterna

## ⚙️ Funzionalità

### Costanti Esportate

- **`SUPPORTED_VIDEO_FORMATS`**: Formati video supportati (mp4, webm, ogg, quicktime, x-msvideo)
- **`SUPPORTED_IMAGE_FORMATS`**: Formati immagine supportati (jpeg, jpg, png, webp)
- **`MAX_VIDEO_SIZE`**: 50MB
- **`MAX_THUMB_SIZE`**: 5MB
- **`VIDEO_EXTENSIONS`**: ['.mp4', '.webm', '.ogg', '.mov', '.avi']
- **`IMAGE_EXTENSIONS`**: ['.jpg', '.jpeg', '.png', '.webp']

### Funzioni Principali

1. **`validateVideoFile(file)`**: Valida file video
   - Controlla tipo MIME
   - Controlla estensione
   - Controlla dimensione (max 50MB)
   - Ritorna { valid, error? }

2. **`validateImageFile(file)`**: Valida file immagine
   - Controlla tipo MIME
   - Controlla estensione
   - Controlla dimensione (max 5MB)
   - Ritorna { valid, error? }

3. **`generateUniqueFileName(originalName)`**: Genera nome file unico
   - Aggiunge timestamp e random string

4. **`formatFileSize(bytes)`**: Formatta dimensione file
   - Formato: B, KB, MB, GB

5. **`isValidVideoUrl(url)`**: Valida URL video (delegato a validations/video-url)

## 🔍 Note Tecniche

- Validazione tipo MIME e estensione
- Limiti dimensione: 50MB video, 5MB immagini
- Generazione nomi file unici per evitare conflitti

## ✅ Stato Utility

- ✅ **Completato**: Utility funzionante e utilizzata in produzione
