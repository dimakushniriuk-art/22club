# Preview e download file storage (proxy same-origin)

Documentazione operativa per riusare lo stesso pattern altrove nel progetto.

## Problema risolto

- Bucket **privati**: URL firmati Supabase o `getPublicUrl` non sono affidabili in iframe / nuove schede (Kong, cookie, JWS).
- **Soluzione**: tutto passa da **`GET /api/document-preview?bucket=…&path=…`**, che streamma il file con la sessione Next (cookie) e usa prima il client utente + JWT, poi fallback admin/signed URL lato server.

## Route API

**File:** `src/app/api/document-preview/route.ts`

- **Query:** `bucket` (nome bucket Supabase), `path` (path oggetto **non** URL-encoded nel senso “intero string come un segmento”; i segmenti sono codificati per segmento in REST).
- **Autenticazione:** cookie sessione Supabase (route usa `createClient` server).
- **Autorizzazione:** dipende da bucket e prefisso path (vedi sotto).

### Bucket ammessi

Allineare sempre a `STORAGE_PREVIEW_BUCKETS` in `src/lib/documents.ts`:

- `documents` — dossier, fatture, piani, `chat_files/…`, ecc.
- `athlete-certificates`, `athlete-referti`, `athlete-documents` — primo segmento path = `auth.users.id`, risolto a `profiles.id`.
- `trainer-certificates`, `trainer-media` — stesso schema user-id nel path; accesso trainer pubblico + owner + admin.

### Regole accesso (sintesi)

| Contesto | Logica |
|----------|--------|
| Path `documents` “atleta” (dossier/, fatture/, …) | `profiles.id` estratto dal path; `canActorAccessAthleteStorageObject` (atleta, trainer assegnato, staff_atleti, admin). |
| `documents` con prefisso `chat_files/{authUserId}/…` | Mittente o destinatario di un messaggio con `file_url` che contiene quel path (o uploader = attore). |
| Bucket athlete-* e trainer-* con path `{userId}/…` | Owner `profiles.id`; per athlete stessa matrice staff; per trainer file di profilo trainer autenticato. |

Aggiungere un **nuovo bucket privato**:

1. Inserirlo in `ALLOWED_BUCKETS` nella route **e** in `STORAGE_PREVIEW_BUCKETS` in `documents.ts`.
2. Implementare `resolveOwnerProfileIdForPreview` (e se serve una `canActorAccess…` dedicata) nella route.
3. Usare in UI `storagePreviewHref` / `storagePreviewHrefFromUrl`.

## Libreria client

**File:** `src/lib/documents.ts`

### Path da URL o stringa

- `resolveStorageObjectPathFromUrl(fileUrl, bucket)` — estrae path da URL Supabase (`/object/public|sign|authenticated/{bucket}/…`) o path relativo con `/`.
- `resolveDocumentsStoragePath(fileUrl)` — solo bucket `documents`.
- `resolveInvoiceDocumentsStoragePath(invoiceUrl)` — fatture (URL o path legacy).

### Link e download (browser)

- `storagePreviewHref(bucket, storagePath)` → `/api/document-preview?bucket=…&path=…`
- `storagePreviewHrefFromUrl(fileUrl, bucket)`
- `storagePreviewHrefFromUrlOrPath(bucket, urlOrPath)` — utile se non sai se è URL o path.
- `documentsFilePreviewHref(fileUrl)` — shortcut per tabella `documents`.
- `fetchStorageBlobViaPreview(bucket, path)` / `fetchDocumentBlobViaPreview(fileUrl)` — `fetch` con `credentials: 'include'`.
- `downloadStorageBlobViaPreview(bucket, path, fileName)` — blob + `<a download>`.
- `isStoragePreviewBucket(bucket)` — per fallback se il bucket non è nel proxy.

### Pattern UI

```tsx
// Apri in nuova scheda
const href = storagePreviewHref('documents', storagePath)
window.open(href, '_blank', 'noopener,noreferrer')

// Da URL noto + bucket
const href = storagePreviewHrefFromUrl(fileUrl, 'trainer-certificates') ?? fileUrl

// Download
await downloadStorageBlobViaPreview('documents', storagePath, fileName)

// Tabella documents
const href = documentsFilePreviewHref(doc.file_url)
if (href) window.open(href, '_blank', 'noopener,noreferrer')
```

### iframe (es. fattura)

```tsx
<iframe src={storagePreviewHref(DOCUMENTS_STORAGE_BUCKET, filePath)} title="Anteprima" />
```

Stesso origine → cookie inviati automaticamente.

## Cosa non sostituire con il proxy

- Bucket **non** in `STORAGE_PREVIEW_BUCKETS` (es. `progress-photos`) → restano signed URL o altra logica finché non estendi la route.
- **`trainer-storage.ts`**: dopo upload salva ancora signed URL in DB per compatibilità; la **visualizzazione** può usare `storagePreviewHrefFromUrl` come in `home/trainer/page.tsx`.

## Manutenzione indice progetto

Modifiche a bucket ammessi o entry point rilevanti: aggiornare `INDICE_PROGETTO.md` (data e tabella dominio documenti / `documents.ts`).

---

*Ultimo allineamento: flusso marzo 2026 (JWT utente + proxy, chat e trainer bucket).*
