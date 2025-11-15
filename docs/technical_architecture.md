┌─────────────────────────────────────────────────┐
│ Frontend (React + GraphQL) │
│ - Game UI, Lobby, Spectator Dashboard │
└────────────────┬────────────────────────────────┘
│ GraphQL Subscriptions
┌────────────────▼────────────────────────────────┐
│ Linera Service (GraphQL API) │
│ - Real-time state sync │
│ - Event subscriptions │
└────────────────┬────────────────────────────────┘
│
┌────────────────▼────────────────────────────────┐
│ Linera Application (Rust) │
│ ┌──────────────────────────────────────────┐ │
│ │ Contract (State + Logic) │ │
│ │ - Match state management │ │
│ │ - Game rules enforcement │ │
│ │ - Betting pool logic │ │
│ └──────────────────────────────────────────┘ │
│ ┌──────────────────────────────────────────┐ │
│ │ Service (GraphQL Schema) │ │
│ │ - Query current game state │ │
│ │ - Subscribe to state changes │ │
│ └──────────────────────────────────────────┘ │
└─────────────────────────────────────────────────┘

```

---

## Detailed Technical Flow

### **Wave 1: Core Structure**

#### 1. **Project Structure**

linot/
├── backend/                    # On-chain logic
├── Cargo.lock
├── Cargo.toml
├── rust-toolchain.toml
├── src
│   ├── contract.rs
│   ├── lib.rs                  # ABI + Operations definitions
│   ├── service.rs              # GraphQL service (queries)
│   └── state.rs                # Application state (views) - Game state struct
└── tests
|   └── single_chain.rs         # Integration tests
|
└── frontend/
    └── src/
        ├── components/
        ├── hooks/
        └── graphql/

