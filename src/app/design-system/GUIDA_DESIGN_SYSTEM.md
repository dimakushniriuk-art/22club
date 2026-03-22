# 22Club — Guida al Design System

Riferimento per la pagina **Design System** (`/design-system`) e per l’uso coerente di token, componenti e pattern in tutto il progetto.

---

## 1. Principi di stile

In pagina la sezione `#principi` (blocco inline in `page.tsx`) riassume:

- **Riempimento unico**: evitare gradienti bicolore; preferire un solo fill o gradienti sottili (es. `from-zinc-900/95 to-black/80`).
- **Bordo con sfumatura**: bordo sempre visibile con highlight interno (`border border-white/10` + `shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)]`).
- **Forme coerenti**: form (input, select, textarea, checkbox) `rounded-md`; card, pulsanti, container `rounded-lg`; avatar, pill, badge `rounded-full` o `rounded-xl` dove previsto.

Nella sezione Principi i token di forma sono mostrati con `<code className="rounded border border-primary/20 bg-primary/5 px-1.5 py-0.5 font-mono text-xs text-primary">rounded-md</code>` e `rounded-lg`.

---

## 2. Token e classi condivise (pagina Design System)

Definiti in `_sections/helpers.tsx`:

| Nome                     | Uso                                                                                                                      |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------ |
| `DS_CARD_FRAME_CLASS`    | Card/container: sfondo scuro, bordo, ombra. Padding responsive: `p-4 sm:p-5 md:p-6`. Usare per ogni blocco dimostrativo. |
| `DS_CODE_CLASS`          | Inline code / token: `rounded border border-white/10 bg-zinc-800/90 px-1.5 py-0.5 font-mono text-xs text-text-primary`.  |
| `DS_SECTION_TITLE_CLASS` | Titolo sezione (h2): icona + testo, responsive `mb-4 sm:mb-6`, `text-xl sm:text-2xl font-semibold text-text-primary`.    |
| `DS_SECTION_INTRO_CLASS` | Paragrafo sotto il titolo: `mb-4 sm:mb-6 text-sm text-text-secondary`.                                                   |
| `DS_BLOCK_TITLE_CLASS`   | Sottotitolo blocco (h3): `mb-2 sm:mb-3 text-sm font-medium text-text-secondary`.                                         |
| `DS_LABEL_CLASS`         | Label secondaria (es. "Varianti", "Dimensioni"): `mb-2 text-xs font-medium text-text-tertiary`.                          |

---

## 3. Struttura pagina Design System

- **Layout**: `min-h-screen min-w-0 bg-black text-text-primary`. Main: `max-w-5xl` centrato, `min-w-0`, `space-y-10 sm:space-y-16`, `px-3 py-6 sm:px-4 sm:py-10`.
- **Header**: sticky, `border-b border-white/10`, `bg-black/95`, shadow inset, backdrop-blur. Riga titolo: "22Club" + "Design System" (in `text-primary`), `text-lg sm:text-xl`, `min-w-0 truncate`. Pulsanti Scarica CSS / Scarica React / Scarica PDF e link "← Torna" con `border-white/10`, hover `hover:bg-white/10 hover:text-text-primary`; responsive `text-xs sm:text-sm`, `min-h-[40px] sm:min-h-0`, `px-2 sm:px-3`. Nav: `overflow-x-auto`, `flex-nowrap`, `gap-1.5 sm:gap-2`, link con `bg-gradient-to-b from-zinc-800/90 to-zinc-900/90`, hover `hover:border-primary/30 hover:bg-white/5 hover:text-primary`, `min-h-[40px] sm:min-h-0`.
- **Nav (ordine ancoraggi)**: Overview, Principi, Colori, Tipografia, Radius & Spacing, Motion, Icone, Layouts, Headers, Componenti, Moduli, Aree, Area atleta, Auth (id: `overview`, `principi`, `colori`, `tipografia`, `radius`, `motion`, `icone`, `layouts`, `headers`, `componenti`, `moduli`, `aree-route`, `home`, `auth`).
- **Overview** (`#overview`, `section-overview.tsx`): titolo "22Club Design System", descrizione, griglia 4 blocchi (Fondazioni, Componenti, Pattern, Aree prodotto) con `DS_CARD_FRAME_CLASS` e `border-l-4 border-l-primary/50`; ogni blocco ha titolo, descrizione e link alle sezioni (Colori, Tipografia, Radius, Motion, Icone; Componenti, Moduli; Layouts, Headers; Mappa route, Area atleta, Auth).
- **Principi** (`#principi`): sezione inline in `page.tsx` con stile card (rounded-lg, border, gradient, shadow); h2 con icona Check; paragrafo con code `rounded-md` / `rounded-lg` in stile primary.
- **Ordine sezioni nel main**: SectionOverview → Principi → FoundationsColors → FoundationsTypography → FoundationsSpacingRadius → FoundationsMotion → SectionIcone → PatternsLayouts → PatternsHeaders → SectionComponenti → SectionModuli → DesignAreeRoute → DesignHomeSection → PatternsAuthLogin.
- **Sezioni**: `scroll-mt-24` per ancoraggio; titoli e intro con helper; Headers è la sezione PatternsHeaders con id `#headers`.
- **Separatori**: `<Separator className="bg-white/10" />` tra sezioni.
- **Footer**: `border-t border-white/10`, `py-4 sm:py-6 px-3`, `text-xs sm:text-sm text-text-muted`. Testo: "22Club Design System · Riferimento per fondazioni, componenti e pattern · **22club**" (22club in `text-primary/80`).

**File sezioni** (`src/app/design-system/_sections/`): `section-overview.tsx` (Overview), `page.tsx` (Principi inline), `foundations-colors.tsx`, `foundations-typography.tsx`, `foundations-spacing-radius.tsx`, `foundations-motion.tsx`, `section-icone.tsx`, `patterns-layouts.tsx`, `patterns-headers.tsx`, `section-componenti.tsx`, `section-moduli.tsx`, `design-aree-route.tsx` (Aree), `design-home.tsx` (Area atleta), `patterns-auth-login.tsx`. Helper e demo: `helpers.tsx`, `demo-dialog-drawer.tsx`.

---

## 4. Fondazioni

### Colori

- Token da `@/lib/design-tokens` e `@/config/design-system`.
- Background, Surface, Testo, Brand/Primary, Stati (success, warning, error), Accent. Card Trainer/Admin e accenti atleta documentati in sezione.

**Sfondo globale (background applicazione)**  
Colore unico **#0d0d0d** usato per tutto il progetto. Definito in:

- `src/app/globals.css`: variabile `--color-bg: #0d0d0d` e `body { background: #0d0d0d }`
- `src/app/layout.tsx`: critical CSS e stile inline sul `<body>` (stesso valore per first paint e idratazione)
- `src/lib/design-tokens/colors.ts`: `background.DEFAULT: '#0d0d0d'` (design system e config)
- Pagine atleta: `src/app/home/page.tsx` e `src/app/home/trainer/page.tsx` usano #0d0d0d come base dello sfondo del main container (sopra possono esserci gradienti radiali sottili).  
  Superfici elevate (card, dropdown, modal) restano con token dedicati (surface, elevated) per contrasto.

### Tipografia

- Scale `text-xs` … `text-6xl`; famiglie (sans, mono); pesi (normal, medium, semibold, bold); colori testo `text-text-primary/secondary/muted`.

### Radius & Spacing

- Radius: `none`, `sm`, `md`, `lg`, `xl`, `2xl`, `full`. Spacing: `xs` … `2xl` da token.

### Motion

- Duration, easing, keyframes da `@/lib/design-tokens/motion`. Classi Tailwind `animate-fade-in`, `animate-scale-in`, `animate-slide-in-up`, ecc.

---

## 5. Componenti UI

- **Set**: `@/components/ui`. Tutti con bordo sfumatura e riempimento coerente (Input, Button, Card, Badge, Avatar, Select, Checkbox, Switch, Progress, Slider, Tabs, Stepper, Table, Dialog, Drawer, DropdownMenu, Separator, Skeleton, Spinner, Toast).
- **Button**: varianti primary, default, secondary, outline, ghost, destructive, success, warning, trainer, link. Dimensioni sm/md/lg/xl; icon-only; stati loading e disabled.
- **Badge**: varianti per stati e ruoli; dimensioni sm/md/lg. Casi d’uso: lista appuntamenti, card atleta, notifiche.
- **Avatar**: fallback su iniziale (es. MR, LV); dimensioni sm/md/lg/xl per liste, card, header, profilo.
- **Card**: varianti default, elevated, outlined, athlete, trainer, admin, glass. Sotto-componenti: CardHeader, CardTitle, CardDescription, CardContent, CardFooter. Prop `hoverable`.

---

## 6. Moduli (Card)

- Card e sotto-componenti con padding (sm/md/lg) e footer (justify start/center/end/between).
- Varianti allineate al tema scuro; uso di `DS_CARD_FRAME_CLASS` negli esempi.

---

## 7. Pattern

### Design per area

- **Sezione** `#aree-route` (file `_sections/design-aree-route.tsx`): route raggruppate per area. Gruppi: **Pubbliche / Auth**, **Area atleta (home)**, **Dashboard (staff) — Generale**, **Dashboard — Admin**, **Dashboard — Marketing**, **Dashboard — Nutrizionista**, **Dashboard — Massaggiatore**. Per ogni gruppo: elenco path e nota di design (layout, componenti). Dettagli visivi nelle sezioni Colori, Tipografia, Layouts, Componenti, Auth, Area atleta.
- **Sotto-sezione "Elementi di design solo in queste pagine"** (solo per gruppo Pubbliche / Auth): raccoglie gli elementi usati in /, /login, /registrati, /forgot-password, /reset-password, /post-login, /welcome, /privacy, /termini che non sono mostrati in altre parti del design-system: (1) Loading full-page (spinner border-brand + "Caricamento..."), (2) Logo in card auth (drop-shadow + blur), (3) Input con icona a sinistra (Mail/Lock), (4) Input password con toggle Eye/EyeOff, (5) Link "Torna al Login" con ArrowLeft e group-hover:-translate-x-1, (6) Stato success (cerchio bg-primary/20 con CheckCircle2, animate-scale-in), (7) Stato errore (cerchio bg-state-error/20 con AlertCircle), (8) Box info (bg-background-tertiary/50 border-border), (9) Button outline "Torna al Login", (10) Layout pagine legali (gradient, grid pattern, blob, header ChevronLeft+Logo, Card FadeIn).
- **Sotto-sezione "Elementi di design solo in queste pagine"** (solo per gruppo Area atleta (home)): raccoglie elementi usati in /home/\* non ripetuti altrove: (1) Skeleton lista (animate-pulse, bg-background-tertiary, placeholder liste), (2) LoadingState (Spinner + messaggio), (3) ProgressiNavCard (card nav con barra accent primary/cyan/purple/emerald), (4) Card lista con Badge (titolo, sottotitolo, Badge stato), (5) Card Trainer (variant trainer, roleThemes), (6) Bottone icona in header Benvenuto (gradient teal-cyan, inviti).
- **Sotto-sezione "Elementi di design solo in queste pagine"** (solo per gruppo Dashboard (staff) — Generale): layout e componenti usati in /dashboard/\*: (1) StaffContentLayout header (titolo gradient teal, descrizione, actions), (2) Quick action cards (gradient accent, icon box, label, sublabel, hover), (3) Empty state staff (rounded-xl bg-surface-200/40, messaggio + CTA), (4) Error state con Riprova, (5) Token spacing (space-y-4 sm:space-y-6, gap-4 md:gap-8, space-y-3 liste). **Profilo Atleta** (/dashboard/atleti/[id]): AthleteProfileHeader con card DS (rounded-lg, border-white/10, bg-gradient-to-b from-zinc-900/95 to-black/80, shadow inset); blocchi info (Email, Telefono, Iscritto, Lezioni) con rounded-lg border-white/10 bg-white/[0.02]; pulsanti Chat (outline border-white/10) e Modifica (primary). AthleteProfileTabs: TabsList e TabsTrigger con stile DS (container rounded-lg border-white/10, trigger active bg-white/[0.06] border-white/10). **Impostazioni calendario** (/dashboard/calendario/impostazioni): StaffContentLayout con theme="default" (titolo testo neutro); sezioni con card DS (rounded-lg, border-white/10, bg-gradient-to-b from-zinc-900/95 to-black/80, shadow inset); input/select rounded-md border-white/10 bg-white/[0.04]; link Calendario e pulsanti con bordo/hover DS; spaziatura space-y-4 sm:space-y-6 md:space-y-8.
- **Sotto-sezione "Elementi di design solo in queste pagine"** (solo per gruppo Dashboard — Admin): (1) Header pagina admin (h1 text-white, p text-gray-400), (2) Card Admin (variant admin, roleThemes.admin), (3) KPI card (gradient from-blue-500/10, border-blue-500/30, icon, valore, descrizione), (4) Badge ruoli (Admin → destructive, Trainer → primary, Atleta → neutral), (5) Riferimento pattern tabella utenti (Input, Select, Table, DropdownMenu).
- **Sotto-sezione "Elementi di design solo in queste pagine"** (solo per gruppo Dashboard — Marketing): (1) Header (icona cyan + titolo + descrizione), (2) KPI cards (rounded-xl border-border bg-background-secondary/80 ring-1 ring-white/5, icon, label, value cyan/emerald/primary/amber), (3) Error box (border-red-500/30 bg-red-500/10 text-red-200), (4) Stati lead funnel (Nuovo, Contattato, Prova, Convertito, Perso), (5) Riferimento tabella con header bar (bg-background-tertiary/50).
- **Sotto-sezione "Elementi di design solo in queste pagine"** (solo per gruppo Dashboard — Nutrizionista): (1) StaffContentLayout tema teal (titolo gradient from-teal-400 via-cyan-400 to-blue-400), (2) Card stile teal (border-teal-500/30 bg-background-secondary/80, icon + label + valore).
- **Sotto-sezione "Elementi di design solo in queste pagine"** (solo per gruppo Dashboard — Massaggiatore): (1) StaffContentLayout tema amber (titolo gradient from-amber-400 via-orange-400 to-yellow-400), (2) Greeting + KPI box (text-amber-400, icon box amber gradient), (3) Stats cards (border-amber-500/30, label uppercase, valore), (4) Azioni rapide (Button bg-amber-600, Button outline border-amber-500/40, DropdownMenu).

### Layouts

- Section (titolo + contenuto), lista (card ripetute), form (label + input + pulsanti). Spacing da token.

### Headers

- PageHeaderGlass (teal), PageHeaderCompact (cyan), PageHeaderFixed (nero + linea cyan). CardMetric con accent cyan/teal.

### Design Home

- Token per pagine atleta `/home/*`: blocchi griglia, header Benvenuto, header pagina (Glass/Compatto/Fisso), card con accento, Tabs, componenti in uso (Badge, Progress, Dialog, Skeleton, EmptyState, Input, SimpleSelect).

### Auth (Login)

- Sezione `#auth`. Token per login, reset password, registrati: AthleteBackground, card backdrop-blur, form, input, button Accedi, stati errore. Preview contesto e box errore con stile card scuro.

---

## 8. Icone

- Set Lucide; import da `lucide-react`. Griglia con bordo e hover coerente con tema scuro.

---

## 9. Regole di implementazione

1. **Nuove sezioni Design System**: usare sempre `DS_CARD_FRAME_CLASS` per i blocchi, `DS_CODE_CLASS` per i code, `DS_SECTION_TITLE_CLASS` / `DS_SECTION_INTRO_CLASS` / `DS_BLOCK_TITLE_CLASS` per titoli e intro.
2. **Spaziatura**: tra sezioni in main `space-y-10 sm:space-y-16`; tra blocchi dentro una sezione `space-y-8` o `gap-6`; tra titolo e contenuto `mb-2 sm:mb-3`/`mb-4 sm:mb-6` (helper); tra label e controlli `mb-2` o `space-y-2`. Padding responsive dove previsto (`p-4 sm:p-5 md:p-6`, `px-3 sm:px-4`).
3. **Colori**: preferire token `text-text-primary`, `text-text-secondary`, `text-text-muted`, `border-white/10`, `bg-zinc-800/90` per code e chip; primary per CTA e accenti.
4. **Accessibilità**: focus ring `focus:ring-2 focus:ring-primary`; label associati ai form control; aria dove necessario (dialog, menu, tab); nav con `aria-label="Design system"`.
5. **Responsive**: titoli e padding con breakpoint `sm:` (e `md:` per card); link e pulsanti con `min-h-[40px] sm:min-h-0` dove richiesto; nav orizzontale scrollabile su mobile.

---

## Regola di progetto

**Ogni modifica, aggiunta o rimozione** dalla pagina `/design-system` (file in `src/app/design-system/` e `_sections/`) **deve essere documentata in questo file** (GUIDA_DESIGN_SYSTEM.md). Vedi `.cursor/rules/22club-project-rules.mdc` — sezione «PAGINA DESIGN SYSTEM».
