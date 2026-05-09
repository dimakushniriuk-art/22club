# 22Club Code -> Figma MetricCard Exporter

Plugin locale per importare JSON `MetricCard` e generare card su canvas Figma in un frame unico `EXPORT · MetricCard`.

## Scopo

- Validare rapidamente varianti/tone/loading di `MetricCard` senza modificare componenti React.
- Usare input JSON versionato nel repository come bridge tra codice e Figma.

## Import in Figma

1. Apri Figma Desktop.
2. Vai su **Plugins > Development > Import plugin from manifest...**
3. Seleziona `figma/22club-code-to-figma-metric-card/manifest.json`.
4. Esegui il plugin dalla sezione Development.

## Uso con `metric-card.json`

1. Apri `figma/22club-code-to-figma-metric-card/examples/metric-card.json`.
2. Copia il JSON (oggetto singolo).
3. Incolla nel plugin e conferma.
4. Il plugin crea/rigenera `EXPORT · MetricCard` con una card.

## Uso con `metric-card-variants.json`

1. Apri `figma/22club-code-to-figma-metric-card/examples/metric-card-variants.json`.
2. Copia il JSON (array di oggetti).
3. Incolla nel plugin e conferma.
4. Il plugin crea/rigenera `EXPORT · MetricCard` con piu card in layout semplice wrap.

## Schema

Campi supportati dal payload:

- `type`
- `name`
- `variant`
- `tone`
- `title`
- `value`
- `subtitle`
- `status`
- `statusText`
- `icon`
- `loading`

## Limiti

- Non esporta la logica React.
- Non esporta animazioni/counter runtime (es. countUp).
- `subtitle` e un campo di export/Figma, non runtime React.
- Le icone sono placeholder testuali (nome icona), non SVG Lucide reali.

## REAL_USAGE_MAPPING

Caso reale validato dal codice:

- Route: `src/app/dashboard/marketing/leads/page.tsx`
- Card: `Lead totali`
- JSX reale:
  - `title="Lead totali"`
  - `value={loadingData ? 0 : bySearch.length}` (dinamico)
  - `icon={<UserPlus ... />}`
  - `tone="teal"`
  - `compact` (mapped to JSON `variant: "compact"`)
  - `loading={loadingData}`

Conversione React -> JSON (`examples/metric-card-real.json`):

- Obbligatori: `type`, `title`, `value`
- Opzionali: `name`, `variant`, `tone`, `icon`, `status`, `statusText`, `subtitle`, `loading`
- Regole:
  - `compact` boolean in React -> `variant: "compact"` nel JSON.
  - `icon` ReactNode -> stringa nome icona (es. `UserPlus`).
  - Se `value` e dinamico, usare snapshot realistico coerente con UI (qui: `"24"`).
  - Se una prop non e presente in JSX reale, non inserirla nel JSON.

## REAL_USAGE_GAPS

React -> JSON:

- `compact` in React non esiste come campo JSON dedicato; va tradotto in `variant`.
- `icon` in React e un nodo Lucide, in JSON diventa solo nome stringa.
- `value` puo essere espressione runtime (es. filtro live), JSON richiede valore statico snapshot.
- `trend`/`enableCountUp` esistono in React ma non hanno resa runtime equivalente nel plugin.

JSON -> Figma output:

- L'icona e resa come testo nel cerchio (`text · iconName`), non come SVG.
- `subtitle` viene mostrato in Figma anche se non presente nell'uso React reale.
- Spacing e tipografia sono approssimati dal plugin (`pad/gap` per `compact`), non 1:1 con Tailwind runtime.

## Test reale (plugin)

Input per test: `examples/metric-card-real.json`.

Checklist:

- Layout compatto coerente (`variant: compact`)
- Gerarchia testo corretta (`title` sopra `value`)
- Icona allineata a destra in chip circolare
- Nessun badge status (coerente con JSX reale senza `status/statusText`)
