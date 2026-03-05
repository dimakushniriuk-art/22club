# Utility: Validations Video URL

## 📋 Descrizione

Utility per validazione URL video. Supporta YouTube, Vimeo e URL diretti a file video. Fornisce funzioni per validare URL e identificare tipo video.

## 📁 Percorso File

`src/lib/validations/video-url.ts`

## 📦 Dipendenze

- Nessuna dipendenza esterna

## ⚙️ Funzionalità

### Funzioni Esportate

1. **`isValidVideoUrl(url: string | null | undefined): boolean`**
   - Valida se URL è formato video supportato
   - Supporta: YouTube, Vimeo, URL diretti (mp4, webm, ogg, mov, avi, mkv, flv, wmv)
   - Accetta URL opzionali (null/undefined/empty = valido)
   - Verifica anche URL generici validi (http/https)

2. **`getVideoUrlType(url: string | null | undefined): 'youtube' | 'vimeo' | 'direct' | 'unknown'`**
   - Identifica tipo URL video
   - Ritorna: youtube, vimeo, direct, unknown

### Pattern Supportati

- **YouTube**: youtube.com, youtu.be, youtube.com/watch, youtube.com/embed
- **Vimeo**: vimeo.com, player.vimeo.com/video
- **Direct**: URL diretti a file video (estensioni: mp4, webm, ogg, mov, avi, mkv, flv, wmv)

### Costanti Esportate

- `VIDEO_URL_ERROR_MESSAGE`: Messaggio errore standard

## 🔍 Note Tecniche

- Pattern regex per riconoscere URL video
- Fallback: accetta qualsiasi URL valido (http/https) anche se non corrisponde a pattern
- URL opzionali: se vuoto/null/undefined, ritorna true (valido)

## ✅ Stato Utility

- ✅ **Completato**: Utility funzionante e utilizzata in produzione
