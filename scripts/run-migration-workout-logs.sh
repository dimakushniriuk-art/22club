#!/bin/bash
# Script per eseguire la migration SQL per fix workout_logs RLS policy
# 
# Questo script esegue la migration usando psql direttamente

set -e

# Colori per output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 Esecuzione Migration: Fix Workout Logs RLS Policy${NC}"
echo ""

# Verifica che psql sia installato
if ! command -v psql &> /dev/null; then
    echo -e "${RED}❌ Errore: psql non trovato${NC}"
    echo "Installa PostgreSQL client:"
    echo "  macOS: brew install postgresql"
    echo "  Ubuntu: sudo apt-get install postgresql-client"
    exit 1
fi

# Percorso del file migration
MIGRATION_FILE="supabase/migrations/20250117_fix_workout_logs_athlete_insert.sql"

# Verifica che il file esista
if [ ! -f "$MIGRATION_FILE" ]; then
    echo -e "${RED}❌ Errore: File migration non trovato: $MIGRATION_FILE${NC}"
    exit 1
fi

echo -e "${GREEN}✅ File migration trovato${NC}"
echo ""

# Chiedi la connection string
echo -e "${YELLOW}📋 Inserisci la connection string del database:${NC}"
echo "   (Trovala in: Supabase Dashboard > Settings > Database > Connection string)"
echo ""
echo "Esempio:"
echo "  postgresql://postgres.icibqnmtacibgnhaidlz:[PASSWORD]@aws-0-eu-central-1.pooler.supabase.com:5432/postgres"
echo ""
read -p "Connection string: " DB_URL

if [ -z "$DB_URL" ]; then
    echo -e "${RED}❌ Errore: Connection string vuota${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}🔌 Connessione al database...${NC}"

# Esegui la migration
if psql "$DB_URL" -f "$MIGRATION_FILE"; then
    echo ""
    echo -e "${GREEN}✅ Migration eseguita con successo!${NC}"
    echo ""
    echo -e "${GREEN}🔍 Verifica policy creata...${NC}"
    
    # Verifica che la policy sia stata creata
    psql "$DB_URL" -c "
        SELECT 
            policyname,
            cmd,
            with_check
        FROM pg_policies 
        WHERE schemaname = 'public' 
          AND tablename = 'workout_logs' 
          AND policyname = 'Athletes can insert own workout logs';
    "
    
    echo ""
    echo -e "${GREEN}🎉 Completato!${NC}"
else
    echo ""
    echo -e "${RED}❌ Errore durante l'esecuzione della migration${NC}"
    exit 1
fi
