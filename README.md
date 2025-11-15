# Link to Live Demo V1

<https://linot.vercel.app>

# Linot — Real-Time Whot on Linera Microchains

> A lightning-fast, blockchain-powered card game built on **Linera microchains**.  
> Linot combines nostalgic gameplay with real-time betting to show what **low-latency blockchain gaming** can truly feel like.

---

## Overview

**Linot** is a multiplayer Whot-style card game built on Linera’s microchain architecture.  
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

#### Code Quality

- 0 compilation errors
- 0 warnings
- Follows Linera SDK best practices
- Matches patterns from reference projects (Microbet, ChainClashArena)

#### What's Ready

- Backend contract deployable to Linera testnet
- GraphQL service ready for frontend integration
- Full game playable end-to-end on-chain

#### Still in Progress - To Be worked on for Wave 3

- Frontend integration with GraphQL queries
- Spectator betting UI (smart contract hooks prepared)
- Comprehensive test suite
- Computer opponent (deferred to post-Wave 3)

**Next up (Wave 3):** Frontend-backend integration, betting mechanics finalization, comprehensive testing, and state persistence hardening.

---

## Core Concept

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

| Layer                  | Stack                                                                 |
| ---------------------- | --------------------------------------------------------------------- |
| **Frontend**           | React + Vue + TypeScript + TailwindCSS                                |
| **State Management**   | Zustand (client) + Linera for on-chain state                          |
| **Blockchain Backend** | Linera Microchains (one microchain per match)                         |
| **Real-Time Updates**  | GraphQL Subscriptions                                                 |
| **Smart Contracts**    | Rust (Linera SDK)                                                     |
| **Betting Engine**     | On-chain market maker for live odds                                   |
| **Storage**            | Linera key-value store for game data, leaderboards, and match history |

---

## Development Plan

### Wave 1: Core Game (Completed Oct 20–29)

- Frontend template ready (React + Tailwind)
- Backend structure drafted with comments
- README and documentation baseline established

**Outcome:** Architectural foundation and scaffolding complete.

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

## Links

- **GitHub:** [https://github.com/dinahmaccodes/card-game](https://github.com/dinahmaccodes/card-game)
- **Demo:** [https://linot.vercel.app](https://linot.vercel.app)
- **Documentation:** `/docs` folder inside the repo

---

## Future Ideas

- **Tournaments + Seasonal Leagues** for competitive play as community and user numbers grow
- **Reward Dashboard** for automatically tracking winners globally
- **Cross-Microchain Communication** experiments for match coordination
- **Match Analytics** to visualize performance across sessions

---

> Built with ❤️ on **Linera** to show that Web3 gaming can be fast, fun, and social.
