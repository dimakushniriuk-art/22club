# 🔧 Fix Errore Video - CSP e URL Safety Check

**Data**: 17 Gennaio 2026  
**Problema**: `MEDIA_ERR_SRC_NOT_SUPPORTED - Media load rejected by URL safety check`

## 🐛 Problema Identificato

L'errore `errorCode: 4` con messaggio `"MEDIA_ELEMENT_ERROR: Media load rejected by URL safety check"` indica che:

1. **CSP (Content Security Policy) mancante**: Non c'è la direttiva `media-src` nel CSP
2. **Browser blocca il video**: Il browser rifiuta il caricamento per sicurezza
3. **URL valido ma bloccato**: L'URL è corretto ma il CSP non lo permette

**Dettagli errore**:

- `errorCode`: 4 = `MEDIA_ERR_SRC_NOT_SUPPORTED`
- `networkState`: 3 = `NETWORK_NO_SOURCE` (nessuna fonte valida)
- `readyState`: 0 = `HAVE_NOTHING` (nessun dato caricato)
- `videoCurrentSrc`: "" (vuoto - browser ha rifiutato l'URL)

## ✅ Fix Applicati

### 1. Aggiunta Direttiva `media-src` al CSP

**File**: `next.config.ts` (riga 19-30)

**Prima**:

```typescript
const cspHeader = `
  default-src 'self';
  img-src 'self' blob: data: https://*.supabase.co ...;
  // ❌ Mancava media-src
  connect-src 'self' https://*.supabase.co ...;
`
```

**Dopo**:

```typescript
const cspHeader = `
  default-src 'self';
  img-src 'self' blob: data: https://*.supabase.co ...;
  media-src 'self' blob: data: https://*.supabase.co https://*.supabase.in https://*.public.blob.vercel-storage.com;
  connect-src 'self' https://*.supabase.co ...;
`
```

**Spiegazione**:

- `media-src` controlla da dove possono essere caricati video e audio
- Permette video da Supabase Storage (`https://*.supabase.co`)
- Permette anche `blob:` e `data:` per video generati dinamicamente

### 2. Aggiunto Attributo `crossOrigin="anonymous"`

**File**: `src/app/home/allenamenti/oggi/page.tsx` (riga 76-85)

**Modifiche**:

- Aggiunto `crossOrigin="anonymous"` per CORS corretto
- Cambiato `preload="auto"` → `preload="metadata"` (più efficiente)

**Prima**:

```tsx
<video src={videoUrl} preload="auto" autoPlay />
```

**Dopo**:

```tsx
<video src={videoUrl} preload="metadata" crossOrigin="anonymous" autoPlay />
```

**Spiegazione**:

- `crossOrigin="anonymous"` permette CORS senza credenziali
- `preload="metadata"` carica solo metadata invece dell'intero video (più veloce)

## 🔍 Perché il Problema Si Verificava

1. **CSP senza `media-src`**: Il browser applica `default-src 'self'` che blocca video esterni
2. **URL Safety Check**: Il browser verifica che l'URL sia permesso dal CSP prima di caricarlo
3. **Rifiuto preventivo**: Il browser rifiuta l'URL prima ancora di tentare il caricamento

## ✅ Comportamento Dopo Fix

1. **CSP aggiornato**: I video da Supabase Storage sono ora permessi
2. **CORS corretto**: `crossOrigin="anonymous"` gestisce correttamente le richieste cross-origin
3. **Caricamento funzionante**: I video dovrebbero caricarsi correttamente
4. **Fallback preservato**: Se il video fallisce ancora, mostra l'immagine

## 🧪 Come Testare

1. **Riavvia il server** (necessario per applicare il nuovo CSP):

   ```bash
   # Ferma il server (Ctrl+C)
   npm run dev
   ```

2. **Pulisci la cache del browser**:
   - Chrome/Edge: Ctrl+Shift+Delete → Cancella cache
   - Oppure: F12 → Network tab → "Disable cache" (dev tools aperte)

3. **Ricarica la pagina** `/home/allenamenti/oggi`

4. **Verifica**:
   - I video dovrebbero caricarsi correttamente
   - Nessun errore `MEDIA_ERR_SRC_NOT_SUPPORTED`
   - Console senza errori CSP

## 📊 Verifica CSP

Dopo il riavvio, verifica che il CSP includa `media-src`:

1. Apri DevTools (F12)
2. Vai su Network tab
3. Ricarica la pagina
4. Controlla gli header della risposta
5. Cerca `Content-Security-Policy` e verifica che contenga:
   ```
   media-src 'self' blob: data: https://*.supabase.co ...
   ```

## ⚠️ Note Importanti

1. **Riavvio necessario**: Il CSP viene applicato solo al riavvio del server
2. **Cache browser**: Potrebbe essere necessario pulire la cache
3. **Hard refresh**: Usa Ctrl+Shift+R (o Cmd+Shift+R su Mac) per forzare ricaricamento

## 🔧 Se il Problema Persiste

Se dopo il riavvio il problema persiste:

1. **Verifica che il file esista**:

   ```bash
   # Prova ad aprire l'URL direttamente nel browser
   https://icibqnmtacibgnhaidlz.supabase.co/storage/v1/object/public/exercise-videos/be43f62f-b94a-4e4d-85d0-aed6fe4e595a/1767982246444-lngkemk.mp4
   ```

2. **Verifica CORS in Supabase**:
   - Vai su Supabase Dashboard > Storage > exercise-videos
   - Verifica che il bucket sia pubblico
   - Verifica le policies CORS

3. **Controlla formato video**:
   - Il formato potrebbe non essere supportato dal browser
   - Prova con un altro video per verificare

4. **Verifica CSP nel browser**:
   - F12 → Console
   - Cerca errori CSP
   - Dovrebbe mostrare quale direttiva sta bloccando

---

**Stato**: ✅ **Fix applicato** - Riavvia il server per applicare il nuovo CSP
