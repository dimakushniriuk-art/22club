# Script PowerShell per dividere la migrazione completa in blocchi
$sourceFile = "20250110_COMPLETE_TABLE_VERIFICATION_AND_ALIGNMENT.sql"
$content = Get-Content $sourceFile -Raw -Encoding UTF8

# Pattern per dividere per PARTE
$parts = $content -split '(?=-- ============================================================================\r?\n-- PARTE \d+:)'

$partNumber = 1
foreach ($part in $parts) {
    if ($part -match '-- PARTE (\d+):\s*(.+)') {
        $partNum = $matches[1].PadLeft(2, '0')
        $partName = $matches[2].Trim()
        
        # Pulisci il nome per usarlo come nome file
        $fileName = $partName -replace '[^a-zA-Z0-9\s]', '' -replace '\s+', '_' -replace '_+', '_'
        $fileName = $fileName.Substring(0, [Math]::Min($fileName.Length, 50))
        
        $outputFile = "20250110_$($partNum)_$($fileName.ToLower()).sql"
        
        # Aggiungi header al file
        $header = @"
-- ============================================================================
-- BLOCCO $($partNum): $partName
-- Estratto da: $sourceFile
-- Data: 2025-01-10
-- ============================================================================

"@
        
        $header + $part | Out-File $outputFile -Encoding UTF8 -NoNewline
        Write-Host "Creato: $outputFile"
        $partNumber++
    }
}

Write-Host "`nDivisone completata!"

