# 🔧 Fix Errore Caricamento Video

**Data**: 17 Gennaio 2026  
**Problema**: Errore caricamento video mostra `{}` vuoto nella console

## 🐛 Problema Identificato

L'errore `❌ Errore caricamento video: {}` si verifica quando:
1. Il video non può essere caricato (URL non valido, CORS, formato non supportato)
2. L'oggetto `errorDetails` non viene serializzato correttamente nel `console.error`
3. Mancano informazioni utili per il debug

## ✅ Fix Applicati

### 1. Migliorata Serializzazione Error Details

**File**: `src/app/home/allenamenti/oggi/page.tsx` (righe 85-122)

**Modifiche**:
- Tutti i valori in `errorDetails` sono ora esplicitamente convertiti a `string | number | null`
- Aggiunto `JSON.stringify()` per serializzazione corretta nel log
- Aggiunti log aggiuntivi con stato completo del video element

**Prima**:
```typescript
const errorDetails: Record<string, unknown> = {
  exerciseId: exercise?.id ?? 'unknown',
  // ...
}
console.error('❌ Errore caricamento video:', errorDetails)
```

**Dopo**:
```typescript
const errorDetails: Record<string, string | number | null> = {
  exerciseId: String(exercise?.id ?? 'unknown'),
  // Tutti i valori esplicitamente convertiti
  // ...
}
console.error('❌ Errore caricamento video:', JSON.stringify(errorDetails, null, 2))
console.error('Video element state:', { /* stato completo */ })
```

### 2. Migliorata Validazione URL Video

**File**: `src/app/home/allenamenti/oggi/page.tsx` (righe 931-936)

**Modifiche**:
- Aggiunta verifica che l'URL non sia `'null'` o `'undefined'` (stringhe)
- Aggiunta verifica che l'URL non contenga placeholder template (`{{`, `${`)
- Validazione più rigorosa

**Prima**:
```typescript
const isValidVideoUrl: boolean = Boolean(
  exerciseVideoUrl &&
    typeof exerciseVideoUrl === 'string' &&
    exerciseVideoUrl.trim() !== '' &&
    (exerciseVideoUrl.startsWith('http://') || exerciseVideoUrl.startsWith('https://')),
)
```

**Dopo**:
```typescript
const isValidVideoUrl: boolean = Boolean(
  exerciseVideoUrl &&
    typeof exerciseVideoUrl === 'string' &&
    exerciseVideoUrl.trim() !== '' &&
    exerciseVideoUrl.trim() !== 'null' &&
    exerciseVideoUrl.trim() !== 'undefined' &&
    (exerciseVideoUrl.startsWith('http://') || exerciseVideoUrl.startsWith('https://')) &&
    !exerciseVideoUrl.includes('{{') &&
    !exerciseVideoUrl.includes('${'),
)
```

### 3. Migliorato Fallback Video → Immagine

**File**: `src/app/home/allenamenti/oggi/page.tsx` (riga 70)

**Modifiche**:
- Il fallback all'immagine viene attivato anche quando `videoError` è true
- Assicura che se il video fallisce, l'immagine venga mostrata automaticamente

**Prima**:
```typescript
const shouldShowImage = !shouldShowVideo && isValidThumbUrl && thumbUrl && !imageError
```

**Dopo**:
```typescript
const shouldShowImage = (!shouldShowVideo || videoError) && isValidThumbUrl && thumbUrl && !imageError
```

## 📊 Informazioni Aggiuntive nel Log

Ora quando un video fallisce, vedrai:

```json
{
  "exerciseId": "uuid",
  "exerciseName": "Nome Esercizio",
  "videoUrl": "https://...",
  "errorCode": 2,
  "errorMessage": "Errore di rete",
  "errorCodeDescription": "MEDIA_ERR_NETWORK - Errore di rete",
  "videoSrc": "https://...",
  "videoCurrentSrc": "https://...",
  "networkState": 3,
  "readyState": 0
}
```

E anche:
```
Video element state: {
  src: "https://...",
  currentSrc: "https://...",
  networkState: 3,
  readyState: 0,
  error: { code: 2, message: "..." }
}
```

## 🔍 Possibili Cause dell'Errore

1. **URL non valido o inesistente**
   - Il file video non esiste nello storage
   - L'URL è malformato o contiene placeholder

2. **Problemi CORS**
   - Il video è su un dominio diverso senza CORS configurato
   - Supabase Storage potrebbe richiedere signed URL per video privati

3. **Formato non supportato**
   - Il browser non supporta il formato video
   - Codec non supportato

4. **Errore di rete**
   - Connessione lenta o instabile
   - Timeout durante il caricamento

## ✅ Comportamento Dopo Fix

1. **Log dettagliati**: Ora vedrai informazioni complete sull'errore
2. **Fallback automatico**: Se il video fallisce, mostra l'immagine se disponibile
3. **Validazione migliorata**: URL non validi vengono rilevati prima del caricamento
4. **UX migliore**: L'utente vede sempre qualcosa (video, immagine, o placeholder)

## 🧪 Come Testare

1. Apri la console del browser (F12)
2. Naviga a `/home/allenamenti/oggi`
3. Se un video fallisce, dovresti vedere:
   - Log dettagliato con tutte le informazioni
   - Fallback automatico all'immagine
   - Nessun errore `{}` vuoto

## 📝 Prossimi Passi (Opzionali)

Se il problema persiste:

1. **Verifica URL video nel database**:
   ```sql
   SELECT id, name, video_url, thumb_url 
   FROM exercises 
   WHERE video_url IS NOT NULL 
   LIMIT 10;
   ```

2. **Verifica che i file esistano in Supabase Storage**:
   - Vai su Supabase Dashboard > Storage > exercise-videos
   - Verifica che i file corrispondano agli URL nel database

3. **Considera signed URL per video privati**:
   - Se i video sono in bucket privato, usa `createSignedUrl()`
   - Vedi esempio in `src/app/dashboard/abbonamenti/page.tsx`

---

**Stato**: ✅ **Fix applicato** - Il prossimo errore mostrerà informazioni dettagliate
