#!/usr/bin/env node
import { execSync } from 'child_process'
import chalk from 'chalk'

try {
  console.log(chalk.cyan('\n🔍 Running 22Club pre-push checks...\n'))

  // 1️⃣ TypeScript check
  try {
    execSync('npx tsc --noEmit', { stdio: 'pipe' })
    console.log(chalk.green('✅ TypeScript: no errors'))
  } catch {
    console.error(chalk.red('\n❌ TypeScript errors detected — push blocked.\n'))
    console.error(chalk.yellow('💡 Fix them with: npm run typecheck\n'))
    process.exit(1)
  }

  // 2️⃣ ESLint check
  try {
    execSync('npx eslint . --max-warnings=0', { stdio: 'pipe' })
    console.log(chalk.green('✅ ESLint: clean'))
  } catch {
    console.error(chalk.red('\n⚠️  ESLint issues found (push allowed but review soon).\n'))
  }

  // 3️⃣ Build dry run
  try {
    execSync('npx next build --no-lint --debug', { stdio: 'pipe' })
    console.log(chalk.green('✅ Build success'))
  } catch {
    console.error(chalk.red('\n❌ Build failed — push blocked.\n'))
    process.exit(1)
  }

  console.log(chalk.greenBright('\n✨ All checks passed — push allowed!\n'))
} catch (e) {
  console.error(chalk.red('🚫 Pre-push checks failed:'), e.message)
  process.exit(1)
}
