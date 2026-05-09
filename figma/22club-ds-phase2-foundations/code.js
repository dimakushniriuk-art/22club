/**
 * 22Club Design System — Phase 2 Foundations
 * Run on the target file (page will be renamed "01_Foundations").
 * Re-run safe: removes previous "DS · Phase 2 — Foundations" root frame only.
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

  figma.on('run', function () {
    run().then(
      function () {
        figma.closePlugin()
      },
      function (e) {
        figma.notify('22Club DS: ' + (e && e.message ? e.message : String(e)))
        figma.closePlugin()
      },
    )
  })

  async function run() {
    await figma.loadFontAsync({ family: 'Inter', style: 'Regular' })
    await figma.loadFontAsync({ family: 'Inter', style: 'Medium' })
    await figma.loadFontAsync({ family: 'Inter', style: 'Semi Bold' })

    var page = figma.currentPage
    page.name = '01_Foundations'

    var prev = page.findOne(function (n) {
      return n.name === 'DS · Phase 2 — Foundations'
    })
    if (prev) prev.remove()

    function mkText(content, opts) {
      var t = figma.createText()
      t.fontName = { family: 'Inter', style: opts.style || 'Regular' }
      t.fontSize = opts.size || 14
      t.fills = [solidPaint(opts.hex || '#FFFFFF', opts.opacity !== undefined ? opts.opacity : 1)]
      if (opts.textCase) t.textCase = opts.textCase
      if (opts.letterSpacing) t.letterSpacing = opts.letterSpacing
      t.lineHeight = opts.lineHeight || { unit: 'AUTO' }
      t.characters = content
      t.textAutoResize = 'WIDTH_AND_HEIGHT'
      return t
    }

    function sectionTitle(label) {
      return mkText(label, {
        style: 'Semi Bold',
        size: 11,
        hex: '#FFFFFF',
        opacity: 0.45,
        textCase: 'UPPER',
        letterSpacing: { unit: 'PERCENT', value: 6 },
      })
    }

    function swatchRow(token, hex, note) {
      var row = figma.createFrame()
      row.name = 'swatch / ' + token
      row.layoutMode = 'HORIZONTAL'
      row.primaryAxisAlignItems = 'CENTER'
      row.counterAxisAlignItems = 'CENTER'
      row.itemSpacing = 16
      row.fills = []
      row.primaryAxisSizingMode = 'AUTO'
      row.counterAxisSizingMode = 'AUTO'
      var box = figma.createRectangle()
      box.name = token + ' — chip'
      box.resize(104, 72)
      box.cornerRadius = 8
      box.fills = [solidPaint(hex)]
      row.appendChild(box)
      var col = figma.createFrame()
      col.layoutMode = 'VERTICAL'
      col.itemSpacing = 4
      col.fills = []
      col.primaryAxisSizingMode = 'AUTO'
      col.counterAxisSizingMode = 'AUTO'
      col.appendChild(mkText(token, { style: 'Semi Bold', size: 13, hex: '#FFFFFF' }))
      col.appendChild(
        mkText(hex + (note ? ' · ' + note : ''), {
          style: 'Regular',
          size: 12,
          hex: '#FFFFFF',
          opacity: 0.55,
        }),
      )
      row.appendChild(col)
      return row
    }

    function swatchRowBorder(token, strokeOpacity, hexLabel) {
      var row = figma.createFrame()
      row.name = 'swatch / ' + token
      row.layoutMode = 'HORIZONTAL'
      row.itemSpacing = 16
      row.fills = []
      row.primaryAxisSizingMode = 'AUTO'
      row.counterAxisSizingMode = 'AUTO'
      var box = figma.createFrame()
      box.name = token
      box.resize(104, 72)
      box.cornerRadius = 8
      box.fills = [solidPaint('#0A0A0A')]
      box.strokes = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 }, opacity: strokeOpacity }]
      box.strokeWeight = 1
      row.appendChild(box)
      var col = figma.createFrame()
      col.layoutMode = 'VERTICAL'
      col.itemSpacing = 4
      col.fills = []
      col.primaryAxisSizingMode = 'AUTO'
      col.counterAxisSizingMode = 'AUTO'
      col.appendChild(mkText(token, { style: 'Semi Bold', size: 13, hex: '#FFFFFF' }))
      col.appendChild(
        mkText(hexLabel, { style: 'Regular', size: 12, hex: '#FFFFFF', opacity: 0.55 }),
      )
      row.appendChild(col)
      return row
    }

    function swatchRowText(token, textOpacity, hexLabel) {
      var row = figma.createFrame()
      row.name = 'swatch / ' + token
      row.layoutMode = 'HORIZONTAL'
      row.itemSpacing = 16
      row.fills = []
      row.primaryAxisSizingMode = 'AUTO'
      row.counterAxisSizingMode = 'AUTO'
      var box = figma.createFrame()
      box.resize(104, 72)
      box.cornerRadius = 8
      box.fills = [solidPaint('#111111')]
      box.layoutMode = 'VERTICAL'
      box.primaryAxisAlignItems = 'CENTER'
      box.counterAxisAlignItems = 'CENTER'
      box.appendChild(
        mkText('Aa', { style: 'Semi Bold', size: 22, hex: '#FFFFFF', opacity: textOpacity }),
      )
      row.appendChild(box)
      var col = figma.createFrame()
      col.layoutMode = 'VERTICAL'
      col.itemSpacing = 4
      col.fills = []
      col.primaryAxisSizingMode = 'AUTO'
      col.counterAxisSizingMode = 'AUTO'
      col.appendChild(mkText(token, { style: 'Semi Bold', size: 13, hex: '#FFFFFF' }))
      col.appendChild(
        mkText(hexLabel, { style: 'Regular', size: 12, hex: '#FFFFFF', opacity: 0.55 }),
      )
      row.appendChild(col)
      return row
    }

    function rowGroupHorizontal(items) {
      var g = figma.createFrame()
      g.name = 'row-group'
      g.layoutMode = 'HORIZONTAL'
      g.itemSpacing = 20
      g.fills = []
      g.primaryAxisSizingMode = 'AUTO'
      g.counterAxisSizingMode = 'AUTO'
      for (var i = 0; i < items.length; i++) g.appendChild(items[i])
      return g
    }

    function addColorBlock(frame, title, rows) {
      var block = figma.createFrame()
      block.name = 'block / ' + title
      block.layoutMode = 'VERTICAL'
      block.itemSpacing = 12
      block.fills = []
      block.primaryAxisSizingMode = 'AUTO'
      block.counterAxisSizingMode = 'AUTO'
      block.appendChild(sectionTitle(title))
      for (var r = 0; r < rows.length; r++) block.appendChild(rows[r])
      frame.appendChild(block)
    }

    function buildColorsFrame() {
      var colorsFrame = figma.createFrame()
      colorsFrame.name = 'COLORS'
      colorsFrame.layoutMode = 'VERTICAL'
      colorsFrame.itemSpacing = 24
      colorsFrame.paddingLeft = 40
      colorsFrame.paddingRight = 40
      colorsFrame.paddingTop = 36
      colorsFrame.paddingBottom = 40
      colorsFrame.fills = [solidPaint('#000000')]
      colorsFrame.strokes = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 }, opacity: 0.08 }]
      colorsFrame.strokeWeight = 1
      colorsFrame.cornerRadius = 16
      colorsFrame.primaryAxisSizingMode = 'AUTO'
      colorsFrame.counterAxisSizingMode = 'FIXED'
      colorsFrame.resize(1120, 100)

      colorsFrame.appendChild(mkText('COLORS', { style: 'Semi Bold', size: 28, hex: '#FFFFFF' }))
      colorsFrame.appendChild(
        mkText('22Club · zinc / nero / white @ opacity (allineato al codice)', {
          style: 'Regular',
          size: 13,
          hex: '#FFFFFF',
          opacity: 0.5,
        }),
      )

      var zinc = hexRgb('18181B')
      var gradRect = figma.createRectangle()
      gradRect.name = 'surface-card — gradient chip'
      gradRect.resize(220, 88)
      gradRect.cornerRadius = 12
      gradRect.fills = [
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

      var gradRow = figma.createFrame()
      gradRow.name = 'swatch / surface-card'
      gradRow.layoutMode = 'HORIZONTAL'
      gradRow.itemSpacing = 16
      gradRow.fills = []
      gradRow.primaryAxisSizingMode = 'AUTO'
      gradRow.counterAxisSizingMode = 'AUTO'
      gradRow.appendChild(gradRect)
      var gradCol = figma.createFrame()
      gradCol.layoutMode = 'VERTICAL'
      gradCol.itemSpacing = 4
      gradCol.fills = []
      gradCol.primaryAxisSizingMode = 'AUTO'
      gradCol.counterAxisSizingMode = 'AUTO'
      gradCol.appendChild(mkText('surface-card', { style: 'Semi Bold', size: 13, hex: '#FFFFFF' }))
      gradCol.appendChild(
        mkText('linear-gradient · zinc-900/95 → black/80', {
          style: 'Regular',
          size: 12,
          hex: '#FFFFFF',
          opacity: 0.55,
        }),
      )
      gradRow.appendChild(gradCol)

      addColorBlock(colorsFrame, 'BACKGROUND', [
        rowGroupHorizontal([
          swatchRow('bg-primary', '#000000'),
          swatchRow('bg-secondary', '#0A0A0A'),
          swatchRow('bg-tertiary', '#111111'),
        ]),
      ])
      addColorBlock(colorsFrame, 'SURFACE', [gradRow])
      addColorBlock(colorsFrame, 'BORDER', [
        rowGroupHorizontal([
          swatchRowBorder('border-default', 0.1, 'white / 10%'),
          swatchRowBorder('border-soft', 0.05, 'white / 5%'),
          swatchRowBorder('border-strong', 0.2, 'white / 20%'),
        ]),
      ])
      addColorBlock(colorsFrame, 'TEXT', [
        rowGroupHorizontal([
          swatchRowText('text-primary', 1, 'white'),
          swatchRowText('text-secondary', 0.7, 'white / 70%'),
          swatchRowText('text-muted', 0.5, 'white / 50%'),
        ]),
      ])
      addColorBlock(colorsFrame, 'ACCENT (22Club)', [
        rowGroupHorizontal([
          swatchRow('accent-primary', '#02B3BF'),
          swatchRow('accent-secondary', '#019AA6'),
        ]),
      ])
      addColorBlock(colorsFrame, 'STATE', [
        rowGroupHorizontal([
          swatchRow('success', '#22C55E', 'green-500'),
          swatchRow('warning', '#EAB308', 'yellow-500'),
          swatchRow('error', '#EF4444', 'red-500'),
        ]),
      ])

      colorsFrame.resize(1120, colorsFrame.height)
      return colorsFrame
    }

    function buildTypographyFrame() {
      var f = figma.createFrame()
      f.name = 'TYPOGRAPHY'
      f.layoutMode = 'VERTICAL'
      f.itemSpacing = 20
      f.paddingLeft = 40
      f.paddingRight = 40
      f.paddingTop = 36
      f.paddingBottom = 40
      f.fills = [solidPaint('#0A0A0A')]
      f.strokes = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 }, opacity: 0.08 }]
      f.strokeWeight = 1
      f.cornerRadius = 16
      f.primaryAxisSizingMode = 'AUTO'
      f.counterAxisSizingMode = 'FIXED'
      f.resize(1120, 80)

      f.appendChild(mkText('TYPOGRAPHY', { style: 'Semi Bold', size: 28, hex: '#FFFFFF' }))
      f.appendChild(
        mkText('Inter (fallback ideale: SF Pro su Apple)', {
          style: 'Regular',
          size: 13,
          hex: '#FFFFFF',
          opacity: 0.5,
        }),
      )

      function typeRow(name, sample, o) {
        var row = figma.createFrame()
        row.name = 'type / ' + name
        row.layoutMode = 'VERTICAL'
        row.itemSpacing = 6
        row.fills = []
        row.primaryAxisSizingMode = 'AUTO'
        row.counterAxisSizingMode = 'AUTO'
        row.appendChild(
          mkText(name + ' · ' + o.meta, {
            style: 'Medium',
            size: 11,
            hex: '#FFFFFF',
            opacity: 0.45,
            textCase: 'UPPER',
            letterSpacing: { unit: 'PERCENT', value: 5 },
          }),
        )
        var t = mkText(sample, {
          style: o.style,
          size: o.size,
          hex: '#FFFFFF',
          opacity: o.opacity,
          lineHeight: o.lineHeight,
          textCase: o.textCase,
          letterSpacing: o.letterSpacing,
        })
        row.appendChild(t)
        return row
      }

      f.appendChild(
        typeRow('H1', 'Dashboard — oggi', {
          style: 'Semi Bold',
          size: 34,
          meta: '34px · semibold (range 32–36)',
          lineHeight: { unit: 'PIXELS', value: 40 },
        }),
      )
      f.appendChild(
        typeRow('H2', 'Sezione principale', {
          style: 'Semi Bold',
          size: 26,
          meta: '26px · semibold (range 24–28)',
          lineHeight: { unit: 'PIXELS', value: 32 },
        }),
      )
      f.appendChild(
        typeRow('H3', 'Sottotitolo o card title', {
          style: 'Medium',
          size: 19,
          meta: '19px · medium (range 18–20)',
          lineHeight: { unit: 'PIXELS', value: 26 },
        }),
      )
      f.appendChild(
        typeRow('BODY', 'Testo corpo per tabelle, descrizioni e form. Leggibile su fondo scuro.', {
          style: 'Regular',
          size: 15,
          meta: '15px · regular (range 14–16)',
          lineHeight: { unit: 'PIXELS', value: 22 },
        }),
      )
      f.appendChild(
        typeRow('SMALL', 'Note secondarie, timestamp, hint.', {
          style: 'Regular',
          size: 12,
          opacity: 0.7,
          meta: '12px · regular (range 12–13)',
          lineHeight: { unit: 'PIXELS', value: 16 },
        }),
      )
      f.appendChild(
        typeRow('LABEL', 'CAMPO OBBLIGATORIO', {
          style: 'Medium',
          size: 11,
          meta: 'uppercase · tracking +5%',
          textCase: 'UPPER',
          letterSpacing: { unit: 'PERCENT', value: 8 },
          lineHeight: { unit: 'PIXELS', value: 14 },
        }),
      )

      f.resize(1120, f.height)
      return f
    }

    function buildSpacingFrame() {
      var f = figma.createFrame()
      f.name = 'SPACING'
      f.layoutMode = 'VERTICAL'
      f.itemSpacing = 24
      f.paddingLeft = 40
      f.paddingRight = 40
      f.paddingTop = 36
      f.paddingBottom = 40
      f.fills = [solidPaint('#000000')]
      f.strokes = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 }, opacity: 0.08 }]
      f.strokeWeight = 1
      f.cornerRadius = 16
      f.primaryAxisSizingMode = 'AUTO'
      f.counterAxisSizingMode = 'FIXED'
      f.resize(1120, 80)

      f.appendChild(mkText('SPACING', { style: 'Semi Bold', size: 28, hex: '#FFFFFF' }))
      f.appendChild(
        mkText('Scala 4-based (px)', { style: 'Regular', size: 13, hex: '#FFFFFF', opacity: 0.5 }),
      )

      var row = figma.createFrame()
      row.name = 'spacing-scale'
      row.layoutMode = 'HORIZONTAL'
      row.itemSpacing = 24
      row.counterAxisAlignItems = 'END'
      row.fills = []
      row.primaryAxisSizingMode = 'AUTO'
      row.counterAxisSizingMode = 'AUTO'

      var vals = [4, 8, 12, 16, 20, 24, 32, 40]
      for (var i = 0; i < vals.length; i++) {
        var n = vals[i]
        var cell = figma.createFrame()
        cell.name = 'space / ' + n
        cell.layoutMode = 'VERTICAL'
        cell.itemSpacing = 8
        cell.primaryAxisAlignItems = 'CENTER'
        cell.counterAxisAlignItems = 'CENTER'
        cell.fills = []
        cell.primaryAxisSizingMode = 'AUTO'
        cell.counterAxisSizingMode = 'AUTO'
        var sq = figma.createFrame()
        sq.resize(n, n)
        sq.cornerRadius = 2
        sq.fills = [solidPaint('#18181B')]
        sq.strokes = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 }, opacity: 0.12 }]
        sq.strokeWeight = 1
        cell.appendChild(sq)
        cell.appendChild(
          mkText(String(n), { style: 'Semi Bold', size: 11, hex: '#FFFFFF', opacity: 0.55 }),
        )
        row.appendChild(cell)
      }
      f.appendChild(row)
      f.resize(1120, f.height)
      return f
    }

    function buildRadiusFrame() {
      var f = figma.createFrame()
      f.name = 'RADIUS'
      f.layoutMode = 'VERTICAL'
      f.itemSpacing = 24
      f.paddingLeft = 40
      f.paddingRight = 40
      f.paddingTop = 36
      f.paddingBottom = 40
      f.fills = [solidPaint('#0A0A0A')]
      f.strokes = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 }, opacity: 0.08 }]
      f.strokeWeight = 1
      f.cornerRadius = 16
      f.primaryAxisSizingMode = 'AUTO'
      f.counterAxisSizingMode = 'FIXED'
      f.resize(1120, 80)

      f.appendChild(mkText('RADIUS', { style: 'Semi Bold', size: 28, hex: '#FFFFFF' }))
      f.appendChild(
        mkText('Allineato a card · panel · dialog', {
          style: 'Regular',
          size: 13,
          hex: '#FFFFFF',
          opacity: 0.5,
        }),
      )

      var row = figma.createFrame()
      row.layoutMode = 'HORIZONTAL'
      row.itemSpacing = 28
      row.fills = []
      row.primaryAxisSizingMode = 'AUTO'
      row.counterAxisSizingMode = 'AUTO'

      var defs = [
        { name: 'sm', r: 6, use: 'input, chip' },
        { name: 'md', r: 8, use: 'button' },
        { name: 'lg', r: 12, use: 'card' },
        { name: 'xl', r: 16, use: 'panel, dialog' },
      ]
      for (var j = 0; j < defs.length; j++) {
        var d = defs[j]
        var cell = figma.createFrame()
        cell.name = 'radius / ' + d.name
        cell.layoutMode = 'VERTICAL'
        cell.itemSpacing = 10
        cell.primaryAxisAlignItems = 'CENTER'
        cell.counterAxisAlignItems = 'CENTER'
        cell.fills = []
        cell.primaryAxisSizingMode = 'AUTO'
        cell.counterAxisSizingMode = 'AUTO'
        var sq = figma.createFrame()
        sq.resize(88, 88)
        sq.cornerRadius = d.r
        sq.fills = [solidPaint('#111111')]
        sq.strokes = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 }, opacity: 0.1 }]
        sq.strokeWeight = 1
        cell.appendChild(sq)
        cell.appendChild(
          mkText(d.name + ' · ' + d.r + 'px', { style: 'Semi Bold', size: 12, hex: '#FFFFFF' }),
        )
        cell.appendChild(
          mkText(d.use, { style: 'Regular', size: 11, hex: '#FFFFFF', opacity: 0.45 }),
        )
        row.appendChild(cell)
      }
      f.appendChild(row)
      f.resize(1120, f.height)
      return f
    }

    function buildShadowsFrame() {
      var f = figma.createFrame()
      f.name = 'SHADOWS'
      f.layoutMode = 'VERTICAL'
      f.itemSpacing = 24
      f.paddingLeft = 40
      f.paddingRight = 40
      f.paddingTop = 36
      f.paddingBottom = 40
      f.fills = [solidPaint('#000000')]
      f.strokes = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 }, opacity: 0.08 }]
      f.strokeWeight = 1
      f.cornerRadius = 16
      f.primaryAxisSizingMode = 'AUTO'
      f.counterAxisSizingMode = 'FIXED'
      f.resize(1120, 80)

      f.appendChild(mkText('SHADOWS', { style: 'Semi Bold', size: 28, hex: '#FFFFFF' }))
      f.appendChild(
        mkText('Soft · moderno · no drop pesanti', {
          style: 'Regular',
          size: 13,
          hex: '#FFFFFF',
          opacity: 0.5,
        }),
      )

      var row = figma.createFrame()
      row.layoutMode = 'HORIZONTAL'
      row.itemSpacing = 32
      row.fills = []
      row.primaryAxisSizingMode = 'AUTO'
      row.counterAxisSizingMode = 'AUTO'

      function shadowCard(title, subtitle, effects) {
        var c = figma.createFrame()
        c.name = 'shadow-preview / ' + title
        c.layoutMode = 'VERTICAL'
        c.itemSpacing = 10
        c.paddingLeft = 20
        c.paddingRight = 20
        c.paddingTop = 16
        c.paddingBottom = 16
        c.resize(240, 120)
        c.cornerRadius = 12
        c.fills = [solidPaint('#111111')]
        c.strokes = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 }, opacity: 0.08 }]
        c.strokeWeight = 1
        c.effects = effects
        c.appendChild(mkText(title, { style: 'Semi Bold', size: 14, hex: '#FFFFFF' }))
        c.appendChild(
          mkText(subtitle, { style: 'Regular', size: 11, hex: '#FFFFFF', opacity: 0.5 }),
        )
        return c
      }

      row.appendChild(shadowCard('CARD SHADOW', 'quasi invisibile', shadowEffects(3, 14, 0.22)))
      row.appendChild(
        shadowCard('PANEL SHADOW', 'leggermente più profondo', shadowEffects(8, 28, 0.32)),
      )
      row.appendChild(shadowCard('DIALOG SHADOW', 'depth evidente', shadowEffects(18, 48, 0.48)))
      f.appendChild(row)
      f.resize(1120, f.height)
      return f
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

    function buildSurfaceExamplesFrame() {
      var f = figma.createFrame()
      f.name = 'SURFACE EXAMPLES'
      f.layoutMode = 'VERTICAL'
      f.itemSpacing = 28
      f.paddingLeft = 40
      f.paddingRight = 40
      f.paddingTop = 36
      f.paddingBottom = 44
      f.fills = [solidPaint('#000000')]
      f.strokes = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 }, opacity: 0.08 }]
      f.strokeWeight = 1
      f.cornerRadius = 16
      f.primaryAxisSizingMode = 'AUTO'
      f.counterAxisSizingMode = 'FIXED'
      f.resize(1120, 80)

      f.appendChild(mkText('SURFACE EXAMPLES', { style: 'Semi Bold', size: 28, hex: '#FFFFFF' }))
      f.appendChild(
        mkText('Layering reale: card · panel dashboard · dialog', {
          style: 'Regular',
          size: 13,
          hex: '#FFFFFF',
          opacity: 0.5,
        }),
      )

      var stage = figma.createFrame()
      stage.name = 'examples-stage'
      stage.layoutMode = 'VERTICAL'
      stage.itemSpacing = 24
      stage.paddingLeft = 32
      stage.paddingTop = 32
      stage.paddingRight = 32
      stage.paddingBottom = 32
      stage.resize(1040, 520)
      stage.cornerRadius = 12
      stage.fills = [solidPaint('#0A0A0A')]
      stage.strokes = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 }, opacity: 0.06 }]
      stage.strokeWeight = 1
      stage.primaryAxisSizingMode = 'AUTO'
      stage.counterAxisSizingMode = 'FIXED'

      var card = figma.createFrame()
      card.name = 'preview / Card base'
      card.layoutMode = 'VERTICAL'
      card.itemSpacing = 8
      card.paddingLeft = 20
      card.paddingRight = 20
      card.paddingTop = 16
      card.paddingBottom = 16
      card.resize(320, 140)
      card.cornerRadius = 12
      card.fills = surfaceGradientFill()
      card.strokes = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 }, opacity: 0.1 }]
      card.strokeWeight = 1
      card.effects = shadowEffects(3, 14, 0.22)
      card.appendChild(mkText('Card base', { style: 'Semi Bold', size: 16, hex: '#FFFFFF' }))
      card.appendChild(
        mkText('surface-card + border-default + card shadow', {
          style: 'Regular',
          size: 12,
          hex: '#FFFFFF',
          opacity: 0.5,
        }),
      )

      var panel = figma.createFrame()
      panel.name = 'preview / Panel dashboard'
      panel.layoutMode = 'VERTICAL'
      panel.itemSpacing = 12
      panel.paddingLeft = 24
      panel.paddingRight = 24
      panel.paddingTop = 20
      panel.paddingBottom = 20
      panel.resize(640, 160)
      panel.cornerRadius = 16
      panel.fills = surfaceGradientFill()
      panel.strokes = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 }, opacity: 0.1 }]
      panel.strokeWeight = 1
      panel.effects = shadowEffects(8, 28, 0.32)
      panel.appendChild(mkText('Panel dashboard', { style: 'Semi Bold', size: 18, hex: '#FFFFFF' }))
      panel.appendChild(
        mkText('Contenitore principale: radius xl, panel shadow, contrasto su bg-secondary.', {
          style: 'Regular',
          size: 13,
          hex: '#FFFFFF',
          opacity: 0.65,
          lineHeight: { unit: 'PIXELS', value: 20 },
        }),
      )

      var dialogWrap = figma.createFrame()
      dialogWrap.name = 'preview / Dialog context'
      dialogWrap.layoutMode = 'NONE'
      dialogWrap.resize(1040, 200)
      dialogWrap.fills = []
      var dialog = figma.createFrame()
      dialog.name = 'preview / Dialog'
      dialog.layoutMode = 'VERTICAL'
      dialog.itemSpacing = 12
      dialog.paddingLeft = 24
      dialog.paddingRight = 24
      dialog.paddingTop = 20
      dialog.paddingBottom = 20
      dialog.resize(400, 168)
      dialog.cornerRadius = 16
      dialog.fills = surfaceGradientFill()
      dialog.strokes = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 }, opacity: 0.12 }]
      dialog.strokeWeight = 1
      dialog.effects = shadowEffects(18, 48, 0.48)
      dialog.x = (1040 - 400) / 2
      dialog.y = 16
      dialog.appendChild(mkText('Dialog', { style: 'Semi Bold', size: 17, hex: '#FFFFFF' }))
      dialog.appendChild(
        mkText('Modale: border-strong feel, dialog shadow, stacking sopra il panel.', {
          style: 'Regular',
          size: 12,
          hex: '#FFFFFF',
          opacity: 0.55,
          lineHeight: { unit: 'PIXELS', value: 18 },
        }),
      )
      dialogWrap.appendChild(dialog)

      stage.appendChild(card)
      stage.appendChild(panel)
      stage.appendChild(dialogWrap)
      f.appendChild(stage)
      f.resize(1120, f.height)
      return f
    }

    var root = figma.createFrame()
    root.name = 'DS · Phase 2 — Foundations'
    root.layoutMode = 'VERTICAL'
    root.itemSpacing = 48
    root.paddingLeft = 64
    root.paddingRight = 64
    root.paddingTop = 64
    root.paddingBottom = 96
    root.fills = []
    root.primaryAxisSizingMode = 'AUTO'
    root.counterAxisSizingMode = 'AUTO'

    root.appendChild(buildColorsFrame())
    root.appendChild(buildTypographyFrame())
    root.appendChild(buildSpacingFrame())
    root.appendChild(buildRadiusFrame())
    root.appendChild(buildShadowsFrame())
    root.appendChild(buildSurfaceExamplesFrame())

    page.appendChild(root)
    root.x = 0
    root.y = 0

    figma.notify('22Club Phase 2 foundations inseriti in "01_Foundations".')
  }
})()
