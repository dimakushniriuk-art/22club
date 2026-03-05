# Piano Refactor Design System — 22Club

**Obiettivo:** Trasformare lo stile attuale in un Design System completo, professionale e scalabile con Foundations (token), Component Library, Patterns, Theming per ruoli e Showcase su `/design-system`.

**Regole:** Nessun cambio alla logica di business; refactor strutturale; eliminare hardcode/duplicazioni; migrazione graduale.

---

## File esistenti individuati

| Categoria | File | Ruolo |
|-----------|------|--------|
| **Pagina showcase** | `src/app/design-system/page.tsx` | Pagina unica di riferimento (~2200 righe) |
| **Token base** | `src/config/design-system.ts` | Colori, radius, spacing, shadows, gradients (valori hex) |
| **Token estesi** | `src/config/design-tokens.ts` | Re-export da design-system + `tokenToCSS` |
| **Config completa** | `src/config/master-design.config.ts` | masterColors, masterLayout, masterCards, masterButtons, masterAnimations, masterTypography, breakpoints, helper |
| **Utility classi** | `src/config/dkdesign.ts` | `dk.container`, `dk.card`, pattern layout/card/button |
| **Tailwind** | `tailwind.config.ts` | theme.extend da design-system + brand/state/semantic/athlete colors, keyframes, plugin (.text-gradient, .bg-glass, .border-gradient) |
| **CSS globale** | `src/app/globals.css` | :root (--color-*), body gradient, .focus-ring |
| **CSS token** | `src/styles/design-tokens.css` | (da verificare uso) |
| **CSS ruoli** | `src/styles/athlete-colors.css` | (da verificare) |
| **Componenti UI** | `src/components/ui/*.tsx` (34 file) | Button, Card, Input, Badge, Tabs, Dialog, Drawer, Table, ecc. |
| **Export UI** | `src/components/ui/index.ts` | Export centralizzato (manca Alert/Toast in index se esistono) |
| **Doc** | `docs/DESIGN_SYSTEM_COMPLETO.md`, `docs/DESIGN_GUIDELINES.md`, `docs/design.md` | Documentazione esistente |

---

## A) Audit — Stili hardcoded e componenti duplicati

### A1. Colori e stili inline (hex/rgba) nelle pagine

Raggruppati per categoria.

**Colori hex/rgba inline (`style={{ }}` o stringhe):**

- **design-system/page.tsx** — ~74 occorrenze: gradienti teal/cyan, bordi `rgba(2,179,191,0.4)`, boxShadow, background linear-gradient per Header Glass, Card con barra, blocchi griglia.
- **home/** — 19+ file con stili inline: `home/page.tsx`, `home/profilo`, `home/progressi/*`, `home/documenti`, `home/nutrizionista`, `home/massaggiatore`, `home/_components/home-layout-client.tsx`, `home/allenamenti/oggi`, `home/foto-risultati/*`, `home/trainer`.
- **dashboard/** — `dashboard/calendario/page.tsx` (36 occorrenze), altri con 1–4.
- **Auth/Base** — `login`, `forgot-password`, `reset-password`, `reset`, `registrati`, `welcome`, `layout.tsx`.
- **Altri** — `privacy`, `termini`, `not-found`, `invita-atleta`, `esercizi`, `allenamenti`, `pagamenti`, `progressi/nuovo`.

**Classi Tailwind ripetute (pattern da tokenizzare):**

- **Header Glass (teal):**  
  `rounded-2xl backdrop-blur-xl`, `border: 1px solid rgba(2, 179, 191, 0.4)`, `background: linear-gradient(135deg, rgba(2,179,191,0.09)...)`, `boxShadow: 0 4px 24px...`  
  → Ripetuto in design-system page (3+ blocchi) e potenzialmente in home layout/header.
- **Header Compatto (cyan):**  
  `rounded-xl border border-cyan-500/30 bg-background-secondary/80 backdrop-blur-sm`, `border-cyan-500/30 bg-cyan-500/10` per icon box.  
  → Ripetuto in design-system e in PATH_META block.
- **Card con barra sinistra:**  
  `border border-cyan-500/30` / `border-teal-500/30`, `bg-cyan-500/40` / `bg-teal-500/40` barra, `bg-cyan-500/10` / `bg-teal-500/10` icon box.  
  → Ripetuto in design-system (2 varianti) e in PATH_META.
- **Blocchi griglia home:**  
  `border`, `background`, `boxShadow: inset 6px 0 0 0 {bar}`, `rounded-2xl`, iconBg rgba.  
  → Valori teal/cyan/green/emerald/amber duplicati.
- **Trainer (settings-trainer-profile-tab):**  
  `border-teal-500/20`, `border-teal-500/10`, `bg-teal-500/10`, `shadow-teal-500/10`, `bg-teal-500/90`, `text-teal-400` — molte occorrenze; il tema trainer in master-design usa blue/indigo ma l’UI reale usa teal (incoerenza da decidere).

### A2. Token e fonti multiple (duplicazione)

- **Colori:** definiti in `design-system.ts`, `tailwind.config.ts` (con estensioni brand/state/semantic/athlete), `globals.css` (:root), e ripetuti in `master-design.config.ts` (masterColors.athlete/trainer/admin con stringhe Tailwind).
- **Radius:** `design-system.radius` (sm/md/lg/xl/2xl) + Tailwind `borderRadius.full`; in pagine si usano anche `rounded-xl` / `rounded-2xl` senza sempre riferirsi ai token.
- **Spacing:** `design-system.spacing` + Tailwind extend; touch target `min-h-[44px]` / `min-w-[44px]` ripetuti ovunque.
- **Focus ring:** `masterAnimations.focus.ring` (`focus:ring-2 focus:ring-cyan-500...`), `.focus-ring` in globals.css, e plugin Tailwind `.text-gradient` con colori fissi.

### A3. Componenti duplicati o pattern non componentizzati

- **Header pagina (Glass vs Compatto):** nessun componente condiviso; ogni pagina/home ripete markup (back button, icon box, titolo, sottotitolo).
- **Card con barra laterale:** nessun componente “MetricCard” o “BarCard”; stesso markup ripetuto con varianti cyan/teal.
- **Blocco griglia home (tile con icon + label + desc):** markup ripetuto in design-system e probabilmente in `home/page.tsx`; non estratto in componente riutilizzabile.
- **Empty state:** esiste `EmptyState` in `shared/ui`; uso non uniforme (alcune pagine usano layout custom).
- **Button:** varianti `primary`/`secondary`/`ghost`/`outline` con classi teal hardcoded nel componente (`bg-teal-500`, `border-teal-500`); nessuna variante “role” (athlete/trainer/admin) che usi i token di ruolo.
- **Card:** varianti `default`/`elevated`/`outlined`/`athlete`/`trainer`/`admin` usano `masterCards`; trainer in UI reale spesso teal invece di blue (vedi A1).

### A4. Riepilogo per categoria

| Categoria | Problema | Dove |
|-----------|----------|------|
| **Colori** | Hex/rgba inline; scale teal/cyan/green/emerald/amber non unificate in un unico layer token | design-system page, home/*, dashboard/calendario, settings-trainer |
| **Gradienti** | Linear gradient e box-shadow ripetuti per Glass e card | design-system, home layout |
| **Tipografia** | Classi ad hoc (text-lg font-bold, text-[10px] uppercase) senza sempre riferirsi a scale tipografica | Tutte le pagine |
| **Spacing/Radius** | Uso diretto di classi Tailwind invece di token nominali (es. space-2, rounded-xl) | Globale |
| **Focus/Accessibility** | Focus ring definito in più posti; non sempre applicato a controlli custom | master-design, globals, button |
| **Layout** | Header (Glass/Compatto), card con barra, blocchi griglia non componentizzati | home, design-system |
| **Theming ruolo** | master-design trainer = blue/indigo; UI trainer = teal; incoerenza | master-design.config vs settings-trainer, dashboard |

---

## B) Design Tokens — Sistema centralizzato

**Obiettivo:** Una sola fonte di verità per token; Tailwind e CSS variabili derivati da lì.

### B1. File da creare/modificare

| File | Azione |
|------|--------|
| `src/lib/design-tokens/index.ts` | **Creare** — Export unificato di tutti i token (re-export da sotto-moduli). |
| `src/lib/design-tokens/colors.ts` | **Creare** — Neutral scale, semantic (success/warning/error/info), background layers (DEFAULT, elevated, subtle, secondary, tertiary), glass (teal/cyan), border/input, primary/accent per ruolo (athlete/trainer/admin). Valori hex; mappa anche per “role accent” (teal, cyan, green, emerald, amber per atleta). |
| `src/lib/design-tokens/typography.ts` | **Creare** — Scale (xs → 6xl), font-family, font-weight, line-height; label “display”, “heading”, “body”, “caption”, “overline”. |
| `src/lib/design-tokens/spacing.ts` | **Creare** — Scale (0, 1, 2, … 128 + valori custom 18, 88), touch target (44px), container padding. |
| `src/lib/design-tokens/radius.ts` | **Creare** — none, sm, md, lg, xl, 2xl, full con valori px. |
| `src/lib/design-tokens/shadow.ts` | **Creare** — soft, glow, elevation (sm, md, lg, xl, 2xl), inner; glow primary/teal. |
| `src/lib/design-tokens/motion.ts` | **Creare** — Durations (150, 200, 300), easing (ease-out, ease-in-out), keyframes names (fade-in, slide-in-up, …). |
| `src/lib/design-tokens/focus.ts` | **Creare** — Ring width, ring color, ring offset, outline; stati accessibility. |
| `src/lib/design-tokens/gradients.ts` | **Creare** — Brand (teal–gold), glass header (teal), card gradient (from-teal-900 to-cyan-900), role gradients. |
| `src/config/design-system.ts` | **Modificare** — Ridurre a thin layer che importa da `@/lib/design-tokens` e re-esporta per backward compatibility (opzionale) oppure deprecare in favore di `lib/design-tokens`. |
| `tailwind.config.ts` | **Modificare** — Estendere theme da `@/lib/design-tokens` (colori, spacing, radius, boxShadow, animation) invece di duplicare valori. |
| `src/app/globals.css` | **Modificare** — :root che usa CSS variables derivate dai token (o generate da script) per coerenza. |

### B2. Contenuto concettuale token

- **Colori:** neutral (background/surface scale), semantic, background layers, glass (header/card), border/input, primary + accent per ruolo; hex per swatch e theming.
- **Typography:** scale completa, famiglie, pesi, colori testo (primary, secondary, muted, disabled).
- **Spacing:** scale 0–128 + touch 44px, gap/space/padding nominali.
- **Radius:** 0, sm…2xl, full con px.
- **Shadow/elevation:** soft, glow, scale elevation + inner.
- **Motion:** duration, easing, keyframes (fade-in, slide-in-up, …).
- **Focus:** ring 2px, colore primary, offset; outline none dove serve.

---

## C) Component Library — Standardizzazione

**Obiettivo:** Componenti core con varianti, size e stati documentati; nessun colore/radius hardcoded nelle varianti, solo token o classi da theme.

### C1. File da creare/modificare

| File | Azione |
|------|--------|
| `src/components/ui/button.tsx` | **Modificare** — Varianti e size già presenti; allineare a token (primary/secondary/ghost/outline/destructive/success/warning/link); stati loading/disabled; opzionale variant “role” (athlete/trainer/admin) che applica colori tema. Rimuovere hex/teal hardcoded dove possibile. |
| `src/components/ui/card.tsx` | **Modificare** — Varianti default/elevated/outlined/athlete/trainer/admin; aggiungere varianti “glass”, “metric” (con barra laterale); usare token per bordi e gradient. |
| `src/components/ui/input.tsx` | **Modificare** — Stati default, focus, error, disabled, success; classi da token (border, ring). |
| `src/components/ui/select.tsx`, `simple-select.tsx` | **Modificare** — Stessi stati di Input dove applicabile. |
| `src/components/ui/textarea.tsx` | **Modificare** — Stessi stati di Input. |
| `src/components/ui/badge.tsx` | **Modificare** — Varianti semantic (success, warning, error, info) + optional “role”; usare token. |
| `src/components/ui/tabs.tsx` | **Modificare** — Allineare a token (border, active state). |
| `src/components/ui/dialog.tsx` | **Modificare** — Overlay e content da token (background, shadow, radius). |
| `src/components/ui/drawer.tsx` | **Modificare** — Stesso approccio. |
| `src/components/ui/toast.tsx` | **Verificare** — Se esiste, esporre in index e allineare a token. |
| `src/components/ui/table.tsx` | **Modificare** — Stili header/cell da token; adatto a dashboard. |
| **Pattern condivisi** | |
| `src/components/layout/page-header-glass.tsx` | **Creare** — Header “Glass” (teal): back button, icon, titolo, sottotitolo; stili da token. |
| `src/components/layout/page-header-compact.tsx` | **Creare** — Header “Compatto” (cyan): stesso schema, variante compatta. |
| `src/components/ui/card-metric.tsx` | **Creare** — Card con barra sinistra, icon, label, value; variante accent (teal/cyan/…) da token. |
| `src/components/home/home-block-tile.tsx` | **Creare** (opzionale) — Tile griglia home (icon, label, description, link) con accent da token. |
| `src/components/ui/index.ts` | **Modificare** — Export Toast/Alert se presenti; eventuale export CardMetric, PageHeaderGlass, PageHeaderCompact da layout. |

### C2. Stati da mostrare in design-system

- Button: default, hover, active, focus, disabled, loading per ogni variante e size.
- Card: default, elevated, outlined, athlete, trainer, admin, glass, metric (con barra).
- Input/Select/Textarea: default, focus, error, disabled, success.
- Badge/Chip: varianti e stati.
- Tabs: default, active, hover.
- Modal/Drawer: overlay, content, focus trap.
- Toast/Alert: success, warning, error, info.
- Sidebar/Nav: item default, active, hover.
- Table: header, row, hover, striped (se previsto).

---

## D) Theming — Role themes

**Obiettivo:** Cambiare solo primary/accent/gradient per ruolo; il resto condiviso.

### D1. File da creare/modificare

| File | Azione |
|------|--------|
| `src/lib/design-tokens/themes.ts` | **Creare** — Definizione “role themes”: `athlete`, `trainer`, `admin`. Ogni tema: primary, primaryHover, primaryActive, accent (opzionale), gradient primary, gradient glass (se diverso), border accent. Resto (neutral, semantic, typography, spacing, radius) condiviso. |
| `src/config/master-design.config.ts` | **Modificare** — Allineare trainer a tema “trainer” (decisione prodotto: mantenere blue/indigo o unificare a teal per coerenza con UI attuale). Far dipendere masterColors.athlete/trainer/admin da `themes.ts` dove possibile. |
| **CSS / Context** | **Opzionale** — Se si vuole theme switch runtime: React context + class su `<html>` (es. `data-theme="athlete"`) e CSS variables per primary/accent; oppure solo token a build-time per ruolo. |

### D2. Contenuto themes

- **athlete:** primary teal (#02b3bf), gradient teal–cyan, glass teal; accenti secondari cyan, green, emerald, amber (per blocchi home).
- **trainer:** primary blue (#3b82f6) o teal se si unifica; gradient e glass coerenti.
- **admin:** primary purple/gray; gradient e glass coerenti.

---

## E) Pagina /design-system — Showcase

**Obiettivo:** Single source of truth visivo: tutti i token, tutti i componenti, tutte le varianti e stati, esempi di layout, opzionale palette switcher per ruolo.

### E1. File

| File | Azione |
|------|--------|
| `src/app/design-system/page.tsx` | **Refactor** — Ridurre a “showcase” che importa sezioni da sotto-componenti; non tenere tutto in un unico file da 2200 righe. |
| `src/app/design-system/_sections/foundations-colors.tsx` | **Creare** — Sezione Colori: neutral, semantic, layers, glass, role accents; swatch + hex. |
| `src/app/design-system/_sections/foundations-typography.tsx` | **Creare** — Scale, famiglie, pesi, colori testo. |
| `src/app/design-system/_sections/foundations-spacing-radius.tsx` | **Creare** — Spacing e radius con valori px. |
| `src/app/design-system/_sections/foundations-motion.tsx` | **Creare** — Duration, easing, keyframes demo. |
| `src/app/design-system/_sections/components-buttons.tsx` | **Creare** — Tutte le varianti e stati Button. |
| `src/app/design-system/_sections/components-cards.tsx` | **Creare** — Card variants + glass + metric. |
| `src/app/design-system/_sections/components-forms.tsx` | **Creare** — Input, Select, Textarea, Checkbox, stati. |
| `src/app/design-system/_sections/components-feedback.tsx` | **Creare** — Badge, Toast, Alert, Spinner. |
| `src/app/design-system/_sections/components-navigation.tsx` | **Creare** — Tabs, Nav item, Sidebar sample. |
| `src/app/design-system/_sections/components-overlays.tsx` | **Creare** — Dialog, Drawer. |
| `src/app/design-system/_sections/components-data.tsx` | **Creare** — Table, Skeleton. |
| `src/app/design-system/_sections/patterns-headers.tsx` | **Creare** — PageHeaderGlass, PageHeaderCompact. |
| `src/app/design-system/_sections/patterns-layouts.tsx` | **Creare** — Esempi dashboard sections, liste, form layout. |
| `src/app/design-system/_sections/design-home.tsx` | **Modificare** — Estrarre da page.tsx la sezione Design Home (route /home/*) e usare token/componenti condivisi (CardMetric, header components). |
| `src/app/design-system/page.tsx` | **Sostituire** — Layout con nav interna (anchor), Role switcher (mini palette) opzionale, import delle sezioni sopra. |

### E2. Contenuto showcase

- **Foundations:** Colori (swatch + hex), Tipografia (scale + sample), Spacing, Radius, Shadow, Motion, Focus ring.
- **Components:** Per ogni componente: varianti, size, stati (hover, active, focus, disabled, loading).
- **Patterns:** Header Glass/Compatto, Card con barra, Griglia blocchi home; layout dashboard (section, list, form).
- **Design Home:** Card per ogni route /home/* con token table, elementi reali (header + card bar), griglia colori/tipografia/icone/moduli/radius/spacing (come oggi ma dati da token).
- **Theming:** Sezione “Role themes” con palette atleta/trainer/admin; opzionale switcher che cambia preview (es. primary/accent).

---

## Modalità di lavoro (batch da max 5 file)

1. **Batch 1 — Token base**  
   Creare `src/lib/design-tokens/` (index, colors, typography, spacing, radius, shadow, motion, focus, gradients). Aggiornare `tailwind.config.ts` per estendere da questi token. Non toccare ancora le pagine.

2. **Batch 2 — Themes e design-system.ts**  
   Aggiungere `themes.ts`; aggiornare `design-system.ts` (o deprecare) e `master-design.config.ts` per usare token/themes dove possibile.

3. **Batch 3 — Componenti layout e Card/Button**  
   Creare `PageHeaderGlass`, `PageHeaderCompact`, `CardMetric`; aggiornare `button.tsx` e `card.tsx` per usare token.

4. **Batch 4 — Form e feedback**  
   Aggiornare Input, Select, Textarea, Badge per stati e token; verificare Toast/Alert e export in index.

5. **Batch 5 — Design-system page refactor**  
   Estrarre sezioni in `_sections/*`; ridurre `page.tsx` a layout + nav + import sezioni; Design Home che usa i nuovi componenti e token.

6. **Batch successivi** — Sostituire progressivamente negli app route (home, dashboard, auth) gli stili inline e i pattern duplicati con i nuovi componenti e token; infine allineare trainer theme (blue vs teal) e rimuovere duplicazioni residue.

---

## Riepilogo file esatti

**Da creare:**

- `src/lib/design-tokens/index.ts`
- `src/lib/design-tokens/colors.ts`
- `src/lib/design-tokens/typography.ts`
- `src/lib/design-tokens/spacing.ts`
- `src/lib/design-tokens/radius.ts`
- `src/lib/design-tokens/shadow.ts`
- `src/lib/design-tokens/motion.ts`
- `src/lib/design-tokens/focus.ts`
- `src/lib/design-tokens/gradients.ts`
- `src/lib/design-tokens/themes.ts`
- `src/components/layout/page-header-glass.tsx`
- `src/components/layout/page-header-compact.tsx`
- `src/components/ui/card-metric.tsx`
- `src/app/design-system/_sections/foundations-*.tsx` (4 file)
- `src/app/design-system/_sections/components-*.tsx` (6+ file)
- `src/app/design-system/_sections/patterns-*.tsx` (2 file)
- `src/app/design-system/_sections/design-home.tsx`

**Da modificare:**

- `tailwind.config.ts`
- `src/config/design-system.ts` (o deprecare)
- `src/config/design-tokens.ts`
- `src/config/master-design.config.ts`
- `src/app/globals.css`
- `src/components/ui/button.tsx`
- `src/components/ui/card.tsx`
- `src/components/ui/input.tsx`
- `src/components/ui/select.tsx`, `simple-select.tsx`
- `src/components/ui/textarea.tsx`
- `src/components/ui/badge.tsx`
- `src/components/ui/tabs.tsx`
- `src/components/ui/dialog.tsx`
- `src/components/ui/drawer.tsx`
- `src/components/ui/table.tsx`
- `src/components/ui/index.ts`
- `src/app/design-system/page.tsx`

**Da verificare (nessuna modifica in questo piano):**

- `src/styles/design-tokens.css`, `athlete-colors.css` — uso e eventuale allineamento ai nuovi token in un secondo momento.
- Nutrizionista/Massaggiatore: non sviluppare nuove UI; se compaiono, non rompere (già indicato nei vincoli).

---

*Fine piano. Prima azione consigliata: implementare Batch 1 (token + tailwind) e poi procedere con Audit fine su 2–3 route (es. /home, /home/progressi, /dashboard) per sostituire i primi hardcode.*
