/**
 * 🎨 DK Design System - 22Club
 *
 * Design System centralizzato con tutte le classi e pattern riutilizzabili.
 * Importa questo file per mantenere la coerenza del design in tutto il progetto.
 *
 * @example
 * import { dk } from '@/config/dkdesign'
 *
 * <div className={dk.container.main}>
 *   <Card className={dk.card.standard}>
 *     <CardContent className={dk.card.content}>
 *       Contenuto
 *     </CardContent>
 *   </Card>
 * </div>
 */

export const dk = {
  /**
   * 📐 Layout & Container
   */
  container: {
    /**
     * Container principale per pagine dashboard
     * @example <div className={dk.container.main}>...</div>
     */
    main: 'flex-1 flex flex-col space-y-4 sm:space-y-6 px-4 sm:px-6 py-4 sm:py-6 max-w-[1800px] mx-auto w-full relative',

    /**
     * Container per sezioni con scroll
     * @example <div className={dk.container.scrollable}>...</div>
     */
    scrollable: 'flex flex-col h-full space-y-6 px-6 py-6 overflow-y-auto',

    /**
     * Container sezione compatta
     * @example <div className={dk.container.section}>...</div>
     */
    section: 'space-y-6 p-6',

    /**
     * Container con padding minimo
     * @example <div className={dk.container.compact}>...</div>
     */
    compact: 'space-y-4 p-4',
  },

  /**
   * 🎴 Card & Componenti
   */
  card: {
    /**
     * Card standard con variant trainer
     * @example <Card className={dk.card.standard}>...</Card>
     */
    standard: 'relative overflow-hidden',

    /**
     * Gradient overlay per card
     * ⚠️ IMPORTANTE: Usa SEMPRE questa classe invece di hardcodare il gradient
     * @example <div className={dk.card.gradientOverlay} />
     */
    gradientOverlay:
      'absolute inset-0 bg-gradient-to-br from-teal-500/5 via-transparent to-cyan-500/5',

    /**
     * Content wrapper per card
     * @example <CardContent className={dk.card.content}>...</CardContent>
     */
    content: 'relative p-6',

    /**
     * Header wrapper per card
     * @example <CardHeader className={dk.card.header}>...</CardHeader>
     */
    header: 'relative',
  },

  /**
   * 🎨 Colori & Gradienti
   */
  gradient: {
    /**
     * Background gradient standard
     */
    background: 'bg-gradient-to-br from-teal-900 to-cyan-900',

    /**
     * Border gradient standard
     */
    border: 'border border-teal-500/30',

    /**
     * Overlay gradient leggero
     */
    overlay: 'bg-gradient-to-br from-teal-500/5 via-transparent to-cyan-500/5',

    /**
     * Text gradient
     */
    text: 'bg-gradient-to-r from-teal-500 to-cyan-500 bg-clip-text text-transparent',
  },

  /**
   * 📝 Input & Form
   */
  input: {
    /**
     * Input standard con gradient background
     */
    standard:
      'bg-gradient-to-br from-teal-900 to-cyan-900 border-teal-500/30 text-text-primary placeholder:text-gray-400 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition-all duration-200',

    /**
     * Input con icona a sinistra
     */
    withIcon:
      'bg-gradient-to-br from-teal-900 to-cyan-900 border-teal-500/30 text-text-primary placeholder:text-gray-400 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition-all duration-200 pl-10',
  },

  /**
   * 🔘 Bottoni
   */
  button: {
    /**
     * Bottone full width
     */
    fullWidth: 'w-full',

    /**
     * Bottone con icona
     */
    withIcon: 'flex items-center gap-2',
  },

  /**
   * 🏷️ Badge & Status
   */
  badge: {
    /**
     * Badge base
     */
    base: 'rounded-lg border px-3 py-1.5 flex items-center justify-center',

    /**
     * Badge success/completato
     */
    success:
      'rounded-lg border px-3 py-1.5 flex items-center justify-center bg-green-500/25 text-green-400 border-green-500/40',

    /**
     * Badge warning/in corso
     */
    warning:
      'rounded-lg border px-3 py-1.5 flex items-center justify-center bg-orange-500/25 text-orange-400 border-orange-500/40',

    /**
     * Badge info/programmato
     */
    info: 'rounded-lg border px-3 py-1.5 flex items-center justify-center bg-blue-500/25 text-blue-400 border-blue-500/40',

    /**
     * Badge error/annullato
     */
    error:
      'rounded-lg border px-3 py-1.5 flex items-center justify-center bg-red-500/25 text-red-400 border-red-500/40',
  },

  /**
   * 🎯 Icone & Avatar
   */
  icon: {
    /**
     * Container icona piccola
     */
    small: 'bg-teal-500/20 text-teal-400 rounded-full p-2',

    /**
     * Container icona media
     */
    medium: 'bg-teal-500/20 text-teal-400 rounded-full p-3',

    /**
     * Container icona grande
     */
    large: 'bg-teal-500/20 text-teal-400 rounded-full p-6',
  },

  /**
   * 📐 Spaziatura
   */
  spacing: {
    /**
     * Spaziatura verticale compatta
     */
    compact: 'space-y-2',

    /**
     * Spaziatura verticale standard mobile
     */
    mobile: 'space-y-4',

    /**
     * Spaziatura verticale standard desktop
     */
    desktop: 'space-y-6',

    /**
     * Spaziatura verticale ampia
     */
    wide: 'space-y-8',
  },

  /**
   * 📋 Sezioni Header
   */
  sectionHeader: {
    /**
     * Header con icona e titolo
     */
    withIcon: 'flex items-center gap-3 mb-4',

    /**
     * Icona header
     */
    icon: 'bg-teal-500/20 text-teal-400 rounded-full p-2',

    /**
     * Titolo header
     */
    title: 'text-lg font-bold text-text-primary',
  },

  /**
   * 📱 Empty States
   */
  emptyState: {
    /**
     * Container empty state
     */
    container: 'relative py-16 text-center',

    /**
     * Icona empty state
     */
    icon: 'mb-6 flex justify-center',

    /**
     * Icona wrapper
     */
    iconWrapper: 'bg-teal-500/20 text-teal-400 rounded-full p-6',

    /**
     * Titolo empty state
     */
    title: 'text-text-primary mb-2 text-xl font-semibold',

    /**
     * Descrizione empty state
     */
    description: 'text-text-secondary text-sm mb-4 max-w-md mx-auto',
  },

  /**
   * 🎭 Modali
   */
  modal: {
    /**
     * Backdrop modal
     */
    backdrop:
      'fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4',

    /**
     * Container modal
     */
    container:
      'relative z-50 w-full rounded-lg border p-6 max-w-4xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-teal-900 to-cyan-900 border-teal-500 shadow-2xl',

    /**
     * Header modal
     */
    header: 'flex items-center justify-between mb-6',

    /**
     * Titolo modal
     */
    title: 'text-xl font-bold text-text-primary',

    /**
     * Footer modal
     */
    footer: 'flex justify-end gap-3 mt-6 pt-6 border-t border-teal-500/30',
  },

  /**
   * 🔍 Filtri
   */
  filter: {
    /**
     * Container filtri
     */
    container: 'flex flex-wrap gap-3',

    /**
     * Pill filtro attivo
     */
    active: 'bg-teal-500 text-white',

    /**
     * Pill filtro inattivo
     */
    inactive: 'border border-teal-500 text-teal-400 hover:bg-teal-500/10',
  },

  /**
   * 📊 Statistiche
   */
  stats: {
    /**
     * Container statistiche
     */
    container: 'flex items-center gap-3 flex-wrap',

    /**
     * Pill statistica
     */
    pill: 'rounded-lg border px-3 py-1.5',
  },

  /**
   * 🎴 Empty State (modulo vuoto)
   */
  emptyStateModule: {
    /**
     * Container principale per empty state in modulo
     */
    container:
      'relative overflow-hidden rounded-lg bg-gradient-to-br from-background-secondary via-background-secondary to-background-tertiary border border-teal-500/20 shadow-md shadow-teal-500/5 backdrop-blur-sm',

    /**
     * Gradient overlay (da usare dentro container)
     */
    gradientOverlay:
      'absolute inset-0 bg-gradient-to-br from-teal-500/5 via-transparent to-cyan-500/5',

    /**
     * Content wrapper
     */
    content: 'relative py-8 text-center',

    /**
     * Icona container
     */
    iconContainer: 'mb-4 flex justify-center',

    /**
     * Icona wrapper
     */
    iconWrapper: 'bg-teal-500/20 text-teal-400 rounded-full p-4',

    /**
     * Titolo
     */
    title: 'text-text-primary mb-2 text-base font-semibold',

    /**
     * Descrizione
     */
    description: 'text-text-secondary text-xs mb-4 max-w-md mx-auto',
  },
} as const

/**
 * 🎨 Utility per combinare classi
 */
export const dkClass = {
  /**
   * Combina classi container + card
   */
  pageWithCard: `${dk.container.main} ${dk.card.standard}`,

  /**
   * Combina classi input + icona
   */
  inputWithIcon: `${dk.input.standard} ${dk.input.withIcon}`,

  /**
   * Combina classi badge base + colore
   */
  badgeSuccess: `${dk.badge.base} bg-green-500/25 text-green-400 border-green-500/40`,
  badgeWarning: `${dk.badge.base} bg-orange-500/25 text-orange-400 border-orange-500/40`,
  badgeInfo: `${dk.badge.base} bg-blue-500/25 text-blue-400 border-blue-500/40`,
  badgeError: `${dk.badge.base} bg-red-500/25 text-red-400 border-red-500/40`,
} as const

/**
 * 📚 Esempi di utilizzo
 *
 * @example
 * // Container principale pagina
 * <div className={dk.container.main}>
 *   <Card className={dk.card.standard}>
 *     <div className={dk.card.gradientOverlay} />
 *     <CardContent className={dk.card.content}>
 *       Contenuto
 *     </CardContent>
 *   </Card>
 * </div>
 *
 * @example
 * // Input con stile standard
 * <Input className={dk.input.standard} />
 *
 * @example
 * // Badge status
 * <div className={dk.badge.success}>Completato</div>
 *
 * @example
 * // Icona container
 * <div className={dk.icon.medium}>
 *   <Icon className="h-5 w-5" />
 * </div>
 *
 * @example
 * // Empty state
 * <CardContent className={dk.emptyState.container}>
 *   <div className={dk.emptyState.icon}>
 *     <div className={dk.emptyState.iconWrapper}>
 *       <Icon className="h-12 w-12" />
 *     </div>
 *   </div>
 *   <h3 className={dk.emptyState.title}>Nessun elemento</h3>
 *   <p className={dk.emptyState.description}>Descrizione</p>
 * </CardContent>
 */

export default dk
