#!/bin/bash

# Script di aggiornamento dipendenze - 22Club
# Data: 2025-01-10

set -e  # Esce se un comando fallisce

echo "🚀 Avvio aggiornamento dipendenze 22Club..."
echo ""

# Colori per output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Verifica che npm sia installato
if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm non trovato. Installa Node.js e npm prima di continuare.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ npm trovato: $(npm --version)${NC}"
echo ""

# Passo 1: Installazione dipendenze
echo -e "${YELLOW}📦 Passo 1/7: Installazione dipendenze aggiornate...${NC}"
npm install
echo -e "${GREEN}✅ Dipendenze installate${NC}"
echo ""

# Passo 2: Verifica TypeScript
echo -e "${YELLOW}🔍 Passo 2/7: Verifica TypeScript...${NC}"
if npm run typecheck; then
    echo -e "${GREEN}✅ TypeScript: nessun errore${NC}"
else
    echo -e "${RED}⚠️  TypeScript: errori trovati (verifica manualmente)${NC}"
fi
echo ""

# Passo 3: Verifica ESLint
echo -e "${YELLOW}🔍 Passo 3/7: Verifica ESLint...${NC}"
if npm run lint; then
    echo -e "${GREEN}✅ ESLint: nessun errore bloccante${NC}"
else
    echo -e "${YELLOW}⚠️  ESLint: warning trovati (normalmente non bloccanti)${NC}"
fi
echo ""

# Passo 4: Verifica build
echo -e "${YELLOW}🔨 Passo 4/7: Verifica build produzione...${NC}"
if npm run build; then
    echo -e "${GREEN}✅ Build: completata con successo${NC}"
else
    echo -e "${RED}❌ Build: fallita (verifica errori sopra)${NC}"
    exit 1
fi
echo ""

# Passo 5: Verifica vulnerabilità
echo -e "${YELLOW}🔒 Passo 5/7: Verifica vulnerabilità sicurezza...${NC}"
npm audit --audit-level=moderate || echo -e "${YELLOW}⚠️  Vulnerabilità trovate (esegui 'npm audit fix' se necessario)${NC}"
echo ""

# Passo 6: Test unitari (opzionale, può essere lento)
echo -e "${YELLOW}🧪 Passo 6/7: Esecuzione test unitari...${NC}"
if npm run test:run; then
    echo -e "${GREEN}✅ Test: tutti i test passati${NC}"
else
    echo -e "${YELLOW}⚠️  Test: alcuni test falliti (verifica manualmente)${NC}"
fi
echo ""

# Passo 7: Riepilogo
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✅ Aggiornamento completato!${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo "📋 Prossimi passi:"
echo "   1. Testa l'applicazione in sviluppo: npm run dev"
echo "   2. Se tutto funziona, committa le modifiche:"
echo "      git add package.json package-lock.json"
echo "      git commit -m 'chore: aggiorna dipendenze a versioni più recenti'"
echo ""
echo "📚 Documentazione:"
echo "   - AGGIORNAMENTO_DIPENDENZE_2025.md (piano completo)"
echo "   - ISTRUZIONI_AGGIORNAMENTO.md (istruzioni dettagliate)"
echo ""
