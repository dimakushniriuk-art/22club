import fs from 'node:fs/promises'
import path from 'node:path'

const ROOT = process.cwd()
const API_DIR = path.join(ROOT, 'src', 'app', 'api')
const SRC_DIR = path.join(ROOT, 'src')
const OUT_DIR = path.join(ROOT, 'docs', 'api-system')

const HTTP_METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS', 'HEAD']

async function listFiles(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true })
  const files = await Promise.all(
    entries.map(async (entry) => {
      const full = path.join(dir, entry.name)
      if (entry.isDirectory()) return listFiles(full)
      return [full]
    }),
  )
  return files.flat()
}

function toPosix(p) {
  return p.split(path.sep).join('/')
}

function routePathFromFile(file) {
  const rel = toPosix(path.relative(API_DIR, file))
  const noSuffix = rel.replace(/\/route\.ts$/, '')
  return `/api/${noSuffix}`
}

function routeRegex(endpoint) {
  const pattern = endpoint.replace(/\[([^\]]+)\]/g, '[^/]+').replace(/\//g, '\\/')
  return new RegExp(`^${pattern}$`)
}

function normalizeEndpoint(raw) {
  return raw
    .replace(/\$\{[^}]+\}/g, '[param]')
    .replace(/\[param\]/g, '[id]')
    .replace(/\/+/g, '/')
    .replace(/\/$/, '')
}

function normalizeEndpointPath(raw) {
  return normalizeEndpoint(raw).split('?')[0]
}

function parseMethods(content) {
  const methods = []
  for (const method of HTTP_METHODS) {
    const re = new RegExp(`export\\s+(?:async\\s+)?function\\s+${method}\\s*\\(`, 'g')
    if (re.test(content)) methods.push(method)
  }
  return methods
}

function blockForMethod(content, method) {
  const startRe = new RegExp(`export\\s+(?:async\\s+)?function\\s+${method}\\s*\\(`)
  const startMatch = content.match(startRe)
  if (!startMatch || startMatch.index == null) return ''
  const start = startMatch.index
  const rest = content.slice(start + startMatch[0].length)
  const nextRe = /export\s+(?:async\s+)?function\s+(?:GET|POST|PUT|PATCH|DELETE|OPTIONS|HEAD)\s*\(/g
  const nextMatch = nextRe.exec(rest)
  const end = nextMatch ? start + startMatch[0].length + nextMatch.index : content.length
  return content.slice(start, end)
}

function extractInput(block, file) {
  const parts = []
  if (/request\.json\(/.test(block)) parts.push('body:json')
  if (/request\.formData\(/.test(block)) parts.push('body:formData')
  if (/searchParams/.test(block)) parts.push('query:searchParams')
  if (/\bparams\b/.test(block) || /\[[^\]]+\]/.test(file)) parts.push('params:path')
  if (parts.length === 0) parts.push('implicit:none_or_context')
  return parts.join(', ')
}

function extractOutput(block) {
  const formats = []
  if (/NextResponse\.json\(/.test(block) || /Response\.json\(/.test(block)) formats.push('json')
  if (/new\s+Response\(/.test(block)) formats.push('response')
  if (/throw\s+new\s+Error/.test(block)) formats.push('throws')
  if (formats.length === 0) formats.push('implicit')
  const statuses = [...block.matchAll(/status\s*:\s*(\d{3})/g)].map((m) => Number(m[1]))
  const statusLabel = statuses.length
    ? [...new Set(statuses)].sort((a, b) => a - b).join('|')
    : 'default'
  return { format: [...new Set(formats)].join('+'), statuses: statusLabel }
}

function inferOwner(file) {
  const rel = toPosix(file)
  if (rel.includes('/app/dashboard/')) return 'dashboard'
  if (rel.includes('/app/home/')) return 'home'
  if (rel.includes('/app/')) return 'app'
  if (rel.includes('/hooks/')) return 'hooks'
  if (rel.includes('/components/')) return 'components'
  if (rel.includes('/lib/')) return 'lib'
  return 'other'
}

function inferSymbol(content, idx) {
  const before = content.slice(Math.max(0, idx - 1200), idx)
  const patterns = [
    /function\s+([A-Za-z0-9_]+)\s*\([^)]*\)\s*\{[^{}]*$/m,
    /const\s+([A-Za-z0-9_]+)\s*=\s*(?:async\s*)?\([^)]*\)\s*=>[^=]*$/m,
    /export\s+default\s+function\s+([A-Za-z0-9_]+)\s*\(/m,
  ]
  for (const p of patterns) {
    const m = before.match(p)
    if (m?.[1]) return m[1]
  }
  return 'unknown'
}

async function parseCallers() {
  const all = await listFiles(SRC_DIR)
  const files = all.filter(
    (f) => /\.(ts|tsx|js|jsx)$/.test(f) && !toPosix(f).includes('/src/app/api/'),
  )
  const callers = []
  for (const file of files) {
    const content = await fs.readFile(file, 'utf8')

    // Wrapper calls
    const wrapperPatterns = [
      { fn: 'apiGet', method: 'GET' },
      { fn: 'apiPost', method: 'POST' },
      { fn: 'apiPut', method: 'PUT' },
      { fn: 'apiDelete', method: 'DELETE' },
    ]
    for (const { fn, method } of wrapperPatterns) {
      const re = new RegExp(
        `${fn}\\s*\\(\\s*([\\x22\\x27\\x60])([^\\x22\\x27\\x60]*\\/api\\/[^\\x22\\x27\\x60]*)\\1`,
        'g',
      )
      for (const m of content.matchAll(re)) {
        const raw = m[2]
        const idx = m.index ?? 0
        callers.push({
          endpoint: normalizeEndpoint(raw),
          endpointPath: normalizeEndpointPath(raw),
          method,
          file: toPosix(path.relative(ROOT, file)),
          symbol: inferSymbol(content, idx),
          owner: inferOwner(file),
          confidence: raw.includes('${') ? 'inferred' : 'exact',
        })
      }
    }

    // fetch calls
    const fetchRe = /fetch\s*\(\s*([`'"])([^`'"]*\/api\/[^`'"]*)\1([\s\S]{0,220})/g
    for (const m of content.matchAll(fetchRe)) {
      const raw = m[2]
      const opts = m[3] ?? ''
      const idx = m.index ?? 0
      const methodMatch = opts.match(/method\s*:\s*['"]([A-Z]+)['"]/)
      callers.push({
        endpoint: normalizeEndpoint(raw),
        endpointPath: normalizeEndpointPath(raw),
        method: methodMatch?.[1] ?? 'GET',
        file: toPosix(path.relative(ROOT, file)),
        symbol: inferSymbol(content, idx),
        owner: inferOwner(file),
        confidence: raw.includes('${') ? 'inferred' : 'exact',
      })
    }
  }
  return callers
}

function matchCallersToEndpoints(endpoints, callers) {
  const endpointMethods = new Map()
  for (const ep of endpoints) {
    for (const method of ep.methods) {
      endpointMethods.set(`${ep.path}::${method.name}`, method)
    }
  }

  const unresolved = []
  const methodMismatches = []

  for (const call of callers) {
    const direct = endpointMethods.get(`${call.endpointPath}::${call.method}`)
    if (direct) {
      direct.calledFrom.push({
        file: call.file,
        symbol: call.symbol,
        owner: call.owner,
        confidence: call.confidence,
      })
      continue
    }

    // Try dynamic-route match
    const matchedEndpoint = endpoints.find((ep) => routeRegex(ep.path).test(call.endpointPath))
    if (!matchedEndpoint) {
      unresolved.push(call)
      continue
    }
    const method = matchedEndpoint.methods.find((m) => m.name === call.method)
    if (!method) {
      methodMismatches.push({ ...call, available: matchedEndpoint.methods.map((m) => m.name) })
      continue
    }
    method.calledFrom.push({
      file: call.file,
      symbol: call.symbol,
      owner: call.owner,
      confidence: call.confidence,
    })
  }

  for (const ep of endpoints) {
    for (const method of ep.methods) {
      const uniqueOwners = [...new Set(method.calledFrom.map((c) => c.owner))]
      method.usedBy = uniqueOwners
    }
  }

  return { unresolved, methodMismatches }
}

function toCsvRows(endpoints) {
  const rows = [['path', 'method', 'input', 'output', 'usedBy', 'calledFromCount']]
  for (const ep of endpoints) {
    for (const m of ep.methods) {
      rows.push([
        ep.path,
        m.name,
        m.input,
        `${m.output.format}:${m.output.statuses}`,
        m.usedBy.join('|'),
        String(m.calledFrom.length),
      ])
    }
  }
  return rows
    .map((r) => r.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(','))
    .join('\n')
}

function toMarkdown(report) {
  const { endpoints, unresolved, methodMismatches } = report
  const lines = []
  lines.push('# API System Map')
  lines.push('')
  lines.push(`Generated at: ${new Date().toISOString()}`)
  lines.push('')
  lines.push('## Registry')
  lines.push('')
  lines.push('| Path | Method | Input | Output | UsedBy | CalledFrom |')
  lines.push('|---|---|---|---|---|---|')
  for (const ep of endpoints) {
    for (const m of ep.methods) {
      const usedBy = m.usedBy.length ? m.usedBy.join(', ') : 'none'
      lines.push(
        `| \`${ep.path}\` | \`${m.name}\` | \`${m.input}\` | \`${m.output.format}:${m.output.statuses}\` | ${usedBy} | ${m.calledFrom.length} |`,
      )
    }
  }

  lines.push('')
  lines.push('## Coverage')
  lines.push('')
  lines.push(`- Total endpoints: ${endpoints.length}`)
  lines.push(
    `- Total path+method rows: ${endpoints.reduce((acc, ep) => acc + ep.methods.length, 0)}`,
  )
  lines.push(`- Calls unresolved: ${unresolved.length}`)
  lines.push(`- Method mismatches: ${methodMismatches.length}`)

  if (unresolved.length) {
    lines.push('')
    lines.push('### Unresolved Calls')
    for (const item of unresolved.slice(0, 100)) {
      lines.push(`- \`${item.method} ${item.endpoint}\` -> \`${item.file}\` (\`${item.symbol}\`)`)
    }
  }

  if (methodMismatches.length) {
    lines.push('')
    lines.push('### Method Mismatches')
    for (const item of methodMismatches.slice(0, 100)) {
      lines.push(
        `- \`${item.method} ${item.endpoint}\` -> available: \`${item.available.join(', ')}\` in \`${item.file}\` (\`${item.symbol}\`)`,
      )
    }
  }

  lines.push('')
  lines.push('## Caller Trace')
  lines.push('')
  for (const ep of endpoints) {
    lines.push(`### ${ep.path}`)
    for (const m of ep.methods) {
      lines.push(`- ${m.name}`)
      if (!m.calledFrom.length) {
        lines.push('  - (no callers found)')
        continue
      }
      for (const c of m.calledFrom) {
        lines.push(`  - ${c.file} :: ${c.symbol} [${c.owner}, ${c.confidence}]`)
      }
    }
    lines.push('')
  }
  return lines.join('\n')
}

async function main() {
  const apiFiles = (await listFiles(API_DIR)).filter((f) => f.endsWith(path.join('route.ts')))
  const endpoints = []
  for (const file of apiFiles) {
    const content = await fs.readFile(file, 'utf8')
    const pathName = routePathFromFile(file)
    const methods = parseMethods(content).map((name) => {
      const block = blockForMethod(content, name)
      return {
        name,
        input: extractInput(block, file),
        output: extractOutput(block),
        calledFrom: [],
        usedBy: [],
      }
    })
    endpoints.push({
      path: pathName,
      file: toPosix(path.relative(ROOT, file)),
      dynamic: /\[[^\]]+\]/.test(pathName),
      methods,
    })
  }

  endpoints.sort((a, b) => a.path.localeCompare(b.path))

  const callers = await parseCallers()
  const { unresolved, methodMismatches } = matchCallersToEndpoints(endpoints, callers)

  const report = {
    generatedAt: new Date().toISOString(),
    endpoints,
    totals: {
      endpoints: endpoints.length,
      methods: endpoints.reduce((acc, ep) => acc + ep.methods.length, 0),
      unresolvedCalls: unresolved.length,
      methodMismatches: methodMismatches.length,
    },
    unresolved,
    methodMismatches,
  }

  await fs.mkdir(OUT_DIR, { recursive: true })
  await fs.writeFile(
    path.join(OUT_DIR, 'api-system-map.json'),
    JSON.stringify(report, null, 2),
    'utf8',
  )
  await fs.writeFile(path.join(OUT_DIR, 'api-system-map.csv'), toCsvRows(endpoints), 'utf8')
  await fs.writeFile(path.join(OUT_DIR, 'api-system-map.md'), toMarkdown(report), 'utf8')

  console.log(
    `API map generated: endpoints=${report.totals.endpoints}, methods=${report.totals.methods}, unresolved=${report.totals.unresolvedCalls}, mismatches=${report.totals.methodMismatches}`,
  )
}

await main()
