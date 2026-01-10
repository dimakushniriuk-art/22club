#!/bin/bash
# Script bash alternativo per risolvere errori di build
# Uso: ./scripts/fix-build-errors.sh

MAX_ITERATIONS=50
ITERATION=0
LAST_ERROR_COUNT=999

echo "🚀 Avvio risoluzione automatica errori di build..."
echo ""

while [ $ITERATION -lt $MAX_ITERATIONS ]; do
  ITERATION=$((ITERATION + 1))
  echo "📦 Iterazione $ITERATION: Esecuzione build..."
  
  # Esegui build e cattura output
  BUILD_OUTPUT=$(npm run build 2>&1)
  BUILD_STATUS=$?
  
  if [ $BUILD_STATUS -eq 0 ]; then
    echo ""
    echo "✅ Build completata con successo!"
    exit 0
  fi
  
  # Estrai errori TypeScript
  ERRORS=$(echo "$BUILD_OUTPUT" | grep -E "Type error:" | wc -l)
  
  if [ "$ERRORS" -eq 0 ]; then
    echo ""
    echo "⚠️  Nessun errore TypeScript trovato, ma build fallita."
    echo "Ultime righe output:"
    echo "$BUILD_OUTPUT" | tail -20
    exit 1
  fi
  
  echo ""
  echo "❌ Trovati $ERRORS errori TypeScript"
  
  # Se il numero di errori non diminuisce, fermati
  if [ "$ERRORS" -ge "$LAST_ERROR_COUNT" ]; then
    echo ""
    echo "⚠️  Il numero di errori non sta diminuendo. Fermata automatica."
    echo ""
    echo "Errori rimanenti:"
    echo "$BUILD_OUTPUT" | grep -E "Type error:" | head -10
    exit 1
  fi
  
  LAST_ERROR_COUNT=$ERRORS
  
  # Estrai primo errore
  FIRST_ERROR=$(echo "$BUILD_OUTPUT" | grep -E "Type error:" | head -1)
  ERROR_FILE=$(echo "$BUILD_OUTPUT" | grep -B 5 "Type error:" | grep -E "^\./" | head -1 | cut -d: -f1 | sed 's|^\./||')
  ERROR_LINE=$(echo "$BUILD_OUTPUT" | grep -B 5 "Type error:" | grep -E "^\./" | head -1 | cut -d: -f2)
  
  if [ -z "$ERROR_FILE" ]; then
    echo "⚠️  Impossibile estrarre informazioni errore. Output:"
    echo "$BUILD_OUTPUT" | tail -30
    exit 1
  fi
  
  echo ""
  echo "🔍 Analisi errore:"
  echo "   File: $ERROR_FILE"
  echo "   Linea: $ERROR_LINE"
  echo "   Messaggio: $FIRST_ERROR"
  echo ""
  echo "⚠️  Fix automatico non disponibile in bash."
  echo "   Usa lo script TypeScript: npx tsx scripts/fix-build-errors.ts"
  echo ""
  echo "📝 Errore che richiede intervento manuale:"
  echo "   $ERROR_FILE:$ERROR_LINE"
  echo "   $FIRST_ERROR"
  exit 1
done

echo ""
echo "⚠️  Raggiunto il limite massimo di iterazioni ($MAX_ITERATIONS)"
exit 1
