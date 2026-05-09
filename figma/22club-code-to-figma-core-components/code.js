/**
 * 22Club Code -> Figma - Core Components exporter (step 4)
 * Supported: DashboardColumnPanel, EmptyState, Skeleton, Dialog, Drawer
 */
;(function () {
  function solidPaint(hex, opacity) {
    var h = String(hex).replace('#', '')
    var r = parseInt(h.slice(0, 2), 16) / 255
    var g = parseInt(h.slice(2, 4), 16) / 255
    var b = parseInt(h.slice(4, 6), 16) / 255
    return { type: 'SOLID', color: { r: r, g: g, b: b }, opacity: opacity == null ? 1 : opacity }
  }

  function loadFonts() {
    return figma
      .loadFontAsync({ family: 'Inter', style: 'Regular' })
      .then(function () {
        return figma.loadFontAsync({ family: 'Inter', style: 'Medium' })
      })
      .then(function () {
        return figma.loadFontAsync({ family: 'Inter', style: 'Semi Bold' })
      })
  }

  function mkText(content, opts) {
    var t = figma.createText()
    t.fontName = { family: 'Inter', style: opts.style || 'Regular' }
    t.fontSize = opts.size == null ? 12 : opts.size
    t.fills = [solidPaint(opts.hex || '#E5E7EB', opts.opacity)]
    t.characters = content == null ? '' : String(content)
    t.textAutoResize = 'WIDTH_AND_HEIGHT'
    return t
  }

  function shellFrame(name) {
    var f = figma.createFrame()
    f.name = name
    f.layoutMode = 'VERTICAL'
    f.primaryAxisSizingMode = 'AUTO'
    f.counterAxisSizingMode = 'FIXED'
    f.resize(360, f.height)
    f.itemSpacing = 10
    f.paddingLeft = f.paddingRight = f.paddingTop = f.paddingBottom = 12
    f.cornerRadius = 12
    f.fills = [solidPaint('#0A0A0A', 1)]
    f.strokes = [solidPaint('#FFFFFF', 0.1)]
    f.strokeWeight = 1
    return f
  }

  function normalize(model) {
    if (!model || typeof model !== 'object') {
      throw new Error('Invalid payload item: expected object.')
    }
    var type = model.type == null ? '' : String(model.type)
    if (!type) throw new Error('Invalid payload item: missing "type".')
    return {
      type: type,
      variant: model.variant == null ? 'default' : String(model.variant),
      title: model.title == null ? '' : String(model.title),
      description: model.description == null ? '' : String(model.description),
      state: model.state == null ? 'default' : String(model.state),
      actions: Array.isArray(model.actions) ? model.actions : [],
      items: Array.isArray(model.items) ? model.items : [],
    }
  }

  function parsePayload(raw) {
    var data = typeof raw === 'string' ? JSON.parse(raw) : raw
    if (Array.isArray(data)) {
      if (data.length === 0) throw new Error('Invalid payload: empty array.')
      return data.map(normalize)
    }
    return [normalize(data)]
  }

  function appendPanelItems(container, items) {
    for (var i = 0; i < items.length; i += 1) {
      var row = figma.createFrame()
      row.name = 'item'
      row.layoutMode = 'HORIZONTAL'
      row.primaryAxisSizingMode = 'FIXED'
      row.counterAxisSizingMode = 'AUTO'
      row.resize(336, 0)
      row.itemSpacing = 8
      row.fills = [solidPaint('#000000', 0.24)]
      row.strokes = [solidPaint('#FFFFFF', 0.06)]
      row.cornerRadius = 8
      row.paddingLeft = row.paddingRight = row.paddingTop = row.paddingBottom = 10
      var label = mkText(String(items[i]), { size: 12, hex: '#F4F4F5' })
      row.appendChild(label)
      container.appendChild(row)
    }
  }

  function buildPanel(model) {
    var root = shellFrame('DashboardColumnPanel')
    var header = figma.createFrame()
    header.name = 'header'
    header.layoutMode = 'HORIZONTAL'
    header.primaryAxisSizingMode = 'FIXED'
    header.counterAxisSizingMode = 'AUTO'
    header.resize(336, 0)
    header.primaryAxisAlignItems = 'SPACE_BETWEEN'
    header.fills = []
    var title = mkText(model.title || 'Panel title', {
      size: 11,
      style: 'Semi Bold',
      hex: '#A1A1AA',
    })
    var badge = mkText(String(model.items.length || 0), {
      size: 10,
      style: 'Semi Bold',
      hex: '#FCA5A5',
    })
    header.appendChild(title)
    header.appendChild(badge)
    root.appendChild(header)

    var body = figma.createFrame()
    body.name = 'body'
    body.layoutMode = 'VERTICAL'
    body.primaryAxisSizingMode = 'AUTO'
    body.counterAxisSizingMode = 'FIXED'
    body.resize(336, 0)
    body.itemSpacing = 8
    body.fills = []
    root.appendChild(body)

    if (model.state === 'loading') {
      for (var i = 0; i < 4; i += 1) {
        var sk = figma.createRectangle()
        sk.name = 'skeleton-row'
        sk.resize(336, 52)
        sk.cornerRadius = 8
        sk.fills = [solidPaint('#27272A', 0.9)]
        body.appendChild(sk)
      }
    } else if (model.state === 'empty') {
      var emptyWrap = figma.createFrame()
      emptyWrap.layoutMode = 'VERTICAL'
      emptyWrap.primaryAxisSizingMode = 'AUTO'
      emptyWrap.counterAxisSizingMode = 'FIXED'
      emptyWrap.resize(336, 0)
      emptyWrap.itemSpacing = 4
      emptyWrap.paddingLeft = emptyWrap.paddingRight = 8
      emptyWrap.paddingTop = emptyWrap.paddingBottom = 20
      emptyWrap.fills = []
      var emptyTitle = mkText(model.title || 'Nessun elemento', { size: 12, hex: '#A1A1AA' })
      emptyWrap.appendChild(emptyTitle)
      body.appendChild(emptyWrap)
    } else {
      appendPanelItems(body, model.items.length ? model.items : ['Elemento 1', 'Elemento 2'])
    }

    return root
  }

  function buildEmptyState(model) {
    var root = shellFrame('EmptyState')
    root.counterAxisSizingMode = 'FIXED'
    root.resize(360, root.height)
    root.itemSpacing = 8

    var icon = figma.createEllipse()
    icon.name = 'icon-wrap'
    icon.resize(48, 48)
    icon.fills = [solidPaint('#FFFFFF', 0.08)]
    root.appendChild(icon)

    root.appendChild(
      mkText(model.title || 'Nessun contenuto disponibile', {
        size: 18,
        style: 'Semi Bold',
        hex: '#FAFAFA',
      }),
    )
    if (model.description) {
      root.appendChild(mkText(model.description, { size: 13, hex: '#A1A1AA' }))
    }
    if (model.actions.length > 0) {
      var action = figma.createFrame()
      action.name = 'action'
      action.layoutMode = 'HORIZONTAL'
      action.primaryAxisSizingMode = 'AUTO'
      action.counterAxisSizingMode = 'AUTO'
      action.paddingLeft = action.paddingRight = 12
      action.paddingTop = action.paddingBottom = 8
      action.cornerRadius = 8
      action.fills = [solidPaint('#0EA5E9', 0.25)]
      action.strokes = [solidPaint('#22D3EE', 0.35)]
      action.appendChild(
        mkText(String(model.actions[0]), { size: 12, style: 'Medium', hex: '#CFFAFE' }),
      )
      root.appendChild(action)
    }
    return root
  }

  function buildSkeleton(model) {
    var root = shellFrame('Skeleton')
    var count = model.items.length > 0 ? model.items.length : 3
    for (var i = 0; i < count; i += 1) {
      var row = figma.createFrame()
      row.name = 'skeleton-item'
      row.layoutMode = 'VERTICAL'
      row.primaryAxisSizingMode = 'AUTO'
      row.counterAxisSizingMode = 'FIXED'
      row.resize(336, 0)
      row.itemSpacing = 8
      row.fills = []
      var barA = figma.createRectangle()
      barA.resize(180, 14)
      barA.cornerRadius = 6
      barA.fills = [solidPaint('#3F3F46', 0.85)]
      var barB = figma.createRectangle()
      barB.resize(260, 12)
      barB.cornerRadius = 6
      barB.fills = [solidPaint('#3F3F46', 0.72)]
      row.appendChild(barA)
      row.appendChild(barB)
      root.appendChild(row)
    }
    return root
  }

  function buildDialog(model) {
    var root = shellFrame('Dialog')
    root.resize(420, root.height)

    var overlay = figma.createRectangle()
    overlay.name = 'overlay'
    overlay.resize(396, 18)
    overlay.cornerRadius = 8
    overlay.fills = [solidPaint('#000000', 0.7)]
    root.appendChild(overlay)

    var panel = figma.createFrame()
    panel.name = 'panel'
    panel.layoutMode = 'VERTICAL'
    panel.primaryAxisSizingMode = 'AUTO'
    panel.counterAxisSizingMode = 'FIXED'
    panel.resize(396, 0)
    panel.paddingLeft = panel.paddingRight = panel.paddingTop = panel.paddingBottom = 16
    panel.itemSpacing = 10
    panel.cornerRadius = 10
    panel.fills = [solidPaint('#111827', 0.95)]
    panel.strokes = [solidPaint('#FFFFFF', 0.1)]

    panel.appendChild(
      mkText(model.title || 'Dialog title', { size: 18, style: 'Semi Bold', hex: '#FAFAFA' }),
    )
    panel.appendChild(
      mkText(model.description || 'Dialog body text', {
        size: 13,
        hex: '#A1A1AA',
      }),
    )

    var footer = figma.createFrame()
    footer.name = 'footer'
    footer.layoutMode = 'HORIZONTAL'
    footer.primaryAxisSizingMode = 'FIXED'
    footer.counterAxisSizingMode = 'AUTO'
    footer.resize(364, 0)
    footer.primaryAxisAlignItems = 'MAX'
    footer.itemSpacing = 8
    footer.fills = []
    var labels = model.actions.length ? model.actions : ['Annulla', 'Conferma']
    for (var i = 0; i < Math.min(labels.length, 2); i += 1) {
      var btn = figma.createFrame()
      btn.layoutMode = 'HORIZONTAL'
      btn.primaryAxisSizingMode = 'AUTO'
      btn.counterAxisSizingMode = 'AUTO'
      btn.paddingLeft = btn.paddingRight = 12
      btn.paddingTop = btn.paddingBottom = 8
      btn.cornerRadius = 8
      btn.fills = [solidPaint(i === 1 ? '#0EA5E9' : '#FFFFFF', i === 1 ? 0.28 : 0.1)]
      btn.strokes = [solidPaint('#FFFFFF', 0.15)]
      btn.appendChild(mkText(String(labels[i]), { size: 12, style: 'Medium', hex: '#FAFAFA' }))
      footer.appendChild(btn)
    }
    panel.appendChild(footer)
    root.appendChild(panel)
    return root
  }

  function buildDrawer(model) {
    var root = shellFrame('Drawer')
    root.resize(460, root.height)

    var shell = figma.createFrame()
    shell.name = 'drawer-panel'
    shell.layoutMode = 'VERTICAL'
    shell.primaryAxisSizingMode = 'AUTO'
    shell.counterAxisSizingMode = 'FIXED'
    shell.resize(280, 0)
    shell.paddingLeft = shell.paddingRight = shell.paddingTop = shell.paddingBottom = 0
    shell.itemSpacing = 0
    shell.cornerRadius = 10
    shell.fills = [solidPaint('#0B0B0B', 1)]
    shell.strokes = [solidPaint('#FFFFFF', 0.1)]

    var head = figma.createFrame()
    head.layoutMode = 'VERTICAL'
    head.primaryAxisSizingMode = 'AUTO'
    head.counterAxisSizingMode = 'FIXED'
    head.resize(280, 0)
    head.itemSpacing = 4
    head.paddingLeft = head.paddingRight = head.paddingTop = head.paddingBottom = 14
    head.fills = [solidPaint('#FFFFFF', 0.02)]
    head.appendChild(
      mkText(model.title || 'Drawer title', { size: 18, style: 'Semi Bold', hex: '#FAFAFA' }),
    )
    if (model.description) {
      head.appendChild(mkText(model.description, { size: 12, hex: '#A1A1AA' }))
    }
    shell.appendChild(head)

    var body = figma.createFrame()
    body.layoutMode = 'VERTICAL'
    body.primaryAxisSizingMode = 'AUTO'
    body.counterAxisSizingMode = 'FIXED'
    body.resize(280, 0)
    body.itemSpacing = 8
    body.paddingLeft = body.paddingRight = body.paddingTop = body.paddingBottom = 14
    body.fills = []
    appendPanelItems(body, model.items.length ? model.items : ['Drawer row 1', 'Drawer row 2'])
    shell.appendChild(body)
    root.appendChild(shell)
    return root
  }

  function buildComponent(model) {
    switch (model.type) {
      case 'DashboardColumnPanel':
        return buildPanel(model)
      case 'EmptyState':
        return buildEmptyState(model)
      case 'Skeleton':
        return buildSkeleton(model)
      case 'Dialog':
        return buildDialog(model)
      case 'Drawer':
        return buildDrawer(model)
      default:
        throw new Error(
          'Unsupported type "' +
            model.type +
            '". Use DashboardColumnPanel, EmptyState, Skeleton, Dialog, Drawer.',
        )
    }
  }

  function findExistingExportFrame() {
    var children = figma.currentPage.children || []
    for (var i = 0; i < children.length; i += 1) {
      var node = children[i]
      if (node.type === 'FRAME' && node.name === 'EXPORT · Core Components') return node
    }
    return null
  }

  function buildExportFrame(models) {
    var frame = figma.createFrame()
    frame.name = 'EXPORT · Core Components'
    frame.layoutMode = 'HORIZONTAL'
    frame.layoutWrap = 'WRAP'
    frame.primaryAxisSizingMode = 'AUTO'
    frame.counterAxisSizingMode = 'AUTO'
    frame.itemSpacing = 16
    frame.counterAxisSpacing = 16
    frame.paddingLeft = frame.paddingRight = frame.paddingTop = frame.paddingBottom = 16
    frame.cornerRadius = 16
    frame.fills = [solidPaint('#111111', 0.35)]
    for (var i = 0; i < models.length; i += 1) frame.appendChild(buildComponent(models[i]))
    return frame
  }

  function showImporter() {
    var html = [
      '<!DOCTYPE html><html><head><meta charset="utf-8">',
      '<style>',
      'body{font:12px/1.4 system-ui;margin:0;padding:10px;background:#111;color:#e5e5e5;}',
      'label{display:block;margin-bottom:4px;color:#a3a3a3;}',
      'textarea{width:100%;height:180px;box-sizing:border-box;background:#1a1a1a;color:#fafafa;border:1px solid #333;border-radius:6px;padding:8px;font:12px/1.4 ui-monospace,Menlo,monospace;resize:vertical;}',
      'button{margin-top:8px;width:100%;padding:8px 10px;border-radius:6px;border:0;background:#0d9488;color:#fff;font-weight:600;cursor:pointer;}',
      'button:hover{background:#0f766e;}',
      'p.hint{margin:0 0 8px 0;color:#737373;font-size:11px;}',
      '</style></head><body>',
      '<p class="hint">Paste JSON with type = DashboardColumnPanel|EmptyState|Skeleton|Dialog|Drawer (single object or array).</p>',
      '<label for="j">JSON</label>',
      '<textarea id="j" placeholder="{ &quot;type&quot;: &quot;DashboardColumnPanel&quot;, ... }"></textarea>',
      '<button id="b">Create frame on canvas</button>',
      '<script>',
      "var b=document.getElementById('b');var t=document.getElementById('j');",
      "b.onclick=function(){parent.postMessage({pluginMessage:{kind:'import',raw:t.value}},'*');};",
      '</script></body></html>',
    ].join('')
    figma.showUI(html, { width: 380, height: 320, themeColors: true })
  }

  figma.on('run', function () {
    showImporter()
  })

  figma.ui.onmessage = function (msg) {
    if (!msg || msg.kind !== 'import') return
    var raw = msg.raw
    if (!raw || !String(raw).trim()) {
      figma.notify('Paste JSON payload first.')
      return
    }
    loadFonts()
      .then(function () {
        var models = parsePayload(raw)
        var existing = findExistingExportFrame()
        if (existing) existing.remove()
        var out = buildExportFrame(models)
        figma.currentPage.appendChild(out)
        out.x = figma.viewport.center.x - out.width / 2
        out.y = figma.viewport.center.y - out.height / 2
        figma.currentPage.selection = [out]
        figma.viewport.scrollAndZoomIntoView([out])
        figma.notify('Core components imported: ' + models.length)
      })
      .catch(function (e) {
        figma.notify('Error: ' + (e && e.message ? e.message : String(e)))
      })
  }
})()
