use async_graphql::{Request, Response};
use linera_sdk::{
    abi::{ContractAbi, ServiceAbi},
    graphql::GraphQLMutationRoot,
    linera_base_types::AccountOwner,
};
use serde::{Deserialize, Serialize};

// ============ ABI Definition ============

pub struct LinotAbi;

impl ContractAbi for LinotAbi {
    type Operation = Operation;
    type Response = ();
}

impl ServiceAbi for LinotAbi {
    type Query = Request;
    type QueryResponse = Response;
}

// ============ Data Types ============

#[derive(Debug, Clone, Serialize, Deserialize, async_graphql::SimpleObject)]
pub struct Card {
    pub suit: CardSuit,
    pub value: CardValue,
}

#[derive(Debug, Clone, Copy, Serialize, Deserialize, async_graphql::Enum, PartialEq, Eq, Hash)]
pub enum CardSuit {
    Circle,
    Cross,
    Triangle,
    Square,
    Star,
}

#[derive(Debug, Clone, Copy, Serialize, Deserialize, async_graphql::Enum, PartialEq, Eq)]
pub enum CardValue {
    One,
    Two,
    Three,
    Four,
    Five,
    Six,
    Seven,
    Eight,
    Nine,
    Ten,
    Eleven,
    Twelve,
    Thirteen,
    Fourteen,
    Whot,
    PickTwo,
    PickThree,
    GeneralMarket,
    HoldOn,
    Suspension,
}

// ============ Match Configuration ============

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MatchConfig {
    pub max_players: u8,
    pub host: AccountOwner,
    pub is_ranked: bool,
    pub strict_mode: bool, // Enforce "must draw if no valid move"
}

// ============ Operations (GraphQL Mutations) ============

#[derive(Debug, Deserialize, Serialize, GraphQLMutationRoot)]
pub enum Operation {
    /// Join this match instance
    JoinMatch {
        nickname: String,
    },

    /// Start the match (host only)
    StartMatch,

    /// Play a card from your hand
    PlayCard {
        card_index: usize,
        chosen_suit: Option<CardSuit>, // Required for Whot card
    },

    /// Draw a card from the deck (when stuck or choosing to draw)
    DrawCard,

    /// Call "Last Card!" when you have exactly 1 card
    CallLastCard,

    /// Challenge someone who forgot to call Last Card
    ChallengeLastCard {
        player_index: usize,
    },

    /// Leave the match (forfeit)
    LeaveMatch,

    // Wave 4-5: Betting (placeholder)
    PlaceBet {
        player_index: usize,
        amount: u64,
    },
}

// ============ Messages (Cross-Chain Communication) ============

#[derive(Debug, Deserialize, Serialize)]
pub enum Message {
    /// Invite a player from another chain
    InvitePlayer {
        inviter: AccountOwner,
        match_id: String,
    },

    /// Player accepted invitation from another chain
    PlayerJoined {
        player: AccountOwner,
        nickname: String,
    },

    /// Broadcast match state update to spectators
    StateUpdate {
        current_player: AccountOwner,
        top_card: Card,
    },
}
