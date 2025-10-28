import type { Card, GameState, Player } from "../types/game";

// Create a standard Whot deck
export const createDeck = (): Card[] => {
  const suits: Card["suit"][] = [
    "circle",
    "triangle",
    "square",
    "star",
    "cross",
  ];
  const deck: Card[] = [];

  suits.forEach((suit) => {
    // Regular cards (1, 2, 3, 4, 5, 7, 8, 10, 11, 12, 13, 14)
    const numbers = [1, 2, 3, 4, 5, 7, 8, 10, 11, 12, 13, 14];
    numbers.forEach((number) => {
      deck.push({
        id: `${suit}-${number}`,
        suit,
        number,
        isSpecial:
          number === 1 ||
          number === 2 ||
          number === 5 ||
          number === 8 ||
          number === 14,
      });
    });
  });

  // Add 5 Whot cards (wild cards)
  for (let i = 1; i <= 5; i++) {
    deck.push({
      id: `whot-${i}`,
      suit: "whot",
      number: 20,
      isSpecial: true,
    });
  }

  return shuffleDeck(deck);
};

// Shuffle deck using Fisher-Yates algorithm
export const shuffleDeck = (deck: Card[]): Card[] => {
  const shuffled = [...deck];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

// Deal cards to players
export const dealCards = (
  deck: Card[],
  players: Player[],
  cardsPerPlayer: number = 5
): Card[] => {
  const remainingDeck = [...deck];

  players.forEach((player) => {
    player.hand = [];
    for (let i = 0; i < cardsPerPlayer; i++) {
      if (remainingDeck.length > 0) {
        player.hand.push(remainingDeck.pop()!);
      }
    }
  });

  return remainingDeck;
};

export const canPlayCard = (
  card: Card,
  lastPlayedCard: Card | undefined,
  gameState?: Partial<GameState>
): boolean => {
  // First card of the game - anything can be played
  if (!lastPlayedCard) return true;

  // Provide defaults for gameState properties
  const pendingPenalty = gameState?.pendingPenalty ?? 0;
  const whotShapeDemand = gameState?.whotShapeDemand;
  const awaitingHoldOnCard = gameState?.awaitingHoldOnCard ?? false;

  // HOLD ON LOGIC: If awaiting second card after Hold On, ANY card can be played
  if (awaitingHoldOnCard) {
    return true;
  }

  // PICK 2 PENALTY: Cannot defend Pick 2 with anything (not even Whot)
  if (pendingPenalty === 2) {
    return false; // Must draw, cannot play any card
  }

  // PICK 3 PENALTY: Can only defend with another Pick 3 (NOT Whot)
  if (pendingPenalty === 3) {
    return card.number === 5; // Only Pick 3 can defend
  }

  // Whot cards can be played ONLY if there's no penalty
  if (card.suit === "whot") return true;

  // If there's a Whot shape demand, ONLY that shape (or another Whot) can be played
  if (whotShapeDemand && whotShapeDemand !== "whot") {
    return card.suit === whotShapeDemand;
  }

  // Normal matching rules: must match shape OR number
  return (
    card.suit === lastPlayedCard.suit || card.number === lastPlayedCard.number
  );
};

// Get playable cards from a hand
export const getPlayableCards = (
  hand: Card[],
  lastPlayedCard: Card | undefined,
  gameState: Partial<GameState>
): Card[] => {
  return hand.filter((card) => canPlayCard(card, lastPlayedCard, gameState));
};

// Draw multiple cards from deck
export const drawCards = (
  deck: Card[],
  count: number
): { drawnCards: Card[]; remainingDeck: Card[] } => {
  const remainingDeck = [...deck];
  const drawnCards: Card[] = [];

  for (let i = 0; i < count; i++) {
    if (remainingDeck.length > 0) {
      const card = remainingDeck.pop();
      if (card) drawnCards.push(card);
    } else {
      // If deck runs out, we could reshuffle discard pile here
      break;
    }
  }

  return { drawnCards, remainingDeck };
};

// Handle special card effects - UPDATED
export const applySpecialCardEffect = (
  card: Card,
): Partial<GameState> => {
  const updates: Partial<GameState> = {};

  switch (card.number) {
    case 1: // Hold On - player MUST play another card
      updates.pendingPenalty = 0;
      updates.awaitingHoldOnCard = true; // Flag to allow ANY card next
      // Don't advance turn yet
      break;

    case 2: // Pick Two - NOT defendable, NOT stackable
      updates.pendingPenalty = 2;
      updates.awaitingHoldOnCard = false;
      break;

    case 5: // Pick Three - IS defendable, NOT stackable
      updates.pendingPenalty = 3;
      updates.awaitingHoldOnCard = false;
      break;

    case 8: // Suspension - player plays again with normal rules
      updates.pendingPenalty = 0;
      updates.awaitingSuspensionCard = true; // Flag for suspension chain
      updates.awaitingHoldOnCard = false;
      // Don't advance turn yet
      break;

    case 14: // General Market - everyone except current player draws 1
      updates.pendingPenalty = -1; // Special marker for General Market
      updates.awaitingHoldOnCard = false;
      break;

    case 20: // Whot - wild card
      updates.pendingPenalty = 0;
      updates.awaitingHoldOnCard = false;
      // whotShapeDemand will be set when player chooses shape
      break;

    default:
      updates.pendingPenalty = 0;
      updates.whotShapeDemand = undefined;
      updates.awaitingHoldOnCard = false;
      updates.awaitingSuspensionCard = false;
      break;
  }

  return updates;
};

// Apply General Market effect - FIXED to exclude current player
export const applyGeneralMarket = (
  gameState: GameState,
  currentPlayerId: string
): GameState => {
  const newState = { ...gameState };

  // Each player EXCEPT the one who played the card draws 1 card
  newState.players = newState.players.map((player) => {
    if (player.id === currentPlayerId) {
      return player; // Current player doesn't draw
    }

    const { drawnCards, remainingDeck } = drawCards(newState.deck, 1);
    newState.deck = remainingDeck;

    return {
      ...player,
      hand: [...player.hand, ...drawnCards],
    };
  });

  newState.pendingPenalty = 0;
  return newState;
};

// Apply Pick penalty
export const applyPickPenalty = (
  player: Player,
  deck: Card[],
  penaltyAmount: number
): { updatedPlayer: Player; remainingDeck: Card[] } => {
  const { drawnCards, remainingDeck } = drawCards(deck, penaltyAmount);

  const updatedPlayer = {
    ...player,
    hand: [...player.hand, ...drawnCards],
  };

  return { updatedPlayer, remainingDeck };
};

// Check if game is over
export const isGameOver = (players: Player[]): Player | null => {
  return players.find((player) => player.hand.length === 0) || null;
};

// Get next player index
export const getNextPlayerIndex = (
  currentIndex: number,
  totalPlayers: number,
  direction: "clockwise" | "counterclockwise" = "clockwise"
): number => {
  if (direction === "clockwise") {
    return (currentIndex + 1) % totalPlayers;
  } else {
    return currentIndex === 0 ? totalPlayers - 1 : currentIndex - 1;
  }
};

// Skip next player (for Hold On / Suspension)
export const skipNextPlayer = (
  currentIndex: number,
  totalPlayers: number,
  direction: "clockwise" | "counterclockwise" = "clockwise"
): number => {
  const nextIndex = getNextPlayerIndex(currentIndex, totalPlayers, direction);
  return getNextPlayerIndex(nextIndex, totalPlayers, direction);
};

// Computer AI - UPDATED
export const getComputerMove = (
  hand: Card[],
  gameState: GameState
): {
  action: "play" | "draw";
  cardId?: string;
  chosenShape?: Card["suit"];
} => {
  const { lastPlayedCard, pendingPenalty = 0, whotShapeDemand, awaitingHoldOnCard } = gameState;

  // Get all playable cards
  const playableCards = getPlayableCards(hand, lastPlayedCard, {
    pendingPenalty,
    whotShapeDemand,
    awaitingHoldOnCard,
  });

  // If no playable cards, must draw
  if (playableCards.length === 0) {
    return { action: "draw" };
  }

  // HOLD ON LOGIC: If awaiting second card, play any card (prioritize getting rid of specials)
  if (awaitingHoldOnCard) {
    const specialCards = playableCards.filter((c) => c.isSpecial && c.suit !== "whot");
    if (specialCards.length > 0) {
      return { action: "play", cardId: specialCards[0].id };
    }
    return { action: "play", cardId: playableCards[0].id };
  }

  // PICK 2 PENALTY: Cannot defend, must draw
  if (pendingPenalty === 2) {
    return { action: "draw" };
  }

  // PICK 3 PENALTY: Try to defend with Pick 3
  if (pendingPenalty === 3) {
    const defensePick3 = playableCards.find((c) => c.number === 5);
    if (defensePick3) {
      return { action: "play", cardId: defensePick3.id };
    }
    // If can't defend, must draw
    return { action: "draw" };
  }

  // Strategy: Prioritize playing special cards
  const specialCards = playableCards.filter((c) => c.isSpecial && c.suit !== "whot");
  const highValueCards = playableCards.filter((c) => c.number >= 10);

  let cardToPlay: Card | undefined;

  // Play special cards first (except save Whot for emergencies)
  if (specialCards.length > 0) {
    cardToPlay = specialCards[0];
  }
  // Then play high value cards
  else if (highValueCards.length > 0) {
    cardToPlay = highValueCards[0];
  }
  // Play any random card (including Whot if necessary)
  else {
    cardToPlay =
      playableCards[Math.floor(Math.random() * playableCards.length)];
  }

  // If playing a Whot card, choose the most common shape in hand
  let chosenShape: Card["suit"] | undefined;
  if (cardToPlay.suit === "whot") {
    chosenShape = getMostCommonShape(hand);
  }

  return {
    action: "play",
    cardId: cardToPlay.id,
    chosenShape,
  };
};

// Helper: Get most common shape in hand (for Whot card strategy)
const getMostCommonShape = (hand: Card[]): Card["suit"] => {
  const shapeCounts: Record<string, number> = {
    circle: 0,
    triangle: 0,
    square: 0,
    star: 0,
    cross: 0,
  };

  hand.forEach((card) => {
    if (card.suit !== "whot") {
      shapeCounts[card.suit] = (shapeCounts[card.suit] || 0) + 1;
    }
  });

  // Find shape with highest count
  let maxCount = 0;
  let mostCommonShape: Card["suit"] = "circle";

  Object.entries(shapeCounts).forEach(([shape, count]) => {
    if (count > maxCount) {
      maxCount = count;
      mostCommonShape = shape as Card["suit"];
    }
  });

  return mostCommonShape;
};

// Validate card play attempt - UPDATED
export const validateCardPlay = (
  card: Card,
  gameState: Partial<GameState>
): { valid: boolean; reason?: string } => {
  const { lastPlayedCard, pendingPenalty = 0, whotShapeDemand, awaitingHoldOnCard } = gameState;

  // HOLD ON LOGIC: If awaiting second card, ANY card is valid
  if (awaitingHoldOnCard) {
    return { valid: true };
  }

  // PICK 2 PENALTY: Cannot defend with ANY card (not even Whot)
  if (pendingPenalty === 2) {
    return {
      valid: false,
      reason: `Pick 2 is active! You cannot defend. You must draw 2 cards.`,
    };
  }

  // PICK 3 PENALTY: Can only defend with another Pick 3 (NOT Whot)
  if (pendingPenalty === 3) {
    if (card.number !== 5) {
      return {
        valid: false,
        reason: `Pick 3 is active! Play another Pick 3 to defend, or draw 3 cards.`,
      };
    }
    return { valid: true };
  }

  // Whot cards can be played (but only when no penalty is active)
  if (card.suit === "whot") return { valid: true };

  // If Whot shape is demanded, must match that shape (or play another Whot)
  if (whotShapeDemand && whotShapeDemand !== "whot") {
    if (card.suit !== whotShapeDemand) {
      return {
        valid: false,
        reason: `You must play a ${whotShapeDemand.toUpperCase()} card or a Whot card!`,
      };
    }
    return { valid: true };
  }

  // Normal matching rules
  if (!lastPlayedCard) return { valid: true };

  const matches =
    card.suit === lastPlayedCard.suit || card.number === lastPlayedCard.number;

  if (!matches) {
    return {
      valid: false,
      reason: `Card must match either the SHAPE (${lastPlayedCard.suit.toUpperCase()}) or NUMBER (${
        lastPlayedCard.number
      })!`,
    };
  }

  return { valid: true };
};

// Check if player needs to draw penalty cards
export const needsToDrawPenalty = (
  hand: Card[],
  pendingPenalty: number
): boolean => {
  if (pendingPenalty === 0) return false;

  // Pick 2 cannot be defended
  if (pendingPenalty === 2) return true;

  // Pick 3 can be defended with another Pick 3
  if (pendingPenalty === 3) {
    const hasPick3 = hand.some((card) => card.number === 5);
    return !hasPick3;
  }

  return false;
};

// Reshuffle discard pile into deck when deck is empty
export const reshuffleDiscardPile = (
  deck: Card[],
  discardPile: Card[]
): { newDeck: Card[]; newDiscardPile: Card[] } => {
  if (deck.length > 0) {
    return { newDeck: deck, newDiscardPile: discardPile };
  }

  // Keep the last played card, shuffle the rest
  const lastCard = discardPile[discardPile.length - 1];
  const cardsToShuffle = discardPile.slice(0, -1);

  return {
    newDeck: shuffleDeck(cardsToShuffle),
    newDiscardPile: lastCard ? [lastCard] : [],
  };
};
