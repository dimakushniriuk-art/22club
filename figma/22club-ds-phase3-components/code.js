/**
 * 22Club Design System — Phase 3 Components (02_Components)
 * Allinea a: src/lib/design-tokens (colori, radius lg card = 16px, spacing 4-based)
 * e a figma/22club-ds-phase2-foundations (surface-card zinc gradient, border-default).
 *
 * Uso: Plugins → Development → 22Club DS — Phase 3 Components (pagina/canvas qualsiasi).
 * Crea o aggiorna la pagina "02_Components" e il frame "DS · Phase 3 — Components".
 * Re-run sicuro: rimuove solo quel frame.
 */
;(function () {
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

  var shadowEffects = function (y, blur, alpha) {
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

  var TEXT_PRIMARY = '#EAF0F2'
  var TEXT_SECONDARY = '#A5AFB4'
  var ACCENT_PRIMARY = '#02B3BF'
  var STATE_SUCCESS = '#00C781'

  figma.on('run', function () {
    run().then(
      function () {
        figma.closePlugin()
      },
      function (e) {
        figma.notify('22Club DS Phase 3: ' + (e && e.message ? e.message : String(e)))
        figma.closePlugin()
      },
    )
  })

  async function run() {
    await figma.loadFontAsync({ family: 'Inter', style: 'Regular' })
    await figma.loadFontAsync({ family: 'Inter', style: 'Medium' })
    await figma.loadFontAsync({ family: 'Inter', style: 'Semi Bold' })

    var page = figma.root.children.find(function (p) {
      return p.name === '02_Components'
    })
    if (!page) {
      page = figma.createPage()
      page.name = '02_Components'
    }
    figma.currentPage = page

    var prev = page.findOne(function (n) {
      return n.name === 'DS · Phase 3 — Components'
    })
    if (prev) prev.remove()

    function mkText(content, opts) {
      var t = figma.createText()
      t.fontName = { family: 'Inter', style: opts.style || 'Regular' }
      t.fontSize = opts.size || 14
      t.fills = [
        solidPaint(opts.hex || TEXT_PRIMARY, opts.opacity !== undefined ? opts.opacity : 1),
      ]
      if (opts.textCase) t.textCase = opts.textCase
      if (opts.letterSpacing) t.letterSpacing = opts.letterSpacing
      t.lineHeight = opts.lineHeight || { unit: 'AUTO' }
      t.characters = content
      t.textAutoResize = 'WIDTH_AND_HEIGHT'
      return t
    }

    function surfaceGradientFill() {
      var zinc = hexRgb('18181B')
      return [
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
    }

    function skeletonGradientFill() {
      var z8 = hexRgb('27272A')
      var z9 = hexRgb('18181B')
      return [
        {
          type: 'GRADIENT_LINEAR',
          gradientStops: [
            { position: 0, color: { r: z8.r, g: z8.g, b: z8.b, a: 0.8 } },
            { position: 1, color: { r: z9.r, g: z9.g, b: z9.b, a: 0.8 } },
          ],
          gradientTransform: [
            [1, 0, 0],
            [0, 1, 0],
          ],
        },
      ]
    }

    function applyCardChrome(frame, shadowY, shadowBlur, shadowA) {
      frame.cornerRadius = 16
      frame.fills = surfaceGradientFill()
      frame.strokes = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 }, opacity: 0.1 }]
      frame.strokeWeight = 1
      frame.effects = shadowEffects(shadowY, shadowBlur, shadowA)
    }

    function skeletonBar(w, h) {
      var r = figma.createRectangle()
      r.name = 'skeleton'
      r.resize(w, h)
      r.cornerRadius = 6
      r.fills = skeletonGradientFill()
      return r
    }

    function metricCardBody(pad, valueSize, showTrend, loading) {
      var f = figma.createFrame()
      f.layoutMode = 'VERTICAL'
      f.itemSpacing = showTrend ? 10 : 8
      f.paddingLeft = pad
      f.paddingRight = pad
      f.paddingTop = pad
      f.paddingBottom = pad
      f.primaryAxisSizingMode = 'AUTO'
      f.counterAxisSizingMode = 'FIXED'
      f.resize(280, 1)
      f.fills = []

      var row = figma.createFrame()
      row.name = 'row / icon + copy'
      row.layoutMode = 'HORIZONTAL'
      row.itemSpacing = 12
      row.primaryAxisAlignItems = 'CENTER'
      row.counterAxisAlignItems = 'CENTER'
      row.fills = []
      row.primaryAxisSizingMode = 'AUTO'
      row.counterAxisSizingMode = 'AUTO'

      var iconSlot = figma.createFrame()
      iconSlot.name = 'slot / icon'
      iconSlot.resize(44, 44)
      iconSlot.cornerRadius = 12
      iconSlot.fills = [solidPaint(ACCENT_PRIMARY, 0.12)]
      iconSlot.strokes = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 }, opacity: 0.08 }]
      iconSlot.strokeWeight = 1
      iconSlot.layoutMode = 'VERTICAL'
      iconSlot.primaryAxisAlignItems = 'CENTER'
      iconSlot.counterAxisAlignItems = 'CENTER'
      iconSlot.appendChild(mkText('◆', { style: 'Semi Bold', size: 18, hex: ACCENT_PRIMARY }))

      var col = figma.createFrame()
      col.name = 'col / title + value'
      col.layoutMode = 'VERTICAL'
      col.itemSpacing = 4
      col.fills = []
      col.primaryAxisSizingMode = 'AUTO'
      col.counterAxisSizingMode = 'AUTO'
      col.appendChild(
        mkText('Titolo metrica', {
          style: 'Medium',
          size: 12,
          hex: TEXT_SECONDARY,
          lineHeight: { unit: 'PIXELS', value: 16 },
        }),
      )
      if (loading) {
        var sk = figma.createFrame()
        sk.layoutMode = 'VERTICAL'
        sk.itemSpacing = 8
        sk.fills = []
        sk.primaryAxisSizingMode = 'AUTO'
        sk.counterAxisSizingMode = 'AUTO'
        var b1 = skeletonBar(200, 14)
        var b2 = skeletonBar(140, 14)
        sk.appendChild(b1)
        sk.appendChild(b2)
        col.appendChild(sk)
      } else {
        col.appendChild(
          mkText('128', {
            style: 'Semi Bold',
            size: valueSize,
            hex: TEXT_PRIMARY,
            lineHeight: { unit: 'PIXELS', value: valueSize + 4 },
          }),
        )
      }
      row.appendChild(iconSlot)
      row.appendChild(col)
      f.appendChild(row)

      if (showTrend && !loading) {
        f.appendChild(
          mkText('↑ +12% vs mese scorso', {
            style: 'Medium',
            size: 12,
            hex: STATE_SUCCESS,
            lineHeight: { unit: 'PIXELS', value: 16 },
          }),
        )
      }
      return f
    }

    function makeMetricCardVariant(variantName, pad, valueSize, showTrend, loading) {
      var c = figma.createComponent()
      c.name = 'Variant=' + variantName
      c.layoutMode = 'VERTICAL'
      c.primaryAxisSizingMode = 'AUTO'
      c.counterAxisSizingMode = 'AUTO'
      c.resize(280, 120)
      applyCardChrome(c, 3, 14, 0.22)
      var body = metricCardBody(pad, valueSize, showTrend, loading)
      c.appendChild(body)
      c.resize(280, c.height)
      return c
    }

    function makeDashboardPanel(state) {
      var c = figma.createComponent()
      c.name = 'State=' + state
      c.layoutMode = 'VERTICAL'
      c.itemSpacing = 0
      c.primaryAxisSizingMode = 'AUTO'
      c.counterAxisSizingMode = 'FIXED'
      c.resize(360, 1)
      applyCardChrome(c, 8, 28, 0.32)

      var header = figma.createFrame()
      header.name = 'header'
      header.layoutMode = 'HORIZONTAL'
      header.itemSpacing = 12
      header.paddingLeft = 20
      header.paddingRight = 20
      header.paddingTop = 16
      header.paddingBottom = 12
      header.primaryAxisAlignItems = 'CENTER'
      header.counterAxisSizingMode = 'FIXED'
      header.resize(360, 1)
      header.fills = []

      var ht = figma.createFrame()
      ht.layoutMode = 'VERTICAL'
      ht.itemSpacing = 2
      ht.fills = []
      ht.primaryAxisSizingMode = 'AUTO'
      ht.counterAxisSizingMode = 'AUTO'
      ht.appendChild(
        mkText('Colonna dashboard', {
          style: 'Semi Bold',
          size: 19,
          hex: TEXT_PRIMARY,
          lineHeight: { unit: 'PIXELS', value: 26 },
        }),
      )
      header.appendChild(ht)

      if (state !== 'loading') {
        var badge = figma.createFrame()
        badge.name = 'badge'
        badge.layoutMode = 'HORIZONTAL'
        badge.paddingLeft = 10
        badge.paddingRight = 10
        badge.paddingTop = 4
        badge.paddingBottom = 4
        badge.itemSpacing = 0
        badge.cornerRadius = 9999
        badge.fills = [solidPaint('#1A1A1E', 1)]
        badge.strokes = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 }, opacity: 0.1 }]
        badge.strokeWeight = 1
        badge.appendChild(
          mkText('3', {
            style: 'Semi Bold',
            size: 11,
            hex: TEXT_SECONDARY,
            letterSpacing: { unit: 'PERCENT', value: 2 },
          }),
        )
        header.appendChild(badge)
      }

      var content = figma.createFrame()
      content.name = 'content'
      content.layoutMode = 'VERTICAL'
      content.itemSpacing = 8
      content.paddingLeft = 20
      content.paddingRight = 20
      content.paddingTop = 16
      content.paddingBottom = 16
      content.primaryAxisSizingMode = 'AUTO'
      content.counterAxisSizingMode = 'FIXED'
      content.resize(360, 1)
      content.fills = []

      if (state === 'default') {
        for (var i = 0; i < 3; i++) {
          var line = figma.createFrame()
          line.name = 'list row'
          line.layoutMode = 'HORIZONTAL'
          line.itemSpacing = 12
          line.primaryAxisAlignItems = 'CENTER'
          line.paddingTop = 8
          line.paddingBottom = 8
          line.fills = []
          line.primaryAxisSizingMode = 'AUTO'
          line.counterAxisSizingMode = 'AUTO'
          line.appendChild(skeletonBar(36, 36))
          var tx = figma.createFrame()
          tx.layoutMode = 'VERTICAL'
          tx.itemSpacing = 4
          tx.fills = []
          tx.primaryAxisSizingMode = 'AUTO'
          tx.counterAxisSizingMode = 'AUTO'
          tx.appendChild(
            mkText('Elemento elenco', { style: 'Medium', size: 14, hex: TEXT_PRIMARY }),
          )
          tx.appendChild(
            mkText('Sottotitolo riga', { style: 'Regular', size: 12, hex: TEXT_SECONDARY }),
          )
          line.appendChild(tx)
          content.appendChild(line)
        }
      } else if (state === 'empty') {
        var emptyInner = figma.createFrame()
        emptyInner.layoutMode = 'VERTICAL'
        emptyInner.itemSpacing = 8
        emptyInner.primaryAxisAlignItems = 'CENTER'
        emptyInner.counterAxisAlignItems = 'CENTER'
        emptyInner.paddingTop = 24
        emptyInner.paddingBottom = 24
        emptyInner.fills = []
        emptyInner.primaryAxisSizingMode = 'AUTO'
        emptyInner.counterAxisSizingMode = 'AUTO'
        emptyInner.appendChild(
          mkText('Nessun elemento', { style: 'Semi Bold', size: 16, hex: TEXT_PRIMARY }),
        )
        emptyInner.appendChild(
          mkText('Aggiungi dati per popolare questa colonna.', {
            style: 'Regular',
            size: 13,
            hex: TEXT_SECONDARY,
            lineHeight: { unit: 'PIXELS', value: 20 },
          }),
        )
        content.appendChild(emptyInner)
      } else {
        content.appendChild(skeletonBar(300, 16))
        content.appendChild(skeletonBar(260, 16))
        content.appendChild(skeletonBar(280, 16))
        content.appendChild(skeletonBar(220, 16))
      }

      c.appendChild(header)
      c.appendChild(hairlineDivider())
      c.appendChild(content)

      var footer = figma.createFrame()
      footer.name = 'footer (optional)'
      footer.layoutMode = 'HORIZONTAL'
      footer.paddingLeft = 20
      footer.paddingRight = 20
      footer.paddingTop = 12
      footer.paddingBottom = 14
      footer.primaryAxisAlignItems = 'CENTER'
      footer.counterAxisSizingMode = 'FIXED'
      footer.resize(360, 1)
      footer.fills = []
      footer.appendChild(
        mkText('Azione secondaria', { style: 'Medium', size: 12, hex: ACCENT_PRIMARY }),
      )
      if (state !== 'loading') {
        c.appendChild(hairlineDivider())
        c.appendChild(footer)
      }

      c.resize(360, c.height)
      return c
    }

    function makeEmptyState(style) {
      var c = figma.createComponent()
      c.name = 'Style=' + style
      c.layoutMode = 'VERTICAL'
      c.itemSpacing = style === 'subtle' ? 10 : 14
      c.paddingLeft = 24
      c.paddingRight = 24
      c.paddingTop = style === 'subtle' ? 20 : 28
      c.paddingBottom = style === 'subtle' ? 20 : 28
      c.primaryAxisAlignItems = 'CENTER'
      c.counterAxisAlignItems = 'CENTER'
      c.primaryAxisSizingMode = 'AUTO'
      c.counterAxisSizingMode = 'FIXED'
      c.resize(320, 1)
      if (style === 'subtle') {
        c.fills = []
        c.strokes = []
      } else {
        applyCardChrome(c, 3, 14, 0.18)
      }

      var iconBg = figma.createEllipse()
      iconBg.name = 'icon wrap'
      iconBg.resize(style === 'subtle' ? 44 : 52, style === 'subtle' ? 44 : 52)
      iconBg.fills = [solidPaint('#1A1A1E', style === 'subtle' ? 0.5 : 1)]
      iconBg.strokes = [
        { type: 'SOLID', color: { r: 1, g: 1, b: 1 }, opacity: style === 'subtle' ? 0.05 : 0.1 },
      ]
      iconBg.strokeWeight = 1

      var stack = figma.createFrame()
      stack.layoutMode = 'VERTICAL'
      stack.itemSpacing = 10
      stack.fills = []
      stack.primaryAxisAlignItems = 'CENTER'
      stack.primaryAxisSizingMode = 'AUTO'
      stack.counterAxisSizingMode = 'AUTO'
      stack.appendChild(iconBg)
      stack.appendChild(
        mkText('Nessun risultato', {
          style: 'Semi Bold',
          size: 18,
          hex: TEXT_PRIMARY,
          lineHeight: { unit: 'PIXELS', value: 24 },
        }),
      )
      stack.appendChild(
        mkText('Prova a cambiare filtri o crea un nuovo elemento.', {
          style: 'Regular',
          size: 13,
          hex: TEXT_SECONDARY,
          lineHeight: { unit: 'PIXELS', value: 20 },
        }),
      )

      var btn = figma.createFrame()
      btn.name = 'slot / primary button'
      btn.layoutMode = 'HORIZONTAL'
      btn.paddingLeft = 16
      btn.paddingRight = 16
      btn.paddingTop = 10
      btn.paddingBottom = 10
      btn.cornerRadius = 12
      btn.fills = [solidPaint(ACCENT_PRIMARY, 1)]
      btn.appendChild(mkText('Nuovo', { style: 'Semi Bold', size: 14, hex: '#0d0d0d' }))
      stack.appendChild(btn)

      c.appendChild(stack)
      c.resize(320, c.height)
      return c
    }

    function makeSkeletonType(type) {
      var c = figma.createComponent()
      c.name = 'Type=' + type
      c.layoutMode = 'VERTICAL'
      c.itemSpacing = 8
      c.fills = []
      c.primaryAxisSizingMode = 'AUTO'
      c.counterAxisSizingMode = 'AUTO'
      if (type === 'text-line') {
        c.appendChild(skeletonBar(240, 12))
      } else if (type === 'card') {
        var card = figma.createFrame()
        card.resize(280, 96)
        card.cornerRadius = 16
        card.fills = skeletonGradientFill()
        card.strokes = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 }, opacity: 0.06 }]
        card.strokeWeight = 1
        c.appendChild(card)
      } else {
        var row = figma.createFrame()
        row.layoutMode = 'HORIZONTAL'
        row.itemSpacing = 12
        row.primaryAxisAlignItems = 'CENTER'
        row.fills = []
        row.primaryAxisSizingMode = 'AUTO'
        row.counterAxisSizingMode = 'AUTO'
        row.appendChild(skeletonBar(40, 40))
        row.appendChild(skeletonBar(200, 12))
        c.appendChild(row)
      }
      return c
    }

    function panelSurface(w) {
      var inner = figma.createFrame()
      inner.layoutMode = 'VERTICAL'
      inner.itemSpacing = 0
      inner.paddingLeft = 24
      inner.paddingRight = 24
      inner.paddingTop = 20
      inner.paddingBottom = 20
      inner.cornerRadius = 16
      inner.resize(w || 440, 1)
      inner.primaryAxisSizingMode = 'AUTO'
      inner.counterAxisSizingMode = 'FIXED'
      inner.fills = surfaceGradientFill()
      inner.strokes = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 }, opacity: 0.12 }]
      inner.strokeWeight = 1
      inner.effects = shadowEffects(18, 48, 0.48)
      return inner
    }

    function hairlineDivider() {
      var wrap = figma.createFrame()
      wrap.name = 'divider'
      wrap.layoutMode = 'VERTICAL'
      wrap.primaryAxisSizingMode = 'AUTO'
      wrap.counterAxisSizingMode = 'FILL'
      wrap.layoutAlign = 'STRETCH'
      wrap.fills = []
      var d = figma.createRectangle()
      d.resize(4, 1)
      d.fills = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 }, opacity: 0.08 }]
      wrap.appendChild(d)
      d.layoutSizingHorizontal = 'FILL'
      return wrap
    }

    function makeDialog() {
      var c = figma.createComponent()
      c.name = 'Dialog'
      c.layoutMode = 'NONE'
      c.resize(520, 320)
      c.fills = []

      var overlay = figma.createRectangle()
      overlay.name = 'overlay'
      overlay.resize(520, 320)
      overlay.fills = [{ type: 'SOLID', color: { r: 0, g: 0, b: 0 }, opacity: 0.55 }]
      overlay.effects = [{ type: 'BACKGROUND_BLUR', radius: 10, visible: true }]

      var panel = panelSurface(440)
      panel.name = 'panel'
      panel.x = Math.round((520 - 440) / 2)
      panel.y = 40

      var head = figma.createFrame()
      head.name = 'header'
      head.layoutMode = 'VERTICAL'
      head.itemSpacing = 6
      head.paddingBottom = 16
      head.fills = []
      head.primaryAxisSizingMode = 'AUTO'
      head.counterAxisSizingMode = 'AUTO'
      head.appendChild(
        mkText('Conferma azione', {
          style: 'Semi Bold',
          size: 18,
          hex: TEXT_PRIMARY,
          lineHeight: { unit: 'PIXELS', value: 24 },
        }),
      )

      var body = figma.createFrame()
      body.name = 'body'
      body.layoutMode = 'VERTICAL'
      body.itemSpacing = 8
      body.paddingTop = 16
      body.paddingBottom = 8
      body.fills = []
      body.primaryAxisSizingMode = 'AUTO'
      body.counterAxisSizingMode = 'AUTO'
      body.appendChild(
        mkText('Il corpo del dialogo usa body 15px e text-secondary per supporto.', {
          style: 'Regular',
          size: 15,
          hex: TEXT_SECONDARY,
          lineHeight: { unit: 'PIXELS', value: 22 },
        }),
      )

      var foot = figma.createFrame()
      foot.name = 'footer'
      foot.layoutMode = 'HORIZONTAL'
      foot.itemSpacing = 12
      foot.primaryAxisAlignItems = 'CENTER'
      foot.paddingTop = 16
      foot.paddingBottom = 4
      foot.fills = []
      foot.appendChild(
        mkText('Annulla', {
          style: 'Medium',
          size: 14,
          hex: TEXT_SECONDARY,
        }),
      )
      foot.appendChild(
        mkText('Conferma', {
          style: 'Semi Bold',
          size: 14,
          hex: ACCENT_PRIMARY,
        }),
      )

      panel.appendChild(head)
      panel.appendChild(hairlineDivider())
      panel.appendChild(body)
      panel.appendChild(hairlineDivider())
      panel.appendChild(foot)
      panel.resize(440, panel.height)

      c.appendChild(overlay)
      c.appendChild(panel)
      return c
    }

    function makeDrawer() {
      var c = figma.createComponent()
      c.name = 'Drawer'
      c.layoutMode = 'NONE'
      c.resize(520, 320)
      c.fills = []

      var overlay = figma.createRectangle()
      overlay.name = 'overlay'
      overlay.resize(520, 320)
      overlay.fills = [{ type: 'SOLID', color: { r: 0, g: 0, b: 0 }, opacity: 0.55 }]
      overlay.effects = [{ type: 'BACKGROUND_BLUR', radius: 10, visible: true }]

      var panel = panelSurface(360)
      panel.name = 'panel (slide da destra)'
      panel.resize(360, 280)
      panel.x = 520 - 360
      panel.y = 20

      var head = figma.createFrame()
      head.layoutMode = 'VERTICAL'
      head.itemSpacing = 4
      head.paddingBottom = 14
      head.fills = []
      head.primaryAxisSizingMode = 'AUTO'
      head.counterAxisSizingMode = 'AUTO'
      head.appendChild(mkText('Drawer', { style: 'Semi Bold', size: 18, hex: TEXT_PRIMARY }))
      head.appendChild(
        mkText('Pannello laterale — stessi token del dialog.', {
          style: 'Regular',
          size: 12,
          hex: TEXT_SECONDARY,
        }),
      )

      var body = figma.createFrame()
      body.layoutMode = 'VERTICAL'
      body.itemSpacing = 10
      body.paddingTop = 16
      body.paddingBottom = 8
      body.fills = []
      body.primaryAxisSizingMode = 'AUTO'
      body.counterAxisSizingMode = 'AUTO'
      body.appendChild(skeletonBar(280, 12))
      body.appendChild(skeletonBar(240, 12))

      var foot = figma.createFrame()
      foot.layoutMode = 'HORIZONTAL'
      foot.itemSpacing = 12
      foot.paddingTop = 16
      foot.fills = []
      foot.appendChild(mkText('Chiudi', { style: 'Medium', size: 14, hex: TEXT_SECONDARY }))

      panel.appendChild(head)
      panel.appendChild(hairlineDivider())
      panel.appendChild(body)
      panel.appendChild(hairlineDivider())
      panel.appendChild(foot)
      panel.resize(360, panel.height)

      c.appendChild(overlay)
      c.appendChild(panel)
      return c
    }

    function makePageHeader() {
      var c = figma.createComponent()
      c.name = 'PageHeader'
      c.layoutMode = 'HORIZONTAL'
      c.itemSpacing = 16
      c.primaryAxisAlignItems = 'CENTER'
      c.paddingLeft = 0
      c.paddingRight = 0
      c.paddingTop = 0
      c.paddingBottom = 0
      c.primaryAxisSizingMode = 'FIXED'
      c.counterAxisSizingMode = 'AUTO'
      c.resize(960, 1)
      c.fills = []

      var left = figma.createFrame()
      left.layoutMode = 'VERTICAL'
      left.itemSpacing = 6
      left.fills = []
      left.primaryAxisSizingMode = 'AUTO'
      left.counterAxisSizingMode = 'AUTO'
      left.appendChild(
        mkText('Titolo pagina', {
          style: 'Semi Bold',
          size: 34,
          hex: TEXT_PRIMARY,
          lineHeight: { unit: 'PIXELS', value: 40 },
        }),
      )
      left.appendChild(
        mkText('Sottotitolo opzionale · staff', {
          style: 'Regular',
          size: 14,
          hex: TEXT_SECONDARY,
          lineHeight: { unit: 'PIXELS', value: 20 },
        }),
      )

      var spacer = figma.createFrame()
      spacer.name = 'spacer'
      spacer.fills = []
      spacer.layoutMode = 'HORIZONTAL'
      spacer.resize(8, 8)

      var actions = figma.createFrame()
      actions.name = 'actions'
      actions.layoutMode = 'HORIZONTAL'
      actions.itemSpacing = 8
      actions.fills = []
      actions.primaryAxisSizingMode = 'AUTO'
      actions.counterAxisSizingMode = 'AUTO'
      var b1 = figma.createFrame()
      b1.layoutMode = 'HORIZONTAL'
      b1.paddingLeft = 14
      b1.paddingRight = 14
      b1.paddingTop = 10
      b1.paddingBottom = 10
      b1.cornerRadius = 12
      b1.fills = []
      b1.strokes = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 }, opacity: 0.1 }]
      b1.strokeWeight = 1
      b1.appendChild(mkText('Secondario', { style: 'Medium', size: 14, hex: TEXT_SECONDARY }))
      var b2 = figma.createFrame()
      b2.layoutMode = 'HORIZONTAL'
      b2.paddingLeft = 16
      b2.paddingRight = 16
      b2.paddingTop = 10
      b2.paddingBottom = 10
      b2.cornerRadius = 12
      b2.fills = [solidPaint(ACCENT_PRIMARY, 1)]
      b2.appendChild(mkText('Primaria', { style: 'Semi Bold', size: 14, hex: '#0d0d0d' }))
      actions.appendChild(b1)
      actions.appendChild(b2)

      c.appendChild(left)
      c.appendChild(spacer)
      c.appendChild(actions)
      c.resize(960, c.height)
      spacer.layoutGrow = 1
      spacer.primaryAxisSizingMode = 'FILL'
      spacer.counterAxisSizingMode = 'AUTO'
      return c
    }

    var root = figma.createFrame()
    root.name = 'DS · Phase 3 — Components'
    root.layoutMode = 'VERTICAL'
    root.itemSpacing = 56
    root.paddingLeft = 64
    root.paddingRight = 64
    root.paddingTop = 56
    root.paddingBottom = 80
    root.fills = []
    root.primaryAxisSizingMode = 'AUTO'
    root.counterAxisSizingMode = 'AUTO'

    var intro = figma.createFrame()
    intro.layoutMode = 'VERTICAL'
    intro.itemSpacing = 8
    intro.fills = []
    intro.primaryAxisSizingMode = 'AUTO'
    intro.counterAxisSizingMode = 'AUTO'
    intro.appendChild(
      mkText('02 — COMPONENTS', {
        style: 'Semi Bold',
        size: 11,
        hex: TEXT_PRIMARY,
        opacity: 0.45,
        textCase: 'UPPER',
        letterSpacing: { unit: 'PERCENT', value: 6 },
      }),
    )
    intro.appendChild(
      mkText('22Club Design System · Fase 3', { style: 'Semi Bold', size: 28, hex: TEXT_PRIMARY }),
    )
    intro.appendChild(
      mkText(
        'Solo token Fase 2 (surface-card, border-default, tipografia Inter, spacing 4-based).',
        {
          style: 'Regular',
          size: 13,
          hex: TEXT_SECONDARY,
          lineHeight: { unit: 'PIXELS', value: 20 },
        },
      ),
    )
    root.appendChild(intro)

    var m1 = makeMetricCardVariant('default', 16, 28, true, false)
    var m2 = makeMetricCardVariant('compact', 12, 22, false, false)
    var m3 = makeMetricCardVariant('loading', 16, 28, false, true)
    var metricSet = figma.combineAsVariants([m1, m2, m3], page)
    metricSet.name = 'MetricCard'
    metricSet.clipsContent = false
    root.appendChild(metricSet)

    var p1 = makeDashboardPanel('default')
    var p2 = makeDashboardPanel('empty')
    var p3 = makeDashboardPanel('loading')
    var panelSet = figma.combineAsVariants([p1, p2, p3], page)
    panelSet.name = 'DashboardColumnPanel'
    panelSet.clipsContent = false
    root.appendChild(panelSet)

    var e1 = makeEmptyState('centered')
    var e2 = makeEmptyState('subtle')
    var emptySet = figma.combineAsVariants([e1, e2], page)
    emptySet.name = 'EmptyState'
    emptySet.clipsContent = false
    root.appendChild(emptySet)

    var s1 = makeSkeletonType('text-line')
    var s2 = makeSkeletonType('card')
    var s3 = makeSkeletonType('list-row')
    var skSet = figma.combineAsVariants([s1, s2, s3], page)
    skSet.name = 'Skeleton'
    skSet.clipsContent = false
    root.appendChild(skSet)

    var dlg = makeDialog()
    root.appendChild(dlg)

    var drw = makeDrawer()
    root.appendChild(drw)

    var ph = makePageHeader()
    root.appendChild(ph)

    page.appendChild(root)
    root.x = 0
    root.y = 0

    figma.notify('22Club Phase 3: pagina "02_Components" aggiornata.')
  }
})()
