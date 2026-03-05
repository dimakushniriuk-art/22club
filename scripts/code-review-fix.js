#!/usr/bin/env node
/**
 * Code Review Auto-Fix Script
 * Applica fix automatici per problemi comuni identificati nella code review
 */

import { readFileSync, writeFileSync } from 'fs'
import { glob } from 'glob'
import chalk from 'chalk'

const FIXES_APPLIED = {
  consoleLog: 0,
  anyTypes: 0,
  commentedCode: 0,
  unusedImports: 0,
}

/**
 * Fix console.log/error/warn -> logger
 */
function fixConsoleLogs(filePath, content) {
  let fixed = content
  let count = 0

  // Pattern per console.log/error/warn
  const patterns = [
    {
      regex: /console\.log\(([^)]+)\)/g,
      replacement: (match, args) => {
        count++
        return `logger.info('${filePath}', ${args})`
      },
    },
    {
      regex: /console\.error\(([^)]+)\)/g,
      replacement: (match, args) => {
        count++
        return `logger.error('${filePath}', ${args})`
      },
    },
    {
      regex: /console\.warn\(([^)]+)\)/g,
      replacement: (match, args) => {
        count++
        return `logger.warn('${filePath}', ${args})`
      },
    },
  ]

  patterns.forEach(({ regex, replacement }) => {
    fixed = fixed.replace(regex, replacement)
  })

  if (count > 0 && !fixed.includes('import { logger }')) {
    // Aggiungi import logger se non presente
    if (fixed.includes("'use client'")) {
      fixed = fixed.replace(/('use client'\n)/, "$1import { logger } from '@/lib/logger'\n")
    } else if (fixed.includes('import ')) {
      // Trova ultimo import e aggiungi dopo
      const importMatch = fixed.match(/(import .+ from .+\n)+/g)
      if (importMatch) {
        const lastImport = importMatch[importMatch.length - 1]
        const lastImportIndex = fixed.lastIndexOf(lastImport)
        fixed =
          fixed.slice(0, lastImportIndex + lastImport.length) +
          "import { logger } from '@/lib/logger'\n" +
          fixed.slice(lastImportIndex + lastImport.length)
      }
    }
  }

  FIXES_APPLIED.consoleLog += count
  return { fixed, count }
}

/**
 * Rimuove codice commentato (linee che sembrano codice)
 */
function removeCommentedCode(filePath, content) {
  const lines = content.split('\n')
  const fixedLines = []
  let count = 0

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const trimmed = line.trim()

    // Skip se è commento legittimo (non sembra codice)
    if (trimmed.startsWith('//')) {
      const codeLike =
        /\/\/\s*(const|let|var|function|import|export|return|if|for|while|class|interface|type|await|async)/
      if (codeLike.test(trimmed)) {
        // È codice commentato, rimuovilo
        count++
        continue
      }
    }

    fixedLines.push(line)
  }

  FIXES_APPLIED.commentedCode += count
  return { fixed: fixedLines.join('\n'), count }
}

/**
 * Report e applica fix
 */
async function applyFixes() {
  console.log(chalk.cyan('\n🔧 Applying Code Review Auto-Fixes...\n'))

  // Trova file TypeScript/JavaScript
  const files = await glob('src/**/*.{ts,tsx}', {
    ignore: ['**/node_modules/**', '**/.next/**', '**/dist/**'],
  })

  const filesToFix = files.filter((file) => {
    // Skip file logger (legittimi)
    if (file.includes('logger') || file.includes('console-replacement')) {
      return false
    }
    return true
  })

  console.log(chalk.gray(`Found ${filesToFix.length} files to check\n`))

  let totalFixed = 0

  for (const file of filesToFix) {
    try {
      const content = readFileSync(file, 'utf-8')
      let fixed = content
      let fileFixed = false

      // Fix console.log
      const consoleFix = fixConsoleLogs(file, fixed)
      if (consoleFix.count > 0) {
        fixed = consoleFix.fixed
        fileFixed = true
        console.log(chalk.yellow(`  ${file}: Fixed ${consoleFix.count} console statements`))
      }

      // Rimuovi codice commentato (solo se non è documentazione)
      if (!file.includes('.test.') && !file.includes('.spec.')) {
        const commentFix = removeCommentedCode(file, fixed)
        if (commentFix.count > 0) {
          fixed = commentFix.fixed
          fileFixed = true
          console.log(chalk.yellow(`  ${file}: Removed ${commentFix.count} commented code lines`))
        }
      }

      if (fileFixed) {
        writeFileSync(file, fixed, 'utf-8')
        totalFixed++
      }
    } catch (error) {
      console.error(chalk.red(`  Error processing ${file}:`), error.message)
    }
  }

  console.log(chalk.cyan('\n📊 Fix Summary:\n'))
  console.log(chalk.green(`✅ Files processed: ${filesToFix.length}`))
  console.log(chalk.green(`✅ Files fixed: ${totalFixed}`))
  console.log(chalk.green(`✅ Console statements fixed: ${FIXES_APPLIED.consoleLog}`))
  console.log(chalk.green(`✅ Commented code removed: ${FIXES_APPLIED.commentedCode}`))
  console.log(chalk.yellow(`\n⚠️  Note: any types and unused imports require manual review\n`))
  console.log(chalk.cyan('💡 Run "npm run lint:fix" to fix lint issues\n'))
}

applyFixes().catch(console.error)
