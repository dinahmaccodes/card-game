// This module previously used Linera view macros to persist state. To reduce
// compile-time complexity while we iterate, the current file is a design
// sketch describing the intended on-chain root state and data shapes for
// the Whot (Linot) match application. We'll re-enable concrete view types
// and derives in a follow-up change.

// Intended root state (sketch):
//
// pub struct LinotState {
//     // configuration applied at instantiation
//     pub config: RegisterView<MatchConfig>,
//     // current match snapshot
//     pub match_state: RegisterView<MatchData>,
//     // optional betting pool (wave 4-5)
//     pub betting_pool: RegisterView<Option<BettingPool>>,
// }

// MatchData sketch:
// pub struct MatchData {
//     pub players: Vec<Player>,
//     pub current_player_index: usize,
//     pub deck: Vec<Card>,
//     pub discard_pile: Vec<Card>,
//     pub status: MatchStatus,
//     pub winner_index: Option<usize>,
//     pub round_number: u32,
//     pub created_at: u64,
// }

// Player sketch:
// pub struct Player {
//     pub owner: String, // stringified AccountOwner for GraphQL
//     pub nickname: String,
//     pub cards: Vec<Card>,
//     pub is_active: bool,
//     pub card_count: usize,
//     pub called_last_card: bool,
// }

// MatchStatus sketch:
// enum MatchStatus { Waiting, InProgress, Finished }

// BettingPool / Bet sketches shown in docs; these will be simple structs
// holding staking totals and entries.

// NOTE: The previous implementation used Linera's `RootView` and `RegisterView`
// derives which require careful `Default`/`OutputType` implementation on all
// nested types and interaction with `linera_sdk`. We'll re-introduce the
// concrete code once the remaining infra pieces are finalized.

// Placeholder to keep the file present in the repo.
/// Placeholder exported type to document that state lives here.
pub struct _StatePlaceholder;