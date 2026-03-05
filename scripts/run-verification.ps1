# Script PowerShell per eseguire tutte le verifiche e generare un report

Write-Host "🔍 VERIFICA COMPLETA SERVIZI - 22Club" -ForegroundColor Cyan
Write-Host "=" * 70 -ForegroundColor Cyan

$report = @{
    timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    services = @()
}

# 1. Verifica Server Next.js
Write-Host "`n📡 1. VERIFICA SERVER NEXT.JS" -ForegroundColor Yellow
Write-Host "-" * 70

try {
    $response = Invoke-WebRequest -Uri "http://localhost:3001/api/health" -UseBasicParsing -TimeoutSec 5 -ErrorAction Stop
    $health = $response.Content | ConvertFrom-Json
    
    $report.services += @{
        name = "Next.js Server"
        status = "OK"
        message = "Server attivo su porta 3001"
        details = @{
            status = $health.status
            uptime = $health.uptime
            environment = $health.environment
        }
    }
    
    Write-Host "  ✅ Server attivo su http://localhost:3001" -ForegroundColor Green
    Write-Host "     Status: $($health.status)" -ForegroundColor Gray
    Write-Host "     Uptime: $([math]::Round($health.uptime))s" -ForegroundColor Gray
} catch {
    $report.services += @{
        name = "Next.js Server"
        status = "ERROR"
        message = $_.Exception.Message
    }
    Write-Host "  ❌ Errore: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "     💡 Assicurati che il server sia avviato con: npm run dev" -ForegroundColor Yellow
}

# 2. Verifica Configurazione Supabase
Write-Host "`n⚙️  2. VERIFICA CONFIGURAZIONE SUPABASE" -ForegroundColor Yellow
Write-Host "-" * 70

$envFile = ".env.local"
if (Test-Path $envFile) {
    $envContent = Get-Content $envFile -Raw
    $supabaseUrl = ($envContent | Select-String -Pattern "NEXT_PUBLIC_SUPABASE_URL=(.+)" | ForEach-Object { $_.Matches.Groups[1].Value }).Trim()
    $supabaseKey = ($envContent | Select-String -Pattern "NEXT_PUBLIC_SUPABASE_ANON_KEY=(.+)" | ForEach-Object { $_.Matches.Groups[1].Value }).Trim()
    
    if ($supabaseUrl -and $supabaseKey -and $supabaseUrl -notmatch "your_supabase" -and $supabaseKey -notmatch "your_supabase") {
        $projectId = if ($supabaseUrl -match "https://([^.]+)\.supabase\.co") { $matches[1] } else { "N/A" }
        
        $report.services += @{
            name = "Supabase Config"
            status = "OK"
            message = "Configurazione completa"
            details = @{
                projectId = $projectId
                urlConfigured = $true
                keyConfigured = $true
            }
        }
        
        Write-Host "  ✅ Configurazione completa" -ForegroundColor Green
        Write-Host "     Project ID: $projectId" -ForegroundColor Gray
    } else {
        $report.services += @{
            name = "Supabase Config"
            status = "ERROR"
            message = "Configurazione incompleta o placeholder non sostituiti"
        }
        Write-Host "  ❌ Configurazione incompleta" -ForegroundColor Red
    }
} else {
    $report.services += @{
        name = "Supabase Config"
        status = "ERROR"
        message = "File .env.local non trovato"
    }
    Write-Host "  ❌ File .env.local non trovato" -ForegroundColor Red
}

# 3. Esegui verifica Supabase con script TypeScript
Write-Host "`n🔗 3. VERIFICA CONNESSIONE SUPABASE" -ForegroundColor Yellow
Write-Host "-" * 70

try {
    $tsxOutput = npx tsx scripts/verify-supabase-config.ts 2>&1 | Out-String
    Write-Host $tsxOutput
    
    if ($tsxOutput -match "✅") {
        $report.services += @{
            name = "Supabase Connection"
            status = "OK"
            message = "Connessione riuscita"
        }
    } else {
        $report.services += @{
            name = "Supabase Connection"
            status = "ERROR"
            message = "Errore nella connessione"
        }
    }
} catch {
    $report.services += @{
        name = "Supabase Connection"
        status = "ERROR"
        message = $_.Exception.Message
    }
    Write-Host "  ❌ Errore durante la verifica" -ForegroundColor Red
}

# Report finale
Write-Host "`n" + ("=" * 70) -ForegroundColor Cyan
Write-Host "📊 REPORT FINALE" -ForegroundColor Cyan
Write-Host "=" * 70

$ok = ($report.services | Where-Object { $_.status -eq "OK" }).Count
$errors = ($report.services | Where-Object { $_.status -eq "ERROR" }).Count

Write-Host "`n✅ Servizi OK: $ok" -ForegroundColor Green
Write-Host "❌ Errori: $errors" -ForegroundColor $(if ($errors -gt 0) { "Red" } else { "Gray" })

if ($errors -gt 0) {
    Write-Host "`n❌ SERVIZI CON ERRORI:" -ForegroundColor Red
    $report.services | Where-Object { $_.status -eq "ERROR" } | ForEach-Object {
        Write-Host "  - $($_.name): $($_.message)" -ForegroundColor Red
    }
}

Write-Host "`n" + ("=" * 70) -ForegroundColor Cyan
if ($errors -eq 0) {
    Write-Host "✅ TUTTI I SERVIZI FUNZIONANO CORRETTAMENTE!" -ForegroundColor Green
} else {
    Write-Host "⚠️  ALCUNI SERVIZI RICHIEDONO ATTENZIONE" -ForegroundColor Yellow
}
Write-Host "=" * 70

# Salva report JSON
$report | ConvertTo-Json -Depth 10 | Out-File -FilePath "verification-report.json" -Encoding UTF8
Write-Host "`n📄 Report salvato in: verification-report.json" -ForegroundColor Cyan
