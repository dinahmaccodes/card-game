# Common Issues When Testing Linot Backend

Quick fixes for the most common problems when testing the Linot backend locally.

---

## Issue 1

### "Filesystem error: No such file or directory"

**Symptom:**

```
Error: Filesystem error: No such file or directory
```

**The Reason for the Error:** Using placeholder paths like `/tmp/.tmpXXXXX/` instead of real paths

**The Fix:**

```bash
# In Terminal 1, you should see:
export LINERA_WALLET="/tmp/.tmpABC123/wallet_0.json"      # ← Copy YOUR actual path
export LINERA_KEYSTORE="/tmp/.tmpABC123/keystore_0.json"
export LINERA_STORAGE="rocksdb:/tmp/.tmpABC123/client_0.db"

# Copy these EXACT commands to Terminal 2
# Don't use the example paths - use YOUR paths!
```

---

## Issue 2

### curl hangs with no response

**Symptom:**

```bash
curl -X POST "http://localhost:8080/..."
# Hangs forever, no response
```

**The Reason for the Error:** GraphQL service not using local network environment variables

**The Fix:**

```bash
# In Terminal 2, BEFORE running `linera service`:
export LINERA_WALLET="/tmp/.tmpABC123/wallet_0.json"      # Use YOUR path
export LINERA_KEYSTORE="/tmp/.tmpABC123/keystore_0.json"
export LINERA_STORAGE="rocksdb:/tmp/.tmpABC123/client_0.db"

# Then start service:
linera service --port 8080
```

**Verify it worked:**

```bash
# Service should show:
GraphiQL IDE: http://localhost:8080
# Ensure to xlose this after so you can fun the actual graphql link with App_ID and CHAIN_ID

# NOT:
# Using Conway testnet...  ← This is wrong!
```

---

## "Invalid chain ID" or "Blobs not found"

**Symptom:**

```json
{ "errors": [{ "message": "Blobs not found" }] }
```

**The Reason for the Error:** Wrong Chain ID or App ID in URL/command

**The Fix:**

```bash
# Get the CORRECT IDs (in Terminal 2):
linera wallet show

# Look for:
# Chain ID: d228a627388a5e78a6d3ec13732e32449817bcefdaf94a52404edfd2cb8a18de
# Application ID: 9aebcaf6388679681080dd8fc710db4d43429a0040417fe852958d9965f698ea -
# the APPLICATION_ID OR APP_ID should show after you run the linera publish-and-create command

# Use these EXACT values in your curl command:
CHAIN_ID="d228a627388a5e78a6d3ec13732e32449817bcefdaf94a52404edfd2cb8a18de"
APP_ID="9aebcaf6388679681080dd8fc710db4d43429a0040417fe852958d9965f698ea"

curl -X POST "http://localhost:8080/chains/${CHAIN_ID}/applications/${APP_ID}" \
  -H "Content-Type: application/json" \
  -d '{"query": "query { status }"}'
```

---

## "Variables are invalid JSON" in GraphiQL

**Symptom:**
In browser GraphiQL, error at bottom:

```
Variables are invalid JSON
```

**The Reason for the Error:** Typing query in wrong panel (Variables instead of Query Editor)

**The Fix:**

```
┌───────────────────────────────────────────────────────┐
│ GraphiQL Interface Layout:                            │
├───────────────────────────────────────────────────────┤
│                                                       │
│  ┌──────────────────────┐  ┌─────────────────────┐    │
│  │  QUERY EDITOR        │  │  RESULTS            │    │
│  │  (LEFT SIDE)         │  │  (RIGHT SIDE)       │    │
│  │ DELETE # COMMENTS    │  │                     │    │
│  │   TYPE QUERY HERE    │  │   Results appear    │    │
│  │                      │  │     here            │    │
│  │  query {             │  │                     │    │
│  │    status            │  │                     │    │
│  │  }                   │  │                     │    │
│  └──────────────────────┘  └─────────────────────┘    │
│                                                       │
│  ┌──────────────────────────────────────────────┐     │
│  │  VARIABLES (BOTTOM)                          │     │
│  │  ← LEAVE EMPTY for simple queries            │     │
│  └──────────────────────────────────────────────┘     │
│                                                       │
└───────────────────────────────────────────────────────┘
```

**Steps:**

1. Delete any text in the Variables panel (bottom)
2. Click in the Query Editor (left side)
3. Type your query there
4. Click pink Play button

---

## Port already in use

**Symptom:**

```
Error: Address already in use (os error 98)
```

**The Reason for the Error:** Previous Linera process still running

**The Fix:**

```bash
# Kill all Linera processes:
pkill -f linera

# Wait 2 seconds
sleep 2

# Restart from Step 2 (linera net up)
cd linot-card-game
linera net up
```

---

## Build fails with "cannot find wasm32-unknown-unknown"

**Symptom:**

```
error: can't find crate for `std`
target 'wasm32-unknown-unknown' not found
```

**Cause:** WASM target not installed

**Fix:**

```bash
rustup target add wasm32-unknown-unknown

# Verify:
rustup target list | grep wasm32
# Should show: wasm32-unknown-unknown (installed)

# Rebuild:
cd backend
cargo build --target wasm32-unknown-unknown --release
```

---

## "linera: command not found"

**Symptom:**

```bash
linera --version
# bash: linera: command not found
```

**Cause:** Linera CLI not installed

**Fix:**

```bash
# Option 1: Install from crates.io (recommended)
cargo install --locked linera-storage-service@0.15.6
cargo install --locked linera-service@0.15.6

# Option 2: Install from GitHub source (if Option 1 fails)
git clone https://github.com/linera-io/linera-protocol.git
cd linera-protocol
cargo install --locked --path linera-storage-service
cargo install --locked --path linera-service
cd ..

# Verify:
linera --version
# Should show: linera 0.15.6 (or similar)

# If still not found, check PATH:
echo $PATH | grep cargo
# Should include ~/.cargo/bin

# Add to PATH if missing:
echo 'export PATH="$HOME/.cargo/bin:$PATH"' >> ~/.bashrc
source ~/.bashrc
```

---

## GraphQL returns empty data `{"data":{}}`

**Symptom:**

```json
{ "data": {} }
```

**The Reason for the Error:** Query field name incorrect or typo

**The Fix:**

```bash
# Check available fields:
curl -X POST "http://localhost:8080/chains/${CHAIN_ID}/applications/${APP_ID}" \
  -H "Content-Type: application/json" \
  -d '{"query": "query { __schema { queryType { fields { name } } } }"}'

# Common queries:
#  status (not matchStatus)
#  deckSize (not deckcount)
#  config (not configuration)
#  players (not playerList)
```

---

## "Cannot deserialize AccountOwner"

**Symptom:**

```
Error: Cannot deserialize AccountOwner from JSON
```

**Cause:** Using old version of code (before Wave 2 fix)

**Fix:**

```bash
# Pull latest code:
cd linot-card-game
git pull origin backend-graphql

# Rebuild:
cd backend
cargo build --target wasm32-unknown-unknown --release

# Redeploy (from project root):
cd ..
linera publish-and-create \
  backend/target/wasm32-unknown-unknown/release/backend_contract.wasm \
  backend/target/wasm32-unknown-unknown/release/backend_service.wasm \
  --json-argument '{"max_players": 2, "is_ranked": false, "strict_mode": false}'
```

---

## Verification Checklist

After fixing issues, verify everything works:

```bash
# 1. Environment variables set (in Terminal 2)
echo $LINERA_WALLET
# Should show: /tmp/.tmpXXXX/wallet_0.json (with YOUR path)

# 2. Service running
curl http://localhost:8080
# Should NOT hang or error

# 3. Correct IDs
linera wallet show
# Copy Chain ID and App ID

# 4. Working query
curl -X POST "http://localhost:8080/chains/${CHAIN_ID}/applications/${APP_ID}" \
  -H "Content-Type: application/json" \
  -d '{"query": "query { status }"}'
# Should return: {"data":{"status":"WAITING"}}
```

---

## Still Stuck?

1. **Check logs:**

   ```bash
   # Terminal 1 (linera net up) should show:
   #  READY!

   # Terminal 2 (linera service) should show:
   #  GraphiQL IDE: http://localhost:8080
   ```

2. **Clean restart:**

   ```bash
   # Stop all terminals (Ctrl+C in each)
   pkill -f linera

   # Remove temp files
   rm -rf /tmp/.tmp*

   # Start fresh from Step 2
   cd linot-card-game
   linera net up
   ```

3. **Open an issue:**
   - GitHub: <https://github.com/dinahmaccodes/linot-card-game/issues>
   - Include: OS, Rust version, error message, command you ran

---

## Further Guides You might want to check out

- [QUICK_TEST.md](./QUICK_TEST.md) - Full testing walkthrough
- [TESTING_BACKEND.md](./TESTING_BACKEND.md) - Comprehensive guide
- [GRAPHQL_GUIDE.md](./GRAPHQL_GUIDE.md) - API reference

---

**Most issues are fixed by:**

1. Using YOUR actual export paths (not examples) - This is very important please
2. Setting environment variables BEFORE starting service
3. Using correct Chain ID and App ID from `linera wallet show`

Built with Linera SDK 0.15.4 | Tested on Ubuntu 22.04+ |
