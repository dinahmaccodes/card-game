# Link to Live Demo V1

<https://linot.vercel.app>

# Linot — Real-Time Whot on Linera Microchains

> A lightning-fast, blockchain-powered card game built on **Linera microchains**.  
> Linot combines nostalgic gameplay with real-time betting to show what **low-latency blockchain gaming** can truly feel like.

---

## **Try It Now** (10 minutes)

**Want to test the production-ready backend on your machine?**

**[Quick Test Guide](./TEST_THIS_NOW.md)** - One-page checklist  
 **[Detailed Testing](./docs/QUICK_TEST.md)** - Step-by-step walkthrough

**What you'll test:**

- Deploy smart contract to local Linera network
- Query game state via GraphQL (< 50ms response)
- Verify all 12 API endpoints working
- See microchain architecture in action

**Live Demo:** <https://linot.vercel.app> _(frontend only - backend integration coming in Wave 3)_

---

## Overview

**Linot** is a multiplayer Whot-style card game built on Linera's microchain architecture.  
It reimagines the classic local card game we grew up playing as kids — but this time, every move happens instantly.

Players can challenge friends, join tournaments, or spectate live matches.  
Spectators can even **bet on matches in real time**, with odds that update dynamically as the game progresses.

### What We’re Proving

> Real-time, on-chain gaming _is possible_ — with the right infrastructure.
> That structure is _Linera_

Most blockchain games are slow because transactions wait in queues.  
With Linera’s **parallel microchains**, every match gets its own chain.  
That means **sub-second latency**, no congestion, and gameplay that feels like Web2 for once.

---

## Current Hackathon Status — Wave 2 (Nov 3–12)

### **Wave 2 Complete: Multiplayer Foundation & Production-Ready Backend**

Wave 2 successfully transformed Linot from a prototype into a functional multiplayer game with a production-ready backend architecture.

#### Major Achievements

**Game Logic & Multiplayer:**

- **Complete Whot ruleset** implemented with all 6 special cards (Whot, Hold On, Pick Two, Pick Three, Suspension, General Market)
- **Human-vs-human mode** (2–4 players) synchronized over dedicated match microchains
- **On-chain match creation** with automatic microchain instantiation per game
- **Turn-based enforcement** with caller authentication and validation
- **Win/draw detection** with proper game state transitions

**Backend Architecture:**

- **Professional error handling** system with custom `LinotError` type replacing all panics
- **Full GraphQL service layer** with 12+ queries for game state
- **Secure player views** preventing card leakage to opponents
- **Type-safe state management** using Linera Views (RootView + RegisterView)
- **Clean separation** of concerns (contract, service, game engine, state)

**Technical Improvements:**

- Deterministic shuffling using chain ID as seed for consensus
- Automatic deck reshuffling when draw pile is empty
- Penalty stacking for Pick Two/Pick Three cards
- Last card challenge system with automatic enforcement
- Player forfeit handling with winner determination
- Follows Linera SDK best practices and official documentation patterns

#### What's Ready

- **Backend contract** - Fully deployable to local Linera network
- **GraphQL query layer** - 12+ endpoints serving real-time game state
- **Complete game logic** - All Whot rules, special cards, and win conditions implemented
- **State management** - Linera Views with proper initialization and defaults
- **Local deployment tested** - Working on local Linera network with < 50ms query latency

#### Current Status

**Backend:** Production-ready and fully tested on local Linera network  
**Frontend:** Functional demo available at [linot.vercel.app](https://linot.vercel.app) - **not yet connected to backend**  
**Deployment:** Currently working with local Linera network deployment  
**Testing:** Backend can be tested via GraphQL queries (see [TESTING_BACKEND.md](docs/TESTING_BACKEND.md))

#### Still in Progress - To Be worked on for Wave 3

- **GraphQL mutations** - Expose operations (JoinMatch, StartMatch, PlayCard) via mutations
- **Frontend-backend integration** - Connect React UI to smart contract
- **Live gameplay demo** - Full 2-player match with real-time updates
- **Spectator betting UI** - (smart contract hooks prepared)
- **Comprehensive test suite**

**Next up (Wave 3):** GraphQL mutation layer, frontend-backend integration, betting mechanics start, and comprehensive testing.

---

## Quick Testing (10 minutes)

**Want to test the backend right now?** Follow this guide:

**[Quick Testing Guide](./docs/QUICK_TEST.md)** - Step-by-step instructions to:

1. Build the WASM binaries (2 min)
2. Start local Linera network (30 sec)
3. Deploy the application (1 min)
4. Test via terminal or browser (5 min)

**What you'll verify:**

- Backend deploys and runs on your machine
- GraphQL queries respond in < 50ms
- Complete game state accessible via API
- All 12 query endpoints working

---

## Core Concept and Aim for Linot as a Game

| Feature                        | Description                                                                                         |
| ------------------------------ | --------------------------------------------------------------------------------------------------- |
| **Gameplay**                   | Fast, familiar Whot-style strategy game with action cards                                           |
| **Microchain per Match**       | Each match runs on its own microchain — zero lag, no interference                                   |
| **Prediction Market Layer**    | Spectators place live bets; odds adjust dynamically via an on-chain pool                            |
| **Manual Reward Distribution** | Winners and top players are recorded on-chain, with rewards manually handled during the early phase |
| **Web2 Feel, Web3 Power**      | GraphQL subscriptions + Linera’s instant state updates                                              |

---

## Gameplay Loop

1. **Match Creation:**  
   A player creates a match → Linera spawns a dedicated microchain instance.

2. **Join & Sync:**  
   2–4 players join. Game state syncs instantly through Linera’s low-latency channels.

3. **Real-Time Play:**  
   Each move is recorded on-chain and confirmed in milliseconds.

4. **Spectator Betting:**  
   Spectators view live matches and bet on the winner. Odds adjust automatically.

5. **End of Match:**  
   Results finalize instantly; winnings or recognition handled manually for now.

---

## Technical Architecture

| Layer                  | Stack                                         |
| ---------------------- | --------------------------------------------- |
| **Frontend**           | React + Vue + TypeScript + TailwindCSS        |
| **State Management**   | Zustand (client) + Linera for on-chain state  |
| **Blockchain Backend** | Linera Microchains (one microchain per match) |
| **Real-Time Updates**  | GraphQL Subscriptions                         |
| **Smart Contracts**    | Rust (Linera SDK)                             |

---

## Development Plan

### Wave 1: Core Game (Completed Oct 20–29)

- Frontend template ready (React + Tailwind)
- Backend structure drafted with comments
- README and documentation baseline established

**Outcome:** Architectural foundation=complete.

---

### Wave 2: Multi-player Action Begins (Completed within Nov 3–12)

**Goal:** Move from simulation to live microchains and enable foundational multiplayer.

- Implement full Whot ruleset (card matching, action cards, turn order).
- Transition to human vs human (2–4 players) gameplay using Linera microchains.
- On-chain match creation and card actions live across dedicated match chains.

---

### Wave 3: Betting Mechanics + Multiplayer Hardening (Nov 17–26)

**Goal:** Complete Multiplayer feature and start build of Betting Mechanism

**Targets:**

- Spectator leaderboard with persistent state maintained.
- Manual staking system for multiplayer matches (winner takes all).

**Additional Logic Targets:**

- Betting logic setup V1 for internal players with manual payouts.
- Persistence and recovery of match state per microchain.

---

### **Wave 4: Improve Features (Dec 1-10)**

**Goal:** Deliver a fully playable demo for the Linera showcase.

- End-to-end on-chain gameplay
- Wallet connection and onboarding UX.

#### Plans to Improve Player Experience

- Integrate **leaderboards** and player stats.
- Improve animations, responsive layout, and lobby UX.
- Initial implementation of **tournament mode** (4–8 players).

---

### **Wave 5: Perfect Betting Feature and Larger Multiplayer Feature (Dec 15 - Jan 7)**

- Real-time leaderboard updates
- Improved performance for large tournaments
- Perfect implementation of **tournament mode** (4–8 players).

---

### **Wave 6: MVP Launch (Jan 12-21)**

**Goal:** Prepare for presentation and Linera testnet launch.

- Full UI overhaul for presentation
- Onboarding tutorial + in-game guide
- Load testing and bug cleanup in codebase
- Documentation finalization - Make detailed docs for players to understnad Game and Developers to understand codebase
- Recorded demo and marketing materials

**Demo:** Polished, production-ready dApp for Linera Showcase and ETH Denver - if possible.

## Team

| Name                | Role                                  | Bio                                                                                                                   |
| ------------------- | ------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| **Dinah Macaulay**  | Smart Contract Engineer               | Software developer passionate about blockchain UX and infrastructure. Experienced in Solidity, Cairo, and Linera SDK. |
| **Osehotue Divine** | Frontend Developer / Technical Writer | Builds fast, accessible interfaces with React and TypeScript.                                                         |
| **Divine Macaulay** | Product Designer & UX Researcher      | Designs intuitive, player-centered gaming experiences.                                                                |

---

## Documentation

**[Complete Documentation Index](docs/DOCUMENTATION_INDEX.md)** - All guides organized by use case

### Quick Start

- **[Quick Testing Guide](docs/QUICK_TEST.md)** - **START HERE!** Test the backend in 10 minutes (step-by-step)
- **[One-Page Checklist](TEST_THIS_NOW.md)** - Fastest way to test (copy-paste commands)

### For Developers

- **[Testing the Backend](docs/TESTING_BACKEND.md)** - Complete guide to deploy and test the backend locally
- **[GraphQL API Guide](docs/GRAPHQL_GUIDE.md)** - Complete reference for querying game state via GraphQL
- **[Troubleshooting](docs/TROUBLESHOOTING.md)** - Common issues and solutions
- **[Local Deployment Guide](docs/deployment_local_guide.md)** - Step-by-step setup for running Linot locally

### Quick Start (Local Testing)

**You'll need 3 terminals for this setup:**

```bash
# TERMINAL 1: Start local Linera network (keep this running)
cd linot-card-game
linera net up

# Copy the export commands shown in the output - you'll need them for Terminal 2
# Example:
#   export LINERA_WALLET="/tmp/.tmpXXXXX/wallet_0.json"
#   export LINERA_KEYSTORE="/tmp/.tmpXXXXX/keystore_0.json"
#   export LINERA_STORAGE="rocksdb:/tmp/.tmpXXXXX/client_0.db"
# Keep this terminal running!
```

```bash
# TERMINAL 2: Deploy and start service (open a NEW terminal)

# Step 1: Paste the export commands from Terminal 1 (with YOUR own actual paths - do not copy this please)
export LINERA_WALLET="/tmp/.tmpXXXXX/wallet_0.json"
export LINERA_KEYSTORE="/tmp/.tmpXXXXX/keystore_0.json"
export LINERA_STORAGE="rocksdb:/tmp/.tmpXXXXX/client_0.db"

# Step 2: Build the backend
cd linot-card-game/backend
cargo build --target wasm32-unknown-unknown --release
cd ..

# Step 3: Deploy the application
# App ID will be retured as part of the output at the top - Take note of it
linera publish-and-create \
  backend/target/wasm32-unknown-unknown/release/backend_contract.wasm \
  backend/target/wasm32-unknown-unknown/release/backend_service.wasm \
  --json-argument '{"max_players": 2, "is_ranked": false, "strict_mode": false}'

# Step 4: Get your Chain ID and add it to where you stored your App ID (save these)
linera wallet show

# Step 5: Start GraphQL service (keep this running)
linera service --port 8080
```

```bash
# TERMINAL 3: Test the backend (open a NEW terminal)

# Replace with YOUR actual Chain ID and App ID from Terminal 2
CHAIN_ID="your_chain_id_here"
APP_ID="your_app_id_here"

curl -X POST "http://localhost:8080/chains/${CHAIN_ID}/applications/${APP_ID}" \
  -H "Content-Type: application/json" \
  -d '{"query": "query { status deckSize players { nickname } }"}'
```

**Expected response:** `{"data":{"status":"WAITING","deckSize":0,"players":[]}}`

See **[TESTING_BACKEND.md](docs/TESTING_BACKEND.md)** for complete testing instructions with all available queries.

---

## Frontend Demo

A functional frontend demo is available at [linot.vercel.app](https://linot.vercel.app), showcasing the intended user experience.

**Note:** The demo is currently **not connected to the backend**.
This is meant to demonstrate the UI/UX design and game flow. Backend integration (connecting React to GraphQL API) is in progress for Wave 3.

## More on Design

Here is a sample of what our Pitch Deck is for V2 and a sneak-peek of our UI as we build

<https://www.figma.com/proto/4dgqc4TA9XoNoUNmy1xerT/Hackathon-Projects?page-id=1082%3A2&node-id=1500-3855&viewport=-914%2C-819%2C0.14&t=elRcK2nTS8Jmronp-1&scaling=scale-down-width&content-scaling=fixed>

---

## Links

- **GitHub:** [https://github.com/dinahmaccodes/card-game](https://github.com/dinahmaccodes/card-game)
- **Demo:** [https://linot.vercel.app](https://linot.vercel.app)
- **Linera Docs:** [https://linera.dev](https://linera.dev)

---

## Future Ideas

- **Tournaments + Seasonal Leagues** for competitive play as community and user numbers grow
- **Reward Dashboard** for automatically tracking winners globally
- **Cross-Microchain Communication** experiments for match coordination
- **Match Analytics** to visualize performance across sessions

---

> Built with ❤️ on **Linera** to show that Web3 gaming can be fast, fun, and social.
