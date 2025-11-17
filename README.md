# Link to Live Demo V2

<https://linot.vercel.app>

# Linot — Real-Time Whot on Linera Microchains

> A lightning-fast, blockchain-powered card game built on **Linera microchains**.  
> Linot combines nostalgic gameplay with real-time betting to show what **low-latency blockchain gaming** can truly feel like.

---

## Try It Now (10 minutes)

Test the production-ready backend on your local machine

[Quick Test Guide](./TEST_THIS_NOW.md) - One-page checklist  
[Detailed Testing](./docs/QUICK_TEST.md) - Step-by-step walkthrough

**What you'll test:**

- Deploy smart contract to local Linera network
- Query game state via GraphQL (< 50ms response)
- Verify working API endpoints (status, config, currentPlayerIndex)
- See microchain architecture in action

**Understanding the Results:**

When you query the GraphQL API, you'll see responses like `{"data":{"currentPlayer":null}}` or `{"data":{"deckSize":0}}`.  
These are CORRECT and prove the backend is working perfectly:

- `null` = Query succeeded, no data exists yet (no players joined)
- `0` = Initial state value (deck not shuffled yet)
- `[]` = Empty array (no players in match)

Broken queries return `{"errors":[...]}`, not `{"data":{...}}`. See [GRAPHQL_GUIDE.md](docs/GRAPHQL_GUIDE.md) for detailed explanation.

Live Demo: <https://linot.vercel.app> (frontend only - backend integration coming in Wave 3)

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

---

## Development Roadmap

### Wave 3: Multiplayer Gameplay & Player Betting (Nov 17–26)

**Goal:** Make the game fully playable with player-to-player betting

**Core Deliverables:**

1. **GraphQL Mutations** - Enable gameplay from browser

   - `JoinMatch` - Players join a match
   - `StartMatch` - Initialize deck and deal cards
   - `PlayCard` - Execute card plays with validation
   - `DrawCard` - Draw from deck
   - `DeclareLastCard` - Challenge system
   - Status: In Progress

2. **Frontend-Backend Integration** - Connect React to Linera

   - React components trigger GraphQL mutations
   - WebSocket subscriptions for real-time updates
   - Turn notifications and live state sync
   - Status: NOT STARTED

3. **Live 2-Player Gameplay** - Full playable game

   - Turn-based card play via browser
   - Card validation and rule enforcement
   - Win/draw detection and match completion
   - Status: NOT STARTED

4. **Player-to-Player Betting** - Staking mechanism

   - Bet/stake fields in match creation
   - "Winner takes all" transfer logic
   - Stake holding and validation
   - Winnings transfer on match completion
   - Status: NOT STARTED

5. **Spectator View** - Read-only match observation

   - Non-players can view live matches
   - Real-time game state updates
   - Player rankings displayed during match
   - Foundation for Wave 4 spectator betting
   - Status: NOT STARTED

6. **UI Improvements** - Gameplay polish
   - Smooth card animations
   - Turn indicators and notifications
   - Valid card highlighting
   - Match status displays
   - Status: NOT STARTED

**Success Details:**

- Play a complete 2-player match via browser
- Mutations execute card plays correctly
- Player betting transfers work reliably
- WebSocket updates in real-time
- All queries and mutations tested
- Live demo video demonstrates full gameplay

**Timeline:** 10 days (Nov 17-26)

---

### Wave 4: Advanced Features & Enhanced Betting (Dec 1–10)

**Goal:** Transform from functional demo to feature-rich gaming platform

**Core Deliverables:**

1. **Player Statistics & Reputation** - Track performance history

   - Wins, losses, draws per player
   - Win rate percentage calculations
   - Special cards used statistics
   - Last card challenge success rates
   - Cross-chain stats persistence
   - GraphQL queries for player history
   - Status: NOT STARTED

2. **Global Leaderboards** - Competitive rankings

   - Win rate rankings (minimum 10 matches)
   - Total wins leaderboard
   - Fastest game completion times
   - Most matches played
   - Highest win streaks
   - Real-time ranking updates
   - Status: NOT STARTED

3. **Match Replay System** - Complete game history

   - Every card play recorded with timestamps
   - Full event history per match
   - Replay queries for verification
   - Dispute resolution capability
   - Immutable on-chain storage
   - Status: NOT STARTED

4. **Spectator Betting System** - Advanced betting

   - Spectators place bets on match outcomes
   - Dynamic odds based on player rankings
   - Betting pool mechanics
   - Payout calculations
   - Betting history tracking
   - Status: NOT STARTED

5. **UI/UX Polish & Animations** - Professional presentation
   - Card dealing animations
   - Card flip effects
   - Penalty counter animations
   - Sound effects and feedback
   - Mobile responsiveness
   - Accessibility features (high contrast, screen reader support)
   - Status: NOT STARTED

**Success Criteria:**

- Player stats update automatically post-match
- Leaderboards display accurate rankings
- Spectators can bet on live matches
- Tournaments function end-to-end
- All features performant at scale
- Professional visual polish throughout

**Timeline:** 10 days (Dec 1-10)

---

### Wave 5: Betting Perfection & Competitive Features (Dec 15–Jan 7)

**Goal:** Perfect betting mechanics and prepare for public launch

**Core Deliverables:**

1. **Real-Time Leaderboard Updates** - Live rankings

   - Instant rank recalculation post-match
   - Percentile calculations
   - Historical rank tracking
   - Player tier systems
   - Status: NOT STARTED

2. **Advanced Tournament System** - Competitive excellence

   - Multi-round tournament support
   - Swiss pairing system (optional)
   - Tournament seeding by ranking
   - Bracket visualization
   - Tournament history and archives
   - Status: NOT STARTED

3. **Betting Pool Mechanics** - Complex betting

   - Multi-outcome betting (winner, runner-up, etc.)
   - In-play odds adjustments
   - Parlay betting (bet multiple matches)
   - Betting limits and controls
   - Status: NOT STARTED

4. **Community Features** - Player engagement

   - Player profiles and achievements
   - Match history graphs
   - Performance trends
   - Social ranking comparisons
   - Status: NOT STARTED

5. **Load Testing & Optimization** - Production readiness

   - Stress test at 10,000 concurrent players
   - Cross-chain messaging at scale
   - Database query optimization
   - Network latency handling
   - Status: NOT STARTED

6. **Bug Fixes & Refinement** - Quality assurance
   - Edge case handling
   - Error message improvements
   - UI/UX refinement based on feedback
   - Performance bottleneck fixes
   - Status: NOT STARTED

**Success Criteria:**

- System stable under 10,000 concurrent players
- Leaderboards update in < 5 seconds post-match
- All betting mechanics tested
- 99.9% uptime on local testnet
- Zero critical bugs

**Timeline:** 24 days (Dec 15–Jan 7)

---

### Wave 6: MVP Launch & Documentation (Jan 12–21)

**Goal:** Production-ready product for Linera testnet

**Core Deliverables:**

1. **Full UI Overhaul** - Presentation polish with Product Designer's guide

   - Professional game design
   - Brand consistency
   - High-quality card graphics
   - Smooth animations throughout
   - Status: NOT STARTED

2. **Onboarding & Tutorials** - Player education

   - Interactive tutorial for new players
   - In-game tips and guides
   - Keyboard/gamepad controls
   - Accessibility setup
   - Status: NOT STARTED

3. **Complete Documentation** - Developer & player guides

   - **For Players:** Game rules, betting mechanics, strategies
   - **For Developers:** Architecture guide, API reference, deployment instructions
   - **For Community:** Contributing guidelines, roadmap, vision
   - Status: IN PROGRESS

4. **Wallet Integration** - Real onboarding

   - Linera wallet connection
   - Account creation flow
   - Transaction signing
   - Balance display
   - Status: NOT STARTED

5. **Testnet Deployment** - Live showcase

   - Deploy to Linera public testnet
   - DNS configuration
   - CDN setup for frontend
   - Monitoring and alerting
   - Status: NOT STARTED

6. **Marketing & Presentation** - submission
   - Demo video compilation
   - Presentation slides
   - Technical write-up
   - Performance benchmarks
   - Status: NOT STARTED

**Success Criteria:**

- Live on Linera testnet
- 1000+ concurrent players tested
- Complete documentation available
- Professional presentation ready
- Judges can play real matches

**Timeline:** 10 days (Jan 12-21)

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
| **Web2 Feel, Web3 Power**      | Interactive and Creative UI + GraphQL subscriptions + Linera’s instant state updates                |

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

| Layer                  | Stack                                                           |
| ---------------------- | --------------------------------------------------------------- |
| **Frontend**           | React + Vue + TypeScript + TailwindCSS                          |
| **Blockchain Backend** | Rust - Leveraging Linera Microchains (one microchain per match) |
| **Real-Time Updates**  | GraphQL Subscriptions                                           |
| **Smart Contracts**    | Rust (Linera SDK)                                               |

## <!-- | **State Management**   | Zustand (client) + Linera for on-chain state  | -->

## Development Progress Summary

| Wave       | Timeline     | Status       | Focus                          |
| ---------- | ------------ | ------------ | ------------------------------ |
| **Wave 1** | Oct 20-29    | Complete     | Architectural foundation       |
| **Wave 2** | Nov 3-12     | **COMPLETE** | Multiplayer backend + GraphQL  |
| **Wave 3** | Nov 17-26    | NOT STARTED  | Mutations + Frontend + Betting |
| **Wave 4** | Dec 1-10     | NOT STARTED  | Features + Spectator betting   |
| **Wave 5** | Dec 15-Jan 7 | NOT STARTED  | Betting perfection + Scale     |
| **Wave 6** | Jan 12-21    | NOT STARTED  | MVP launch + Testnet           |

**Current State:** Backend production-ready. Frontend integration begins Nov 17.

---

## Wave 1: Core Game (Completed Oct 20–29)

- Frontend template ready (React + Tailwind)
- Backend structure drafted with comments
- README and documentation baseline established

**Outcome:** Architectural foundation was established.

---

## Wave 2: Multi-player Action Begins (Completed Nov 3–12)

**Goal:** Move from simulation to live microchains and enable foundational multiplayer.

- Implement full Whot ruleset (card matching, action cards, turn order).
- Transition to human vs human (2–4 players) gameplay using Linera microchains.
- On-chain match creation and card actions live across dedicated match chains.

**Outcome:** Production-ready backend with 12+ GraphQL queries, complete Whot logic, professional error handling.

- Recorded demo and marketing materials

**Demo:** Polished, production-ready dApp for Linera Showcase and ETH Denver - if possible.

## Team

| Name                | Role                                  | Bio                                                                                                                                    |
| ------------------- | ------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| **Dinah Macaulay**  | Smart Contract Engineer               | Software developer passionate about blockchain UX and infrastructure. Experienced in Solidity, Cairo, & Rust, working with Linera SDK. |
| **Osehotue Divine** | Frontend Developer / Technical Writer | Builds fast, accessible interfaces with React and TypeScript.                                                                          |
| **Divine Macaulay** | Product Designer & UX Researcher      | Designs intuitive, player-centered gaming experiences. Designs Pitch Deck details for Linot                                            |

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
