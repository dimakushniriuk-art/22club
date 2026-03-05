#!/usr/bin/env python3
"""
Script per dividere la migrazione completa in blocchi separati
"""
import re

SOURCE_FILE = "20250110_COMPLETE_TABLE_VERIFICATION_AND_ALIGNMENT.sql"

with open(SOURCE_FILE, 'r', encoding='utf-8') as f:
    content = f.read()

# Dividi per "-- PARTE X:"
parts = re.split(r'(?=-- ============================================================================\s*\n-- PARTE \d+:)', content)

for i, part in enumerate(parts[1:], 1):  # Salta il primo (header)
    # Estrai numero parte e nome
    match = re.search(r'-- PARTE (\d+):\s*(.+?)\s*\n--', part, re.DOTALL)
    if match:
        part_num = int(match.group(1))
        part_name = match.group(2).strip()
        
        # Pulisci nome per file
        safe_name = re.sub(r'[^a-zA-Z0-9\s]', '', part_name)
        safe_name = re.sub(r'\s+', '_', safe_name)
        safe_name = safe_name[:50].lower()
        
        filename = f"20250110_{part_num:03d}_{safe_name}.sql"
        
        # Scrivi file
        header = f"""-- ============================================================================
-- BLOCCO {part_num:03d}: {part_name}
-- Estratto da: {SOURCE_FILE}
-- Data: 2025-01-10
-- ============================================================================

"""
        with open(filename, 'w', encoding='utf-8') as out:
            out.write(header)
            out.write(part.strip())
            out.write('\n')
        
        print(f"✓ Creato: {filename}")

print(f"\n✓ Totale blocchi creati: {len(parts)-1}")

