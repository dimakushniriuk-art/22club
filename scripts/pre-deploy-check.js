import { execSync } from 'child_process'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const projectRoot = path.resolve(__dirname, '..')

const runCommand = (command, description) => {
  console.log(`🔍 ${description}...`)
  try {
    execSync(command, {
      cwd: projectRoot,
      stdio: 'pipe',
      encoding: 'utf8',
    })
    console.log(`✅ ${description} - PASSED`)
    return true
  } catch (error) {
    console.error(`❌ ${description} - FAILED`)
    console.error(error.message)
    return false
  }
}

const checkFileExists = (filePath, description) => {
  const fullPath = path.resolve(projectRoot, filePath)
  if (fs.existsSync(fullPath)) {
    console.log(`✅ ${description} - EXISTS`)
    return true
  } else {
    console.error(`❌ ${description} - MISSING`)
    return false
  }
}

const checkPackageJson = () => {
  console.log('📦 Checking package.json...')
  const packagePath = path.resolve(projectRoot, 'package.json')
  const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'))

  const requiredFields = ['name', 'version', 'scripts', 'dependencies']
  const missingFields = requiredFields.filter((field) => !packageJson[field])

  if (missingFields.length > 0) {
    console.error(`❌ package.json missing fields: ${missingFields.join(', ')}`)
    return false
  }

  console.log(`✅ package.json - Version: ${packageJson.version}`)
  return true
}

const checkEnvironmentFiles = () => {
  console.log('🔧 Checking environment files...')
  const envExample = checkFileExists('.env.example', 'Environment example file')
  const envLocal = checkFileExists('.env.local', 'Environment local file')

  if (!envExample) {
    console.error('❌ .env.example is required for deployment')
    return false
  }

  if (!envLocal) {
    console.warn('⚠️  .env.local not found - make sure to configure environment variables')
  }

  return true
}

const checkBuildFiles = () => {
  console.log('🏗️ Checking build files...')
  const nextConfig = checkFileExists('next.config.ts', 'Next.js config')
  const tailwindConfig = checkFileExists('tailwind.config.ts', 'Tailwind config')
  const tsConfig = checkFileExists('tsconfig.json', 'TypeScript config')

  return nextConfig && tailwindConfig && tsConfig
}

const checkDocPath = (primaryPath, fallbackPath, description) => {
  const primaryFull = path.resolve(projectRoot, primaryPath)
  if (fs.existsSync(primaryFull)) {
    console.log(`✅ ${description} - EXISTS (${primaryPath})`)
    return true
  }
  const fallbackFull = path.resolve(projectRoot, fallbackPath)
  if (fs.existsSync(fallbackFull)) {
    console.log(`✅ ${description} - EXISTS (${fallbackPath})`)
    return true
  }
  console.error(`❌ ${description} - MISSING (tried ${primaryPath}, ${fallbackPath})`)
  return false
}

const checkDocumentation = () => {
  console.log('📚 Checking documentation...')
  const readme = checkDocPath('README.md', 'DOCUMENTAZIONE/README.md', 'README file')
  const changelog = checkDocPath('CHANGELOG.md', 'DOCUMENTAZIONE/CHANGELOG.md', 'CHANGELOG file')
  const docsIndex = checkFileExists('docs/index.html', 'Docsify index')
  const storybookConfig = checkFileExists('.storybook/main.ts', 'Storybook config')

  return readme && changelog && docsIndex && storybookConfig
}

const checkTests = () => {
  console.log('🧪 Checking test files...')
  const testDir = checkFileExists('tests/', 'Tests directory')
  const vitestConfig = checkFileExists('vitest.config.ts', 'Vitest config')
  const playwrightConfig = checkFileExists('playwright.config.ts', 'Playwright config')

  return testDir && vitestConfig && playwrightConfig
}

const main = () => {
  console.log('🚀 Pre-deploy check starting...')
  console.log('='.repeat(50))

  const checks = [
    { name: 'Package.json', fn: checkPackageJson },
    { name: 'Environment files', fn: checkEnvironmentFiles },
    { name: 'Build files', fn: checkBuildFiles },
    { name: 'Documentation', fn: checkDocumentation },
    { name: 'Tests', fn: checkTests },
    {
      name: 'TypeScript check',
      fn: () => runCommand('npm run typecheck', 'TypeScript compilation'),
    },
    { name: 'Lint check', fn: () => runCommand('npm run lint', 'ESLint validation') },
    { name: 'Test run', fn: () => runCommand('npm run test:run', 'Unit tests') },
    { name: 'Build check', fn: () => runCommand('npm run build', 'Production build') },
  ]

  const results = checks.map((check) => ({
    name: check.name,
    passed: check.fn(),
  }))

  console.log('='.repeat(50))
  console.log('📊 Pre-deploy check results:')

  const passed = results.filter((r) => r.passed).length
  const total = results.length

  results.forEach((result) => {
    const status = result.passed ? '✅' : '❌'
    console.log(`${status} ${result.name}`)
  })

  console.log('='.repeat(50))
  console.log(`📈 Score: ${passed}/${total} checks passed`)

  if (passed === total) {
    console.log('🎉 All checks passed! Ready for deployment.')
    process.exit(0)
  } else {
    console.log('❌ Some checks failed. Please fix the issues before deploying.')
    process.exit(1)
  }
}

main()
