# Script per terminare tutti i processi che usano la porta 3001

Write-Host "🔍 Cercando processi sulla porta 3001..." -ForegroundColor Cyan

# Trova tutti i processi che usano la porta 3001
$connections = netstat -ano | Select-String ":3001"

if ($connections) {
    Write-Host "`nProcessi trovati sulla porta 3001:" -ForegroundColor Yellow
    $pids = @()
    
    foreach ($line in $connections) {
        $parts = $line.ToString().Trim() -split '\s+'
        $pid = $parts[-1]
        
        if ($pid -and $pid -match '^\d+$') {
            $pids += [int]$pid
            $process = Get-Process -Id $pid -ErrorAction SilentlyContinue
            if ($process) {
                Write-Host "  - PID: $pid | Nome: $($process.ProcessName) | Path: $($process.Path)" -ForegroundColor Yellow
            } else {
                Write-Host "  - PID: $pid (processo non trovato)" -ForegroundColor Gray
            }
        }
    }
    
    # Rimuovi duplicati
    $pids = $pids | Select-Object -Unique
    
    if ($pids.Count -gt 0) {
        Write-Host "`nTerminando processi..." -ForegroundColor Cyan
        foreach ($pid in $pids) {
            try {
                $process = Get-Process -Id $pid -ErrorAction Stop
                Stop-Process -Id $pid -Force
                Write-Host "  ✅ Processo $pid ($($process.ProcessName)) terminato" -ForegroundColor Green
            } catch {
                Write-Host "  ⚠️  Impossibile terminare processo $pid : $_" -ForegroundColor Yellow
            }
        }
        
        Start-Sleep -Seconds 2
        
        # Verifica che siano stati terminati
        $remaining = netstat -ano | Select-String ":3001"
        if ($remaining) {
            Write-Host "`n⚠️  Attenzione: alcuni processi potrebbero essere ancora attivi" -ForegroundColor Yellow
            $remaining
        } else {
            Write-Host "`n✅ Porta 3001 ora libera!" -ForegroundColor Green
        }
    }
} else {
    Write-Host "✅ Nessun processo trovato sulla porta 3001" -ForegroundColor Green
}

# Termina anche tutti i processi Node.js rimanenti
Write-Host "`n🔍 Cercando processi Node.js rimanenti..." -ForegroundColor Cyan
$nodeProcesses = Get-Process -Name node -ErrorAction SilentlyContinue

if ($nodeProcesses) {
    Write-Host "Trovati $($nodeProcesses.Count) processi Node.js:" -ForegroundColor Yellow
    foreach ($proc in $nodeProcesses) {
        Write-Host "  - PID: $($proc.Id) | Path: $($proc.Path)" -ForegroundColor Yellow
        try {
            Stop-Process -Id $proc.Id -Force
            Write-Host "    ✅ Terminato" -ForegroundColor Green
        } catch {
            Write-Host "    ⚠️  Errore: $_" -ForegroundColor Yellow
        }
    }
} else {
    Write-Host "✅ Nessun processo Node.js trovato" -ForegroundColor Green
}

Write-Host "`n✅ Operazione completata!" -ForegroundColor Green

