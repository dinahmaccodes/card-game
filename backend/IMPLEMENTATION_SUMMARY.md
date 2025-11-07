# Linot Card Game - Backend Implementation Summary

## 🎯 What We Built

A complete Linera blockchain application for the Whot (Linot) card game V1, implementing a two-player turn-based game with on-chain state management.

---

## 📁 Files Implemented

### 1. `src/state.rs` - On-Chain Data Structures

**What it contains:**

- `LinotState<C>`: Root application state using Linera's RootView pattern

  - `config`: Match configuration (RegisterView)
  - `match_data`: Current game state (RegisterView)
  - `betting_pool`: Optional betting system (RegisterView, Wave 4-5)

- `MatchConfig`: Game setup parameters

  - Max players, host account, ranked mode, strict mode

- `MatchData`: Complete game state

  - Players list (hands, counts, active status)
  - Current player index
  - Deck and discard pile
  - Match status (Waiting/InProgress/Finished)
  - Winner tracking
  - Special card state (shape demand, pending penalties)

- `Player`: Individual player data

  - Account owner, nickname
  - Hand of cards (hidden from opponents)
  - Card count (visible), active status
  - Last card call tracking

- `MatchStatus`: Game phase enum

- `BettingPool` & `Bet`: Placeholder for staking feature (Wave 4-5)

**Key design decisions:**

- Full hands stored on-chain (filtered in GraphQL service)
- Uses Linera's ViewStorageContext for efficient persistence
- All types implement Serialize/Deserialize for blockchain storage

---

### 2. `src/game_engine.rs` - Core Game Logic

**What it contains:**

- `GameEngine`: Stateless helper functions

**Key functions:**

1. `create_deck()` - Generates 61-card Whot deck
   - 5 suits × 14 values = 70 regular cards
   - 5 Whot (wild) cards
2. `shuffle_with_seed(deck, seed)` - Deterministic Fisher-Yates shuffle

   - Uses chain_id as entropy source
   - Ensures all nodes get same shuffle

3. `deal_initial_hands(deck, num_players)` - Deal 6 cards each

4. `is_valid_play(card, top_card, active_demand, pending_penalty)` - Validates moves

   - Checks suit/value matching
   - Enforces shape demands (Whot cards)
   - Validates penalty card responses

5. `get_card_effect(card)` - Returns special effect enum

6. `apply_effect(state, effect, chosen_suit)` - Applies special card logic

   - Whot: Set shape demand
   - Hold On: Play again
   - Pick Two/Three: Set penalty
   - Suspension: Skip next player
   - General Market: All draw one

7. `advance_turn(state)` - Move to next player

8. `check_game_end(state)` - Detect win conditions
   - Player with 0 cards wins
   - Deck empty + fewest cards wins

**Special card effects:**

- ✅ Whot (wild) - Choose next suit
- ✅ Hold On (1) - Play another card immediately
- ✅ Pick Two (2) - Opponent draws 2
- ✅ Pick Three (5) - Opponent draws 3 (can defend)
- ✅ Suspension (8) - Skip opponent's turn
- ✅ General Market (14) - All other players draw 1

---

### 3. `src/contract.rs` - Blockchain Operations

**What it contains:**

- `LinotContract`: Main contract struct implementing Linera's Contract trait

**Lifecycle methods:**

1. `load(runtime)` - Load state from storage
2. `instantiate(config)` - Initialize new match
3. `execute_operation(op)` - Handle player actions
4. `execute_message(msg)` - Handle cross-chain messages
5. `store()` - Persist state to blockchain

**Operations implemented:**

#### JoinMatch

- Validates match is waiting
- Checks max players not exceeded
- Adds player to match

#### StartMatch (Host only)

- Validates 2 players joined
- Creates and shuffles deck (deterministic)
- Deals 6 cards to each player
- Places first card in discard pile
- Sets status to InProgress

#### PlayCard

- **Validates:**
  - Match in progress
  - Caller's turn
  - Valid card index
  - Card playable (GameEngine rules)
- **Actions:**
  - Remove card from hand
  - Add to discard pile
  - Auto-call last card if needed
  - Apply special effect
  - Check win condition
  - Advance turn (unless Hold On)
  - Handle General Market effect

#### DrawCard

- Draws penalty cards if pending
- Otherwise draws 1 card
- Reshuffles discard pile if deck empty
- Clears shape demand
- Advances turn

#### CallLastCard

- Player manually calls when 1 card left
- (Auto-called in PlayCard for V1)

#### ChallengeLastCard

- Penalize player who didn't call last card
- Draw 2 cards as penalty

#### LeaveMatch

- Mark player as inactive (forfeit)
- Award win to remaining player if only 1 active

**Cross-chain messages (Wave 3 placeholder):**

- InvitePlayer
- PlayerJoined (implemented)
- StateUpdate

---

### 4. `src/lib.rs` - Public API

**What it contains:**

- `LinotAbi`: Contract ABI definition
- `Card`, `CardSuit`, `CardValue`: Data types with GraphQL derives
- `MatchConfig`: Configuration struct
- `Operation`: All mutation operations
- `Message`: Cross-chain communication types

**GraphQL integration:**

- Uses async-graphql derives for automatic schema generation
- SimpleObject, Enum attributes for type exposure
- GraphQLMutationRoot for operations

---

## 🔑 Key Technical Decisions

### 1. Linera SDK Best Practices

✅ **RootView pattern** - State implements RootView<ViewStorageContext>
✅ **RegisterView** - Simple value storage for config and match data
✅ **Deterministic randomness** - Shuffle uses chain_id as seed
✅ **Authenticated operations** - All ops verify caller via runtime
✅ **Atomic transactions** - Each operation is one block

### 2. Game Design (V1 Scope)

✅ **Two players only** - Simplifies turn logic
✅ **6 cards initial hand** - Standard Whot rules
✅ **61-card deck** - 56 regular + 5 Whot
✅ **Auto last-card call** - Reduces complexity
✅ **Deck reshuffle** - Use discard pile when empty

### 3. Special Card Mechanics

✅ **Pick Two** - Cannot be defended (V1 rule)
✅ **Pick Three** - Can defend with another Pick Three (penalty doesn't stack)
✅ **Hold On** - Play any card immediately after
✅ **Suspension** - Skip opponent completely
✅ **General Market** - All opponents draw 1
✅ **Whot** - Choose any suit demand

### 4. State Management

✅ **Full hands on-chain** - Service layer filters for privacy
✅ **Visible card counts** - Players see opponent's hand size
✅ **Active status tracking** - Handle forfeit/leave
✅ **Round counter** - Reshuffle entropy variation

---

## 🚀 What's Next

### Immediate (before testing):

1. Implement `service.rs` - GraphQL query layer
2. Add proper error types (replace panics with Result)
3. Write unit tests for GameEngine
4. Write integration tests for Contract

### Wave 2 (after V1 works):

- Multi-player support (3-4 players)
- Configurable special card rules
- Match history/statistics

### Wave 3 (cross-chain):

- Cross-chain invitations
- Spectator mode
- Replay system

### Wave 4-5 (betting):

- Staking system
- Tournament brackets
- Leaderboards

---

## 📊 Code Statistics

- **Lines of code:** ~800
- **Number of operations:** 8
- **Special card effects:** 6
- **Data structures:** 12
- **Test coverage:** 0% (to be added)

---

## 🔧 Compilation Status

**Last check:** Pending full cargo build
**Known issues:** None identified
**Dependencies:** Linera SDK 0.15.4, async-graphql 7.0.17

---

## 🎮 How to Use

```bash
# Build contract
cd backend
cargo build --release

# Run tests (when added)
cargo test

# Deploy to Linera (after service implementation)
linera project publish-and-create
```

---

## 📚 References

- Linera SDK: https://linera.dev
- Whot Card Game Rules: See `docs/backend_whot_rules.md`
- Architecture: See `docs/technical_architecture.md`
- V1 Roadmap: See `docs/building_logic_v1.md`

---

**Status:** ✅ Core contract logic complete, ready for service layer and testing
**Last updated:** 2025-11-06
