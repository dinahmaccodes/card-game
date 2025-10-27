
# Link to Live Demo V1:

<https://linot.vercel.app>


# Linot — Real-Time Whot on Linera Microchains

> A lightning-fast, blockchain-powered card game built on **Linera microchains**.  
> Linot combines nostalgic gameplay with real-time betting to show what **low-latency blockchain gaming** can truly feel like.

---

##  Overview

**Linot** is a multiplayer Whot-style card game built on Linera’s microchain architecture.  
It reimagines the classic African card game we grew up playing — but this time, every move happens **on-chain**, instantly.

Players can challenge friends, join tournaments, or spectate live matches.  
Spectators can even **bet on matches in real time**, with odds that update dynamically as the game progresses.

###  What We’re Proving

> Real-time, on-chain gaming *is possible* — with the right infrastructure.

Most blockchain games are slow because transactions wait in queues.  
With Linera’s **parallel microchains**, every match gets its own chain.  
That means **sub-second latency**, no congestion, and gameplay that feels like Web2.

---

##  Core Concept

| Feature | Description |
|----------|--------------|
|  **Gameplay** | Fast, familiar Whot-style strategy game with action cards |
| ⚡ **Microchain per Match** | Each match runs on its own microchain — zero lag, no interference |
|  **Prediction Market Layer** | Spectators place live bets; odds adjust dynamically via an on-chain pool |
|  **Manual Reward Distribution** | Winners and top players are recorded on-chain, with rewards manually handled during the early phase |
|  **Web2 Feel, Web3 Power** | GraphQL subscriptions + Linera’s instant state updates |

---

##  Gameplay Loop

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

##  Technical Architecture

| Layer | Stack |
|-------|--------|
| **Frontend** | React + Vue + TypeScript + TailwindCSS |
| **State Management** | Zustand (client) + Linera for on-chain state |
| **Blockchain Backend** | Linera Microchains (one microchain per match) |
| **Real-Time Updates** | GraphQL Subscriptions |
| **Smart Contracts** | Rust (Linera SDK) |
| **Betting Engine** | On-chain market maker for live odds |
| **Storage** | Linera key-value store for game data, leaderboards, and match history |

---

##  Development Plan

### **Wave 1: Core Game Prototype (Oct 20–29)**
**Goal:** Prove that Linera can handle real-time multiplayer flow.

-  Frontend template (React + Tailwind)
-  Core gameplay logic (Whot rules + turns)
-  Local state management scaffold
-  Documentation (README + architecture notes)

### **Wave 2: On-Chain Integration (Nov 1–15)**
**Goal:** Move from simulation to live microchains.

- On-chain match creation and card actions  
- Persistent match state  
- Initial betting module  

### **Wave 3: Prediction Market + Spectator Experience (Nov 16–30)**
**Goal:** Add live betting and audience dashboard.

- Dynamic odds update system  
- Spectator leaderboard  
- Manual reward tracking  

### **Wave 4: MVP Launch (Dec)**
**Goal:** Fully playable demo for Linera Showcase.

- End-to-end on-chain gameplay  
- Wallet connection  
- Polished UI + Demo video  

---

##  Team

| Name | Role | Bio |
|------|------|-----|
| **Dinah Macaulay** | Smart Contract Engineer | Software developer passionate about blockchain UX and infrastructure. Experienced in Solidity, Cairo, and Linera SDK. |
| **Osehotue Divine** | Frontend Developer / Technical Writer | Builds fast, accessible interfaces with React and TypeScript. |
| **Divine Macaulay** | Product Designer & UX Researcher | Designs intuitive, player-centered gaming experiences. |

---


##  Links

- **GitHub:** [https://github.com/dinahmaccodes/card-game](https://github.com/dinahmaccodes/card-game)  
- **Demo:** [https://linot.vercel.app](https://linot.vercel.app)  
- **Documentation:** `/docs` folder inside the repo  

---

## 💡 Future Ideas

- ⚔️ **Tournaments + Seasonal Leagues** for competitive play  
- 🧾 **Reward Dashboard** for manually tracking winners  
- 🌉 **Cross-Microchain Communication** experiments for match coordination  
- 📈 **Match Analytics** to visualize performance across sessions  

---

## 🧾 License

This project is licensed under the MIT License — see the [LICENSE](./LICENSE) file for details.

---

> Built with ❤️ on **Linera** to show that Web3 gaming can be fast, fun, and social.
