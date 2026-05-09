/**
 * 22Club Code → Figma · App (step 6, multi-screen)
 * Orchestrates the same builders as `22club-code-to-figma-screens` (MetricCard, panel,
 * empty, skeleton). Keep builder blocks aligned with that file until a bundle step exists.
 */
;(function () {
  var APP_EXPORT_NAME = 'EXPORT · 22Club App'
  var DASHBOARD_EXPORT_NAME = 'EXPORT · Dashboard Screen'

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

  var INNER_W = 1440 - 64
  var COL_GAP = 16
  var COL_W = Math.floor((INNER_W - COL_GAP * 2) / 3)
  var SCREEN_BLOCK_GAP = 40

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
    var o = opts || {}
    var t = figma.createText()
    t.fontName = { family: 'Inter', style: o.style || 'Regular' }
    t.fontSize = o.size != null ? o.size : 13
    t.fills = [solidPaint(o.hex || '#E5E5E5', o.opacity)]
    t.lineHeight = o.lineHeight || { unit: 'AUTO' }
    t.characters = content == null ? '' : String(content)
    t.textAutoResize = 'WIDTH_AND_HEIGHT'
    if (o.opacityText != null) t.opacity = o.opacityText
    return t
  }

  function parseOneMetricCard(data) {
    if (!data || data.type !== 'MetricCard') {
      throw new Error('KPI item non valido: atteso type "MetricCard".')
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

  function buildMetricCard(model) {
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

  function normalizeComponent(model) {
    if (!model || typeof model !== 'object') {
      throw new Error('Invalid column payload: expected object.')
    }
    var type = model.type == null ? '' : String(model.type)
    if (!type) throw new Error('Invalid column payload: missing "type".')
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

  function columnToComponentModel(col) {
    if (!col || typeof col !== 'object') {
      throw new Error('Colonna non valida: atteso oggetto.')
    }
    var rawType = col.type == null ? 'panel' : String(col.type)
    var t = rawType.toLowerCase()
    if (t === 'panel' || t === 'dashboardcolumnpanel') {
      return normalizeComponent({
        type: 'DashboardColumnPanel',
        variant: col.variant,
        title: col.title,
        description: col.description,
        state: col.state,
        actions: col.actions,
        items: col.items,
      })
    }
    if (t === 'emptystate' || t === 'empty_state' || t === 'emptystatecomponent') {
      return normalizeComponent({
        type: 'EmptyState',
        variant: col.variant,
        title: col.title,
        description: col.description,
        state: col.state,
        actions: col.actions,
        items: col.items,
      })
    }
    if (t === 'skeleton') {
      return normalizeComponent({
        type: 'Skeleton',
        variant: col.variant,
        title: col.title,
        description: col.description,
        state: col.state,
        actions: col.actions,
        items: col.items,
      })
    }
    throw new Error(
      'Tipo colonna non supportato: "' + rawType + '". Usa panel, emptyState o skeleton.',
    )
  }

  function buildColumnNode(col) {
    var m = columnToComponentModel(col)
    if (m.type === 'DashboardColumnPanel') return buildPanel(m)
    if (m.type === 'EmptyState') return buildEmptyState(m)
    if (m.type === 'Skeleton') return buildSkeleton(m)
    throw new Error('Internal: unsupported component type ' + m.type)
  }

  function parseScreen(raw) {
    var data = typeof raw === 'string' ? JSON.parse(raw) : raw
    if (!data || data.type !== 'Screen') {
      throw new Error('JSON non valido: atteso type "Screen".')
    }
    return data
  }

  function parseApp(raw) {
    var data = typeof raw === 'string' ? JSON.parse(raw) : raw
    if (!data || data.type !== 'App') {
      throw new Error('JSON non valido: atteso type "App".')
    }
    return data
  }

  function buildHeaderPlaceholder(header) {
    var h = header || {}
    var wrap = figma.createFrame()
    wrap.name = 'header · placeholder'
    wrap.layoutMode = 'VERTICAL'
    wrap.primaryAxisSizingMode = 'AUTO'
    wrap.counterAxisSizingMode = 'FIXED'
    wrap.resize(INNER_W, 0)
    wrap.itemSpacing = 6
    wrap.fills = []
    wrap.appendChild(
      mkText(h.title != null ? String(h.title) : 'Dashboard', {
        size: 28,
        style: 'Semi Bold',
        hex: '#FAFAFA',
      }),
    )
    wrap.appendChild(
      mkText(h.subtitle != null ? String(h.subtitle) : 'Vista semplificata da JSON', {
        size: 14,
        style: 'Regular',
        hex: '#A3A3A3',
      }),
    )
    return wrap
  }

  /** @param {object} data full Screen JSON @param {string} rootFrameName */
  function buildScreenFrame(data, rootFrameName) {
    var root = figma.createFrame()
    root.name = rootFrameName || 'SCREEN · Export'
    root.layoutMode = 'VERTICAL'
    root.primaryAxisSizingMode = 'AUTO'
    root.counterAxisSizingMode = 'FIXED'
    root.resize(1440, root.height)
    root.paddingLeft = root.paddingRight = root.paddingTop = root.paddingBottom = 32
    root.itemSpacing = 24
    root.fills = [solidPaint('#09090B', 1)]

    root.appendChild(buildHeaderPlaceholder(data.header))

    var sections = Array.isArray(data.sections) ? data.sections : []
    for (var s = 0; s < sections.length; s += 1) {
      var sec = sections[s]
      var st = sec && sec.type != null ? String(sec.type) : ''
      if (st === 'kpi') {
        var kpiRow = figma.createFrame()
        kpiRow.name = 'row · KPI'
        kpiRow.layoutMode = 'HORIZONTAL'
        kpiRow.primaryAxisSizingMode = 'FIXED'
        kpiRow.counterAxisSizingMode = 'AUTO'
        kpiRow.resize(INNER_W, 0)
        kpiRow.itemSpacing = 16
        kpiRow.primaryAxisAlignItems = 'MIN'
        kpiRow.counterAxisAlignItems = 'MIN'
        kpiRow.layoutWrap = 'NO_WRAP'
        kpiRow.fills = []
        var items = Array.isArray(sec.items) ? sec.items : []
        for (var k = 0; k < items.length; k += 1) {
          kpiRow.appendChild(buildMetricCard(parseOneMetricCard(items[k])))
        }
        root.appendChild(kpiRow)
      } else if (st === 'columns') {
        var grid = figma.createFrame()
        grid.name = 'grid · columns'
        grid.layoutMode = 'HORIZONTAL'
        grid.primaryAxisSizingMode = 'FIXED'
        grid.counterAxisSizingMode = 'AUTO'
        grid.resize(INNER_W, 0)
        grid.itemSpacing = COL_GAP
        grid.primaryAxisAlignItems = 'MIN'
        grid.counterAxisAlignItems = 'MIN'
        grid.fills = []
        var cols = Array.isArray(sec.columns) ? sec.columns : []
        for (var c = 0; c < cols.length; c += 1) {
          var colWrap = figma.createFrame()
          colWrap.name = 'column · ' + (c + 1)
          colWrap.layoutMode = 'VERTICAL'
          colWrap.primaryAxisSizingMode = 'AUTO'
          colWrap.counterAxisSizingMode = 'FIXED'
          colWrap.resize(COL_W, 0)
          colWrap.itemSpacing = 0
          colWrap.primaryAxisAlignItems = 'MIN'
          colWrap.counterAxisAlignItems = 'MIN'
          colWrap.fills = []
          colWrap.appendChild(buildColumnNode(cols[c]))
          grid.appendChild(colWrap)
        }
        root.appendChild(grid)
      }
    }

    return root
  }

  function clonePresetDashboard() {
    return JSON.parse(JSON.stringify(DASHBOARD_PRESET))
  }

  var DASHBOARD_PRESET = {
    type: 'Screen',
    name: 'Dashboard',
    layout: 'dashboard_base',
    header: { title: 'Dashboard', subtitle: '22Club · vista staff' },
    sections: [
      {
        type: 'kpi',
        items: [
          {
            type: 'MetricCard',
            name: 'Lezioni oggi',
            variant: 'default',
            tone: 'teal',
            title: 'Lezioni oggi',
            value: '8',
            subtitle: 'Agenda',
            status: 'success',
            statusText: 'In linea',
            icon: 'Calendar',
            loading: false,
          },
          {
            type: 'MetricCard',
            name: 'Clienti attivi',
            variant: 'default',
            tone: 'blue',
            title: 'Clienti attivi',
            value: '142',
            subtitle: 'Organizzazione',
            status: 'info',
            statusText: 'Stabile',
            icon: 'Users',
            loading: false,
          },
          {
            type: 'MetricCard',
            name: 'Pagamenti in sospeso',
            variant: 'compact',
            tone: 'amber',
            title: 'Pagamenti',
            value: '3',
            subtitle: 'Da incassare',
            status: 'warning',
            statusText: 'Follow-up',
            icon: 'CreditCard',
            loading: false,
          },
          {
            type: 'MetricCard',
            name: 'Lead',
            variant: 'compact',
            tone: 'purple',
            title: 'Lead',
            value: '12',
            subtitle: 'Marketing',
            status: 'success',
            statusText: '+2',
            icon: 'Target',
            loading: false,
          },
        ],
      },
      {
        type: 'columns',
        columns: [
          {
            type: 'panel',
            state: 'list',
            title: 'Agenda di oggi',
            items: [
              '09:00 · PT · Marco R.',
              '10:30 · Nutrizione · Sara L.',
              '12:00 · Massaggio · Alex P.',
            ],
          },
          {
            type: 'emptyState',
            title: 'Nessun messaggio',
            description: 'Quando arrivano notifiche o chat, le vedi qui.',
            actions: ['Apri centro messaggi'],
          },
          { type: 'skeleton', items: [1, 1, 1, 1] },
        ],
      },
    ],
  }

  function buildDashboardFromLayout(screenName) {
    var preset = clonePresetDashboard()
    var label = screenName || 'Dashboard'
    preset.name = label
    preset.header = preset.header || {}
    preset.header.title = label
    preset.header.subtitle =
      '22Club · export multi-screen (preset allineato a examples/dashboard.json)'
    return buildScreenFrame(preset, 'SCREEN · ' + label)
  }

  function buildTableBaseScreen(screenName) {
    var title = screenName || 'Tabella'
    var root = figma.createFrame()
    root.name = 'SCREEN · ' + title
    root.layoutMode = 'VERTICAL'
    root.primaryAxisSizingMode = 'AUTO'
    root.counterAxisSizingMode = 'FIXED'
    root.resize(1440, root.height)
    root.paddingLeft = root.paddingRight = root.paddingTop = root.paddingBottom = 32
    root.itemSpacing = 24
    root.fills = [solidPaint('#09090B', 1)]

    root.appendChild(
      buildHeaderPlaceholder({
        title: title,
        subtitle: 'Layout table_base: pannello elenco + tabella placeholder + empty state',
      }),
    )

    var row = figma.createFrame()
    row.name = 'row · panel + table + empty'
    row.layoutMode = 'HORIZONTAL'
    row.primaryAxisSizingMode = 'FIXED'
    row.counterAxisSizingMode = 'AUTO'
    row.resize(INNER_W, 0)
    row.itemSpacing = COL_GAP
    row.fills = []

    var wPanel = 360
    var wEmpty = 360
    var wTable = INNER_W - wPanel - wEmpty - COL_GAP * 2
    if (wTable < 320) wTable = 320

    var panelCol = figma.createFrame()
    panelCol.name = 'column · list'
    panelCol.layoutMode = 'VERTICAL'
    panelCol.primaryAxisSizingMode = 'AUTO'
    panelCol.counterAxisSizingMode = 'FIXED'
    panelCol.resize(wPanel, 0)
    panelCol.itemSpacing = 12
    panelCol.fills = []
    panelCol.appendChild(
      buildPanel(
        normalizeComponent({
          type: 'DashboardColumnPanel',
          title: 'Filtri / elenco',
          state: 'list',
          items: ['Tutti', 'Attivi', 'In scadenza', 'Archiviati'],
        }),
      ),
    )

    var tableCol = figma.createFrame()
    tableCol.name = 'column · table'
    tableCol.layoutMode = 'VERTICAL'
    tableCol.primaryAxisSizingMode = 'AUTO'
    tableCol.counterAxisSizingMode = 'FIXED'
    tableCol.resize(wTable, 0)
    tableCol.itemSpacing = 8
    tableCol.fills = []
    var tableShell = shellFrame('Table · placeholder')
    tableShell.resize(wTable, tableShell.height)
    tableShell.name = 'DataTable · placeholder'
    var th = figma.createFrame()
    th.layoutMode = 'HORIZONTAL'
    th.primaryAxisSizingMode = 'FIXED'
    th.counterAxisSizingMode = 'AUTO'
    th.resize(wTable - 24, 0)
    th.itemSpacing = 8
    th.paddingBottom = 8
    th.fills = []
    ;['Nome', 'Stato', 'Scadenza', 'Importo'].forEach(function (h) {
      var cell = mkText(h, { size: 11, style: 'Semi Bold', hex: '#A1A1AA' })
      th.appendChild(cell)
    })
    tableShell.appendChild(th)
    for (var r = 0; r < 5; r += 1) {
      var tr = figma.createFrame()
      tr.layoutMode = 'HORIZONTAL'
      tr.primaryAxisSizingMode = 'FIXED'
      tr.counterAxisSizingMode = 'AUTO'
      tr.resize(wTable - 24, 0)
      tr.itemSpacing = 8
      tr.paddingTop = tr.paddingBottom = 10
      tr.fills = [solidPaint('#000000', 0.2)]
      tr.strokes = [solidPaint('#FFFFFF', 0.06)]
      tr.cornerRadius = 8
      tr.appendChild(mkText('Riga ' + (r + 1) + ' · dato esempio', { size: 12, hex: '#E4E4E7' }))
      tableShell.appendChild(tr)
    }
    tableCol.appendChild(tableShell)

    var emptyCol = figma.createFrame()
    emptyCol.name = 'column · detail'
    emptyCol.layoutMode = 'VERTICAL'
    emptyCol.primaryAxisSizingMode = 'AUTO'
    emptyCol.counterAxisSizingMode = 'FIXED'
    emptyCol.resize(wEmpty, 0)
    emptyCol.fills = []
    emptyCol.appendChild(
      buildEmptyState(
        normalizeComponent({
          type: 'EmptyState',
          title: 'Nessuna selezione',
          description: 'Seleziona una riga per vedere dettagli e azioni.',
          actions: ['Nuovo'],
        }),
      ),
    )

    row.appendChild(panelCol)
    row.appendChild(tableCol)
    row.appendChild(emptyCol)
    root.appendChild(row)
    return root
  }

  function mkLeadCard(name, tag) {
    var card = figma.createFrame()
    card.name = 'LeadCard · ' + name
    card.layoutMode = 'VERTICAL'
    card.primaryAxisSizingMode = 'AUTO'
    card.counterAxisSizingMode = 'FIXED'
    card.resize(200, 0)
    card.itemSpacing = 6
    card.paddingLeft = card.paddingRight = card.paddingTop = card.paddingBottom = 12
    card.cornerRadius = 10
    card.fills = [solidPaint('#18181B', 1)]
    card.strokes = [solidPaint('#FFFFFF', 0.08)]
    card.strokeWeight = 1
    card.appendChild(mkText(name, { size: 13, style: 'Semi Bold', hex: '#FAFAFA' }))
    card.appendChild(mkText(tag, { size: 11, hex: '#A1A1AA' }))
    return card
  }

  function buildPipelineScreen(screenName) {
    var title = screenName || 'Pipeline'
    var root = figma.createFrame()
    root.name = 'SCREEN · ' + title
    root.layoutMode = 'VERTICAL'
    root.primaryAxisSizingMode = 'AUTO'
    root.counterAxisSizingMode = 'FIXED'
    root.resize(1440, root.height)
    root.paddingLeft = root.paddingRight = root.paddingTop = root.paddingBottom = 32
    root.itemSpacing = 24
    root.fills = [solidPaint('#09090B', 1)]

    root.appendChild(
      buildHeaderPlaceholder({
        title: title,
        subtitle: 'Layout pipeline: colonne per stato lead (semplificato, no routing)',
      }),
    )

    var grid = figma.createFrame()
    grid.name = 'grid · pipeline'
    grid.layoutMode = 'HORIZONTAL'
    grid.primaryAxisSizingMode = 'FIXED'
    grid.counterAxisSizingMode = 'AUTO'
    grid.resize(INNER_W, 0)
    grid.itemSpacing = 12
    grid.fills = []

    var stages = [
      {
        label: 'Nuovo',
        cards: [
          ['Rossi M.', 'Web'],
          ['Bianchi L.', 'IG'],
        ],
      },
      { label: 'Contattato', cards: [['Verdi G.', 'Email']] },
      { label: 'Trial', cards: [['Neri P.', 'In club']] },
      { label: 'Perso', cards: [['Gialli T.', 'No budget']] },
    ]
    var colW = Math.floor((INNER_W - 12 * (stages.length - 1)) / stages.length)

    for (var i = 0; i < stages.length; i += 1) {
      var col = figma.createFrame()
      col.name = 'column · ' + stages[i].label
      col.layoutMode = 'VERTICAL'
      col.primaryAxisSizingMode = 'AUTO'
      col.counterAxisSizingMode = 'FIXED'
      col.resize(colW, 0)
      col.itemSpacing = 10
      col.fills = []
      col.appendChild(mkText(stages[i].label, { size: 12, style: 'Semi Bold', hex: '#E4E4E7' }))
      var cards = stages[i].cards
      for (var j = 0; j < cards.length; j += 1) {
        col.appendChild(mkLeadCard(cards[j][0], cards[j][1]))
      }
      var add = mkText('+ trascina lead', { size: 10, hex: '#52525B' })
      col.appendChild(add)
      grid.appendChild(col)
    }
    root.appendChild(grid)
    return root
  }

  function wrapScreenSection(screenTitle, innerScreenFrame) {
    var block = figma.createFrame()
    block.name = 'SECTION · ' + screenTitle
    block.layoutMode = 'VERTICAL'
    block.primaryAxisSizingMode = 'AUTO'
    block.counterAxisSizingMode = 'MIN'
    block.itemSpacing = 16
    block.fills = []
    block.appendChild(
      mkText(screenTitle, {
        size: 22,
        style: 'Semi Bold',
        hex: '#FAFAFA',
      }),
    )
    var rule = figma.createRectangle()
    rule.resize(Math.max(innerScreenFrame.width, INNER_W + 64), 1)
    rule.name = 'divider'
    rule.fills = [solidPaint('#FFFFFF', 0.12)]
    block.appendChild(rule)
    block.appendChild(innerScreenFrame)
    return block
  }

  function buildLayoutForScreenEntry(entry) {
    var layout = entry && entry.layout != null ? String(entry.layout) : 'dashboard_base'
    var name = entry && entry.name != null ? String(entry.name) : 'Screen'
    if (layout === 'dashboard_base') return buildDashboardFromLayout(name)
    if (layout === 'table_base') return buildTableBaseScreen(name)
    if (layout === 'pipeline') return buildPipelineScreen(name)
    throw new Error(
      'Layout non supportato: "' + layout + '". Usa dashboard_base, table_base o pipeline.',
    )
  }

  function buildApp(data) {
    var root = figma.createFrame()
    root.name = APP_EXPORT_NAME
    root.layoutMode = 'VERTICAL'
    root.primaryAxisSizingMode = 'AUTO'
    root.counterAxisSizingMode = 'MIN'
    root.paddingLeft = root.paddingRight = root.paddingTop = root.paddingBottom = 40
    root.itemSpacing = SCREEN_BLOCK_GAP
    root.fills = [solidPaint('#020617', 1)]

    var appTitle = data && data.name != null ? String(data.name) : '22Club'
    root.appendChild(
      mkText('APP · ' + appTitle, {
        size: 14,
        style: 'Semi Bold',
        hex: '#94A3B8',
      }),
    )

    var screens = Array.isArray(data.screens) ? data.screens : []
    if (screens.length === 0) {
      throw new Error('App senza screens: aggiungi almeno un oggetto { type, name, layout }.')
    }
    for (var i = 0; i < screens.length; i += 1) {
      var sc = screens[i]
      var screenName = sc && sc.name != null ? String(sc.name) : 'Screen ' + (i + 1)
      var inner = buildLayoutForScreenEntry(sc)
      root.appendChild(wrapScreenSection(screenName, inner))
    }
    return root
  }

  function findExistingAppExport() {
    var children = figma.currentPage.children || []
    for (var i = 0; i < children.length; i += 1) {
      var node = children[i]
      if (node.type === 'FRAME' && node.name === APP_EXPORT_NAME) return node
    }
    return null
  }

  function findExistingExportFrame() {
    var children = figma.currentPage.children || []
    for (var i = 0; i < children.length; i += 1) {
      var node = children[i]
      if (node.type === 'FRAME' && node.name === DASHBOARD_EXPORT_NAME) return node
    }
    return null
  }

  function showImporter() {
    var html = [
      '<!DOCTYPE html><html><head><meta charset="utf-8">',
      '<style>',
      'body{font:12px/1.4 system-ui;margin:0;padding:10px;background:#111;color:#e5e5e5;}',
      'label{display:block;margin-bottom:4px;color:#a3a3a3;}',
      'textarea{width:100%;height:220px;box-sizing:border-box;background:#1a1a1a;color:#fafafa;border:1px solid #333;border-radius:6px;padding:8px;font:12px/1.4 ui-monospace,Menlo,monospace;resize:vertical;}',
      'button{margin-top:8px;width:100%;padding:8px 10px;border-radius:6px;border:0;background:#0d9488;color:#fff;font-weight:600;cursor:pointer;}',
      'button:hover{background:#0f766e;}',
      'p.hint{margin:0 0 8px 0;color:#737373;font-size:11px;}',
      '</style></head><body>',
      '<p class="hint">Incolla <code>type: "App"</code> (vedi <code>examples/app.json</code>) oppure un singolo <code>type: "Screen"</code> completo. Rigenera App: rimuove <code>' +
        APP_EXPORT_NAME +
        '</code>. Rigenera Screen singola: rimuove <code>' +
        DASHBOARD_EXPORT_NAME +
        '</code>.</p>',
      '<label for="j">JSON</label>',
      '<textarea id="j" placeholder="{ &quot;type&quot;: &quot;App&quot;, ... }"></textarea>',
      '<button id="b">Genera su canvas</button>',
      '<script>',
      "var b=document.getElementById('b');var t=document.getElementById('j');",
      "b.onclick=function(){parent.postMessage({pluginMessage:{kind:'import',raw:t.value}},'*');};",
      '</script></body></html>',
    ].join('')
    figma.showUI(html, { width: 420, height: 380, themeColors: true })
  }

  figma.on('run', function () {
    showImporter()
  })

  figma.ui.onmessage = function (msg) {
    if (!msg || msg.kind !== 'import') return
    var raw = msg.raw
    if (!raw || !String(raw).trim()) {
      figma.notify('Incolla il JSON (App o Screen).')
      return
    }
    loadFonts()
      .then(function () {
        var parsed = JSON.parse(typeof raw === 'string' ? raw : JSON.stringify(raw))
        var node
        if (parsed && parsed.type === 'App') {
          var appData = parseApp(raw)
          var existingApp = findExistingAppExport()
          if (existingApp) existingApp.remove()
          node = buildApp(appData)
        } else if (parsed && parsed.type === 'Screen') {
          var screenData = parseScreen(raw)
          var existing = findExistingExportFrame()
          if (existing) existing.remove()
          node = buildScreenFrame(screenData, DASHBOARD_EXPORT_NAME)
        } else {
          throw new Error('Tipo root non supportato: usa "App" o "Screen".')
        }
        figma.currentPage.appendChild(node)
        node.x = figma.viewport.center.x - node.width / 2
        node.y = figma.viewport.center.y - node.height / 2
        figma.currentPage.selection = [node]
        figma.viewport.scrollAndZoomIntoView([node])
        figma.notify(
          parsed.type === 'App'
            ? 'App importata: ' + (parsed.name || 'App')
            : 'Schermata importata',
        )
      })
      .catch(function (e) {
        figma.notify('Errore: ' + (e && e.message ? e.message : String(e)))
      })
  }
})()
