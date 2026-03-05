# Script PowerShell per generare tipi TypeScript da Supabase remoto
# Usa l'autenticazione salvata nel profilo Supabase CLI

$PROJECT_REF = "icibqnmtacibgnhaidlz"
$SUPABASE_URL = "https://$PROJECT_REF.supabase.co"

Write-Host "[*] Generazione tipi TypeScript per progetto: $PROJECT_REF" -ForegroundColor Cyan
Write-Host "[*] URL: $SUPABASE_URL" -ForegroundColor Cyan
Write-Host ""

# Verifica autenticazione
Write-Host "[*] Verifica autenticazione..." -ForegroundColor Yellow
try {
    $projects = npx supabase projects list 2>&1
    if ($LASTEXITCODE -ne 0 -or $projects -match "Unauthorized") {
        Write-Host "[X] Non sei autenticato" -ForegroundColor Red
        Write-Host ""
        Write-Host "Esegui prima: npm run supabase:auth:setup" -ForegroundColor Yellow
        Write-Host "Oppure: npx supabase login" -ForegroundColor Yellow
        exit 1
    }
    Write-Host "[OK] Autenticazione verificata" -ForegroundColor Green
} catch {
    Write-Host "[X] Errore durante la verifica dell'autenticazione" -ForegroundColor Red
    Write-Host "Esegui: npm run supabase:auth:setup" -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "[*] Generazione tipi..." -ForegroundColor Cyan

$outputFile = "src/lib/supabase/types.ts"

try {
    # Genera i tipi usando il CLI Supabase (usa autenticazione salvata)
    npx supabase gen types typescript --project-id $PROJECT_REF | Out-File -FilePath $outputFile -Encoding utf8
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "[OK] Tipi generati con successo in $outputFile" -ForegroundColor Green
        
        # Verifica che il file sia stato creato
        if (Test-Path $outputFile) {
            $lines = (Get-Content $outputFile | Measure-Object -Line).Lines
            Write-Host "[*] Righe generate: $lines" -ForegroundColor Cyan
        }
        
        Write-Host ""
        Write-Host "[*] Prossimi passi:" -ForegroundColor Cyan
        Write-Host "1. Verifica i tipi: npm run typecheck" -ForegroundColor Yellow
        Write-Host "2. Build: npm run build" -ForegroundColor Yellow
    } else {
        Write-Host "[X] Errore durante la generazione dei tipi" -ForegroundColor Red
        Write-Host "Verifica che il project ID sia corretto e che tu abbia i permessi" -ForegroundColor Yellow
        exit 1
    }
} catch {
    $errorMsg = $_.Exception.Message
    Write-Host "[X] Errore: $errorMsg" -ForegroundColor Red
    exit 1
}
