#!/usr/bin/env node
/**
 * Code Review Check Script
 * Verifica qualità codice e identifica problemi comuni
 */

import { execSync } from 'child_process'
import { readFileSync, readdirSync, statSync } from 'fs'
import { join, extname } from 'path'
import chalk from 'chalk'

const ISSUES = {
  todo: [],
  fixme: [],
  hack: [],
  xxx: [],
  bug: [],
  commentedCode: [],
  unusedImports: [],
  anyTypes: [],
  consoleLogs: [],
  debugger: [],
}

function scanFile(filePath, content) {
  const lines = content.split('\n')
  const fileName = filePath.replace(process.cwd(), '')

  lines.forEach((line, index) => {
    const lineNum = index + 1
    const lowerLine = line.toLowerCase()

    // TODO/FIXME/XXX/HACK/BUG
    if (lowerLine.includes('todo'))
      ISSUES.todo.push({ file: fileName, line: lineNum, content: line.trim() })
    if (lowerLine.includes('fixme'))
      ISSUES.fixme.push({ file: fileName, line: lineNum, content: line.trim() })
    if (lowerLine.includes('xxx'))
      ISSUES.xxx.push({ file: fileName, line: lineNum, content: line.trim() })
    if (lowerLine.includes('hack'))
      ISSUES.hack.push({ file: fileName, line: lineNum, content: line.trim() })
    if (lowerLine.includes('bug'))
      ISSUES.bug.push({ file: fileName, line: lineNum, content: line.trim() })

    // Commented code (lines that look like code but are commented)
    if (line.trim().startsWith('//') && line.trim().length > 3) {
      const codeLike =
        /\/\/\s*(const|let|var|function|import|export|return|if|for|while|class|interface|type)/
      if (codeLike.test(line)) {
        ISSUES.commentedCode.push({ file: fileName, line: lineNum, content: line.trim() })
      }
    }

    // console.log (should use logger)
    if (
      line.includes('console.log') ||
      line.includes('console.error') ||
      line.includes('console.warn')
    ) {
      ISSUES.consoleLogs.push({ file: fileName, line: lineNum, content: line.trim() })
    }

    // debugger statements
    if (line.includes('debugger')) {
      ISSUES.debugger.push({ file: fileName, line: lineNum, content: line.trim() })
    }

    // any types
    if (line.includes(': any') || line.includes('<any>') || line.includes('any[]')) {
      ISSUES.anyTypes.push({ file: fileName, line: lineNum, content: line.trim() })
    }
  })
}

function scanDirectory(dir, extensions = ['.ts', '.tsx', '.js', '.jsx']) {
  const files = readdirSync(dir)

  for (const file of files) {
    const filePath = join(dir, file)
    const stat = statSync(filePath)

    if (stat.isDirectory()) {
      // Skip node_modules, .next, etc.
      if (['node_modules', '.next', '.git', 'dist', 'build', 'coverage'].includes(file)) {
        continue
      }
      scanDirectory(filePath, extensions)
    } else if (extensions.includes(extname(file))) {
      try {
        const content = readFileSync(filePath, 'utf-8')
        scanFile(filePath, content)
      } catch {
        // Skip files that can't be read
      }
    }
  }
}

function runChecks() {
  console.log(chalk.cyan('\n🔍 Running Code Review Checks...\n'))

  // Scan source files
  console.log(chalk.gray('Scanning source files...'))
  scanDirectory(join(process.cwd(), 'src'))
  scanDirectory(join(process.cwd(), 'scripts'))

  // Run TypeScript check
  console.log(chalk.gray('Running TypeScript check...'))
  try {
    execSync('npx tsc --noEmit', { stdio: 'pipe' })
    console.log(chalk.green('✅ TypeScript: no errors'))
  } catch {
    console.log(chalk.yellow('⚠️  TypeScript: errors found (run npm run typecheck for details)'))
  }

  // Run ESLint check
  console.log(chalk.gray('Running ESLint check...'))
  try {
    execSync('npx eslint . --max-warnings=800', { stdio: 'pipe' })
    console.log(chalk.green('✅ ESLint: clean'))
  } catch {
    console.log(chalk.yellow('⚠️  ESLint: warnings found (run npm run lint for details)'))
  }

  // Report issues
  console.log(chalk.cyan('\n📊 Code Review Report:\n'))

  const totalIssues =
    ISSUES.todo.length +
    ISSUES.fixme.length +
    ISSUES.xxx.length +
    ISSUES.hack.length +
    ISSUES.bug.length +
    ISSUES.commentedCode.length +
    ISSUES.consoleLogs.length +
    ISSUES.debugger.length +
    ISSUES.anyTypes.length

  if (totalIssues === 0) {
    console.log(chalk.green('✨ No issues found! Code is clean.\n'))
    return
  }

  // TODO/FIXME
  if (ISSUES.todo.length > 0) {
    console.log(chalk.yellow(`\n📝 TODO comments (${ISSUES.todo.length}):`))
    ISSUES.todo.slice(0, 10).forEach((issue) => {
      console.log(chalk.gray(`  ${issue.file}:${issue.line} - ${issue.content.substring(0, 60)}`))
    })
    if (ISSUES.todo.length > 10) {
      console.log(chalk.gray(`  ... and ${ISSUES.todo.length - 10} more`))
    }
  }

  if (ISSUES.fixme.length > 0) {
    console.log(chalk.red(`\n🔧 FIXME comments (${ISSUES.fixme.length}):`))
    ISSUES.fixme.slice(0, 10).forEach((issue) => {
      console.log(chalk.gray(`  ${issue.file}:${issue.line} - ${issue.content.substring(0, 60)}`))
    })
    if (ISSUES.fixme.length > 10) {
      console.log(chalk.gray(`  ... and ${ISSUES.fixme.length - 10} more`))
    }
  }

  // Commented code
  if (ISSUES.commentedCode.length > 0) {
    console.log(chalk.yellow(`\n💬 Commented code (${ISSUES.commentedCode.length}):`))
    ISSUES.commentedCode.slice(0, 10).forEach((issue) => {
      console.log(chalk.gray(`  ${issue.file}:${issue.line} - ${issue.content.substring(0, 60)}`))
    })
    if (ISSUES.commentedCode.length > 10) {
      console.log(chalk.gray(`  ... and ${ISSUES.commentedCode.length - 10} more`))
    }
  }

  // console.log
  if (ISSUES.consoleLogs.length > 0) {
    console.log(chalk.yellow(`\n📢 console.log statements (${ISSUES.consoleLogs.length}):`))
    ISSUES.consoleLogs.slice(0, 10).forEach((issue) => {
      console.log(chalk.gray(`  ${issue.file}:${issue.line} - ${issue.content.substring(0, 60)}`))
    })
    if (ISSUES.consoleLogs.length > 10) {
      console.log(chalk.gray(`  ... and ${ISSUES.consoleLogs.length - 10} more`))
    }
  }

  // any types
  if (ISSUES.anyTypes.length > 0) {
    console.log(chalk.yellow(`\n🔤 'any' types (${ISSUES.anyTypes.length}):`))
    ISSUES.anyTypes.slice(0, 10).forEach((issue) => {
      console.log(chalk.gray(`  ${issue.file}:${issue.line} - ${issue.content.substring(0, 60)}`))
    })
    if (ISSUES.anyTypes.length > 10) {
      console.log(chalk.gray(`  ... and ${ISSUES.anyTypes.length - 10} more`))
    }
  }

  // debugger
  if (ISSUES.debugger.length > 0) {
    console.log(chalk.red(`\n🐛 debugger statements (${ISSUES.debugger.length}):`))
    ISSUES.debugger.forEach((issue) => {
      console.log(chalk.gray(`  ${issue.file}:${issue.line} - ${issue.content.substring(0, 60)}`))
    })
  }

  console.log(chalk.cyan(`\n📈 Total issues found: ${totalIssues}\n`))
  console.log(chalk.yellow('💡 Run "npm run code-review:fix" to attempt automatic fixes\n'))
}

runChecks()
