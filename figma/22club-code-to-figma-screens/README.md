# 22Club Code → Figma · Screens

Plugin Figma separato dai plugin per singolo componente (`22club-code-to-figma-metric-card`, `22club-code-to-figma-core-components`). Compone **schermate** da JSON: layout base **1440px**, padding **32**, auto-layout verticale.

## Uso

1. Figma → **Plugins** → **Development** → **Import plugin from manifest…** → seleziona `manifest.json` in questa cartella.
2. Apri il file (es. `02_05__Components_Patterns_Screens` nel file DS 22Club).
3. Esegui il plugin, incolla il JSON (es. contenuto di `examples/dashboard.json`), **Crea schermata su canvas**.
4. **Re-run sicuro:** se esiste già un frame di nome `EXPORT · Dashboard Screen` sulla pagina corrente, viene **rimosso** e ricreato al centro del viewport.

## Component vs Screen

| Livello       | Plugin                       | Input                                                            | Output                                                                            |
| ------------- | ---------------------------- | ---------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| **Component** | MetricCard / Core Components | `type: "MetricCard"` o `DashboardColumnPanel` / `EmptyState` / … | Frame export per uno o più componenti affiancati                                  |
| **Screen**    | **Screens** (questo)         | `type: "Screen"` + `sections`                                    | Un unico frame `EXPORT · Dashboard Screen` con header, riga KPI e griglia colonne |

La logica di disegno delle card e dei pannelli è **allineata** ai plugin component (stessi parametri visivi); questo plugin solo **orchestra** `buildMetricCard`, `buildPanel`, `buildEmptyState`, `buildSkeleton` senza reintrodurre varianti divergenti.

## Schema JSON (`Screen`)

Campi principali:

- `type`: sempre `"Screen"`.
- `name`, `layout`: metadati (es. `dashboard_base`); il layout è fisso nel plugin (nessun motore di breakpoint).
- `header` (opzionale): `{ "title": "…", "subtitle": "…" }` — placeholder testuale, non la shell React reale.
- `sections`: array ordinato.
  - `{ "type": "kpi", "items": [ … ] }` — ogni elemento di `items` deve avere `type: "MetricCard"` e gli stessi campi degli esempi in `22club-code-to-figma-metric-card/examples/`.
  - `{ "type": "columns", "columns": [ … ] }` — tre colonne consigliate; larghezza colonna calcolata su area interna `1440 - 64`.

### Colonne

Ogni elemento di `columns` ha `type`:

- **`panel`** — `DashboardColumnPanel`: `state` tra `list` (default), `empty`, `loading`; `title`, `items` (per lista).
- **`emptyState`** — componente `EmptyState` completo (`title`, `description`, `actions`).
- **`skeleton`** — `items` come array di placeholder (lunghezza = numero di righe skeleton).

Per una griglia **solo pannelli** (list / empty / loading), usa tre oggetti `{ "type": "panel", "state": "…" }`. L’esempio `examples/dashboard.json` usa `panel` + `emptyState` + `skeleton` per mostrare **tutti** i builder supportati in un colpo solo.

## Limitazioni

- Nessun **routing** né URL: è solo un frame statico.
- Nessuna **logica React** (hook, dati live, auth): solo JSON statico.
- Layout **semplificato** rispetto al dashboard Next.js (niente sidebar, niente responsive multi-breakpoint).
- Icone MetricCard restano **etichetta testuale** nel cerchio, come nel plugin MetricCard.

## File

- `manifest.json` — manifest plugin.
- `code.js` — UI + `buildScreen()` che chiama i builder sopra.
- `examples/dashboard.json` — schermata Dashboard di esempio.
