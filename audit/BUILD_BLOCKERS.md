# Build blocker confermati

## 1. `src/app/dashboard/documenti/page.tsx` — TypeScript

**Errore:** uso di `document.createElement` / `document.body` dove `document` è il **parametro** della callback `handleDownload(document: Document)`, ombreggiando il global `document` (DOM).

**Evidenza:** righe ~109–127: parametro nome `document` (tipo `@/types/document`) vs API DOM.

**File collegati:**

- `src/types/document.ts` — tipo dominio
- `src/hooks/use-documents.ts`, `src/components/dashboard/documenti/*` — solo se si estrae helper download

**Rischio patch:** basso — rename parametro (es. `doc`) + usare `globalThis.document` o `window.document` se necessario.

**Patch minima (da fare dopo approvazione):** rinominare parametro `document` → `doc` (o `fileRecord`); nel blocco async usare `doc.file_url` e DOM tramite globale non ombreggiato.

**Verifica:** `pnpm exec tsc --noEmit` o `next build`; smoke pagina `/dashboard/documenti`.

---

_Altri errori TS non confermati in questo audit: rieseguire build dopo fix #1._
