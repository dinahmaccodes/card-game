#![cfg_attr(target_arch = "wasm32", no_main)]

mod state;

use async_graphql::{Context, EmptySubscription, Object, Request, Response, Schema};
use linera_sdk::{
    abi::WithServiceAbi, linera_base_types::AccountOwner, views::View, Service, ServiceRuntime,
};
use std::sync::Arc;

use crate::state::{LinotState, MatchConfig, MatchData, MatchStatus};
use linot::{Card, CardSuit, LinotAbi};

/// GraphQL service for querying Linot match state
pub struct LinotService {
    state: Arc<LinotState>,
}

linera_sdk::service!(LinotService);

impl WithServiceAbi for LinotService {
    type Abi = LinotAbi;
}

impl Service for LinotService {
    type Parameters = ();

    async fn new(runtime: ServiceRuntime<Self>) -> Self {
        let state = LinotState::load(runtime.root_view_storage_context())
            .await
            .expect("Failed to load state");
        LinotService {
            state: Arc::new(state),
        }
    }

    async fn handle_query(&self, request: Request) -> Response {
        let schema = Schema::build(
            QueryRoot,
            async_graphql::EmptyMutation,
            EmptySubscription,
        )
        .data(self.state.clone())
        .finish();

        schema.execute(request).await
    }
}

/// GraphQL query root
struct QueryRoot;

#[Object]
impl QueryRoot {
    /// Get the full match configuration
    async fn config(&self, ctx: &Context<'_>) -> MatchConfig {
        let state = ctx.data_unchecked::<Arc<LinotState>>();
        state.config.get().clone()
    }

    /// Get the full match state (for debugging/trusted UIs)
    /// WARNING: This exposes all player hands! Use player_view for production
    async fn match_state(&self, ctx: &Context<'_>) -> MatchData {
        let state = ctx.data_unchecked::<Arc<LinotState>>();
        state.match_data.get().clone()
    }

    /// Get match status
    async fn status(&self, ctx: &Context<'_>) -> MatchStatus {
        let state = ctx.data_unchecked::<Arc<LinotState>>();
        state.match_data.get().status
    }

    /// Get the current player's index
    async fn current_player_index(&self, ctx: &Context<'_>) -> usize {
        let state = ctx.data_unchecked::<Arc<LinotState>>();
        state.match_data.get().current_player_index
    }

    /// Get the current player's owner
    async fn current_player(&self, ctx: &Context<'_>) -> Option<AccountOwner> {
        let state = ctx.data_unchecked::<Arc<LinotState>>();
        let match_data = state.match_data.get();
        match_data
            .players
            .get(match_data.current_player_index)
            .map(|p| p.owner)
    }

    /// Get the top card in the discard pile
    async fn top_card(&self, ctx: &Context<'_>) -> Option<Card> {
        let state = ctx.data_unchecked::<Arc<LinotState>>();
        state.match_data.get().discard_pile.last().cloned()
    }

    /// Get the number of cards remaining in the deck
    async fn deck_size(&self, ctx: &Context<'_>) -> usize {
        let state = ctx.data_unchecked::<Arc<LinotState>>();
        state.match_data.get().deck.len()
    }

    /// Get active shape demand (from Whot card)
    async fn active_shape_demand(&self, ctx: &Context<'_>) -> Option<CardSuit> {
        let state = ctx.data_unchecked::<Arc<LinotState>>();
        state.match_data.get().active_shape_demand
    }

    /// Get pending penalty count (from Pick Two/Three)
    async fn pending_penalty(&self, ctx: &Context<'_>) -> u8 {
        let state = ctx.data_unchecked::<Arc<LinotState>>();
        state.match_data.get().pending_penalty
    }

    /// Get all players (with cards hidden for other players)
    async fn players(&self, ctx: &Context<'_>) -> Vec<PublicPlayer> {
        let state = ctx.data_unchecked::<Arc<LinotState>>();
        let match_data = state.match_data.get();

        match_data
            .players
            .iter()
            .map(|p| PublicPlayer {
                owner: p.owner,
                nickname: p.nickname.clone(),
                card_count: p.card_count,
                is_active: p.is_active,
                called_last_card: p.called_last_card,
            })
            .collect()
    }

    /// Get a specific player's view (includes their cards but hides opponent cards)
    async fn player_view(&self, ctx: &Context<'_>, player: AccountOwner) -> Option<PlayerView> {
        let state = ctx.data_unchecked::<Arc<LinotState>>();
        let match_data = state.match_data.get();

        // Find the requesting player
        let player_data = match_data.players.iter().find(|p| p.owner == player)?;

        // Build opponent info (without cards)
        let opponents: Vec<PublicPlayer> = match_data
            .players
            .iter()
            .filter(|p| p.owner != player)
            .map(|p| PublicPlayer {
                owner: p.owner,
                nickname: p.nickname.clone(),
                card_count: p.card_count,
                is_active: p.is_active,
                called_last_card: p.called_last_card,
            })
            .collect();

        Some(PlayerView {
            my_cards: player_data.cards.clone(),
            my_card_count: player_data.card_count,
            called_last_card: player_data.called_last_card,
            opponents,
            top_card: match_data.discard_pile.last().cloned(),
            deck_size: match_data.deck.len(),
            current_player_index: match_data.current_player_index,
            status: match_data.status,
            active_shape_demand: match_data.active_shape_demand,
            pending_penalty: match_data.pending_penalty,
            winner_index: match_data.winner_index,
        })
    }

    /// Get the winner (if match is finished)
    async fn winner(&self, ctx: &Context<'_>) -> Option<AccountOwner> {
        let state = ctx.data_unchecked::<Arc<LinotState>>();
        let match_data = state.match_data.get();

        match_data
            .winner_index
            .and_then(|idx| match_data.players.get(idx))
            .map(|p| p.owner)
    }

    /// Get betting pool total (Wave 4-5 feature)
    async fn betting_pool_total(&self, ctx: &Context<'_>) -> u64 {
        let state = ctx.data_unchecked::<Arc<LinotState>>();
        state
            .betting_pool
            .get()
            .as_ref()
            .map(|pool| pool.total_pool)
            .unwrap_or(0)
    }
}

// ============ GraphQL Response Types ============

/// Public player info (without cards)
#[derive(async_graphql::SimpleObject)]
struct PublicPlayer {
    owner: AccountOwner,
    nickname: String,
    card_count: usize,
    is_active: bool,
    called_last_card: bool,
}

/// Player-specific view (includes player's cards, hides opponent cards)
#[derive(async_graphql::SimpleObject)]
struct PlayerView {
    /// Your cards
    my_cards: Vec<Card>,
    /// Your card count
    my_card_count: usize,
    /// Whether you called last card
    called_last_card: bool,
    /// Opponent info (without their cards)
    opponents: Vec<PublicPlayer>,
    /// Top card in discard pile
    top_card: Option<Card>,
    /// Cards remaining in deck
    deck_size: usize,
    /// Index of current player
    current_player_index: usize,
    /// Match status
    status: MatchStatus,
    /// Active shape demand (from Whot card)
    active_shape_demand: Option<CardSuit>,
    /// Pending penalty cards
    pending_penalty: u8,
    /// Winner index (if finished)
    winner_index: Option<usize>,
}

