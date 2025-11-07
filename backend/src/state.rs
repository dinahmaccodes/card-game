use linera_sdk::{
    linera_base_types::AccountOwner,
    views::{RegisterView, RootView, ViewStorageContext},
};
use serde::{Deserialize, Serialize};

use linot::{Card, CardSuit};

/// Root application state stored on-chain using Linera Views
#[derive(RootView)]
#[view(context = ViewStorageContext)]
pub struct LinotState {
    /// Match configuration
    pub config: RegisterView<MatchConfig>,
    /// Current match data (players, deck, game state)
    pub match_data: RegisterView<MatchData>,
    /// Optional betting pool for staking (Wave 4-5)
    pub betting_pool: RegisterView<Option<BettingPool>>,
}

// ============ Match Configuration ============

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MatchConfig {
    /// Maximum players allowed (2 for V1)
    pub max_players: u8,
    /// Host account who created the match
    pub host: AccountOwner,
    /// Whether this is a ranked/competitive match
    pub is_ranked: bool,
    /// Strict mode: must draw if no valid move
    pub strict_mode: bool,
}

impl Default for MatchConfig {
    fn default() -> Self {
        Self {
            max_players: 2,
            // Use the reserved CHAIN constant as default placeholder
            host: AccountOwner::CHAIN,
            is_ranked: false,
            strict_mode: false,
        }
    }
}

// ============ Match Data ============

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MatchData {
    /// All players in this match (max 2 for V1)
    pub players: Vec<Player>,
    /// Index of current player whose turn it is
    pub current_player_index: usize,
    /// Draw pile (cards to be drawn)
    pub deck: Vec<Card>,
    /// Discard pile (played cards, top card is last)
    pub discard_pile: Vec<Card>,
    /// Current game status
    pub status: MatchStatus,
    /// Index of winning player (if finished)
    pub winner_index: Option<usize>,
    /// Round number (for reshuffle entropy)
    pub round_number: u32,
    /// Timestamp when match was created
    pub created_at: u64,
    /// Active shape demand (set by Whot card)
    pub active_shape_demand: Option<CardSuit>,
    /// Pending penalty cards to draw (Pick Two/Three)
    pub pending_penalty: u8,
}

impl Default for MatchData {
    fn default() -> Self {
        Self {
            players: Vec::new(),
            current_player_index: 0,
            deck: Vec::new(),
            discard_pile: Vec::new(),
            status: MatchStatus::Waiting,
            winner_index: None,
            round_number: 0,
            created_at: 0,
            active_shape_demand: None,
            pending_penalty: 0,
        }
    }
}

// ============ Player ============

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Player {
    /// Owner account
    pub owner: AccountOwner,
    /// Display nickname
    pub nickname: String,
    /// Cards in hand (hidden from other players)
    pub cards: Vec<Card>,
    /// Whether player is still active (not forfeited)
    pub is_active: bool,
    /// Number of cards (visible to all)
    pub card_count: usize,
    /// Whether player called "Last Card!"
    pub called_last_card: bool,
}

impl Player {
    pub fn new(owner: AccountOwner, nickname: String) -> Self {
        Self {
            owner,
            nickname,
            cards: Vec::new(),
            is_active: true,
            card_count: 0,
            called_last_card: false,
        }
    }

    /// Update card count to match actual cards
    pub fn update_card_count(&mut self) {
        self.card_count = self.cards.len();
    }
}

// ============ Match Status ============

#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq, Eq)]
pub enum MatchStatus {
    /// Waiting for players to join
    Waiting,
    /// Match is in progress
    InProgress,
    /// Match has finished
    Finished,
}

// ============ Betting Pool (Wave 4-5) ============

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct BettingPool {
    /// Total amount staked
    pub total_pool: u64,
    /// Individual bets per player
    pub bets: Vec<Bet>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Bet {
    /// Player who placed the bet
    pub player: AccountOwner,
    /// Amount staked
    pub amount: u64,
    /// Timestamp of bet
    pub placed_at: u64,
}

// Placeholder to keep the file present in the repo.
/// Placeholder exported type to document that state lives here.
pub struct _StatePlaceholder;
