# Script PowerShell per rigenerare tipi TypeScript da Supabase remoto
# Uso: .\scripts\regenerate-types-remote.ps1

Write-Host "🔄 Rigenerazione tipi TypeScript da Supabase remoto..." -ForegroundColor Cyan

# Verifica se SUPABASE_ACCESS_TOKEN è impostato
if (-not $env:SUPABASE_ACCESS_TOKEN) {
    Write-Host "❌ Errore: SUPABASE_ACCESS_TOKEN non trovato" -ForegroundColor Red
    Write-Host ""
    Write-Host "Per ottenere il token:" -ForegroundColor Yellow
    Write-Host "1. Vai su https://supabase.com/dashboard/account/tokens" -ForegroundColor Yellow
    Write-Host "2. Crea un nuovo token" -ForegroundColor Yellow
    Write-Host "3. Esegui: `$env:SUPABASE_ACCESS_TOKEN = 'tuo-token'" -ForegroundColor Yellow
    Write-Host "4. Poi esegui questo script di nuovo" -ForegroundColor Yellow
    exit 1
}

# Verifica se PROJECT_REF è impostato
if (-not $env:SUPABASE_PROJECT_REF) {
    Write-Host "❌ Errore: SUPABASE_PROJECT_REF non trovato" -ForegroundColor Red
    Write-Host ""
    Write-Host "Per ottenere il project ref:" -ForegroundColor Yellow
    Write-Host "1. Vai su https://supabase.com/dashboard" -ForegroundColor Yellow
    Write-Host "2. Seleziona il tuo progetto" -ForegroundColor Yellow
    Write-Host "3. Vai su Settings → General" -ForegroundColor Yellow
    Write-Host "4. Copia il 'Reference ID'" -ForegroundColor Yellow
    Write-Host "5. Esegui: `$env:SUPABASE_PROJECT_REF = 'tuo-project-ref'" -ForegroundColor Yellow
    Write-Host "6. Poi esegui questo script di nuovo" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ Token trovato" -ForegroundColor Green
Write-Host "✅ Project ref: $env:SUPABASE_PROJECT_REF" -ForegroundColor Green
Write-Host ""

# Rigenera i tipi
Write-Host "📝 Rigenerazione tipi..." -ForegroundColor Cyan
$outputFile = "src/lib/supabase/types.ts"

try {
    npx supabase gen types typescript --project-id $env:SUPABASE_PROJECT_REF > $outputFile
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Tipi rigenerati con successo in $outputFile" -ForegroundColor Green
        Write-Host ""
        Write-Host "📋 Prossimi passi:" -ForegroundColor Cyan
        Write-Host "1. Verifica i tipi: npm run typecheck" -ForegroundColor Yellow
        Write-Host "2. Build: npm run build" -ForegroundColor Yellow
    } else {
        Write-Host "❌ Errore durante la rigenerazione dei tipi" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "❌ Errore: $_" -ForegroundColor Red
    exit 1
}
