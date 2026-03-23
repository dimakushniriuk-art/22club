# Piano patch in batch (max 3–5 file per batch)

## Ordine globale

1. Build blockers
2. Warning lint ad alta affidabilità
3. Auth/RBAC e normalizzazione ruoli
4. Accesso dati e servizi
5. Feature rotte critiche
6. Test core
7. Cleanup debug/log
8. Refactor locali solo se necessario

---

### Batch A — Build blocker documenti (primo da eseguire)

| Campo         | Valore                                                 |
| ------------- | ------------------------------------------------------ |
| **Nome**      | `fix-documenti-page-document-shadow`                   |
| **Obiettivo** | Ripristinare compilazione TS su pagina documenti staff |
| **File**      | `src/app/dashboard/documenti/page.tsx` (1 file)        |
| **Motivo**    | Parametro `document` ombreggia `global document`       |
| **Rischio**   | Basso                                                  |
| **Verifiche** | `tsc` / `next build`; click download documento in UI   |

---

### Batch B — Lint ad alta confidenza (da definire dopo `eslint` su codebase)

- Obiettivo: solo fix meccanici (unused, import order se policy) — elenco file dopo prima passata lint.

### Batch C — Auth/RBAC

- Obiettivo: allineare check `role` tra middleware, layout dashboard, API admin.
- File: da mappare da `auth_roles_map_clean` (max 5 per iterazione).

### Batch D — Data access

- Obiettivo: documentare poi estrarre query duplicate verso hook o API unica (non in primo ciclo).

### Batch E — API debug

- Obiettivo: proteggere o rimuovere `api/debug-trainer-visibility`.

---

## Avviso prima della prima modifica codice

```
ATTENZIONE: da questo step in poi si tocca il codice.
File previsti:
- src/app/dashboard/documenti/page.tsx

Motivo:
- Shadowing del global `document` da parametro handleDownload(document: Document).

Rischio:
- Basso (rename parametro / uso esplicito del DOM global).

Verifiche:
- next build o tsc --noEmit; manuale: download da /dashboard/documenti.
```

_Eseguire solo dopo conferma nel contesto del task._
