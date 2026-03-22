# Design colorato — 22Club

Design di riferimento: **Dashboard Statistiche** (`/dashboard/statistiche`).

Stile vivace con card colorate, gradienti teal/cyan/blue/indigo, bordi e ombre accent, titoli con gradient text. Ideale per dashboard analytics e pagine con KPI/grafici.

---

## Riferimento

- **Pagina**: [http://localhost:3001/dashboard/statistiche](http://localhost:3001/dashboard/statistiche)
- **Componenti**: `StatistichePageContent`, `KPIMetrics`, `TrendChart`, `MultiTrendChart`, `DistributionChart`, `PerformanceMetrics`
- **Token riutilizzabili**: `src/lib/design-tokens/design-colorato.ts`

---

## Palette

| Uso                          | Colori                                                                 |
| ---------------------------- | ---------------------------------------------------------------------- |
| **Primario (header, trend)** | teal-400/500, cyan-400/500                                             |
| **KPI 1**                    | teal (Allenamenti)                                                     |
| **KPI 2**                    | yellow / orange (Documenti)                                            |
| **KPI 3**                    | green / emerald (Ore)                                                  |
| **KPI 4**                    | purple / pink (Atleti)                                                 |
| **Chart secondario**         | purple (Distribuzione)                                                 |
| **Performance / Dettagli**   | blue, indigo                                                           |
| **Chart colors (pie/bar)**   | #14B8A6, #F59E0B, #10B981, #EF4444, #8B5CF6, #EC4899, #06B6D4, #F97316 |

---

## Pattern componenti

### Header pagina

- **Icon box**: `flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500/20 to-cyan-500/20 border-2 border-teal-500/30 shadow-lg shadow-teal-500/10`
- **Titolo**: `text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight bg-gradient-to-r from-teal-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent`
- **Sottotitolo**: `text-text-secondary text-sm sm:text-base`
- **Badge periodo**: `px-4 py-2 rounded-lg border-2 border-teal-500/40 bg-gradient-to-br from-teal-500/10 to-cyan-500/10 text-sm text-text-primary font-medium shadow-md shadow-teal-500/10`

### Card KPI (una per colore)

- **Container**: `relative overflow-hidden rounded-xl border-2 {borderColor} bg-gradient-to-br {gradient} backdrop-blur-xl shadow-lg {shadow} hover:shadow-xl hover:scale-[1.02] transition-all duration-300`
- **Icon box**: `p-3 rounded-xl {bgColor} border {borderColor} shadow-md` — icon `w-6 h-6 {color}`
- **Valore**: `text-3xl font-bold text-white drop-shadow-lg`
- **Label**: `text-sm text-text-secondary font-medium`

Varianti KPI:

- Teal: `border-teal-500/40`, `from-teal-500/20 via-cyan-500/10 to-teal-500/20`, `shadow-teal-500/20`
- Yellow: `border-yellow-500/40`, `from-yellow-500/20 via-orange-500/10 to-yellow-500/20`, `shadow-yellow-500/20`
- Green: `border-green-500/40`, `from-green-500/20 via-emerald-500/10 to-green-500/20`, `shadow-green-500/20`
- Purple: `border-purple-500/40`, `from-purple-500/20 via-pink-500/10 to-purple-500/20`, `shadow-purple-500/20`

### Card grafici (trend / distribuzione)

- **Container**: `relative overflow-hidden rounded-xl border-2 border-teal-500/40 bg-gradient-to-br from-background-secondary via-background-secondary to-background-tertiary backdrop-blur-xl shadow-lg shadow-teal-500/10 hover:shadow-xl hover:shadow-teal-500/20 transition-all duration-300`
- **Overlay**: `absolute inset-0 bg-gradient-to-br from-teal-500/5 via-transparent to-cyan-500/5` (o `to-purple-500/5` per distribuzione)
- **Header card**: icon box `h-10 w-10 rounded-lg bg-gradient-to-br from-teal-500/20 to-cyan-500/20 border border-teal-500/30`, titolo `text-lg font-bold bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent`

### Card Performance / Dettagli (blue-indigo)

- **Container**: `relative overflow-hidden rounded-xl border-2 border-blue-500/40 bg-gradient-to-br from-background-secondary via-background-secondary to-background-tertiary backdrop-blur-xl shadow-lg shadow-blue-500/10 hover:shadow-xl hover:shadow-blue-500/20 transition-all duration-300`
- **Overlay**: `absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-indigo-500/5`
- **Icon box**: `h-10 w-10 rounded-lg bg-gradient-to-br from-blue-500/20 to-indigo-500/20 border border-blue-500/30`
- **Titolo**: `text-lg font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent`
- **Riga dato**: `flex justify-between items-center p-4 rounded-lg border border-blue-500/30 bg-gradient-to-r from-blue-500/10 via-transparent to-indigo-500/10 hover:from-blue-500/20 hover:to-indigo-500/20 transition-all duration-200`

---

## Layout pagina

- **Container**: `relative min-h-screen flex flex-col` → contenuto `flex-1 flex flex-col space-y-4 sm:space-y-6 px-4 sm:px-6 py-4 sm:py-6 max-w-[1800px] mx-auto w-full relative`
- **Griglia KPI**: `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4`
- **Griglia chart**: `grid grid-cols-1 lg:grid-cols-2 gap-6` (trend), `grid grid-cols-1 lg:grid-cols-3 gap-6` (distribuzione)

---

## Quando usare questo design

- Dashboard con KPI e grafici
- Pagine “report” o analytics
- Sezioni che devono distinguersi dal resto dell’app (es. area PT/admin)

Per pagine più sobrie (home atleta, profilo, impostazioni) usare il design system standard (glass header, card con `border-border`, token primary).
