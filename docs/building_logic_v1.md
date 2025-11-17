# **🎮 Linot V1 Development Guide - Two-Player Minimal Viable Game**

---

## **📊 V1 Match State (On-Chain Storage)**

```
Match State:
├── Players[2] (exactly 2 players for V1)
│   ├── Account ID (AccountOwner - who they are)
│   ├── Hand[] (Vec<Card> - their cards, HIDDEN from opponent)
│   ├── Card count (usize - VISIBLE to all)
│   ├── Is active (bool - still in game?)
│   └── Nickname (String - display name)
├── Current turn (usize - index 0 or 1)
├── Discard pile (Vec<Card> - visible game history)
├── Draw pile (Vec<Card> - hidden shuffled deck)
├── Active shape demand (Option<CardSuit> - set by Whot card)
├── Match status (MatchStatus - Waiting/InProgress/Finished)
├── Winner index (Option<usize> - which player won)
└── Round number (u32 - for reshuffle entropy)
```

**Key Decision**: Store full hands in contract, filter in GraphQL service (Linera best practice)

---

## **🔄 Turn-Based Flow (Atomic Operations)**

Each player action is a complete transaction:

```
Player clicks "Play Card" in UI
    ↓
Frontend sends GraphQL mutation
    ↓
┌─────────────────────────────────────┐
│ CONTRACT VALIDATES (in this order): │
│ 1. Is it your turn?                 │
│ 2. Do you own this card?            │
│ 3. Is the move valid?               │
└─────────────────────────────────────┘
    ↓
Contract applies effects
    ↓
Contract checks win condition
    ↓
State automatically persists to blockchain
    ↓
Frontend receives update via GraphQL subscription
    ↓
UI updates (opponent sees your move)
```

**Critical**: Validation happens BEFORE any state changes. If validation fails, entire operation reverts.

---

## **🎴 Card Validation Logic (Phase 3)**

### **Matching Hierarchy**

```
Priority Order:
1. Whot card → ALWAYS valid (can be played on anything)
2. Active shape demand exists? → MUST match demanded shape
3. No demand? → Match top card's shape OR number
```

### **Validation Pseudocode**

```rust
fn is_valid_play(player_card, top_card, active_demand) -> bool {
    // Rule 1: Whot is always valid
    if player_card.value == Whot {
        return true;
    }
    
    // Rule 2: If there's an active shape demand (from previous Whot)
    if let Some(demanded_shape) = active_demand {
        return player_card.shape == demanded_shape;
    }
    
    // Rule 3: Regular matching (shape OR number)
    return (
        player_card.shape == top_card.shape ||
        player_card.value == top_card.value
    );
}
```

### **V1 Edge Cases (Keep Simple)**

| Scenario | V1 Behavior |
|----------|-------------|
| Whot played on Whot |  Allowed - new shape demand overwrites old |
| Pick Two stacking |  NOT in V1 - save for Wave 2 |
| Empty deck mid-game |  Reshuffle discard pile (except top card) |
| Invalid card index |  Panic with error message |
| Playing out of turn |  Panic with "Not your turn" |

**Key Insight**: Check active demand BEFORE checking top card match.

---

## ** Special Card Effects (V1 - Simplified)**

### **Special Cards Reference Table**

| Card | Number | Effect | Turn Advancement | V1 Implementation |
|------|--------|--------|------------------|-------------------|
| **Whot** | - | Player chooses new shape | Normal (advances to next player) |  Required for operation |
| **Hold On** | 1 | Current player plays again | Same player gets another turn |  Simple turn skip |
| **Pick Two** | 2 | Next player draws 2 cards | Skip next player's turn |  Simple draw + skip |
| **Pick Three** | 5 | Next player draws 3 cards | Skip next player's turn |  Simple draw + skip |
| **Suspension** | 8 | Next player loses their turn | Skip next player |  Just advance by 2 |
| **General Market** | 14 | All other players draw 1 | Normal advancement |  Loop through opponents |

### **V1 Special Card Logic (Simple Version)**

```rust
// Pseudocode for V1 special effects

fn apply_special_effect(card, state) {
    match card.value {
        Whot => {
            // Player must choose shape in same operation
            state.active_shape_demand = chosen_shape;
            advance_turn(state); // Normal turn advance
        }
        
        HoldOn(1) => {
            // Current player plays again
            // DON'T advance turn
        }
        
        PickTwo(2) => {
            next_player = get_next_player(state);
            next_player.draw_cards(2);
            skip_next_player(state); // Advance by 2 positions
        }
        
        PickThree(5) => {
            next_player = get_next_player(state);
            next_player.draw_cards(3);
            skip_next_player(state);
        }
        
        Suspension(8) => {
            skip_next_player(state); // Just skip, no draw
        }
        
        GeneralMarket(14) => {
            for opponent in all_opponents(state) {
                opponent.draw_cards(1);
            }
            advance_turn(state); // Normal advance
        }
        
        _ => {
            // Regular card - just advance turn
            advance_turn(state);
        }
    }
}

fn advance_turn(state) {
    state.current_turn = (state.current_turn + 1) % 2; // Toggle 0 ↔ 1
}

fn skip_next_player(state) {
    state.current_turn = (state.current_turn + 2) % 2; // Same as advance in 2-player
}
```

**V1 Simplification**: With only 2 players, "skip next" = "same player again". This makes logic easier.

---

## **🎲 Deck Management (Phase 5)**

### **Shuffle Strategy**

```rust
// Shuffle happens at two points:

1. Match Creation (instantiate):
   let seed = chain_id.to_bytes();
   let mut deck = create_full_deck();
   shuffle_with_seed(&mut deck, seed);

2. Deck Empty (reshuffle):
   if draw_pile.is_empty() {
       let cards = take_discard_except_top();
       let seed = hash(chain_id + round_number);
       shuffle_with_seed(&mut cards, seed);
       draw_pile = cards;
       reshuffle_count += 1;
   }
```

### **Reshuffle Rules**

| Players | Max Reshuffles | Reasoning |
|---------|----------------|-----------|
| 2 players | 3 | Prevents infinite stalemate games |
| 3-4 players | 4 | More cards in play, allow one extra |
| 5-6 players | 5 | High card usage, need more reshuffles |

**V1 Implementation**: Fixed at 3 reshuffles for 2-player mode.

```rust
const MAX_RESHUFFLES: u8 = 3;

if draw_pile.is_empty() && reshuffle_count < MAX_RESHUFFLES {
    // Perform reshuffle
} else if reshuffle_count >= MAX_RESHUFFLES {
    // Game ends in draw - player with fewer cards wins
}
```

---

## **🏆 Win Detection (Phase 6)**

### **Win Check Flow**

```rust
// After EVERY card play:

fn check_win_condition(state) -> Option<WinResult> {
    // Priority 1: Empty hand wins
    if current_player.hand.is_empty() {
        return Some(Winner(current_player_index));
    }
    
    // Priority 2: Only one active player (opponent forfeited)
    if active_players.count() == 1 {
        return Some(Winner(last_active_player));
    }
    
    // Priority 3: Deck exhausted + max reshuffles reached
    if reshuffle_count >= MAX_RESHUFFLES && draw_pile.is_empty() {
        let winner = player_with_fewest_cards();
        return Some(Winner(winner));
    }
    
    return None; // Game continues
}
```

### **V1 Edge Cases**

| Scenario | V1 Handling |
|----------|-------------|
| Player wins on Hold On | Game ends immediately, no second turn given |
| Player wins on General Market | Opponent still draws (effect triggers first) |
| Last active player | Auto-win if opponent forfeits |
| Both players forfeit | First forfeiter loses |

### **Forfeit Logic**

```rust
fn handle_forfeit(leaving_player, state) {
    leaving_player.is_active = false;
    
    if active_players.count() == 1 {
        state.status = Finished;
        state.winner = remaining_player;
    }
}
```

---

## **🔐 Security & Turn Enforcement (Phase 7)**

### **Anti-Cheat Checklist**

```rust
// Every state-changing operation MUST verify:

 DO: Authenticate caller
   let caller = runtime.authenticated_signer()?;

 DO: Verify turn ownership
   if state.current_player != caller { panic!("Not your turn"); }

 DO: Validate card ownership
   if !player.hand.contains(card) { panic!("Card not in hand"); }

 DO: Validate game rules
   if !is_valid_play(card, top_card) { panic!("Invalid move"); }

 DON'T: Trust client-provided indices
   Verify card_index < player.hand.len()

 DON'T: Expose full hands in queries
   Filter in service layer based on requester
```

### **Turn Verification Pattern**

```rust
// Template for all game operations:

async fn execute_operation(&mut self, operation: Operation) {
    let caller = self.runtime.authenticated_signer()?;
    let mut state = self.state.match_state.get().clone();
    
    // 1. Verify it's their turn
    let current_player = &state.players[state.current_turn];
    if current_player.account != caller {
        panic!("Not your turn");
    }
    
    // 2. Validate operation-specific logic
    // (e.g., card exists, move is valid)
    
    // 3. Apply changes
    // (modify state)
    
    // 4. Check win condition
    if let Some(winner) = check_win(state) {
        state.status = Finished;
        state.winner = Some(winner);
    }
    
    // 5. Persist
    self.state.match_state.set(state);
}
```

---

## **📡 GraphQL Service (Phase 8)**

### **Query Types for V1**

```graphql
# 1. Full Match State (spectators/debugging)
type Query {
  matchState: MatchData!
}

# 2. Player-Specific View (filtered)
type Query {
  playerView(myAccount: String!): PlayerView
}

# 3. Public Info
type Query {
  matchInfo: MatchInfo!
}
```

### **Filtering Pattern**

```rust
// Service layer hides opponent's cards:

fn player_view(my_account: String) -> PlayerView {
    let state = self.state.match_state.get();
    
    let my_player = state.players.find(|p| p.account == my_account)?;
    let opponent = state.players.find(|p| p.account != my_account)?;
    
    PlayerView {
        my_cards: my_player.hand.clone(), // FULL cards
        my_card_count: my_player.card_count,
        
        opponent_name: opponent.nickname,
        opponent_card_count: opponent.card_count, // COUNT ONLY
        
        top_card: state.discard_pile.last(),
        active_demand: state.active_shape_demand,
        is_my_turn: state.current_turn == my_player_index,
        
        match_status: state.status,
    }
}
```

---

## ** Operation Sequencing (Phase 9)**

### **V1 Match Lifecycle**

```
┌─────────────────────────────────────────────────┐
│ 1. CREATE MATCH (instantiate)                   │
│    - Deployer creates new microchain            │
│    - Deck shuffled with chain_id seed           │
│    - Status: Waiting                            │
│    - Players: []                                │
└─────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────┐
│ 2. JOIN MATCH (operation: JoinMatch)            │
│    - Player 1 joins → added to players[]        │
│    - Player 2 joins → added to players[]        │
│    - Still Status: Waiting                      │
└─────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────┐
│ 3. START MATCH (operation: StartMatch)          │
│    - Deal 6 cards to each player                │
│    - Flip top card to discard pile              │
│    - Status: InProgress                         │
│    - current_turn = 0 (Player 1 starts)         │
└─────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────┐
│ 4. GAME LOOP (operations: PlayCard/DrawCard)    │
│                                                  │
│    Player 1's Turn:                              │
│    → PlayCard(card_index, chosen_shape?)         │
│       ✓ Validate turn                           │
│       ✓ Validate card                           │
│       ✓ Apply effects                           │
│       ✓ Check win                               │
│       ✓ Advance turn → Player 2                 │
│                                                  │
│    Player 2's Turn:                              │
│    → DrawCard()  (if stuck)                      │
│       ✓ Validate turn                           │
│       ✓ Draw from pile                          │
│       ✓ Advance turn → Player 1                 │
│                                                  │
│    (Loop continues...)                           │
└─────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────┐
│ 5. GAME END (automatic)                         │
│    - Winner detected (empty hand)               │
│    - Status: Finished                           │
│    - winner_index set                           │
│    - Match state immutable                      │
└─────────────────────────────────────────────────┘
```

**Key Insight**: Each box is a separate operation = separate block on-chain.

---

## ** V1 Build Sequence (Minimal Playable Game)**

### **Step 1: Foundation (Week 1)**

```
Priority Tasks:
□ Define data structures in state.rs
  - Card struct (shape, value)
  - Player struct (account, hand, card_count, active, nickname)
  - MatchData struct (all game state)
  - MatchStatus enum (Waiting, InProgress, Finished)

□ Create full deck in game_engine.rs
  - 56 total cards (4 suits × 14 numbers)
  - 5 Whot cards
  - 10 special cards (2 each: 1,2,5,8,14)

□ Implement deterministic shuffle
  - shuffle_with_seed(deck, chain_id)

TEST: Can you print a shuffled deck?
```

### **Step 2: Basic Operations (Week 1-2)**

```
Priority Tasks:
□ Implement Operation::JoinMatch
  - Add player to players[]
  - Validate max 2 players
  - Set nickname

□ Implement Operation::StartMatch
  - Deal 6 cards to each player
  - Flip one card to discard pile
  - Set status = InProgress
  - Set current_turn = 0

□ Implement Operation::PlayCard (regular cards only)
  - Verify turn ownership
  - Verify card in hand
  - Remove from hand, add to discard
  - Advance turn (0 ↔ 1)

□ Implement Operation::DrawCard
  - Verify turn ownership
  - Pop from draw_pile
  - Add to player hand
  - Advance turn

TEST: Can 2 players join, start, and take turns?
```

### **Step 3: Card Validation (Week 2)**

```
Priority Tasks:
□ Implement is_valid_play() in game_engine.rs
  - Check shape OR number match
  - Handle Whot (always valid)

□ Add validation to PlayCard operation
  - Call is_valid_play() before accepting move
  - Panic if invalid

□ Implement win detection
  - Check empty hand after every play
  - Set status = Finished
  - Record winner

TEST: Can you complete a full game and detect winner?
```

### **Step 4: Special Cards (Week 3)**

```
Priority Tasks:
□ Add Whot card support
  - Require chosen_shape parameter
  - Set active_shape_demand
  - Update validation to check demand

□ Add Hold On (1)
  - Don't advance turn

□ Add Pick Two (2) and Pick Three (5)
  - Next player draws N cards
  - Skip their turn

□ Add Suspension (8)
  - Skip next player's turn

□ Add General Market (14)
  - Opponent draws 1 card
  - Turn advances normally

TEST: Do all special cards work correctly?
```

### **Step 5: GraphQL Service (Week 3-4)**

```
Priority Tasks:
□ Implement QueryRoot in service.rs
  - matchState() - full state
  - playerView(account) - filtered view

□ Add mutations (auto-generated from Operations)
  - joinMatch(nickname)
  - startMatch()
  - playCard(cardIndex, chosenShape)
  - drawCard()

□ Test with GraphiQL
  - Deploy to local testnet
  - Query match state
  - Execute operations

TEST: Can you play via GraphiQL interface?
```

### **Step 6: Edge Cases & Polish (Week 4)**

```
Priority Tasks:
□ Implement deck reshuffle
  - When draw_pile empty
  - Use discard_pile except top card
  - Track reshuffle_count

□ Handle forfeit
  - Operation::LeaveMatch
  - Set player.is_active = false
  - Auto-win for remaining player

□ Error messages
  - Clear panic messages for all validations
  - Helpful errors in GraphQL responses

TEST: Can game handle all edge cases without crashing?
```

---

## ** V1 Definition of Done**

```
A V1 match is complete when:
 2 players can join a match
 Host can start the match
 Players take turns playing cards
 Card validation works (shape/number matching)
 All 6 special cards work correctly
 Win condition detected (empty hand)
 Game state persists between operations
 GraphQL queries return correct filtered views
 Can be played via GraphiQL (or simple frontend)
 Game never crashes (all errors handled gracefully)
```

---

## ** Development Checklist**

```
Week 1:
□ Project structure created
□ Cargo.toml configured
□ Card/Player/Match structs defined
□ Deck creation function works
□ Shuffle function works
□ JoinMatch operation implemented
□ StartMatch operation implemented

Week 2:
□ PlayCard operation (basic)
□ DrawCard operation
□ Turn enforcement working
□ Card validation function
□ Win detection logic
□ First complete 2-player game works

Week 3:
□ Whot card support
□ Hold On implemented
□ Pick Two/Three implemented
□ Suspension implemented
□ General Market implemented
□ All special cards tested

Week 4:
□ GraphQL service complete
□ Deck reshuffle logic
□ Forfeit handling
□ Error messages polished
□ Deployed to testnet
□ V1 COMPLETE 
```

---

**Next Action**: Start with `backend/src/state.rs` - define your `Card`, `Player`, and `MatchData` structs. Everything builds from this foundation.
