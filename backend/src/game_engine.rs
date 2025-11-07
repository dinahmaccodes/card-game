use crate::state::MatchData;
use linot::{Card, CardSuit, CardValue};

/// Game engine for Whot/Linot card game logic
pub struct GameEngine;

impl GameEngine {
    /// Create a full 61-card Whot deck (56 regular + 5 Whot cards)
    pub fn create_deck() -> Vec<Card> {
        let mut deck = Vec::with_capacity(61);

        // Regular cards: 5 suits × 14 values = 70 cards, but only specific values exist
        // According to Whot rules: each suit has cards 1-14 (excluding some based on variant)
        // Standard Nigerian Whot: 1-14 for each of 5 suits
        let suits = [
            CardSuit::Circle,
            CardSuit::Cross,
            CardSuit::Triangle,
            CardSuit::Square,
            CardSuit::Star,
        ];

        let values = [
            CardValue::One,
            CardValue::Two,
            CardValue::Three,
            CardValue::Four,
            CardValue::Five,
            CardValue::Six,
            CardValue::Seven,
            CardValue::Eight,
            CardValue::Nine,
            CardValue::Ten,
            CardValue::Eleven,
            CardValue::Twelve,
            CardValue::Thirteen,
            CardValue::Fourteen,
        ];

        // Create regular cards (multiple copies based on standard Whot distribution)
        for &suit in &suits {
            for &value in &values {
                deck.push(Card { suit, value });
            }
        }

        // Add 5 Whot (wild) cards
        for _ in 0..5 {
            deck.push(Card {
                suit: CardSuit::Star, // Whot cards typically use Star suit visually
                value: CardValue::Whot,
            });
        }

        deck
    }

    /// Shuffle deck using deterministic seed derived from chain_id
    pub fn shuffle_with_seed(deck: &mut Vec<Card>, seed: &[u8]) {
        use std::collections::hash_map::DefaultHasher;
        use std::hash::{Hash, Hasher};

        // Create deterministic RNG from seed
        let mut hasher = DefaultHasher::new();
        seed.hash(&mut hasher);
        let mut rng_state = hasher.finish();

        // Fisher-Yates shuffle with deterministic RNG
        for i in (1..deck.len()).rev() {
            // Generate random index using LCG
            rng_state = rng_state.wrapping_mul(6364136223846793005).wrapping_add(1);
            let j = (rng_state as usize) % (i + 1);
            deck.swap(i, j);
        }
    }

    /// Deal initial hands to players (6 cards each for V1)
    pub fn deal_initial_hands(deck: &mut Vec<Card>, num_players: usize) -> Vec<Vec<Card>> {
        const CARDS_PER_PLAYER: usize = 6;
        let mut hands = vec![Vec::with_capacity(CARDS_PER_PLAYER); num_players];

        for _ in 0..CARDS_PER_PLAYER {
            for player_hand in hands.iter_mut() {
                if let Some(card) = deck.pop() {
                    player_hand.push(card);
                }
            }
        }

        hands
    }

    /// Check if a card can be played on top of another card
    pub fn is_valid_play(
        card: &Card,
        top_card: &Card,
        active_demand: Option<CardSuit>,
        pending_penalty: u8,
    ) -> bool {
        // Whot card can always be played
        if card.value == CardValue::Whot {
            return true;
        }

        // If there's a pending penalty, only specific cards can be played
        if pending_penalty > 0 {
            return match top_card.value {
                CardValue::PickTwo => card.value == CardValue::PickTwo,
                CardValue::PickThree => card.value == CardValue::PickThree,
                _ => false,
            };
        }

        // If there's an active shape demand (from Whot card), must match that suit
        if let Some(demanded_suit) = active_demand {
            return card.suit == demanded_suit;
        }

        // Normal play: match suit or value
        card.suit == top_card.suit || card.value == top_card.value
    }

    /// Get the special effect of a card
    pub fn get_card_effect(card: &Card) -> SpecialEffect {
        match card.value {
            CardValue::Whot => SpecialEffect::ChooseShape,
            CardValue::HoldOn => SpecialEffect::PlayAgain,
            CardValue::PickTwo => SpecialEffect::DrawTwo,
            CardValue::PickThree => SpecialEffect::DrawThree,
            CardValue::Suspension => SpecialEffect::SkipNext,
            CardValue::GeneralMarket => SpecialEffect::AllDrawOne,
            _ => SpecialEffect::None,
        }
    }

    /// Apply special card effect to match state
    pub fn apply_effect(
        state: &mut MatchData,
        effect: SpecialEffect,
        chosen_suit: Option<CardSuit>,
    ) {
        match effect {
            SpecialEffect::ChooseShape => {
                if let Some(suit) = chosen_suit {
                    state.active_shape_demand = Some(suit);
                }
            }
            SpecialEffect::PlayAgain => {
                // Current player plays again (don't advance turn)
                // This is handled in contract by not calling advance_turn()
            }
            SpecialEffect::DrawTwo => {
                state.pending_penalty = 2;
            }
            SpecialEffect::DrawThree => {
                state.pending_penalty = 3;
            }
            SpecialEffect::SkipNext => {
                // Skip next player (handled by advancing turn twice)
                Self::advance_turn(state);
            }
            SpecialEffect::AllDrawOne => {
                // All other players draw 1 card (handled in contract)
            }
            SpecialEffect::None => {
                // Clear active demand if no special effect
                state.active_shape_demand = None;
            }
        }
    }

    /// Advance to next player's turn
    pub fn advance_turn(state: &mut MatchData) {
        let num_players = state.players.len();
        if num_players > 0 {
            state.current_player_index = (state.current_player_index + 1) % num_players;
        }
    }

    /// Check if the game has ended
    pub fn check_game_end(state: &MatchData) -> Option<GameResult> {
        // Check if any player has won (0 cards)
        for (i, player) in state.players.iter().enumerate() {
            if player.is_active && player.card_count == 0 {
                return Some(GameResult::Winner(i));
            }
        }

        // Check if deck is empty and no valid moves (stalemate)
        if state.deck.is_empty() && state.status == crate::state::MatchStatus::InProgress {
            // Find player with fewest cards
            let min_cards = state
                .players
                .iter()
                .filter(|p| p.is_active)
                .map(|p| p.card_count)
                .min()
                .unwrap_or(0);

            if let Some((idx, _)) = state
                .players
                .iter()
                .enumerate()
                .find(|(_, p)| p.is_active && p.card_count == min_cards)
            {
                return Some(GameResult::Winner(idx));
            }
        }

        None
    }
}

/// Special card effects
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum SpecialEffect {
    /// No special effect
    None,
    /// Choose next suit (Whot card)
    ChooseShape,
    /// Play another card immediately (1 - Hold On)
    PlayAgain,
    /// Next player draws 2 cards (2 - Pick Two)
    DrawTwo,
    /// Next player draws 3 cards (5 - Pick Three)
    DrawThree,
    /// Skip next player's turn (8 - Suspension)
    SkipNext,
    /// All other players draw 1 card (14 - General Market)
    AllDrawOne,
}

/// Game result enum
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum GameResult {
    /// Player at index won
    Winner(usize),
    /// Game ended in draw
    Draw,
}
