//! GraphQL service (sketch)
//!
//! The service provides read-only GraphQL queries over the on-chain state.
//! For V1 we want to expose:
//!  - `match_state` (full state for trusted UIs / debugging)
//!  - `config` (match settings)
//!  - `player_view(player_owner)` returning a player's hand + public opponent info
//!  - `deck_size` and `betting_pool` helpers for spectator UIs
//!
//! Implementation notes:
//!  - The service loads the `LinotState` root view and builds an
//!    `async-graphql::Schema` with a `QueryRoot` and the mutation root
//!    generated from `Operation`.
//!  - The service must avoid leaking private hands to spectators; use
//!    `player_view` for per-player private views and `match_state` for
//!    debugging-only full views.
//!
//! For now this file contains design comments and a small binary stub to
//! reduce compile-time complexity. We'll reintroduce the full GraphQL
//! implementation in the next iteration.

fn main() {
    // Binary stub. Real service runs inside Linera node and exposes a GraphQL
    // endpoint via `linera service`.
}
