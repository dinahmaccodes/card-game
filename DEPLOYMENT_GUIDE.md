# Linot Card Game - Deployment Guide

## 🎯 Based on Linera Buildathon Template

This guide is based on the official Linera buildathon template and explains how to build, test, and deploy the Linot card game application.

---

## 📋 Prerequisites

### Local Development

- **Rust**: 1.86 or later
- **Protobuf Compiler**: `protoc` (v21.11+)
- **Linera CLI**: v0.15.5
  ```bash
  cargo install --locked linera-service@0.15.5
  cargo install --locked linera-storage-service@0.15.5
  ```
- **Node.js**: LTS (via nvm recommended)
- **WASM Target**:
  ```bash
  rustup target add wasm32-unknown-unknown
  ```

### Docker Deployment (Recommended for Submission)

- **Docker**: Latest version
- **Docker Compose**: Latest version

---

## 🚀 Quick Start (Docker)

### 1. Clone and Navigate

```bash
cd /home/dinahmaccodes/Documents/codes-rust-linera/linot-card-game
```

### 2. Build and Run with Docker Compose

```bash
docker compose up --force-recreate
```

This will:

- Build the Docker container with all dependencies
- Start a local Linera network with faucet
- Build and deploy the backend contract
- Start the frontend (if configured)
- Expose services on:
  - **Frontend**: http://localhost:5173
  - **Faucet**: http://localhost:8080
  - **Validator Proxy**: http://localhost:9001
  - **Validator**: http://localhost:13001

### 3. Access Application

Open http://localhost:5173 in your browser to play the game.

---

## 🛠️ Local Development (Without Docker)

### Step 1: Start Local Linera Network

```bash
# Initialize the Linera network helper
eval "$(linera net helper)"

# Start local network with faucet on port 8080
linera net up --with-faucet --faucet-port 8080
```

Keep this terminal running. Open a new terminal for the next steps.

### Step 2: Initialize Wallet

```bash
# Set faucet URL
export LINERA_FAUCET_URL=http://localhost:8080

# Initialize wallet
linera wallet init --faucet="$LINERA_FAUCET_URL"

# Request a chain (your personal microchain)
linera wallet request-chain --faucet="$LINERA_FAUCET_URL"

# Verify setup
linera sync
linera query-balance
```

### Step 3: Build Backend Contract

```bash
cd backend

# Build for WASM target
cargo build --release --target wasm32-unknown-unknown

# Verify build succeeded
ls -lh target/wasm32-unknown-unknown/release/*.wasm
```

Expected output:

```
backend_contract.wasm
backend_service.wasm
```

### Step 4: Publish and Create Application

```bash
# Publish the contract and create an instance
linera publish-and-create \
  target/wasm32-unknown-unknown/release/backend_contract.wasm \
  target/wasm32-unknown-unknown/release/backend_service.wasm \
  --json-argument '{
    "max_players": 2,
    "host": "User:7136460f0c87ae46f966f898d494c4b40c4ae8c527f4d1c0b1fa0f7cff91d20f",
    "is_ranked": false,
    "strict_mode": false
  }'
```

**Important**: Replace the `host` value with your actual account owner. Get it by running:

```bash
linera wallet show
```

Save the **Application ID** from the output - you'll need it!

Example output:

```
Published bytecode at <bytecode-id>
Created application <application-id> on chain <chain-id>
```

### Step 5: Start Linera Service

```bash
# Start the GraphQL service
linera service --port 8080
```

Your backend is now running! GraphQL endpoint:

```
http://localhost:8080/chains/<chain-id>/applications/<app-id>
```

### Step 6: Build and Run Frontend

In a new terminal:

```bash
cd frontend

# Install dependencies
npm install

# Set environment variables
export VITE_GRAPHQL_ENDPOINT="http://localhost:8080/chains/<chain-id>/applications/<app-id>"
export VITE_APPLICATION_ID="<app-id>"
export VITE_CHAIN_ID="<chain-id>"

# Start development server
npm run dev
```

Frontend available at: http://localhost:5173

---

## 📝 Customizing run.bash for Docker

The `template/run.bash` file is executed inside the Docker container. Here's how to customize it:

```bash
#!/usr/bin/env bash

set -eu

# Start local Linera network
eval "$(linera net helper)"
linera_spawn linera net up --with-faucet

# Initialize wallet
export LINERA_FAUCET_URL=http://localhost:8080
linera wallet init --faucet="$LINERA_FAUCET_URL"
linera wallet request-chain --faucet="$LINERA_FAUCET_URL"

# Get the default chain and owner
DEFAULT_CHAIN=$(linera wallet show | grep "Default chain" | awk '{print $3}')
OWNER=$(linera wallet show | grep "Owner" | head -1 | awk '{print $2}')

# Build backend
cd /build/backend
cargo build --release --target wasm32-unknown-unknown

# Publish and create application
APP_OUTPUT=$(linera publish-and-create \
  target/wasm32-unknown-unknown/release/backend_contract.wasm \
  target/wasm32-unknown-unknown/release/backend_service.wasm \
  --json-argument "{\"max_players\": 2, \"host\": \"$OWNER\", \"is_ranked\": false, \"strict_mode\": false}")

# Extract application ID and chain ID
APP_ID=$(echo "$APP_OUTPUT" | grep -oP 'Created application \K[^ ]+' | cut -d' ' -f1)
CHAIN_ID="$DEFAULT_CHAIN"

# Start Linera service in background
linera service --port 8080 &

# Wait for service to be ready
sleep 5

# Build and run frontend
cd /build/frontend
npm install

# Set environment variables for frontend
export VITE_GRAPHQL_ENDPOINT="http://localhost:8080/chains/$CHAIN_ID/applications/$APP_ID"
export VITE_APPLICATION_ID="$APP_ID"
export VITE_CHAIN_ID="$CHAIN_ID"

# Start frontend (this keeps the container running)
npm run dev -- --host 0.0.0.0
```

---

## 🧪 Testing Your Deployment

### Execute Operations (via CLI)

```bash
# Join the match (Player 1)
linera execute-operation \
  --application-id <app-id> \
  --operation '{"JoinMatch": {"nickname": "Alice"}}'

# Join the match (Player 2 - use different wallet)
linera execute-operation \
  --application-id <app-id> \
  --operation '{"JoinMatch": {"nickname": "Bob"}}'

# Start the match (host only)
linera execute-operation \
  --application-id <app-id> \
  --operation '{"StartMatch": {}}'

# Play a card
linera execute-operation \
  --application-id <app-id> \
  --operation '{"PlayCard": {"card_index": 2, "chosen_suit": null}}'

# Draw a card
linera execute-operation \
  --application-id <app-id> \
  --operation '{"DrawCard": {}}'
```

### Query State (via GraphQL)

Open GraphiQL at: http://localhost:8080

```graphql
query {
  matchState {
    status
    currentPlayerIndex
    players {
      nickname
      cardCount
      isActive
      calledLastCard
    }
    topCard {
      suit
      value
    }
    activeShapeDemand
    pendingPenalty
  }
}
```

---

## 🐳 Docker Configuration Details

### Dockerfile Breakdown

```dockerfile
FROM rust:1.86-slim

# Install system dependencies
RUN apt-get update && apt-get install -y \
    pkg-config \
    protobuf-compiler \
    clang \
    make

# Install Linera CLI tools (v0.15.5)
RUN cargo install --locked \
    linera-service@0.15.5 \
    linera-storage-service@0.15.5

# Install Node.js via nvm
RUN apt-get install -y curl
RUN curl https://raw.githubusercontent.com/creationix/nvm/v0.40.3/install.sh | bash \
    && . ~/.nvm/nvm.sh \
    && nvm install lts/krypton \
    && npm install -g pnpm

# Set working directory
WORKDIR /build

# Healthcheck: wait for frontend to be ready
HEALTHCHECK CMD ["curl", "-s", "http://localhost:5173"]

# Run the build and start script
ENTRYPOINT bash /build/run.bash
```

### Compose Configuration

```yaml
services:
  app:
    build: .
    ports:
      - "5173:5173" # Frontend (Vite dev server)
      - "8080:8080" # Linera faucet & GraphQL service
      - "9001:9001" # Validator proxy
      - "13001:13001" # Validator
    volumes:
      - .:/build # Mount current directory
```

---

## 📊 Port Reference

| Port  | Service          | Purpose                           |
| ----- | ---------------- | --------------------------------- |
| 5173  | Frontend (Vite)  | React app for playing the game    |
| 8080  | Faucet / GraphQL | Get test tokens, query blockchain |
| 9001  | Validator Proxy  | Chain communication               |
| 13001 | Validator        | Block production and consensus    |

---

## 🔍 Troubleshooting

### Docker Issues

**Container keeps restarting:**

```bash
# Check logs
docker compose logs -f

# Check healthcheck status
docker compose ps
```

**Can't access services:**

```bash
# Verify ports are not already in use
lsof -i :5173
lsof -i :8080

# Stop conflicting services
kill <PID>
```

**Build fails:**

```bash
# Clean and rebuild
docker compose down -v
docker compose build --no-cache
docker compose up
```

### Local Development Issues

**Linera network won't start:**

```bash
# Kill existing processes
pkill -9 linera

# Clean state
rm -rf ~/.linera

# Restart
linera net up --with-faucet
```

**WASM build fails:**

```bash
# Ensure target installed
rustup target add wasm32-unknown-unknown

# Clean build
cd backend
cargo clean
cargo build --release --target wasm32-unknown-unknown
```

**Wallet initialization fails:**

```bash
# Check faucet is running
curl http://localhost:8080

# Re-initialize
rm -rf ~/.config/linera
linera wallet init --faucet=http://localhost:8080
```

---

## 🚢 Deployment to Testnet

### Prerequisites

- Linera Testnet access
- Testnet faucet URL

### Steps

```bash
# Initialize wallet for testnet
linera wallet init --faucet https://faucet.testnet-conway.linera.net

# Request testnet chain
linera wallet request-chain --faucet https://faucet.testnet-conway.linera.net

# Build release binaries
cd backend
cargo build --release --target wasm32-unknown-unknown

# Publish to testnet
linera publish-and-create \
  target/wasm32-unknown-unknown/release/backend_contract.wasm \
  target/wasm32-unknown-unknown/release/backend_service.wasm \
  --json-argument '<your-config>'

# Start service connected to testnet
linera service --port 8080
```

---

## 📋 Submission Checklist

Before submitting to buildathon:

- [ ] `run.bash` builds and starts both backend and frontend
- [ ] Docker healthcheck passes (frontend accessible)
- [ ] All ports follow template structure (5173, 8080, 9001, 13001)
- [ ] `docker compose up --force-recreate` works cleanly
- [ ] Application is playable at http://localhost:5173
- [ ] No manual intervention required after `docker compose up`
- [ ] README.md explains how to play the game
- [ ] Code is pushed to GitHub

---

## 🎮 Playing the Game

### Game Flow

1. **Access**: http://localhost:5173
2. **Join**: Two players click "Join Match" with nicknames
3. **Start**: Host clicks "Start Match" (cards are dealt)
4. **Play**: Take turns playing cards or drawing
5. **Win**: First player to empty their hand wins!

### Rules Summary

- **Match suit or number** of the top discard card
- **Whot card**: Wild card - choose next suit
- **Special cards**:
  - 1 (Hold On): Play again
  - 2 (Pick Two): Opponent draws 2
  - 5 (Pick Three): Opponent draws 3
  - 8 (Suspension): Skip opponent
  - 14 (General Market): All draw 1
- **Last Card**: Auto-called when 1 card left

---

## 📚 Additional Resources

- **Linera Docs**: https://linera.dev
- **Linera GitHub**: https://github.com/linera-io/linera-protocol
- **Buildathon Template**: https://github.com/linera-io/linera-buildathon-template
- **Game Rules**: `docs/backend_whot_rules.md`
- **Architecture**: `docs/technical_architecture.md`
- **Build Guide**: `backend/CONTRACT_BUILD_GUIDE.md`

---

## 💡 Tips for Development

### Fast Iteration

```bash
# Use cargo watch for auto-rebuild
cargo install cargo-watch
cargo watch -x 'build --target wasm32-unknown-unknown'
```

### Debug GraphQL Queries

Open http://localhost:8080 in browser - GraphiQL interface auto-loads

### Multiple Players

Use different wallet configurations:

```bash
# Terminal 1 (Player 1)
export LINERA_WALLET=~/.config/linera/wallet1.json
export LINERA_STORAGE=rocksdb:~/.config/linera/wallet1.db

# Terminal 2 (Player 2)
export LINERA_WALLET=~/.config/linera/wallet2.json
export LINERA_STORAGE=rocksdb:~/.config/linera/wallet2.db
```

### View Blockchain State

```bash
# Show wallet info
linera wallet show

# Query chain balance
linera query-balance

# List applications
linera wallet applications
```

---

**Ready to Deploy! 🚀**

_Last Updated: 2025-11-10_  
_Linera SDK: 0.15.5_  
_Template Version: Buildathon Official_
