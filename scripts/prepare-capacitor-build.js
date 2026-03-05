#!/usr/bin/env node

/**
 * Script per preparare il build Capacitor
 * Sposta temporaneamente le API routes per evitare errori con output: export
 */

import fs from 'fs'
import path from 'path'

const apiDir = path.join(process.cwd(), 'src/app/api')
const iconDir = path.join(process.cwd(), 'src/app/icon-144x144.png')
const chatDir = path.join(process.cwd(), 'src/app/dashboard/atleti/[id]/chat')
const apiBackupDir = path.join(process.cwd(), '.api-backup')
const iconBackupDir = path.join(process.cwd(), '.icon-backup')
const chatBackupDir = path.join(process.cwd(), '.chat-backup')

// Sposta le API routes
if (fs.existsSync(apiDir)) {
  if (fs.existsSync(apiBackupDir)) {
    fs.rmSync(apiBackupDir, { recursive: true, force: true })
  }
  fs.renameSync(apiDir, apiBackupDir)
  console.log('✅ API routes spostate temporaneamente per build Capacitor')
} else {
  console.log('⚠️  Cartella API non trovata, potrebbe essere già stata spostata')
}

// Sposta anche la route icona
if (fs.existsSync(iconDir)) {
  if (fs.existsSync(iconBackupDir)) {
    fs.rmSync(iconBackupDir, { recursive: true, force: true })
  }
  fs.renameSync(iconDir, iconBackupDir)
  console.log('✅ Route icona spostata temporaneamente per build Capacitor')
}

// Sposta anche la route chat dinamica
if (fs.existsSync(chatDir)) {
  if (fs.existsSync(chatBackupDir)) {
    fs.rmSync(chatBackupDir, { recursive: true, force: true })
  }
  fs.renameSync(chatDir, chatBackupDir)
  console.log('✅ Route chat dinamica spostata temporaneamente per build Capacitor')
}

// Sposta tutte le route dinamiche ([id], [workout_plan_id], ecc.)
const dynamicRoutes = [
  'src/app/dashboard/atleti/[id]',
  'src/app/dashboard/schede/[id]',
  'src/app/home/allenamenti/[workout_plan_id]',
  'src/app/home/allenamenti/[workout_plan_id]/[day_id]',
]

// Sposta anche pagine che usano cookies o altre funzionalità server-side
// NOTA: /post-login è un Client Component, quindi NON va spostata
const serverSidePages = [
  'src/app/dashboard/admin',
  'src/app/dashboard/admin/organizzazioni',
  'src/app/dashboard/admin/ruoli',
  'src/app/dashboard/admin/statistiche',
  'src/app/dashboard/admin/utenti',
  'src/app/dashboard',
]

const dynamicBackupBase = path.join(process.cwd(), '.dynamic-routes-backup')
if (!fs.existsSync(dynamicBackupBase)) {
  fs.mkdirSync(dynamicBackupBase, { recursive: true })
}

dynamicRoutes.forEach((route) => {
  const routePath = path.join(process.cwd(), route)
  const routeName = route.split('/').pop()
  const backupPath = path.join(dynamicBackupBase, routeName)
  
  if (fs.existsSync(routePath)) {
    if (fs.existsSync(backupPath)) {
      fs.rmSync(backupPath, { recursive: true, force: true })
    }
    fs.renameSync(routePath, backupPath)
    console.log(`✅ Route dinamica ${routeName} spostata temporaneamente per build Capacitor`)
  }
})

// Sposta anche le pagine server-side
serverSidePages.forEach((page) => {
  const pagePath = path.join(process.cwd(), page)
  const pageName = page.split('/').pop()
  const backupPath = path.join(dynamicBackupBase, `page-${pageName}`)
  
  if (fs.existsSync(pagePath)) {
    if (fs.existsSync(backupPath)) {
      fs.rmSync(backupPath, { recursive: true, force: true })
    }
    fs.renameSync(pagePath, backupPath)
    console.log(`✅ Pagina server-side ${pageName} spostata temporaneamente per build Capacitor`)
  }
})
