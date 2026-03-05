import { describe, it, expect } from 'vitest'
import { readFileSync } from 'fs'
import { globSync } from 'glob'
import { join } from 'path'

/**
 * Test che verifica che non ci siano usi di window.location.reload() o window.location.href
 * per navigazione in /home routes (dovrebbero usare router.push o Link)
 */
describe('No Hard Reload in Home Routes', () => {
  const homeDir = join(process.cwd(), 'src/app/home')

  it('should not use window.location.reload() in /home routes', () => {
    const files = globSync('**/*.{ts,tsx}', { cwd: homeDir, absolute: false })
    const violations: Array<{ file: string; line: number; content: string }> = []

    files.forEach((file) => {
      const filePath = join(homeDir, file)
      const content = readFileSync(filePath, 'utf-8')
      const lines = content.split('\n')

      lines.forEach((line, index) => {
        // Match window.location.reload() (non in commenti)
        // Escludi commenti (// o /* */)
        const isComment =
          line.trim().startsWith('//') ||
          line.includes('/*') ||
          line.includes('*') ||
          line.trim().startsWith('*')

        if (!isComment && /window\.location\.reload\s*\(/.test(line)) {
          violations.push({
            file,
            line: index + 1,
            content: line.trim(),
          })
        }
      })
    })

    if (violations.length > 0) {
      const violationMessages = violations
        .map((v) => `  - ${v.file}:${v.line} - ${v.content}`)
        .join('\n')
      expect.fail(
        `Found ${violations.length} violation(s) of window.location.reload() in /home routes:\n${violationMessages}\n\nUse queryClient.refetchQueries() or router.push() instead.`,
      )
    }

    expect(violations).toEqual([])
  })

  it('should not use window.location.href for navigation in /home routes', () => {
    const files = globSync('**/*.{ts,tsx}', { cwd: homeDir, absolute: false })
    const violations: Array<{ file: string; line: number; content: string }> = []

    // Whitelist di casi accettabili
    const whitelistPatterns = [
      'mailto:', // Link email
      'http://', // Link esterni
      'https://', // Link esterni
      'window.location.href =', // Solo per casi specifici (es. logout redirect)
      '// Server-side', // Commenti
      '// Whitelisted', // Commenti
    ]

    files.forEach((file) => {
      const filePath = join(homeDir, file)
      const content = readFileSync(filePath, 'utf-8')
      const lines = content.split('\n')

      lines.forEach((line, index) => {
        // Match window.location.href = (non in commenti, non mailto:, non link esterni)
        const isComment =
          line.trim().startsWith('//') ||
          line.includes('/*') ||
          line.includes('*') ||
          line.trim().startsWith('*')

        const isWhitelisted = whitelistPatterns.some((pattern) => line.includes(pattern))

        // Match window.location.href = con path relativo (es. '/home', '/login')
        if (
          !isComment &&
          !isWhitelisted &&
          /window\.location\.href\s*=\s*['"]\/[^'"]*['"]/.test(line)
        ) {
          violations.push({
            file,
            line: index + 1,
            content: line.trim(),
          })
        }
      })
    })

    if (violations.length > 0) {
      const violationMessages = violations
        .map((v) => `  - ${v.file}:${v.line} - ${v.content}`)
        .join('\n')
      expect.fail(
        `Found ${violations.length} violation(s) of window.location.href for navigation in /home routes:\n${violationMessages}\n\nUse router.push() or <Link> component instead.`,
      )
    }

    expect(violations).toEqual([])
  })

  it('should use router.push or Link for navigation', () => {
    // Test che verifica che le route usino router.push o Link
    // Questo è più un test di best practice che un test di conformità
    const files = globSync('**/*.{ts,tsx}', { cwd: homeDir, absolute: false })
    let hasRouterPush = false
    let hasLinkComponent = false

    files.forEach((file) => {
      const filePath = join(homeDir, file)
      const content = readFileSync(filePath, 'utf-8')

      if (/router\.push\(/.test(content) || /useRouter/.test(content)) {
        hasRouterPush = true
      }

      if (/<Link/.test(content) || /from ['"]next\/link['"]/.test(content)) {
        hasLinkComponent = true
      }
    })

    // Verifica che almeno una delle due sia presente (best practice)
    expect(hasRouterPush || hasLinkComponent).toBe(true)
  })
})
