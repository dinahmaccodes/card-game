//! Linot contract (sketch)
//!
//! For now this file is a commented design sketch so the repo builds cleanly.
//! The real contract (V1) will:
//!
//!  - Define a `LinotContract` that persists `LinotState` into on-chain views
//!  - Handle `Operation` enums (JoinMatch, StartMatch, PlayCard, DrawCard,
//!    CallLastCard, ChallengeLastCard, LeaveMatch, PlaceBet)
//!  - Use deterministic deck creation and `chain_id`-derived seed for shuffle
//!  - Validate moves using `GameEngine` helpers and apply special card effects
//!  - Save state at the end of `store()`
//!  - Send/receive cross-chain `Message` types for invites / spectator updates
//!
//! Implementation notes / planned flow:
//! 1. `instantiate(config)` stores match configuration and creates a shuffled
//!    deck seeded from the `chain_id`.
//! 2. `execute_operation(op)` authenticates caller and dispatches to helpers
//!    that mutate an in-memory `MatchData` snapshot, then write it to storage.
//! 3. Special cards (PickTwo, Whot, etc.) are implemented in `GameEngine` and
//!    applied after a successful `PlayCard`.
//! 4. Betting (Wave 4/5) is an optional `RegisterView<Option<BettingPool>>`.
//!
//! For the immediate goal (reduce compile noise) this file intentionally
//! contains no operational code. We'll restore the contract implementation
//! from the working design draft in future iterations.

fn main() {
    // Binary stub: real contract uses Linera macros and compiles to WASM.
}