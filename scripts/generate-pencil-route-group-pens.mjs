/**
 * Generates grouped .pen files under design/ (JSON format, Pencil 2.11).
 * Run: node scripts/generate-pencil-route-group-pens.mjs
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const designDir = path.join(__dirname, '..', 'design')

const VARIABLES = {
  'color.bg': { type: 'color', value: '#0d0d0d' },
  'color.text.primary': { type: 'color', value: '#EAF0F2' },
  'color.text.secondary': { type: 'color', value: '#A5AFB4' },
  'color.text.muted': { type: 'color', value: '#6C757D' },
  'color.primary': { type: 'color', value: '#02B3BF' },
  'color.border.white10': { type: 'color', value: '#FFFFFF1A' },
  'color.surface.zinc800': { type: 'color', value: '#27272a' },
  'color.surface.zinc900': { type: 'color', value: '#18181b' },
  'color.black.70': { type: 'color', value: '#000000B3' },
  'color.cyan.500': { type: 'color', value: '#06b6d4' },
  'color.slate.600': { type: 'color', value: '#475569' },
  'color.error': { type: 'color', value: '#FF3B30' },
  'color.red.500': { type: 'color', value: '#ef4444' },
  'radius.input': { type: 'number', value: 12 },
  'radius.card': { type: 'number', value: 16 },
  'radius.panel': { type: 'number', value: 24 },
  'radius.pill': { type: 'number', value: 9999 },
}

const GROUPS = [
  {
    key: '01_Public_Auth',
    routesCount: 9,
    routes: [
      '/',
      '/login',
      '/registrati',
      '/forgot-password',
      '/reset-password',
      '/welcome',
      '/post-login',
      '/privacy',
      '/termini',
    ],
  },
  { key: '02_Design_Dev', routesCount: 2, routes: ['/design-system', '/sentry-example-page'] },
  {
    key: '03_Home_Atleta',
    routesCount: 25,
    routes: [
      '/home',
      '/home/allenamenti',
      '/home/allenamenti/oggi',
      '/home/allenamenti/riepilogo',
      '/home/allenamenti/[id]',
      '/home/allenamenti/[id]/giorno/[dayId]',
      '/home/allenamenti/esercizio/[exerciseId]',
      '/home/appuntamenti',
      '/home/chat',
      '/home/documenti',
      '/home/foto-risultati',
      '/home/foto-risultati/aggiungi',
      '/home/massaggiatore',
      '/home/nutrizionista',
      '/home/pagamenti',
      '/home/profilo',
      '/home/progressi',
      '/home/progressi/allenamenti',
      '/home/progressi/allenamenti/[exerciseId]',
      '/home/progressi/foto',
      '/home/progressi/misurazioni',
      '/home/progressi/misurazioni/[field]',
      '/home/progressi/nuovo',
      '/home/progressi/storico',
      '/home/trainer',
    ],
  },
  {
    key: '04_Dashboard_Staff_Core',
    routesCount: 26,
    routes: [
      '/dashboard',
      '/dashboard/abbonamenti',
      '/dashboard/allenamenti',
      '/dashboard/appuntamenti',
      '/dashboard/calendario',
      '/dashboard/calendario/impostazioni',
      '/dashboard/chat',
      '/dashboard/clienti',
      '/dashboard/comunicazioni',
      '/dashboard/comunicazioni/template',
      '/dashboard/database',
      '/dashboard/documenti',
      '/dashboard/esercizi',
      '/dashboard/impostazioni',
      '/dashboard/invita-atleta',
      '/dashboard/notifiche',
      '/dashboard/pagamenti',
      '/dashboard/pagamenti/atleta/[athleteId]',
      '/dashboard/prenotazioni',
      '/dashboard/prenotazioni/atleti/[id]',
      '/dashboard/profilo',
      '/dashboard/schede',
      '/dashboard/schede/nuova',
      '/dashboard/schede/[id]/modifica',
      '/dashboard/statistiche',
      '/dashboard/workouts',
    ],
  },
  {
    key: '05_Dashboard_Admin',
    routesCount: 6,
    routes: [
      '/dashboard/admin',
      '/dashboard/admin/organizzazioni',
      '/dashboard/admin/ruoli',
      '/dashboard/admin/statistiche',
      '/dashboard/admin/utenti',
      '/dashboard/admin/utenti/marketing',
    ],
  },
  {
    key: '06_Dashboard_Atleti',
    routesCount: 14,
    routes: [
      '/dashboard/atleti/[id]',
      '/dashboard/atleti/[id]/progressi',
      '/dashboard/atleti/[id]/progressi/allenamenti',
      '/dashboard/atleti/[id]/progressi/allenamenti/[exerciseId]',
      '/dashboard/atleti/[id]/progressi/foto',
      '/dashboard/atleti/[id]/progressi/misurazioni',
      '/dashboard/atleti/[id]/progressi/misurazioni/[field]',
      '/dashboard/atleti/[id]/progressi/storico',
      '/dashboard/atleti/[id]/progressi/storico/appuntamenti',
      '/dashboard/atleti/[id]/progressi/storico/completati',
      '/dashboard/atleti/[id]/progressi/storico/schede',
      '/dashboard/atleti/[id]/progressi/storico/sessioni-aperte',
    ],
  },
  {
    key: '07_Dashboard_Marketing',
    routesCount: 18,
    routes: [
      '/dashboard/marketing',
      '/dashboard/marketing/analytics',
      '/dashboard/marketing/athletes',
      '/dashboard/marketing/automations',
      '/dashboard/marketing/automations/new',
      '/dashboard/marketing/automations/[id]',
      '/dashboard/marketing/campaigns',
      '/dashboard/marketing/campaigns/new',
      '/dashboard/marketing/campaigns/[id]',
      '/dashboard/marketing/campaigns/[id]/edit',
      '/dashboard/marketing/impostazioni',
      '/dashboard/marketing/leads',
      '/dashboard/marketing/leads/[id]',
      '/dashboard/marketing/report',
      '/dashboard/marketing/segments',
      '/dashboard/marketing/segments/new',
      '/dashboard/marketing/segments/[id]',
      '/dashboard/marketing/segments/[id]/edit',
    ],
  },
  {
    key: '08_Dashboard_Massaggiatore',
    routesCount: 10,
    routes: [
      '/dashboard/massaggiatore',
      '/dashboard/massaggiatore/abbonamenti',
      '/dashboard/massaggiatore/appuntamenti',
      '/dashboard/massaggiatore/calendario',
      '/dashboard/massaggiatore/chat',
      '/dashboard/massaggiatore/clienti',
      '/dashboard/massaggiatore/clienti/[id]',
      '/dashboard/massaggiatore/impostazioni',
      '/dashboard/massaggiatore/profilo',
      '/dashboard/massaggiatore/statistiche',
    ],
  },
  {
    key: '09_Dashboard_Nutrizionista',
    routesCount: 15,
    routes: [
      '/dashboard/nutrizionista',
      '/dashboard/nutrizionista/abbonamenti',
      '/dashboard/nutrizionista/analisi',
      '/dashboard/nutrizionista/atleti',
      '/dashboard/nutrizionista/atleti/[id]',
      '/dashboard/nutrizionista/calendario',
      '/dashboard/nutrizionista/chat',
      '/dashboard/nutrizionista/checkin',
      '/dashboard/nutrizionista/checkin/[id]',
      '/dashboard/nutrizionista/documenti',
      '/dashboard/nutrizionista/impostazioni',
      '/dashboard/nutrizionista/piani',
      '/dashboard/nutrizionista/piani/nuovo',
      '/dashboard/nutrizionista/progressi',
    ],
  },
  {
    key: '10_Embed',
    routesCount: 6,
    routes: [
      '/embed/athlete-allenamenti/[athleteProfileId]',
      '/embed/athlete-allenamenti/[athleteProfileId]/oggi',
      '/embed/athlete-allenamenti/[athleteProfileId]/riepilogo',
      '/embed/athlete-allenamenti/[athleteProfileId]/[id]',
      '/embed/athlete-allenamenti/[athleteProfileId]/[id]/giorno/[dayId]',
      '/embed/athlete-allenamenti/[athleteProfileId]/esercizio/[exerciseId]',
    ],
  },
]

function text(id, name, content, opts = {}) {
  return {
    type: 'text',
    id,
    name,
    content,
    fontFamily: 'Inter',
    fontSize: opts.fontSize ?? 13,
    fontWeight: opts.fontWeight ?? 'normal',
    fill: opts.fill ?? '#334155',
    textGrowth: opts.textGrowth,
    width: opts.width,
    height: opts.height,
  }
}

function frame(id, name, props, children) {
  return { type: 'frame', id, name, ...props, children }
}

function inventoryBody(routes) {
  const header =
    'Route | Desktop | Tablet | Mobile | Loading | Empty | Error | Overlays | Status | Notes'
  const row = (r) =>
    `${r} | not_started | not_started | not_started | not_started | not_started | not_started | not_started | not_started |`
  return [header, ...routes.map(row)].join('\n')
}

function masterIndexMatrix() {
  const rows = [
    'Group | routes_count | status | desktop | tablet | mobile',
    ...GROUPS.map(
      (g) => `${g.key} | ${g.routesCount} | not_started | not_started | not_started | not_started`,
    ),
    '99_Components_Patterns_Library | library | not_started | not_started | not_started | not_started',
  ]
  return rows.join('\n')
}

function buildGroupPen(groupKey, routes, routesCount) {
  const p = groupKey.replace(/[^a-zA-Z0-9]/g, '').slice(0, 8)
  const countLabel = String(routesCount)
  const cover = frame(
    `${p}-cover`,
    '00_Cover',
    {
      x: 0,
      y: 0,
      width: 1680,
      height: 420,
      fill: '#0f172a',
      layout: 'vertical',
      gap: 14,
      padding: 36,
    },
    [
      text(`${p}-t1`, 'title', `22Club — ${groupKey}`, {
        fontSize: 26,
        fontWeight: '600',
        fill: '#f8fafc',
      }),
      text(
        `${p}-t2`,
        'meta',
        `routes_count=${countLabel} · status=not_started · desktop/tablet/mobile=not_started`,
        { fontSize: 13, fill: '#94a3b8' },
      ),
      text(`${p}-t3`, 'routes', `Routes:\n${routes.join('\n')}`, {
        fontSize: 12,
        fill: '#e2e8f0',
        textGrowth: 'fixed-width',
        width: 1500,
      }),
    ],
  )

  const desktop = frame(
    `${p}-desk`,
    '01_Desktop',
    {
      x: 0,
      y: 460,
      width: 1440,
      height: 900,
      fill: '#f1f5f9',
      layout: 'vertical',
      padding: 28,
      gap: 10,
    },
    [
      text(`${p}-dt`, 'hint', 'Desktop 1440×900 — wireframes & captures', {
        fontSize: 15,
        fontWeight: '600',
        fill: '#0f172a',
      }),
    ],
  )

  const tablet = frame(
    `${p}-tab`,
    '02_Tablet',
    {
      x: 1480,
      y: 460,
      width: 768,
      height: 1024,
      fill: '#f8fafc',
      layout: 'vertical',
      padding: 24,
      gap: 8,
    },
    [text(`${p}-tt`, 'hint', 'Tablet 768×1024', { fontSize: 14, fontWeight: '600' })],
  )

  const mobile = frame(
    `${p}-mob`,
    '03_Mobile',
    {
      x: 2280,
      y: 460,
      width: 360,
      height: 800,
      fill: '#ffffff',
      layout: 'vertical',
      padding: 20,
      gap: 8,
    },
    [text(`${p}-mt`, 'hint', 'Mobile 360×800', { fontSize: 13, fontWeight: '600' })],
  )

  const states = frame(
    `${p}-st`,
    '04_States',
    {
      x: 0,
      y: 1380,
      width: 1440,
      height: 340,
      fill: '#eef2ff',
      layout: 'vertical',
      padding: 24,
      gap: 8,
    },
    [
      text(`${p}-stt`, 'hint', 'States: default · loading · empty · error', {
        fontSize: 14,
        fontWeight: '600',
        fill: '#312e81',
      }),
    ],
  )

  const overlays = frame(
    `${p}-ov`,
    '05_Overlays',
    {
      x: 0,
      y: 1740,
      width: 1440,
      height: 300,
      fill: '#ecfdf5',
      layout: 'vertical',
      padding: 24,
      gap: 8,
    },
    [
      text(`${p}-ovt`, 'hint', 'Overlays: dialog · drawer · popover (if present)', {
        fontSize: 14,
        fontWeight: '600',
        fill: '#14532d',
      }),
    ],
  )

  const matrix = frame(
    `${p}-mx`,
    '06_Inventory_Matrix',
    {
      x: 0,
      y: 2060,
      width: 2800,
      height: 880,
      fill: '#fffbeb',
      layout: 'vertical',
      padding: 24,
      gap: 12,
    },
    [
      text(
        `${p}-mh`,
        'matrix_header',
        'Route | Desktop | Tablet | Mobile | Loading | Empty | Error | Overlays | Status | Notes',
        {
          fontSize: 13,
          fontWeight: '700',
          fill: '#78350f',
        },
      ),
      text(`${p}-mb`, 'matrix_body', inventoryBody(routes), {
        fontSize: 11,
        fill: '#92400e',
        textGrowth: 'fixed-width',
        width: 2700,
      }),
    ],
  )

  return {
    version: '2.11',
    children: [cover, desktop, tablet, mobile, states, overlays, matrix],
    variables: VARIABLES,
  }
}

function buildMasterIndexPen() {
  const cover = frame(
    'midx-cover',
    '00_Cover',
    {
      x: 0,
      y: 0,
      width: 1760,
      height: 480,
      fill: '#0b1220',
      layout: 'vertical',
      gap: 16,
      padding: 40,
    },
    [
      text('midx-t1', 'title', '22Club Pencil Design System — Master Index', {
        fontSize: 30,
        fontWeight: '700',
        fill: '#f8fafc',
      }),
      text(
        'midx-t2',
        'subtitle',
        'Grouped route files under design/. Next: reconstruct screens per group (3 viewports + states + overlays).',
        { fontSize: 14, fill: '#cbd5e1' },
      ),
      text(
        'midx-tg',
        'groups',
        [
          'Groups:',
          '01_Public_Auth',
          '02_Design_Dev',
          '03_Home_Atleta',
          '04_Dashboard_Staff_Core',
          '05_Dashboard_Admin',
          '06_Dashboard_Atleti',
          '07_Dashboard_Marketing',
          '08_Dashboard_Massaggiatore',
          '09_Dashboard_Nutrizionista',
          '10_Embed',
          '99_Components_Patterns_Library',
        ].join('\n'),
        { fontSize: 13, fill: '#e2e8f0', textGrowth: 'fixed-width', width: 1600 },
      ),
    ],
  )

  const desktop = frame(
    'midx-desk',
    '01_Desktop',
    {
      x: 0,
      y: 520,
      width: 1440,
      height: 900,
      fill: '#f1f5f9',
      layout: 'vertical',
      padding: 28,
      gap: 10,
    },
    [
      text('midx-dt', 'hint', 'Desktop 1440×900 — master overview (optional)', {
        fontSize: 15,
        fontWeight: '600',
        fill: '#0f172a',
      }),
    ],
  )

  const tablet = frame(
    'midx-tab',
    '02_Tablet',
    {
      x: 1480,
      y: 520,
      width: 768,
      height: 1024,
      fill: '#f8fafc',
      layout: 'vertical',
      padding: 24,
      gap: 8,
    },
    [text('midx-tt', 'hint', 'Tablet 768×1024', { fontSize: 14, fontWeight: '600' })],
  )

  const mobile = frame(
    'midx-mob',
    '03_Mobile',
    {
      x: 2280,
      y: 520,
      width: 360,
      height: 800,
      fill: '#ffffff',
      layout: 'vertical',
      padding: 20,
      gap: 8,
    },
    [text('midx-mt', 'hint', 'Mobile 360×800', { fontSize: 13, fontWeight: '600' })],
  )

  const states = frame(
    'midx-st',
    '04_States',
    {
      x: 0,
      y: 1440,
      width: 1440,
      height: 320,
      fill: '#eef2ff',
      layout: 'vertical',
      padding: 24,
      gap: 8,
    },
    [
      text('midx-stt', 'hint', 'States roll-up (per group in own file)', {
        fontSize: 14,
        fill: '#312e81',
      }),
    ],
  )

  const overlays = frame(
    'midx-ov',
    '05_Overlays',
    {
      x: 0,
      y: 1780,
      width: 1440,
      height: 280,
      fill: '#ecfdf5',
      layout: 'vertical',
      padding: 24,
      gap: 8,
    },
    [text('midx-ovt', 'hint', 'Overlays roll-up', { fontSize: 14, fill: '#14532d' })],
  )

  const matrix = frame(
    'midx-mx',
    '06_Inventory_Matrix',
    {
      x: 0,
      y: 2080,
      width: 2800,
      height: 900,
      fill: '#fffbeb',
      layout: 'vertical',
      padding: 28,
      gap: 12,
    },
    [
      text('midx-mh', 'matrix_header', 'Per-group rollout (status + viewport readiness)', {
        fontSize: 14,
        fontWeight: '700',
        fill: '#78350f',
      }),
      text('midx-mb', 'matrix_body', masterIndexMatrix(), {
        fontSize: 12,
        fill: '#92400e',
        textGrowth: 'fixed-width',
        width: 2700,
      }),
    ],
  )

  return {
    version: '2.11',
    children: [cover, desktop, tablet, mobile, states, overlays, matrix],
    variables: VARIABLES,
  }
}

const FILES = [
  ['00_22Club_Master_Index.pen', buildMasterIndexPen],
  ...GROUPS.map((g) => {
    const num = g.key.slice(0, 2)
    const rest = g.key.slice(3)
    return [`${num}_${rest}.pen`, () => buildGroupPen(g.key, g.routes, g.routesCount)]
  }),
]

for (const [name, builder] of FILES) {
  const out = path.join(designDir, name)
  fs.writeFileSync(out, JSON.stringify(builder(), null, 2), 'utf8')
  console.log('Wrote', out)
}

/** Prepend structure shell to 99_Components_Patterns_Library.pen */
const libPath = path.join(designDir, '99_Components_Patterns_Library.pen')
if (fs.existsSync(libPath)) {
  const raw = fs.readFileSync(libPath, 'utf8')
  const doc = JSON.parse(raw)
  const shellCoverId = '99Compon-cover'
  const already = (doc.children || []).some((c) => c.id === shellCoverId)
  if (!already) {
    const shell = buildGroupPen(
      '99_Components_Patterns_Library',
      [
        'Design tokens + reusable components (copied from 22Club Design System (Pencil).pen).',
        'Do not delete lib-offscreen; add screens to 04_Screens / group files as needed.',
      ],
      'library',
    )
    doc.children = [...shell.children, ...(doc.children || [])]
    fs.writeFileSync(libPath, JSON.stringify(doc, null, 2), 'utf8')
    console.log('Prepended structure frames to', libPath)
  } else {
    console.log('Skip library prepend (shell already present).', libPath)
  }
}
