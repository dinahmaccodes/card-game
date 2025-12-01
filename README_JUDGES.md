# Linot Card Game - Deployment for Judges

## 🚀 One-Command Deployment

```bash
docker compose up --build
```

**Build Time:** 6-8 minutes (first run only)

**⚡ What Happens Automatically:**

1. **Builds backend** → Compiles Rust smart contract to WASM (264KB + 1.4MB)
2. **Starts Linera network** → Local blockchain with validator + faucet
3. **Creates wallet** → New blockchain identity generated
4. **Deploys contract** → Smart contract published to chain
5. **Captures IDs** → Chain ID and App ID extracted from deployment
6. **Generates config** → Creates `frontend/.env.local` automatically
7. **Starts frontend** → React app with pre-configured GraphQL endpoint

**You don't need to manually configure anything!**

---

## ✅ Success Indicators

Watch Docker logs for:

```
✅ Local test network successfully started
✅ Faucet has started
✅ Wallet initialized in XXX ms
✅ Finished `release` profile [optimized]
✅ VITE ready in XXX ms
✅ Local: http://localhost:5173/
```

**Container should stay running** (not exit)

---

## �� Access Endpoints

| Service      | URL                    | Test                                                           |
| ------------ | ---------------------- | -------------------------------------------------------------- |
| **Frontend** | http://localhost:5173  | Open in browser, check console (F12) for "✅ Chain connected!" |
| **GraphQL**  | http://localhost:8080  | Run query below                                                |
| **Shard**    | http://localhost:9001  | Blockchain validator                                           |
| **Proxy**    | http://localhost:13001 | Network proxy                                                  |

---

## 🧪 Quick Test

### Test GraphQL API

Visit http://localhost:8080 and run:

```graphql
{
  status
  config {
    maxPlayers
    isRanked
    strictMode
  }
}
```

**Expected:**

```json
{
  "data": {
    "status": "waiting_for_players",
    "config": {
      "maxPlayers": 2,
      "isRanked": false,
      "strictMode": false
    }
  }
}
```

### Test Frontend

1. Open http://localhost:5173
2. Press F12 (browser console)
3. See: `✅ Chain connected! Game state: ...`

### Verify Auto-Configuration (Optional)

**Check that deployment script generated the config file:**

```bash
cat frontend/.env.local
```

**Expected output:**

```env
VITE_CHAIN_ID=<64-char-hex>         # Your unique blockchain chain
VITE_APP_ID=<64-char-hex>           # Your deployed smart contract
VITE_OWNER_ID=0x<64-char-hex>       # Your wallet address
VITE_GRAPHQL_URL=http://localhost:8080  # GraphQL API endpoint
```

**Note:** These values are different for each deployment. The `run.bash` script automatically:

1. Captures them from `linera publish-and-create` output
2. Writes them to `frontend/.env.local`
3. Frontend reads them on startup

**The `.env.deployment` file in the root is a reference example only** - you don't need to use it.

---

## 📋 Template Compliance Check

### Dockerfile

```bash
diff Dockerfile template/Dockerfile
# Should output: (no differences)
```

**Template Requirements Met:**

- ✅ Base: `rust:1.86-slim`
- ✅ Linera: `v0.15.5`
- ✅ Node.js: LTS Krypton via NVM
- ✅ Exact copy from template

### compose.yaml

```bash
diff compose.yaml template/compose.yaml
# Should output: (no differences)
```

**Template Requirements Met:**

- ✅ Service name: `app`
- ✅ Ports: 5173, 8080, 9001, 13001
- ✅ Volume mount: `.:/build`
- ✅ Exact copy from template

### run.bash

Follows template pattern:

- ✅ Starts with `set -eu`
- ✅ Uses `linera_spawn` for network
- ✅ Ends with `wait`
- ✅ Adds backend build and frontend startup

---

## 🎮 Wave 3 Requirements

✅ **Frontend requests chain on page load**

- See `frontend/src/App.tsx` - `useGameState` hook polls every 3s
- Auto-connects to chain via GraphQL

✅ **GraphQL integration**

- Apollo Client in `frontend/src/graphql/client.ts`
- 10 queries defined in `queries.ts`
- 7 mutations defined in `mutations.ts`

✅ **Template compliance**

- Dockerfile matches template exactly
- compose.yaml matches template exactly
- run.bash follows template structure

✅ **Auto configuration**

- Chain ID captured on deployment
- App ID extracted from deployment output
- `.env.local` auto-generated with all IDs

---

## 🛠️ Troubleshooting

### Container exits immediately

```bash
docker compose down
docker compose up --build
```

### Ports already in use

```bash
pkill -f linera
docker compose down
docker compose up --build
```

### View logs after exit

```bash
docker compose logs
```

---

## 📁 Key Files

```
├── Dockerfile              # Template-compliant image
├── compose.yaml           # Template-compliant orchestration
├── run.bash               # Deployment script (auto-runs)
├── backend/               # Smart contract (Rust/WASM)
│   ├── src/contract.rs    # Game logic
│   ├── src/state.rs       # Game state
│   └── src/service.rs     # GraphQL service
├── frontend/              # React UI
│   ├── src/App.tsx        # Auto chain request
│   ├── src/graphql/       # Apollo Client
│   └── src/hooks/         # useGameState (polling)
└── frontend/.env.local    # Auto-generated IDs
```

---

## ⏱️ Evaluation Timeline

| Step                  | Time        | Action                              |
| --------------------- | ----------- | ----------------------------------- |
| 1. Start deployment   | 0:00        | Run `docker compose up --build`     |
| 2. Wait for build     | 0:00-6:00   | Rust compilation, npm install       |
| 3. Check success logs | 6:00        | See "VITE ready" message            |
| 4. Test frontend      | 7:00        | Visit localhost:5173, check console |
| 5. Test GraphQL       | 8:00        | Visit localhost:8080, run query     |
| 6. Verify config      | 9:00        | Check `.env.local` file             |
| **Total**             | **~10 min** | Including first-time build          |

---

## 📞 Quick Reset

If anything goes wrong:

```bash
docker compose down
docker compose up --build
```

---

**Built with Linera SDK v0.15.5 | Wave 3 Buildathon** 🚀
