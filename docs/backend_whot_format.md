1. Create Match (instantiate)
   └─> Initialize deck (shuffled deterministically)
   └─> Set status = Waiting

2. Players Join (operation)
   └─> Add to players list
   └─> Validate max_players limit

3. Start Match (operation)
   └─> Deal 6 cards to each player
   └─> Place 1 card on discard pile
   └─> Set status = InProgress

4. Game Loop:
   4a. Current player's turn
   ├─> Play Card (operation)
   │ ├─> Validate turn
   │ ├─> Validate card match
   │ ├─> Apply special effects
   │ ├─> Check win condition
   │ └─> Advance turn
   │
   └─> OR Draw Card (operation)
   ├─> Validate turn
   ├─> Add card to hand
   └─> Advance turn

5. End Game
   └─> Set status = Finished
   └─> Record winner
