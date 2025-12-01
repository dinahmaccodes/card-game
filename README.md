# Linot - Blockchain Card Game on Linera Microchains

A high-performance multiplayer card game built on Linera's microchain architecture, demonstrating real-time blockchain gaming with sub-second transaction finality.

---

## Quick Start

```bash
sudo docker compose up --build
```

Wait 30-40 seconds for initialization, then navigate to **http://localhost:5173**

**Documentation:**
- [HOW_TO_RUN.md](./HOW_TO_RUN.md) - Quick start guide
- [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) - Complete deployment instructions
- [BLOCKCHAIN_INTEGRATION.md](./BLOCKCHAIN_INTEGRATION.md) - Technical architecture

---

## Project Status

**Current Phase:** Infrastructure Complete (Wave 3)

### Completed Components

**Infrastructure:**
- Single-command Docker deployment
- Template-compliant configuration (Linera SDK v0.15.5)
- Automated wallet initialization and chain setup
- Production-ready container orchestration

**Backend:**
- Complete smart contract implementation in Rust
- GraphQL service layer with 12 queries and 7 mutations
- State management using Linera Views
- Deterministic game logic for blockchain consensus

**Frontend:**
- React application with TypeScript
- GraphQL client integration
- Real-time state polling
- Responsive game interface

**Blockchain Integration:**
- Human player moves synced to blockchain via GraphQL mutations
- Verifiable game state on Linera microchains
- Computer AI runs locally for responsive gameplay
- Hybrid architecture balancing blockchain verification with performance

### Verification

**Test blockchain connectivity:**
```bash
# Source environment variables
source frontend/.env.local

# Query game status
curl "$VITE_GRAPHQL_URL" -X POST \
  -H "Content-Type: application/json" \
  -d '{"query": "query { status deckSize }"}'

# Expected: {"data":{"status":"WAITING","deckSize":0}}
```

**Monitor integration:**
- Open http://localhost:5173
- Press F12 to open browser console
- Start a new game
- Observe blockchain sync logs in console

---

## Architecture

### System Overview

```
Frontend (React/TypeScript)
    |
    | HTTP POST
    v
GraphQL Service (Port 8081)
    |
    | RPC
    v
Smart Contract (Rust/WASM)
    |
    v
Linera Microchain
```

### Data Flow

**Player Actions:**
1. User initiates action (play card, draw, etc.)
2. Frontend calls GraphQL mutation
3. Service schedules blockchain operation
4. Contract executes and updates state
5. Block committed to microchain
6. State change reflected in queries

**Computer Opponent:**
- AI logic runs locally in frontend
- Provides instant gameplay response
- Does not sync to blockchain (performance optimization)
- Human moves are blockchain-verified

### Port Configuration

| Service | Port | Purpose |
|---------|------|---------|
| Faucet | 8080 | Chain queries and validators |
| Application GraphQL | 8081 | Game mutations and state |
| Frontend | 5173 | User interface |

---

## Technical Stack

**Blockchain:**
- Linera SDK v0.15.5
- Rust smart contracts
- WASM compilation target

**Backend:**
- Rust with async-graphql
- GraphQL query and mutation layer
- Linera Views for state management

**Frontend:**
- React 19
- TypeScript
- Zustand for state management
- Framer Motion for animations

**Infrastructure:**
- Docker for containerization
- Automated deployment scripts
- Dynamic environment configuration

---

## Development

### Prerequisites

- Docker Desktop or Docker Engine
- 8GB RAM minimum
- Ports 8080, 8081, 5173 available

### Local Setup

**Using Docker (Recommended):**
```bash
sudo docker compose up --build
```

**Manual Setup:**
See [QUICKSTART.md](./QUICKSTART.md) for step-by-step terminal instructions.

### Testing

**Backend Tests:**
```bash
cd backend
cargo test --test single_chain
```

**GraphQL Endpoint:**
```bash
./test-graphql.bash
```

---

## Game Mechanics

### Objective
Be the first player to play all cards from your hand.

### Core Rules
- Match top card by suit or rank
- Draw if no playable cards available
- Call "Last Card" when down to one card
- Failure to call incurs 2-card penalty

### Special Cards
- **2:** Next player draws 2 cards
- **14 (Ace):** Skip next player's turn
- **Whot (Joker):** Wild card, choose suit

### Blockchain Integration
- Human player moves recorded on-chain
- Verifiable game history
- Transaction hash confirmation
- Immutable game state

---

## Documentation

### For Users
- [HOW_TO_RUN.md](./HOW_TO_RUN.md) - Quick start
- [README_JUDGES.md](./README_JUDGES.md) - Evaluation guide

### For Developers
- [backend/README.md](./backend/README.md) - Smart contract details
- [docs/TESTING_BACKEND.md](./docs/TESTING_BACKEND.md) - Testing guide
- [docs/GRAPHQL_GUIDE.md](./docs/GRAPHQL_GUIDE.md) - API reference
- [docs/TROUBLESHOOTING.md](./docs/TROUBLESHOOTING.md) - Common issues

### Project Status
- [CURRENT_STATUS.md](./CURRENT_STATUS.md) - Development progress
- [BLOCKCHAIN_INTEGRATION.md](./BLOCKCHAIN_INTEGRATION.md) - Integration details

---

## GraphQL API

### Available Queries

```graphql
query GameState {
  status          # WAITING, PLAYING, or FINISHED
  deckSize        # Cards remaining in deck
  topCard {       # Current discard pile card
    suit
    rank
  }
  config {        # Game configuration
    maxPlayers
    cardsPerPlayer
  }
}
```

### Available Mutations

```graphql
mutation PlayerActions {
  joinMatch(nickname: "Player")
  startMatch
  playCard(cardIndex: 0, chosenSuit: "hearts")
  drawCard
  callLastCard
}
```

See [docs/GRAPHQL_GUIDE.md](./docs/GRAPHQL_GUIDE.md) for complete API reference.

---

## Deployment

### Production Deployment

The system uses a single-command deployment process:

```bash
docker compose up --build
```

**What happens automatically:**
1. Linera local network initialization
2. Wallet creation with secure keystore
3. Smart contract compilation to WASM
4. Application deployment to blockchain
5. GraphQL service startup
6. Frontend configuration and launch

**No manual configuration required.**

### Environment Variables

Generated automatically in `frontend/.env.local`:
- `VITE_CHAIN_ID` - Blockchain chain identifier
- `VITE_APP_ID` - Application identifier
- `VITE_OWNER_ID` - Wallet owner identifier
- `VITE_GRAPHQL_URL` - Application GraphQL endpoint
- `VITE_CHAIN_GRAPHQL_URL` - Chain GraphQL endpoint
- `VITE_FAUCET_URL` - Faucet service URL

---

## Performance Metrics

| Metric | Target | Actual | Status |
|--------|--------|--------|--------|
| Build time | <10 min | 6-8 min | Pass |
| Container stability | 100% uptime | No crashes | Pass |
| GraphQL latency | <100ms | 40-60ms | Pass |
| Frontend load | <3s | ~1.5s | Pass |
| Mutation response | <200ms | 80-120ms | Pass |

---

## Team

| Name | Role | Expertise |
|------|------|-----------|
| Dinah Macaulay | Smart Contract Engineer | Rust, Blockchain, Linera SDK |
| Osehotue Divine | Frontend Developer | React, TypeScript, GraphQL |
| Divine Macaulay | Product Designer | UX/UI, Game Design |

---

## Project Timeline

| Phase | Period | Status | Focus |
|-------|--------|--------|-------|
| Wave 1 | Oct 20-29 | Complete | Architecture foundation |
| Wave 2 | Nov 3-12 | Complete | Game logic implementation |
| Wave 3 | Nov 17-30 | Complete | Infrastructure deployment |
| Wave 4 | Dec 1-10 | Planned | Feature expansion |
| Wave 5 | Dec 15-Jan 7 | Planned | Production polish |
| Wave 6 | Jan 12-21 | Planned | Public launch |

---

## Links

- **Live Demo:** https://linot.vercel.app
- **Linera Documentation:** https://linera.dev
- **Design Prototype:** [Figma](https://www.figma.com/proto/4dgqc4TA9XoNoUNmy1xerT/Hackathon-Projects?page-id=1082%3A2&node-id=1500-3855)

---

## License

This project is part of the Linera Developer Incentive Program.

Built on Linera SDK v0.15.5 demonstrating real-time blockchain gaming with instant finality.
