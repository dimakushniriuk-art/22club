/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('fs')
const path = require('path')

const srcPath = path.join(__dirname, '..', 'src', 'components', 'shared', 'logo-22club.tsx')
const outPath = path.join(__dirname, '..', 'public', 'logo.svg')

const src = fs.readFileSync(srcPath, 'utf8')
const match = src.match(/<svg[\s\S]*?<\/svg>/s)
if (!match) {
  console.error('SVG not found')
  process.exit(1)
}

let svg = match[0]
  .replace(/style=\{\{\s*maskType:\s*'luminance'\s*\}\}/g, 'style="mask-type:luminance"')
  .replace(/\s*className=\{[^}]+\}/, '')

fs.writeFileSync(outPath, '<?xml version="1.0" encoding="UTF-8"?>\n' + svg)
console.log('Written', outPath)
