## Backend Starter Steps

This folder contains the Linera-based backend (Rust) for the Whot card game.

This README documents how to set up a local development environment for building, testing, and deploying the backend with the Linera SDK.

## Overview

The backend contains two main binaries compiled to WebAssembly:

- A contract (handles state mutations / write operations)
- A service (read-only, GraphQL API for queries)

Both are compiled to wasm (target: `wasm32-unknown-unknown`) and published using the Linera CLI.

## Prerequisites

- Git
- curl or wget
- Rust toolchain (rustup + cargo)
- A recent stable Rust toolchain compatible with the project's Cargo.toml (2021 edition)
- The Linera CLI (install from crates.io or follow <https://linera.dev/developers/getting_started/installation.html>)

## 1) Install Rust (if not already)

Run the official rustup installer and make sure the environment is loaded:

```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
source $HOME/.cargo/env
rustup default stable
```

Add the WebAssembly compilation target required by Linera:

```bash
rustup target add wasm32-unknown-unknown
```

Note: Some Linera tests or tooling may require additional native tools (e.g., `wasmer` for some test harnesses). Install them only if needed by tests:

```bash
# optional - install wasmer CLI if you need local wasm execution for tests
# cargo install wasmer
```

## 2) Install the Linera CLI

Follow the official Linera docs: <https://linera.dev/developers/getting_started/installation.html>

One common way is via cargo (crates.io):

```bash
# Install Linera CLI from crates.io (example)
cargo install --locked linera
```

If the project or team pins a particular CLI release, prefer installing the matching version or installing from the repository. See Linera docs for platform-specific instructions.

Verify the CLI is installed:

```bash
linera --version
```

## 3) Build the backend to WebAssembly

From the repo root (or `backend/`):

```bash
cd backend
cargo build --release --target wasm32-unknown-unknown
```

After a successful build you should see wasm artifacts under:

```
target/wasm32-unknown-unknown/release/
```

Common wasm artifacts (example names used by Linera projects):

- `backend_contract.wasm` (contract binary)
- `backend_service.wasm` (service binary)

Adjust names if your `Cargo.toml` uses different [[bin]] names.

## 4) Run tests

Unit and integration tests can be run with:

```bash
cargo test
```

If the tests enable Linera-specific features (for example `wasmer` or `test` features in dev-dependencies), make sure any native prerequisites are installed or run tests in an environment described in the project's dev docs.

## 5) Deploy to Linera Testnet (quick start)

Follow Linera's developer flow to initialize a wallet, request a chain, and publish your application. Example commands from reference guides:

```bash
# initialize wallet (example testnet faucet URL shown in docs)
linera wallet init --faucet https://faucet.testnet-conway.linera.net

# request a chain to run your application
linera wallet request-chain --faucet https://faucet.testnet-conway.linera.net

# publish contract and service wasm files and create the application on your chain
linera publish-and-create \
  target/wasm32-unknown-unknown/release/backend_{contract,service}.wasm \
  --json-argument '"Hello, Linera!"'
```

Notes:

- The `--json-argument` value is required if your contract's `InstantiationArgument` expects a value. Use single quotes outside and double quotes inside to avoid shell-escaping issues (see examples above).
- Replace faucet URLs and chain IDs with the ones appropriate for the current Linera Testnet. See <https://linera.dev> for current testnet details.

## 6) Run the node service locally

Start the Linera node service to expose GraphQL queries for your deployed chain/application:

```bash
linera service --port 8080
```

Then open GraphiQL at:

```
http://localhost:8080/chains/<CHAIN_ID>/applications/<APP_ID>
```

## Troubleshooting / Tips

- Missing JSON argument on deploy: provide `--json-argument` with a valid JSON string. Example: `--json-argument '"My init"'`.
- Malformed JSON: check quoting. Use single quotes for the outer shell quoting and double quotes inside JSON for strings.
- Port in use when starting service: change port via `--port` option.
- If cargo build fails for wasm target, ensure `rustup target add wasm32-unknown-unknown` was run and the toolchain matches the `edition` in `Cargo.toml`.

## Files of interest

- `Cargo.toml` — dependencies and release profile (look for `[[bin]]` entries naming `backend_contract` and `backend_service`).
- `src/contract.rs` — contract implementation (binary entry for the contract)
- `src/service.rs` — service implementation (binary entry for the service)
- `src/lib.rs`, `src/state.rs` — ABI, state, and operation definitions

## References

- Linera developer docs: <https://linera.dev/developers/getting_started.html>
- Example walkthrough (inspiration): <https://hackmd.io/@OT41K1/SJzCDZBAxe>
- Linera GitHub: <https://github.com/linera-io/linera-protocol>

## Next steps / suggestions

- Add a small `make` or `justfile` to simplify repeated commands (build/test/deploy).
- Add CI steps to build the wasm target and run `cargo test` in CI.
- If you want, I can add example `Makefile`/`justfile` entries and a small `CONTRIBUTING.md` section showing the commands above.

---

Generated setup instructions reference Linera docs and an example HackMD walkthrough; adapt faucet URLs and CLI install method to the current Linera documentation if they change.

# Backend For Whot Card Game built on Linera
