# Test Linot Backend NOW (10 minutes)

Quick testing checklist for the Linot card game backend on Linera.

---

## Prerequisites (2 minutes)

```bash
# Check you have everything:
rustc --version     # Need 1.86+
linera --version    # Need 0.15.6

# Install if missing:
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
rustup target add wasm32-unknown-unknown

# Option 1: Install from crates.io (recommended, faster)
cargo install --locked linera-storage-service@0.15.6
cargo install --locked linera-service@0.15.6

# Option 2: Install from GitHub source (alternative, if Option 1 fails)
git clone https://github.com/linera-io/linera-protocol.git
cd linera-protocol
cargo install --locked --path linera-storage-service
cargo install --locked --path linera-service
cd ..
```

---

## Testing Steps

### Step 1: Build (2 min)

```bash
git clone https://github.com/dinahmaccodes/linot-card-game.git
cd linot-card-game/backend
cargo build --target wasm32-unknown-unknown --release
cd ..
```

### Step 2: Start Network (30 sec) - TERMINAL 1

```bash
linera net up
# Copy the 3 export commands shown
# Keep this terminal running!
```

### Step 3: Deploy (1 min) - TERMINAL 2

```bash
# Paste export commands from Terminal 1
export LINERA_WALLET="/tmp/.tmpXXXX/wallet_0.json"      # Use YOUR path
export LINERA_KEYSTORE="/tmp/.tmpXXXX/keystore_0.json"  # Use YOUR path
export LINERA_STORAGE="rocksdb:/tmp/.tmpXXXX/client_0.db" # Use YOUR path

cd linot-card-game
linera publish-and-create \
  backend/target/wasm32-unknown-unknown/release/backend_contract.wasm \
  backend/target/wasm32-unknown-unknown/release/backend_service.wasm \
  --json-argument '{"max_players": 2, "is_ranked": false, "strict_mode": false}'

# Save the Application ID from output
```

### Step 4: Get IDs and Start Service (30 sec) - Still TERMINAL 2

```bash
linera wallet show
# Copy Chain ID and Application ID

linera service --port 8080
# Keep this terminal running!
```

### Step 5a: Test via Terminal (1 min) - TERMINAL 3

```bash
CHAIN_ID="YOUR_CHAIN_ID_HERE"  # Replace with actual ID Numbers
APP_ID="YOUR_APP_ID_HERE"      # Replace with actual ID Numbers

APP_ID="86e143565c7f3d62f5aa2986d6652cdebaed56559911cdd53836ef5c159f9903"
CHAIN_ID="eb4641a185be8977c034b69f4fb2e80cb91c81e5a6275e2a85f763777444719f"

curl -X POST "http://localhost:8080/chains/${CHAIN_ID}/applications/${APP_ID}" \
  -H "Content-Type: application/json" \
  -d '{"query": "query { status }"}'

# Expected: {"data":{"status":"WAITING"}}

curl -X POST "http://localhost:8080/chains/${CHAIN_ID}/applications/${APP_ID}" \
  -H "Content-Type: application/json" \
  -d '{"query": "query { config { maxPlayers isRanked strictMode } }"}'

# Expected: {"data":{"config":{"maxPlayers":2,"isRanked":false,"strictMode":false}}}

curl -X POST "http://localhost:8080/chains/${CHAIN_ID}/applications/${APP_ID}" \
  -H "Content-Type: application/json" \
  -d '{"query": "query { currentPlayer currentPlayerIndex }"}'

# Expected: {"data":{"currentPlayer":null,"currentPlayerIndex":0}}
# Note: null is CORRECT - no players joined yet. Query is working!
```

**Understanding null responses:**

- `null` = Query working, no data yet (no players joined)
- `0` = Initial value (deck not shuffled)
- Broken queries return `{"errors":[...]}`, not `{"data":{...}}`

```

### Step 5b: Test via Browser (2 min) - Visual Test with GraphQL

Open: `http://localhost:8080/chains/YOUR_CHAIN_ID/applications/YOUR_APP_ID`

Open: `http://localhost:8080/chains/eb4641a185be8977c034b69f4fb2e80cb91c81e5a6275e2a85f763777444719f/applications/86e143565c7f3d62f5aa2986d6652cdebaed56559911cdd53836ef5c159f9903`

```

### Input the actual details for CHAIN_ID AND APP_ID

### Example: http://localhost:8080/chains/d228a627388a5e78a6d3ec13732e32449817bcefdaf94a52404edfd2cb8a18de/applications/9aebcaf6388679681080dd8fc710db4d43429a0040417fe852958d9965f698ea

In GraphiQL (left panel), type:

````

```graphql
query {
  config {
    maxPlayers
    isRanked
    strictMode
  }
}
````

Click pink Play button ▶

---

## Success Checklist

- [x] Build completed without errors
- [x] Local network started (Terminal 1 running)
- [x] Application deployed (got Application ID)
- [x] GraphQL service running (Terminal 2 running)
- [x] curl test returned `{"data":{"status":"WAITING"}}`
- [x] Browser GraphiQL returned config with maxPlayers: 2

---

## What You Just Tested

**Backend:**

- Smart contract on Linera microchain
- GraphQL API with < 50ms response time
- Complete game state management
- Type-safe JSON responses

## Full Guides

- [QUICK_TEST.md](docs/QUICK_TEST.md) - Detailed walkthrough
- [TESTING_BACKEND.md](docs/TESTING_BACKEND.md) - Comprehensive testing
- [GRAPHQL_GUIDE.md](docs/GRAPHQL_GUIDE.md) - All 12 queries

---

**Questions?** Open issue: <https://github.com/dinahmaccodes/linot-card-game/issues>

Or Email: <mailto:dinahmaccodes@gmail.com>

Prefer to copy:

```
dinahmaccodes@gmail.com
```

**Built with Linera SDK** | Tested on Ubuntu
