#!/usr/bin/env tsx
/**
 * Script per analizzare errori nel file schema SQL
 */

import { readFileSync, writeFileSync } from 'fs'
import { join } from 'path'
import { fileURLToPath } from 'url'
import { dirname } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const projectRoot = join(__dirname, '..')

const schemaFile = join(projectRoot, 'supabase-config-export/schema-with-data.sql')
const content = readFileSync(schemaFile, 'utf-8')

interface Error {
  type: string
  severity: 'error' | 'warning' | 'info'
  message: string
  line?: number
  context?: string
}

const errors: Error[] = []

// 1. Verifica sintassi base
console.log('🔍 Analisi schema SQL in corso...\n')

// 2. Verifica foreign keys che puntano a auth.users (schema di sistema)
const fkToAuthUsers = content.match(/REFERENCES auth\.users\(/g)
if (fkToAuthUsers) {
  errors.push({
    type: 'foreign_key_auth_schema',
    severity: 'warning',
    message: `Trovate ${fkToAuthUsers.length} foreign keys che puntano a auth.users`,
    context: 'Le FK a auth.users sono corrette, ma assicurati che lo schema auth esista',
  })
}

// 3. Verifica foreign keys duplicate
const fkPattern = /ADD CONSTRAINT (\w+)_fkey FOREIGN KEY/g
const fkMatches = [...content.matchAll(fkPattern)]
const fkNames = fkMatches.map((m) => m[1])
const duplicateFKs = fkNames.filter((name, index) => fkNames.indexOf(name) !== index)
if (duplicateFKs.length > 0) {
  errors.push({
    type: 'duplicate_foreign_key',
    severity: 'error',
    message: `Trovate ${duplicateFKs.length} foreign keys duplicate: ${duplicateFKs.join(', ')}`,
  })
}

// 4. Verifica riferimenti a funzioni non definite
const functionCalls = content.match(/public\.(\w+)\(/g)
const functionDefs = content.match(/CREATE FUNCTION public\.(\w+)\(/g)
const definedFunctions = functionDefs
  ? functionDefs.map((f) => f.match(/public\.(\w+)\(/)?.[1]).filter(Boolean)
  : []
const calledFunctions = functionCalls
  ? functionCalls.map((f) => f.match(/public\.(\w+)\(/)?.[1]).filter(Boolean)
  : []
const undefinedFunctions = calledFunctions.filter(
  (f) => !definedFunctions.includes(f) && !['uuid', 'now', 'jsonb', 'text', 'boolean'].includes(f),
)

// Filtra funzioni di sistema PostgreSQL
const systemFunctions = [
  'uuid_generate_v4',
  'now',
  'current_timestamp',
  'coalesce',
  'nullif',
  'row_to_json',
  'jsonb_build_object',
  'string_agg',
  'array_agg',
  'extract',
  'date_trunc',
  'to_timestamp',
  'to_char',
  'upper',
  'lower',
  'trim',
  'length',
  'substring',
  'replace',
  'regexp_replace',
  'cast',
  '::',
  'pg_get_functiondef',
  'pg_get_function_result',
  'pg_get_function_arguments',
  'obj_description',
  'col_description',
]
const realUndefined = undefinedFunctions.filter(
  (f) => !systemFunctions.some((sf) => f.includes(sf)),
)

if (realUndefined.length > 0) {
  errors.push({
    type: 'undefined_function',
    severity: 'warning',
    message: `Possibili funzioni non definite: ${[...new Set(realUndefined)].slice(0, 10).join(', ')}`,
    context: 'Verifica che queste funzioni siano definite o siano funzioni di sistema',
  })
}

// 5. Verifica riferimenti a tabelle in foreign keys
const tableRefs = content.match(/REFERENCES public\.(\w+)\(/g)
const tableDefs = content.match(/CREATE TABLE public\.(\w+)/g)
const definedTables = tableDefs
  ? tableDefs.map((t) => t.match(/public\.(\w+)/)?.[1]).filter(Boolean)
  : []
const referencedTables = tableRefs
  ? tableRefs.map((t) => t.match(/public\.(\w+)/)?.[1]).filter(Boolean)
  : []
const undefinedTables = referencedTables.filter((t) => !definedTables.includes(t) && t !== 'users') // users è in auth schema

if (undefinedTables.length > 0) {
  errors.push({
    type: 'undefined_table_reference',
    severity: 'error',
    message: `Tabelle referenziate ma non definite: ${[...new Set(undefinedTables)].join(', ')}`,
  })
}

// 6. Verifica trigger che referenziano funzioni
const triggerDefs = content.match(/CREATE TRIGGER (\w+) .* EXECUTE FUNCTION public\.(\w+)\(/g)
if (triggerDefs) {
  const triggerFunctions = triggerDefs
    .map((t) => {
      const match = t.match(/EXECUTE FUNCTION public\.(\w+)\(/)
      return match ? match[1] : null
    })
    .filter(Boolean)

  const undefinedTriggerFunctions = triggerFunctions.filter((f) => !definedFunctions.includes(f))
  if (undefinedTriggerFunctions.length > 0) {
    errors.push({
      type: 'undefined_trigger_function',
      severity: 'error',
      message: `Trigger che referenziano funzioni non definite: ${[...new Set(undefinedTriggerFunctions)].join(', ')}`,
    })
  }
}

// 7. Verifica ordine di creazione (tabelle prima delle FK)
// Questo è più complesso, ma pg_dump dovrebbe gestirlo correttamente

// 8. Verifica sintassi SQL base
const syntaxErrors = [
  { pattern: /CREATE TABLE[^;]*\([^)]*$/m, message: 'CREATE TABLE non chiuso correttamente' },
  { pattern: /ALTER TABLE[^;]*$/m, message: 'ALTER TABLE non chiuso correttamente' },
]

syntaxErrors.forEach(({ pattern, message }) => {
  if (pattern.test(content)) {
    errors.push({
      type: 'syntax_error',
      severity: 'error',
      message,
    })
  }
})

// 9. Verifica RLS policies che referenziano funzioni
const policyDefs = content.match(/CREATE POLICY (\w+) ON public\.(\w+) .* USING \((.*?)\)/gs)
if (policyDefs) {
  const policyFunctions: string[] = []
  policyDefs.forEach((policy) => {
    const functionMatches = policy.match(/public\.(\w+)\(/g)
    if (functionMatches) {
      functionMatches.forEach((fm) => {
        const funcName = fm.match(/public\.(\w+)\(/)?.[1]
        if (funcName) policyFunctions.push(funcName)
      })
    }
  })

  const undefinedPolicyFunctions = [...new Set(policyFunctions)].filter(
    (f) => !definedFunctions.includes(f) && !systemFunctions.some((sf) => f.includes(sf)),
  )
  if (undefinedPolicyFunctions.length > 0) {
    errors.push({
      type: 'undefined_policy_function',
      severity: 'warning',
      message: `Policies che referenziano possibili funzioni non definite: ${undefinedPolicyFunctions.slice(0, 10).join(', ')}`,
      context: 'Alcune potrebbero essere funzioni di sistema o essere definite altrove',
    })
  }
}

// 10. Verifica dipendenze circolari potenziali
// Questo richiederebbe un'analisi più approfondita

// Genera report
console.log(`📊 Analisi completata. Trovati ${errors.length} problemi.\n`)

if (errors.length === 0) {
  console.log('✅ Nessun errore trovato! Il file SQL sembra corretto.\n')
} else {
  console.log('⚠️  Problemi trovati:\n')

  const errorCount = errors.filter((e) => e.severity === 'error').length
  const warningCount = errors.filter((e) => e.severity === 'warning').length
  const infoCount = errors.filter((e) => e.severity === 'info').length

  console.log(`   🔴 Errori: ${errorCount}`)
  console.log(`   🟡 Warning: ${warningCount}`)
  console.log(`   🔵 Info: ${infoCount}\n`)

  errors.forEach((error) => {
    const icon = error.severity === 'error' ? '🔴' : error.severity === 'warning' ? '🟡' : '🔵'
    console.log(`${icon} [${error.type}] ${error.message}`)
    if (error.context) {
      console.log(`   └─ ${error.context}`)
    }
    if (error.line) {
      console.log(`   └─ Linea: ${error.line}`)
    }
    console.log('')
  })
}

// Salva report
const report = {
  analyzed_at: new Date().toISOString(),
  file: 'schema-with-data.sql',
  total_lines: content.split('\n').length,
  errors: errors.filter((e) => e.severity === 'error'),
  warnings: errors.filter((e) => e.severity === 'warning'),
  info: errors.filter((e) => e.severity === 'info'),
  summary: {
    total_errors: errors.filter((e) => e.severity === 'error').length,
    total_warnings: errors.filter((e) => e.severity === 'warning').length,
    total_info: errors.filter((e) => e.severity === 'info').length,
  },
  details: errors,
}

writeFileSync(
  join(projectRoot, 'supabase-config-export/schema-analysis-report.json'),
  JSON.stringify(report, null, 2),
  'utf-8',
)

console.log('📄 Report salvato in: supabase-config-export/schema-analysis-report.json\n')

// Genera markdown report
let markdown = `# 📊 Analisi Errori Schema SQL\n\n`
markdown += `**Data analisi**: ${new Date().toLocaleString('it-IT')}\n\n`
markdown += `**File analizzato**: schema-with-data.sql\n\n`
markdown += `**Righe totali**: ${content.split('\n').length}\n\n`

if (errors.length === 0) {
  markdown += `## ✅ Nessun Errore Trovato\n\n`
  markdown += `Il file SQL sembra corretto e pronto per l'uso.\n\n`
} else {
  markdown += `## 📋 Riepilogo\n\n`
  markdown += `- 🔴 **Errori**: ${errorCount}\n`
  markdown += `- 🟡 **Warning**: ${warningCount}\n`
  markdown += `- 🔵 **Info**: ${infoCount}\n\n`

  markdown += `## 🔴 Errori Critici\n\n`
  const criticalErrors = errors.filter((e) => e.severity === 'error')
  if (criticalErrors.length > 0) {
    criticalErrors.forEach((error, index) => {
      markdown += `### ${index + 1}. ${error.type}\n\n`
      markdown += `**Messaggio**: ${error.message}\n\n`
      if (error.context) {
        markdown += `**Contesto**: ${error.context}\n\n`
      }
      if (error.line) {
        markdown += `**Linea**: ${error.line}\n\n`
      }
    })
  } else {
    markdown += `Nessun errore critico trovato.\n\n`
  }

  markdown += `## 🟡 Warning\n\n`
  const warnings = errors.filter((e) => e.severity === 'warning')
  if (warnings.length > 0) {
    warnings.forEach((error, index) => {
      markdown += `### ${index + 1}. ${error.type}\n\n`
      markdown += `**Messaggio**: ${error.message}\n\n`
      if (error.context) {
        markdown += `**Contesto**: ${error.context}\n\n`
      }
    })
  } else {
    markdown += `Nessun warning trovato.\n\n`
  }
}

markdown += `## 📝 Note\n\n`
markdown += `- Questa analisi verifica errori comuni ma non è esaustiva\n`
markdown += `- Per una verifica completa, esegui il file SQL in un database di test\n`
markdown += `- pg_dump genera generalmente file SQL corretti e ben ordinati\n\n`

writeFileSync(
  join(projectRoot, 'supabase-config-export/schema-analysis-report.md'),
  markdown,
  'utf-8',
)

console.log('📄 Report markdown salvato in: supabase-config-export/schema-analysis-report.md\n')

if (errors.filter((e) => e.severity === 'error').length > 0) {
  process.exit(1)
}
