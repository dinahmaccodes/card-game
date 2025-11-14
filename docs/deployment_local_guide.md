# Linot Card Game - Local Deployment Guide

This guide walks you through deploying the Linot card game on a local Linera network.

## Prerequisites

1. **Install Linera CLI** (v0.15.4 or later)

   ```bash
   cargo install --git https://github.com/linera-io/linera-protocol.git --locked linera-service
   ```

2. **Install Rust toolchain with WASM target**
   ```bash
   rustup target add wasm32-unknown-unknown
   ```

## Step 1: Build the Backend WASM Files

In your project directory, build the contract and service WASM binaries:

```bash
cd backend
cargo build --target wasm32-unknown-unknown --release
```

This will create:

- `backend/target/wasm32-unknown-unknown/release/backend_contract.wasm` 
- `backend/target/wasm32-unknown-unknown/release/backend_service.wasm` 

## Step 2: Start Local Linera Network

**TERMINAL 1** - Start and keep the network running:

```bash
cd /path/to/linot-card-game
linera net up
```

This command will:

- Create a local test network in `/tmp/.tmpXXXXX/`
- Start a validator on port 9001
- Start a proxy on port 13001
- Display wallet and storage paths

**IMPORTANT:** Keep this terminal running. Do not close it.

The output will show paths like:

```
LINERA_WALLET="/tmp/.tmpXXXXX/wallet_0.json"
LINERA_KEYSTORE="/tmp/.tmpXXXXX/keystore_0.json"
LINERA_STORAGE="rocksdb:/tmp/.tmpXXXXX/client_0.db"
```

Copy these paths - you'll need them in the next steps.

## Step 3: Deploy the Application

**TERMINAL 2** - Open a new terminal for deployment:

First, export the environment variables from Terminal 1:

```bash
export LINERA_WALLET="/tmp/.tmpXXXXX/wallet_0.json"
export LINERA_KEYSTORE="/tmp/.tmpXXXXX/keystore_0.json"
export LINERA_STORAGE="rocksdb:/tmp/.tmpXXXXX/client_0.db"
```

Replace the paths with your actual paths from Terminal 1.

Navigate to the project directory:

```bash
cd /path/to/linot-card-game
```

Deploy the application:

```bash
linera publish-and-create \
  backend/target/wasm32-unknown-unknown/release/backend_contract.wasm \
  backend/target/wasm32-unknown-unknown/release/backend_service.wasm \
  --json-argument '{"max_players": 2, "is_ranked": false, "strict_mode": false}'
```

**Note:** The `host` field is automatically set to the authenticated signer (the wallet owner), so you don't need to specify it in the JSON argument.

The command will output your application ID, for example:

```
Application ID: e476187f7e1b4ec1...
```

Save this application ID - you'll need it to interact with the application.

## Step 4: Start the GraphQL Service

**TERMINAL 2** - In the same terminal, start the GraphQL service:

```bash
linera service --port 8080
```

This starts the GraphQL API server on `http://localhost:8080`.

**TERMINAL 3** (Optional) - Start the faucet service:

```bash
linera faucet --port 8081 --amount 1000
```

The faucet provides tokens for testing on port 8081.

## Step 5: Test the Deployment

Query your application via GraphQL:

```bash
curl -X POST http://localhost:8080 \
  -H "Content-Type: application/json" \
  -d '{
    "query": "query { applications(chainId: \"YOUR_CHAIN_ID\") { id description } }"
  }'
```

Replace `YOUR_CHAIN_ID` with your chain ID from the deployment output.

## Summary of Terminals

- **Terminal 1:** Running `linera net up` (keep alive)
- **Terminal 2:** Deploy application, then run `linera service --port 8080`
- **Terminal 3:** (Optional) Run `linera faucet --port 8081`

## Troubleshooting

### Port Already in Use

If you get port conflicts:

- Faucet and service use different ports (8081 and 8080 respectively)
- Stop any existing Linera processes: `pkill linera`

### Environment Variables Not Set

If deployment fails with "wallet not found":

- Verify environment variables are exported in Terminal 2
- Check the paths match those shown in Terminal 1

### WASM Build Fails

If the WASM build fails:

- Ensure you have the WASM target: `rustup target add wasm32-unknown-unknown`
- Check Rust version: `rustc --version` (should be 1.86+)

## Next Steps

After successful deployment:

1. Connect the frontend to the GraphQL endpoint (`http://localhost:8080`)
2. Use the application ID to interact with your deployed contract
3. Test game operations (join match, start match, play cards)
