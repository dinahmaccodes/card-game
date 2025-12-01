# Linot Quick Start Guide

## Prerequisites

```bash
rustup target add wasm32-unknown-unknown
cargo install linera-client@0.15.4
```

## Step 1: Start Linera Network (Terminal 1)

```bash
# Clean previous data
rm -rf ~/.config/linera /tmp/.tmp*

# Start network
linera net up --with-faucet --faucet-port 8080
```

Keep this terminal running. You should see:

```
Local test network successfully started.
Faucet has started
READY!
```

## Step 2: Deploy Contract (Terminal 2)

```bash
# Set faucet URL
export LINERA_FAUCET_URL=http://localhost:8080

# Initialize wallet
linera wallet init --faucet="$LINERA_FAUCET_URL"

# Request a chain
linera wallet request-chain --faucet="$LINERA_FAUCET_URL"

# Build contract
cd backend
cargo build --release --target wasm32-unknown-unknown

# Deploy application
cd ..
linera publish-and-create \
  backend/target/wasm32-unknown-unknown/release/backend_contract.wasm \
  backend/target/wasm32-unknown-unknown/release/backend_service.wasm \
  --json-argument '{"max_players": 2, "is_ranked": false, "strict_mode": false}'
```

Save the Application ID from the output.

## Step 3: Start GraphQL Service (Terminal 3)

```bash
linera service --port 8080
```

You should see:

```
GraphiQL IDE: http://localhost:8080/chains/{CHAIN_ID}/applications/{APP_ID}
```

Open that URL in your browser to test queries.

## Step 4: Frontend (Optional - Terminal 4)

```bash
cd frontend

# Create .env.local with your values:
cat > .env.local << EOF
VITE_CHAIN_ID=your_chain_id
VITE_APP_ID=your_app_id
VITE_GRAPHQL_URL=http://localhost:8080/chains/{CHAIN_ID}/applications/{APP_ID}
EOF

npm install
npm run dev
```

Access at http://localhost:5173

## Test Query

In GraphQL Playground:

```graphql
query {
  status
  deckSize
  currentPlayerIndex
  players {
    nickname
    cardCount
  }
}
```

Expected response:

```json
{
  "data": {
    "status": "WAITING",
    "deckSize": 0,
    "currentPlayerIndex": null,
    "players": []
  }
}
```

## Cleanup

Press Ctrl+C in each terminal to stop services.

```bash
pkill -f linera
rm -rf ~/.config/linera /tmp/.tmp*
```
