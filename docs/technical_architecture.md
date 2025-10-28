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
│   ├── Cargo.toml
│   ├── src/
│   │   ├── lib.rs              # ABI + Operations definitions
│   │   ├── state.rs            # Application state (views) - Game state struct
│   │   ├── contract.rs         # Contract logic (mutations)
│   │   ├── service.rs          # GraphQL service (queries)
│   │   └── game.rs             # Game rules engine - Whot game rules
│   └── tests/
│       └── single_chain.rs     # Integration tests
└── frontend/
    └── src/
        ├── components/
        ├── hooks/
        └── graphql/
```
