# 22Club Code → Figma · App (multi-screen)

Plugin Figma locale che genera un frame **`EXPORT · 22Club App`** con più schermate impilate (nav visiva: titolo sezione, divider, frame schermo), a partire da un JSON root `type: "App"`.

## Come usarlo

1. In Figma: **Plugins → Development → Import plugin from manifest…** e scegli `manifest.json` in questa cartella.
2. Apri il plugin, incolla il JSON (es. copia da `examples/app.json`).
3. Clic **Genera su canvas**. Se esiste già un frame **`EXPORT · 22Club App`** sulla pagina corrente, viene **rimosso** e ricreato (export idempotente).

## `examples/app.json`

- Root: `{ "type": "App", "name": "22Club", "screens": [ ... ] }`.
- Ogni voce in `screens` è un descrittore leggero: `type: "Screen"`, `name` (titolo visivo), `layout` (chiave layout interno al plugin).

### Layout supportati

| `layout`         | Contenuto generato                                                                                                                                                              |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `dashboard_base` | Stesso preset di `figma/22club-code-to-figma-screens/examples/dashboard.json` (KPI MetricCard + griglia colonne panel / empty / skeleton). Header titolo = `name` della screen. |
| `table_base`     | Header + riga orizzontale: pannello filtri, tabella placeholder, `EmptyState` dettaglio.                                                                                        |
| `pipeline`       | Header + colonne tipo lead (Nuovo, Contattato, Trial, Perso) con card placeholder.                                                                                              |

## App vs Screen

- **`App`**: un solo JSON elenca più screen; il plugin crea il contenitore export e una **sezione** per ciascuna (titolo + linea + frame schermo), con **spacing 40** tra sezioni (via `itemSpacing` del root + blocchi).
- **`Screen`**: puoi incollare anche un JSON `type: "Screen"` completo (come nel plugin _Screens_): viene creato un frame **`EXPORT · Dashboard Screen`**; utile per iterare una singola vista senza rigenerare tutta l’app.

## Limitazioni (v1)

- **Nessun routing** Next.js: solo composizione statica su canvas.
- **Nessuno stato dinamico** (auth, fetch, loading reali).
- **Layout semplificati** rispetto alle pagine React; icone MetricCard sono etichette testuali come negli altri plugin Code → Figma.
- I **builder** (MetricCard, panel, empty, skeleton, griglia dashboard) sono allineati a `figma/22club-code-to-figma-screens/code.js`; finché non c’è un bundle condiviso, modifiche ai builder vanno tenute coerenti a mano tra i due file.

## Riferimenti repo

- Metriche: `figma/22club-code-to-figma-metric-card/`
- Core UI: `figma/22club-code-to-figma-core-components/`
- Singola schermata dashboard: `figma/22club-code-to-figma-screens/`
