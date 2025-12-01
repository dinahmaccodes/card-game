#!/usr/bin/env bash

# Test GraphQL Integration for Linot Card Game
# This script tests GraphQL queries against the running Linot application

set -e

echo "================================================"
echo "Linot Card Game - GraphQL Integration Test"
echo "================================================"
echo ""

# Load environment variables from .env.local
if [ ! -f "frontend/.env.local" ]; then
    echo "❌ ERROR: frontend/.env.local not found!"
    echo "   Run './run.bash' first to deploy the application"
    exit 1
fi

source frontend/.env.local

echo "📋 Configuration:"
echo "   Chain ID: $VITE_CHAIN_ID"
echo "   App ID: $VITE_APP_ID"
echo "   GraphQL URL: $VITE_GRAPHQL_URL"
echo ""

# Test 1: Check if endpoint is accessible
echo "🔍 Test 1: Checking if GraphQL endpoint is accessible..."
if curl -s -o /dev/null -w "%{http_code}" "$VITE_GRAPHQL_URL" | grep -q "200\|400\|405"; then
    echo "✅ Endpoint is accessible"
else
    echo "❌ Endpoint not accessible. Is the container running?"
    echo "   Try: docker compose up"
    exit 1
fi
echo ""

# Test 2: Query match status
echo "🔍 Test 2: Querying match status..."
STATUS_RESPONSE=$(curl -s "$VITE_GRAPHQL_URL" \
    -X POST \
    -H "Content-Type: application/json" \
    -d '{"query": "query { status }"}')

echo "Response: $STATUS_RESPONSE"

if echo "$STATUS_RESPONSE" | grep -q "\"status\""; then
    echo "✅ Status query successful!"
else
    echo "❌ Status query failed"
    echo "   This might mean the service hasn't implemented GraphQL properly"
fi
echo ""

# Test 3: Query game configuration
echo "🔍 Test 3: Querying game configuration..."
CONFIG_RESPONSE=$(curl -s "$VITE_GRAPHQL_URL" \
    -X POST \
    -H "Content-Type: application/json" \
    -d '{"query": "query { config { maxPlayers cardsPerPlayer } }"}')

echo "Response: $CONFIG_RESPONSE"

if echo "$CONFIG_RESPONSE" | grep -q "\"maxPlayers\""; then
    echo "✅ Config query successful!"
else
    echo "❌ Config query failed"
fi
echo ""

# Test 4: Query deck size
echo "🔍 Test 4: Querying deck size..."
DECK_RESPONSE=$(curl -s "$VITE_GRAPHQL_URL" \
    -X POST \
    -H "Content-Type: application/json" \
    -d '{"query": "query { deckSize }"}')

echo "Response: $DECK_RESPONSE"

if echo "$DECK_RESPONSE" | grep -q "\"deckSize\""; then
    echo "✅ Deck size query successful!"
else
    echo "❌ Deck size query failed"
fi
echo ""

# Test 5: Query top card
echo "🔍 Test 5: Querying top card..."
CARD_RESPONSE=$(curl -s "$VITE_GRAPHQL_URL" \
    -X POST \
    -H "Content-Type: application/json" \
    -d '{"query": "query { topCard { suit rank } }"}')

echo "Response: $CARD_RESPONSE"

if echo "$CARD_RESPONSE" | grep -q "topCard"; then
    echo "✅ Top card query successful!"
else
    echo "❌ Top card query failed"
fi
echo ""

# Test 6: WRONG endpoint (for comparison)
echo "🔍 Test 6: Testing WRONG endpoint (chain-level)..."
echo "   This should FAIL with 'owner required' error:"
WRONG_RESPONSE=$(curl -s "http://localhost:8080" \
    -X POST \
    -H "Content-Type: application/json" \
    -d '{"query": "query { chainId }"}')

echo "Response: $WRONG_RESPONSE"

if echo "$WRONG_RESPONSE" | grep -q "owner.*required"; then
    echo "✅ Correctly fails at chain endpoint (as expected)"
else
    echo "⚠️  Unexpected response from chain endpoint"
fi
echo ""

echo "================================================"
echo "✅ GraphQL Integration Test Complete!"
echo ""
echo "Next Steps:"
echo "1. Test frontend GraphQL integration"
echo "2. Add MutationRoot to backend/src/service.rs"
echo "3. Implement playCard, drawCard mutations"
echo "================================================"
