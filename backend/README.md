# Linot Card Game - Backend (Smart Contract)

## 🎯 Project Overview

This is a **Linera blockchain smart contract** implementing a two-player Whot/Linot card game (PvP). The game is fully on-chain, using Linera's microchains architecture for fast, scalable gameplay.

**Game Type:** Turn-based card game (Nigerian Whot rules)  
**Players:** 2 players (V1 implementation)  
**Blockchain:** Linera Protocol SDK v0.15.4  
**Language:** Rust (compiled to WASM)

---

## 📁 Project Structure

```
backend/
├── Cargo.toml                    # Dependencies and build config
├── rust-toolchain.toml           # Rust version specification
├── src/
│   ├── lib.rs                    # Public ABI (types, operations, messages)
│   ├── contract.rs               # Contract logic (operations, state transitions)
│   ├── state.rs                  # On-chain state structures (uses Linera Views)
│   ├── game_engine.rs            # Game rules and card logic
│   └── service.rs                # GraphQL service (read-only queries)
├── tests/
│   └── single_chain.rs           # Integration tests
└── target/                       # Build artifacts (WASM binaries)
```

---

## 🧩 File-by-File Breakdown

### **1. `src/lib.rs` - Public Interface (ABI)**

**Purpose:** Defines the contract's external interface - what operations players can perform and what data types are used.

**Key Components:**

- **`LinotAbi`**: Contract application binary interface
- **`Card`**: Represents a playing card (suit + value)
- **`CardSuit`**: Circle, Cross, Triangle, Square, Star
- **`CardValue`**: One through Fourteen, plus special cards (Whot, PickTwo, etc.)
- **`MatchConfig`**: Game setup parameters (max players, host, ranked mode)
- **`Operation` enum**: All player actions:
  - `JoinMatch` - Join a waiting game
  - `StartMatch` - Host starts the game (deals cards)
  - `PlayCard` - Play a card from your hand
  - `DrawCard` - Draw from the deck
  - `CallLastCard` - Announce when you have 1 card left
  - `ChallengeLastCard` - Penalize opponent who forgot to call
  - `LeaveMatch` - Forfeit the game
  - `PlaceBet` - (Wave 4-5, not implemented in V1)
- **`Message` enum**: Cross-chain communication:
  - `InvitePlayer` - Invite player from another chain
  - `PlayerJoined` - Remote player joined notification
  - `StateUpdate` - Broadcast game state to spectators

**GraphQL Integration:**

- Uses `async-graphql` derives for automatic schema generation
- Types marked with `#[derive(SimpleObject)]` become GraphQL types
- Operations become GraphQL mutations in the service

---

### **2. `src/state.rs` - On-Chain State Management**

**Purpose:** Defines all data stored on the blockchain using Linera's Views pattern.

**Key Structures:**

#### **`LinotState`** (Root State)

Uses `#[derive(RootView)]` to enable persistent storage:

```rust
pub struct LinotState {
    pub config: RegisterView<MatchConfig>,           // Game configuration
    pub match_data: RegisterView<MatchData>,         // Current game state
    pub betting_pool: RegisterView<Option<BettingPool>>, // Optional betting (Wave 4-5)
}
```

#### **`MatchConfig`**

Set at game creation, immutable:

- `max_players`: 2 for V1
- `host`: AccountOwner who created the match
- `is_ranked`: Competitive mode flag
- `strict_mode`: Must draw if no valid move

#### **`MatchData`**

The live game state that changes every turn:

- `players: Vec<Player>` - All players in the match
- `current_player_index: usize` - Whose turn it is (0 or 1)
- `deck: Vec<Card>` - Draw pile (hidden from players)
- `discard_pile: Vec<Card>` - Played cards (top card visible)
- `status: MatchStatus` - Waiting / InProgress / Finished
- `winner_index: Option<usize>` - Winner when game ends
- `round_number: u32` - Used for reshuffling entropy
- `created_at: u64` - Timestamp
- `active_shape_demand: Option<CardSuit>` - Set by Whot card
- `pending_penalty: u8` - Cards to draw from Pick Two/Three

#### **`Player`**

Individual player data:

- `owner: AccountOwner` - Blockchain identity
- `nickname: String` - Display name
- `cards: Vec<Card>` - **Private** (hidden from opponent in queries)
- `card_count: usize` - **Public** (everyone can see)
- `is_active: bool` - Still in game (not forfeited)
- `called_last_card: bool` - Anti-cheat flag

#### **`MatchStatus`**

```rust
enum MatchStatus {
    Waiting,      // Lobby, waiting for players
    InProgress,   // Game started
    Finished,     // Game over
}
```

**State Persistence:**

- Uses Linera's **RegisterView** for single-value storage
- Automatically serialized/deserialized with BCS
- `load()` and `save()` methods provided by RootView trait
- All mutations must call `self.state.match_data.set(...)` to persist

---

### **3. `src/game_engine.rs` - Game Rules Logic**

**Purpose:** Stateless helper functions implementing Whot card game rules. Pure deterministic logic.

**Key Functions:**

#### **`create_deck() -> Vec<Card>`**

Generates a 61-card Whot deck:

- 5 suits × 14 values = 70 possible cards
- But only specific combinations exist (56 regular + 5 Whot)

#### **`shuffle_with_seed(deck: &mut Vec<Card>, seed: &[u8])`**

**Deterministic** Fisher-Yates shuffle:

- Uses chain_id as seed → all nodes get same shuffle
- Critical for blockchain consensus

#### **`deal_initial_hands(deck: &mut Vec<Card>, num_players: usize) -> Vec<Vec<Card>>`**

Deals 6 cards to each player.

#### **`is_valid_play(card, top_card, active_demand, pending_penalty) -> bool`**

**Core validation logic:**

1. Whot card → always valid
2. Active shape demand? → Must match demanded suit
3. Pending penalty? → Can only play defense cards (Pick Two/Three)
4. Otherwise → Match suit OR value

#### **`get_card_effect(card: &Card) -> SpecialEffect`**

Maps cards to their special effects.

#### **`apply_effect(state: &mut MatchData, effect: SpecialEffect, chosen_suit: Option<CardSuit>)`**

Applies special card effects:

- **Whot**: Set active_shape_demand
- **Hold On (1)**: Same player plays again
- **Pick Two (2)**: Set pending_penalty = 2
- **Pick Three (5)**: Set pending_penalty = 3
- **Suspension (8)**: Skip next player
- **General Market (14)**: All opponents draw 1 card

#### **`advance_turn(state: &mut MatchData)`**

Cycles to next player: `(current + 1) % num_players`

#### **`check_game_end(state: &MatchData) -> Option<GameResult>`**

Win conditions:

- Player with 0 cards → Winner
- Deck empty + fewest cards → Winner

---

### **4. `src/contract.rs` - Blockchain Contract**

**Purpose:** The main smart contract implementing Linera's `Contract` trait. Handles all blockchain operations.

**Contract Lifecycle:**

#### **`load(runtime) -> Self`**

Called on every operation to load state from storage:

```rust
let state = LinotState::load(runtime.root_view_storage_context())
    .await
    .expect("Failed to load state");
```

#### **`instantiate(&mut self, config: MatchConfig)`**

Called once when contract is deployed:

- Stores initial `MatchConfig`
- Creates empty `MatchData` with status = Waiting
- Initializes betting pool as None

#### **`execute_operation(&mut self, operation: Operation)`**

Routes player actions to handler functions:

- Gets caller via `runtime.authenticated_signer()`
- Validates caller has permission
- Calls appropriate handler
- State changes are committed in `store()`

#### **`execute_message(&mut self, message: Message)`**

Handles cross-chain messages:

- `InvitePlayer` - (Wave 3, not in V1)
- `PlayerJoined` - Add remote player to match
- `StateUpdate` - (Spectator feature, not in V1)

#### **`store(mut self)`**

Called after every operation to persist state:

```rust
self.state.save().await.expect("Failed to save state");
```

**Operation Handlers:**

#### **`handle_join_match(caller, nickname)`**

1. Validate: match is Waiting
2. Validate: not at max_players
3. Validate: caller not already joined
4. Add `Player::new(caller, nickname)` to players list
5. Save state

#### **`handle_start_match(caller)`**

1. Validate: caller is host
2. Validate: exactly 2 players joined
3. Create and shuffle deck (using chain_id as seed)
4. Deal 6 cards to each player
5. Place first card in discard pile
6. Set status = InProgress
7. Save state

#### **`handle_play_card(caller, card_index, chosen_suit)`**

**Most complex operation:**

1. Validate: match is InProgress
2. Validate: it's caller's turn
3. Validate: card_index is valid
4. Get card from player's hand
5. Validate: `GameEngine::is_valid_play()`
6. Remove card from hand
7. Add card to discard pile
8. Auto-call last card if player has 1 card left
9. Apply special card effect via `GameEngine::apply_effect()`
10. Check win condition via `GameEngine::check_game_end()`
11. Handle General Market if needed
12. Save state

#### **`handle_draw_card(caller)`**

1. Validate: it's caller's turn
2. Determine cards to draw (penalty or 1)
3. Draw cards from deck
4. If deck empty → reshuffle discard pile (except top card)
5. Clear active_shape_demand
6. Advance turn
7. Save state

#### **`handle_call_last_card(caller)`**

Sets `called_last_card = true` for caller.

#### **`handle_challenge_last_card(caller, player_index)`**

1. Validate player_index is valid
2. If player has 1 card and didn't call → penalty
3. Player draws 2 cards
4. Save state

#### **`handle_leave_match(caller)`**

1. Mark caller as `is_active = false`
2. If only 1 active player left → opponent wins
3. Set status = Finished
4. Save state

---

### **5. `src/service.rs` - GraphQL Service**

**Purpose:** Read-only GraphQL API for querying game state. Runs in client, not validators.

**Key Queries:**

- `getMatchState` - Current game state (filters opponent's cards)
- `getPlayerHand` - Player's private cards
- `getTopCard` - Current card in discard pile
- `getActivePlayer` - Whose turn it is

**Important:**

- Service is **READ-ONLY** - cannot execute operations
- Operations must be submitted via Linera client (CLI or SDK)
- Service uses Views to query state without loading full contract

---

## 🎮 Game Flow Example

### **Setup Phase:**

1. Player 1 deploys contract with `instantiate(config)`
2. Player 1 executes `JoinMatch { nickname: "Alice" }`
3. Player 2 executes `JoinMatch { nickname: "Bob" }`
4. Player 1 (host) executes `StartMatch`
   - Deck is created and shuffled
   - Each player gets 6 cards
   - First card placed in discard pile
   - Status → InProgress

### **Gameplay Phase:**

5. Player 1's turn - executes `PlayCard { card_index: 2, chosen_suit: None }`

   - Contract validates it's their turn
   - Validates card matches top card
   - Removes card from hand
   - Adds to discard pile
   - Applies special effect if any
   - Advances turn to Player 2

6. Player 2's turn - no valid move, executes `DrawCard`

   - Draws 1 card from deck
   - Turn advances back to Player 1

7. Player 1 plays Whot card - `PlayCard { card_index: 1, chosen_suit: Some(Circle) }`

   - Sets active_shape_demand = Circle
   - Player 2 must play a Circle next

8. Player 2 plays Pick Two card
   - Sets pending_penalty = 2
   - Player 1 must draw 2 cards next turn (unless they defend with another Pick card)

### **End Game:**

9. Player 1 plays last card
   - `called_last_card` is auto-set to true
   - Hand is empty
   - `check_game_end()` detects winner
   - Status → Finished
   - winner_index = 0

---

## 🔑 Key Linera Concepts Used

### **1. Views (Persistent Storage)**

```rust
#[derive(RootView)]
#[view(context = "ViewStorageContext")]
pub struct LinotState {
    pub config: RegisterView<MatchConfig>,
    // ...
}
```

- **RootView**: Top-level state container
- **RegisterView**: Stores a single value
- **MapView**: Key-value map (not used in V1, for future features)
- Views automatically handle serialization/deserialization

### **2. Deterministic Execution**

- **No randomness** - shuffle uses chain_id as seed
- **No system time variance** - uses `runtime.system_time()`
- All nodes execute identically → consensus

### **3. Authentication**

```rust
let caller = self.runtime.authenticated_signer().expect("Caller required");
```

- Every operation knows who submitted it
- Can't fake another player's move

### **4. Atomic Operations**

- Each operation is a separate transaction
- Either fully succeeds or fully reverts
- No partial state changes

---

## 🚀 Building and Deployment

### **Build WASM Binaries:**

```bash
cargo build --release --target wasm32-unknown-unknown
```

Output: `target/wasm32-unknown-unknown/release/backend_contract.wasm`

### **Deploy to Linera:**

```bash
linera publish-and-create \
  backend/target/wasm32-unknown-unknown/release/backend_contract.wasm \
  backend/target/wasm32-unknown-unknown/release/backend_service.wasm \
  --json-argument '{"max_players": 2, "host": "<account>", "is_ranked": false, "strict_mode": false}'
```

### **Execute Operations (via CLI):**

```bash
# Join match
linera execute-operation \
  --application-id <app-id> \
  --operation '{"JoinMatch": {"nickname": "Alice"}}'

# Start match (host only)
linera execute-operation \
  --application-id <app-id> \
  --operation '{"StartMatch": {}}'

# Play a card
linera execute-operation \
  --application-id <app-id> \
  --operation '{"PlayCard": {"card_index": 2, "chosen_suit": null}}'
```

---

## 📊 State Management Diagram

```
┌─────────────────────────────────────────┐
│         LinotState (RootView)           │
├─────────────────────────────────────────┤
│ config: RegisterView<MatchConfig>      │ ← Set once at instantiation
│ match_data: RegisterView<MatchData>    │ ← Updated every turn
│ betting_pool: RegisterView<...>        │ ← Future feature (Wave 4-5)
└─────────────────────────────────────────┘
                    │
                    │ match_data contains:
                    ▼
┌─────────────────────────────────────────┐
│            MatchData                    │
├─────────────────────────────────────────┤
│ players: Vec<Player>                    │ ← 2 players in V1
│   ├─ Player 0                           │
│   │   ├─ cards: [Card, Card, ...]      │ ← PRIVATE
│   │   ├─ card_count: 6                  │ ← PUBLIC
│   │   └─ called_last_card: false        │
│   └─ Player 1                           │
│       ├─ cards: [Card, Card, ...]      │
│       └─ ...                            │
│                                         │
│ current_player_index: 0                 │ ← Whose turn (0-1)
│ deck: [Card, Card, ...]                 │ ← 49 cards left
│ discard_pile: [Card]                    │ ← Top card visible
│ status: InProgress                      │
│ active_shape_demand: Some(Circle)       │ ← From Whot card
│ pending_penalty: 2                      │ ← From Pick Two
└─────────────────────────────────────────┘
```

---

## 🐛 Debugging Tips

### **Common Errors:**

**"Not your turn"**

- Trying to play when it's opponent's turn
- Check `current_player_index` in state

**"Invalid play"**

- Card doesn't match top card (suit or value)
- Active shape demand not met
- Pending penalty not handled

**"Match not in progress"**

- Trying to play before `StartMatch` called
- Match already finished

### **Testing Locally:**

```bash
# Start local Linera network
linera net up

# Run tests
cargo test --workspace
```

### **View State:**

Query via GraphQL service:

```graphql
query {
  matchState {
    status
    currentPlayerIndex
    players {
      nickname
      cardCount
    }
    topCard {
      suit
      value
    }
  }
}
```

---

## 🎯 Next Steps (V1 → V2+)

**Current V1 Features:**

- ✅ 2-player PvP
- ✅ All special cards working
- ✅ Win/draw detection
- ✅ Auto last-card calling
- ✅ Deterministic shuffling

**Future Enhancements:**

- **Wave 2**: 3-6 player support
- **Wave 3**: Cross-chain invites (play across microchains)
- **Wave 4**: Betting/staking with tokens
- **Wave 5**: Tournaments, leaderboards, ranked mode
- **Wave 6**: Spectator mode, live broadcasts

---

## 📚 References

- **Linera SDK Docs**: https://linera.dev
- **Whot Rules**: `docs/backend_whot_rules.md`
- **Game Logic Guide**: `docs/building_logic_v1.md`
- **Reference Projects**:
  - Microbet: https://github.com/egorble/Microbet
  - ChainClashArena: https://github.com/dinitheth/ChainClashArena

---

## 💡 Architecture Philosophy

**Why Linera for a Card Game?**

1. **Instant Finality**: Moves confirmed in <0.5s
2. **Horizontal Scaling**: Each game = separate microchain
3. **No Gas Fees**: Players don't pay per move
4. **Composability**: Other apps can integrate our game
5. **Verifiable Fairness**: All logic on-chain, no cheating

**Design Decisions:**

- Store full hands on-chain, filter in service (simpler than encrypted storage)
- Deterministic shuffle ensures all validators agree on deck order
- Auto-call last card in V1 (manual in future for strategy)
- Penalty system enforced by smart contract (no trust needed)

---

**Built with ❤️ for the Linera ecosystem**
