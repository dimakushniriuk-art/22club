#!/usr/bin/env node

/**
 * Script per ripristinare le API routes dopo il build Capacitor
 */

import fs from 'fs'
import path from 'path'

const apiDir = path.join(process.cwd(), 'src/app/api')
const iconDir = path.join(process.cwd(), 'src/app/icon-144x144.png')
const chatDir = path.join(process.cwd(), 'src/app/dashboard/atleti/[id]/chat')
const apiBackupDir = path.join(process.cwd(), '.api-backup')
const iconBackupDir = path.join(process.cwd(), '.icon-backup')
const chatBackupDir = path.join(process.cwd(), '.chat-backup')

// Ripristina le API routes
if (fs.existsSync(apiBackupDir)) {
  if (fs.existsSync(apiDir)) {
    fs.rmSync(apiDir, { recursive: true, force: true })
  }
  fs.renameSync(apiBackupDir, apiDir)
  console.log('✅ API routes ripristinate dopo build Capacitor')
} else {
  console.log('⚠️  Backup API routes non trovato')
}

// Ripristina anche la route icona
if (fs.existsSync(iconBackupDir)) {
  if (fs.existsSync(iconDir)) {
    fs.rmSync(iconDir, { recursive: true, force: true })
  }
  fs.renameSync(iconBackupDir, iconDir)
  console.log('✅ Route icona ripristinata dopo build Capacitor')
}

// Ripristina anche la route chat dinamica
if (fs.existsSync(chatBackupDir)) {
  if (fs.existsSync(chatDir)) {
    fs.rmSync(chatDir, { recursive: true, force: true })
  }
  fs.renameSync(chatBackupDir, chatDir)
  console.log('✅ Route chat dinamica ripristinata dopo build Capacitor')
}

// Ripristina tutte le route dinamiche
const dynamicRoutes = [
  'src/app/dashboard/atleti/[id]',
  'src/app/dashboard/schede/[id]',
  'src/app/home/allenamenti/[workout_plan_id]',
  'src/app/home/allenamenti/[workout_plan_id]/[day_id]',
]

// Ripristina anche le pagine server-side (commentato - non usato al momento)
// const serverSidePages = [
//   'src/app/dashboard/admin',
//   'src/app/dashboard/admin/organizzazioni',
//   'src/app/dashboard/admin/ruoli',
//   'src/app/dashboard/admin/statistiche',
//   'src/app/dashboard/admin/utenti',
//   'src/app/dashboard',
//   'src/app/post-login',
// ]

const dynamicBackupBase = path.join(process.cwd(), '.dynamic-routes-backup')

dynamicRoutes.forEach((route) => {
  const routePath = path.join(process.cwd(), route)
  const routeName = route.split('/').pop()
  const backupPath = path.join(dynamicBackupBase, routeName)
  
  if (fs.existsSync(backupPath)) {
    // Crea la directory padre se non esiste
    const parentDir = path.dirname(routePath)
    if (!fs.existsSync(parentDir)) {
      fs.mkdirSync(parentDir, { recursive: true })
    }
    
    if (fs.existsSync(routePath)) {
      fs.rmSync(routePath, { recursive: true, force: true })
    }
    fs.renameSync(backupPath, routePath)
    console.log(`✅ Route dinamica ${routeName} ripristinata dopo build Capacitor`)
  }
})

// Ripristina anche le pagine server-side
// Mappa i nomi dei backup ai percorsi originali
const serverSidePagesMap = {
  'page-admin': 'src/app/dashboard/admin',
  'page-dashboard': 'src/app/dashboard',
  'page-post-login': 'src/app/post-login',
}

Object.entries(serverSidePagesMap).forEach(([backupName, pagePath]) => {
  const fullPagePath = path.join(process.cwd(), pagePath)
  const backupPath = path.join(dynamicBackupBase, backupName)
  
  if (fs.existsSync(backupPath)) {
    // Crea la directory padre se non esiste
    const parentDir = path.dirname(fullPagePath)
    if (!fs.existsSync(parentDir)) {
      fs.mkdirSync(parentDir, { recursive: true })
    }
    
    if (fs.existsSync(fullPagePath)) {
      fs.rmSync(fullPagePath, { recursive: true, force: true })
    }
    fs.renameSync(backupPath, fullPagePath)
    console.log(`✅ Pagina server-side ${path.basename(pagePath)} ripristinata dopo build Capacitor`)
  }
})

// Rimuovi la cartella di backup se è vuota
if (fs.existsSync(dynamicBackupBase)) {
  try {
    const files = fs.readdirSync(dynamicBackupBase)
    if (files.length === 0) {
      fs.rmSync(dynamicBackupBase, { recursive: true, force: true })
    }
  } catch {
    // Ignora errori
  }
}
