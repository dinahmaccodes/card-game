#!/usr/bin/env bash

set -eu

eval "$(linera net helper)"
linera_spawn linera net up --with-faucet --faucet-port 8081

export LINERA_FAUCET_URL=http://localhost:8081

# Remove old wallet to avoid conflicts on container restart
rm -rf ~/.config/linera

linera wallet init --faucet="$LINERA_FAUCET_URL"
CHAIN_OUTPUT=$(linera wallet request-chain --faucet="$LINERA_FAUCET_URL")
export CHAIN_ID=$(echo "$CHAIN_OUTPUT" | head -n1)
export OWNER_ID=$(echo "$CHAIN_OUTPUT" | tail -n1)

# Build and publish your backend
cd backend
cargo build --release --target wasm32-unknown-unknown
cd ..

# Deploy application using publish-and-create
export APP_ID=$(linera publish-and-create \
  backend/target/wasm32-unknown-unknown/release/backend_contract.wasm \
  backend/target/wasm32-unknown-unknown/release/backend_service.wasm \
  --json-argument '{"max_players": 2, "is_ranked": false, "strict_mode": false}')

cat > frontend/.env.local << ENVEOF
VITE_CHAIN_ID=$CHAIN_ID
VITE_APP_ID=$APP_ID
VITE_OWNER_ID=$OWNER_ID
VITE_GRAPHQL_URL=http://localhost:8080/chains/$CHAIN_ID/applications/$APP_ID
VITE_CHAIN_GRAPHQL_URL=http://localhost:8080
VITE_FAUCET_URL=http://localhost:8081
ENVEOF

linera service --port 8080 &

# Build and run your frontend, if any
# Source NVM to make npm available
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

cd frontend
npm install
npm run dev -- --host 0.0.0.0 --port 5173 &
cd ..

wait
