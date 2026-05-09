/**
 * Schermo reale: marketing_staff_lead_pipeline
 * File: 22Club — Design System (pagina 02_05__Components_Patterns_Screens o 02_Components)
 *
 * Usa solo componenti Fase 3 già nel file: PageHeader, MetricCard, DashboardColumnPanel,
 * EmptyState, Skeleton. Nessun nuovo COMPONENT / COMPONENT_SET — solo frame di schermo.
 *
 * Plugins → Development → 22Club Screen — Marketing Lead Pipeline
 */
;(function () {
  var ACCENT = '#02B3BF'
  var TEXT_PRIMARY = '#EAF0F2'
  var TEXT_SECONDARY = '#A5AFB4'

  var hexRgb = function (hex) {
    var h = hex.replace('#', '')
    return {
      r: parseInt(h.slice(0, 2), 16) / 255,
      g: parseInt(h.slice(2, 4), 16) / 255,
      b: parseInt(h.slice(4, 6), 16) / 255,
    }
  }

  var solidPaint = function (hex, opacity) {
    if (opacity === undefined) opacity = 1
    var c = hexRgb(hex)
    return { type: 'SOLID', color: { r: c.r, g: c.g, b: c.b }, opacity: opacity }
  }

  function shadowEffects(y, blur, alpha) {
    return [
      {
        type: 'DROP_SHADOW',
        color: { r: 0, g: 0, b: 0, a: alpha },
        offset: { x: 0, y: y },
        radius: blur,
        spread: 0,
        visible: true,
        blendMode: 'NORMAL',
      },
    ]
  }

  function applyTableCardChrome(f) {
    f.cornerRadius = 16
    var zinc = hexRgb('18181B')
    f.fills = [
      {
        type: 'GRADIENT_LINEAR',
        gradientStops: [
          { position: 0, color: { r: zinc.r, g: zinc.g, b: zinc.b, a: 0.95 } },
          { position: 1, color: { r: 0, g: 0, b: 0, a: 0.8 } },
        ],
        gradientTransform: [
          [1, 0, 0],
          [0, 1, 0],
        ],
      },
    ]
    f.strokes = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 }, opacity: 0.1 }]
    f.strokeWeight = 1
    f.effects = shadowEffects(3, 14, 0.22)
  }

  figma.on('run', function () {
    run().then(
      function () {
        figma.closePlugin()
      },
      function (e) {
        figma.notify('Lead Pipeline screen: ' + (e && e.message ? e.message : String(e)))
        figma.closePlugin()
      },
    )
  })

  async function loadFonts() {
    await figma.loadFontAsync({ family: 'Inter', style: 'Regular' })
    await figma.loadFontAsync({ family: 'Inter', style: 'Medium' })
    await figma.loadFontAsync({ family: 'Inter', style: 'Semi Bold' })
  }

  async function setTextNode(n, s) {
    if (n.type !== 'TEXT') return
    await figma.loadFontAsync(n.fontName)
    n.characters = s
  }

  function findComponentAcrossRoot(name) {
    for (var pi = 0; pi < figma.root.children.length; pi++) {
      var p = figma.root.children[pi]
      var c = p.findOne(function (n) {
        return n.type === 'COMPONENT' && n.name === name
      })
      if (c) return c
    }
    return null
  }

  function findSetAcrossRoot(name) {
    for (var pi = 0; pi < figma.root.children.length; pi++) {
      var p = figma.root.children[pi]
      var c = p.findOne(function (n) {
        return n.type === 'COMPONENT_SET' && n.name === name
      })
      if (c) return c
    }
    return null
  }

  function variantChild(set, propPrefix, value) {
    var target = propPrefix + '=' + value
    for (var i = 0; i < set.children.length; i++) {
      if (set.children[i].name === target) return set.children[i]
    }
    return set.children[0]
  }

  async function applyPageHeader(inst, title, subtitle, secLabel, priLabel) {
    var texts = []
    inst.findAll(function (n) {
      if (n.type === 'TEXT') texts.push(n)
      return false
    })
    if (texts.length >= 4) {
      await setTextNode(texts[0], title)
      await setTextNode(texts[1], subtitle)
      await setTextNode(texts[2], secLabel)
      await setTextNode(texts[3], priLabel)
    }
  }

  async function applyMetricCompactLead(inst, lineTitle, lineValue) {
    var texts = []
    inst.findAll(function (n) {
      if (n.type === 'TEXT') texts.push(n)
      return false
    })
    for (var i = 0; i < texts.length; i++) {
      var t = texts[i].characters
      if (t === 'Titolo metrica') await setTextNode(texts[i], lineTitle)
      if (t === '128' || /^\d+$/.test(t)) await setTextNode(texts[i], lineValue)
    }
  }

  function mkText(content, opts) {
    var t = figma.createText()
    t.fontName = { family: 'Inter', style: opts.style || 'Regular' }
    t.fontSize = opts.size || 14
    t.fills = [solidPaint(opts.hex || TEXT_PRIMARY, opts.opacity != null ? opts.opacity : 1)]
    if (opts.textCase) t.textCase = opts.textCase
    t.lineHeight = opts.lineHeight || { unit: 'AUTO' }
    t.characters = content
    t.textAutoResize = 'WIDTH_AND_HEIGHT'
    return t
  }

  function tabBar(activeIndex) {
    var bar = figma.createFrame()
    bar.name = 'Tabs'
    bar.layoutMode = 'HORIZONTAL'
    bar.itemSpacing = 4
    bar.fills = []
    bar.primaryAxisSizingMode = 'AUTO'
    bar.counterAxisSizingMode = 'AUTO'

    function tab(label, active) {
      var f = figma.createFrame()
      f.name = 'Tab · ' + label
      f.layoutMode = 'VERTICAL'
      f.itemSpacing = 8
      f.paddingLeft = 14
      f.paddingRight = 14
      f.paddingTop = 10
      f.paddingBottom = 10
      f.fills = []
      f.primaryAxisSizingMode = 'AUTO'
      f.counterAxisSizingMode = 'AUTO'
      var tx = mkText(label, {
        style: active ? 'Semi Bold' : 'Medium',
        size: 14,
        hex: active ? ACCENT : TEXT_SECONDARY,
      })
      f.appendChild(tx)
      var rule = figma.createRectangle()
      rule.name = 'active rule'
      rule.resize(4, 2)
      rule.cornerRadius = 1
      rule.fills = active
        ? [solidPaint(ACCENT, 1)]
        : [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 }, opacity: 0 }]
      rule.layoutAlign = 'STRETCH'
      f.appendChild(rule)
      return f
    }

    bar.appendChild(tab('Lista', activeIndex === 0))
    bar.appendChild(tab('Pipeline', activeIndex === 1))
    return bar
  }

  function fakeSearchSelectRow() {
    var row = figma.createFrame()
    row.name = 'Toolbar · search + filter'
    row.layoutMode = 'HORIZONTAL'
    row.itemSpacing = 12
    row.fills = []
    row.primaryAxisSizingMode = 'AUTO'
    row.counterAxisSizingMode = 'AUTO'
    row.layoutAlign = 'STRETCH'

    var search = figma.createFrame()
    search.name = 'Search'
    search.layoutMode = 'HORIZONTAL'
    search.itemSpacing = 10
    search.paddingLeft = 14
    search.paddingRight = 14
    search.paddingTop = 10
    search.paddingBottom = 10
    search.cornerRadius = 12
    search.fills = []
    search.strokes = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 }, opacity: 0.1 }]
    search.strokeWeight = 1
    search.primaryAxisSizingMode = 'FILL'
    search.counterAxisSizingMode = 'FIXED'
    search.resize(360, 40)
    search.appendChild(mkText('Cerca lead…', { style: 'Regular', size: 14, hex: TEXT_SECONDARY }))

    var sel = figma.createFrame()
    sel.name = 'Select · stato'
    sel.layoutMode = 'HORIZONTAL'
    sel.itemSpacing = 8
    sel.paddingLeft = 14
    sel.paddingRight = 14
    sel.paddingTop = 10
    sel.paddingBottom = 10
    sel.cornerRadius = 12
    sel.fills = []
    sel.strokes = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 }, opacity: 0.1 }]
    sel.strokeWeight = 1
    sel.appendChild(mkText('Tutti gli stati', { style: 'Medium', size: 14, hex: TEXT_PRIMARY }))
    sel.appendChild(mkText('▾', { style: 'Regular', size: 12, hex: TEXT_SECONDARY }))

    row.appendChild(search)
    row.appendChild(sel)
    search.layoutGrow = 1
    return row
  }

  function tableMock() {
    var wrap = figma.createFrame()
    wrap.name = 'Table · in Card'
    wrap.layoutMode = 'VERTICAL'
    wrap.itemSpacing = 0
    wrap.paddingLeft = 0
    wrap.paddingRight = 0
    wrap.paddingTop = 0
    wrap.paddingBottom = 0
    wrap.primaryAxisSizingMode = 'AUTO'
    wrap.counterAxisSizingMode = 'FILL'
    wrap.layoutAlign = 'STRETCH'
    applyTableCardChrome(wrap)
    wrap.clipsContent = true

    function divider() {
      var d = figma.createRectangle()
      d.resize(4, 1)
      d.fills = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 }, opacity: 0.08 }]
      d.layoutAlign = 'STRETCH'
      return d
    }

    function row(cells, header) {
      var r = figma.createFrame()
      r.name = header ? 'header row' : 'data row'
      r.layoutMode = 'HORIZONTAL'
      r.itemSpacing = 0
      r.paddingLeft = 20
      r.paddingRight = 20
      r.paddingTop = header ? 12 : 10
      r.paddingBottom = header ? 12 : 10
      r.primaryAxisAlignItems = 'CENTER'
      r.fills = []
      r.primaryAxisSizingMode = 'FIXED'
      r.counterAxisSizingMode = 'AUTO'
      r.layoutAlign = 'STRETCH'
      r.resize(400, 1)
      var weights = [2.2, 1, 1.2, 1, 1]
      for (var i = 0; i < cells.length; i++) {
        var cell = figma.createFrame()
        cell.layoutMode = 'HORIZONTAL'
        cell.fills = []
        cell.primaryAxisSizingMode = 'FILL'
        cell.counterAxisSizingMode = 'AUTO'
        cell.layoutGrow = weights[i]
        cell.appendChild(
          mkText(cells[i], {
            style: header ? 'Semi Bold' : 'Medium',
            size: header ? 12 : 14,
            hex: header ? TEXT_SECONDARY : TEXT_PRIMARY,
            letterSpacing: header ? { unit: 'PERCENT', value: 4 } : undefined,
            textCase: header ? 'UPPER' : undefined,
          }),
        )
        r.appendChild(cell)
      }
      return r
    }

    var headers = ['Nome', 'Stato', 'Fonte', 'Data', 'Azioni']
    var hr = row(headers, true)
    wrap.appendChild(hr)
    hr.layoutSizingHorizontal = 'FILL'
    wrap.appendChild(divider())
    var data = [
      ['Laura Bianchi', 'Trial', 'Meta Ads', '22 apr 2026', '⋯'],
      ['Giuseppe Verdi', 'Nuovo', 'Sito web', '21 apr 2026', '⋯'],
      ['Anna Neri', 'Contattato', 'Referral', '20 apr 2026', '⋯'],
      ['Marco Rossi', 'Convertito', 'Instagram', '18 apr 2026', '⋯'],
    ]
    for (var j = 0; j < data.length; j++) {
      wrap.appendChild(divider())
      var dr = row(data[j], false)
      wrap.appendChild(dr)
      dr.layoutSizingHorizontal = 'FILL'
    }
    return wrap
  }

  function movePhaseSelect() {
    var f = figma.createFrame()
    f.name = 'Select · Sposta fase'
    f.layoutMode = 'HORIZONTAL'
    f.itemSpacing = 6
    f.paddingLeft = 10
    f.paddingRight = 10
    f.paddingTop = 6
    f.paddingBottom = 6
    f.cornerRadius = 10
    f.fills = []
    f.strokes = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 }, opacity: 0.1 }]
    f.strokeWeight = 1
    f.appendChild(mkText('Sposta fase', { style: 'Medium', size: 12, hex: TEXT_SECONDARY }))
    f.appendChild(mkText('▾', { style: 'Regular', size: 10, hex: TEXT_SECONDARY }))
    return f
  }

  async function listaBlockFull() {
    var block = figma.createFrame()
    block.name = 'Tab content · Lista'
    block.layoutMode = 'VERTICAL'
    block.itemSpacing = 16
    block.fills = []
    block.primaryAxisSizingMode = 'AUTO'
    block.counterAxisSizingMode = 'FILL'
    block.layoutAlign = 'STRETCH'
    block.appendChild(fakeSearchSelectRow())
    block.appendChild(tableMock())
    return block
  }

  async function listaBlockLoading(skelSet) {
    var block = figma.createFrame()
    block.name = 'Tab content · Lista (loading)'
    block.layoutMode = 'VERTICAL'
    block.itemSpacing = 16
    block.fills = []
    block.primaryAxisSizingMode = 'AUTO'
    block.counterAxisSizingMode = 'FILL'
    block.layoutAlign = 'STRETCH'
    block.appendChild(fakeSearchSelectRow())
    var sk = variantChild(skelSet, 'Type', 'text-line').createInstance()
    sk.name = 'Skeleton · toolbar placeholder'
    block.appendChild(sk)
    var cardSk = variantChild(skelSet, 'Type', 'card').createInstance()
    block.appendChild(cardSk)
    for (var r = 0; r < 5; r++) {
      block.appendChild(variantChild(skelSet, 'Type', 'list-row').createInstance())
    }
    return block
  }

  async function pipelineBlockFull(metricSet) {
    var wrap = figma.createFrame()
    wrap.name = 'Tab content · Pipeline'
    wrap.layoutMode = 'HORIZONTAL'
    wrap.itemSpacing = 12
    wrap.fills = []
    wrap.primaryAxisSizingMode = 'AUTO'
    wrap.counterAxisSizingMode = 'AUTO'
    wrap.layoutAlign = 'STRETCH'

    var cols = [
      {
        t: 'Nuovo',
        n: '4',
        leads: [
          ['Sofia Conti', 'Nuovo · Web'],
          ['Paolo Ferri', 'Nuovo · IG'],
        ],
      },
      { t: 'Contattato', n: '2', leads: [['Elena Costa', 'Contattato · email']] },
      { t: 'Trial', n: '1', leads: [['Laura Bianchi', 'Trial · Meta']] },
      { t: 'Convertito', n: '1', leads: [['Marco Rossi', 'Cliente · apr']] },
      { t: 'Perso', n: '0', leads: [] },
    ]

    for (var c = 0; c < cols.length; c++) {
      var col = figma.createFrame()
      col.name = 'Col · ' + cols[c].t
      col.layoutMode = 'VERTICAL'
      col.itemSpacing = 10
      col.fills = []
      col.primaryAxisSizingMode = 'FILL'
      col.counterAxisSizingMode = 'AUTO'
      col.layoutGrow = 1

      var head = figma.createFrame()
      head.name = 'column header'
      head.layoutMode = 'HORIZONTAL'
      head.itemSpacing = 10
      head.primaryAxisAlignItems = 'CENTER'
      head.fills = []
      head.primaryAxisSizingMode = 'AUTO'
      head.counterAxisSizingMode = 'AUTO'
      head.layoutAlign = 'STRETCH'
      head.appendChild(mkText(cols[c].t, { style: 'Semi Bold', size: 16, hex: TEXT_PRIMARY }))
      var badge = figma.createFrame()
      badge.layoutMode = 'HORIZONTAL'
      badge.paddingLeft = 8
      badge.paddingRight = 8
      badge.paddingTop = 3
      badge.paddingBottom = 3
      badge.cornerRadius = 999
      badge.fills = [solidPaint('#1A1A1E', 1)]
      badge.strokes = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 }, opacity: 0.1 }]
      badge.strokeWeight = 1
      badge.appendChild(mkText(cols[c].n, { style: 'Semi Bold', size: 11, hex: TEXT_SECONDARY }))
      head.appendChild(badge)

      var scroll = figma.createFrame()
      scroll.name = 'scroll · lead cards'
      scroll.layoutMode = 'VERTICAL'
      scroll.itemSpacing = 8
      scroll.fills = []
      scroll.primaryAxisSizingMode = 'AUTO'
      scroll.counterAxisSizingMode = 'FILL'
      scroll.layoutAlign = 'STRETCH'
      scroll.clipsContent = true

      var compactComp = variantChild(metricSet, 'Variant', 'compact')
      for (var L = 0; L < cols[c].leads.length; L++) {
        var inst = compactComp.createInstance()
        await applyMetricCompactLead(inst, cols[c].leads[L][0], cols[c].leads[L][1])
        scroll.appendChild(inst)
        scroll.appendChild(movePhaseSelect())
      }
      if (cols[c].leads.length === 0) {
        scroll.appendChild(
          mkText('Nessun lead in questa fase', {
            style: 'Regular',
            size: 12,
            hex: TEXT_SECONDARY,
            lineHeight: { unit: 'PIXELS', value: 18 },
          }),
        )
      }

      col.appendChild(head)
      col.appendChild(scroll)
      wrap.appendChild(col)
    }
    return wrap
  }

  function screenShell(name) {
    var f = figma.createFrame()
    f.name = name
    f.layoutMode = 'VERTICAL'
    f.itemSpacing = 24
    f.paddingLeft = 32
    f.paddingRight = 32
    f.paddingTop = 32
    f.paddingBottom = 32
    f.resize(1440, 1)
    f.primaryAxisSizingMode = 'AUTO'
    f.counterAxisSizingMode = 'FIXED'
    f.fills = []
    f.layoutGrids = [
      {
        pattern: 'COLUMNS',
        alignment: 'MIN',
        gutterSize: 16,
        count: 12,
        sectionSize: 96,
        offset: 32,
        visible: true,
        color: { r: 1, g: 1, b: 1, a: 0.06 },
      },
    ]
    return f
  }

  async function run() {
    await loadFonts()

    var pageNames = ['02_05__Components_Patterns_Screens', '02_Components']
    var targetPage = null
    for (var p = 0; p < pageNames.length; p++) {
      var pg = figma.root.children.find(function (x) {
        return x.name === pageNames[p]
      })
      if (pg) {
        targetPage = pg
        break
      }
    }
    if (!targetPage) {
      throw new Error('Pagina non trovata: crea o rinomina una pagina in ' + pageNames.join(', '))
    }
    await figma.setCurrentPageAsync(targetPage)

    var phComp = findComponentAcrossRoot('PageHeader')
    var metricSet = findSetAcrossRoot('MetricCard')
    var emptySet = findSetAcrossRoot('EmptyState')
    var skelSet = findSetAcrossRoot('Skeleton')
    if (!phComp || !metricSet || !emptySet || !skelSet) {
      throw new Error(
        'Mancano componenti Fase 3. Esegui prima il plugin "22Club DS — Phase 3 Components" su questo file.',
      )
    }

    var old = targetPage.findOne(function (n) {
      return n.name === 'SCREEN · Marketing Leads Pipeline'
    })
    if (old) old.remove()

    var root = figma.createFrame()
    root.name = 'SCREEN · Marketing Leads Pipeline'
    root.layoutMode = 'VERTICAL'
    root.itemSpacing = 48
    root.fills = []
    root.primaryAxisSizingMode = 'AUTO'
    root.counterAxisSizingMode = 'AUTO'

    var maxX = 0
    for (var k = 0; k < targetPage.children.length; k++) {
      var ch = targetPage.children[k]
      if (ch !== root && ch.x + ch.width > maxX) maxX = ch.x + ch.width
    }
    root.x = maxX + 80
    root.y = 0

    /** --- Variant loading --- */
    var vLoad = screenShell('Variant · loading')
    var h1 = phComp.createInstance()
    await applyPageHeader(
      h1,
      'Lead Pipeline',
      'Gestisci e monitora i lead marketing',
      'Esporta',
      'Nuovo lead',
    )
    vLoad.appendChild(h1)
    h1.layoutAlign = 'STRETCH'
    h1.layoutSizingHorizontal = 'FILL'
    vLoad.appendChild(tabBar(0))
    var lb0 = await listaBlockLoading(skelSet)
    vLoad.appendChild(lb0)
    lb0.layoutSizingHorizontal = 'FILL'
    root.appendChild(vLoad)

    /** --- Variant empty --- */
    var vEmpty = screenShell('Variant · empty')
    var h2 = phComp.createInstance()
    await applyPageHeader(
      h2,
      'Lead Pipeline',
      'Gestisci e monitora i lead marketing',
      'Esporta',
      'Nuovo lead',
    )
    vEmpty.appendChild(h2)
    h2.layoutAlign = 'STRETCH'
    h2.layoutSizingHorizontal = 'FILL'
    vEmpty.appendChild(tabBar(0))
    var emptyBody = figma.createFrame()
    emptyBody.name = 'Tab content · Lista (empty)'
    emptyBody.layoutMode = 'VERTICAL'
    emptyBody.itemSpacing = 16
    emptyBody.fills = []
    emptyBody.primaryAxisSizingMode = 'AUTO'
    emptyBody.counterAxisSizingMode = 'FILL'
    emptyBody.layoutAlign = 'STRETCH'
    emptyBody.appendChild(fakeSearchSelectRow())
    var es = variantChild(emptySet, 'Style', 'centered').createInstance()
    emptyBody.appendChild(es)
    vEmpty.appendChild(emptyBody)
    emptyBody.layoutSizingHorizontal = 'FILL'
    root.appendChild(vEmpty)

    /** --- Variant full --- */
    var vFull = screenShell('Variant · full')
    var h3 = phComp.createInstance()
    await applyPageHeader(
      h3,
      'Lead Pipeline',
      'Gestisci e monitora i lead marketing',
      'Esporta',
      'Nuovo lead',
    )
    vFull.appendChild(h3)
    h3.layoutAlign = 'STRETCH'
    h3.layoutSizingHorizontal = 'FILL'
    vFull.appendChild(tabBar(0))
    var lbF = await listaBlockFull()
    vFull.appendChild(lbF)
    lbF.layoutSizingHorizontal = 'FILL'
    vFull.appendChild(tabBar(1))
    var pbF = await pipelineBlockFull(metricSet)
    vFull.appendChild(pbF)
    pbF.layoutSizingHorizontal = 'FILL'
    root.appendChild(vFull)

    targetPage.appendChild(root)
    figma.viewport.scrollAndZoomIntoView([root])
    figma.notify('Creato: SCREEN · Marketing Leads Pipeline (loading, empty, full).')
  }
})()
