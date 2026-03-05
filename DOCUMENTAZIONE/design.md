# Design — 22Club

Documento di riferimento per il design dell’app. I token vivono nel codice; qui trovi principi, uso e dove cercare.

---

## 1. Principi

- **Colori priorità**: **Principale** `#101012` (sfondo pagina), **Secondario/accento** `#02b3bf` (teal, bordi, icone, KPI, CTA).
- **Dark mode**: tema scuro di default; superfici `#16161A`, `#1A1A1E` (elevated, card).
- **Stile sportivo e Apple-like**: pulito, radius generosi (`rounded-xl`, `rounded-2xl`), ombre soft, effetto glass e trasparenze.
- **Coerenza > creatività**: usare token e pattern sotto; evitare valori ad hoc.

---

## 2. Fonte dei token

| Categoria | Dove | Note |
|-----------|------|------|
| Colori (base, text, primary, surface, state) | `src/config/design-system.ts` + `tailwind.config.ts` | Tailwind espone `background-*`, `text-*`, `primary`, `border-*`, `state-*`, `card`, ecc. |
| Spacing, radius, z-index, componenti (card, button, input, nav) | `src/styles/design-tokens.css` | Variabili CSS `--spacing-*`, `--radius-*`, `--z-*`, `--card-*`, `--button-*`, `--input-*`, `--nav-height`, `--tab-bar-height` |
| Breakpoint, grid, gap, fontSize, boxShadow | `tailwind.config.ts` | `screens`, `gridTemplateColumns`, `gap`, `fontSize`, `boxShadow` |
| Tipografia, colori testo, formattazione numeri/date | **Questo file, sez. 9** | Scala tipografica, colori testo per posizione, `@/lib/format` |

---

## 3. Palette e uso

Usare **solo classi Tailwind** sotto. Nessun hex o `bg-[#...]` / `text-[#...]` nel codice.

| Ruolo | Classe | Uso |
|-------|--------|-----|
| **Background** | | |
| Pagina / base | `bg-background` | Sfondo principale **#101012** |
| Card / pannelli | `bg-background-secondary` | Surface 200 (#1A1A1E) |
| Livello superiore | `bg-background-elevated` | #16161A |
| Altro livello | `bg-background-tertiary` | Surface 300 (#222228) |
| **Testo** | | |
| Primario | `text-text-primary` | #EAF0F2 |
| Secondario | `text-text-secondary` | #A5AFB4 |
| Terziario / label | `text-text-tertiary` | Muted #6C757D |
| Disabilitato | `text-text-disabled` | #4B5563 |
| **Brand / Primary** | | |
| Principale | `text-primary`, `bg-primary` | #02B3BF (teal) |
| Hover | `hover:bg-primary-hover`, `hover:text-primary` | #03C9D5 |
| Active | `bg-primary-active` | #019AA6 |
| Accento (icone, KPI) | `text-teal-400`, `text-teal-300` | Per numeri in evidenza, icone |
| **Accento cyan** (stats, bottoni, chip) | `text-cyan-400`, `border-cyan-400/40`, `bg-cyan-400/20`, `bg-cyan-500` | Pagine tipo Massaggiatore: numeri stats, bottoni outline/CTA, chip selezionati, input focus. CTA pieni: `bg-cyan-500 text-white hover:bg-cyan-400`. |
| **Stati** | | |
| Successo | `text-state-valid`, `bg-state-valid` | #00C781 |
| Attenzione | `text-state-warn`, `bg-state-warn` | #FFC107 |
| Errore | `text-state-error`, `bg-state-error` | #FF3B30 |
| Info | `text-state-info` | #3498DB |
| **Superfici / bordi** | | |
| Bordo default | `border-border` | Surface 300 |
| Bordo leggero | `border-border-light` | Background elevated |
| Input / focus | `bg-input`, `focus:border-input-focus` | Surface 200 / 300 |
| Card | `bg-card`, `hover:bg-card-hover` | Surface 200 / 300 |
| **Accent (gold)** | | |
| Oro (accenti secondari) | `accent-gold`, `accent-glow` | design-system.accent (C9A227, E0B23E) |

Colori testo in base alla **posizione** (titolo, body, label, metadati, ecc.): vedi **sez. 9.3**.

---

## 4. Spacing e radius

- **Spacing**: scala `xs` (4px) → `2xl` (32px) in `design-system.spacing`; Tailwind usa gli stessi nomi (`p-2` = 8px da spacing sm, `p-4` = 16px, ecc.). Per valori più grandi: `design-tokens.css` (`--spacing-8`, `--spacing-12`, …).
- **Radius**: `design-system.radius` → `rounded-sm` (6px), `rounded-md` (12px), `rounded-lg` (16px), `rounded-xl` (24px), `rounded-2xl` (32px), `rounded-full`. Card e contenitori: di solito `rounded-lg` o `rounded-xl`.
- **Token componenti**: padding card `--card-padding-sm/md/lg`; radius card `--card-radius` (radius-lg).

---

## 5. Componenti UI

| Componente | Token / Regola | Note |
|------------|----------------|------|
| **Button** | Altezze min: sm 32px, md 40px, lg 48px | Touch: **min 44px** su mobile/tablet (`min-h-[44px]`). |
| **Input / Textarea** | Altezza input 40px; **font-size ≥ 16px** (`text-base`) | Evita zoom iOS. |
| **Card** | Padding: sm 16px, md 24px, lg 32px; radius `rounded-lg` o `rounded-xl` | `design-tokens.css`: `--card-padding-*`, `--card-radius`. Pattern glass: sez. 7. |
| **Select (tendine / menu a tendina)** | **Sempre SimpleSelect** (`@/components/ui`) | In **tutte** le pagine e sezioni (Massaggiatore, Nutrizionista, Obiettivo/Dieta in nutrizione, form ovunque): usare solo SimpleSelect; **non** usare `<select>` nativo (lo stile del menu aperto non è controllabile). Trigger e pannello: bordo `border-primary/35`, sfondo scuro; opzione selezionata `bg-primary/25 text-primary`, hover `bg-primary/15`; `min-h-[44px]`, `rounded-xl`. Dettaglio sez. 7.1. |
| **Chip (selezione multipla)** | Pulsanti toggle con stati distinti | **Variante primary**: selezionato `border-primary bg-primary/20 text-primary`; non selezionato `hover:border-primary/40 hover:text-text-primary`. **Variante cyan** (es. Massaggiatore): selezionato `border-cyan-400 bg-cyan-400/20 text-cyan-400`; non selezionato `hover:border-cyan-400/40 hover:text-cyan-400`. Base: `rounded-xl min-h-[44px] px-4 py-2.5 text-sm font-medium`, `focus-visible:ring-cyan-400/50` (o `ring-primary/50`). |
| **Nav** | Altezza 64px | `--nav-height`. |
| **Tab bar (mobile)** | Altezza 80px | `--tab-bar-height`. |

Rispetto accessibilità: target cliccabili ≥ 44px; input con `text-base`. Dettaglio in **sez. 9.6**.

---

## 6. Breakpoint e layout

| Breakpoint | px | Uso |
|------------|-----|-----|
| (default) | < 640 | Mobile |
| `sm` | 640 | Mobile large |
| `md` | 768 | Tablet portrait |
| `tablet-landscape` | 1024 | Tablet 10+ landscape |
| `lg` | 1280 | Desktop |
| `xl` | 1536 | Desktop large |
| `2xl` | 1920 | Desktop wide |

**Grid**: `grid-cols-mobile` (4), `grid-cols-tablet` (8), `grid-cols-tablet-landscape` (12), `grid-cols-desktop` (16).  
**Gap**: `gap-mobile` (16px), `gap-tablet` (20px), `gap-tablet-landscape` (24px), `gap-desktop` (32px).

**Layout pagine atleta (area min 393×852px)**:
- Contenitore app: `flex min-h-dvh flex-col overflow-hidden`; header `sticky top-0 shrink-0`; main `flex min-h-0 flex-1 flex-col`.
- Pagina: un solo blocco scrollabile (`flex-1 min-h-0 overflow-auto`) con header pagina, stats, card contenuto. Nessuno scroll interno alla card contenuto: il blocco si estende e scrolla tutta la pagina.
- Padding area scroll: `px-4 pt-5 pb-24 safe-area-inset-bottom`; card senza `max-h` né `overflow-y-auto` sul contenuto.

Definiti in `tailwind.config.ts` (`screens`, `gridTemplateColumns`, `gap`).

---

## 7. Effetto glass e sfumatura radiale

Pattern usati su **Home** e **pagine atleta** (es. Nutrizionista) per card e header.

- **Glass**: `backdrop-blur-md` o `backdrop-blur-xl`; sfondo semi-trasparente (es. `rgba(26,26,30,0.88)`, `linear-gradient(135deg, rgba(2,179,191,0.08) 0%, ...)`).
- **Bordo cornice**: `1px solid rgba(2, 179, 191, 0.35)` (teal) o colore accent della sezione.
- **Sfumatura radiale** (come card benvenuto): overlay con  
  `background: radial-gradient(ellipse 85% 60% at 50% 0%, rgba(2,179,191,0.14) 0%, transparent 65%)`  
  e `opacity-70` se sempre visibile, oppure su hover con `opacity-0` → `group-hover:opacity-100`.
- **Barra accento**: barra verticale a sinistra (`absolute left-0 top-0 h-full w-1`) con `backgroundColor: #02b3bf` (o colore accent); oppure barra orizzontale in alto (`h-1`).
- **Barra accento (box-shadow inset)**: stessa barra verticale ottenuta con `box-shadow` inset, senza div aggiuntivo. Token in `design-tokens.css`: `--effect-card-bar-width` (6px), `--effect-card-bar-color`, `--effect-card-bar-left` (solo sinistra), `--effect-card-bar-both` (sinistra e destra). Uso: sulla Card (o sul Link che la wrappa) applicare `style={{ boxShadow: 'var(--effect-card-bar-left)' }}` e, dove serve, sovrascrivere `--effect-card-bar-color` con il colore accent (es. teal `#00c781`, cyan `#06b6d4`, purple `#a855f7`, emerald `#10b981`). In Tailwind: `shadow-[inset_6px_0_0_0_#00c781]` (sostituire hex con l’accent della card).
- **Shadow**: `boxShadow: '0 4px 24px rgba(0,0,0,0.25)'` e eventuale `0 0 0 1px rgba(2,179,191,0.1) inset` per glow interno.
- **Sfondo pagina** (opzionale): gradienti radiali leggeri su `#101012`, es.  
  `radial-gradient(ellipse 120% 80% at 70% -20%, rgba(2,179,191,0.07) 0%, transparent 50%)`.

**Pattern card glass riutilizzabile** (es. pagine Home, Nutrizionista, Massaggiatore, tab interni):

- Contenitore: `rounded-xl border backdrop-blur-md`, stile inline:  
  `borderColor: 'rgba(2, 179, 191, 0.35)'`,  
  `background: 'linear-gradient(145deg, rgba(26,26,30,0.9) 0%, rgba(22,22,26,0.92) 100%)'`,  
  `boxShadow: '0 4px 24px rgba(0,0,0,0.25), 0 0 0 1px rgba(255,255,255,0.03) inset'`.
- Overlay sfumatura: `<div className="absolute inset-0 rounded-xl opacity-70" style={{ background: 'radial-gradient(ellipse 85% 60% at 50% 0%, rgba(2,179,191,0.12) 0%, transparent 65%)' }} aria-hidden />`.
- Barra accento: `<div className="absolute left-0 top-0 h-full w-1 bg-primary" aria-hidden />`.
- Contenuto: `CardHeader` e `CardContent` con `className="relative z-10"` per stare sopra gli overlay.
- Hover (opzionale): `hover:-translate-y-0.5 hover:shadow-lg`, `transition-all duration-200`.

**Card stats compatte** (es. Trattamenti / Preferenze su Massaggiatore):
- Layout orizzontale: icona (box `h-9 w-9` con `border-cyan-400/40 bg-cyan-500/20`) + blocco (label `text-xs uppercase text-text-tertiary` + numero `text-xl font-bold text-cyan-400`).
- Sfondo colorato trasparente: `linear-gradient(145deg, rgba(6,182,212,0.16) 0%, rgba(2,179,191,0.05) 50%, rgba(22,22,26,0.85) 100%)`; bordo `border-cyan-400/50`; barra laterale `bg-cyan-400`; shadow `0 2px 12px`, inset cyan leggero.
- Padding `p-3` / `p-3.5`; nessun overlay radiale; `rounded-xl backdrop-blur-md`.

---

## 7.1 Select (tendine / menu a tendina)

**Regola**: in tutta l’app, per ogni campo a scelta singola (tendina) usare **solo SimpleSelect**. Non usare mai il `<select>` HTML nativo: il menu aperto non è stilabile (colore evidenziazione, bordi, sfondo) e rompe la coerenza del design.

**Dove applicare**: Massaggiatore (Intensità, Tipo massaggio nel form), Nutrizionista (Obiettivo nutrizionale, Dieta seguita in `nutrition-goals-section`), e qualsiasi altro form con tendina.

**Componente**: **SimpleSelect** (`src/components/ui/simple-select.tsx`):

- **Trigger**: `min-h-[44px]`, `rounded-xl`, `border border-primary/35`, `bg-background-secondary/80`, `text-base`; focus `focus:border-primary focus:ring-2 focus:ring-primary/30`; stato aperto `border-primary ring-2 ring-primary/30`.
- **Pannello aperto**: `rounded-xl`, `border border-primary/35`, `bg-background-secondary`, `backdrop-blur-xl`, ombra forte (es. `0 4px 24px rgba(0,0,0,0.35)`); posizionamento in portal per evitare overflow.
- **Opzioni**: `min-h-[44px]`, `text-base`, `px-4 py-2.5`. **Selezionata**: `bg-primary/25 text-primary font-medium`. **Hover/focus**: `bg-primary/15` / `bg-primary/20`. Testo default `text-text-primary`.

---

## 7.2 Chip e pulsanti azione

- **Chip (selezione multipla)**: due stati. **Primary**: selezionato `border-primary bg-primary/20 text-primary`; non selezionato `border-border text-text-secondary hover:border-primary/40 hover:text-text-primary`. **Cyan** (allineato a stats, es. Massaggiatore): selezionato `border-cyan-400 bg-cyan-400/20 text-cyan-400`; non selezionato `hover:border-cyan-400/40 hover:text-cyan-400`. Base: `rounded-xl min-h-[44px] px-4 py-2.5 text-sm font-medium`, `active:scale-[0.98]`, `focus-visible:ring-2 focus-visible:ring-cyan-400/50` (o `ring-primary/50`).
- **Pulsanti azione**. **Variante primary**: Annulla `rounded-xl border-border text-text-secondary hover:border-primary/40 hover:text-text-primary`; CTA `rounded-xl bg-primary hover:bg-primary-hover`; icona Plus `rounded-xl border-primary/40 text-primary hover:bg-primary/15`. **Variante cyan** (es. Massaggiatore): Annulla `hover:border-cyan-400/40 hover:text-cyan-400`; CTA `rounded-xl bg-cyan-500 text-white hover:bg-cyan-400`; Modifica / Plus `rounded-xl border-cyan-400/40 text-cyan-400 hover:bg-cyan-400/15`. Sempre `min-h-[44px]`; icona `min-w-[44px]` dove serve.
- **Input in contesto cyan**: `border-cyan-400/35`, `focus:ring-2 focus:ring-cyan-400/30`.

---

## 7.3 Header pagina e CTA centrale

**Header pagina** (pagine atleta: Massaggiatore, Nutrizionista, Documenti, Foto/Risultati, Progressi/Foto):

- Contenitore: `rounded-xl border border-cyan-500/30 bg-background-secondary/80 backdrop-blur-sm p-3 min-[834px]:p-4 shadow-lg`.
- Overlay sfumatura: `absolute inset-0 rounded-xl bg-gradient-to-br from-cyan-500/10 via-transparent to-teal-500/5`.
- Contenuto (relative z-10): pulsante Indietro `rounded-xl text-text-secondary hover:bg-cyan-500/10 hover:text-cyan-400` con `router.back()`; box icona `h-10 w-10 min-h-[44px] min-w-[44px] rounded-xl border border-cyan-500/30 bg-cyan-500/10` con icona `text-cyan-400`; titolo `text-2xl md:text-3xl font-semibold text-text-primary`; sottotitolo `text-xs text-text-tertiary`; eventuale CTA (es. Carica, Aggiungi) `rounded-xl border border-cyan-400/40 bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30`.

**Bottone azione centrale** (es. "Carica nuove foto" in Foto/Risultati):

- Link/card centrato: `flex flex-col items-center justify-center gap-3 rounded-xl border border-cyan-500/30 bg-background-secondary/50 backdrop-blur-sm p-6 min-[834px]:p-8` con hover `hover:border-cyan-400/50 hover:bg-cyan-500/10`.
- Icona: immagine custom (es. `/images/fotocamera.png`) con `h-[84px] w-[84px] min-[834px]:h-24 min-[834px]:w-24 object-contain` e alone sfumato `drop-shadow-[0_0_12px_rgba(34,211,238,0.25)]`; oppure emoji/icona in box. Nessun cerchio/bordo attorno se si usa solo immagine con drop-shadow.
- Testo: titolo `text-base min-[834px]:text-lg font-semibold text-text-primary`; sottotitolo `text-xs min-[834px]:text-sm text-text-tertiary`.

**Tab / chip per scelta** (es. angolo Fronte/Profilo/Retro in Progressi/Foto):

- Selezionato: `rounded-xl border-cyan-400/40 bg-cyan-500/20 text-cyan-400`.
- Non selezionato: `border-border bg-background-secondary/50 text-text-secondary hover:bg-background-tertiary/50 hover:text-text-primary`.
- Pulsante "Confronta Date": outline `rounded-xl border-cyan-400/40 text-cyan-400 hover:bg-cyan-500/10`; quando attivo `bg-cyan-500/20 text-cyan-400`.

---

## 7.4 Card info compatta

Per suggerimenti o note in fondo alla pagina (es. Documenti, Progressi/Foto):

- Contenitore: `border border-cyan-500/20 bg-background-secondary/40` (o `border-state-warn/30` se avviso).
- Contenuto: `flex items-center gap-3 py-3 pl-3 pr-4`; barra laterale `h-8 w-1 shrink-0 rounded-full bg-cyan-500/40`; icona opzionale `text-cyan-400`; testo `text-text-secondary text-xs`. Nessun titolo grande; messaggio breve in una riga o due.

---

## 8. Ombre e transizioni

- **Ombre**: `shadow-soft` (design-system), `shadow-glow` (teal), `shadow-sm/md/lg/xl/2xl` (Tailwind, dark). Per card in evidenza: `shadow-md` o `shadow-lg`.
- **Transizioni**: `--transition-fast` (150ms), `--transition-normal` (200ms), `--transition-slow` (300ms) in `design-tokens.css`. In Tailwind: `transition-all duration-200`, `duration-300`.
- **Animazioni**: keyframe in `tailwind.config.ts` (`fade-in`, `slide-in-up`, `scale-in`, `pulse-glow`, ecc.); usare le classi `animation-*` definite lì.

---

## 9. Tipografia e formattazione (testi e numeri)

Documento unificato per uniformare **testi e numeri** su smartphone, tablet e PC (portrait e landscape).

### 9.1 Scope

- **Tipografia**: scale unica, classi Tailwind da usare ovunque.
- **Formattazione**: date, valute e numeri con locale **it-IT** e funzioni centralizzate in `@/lib/format`.
- **Responsive**: stessi breakpoint di `tailwind.config.ts` (sm, md, tablet-landscape, lg, xl).

### 9.2 Scala tipografica

Usare **solo** le classi sotto. Evitare `text-[Npx]` per testi UI.

| Ruolo              | Classe Tailwind   | Uso                          |
|--------------------|-------------------|------------------------------|
| Caption / label    | `text-xs`         | Etichette secondarie         |
| Body (mobile)      | `text-sm`         | Testo principale su mobile   |
| Body (tablet/PC)   | `text-base`       | Testo principale da md      |
| Body evidenziato   | `text-lg`         | Sottotitoli, lead            |
| Titolo card        | `text-xl` / `text-2xl` | Titoli di card/sezione |
| Titolo pagina      | `text-2xl` mobile, `text-3xl` da md | Pagine       |
| Hero / display     | `text-4xl` / `text-5xl` | Landing, numeri grandi  |

**Convenzione responsive** (esempio titolo pagina):

```tsx
<h1 className="text-2xl md:text-3xl font-semibold">Titolo</h1>
```

**Input e textarea**: usare almeno `text-base` (16px) per evitare zoom su iOS.

### 9.3 Colori del testo in base alla posizione

Usare le classi colore sotto in base al **ruolo** del testo. Tutte mappano i token del design system (dark mode).

| Posizione / Ruolo        | Classe colore        | Uso |
|--------------------------|----------------------|-----|
| Titolo pagina, titolo card, titolo sezione | `text-text-primary` | Titoli principali |
| Body, paragrafo, contenuto | `text-text-primary` | Testo principale lettura |
| Sottotitolo, lead        | `text-text-primary` o `text-text-secondary` | Sotto il titolo, intro |
| Label, caption, didascalia | `text-text-tertiary` | Etichette sopra campi, caption immagini, uppercase |
| Metadati, descrizione secondaria | `text-text-secondary` | Date secondarie, note meno in evidenza |
| Placeholder, helper, hint | `text-text-tertiary` | placeholder, helperText sotto input |
| Disabled                 | `text-text-disabled`  | Testo disabilitato (form, tab) |
| Link, CTA testuale, accent | `text-primary` o `text-teal-400` | Link e accenti brand (teal) |
| Successo                 | `text-state-valid` / `text-green-400` | Messaggi positivi |
| Attenzione               | `text-state-warn` / `text-amber-400` | Warning |
| Errore                   | `text-state-error` / `text-red-400` | Errori, validazione |
| Numeri/KPI in evidenza   | `text-teal-300` / `text-teal-400` / `text-cyan-400` | Numeri nelle card, stats |

**Regola**: evitare colori hex o `text-[#...]`; usare solo le classi semantiche sopra.

### 9.4 Formattazione numeri e date

**Locale**: sempre **it-IT**. Importare da `@/lib/format`:

| Funzione           | Esempio output           | Uso                    |
|--------------------|--------------------------|------------------------|
| `formatCurrency(n)`| `12,50 €`                | Importi, pagamenti     |
| `formatDate(s)`    | `12/02/2025`             | Tabelle, liste         |
| `formatDateShort(s)`| `12 feb 2025`           | Card, header           |
| `formatDateLong(s)` | `mercoledì 12 febbraio 2025` | Dettaglio, appuntamenti |
| `formatDateTime(s)` | `12/02/2025, 14:30`     | Log, pagamenti, appuntamenti |
| `formatTime(s)`     | `14:30`                  | Solo ora               |
| `formatNumber(n)`   | `1.234`                  | Passi, kcal, quantità  |

**Regole**: non concatenare "€" a mano; usare `formatCurrency`. Per date/uscite a schermo usare solo le funzioni sopra (non `toLocaleString` / `toLocaleDateString` inline con opzioni diverse).

### 9.5 Breakpoint testi e dispositivi

| Breakpoint          | px       | Uso                    |
|---------------------|----------|------------------------|
| (default)           | < 640    | Mobile                 |
| `sm`                | 640      | Mobile large           |
| `md`                | 768      | Tablet portrait        |
| `tablet-landscape`  | 1024     | Tablet 10+ landscape   |
| `lg`                | 1280     | Desktop                |
| `xl` / `2xl`        | 1536+    | Desktop large          |

Tipografia responsive: preferire `text-base md:text-lg` (e simili) invece di CSS custom.

### 9.6 Touch e accessibilità

- **Target cliccabili** (pulsanti, link): minimo **44–48px** di altezza su mobile e tablet (`min-h-[44px]`).
- **Input**: `font-size` almeno 16px (es. `text-base`) per non innescare zoom su iOS.

---

## 10. Cosa evitare

- **Hex/RGB inline**: preferire classi semantiche (`bg-background`, `text-primary`, `border-border`). Dove serve il colore secondario esatto (#02b3bf) per bordi/icone in contesti sportivi, è ammesso `rgba(2,179,191,0.35)` e simili.
- **Valori magici**: no numeri sparsi per spacing/radius/shadows; usare token o classi Tailwind del tema.
- **Duplicare token**: non definire nuovi file di colori/spacing; estendere `design-system.ts` o `design-tokens.css` e/o `tailwind.config.ts` se serve qualcosa di nuovo.

---

## 11. Riferimenti in progetto

| File | Contenuto |
|------|-----------|
| `src/config/design-system.ts` | Token colore, font, radius, spacing, shadows, gradients |
| `src/styles/design-tokens.css` | Variabili CSS spacing, radius, z-index, componenti, breakpoint, transition |
| `tailwind.config.ts` | Theme esteso (colori, screen, grid, gap, fontSize, shadow, animazioni) |
| `src/components/ui/simple-select.tsx` | Select (menu a tendina) con stile teal, pannello custom |
| `src/lib/format.ts` | Funzioni formattazione date/valute/numeri (it-IT); regole in sez. 9 |

**Pagine atleta con layout e design allineati** (layout sez. 6, header 7.3, card glass, stats compatte, chip/pulsanti cyan): Massaggiatore, Nutrizionista, Documenti, Foto/Risultati (e Aggiungi foto), Progressi/Foto, Chat, Appuntamenti, **Allenamenti**, **Allenamenti – Dettaglio scheda** (`/home/allenamenti/[id]`), **Allenamenti – Dettaglio esercizio** (`/home/allenamenti/esercizio/[exerciseId]`), **Allenamenti – Sessione oggi** (`/home/allenamenti/oggi`), **Allenamenti – Riepilogo** (`/home/allenamenti/riepilogo`). La pagina Chat usa layout a tre zone fisse: header glass (indietro + avatar/icona + nome/ruolo), area messaggi scrollabile, footer glass con input; stile cyan per bolle messaggi inviati, bordi e pulsanti.

---

## 12. Manutenzione

**Aggiornare questo file** (`docs/design.md`) ogni volta che si introduce o si modifica un pattern di design (nuovi componenti, stili di header, card, pulsanti, pagine). Aggiungere o aggiornare la sezione pertinente (es. 7.x per nuovi pattern UI) e, se applicabile, l’elenco delle pagine in sez. 11.
