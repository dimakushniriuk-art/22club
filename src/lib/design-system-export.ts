/**
 * Export Design System — CSS e React (stringhe per download).
 * Usato dalla pagina /design-system per Scarica CSS / Scarica React.
 * Export completo: tutti i token (colori, typography, radius, spacing, motion, shadow, focus, roleThemes).
 */

import {
  colors,
  radius,
  radiusPx,
  spacing,
  touchTarget,
  gradients,
  typography,
  shadow,
  motion,
  focus,
  roleThemes,
} from '@/lib/design-tokens'
import { ICON_NAMES, HOME_PAGES_DESIGN, PATH_META } from '@/lib/design-system-data'

export function getDesignSystemCss(): string {
  const colorVars: string[] = []
  colorVars.push('  /* Background & Surface */')
  colorVars.push(`  --color-background: ${colors.background.DEFAULT};`)
  colorVars.push(`  --color-background-elevated: ${colors.background.elevated};`)
  colorVars.push(`  --color-background-secondary: ${colors.background.secondary};`)
  colorVars.push(`  --color-background-tertiary: ${colors.background.tertiary};`)
  colorVars.push(`  --color-surface-100: ${colors.surface[100]};`)
  colorVars.push(`  --color-surface-200: ${colors.surface[200]};`)
  colorVars.push(`  --color-surface-300: ${colors.surface[300]};`)
  colorVars.push('  /* Text */')
  colorVars.push(`  --color-text-primary: ${colors.text.primary};`)
  colorVars.push(`  --color-text-secondary: ${colors.text.secondary};`)
  colorVars.push(`  --color-text-muted: ${colors.text.muted};`)
  colorVars.push('  /* Primary & Brand */')
  colorVars.push(`  --color-primary: ${colors.primary.DEFAULT};`)
  colorVars.push(`  --color-primary-hover: ${colors.primary.hover};`)
  colorVars.push(`  --color-primary-active: ${colors.primary.active};`)
  colorVars.push('  /* State */')
  colorVars.push(`  --color-success: ${colors.success};`)
  colorVars.push(`  --color-warning: ${colors.warning};`)
  colorVars.push(`  --color-error: ${colors.error};`)
  colorVars.push('  /* Border */')
  colorVars.push(`  --color-border: ${colors.border.DEFAULT};`)
  colorVars.push('  /* Radius */')
  for (const [k, v] of Object.entries(radius)) {
    if (typeof v === 'string') colorVars.push(`  --radius-${k}: ${v};`)
  }
  colorVars.push('  /* Spacing (esempi) */')
  colorVars.push(`  --spacing-touch-target: ${touchTarget};`)
  colorVars.push(`  --spacing-4: ${spacing[4]};`)
  colorVars.push(`  --spacing-6: ${spacing[6]};`)
  colorVars.push('  /* Typography */')
  colorVars.push(`  --font-sans: ${typography.fontFamily.sans.join(', ')};`)
  colorVars.push(`  --font-mono: ${typography.fontFamily.mono.join(', ')};`)
  colorVars.push('  /* Motion */')
  colorVars.push(`  --duration-fast: ${motion.duration.fast};`)
  colorVars.push(`  --duration-default: ${motion.duration.DEFAULT};`)
  colorVars.push(`  --duration-slow: ${motion.duration.slow};`)
  colorVars.push(`  --easing-default: ${motion.easing.default};`)
  colorVars.push('  /* Shadow */')
  colorVars.push(`  --shadow-soft: ${shadow.soft};`)
  colorVars.push(`  --shadow-glow: ${shadow.glow};`)
  colorVars.push(`  --shadow-md: ${shadow.md};`)
  colorVars.push(`  --shadow-lg: ${shadow.lg};`)

  return `/**
 * 22Club Design System — CSS Variables (intero design system)
 * Generato da /design-system. Fonte: @/lib/design-tokens
 * Sezioni: Colori, Radius, Spacing, Typography, Motion, Shadow.
 */

:root {
${colorVars.join('\n')}
}

/* Gradients (riferimento) */
/* glassHeaderTeal: ${gradients.glassHeaderTeal} */
/* glassHeaderBorder: ${gradients.glassHeaderBorder} */
`
}

export function getDesignSystemReact(): string {
  return `/**
 * 22Club Design System — React/TypeScript token reference (intero design system)
 * Generato da /design-system. Fonte: @/lib/design-tokens
 */

// Colori (completi: background, surface, text, primary, accent, semantic, border, input, athleteAccents, brand)
export const colors = ${JSON.stringify(colors, null, 2)} as const;

// Radius (px)
export const radius = ${JSON.stringify(radius, null, 2)};

// Radius alias (Tailwind key -> px)
export const radiusPx = ${JSON.stringify(radiusPx, null, 2)};

// Spacing (rem/px)
export const spacing = ${JSON.stringify(spacing, null, 2)};
export const touchTarget = ${JSON.stringify(touchTarget)};

// Typography (fontFamily, fontSize, fontWeight, textColor)
export const typography = ${JSON.stringify(typography, null, 2)} as const;

// Gradients
export const gradients = ${JSON.stringify(gradients, null, 2)};

// Shadow
export const shadow = ${JSON.stringify(shadow, null, 2)};

// Motion (duration, easing, keyframes, animation)
export const motion = ${JSON.stringify(motion, null, 2)};

// Focus / Accessibility
export const focus = ${JSON.stringify(focus, null, 2)};

// Role themes (athlete, trainer, admin)
export const roleThemes = ${JSON.stringify(roleThemes, null, 2)};

// Uso in React:
// import { colors, radius, spacing, shadow, motion } from '@/lib/design-tokens';
// <div style={{ color: colors.primary.DEFAULT, borderRadius: radius.lg, boxShadow: shadow.soft }} />
`
}

export function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

/** Tipo jsPDF per buildDesignSystemPdf (evita dipendenza runtime se usato con dynamic import). */
export type JsPDFDoc = {
  addPage: () => void
  setFontSize: (n: number) => void
  text: (text: string | string[], x: number, y: number) => void
  save: (name: string) => void
  splitTextToSize: (text: string, maxWidth: number) => string[]
}

/** Compila l'intero design system in un PDF multi-pagina (Colori, Tipografia, Radius, Spacing, Motion, Layouts, Icone, Componenti, Moduli, Design Home, Auth). */
export function buildDesignSystemPdf(doc: JsPDFDoc): void {
  const pageW = 210
  const margin = 20
  const maxW = pageW - margin * 2
  let y = 20
  const lineH = 6

  function newPage() {
    doc.addPage()
    y = 20
  }
  function sectionTitle(title: string) {
    if (y > 25) newPage()
    doc.setFontSize(14)
    doc.text(title, margin, y)
    y += 10
    doc.setFontSize(9)
  }
  function bodyLines(text: string) {
    const lines = doc.splitTextToSize(text, maxW)
    for (const line of lines) {
      if (y > 275) newPage()
      doc.text(line, margin, y)
      y += lineH
    }
    y += 4
  }

  // Copertina
  doc.setFontSize(22)
  doc.text('22Club Design System', margin, y)
  y += 12
  doc.setFontSize(10)
  doc.text('Documentazione completa. Generato da /design-system.', margin, y)
  y += 15
  doc.setFontSize(9)
  const indexLines = [
    '1. Colori',
    '2. Tipografia',
    '3. Radius & Spacing',
    '4. Motion',
    '5. Layouts',
    '6. Icone',
    '7. Componenti',
    '8. Moduli',
    '9. Design Home (pagine)',
    '10. Auth (Login)',
  ]
  for (const line of indexLines) {
    doc.text(line, margin, y)
    y += lineH
  }

  // Colori
  sectionTitle('1. Colori')
  bodyLines(
    `Background: ${colors.background.DEFAULT} | Elevated: ${colors.background.elevated} | Secondary: ${colors.background.secondary} | Tertiary: ${colors.background.tertiary}. Surface: 100 ${colors.surface[100]}, 200 ${colors.surface[200]}, 300 ${colors.surface[300]}. Text: primary ${colors.text.primary}, secondary ${colors.text.secondary}, muted ${colors.text.muted}. Primary: ${colors.primary.DEFAULT}, hover ${colors.primary.hover}, active ${colors.primary.active}. Success: ${colors.success}. Warning: ${colors.warning}. Error: ${colors.error}. Border: ${colors.border.DEFAULT}. Accenti atleta: teal ${colors.athleteAccents.teal.bar}, cyan ${colors.athleteAccents.cyan.bar}, green ${colors.athleteAccents.green.bar}, emerald ${colors.athleteAccents.emerald.bar}, amber ${colors.athleteAccents.amber.bar}.`,
  )

  // Tipografia
  sectionTitle('2. Tipografia')
  bodyLines(
    `Font sans: ${typography.fontFamily.sans.join(', ')}. Font mono: ${typography.fontFamily.mono.join(', ')}. Font size scale: xs 0.75rem, sm 0.875rem, base 1rem, lg 1.125rem, xl 1.25rem, 2xl 1.5rem, 3xl 1.875rem, 4xl 2.25rem, 5xl 3rem, 6xl 3.75rem. Font weight: normal 400, medium 500, semibold 600, bold 700.`,
  )

  // Radius & Spacing
  sectionTitle('3. Radius & Spacing')
  bodyLines(
    `Radius: none 0, sm 6px, md 12px, lg 16px, xl 24px, 2xl 32px, full 9999px. Touch target: ${touchTarget}. Spacing (rem): 0-128 (scale Tailwind). Esempi: 4 = 1rem, 6 = 1.5rem, 8 = 2rem.`,
  )

  // Motion
  sectionTitle('4. Motion')
  bodyLines(
    `Duration: fast ${motion.duration.fast}, default ${motion.duration.DEFAULT}, slow ${motion.duration.slow}. Easing: ${motion.easing.default}. Keyframes: fade-in, fade-out, slide-in-up, slide-in-down, scale-in, pulse-glow, slide-in-left, slide-in-right, accordion-down, accordion-up.`,
  )

  // Layouts
  sectionTitle('5. Layouts')
  bodyLines(
    'Patterns: header glass (backdrop-blur, gradient teal), header compatto. Container: px-3 sm:px-4 min-[834px]:px-6, py-4. Griglia blocchi home: grid grid-cols-2 min-[834px]:grid-cols-3, gap-3 min-[834px]:gap-5. Breakpoint tablet: min-[834px].',
  )

  // Icone
  sectionTitle('6. Icone (Lucide)')
  bodyLines(ICON_NAMES.join(', '))

  // Componenti
  sectionTitle('7. Componenti')
  bodyLines(
    'Button, Input, Label, Textarea, Checkbox, RadioGroup, Select, Switch, Slider, Card (CardHeader, CardTitle, CardDescription, CardContent, CardFooter), Tabs (TabsList, TabsTrigger, TabsContent), Dialog, AlertDialog, DropdownMenu, Avatar, Badge, Progress, Separator, Skeleton, Tooltip, ScrollArea, Sheet.',
  )

  // Moduli
  sectionTitle('8. Moduli')
  bodyLines(
    'Card athlete (barra accento, iconBg), RestTimer, TrainerSessionModal, Progress, Badge, MessageList, MessageInput, SimpleSelect, LoadingState, ErrorState, AthleteNutritionTab, AthleteMassageTab, professional-icons.',
  )

  // Design Home
  sectionTitle('9. Design Home — Pagine')
  for (const p of HOME_PAGES_DESIGN) {
    if (y > 275) newPage()
    doc.text(`${p.path} — ${p.label}`, margin, y)
    y += lineH
  }
  y += 4

  // Auth
  sectionTitle('10. Auth (Login)')
  const loginMeta = PATH_META['/login'] ?? PATH_META['/forgot-password']
  if (loginMeta?.tokenTable) {
    for (const row of loginMeta.tokenTable) {
      if (y > 275) newPage()
      doc.text(`${row.token}: ${row.value}`, margin, y)
      y += lineH
    }
  } else {
    bodyLines(
      'Login: form email/password, link forgot-password. Token: ring-2 ring-primary ring-offset-2 ring-offset-background. Pagine: /login, /forgot-password.',
    )
  }
}
