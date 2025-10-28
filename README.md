# Link to Live Demo V1

<https://linot.vercel.app>

# Linot — Real-Time Whot on Linera Microchains

> A lightning-fast, blockchain-powered card game built on **Linera microchains**.  
> Linot combines nostalgic gameplay with real-time betting to show what **low-latency blockchain gaming** can truly feel like.

---

## Overview

**Linot** is a multiplayer Whot-style card game built on Linera’s microchain architecture.  
It reimagines the classic African card game we grew up playing as kids — but this time, every move happens **on-chain**, instantly.

Players can challenge friends, join tournaments, or spectate live matches.  
Spectators can even **bet on matches in real time**, with odds that update dynamically as the game progresses.

### What We’re Proving

> Real-time, on-chain gaming _is possible_ — with the right infrastructure.
> That structure is _Linera_

Most blockchain games are slow because transactions wait in queues.  
With Linera’s **parallel microchains**, every match gets its own chain.  
That means **sub-second latency**, no congestion, and gameplay that feels like Web2 for once.

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

### **Wave 1: Core Game** (Oct 20–29)
**Scope:** Prove it works  
- Frontend template ready (React + Tailwind)
- Backend structure drafted with comments
- README and documentation complete  

**Deliverable:** Basic setup + architecture foundation.

---

### **Wave 2: Multi-player Action Begins (Nov 3–12)**

**Goal:** Move from simulation to live microchains and begin foundation for multiplayer action

#### Gameplay

- Implement full **Whot rules** (card matching, special cards, turn order).
- Add **1v1 vs computer opponent** for baseline logic (optional)  
- Transition to **human vs human (2–4 players)** gameplay. (main feature)
- On-chain match creation and card actions

-----

### **Wave 3: Betting Mechanics + Multiplayer Action Continues (Nov 17–26)**

**Goal:** Complete Multiplayer feature and Betting Mechanism starts

- Spectator leaderboard
- Maintain Persistent match state
- Each match operates on **its own microchain** for instant updates.

#### Betting Mechanics  
- Draft Logic for Initial betting module
- Add manual **staking system** for multiplayer matches (winner takes all).  
- Build **betting logic** for internal players.  
- Track results and payouts manually for now


### **Wave 4: Improve Features (Dec 1-10)**

**Goal:** Fully playable demo for Linera Showcase.

- End-to-end on-chain gameplay
- Wallet connection

#### Plans to Improve Player Experience  
- Integrate **leaderboards** and player stats.  
- Improve animations, responsive layout, and lobby UX.  
- Initial implementation of **tournament mode** (4–8 players). 

---
### **Wave 5: Perfect Betting Feature and Larger Multiplayer Feature (Dec 15 - Jan 7)** 
- Real-time leaderboard updates  
- Improved performance for large tournaments 
- Perfect implementation of **tournament mode** (4–8 players). 
----

### **Wave 6: MVP Launch (Jan 12-21)**
**Goal:** Prepare for presentation and Linera testnet launch.  

- Full UI overhaul for presentation  
- Onboarding tutorial + in-game guide  
- Load testing and bug cleanup  
- Documentation finalization  
- Recorded demo and marketing materials  

**Demo:** Polished, production-ready dApp for Linera Showcase and ETH Denver if possible.

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

- ⚔️ **Tournaments + Seasonal Leagues** for competitive play as community and user numbers grow
- 🧾 **Reward Dashboard** for automatically tracking winners globally
- 🌉 **Cross-Microchain Communication** experiments for match coordination
- 📈 **Match Analytics** to visualize performance across sessions

---

## 🧾 License

This project is licensed under the MIT License — see the [LICENSE](./LICENSE) file for details.

---

> Built with ❤️ on **Linera** to show that Web3 gaming can be fast, fun, and social.
