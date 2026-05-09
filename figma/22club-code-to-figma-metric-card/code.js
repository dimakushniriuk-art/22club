/**
 * 22Club Code → Figma — MetricCard (step 1)
 * Importa JSON con `type: "MetricCard"` (vedi `examples/metric-card.json`).
 * Crea un frame strutturato su canvas (auto-layout); non sostituisce istanze DS.
 */
;(function () {
  var TONE_HEX = {
    teal: '#2DD4BF',
    emerald: '#34D399',
    amber: '#FBBF24',
    blue: '#60A5FA',
    purple: '#C084FC',
    neutral: '#9CA3AF',
    danger: '#F87171',
  }

  var STATUS_HEX = {
    success: '#4ADE80',
    warning: '#FACC15',
    error: '#F87171',
    info: '#60A5FA',
  }

  function solidPaint(hex, opacity) {
    var h = String(hex).replace('#', '')
    var r = parseInt(h.slice(0, 2), 16) / 255
    var g = parseInt(h.slice(2, 4), 16) / 255
    var b = parseInt(h.slice(4, 6), 16) / 255
    return {
      type: 'SOLID',
      color: { r: r, g: g, b: b },
      opacity: opacity === undefined ? 1 : opacity,
    }
  }

  function showImporter() {
    var html = [
      '<!DOCTYPE html><html><head><meta charset="utf-8">',
      '<style>',
      'body{font:12px/1.4 system-ui;margin:0;padding:10px;background:#111;color:#e5e5e5;}',
      'label{display:block;margin-bottom:4px;color:#a3a3a3;}',
      'textarea{width:100%;height:160px;box-sizing:border-box;background:#1a1a1a;color:#fafafa;border:1px solid #333;border-radius:6px;padding:8px;font:12px/1.4 ui-monospace,Menlo,monospace;resize:vertical;}',
      'button{margin-top:8px;width:100%;padding:8px 10px;border-radius:6px;border:0;background:#0d9488;color:#fff;font-weight:600;cursor:pointer;}',
      'button:hover{background:#0f766e;}',
      'p.hint{margin:0 0 8px 0;color:#737373;font-size:11px;}',
      '</style></head><body>',
      '<p class="hint">Incolla JSON MetricCard (campo <code>type</code> = "MetricCard"). Esempio: <code>examples/metric-card.json</code>.</p>',
      '<label for="j">JSON</label>',
      '<textarea id="j" placeholder="{ &quot;type&quot;: &quot;MetricCard&quot;, ... }"></textarea>',
      '<button id="b">Crea frame su canvas</button>',
      '<script>',
      "var b=document.getElementById('b');var t=document.getElementById('j');",
      "b.onclick=function(){parent.postMessage({pluginMessage:{kind:'import',raw:t.value}},'*');};",
      '</script></body></html>',
    ].join('')
    figma.showUI(html, { width: 360, height: 280, themeColors: true })
  }

  function parseOneCard(data) {
    if (!data || data.type !== 'MetricCard') {
      throw new Error('JSON non valido: atteso type "MetricCard".')
    }
    return {
      name: data.name != null ? String(data.name) : '',
      title: data.title != null ? String(data.title) : '',
      value: data.value != null ? String(data.value) : '',
      subtitle: data.subtitle != null ? String(data.subtitle) : '',
      variant: data.variant != null ? String(data.variant) : 'default',
      tone: data.tone != null ? String(data.tone) : 'blue',
      status: data.status != null ? String(data.status) : '',
      statusText: data.statusText != null ? String(data.statusText) : '',
      icon: data.icon != null ? String(data.icon) : '',
      loading: Boolean(data.loading),
    }
  }

  function parsePayload(raw) {
    var data = typeof raw === 'string' ? JSON.parse(raw) : raw
    if (Array.isArray(data)) {
      if (data.length === 0) {
        throw new Error('JSON non valido: array vuoto.')
      }
      return data.map(parseOneCard)
    }
    return [parseOneCard(data)]
  }

  function mkText(content, opts) {
    var t = figma.createText()
    t.fontName = { family: 'Inter', style: opts.style || 'Regular' }
    t.fontSize = opts.size != null ? opts.size : 13
    t.fills = [solidPaint(opts.hex || '#E5E5E5', opts.opacity)]
    t.lineHeight = opts.lineHeight || { unit: 'AUTO' }
    t.characters = content
    t.textAutoResize = 'WIDTH_AND_HEIGHT'
    if (opts.opacityText != null) t.opacity = opts.opacityText
    return t
  }

  function buildFrame(model) {
    var toneHex = TONE_HEX[model.tone] || TONE_HEX.blue
    var isCompact = model.variant === 'compact'
    var pad = isCompact ? 12 : 16
    var gap = isCompact ? 6 : 10

    var root = figma.createFrame()
    root.name = model.name || model.title || 'MetricCard'
    root.layoutMode = 'VERTICAL'
    root.primaryAxisSizingMode = 'AUTO'
    root.counterAxisSizingMode = 'FIXED'
    root.resize(280, root.height)
    root.paddingLeft = root.paddingRight = root.paddingTop = root.paddingBottom = pad
    root.itemSpacing = gap
    root.cornerRadius = 12
    root.fills = [solidPaint('#0A0A0A', 1)]
    root.strokes = [solidPaint(toneHex, 0.35)]
    root.strokeWeight = 1

    if (model.loading) {
      var sk = figma.createFrame()
      sk.name = 'state · loading'
      sk.layoutMode = 'VERTICAL'
      sk.itemSpacing = 8
      sk.fills = []
      sk.primaryAxisSizingMode = 'AUTO'
      sk.counterAxisSizingMode = 'AUTO'
      var bar1 = figma.createRectangle()
      bar1.resize(180, isCompact ? 10 : 12)
      bar1.cornerRadius = 4
      bar1.fills = [solidPaint('#FFFFFF', 0.12)]
      var row = figma.createFrame()
      row.layoutMode = 'HORIZONTAL'
      row.primaryAxisSizingMode = 'FIXED'
      row.counterAxisSizingMode = 'AUTO'
      row.resize(256, 0)
      row.primaryAxisAlignItems = 'SPACE_BETWEEN'
      row.fills = []
      var bar2 = figma.createRectangle()
      bar2.resize(isCompact ? 56 : 80, isCompact ? 22 : 32)
      bar2.cornerRadius = 4
      bar2.fills = [solidPaint('#FFFFFF', 0.12)]
      var ico = figma.createEllipse()
      ico.resize(isCompact ? 28 : 40, isCompact ? 28 : 40)
      ico.fills = [solidPaint('#FFFFFF', 0.1)]
      row.appendChild(bar2)
      row.appendChild(ico)
      sk.appendChild(bar1)
      sk.appendChild(row)
      root.appendChild(sk)
      return root
    }

    var top = figma.createFrame()
    top.name = 'row · title + status'
    top.layoutMode = 'HORIZONTAL'
    top.primaryAxisSizingMode = 'FIXED'
    top.counterAxisSizingMode = 'AUTO'
    top.resize(256, 0)
    top.primaryAxisAlignItems = 'MIN'
    top.counterAxisAlignItems = 'MIN'
    top.itemSpacing = 8
    top.fills = []

    var title = mkText(model.title || '—', {
      style: 'Medium',
      size: isCompact ? 11 : 13,
      hex: '#A3A3A3',
    })
    title.name = 'text · title'
    top.appendChild(title)

    if (model.status && model.statusText) {
      title.layoutGrow = 1
      title.textAutoResize = 'HEIGHT'
      title.textTruncation = 'ENDING'
      var badge = figma.createFrame()
      badge.name = 'badge · ' + model.status
      badge.layoutMode = 'HORIZONTAL'
      badge.paddingLeft = badge.paddingRight = 10
      badge.paddingTop = badge.paddingBottom = 4
      badge.itemSpacing = 0
      badge.cornerRadius = 999
      var st = STATUS_HEX[model.status] || STATUS_HEX.info
      badge.fills = [solidPaint(st, 0.18)]
      badge.strokes = [solidPaint(st, 0.35)]
      badge.strokeWeight = 1
      var bt = mkText(model.statusText, { style: 'Medium', size: 11, hex: '#FAFAFA' })
      bt.name = 'text · statusText'
      badge.appendChild(bt)
      top.appendChild(badge)
    } else {
      var spacer = figma.createFrame()
      spacer.name = 'spacer'
      spacer.layoutGrow = 1
      spacer.fills = []
      spacer.resize(1, 1)
      top.appendChild(spacer)
    }

    var mid = figma.createFrame()
    mid.name = 'row · value + icon'
    mid.layoutMode = 'HORIZONTAL'
    mid.primaryAxisSizingMode = 'FIXED'
    mid.counterAxisSizingMode = 'AUTO'
    mid.resize(256, 0)
    mid.primaryAxisAlignItems = 'SPACE_BETWEEN'
    mid.counterAxisAlignItems = 'CENTER'
    mid.fills = []

    var val = mkText(model.value, {
      style: 'Semi Bold',
      size: isCompact ? 18 : 24,
      hex: '#FAFAFA',
    })
    val.name = 'text · value'
    mid.appendChild(val)

    var iconWrap = figma.createFrame()
    iconWrap.name = 'icon · ' + (model.icon || 'none')
    iconWrap.layoutMode = 'HORIZONTAL'
    iconWrap.primaryAxisAlignItems = 'CENTER'
    iconWrap.counterAxisAlignItems = 'CENTER'
    iconWrap.paddingLeft =
      iconWrap.paddingRight =
      iconWrap.paddingTop =
      iconWrap.paddingBottom =
        isCompact ? 6 : 12
    iconWrap.cornerRadius = 999
    iconWrap.fills = [solidPaint(toneHex, 0.2)]
    var iconLabel = mkText(model.icon || '·', {
      style: 'Semi Bold',
      size: isCompact ? 10 : 12,
      hex: '#FAFAFA',
    })
    iconLabel.name = 'text · iconName'
    iconWrap.appendChild(iconLabel)
    mid.appendChild(iconWrap)

    root.appendChild(top)
    root.appendChild(mid)

    if (model.subtitle) {
      var sub = mkText(model.subtitle, {
        style: 'Regular',
        size: 11,
        hex: '#737373',
      })
      sub.name = 'text · subtitle'
      root.appendChild(sub)
    }

    return root
  }

  function findExistingExportFrame() {
    var children = figma.currentPage.children || []
    for (var i = 0; i < children.length; i += 1) {
      var node = children[i]
      if (node.type === 'FRAME' && node.name === 'EXPORT · MetricCard') {
        return node
      }
    }
    return null
  }

  function buildExportFrame(models) {
    var root = figma.createFrame()
    root.name = 'EXPORT · MetricCard'
    root.layoutMode = 'HORIZONTAL'
    root.primaryAxisSizingMode = 'AUTO'
    root.counterAxisSizingMode = 'AUTO'
    root.layoutWrap = 'WRAP'
    root.itemSpacing = 16
    root.counterAxisSpacing = 16
    root.paddingLeft = root.paddingRight = root.paddingTop = root.paddingBottom = 16
    root.fills = [solidPaint('#111111', 0.35)]
    root.cornerRadius = 16

    for (var i = 0; i < models.length; i += 1) {
      root.appendChild(buildFrame(models[i]))
    }

    return root
  }

  figma.on('run', function () {
    showImporter()
  })

  figma.ui.onmessage = function (msg) {
    if (!msg || msg.kind !== 'import') return
    var raw = msg.raw
    if (!raw || !String(raw).trim()) {
      figma.notify('Incolla il JSON MetricCard.')
      return
    }
    figma
      .loadFontAsync({ family: 'Inter', style: 'Regular' })
      .then(function () {
        return figma.loadFontAsync({ family: 'Inter', style: 'Medium' })
      })
      .then(function () {
        return figma.loadFontAsync({ family: 'Inter', style: 'Semi Bold' })
      })
      .then(function () {
        var models = parsePayload(raw)
        var existing = findExistingExportFrame()
        if (existing) existing.remove()
        var node = buildExportFrame(models)
        figma.currentPage.appendChild(node)
        node.x = figma.viewport.center.x - node.width / 2
        node.y = figma.viewport.center.y - node.height / 2
        figma.currentPage.selection = [node]
        figma.viewport.scrollAndZoomIntoView([node])
        figma.notify('MetricCard importata: ' + models.length + ' card')
      })
      .catch(function (e) {
        figma.notify('Errore: ' + (e && e.message ? e.message : String(e)))
      })
  }
})()
